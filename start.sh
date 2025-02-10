#!/bin/bash

# Start the Discord bot
node src/index.js &

# Start the backup system (running in background)
python3 src/backup.py &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
