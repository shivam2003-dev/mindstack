# GitHub Pages Deployment Guide

This guide explains how to deploy mindstack to GitHub Pages using GitHub Actions.

## Prerequisites

- A GitHub account
- A GitHub repository (public or private)
- Git installed on your local machine

## Step-by-Step Setup

### 1. Create and Push Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: mindstack learning platform"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/mindstack.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** (in the repository menu)
3. Scroll down to **Pages** (in the left sidebar)
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Click **Save**

### 3. Update Repository URL

Edit `mkdocs.yml` and update the repository URL:

```yaml
repo_url: https://github.com/yourusername/mindstack
repo_name: mindstack
```

Replace `yourusername` with your actual GitHub username.

### 4. Trigger Deployment

The GitHub Actions workflow will automatically run when you push to the `main` or `master` branch:

```bash
git add mkdocs.yml
git commit -m "Update repository URL"
git push
```

### 5. Monitor Deployment

1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. You should see a workflow run called "Deploy to GitHub Pages"
4. Wait for it to complete (usually takes 1-2 minutes)

### 6. Access Your Site

Once deployment is complete, your site will be available at:
```
https://yourusername.github.io/mindstack
```

Note: It may take a few minutes for the site to be accessible after the first deployment.

## Workflow Details

The GitHub Actions workflow (`.github/workflows/ci.yml`) does the following:

1. **Triggers**: Runs on push to `main`/`master` branch or manual trigger
2. **Builds**: Installs dependencies and builds the MkDocs site
3. **Deploys**: Uploads the built site to GitHub Pages

## Troubleshooting

### Site Not Appearing

1. **Check GitHub Pages Settings**:
   - Ensure "GitHub Actions" is selected as the source
   - Not "Deploy from a branch"

2. **Check Workflow Status**:
   - Go to **Actions** tab
   - Check if the workflow completed successfully
   - Review any error messages

3. **Check Permissions**:
   - Go to **Settings** → **Actions** → **General**
   - Under "Workflow permissions", ensure "Read and write permissions" is selected

### Build Failures

1. **Check Requirements**:
   - Ensure `requirements.txt` is up to date
   - All dependencies are specified

2. **Check mkdocs.yml**:
   - Verify YAML syntax is correct
   - Ensure all referenced files exist

3. **View Logs**:
   - Go to **Actions** tab
   - Click on the failed workflow run
   - Review the build logs for errors

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file in the `docs/` directory:
```
yourdomain.com
```

2. Configure DNS settings for your domain to point to GitHub Pages

3. Update `mkdocs.yml`:
```yaml
site_url: https://yourdomain.com
```

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the site
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

This creates a `gh-pages` branch and deploys manually. However, using GitHub Actions is recommended for automatic deployments.

## Updating Your Site

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update course content"
git push
```

The workflow will automatically rebuild and redeploy your site.

