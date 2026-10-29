"""
Comprehensive Automated Tests for REST API Endpoints.
Tests health, algorithm metadata, keygen, encaps, decaps, verify,
benchmark runs, CSV exports, and error handling.
"""

import pytest
import json
from app import create_app


@pytest.fixture
def client():
    app = create_app("testing")
    with app.test_client() as client:
        yield client


class TestApiEndpoints:
    """Test suite for all API routes."""

    def test_health_endpoint(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "healthy"
        assert "FIPS 203" in data["standard"]

    def test_algorithms_endpoint(self, client):
        res = client.get("/api/algorithms")
        assert res.status_code == 200
        data = res.get_json()
        algos = data["supported_algorithms"]
        assert "ML-KEM-512" in algos
        assert "ML-KEM-768" in algos
        assert "ML-KEM-1024" in algos
        assert algos["ML-KEM-768"]["public_key_bytes"] == 1184
        assert algos["ML-KEM-768"]["ciphertext_bytes"] == 1088

    def test_crypto_demonstration_workflow(self, client):
        # 1. Create session
        res = client.post("/api/kem/session")
        assert res.status_code == 200
        session_id = res.get_json()["session_id"]

        # 2. KeyGen
        res_kg = client.post("/api/kem/keygen", json={
            "session_id": session_id,
            "parameter_set": "ML-KEM-768"
        })
        assert res_kg.status_code == 200
        kg_data = res_kg.get_json()
        key_id = kg_data["key_id"]
        assert kg_data["public_key_len"] == 1184
        assert kg_data["private_key_len"] == 2400
        # Security assertion: ensure no private key bytes leaked
        assert "private_key_bytes" not in kg_data
        assert "dk" not in kg_data

        # 3. Encapsulate
        res_enc = client.post("/api/kem/encapsulate", json={
            "session_id": session_id,
            "key_id": key_id
        })
        assert res_enc.status_code == 200
        enc_data = res_enc.get_json()
        assert enc_data["ciphertext_len"] == 1088
        assert enc_data["shared_secret_len"] == 32
        # Security assertion: ensure no shared secret bytes leaked
        assert "shared_secret_bytes" not in enc_data

        # 4. Decapsulate
        res_dec = client.post("/api/kem/decapsulate", json={
            "session_id": session_id,
            "key_id": key_id
        })
        assert res_dec.status_code == 200
        dec_data = res_dec.get_json()
        assert dec_data["shared_secret_len"] == 32

        # 5. Verify secrets
        res_ver = client.post("/api/kem/verify", json={
            "session_id": session_id,
            "key_id": key_id
        })
        assert res_ver.status_code == 200
        ver_data = res_ver.get_json()
        assert ver_data["verified_match"] is True
        assert ver_data["constant_time_verification"] is True

        # 6. Test User Message Encryption & Decryption (AES-256-GCM via ML-KEM Key)
        secret_msg = "Top-Secret Quantum Defense Plan 2026"
        res_enc_msg = client.post("/api/kem/encrypt-message", json={
            "session_id": session_id,
            "key_id": key_id,
            "plaintext": secret_msg
        })
        assert res_enc_msg.status_code == 200
        enc_msg_data = res_enc_msg.get_json()
        assert enc_msg_data["status"] == "success"
        assert "ciphertext_hex" in enc_msg_data
        assert "nonce_hex" in enc_msg_data

        # 7. Decrypt with Alice's recovered ML-KEM key
        res_dec_msg = client.post("/api/kem/decrypt-message", json={
            "session_id": session_id,
            "key_id": key_id
        })
        assert res_dec_msg.status_code == 200
        dec_msg_data = res_dec_msg.get_json()
        assert dec_msg_data["status"] == "success"
        assert dec_msg_data["authenticated"] is True
        assert dec_msg_data["plaintext"] == secret_msg

        # 8. Test Tampered Message Decryption (AES-GCM Auth Failure)
        tampered_hex = enc_msg_data["ciphertext_hex"][:-4] + "ffff"
        res_tampered = client.post("/api/kem/decrypt-message", json={
            "session_id": session_id,
            "key_id": key_id,
            "custom_ciphertext_hex": tampered_hex
        })
        assert res_tampered.status_code == 200
        tamper_data = res_tampered.get_json()
        assert tamper_data["status"] == "authentication_failed"
        assert tamper_data["authenticated"] is False

    def test_benchmark_run_and_results(self, client):
        res = client.post("/api/benchmark/run", json={
            "parameter_set": "ML-KEM-512",
            "operation": "all",
            "trials": 5,
            "warmup": 1,
            "notes": "API test run"
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        exp_id = data["result"]["experiment_id"]

        # Retrieve experiment list
        res_list = client.get("/api/benchmark/results")
        assert res_list.status_code == 200
        list_data = res_list.get_json()
        assert list_data["count"] >= 1

        # Retrieve specific experiment
        res_exp = client.get(f"/api/benchmark/results/{exp_id}")
        assert res_exp.status_code == 200
        exp_data = res_exp.get_json()["experiment"]
        assert exp_data["experiment_id"] == exp_id

    def test_csv_export(self, client):
        res = client.get("/api/benchmark/export/csv")
        assert res.status_code == 200
        assert res.mimetype == "text/csv"
        assert "experiment_id,timestamp,parameter_set" in res.get_data(as_text=True)

    def test_comparison_endpoints(self, client):
        res_comp = client.get("/api/benchmark/comparison?trials=5&warmup=1")
        assert res_comp.status_code == 200
        assert "comparison" in res_comp.get_json()

        res_class = client.get("/api/benchmark/classical-comparison?trials=5")
        assert res_class.status_code == 200
        assert "mechanisms" in res_class.get_json()
