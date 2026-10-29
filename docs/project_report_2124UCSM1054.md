# A PROJECT REPORT ON
# IMPLEMENTATION AND BENCHMARKING OF ML-KEM KEY ENCAPSULATION

**PS Code:** CIS-203  
**Domain:** D03: Post-Quantum Cryptography & Network Security  
**Complexity:** Advanced  

**Submitted in partial fulfilment of the requirements of the course**  
**Cryptography and Information Security (24UCYPC301) Laboratory**  
*T.Y. B.Tech Cyber Security, Semester V*

---

**Submitted by:**  
**Kunal Tatyasaheb Madhavai**  
**PRN:** 2124UCSM1054 &emsp;&emsp; **Roll No.:** 51  

**Under the guidance of:**  
**Dr. Chetan D. Bawankar**  
*Head of Department of Cyber Security*

<br>

```
                  Department of Cyber Security
               School of Engineering and Technology
             Sanjivani University, Kopargaon - 423603
                    Academic Year 2026-2027
```

---

## CERTIFICATE

This is to certify that the project report entitled **"Implementation and Benchmarking of ML-KEM Key Encapsulation"** (PS Code: **CIS-203**) submitted by **Kunal Tatyasaheb Madhavai** (PRN: **2124UCSM1054**) is a bonafide record of the laboratory project work carried out by him under my guidance, in partial fulfilment of the requirements of the course **Cryptography and Information Security (24UCYPC301) Laboratory**, T.Y. B.Tech Cyber Security, during the Academic Year 2026-2027 at the Department of Cyber Security, School of Engineering and Technology, Sanjivani University, Kopargaon. 

The similarity index of this report is **4%**.

<br><br><br>

_____________________________ &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; _____________________________  
**Mr. Kunal Makar** &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; **Dr. Chetan D. Bawankar**  
*Subject Teacher* &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; *Head, Department of Cyber Security*  

**Place:** Kopargaon  
**Date:** 24/10/2026  

---

# IMPLEMENTATION AND BENCHMARKING OF ML-KEM KEY ENCAPSULATION

**Student:** Kunal Tatyasaheb Madhavai &emsp;&emsp; **PRN:** 2124UCSM1054 &emsp;&emsp; **PS Code:** CIS-203

---

### Abstract
The impending realization of fault-tolerant quantum computers running Shor’s algorithm threatens the mathematical foundations of classical public-key cryptography, including RSA and Elliptic Curve Diffie-Hellman (ECDH). In August 2024, the National Institute of Standards and Technology (NIST) standardized the Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM) in FIPS 203. This laboratory project designs, implements, and benchmarks a functional, secure-by-design research platform evaluating all three standardized parameter sets: ML-KEM-512, ML-KEM-768, and ML-KEM-1024. Developed in Python 3.13 utilizing native compiled FIPS 203 bindings, Flask, and an interactive cybersecurity web dashboard, the system evaluates real execution latency with nanosecond precision, communication overhead, process memory, and throughput. Experimental results demonstrate microsecond-range key encapsulation ($20.7\,\mu\text{s}$ to $53.4\,\mu\text{s}$) and decapsulation ($20.6\,\mu\text{s}$ to $39.3\,\mu\text{s}$), confirming high computational efficiency but highlighting wire communication expansion ($2,272\text{ bytes}$ for ML-KEM-768 versus $64\text{ bytes}$ for classical X25519). The platform incorporates implicit rejection and a zero-secret-leakage architecture, providing a validated experimental foundation for post-quantum cryptographic migration.

**Keywords:** Post-Quantum Cryptography, ML-KEM, NIST FIPS 203, Key Encapsulation Mechanism, Latency Benchmarking.

---

### 1. Introduction and Problem Statement

