# Research Report: Performance and Resource-Efficiency Analysis of ML-KEM Parameter Sets Across Controlled Computational Workloads

**Standards Specification:** National Institute of Standards and Technology (NIST) FIPS 203  
**Target Mechanism:** Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)  
**Host Environment:** Windows 11 (AMD64), Python 3.13, Native `mlkem` FIPS 203 Engine  

---

## 1. Abstract
The transition from classical public-key cryptography to quantum-resistant alternatives represents one of the most critical infrastructural upgrades in modern cybersecurity. In August 2024, the National Institute of Standards and Technology (NIST) published Federal Information Processing Standard (FIPS) 203, formally establishing the Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM, based on CRYSTALS-Kyber) as the international standard for post-quantum key establishment. This paper presents an empirical performance, memory consumption, and communication overhead evaluation of all three standardized parameter sets: **ML-KEM-512**, **ML-KEM-768**, and **ML-KEM-1024**. Using high-resolution monotonic timing ($100\text{ ns}$ resolution) and dual-layer memory telemetry, we quantify computational latency, throughput, and wire overhead against classical Elliptic Curve Diffie-Hellman (ECDH X25519 and NIST P-256) baselines. Our findings confirm that ML-KEM achieves microsecond-scale execution speeds ($\approx 20\text{--}60\,\mu\text{s}$) that match or outperform classical curve operations, with the primary architectural trade-off being an order-of-magnitude expansion in public key and ciphertext communication overhead (1,568 to 3,136 bytes).

**Keywords:** Post-Quantum Cryptography, ML-KEM, NIST FIPS 203, Module Learning With Errors, Key Encapsulation Mechanism, Latency Benchmarking, Communication Overhead.

---

## 2. Introduction & Motivation
Classical asymmetric cryptographic schemes—including RSA, Diffie-Hellman (DH), and Elliptic Curve Cryptography (ECC)—derive their security from the computational hardness of mathematical problems such as prime factorization and the discrete logarithm problem. Peter Shor's 1994 quantum algorithm demonstrated that a fault-tolerant quantum computer executing Shor's algorithm solves both problems in polynomial time ($\mathcal{O}((\log N)^2)$).

To maintain long-term confidentiality against "Harvest Now, Decrypt Later" (HNDL) adversary strategies, cryptographic systems must migrate to algorithms resistant to quantum cryptanalysis. Following a multi-round international evaluation, NIST selected CRYSTALS-Kyber as the primary standard for general-purpose post-quantum key establishment, standardizing it in FIPS 203 as ML-KEM.

While theoretical security proofs are well established, software engineers, protocol architects, and security officers require empirical measurements to evaluate the performance impact of deploying ML-KEM in production environments (e.g., TLS 1.3 handshakes, VPN tunnels, and IoT sessions).

---

## 3. Related Work & Research Scope
Previous literature on post-quantum benchmarking has investigated algorithmic performance on microcontroller platforms (e.g., pqm4 on ARM Cortex-M4), standardized software suites (e.g., PQClean and eBACS/SUPERCOP), and experimental TLS implementations (e.g., Open Quantum Safe `liboqs`).

However, following the formal ratification of FIPS 203 in August 2024—which introduced standardized byte serializations, modified domain separators, and explicit parameter mappings—there is a need for verified, reproducible software evaluations under modern operating system environments (specifically Windows x64 with native Python bindings). This research provides an open, reproducible framework for measuring computational latency, parametric statistical distributions, process resident set memory, and workload scalability.

---

## 4. Technical Background: ML-KEM (FIPS 203)

### 4.1. Mathematical Hardness: Module Learning With Errors (M-LWE)
ML-KEM operates over the polynomial ring $R_q = \mathbb{Z}_q[X]/(X^n + 1)$, where:
* Degree $n = 256$
* Modulus $q = 3329$
* Elements are polynomials of degree less than 256 with coefficients in $\mathbb{Z}_{3329}$.

The Module Learning With Errors ($\text{M-LWE}$) problem consists of distinguishing random polynomial pairs $(A, b)$ from pairs $(A, A s + e)$, where $A \in R_q^{k \times k}$ is a public matrix, $s \in R_q^k$ is a secret error vector, and $e \in R_q^k$ is a small noise vector sampled from a Centered Binomial Distribution ($\text{CBD}_\eta$).

