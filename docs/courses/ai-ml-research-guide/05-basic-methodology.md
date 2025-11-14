# Chapter 5: Basic Research Methodology

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand research methodology fundamentals</li>
    <li>Learn experimental design principles</li>
    <li>Understand hypothesis testing</li>
    <li>Learn about variables and controls</li>
    <li>Understand basic statistical concepts</li>
  </ul>
</div>

## What is Research Methodology?

**Research methodology** is the systematic approach to conducting research. It includes:

- Research design
- Data collection methods
- Experimental procedures
- Analysis techniques
- Validation methods

!!! note "Methodology vs. Methods"
    - **Methodology**: Overall approach and philosophy
    - **Methods**: Specific techniques and procedures

## Research Design Types

### 1. Experimental Research

**Definition**: Manipulate variables to observe effects

**Characteristics**:
- Controlled conditions
- Manipulation of variables
- Random assignment
- Cause-effect relationships

**Example**: Testing if dropout improves generalization

!!! tip "Experimental Design"
    - Control group: Baseline (no dropout)
    - Experimental group: With dropout
    - Measure: Generalization accuracy
    - Compare: Statistical significance

### 2. Observational Research

**Definition**: Observe without manipulation

**Characteristics**:
- No variable manipulation
- Natural settings
- Correlation analysis
- Descriptive

**Example**: Analyzing model performance on different datasets

!!! note "Observational Studies"
    Can show correlations but not causation. Useful for exploratory research.

### 3. Comparative Research

**Definition**: Compare different methods/approaches

**Characteristics**:
- Multiple conditions
- Fair comparisons
- Standardized evaluation
- Statistical testing

**Example**: Comparing ResNet vs. EfficientNet on ImageNet

!!! warning "Fair Comparisons"
    - Same datasets
    - Same evaluation metrics
    - Same computational budget
    - Same preprocessing

### 4. Case Study Research

**Definition**: In-depth study of specific cases

**Characteristics**:
- Detailed analysis
- Specific context
- Rich insights
- Limited generalization

**Example**: Detailed analysis of why a specific model fails

## Experimental Design Principles

### 1. Control

**Definition**: Baseline for comparison

**Purpose**:
- Establish baseline performance
- Isolate effects of intervention
- Validate improvements

**Types of Controls**:
- **No treatment**: Original method
- **Placebo**: Dummy intervention
- **Standard**: Existing best method

!!! tip "Control Selection"
    Use strongest baseline available. Weak baselines make results less convincing.

### 2. Randomization

**Definition**: Random assignment to groups

**Purpose**:
- Reduce bias
- Equalize groups
- Enable statistical inference

**Applications**:
- Train/val/test splits
- Hyperparameter search
- Ablation studies

!!! note "Randomization Importance"
    Critical for valid statistical conclusions. Use random seeds consistently.

### 3. Replication

**Definition**: Repeat experiments multiple times

**Purpose**:
- Verify results
- Estimate variability
- Increase confidence

**Practice**:
- Multiple runs with different seeds
- Report mean and std
- Statistical significance

!!! warning "Single Run Problem"
    Single runs can be misleading. Always report multiple runs.

### 4. Blinding

**Definition**: Hide condition information

**Purpose**:
- Reduce bias
- Objective evaluation
- Valid conclusions

**Application**:
- Evaluation without knowing method
- Automated evaluation
- Independent assessors

## Variables in Research

### Independent Variables

**Definition**: Variables you manipulate

**Examples**:
- Learning rate
- Architecture choice
- Data augmentation
- Loss function

!!! tip "Variable Selection"
    Choose variables that:
    - Are testable
    - Have clear levels
    - Are relevant to hypothesis

### Dependent Variables

**Definition**: Variables you measure

**Examples**:
- Accuracy
- Loss
- Training time
- Model size

!!! note "Measurement"
    Define how to measure dependent variables clearly and consistently.

### Confounding Variables

**Definition**: Variables that affect results but aren't controlled

**Examples**:
- Random seed
- Hardware differences
- Data preprocessing
- Implementation details

!!! warning "Confounding Variables"
    Control or account for confounding variables. They can invalidate results.

## Hypothesis Testing

### Formulating Hypotheses

**Null Hypothesis (H₀)**: No effect/difference

**Alternative Hypothesis (H₁)**: Effect/difference exists

**Example**:
- H₀: Dropout doesn't improve generalization
- H₁: Dropout improves generalization

!!! tip "Hypothesis Formulation"
    - Be specific
    - Testable
    - Based on theory
    - Clear and measurable

### Statistical Testing

**Common Tests**:
- **t-test**: Compare means
- **ANOVA**: Multiple groups
- **Chi-square**: Categorical data
- **Mann-Whitney**: Non-parametric

**Significance Level (α)**:
- Common: α = 0.05
- Meaning: 5% chance of false positive
- p-value < α: Reject H₀

!!! note "Statistical Significance"
    p < 0.05 means results are unlikely due to chance (if H₀ is true).

### Effect Size

**Definition**: Magnitude of effect

**Why Important**:
- Statistical significance ≠ practical significance
- Large samples can show small effects
- Effect size shows practical importance

**Measures**:
- Cohen's d
- R²
- Difference in means

!!! warning "Significance vs. Effect Size"
    A statistically significant result may have small practical effect. Report both.

## Experimental Setup

