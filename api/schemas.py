"""
Request and Response Validation Schemas using Pydantic.
Enforces strict bounds and sanitization on all user inputs.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
from config import FIPS_203_PARAMETERS


class SessionInitResponse(BaseModel):
    session_id: str
    message: str


class KeygenRequest(BaseModel):
    parameter_set: str = Field(default="ML-KEM-768", description="NIST FIPS 203 Parameter Set")
    session_id: Optional[str] = Field(default=None, description="Optional existing session ID")

    @field_validator("parameter_set")
    @classmethod
    def validate_parameter_set(cls, v: str) -> str:
        clean = v.strip().upper()
        if clean not in FIPS_203_PARAMETERS:
            raise ValueError(f"Parameter set must be one of {list(FIPS_203_PARAMETERS.keys())}")
        return clean


class EncapsulateRequest(BaseModel):
    session_id: str = Field(..., min_length=16, max_length=64)
    key_id: str = Field(..., min_length=8, max_length=64)


class DecapsulateRequest(BaseModel):
    session_id: str = Field(..., min_length=16, max_length=64)
    key_id: str = Field(..., min_length=8, max_length=64)
    custom_ciphertext_hex: Optional[str] = Field(default=None, description="Optional modified ciphertext for testing")


class VerifyRequest(BaseModel):
    session_id: str = Field(..., min_length=16, max_length=64)
    key_id: str = Field(..., min_length=8, max_length=64)


class EncryptMessageRequest(BaseModel):
    session_id: str = Field(..., min_length=16, max_length=64)
    key_id: str = Field(..., min_length=8, max_length=64)
    plaintext: str = Field(..., min_length=1, max_length=10000, description="Plaintext message to encrypt")


class DecryptMessageRequest(BaseModel):
    session_id: str = Field(..., min_length=16, max_length=64)
    key_id: str = Field(..., min_length=8, max_length=64)
    custom_ciphertext_hex: Optional[str] = Field(default=None, description="Optional tampered or custom ciphertext")
    custom_nonce_hex: Optional[str] = Field(default=None, description="Optional custom nonce")


class BenchmarkRunRequest(BaseModel):
    parameter_set: str = Field(default="ML-KEM-768")
    operation: Literal["keygen", "encaps", "decaps", "all"] = Field(default="all")
    trials: int = Field(default=100, ge=1, le=10000)
    warmup: int = Field(default=20, ge=0, le=500)
    notes: Optional[str] = Field(default="", max_length=255)

    @field_validator("parameter_set")
    @classmethod
    def validate_parameter_set(cls, v: str) -> str:
        clean = v.strip().upper()
        if clean not in FIPS_203_PARAMETERS:
            raise ValueError(f"Parameter set must be one of {list(FIPS_203_PARAMETERS.keys())}")
        return clean
