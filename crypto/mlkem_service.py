"""
ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism) Service.
Strictly conforms to NIST FIPS 203.

Implements:
- ML-KEM-512  (NIST Security Category 1)
- ML-KEM-768  (NIST Security Category 3)
- ML-KEM-1024 (NIST Security Category 5)
"""

import time
from dataclasses import dataclass, field
from typing import Tuple, Dict, Any, Optional
import mlkem

from config import FIPS_203_PARAMETERS, FIPS203ParameterSpec


class CryptoError(Exception):
    """Base exception for cryptographic service operations."""
    pass


class InvalidParameterError(CryptoError):
    """Raised when an unsupported or malformed parameter set name is supplied."""
    pass


class InvalidKeyError(CryptoError):
    """Raised when public or private key material fails validation."""
    pass


class InvalidCiphertextError(CryptoError):
    """Raised when ciphertext fails structural validation."""
    pass


@dataclass(frozen=True)
class KeyPairResult:
    """Safe representation of a generated ML-KEM key pair.
    
    The decapsulation key is retained in a secure opaque wrapper or handle.
    Its raw representation is never exposed in default string/repr conversions.
    """
    parameter_set: str
    public_key_bytes: bytes
    public_key_len: int
    private_key_len: int
    execution_time_ns: int
    execution_time_us: float
    _private_key_obj: Any = field(repr=False, hash=False, compare=False)

    def __repr__(self) -> str:
        return (
            f"KeyPairResult(param={self.parameter_set}, "
            f"ek_len={self.public_key_len}B, dk_len={self.private_key_len}B, "
            f"latency={self.execution_time_us:.2f}µs, private_key=[REDACTED])"
        )


@dataclass(frozen=True)
class EncapsulationResult:
    """Result of an ML-KEM encapsulation operation.
    
    The shared secret is securely held and strictly masked in string/repr conversions.
    """
    parameter_set: str
    ciphertext_bytes: bytes
    ciphertext_len: int
    shared_secret_len: int
    execution_time_ns: int
    execution_time_us: float
    _shared_secret: bytes = field(repr=False, hash=False, compare=False)

    def __repr__(self) -> str:
        return (
            f"EncapsulationResult(param={self.parameter_set}, "
            f"ct_len={self.ciphertext_len}B, ss_len={self.shared_secret_len}B, "
            f"latency={self.execution_time_us:.2f}µs, shared_secret=[REDACTED])"
        )

    def get_shared_secret(self) -> bytes:
        """Accessor for internal cryptographic operations only."""
        return self._shared_secret


@dataclass(frozen=True)
class DecapsulationResult:
    """Result of an ML-KEM decapsulation operation.
    
    The decapsulated shared secret is strictly masked in string/repr conversions.
    """
    parameter_set: str
    shared_secret_len: int
    execution_time_ns: int
    execution_time_us: float
    _shared_secret: bytes = field(repr=False, hash=False, compare=False)

    def __repr__(self) -> str:
        return (
            f"DecapsulationResult(param={self.parameter_set}, "
            f"ss_len={self.shared_secret_len}B, "
            f"latency={self.execution_time_us:.2f}µs, shared_secret=[REDACTED])"
        )

    def get_shared_secret(self) -> bytes:
        """Accessor for internal cryptographic operations only."""
        return self._shared_secret


