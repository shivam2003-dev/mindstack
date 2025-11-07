# GitHub Actions & GitLab CI

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master GitHub Actions workflows</li>
    <li>Learn GitLab CI/CD pipelines</li>
    <li>Understand CI/CD best practices</li>
    <li>Build and deploy applications</li>
  </ul>
</div>

GitHub Actions and GitLab CI are modern CI/CD platforms. This chapter covers both with practical examples.

!!! tip "Interview Focus"
    Be ready to explain workflow syntax, triggers, jobs, and steps. Understand when to use which platform.

## GitHub Actions

### Basic Workflow

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

!!! note "Workflow Components"
    - **`on`**: Triggers (push, PR, schedule, etc.)
    - **`jobs`**: Parallel or sequential tasks
    - **`steps`**: Individual commands or actions
    - **`runs-on`**: Runner environment

### Docker Build and Push

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: user/app:latest
```

### Matrix Strategy

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14, 16, 18]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

!!! tip "Matrix Benefits"
    Test against multiple versions simultaneously, saving time and ensuring compatibility.

### Secrets and Environment Variables

```yaml
env:
  NODE_ENV: production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Use secret
        run: echo ${{ secrets.API_KEY }}
      
      - name: Use environment variable
        run: echo $NODE_ENV
```

!!! warning "Security Best Practices"
    - Never commit secrets to repository
    - Use GitHub Secrets for sensitive data
    - Rotate secrets regularly
    - Use least privilege principle

## GitLab CI

### Basic Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

test:
  stage: test
  image: node:18
  script:
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - ./deploy.sh
  only:
    - main
```

!!! note "GitLab CI Concepts"
    - **`stages`**: Pipeline stages (sequential)
    - **`jobs`**: Tasks within stages
    - **`artifacts`**: Files passed between jobs
    - **`only`/`except`**: Job triggers

### Docker in GitLab CI

```yaml
build-docker:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

### Conditional Jobs

```yaml
deploy-staging:
  stage: deploy
  script: ./deploy.sh staging
  only:
    - develop

deploy-production:
  stage: deploy
  script: ./deploy.sh production
  only:
    - main
  when: manual
```

## Best Practices

### 1. Fast Feedback

```yaml
# Run quick tests first
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint
  
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  
  integration-tests:
    runs-on: ubuntu-latest
    needs: [lint, unit-tests]
    steps:
      - run: npm run test:integration
```

### 2. Caching

```yaml
# GitHub Actions
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
```

### 3. Parallel Execution

```yaml
# Run independent jobs in parallel
jobs:
  test-unit:
    # ...
  test-integration:
    # ...
  lint:
    # ...
```

## Common Interview Questions

### Q: When to use GitHub Actions vs GitLab CI?

**Answer:**
- **GitHub Actions**: If using GitHub, integrated experience
- **GitLab CI**: If using GitLab, more features, self-hosted runners easier
- Both are powerful, choose based on your Git hosting

### Q: Explain workflow triggers

**Answer:**
- **Push**: On code push
- **Pull Request**: On PR creation/update
- **Schedule**: Cron-based (GitHub Actions)
- **Manual**: Manual trigger (GitLab CI)
- **Webhook**: External triggers

---

**Previous**: [CI/CD Pipelines](08-cicd-pipelines) | **Next**: [Infrastructure as Code](10-infrastructure-as-code)

