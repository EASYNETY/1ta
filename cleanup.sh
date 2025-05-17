#!/bin/bash

# Remove temporary script files
rm -f update-user-fields.sh
rm -f fix-user-status-fields.sh
rm -f push-changes.sh

# Remove any .bak files that might have been created
find . -name "*.bak" -type f -delete

# Remove any .tmp files
find . -name "*.tmp" -type f -delete

echo "Cleanup completed successfully!"