class MLKEMService:
    """High-performance NIST FIPS 203 compliant ML-KEM Service."""

    _PARAM_MAP = {
        "ML-KEM-512": mlkem.ParameterSet.ML_KEM_512,
        "ML-KEM-768": mlkem.ParameterSet.ML_KEM_768,
        "ML-KEM-1024": mlkem.ParameterSet.ML_KEM_1024,
    }

    def __init__(self):
        # Pre-instantiate KEM engines for high-throughput benchmarking
        self._engines = {
            name: mlkem.ML_KEM(param) for name, param in self._PARAM_MAP.items()
        }

    def _resolve_spec(self, parameter_set: str) -> Tuple[FIPS203ParameterSpec, Any]:
        """Resolves and validates the parameter set name."""
        canonical = parameter_set.strip().upper()
        # Allow underscores or hyphens (e.g. ML_KEM_768 -> ML-KEM-768)
        if "_" in canonical and not canonical.startswith("ML_KEM_"):
            canonical = canonical.replace("_", "-")
        elif canonical.startswith("ML_KEM_"):
            canonical = canonical.replace("ML_KEM_", "ML-KEM-")

        if canonical not in FIPS_203_PARAMETERS:
            raise InvalidParameterError(
                f"Unsupported parameter set: '{parameter_set}'. "
                f"Must be one of {list(FIPS_203_PARAMETERS.keys())}"
            )
        return FIPS_203_PARAMETERS[canonical], self._engines[canonical]

    def generate_keypair(self, parameter_set: str) -> KeyPairResult:
        """Generates a fresh ML-KEM key pair for the specified parameter set.
        
        Args:
            parameter_set: One of 'ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024'
            
        Returns:
            KeyPairResult containing encapsulation key bytes, private key object,
            exact sizes, and execution latency in nanoseconds.
        """
        spec, kem = self._resolve_spec(parameter_set)

        t_start = time.perf_counter_ns()
        ek, dk = kem.key_gen()
        t_elapsed_ns = time.perf_counter_ns() - t_start

        ek_bytes = ek.to_bytes()
        dk_bytes = dk.to_bytes()

        # Validate exact FIPS 203 specification length
        if len(ek_bytes) != spec.public_key_bytes:
            raise InvalidKeyError(
                f"Generated public key size ({len(ek_bytes)} bytes) violates "
                f"FIPS 203 specification ({spec.public_key_bytes} bytes)."
            )

        return KeyPairResult(
            parameter_set=spec.name,
            public_key_bytes=ek_bytes,
            public_key_len=len(ek_bytes),
            private_key_len=len(dk_bytes),
            execution_time_ns=t_elapsed_ns,
            execution_time_us=t_elapsed_ns / 1_000.0,
            _private_key_obj=dk,
        )

    def encapsulate(self, parameter_set: str, public_key_bytes: bytes) -> EncapsulationResult:
        """Encapsulates a fresh shared secret against a recipient's encapsulation key.
        
        Args:
            parameter_set: Target parameter set.
            public_key_bytes: Raw encapsulation key bytes.
            
        Returns:
            EncapsulationResult containing ciphertext bytes, shared secret,
            and timing metrics.
        """
        spec, kem = self._resolve_spec(parameter_set)

        if not isinstance(public_key_bytes, (bytes, bytearray)):
            raise InvalidKeyError("Public key must be raw bytes.")

        if len(public_key_bytes) != spec.public_key_bytes:
            raise InvalidKeyError(
                f"Invalid public key length for {spec.name}: received {len(public_key_bytes)} bytes, "
                f"expected {spec.public_key_bytes} bytes."
            )

        try:
            ek_obj = mlkem.EncapsKey.from_bytes(bytes(public_key_bytes))
        except Exception as e:
            raise InvalidKeyError(f"Malformed public key: {e}") from e

        t_start = time.perf_counter_ns()
        # kem.encaps returns (shared_secret, ciphertext)
        shared_secret, ciphertext = kem.encaps(ek_obj)
        t_elapsed_ns = time.perf_counter_ns() - t_start

        ct_bytes = bytes(ciphertext)
        ss_bytes = bytes(shared_secret)

        if len(ct_bytes) != spec.ciphertext_bytes:
            raise InvalidCiphertextError(
                f"Generated ciphertext size ({len(ct_bytes)} bytes) violates "
                f"FIPS 203 specification ({spec.ciphertext_bytes} bytes)."
            )

        if len(ss_bytes) != spec.shared_secret_bytes:
            raise CryptoError(
                f"Generated shared secret size ({len(ss_bytes)} bytes) violates "
                f"FIPS 203 specification ({spec.shared_secret_bytes} bytes)."
            )

        return EncapsulationResult(
            parameter_set=spec.name,
            ciphertext_bytes=ct_bytes,
            ciphertext_len=len(ct_bytes),
            shared_secret_len=len(ss_bytes),
            execution_time_ns=t_elapsed_ns,
            execution_time_us=t_elapsed_ns / 1_000.0,
            _shared_secret=ss_bytes,
        )

    def decapsulate(
        self,
        parameter_set: str,
        private_key: Any,
        ciphertext_bytes: bytes
    ) -> DecapsulationResult:
        """Decapsulates a ciphertext using the recipient's decapsulation key.
        
        In accordance with FIPS 203 §5.3, an invalid or modified ciphertext of the
        correct length produces a pseudorandom secret via implicit rejection rather
        than leaking an exception oracle.
        
        Args:
            parameter_set: Target parameter set.
            private_key: DecapsKey object or raw decapsulation key bytes.
            ciphertext_bytes: Received ciphertext bytes.
            
        Returns:
            DecapsulationResult containing the recovered shared secret.
        """
        spec, kem = self._resolve_spec(parameter_set)

        if not isinstance(ciphertext_bytes, (bytes, bytearray)):
            raise InvalidCiphertextError("Ciphertext must be raw bytes.")

        if len(ciphertext_bytes) != spec.ciphertext_bytes:
            raise InvalidCiphertextError(
                f"Invalid ciphertext length for {spec.name}: received {len(ciphertext_bytes)} bytes, "
                f"expected {spec.ciphertext_bytes} bytes."
            )

        # Resolve private key object
        if isinstance(private_key, (bytes, bytearray)):
            if len(private_key) != spec.private_key_bytes:
                raise InvalidKeyError(
                    f"Invalid decapsulation key length for {spec.name}: "
                    f"received {len(private_key)} bytes, expected {spec.private_key_bytes} bytes."
                )
            try:
                dk_obj = mlkem.DecapsKey.from_bytes(bytes(private_key))
            except Exception as e:
                raise InvalidKeyError(f"Malformed decapsulation key bytes: {e}") from e
        elif isinstance(private_key, mlkem.DecapsKey):
            dk_obj = private_key
        else:
            raise InvalidKeyError(f"Unsupported private key object type: {type(private_key)}")

        t_start = time.perf_counter_ns()
        try:
            shared_secret = kem.decaps(dk_obj, bytes(ciphertext_bytes))
        except ValueError as e:
            # Re-raise standard structured exception
            raise InvalidCiphertextError(f"Ciphertext rejected by cryptosystem: {e}") from e
        t_elapsed_ns = time.perf_counter_ns() - t_start

        ss_bytes = bytes(shared_secret)

        return DecapsulationResult(
            parameter_set=spec.name,
            shared_secret_len=len(ss_bytes),
            execution_time_ns=t_elapsed_ns,
            execution_time_us=t_elapsed_ns / 1_000.0,
            _shared_secret=ss_bytes,
        )

    @staticmethod
    def zeroize(data: Optional[bytearray]):
        """Securely zeroes out sensitive in-memory bytearray buffers where possible."""
        if data is not None and isinstance(data, bytearray):
            for i in range(len(data)):
                data[i] = 0
