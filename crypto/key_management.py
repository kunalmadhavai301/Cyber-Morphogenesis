"""
Ephemeral Key Management Module for Demonstration and Benchmarking Sessions.
Ensures session isolation, zero disk persistence of secret keys, TTL expiration,
and strict prevention of private key and shared secret leakage.
Also provides post-quantum hybrid message encryption & decryption using AES-256-GCM
keyed directly by the ML-KEM shared secret.
"""

import time
import secrets
import os
import threading
from dataclasses import dataclass, field
from typing import Dict, Optional, Any, Tuple
import hmac
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

from .mlkem_service import KeyPairResult, EncapsulationResult, DecapsulationResult


@dataclass
class KeyReference:
    """Ephemeral record of an in-memory key pair."""
    key_id: str
    parameter_set: str
    public_key_bytes: bytes
    public_key_len: int
    private_key_len: int
    created_at: float
    expires_at: float
    # Private key held in memory; excluded from repr and serialization
    _private_key_obj: Any = field(repr=False)
    
    # Demonstration state tracking
    ciphertext_bytes: Optional[bytes] = None
    ciphertext_len: Optional[int] = None
    _sender_shared_secret: Optional[bytes] = field(default=None, repr=False)
    _recipient_shared_secret: Optional[bytes] = field(default=None, repr=False)
    verified_match: Optional[bool] = None

    # Hybrid AES-256-GCM Message Tracking
    last_msg_nonce: Optional[bytes] = field(default=None, repr=False)
    last_msg_ciphertext: Optional[bytes] = field(default=None, repr=False)
    last_msg_plaintext: Optional[str] = field(default=None, repr=False)

    def is_expired(self) -> bool:
        return time.time() > self.expires_at

    def clear(self):
        """Erases references to sensitive key and secret material."""
        self._private_key_obj = None
        self._sender_shared_secret = None
        self._recipient_shared_secret = None
        self.ciphertext_bytes = None
        self.last_msg_nonce = None
        self.last_msg_ciphertext = None
        self.last_msg_plaintext = None


