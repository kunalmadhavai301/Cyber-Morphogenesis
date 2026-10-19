"""
SQLite Database Storage Module for Benchmark History.
Stores experiment metadata and summary statistics.
Strictly ensures zero storage or persistence of private keys or shared secrets.
"""

import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from config import Config


class BenchmarkDatabase:
    """Thread-safe SQLite database manager for benchmark experiment history."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or Config.SQLITE_DB_PATH
        if self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes database schema with proper indexes."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Experiments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS experiments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT UNIQUE NOT NULL,
                    timestamp TEXT NOT NULL,
                    parameter_set TEXT NOT NULL,
                    operation TEXT NOT NULL,
                    trials INTEGER NOT NULL,
                    warmup INTEGER NOT NULL,
                    notes TEXT,
                    roundtrip_median_us REAL,
                    os_info TEXT,
                    cpu_arch TEXT,
                    python_version TEXT,
                    crypto_engine TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Operation measurements table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS operation_measurements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT NOT NULL,
                    operation_name TEXT NOT NULL,
                    sample_size INTEGER NOT NULL,
                    successful_ops INTEGER NOT NULL,
                    failed_ops INTEGER NOT NULL,
                    total_duration_ms REAL NOT NULL,
                    throughput_ops_sec REAL NOT NULL,
                    mean_us REAL NOT NULL,
                    median_us REAL NOT NULL,
                    std_dev_us REAL NOT NULL,
                    min_us REAL NOT NULL,
                    max_us REAL NOT NULL,
                    p95_us REAL NOT NULL,
                    p99_us REAL NOT NULL,
                    iqr_us REAL NOT NULL,
                    ci95_lower_us REAL,
                    ci95_upper_us REAL,
                    FOREIGN KEY (experiment_id) REFERENCES experiments (experiment_id) ON DELETE CASCADE
                )
            """)

            cursor.execute("CREATE INDEX IF NOT EXISTS idx_exp_param ON experiments(parameter_set)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_exp_timestamp ON experiments(timestamp)")
            conn.commit()

    def save_experiment(self, exp_data: Dict[str, Any]) -> str:
        """Persists a completed benchmark experiment and its operation measurements."""
        exp_id = exp_data["experiment_id"]
        env = exp_data.get("environment", {})

        with self._get_connection() as conn:
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR REPLACE INTO experiments (
                    experiment_id, timestamp, parameter_set, operation, trials, warmup, notes,
                    roundtrip_median_us, os_info, cpu_arch, python_version, crypto_engine
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                exp_id,
                exp_data["timestamp"],
                exp_data["parameter_set"],
                exp_data["operation"],
                exp_data["trials"],
                exp_data["warmup"],
                exp_data.get("notes", ""),
                exp_data.get("roundtrip_median_us"),
                env.get("os", ""),
                env.get("cpu_arch", ""),
                env.get("python_version", ""),
                env.get("crypto_engine", ""),
            ))

            # Insert measurement rows
            for op_name, stats in exp_data.get("operations", {}).items():
                ci = stats.get("ci95_mean_us", [stats.get("mean_us", 0), stats.get("mean_us", 0)])
                cursor.execute("""
                    INSERT INTO operation_measurements (
                        experiment_id, operation_name, sample_size, successful_ops, failed_ops,
                        total_duration_ms, throughput_ops_sec, mean_us, median_us, std_dev_us,
                        min_us, max_us, p95_us, p99_us, iqr_us, ci95_lower_us, ci95_upper_us
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    exp_id,
                    op_name,
                    stats.get("sample_size", 0),
                    stats.get("successful_ops", 0),
                    stats.get("failed_ops", 0),
                    stats.get("total_duration_ms", 0.0),
                    stats.get("throughput_ops_per_sec", 0.0),
                    stats.get("mean_us", 0.0),
                    stats.get("median_us", 0.0),
                    stats.get("std_dev_us", 0.0),
                    stats.get("min_us", 0.0),
                    stats.get("max_us", 0.0),
                    stats.get("p95_us", 0.0),
                    stats.get("p99_us", 0.0),
                    stats.get("iqr_us", 0.0),
                    ci[0] if len(ci) > 0 else 0.0,
                    ci[1] if len(ci) > 1 else 0.0,
                ))

            conn.commit()
        return exp_id

    def get_experiment(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single experiment with all operation measurements."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM experiments WHERE experiment_id = ?", (experiment_id,))
            row = cursor.fetchone()
            if not row:
                return None

            exp = dict(row)
            cursor.execute("SELECT * FROM operation_measurements WHERE experiment_id = ?", (experiment_id,))
            measurements = [dict(r) for r in cursor.fetchall()]
            
            exp["operations"] = {m["operation_name"]: m for m in measurements}
            return exp

    def list_experiments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns recent experiments list."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT experiment_id, timestamp, parameter_set, operation, trials, warmup,
                       roundtrip_median_us, notes, created_at
                FROM experiments
                ORDER BY id DESC LIMIT ?
            """, (limit,))
            return [dict(r) for r in cursor.fetchall()]

    def count_experiments(self) -> int:
        """Returns total number of recorded experiments."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM experiments")
            return cursor.fetchone()[0]
