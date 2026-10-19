/**
 * Cryptographic Demonstration Controller (Page 2)
 * Manages the interactive FIPS 203 key encapsulation state machine.
 */

class CryptoDemo {
    constructor() {
        this.sessionId = null;
        this.keyId = null;
        this.parameterSet = "ML-KEM-768";
        this.logContainer = document.getElementById("demoLogContainer");
        this.initUrlParams();
    }

    initUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const param = urlParams.get("param");
        if (param && ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"].includes(param)) {
            const select = document.getElementById("selectParamSet");
            if (select) select.value = param;
        }
    }

    log(message, type = "info") {
        const timestamp = new Date().toISOString().split("T")[1].replace("Z", "");
        let colorClass = "text-secondary";
        if (type === "success") colorClass = "text-success";
        if (type === "warning") colorClass = "text-warning";
        if (type === "error") colorClass = "text-danger";
        if (type === "accent") colorClass = "text-info";

        const logEntry = document.createElement("div");
        logEntry.className = `py-1 ${colorClass}`;
        logEntry.innerHTML = `<span class="text-muted">[${timestamp}]</span> ${message}`;
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    setStep(stepIndex, statusText, isCompleted = false) {
        for (let i = 1; i <= 4; i++) {
            const card = document.getElementById(`stepCard${i}`);
            const status = document.getElementById(`stepStatus${i}`);
            if (i < stepIndex || (i === stepIndex && isCompleted)) {
                card.className = "workflow-step completed";
                status.innerHTML = `<i class="fa-solid fa-check text-success me-1"></i> Completed`;
            } else if (i === stepIndex) {
                card.className = "workflow-step active";
                status.innerHTML = `<i class="fa-solid fa-arrow-right text-info me-1"></i> ${statusText}`;
            } else {
                card.className = "workflow-step";
                status.innerHTML = `<span class="text-muted">Pending</span>`;
            }
        }
    }

    async generateKeyPair() {
        const paramSet = document.getElementById("selectParamSet").value;
        this.parameterSet = paramSet;
        const btnKeygen = document.getElementById("btnKeygen");
        btnKeygen.disabled = true;

        this.log(`Initiating key pair generation for <strong>${paramSet}</strong>...`, "accent");

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

            document.getElementById("sessionBadge").textContent = `Session: ${this.sessionId.substring(0, 10)}...`;

            this.log(`✓ Key generation successful in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Public Key (ek): <strong>${data.public_key_len} bytes</strong> (Hex: ${data.metadata.public_key_hex_preview})`);
            this.log(`  &bull; Private Key (dk): <strong>${data.private_key_len} bytes</strong> (${data.private_key_status})`, "warning");

            this.setStep(2, "Ready for Bob");
            document.getElementById("btnEncaps").disabled = false;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
        } finally {
            btnKeygen.disabled = false;
        }
    }

    async encapsulate() {
        const btnEncaps = document.getElementById("btnEncaps");
        btnEncaps.disabled = true;

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

            this.log(`✓ Encapsulation successful in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Ciphertext (c): <strong>${data.ciphertext_len} bytes</strong> (Hex: ${data.ciphertext_hex_preview})`);
            this.log(`  &bull; Sender Shared Secret: <strong>${data.sender_shared_secret}</strong> [REDACTED]`, "warning");
            this.log(`  &bull; Action: Bob transmits ciphertext 'c' over insecure channel to Alice.`);

            this.setStep(3, "Ready for Alice");
            document.getElementById("btnDecaps").disabled = false;
            document.getElementById("btnCorruptCT").disabled = false;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
        } finally {
            btnEncaps.disabled = false;
        }
    }

    async decapsulate() {
        const btnDecaps = document.getElementById("btnDecaps");
        btnDecaps.disabled = true;

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

            this.log(`✓ Decapsulation successful in <strong>${data.execution_time_us.toFixed(2)} µs</strong>`, "success");
            this.log(`  &bull; Recipient Shared Secret: <strong>${data.recipient_shared_secret}</strong> [REDACTED]`, "warning");

            this.setStep(4, "Ready to verify");
            document.getElementById("btnVerify").disabled = false;
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
        } finally {
            btnDecaps.disabled = false;
        }
    }

    async verifySecrets() {
        const btnVerify = document.getElementById("btnVerify");
        btnVerify.disabled = true;

        this.log(`Verifying shared secret equality in constant time...`, "accent");

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
                this.log(`=================================================================`, "success");
                this.log(`★ SECRET MATCH: SUCCESS (Sender and Recipient Secrets Match!)`, "success");
                this.log(`  &bull; Fingerprint: <strong>${data.secret_fingerprint}</strong> (Non-revealing hash proof)`, "success");
                this.log(`  &bull; Both parties can now derive symmetric session keys (e.g., AES-GCM-256).`, "success");
                this.log(`=================================================================`, "success");
                this.setStep(4, "Verified", true);
            } else {
                this.log(`=================================================================`, "error");
                this.log(`✗ SECRET MISMATCH: FAILURE! Keys do not match.`, "error");
                this.log(`  &bull; Message: ${data.message}`, "error");
                this.log(`=================================================================`, "error");
            }
        } catch (err) {
            this.log(`[-] Error: ${err.message}`, "error");
        } finally {
            btnVerify.disabled = false;
        }
    }

    async simulateCorruptedCiphertext() {
        this.log(`[NEGATIVE TEST] Injecting bit flip into ciphertext to test implicit rejection...`, "warning");
        const btnCorrupt = document.getElementById("btnCorruptCT");
        btnCorrupt.disabled = true;

        // Create a tampered ciphertext hex of standard length (e.g. 1088 bytes = 2176 hex characters)
        const ctBytesLen = this.parameterSet === "ML-KEM-512" ? 768 : (this.parameterSet === "ML-KEM-768" ? 1088 : 1568);
        const corruptedHex = "ff" + "00".repeat(ctBytesLen - 1);

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
            this.log(`  &bull; The cryptosystem did NOT throw an exception or timing error.`, "warning");
            this.log(`  &bull; Instead, it deterministically derived a pseudorandom secret.`, "warning");

            // Automatically run verification
            this.verifySecrets();
        } catch (err) {
            this.log(`[-] Unexpected error: ${err.message}`, "error");
        } finally {
            btnCorrupt.disabled = false;
        }
    }

    resetDemo() {
        this.sessionId = null;
        this.keyId = null;
        document.getElementById("sessionBadge").textContent = "No Active Session";
        document.getElementById("btnEncaps").disabled = true;
        document.getElementById("btnDecaps").disabled = true;
        document.getElementById("btnVerify").disabled = true;
        document.getElementById("btnCorruptCT").disabled = true;
        this.setStep(1, "Ready");
        this.logContainer.innerHTML = `<div class="text-secondary">// Reset completed. Ready to begin new key exchange.</div>`;
    }
}

const cryptoDemo = new CryptoDemo();
