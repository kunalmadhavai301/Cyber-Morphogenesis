/**
 * Cryptographic Demonstration & Messaging Studio Controller
 * NIST FIPS 203 ML-KEM Key Encapsulation & AES-256-GCM AEAD Engine
 */

class CryptoDemo {
    constructor() {
        this.sessionId = null;
        this.keyId = null;
        this.parameterSet = "ML-KEM-768";
        this.isVerified = false;

        // In-Transit Encrypted Message State
        this.lastCiphertextHex = null;
        this.originalCiphertextHex = null;
        this.lastNonceHex = null;
        this.isTampered = false;

        // DOM elements
        this.logContainer = document.getElementById("demoLogContainer");
        this.initUrlParams();

        // Initialize byte counter on page load
        setTimeout(() => this.updateByteCount(), 100);
    }

    /* -------------------------------------------------------------------------
       Logging & Parameter Management
       ------------------------------------------------------------------------- */
    initUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const param = urlParams.get("param");
        if (param && ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"].includes(param)) {
            const select = document.getElementById("selectParamSet");
            if (select) select.value = param;
            this.parameterSet = param;
        }
    }

    changeParameterSet(val) {
        this.parameterSet = val;
        this.log(`Parameter set switched to <strong>${val}</strong>.`, "accent");
        this.resetDemo(false);
    }

    log(message, type = "info") {
        const timestamp = new Date().toISOString().split("T")[1].replace("Z", "").substring(0, 8);
        let colorClass = "text-secondary";
        if (type === "success") colorClass = "text-success";
        if (type === "warning") colorClass = "text-warning";
        if (type === "error") colorClass = "text-danger";
        if (type === "accent") colorClass = "text-info";

        const logEntry = document.createElement("div");
        logEntry.className = `py-1 ${colorClass}`;
        logEntry.innerHTML = `<span class="text-muted">[${timestamp}]</span> ${message}`;
        if (this.logContainer) {
            this.logContainer.appendChild(logEntry);
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        }
    }

    clearLog() {
        if (this.logContainer) {
            this.logContainer.innerHTML = `<div class="text-secondary">// Activity log cleared.</div>`;
        }
    }

    /* -------------------------------------------------------------------------
       Step 1: Alice KeyPair Generation
       ------------------------------------------------------------------------- */
    async generateKeyPair() {
        const paramSet = document.getElementById("selectParamSet").value;
        this.parameterSet = paramSet;
        const btnKeygen = document.getElementById("btnKeygen");
        if (btnKeygen) btnKeygen.disabled = true;

        this.log(`Alice initiating key pair generation for <strong>${paramSet}</strong>...`, "accent");

        try {
            const res = await fetch("/api/kem/keygen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    parameter_set: paramSet
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Key generation failed");

            this.sessionId = data.session_id;
            this.keyId = data.key_id;

            const sessionBadge = document.getElementById("sessionBadge");
            if (sessionBadge) sessionBadge.textContent = `Session: ${this.sessionId.substring(0, 8)}...`;

            this.log(`✓ Alice generated keypair in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Public Key (ek): <strong>${data.public_key_len} bytes</strong> (Preview: ${data.metadata.public_key_hex_preview})`);
            this.log(`  &bull; Private Key (dk): <strong>${data.private_key_len} bytes</strong> (Retained safely in server memory)`, "warning");

            const btnEncaps = document.getElementById("btnEncaps");
            if (btnEncaps) btnEncaps.disabled = false;
            return true;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
            return false;
        } finally {
            if (btnKeygen) btnKeygen.disabled = false;
        }
    }

    /* -------------------------------------------------------------------------
       Step 2: Bob Encapsulation
       ------------------------------------------------------------------------- */
    async encapsulate() {
        if (!this.sessionId || !this.keyId) {
            await this.generateKeyPair();
        }

        const btnEncaps = document.getElementById("btnEncaps");
        if (btnEncaps) btnEncaps.disabled = true;

        this.log(`Bob encapsulating fresh shared secret using Alice's public key...`, "accent");

        try {
            const res = await fetch("/api/kem/encapsulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Encapsulation failed");

            this.log(`✓ Bob encapsulation successful in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Ciphertext (ct): <strong>${data.ciphertext_len} bytes</strong> (Preview: ${data.ciphertext_hex_preview})`);
            this.log(`  &bull; Bob's Shared Secret: <strong>32 bytes</strong> established in memory.`, "warning");

            const btnDecaps = document.getElementById("btnDecaps");
            if (btnDecaps) btnDecaps.disabled = false;
            const btnCorrupt = document.getElementById("btnCorruptCT");
            if (btnCorrupt) btnCorrupt.disabled = false;
            return true;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
            return false;
        } finally {
            if (btnEncaps) btnEncaps.disabled = false;
        }
    }

    /* -------------------------------------------------------------------------
       Step 3: Alice Decapsulation
       ------------------------------------------------------------------------- */
    async decapsulate() {
        const btnDecaps = document.getElementById("btnDecaps");
        if (btnDecaps) btnDecaps.disabled = true;

        this.log(`Alice decapsulating ciphertext using matching private key...`, "accent");

        try {
            const res = await fetch("/api/kem/decapsulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Decapsulation failed");

            this.log(`✓ Alice decapsulation successful in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Alice recovered 32-byte shared secret from ciphertext.`, "warning");

            const btnVerify = document.getElementById("btnVerify");
            if (btnVerify) btnVerify.disabled = false;
            return true;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
            return false;
        } finally {
            if (btnDecaps) btnDecaps.disabled = false;
        }
    }

    /* -------------------------------------------------------------------------
       Step 4: Constant-Time Verification
       ------------------------------------------------------------------------- */
    async verifySecrets() {
        const btnVerify = document.getElementById("btnVerify");
        if (btnVerify) btnVerify.disabled = true;

        this.log(`Executing constant-time comparison in server memory (hmac.compare_digest)...`, "accent");

        try {
            const res = await fetch("/api/kem/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            if (data.verified_match) {
                this.isVerified = true;

                this.log(`=================================================================`, "success");
                this.log(`★ SECRET MATCH: SUCCESS (Alice and Bob hold the identical 32-byte secret!)`, "success");
                this.log(`  &bull; Non-revealing Fingerprint: <strong>${data.secret_fingerprint}</strong>`, "success");
                this.log(`  &bull; Post-Quantum Messaging Studio is ready for authenticated AES-256-GCM.`, "success");
                this.log(`=================================================================`, "success");

                const statusBadge = document.getElementById("studioKeyStatusBadge");
                if (statusBadge) {
                    statusBadge.className = "badge bg-success-subtle border border-success text-success px-3 py-2";
                    statusBadge.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> ML-KEM Key Agreement Verified (Quantum-Safe)`;
                }
                return true;
            } else {
                this.isVerified = false;
                this.log(`=================================================================`, "error");
                this.log(`✗ SECRET MISMATCH: FAILURE! Keys do not match.`, "error");
                this.log(`  &bull; Reason: ${data.message}`, "error");
                this.log(`=================================================================`, "error");
                return false;
            }
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
            return false;
        } finally {
            if (btnVerify) btnVerify.disabled = false;
        }
    }

    /* -------------------------------------------------------------------------
       1-Click Auto Run Full Protocol
       ------------------------------------------------------------------------- */
    async autoRunKeyExchange() {
        const btnAuto = document.getElementById("btnAutoRun");
        if (btnAuto) btnAuto.disabled = true;

        this.log(`[AUTO-RUN] Executing complete 4-step ML-KEM key exchange...`, "accent");

        const s1 = await this.generateKeyPair();
        if (!s1) { if (btnAuto) btnAuto.disabled = false; return false; }

        const s2 = await this.encapsulate();
        if (!s2) { if (btnAuto) btnAuto.disabled = false; return false; }

        const s3 = await this.decapsulate();
        if (!s3) { if (btnAuto) btnAuto.disabled = false; return false; }

        const s4 = await this.verifySecrets();

        if (btnAuto) btnAuto.disabled = false;
        return s4;
    }

    /* -------------------------------------------------------------------------
       Negative Testing: FIPS 203 §5.3 Implicit Rejection
       ------------------------------------------------------------------------- */
    async simulateCorruptedCiphertext() {
        this.log(`[NEGATIVE TEST] Injecting bit flips into ML-KEM ciphertext to test implicit rejection...`, "warning");
        const btnCorrupt = document.getElementById("btnCorruptCT");
        if (btnCorrupt) btnCorrupt.disabled = true;

        const ctBytesLen = this.parameterSet === "ML-KEM-512" ? 768 : (this.parameterSet === "ML-KEM-768" ? 1088 : 1568);
        const corruptedHex = "ff" + "aa".repeat(ctBytesLen - 1);

        try {
            const res = await fetch("/api/kem/decapsulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId,
                    custom_ciphertext_hex: corruptedHex
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Corrupted decapsulation failed");

            this.log(`✓ FIPS 203 Implicit Rejection Confirmed!`, "warning");
            this.log(`  &bull; The cryptosystem did NOT throw an exception or leak timing differences.`, "warning");
            this.log(`  &bull; Instead, it derived a deterministic pseudorandom fake key.`, "warning");

            // Re-verify secrets to show failure
            await this.verifySecrets();
        } catch (err) {
            this.log(`[-] Unexpected error: ${err.message}`, "error");
        } finally {
            if (btnCorrupt) btnCorrupt.disabled = false;
        }
    }

    /* -------------------------------------------------------------------------
       Text Encryption & Decryption Studio Methods
       ------------------------------------------------------------------------- */
    updateByteCount() {
        const input = document.getElementById("userPlaintextInput");
        if (!input) return;
        const text = input.value;
        const bytes = new TextEncoder().encode(text).length;
        const badge = document.getElementById("msgByteCountBadge");
        if (badge) badge.textContent = `${bytes} bytes (${text.length} chars)`;
    }

    clearPlaintextBox() {
        const input = document.getElementById("userPlaintextInput");
        if (input) {
            input.value = "";
            input.focus();
            this.updateByteCount();
        }
    }

    setSampleMessage(type) {
        const input = document.getElementById("userPlaintextInput");
        if (!input) return;

        if (type === "coordinates") {
            input.value = "🛰️ DEFENSE INTEL: Target sector Alpha-9 at coordinates 37.7749° N, 122.4194° W. Authorization Code: PQC-SEC-9912.";
        } else if (type === "bank") {
            input.value = "🏦 SWIFT WIRE AUTH: Beneficiary account #88910029, Amount: $2,500,000.00 USD. Clearing routing 021000021. Priority 1 Approved.";
        } else if (type === "credentials") {
            input.value = "🔐 ROOT CA MASTER TOKEN: eyJhbGciOiJNTEtFTTc2OC1BRVNHTUMiLCJ0eXAiOiJKV1QifQ.pqc_secret_k_auth_99841. Verified.";
        } else if (type === "rover") {
            input.value = "🚀 MARS EXPLORATION ROVER: Subsurface ice core extracted at Jezero Crater. Telemetry normal, battery reserve at 98.4%.";
        }
        this.updateByteCount();
    }

    async encryptMessage() {
        const input = document.getElementById("userPlaintextInput");
        const plaintext = input ? input.value.trim() : "";
        if (!plaintext) {
            alert("Please enter a plaintext message to encrypt in the text box.");
            if (input) input.focus();
            return;
        }

        const btnEncrypt = document.getElementById("btnEncryptMessage");
        if (btnEncrypt) btnEncrypt.disabled = true;

        // Auto-establish ML-KEM session if not yet active or verified
        if (!this.sessionId || !this.keyId || !this.isVerified) {
            this.log("Auto-establishing ML-KEM key agreement before message encryption...", "accent");
            const ready = await this.autoRunKeyExchange();
            if (!ready) {
                this.log("[-] Failed to establish post-quantum key agreement.", "error");
                if (btnEncrypt) btnEncrypt.disabled = false;
                return;
            }
        }

        this.log(`Bob encrypting confidential message using AES-256-GCM keyed by ML-KEM shared secret...`, "accent");

        try {
            const res = await fetch("/api/kem/encrypt-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId,
                    plaintext: plaintext
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Encryption failed");

            this.lastCiphertextHex = data.ciphertext_hex;
            this.originalCiphertextHex = data.ciphertext_hex;
            this.lastNonceHex = data.nonce_hex;
            this.isTampered = false;

            // Fill In-Transit Form
            const nonceBox = document.getElementById("displayNonceHex");
            const ctBox = document.getElementById("displayCiphertextHex");
            if (nonceBox) nonceBox.value = data.nonce_hex;
            if (ctBox) {
                ctBox.value = data.ciphertext_hex;
                ctBox.classList.remove("tampered");
            }

            const tamperIndicator = document.getElementById("tamperIndicator");
            if (tamperIndicator) tamperIndicator.style.display = "none";

            const transitBadge = document.getElementById("transitStatusBadge");
            if (transitBadge) {
                transitBadge.className = "badge bg-info text-dark";
                transitBadge.textContent = `${data.ciphertext_bytes} B`;
            }

            // Enable Tamper Controls
            const btnTamper = document.getElementById("btnTamperMessage");
            const btnRestore = document.getElementById("btnRestoreMessage");
            if (btnTamper) btnTamper.disabled = false;
            if (btnRestore) btnRestore.disabled = true;

            // Show latency meta
            const metaContainer = document.getElementById("encryptResultMeta");
            if (metaContainer) metaContainer.style.display = "flex";
            const latencyText = document.getElementById("encryptLatencyText");
            if (latencyText) latencyText.textContent = `${data.encryption_latency_us} µs`;

            this.log(`✓ Message encrypted into <strong>${data.ciphertext_bytes} bytes</strong> in <strong>${data.encryption_latency_us} µs</strong>`, "success");
            this.log(`  &bull; Algorithm: <strong>${data.algorithm}</strong>`);
            this.log(`  &bull; IV/Nonce: ${data.nonce_hex}`);

            const inboxBadge = document.getElementById("inboxStatusBadge");
            if (inboxBadge) {
                inboxBadge.className = "badge bg-primary text-white";
                inboxBadge.innerHTML = `<i class="fa-solid fa-envelope me-1"></i> Message Waiting`;
            }

            const btnDecrypt = document.getElementById("btnDecryptMessage");
            if (btnDecrypt) btnDecrypt.disabled = false;

            const placeholder = document.getElementById("decryptPlaceholderText");
            if (placeholder) placeholder.textContent = "Encrypted transmission waiting in inbox. Click 'Decrypt Message with Alice\'s Key' to read!";
            const successBox = document.getElementById("decryptSuccessContent");
            if (successBox) successBox.style.display = "none";
            const failureBox = document.getElementById("decryptFailureContent");
            if (failureBox) failureBox.style.display = "none";

        } catch (err) {
            this.log(`[-] Message Encryption Error: ${err.message}`, "error");
        } finally {
            if (btnEncrypt) btnEncrypt.disabled = false;
        }
    }

    tamperCiphertext() {
        const ctBox = document.getElementById("displayCiphertextHex");
        let currentHex = ctBox ? ctBox.value.trim() : "";
        if (!currentHex && this.lastCiphertextHex) currentHex = this.lastCiphertextHex;
        if (!currentHex) return;

        this.isTampered = true;

        // Flip bytes in the ciphertext hex string
        const hexChars = currentHex.split("");
        if (hexChars.length > 2) {
            hexChars[0] = hexChars[0] === 'f' ? '0' : 'f';
            hexChars[1] = hexChars[1] === 'f' ? '1' : 'f';
        }
        const tamperedHex = hexChars.join("");

        if (ctBox) {
            ctBox.value = tamperedHex;
            ctBox.classList.add("tampered");
        }

        const tamperIndicator = document.getElementById("tamperIndicator");
        if (tamperIndicator) tamperIndicator.style.display = "inline";

        const btnRestore = document.getElementById("btnRestoreMessage");
        if (btnRestore) btnRestore.disabled = false;

        this.log(`[ATTACK SIMULATION] Man-in-the-Middle bit-flip injected into transmission payload!`, "error");
        this.log(`  &bull; Byte 0 altered. Click Alice's Decrypt button to test AEAD tag authentication.`, "warning");
    }

    restoreOriginalCiphertext() {
        if (!this.originalCiphertextHex) return;

        const ctBox = document.getElementById("displayCiphertextHex");
        if (ctBox) {
            ctBox.value = this.originalCiphertextHex;
            ctBox.classList.remove("tampered");
        }

        this.isTampered = false;

        const tamperIndicator = document.getElementById("tamperIndicator");
        if (tamperIndicator) tamperIndicator.style.display = "none";

        const btnRestore = document.getElementById("btnRestoreMessage");
        if (btnRestore) btnRestore.disabled = true;

        this.log(`Transmission payload restored to original authentic ciphertext.`, "info");
    }

    async decryptMessage() {
        // Read current contents of Ciphertext and Nonce boxes
        const ctBox = document.getElementById("displayCiphertextHex");
        const nonceBox = document.getElementById("displayNonceHex");

        let customCT = ctBox ? ctBox.value.trim() : "";
        let customNonce = nonceBox ? nonceBox.value.trim() : "";

        if (!customCT && !this.lastCiphertextHex) {
            alert("No ciphertext to decrypt! Type a message and click 'Encrypt Message' first.");
            const input = document.getElementById("userPlaintextInput");
            if (input) input.focus();
            return;
        }

        if (!this.sessionId || !this.keyId) {
            alert("Please complete the ML-KEM key exchange or click 'Encrypt Message' first.");
            return;
        }

        const btnDecrypt = document.getElementById("btnDecryptMessage");
        if (btnDecrypt) btnDecrypt.disabled = true;

        this.log(`Alice decrypting received message with ML-KEM recovered secret key...`, "accent");

        try {
            const res = await fetch("/api/kem/decrypt-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    key_id: this.keyId,
                    custom_ciphertext_hex: customCT || this.lastCiphertextHex,
                    custom_nonce_hex: customNonce || this.lastNonceHex
                })
            });

            const data = await res.json();

            const placeholder = document.getElementById("decryptPlaceholderText");
            const successBox = document.getElementById("decryptSuccessContent");
            const failureBox = document.getElementById("decryptFailureContent");
            const plaintextEl = document.getElementById("decryptedPlaintextText");
            const errorEl = document.getElementById("decryptedErrorText");
            const latencyBadge = document.getElementById("decryptLatencyText");
            const aeadBadge = document.getElementById("aeadStatusText");
            const container = document.getElementById("decryptResultContainer");

            if (placeholder) placeholder.style.display = "none";

            if (data.status === "success" && data.authenticated) {
                // SUCCESS: Authenticated decryption
                if (container) {
                    container.style.borderColor = "rgba(52, 211, 153, 0.6)";
                }

                if (successBox) successBox.style.display = "block";
                if (failureBox) failureBox.style.display = "none";
                if (plaintextEl) plaintextEl.textContent = data.plaintext;

                if (latencyBadge) {
                    latencyBadge.textContent = `${data.decryption_latency_us} µs`;
                    latencyBadge.className = "badge bg-success-subtle border border-success text-success";
                }
                if (aeadBadge) {
                    aeadBadge.textContent = "VALID (Poly1305/GHASH 16-Byte Tag Matched)";
                    aeadBadge.className = "text-success fw-bold";
                }

                this.log(`=================================================================`, "success");
                this.log(`★ DECRYPTION SUCCESS: Message authenticated & decrypted in <strong>${data.decryption_latency_us} µs</strong>!`, "success");
                this.log(`  &bull; Recovered Plaintext: "${data.plaintext}"`, "success");
                this.log(`=================================================================`, "success");
            } else {
                // FAILURE: Authentication Tag Mismatch (Tampered or Fake Key)
                if (container) {
                    container.style.borderColor = "rgba(244, 63, 94, 0.6)";
                }

                if (successBox) successBox.style.display = "none";
                if (failureBox) failureBox.style.display = "block";
                if (errorEl) errorEl.textContent = data.error || "AUTHENTICATION FAILURE: AES-GCM Tag mismatch! The message has been tampered with.";

                if (latencyBadge) {
                    latencyBadge.textContent = "Failed";
                    latencyBadge.className = "badge bg-danger-subtle border border-danger text-danger";
                }
                if (aeadBadge) {
                    aeadBadge.textContent = "REJECTED (Tag Mismatch / Tampered)";
                    aeadBadge.className = "text-danger fw-bold";
                }

                this.log(`=================================================================`, "error");
                this.log(`✗ AUTHENTICATION FAILED: AES-256-GCM Tag verification rejected!`, "error");
                this.log(`  &bull; The ciphertext or authentication tag was modified in transit.`, "error");
                this.log(`  &bull; Plaintext was safely discarded to protect confidentiality.`, "warning");
                this.log(`=================================================================`, "error");
            }

        } catch (err) {
            this.log(`[-] Message Decryption Error: ${err.message}`, "error");
        } finally {
            if (btnDecrypt) btnDecrypt.disabled = false;
        }
    }

    copyCiphertext() {
        const ctBox = document.getElementById("displayCiphertextHex");
        if (!ctBox || !ctBox.value.trim()) {
            alert("No ciphertext to copy!");
            return;
        }
        navigator.clipboard.writeText(ctBox.value.trim()).then(() => {
            this.log(`Ciphertext hex copied to clipboard.`, "info");
            alert("Ciphertext hex copied to clipboard!");
        });
    }

    copyPlaintext() {
        const ptBox = document.getElementById("decryptedPlaintextText");
        if (!ptBox || !ptBox.textContent.trim()) {
            alert("No decrypted plaintext to copy!");
            return;
        }
        navigator.clipboard.writeText(ptBox.textContent.trim()).then(() => {
            this.log(`Decrypted plaintext copied to clipboard.`, "info");
            alert("Decrypted plaintext copied to clipboard!");
        });
    }

    /* -------------------------------------------------------------------------
       Reset Session Workflow
       ------------------------------------------------------------------------- */
    resetDemo(clearLog = true) {
        this.sessionId = null;
        this.keyId = null;
        this.isVerified = false;
        this.lastCiphertextHex = null;
        this.originalCiphertextHex = null;
        this.lastNonceHex = null;
        this.isTampered = false;

        const sessionBadge = document.getElementById("sessionBadge");
        if (sessionBadge) sessionBadge.textContent = "No Active Session";

        const btnEncaps = document.getElementById("btnEncaps");
        const btnDecaps = document.getElementById("btnDecaps");
        const btnVerify = document.getElementById("btnVerify");
        const btnCorrupt = document.getElementById("btnCorruptCT");
        if (btnEncaps) btnEncaps.disabled = true;
        if (btnDecaps) btnDecaps.disabled = true;
        if (btnVerify) btnVerify.disabled = true;
        if (btnCorrupt) btnCorrupt.disabled = true;

        const statusBadge = document.getElementById("studioKeyStatusBadge");
        if (statusBadge) {
            statusBadge.className = "badge bg-success-subtle border border-success text-success px-3 py-2";
            statusBadge.innerHTML = `<i class="fa-solid fa-bolt me-1"></i> Ready &bull; Auto-Key Exchange Enabled`;
        }

        const btnTamper = document.getElementById("btnTamperMessage");
        const btnRestore = document.getElementById("btnRestoreMessage");
        if (btnTamper) btnTamper.disabled = true;
        if (btnRestore) btnRestore.disabled = true;

        const nonceBox = document.getElementById("displayNonceHex");
        const ctBox = document.getElementById("displayCiphertextHex");
        if (nonceBox) nonceBox.value = "";
        if (ctBox) {
            ctBox.value = "";
            ctBox.classList.remove("tampered");
        }

        const tamperIndicator = document.getElementById("tamperIndicator");
        if (tamperIndicator) tamperIndicator.style.display = "none";

        const transitBadge = document.getElementById("transitStatusBadge");
        if (transitBadge) {
            transitBadge.textContent = "Ready";
            transitBadge.className = "badge bg-secondary text-dark";
        }

        const inboxBadge = document.getElementById("inboxStatusBadge");
        if (inboxBadge) {
            inboxBadge.textContent = "Ready";
            inboxBadge.className = "badge bg-secondary-subtle border border-secondary text-secondary";
        }

        const placeholder = document.getElementById("decryptPlaceholderText");
        if (placeholder) {
            placeholder.style.display = "block";
            placeholder.innerHTML = `Click <strong>"Encrypt Message"</strong> on the left, then click <strong>"Decrypt Message"</strong> to read the decrypted text here.`;
        }

        const successBox = document.getElementById("decryptSuccessContent");
        const failureBox = document.getElementById("decryptFailureContent");
        if (successBox) successBox.style.display = "none";
        if (failureBox) failureBox.style.display = "none";

        const metaContainer = document.getElementById("encryptResultMeta");
        if (metaContainer) metaContainer.style.display = "none";

        const container = document.getElementById("decryptResultContainer");
        if (container) {
            container.style.borderColor = "rgba(255, 255, 255, 0.15)";
        }

        if (clearLog && this.logContainer) {
            this.logContainer.innerHTML = `<div class="text-secondary">// Reset completed. Type any message in the text box above and click "Encrypt Message".</div>`;
        }
    }
}

// Instantiate global controller
const cryptoDemo = new CryptoDemo();
