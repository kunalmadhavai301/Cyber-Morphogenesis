#!/usr/bin/env python3
"""
CLI Benchmark Runner Script for ML-KEM Key Encapsulation (FIPS 203).
Executes reproducible experimental suites, compiles statistical summaries,
populates SQLite database, generates figures, and exports research CSVs.
"""

import argparse
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from crypto.mlkem_service import MLKEMService
from benchmark.runner import BenchmarkRunner
from benchmark.experiments import BenchmarkExperiments
from storage.database import BenchmarkDatabase
from services.export_service import ExportService


def format_table_row(cols, widths):
    return " | ".join(f"{str(c):<{w}}" for c, w in zip(cols, widths))


def main():
    parser = argparse.ArgumentParser(description="Reproducible ML-KEM (FIPS 203) Benchmark Suite")
    parser.add_argument("--trials", type=int, default=100, help="Number of benchmark iterations (default: 100)")
    parser.add_argument("--warmup", type=int, default=20, help="Number of warmup iterations (default: 20)")
    parser.add_argument("--export-fig", action="store_true", help="Generate research comparison figure in results/")
    parser.add_argument("--export-csv", action="store_true", help="Export full CSV dataset in results/")
    args = parser.parse_args()

    print("=" * 80)
    print(" ML-KEM (NIST FIPS 203) AUTOMATED RESEARCH BENCHMARK RUNNER")
    print(f" Trials: {args.trials} | Warmup: {args.warmup}")
    print("=" * 80)

    service = MLKEMService()
    runner = BenchmarkRunner(service)
    db = BenchmarkDatabase()
    experiments = BenchmarkExperiments(service)

    # 1. Execute Benchmark Jobs across ML-KEM-512, ML-KEM-768, ML-KEM-1024
    params = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]
    print("\n[1/3] Executing Standardized Parameter Set Benchmarks...")

    headers = ["Parameter", "Operation", "Mean (µs)", "Median (µs)", "P95 (µs)", "StdDev (µs)", "Throughput (ops/s)"]
    widths = [12, 10, 10, 12, 10, 12, 20]
    print("\n" + format_table_row(headers, widths))
    print("-" * 92)

    for p in params:
        job = runner.run_benchmark_job(p, operation="all", trials=args.trials, warmup=args.warmup, notes="CLI automated run")
        db.save_experiment(job)
        for op, stats in job["operations"].items():
            row = [
                p,
                op.capitalize(),
                f"{stats['mean_us']:.2f}",
                f"{stats['median_us']:.2f}",
                f"{stats['p95_us']:.2f}",
                f"{stats['std_dev_us']:.2f}",
                f"{stats['throughput_ops_per_sec']:,.1f}"
            ]
            print(format_table_row(row, widths))

    # 2. Execute Classical Comparison (Experiment J)
    print("\n[2/3] Evaluating Classical Key Agreement Baselines (Experiment J)...")
    exp_j = experiments.run_experiment_j(trials=args.trials)
    mechs = exp_j["mechanisms"]

    headers_j = ["Mechanism", "Security Level", "KeyGen (µs)", "Agreement (µs)", "Roundtrip (µs)", "Wire Overhead"]
    widths_j = [14, 25, 12, 15, 15, 14]
    print("\n" + format_table_row(headers_j, widths_j))
    print("-" * 102)

    for key, data in mechs.items():
        row_j = [
            key,
            data["classical_security"],
            f"{data['keygen_median_us']:.2f}",
            f"{data['agreement_median_us']:.2f}",
            f"{data['roundtrip_median_us']:.2f}",
            f"{data['total_communication_bytes']} Bytes"
        ]
        print(format_table_row(row_j, widths_j))

    # 3. Figure & CSV Exports
    print("\n[3/3] Generating Research Artifacts...")
    export_svc = ExportService(db)

    # Export figure
    comp_sweep = experiments.run_experiment_i(trials=args.trials, warmup=args.warmup)
    fig_path = export_svc.generate_research_figure(comp_sweep)
    print(f"[+] Research comparison figure generated: {fig_path}")

    # Export CSV
    csv_str = export_svc.export_csv_string()
    csv_path = Path("results") / "mlkem_benchmark_export.csv"
    csv_path.write_text(csv_str)
    print(f"[+] Full benchmark CSV dataset exported: {csv_path.resolve()}")

    print("\n" + "=" * 80)
    print(" [COMPLETED] Benchmark run finished successfully.")
    print(" Open the web dashboard via 'python app.py' to explore interactive charts.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