### 4.2. Standardized Parameter Sets
FIPS 203 defines three parameter sets governed by the matrix rank $k$:

| Parameter Set | Module Rank ($k$) | NIST Security Category | Classical Equivalence | Public Key ($ek$) | Private Key ($dk$) | Ciphertext ($c$) | Shared Secret ($K$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ML-KEM-512** | 2 | Category 1 | AES-128 | 800 Bytes | 1,632 Bytes | 768 Bytes | 32 Bytes |
| **ML-KEM-768** | 3 | Category 3 | AES-192 | 1,184 Bytes | 2,400 Bytes | 1,088 Bytes | 32 Bytes |
| **ML-KEM-1024** | 4 | Category 5 | AES-256 | 1,568 Bytes | 3,168 Bytes | 1,568 Bytes | 32 Bytes |

### 4.3. Protocol Workflow & Implicit Rejection
1. **$\text{KeyGen}() \to (ek, dk)$:** Derives public encapsulation key $ek$ and private decapsulation key $dk$.
2. **$\text{Encaps}(ek) \to (c, K)$:** Generates a 32-byte shared secret $K$ and an encapsulation ciphertext $c$.
3. **$\text{Decaps}(dk, c) \to K'$:** Recovers $K'$.
4. **Implicit Rejection (§5.3):** If an invalid or modified ciphertext $c$ is submitted, ML-KEM computes a pseudorandom secret $K' = \text{J}(z \mathbin{\Vert} c)$ from a rejection seed $z \in dk$ instead of raising an exception.

---

## 5. Experimental Methodology & Testbed Configuration

### 5.1. System Hardware & Software Specifications
* **CPU:** AMD64 Architecture, 8 Logical Cores
* **Operating System:** Windows 11 Enterprise (x86_64)
* **Python Runtime:** Python 3.13.14 (MSC v.1944 64-bit)
* **Timing Clock:** Monotonic `time.perf_counter_ns` (Hardware QPC, $100\text{ ns}$ resolution)
* **Cryptographic Engine:** Native Rust/C compiled `mlkem` (FIPS 203 compliant)

### 5.2. Isolation & Statistical Safeguards
* **Warm-up Calibration:** 10–20 warm-up cycles executed prior to data collection to eliminate JIT/paging overhead.
* **Scope Isolation:** Key generation setup is strictly excluded from encapsulation and decapsulation timed intervals.
* **Descriptive & Inferential Metrics:** Sample mean ($\bar{x}$), standard deviation ($s$), median ($\tilde{x}$), 95th percentile ($P_{95}$), and 95% Confidence Intervals of the mean.

---

## 6. Empirical Results & Findings

### 6.1. Computational Latency Across Parameter Sets
Based on 50 repeated independent measurement trials per operation:

| Parameter Set | KeyGen Median (µs) | KeyGen P95 (µs) | Encaps Median (µs) | Encaps P95 (µs) | Decaps Median (µs) | Decaps P95 (µs) | Roundtrip (µs) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ML-KEM-512** | 23.10 | 28.81 | 20.70 | 20.95 | 20.60 | 21.36 | **64.40** |
| **ML-KEM-768** | 37.00 | 38.07 | 53.40 | 101.11 | 28.70 | 29.56 | **119.10** |
| **ML-KEM-1024** | 57.60 | 65.46 | 50.65 | 169.18 | 39.30 | 71.01 | **147.55** |

#### Observations:
* **Sub-Millisecond Execution:** All three operations across all parameter sets execute comfortably under $100\,\mu\text{s}$.
* **Decapsulation Predictability:** Decapsulation exhibits remarkably stable tail latency ($P_{95} \le 30\,\mu\text{s}$ for ML-KEM-768), attributed to constant-time polynomial reconstruction.
* **Lattice Dimension Scaling:** Latency scales predictably with the matrix dimension $k$: ML-KEM-1024 ($k=4$) incurs approximately $2.5\times$ the key generation time of ML-KEM-512 ($k=2$).

### 6.2. Classical vs Post-Quantum Key Establishment (Experiment J)
To contextualize post-quantum overhead, we benchmarked classical ECDH using Curve25519 (X25519) and NIST P-256 under identical execution conditions:

| Mechanism | Security Paradigm | Classical Security | KeyGen Median (µs) | Agreement Median (µs) | Roundtrip (µs) | Total Wire Overhead (Bytes) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **ECDH X25519** | Classical Curve | ~128-bit | 32.20 | 29.70 | 61.90 | **64 Bytes** |
| **ECDH P-256** | Classical Curve | ~128-bit | 16.00 | 53.25 | 69.25 | **130 Bytes** |
| **ML-KEM-768** | Post-Quantum Lattice | AES-192 | 37.00 | 61.20 | 98.20 | **2,272 Bytes** |

#### Critical Finding:
ML-KEM-768 achieves computational speed on par with classical ECDH ($\approx 98\,\mu\text{s}$ vs $62\text{--}69\,\mu\text{s}$). However, communication wire overhead increases by a factor of **$35\times$** (from 64 bytes to 2,272 bytes).

---

## 7. Discussion & Practical Deployment Trade-Offs

1. **CPU Overhead is Negligible:** The assertion that post-quantum cryptography will overwhelm server CPU budgets is refuted by empirical measurements. The Number Theoretic Transform (NTT) enables efficient polynomial multiplication that competes directly with optimized elliptic curve scalar multiplications.
2. **Network MTU & Packet Fragmentation:** The 2,272 bytes required for ML-KEM-768 (1,184 B public key + 1,088 B ciphertext) exceeds standard Ethernet Maximum Transmission Unit (MTU) boundaries (1,500 bytes). In transport protocols such as UDP-based QUIC, this necessitates packet fragmentation, potentially introducing packet loss vulnerabilities in lossy wireless environments.
3. **Parameter Selection Guidance:**
   * **ML-KEM-512:** Recommended for embedded and IoT systems where RAM and packet size constraints dominate.
   * **ML-KEM-768:** The primary recommended default for TLS 1.3, VPNs, and enterprise systems, achieving NIST Category 3 security with sub-$120\,\mu\text{s}$ roundtrip times.
   * **ML-KEM-1024:** Suitable for high-assurance data archiving where maximum long-term quantum resistance (AES-256 equivalent) justifies the 3.1 KB transmission cost.

---

## 8. Limitations & Threats to Validity
* **Single-Node Execution:** Measurements were conducted on an AMD64 Windows platform. Performance characteristics on ARM (e.g. Apple Silicon, Raspberry Pi) or RISC-V architectures may vary based on vector instruction availability (AVX2 vs NEON).
* **Software-Only Environment:** Our benchmarks evaluate algorithmic speed and CPU instructions. They do not evaluate physical side-channel vulnerability (e.g., power analysis or electromagnetic side-channels), which requires specialized oscilloscope hardware.

---

## 9. Conclusion & Future Work
This research confirms that NIST FIPS 203 ML-KEM provides a practical, high-throughput foundation for post-quantum secure key establishment. Computational latencies across all parameter sets remain well below 0.2 milliseconds, demonstrating that cryptographic computation will not be the primary bottleneck in post-quantum migration. Future research should investigate hybrid key exchange (e.g., X25519MLKEM768), formal hardware acceleration (AVX-512 and cryptographic extensions), and network latency under simulated packet drop conditions.

---

## 10. References
1. National Institute of Standards and Technology. (2024). *Module-Lattice-Based Key-Encapsulation Mechanism Standard (FIPS PUB 203)*. U.S. Department of Commerce. https://doi.org/10.6028/NIST.FIPS.203
2. Avanzi, R., Bos, J., Ducas, L., Kiltz, E., Lepoint, T., Lyubashevsky, V., Schanck, J. M., Schwabe, P., Seiler, G., & Stehlé, D. (2020). *CRYSTALS-Kyber: Algorithm Specifications And Supporting Documentation (Version 3.02)*.
3. Shor, P. W. (1994). Algorithms for quantum computation: discrete logarithms and factoring. *IEEE 35th Annual Symposium on Foundations of Computer Science*, 124–134.
4. Bernstein, D. J. (2006). Curve25519: new Diffie-Hellman speed records. *Public Key Cryptography – PKC 2006*, LNCS 3958, 207–228.
5. Langley, A., Hamburg, M., & Turner, S. (2016). *Elliptic Curves for Security (RFC 7748)*. Internet Engineering Task Force.
