# mindstack

A comprehensive MkDocs-based learning platform for modern technologies. Learn PyTorch, Docker, Kubernetes, and more through structured, hands-on courses.

## Features

- 📚 **Multiple Courses**: Structured courses on PyTorch, Docker, Kubernetes, and more
- 🎨 **Material Theme**: Beautiful, modern UI with dark mode support
- 📝 **Markdown-Based**: Easy to write and maintain course content
- 🔍 **Search**: Full-text search across all courses
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- 🚀 **GitHub Ready**: Easy to deploy to GitHub Pages

## Quick Start

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mindstack.git
cd mindstack
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Serve the documentation locally:
```bash
mkdocs serve
```

4. Open your browser and navigate to `http://127.0.0.1:8000`

## Building the Documentation

To build a static site:

```bash
mkdocs build
```

The site will be generated in the `site/` directory.

## Project Structure

```
mindstack/
├── docs/
│   ├── index.md                    # Homepage
│   └── courses/
│       ├── pytorch/
│       │   ├── 01-intro.md
│       │   ├── 02-tensors.md
│       │   └── 03-autograd.md
│       ├── docker/
│       │   ├── 01-intro.md
│       │   ├── 02-containers.md
│       │   └── 03-images.md
│       └── kubernetes/
│           ├── 01-intro.md
│           ├── 02-pods.md
│           └── 03-deployments.md
├── mkdocs.yml                      # MkDocs configuration
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## Adding a New Course

1. Create a new directory under `docs/courses/`:
```bash
mkdir -p docs/courses/<course_name>
```

2. Create sequentially numbered lesson files:
```bash
touch docs/courses/<course_name>/01-intro.md
touch docs/courses/<course_name>/02-lesson-name.md
# ... and so on
```

3. Update `mkdocs.yml` to include the new course in the navigation:
```yaml
nav:
  - Courses:
    - New Course:
      - courses/<course_name>/01-intro.md
      - courses/<course_name>/02-lesson-name.md
```

4. Write your course content in Markdown format.

## Markdown Features

The platform supports various Markdown extensions:

- **Code highlighting**: Syntax highlighting for code blocks
- **Admonitions**: Info boxes, warnings, tips, etc.
- **Tabs**: Tabbed content sections
- **Mermaid diagrams**: Flowcharts, sequence diagrams, etc.
- **Task lists**: Checkbox lists
- **Tables**: Markdown tables

### Example Admonitions

```markdown
!!! tip "Tip"
    This is a helpful tip.

!!! warning "Warning"
    This is a warning message.

!!! note "Note"
    This is a note.
```

### Example Tabs

````markdown
=== "Python"
    ```python
    print("Hello, World!")
    ```

=== "JavaScript"
    ```javascript
    console.log("Hello, World!");
    ```
````

## Deployment

### GitHub Pages (Automatic with GitHub Actions)

This repository includes a GitHub Actions workflow that automatically builds and deploys your site to GitHub Pages whenever you push to the `main` or `master` branch.

#### Initial Setup

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/mindstack.git
git push -u origin main
```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

3. **Update repository URL** (if needed):
   - Edit `mkdocs.yml` and update the `repo_url` with your actual GitHub repository URL:
   ```yaml
   repo_url: https://github.com/yourusername/mindstack
   ```

4. **Push to trigger deployment**:
```bash
git add .
git commit -m "Configure GitHub Pages"
git push
```

The GitHub Actions workflow (`.github/workflows/ci.yml`) will automatically:
- Build your MkDocs site
- Deploy it to GitHub Pages
- Make it available at `https://yourusername.github.io/mindstack`

#### Manual Deployment (Alternative)

If you prefer manual deployment:

1. Build the site:
```bash
mkdocs build
```

2. Deploy to GitHub Pages:
```bash
mkdocs gh-deploy
```

This creates a `gh-pages` branch and deploys the site manually.

### Other Platforms

The generated `site/` directory can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with [MkDocs](https://www.mkdocs.org/) and [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/).
