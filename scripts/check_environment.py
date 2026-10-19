#!/usr/bin/env python3
"""
Environment and Diagnostic Verification Script
Verifies runtime environment, cryptographic library capabilities, timing precision,
resource instrumentation, and parameter set support for ML-KEM (FIPS 203).
"""

import sys
import platform
import time
import os
import io
from pathlib import Path


def print_section(title: str):
    print("\n" + "=" * 70)
    print(f" {title.upper()}")
    print("=" * 70)


def check_python_version() -> bool:
    print_section("1. Python Runtime Environment")
    ver = sys.version_info
    print(f"Python Version    : {platform.python_version()}")
    print(f"Python Compiler   : {platform.python_compiler()}")
    print(f"Platform / OS     : {platform.platform()}")
    print(f"Architecture      : {platform.machine()} ({platform.architecture()[0]})")
    print(f"Executable Path   : {sys.executable}")

    if ver.major < 3 or (ver.major == 3 and ver.minor < 11):
        print("[-] ERROR: Python 3.11+ is recommended. Found: " + platform.python_version())
        return False
    print("[+] Python runtime check PASSED.")
    return True


def check_dependencies() -> bool:
    print_section("2. Core Dependency Verification")
    required = [
        ("flask", "Flask Web Framework"),
        ("pydantic", "Pydantic Data Validation"),
        ("psutil", "Process & System Resource Monitoring"),
        ("numpy", "Numerical Processing & Array Operations"),
        ("pandas", "Dataframe Analytics & CSV Export"),
        ("matplotlib", "Research Figure & Visualization Generator"),
        ("pytest", "Automated Testing Framework"),
        ("cryptography", "Classical Cryptography Baseline Primitives"),
        ("mlkem", "NIST FIPS 203 ML-KEM Native Engine"),
    ]

    all_passed = True
    for module_name, desc in required:
        try:
            mod = __import__(module_name)
            ver = getattr(mod, "__version__", "Available")
            print(f"[+] {desc:<45} : OK (v{ver})")
        except ImportError as e:
            print(f"[-] {desc:<45} : FAILED ({e})")
            all_passed = False

    return all_passed


def check_timing_precision() -> bool:
    print_section("3. High-Resolution Timing Verification")
    timer_info = time.get_clock_info("perf_counter")
    print(f"Clock Type        : {timer_info.implementation}")
    print(f"Clock Resolution  : {timer_info.resolution * 1e9:.2f} ns ({timer_info.resolution:.2e} s)")
    print(f"Clock Monotonic   : {timer_info.monotonic}")

    # Micro-sample delta
    samples = []
    for _ in range(10):
        t1 = time.perf_counter_ns()
        t2 = time.perf_counter_ns()
        samples.append(t2 - t1)
    min_delta = min(samples)
    print(f"Back-to-back read : {min_delta} ns minimum delta")

    if not timer_info.monotonic or timer_info.resolution > 1e-6:
        print("[-] WARNING: Monotonic high-resolution timer may lack microsecond precision.")
        return False
    print("[+] High-resolution timing check PASSED.")
    return True


def check_resource_instrumentation() -> bool:
    print_section("4. Resource Instrumentation (Memory & CPU)")
    try:
        import psutil
        import tracemalloc

        # Test tracemalloc
        tracemalloc.start()
        dummy_alloc = [x for x in range(100_000)]
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        del dummy_alloc

        print(f"[+] Python tracemalloc   : Functional (Peak traced: {peak / 1024:.1f} KB)")

        # Test psutil resident memory
        proc = psutil.Process(os.getpid())
        mem_info = proc.memory_info()
        print(f"[+] Process Resident Set : Functional ({mem_info.rss / (1024 * 1024):.2f} MB RSS)")
        print(f"[+] System Total Memory  : {psutil.virtual_memory().total / (1024**3):.2f} GB")
        print(f"[+] Logical CPU Cores    : {psutil.cpu_count(logical=True)}")
        return True
    except Exception as e:
        print(f"[-] Resource instrumentation error: {e}")
        return False


