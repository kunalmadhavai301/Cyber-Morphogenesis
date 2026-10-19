"""
ML-KEM Key Encapsulation Benchmarking Platform.
Main Flask Application Factory and Web Route Controller.
Conforms to NIST FIPS 203.
"""

from flask import Flask, render_template, jsonify, send_from_directory
from pathlib import Path
import os

from config import config_by_name, FIPS_203_PARAMETERS
from api.routes import api_bp
from services.results_service import ResultsService
from storage.database import BenchmarkDatabase


def create_app(config_name: str = "default") -> Flask:
    """Application factory for the ML-KEM benchmarking platform."""
    app = Flask(__name__)
    cfg = config_by_name.get(config_name, config_by_name["default"])
    app.config.from_object(cfg)

    # Initialize database and services
    db = BenchmarkDatabase(app.config.get("SQLITE_DB_PATH"))
    results_service = ResultsService(db)

    # Register API blueprint
    app.register_blueprint(api_bp)

    # =========================================================================
    # Security Headers Middleware
    # =========================================================================
    @app.after_request
    def apply_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Content Security Policy accommodating Bootstrap, FontAwesome, and Chart.js
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; "
            "img-src 'self' data:; "
            "connect-src 'self';"
        )
        return response

    # =========================================================================
    # Web UI Page Routes (Pages 1 to 7)
    # =========================================================================

    @app.route("/")
    def index():
        """PAGE 1: Overview Dashboard."""
        summary = results_service.get_dashboard_summary()
        return render_template("index.html", summary=summary, parameters=FIPS_203_PARAMETERS)

    @app.route("/demonstration")
    def demonstration():
        """PAGE 2: Cryptographic Demonstration."""
        return render_template("demonstration.html", parameters=FIPS_203_PARAMETERS)

    @app.route("/benchmark")
    def benchmark():
        """PAGE 3: Benchmark Lab."""
        return render_template("benchmark.html", parameters=FIPS_203_PARAMETERS)

    @app.route("/comparison")
    def comparison():
        """PAGE 4: Comparative Analysis."""
        return render_template("comparison.html", parameters=FIPS_203_PARAMETERS)

    @app.route("/history")
    def history():
        """PAGE 5: Experiment History."""
        experiments = db.list_experiments(limit=100)
        return render_template("history.html", experiments=experiments)

    @app.route("/report")
    def report():
        """PAGE 6: Research Report."""
        experiments = db.list_experiments(limit=50)
        return render_template("report.html", experiments=experiments, parameters=FIPS_203_PARAMETERS)

    @app.route("/documentation")
    def documentation():
        """PAGE 7: About and Documentation."""
        return render_template("documentation.html", parameters=FIPS_203_PARAMETERS)

    # =========================================================================
    # Error Handlers
    # =========================================================================

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    env = os.environ.get("FLASK_ENV", "development")
    application = create_app(env)
    host = application.config.get("HOST", "127.0.0.1")
    port = application.config.get("PORT", 5000)
    debug = application.config.get("DEBUG", False)

    print("\n" + "=" * 70)
    print(" NIST FIPS 203 ML-KEM BENCHMARKING PLATFORM")
    print(f" Server running at: http://{host}:{port}")
    print(f" Environment: {env} (Debug: {debug})")
    print("=" * 70 + "\n")

    application.run(host=host, port=port, debug=debug)
