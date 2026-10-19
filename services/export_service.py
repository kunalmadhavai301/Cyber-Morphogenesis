"""
Export and Reporting Service.
Handles CSV export of experimental data, Matplotlib figure generation,
and academic research report compilation.
"""

import io
import csv
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless server rendering
import matplotlib.pyplot as plt

from storage.database import BenchmarkDatabase
from config import Config, FIPS_203_PARAMETERS


class ExportService:
    """Generates standard CSV exports and research-grade visual figures and reports."""

    def __init__(self, db: Optional[BenchmarkDatabase] = None):
        self.db = db or BenchmarkDatabase()

    def export_csv_string(self) -> str:
        """Exports all recorded benchmark operations to a CSV string."""
        experiments = self.db.list_experiments(limit=1000)
        output = io.StringIO()
        fieldnames = [
            "experiment_id", "timestamp", "parameter_set", "operation_name", "trials", "warmup",
            "successful_ops", "failed_ops", "total_duration_ms", "throughput_ops_sec",
            "mean_us", "median_us", "std_dev_us", "min_us", "max_us", "p95_us", "p99_us", "iqr_us",
            "ci95_lower_us", "ci95_upper_us", "os_info", "cpu_arch", "python_version", "crypto_engine", "notes"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for exp in experiments:
            full_exp = self.db.get_experiment(exp["experiment_id"])
            if not full_exp:
                continue

            for op_name, op in full_exp.get("operations", {}).items():
                writer.writerow({
                    "experiment_id": full_exp["experiment_id"],
                    "timestamp": full_exp["timestamp"],
                    "parameter_set": full_exp["parameter_set"],
                    "operation_name": op_name,
                    "trials": full_exp["trials"],
                    "warmup": full_exp["warmup"],
                    "successful_ops": op.get("successful_ops", 0),
                    "failed_ops": op.get("failed_ops", 0),
                    "total_duration_ms": op.get("total_duration_ms", 0.0),
                    "throughput_ops_sec": op.get("throughput_ops_sec", 0.0),
                    "mean_us": op.get("mean_us", 0.0),
                    "median_us": op.get("median_us", 0.0),
                    "std_dev_us": op.get("std_dev_us", 0.0),
                    "min_us": op.get("min_us", 0.0),
                    "max_us": op.get("max_us", 0.0),
                    "p95_us": op.get("p95_us", 0.0),
                    "p99_us": op.get("p99_us", 0.0),
                    "iqr_us": op.get("iqr_us", 0.0),
                    "ci95_lower_us": op.get("ci95_lower_us", 0.0),
                    "ci95_upper_us": op.get("ci95_upper_us", 0.0),
                    "os_info": full_exp.get("os_info", ""),
                    "cpu_arch": full_exp.get("cpu_arch", ""),
                    "python_version": full_exp.get("python_version", ""),
                    "crypto_engine": full_exp.get("crypto_engine", ""),
                    "notes": full_exp.get("notes", ""),
                })

        return output.getvalue()

    def generate_research_figure(self, comparison_data: Dict[str, Any], output_path: Optional[str] = None) -> str:
        """Generates a high-resolution comparative visualization of ML-KEM parameter sets."""
        path = output_path or str(Path(Config.RESULTS_DIR_PATH) / "mlkem_parameter_comparison.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=150)
        fig.patch.set_facecolor("#1e293b")

        params = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]
        comp = comparison_data.get("comparison", {})

        # Subplot 1: Median Latencies
        keygen_times = [comp.get(p, {}).get("latency_us", {}).get("keygen_median", 0) for p in params]
        encap_times = [comp.get(p, {}).get("latency_us", {}).get("encaps_median", 0) for p in params]
        decap_times = [comp.get(p, {}).get("latency_us", {}).get("decaps_median", 0) for p in params]

        x = range(len(params))
        width = 0.25

        for ax in (ax1, ax2):
            ax.set_facecolor("#0f172a")
            ax.tick_params(colors="#cbd5e1")
            for spine in ax.spines.values():
                spine.set_color("#334155")
            ax.grid(True, linestyle="--", alpha=0.3, color="#475569")

        ax1.bar([i - width for i in x], keygen_times, width, label="KeyGen", color="#38bdf8")
        ax1.bar(x, encap_times, width, label="Encaps", color="#4ade80")
        ax1.bar([i + width for i in x], decap_times, width, label="Decaps", color="#f472b6")
        ax1.set_xticks(x)
        ax1.set_xticklabels(params, fontweight="bold")
        ax1.set_ylabel("Median Latency (µs)", color="#cbd5e1")
        ax1.set_title("Computational Latency by Operation", color="#f8fafc", fontweight="bold", pad=12)
        ax1.legend(facecolor="#1e293b", edgecolor="#475569", labelcolor="#f8fafc")

        # Subplot 2: Communication Overhead (Sizes)
        pk_sizes = [comp.get(p, {}).get("sizes", {}).get("public_key_bytes", 0) for p in params]
        ct_sizes = [comp.get(p, {}).get("sizes", {}).get("ciphertext_bytes", 0) for p in params]

        ax2.bar(x, pk_sizes, width=0.4, label="Public Key (ek)", color="#818cf8")
        ax2.bar(x, ct_sizes, width=0.4, bottom=pk_sizes, label="Ciphertext (c)", color="#f59e0b")
        ax2.set_xticks(x)
        ax2.set_xticklabels(params, fontweight="bold")
        ax2.set_ylabel("Size (Bytes)", color="#cbd5e1")
        ax2.set_title("Communication Transmission Overhead", color="#f8fafc", fontweight="bold", pad=12)
        ax2.legend(facecolor="#1e293b", edgecolor="#475569", labelcolor="#f8fafc")

        plt.tight_layout()
        plt.savefig(path, facecolor=fig.get_facecolor(), edgecolor="none")
        plt.close(fig)
        return path
