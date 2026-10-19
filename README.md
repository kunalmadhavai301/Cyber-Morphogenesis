# ML-KEM Key Encapsulation & Benchmarking Platform
### NIST FIPS 203 Standardized Implementation, Benchmarking & Research Suite

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![NIST FIPS 203](https://img.shields.io/badge/NIST-FIPS%20203%20ML--KEM-brightgreen.svg)](https://csrc.nist.gov/pubs/fips/203/final)
[![Tests Passing](https://img.shields.io/badge/Pytest-41%20Passed-success.svg)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 1. Project Overview

This platform provides a standards-compliant, research-grade software application for evaluating the **Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)**, formally standardized by NIST in **FIPS 203** (August 2024, derived from CRYSTALS-Kyber).

Designed for cybersecurity academic major projects, post-quantum research, and systems engineering evaluation, the platform implements:
* **ML-KEM-512** (NIST Security Category 1, AES-128 equivalent)
* **ML-KEM-768** (NIST Security Category 3, AES-192 equivalent - Recommended Default)
* **ML-KEM-1024** (NIST Security Category 5, AES-256 equivalent)

The platform evaluates real computational performance under controlled conditions—measuring nanosecond-precision latencies, process memory consumption, communication wire overhead, and throughput—without fabricating synthetic data.

---

## 2. Key Features

* **Authentic Standards-Compliant Cryptography:** Built upon verified native cryptographic bindings conforming strictly to NIST FIPS 203 Section 8 Table 2.
* **Zero-Secret-Leakage Guarantee:** Ephemeral in-memory key management with custom representation masking (`[REDACTED]`), constant-time equality checks (`hmac.compare_digest`), automatic TTL key cleanup, and zero exposure of secret keys or shared secrets via API responses or logs.
* **Implicit Rejection (§5.3):** Full compliance with FIPS 203 implicit rejection—corrupted ciphertexts deterministically produce pseudorandom secrets, neutralizing Bleichenbacher timing oracle attacks.
* **Reproducible Benchmarking Suite (Experiments A–J):**
  - **Exp A:** Key Generation Latency (µs/ms)
  - **Exp B:** Encapsulation Latency (µs/ms)
  - **Exp C:** Decapsulation Latency (µs/ms)
  - **Exp D:** Key and Ciphertext Sizes (FIPS 203 vs representation)
  - **Exp E:** Throughput (Operations/Second)
  - **Exp F:** Dual-Layer Memory Profiling (Python heap peak + OS process RSS)
  - **Exp G:** Workload Scaling (50 to 5,000+ operations)
  - **Exp H:** Repeated Execution Correctness (100% secret agreement verification)
  - **Exp I:** Comparative Parameter Set Sweep
  - **Exp J:** Classical vs Post-Quantum Baselines (ECDH X25519 and NIST P-256)
* **Interactive Web Dashboard (7 Pages):**
  1. *Overview Dashboard:* System health, parameter overview, persisted run KPIs.
  2. *Cryptographic Demonstration:* Step-by-step key exchange between Alice and Bob with live implicit rejection testing.
  3. *Benchmark Lab:* Bounded experimental runner with progress tracking and statistical summaries.
  4. *Comparative Analysis:* Interactive Chart.js charts for latency, throughput, sizes, and classical comparisons.
  5. *Experiment History:* SQLite historical experiment archive with search and modal inspection.
  6. *Research Report:* Downloadable and printable research paper format with KaTeX formulas.
  7. *Documentation:* Deep-dive technical explanations of M-LWE, NTT, and security principles.
* **Data Storage & Export:** SQLite experiment history and instant RFC 4180 CSV export.
* **41 Automated Pytest Suites:** Unit, integration, security, and export tests.

---

## 3. System Architecture

```
User (Browser)
      |
      v
Interactive Research Dashboard (Bootstrap 5.3 + Chart.js + Dark Cybersecurity Theme)
      |
(REST API JSON)
      v
Flask Application Gateway (Pydantic v2 Validation + Security Headers)
      |
      +--------------------------------------+---------------------------------------+
      |                                      |                                       |
      v                                      v                                       v
ML-KEM Crypto Service             Session Key Manager                     Benchmarking Engine
(crypto/mlkem_service.py)        (crypto/key_management.py)              (benchmark/runner.py)
  - Native FIPS 203 Engine         - Ephemeral In-Memory Storage           - Monotonic Timer (100 ns)
  - KeyGen / Encap / Decap         - 15-Min TTL Expiration                 - psutil RSS + tracemalloc
  - Implicit Rejection (§5.3)      - Redacted Repr / Zeroization           - Statistical Engine (Mean, P95, CI)
      |                                      |                                       |
      +--------------------------------------+---------------------------------------+
                                             |
                                             v
                           Storage & Export Services (services/)
                             - SQLite History (data/benchmark_experiments.sqlite3)
                             - RFC 4180 CSV Exporter (results/)
                             - Matplotlib Research Figures (results/)
```

---

## 4. Prerequisites

* **Operating System:** Windows 10/11 (x86_64), Linux (x86_64 / aarch64), or macOS.
* **Python:** Version 3.11, 3.12, or 3.13.

---

## 5. Quick Installation & Setup

### Windows (PowerShell)

```powershell
# 1. Clone repository or navigate to directory
cd ml_kem_benchmarking_platform

# 2. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Upgrade pip and install dependencies
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt

# 4. Execute the system diagnostic script
python scripts/check_environment.py
```

### Linux / macOS (Bash)

```bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Upgrade pip and install dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# 3. Execute the diagnostic script
python scripts/check_environment.py
```

---

## 6. Running the Application

### 6.1. Start the Web Dashboard
```powershell
python app.py
```
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

### 6.2. Run the Automated CLI Benchmark Suite
To execute reproducible CLI benchmarks (Experiments A through J), populate the SQLite database, and export research artifacts:
```powershell
python scripts/run_benchmarks.py --trials 100 --warmup 20 --export-fig --export-csv
```
Artifacts generated:
* `data/benchmark_experiments.sqlite3`: Persisted experiment measurements.
* `results/mlkem_benchmark_export.csv`: Full RFC 4180 CSV dataset.
* `results/mlkem_parameter_comparison.png`: Research-quality figure.

### 6.3. Execute the Automated Test Suite
Run all 41 unit, integration, and security tests:
```powershell
pytest tests/ -v
```

---

## 7. Standardized FIPS 203 Parameter Specifications

| Parameter Set | Module Rank ($k$) | NIST Category | Classical Equiv. | Public Key ($ek$) | Private Key ($dk$) | Ciphertext ($c$) | Shared Secret ($K$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ML-KEM-512** | 2 | Category 1 | AES-128 | **800 Bytes** | **1,632 Bytes** | **768 Bytes** | **32 Bytes** |
| **ML-KEM-768** | 3 | Category 3 | AES-192 | **1,184 Bytes** | **2,400 Bytes** | **1,088 Bytes** | **32 Bytes** |
| **ML-KEM-1024** | 4 | Category 5 | AES-256 | **1,568 Bytes** | **3,168 Bytes** | **1,568 Bytes** | **32 Bytes** |

---

## 8. REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health status and cryptographic engine information. |
| `/api/algorithms` | `GET` | Parameter metadata conforming to FIPS 203. |
| `/api/kem/session` | `POST` | Initializes an ephemeral, isolated demonstration session. |
| `/api/kem/keygen` | `POST` | Generates an ML-KEM key pair. Retains private key in RAM. |
| `/api/kem/encapsulate` | `POST` | Encapsulates secret against public key. Keeps secret hidden. |
| `/api/kem/decapsulate` | `POST` | Decapsulates ciphertext. Supports custom ciphertext for implicit rejection tests. |
| `/api/kem/verify` | `POST` | Constant-time verification of shared secret equality. |
| `/api/benchmark/run` | `POST` | Executes bounded benchmark job and persists to SQLite. |
| `/api/benchmark/results` | `GET` | Lists recent benchmark runs from database. |
| `/api/benchmark/results/<id>` | `GET` | Retrieves full statistical details for an experiment. |
| `/api/benchmark/comparison` | `GET` | Comparative sweep across 512, 768, and 1024. |
| `/api/benchmark/classical-comparison`| `GET` | Comparison between ML-KEM-768 and ECDH (X25519 & P-256). |
| `/api/benchmark/export/csv` | `GET` | Downloads complete CSV dataset. |

---

## 9. Academic & Security Limitations

1. **Experimental Prototype:** This software is developed for academic research, cryptographic analysis, and comparative benchmarking. While using standards-compliant FIPS 203 primitives, it is not a certified production Key Management System (KMS) or Hardware Security Module (HSM).
2. **Side-Channel Analysis Scope:** Software benchmarks measure algorithmic latency and CPU resource consumption. They do not evaluate physical side-channel resistance (e.g. differential power analysis or electromagnetic emissions), which requires specialized oscilloscope laboratories.
3. **Network Concurrency:** Single-node throughput reflects local core capability. Distributed network deployments will additionally be bounded by network latency and MTU packet fragmentation.

---

## 10. References

1. National Institute of Standards and Technology. (2024). *Module-Lattice-Based Key-Encapsulation Mechanism Standard (FIPS PUB 203)*. https://doi.org/10.6028/NIST.FIPS.203
2. OpenSSL Project. (2024). *OpenSSL 3.5 Documentation: EVP_KEM-ML-KEM*. https://docs.openssl.org/3.5/man7/EVP_KEM-ML-KEM/
3. Avanzi, R., et al. (2020). *CRYSTALS-Kyber: Algorithm Specifications And Supporting Documentation (Version 3.02)*.
4. Shor, P. W. (1994). Algorithms for quantum computation: discrete logarithms and factoring. *IEEE FOCS*.
