"""
Vercel Serverless Function Entrypoint for Flask.
Exposes the WSGI `app` callable for Vercel's Python runtime.
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path so all application modules resolve properly
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure VERCEL environment flag is set
os.environ["VERCEL"] = "1"

from app import create_app

# Create production Flask instance
app = create_app("production")
