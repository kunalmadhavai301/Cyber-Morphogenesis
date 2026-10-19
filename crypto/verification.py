"""
Cryptographic Verification and Classical Baseline Comparison Module.
Provides constant-time verification functions, FIPS 203 specification compliance checks,
and classical ECDH baseline mechanisms (X25519 and NIST P-256) for comparative research.
"""

import hmac
import hashlib
import time
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.asymmetric import x25519, ec
from cryptography.hazmat.primitives import serialization

from config import FIPS_203_PARAMETERS


class CryptoVerifier:
    """Verification utilities for ML-KEM correctness and classical comparisons."""

    @staticmethod
    def constant_time_compare(val1: bytes, val2: bytes) -> bool:
        """Executes a constant-time comparison to prevent timing side-channel leaks."""
        if not isinstance(val1, (bytes, bytearray)) or not isinstance(val2, (bytes, bytearray)):
            return False
        return hmac.compare_digest(bytes(val1), bytes(val2))

    @staticmethod
    def get_safe_secret_fingerprint(secret: bytes) -> str:
        """Returns a 64-bit truncated SHA-256 digest of a secret for verification display.
        
        Allows confirmation of secret agreement in research demonstrations
        without exposing raw secret bytes.
        """
        if not secret:
            return ""
        digest = hashlib.sha256(secret).hexdigest()
        return f"SHA256:{digest[:12]}..."

    @staticmethod
    def validate_fips203_compliance(
        parameter_set: str,
        ek_bytes: bytes,
        dk_bytes: bytes,
        ct_bytes: bytes,
        ss_bytes: bytes
    ) -> Dict[str, Any]:
        """Validates all artifact sizes against official NIST FIPS 203 Section 8 Table 2."""
        if parameter_set not in FIPS_203_PARAMETERS:
            return {"valid": False, "error": f"Unknown parameter set: {parameter_set}"}

        spec = FIPS_203_PARAMETERS[parameter_set]
        errors = []

        if len(ek_bytes) != spec.public_key_bytes:
            errors.append(f"Public key: expected {spec.public_key_bytes}B, got {len(ek_bytes)}B")
        if len(dk_bytes) != spec.private_key_bytes:
            errors.append(f"Private key: expected {spec.private_key_bytes}B, got {len(dk_bytes)}B")
        if len(ct_bytes) != spec.ciphertext_bytes:
            errors.append(f"Ciphertext: expected {spec.ciphertext_bytes}B, got {len(ct_bytes)}B")
        if len(ss_bytes) != spec.shared_secret_bytes:
            errors.append(f"Shared secret: expected {spec.shared_secret_bytes}B, got {len(ss_bytes)}B")

        return {
            "valid": len(errors) == 0,
            "parameter_set": parameter_set,
            "nist_category": spec.nist_category,
            "expected_sizes": {
                "public_key": spec.public_key_bytes,
                "private_key": spec.private_key_bytes,
                "ciphertext": spec.ciphertext_bytes,
                "shared_secret": spec.shared_secret_bytes,
            },
            "actual_sizes": {
                "public_key": len(ek_bytes),
                "private_key": len(dk_bytes),
                "ciphertext": len(ct_bytes),
                "shared_secret": len(ss_bytes),
            },
            "errors": errors,
        }

    # =========================================================================
    # Classical Baseline Primitives (For Experiment J: Comparative Analysis)
    # =========================================================================

    @staticmethod
    def benchmark_classical_ecdh_x25519() -> Dict[str, Any]:
        """Executes a complete classical X25519 ECDH key agreement roundtrip.
        
        Measures keygen latency, public key exchange size, and key agreement latency.
        """
        # 1. Key generation (Party A and Party B)
        t0 = time.perf_counter_ns()
        priv_a = x25519.X25519PrivateKey.generate()
        pub_a = priv_a.public_key()
        t_keygen = (time.perf_counter_ns() - t0) / 1000.0

        priv_b = x25519.X25519PrivateKey.generate()
        pub_b = priv_b.public_key()

        pub_bytes_a = pub_a.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

        # 2. Key Agreement
        t0 = time.perf_counter_ns()
        shared_secret_a = priv_a.exchange(pub_b)
        t_agreement = (time.perf_counter_ns() - t0) / 1000.0

        shared_secret_b = priv_b.exchange(pub_a)
        is_match = hmac.compare_digest(shared_secret_a, shared_secret_b)

        return {
            "algorithm": "ECDH-X25519",
            "security_type": "Classical (Curve25519, ~128-bit security)",
            "public_key_bytes": len(pub_bytes_a),  # 32 bytes
            "ciphertext_or_exchange_bytes": len(pub_bytes_a),  # 32 bytes exchanged
            "shared_secret_bytes": len(shared_secret_a),  # 32 bytes
            "keygen_latency_us": t_keygen,
            "agreement_latency_us": t_agreement,
            "verified_match": is_match,
        }

    @staticmethod
    def benchmark_classical_ecdh_p256() -> Dict[str, Any]:
        """Executes a complete classical NIST P-256 (secp256r1) ECDH key agreement."""
        t0 = time.perf_counter_ns()
        priv_a = ec.generate_private_key(ec.SECP256R1())
        pub_a = priv_a.public_key()
        t_keygen = (time.perf_counter_ns() - t0) / 1000.0

        priv_b = ec.generate_private_key(ec.SECP256R1())
        pub_b = priv_b.public_key()

        pub_bytes_a = pub_a.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint
        )

        t0 = time.perf_counter_ns()
        shared_secret_a = priv_a.exchange(ec.ECDH(), pub_b)
        t_agreement = (time.perf_counter_ns() - t0) / 1000.0

        shared_secret_b = priv_b.exchange(ec.ECDH(), pub_a)
        is_match = hmac.compare_digest(shared_secret_a, shared_secret_b)

        return {
            "algorithm": "ECDH-P256",
            "security_type": "Classical (NIST P-256, ~128-bit security)",
            "public_key_bytes": len(pub_bytes_a),  # 65 bytes
            "ciphertext_or_exchange_bytes": len(pub_bytes_a),  # 65 bytes exchanged
            "shared_secret_bytes": len(shared_secret_a),  # 32 bytes
            "keygen_latency_us": t_keygen,
            "agreement_latency_us": t_agreement,
            "verified_match": is_match,
        }