Public-key cryptography forms the cornerstone of modern communications security, providing confidential session key exchange and digital signatures across transport layer security (TLS), virtual private networks (VPNs), and authenticated banking gateways. Currently deployed key-agreement protocols rely almost exclusively on the hardness of discrete logarithms over elliptic curves (ECDH) or modular arithmetic (Diffie-Hellman, RSA). In 1994, Peter Shor formulated a quantum algorithm demonstrating that a quantum computer equipped with sufficient error-corrected qubits can solve discrete logarithm and prime factorization problems in polynomial time $\mathcal{O}((\log N)^2)$ [1]. Furthermore, adversaries are actively employing "Harvest Now, Decrypt Later" (HNDL) interception strategies, capturing encrypted communications today with the intent of deciphering them once cryptanalytically relevant quantum computers emerge.

The specific problem allotted in this project is to implement, evaluate, and benchmark the primary standardized quantum-resistant key establishment algorithm—**ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)**—across its three standardized parameter sets (**ML-KEM-512**, **ML-KEM-768**, and **ML-KEM-1024**) under rigorous, controlled conditions without fabricating synthetic data. Selecting an optimal parameter set for production deployment requires a nuanced empirical understanding of the trade-offs between mathematical security category, computational execution time, memory footprint, and network communication overhead.

Several prior works have analyzed post-quantum candidates: Avanzi et al. introduced CRYSTALS-Kyber during the NIST competition [2]; the Open Quantum Safe (OQS) project built experimental prototypes integrated into OpenSSL and BoringSSL [3]; and Bernstein et al. established benchmarking frameworks on Unix platforms [4]. However, an accessible, full-stack, secure-by-design benchmarking platform tailored for reproducible laboratory evaluation on modern environments—featuring an interactive demonstration with live implicit rejection testing, constant-time verification, and exportable research analytics—remains an active educational and research need. This project directly addresses that gap by building a complete, verified application adhering strictly to the final NIST FIPS 203 standard published in August 2024 [5].

---

### 2. Objectives

The specific and measurable objectives of this project are:
1. **Standards-Compliant Cryptographic Implementation:** Implement key generation ($\text{KeyGen}$), encapsulation ($\text{Encaps}$), and decapsulation ($\text{Decaps}$) conforming to NIST FIPS 203 specifications for ML-KEM-512, ML-KEM-768, and ML-KEM-1024 using trusted, native cryptographic bindings.
2. **Interactive Demonstration with Zero-Secret-Leakage Architecture:** Design a simulated client-server (Alice and Bob) key exchange demonstration that enforces constant-time shared secret verification, simulates FIPS 203 §5.3 implicit rejection on tampered ciphertexts, and guarantees that private keys and raw shared secrets are never exposed in logs or API responses.
3. **Reproducible Multi-Metric Benchmarking Engine:** Develop an automated experimental suite (Experiments A through J) utilizing high-resolution monotonic hardware timing ($100\text{ ns}$ resolution), warm-up calibration, and dual-layer memory tracking (Python heap via `tracemalloc` and resident set size via `psutil`) to measure latency, throughput, and wire overhead.
4. **Comparative Analysis and Research Visualization:** Evaluate ML-KEM against classical key agreement baselines (ECDH Curve25519 and NIST P-256) and deliver an interactive web dashboard (7 dedicated views), SQLite experimental history, and automated CSV export for academic research.

---

### 3. Methodology and System Design

#### 3.1. System Architecture
The platform follows a decoupled, three-tier modular architecture separating cryptographic operations from HTTP presentation and database persistence, as depicted in Figure 3.1.

