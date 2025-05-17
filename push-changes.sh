#!/bin/bash

# Add all changes
git add .

# Commit changes
git commit -m "Fix: Implement defensive programming to prevent runtime errors

- Fix timetable filter error
- Fix user detail page property access error
- Fix user API endpoint mismatch
- Add comprehensive safe data utilities
- Add error boundaries and safe API client
- Add defensive programming documentation"

# Push to origin
git push origin main

# Push to easynety
git push easynety main

# Show status
git status
