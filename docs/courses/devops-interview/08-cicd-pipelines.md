# CI/CD Pipelines

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master CI/CD concepts and principles</li>
    <li>Design effective and efficient pipelines</li>
    <li>Learn advanced pipeline patterns</li>
    <li>Understand deployment strategies in depth</li>
    <li>Know pipeline optimization and best practices</li>
  </ul>
</div>

CI/CD pipelines are the backbone of modern DevOps. This comprehensive chapter covers everything from basic concepts to advanced pipeline design patterns used in production.

!!! tip "Interview Focus"
    Be ready to design complete pipelines, explain each stage, discuss trade-offs, and optimize for speed and reliability.

## CI/CD Fundamentals

### What is CI/CD?

**Continuous Integration (CI):**
- Automatically test code on every commit
- Detect integration issues early
- Provide fast feedback to developers
- Ensure code quality before merging

**Continuous Delivery:**
- Automatically deploy to staging/test environments
- Manual approval for production
- Always ready to deploy
- Low-risk releases

**Continuous Deployment:**
- Automatically deploy to production
- No manual intervention
- Requires comprehensive testing
- Highest automation level

!!! note "CI vs CD"
    - **CI**: Focus on integration and testing
    - **CD (Delivery)**: Deploy to staging automatically, production manually
    - **CD (Deployment)**: Deploy to production automatically

### Benefits of CI/CD

1. **Faster Time to Market**: Automated processes reduce deployment time
2. **Higher Quality**: Automated testing catches bugs early
3. **Reduced Risk**: Small, frequent deployments are safer
4. **Better Collaboration**: Shared responsibility between Dev and Ops
5. **Faster Feedback**: Developers know immediately if code works
6. **Rollback Capability**: Easy to revert problematic deployments

## Pipeline Architecture

### Typical Pipeline Stages

```
Source → Build → Test → Deploy → Monitor
  ↓       ↓       ↓       ↓        ↓
 Git    Compile  Unit   Staging  Health
Commit   Code    Tests   Env     Checks
```

### Detailed Stage Breakdown

**1. Source Stage:**
- Trigger on code commit
- Checkout source code
- Validate commit message
- Check branch protection rules

**2. Build Stage:**
- Install dependencies
- Compile/build application
- Create artifacts (Docker images, binaries)
- Store artifacts in registry

**3. Test Stage:**
- Unit tests
- Integration tests
- Code coverage
- Static code analysis
- Security scanning

**4. Deploy Stage:**
- Deploy to environments (dev → staging → production)
- Database migrations
- Configuration updates
- Health checks

**5. Monitor Stage:**
- Monitor deployment
- Check application health
- Verify metrics
- Alert on issues

## Advanced Pipeline Patterns

### Parallel Execution

Run independent stages in parallel for faster pipelines:

```yaml
# GitHub Actions Example
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run lint
  
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
  
  integration-tests:
    runs-on: ubuntu-latest
    needs: [lint, unit-tests]  # Wait for these
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:integration
```

**Benefits:**
- Faster pipeline execution
- Better resource utilization
- Independent test failures don't block others

### Pipeline as Code

Define pipelines in version control:

**GitHub Actions (.github/workflows/ci.yml):**
```yaml
name: CI Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

**GitLab CI (.gitlab-ci.yml):**
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm test
  coverage: '/Coverage: \d+\.\d+%/'

deploy:
  stage: deploy
  script:
    - ./deploy.sh
  only:
    - main
```

### Multi-Environment Pipelines

Deploy to multiple environments with approval gates:

```yaml
stages:
  - build
  - test
  - deploy-dev
  - deploy-staging
  - deploy-production

deploy-dev:
  stage: deploy-dev
  script:
    - ./deploy.sh dev
  only:
    - develop

deploy-staging:
  stage: deploy-staging
  script:
    - ./deploy.sh staging
  only:
    - main
  when: manual  # Requires manual approval

deploy-production:
  stage: deploy-production
  script:
    - ./deploy.sh production
  only:
    - main
  when: manual
  environment:
    name: production
    url: https://app.example.com
```

## Pipeline Optimization

### Caching Strategies

**Dependency Caching:**
```yaml
# GitHub Actions
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# GitLab CI
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .cache/
```

**Docker Layer Caching:**
```yaml
- name: Build Docker image
  uses: docker/build-push-action@v4
  with:
    context: .
    push: true
    cache-from: type=registry,ref=myapp:buildcache
    cache-to: type=registry,ref=myapp:buildcache,mode=max
```

### Fast Feedback Loops

**Run Quick Tests First:**
```yaml
jobs:
  quick-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Lint
        run: npm run lint  # Fast, fails early
      - name: Type check
        run: npm run type-check  # Fast
  
  full-tests:
    runs-on: ubuntu-latest
    needs: quick-checks  # Only if quick checks pass
    steps:
      - name: Unit tests
        run: npm test
      - name: Integration tests
        run: npm run test:integration  # Slower
```

**Fail Fast Strategy:**
- Run fastest tests first
- Stop pipeline on first failure
- Parallelize independent tests
- Cache aggressively

### Conditional Execution

**Skip stages based on conditions:**
```yaml
# Only run on main branch
deploy:
  script: ./deploy.sh
  only:
    - main

# Skip for documentation changes
test:
  script: npm test
  except:
    changes:
      - "docs/**/*"
      - "*.md"

# Run only for specific paths
backend-tests:
  script: npm run test:backend
  only:
    changes:
      - "backend/**/*"
```

## Deployment Strategies in CI/CD

### Blue-Green Deployment Pipeline

