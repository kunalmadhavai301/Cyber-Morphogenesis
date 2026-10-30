"""
Configuration module for the ML-KEM Key Encapsulation Benchmarking Platform.
Adheres to NIST FIPS 203 (Module-Lattice-Based Key-Encapsulation Mechanism).
"""

from pathlib import Path
import os
from dataclasses import dataclass
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent
if os.environ.get("VERCEL"):
    DATA_DIR = Path("/tmp") / "data"
    RESULTS_DIR = Path("/tmp") / "results"
else:
    DATA_DIR = BASE_DIR / "data"
    RESULTS_DIR = BASE_DIR / "results"

DOCS_DIR = BASE_DIR / "docs"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


@dataclass(frozen=True)
class FIPS203ParameterSpec:
    """NIST FIPS 203 Parameter Specifications."""
    name: str
    claim_name: str
    matrix_dim_k: int
    nist_category: int
    classical_security_equiv: str
    public_key_bytes: int
    private_key_bytes: int  # Standard FIPS 203 serialized dk size
    ciphertext_bytes: int
    shared_secret_bytes: int
    description: str


FIPS_203_PARAMETERS: Dict[str, FIPS203ParameterSpec] = {
    "ML-KEM-512": FIPS203ParameterSpec(
        name="ML-KEM-512",
        claim_name="ML_KEM_512",
        matrix_dim_k=2,
        nist_category=1,
        classical_security_equiv="AES-128",
        public_key_bytes=800,
        private_key_bytes=1632,
        ciphertext_bytes=768,
        shared_secret_bytes=32,
        description="NIST Security Category 1 (AES-128 equivalent). Optimized for constrained environments."
    ),
    "ML-KEM-768": FIPS203ParameterSpec(
        name="ML-KEM-768",
        claim_name="ML_KEM_768",
        matrix_dim_k=3,
        nist_category=3,
        classical_security_equiv="AES-192",
        public_key_bytes=1184,
        private_key_bytes=2400,
        ciphertext_bytes=1088,
        shared_secret_bytes=32,
        description="NIST Security Category 3 (AES-192 equivalent). Default recommended parameter set for general use."
    ),
    "ML-KEM-1024": FIPS203ParameterSpec(
        name="ML-KEM-1024",
        claim_name="ML_KEM_1024",
        matrix_dim_k=4,
        nist_category=5,
        classical_security_equiv="AES-256",
        public_key_bytes=1568,
        private_key_bytes=3168,
        ciphertext_bytes=1568,
        shared_secret_bytes=32,
        description="NIST Security Category 5 (AES-256 equivalent). Maximum security tier for high-assurance assets."
    )
}


class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "mlkem-research-dev-insecure-key-2026")
    HOST = os.environ.get("HOST", "127.0.0.1")
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "t")

    # Security: ephemeral session key lifetime in seconds (15 minutes default)
    SESSION_KEY_TTL_SECONDS = int(os.environ.get("SESSION_KEY_TTL_SECONDS", 900))

    # Benchmark safeguards (prevent DoS or resource exhaustion)
    MAX_BENCHMARK_TRIALS = int(os.environ.get("MAX_BENCHMARK_TRIALS", 10000))
    DEFAULT_BENCHMARK_TRIALS = 100
    MAX_WARMUP_TRIALS = int(os.environ.get("MAX_WARMUP_TRIALS", 500))
    DEFAULT_WARMUP_TRIALS = 20

    # Paths
    SQLITE_DB_PATH = os.environ.get("DATABASE_PATH", str(DATA_DIR / "benchmark_experiments.sqlite3"))
    RESULTS_DIR_PATH = str(RESULTS_DIR)

    # Cryptography
    DEFAULT_KEM = "ML-KEM-768"
    SUPPORTED_KEMS = list(FIPS_203_PARAMETERS.keys())


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    DEBUG = False
    SQLITE_DB_PATH = ":memory:"
    DEFAULT_BENCHMARK_TRIALS = 10
    DEFAULT_WARMUP_TRIALS = 2


class ProductionConfig(Config):
    DEBUG = False
    # Ensure production strictly binds to loopback unless explicitly overridden with proper auth
    HOST = "127.0.0.1"


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
