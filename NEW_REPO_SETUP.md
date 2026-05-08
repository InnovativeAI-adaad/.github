# Create a New Git Repository for This Project

Use the following commands from the project root to initialize a fresh Git repository and push it to a new remote.

```bash
# 1) Remove old Git history if present
rm -rf .git

# 2) Initialize a new repository
git init

# 3) Create your primary branch
git checkout -b main

# 4) Stage files
git add .

# 5) Create initial commit
git commit -m "Initial commit: SWARM.AI project baseline"

# 6) Add remote (replace with your repository URL)
git remote add origin <YOUR_NEW_REPO_URL>

# 7) Push
git push -u origin main
```

## Optional: GitHub CLI Flow

If you use GitHub CLI:

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

This creates the repository, sets the remote, and pushes your code in one step.
