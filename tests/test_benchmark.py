"""
Comprehensive Automated Tests for Benchmarking Engine and Experiments.
Tests statistical accuracy, timing calibration, memory instrumentation,
and Experiments A through J.
"""

import pytest
import numpy as np
from benchmark.timing import BenchmarkTimer
from benchmark.memory import MemoryProfiler
from benchmark.statistics import BenchmarkStatistics
from benchmark.experiments import BenchmarkExperiments
from benchmark.runner import BenchmarkRunner


class TestBenchmarkStatistics:
    """Tests statistical formulas against known analytical baselines."""

    def test_statistics_known_values(self):
        # Sample: [1000, 2000, 3000, 4000, 5000] ns -> [1.0, 2.0, 3.0, 4.0, 5.0] µs
        latencies_ns = [1000, 2000, 3000, 4000, 5000]
        total_duration_ns = 20_000
        stats = BenchmarkStatistics.calculate(latencies_ns, total_duration_ns, 5, 0)

        assert stats["sample_size"] == 5
        assert stats["successful_ops"] == 5
        assert stats["failed_ops"] == 0
        assert stats["mean_us"] == 3.0
        assert stats["median_us"] == 3.0
        assert stats["min_us"] == 1.0
        assert stats["max_us"] == 5.0
        # std_dev sample of [1,2,3,4,5] is sqrt(2.5) ~ 1.58
        assert abs(stats["std_dev_us"] - 1.58) < 0.05
        # Throughput = 5 ops / (20000 ns / 1e9) = 250,000 ops/sec
        assert stats["throughput_ops_per_sec"] == 250_000.0

    def test_empty_sample_safety(self):
        stats = BenchmarkStatistics.calculate([], 0, 0, 0)
        assert stats["sample_size"] == 0
        assert stats["mean_us"] == 0.0
        assert stats["throughput_ops_per_sec"] == 0.0


class TestBenchmarkExperiments:
    """Tests execution of Experiments A through J with small bounded sample sizes."""

    @pytest.fixture
    def experiments(self):
        return BenchmarkExperiments()

    def test_experiment_a_keygen(self, experiments):
        res = experiments.run_experiment_a("ML-KEM-512", trials=10, warmup=2)
        assert res["trials"] == 10
        assert res["statistics"]["successful_ops"] == 10
        assert res["statistics"]["mean_us"] > 0

    def test_experiment_b_encap(self, experiments):
        res = experiments.run_experiment_b("ML-KEM-512", trials=10, warmup=2)
        assert res["trials"] == 10
        assert res["statistics"]["successful_ops"] == 10
        assert res["statistics"]["mean_us"] > 0

    def test_experiment_c_decap(self, experiments):
        res = experiments.run_experiment_c("ML-KEM-512", trials=10, warmup=2)
        assert res["trials"] == 10
        assert res["statistics"]["successful_ops"] == 10
        assert res["statistics"]["mean_us"] > 0

    def test_experiment_d_sizes(self, experiments):
        res = experiments.run_experiment_d()
        params = res["parameters"]
        assert "ML-KEM-512" in params
        assert "ML-KEM-768" in params
        assert "ML-KEM-1024" in params
        assert params["ML-KEM-768"]["public_key_bytes"] == 1184
        assert params["ML-KEM-768"]["ciphertext_bytes"] == 1088
        assert params["ML-KEM-768"]["shared_secret_bytes"] == 32
        assert params["ML-KEM-768"]["fips203_spec_match"] is True

    def test_experiment_e_throughput(self, experiments):
        res = experiments.run_experiment_e("ML-KEM-512", duration_seconds=0.1)
        tps = res["throughput_ops_per_sec"]
        assert tps["keygen"] > 0
        assert tps["encaps"] > 0
        assert tps["decaps"] > 0

    def test_experiment_f_memory(self, experiments):
        res = experiments.run_experiment_f("ML-KEM-512", iterations=20)
        metrics = res["metrics"]
        assert metrics["iterations"] == 20
        assert metrics["python_heap_peak_bytes"] > 0
        assert metrics["process_rss_start_bytes"] > 0

    def test_experiment_g_workload_scaling(self, experiments):
        res = experiments.run_experiment_g("ML-KEM-512", workloads=[5, 10])
        assert len(res["workloads"]) == 2
        assert res["workloads"][0]["workload_ops"] == 5
        assert res["workloads"][1]["workload_ops"] == 10

    def test_experiment_h_repeated_correctness(self, experiments):
        res = experiments.run_experiment_h("ML-KEM-512", iterations=25)
        assert res["total_iterations"] == 25
        assert res["successful_matches"] == 25
        assert res["success_rate_percent"] == 100.0
        assert res["verified_consistent"] is True

    def test_experiment_i_comparison(self, experiments):
        res = experiments.run_experiment_i(trials=5, warmup=1)
        comp = res["comparison"]
        assert "ML-KEM-512" in comp
        assert "ML-KEM-768" in comp
        assert "ML-KEM-1024" in comp

    def test_experiment_j_classical(self, experiments):
        res = experiments.run_experiment_j(trials=5)
        mechs = res["mechanisms"]
        assert "ECDH_X25519" in mechs
        assert "ECDH_P256" in mechs
        assert "ML_KEM_768" in mechs


class TestBenchmarkRunner:
    """Tests coordinator runner and validation."""

    def test_runner_validation(self):
        runner = BenchmarkRunner()
        # Invalid parameter set
        with pytest.raises(ValueError):
            runner.run_benchmark_job(parameter_set="INVALID")

        # Invalid operation
        with pytest.raises(ValueError):
            runner.run_benchmark_job(parameter_set="ML-KEM-768", operation="invalid_op")

    def test_runner_execution_all(self):
        runner = BenchmarkRunner()
        job = runner.run_benchmark_job(
            parameter_set="ML-KEM-768",
            operation="all",
            trials=10,
            warmup=2,
            notes="Pytest validation run"
        )
        assert "experiment_id" in job
        assert job["parameter_set"] == "ML-KEM-768"
        assert "keygen" in job["operations"]
        assert "encaps" in job["operations"]
        assert "decaps" in job["operations"]
        assert job["roundtrip_median_us"] > 0
