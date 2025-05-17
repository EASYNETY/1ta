#!/bin/bash

# Add all changes
git add .

# Commit changes
git commit -m "Fix: Update user detail page to use isActive instead of status

- Changed user detail page to use isActive boolean field instead of non-existent status field
- Added proper display of onboarding status
- Added barcode ID display
- Improved status display with proper type handling"

# Push to origin
git push origin main

# Push to easynety
git push easynety main

# Show status
git status