```yaml
stages:
  - build
  - deploy-blue
  - test-blue
  - deploy-green
  - test-green
  - switch-traffic
  - cleanup-blue

deploy-blue:
  stage: deploy-blue
  script:
    - docker build -t app:blue .
    - kubectl set image deployment/app app=app:blue

deploy-green:
  stage: deploy-green
  script:
    - docker build -t app:green .
    - kubectl set image deployment/app-green app=app:green

switch-traffic:
  stage: switch-traffic
  script:
    - kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
  when: manual
```

### Canary Deployment Pipeline

```yaml
deploy-canary:
  script:
    - kubectl set image deployment/app-canary app=app:new-version
    - kubectl scale deployment/app-canary --replicas=1

monitor-canary:
  script:
    - ./monitor-metrics.sh canary
  when: manual

promote-canary:
  script:
    - kubectl scale deployment/app-canary --replicas=5
    - kubectl scale deployment/app-stable --replicas=0
  when: manual
```

## Security in CI/CD

### Secrets Management

**GitHub Actions Secrets:**
```yaml
- name: Deploy
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: ./deploy.sh
```

**GitLab CI Variables:**
```yaml
deploy:
  script:
    - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin
  variables:
    DOCKER_DRIVER: overlay2
```

**Best Practices:**
- Never commit secrets to repository
- Use secret management tools (Vault, AWS Secrets Manager)
- Rotate secrets regularly
- Use least privilege principle
- Audit secret access

### Security Scanning

**SAST (Static Application Security Testing):**
```yaml
- name: Run SAST
  uses: github/super-linter@v4
  env:
    DEFAULT_BRANCH: main
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

- name: Security scan
  run: |
    npm audit
    bandit -r .  # Python security scanner
```

**Container Scanning:**
```yaml
- name: Scan Docker image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:latest
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**Dependency Scanning:**
```yaml
- name: Dependency check
  run: |
    npm audit
    pip-audit  # Python
    bundler-audit  # Ruby
```

## Comprehensive Interview Questions

### Q1: Design a complete CI/CD pipeline for a microservices application

**Answer:**

**Pipeline Design:**
```yaml
stages:
  - validate
  - build
  - test
  - security-scan
  - package
  - deploy-dev
  - integration-test
  - deploy-staging
  - e2e-test
  - deploy-production

validate:
  stage: validate
  script:
    - npm run lint
    - npm run type-check
    - git-secrets scan

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  parallel:
    - script: npm run test:unit
    - script: npm run test:integration
  coverage: '/Coverage: \d+\.\d+%/'

security-scan:
  stage: security-scan
  script:
    - trivy image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - npm audit

package:
  stage: package
  script:
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest

deploy-dev:
  stage: deploy-dev
  script:
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n dev
  only:
    - develop

deploy-production:
  stage: deploy-production
  script:
    - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n production
  only:
    - main
  when: manual
```

### Q2: How do you handle database migrations in CI/CD?

**Answer:**

**Strategy 1: Migration Job Before Deployment**
```yaml
migrate-database:
  stage: pre-deploy
  script:
    - kubectl run migration-$CI_COMMIT_SHA --image=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -- migrate
    - kubectl wait --for=condition=complete job/migration-$CI_COMMIT_SHA
  only:
    - main

deploy:
  needs: ["migrate-database"]
  script: ./deploy.sh
```

**Strategy 2: Init Container**
```yaml
# Deployment includes init container
initContainers:
- name: migrate
  image: app:latest
  command: ["alembic", "upgrade", "head"]
containers:
- name: app
  image: app:latest
```

**Best Practices:**
- Migrations must be backward compatible
- Test migrations in staging first
- Have rollback scripts ready
- Use feature flags for schema changes

### Q3: Explain the difference between Continuous Delivery and Continuous Deployment

**Answer:**

**Continuous Delivery:**
- Code is always deployable
- Automated deployment to staging
- Manual approval for production
- Lower risk, more control

**Continuous Deployment:**
- Automated deployment to production
- No manual intervention
- Requires comprehensive testing
- Higher automation, faster releases

**When to use:**
- **Delivery**: When you need control over production releases
- **Deployment**: When you have excellent test coverage and monitoring

### Q4: How do you optimize pipeline execution time?

**Answer:**

1. **Parallel Execution:**
   - Run independent jobs in parallel
   - Use matrix builds for multiple versions

2. **Caching:**
   - Cache dependencies
   - Cache Docker layers
   - Cache build artifacts

3. **Conditional Execution:**
   - Skip stages when not needed
   - Run only changed tests

4. **Fast Feedback:**
   - Run quick tests first
   - Fail fast on errors

5. **Resource Optimization:**
   - Use appropriate runner sizes
   - Optimize Docker builds

### Q5: How do you implement rollback in CI/CD pipelines?

**Answer:**

**Automatic Rollback:**
```yaml
deploy:
  script:
    - kubectl set image deployment/app app=app:$VERSION
    - kubectl rollout status deployment/app --timeout=5m
    - if [ $? -ne 0 ]; then
        kubectl rollout undo deployment/app;
        exit 1;
      fi
```

**Manual Rollback:**
```yaml
rollback:
  script:
    - kubectl rollout undo deployment/app
  when: manual
```

**Blue-Green Rollback:**
- Switch service selector back to previous version
- Instant rollback capability

## Recommended Resources

### Books
- **"Continuous Delivery" by Jez Humble, David Farley** - CI/CD bible
- **"The DevOps Handbook" by Gene Kim** - DevOps practices including CI/CD

### Articles
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Best Practices](https://docs.gitlab.com/ee/ci/pipelines/)

### Research Papers
- **"Continuous Integration"** - Martin Fowler's foundational article
- **"The Deployment Production Line"** - Deployment automation patterns

---

**Previous**: [Container Orchestration](07-container-orchestration) | **Next**: [GitHub Actions & GitLab CI](09-github-actions-gitlab)
