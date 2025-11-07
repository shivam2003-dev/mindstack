# Git & Version Control

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Git fundamentals and workflows</li>
    <li>Understand branching and merging strategies</li>
    <li>Learn advanced Git operations</li>
    <li>Know Git best practices for DevOps</li>
  </ul>
</div>

Git is essential for DevOps. This chapter covers Git from basics to advanced workflows used in production.

!!! tip "Interview Focus"
    Be ready to explain Git concepts, resolve conflicts, and design branching strategies. Practice common Git operations.

## Git Fundamentals

### Basic Operations

```bash
# Initialize repository
git init

# Clone repository
git clone https://github.com/user/repo.git

# Check status
git status

# Add files
git add file.txt
git add .  # All files

# Commit
git commit -m "Add feature"

# View history
git log
git log --oneline
git log --graph --oneline --all
```

!!! note "Commit Messages"
    Write clear, descriptive commit messages. Use present tense: "Add feature" not "Added feature".

### Remote Operations

```bash
# Add remote
git remote add origin https://github.com/user/repo.git

# Push to remote
git push origin main
git push -u origin main  # Set upstream

# Pull from remote
git pull origin main

# Fetch changes
git fetch origin

# View remotes
git remote -v
```

## Branching

### Branch Operations

```bash
# Create branch
git branch feature-branch

# Switch branch
git checkout feature-branch
git switch feature-branch  # Newer command

# Create and switch
git checkout -b feature-branch
git switch -c feature-branch

# List branches
git branch
git branch -a  # All branches

# Delete branch
git branch -d feature-branch
git branch -D feature-branch  # Force delete
```

### Merging

```bash
# Merge branch
git checkout main
git merge feature-branch

# Merge with no-fast-forward
git merge --no-ff feature-branch

# Abort merge
git merge --abort
```

### Rebasing

```bash
# Rebase current branch
git rebase main

# Interactive rebase
git rebase -i HEAD~3

# Abort rebase
git rebase --abort
```

!!! warning "Rebase vs Merge"
    - **Merge**: Preserves history, creates merge commit
    - **Rebase**: Linear history, rewrites commits
    - Use merge for shared branches, rebase for feature branches

## Common Workflows

### Git Flow

```bash
# Main branches
main        # Production code
develop     # Development branch

# Feature branches
git checkout -b feature/new-feature develop
# Work on feature
git checkout develop
git merge --no-ff feature/new-feature

# Release branch
git checkout -b release/1.0.0 develop
# Bug fixes
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0

# Hotfix
git checkout -b hotfix/bug-fix main
# Fix bug
git checkout main
git merge --no-ff hotfix/bug-fix
```

### GitHub Flow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add feature"

# Push and create PR
git push origin feature/new-feature

# After PR approval, merge to main
```

## Advanced Operations

### Stashing

```bash
# Save changes temporarily
git stash
git stash save "Work in progress"

# List stashes
git stash list

# Apply stash
git stash apply
git stash pop  # Apply and remove

# Drop stash
git stash drop
```

### Undoing Changes

```bash
# Unstage file
git reset HEAD file.txt

# Discard changes
git checkout -- file.txt
git restore file.txt  # Newer command

# Amend last commit
git commit --amend

# Reset to previous commit
git reset --soft HEAD~1  # Keep changes staged
git reset --mixed HEAD~1  # Keep changes unstaged
git reset --hard HEAD~1  # Discard changes
```

!!! warning "Hard Reset"
    `git reset --hard` permanently deletes changes. Use with caution!

### Cherry-picking

```bash
# Apply specific commit
git cherry-pick <commit-hash>

# Cherry-pick range
git cherry-pick <start-commit>..<end-commit>
```

## Conflict Resolution

```bash
# When merge conflict occurs
git status  # See conflicted files

# Edit conflicted files
# Look for <<<<<<< HEAD markers
# Resolve conflicts
# Remove conflict markers

