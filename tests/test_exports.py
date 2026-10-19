"""
Tests for CSV Export and Research Figure Generation.
"""

import os
from pathlib import Path
import csv
import io
import pytest
from services.export_service import ExportService
from storage.database import BenchmarkDatabase
from benchmark.runner import BenchmarkRunner


@pytest.fixture
def exp_db(tmp_path):
    db_file = str(tmp_path / "test_exports.sqlite3")
    db = BenchmarkDatabase(db_file)
    # Seed one benchmark
    runner = BenchmarkRunner()
    res = runner.run_benchmark_job("ML-KEM-768", operation="all", trials=5, warmup=1, notes="Export test")
    db.save_experiment(res)
    return db


def test_csv_export_format(exp_db):
    service = ExportService(exp_db)
    csv_str = service.export_csv_string()
    reader = csv.DictReader(io.StringIO(csv_str))
    rows = list(reader)

    assert len(rows) >= 3  # keygen, encaps, decaps
    row = rows[0]
    assert "experiment_id" in row
    assert "parameter_set" in row
    assert "mean_us" in row
    assert "median_us" in row
    assert "throughput_ops_sec" in row
    assert row["parameter_set"] == "ML-KEM-768"


def test_research_figure_generation(tmp_path):
    runner = BenchmarkRunner()
    comp = runner.experiments.run_experiment_i(trials=5, warmup=1)
    service = ExportService()
    fig_path = str(tmp_path / "test_chart.png")

    out = service.generate_research_figure(comp, fig_path)
    assert os.path.exists(out)
    assert os.path.getsize(out) > 1000