def check_mlkem_cryptography() -> bool:
    print_section("5. ML-KEM (FIPS 203) Cryptographic Verification")
    try:
        import mlkem
        import hmac

        param_specs = [
            ("ML-KEM-512", mlkem.ParameterSet.ML_KEM_512, 800, 768, 32),
            ("ML-KEM-768", mlkem.ParameterSet.ML_KEM_768, 1184, 1088, 32),
            ("ML-KEM-1024", mlkem.ParameterSet.ML_KEM_1024, 1568, 1568, 32),
        ]

        for name, param, exp_ek_len, exp_ct_len, exp_ss_len in param_specs:
            kem = mlkem.ML_KEM(param)

            # 1. Key generation
            t0 = time.perf_counter_ns()
            ek, dk = kem.key_gen()
            t_keygen = (time.perf_counter_ns() - t0) / 1000

            ek_bytes = ek.to_bytes()
            dk_bytes = dk.to_bytes()

            if len(ek_bytes) != exp_ek_len:
                print(f"[-] {name} EK length mismatch: got {len(ek_bytes)}, expected {exp_ek_len}")
                return False

            # 2. Encapsulation
            t0 = time.perf_counter_ns()
            ss_sender, ct = kem.encaps(ek)
            t_encap = (time.perf_counter_ns() - t0) / 1000

            if len(ct) != exp_ct_len:
                print(f"[-] {name} CT length mismatch: got {len(ct)}, expected {exp_ct_len}")
                return False

            if len(ss_sender) != exp_ss_len:
                print(f"[-] {name} Shared secret length mismatch: got {len(ss_sender)}, expected {exp_ss_len}")
                return False

            # 3. Decapsulation
            t0 = time.perf_counter_ns()
            ss_recipient = kem.decaps(dk, ct)
            t_decap = (time.perf_counter_ns() - t0) / 1000

            # 4. Constant-time equality check
            if not hmac.compare_digest(bytes(ss_sender), bytes(ss_recipient)):
                print(f"[-] {name} Shared secret mismatch between sender and recipient!")
                return False

            # 5. Implicit rejection test
            corrupted_ct = bytearray(ct)
            corrupted_ct[0] ^= 0xFF
            ss_corrupted = kem.decaps(dk, bytes(corrupted_ct))
            if hmac.compare_digest(bytes(ss_sender), bytes(ss_corrupted)):
                print(f"[-] {name} Implicit rejection failure: corrupted ciphertext matched secret!")
                return False

            print(
                f"[+] {name:<12} : PASSED (EK={len(ek_bytes)}B, CT={len(ct)}B, SS={len(ss_sender)}B) "
                f"| Latency: KeyGen={t_keygen:.1f}µs, Encap={t_encap:.1f}µs, Decap={t_decap:.1f}µs"
            )

        print("[+] ML-KEM FIPS 203 cryptographic validation PASSED for all parameter sets.")
        return True
    except Exception as e:
        print(f"[-] Cryptographic verification FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_directories_and_storage() -> bool:
    print_section("6. Directory Structure & Write Permissions")
    base_dir = Path(__file__).resolve().parent.parent
    subdirs = ["data", "results", "docs", "templates", "static/css", "static/js", "crypto", "benchmark", "api"]

    for sub in subdirs:
        p = base_dir / sub
        if not p.exists():
            p.mkdir(parents=True, exist_ok=True)
        # Test write permission
        test_file = p / ".perm_check.tmp"
        try:
            test_file.write_text("test")
            test_file.unlink()
            print(f"[+] Directory writable: {sub:<20}")
        except Exception as e:
            print(f"[-] Directory write failed: {sub} ({e})")
            return False

    return True


def main():
    print("=" * 70)
    print(" ML-KEM BENCHMARKING PLATFORM: SYSTEM & CRYPTO DIAGNOSTIC SUITE")
    print(" NIST FIPS 203 Compliant Verification")
    print("=" * 70)

    checks = [
        ("Python Version", check_python_version),
        ("Core Dependencies", check_dependencies),
        ("High-Resolution Timing", check_timing_precision),
        ("Resource Instrumentation", check_resource_instrumentation),
        ("Directory & Permissions", check_directories_and_storage),
        ("ML-KEM Cryptographic Engine", check_mlkem_cryptography),
    ]

    results = []
    for name, func in checks:
        passed = func()
        results.append((name, passed))

    print_section("Verification Summary")
    all_ok = True
    for name, passed in results:
        status = "PASSED" if passed else "FAILED"
        print(f" - {name:<30} : {status}")
        if not passed:
            all_ok = False

    print("=" * 70)
    if all_ok:
        print("[SUCCESS] All environment, cryptographic, and system checks PASSED.")
        print("          The system is fully certified to run Phase 2 implementation.")
        sys.exit(0)
    else:
        print("[FAILURE] One or more diagnostic checks failed. Review details above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
