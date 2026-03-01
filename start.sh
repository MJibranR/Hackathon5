#!/bin/bash

# Start the worker in the background
python workers/message_processor.py &

# Start the worker for metrics in the background
python workers/metrics_collector.py &

# Start the FastAPI app in the foreground
python api/main.py
