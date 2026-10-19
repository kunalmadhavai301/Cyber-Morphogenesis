# Security Architecture & Safeguards Documentation

## ML-KEM Key Encapsulation Platform (NIST FIPS 203)

### 1. Zero-Secret-Leakage Guarantee

The primary architectural mandate of this platform is to ensure that sensitive cryptographic material—namely private decapsulation keys ($dk$) and established shared secrets ($K$)—is never exposed through ordinary user interfaces, REST API responses, or system log files.

#### 1.1. Data-at-Rest and Persistence Controls
* **No Disk Persistence of Keys:** Ephemeral demonstration keys and benchmark keys are stored exclusively in temporary RAM buffers. No private key bytes or shared secrets are written to the SQLite database or filesystem.
* **Database Isolation:** The SQLite database stores only operational metadata: experiment IDs, hardware specs, trial counts, and statistical latency numbers.

#### 1.2. In-Memory Masking & Representation
* **Explicit `__repr__` & `__str__` Masking:** The dataclasses `KeyPairResult`, `EncapsulationResult`, `DecapsulationResult`, and `KeyReference` implement custom representation methods that unconditionally redact secret attributes:
  ```python
  def __repr__(self) -> str:
      return f"KeyPairResult(param={self.parameter_set}, ek_len={self.public_key_len}B, dk_len={self.private_key_len}B, private_key=[REDACTED])"
  ```
* **Memory Buffer Zeroization:** Helper `MLKEMService.zeroize()` is provided to overwrite sensitive bytearrays with null bytes prior to deallocation.

#### 1.3. API Response Sanitization
* The REST endpoints `/api/kem/keygen`, `/api/kem/encapsulate`, and `/api/kem/decapsulate` return only safe metadata:
  - Public key length and preview of first 16 hex bytes.
  - Ciphertext length and preview of first 16 hex bytes.
  - Latency measurements in microseconds.
  - Secret status string: `"Hidden (32 bytes established)"`.
* The verification endpoint `/api/kem/verify` performs comparison strictly in server memory, returning only a boolean match status and a truncated SHA-256 fingerprint:
  ```python
  fingerprint = hashlib.sha256(secret).hexdigest()[:12]  # Non-revealing visual proof
  ```

---

### 2. Side-Channel Protections

#### 2.1. Constant-Time Secret Verification
Timing variations during secret key comparisons can leak information regarding byte positioning. All shared secret comparisons in `KeyManager` and `CryptoVerifier` strictly use:
```python
hmac.compare_digest(secret_a, secret_b)
```
This guarantees constant-time execution regardless of where differences occur.

#### 2.2. Implicit Rejection (Bleichenbacher Oracle Mitigation)
In compliance with NIST FIPS 203 Section 5.3, decapsulation of an invalid ciphertext does not throw an observable error or leak a timing oracle. Instead, the implementation deterministically returns a pseudorandom key derived from a secret rejection seed:
$$K' = \text{J}(z \mathbin{\Vert} c)$$
Attackers cannot distinguish between an invalid ciphertext and a successful decapsulation based on server timing or error codes.

---

### 3. Session Isolation & Boundary Controls

* **Session Token Isolation:** Keys generated in Session A are assigned an unguessable UUID4/token handle. Clients in Session B attempting to encapsulate, decapsulate, or inspect Session A keys receive a `404 Not Found` response.
* **Automatic TTL Expiration:** Inactive sessions and keys automatically expire after `SESSION_KEY_TTL_SECONDS = 900` (15 minutes).
* **Workload Bounds:** Benchmark parameters are strictly validated via Pydantic v2 schemas:
  - Trial count is capped at 10,000 iterations to prevent Denial-of-Service (DoS) and memory exhaustion.
  - Warm-up count is bounded at 500 iterations.
  - Parameter sets are restricted to a strict whitelist: `ML-KEM-512`, `ML-KEM-768`, `ML-KEM-1024`.

---

### 4. HTTP Security & Browser Hardening

The Flask application enforces defense-in-depth HTTP security headers on all responses:
* `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
* `X-Frame-Options: DENY`: Protects against clickjacking.
* `X-XSS-Protection: 1; mode=block`: Activates cross-site scripting filters.
* `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer leakage.
* `Content-Security-Policy`: Restricts script and style execution sources.

---

### 5. Academic & Research Disclaimer

1. **Performance vs Physical Security:** A benchmark establishes computational speed and operational correctness under controlled software conditions. It does not certify resistance against physical side-channel attacks (e.g., differential power analysis, electromagnetic radiation) or fault injection attacks.
2. **Local Deployment Default:** The platform is configured to bind to `127.0.0.1` (localhost) by default. Deploying to remote production environments requires binding behind a hardened reverse proxy (e.g., Nginx) with TLS termination and mutual authentication.