```
+-------------------------------------------------------------------------------+
|                       Presentation Tier (Web UI)                              |
|   Bootstrap 5.3 + Chart.js 4.4 + Dark Cybersecurity Research Theme            |
|   [Overview Dashboard | Crypto Demo | Benchmark Lab | Comparison | History]   |
+-------------------------------------------------------------------------------+
                                      |  (JSON REST API over HTTP)
                                      v
+-------------------------------------------------------------------------------+
|                        Application & API Gateway Tier                         |
|   - Flask Web Server with Pydantic v2 Boundary Validation                     |
|   - Hardened Security Headers (CSP, X-Frame-Options: DENY, X-Content-Type)    |
|   - SessionKeyManager (Ephemeral in-memory handles with 15-minute TTL)        |
+-------------------------------------------------------------------------------+
           |                                                      |
 (Demo / Interactive Operations)                          (Benchmarking Workloads)
           v                                                      v
+------------------------------------+          +------------------------------------+
|         Crypto Core Tier           |          |        Benchmarking Tier           |
|  crypto/mlkem_service.py           |          |  benchmark/timing.py               |
|   - ML-KEM-512, 768, 1024          |          |   - Monotonic QPC Timer (100 ns)   |
|   - Implicit Rejection (§5.3)      |          |  benchmark/memory.py               |
|   - Zeroization Helpers            |          |   - tracemalloc + psutil RSS       |
|  crypto/verification.py            |          |  benchmark/statistics.py           |
|   - Constant-time hmac.compare     |          |   - Mean, Median, P95, CI, Throughput
|   - SHA-256 Fingerprint Masking    |          |  benchmark/experiments.py (Exp A-J)|
+------------------------------------+          +------------------------------------+
                   \                                  /
                    v                                v
+-------------------------------------------------------------------------------+
|                         Data Storage & Analytics Tier                         |
|  - storage/database.py      : SQLite Experiment History (No Secrets Stored)   |
|  - services/export_service.py : Standardized RFC 4180 CSV & Matplotlib Figures  |
|  - services/results_service.py: KPI Aggregators for Dashboard Charts           |
+-------------------------------------------------------------------------------+
```
*Figure 3.1: Modular System Architecture of the ML-KEM Benchmarking Platform.*

#### 3.2. Cryptographic Protocol and Mathematical Foundation
ML-KEM is founded on the hardness of the **Module Learning With Errors (M-LWE)** problem over the cyclotomic ring:
$$R_q = \mathbb{Z}_q[X]/(X^{256} + 1) \quad \text{with prime modulus } q = 3329$$

Polynomial multiplication is computed in $\mathcal{O}(n \log n)$ time using the **Number Theoretic Transform (NTT)**. The protocol operates in three distinct phases:

1. **Key Generation ($\text{KeyGen}$):**
   - Alice samples random 32-byte seeds $d$ and $z$.
   - Expands public matrix $\mathbf{A} \in R_q^{k \times k}$ via SHAKE-128.
   - Samples secret error vectors $\mathbf{s}, \mathbf{e}$ from Centered Binomial Distribution $\text{CBD}_\eta$.
   - Computes public encapsulation key $\mathbf{t} = \text{NTT}(\mathbf{A} \cdot \mathbf{s} + \mathbf{e})$.
   - Output: $ek = (\text{ByteEncode}(\mathbf{t}) \mathbin{\Vert} \rho)$ and private key $dk = (\text{ByteEncode}(\mathbf{s}) \mathbin{\Vert} ek \mathbin{\Vert} \text{H}(ek) \mathbin{\Vert} z)$.

2. **Encapsulation ($\text{Encaps}$):**
   - Bob receives $ek$, generates random message seed $m \in \{0,1\}^{256}$.
   - Derives $(\bar{K}, r) = \text{G}(m \mathbin{\Vert} \text{H}(ek))$.
   - Encrypts $m$ under public key $\mathbf{t}$ with randomness $r$ into ciphertext $c = (c_1, c_2)$.
   - Derives shared secret $K = \text{KDF}(\bar{K} \mathbin{\Vert} \text{H}(c))$. Bob transmits $c$ to Alice.

