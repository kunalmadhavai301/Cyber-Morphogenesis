/**
 * Benchmark Lab Controller (Page 3)
 * Manages bounded benchmark execution, progress tracking, and Chart.js rendering.
 */

class BenchmarkLab {
    constructor() {
        this.chartInstance = null;
    }

    async runBenchmark() {
        const param = document.getElementById("benchParam").value;
        const op = document.getElementById("benchOp").value;
        const trials = parseInt(document.getElementById("benchTrials").value, 10);
        const warmup = parseInt(document.getElementById("benchWarmup").value, 10);
        const notes = document.getElementById("benchNotes").value;

        const btnStart = document.getElementById("btnStartBench");
        const progressContainer = document.getElementById("benchProgressContainer");
        const resultsPlaceholder = document.getElementById("emptyResultPlaceholder");
        const resultsContent = document.getElementById("resultsContent");

        btnStart.disabled = true;
        progressContainer.classList.remove("d-none");
        resultsPlaceholder.classList.add("d-none");
        resultsContent.classList.add("d-none");

        try {
            const res = await fetch("/api/benchmark/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parameter_set: param,
                    operation: op,
                    trials: trials,
                    warmup: warmup,
                    notes: notes
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Benchmark run failed");

            this.renderResults(data.result);
        } catch (err) {
            alert(`Benchmark execution error: ${err.message}`);
            resultsPlaceholder.classList.remove("d-none");
        } finally {
            btnStart.disabled = false;
            progressContainer.classList.add("d-none");
        }
    }

    renderResults(job) {
        document.getElementById("resultsContent").classList.remove("d-none");
        document.getElementById("resExperimentId").textContent = job.experiment_id;

        const ops = job.operations;
        let totalMs = 0;
        for (const opKey in ops) {
            totalMs += ops[opKey].total_duration_ms;
        }

        document.getElementById("resTotalDuration").textContent = `${totalMs.toFixed(1)} ms`;
        document.getElementById("resRoundtripMedian").textContent = job.roundtrip_median_us ? `${job.roundtrip_median_us} µs` : "—";
        
        const keygenThroughput = ops.keygen ? `${ops.keygen.throughput_ops_per_sec.toLocaleString()} ops/s` : (ops.encaps ? `${ops.encaps.throughput_ops_per_sec.toLocaleString()} ops/s` : "—");
        document.getElementById("resThroughput").textContent = keygenThroughput;

        // Render Table Rows
        const tbody = document.getElementById("statsTableBody");
        tbody.innerHTML = "";

        const opLabels = { keygen: "Key Generation", encaps: "Encapsulation", decaps: "Decapsulation" };
        const chartLabels = [];
        const meanData = [];
        const medianData = [];
        const p95Data = [];

        for (const [opKey, stats] of Object.entries(ops)) {
            const label = opLabels[opKey] || opKey;
            chartLabels.push(label);
            meanData.push(stats.mean_us);
            medianData.push(stats.median_us);
            p95Data.push(stats.p95_us);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="fw-semibold text-white">${label}</td>
                <td class="font-monospace text-secondary">${stats.successful_ops}</td>
                <td class="font-monospace text-info">${stats.mean_us}</td>
                <td class="font-monospace text-success fw-bold">${stats.median_us}</td>
                <td class="font-monospace text-warning">${stats.p95_us}</td>
                <td class="font-monospace text-secondary">&plusmn;${stats.std_dev_us}</td>
                <td class="font-monospace text-secondary small">${stats.min_us} / ${stats.max_us}</td>
                <td class="font-monospace text-muted small">[${stats.ci95_mean_us[0]}, ${stats.ci95_mean_us[1]}]</td>
                <td class="font-monospace text-white">${stats.throughput_ops_per_sec.toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        }

        // Render Chart.js Graph
        this.renderChart(chartLabels, meanData, medianData, p95Data);
    }

    renderChart(labels, meanData, medianData, p95Data) {
        const ctx = document.getElementById("benchChart").getContext("2d");
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Median (µs)",
                        data: medianData,
                        backgroundColor: "#34d399",
                        borderRadius: 4,
                    },
                    {
                        label: "Mean (µs)",
                        data: meanData,
                        backgroundColor: "#38bdf8",
                        borderRadius: 4,
                    },
                    {
                        label: "P95 Latency (µs)",
                        data: p95Data,
                        backgroundColor: "#fbbf24",
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: "#cbd5e1", font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} µs`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#cbd5e1", font: { weight: "600" } },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    },
                    y: {
                        ticks: { color: "#cbd5e1" },
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        title: { display: true, text: "Latency (Microseconds)", color: "#9ca3af" }
                    }
                }
            }
        });
    }
}

const benchmarkLab = new BenchmarkLab();