class SessionKeyManager:
    """Thread-safe, ephemeral in-memory key manager with session isolation."""

    def __init__(self, default_ttl_seconds: int = 900):
        self._default_ttl = default_ttl_seconds
        # Structure: {session_id: {key_id: KeyReference}}
        self._sessions: Dict[str, Dict[str, KeyReference]] = {}
        self._lock = threading.RLock()

    def create_session(self) -> str:
        """Creates a new isolated session identifier."""
        session_id = secrets.token_urlsafe(24)
        with self._lock:
            self._cleanup_expired_unlocked()
            self._sessions[session_id] = {}
        return session_id

    def store_keypair(self, session_id: str, keypair: KeyPairResult, ttl_seconds: Optional[int] = None) -> str:
        """Stores a generated key pair in the ephemeral session registry."""
        with self._lock:
            if session_id not in self._sessions:
                self._sessions[session_id] = {}

            key_id = f"key_{secrets.token_hex(8)}"
            now = time.time()
            ttl = ttl_seconds or self._default_ttl

            ref = KeyReference(
                key_id=key_id,
                parameter_set=keypair.parameter_set,
                public_key_bytes=keypair.public_key_bytes,
                public_key_len=keypair.public_key_len,
                private_key_len=keypair.private_key_len,
                created_at=now,
                expires_at=now + ttl,
                _private_key_obj=keypair._private_key_obj,
            )
            self._sessions[session_id][key_id] = ref
            return key_id

    def get_key_reference(self, session_id: str, key_id: str) -> KeyReference:
        """Retrieves key reference, verifying session ownership and expiration."""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                raise KeyError(f"Session '{session_id}' not found or expired.")

            ref = session.get(key_id)
            if not ref:
                raise KeyError(f"Key reference '{key_id}' not found in current session.")

            if ref.is_expired():
                ref.clear()
                del session[key_id]
                raise KeyError(f"Key reference '{key_id}' has expired.")

            return ref

    def store_encapsulation(self, session_id: str, key_id: str, encap: EncapsulationResult):
        """Records encapsulation ciphertext and sender secret in the key reference."""
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            ref.ciphertext_bytes = encap.ciphertext_bytes
            ref.ciphertext_len = encap.ciphertext_len
            ref._sender_shared_secret = encap.get_shared_secret()
            # Reset verification state if new encapsulation is performed
            ref.verified_match = None

    def store_decapsulation(self, session_id: str, key_id: str, decap: DecapsulationResult):
        """Records recipient recovered secret in the key reference."""
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            ref._recipient_shared_secret = decap.get_shared_secret()

    def verify_shared_secrets(self, session_id: str, key_id: str) -> Tuple[bool, str]:
        """Performs constant-time comparison of sender and recipient shared secrets.
        
        Returns:
            Tuple of (match_bool, status_message).
            Does NOT expose raw secret bytes.
        """
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            if ref._sender_shared_secret is None:
                return False, "Encapsulation has not been executed yet."
            if ref._recipient_shared_secret is None:
                return False, "Decapsulation has not been executed yet."

            # Constant-time comparison
            is_match = hmac.compare_digest(
                ref._sender_shared_secret,
                ref._recipient_shared_secret
            )
            ref.verified_match = is_match
            msg = "Shared secrets match successfully (32 bytes confirmed)." if is_match else "Shared secret mismatch!"
            return is_match, msg

    # =========================================================================
    # Post-Quantum Message Encryption & Decryption (AES-256-GCM)
    # =========================================================================

    def encrypt_user_message(self, session_id: str, key_id: str, plaintext: str) -> Dict[str, Any]:
        """Encrypts an arbitrary user message using AES-256-GCM with the ML-KEM shared secret.
        
        Args:
            session_id: Active session.
            key_id: Target keypair reference.
            plaintext: Text to encrypt.
            
        Returns:
            Dict containing nonce_hex, ciphertext_hex, latency_us, and payload sizes.
        """
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            if ref._sender_shared_secret is None:
                raise ValueError("Cannot encrypt: ML-KEM shared secret has not been encapsulated yet.")

            t0 = time.perf_counter_ns()
            # Shared secret is exactly 32 bytes (256 bits), perfect for AES-256-GCM
            aesgcm = AESGCM(ref._sender_shared_secret)
            nonce = os.urandom(12)  # Standard 96-bit NIST GCM nonce
            ct_bytes = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
            t_elapsed_us = (time.perf_counter_ns() - t0) / 1000.0

            ref.last_msg_nonce = nonce
            ref.last_msg_ciphertext = ct_bytes
            ref.last_msg_plaintext = plaintext

            return {
                "status": "success",
                "algorithm": f"AES-256-GCM (Keyed by {ref.parameter_set} 32-Byte Secret)",
                "plaintext_bytes": len(plaintext.encode("utf-8")),
                "nonce_hex": nonce.hex(),
                "ciphertext_hex": ct_bytes.hex(),
                "ciphertext_bytes": len(ct_bytes),
                "auth_tag_bytes": 16,
                "encryption_latency_us": round(t_elapsed_us, 2),
            }

    def decrypt_user_message(
        self,
        session_id: str,
        key_id: str,
        custom_ciphertext_hex: Optional[str] = None,
        custom_nonce_hex: Optional[str] = None
    ) -> Dict[str, Any]:
        """Decrypts the ciphertext using Alice's recovered ML-KEM secret.
        
        If the ciphertext has been modified or the key doesn't match,
        AES-GCM authentication tag verification will raise InvalidTag and fail safely.
        """
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            if ref._recipient_shared_secret is None:
                raise ValueError("Cannot decrypt: Recipient has not decapsulated the ML-KEM secret yet.")

            # Resolve nonce and ciphertext
            if custom_nonce_hex:
                try:
                    nonce = bytes.fromhex(custom_nonce_hex)
                except ValueError:
                    raise ValueError("Malformed nonce hex string.")
            elif ref.last_msg_nonce:
                nonce = ref.last_msg_nonce
            else:
                raise ValueError("No encrypted message available to decrypt. Encrypt a message first.")

            if custom_ciphertext_hex:
                try:
                    ct_bytes = bytes.fromhex(custom_ciphertext_hex)
                except ValueError:
                    raise ValueError("Malformed ciphertext hex string.")
            elif ref.last_msg_ciphertext:
                ct_bytes = ref.last_msg_ciphertext
            else:
                raise ValueError("No ciphertext available to decrypt.")

            t0 = time.perf_counter_ns()
            aesgcm = AESGCM(ref._recipient_shared_secret)
            try:
                decrypted_bytes = aesgcm.decrypt(nonce, ct_bytes, None)
                t_elapsed_us = (time.perf_counter_ns() - t0) / 1000.0
                plaintext = decrypted_bytes.decode("utf-8", errors="replace")

                return {
                    "status": "success",
                    "authenticated": True,
                    "plaintext": plaintext,
                    "decryption_latency_us": round(t_elapsed_us, 2),
                    "message": "Message authenticated and decrypted successfully with ML-KEM recovered key!"
                }
            except InvalidTag:
                return {
                    "status": "authentication_failed",
                    "authenticated": False,
                    "plaintext": None,
                    "error": "AUTHENTICATION FAILURE: AES-GCM Tag mismatch! The message has been tampered with or decrypted with an invalid key."
                }

    def get_public_metadata(self, session_id: str, key_id: str) -> Dict[str, Any]:
        """Returns safe public metadata for dashboard display.
        
        Strictly guarantees NO private key or raw shared secret leakage.
        """
        with self._lock:
            ref = self.get_key_reference(session_id, key_id)
            return {
                "key_id": ref.key_id,
                "parameter_set": ref.parameter_set,
                "public_key_len": ref.public_key_len,
                "private_key_len": ref.private_key_len,
                "ciphertext_len": ref.ciphertext_len,
                "has_ciphertext": ref.ciphertext_bytes is not None,
                "has_sender_secret": ref._sender_shared_secret is not None,
                "has_recipient_secret": ref._recipient_shared_secret is not None,
                "verified_match": ref.verified_match,
                "has_encrypted_msg": ref.last_msg_ciphertext is not None,
                "last_msg_nonce_hex": ref.last_msg_nonce.hex() if ref.last_msg_nonce else None,
                "created_at": ref.created_at,
                "expires_at": ref.expires_at,
                "public_key_hex_preview": ref.public_key_bytes[:16].hex() + "...",
                "ciphertext_hex_preview": (ref.ciphertext_bytes[:16].hex() + "...") if ref.ciphertext_bytes else None,
            }

    def clear_session(self, session_id: str):
        """Clears all keys in a session."""
        with self._lock:
            if session_id in self._sessions:
                for ref in self._sessions[session_id].values():
                    ref.clear()
                del self._sessions[session_id]

    def _cleanup_expired_unlocked(self):
        """Removes expired sessions and keys (must be called with lock held)."""
        now = time.time()
        empty_sessions = []
        for sess_id, keys in self._sessions.items():
            expired_keys = [kid for kid, ref in keys.items() if ref.expires_at <= now]
            for kid in expired_keys:
                keys[kid].clear()
                del keys[kid]
            if not keys:
                empty_sessions.append(sess_id)
        for sess_id in empty_sessions:
            del self._sessions[sess_id]
