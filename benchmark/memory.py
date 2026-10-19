"""
Memory Instrumentation and Profiling Module.
Combines Python tracemalloc (Python-managed heap) with psutil (OS-level Process RSS)
to provide comprehensive memory telemetry for cryptographic operations.
"""

import os
import gc
import psutil
import tracemalloc
from typing import Callable, Any, Dict, Tuple


class MemoryProfiler:
    """Profiles memory consumption across Python heap and OS process space."""

    def __init__(self):
        self._proc = psutil.Process(os.getpid())

    def get_process_rss_bytes(self) -> int:
        """Returns the current process Resident Set Size (RSS) in bytes."""
        return self._proc.memory_info().rss

    def profile_operation(self, func: Callable[[], Any], iterations: int = 100) -> Dict[str, Any]:
        """Profiles memory consumption during repeated execution of an operation.
        
        Args:
            func: Zero-argument callable to profile.
            iterations: Number of invocations.
            
        Returns:
            Dictionary containing heap peak, RSS start/end/delta, and methodology notes.
        """
        # Force garbage collection to establish clean baseline
        gc.collect()
        
        rss_start = self.get_process_rss_bytes()
        tracemalloc.start()
        tracemalloc.reset_peak()

        results = []
        for _ in range(iterations):
            results.append(func())

        current_heap, peak_heap = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        # Clean up temporary result objects before taking final RSS
        del results
        gc.collect()
        rss_end = self.get_process_rss_bytes()
        rss_delta = max(0, rss_end - rss_start)

        return {
            "iterations": iterations,
            "python_heap_peak_bytes": peak_heap,
            "python_heap_peak_kb": round(peak_heap / 1024.0, 2),
            "python_heap_current_bytes": current_heap,
            "process_rss_start_bytes": rss_start,
            "process_rss_end_bytes": rss_end,
            "process_rss_delta_bytes": rss_delta,
            "process_rss_delta_kb": round(rss_delta / 1024.0, 2),
            "per_op_heap_bytes": round(peak_heap / max(1, iterations), 2),
            "methodology_note": (
                "Python heap peak measured via tracemalloc captures Python-managed objects. "
                "Process RSS delta measured via psutil captures total OS working set memory "
                "including native C/Rust cryptographic code and stack buffers."
            ),
        }