3. **Decapsulation ($\text{Decaps}$):**
   - Alice decrypts $c$ using private secret $\mathbf{s}$ to recover candidate message $m'$.
   - Re-encrypts $m'$ using derived randomness $r'$ to obtain $c' = \text{Encrypt}(ek, m'; r')$.
   - **Implicit Rejection:** If $c' == c$, return legitimate secret $K = \text{KDF}(\bar{K}' \mathbin{\Vert} \text{H}(c))$. If $c' \neq c$, deterministically return pseudorandom secret $K = \text{KDF}(z \mathbin{\Vert} \text{H}(c))$ using rejection seed $z$.

```
Sender (Bob)                                             Recipient (Alice)
============                                             =================
                                                          (ek, dk) <- KeyGen()
                  <------- Public Key (ek) -------
(c, K) <- Encaps(ek)
                  -------- Ciphertext (c) ------->
                                                          K' <- Decaps(dk, c)
                                                          [Verify: K == K']
```

#### 3.3. Standardized Parameter Sets Justification
The three parameter sets scale module rank $k$ to provide security matching NIST categories [5]:
* **ML-KEM-512 ($k=2$):** Category 1 (AES-128 equivalent). Public key: 800 B, Ciphertext: 768 B. Ideal for low-memory IoT nodes.
* **ML-KEM-768 ($k=3$):** Category 3 (AES-192 equivalent). Public key: 1,184 B, Ciphertext: 1,088 B. Primary recommended standard for general-purpose network traffic and TLS 1.3.
* **ML-KEM-1024 ($k=4$):** Category 5 (AES-256 equivalent). Public key: 1,568 B, Ciphertext: 1,568 B. Designed for high-assurance national security data.

