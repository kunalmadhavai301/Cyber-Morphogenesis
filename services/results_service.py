"""
Results and Analytics Processing Service.
Aggregates experimental data for dashboard widgets, historical views,
and comparative statistical summaries.
"""

from typing import Dict, Any, List, Optional
from storage.database import BenchmarkDatabase
from benchmark.experiments import BenchmarkExperiments
from config import FIPS_203_PARAMETERS


class ResultsService:
    """Provides aggregated metrics and summaries for frontend visualization."""

    def __init__(self, db: Optional[BenchmarkDatabase] = None):
        self.db = db or BenchmarkDatabase()
        self.experiments = BenchmarkExperiments()

    def get_dashboard_summary(self) -> Dict[str, Any]:
        """Returns high-level statistics for Page 1 Overview Dashboard."""
        total_runs = self.db.count_experiments()
        recent_exps = self.db.list_experiments(limit=5)
        
        latest_exp = None
        if recent_exps:
            latest_exp = self.db.get_experiment(recent_exps[0]["experiment_id"])

        # Aggregate median latencies if available
        median_summary = {
            "keygen_median_us": None,
            "encaps_median_us": None,
            "decaps_median_us": None,
        }

        if latest_exp and "operations" in latest_exp:
            ops = latest_exp["operations"]
            if "keygen" in ops:
                median_summary["keygen_median_us"] = ops["keygen"]["median_us"]
            if "encaps" in ops:
                median_summary["encaps_median_us"] = ops["encaps"]["median_us"]
            if "decaps" in ops:
                median_summary["decaps_median_us"] = ops["decaps"]["median_us"]

        return {
            "total_benchmark_runs": total_runs,
            "has_data": total_runs > 0,
            "latest_experiment": latest_exp,
            "recent_experiments": recent_exps,
            "median_latencies": median_summary,
            "supported_parameters": list(FIPS_203_PARAMETERS.keys()),
        }

    def get_experiment_details(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves full details and measurements for a specific experiment."""
        return self.db.get_experiment(experiment_id)

    def get_parameter_comparison(self, trials: int = 100, warmup: int = 20) -> Dict[str, Any]:
        """Executes or returns a fresh live comparative sweep (Experiment I)."""
        return self.experiments.run_experiment_i(trials=trials, warmup=warmup)

    def get_classical_comparison(self, trials: int = 100) -> Dict[str, Any]:
        """Executes or returns classical vs post-quantum comparison (Experiment J)."""
        return self.experiments.run_experiment_j(trials=trials)
