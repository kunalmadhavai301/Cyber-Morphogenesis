"""
Benchmark Runner and Coordinator Module.
Coordinates benchmark execution, environment metadata capture, progress reporting,
input validation, and database ingestion.
"""

import uuid
import time
import platform
import psutil
from typing import Dict, Any, Optional, Callable

from .experiments import BenchmarkExperiments
from .statistics import BenchmarkStatistics
from crypto.mlkem_service import MLKEMService
from config import Config, FIPS_203_PARAMETERS


class BenchmarkRunner:
    """Coordinates and executes bounded benchmark jobs with full system telemetry."""

    def __init__(self, service: Optional[MLKEMService] = None):
        self.service = service or MLKEMService()
        self.experiments = BenchmarkExperiments(self.service)

    @staticmethod
    def get_system_metadata() -> Dict[str, Any]:
        """Collects hardware and software execution environment metadata."""
        return {
            "os": platform.platform(),
            "os_family": platform.system(),
            "cpu_arch": platform.machine(),
            "cpu_cores_logical": psutil.cpu_count(logical=True),
            "cpu_cores_physical": psutil.cpu_count(logical=False),
            "python_version": platform.python_version(),
            "python_compiler": platform.python_compiler(),
            "crypto_engine": "mlkem native engine (NIST FIPS 203)",
            "crypto_standard": "NIST FIPS 203 (Module-Lattice-Based KEM)",
        }

    def run_benchmark_job(
        self,
        parameter_set: str = "ML-KEM-768",
        operation: str = "all",
        trials: int = 100,
        warmup: int = 20,
        notes: str = ""
    ) -> Dict[str, Any]:
        """Executes a validated benchmark job and compiles complete telemetry.
        
        Args:
            parameter_set: 'ML-KEM-512', 'ML-KEM-768', or 'ML-KEM-1024'
            operation: 'keygen', 'encaps', 'decaps', or 'all'
            trials: Number of timed trials (bounded by Config.MAX_BENCHMARK_TRIALS)
            warmup: Number of warm-up iterations
            notes: User/researcher description
            
        Returns:
            Dictionary with experiment_id, environment metadata, operation results,
            and aggregate statistics.
        """
        # 1. Validation
        if parameter_set not in FIPS_203_PARAMETERS:
            raise ValueError(f"Invalid parameter set: '{parameter_set}'. Must be in {list(FIPS_203_PARAMETERS.keys())}")

        bounded_trials = max(1, min(trials, Config.MAX_BENCHMARK_TRIALS))
        bounded_warmup = max(0, min(warmup, Config.MAX_WARMUP_TRIALS))

        valid_ops = ["keygen", "encaps", "decaps", "all"]
        op_canonical = operation.lower().strip()
        if op_canonical not in valid_ops:
            raise ValueError(f"Invalid operation: '{operation}'. Must be one of {valid_ops}")

        experiment_id = f"exp_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        created_at = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        sys_meta = self.get_system_metadata()

        job_result = {
            "experiment_id": experiment_id,
            "timestamp": created_at,
            "parameter_set": parameter_set,
            "operation": op_canonical,
            "trials": bounded_trials,
            "warmup": bounded_warmup,
            "notes": notes,
            "environment": sys_meta,
            "operations": {},
        }

        # 2. Execution
        if op_canonical in ("keygen", "all"):
            res_a = self.experiments.run_experiment_a(parameter_set, trials=bounded_trials, warmup=bounded_warmup)
            job_result["operations"]["keygen"] = res_a["statistics"]

        if op_canonical in ("encaps", "all"):
            res_b = self.experiments.run_experiment_b(parameter_set, trials=bounded_trials, warmup=bounded_warmup)
            job_result["operations"]["encaps"] = res_b["statistics"]

        if op_canonical in ("decaps", "all"):
            res_c = self.experiments.run_experiment_c(parameter_set, trials=bounded_trials, warmup=bounded_warmup)
            job_result["operations"]["decaps"] = res_c["statistics"]

        # Calculate composite roundtrip latency if 'all' was run
        if op_canonical == "all":
            rt_median = round(
                job_result["operations"]["keygen"]["median_us"] +
                job_result["operations"]["encaps"]["median_us"] +
                job_result["operations"]["decaps"]["median_us"], 2
            )
            job_result["roundtrip_median_us"] = rt_median

        return job_result
