#!/bin/bash

# Add all changes
git add .

# Commit changes
git commit -m "Fix: Update user components to use isActive instead of status

- Changed UserTableRow to use isActive boolean field instead of status string
- Updated UserForm to use a Switch for isActive instead of a Select for status
- Added defensive programming to UsersPage filtering
- Improved status display with proper type handling"

# Push to origin
git push origin main

# Push to easynety
git push easynety main

# Show status
git status
