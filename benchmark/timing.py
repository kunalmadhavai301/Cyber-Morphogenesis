"""
High-Resolution Monotonic Timing Module.
Uses time.perf_counter_ns for sub-microsecond precision.
Provides warm-up isolation, calibration, and timed operation execution.
"""

import time
from typing import Callable, Any, Tuple, List


class BenchmarkTimer:
    """High-resolution timing harness for microsecond and nanosecond benchmarking."""

    @staticmethod
    def get_timer_info() -> dict:
        """Returns clock metadata and resolution."""
        info = time.get_clock_info("perf_counter")
        return {
            "implementation": info.implementation,
            "resolution_ns": info.resolution * 1e9,
            "resolution_sec": info.resolution,
            "monotonic": info.monotonic,
        }

    @staticmethod
    def time_single_op(func: Callable[[], Any]) -> Tuple[Any, int]:
        """Times a single execution of a zero-argument callable.
        
        Returns:
            Tuple of (function_result, duration_ns)
        """
        t0 = time.perf_counter_ns()
        result = func()
        duration_ns = time.perf_counter_ns() - t0
        return result, duration_ns

    @staticmethod
    def run_warmup(warmup_func: Callable[[], Any], iterations: int = 20):
        """Executes warm-up iterations to ensure JIT/cache stabilization
        prior to recording benchmark measurements."""
        for _ in range(max(1, iterations)):
            try:
                warmup_func()
            except Exception:
                pass