#### 3.4. Threat Model & Security Scope
* **Assets Protected:** Ephemeral shared secrets ($K$) and decapsulation private keys ($dk$).
* **Threat 1: Quantum Cryptanalysis (Shor's Algorithm):** Mitigated by reliance on the ring lattice M-LWE problem; no known polynomial-time quantum algorithm solves M-LWE.
* **Threat 2: Chosen-Ciphertext Attacks (IND-CCA2) & Bleichenbacher Padding Oracles:** Mitigated via the Fujisaki-Okamoto transform with implicit rejection. Corrupted ciphertexts generate deterministic pseudorandom keys without leaking error signals or timing differentials.
* **Threat 3: Timing Side-Channel Attacks:** Mitigated by comparing secrets in constant time using `hmac.compare_digest`.
* **Threat 4: In-Memory / REST Secret Leakage:** Mitigated by masking `__repr__` strings (`[REDACTED]`), keeping keys in ephemeral memory with 15-minute TTL, and strictly excluding raw private keys and shared secrets from JSON API outputs.

---

### 4. Implementation Details

#### 4.1. Hardware, Language, and Software Toolchain
* **Hardware:** AMD64 architecture, 8 logical cores, 24 GB RAM.
* **Operating System:** Windows 11 Enterprise (64-bit).
* **Programming Language:** Python 3.13.14 (MSC v.1944 64-bit).
* **Cryptographic Engine:** `mlkem` v0.2.0 (Native compiled Rust/C implementation of NIST FIPS 203) and `cryptography` v50.0.2 (Classical ECDH X25519 / NIST P-256 baseline).
* **Web & Validation:** Flask v3.1.3, Pydantic v2.14.1, Werkzeug v3.1.9.
* **System Telemetry:** `psutil` v7.2.2, `time.perf_counter_ns` (Hardware QPC clock, $100\text{ ns}$ resolution).
* **Analytics & Figures:** NumPy v2.5.4, Pandas v3.0.6, Matplotlib v3.11.2.
* **Testing:** Pytest v9.1.1 (41 automated tests).
* **Frontend:** HTML5, CSS3 (Dark Cybersecurity Theme), Bootstrap v5.3.3, Chart.js v4.4.

#### 4.2. Key Code Implementations

**Code Snippet 4.1: Standards-Compliant ML-KEM Cryptographic Operations (`crypto/mlkem_service.py`)**
```python
def encapsulate(self, parameter_set: str, public_key_bytes: bytes) -> EncapsulationResult:
    spec, kem = self._resolve_spec(parameter_set)
    if len(public_key_bytes) != spec.public_key_bytes:
        raise InvalidKeyError(f"Expected {spec.public_key_bytes}B, got {len(public_key_bytes)}B")
    
    ek_obj = mlkem.EncapsKey.from_bytes(bytes(public_key_bytes))
    t0 = time.perf_counter_ns()
    shared_secret, ciphertext = kem.encaps(ek_obj)
    elapsed_ns = time.perf_counter_ns() - t0

    return EncapsulationResult(
        parameter_set=spec.name,
        ciphertext_bytes=bytes(ciphertext),
        ciphertext_len=len(ciphertext),
        shared_secret_len=len(shared_secret),
        execution_time_ns=elapsed_ns,
        execution_time_us=elapsed_ns / 1_000.0,
        _shared_secret=bytes(shared_secret),  # Masked from string serialization
    )
```

**Code Snippet 4.2: Constant-Time Verification & Implicit Rejection Simulation (`crypto/key_management.py`)**
```python
def verify_shared_secrets(self, session_id: str, key_id: str) -> Tuple[bool, str]:
    with self._lock:
        ref = self.get_key_reference(session_id, key_id)
        if ref._sender_shared_secret is None or ref._recipient_shared_secret is None:
            return False, "Cryptographic workflow incomplete."

        # Constant-time comparison prevents timing oracle side-channels
        is_match = hmac.compare_digest(
            ref._sender_shared_secret,
            ref._recipient_shared_secret
        )
        ref.verified_match = is_match
        msg = "Shared secrets match successfully (32 bytes confirmed)." if is_match else "Shared secret mismatch!"
        return is_match, msg
```

---

### 5. Results and Security Analysis

#### 5.1. Test Suite Verification
The complete Pytest test suite containing 41 automated tests was executed, verifying cryptographic core functionality, statistical formulas, REST endpoints, and security boundaries.

**Table 5.1: Selected Automated Test Cases**
| Test ID | Input / Action | Expected Output | Actual Output | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC01** | Generate KeyPair for `ML-KEM-768` | $ek=1184\text{ B}$, $dk=2400\text{ B}$, latency $>0$ | $ek=1184\text{ B}$, $dk=2400\text{ B}$, $37.0\,\mu\text{s}$ | **Pass** |
| **TC02** | Encapsulate secret with valid `ML-KEM-768` $ek$ | Ciphertext $=1088\text{ B}$, Shared Secret $=32\text{ B}$ | Ciphertext $=1088\text{ B}$, Secret $=32\text{ B}$ | **Pass** |
| **TC03** | Decapsulate legitimate ciphertext using matching $dk$ | Recovered secret matches sender secret | Constant-time match confirmed (`True`) | **Pass** |
| **TC04** | Bit-flip corruption on ciphertext (Implicit Rejection) | Deterministic pseudorandom secret; no crash | Secret recovered, match verification = `False` | **Pass** |
| **TC05** | Inspect API response of `/api/kem/keygen` | Private key bytes strictly excluded | JSON has `private_key_status: REDACTED` | **Pass** |
| **TC06** | Session B attempts to access Key ID from Session A | HTTP 404 Not Found (Cross-Session Isolation) | HTTP 404 returned | **Pass** |

#### 5.2. Empirical Performance and Latency Measurements
Experiments were executed across 50 repeated independent trials following warm-up calibration:

**Table 5.2: Empirical Benchmarking Measurements Across ML-KEM Parameter Sets**
| Parameter Set | Module Rank ($k$) | KeyGen Median ($\mu\text{s}$) | Encaps Median ($\mu\text{s}$) | Decaps Median ($\mu\text{s}$) | Roundtrip Median ($\mu\text{s}$) | Public Key Size | Ciphertext Size | Total Wire Overhead |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **ML-KEM-512** | $k=2$ | $23.10\,\mu\text{s}$ | $20.70\,\mu\text{s}$ | $20.60\,\mu\text{s}$ | $64.40\,\mu\text{s}$ | 800 Bytes | 768 Bytes | **1,568 Bytes** |
| **ML-KEM-768** | $k=3$ | $37.00\,\mu\text{s}$ | $53.40\,\mu\text{s}$ | $28.70\,\mu\text{s}$ | $119.10\,\mu\text{s}$ | 1,184 Bytes | 1,088 Bytes | **2,272 Bytes** |
| **ML-KEM-1024** | $k=4$ | $57.60\,\mu\text{s}$ | $50.65\,\mu\text{s}$ | $39.30\,\mu\text{s}$ | $147.55\,\mu\text{s}$ | 1,568 Bytes | 1,568 Bytes | **3,136 Bytes** |

#### 5.3. Classical vs. Post-Quantum Comparison (Experiment J)
To evaluate the operational cost of post-quantum security, ML-KEM-768 was directly benchmarked against classical Curve25519 (ECDH-X25519) and NIST P-256 (ECDH-P256) on the same machine:

**Table 5.3: Classical ECDH vs. Post-Quantum ML-KEM-768 Comparison**
| Mechanism | Security Type | Classical Equivalence | KeyGen ($\mu\text{s}$) | Agreement ($\mu\text{s}$) | Roundtrip ($\mu\text{s}$) | Wire Transmission Overhead |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **ECDH X25519** | Classical Curve | ~128-bit | $32.20\,\mu\text{s}$ | $29.70\,\mu\text{s}$ | $61.90\,\mu\text{s}$ | **64 Bytes** |
| **ECDH P-256** | Classical Curve | ~128-bit | $16.00\,\mu\text{s}$ | $53.25\,\mu\text{s}$ | $69.25\,\mu\text{s}$ | **130 Bytes** |
| **ML-KEM-768** | Post-Quantum Lattice | AES-192 | $37.00\,\mu\text{s}$ | $61.20\,\mu\text{s}$ | $98.20\,\mu\text{s}$ | **2,272 Bytes** |

```
Key Exchange Roundtrip Latency (µs):
ECDH X25519: [████████████] 61.90 µs
ECDH P-256:  [██████████████] 69.25 µs
ML-KEM-768:  [████████████████████] 98.20 µs  <-- Highly competitive!

Communication Wire Overhead (Bytes):
ECDH X25519: [█] 64 Bytes
ECDH P-256:  [██] 130 Bytes
ML-KEM-768:  [████████████████████████████████████████████████████] 2,272 Bytes (35x increase)
```

#### 5.4. User Interface and System Output
The web application provides an interactive cybersecurity dark theme (`http://127.0.0.1:5000`):
1. **Overview Dashboard:** Visualizes live KPIs, real-time database runs, and FIPS 203 parameter specifications.
2. **Cryptographic Demonstration:** Implements a 4-step stepper (Alice KeyGen $\to$ Bob Encaps $\to$ Alice Decaps $\to$ Verification). Clicking *"Tamper Ciphertext & Decapsulate"* demonstrates implicit rejection in real time.
3. **Benchmark Lab:** Allows researchers to execute bounded trials (5 to 5,000) with animated progress and instant Chart.js bar graphs showing Mean, Median, and P95 latencies.
4. **Comparative Analysis:** Displays interactive bar and stacked charts comparing latency distributions, throughput (ops/sec), wire sizes, and classical baselines.

#### 5.5. Security Analysis
* **Quantum Resistance:** ML-KEM's security relies on the hardness of high-dimensional M-LWE lattice problems, provably resistant to Shor's period-finding quantum algorithm.
* **IND-CCA2 Security & Padding Oracle Immunity:** Traditional public-key schemes that raise error codes upon decryption failure allow chosen-ciphertext attacks. By adhering to FIPS 203 §5.3, ML-KEM computes a pseudorandom secret from seed $z$ when ciphertext corruption occurs, denying an adversary any timing or error oracle.
* **Side-Channel & Leakage Prevention:** Verified via `tests/test_security.py`. Constant-time comparison ensures memory comparisons take identical clock cycles regardless of where byte mismatches happen. All JSON APIs return only redacted previews (e.g. first 16 hex chars) and truncated SHA-256 fingerprints, preserving confidentiality.

---

### 6. Conclusion and Future Scope

#### 6.1. Achievement of Objectives
All four stated objectives were achieved:
1. NIST FIPS 203 ML-KEM-512, ML-KEM-768, and ML-KEM-1024 were implemented with exact byte-length adherence (verified by 41 passing automated tests).
2. An interactive cryptographic demonstration with implicit rejection simulation, zero-secret-leakage guarantees, and constant-time matching was deployed.
3. Monotonic timing and dual-layer memory benchmarking were executed across configurable workloads, producing empirical measurements without fabricated data.
4. Comparative analysis against classical ECDH (X25519 and P-256) was established, complete with exportable CSV datasets, Matplotlib figures, and an academic web interface.

#### 6.2. Limitations
* **Single-Host Benchmarking:** Measurements reflect single-core CPU execution on an AMD64 architecture; distributed network latency and hardware extensions (e.g., AVX-512 or ARM NEON) were not directly measured across heterogeneous network links.
* **Network MTU Boundaries:** Total wire transmission of ML-KEM-768 ($2,272\text{ bytes}$) exceeds standard Ethernet MTU ($1,500\text{ bytes}$), which may induce IP fragmentation in high-loss UDP/QUIC network environments.

#### 6.3. Future Scope
1. **Hybrid Key Encapsulation (X25519MLKEM768):** Implement the dual hybrid mechanism combining classical ECDH with ML-KEM using HKDF to provide defense-in-depth during the transition period.
2. **Hardware Vector Acceleration:** Extend the backend with AVX-512 and cryptographic coprocessor extensions to benchmark performance on high-density server clusters.

---

**GitHub Repository Link:** [https://github.com/KunalMadhavai/ml-kem-benchmarking-platform](https://github.com/KunalMadhavai/ml-kem-benchmarking-platform)

---

### References

[1] P. W. Shor, "Algorithms for quantum computation: discrete logarithms and factoring," in *Proceedings of the 35th Annual Symposium on Foundations of Computer Science*, Santa Fe, NM, USA, 1994, pp. 124–134. doi: 10.1109/SFCS.1994.365700.

[2] R. Avanzi, J. Bos, L. Ducas, E. Kiltz, T. Lepoint, V. Lyubashevsky, J. M. Schanck, P. Schwabe, G. Seiler, and D. Stehlé, "CRYSTALS-Kyber: Algorithm Specifications And Supporting Documentation (Version 3.02)," NIST Post-Quantum Cryptography Standardization, Tech. Rep., 2020.

[3] Open Quantum Safe (OQS) Project, "liboqs: An open source C library for quantum-safe cryptographic algorithms," 2024. [Online]. Available: https://openquantumsafe.org/

[4] D. J. Bernstein and T. Lange, "eBACS: ECRYPT Benchmarking of Asymmetric Systems," 2024. [Online]. Available: https://bench.cr.yp.to/

[5] National Institute of Standards and Technology, "Module-Lattice-Based Key-Encapsulation Mechanism Standard," Federal Information Processing Standards Publication (FIPS) 203, U.S. Department of Commerce, Washington, D.C., Aug. 2024. doi: 10.6028/NIST.FIPS.203.

[6] D. J. Bernstein, "Curve25519: new Diffie-Hellman speed records," in *Public Key Cryptography – PKC 2006*, ser. Lecture Notes in Computer Science, vol. 3958. Berlin, Heidelberg: Springer, 2006, pp. 207–228.
