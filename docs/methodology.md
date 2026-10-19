# Benchmarking Methodology & Experimental Design

## Standards Compliance: NIST FIPS 203 (Module-Lattice-Based KEM)

### 1. Timing Methodology & Clock Precision

#### 1.1. Monotonic High-Resolution Clock
Cryptographic operations in ML-KEM execute within microsecond time horizons ($\approx 20\text{--}80\,\mu\text{s}$). Measuring such intervals requires a monotonic clock with sub-microsecond resolution. We utilize Python's `time.perf_counter_ns()`, which interfaces with the hardware `QueryPerformanceCounter` (QPC) on Windows systems.
* **Clock Resolution:** $100\text{ ns}$ ($1.0 \times 10^{-7}\text{ s}$).
* **Monotonic Guarantee:** Immune to system clock adjustments or NTP synchronization skew.
* **Resolution Verification:** Verified programmatically via `time.get_clock_info("perf_counter")`.

#### 1.2. Warm-Up Calibration
Prior to recording observations, a pre-configured warm-up sequence ($w \ge 20$ iterations) is executed. Warm-up iterations ensure:
1. Stabilization of CPU dynamic frequency scaling (Intel SpeedStep / AMD Cool'n'Quiet).
2. Population and stabilization of CPU L1/L2 data and instruction caches.
3. Pre-allocation of internal memory pools within the Python runtime and native C/Rust shared libraries.
Warm-up iterations are strictly segregated from the measurement dataset.

#### 1.3. Operation Isolation
A critical pitfall in KEM benchmarking is conflating setup operations with the target primitive:
* **Key Generation Timing:** Strictly isolates matrix generation, NTT transformation, and seed hashing.
* **Encapsulation Timing:** Public key $ek$ is pre-generated outside the timed block. Only $\text{Encaps}(ek)$ is timed.
* **Decapsulation Timing:** Both $ek$ and valid ciphertext $c$ are pre-computed. Only $\text{Decaps}(dk, c)$ is timed.

---

### 2. Statistical Analysis Framework

For a sample of $n$ independent timing observations $X = \{x_1, x_2, \dots, x_n\}$ recorded in nanoseconds and converted to microseconds:

1. **Mean Latency ($\bar{x}$):**
   $$\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$$
2. **Sample Standard Deviation ($s$):** Computed with Bessel's correction ($ddof=1$):
   $$s = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2}$$
3. **Median ($\tilde{x}$) & Interquartile Range ($IQR$):**
   Robust non-parametric metrics resistant to tail latency outliers:
   $$IQR = Q_3 - Q_1$$
4. **95th Percentile Latency ($P_{95}$):**
   Computed using linear interpolation over ordered observations. Identifies near-worst-case tail latency experienced by systems under high concurrency.
5. **95% Confidence Interval (CI) of the Mean:**
   $$\text{CI}_{95\%} = \left[ \bar{x} - z \cdot \frac{s}{\sqrt{n}}, \; \bar{x} + z \cdot \frac{s}{\sqrt{n}} \right]$$
   *(Note: This measures statistical confidence in the true population mean, distinct from $P_{95}$ latency).*
6. **Throughput ($\text{Ops/Sec}$):**
   $$\text{Throughput} = \frac{N_{\text{successful}}}{T_{\text{total\_seconds}}}$$

---

### 3. Memory Profiling Methodology

Memory telemetry employs a dual-layer strategy:

| Metric | Instrument | Scope | Interpretation |
| :--- | :--- | :--- | :--- |
| **Python Heap Peak** | `tracemalloc` | Python interpreter heap | Tracks allocations of Python wrapper classes, bytes, and dataclasses. |
| **Process RSS Delta** | `psutil` | OS Working Set (RSS) | Captures total physical memory consumed by process, including native compiled C/Rust static buffers and stack frames. |

**Baseline Control:** Forced garbage collection (`gc.collect()`) is triggered immediately prior to recording start RSS and immediately prior to final evaluation.

---

### 4. Negative Testing & Implicit Rejection Verification

FIPS 203 §5.3 specifies that an invalid ciphertext $c$ of the expected byte length must not cause the decapsulation procedure to abort or raise an exception. Instead, it must deterministically produce a pseudorandom shared secret:
$$K' = \text{J}(z \mathbin{\Vert} c)$$
Where $z$ is a 32-byte rejection seed stored securely inside $dk$.

Our negative test suite systematically verifies:
1. That bit-flipped ciphertexts return a valid 32-byte secret without throwing exceptions.
2. That subsequent constant-time comparison confirms the recovered secret does NOT match the sender's secret.
3. That structural length violations (truncated or malformed ciphertexts) are safely caught and reported via structured error handling.
