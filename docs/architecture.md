# System Architecture Documentation

## ML-KEM Key Encapsulation & Benchmarking Platform (NIST FIPS 203)

### 1. Architectural Philosophy

The platform is engineered around three non-negotiable architectural tenets:
1. **Cryptographic Standards Compliance:** Native implementation strictly conformant to NIST FIPS 203 (Module-Lattice-Based Key-Encapsulation Mechanism).
2. **Zero-Secret-Leakage Guarantee:** Defense-in-depth isolation preventing private decapsulation keys ($dk$) and ephemeral shared secrets ($K$) from appearing in logs, exception traces, or API responses.
3. **Reproducible Experimental Instrumentation:** High-resolution monotonic timing ($100\text{ ns}$ resolution) and dual-layer memory tracking (Python heap + OS process RSS) to provide empirical metrics for academic research.

---

### 2. High-Level Modular Decomposition

```
+-------------------------------------------------------------------------------+
|                             Presentation Tier                                 |
|   Bootstrap 5.3 + FontAwesome 6 + Chart.js 4.4 + Dark Cybersecurity Theme     |
|   (Overview Dashboard, Cryptographic Demo, Benchmark Lab, Comparison, History) |
+-------------------------------------------------------------------------------+
                                      |
                           (JSON REST API Over HTTP)
                                      v
+-------------------------------------------------------------------------------+
|                            Flask API Gateway                                  |
|   - Pydantic v2 Request Validation & Schema Sanitization                      |
|   - Defense-in-depth HTTP Security Headers (CSP, Frame-Options, No-Sniff)     |
|   - Ephemeral Key Session Token Manager (UUID4 Handles with TTL)              |
+-------------------------------------------------------------------------------+
           |                                                      |
 (Demo / Interactive Operations)                          (Benchmarking Workloads)
           v                                                      v
+------------------------------------+          +------------------------------------+
|         Crypto Core Tier           |          |        Benchmarking Tier           |
|  crypto/mlkem_service.py           |          |  benchmark/timing.py               |
|   - ML-KEM-512, 768, 1024          |          |   - perf_counter_ns Monotonic Clock|
|   - Implicit Rejection (§5.3)      |          |  benchmark/memory.py               |
|   - Secret Zeroization Helpers     |          |   - tracemalloc + psutil RSS       |
|  crypto/verification.py            |          |  benchmark/statistics.py           |
|   - Constant-time hmac.compare     |          |   - Mean, Median, P95, CI, Throughput
|   - SHA-256 Fingerprint Masking    |          |  benchmark/experiments.py (Exp A-J)|
+------------------------------------+          +------------------------------------+
                   \                                  /
                    v                                v
+-------------------------------------------------------------------------------+
|                        Data Storage & Export Tier                             |
|  storage/database.py      -> SQLite Historical Benchmarks (No Secrets Stored) |
|  services/export_service.py -> RFC 4180 CSV Exporter & Matplotlib PNG Figures  |
|  services/results_service.py -> Aggregation & Dashboard Analytics             |
+-------------------------------------------------------------------------------+
```

---

### 3. Subsystem Breakdown

#### 3.1. Cryptographic Service Layer (`crypto/`)
* **`MLKEMService`**: Exposes high-speed interfaces for key generation, encapsulation, and decapsulation. Interacts with the native compiled Rust/C engine (`mlkem`). Validates artifact lengths against FIPS 203 Section 8 Table 2.
* **`SessionKeyManager`**: Ephemeral in-memory registry holding private key instances referenced exclusively by temporary tokens. Never writes secrets to disk; automatically expires keys after `SESSION_KEY_TTL_SECONDS`.
* **`CryptoVerifier`**: Employs constant-time comparisons (`hmac.compare_digest`) for secret matching and calculates non-revealing SHA-256 fingerprints for visual verification. Also implements classical ECDH (Curve25519 and NIST P-256) baselines.

#### 3.2. Benchmarking Engine (`benchmark/`)
* **`BenchmarkTimer`**: Controls warm-up execution and samples execution time in nanoseconds via `time.perf_counter_ns()`. Ensures setup operations (e.g. key generation) are strictly excluded from encapsulation/decapsulation timed regions.
* **`MemoryProfiler`**: Profiles memory consumption using dual-layer telemetry: `tracemalloc` tracks Python-managed object allocations, while `psutil` captures operating-system level Resident Set Size (RSS) deltas for native binaries.
* **`BenchmarkStatistics`**: Computes parametric (mean, standard deviation, 95% confidence intervals) and non-parametric (median, IQR, 95th/99th percentiles) metrics, alongside sustained throughput (ops/sec).
* **`BenchmarkExperiments`**: Encapsulates discrete experiments A through J.

#### 3.3. REST API Gateway (`api/`)
* Built with Flask and Pydantic v2.
* Enforces strict boundary checks (trial counts bounded between 1 and 10,000; strict whitelist of supported parameter sets).
* All state-changing endpoints produce uniform JSON responses.

#### 3.4. Persistence & Reporting (`storage/`, `services/`)
* **SQLite Database (`storage/database.py`)**: Stores experiment metadata (OS, CPU cores, Python version, library version, parameters, statistics). Does NOT have fields for secret keys.
* **Export Service (`services/export_service.py`)**: Streams standardized RFC 4180 CSV files and compiles Matplotlib research figures with dark themes.
