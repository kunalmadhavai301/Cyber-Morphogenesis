/**
 * Comparative Analysis Controller (Page 4)
 * Handles comparative charts for latency, sizes, throughput, and classical baselines.
 */

class ComparisonView {
    constructor() {
        this.charts = {};
        document.addEventListener("DOMContentLoaded", () => this.loadAllComparisons());
    }

    async loadAllComparisons() {
        const btn = document.getElementById("btnRefreshComp");
        if (btn) btn.disabled = true;

        try {
            // 1. Fetch ML-KEM Comparative Sweep (Exp I)
            const resComp = await fetch("/api/benchmark/comparison?trials=50&warmup=10");
            const compData = await resComp.json();

            // 2. Fetch Classical Baseline Comparison (Exp J)
            const resClass = await fetch("/api/benchmark/classical-comparison?trials=50");
            const classData = await resClass.json();

            this.renderLatencyChart(compData.comparison);
            this.renderSizeChart(compData.comparison);
            this.renderThroughputChart(compData.comparison);
            this.renderClassicalChart(classData.mechanisms);
            this.renderComparisonTable(compData.comparison);
        } catch (err) {
            console.error("Error loading comparative sweep:", err);
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    renderLatencyChart(comp) {
        const ctx = document.getElementById("chartLatencyComp").getContext("2d");
        const params = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"];

        const keygen = params.map(p => comp[p].latency_us.keygen_median);
        const encaps = params.map(p => comp[p].latency_us.encaps_median);
        const decaps = params.map(p => comp[p].latency_us.decaps_median);

        if (this.charts.latency) this.charts.latency.destroy();

        this.charts.latency = new Chart(ctx, {
            type: "bar",
            data: {
                labels: params,
                datasets: [
                    { label: "KeyGen", data: keygen, backgroundColor: "#38bdf8", borderRadius: 4 },
                    { label: "Encaps", data: encaps, backgroundColor: "#34d399", borderRadius: 4 },
                    { label: "Decaps", data: decaps, backgroundColor: "#f472b6", borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#cbd5e1" } },
                    tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y} µs` } }
                },
                scales: {
                    x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "Latency (µs)", color: "#9ca3af" } }
                }
            }
        });
    }

    renderSizeChart(comp) {
        const ctx = document.getElementById("chartSizeComp").getContext("2d");
        const params = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"];

        const pkSizes = params.map(p => comp[p].sizes.public_key_bytes);
        const ctSizes = params.map(p => comp[p].sizes.ciphertext_bytes);

        if (this.charts.size) this.charts.size.destroy();

        this.charts.size = new Chart(ctx, {
            type: "bar",
            data: {
                labels: params,
                datasets: [
                    { label: "Public Key (ek)", data: pkSizes, backgroundColor: "#818cf8", borderRadius: 4 },
                    { label: "Ciphertext (c)", data: ctSizes, backgroundColor: "#fbbf24", borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#cbd5e1" } },
                    tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y} Bytes` } }
                },
                scales: {
                    x: { stacked: true, ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { stacked: true, ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "Total Wire Bytes", color: "#9ca3af" } }
                }
            }
        });
    }

    renderThroughputChart(comp) {
        const ctx = document.getElementById("chartThroughputComp").getContext("2d");
        const params = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"];

        const tps = params.map(p => comp[p].throughput_ops_sec.keygen);

        if (this.charts.throughput) this.charts.throughput.destroy();

        this.charts.throughput = new Chart(ctx, {
            type: "bar",
            data: {
                labels: params,
                datasets: [
                    { label: "KeyGen Ops/Sec", data: tps, backgroundColor: "#34d399", borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#cbd5e1" } },
                    tooltip: { callbacks: { label: c => `${c.parsed.y.toLocaleString()} ops/s` } }
                },
                scales: {
                    x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "Operations / Sec", color: "#9ca3af" } }
                }
            }
        });
    }

    renderClassicalChart(mechs) {
        const ctx = document.getElementById("chartClassicalComp").getContext("2d");
        const labels = ["ECDH X25519", "ECDH P-256", "ML-KEM-768"];
        const keys = ["ECDH_X25519", "ECDH_P256", "ML_KEM_768"];

        const wireBytes = keys.map(k => mechs[k].total_communication_bytes);

        if (this.charts.classical) this.charts.classical.destroy();

        this.charts.classical = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Total Key Exchange Overhead (Bytes)",
                        data: wireBytes,
                        backgroundColor: ["#60a5fa", "#38bdf8", "#f43f5e"],
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: "#cbd5e1" } },
                    tooltip: { callbacks: { label: c => `${c.parsed.y} Bytes exchanged` } }
                },
                scales: {
                    x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(255,255,255,0.05)" }, title: { display: true, text: "Wire Overhead (Bytes)", color: "#9ca3af" } }
                }
            }
        });
    }

    renderComparisonTable(comp) {
        const tbody = document.getElementById("compTableBody");
        tbody.innerHTML = "";

        for (const [pName, data] of Object.entries(comp)) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="fw-bold text-white">${pName}</td>
                <td><span class="badge bg-secondary-subtle border border-secondary text-secondary">Cat ${data.nist_category}</span></td>
                <td class="text-secondary small">${data.classical_security}</td>
                <td class="font-monospace text-info">${data.sizes.public_key_bytes} B</td>
                <td class="font-monospace text-secondary">${data.sizes.private_key_bytes} B</td>
                <td class="font-monospace text-warning">${data.sizes.ciphertext_bytes} B</td>
                <td class="font-monospace text-success">${data.sizes.shared_secret_bytes} B</td>
                <td class="font-monospace">${data.latency_us.keygen_median}</td>
                <td class="font-monospace">${data.latency_us.encaps_median}</td>
                <td class="font-monospace">${data.latency_us.decaps_median}</td>
                <td class="font-monospace text-success fw-bold">${data.latency_us.roundtrip_median}</td>
            `;
            tbody.appendChild(tr);
        }
    }
}

const comparisonView = new ComparisonView();
