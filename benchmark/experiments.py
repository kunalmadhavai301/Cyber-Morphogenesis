"""
Experiments Suite for ML-KEM Benchmarking Platform.
Implements Experiments A through J:
- Exp A: Key Generation Latency
- Exp B: Encapsulation Latency
- Exp C: Decapsulation Latency
- Exp D: Key and Ciphertext Sizes
- Exp E: Throughput (Single-operation & Roundtrip)
- Exp F: Memory Profiling (Heap + RSS)
- Exp G: Workload Scaling
- Exp H: Correctness Under Repeated Execution
- Exp I: Comprehensive Parameter Set Comparison (512 vs 768 vs 1024)
- Exp J: Classical Key Establishment Comparison (ECDH X25519 & P-256)
"""

import time
import platform
from typing import Dict, Any, List, Optional
import hmac

from crypto.mlkem_service import MLKEMService
from crypto.verification import CryptoVerifier
from config import FIPS_203_PARAMETERS
from .timing import BenchmarkTimer
from .statistics import BenchmarkStatistics
from .memory import MemoryProfiler


class BenchmarkExperiments:
    """Implementation of formal research experiments A through J."""

    def __init__(self, service: Optional[MLKEMService] = None):
        self.service = service or MLKEMService()
        self.memory_profiler = MemoryProfiler()

    # =========================================================================
    # Experiment A: Key Generation Latency
    # =========================================================================
    def run_experiment_a(
        self,
        parameter_set: str = "ML-KEM-768",
        trials: int = 100,
        warmup: int = 20
    ) -> Dict[str, Any]:
        """Measures key-generation latency over repeated independent trials."""
        # 1. Warm-up
        BenchmarkTimer.run_warmup(lambda: self.service.generate_keypair(parameter_set), iterations=warmup)

        # 2. Timed trials
        latencies_ns = []
        successful = 0
        failed = 0
        t_start_total = time.perf_counter_ns()

        for _ in range(trials):
            try:
                kp, elapsed_ns = BenchmarkTimer.time_single_op(
                    lambda: self.service.generate_keypair(parameter_set)
                )
                latencies_ns.append(elapsed_ns)
                successful += 1
            except Exception:
                failed += 1

        t_total_ns = time.perf_counter_ns() - t_start_total
        stats = BenchmarkStatistics.calculate(latencies_ns, t_total_ns, successful, failed)

        return {
            "experiment": "Experiment A: Key Generation Latency",
            "parameter_set": parameter_set,
            "trials": trials,
            "warmup": warmup,
            "raw_latencies_us": [round(x / 1000.0, 2) for x in latencies_ns],
            "statistics": stats,
        }

    # =========================================================================
    # Experiment B: Encapsulation Latency
    # =========================================================================
    def run_experiment_b(
        self,
        parameter_set: str = "ML-KEM-768",
        trials: int = 100,
        warmup: int = 20
    ) -> Dict[str, Any]:
        """Measures encapsulation latency.
        Key generation is strictly pre-computed outside the timed region."""
        # Pre-generate valid public key
        keypair = self.service.generate_keypair(parameter_set)
        public_key_bytes = keypair.public_key_bytes

        # 1. Warm-up
        BenchmarkTimer.run_warmup(
            lambda: self.service.encapsulate(parameter_set, public_key_bytes),
            iterations=warmup
        )

        # 2. Timed trials
        latencies_ns = []
        successful = 0
        failed = 0
        t_start_total = time.perf_counter_ns()

        for _ in range(trials):
            try:
                encap, elapsed_ns = BenchmarkTimer.time_single_op(
                    lambda: self.service.encapsulate(parameter_set, public_key_bytes)
                )
                latencies_ns.append(elapsed_ns)
                successful += 1
            except Exception:
                failed += 1

        t_total_ns = time.perf_counter_ns() - t_start_total
        stats = BenchmarkStatistics.calculate(latencies_ns, t_total_ns, successful, failed)

        return {
            "experiment": "Experiment B: Encapsulation Latency",
            "parameter_set": parameter_set,
            "trials": trials,
            "warmup": warmup,
            "raw_latencies_us": [round(x / 1000.0, 2) for x in latencies_ns],
            "statistics": stats,
        }

    # =========================================================================
    # Experiment C: Decapsulation Latency
    # =========================================================================
    def run_experiment_c(
        self,
        parameter_set: str = "ML-KEM-768",
        trials: int = 100,
        warmup: int = 20
    ) -> Dict[str, Any]:
        """Measures decapsulation latency.
        Key generation and encapsulation are strictly pre-computed outside the timer."""
        # Pre-generate valid keypair and ciphertext
        keypair = self.service.generate_keypair(parameter_set)
        encap = self.service.encapsulate(parameter_set, keypair.public_key_bytes)
        dk_obj = keypair._private_key_obj
        ct_bytes = encap.ciphertext_bytes

        # 1. Warm-up
        BenchmarkTimer.run_warmup(
            lambda: self.service.decapsulate(parameter_set, dk_obj, ct_bytes),
            iterations=warmup
        )

        # 2. Timed trials
        latencies_ns = []
        successful = 0
        failed = 0
        t_start_total = time.perf_counter_ns()

        for _ in range(trials):
            try:
                decap, elapsed_ns = BenchmarkTimer.time_single_op(
                    lambda: self.service.decapsulate(parameter_set, dk_obj, ct_bytes)
                )
                latencies_ns.append(elapsed_ns)
                successful += 1
            except Exception:
                failed += 1

        t_total_ns = time.perf_counter_ns() - t_start_total
        stats = BenchmarkStatistics.calculate(latencies_ns, t_total_ns, successful, failed)

        return {
            "experiment": "Experiment C: Decapsulation Latency",
            "parameter_set": parameter_set,
            "trials": trials,
            "warmup": warmup,
            "raw_latencies_us": [round(x / 1000.0, 2) for x in latencies_ns],
            "statistics": stats,
        }

    # =========================================================================
    # Experiment D: Key and Ciphertext Sizes
    # =========================================================================
    def run_experiment_d(self) -> Dict[str, Any]:
        """Measures and cross-validates communication sizes across all parameter sets."""
        summary = {}
        for param_name in ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]:
            spec = FIPS_203_PARAMETERS[param_name]
            kp = self.service.generate_keypair(param_name)
            encap = self.service.encapsulate(param_name, kp.public_key_bytes)
            decap = self.service.decapsulate(param_name, kp._private_key_obj, encap.ciphertext_bytes)

            summary[param_name] = {
                "nist_category": spec.nist_category,
                "classical_security_equivalent": spec.classical_security_equiv,
                "public_key_bytes": len(kp.public_key_bytes),
                "private_key_bytes": kp.private_key_len,
                "ciphertext_bytes": len(encap.ciphertext_bytes),
                "shared_secret_bytes": encap.shared_secret_len,
                "total_wire_overhead_bytes": len(kp.public_key_bytes) + len(encap.ciphertext_bytes),
                "fips203_spec_match": (
                    len(kp.public_key_bytes) == spec.public_key_bytes
                    and len(encap.ciphertext_bytes) == spec.ciphertext_bytes
                    and encap.shared_secret_len == spec.shared_secret_bytes
                ),
            }
        return {
            "experiment": "Experiment D: Key and Ciphertext Sizes",
            "parameters": summary,
        }

    # =========================================================================
    # Experiment E: Throughput
    # =========================================================================
    def run_experiment_e(
        self,
        parameter_set: str = "ML-KEM-768",
        duration_seconds: float = 2.0
    ) -> Dict[str, Any]:
        """Measures sustained operation throughput (ops/sec) over a fixed time window."""
        kp = self.service.generate_keypair(parameter_set)
        ek = kp.public_key_bytes
        dk = kp._private_key_obj
        encap = self.service.encapsulate(parameter_set, ek)
        ct = encap.ciphertext_bytes

        # 1. KeyGen Throughput
        keygen_count = 0
        t_end = time.perf_counter() + duration_seconds
        t_start = time.perf_counter()
        while time.perf_counter() < t_end:
            self.service.generate_keypair(parameter_set)
            keygen_count += 1
        t_elapsed = time.perf_counter() - t_start
        keygen_tps = keygen_count / t_elapsed

        # 2. Encaps Throughput
        encaps_count = 0
        t_end = time.perf_counter() + duration_seconds
        t_start = time.perf_counter()
        while time.perf_counter() < t_end:
            self.service.encapsulate(parameter_set, ek)
            encaps_count += 1
        t_elapsed = time.perf_counter() - t_start
        encaps_tps = encaps_count / t_elapsed

        # 3. Decaps Throughput
        decaps_count = 0
        t_end = time.perf_counter() + duration_seconds
        t_start = time.perf_counter()
        while time.perf_counter() < t_end:
            self.service.decapsulate(parameter_set, dk, ct)
            decaps_count += 1
        t_elapsed = time.perf_counter() - t_start
        decaps_tps = decaps_count / t_elapsed

        return {
            "experiment": "Experiment E: Throughput Analysis",
            "parameter_set": parameter_set,
            "measurement_window_sec": duration_seconds,
            "throughput_ops_per_sec": {
                "keygen": round(keygen_tps, 2),
                "encaps": round(encaps_tps, 2),
                "decaps": round(decaps_tps, 2),
                "full_roundtrip_equiv": round(1.0 / ((1.0 / keygen_tps) + (1.0 / encaps_tps) + (1.0 / decaps_tps)), 2)
            }
        }

    # =========================================================================
    # Experiment F: Memory Consumption Profiling
    # =========================================================================
    def run_experiment_f(
        self,
        parameter_set: str = "ML-KEM-768",
        iterations: int = 500
    ) -> Dict[str, Any]:
        """Profiles heap memory and process RSS during repeated key encapsulation cycles."""
        def cycle():
            kp = self.service.generate_keypair(parameter_set)
            encap = self.service.encapsulate(parameter_set, kp.public_key_bytes)
            decap = self.service.decapsulate(parameter_set, kp._private_key_obj, encap.ciphertext_bytes)
            return decap

        profile = self.memory_profiler.profile_operation(cycle, iterations=iterations)
        return {
            "experiment": "Experiment F: Memory Consumption",
            "parameter_set": parameter_set,
            "iterations": iterations,
            "metrics": profile,
        }

    # =========================================================================
    # Experiment G: Workload Scaling
    # =========================================================================
    def run_experiment_g(
        self,
        parameter_set: str = "ML-KEM-768",
        workloads: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """Evaluates scalability across varying batch sizes (e.g., 50, 100, 250, 500, 1000)."""
        scales = workloads or [50, 100, 250, 500, 1000]
        scaling_results = []

        for count in scales:
            t0 = time.perf_counter_ns()
            latencies = []
            for _ in range(count):
                _, op_ns = BenchmarkTimer.time_single_op(
                    lambda: self.service.generate_keypair(parameter_set)
                )
                latencies.append(op_ns)
            total_ns = time.perf_counter_ns() - t0
            stats = BenchmarkStatistics.calculate(latencies, total_ns, count, 0)
            scaling_results.append({
                "workload_ops": count,
                "total_duration_ms": stats["total_duration_ms"],
                "throughput_ops_per_sec": stats["throughput_ops_per_sec"],
                "median_latency_us": stats["median_us"],
                "mean_latency_us": stats["mean_us"],
                "p95_latency_us": stats["p95_us"],
            })

        return {
            "experiment": "Experiment G: Workload Scaling",
            "parameter_set": parameter_set,
            "workloads": scaling_results,
        }

    # =========================================================================
    # Experiment H: Repeated Execution Correctness
    # =========================================================================
    def run_experiment_h(
        self,
        parameter_set: str = "ML-KEM-768",
        iterations: int = 200
    ) -> Dict[str, Any]:
        """Performs repeated independent key exchanges, verifying 100% agreement."""
        successful_matches = 0
        mismatches = 0
        exceptions_count = 0

        for _ in range(iterations):
            try:
                kp = self.service.generate_keypair(parameter_set)
                encap = self.service.encapsulate(parameter_set, kp.public_key_bytes)
                decap = self.service.decapsulate(parameter_set, kp._private_key_obj, encap.ciphertext_bytes)
                if CryptoVerifier.constant_time_compare(encap.get_shared_secret(), decap.get_shared_secret()):
                    successful_matches += 1
                else:
                    mismatches += 1
            except Exception:
                exceptions_count += 1

        match_rate_pct = (successful_matches / max(1, iterations)) * 100.0

        return {
            "experiment": "Experiment H: Repeated Execution Correctness",
            "parameter_set": parameter_set,
            "total_iterations": iterations,
            "successful_matches": successful_matches,
            "mismatches": mismatches,
            "exceptions_encountered": exceptions_count,
            "success_rate_percent": round(match_rate_pct, 2),
            "verified_consistent": successful_matches == iterations,
        }

    # =========================================================================
    # Experiment I: Comparative Analysis Across All Parameter Sets
    # =========================================================================
    def run_experiment_i(self, trials: int = 100, warmup: int = 20) -> Dict[str, Any]:
        """Full comparative sweep across ML-KEM-512, ML-KEM-768, and ML-KEM-1024."""
        comparison = {}
        for param_name in ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]:
            exp_a = self.run_experiment_a(param_name, trials=trials, warmup=warmup)
            exp_b = self.run_experiment_b(param_name, trials=trials, warmup=warmup)
            exp_c = self.run_experiment_c(param_name, trials=trials, warmup=warmup)

            spec = FIPS_203_PARAMETERS[param_name]
            comparison[param_name] = {
                "nist_category": spec.nist_category,
                "classical_security": spec.classical_security_equiv,
                "sizes": {
                    "public_key_bytes": spec.public_key_bytes,
                    "private_key_bytes": spec.private_key_bytes,
                    "ciphertext_bytes": spec.ciphertext_bytes,
                    "shared_secret_bytes": spec.shared_secret_bytes,
                    "total_wire_bytes": spec.public_key_bytes + spec.ciphertext_bytes,
                },
                "latency_us": {
                    "keygen_median": exp_a["statistics"]["median_us"],
                    "keygen_mean": exp_a["statistics"]["mean_us"],
                    "keygen_p95": exp_a["statistics"]["p95_us"],
                    "encaps_median": exp_b["statistics"]["median_us"],
                    "encaps_mean": exp_b["statistics"]["mean_us"],
                    "encaps_p95": exp_b["statistics"]["p95_us"],
                    "decaps_median": exp_c["statistics"]["median_us"],
                    "decaps_mean": exp_c["statistics"]["mean_us"],
                    "decaps_p95": exp_c["statistics"]["p95_us"],
                    "roundtrip_median": round(
                        exp_a["statistics"]["median_us"] +
                        exp_b["statistics"]["median_us"] +
                        exp_c["statistics"]["median_us"], 2
                    ),
                },
                "throughput_ops_sec": {
                    "keygen": exp_a["statistics"]["throughput_ops_per_sec"],
                    "encaps": exp_b["statistics"]["throughput_ops_per_sec"],
                    "decaps": exp_c["statistics"]["throughput_ops_per_sec"],
                }
            }

        return {
            "experiment": "Experiment I: Comprehensive Parameter Set Comparison",
            "trials_per_op": trials,
            "warmup_per_op": warmup,
            "comparison": comparison,
        }

    # =========================================================================
    # Experiment J: Classical Key Establishment Comparison
    # =========================================================================
    def run_experiment_j(self, trials: int = 100) -> Dict[str, Any]:
        """Compares ML-KEM-768 with classical ECDH (X25519 & NIST P-256)."""
        # 1. Classical X25519
        x25519_keygen_times = []
        x25519_agree_times = []
        for _ in range(trials):
            res = CryptoVerifier.benchmark_classical_ecdh_x25519()
            x25519_keygen_times.append(res["keygen_latency_us"])
            x25519_agree_times.append(res["agreement_latency_us"])

        # 2. Classical P-256
        p256_keygen_times = []
        p256_agree_times = []
        for _ in range(trials):
            res = CryptoVerifier.benchmark_classical_ecdh_p256()
            p256_keygen_times.append(res["keygen_latency_us"])
            p256_agree_times.append(res["agreement_latency_us"])

        # 3. Post-Quantum ML-KEM-768
        mlkem_a = self.run_experiment_a("ML-KEM-768", trials=trials, warmup=10)
        mlkem_b = self.run_experiment_b("ML-KEM-768", trials=trials, warmup=10)
        mlkem_c = self.run_experiment_c("ML-KEM-768", trials=trials, warmup=10)

        import numpy as np
        return {
            "experiment": "Experiment J: Classical vs Post-Quantum Key Establishment",
            "trials": trials,
            "mechanisms": {
                "ECDH_X25519": {
                    "type": "Classical Asymmetric (Montgomery Curve25519)",
                    "quantum_security": "Vulnerable to Shor's Algorithm (0 bits)",
                    "classical_security": "~128-bit equivalence",
                    "public_key_bytes": 32,
                    "ciphertext_or_exchange_bytes": 32,
                    "total_communication_bytes": 64,
                    "keygen_median_us": round(float(np.median(x25519_keygen_times)), 2),
                    "agreement_median_us": round(float(np.median(x25519_agree_times)), 2),
                    "roundtrip_median_us": round(float(np.median(x25519_keygen_times) + np.median(x25519_agree_times)), 2),
                },
                "ECDH_P256": {
                    "type": "Classical Asymmetric (Weierstrass NIST P-256)",
                    "quantum_security": "Vulnerable to Shor's Algorithm (0 bits)",
                    "classical_security": "~128-bit equivalence",
                    "public_key_bytes": 65,
                    "ciphertext_or_exchange_bytes": 65,
                    "total_communication_bytes": 130,
                    "keygen_median_us": round(float(np.median(p256_keygen_times)), 2),
                    "agreement_median_us": round(float(np.median(p256_agree_times)), 2),
                    "roundtrip_median_us": round(float(np.median(p256_keygen_times) + np.median(p256_agree_times)), 2),
                },
                "ML_KEM_768": {
                    "type": "Post-Quantum Lattice-Based KEM (NIST FIPS 203)",
                    "quantum_security": "Quantum-Resistant (NIST Category 3, ~192 bits)",
                    "classical_security": "AES-192 equivalence",
                    "public_key_bytes": 1184,
                    "ciphertext_or_exchange_bytes": 1088,
                    "total_communication_bytes": 1184 + 1088,
                    "keygen_median_us": mlkem_a["statistics"]["median_us"],
                    "agreement_median_us": round(mlkem_b["statistics"]["median_us"] + mlkem_c["statistics"]["median_us"], 2),
                    "roundtrip_median_us": round(
                        mlkem_a["statistics"]["median_us"] +
                        mlkem_b["statistics"]["median_us"] +
                        mlkem_c["statistics"]["median_us"], 2
                    ),
                }
            }
        }
