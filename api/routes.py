"""
REST API Routes for Cryptographic Key Encapsulation and Benchmarking.
Enforces session isolation, input sanitization, safe error handling,
and strict non-leakage of cryptographic secrets.
"""

from flask import Blueprint, request, jsonify, Response
from pydantic import ValidationError
import time

from crypto.mlkem_service import MLKEMService, CryptoError
from crypto.key_management import SessionKeyManager
from crypto.verification import CryptoVerifier
from benchmark.runner import BenchmarkRunner
from services.results_service import ResultsService
from services.export_service import ExportService
from storage.database import BenchmarkDatabase
from config import FIPS_203_PARAMETERS
from .schemas import (
    KeygenRequest,
    EncapsulateRequest,
    DecapsulateRequest,
    VerifyRequest,
    BenchmarkRunRequest,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")

# Shared singletons for the API lifecycle
crypto_service = MLKEMService()
key_manager = SessionKeyManager(default_ttl_seconds=900)
db = BenchmarkDatabase()
runner = BenchmarkRunner(crypto_service)
results_service = ResultsService(db)
export_service = ExportService(db)


# =============================================================================
# Diagnostic & Health Endpoints
# =============================================================================

@api_bp.route("/health", methods=["GET"])
def health():
    """Returns application health, version, and cryptographic backend status."""
    return jsonify({
        "status": "healthy",
        "standard": "NIST FIPS 203 (ML-KEM)",
        "backend": "mlkem native engine",
        "timestamp": time.time(),
    })


@api_bp.route("/algorithms", methods=["GET"])
def get_algorithms():
    """Returns metadata for all supported standardized ML-KEM parameter sets."""
    algorithms = {}
    for name, spec in FIPS_203_PARAMETERS.items():
        algorithms[name] = {
            "name": spec.name,
            "nist_category": spec.nist_category,
            "matrix_dim_k": spec.matrix_dim_k,
            "classical_security_equiv": spec.classical_security_equiv,
            "public_key_bytes": spec.public_key_bytes,
            "private_key_bytes": spec.private_key_bytes,
            "ciphertext_bytes": spec.ciphertext_bytes,
            "shared_secret_bytes": spec.shared_secret_bytes,
            "description": spec.description,
        }
    return jsonify({"supported_algorithms": algorithms})


# =============================================================================
# Demonstration & Cryptographic Workflow Endpoints
# =============================================================================

@api_bp.route("/kem/session", methods=["POST"])
def create_session():
    """Initializes a new isolated demonstration session."""
    session_id = key_manager.create_session()
    return jsonify({
        "session_id": session_id,
        "message": "Session initialized. Ephemeral keys will expire after TTL.",
    })


@api_bp.route("/kem/keygen", methods=["POST"])
def kem_keygen():
    """Generates an ML-KEM key pair.
    
    Security: Private key is retained in ephemeral memory only.
    Raw private key material is NEVER returned in the API response.
    """
    try:
        data = request.get_json() or {}
        req = KeygenRequest(**data)
    except ValidationError as e:
        details = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": details}), 400

    session_id = req.session_id or key_manager.create_session()

    try:
        kp = crypto_service.generate_keypair(req.parameter_set)
        key_id = key_manager.store_keypair(session_id, kp)
        meta = key_manager.get_public_metadata(session_id, key_id)

        return jsonify({
            "status": "success",
            "session_id": session_id,
            "key_id": key_id,
            "parameter_set": kp.parameter_set,
            "public_key_len": kp.public_key_len,
            "private_key_len": kp.private_key_len,
            "execution_time_us": kp.execution_time_us,
            "metadata": meta,
            "private_key_status": "Securely retained in ephemeral memory (REDACTED)",
        })
    except CryptoError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal cryptographic error: {e}"}), 500


@api_bp.route("/kem/encapsulate", methods=["POST"])
def kem_encapsulate():
    """Encapsulates a shared secret using the session public key.
    
    Security: Shared secret is retained in memory; never exposed in API response.
    """
    try:
        data = request.get_json() or {}
        req = EncapsulateRequest(**data)
    except ValidationError as e:
        details = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": details}), 400

    try:
        key_ref = key_manager.get_key_reference(req.session_id, req.key_id)
        encap = crypto_service.encapsulate(key_ref.parameter_set, key_ref.public_key_bytes)
        key_manager.store_encapsulation(req.session_id, req.key_id, encap)
        meta = key_manager.get_public_metadata(req.session_id, req.key_id)

        return jsonify({
            "status": "success",
            "session_id": req.session_id,
            "key_id": req.key_id,
            "parameter_set": key_ref.parameter_set,
            "ciphertext_len": encap.ciphertext_len,
            "shared_secret_len": encap.shared_secret_len,
            "execution_time_us": encap.execution_time_us,
            "ciphertext_hex_preview": meta["ciphertext_hex_preview"],
            "sender_shared_secret": "Hidden (32 bytes established)",
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except CryptoError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal encapsulation error: {e}"}), 500


@api_bp.route("/kem/decapsulate", methods=["POST"])
def kem_decapsulate():
    """Decapsulates the ciphertext using the recipient's private key.
    
    Security: Recovered shared secret is retained in memory for matching verification.
    """
    try:
        data = request.get_json() or {}
        req = DecapsulateRequest(**data)
    except ValidationError as e:
        details = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": details}), 400

    try:
        key_ref = key_manager.get_key_reference(req.session_id, req.key_id)
        if key_ref.ciphertext_bytes is None and not req.custom_ciphertext_hex:
            return jsonify({"error": "No ciphertext available to decapsulate. Run encapsulation first."}), 400

        # Support optional custom ciphertext for negative/implicit rejection testing
        if req.custom_ciphertext_hex:
            try:
                ct_bytes = bytes.fromhex(req.custom_ciphertext_hex)
            except ValueError:
                return jsonify({"error": "Malformed custom ciphertext hex string."}), 400
        else:
            ct_bytes = key_ref.ciphertext_bytes

        decap = crypto_service.decapsulate(key_ref.parameter_set, key_ref._private_key_obj, ct_bytes)
        key_manager.store_decapsulation(req.session_id, req.key_id, decap)

        return jsonify({
            "status": "success",
            "session_id": req.session_id,
            "key_id": req.key_id,
            "parameter_set": key_ref.parameter_set,
            "shared_secret_len": decap.shared_secret_len,
            "execution_time_us": decap.execution_time_us,
            "recipient_shared_secret": "Hidden (32 bytes recovered)",
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except CryptoError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal decapsulation error: {e}"}), 500


@api_bp.route("/kem/verify", methods=["POST"])
def kem_verify():
    """Verifies that the sender's and recipient's shared secrets match in constant-time.
    
    Returns non-revealing SHA-256 fingerprint and boolean match status.
    """
    try:
        data = request.get_json() or {}
        req = VerifyRequest(**data)
    except ValidationError as e:
        details = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": details}), 400

    try:
        key_ref = key_manager.get_key_reference(req.session_id, req.key_id)
        is_match, message = key_manager.verify_shared_secrets(req.session_id, req.key_id)

        fingerprint = CryptoVerifier.get_safe_secret_fingerprint(key_ref._sender_shared_secret)

        return jsonify({
            "status": "success",
            "verified_match": is_match,
            "message": message,
            "secret_fingerprint": fingerprint,
            "constant_time_verification": True,
        })
    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Verification error: {e}"}), 500


# =============================================================================
# Benchmarking & Experiment Endpoints
# =============================================================================

@api_bp.route("/benchmark/run", methods=["POST"])
def run_benchmark():
    """Executes a bounded benchmark workload, computes statistics, and persists to SQLite."""
    try:
        data = request.get_json() or {}
        req = BenchmarkRunRequest(**data)
    except ValidationError as e:
        details = [f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in e.errors()]
        return jsonify({"error": "Validation failed", "details": details}), 400

    try:
        job_result = runner.run_benchmark_job(
            parameter_set=req.parameter_set,
            operation=req.operation,
            trials=req.trials,
            warmup=req.warmup,
            notes=req.notes or "",
        )
        # Ingest into SQLite database
        db.save_experiment(job_result)

        return jsonify({
            "status": "success",
            "result": job_result,
        })
    except Exception as e:
        return jsonify({"error": f"Benchmark execution error: {e}"}), 500


@api_bp.route("/benchmark/results", methods=["GET"])
def get_benchmark_results():
    """Retrieves recent benchmark experiment summaries."""
    limit = min(int(request.args.get("limit", 50)), 100)
    experiments = db.list_experiments(limit=limit)
    return jsonify({
        "count": len(experiments),
        "experiments": experiments,
    })


@api_bp.route("/benchmark/results/<experiment_id>", methods=["GET"])
def get_experiment_detail(experiment_id: str):
    """Retrieves full details of a specific benchmark experiment."""
    exp = db.get_experiment(experiment_id)
    if not exp:
        return jsonify({"error": f"Experiment '{experiment_id}' not found."}), 404
    return jsonify({"experiment": exp})


@api_bp.route("/benchmark/comparison", methods=["GET"])
def get_comparison():
    """Executes or retrieves comparative analysis across ML-KEM-512, 768, and 1024."""
    trials = min(int(request.args.get("trials", 100)), 500)
    warmup = min(int(request.args.get("warmup", 20)), 50)
    comp = results_service.get_parameter_comparison(trials=trials, warmup=warmup)
    return jsonify(comp)


@api_bp.route("/benchmark/classical-comparison", methods=["GET"])
def get_classical_comparison():
    """Executes or retrieves classical vs post-quantum comparison (Experiment J)."""
    trials = min(int(request.args.get("trials", 100)), 500)
    classical = results_service.get_classical_comparison(trials=trials)
    return jsonify(classical)


@api_bp.route("/benchmark/export/csv", methods=["GET"])
def export_csv():
    """Streams a standardized CSV export of benchmark measurements."""
    csv_content = export_service.export_csv_string()
    filename = f"mlkem_benchmark_export_{int(time.time())}.csv"
    return Response(
        csv_content,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
