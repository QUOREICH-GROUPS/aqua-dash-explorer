#!/bin/bash

# Kill existing backend
pkill -f "uvicorn app.main:app"

# Start backend
cd /home/suprox/Projet/Laravel/aqua-dash-explorer/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
