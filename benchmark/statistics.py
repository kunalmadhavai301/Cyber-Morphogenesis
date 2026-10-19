"""
Statistical Computation Module for Cryptographic Benchmarking.
Calculates rigorous summary statistics: mean, median, min, max, standard deviation,
95th-percentile, 95% confidence intervals, IQR, and throughput.
"""

import math
from typing import List, Dict, Any, Optional
import numpy as np


class BenchmarkStatistics:
    """Computes descriptive and inferential statistics for timing observations."""

    @staticmethod
    def calculate(
        latencies_ns: List[int],
        total_duration_ns: int,
        successful_ops: int,
        failed_ops: int = 0
    ) -> Dict[str, Any]:
        """Calculates comprehensive statistical metrics from raw nanosecond measurements.
        
        Args:
            latencies_ns: List of execution times per operation in nanoseconds.
            total_duration_ns: Total benchmark runtime in nanoseconds.
            successful_ops: Count of successful trials.
            failed_ops: Count of failed trials.
            
        Returns:
            Dictionary containing metrics formatted in both microseconds (µs) and milliseconds (ms).
        """
        n = len(latencies_ns)
        if n == 0:
            return {
                "sample_size": 0,
                "successful_ops": successful_ops,
                "failed_ops": failed_ops,
                "total_duration_ms": round(total_duration_ns / 1_000_000.0, 3),
                "throughput_ops_per_sec": 0.0,
                "mean_us": 0.0,
                "median_us": 0.0,
                "std_dev_us": 0.0,
                "min_us": 0.0,
                "max_us": 0.0,
                "p95_us": 0.0,
                "p99_us": 0.0,
                "iqr_us": 0.0,
                "ci95_lower_us": 0.0,
                "ci95_upper_us": 0.0,
            }

        # Convert nanoseconds to microseconds array for analysis
        data_us = np.array(latencies_ns, dtype=np.float64) / 1_000.0

        mean_us = float(np.mean(data_us))
        median_us = float(np.median(data_us))
        std_us = float(np.std(data_us, ddof=1)) if n > 1 else 0.0
        min_us = float(np.min(data_us))
        max_us = float(np.max(data_us))
        p95_us = float(np.percentile(data_us, 95))
        p99_us = float(np.percentile(data_us, 99))
        p25_us = float(np.percentile(data_us, 25))
        p75_us = float(np.percentile(data_us, 75))
        iqr_us = p75_us - p25_us

        # 95% Confidence Interval of the Mean (using standard error)
        # For n >= 30, z ~ 1.96; for smaller n, student-t approximation
        if n > 1 and std_us > 0:
            sem = std_us / math.sqrt(n)
            z_score = 1.96 if n >= 30 else 2.045
            ci_lower = max(0.0, mean_us - z_score * sem)
            ci_upper = mean_us + z_score * sem
        else:
            ci_lower = mean_us
            ci_upper = mean_us

        # Throughput: operations per second
        total_sec = total_duration_ns / 1_000_000_000.0
        throughput = float(successful_ops / total_sec) if total_sec > 0 else 0.0

        return {
            "sample_size": n,
            "successful_ops": successful_ops,
            "failed_ops": failed_ops,
            "total_duration_ms": round(total_duration_ns / 1_000_000.0, 3),
            "throughput_ops_per_sec": round(throughput, 2),
            # Microsecond metrics
            "mean_us": round(mean_us, 2),
            "median_us": round(median_us, 2),
            "std_dev_us": round(std_us, 2),
            "min_us": round(min_us, 2),
            "max_us": round(max_us, 2),
            "p95_us": round(p95_us, 2),
            "p99_us": round(p99_us, 2),
            "iqr_us": round(iqr_us, 2),
            "ci95_mean_us": [round(ci_lower, 2), round(ci_upper, 2)],
            # Millisecond equivalents for report tables
            "mean_ms": round(mean_us / 1000.0, 4),
            "median_ms": round(median_us / 1000.0, 4),
            "p95_ms": round(p95_us / 1000.0, 4),
        }