### Dataset Selection

**Considerations**:
- **Relevance**: Appropriate for problem
- **Size**: Sufficient for conclusions
- **Quality**: Clean and reliable
- **Standard**: Commonly used benchmarks

!!! tip "Dataset Choice"
    Use standard benchmarks for comparability. Also test on diverse datasets.

### Evaluation Metrics

**Selection Criteria**:
- **Relevant**: Measures what matters
- **Standard**: Commonly used
- **Interpretable**: Easy to understand
- **Robust**: Not easily gamed

**Common Metrics**:
- **Classification**: Accuracy, F1, AUC
- **Regression**: MSE, MAE, R²
- **Ranking**: NDCG, MAP
- **Generation**: BLEU, ROUGE, FID

!!! note "Multiple Metrics"
    Use multiple metrics to get comprehensive view. No single metric is perfect.

### Baseline Selection

**Types**:
- **Simple**: Basic method
- **Standard**: Common approach
- **State-of-the-art**: Best known method

!!! success "Strong Baselines"
    Compare against strong baselines. Weak comparisons reduce credibility.

## Ablation Studies

### What is Ablation?

**Definition**: Remove components to understand contribution

**Purpose**:
- Understand what matters
- Validate design choices
- Identify key components

**Process**:
1. Full model (all components)
2. Remove component A
3. Remove component B
4. Compare results

!!! tip "Ablation Design"
    - Remove one component at a time
    - Test all combinations if feasible
    - Report all results
    - Explain findings

### Ablation Example

**Full Model**: ResNet + BatchNorm + Dropout + Data Augmentation

**Ablations**:
- Without BatchNorm
- Without Dropout
- Without Data Augmentation
- Without BatchNorm + Dropout

**Analysis**: Which components contribute most?

## Reproducibility

### Reproducibility Levels

1. **Reproducible**: Same code, same results
2. **Replicable**: Different code, same results
3. **Generalizable**: Works on different data/settings

!!! warning "Reproducibility Crisis"
    Many papers are not reproducible. Make yours reproducible.

### Reproducibility Checklist

**Code**:
- [ ] Code available
- [ ] Well documented
- [ ] Version controlled
- [ ] Dependencies listed

**Data**:
- [ ] Data available or accessible
- [ ] Preprocessing documented
- [ ] Splits specified

**Experiments**:
- [ ] Random seeds specified
- [ ] Hyperparameters listed
- [ ] Hardware specified
- [ ] Multiple runs reported

**Results**:
- [ ] All results reported
- [ ] Statistical tests included
- [ ] Figures reproducible

!!! success "Reproducibility Benefits"
    - Increases credibility
    - Enables follow-up work
    - Builds trust
    - Required by many venues

## Common Methodological Mistakes

### 1. Data Leakage

**Problem**: Information from test set leaks into training

**Examples**:
- Using test data for feature selection
- Preprocessing on full dataset
- Cross-validation errors

!!! warning "Data Leakage"
    Always split data first, then preprocess separately. This is a common mistake.

### 2. Overfitting to Validation Set

**Problem**: Tuning hyperparameters on validation set

**Solution**: Use separate validation and test sets

!!! note "Three-Way Split"
    - Train: Model training
    - Validation: Hyperparameter tuning
    - Test: Final evaluation (use once)

### 3. Insufficient Statistics

**Problem**: Single runs, no statistical tests

**Solution**: Multiple runs, report statistics

### 4. Unfair Comparisons

**Problem**: Different conditions for different methods

**Solution**: Same datasets, metrics, compute budget

### 5. Cherry Picking

**Problem**: Only reporting best results

**Solution**: Report all results, including failures

!!! warning "Ethical Research"
    Always report honestly. Cherry picking is unethical and harms science.

## Resources

???+ "📚 Methodology Guides"
    1. [Research Methods in ML](https://www.cs.cmu.edu/~tom/10701_sp11/lectures.shtml) - Tom Mitchell
    2. [Experimental Design](https://www.stat.cmu.edu/~hseltman/309/Book/Book.pdf) - Statistics guide
    3. [Reproducibility Guide](https://www.practicallypredictable.com/2017/07/05/reproducible-research-checklist/) - Checklist

???+ "📊 Statistics Resources"
    1. [Khan Academy Statistics](https://www.khanacademy.org/math/statistics-probability) - Free course
    2. [StatQuest](https://www.youtube.com/user/joshstarmer) - YouTube channel
    3. [Introduction to Statistical Learning](https://www.statlearning.com/) - Free book

???+ "🔬 Experimental Design"
    1. [Design of Experiments](https://www.itl.nist.gov/div898/handbook/pri/pri.htm) - NIST guide
    2. [A/B Testing Guide](https://www.optimizely.com/optimization-glossary/ab-testing/) - A/B testing
    3. [ML Experimentation](https://mlflow.org/) - MLflow

## Next Steps

- [Chapter 6: Literature Review](06-literature-review.md) - Conduct comprehensive reviews
- [Chapter 7: Research Design & Experimental Setup](07-research-design.md) - Design experiments

---

**Key Takeaways:**
- Research methodology provides systematic approach to research
- Experimental design requires controls, randomization, replication
- Hypothesis testing enables statistical conclusions
- Ablation studies help understand contributions
- Reproducibility is essential for credible research
- Avoid common mistakes like data leakage and unfair comparisons

