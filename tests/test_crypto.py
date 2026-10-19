"""
Comprehensive Automated Tests for ML-KEM Cryptographic Core.
Tests compliance with NIST FIPS 203, parameter sets (512, 768, 1024),
implicit rejection, session key isolation, and error handling.
"""

import pytest
import hmac
from crypto.mlkem_service import (
    MLKEMService,
    InvalidParameterError,
    InvalidKeyError,
    InvalidCiphertextError,
)
from crypto.key_management import SessionKeyManager
from crypto.verification import CryptoVerifier
from config import FIPS_203_PARAMETERS


@pytest.fixture
def service():
    return MLKEMService()


@pytest.fixture
def key_manager():
    return SessionKeyManager(default_ttl_seconds=300)


class TestMLKEMCore:
    """Test suite for core cryptographic operations across all parameter sets."""

    @pytest.mark.parametrize("param_name", ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"])
    def test_roundtrip_key_exchange(self, service, param_name):
        spec = FIPS_203_PARAMETERS[param_name]

        # 1. Key Generation
        kp = service.generate_keypair(param_name)
        assert kp.parameter_set == param_name
        assert len(kp.public_key_bytes) == spec.public_key_bytes
        assert kp.public_key_len == spec.public_key_bytes
        assert kp.private_key_len == spec.private_key_bytes
        assert kp.execution_time_ns > 0

        # 2. Encapsulation
        encap = service.encapsulate(param_name, kp.public_key_bytes)
        assert encap.parameter_set == param_name
        assert len(encap.ciphertext_bytes) == spec.ciphertext_bytes
        assert encap.ciphertext_len == spec.ciphertext_bytes
        assert encap.shared_secret_len == 32
        assert len(encap.get_shared_secret()) == 32

        # 3. Decapsulation
        decap = service.decapsulate(param_name, kp._private_key_obj, encap.ciphertext_bytes)
        assert decap.parameter_set == param_name
        assert decap.shared_secret_len == 32
        assert len(decap.get_shared_secret()) == 32

        # 4. Constant-Time Secret Matching
        is_match = CryptoVerifier.constant_time_compare(
            encap.get_shared_secret(),
            decap.get_shared_secret()
        )
        assert is_match is True

    @pytest.mark.parametrize("param_name", ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"])
    def test_implicit_rejection_on_corrupted_ciphertext(self, service, param_name):
        """FIPS 203 §5.3 requires invalid ciphertext to deterministically produce
        a pseudorandom key rather than leaking an exception."""
        kp = service.generate_keypair(param_name)
        encap = service.encapsulate(param_name, kp.public_key_bytes)

        # Flip the first byte
        corrupted_ct = bytearray(encap.ciphertext_bytes)
        corrupted_ct[0] ^= 0x5A
        corrupted_ct = bytes(corrupted_ct)

        decap_corrupted = service.decapsulate(param_name, kp._private_key_obj, corrupted_ct)
        # Should not raise, should return a 32-byte secret
        assert decap_corrupted.shared_secret_len == 32
        # But it must NOT match the legitimate sender shared secret
        assert not CryptoVerifier.constant_time_compare(
            encap.get_shared_secret(),
            decap_corrupted.get_shared_secret()
        )

    def test_invalid_parameter_name(self, service):
        with pytest.raises(InvalidParameterError):
            service.generate_keypair("ML-KEM-999")

    def test_malformed_public_key(self, service):
        # Truncated public key
        with pytest.raises(InvalidKeyError):
            service.encapsulate("ML-KEM-768", b"\x00" * 100)

    def test_malformed_ciphertext_length(self, service):
        kp = service.generate_keypair("ML-KEM-768")
        # Truncated ciphertext
        with pytest.raises(InvalidCiphertextError):
            service.decapsulate("ML-KEM-768", kp._private_key_obj, b"\x00" * 50)


class TestKeyManagementAndSessionIsolation:
    """Test suite for ephemeral key manager and session isolation."""

    def test_session_lifecycle(self, service, key_manager):
        sess_a = key_manager.create_session()
        sess_b = key_manager.create_session()
        assert sess_a != sess_b

        # Store key in Session A
        kp = service.generate_keypair("ML-KEM-768")
        key_id = key_manager.store_keypair(sess_a, kp)

        # Retrieve metadata
        meta = key_manager.get_public_metadata(sess_a, key_id)
        assert meta["key_id"] == key_id
        assert meta["parameter_set"] == "ML-KEM-768"
        assert meta["has_ciphertext"] is False
        assert meta["verified_match"] is None

        # Cross-session isolation check: Session B cannot access Session A's key
        with pytest.raises(KeyError):
            key_manager.get_key_reference(sess_b, key_id)

        # Perform encapsulation
        encap = service.encapsulate("ML-KEM-768", kp.public_key_bytes)
        key_manager.store_encapsulation(sess_a, key_id, encap)

        # Perform decapsulation
        decap = service.decapsulate("ML-KEM-768", kp._private_key_obj, encap.ciphertext_bytes)
        key_manager.store_decapsulation(sess_a, key_id, decap)

        # Verify shared secrets
        match, msg = key_manager.verify_shared_secrets(sess_a, key_id)
        assert match is True

        # Clear session
        key_manager.clear_session(sess_a)
        with pytest.raises(KeyError):
            key_manager.get_key_reference(sess_a, key_id)


class TestClassicalBaselines:
    """Test suite for classical ECDH baselines (Experiment J)."""

    def test_ecdh_x25519(self):
        res = CryptoVerifier.benchmark_classical_ecdh_x25519()
        assert res["verified_match"] is True
        assert res["public_key_bytes"] == 32
        assert res["shared_secret_bytes"] == 32

    def test_ecdh_p256(self):
        res = CryptoVerifier.benchmark_classical_ecdh_p256()
        assert res["verified_match"] is True
        assert res["public_key_bytes"] == 65
        assert res["shared_secret_bytes"] == 32
