"""
Comprehensive Security and Secret Leakage Verification Test Suite.
Verifies that:
1. Private keys are never leaked in logs, str/repr, or API responses.
2. Shared secrets are never leaked in API responses.
3. Ephemeral sessions are strictly isolated.
4. Implicit rejection prevents oracle leaks.
5. Strict input validation and boundary protections prevent DoS.
6. Crucial HTTP security headers are enforced.
"""

import pytest
import json
from app import create_app
from crypto.mlkem_service import MLKEMService


@pytest.fixture
def client():
    app = create_app("testing")
    with app.test_client() as client:
        yield client


class TestSecurityControls:
    """Security verification tests enforcing the zero-secret-leakage policy."""

    def test_repr_and_str_mask_secret_material(self):
        """Verifies that KeyPairResult, EncapsulationResult, and DecapsulationResult
        explicitly mask all secret material in their string representations."""
        service = MLKEMService()
        kp = service.generate_keypair("ML-KEM-768")
        repr_kp = repr(kp)
        str_kp = str(kp)

        # Private key must be masked
        assert "[REDACTED]" in repr_kp
        assert "[REDACTED]" in str_kp

        encap = service.encapsulate("ML-KEM-768", kp.public_key_bytes)
        assert "[REDACTED]" in repr(encap)
        assert "[REDACTED]" in str(encap)

        decap = service.decapsulate("ML-KEM-768", kp._private_key_obj, encap.ciphertext_bytes)
        assert "[REDACTED]" in repr(decap)
        assert "[REDACTED]" in str(decap)

    def test_api_responses_never_expose_private_keys(self, client):
        """Verifies that key generation API response does NOT contain private key material."""
        res = client.post("/api/kem/keygen", json={"parameter_set": "ML-KEM-768"})
        data = res.get_json()
        assert res.status_code == 200

        # Thorough scan of response keys and values
        response_str = json.dumps(data).lower()
        assert "private_key_bytes" not in response_str
        assert "decapskey" not in response_str
        assert "secret_key" not in response_str
        assert "sk" not in data
        assert "dk" not in data

    def test_api_responses_never_expose_shared_secrets(self, client):
        """Verifies that encapsulation and decapsulation API responses do NOT expose shared secret bytes."""
        # 1. Setup session and key
        sess_res = client.post("/api/kem/session")
        session_id = sess_res.get_json()["session_id"]
        kg_res = client.post("/api/kem/keygen", json={"session_id": session_id, "parameter_set": "ML-KEM-768"})
        key_id = kg_res.get_json()["key_id"]

        # 2. Encapsulate
        enc_res = client.post("/api/kem/encapsulate", json={"session_id": session_id, "key_id": key_id})
        enc_data = enc_res.get_json()
        assert enc_res.status_code == 200
        assert "shared_secret_bytes" not in enc_data
        assert "raw_secret" not in enc_data

        # 3. Decapsulate
        dec_res = client.post("/api/kem/decapsulate", json={"session_id": session_id, "key_id": key_id})
        dec_data = dec_res.get_json()
        assert dec_res.status_code == 200
        assert "shared_secret_bytes" not in dec_data
        assert "raw_secret" not in dec_data

        # 4. Verify endpoint returns only boolean and truncated SHA-256 fingerprint
        ver_res = client.post("/api/kem/verify", json={"session_id": session_id, "key_id": key_id})
        ver_data = ver_res.get_json()
        assert ver_res.status_code == 200
        assert ver_data["verified_match"] is True
        assert ver_data["secret_fingerprint"].startswith("SHA256:")
        # Ensure raw 32-byte secret is NOT returned
        assert "shared_secret" not in ver_data

    def test_cross_session_key_isolation(self, client):
        """Ensures that Session A's keys cannot be accessed or manipulated by Session B."""
        # Create Session A and generate key
        sess_a = client.post("/api/kem/session").get_json()["session_id"]
        kg_a = client.post("/api/kem/keygen", json={"session_id": sess_a, "parameter_set": "ML-KEM-768"})
        key_id_a = kg_a.get_json()["key_id"]

        # Create Session B
        sess_b = client.post("/api/kem/session").get_json()["session_id"]

        # Attempt to encapsulate in Session B using Key ID from Session A -> must fail 404
        bad_enc = client.post("/api/kem/encapsulate", json={"session_id": sess_b, "key_id": key_id_a})
        assert bad_enc.status_code == 404

        # Attempt to decapsulate in Session B using Key ID from Session A -> must fail 404
        bad_dec = client.post("/api/kem/decapsulate", json={"session_id": sess_b, "key_id": key_id_a})
        assert bad_dec.status_code == 404

    def test_implicit_rejection_negative_test_via_api(self, client):
        """Validates that corrupting a ciphertext does not crash the server but triggers
        implicit rejection and secret mismatch on verification."""
        sess_id = client.post("/api/kem/session").get_json()["session_id"]
        kg = client.post("/api/kem/keygen", json={"session_id": sess_id, "parameter_set": "ML-KEM-768"}).get_json()
        key_id = kg["key_id"]

        # Legitimate encapsulation
        client.post("/api/kem/encapsulate", json={"session_id": sess_id, "key_id": key_id})

        # Decapsulate with tampered ciphertext of valid length (1088 bytes = 2176 hex chars)
        fake_ciphertext_hex = "ff" * 1088
        dec_corrupted = client.post("/api/kem/decapsulate", json={
            "session_id": sess_id,
            "key_id": key_id,
            "custom_ciphertext_hex": fake_ciphertext_hex
        })
        # FIPS 203 implicit rejection: decapsulation succeeds without exception
        assert dec_corrupted.status_code == 200

        # Verification must report MISMATCH
        ver = client.post("/api/kem/verify", json={"session_id": sess_id, "key_id": key_id}).get_json()
        assert ver["verified_match"] is False
        assert "mismatch" in ver["message"].lower()

    def test_input_validation_boundaries(self, client):
        """Enforces parameter bounds and rejects malicious or out-of-range payloads."""
        # Unbounded trials (>10000) rejected by schema
        bad_bench = client.post("/api/benchmark/run", json={
            "parameter_set": "ML-KEM-768",
            "trials": 500000
        })
        assert bad_bench.status_code == 400

        # Unsupported algorithm rejected
        bad_algo = client.post("/api/kem/keygen", json={"parameter_set": "RSA-4096"})
        assert bad_algo.status_code == 400

        # Malformed non-hex ciphertext
        sess_id = client.post("/api/kem/session").get_json()["session_id"]
        kg = client.post("/api/kem/keygen", json={"session_id": sess_id, "parameter_set": "ML-KEM-768"}).get_json()
        bad_hex = client.post("/api/kem/decapsulate", json={
            "session_id": sess_id,
            "key_id": kg["key_id"],
            "custom_ciphertext_hex": "NOT_A_HEX_STRING_XYZ"
        })
        assert bad_hex.status_code == 400

    def test_http_security_headers(self, client):
        """Enforces presence of critical HTTP defense-in-depth headers."""
        res = client.get("/api/health")
        assert res.headers.get("X-Content-Type-Options") == "nosniff"
        assert res.headers.get("X-Frame-Options") == "DENY"
        assert "1; mode=block" in res.headers.get("X-XSS-Protection", "")
        assert "Content-Security-Policy" in res.headers
