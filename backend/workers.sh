#!/bin/bash
# start_workers.sh

NUM_WORKERS=4

for i in $(seq 1 $NUM_WORKERS); do
    echo "Starting worker $i"
    rq worker report_tasks &
done

wait