# After resolving
git add resolved-file.txt
git commit  # Complete merge
```

## Git Hooks

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Run tests before commit
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

### Pre-push Hook

```bash
#!/bin/bash
# .git/hooks/pre-push
# Run linting before push
npm run lint
```

## Comprehensive Interview Questions

### Q1: Explain the difference between `git pull` and `git fetch`

**Answer:**
- **`git fetch`**: Downloads changes from remote but doesn't merge
  ```bash
  git fetch origin  # Downloads but doesn't merge
  git merge origin/main  # Merge manually after review
  ```
- **`git pull`**: Fetches and merges in one step
  ```bash
  git pull origin main  # Fetch + merge
  ```
- **When to use**: Use `fetch` to review changes before merging, use `pull` when you're confident

### Q2: How do you revert a commit?

**Answer:**

**Method 1: Revert (creates new commit, safe for shared branches)**
```bash
git revert <commit-hash>  # Creates new commit undoing changes
```

**Method 2: Reset (removes commit, use carefully)**
```bash
git reset --soft HEAD~1   # Keep changes staged
git reset --mixed HEAD~1  # Keep changes unstaged
git reset --hard HEAD~1   # Discard changes (dangerous!)
```

**When to use:**
- Use `revert` for commits already pushed (safe)
- Use `reset` only for local commits (dangerous if pushed)

### Q3: Explain Git branching strategies

**Answer:**

**Git Flow:**
- `main`: Production code
- `develop`: Development branch
- `feature/*`: Feature branches
- `release/*`: Release preparation
- `hotfix/*`: Production fixes

**GitHub Flow:**
- `main`: Production code
- `feature/*`: Feature branches
- Simple, continuous deployment

**GitLab Flow:**
- Environment branches: `staging`, `production`
- Feature branches merge to staging first

### Q4: How do you resolve merge conflicts?

**Answer:**
```bash
# When conflict occurs
git status  # See conflicted files

# Edit files, look for conflict markers:
# <<<<<<< HEAD
# your changes
# =======
# incoming changes
# >>>>>>> branch-name

# After resolving:
git add resolved-file.txt
git commit  # Complete merge
```

### Q5: What is the difference between `git merge` and `git rebase`?

**Answer:**
- **`git merge`**: Creates merge commit, preserves history
  ```bash
  git checkout main
  git merge feature-branch  # Creates merge commit
  ```
- **`git rebase`**: Replays commits, linear history
  ```bash
  git checkout feature-branch
  git rebase main  # Replays commits on top of main
  ```

**When to use:**
- Use `merge` for shared/public branches
- Use `rebase` for local/feature branches

### Q6: Explain Git hooks and give examples

**Answer:**
Git hooks are scripts that run automatically at certain points in Git workflow.

**Pre-commit hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

**Pre-push hook:**
```bash
#!/bin/bash
# .git/hooks/pre-push
npm run lint
```

### Q7: How do you find which commit introduced a bug?

**Answer:**
```bash
# Binary search with git bisect
git bisect start
git bisect bad  # Mark current commit as bad
git bisect good <commit-hash>  # Mark known good commit
# Git checks out middle commit, test it
git bisect good  # or git bisect bad
# Repeat until found
git bisect reset
```

### Q8: Explain Git stash and when to use it

**Answer:**
Stash temporarily saves uncommitted changes.

```bash
# Save changes
git stash
git stash save "Work in progress"

# List stashes
git stash list

# Apply stash
git stash apply  # Keeps stash
git stash pop    # Applies and removes

# Drop stash
git stash drop
```

**When to use:**
- Switch branches with uncommitted changes
- Pull changes with local modifications
- Temporarily save work

### Q9: How do you rewrite Git history?

**Answer:**
```bash
# Interactive rebase
git rebase -i HEAD~3  # Edit last 3 commits

# Amend last commit
git commit --amend

# Squash commits
git rebase -i HEAD~5
# Change 'pick' to 'squash' for commits to combine
```

!!! warning "History Rewriting"
    Never rewrite history of shared/public branches. Only rewrite local commits.

### Q10: Explain Git submodules

**Answer:**
Submodules allow including one Git repository in another.

```bash
# Add submodule
git submodule add https://github.com/user/repo.git path/to/submodule

# Clone repository with submodules
git clone --recursive https://github.com/user/main-repo.git

# Update submodules
git submodule update --init --recursive
```

## Recommended Resources

### Books
- **"Pro Git" by Scott Chacon** - Free online, comprehensive Git guide
- **"Git Pocket Guide"** - Quick reference guide

### Articles
- [Git SCM Official Documentation](https://git-scm.com/doc)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

### Practice
- [Learn Git Branching](https://learngitbranching.js.org/) - Interactive Git tutorial
- [GitHub Learning Lab](https://lab.github.com/) - Hands-on Git practice

---

**Previous**: [Shell Scripting](03-shell-scripting) | **Next**: [Docker Deep Dive](05-docker-deep-dive)

