# CMS Feature Branch Git Workflow

This document outlines the Git workflow strategy for managing the CMS feature branch as a separate development track that can be maintained independently and merged when ready.

## Table of Contents
1. [Branch Strategy Overview](#branch-strategy-overview)
2. [Initial Setup](#initial-setup)
3. [Maintaining the CMS Branch](#maintaining-the-cms-branch)
4. [Syncing with Main Branch](#syncing-with-main-branch)
5. [Integration Strategy](#integration-strategy)
6. [Best Practices](#best-practices)

## Branch Strategy Overview

### **Recommended Approach: Long-Running Feature Branch**

We'll use a long-running feature branch strategy that allows:
- ✅ **Independent development** of CMS features
- ✅ **Easy syncing** with main branch updates
- ✅ **Selective integration** when ready
- ✅ **Rollback capability** if needed
- ✅ **Parallel development** of other features

### **Branch Structure**

```
main (production-ready code)
├── feature/cms-system (CMS development)
├── feature/other-features (other ongoing work)
└── hotfix/* (emergency fixes)
```

## Initial Setup

### **Step 1: Create and Setup CMS Branch**

```bash
# Ensure you're on the latest main branch
git checkout main
git pull origin main

# Create the CMS feature branch
git checkout -b feature/cms-system

# Add all CMS changes
git add .

# Create comprehensive commit
git commit -m "feat: comprehensive CMS system implementation

🏗️ Documentation Organization:
- Moved scattered docs from root to organized folders
- Updated documentation index and README

🔧 Backend Documentation:
- Complete CMS API requirements and specifications
- Database models, controllers, and validation schemas
- Media management integration with existing system
- Step-by-step implementation guide

📄 Enhanced Mock Data:
- Updated page management mock data
- Added all managed pages (privacy, terms, cookies, data protection, help)
- Comprehensive section data for each page type

🎯 Features:
- Comprehensive CMS backend architecture
- Media upload and processing pipeline
- Analytics and usage tracking
- Environment-based feature toggles

This branch serves as a complete CMS implementation store
that can be integrated when ready for production."

# Push the feature branch
git push -u origin feature/cms-system
```

### **Step 2: Protect the Branch (Optional)**

```bash
# If using GitHub, you can protect the branch via web interface
# Or use GitHub CLI:
gh api repos/:owner/:repo/branches/feature/cms-system/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## Maintaining the CMS Branch

### **Working on CMS Features**

```bash
# Always work on the CMS branch for CMS-related changes
git checkout feature/cms-system

# Make your changes
# ... edit files ...

# Commit changes with descriptive messages
git add .
git commit -m "feat(cms): add media optimization pipeline

- Implement image compression with Sharp
- Add video thumbnail generation
- Create bulk media operations
- Update media controller with processing logic"

# Push changes
git push origin feature/cms-system
```

### **Creating Sub-branches for Specific CMS Features**

```bash
# For larger CMS features, create sub-branches
git checkout feature/cms-system
git checkout -b feature/cms-system/media-optimization

# Work on specific feature
# ... make changes ...

git add .
git commit -m "feat(cms): implement advanced media optimization"
git push origin feature/cms-system/media-optimization

# Merge back to CMS branch when ready
git checkout feature/cms-system
git merge feature/cms-system/media-optimization
git push origin feature/cms-system

# Clean up sub-branch
git branch -d feature/cms-system/media-optimization
git push origin --delete feature/cms-system/media-optimization
```

## Syncing with Main Branch

### **Regular Sync Strategy (Recommended)**

```bash
# Sync CMS branch with latest main changes (weekly or bi-weekly)
git checkout feature/cms-system
git fetch origin

# Option 1: Merge (preserves history)
git merge origin/main

# Option 2: Rebase (cleaner history, but rewrites commits)
git rebase origin/main

# Resolve any conflicts if they occur
# ... resolve conflicts ...
git add .
git commit -m "resolve: merge conflicts with main branch"

# Push updated branch
git push origin feature/cms-system
```

### **Handling Conflicts**

```bash
# If conflicts occur during merge/rebase
git status  # See conflicted files

# Edit conflicted files to resolve
# Look for conflict markers: <<<<<<< ======= >>>>>>>

# After resolving conflicts
git add .

# For merge:
git commit -m "resolve: merge conflicts with main"

# For rebase:
git rebase --continue

# Push changes
git push origin feature/cms-system
```

### **Selective File Updates**

```bash
# If you only want specific files from main
git checkout feature/cms-system
git checkout main -- path/to/specific/file.ts
git add .
git commit -m "sync: update specific file from main branch"
git push origin feature/cms-system
```

## Integration Strategy

### **When Ready to Integrate CMS**

#### **Option 1: Full Integration (Recommended)**

```bash
# Ensure CMS branch is up to date
git checkout feature/cms-system
git fetch origin
git merge origin/main  # Resolve any conflicts

# Switch to main and merge
git checkout main
git pull origin main
git merge feature/cms-system

# Push to main
git push origin main

# Optionally keep the CMS branch for future development
# Or delete it if no longer needed
git branch -d feature/cms-system
git push origin --delete feature/cms-system
```

#### **Option 2: Selective Integration**

```bash
# Cherry-pick specific commits from CMS branch
git checkout main
git cherry-pick <commit-hash-1> <commit-hash-2>

# Or merge specific files/folders
git checkout main
git checkout feature/cms-system -- docs/backend/
git checkout feature/cms-system -- data/mock/website-cms-mock.ts
git add .
git commit -m "integrate: CMS backend documentation and mock data"
git push origin main
```

#### **Option 3: Squash Merge**

```bash
# Create a single commit from all CMS changes
git checkout main
git merge --squash feature/cms-system
git commit -m "feat: integrate comprehensive CMS system

Complete CMS implementation including:
- Backend documentation and API specifications
- Database models and validation schemas
- Media management integration
- Enhanced mock data for all managed pages
- Implementation guides and workflows"

git push origin main
```

## Best Practices

### **Commit Message Conventions**

```bash
# Use conventional commits for CMS branch
feat(cms): add new CMS feature
fix(cms): fix CMS bug
docs(cms): update CMS documentation
refactor(cms): refactor CMS code
test(cms): add CMS tests
chore(cms): update CMS dependencies
```

### **Branch Naming**

```bash
# Main CMS branch
feature/cms-system

# Sub-features
feature/cms-system/media-management
feature/cms-system/page-editor
feature/cms-system/analytics
feature/cms-system/user-permissions
```

### **Regular Maintenance**

```bash
# Weekly sync with main (recommended)
git checkout feature/cms-system
git fetch origin
git merge origin/main
git push origin feature/cms-system

# Monthly cleanup
git branch --merged feature/cms-system  # See merged branches
git branch -d feature/cms-system/completed-feature  # Delete merged branches
```

### **Documentation Updates**

```bash
# Always update documentation when making CMS changes
git add docs/
git commit -m "docs(cms): update CMS documentation for new features"
```

### **Testing Before Integration**

```bash
# Before integrating to main, ensure everything works
npm run build
npm run test
npm run lint

# Test CMS functionality specifically
npm run test:cms  # If you have CMS-specific tests
```

## Emergency Procedures

### **Hotfix on Main While CMS Branch Exists**

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# Make fix
# ... fix critical issue ...
git add .
git commit -m "hotfix: fix critical production issue"

# Merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main

# Apply same fix to CMS branch
git checkout feature/cms-system
git cherry-pick <hotfix-commit-hash>
git push origin feature/cms-system

# Clean up
git branch -d hotfix/critical-fix
```

### **Rollback CMS Integration**

```bash
# If CMS integration causes issues, rollback
git checkout main
git log --oneline  # Find commit before CMS merge
git reset --hard <commit-before-cms>
git push --force-with-lease origin main

# CMS branch remains intact for future integration
```

## Summary

This workflow allows you to:
1. **Develop CMS independently** on `feature/cms-system` branch
2. **Sync regularly** with main branch updates
3. **Integrate selectively** when ready
4. **Maintain parallel development** of other features
5. **Rollback easily** if needed

The CMS branch serves as a **complete implementation store** that can be maintained, updated, and integrated at the right time without disrupting main development.
