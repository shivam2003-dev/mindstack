# Chapter 7: Research Design & Experimental Setup

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Learn to design research experiments</li>
    <li>Understand experimental setup components</li>
    <li>Master hyperparameter tuning strategies</li>
    <li>Learn evaluation protocol design</li>
    <li>Understand baseline selection and comparison</li>
  </ul>
</div>

## Research Design Overview

**Research design** is the blueprint for your experiments. It defines:

- What to test
- How to test it
- What to measure
- How to compare
- What to report

!!! note "Design Importance"
    Good experimental design:
    - Ensures valid conclusions
    - Enables fair comparisons
    - Supports reproducibility
    - Demonstrates rigor

## Experimental Design Components

### 1. Research Questions

**Formulate Clear Questions**:
- Specific and testable
- Aligned with hypothesis
- Measurable outcomes
- Feasible to answer

**Example**:
- ❌ Bad: "Does our method work?"
- ✅ Good: "Does our attention mechanism improve small object detection accuracy by at least 5% on COCO dataset?"

!!! tip "Question Formulation"
    Use SMART criteria:
    - **S**pecific
    - **M**easurable
    - **A**chievable
    - **R**elevant
    - **T**ime-bound

### 2. Variables

**Independent Variables** (what you change):
- Architecture choices
- Hyperparameters
- Training strategies
- Data augmentations

**Dependent Variables** (what you measure):
- Accuracy metrics
- Training time
- Model size
- Inference speed

**Control Variables** (keep constant):
- Dataset
- Evaluation protocol
- Hardware
- Random seeds (for reproducibility)

!!! warning "Variable Control"
    Control all variables except the one you're testing. Otherwise, you can't attribute effects.

### 3. Experimental Conditions

**Define Conditions**:
- Baseline condition
- Experimental conditions
- Ablation conditions
- Comparison conditions

**Example**:
- Condition 1: Baseline (ResNet-50)
- Condition 2: ResNet-50 + Attention
- Condition 3: ResNet-50 + Attention + Data Aug

!!! note "Condition Design"
    Design conditions to answer specific questions. Each condition should test one thing.

## Dataset Selection and Splitting

### Dataset Selection

**Criteria**:
- **Relevance**: Appropriate for problem
- **Size**: Sufficient for conclusions
- **Quality**: Clean and reliable
- **Standard**: Commonly used (for comparison)
- **Diversity**: Multiple datasets (for generalization)

!!! tip "Dataset Choice"
    - Use standard benchmarks for comparison
    - Test on multiple datasets
    - Include diverse domains
    - Consider dataset size and quality

### Data Splitting

**Standard Split**:
- **Training**: 60-80% (model learning)
- **Validation**: 10-20% (hyperparameter tuning)
- **Test**: 10-20% (final evaluation)

**Cross-Validation**:
- K-fold cross-validation
- Stratified splits
- Time-series splits (if temporal)

!!! warning "Data Leakage"
    - Split before preprocessing
    - Never use test set for tuning
    - Use validation set for model selection
    - Test set only for final evaluation

### Stratification

**Purpose**: Maintain class distribution across splits

**Important For**:
- Imbalanced datasets
- Multi-class problems
- Small datasets

!!! note "Stratification"
    Ensures each split has similar class distribution. Critical for fair evaluation.

## Baseline Selection

### Types of Baselines

**1. Simple Baselines**:
- Random baseline
- Majority class
- Simple heuristics

**2. Standard Baselines**:
- Common methods in field
- Previously published results
- Standard architectures

**3. State-of-the-Art**:
- Best known methods
- Recent top performers
- Published SOTA results

!!! success "Strong Baselines"
    Compare against strongest baselines available. Weak comparisons reduce credibility.

### Baseline Implementation

**Best Practices**:
- Use official implementations when available
- Reproduce published results
- Use same evaluation protocol
- Report multiple runs

!!! tip "Baseline Fairness"
    - Same datasets
    - Same metrics
    - Same computational budget
    - Same preprocessing

## Hyperparameter Tuning

### Hyperparameter Types

**Architecture**:
- Number of layers
- Hidden dimensions
- Activation functions
- Regularization

**Training**:
- Learning rate
- Batch size
- Optimizer choice
- Schedule

**Regularization**:
- Dropout rate
- Weight decay
- Data augmentation
- Early stopping

### Tuning Strategies

**1. Grid Search**:
- Exhaustive search
- All combinations
- Computationally expensive
- Good for small spaces

**2. Random Search**:
- Random sampling
- More efficient
- Better for high dimensions
- Recommended default

**3. Bayesian Optimization**:
- Intelligent search
- Uses previous results
- Efficient
- Tools: Optuna, Hyperopt

!!! tip "Hyperparameter Tuning"
    - Use validation set (not test!)
    - Multiple runs per configuration
    - Report search space
    - Document final choices

### Tuning Protocol

**Process**:
1. Define search space
2. Choose tuning method
3. Run on validation set
4. Select best configuration
5. Evaluate on test set (once!)

!!! warning "Test Set Usage"
    Never tune on test set. Use validation set for all tuning, test set only for final evaluation.

## Evaluation Metrics

### Metric Selection

**Criteria**:
- **Relevant**: Measures what matters
- **Standard**: Commonly used in field
- **Interpretable**: Easy to understand
- **Robust**: Not easily gamed

**Common Metrics**:

**Classification**:
- Accuracy
- Precision, Recall, F1
- AUC-ROC
- Top-k accuracy

**Regression**:
- MSE, MAE, RMSE
- R²
- MAPE

**Ranking**:
- NDCG
- MAP
- MRR

!!! note "Multiple Metrics"
    Use multiple metrics for comprehensive evaluation. No single metric is perfect.

### Evaluation Protocol

**Standard Protocol**:
1. Train on training set
2. Tune on validation set
3. Evaluate on test set (once)
4. Report mean ± std over multiple runs

**Reporting**:
- Mean and standard deviation
- Statistical significance
- Confidence intervals
- Multiple runs (typically 3-5)

!!! success "Evaluation Best Practices"
    - Multiple runs with different seeds
    - Report statistics (mean, std)
    - Statistical significance tests
    - Fair comparisons

## Ablation Studies

### What is Ablation?

**Definition**: Remove components to understand contribution

**Purpose**:
- Understand what matters
- Validate design choices
- Identify key components
- Justify complexity

### Ablation Design

**Process**:
1. Full model (all components)
2. Remove component A → Test
3. Remove component B → Test
4. Remove A + B → Test
5. Compare all results

**Example**:
- Full: ResNet + BN + Dropout + Aug
- -BN: ResNet + Dropout + Aug
- -Dropout: ResNet + BN + Aug
- -Aug: ResNet + BN + Dropout
- -BN-Dropout: ResNet + Aug

!!! tip "Ablation Tips"
    - Remove one component at a time
    - Test all important combinations
    - Report all results
    - Explain findings clearly

## Experimental Setup Checklist

### Before Experiments

- [ ] Research questions defined
- [ ] Hypotheses formulated
- [ ] Datasets selected and split
- [ ] Baselines identified
- [ ] Metrics chosen
- [ ] Evaluation protocol defined
- [ ] Hyperparameter search space defined
- [ ] Computational resources allocated

### During Experiments

- [ ] Random seeds set
- [ ] Multiple runs planned
- [ ] Experiment tracking setup
- [ ] Logging configured
- [ ] Checkpoints saved
- [ ] Results documented

### After Experiments

- [ ] Results analyzed
- [ ] Statistics computed
- [ ] Visualizations created
- [ ] Ablations completed
- [ ] Comparisons made
- [ ] Findings documented

## Common Design Mistakes

### 1. Data Leakage

**Problem**: Information from test set leaks into training

**Prevention**:
- Split data first
- Preprocess separately
- Never use test set for tuning

!!! warning "Data Leakage"
    Very common mistake. Always split before any processing.

### 2. Overfitting to Validation Set

**Problem**: Tuning too much on validation set

**Solution**: Use separate validation and test sets

### 3. Insufficient Runs

**Problem**: Single run, no statistics

**Solution**: Multiple runs (3-5), report mean ± std

### 4. Unfair Comparisons

**Problem**: Different conditions for different methods

**Solution**: Same datasets, metrics, compute budget

### 5. Missing Ablations

**Problem**: Don't understand what matters

**Solution**: Systematic ablation studies

## Resources

???+ "📚 Experimental Design"
    1. [Design of Experiments](https://www.itl.nist.gov/div898/handbook/pri/pri.htm) - NIST guide
    2. [ML Experimentation](https://mlflow.org/) - MLflow guide
    3. [Hyperparameter Tuning](https://www.jeremyjordan.me/hyperparameter-tuning/) - Guide

???+ "🛠️ Tools"
    1. [Weights & Biases](https://wandb.ai/) - Experiment tracking
    2. [MLflow](https://mlflow.org/) - ML lifecycle
    3. [Optuna](https://optuna.org/) - Hyperparameter optimization
    4. [TensorBoard](https://www.tensorflow.org/tensorboard) - Visualization

???+ "📊 Statistics"
    1. [Statistical Tests](https://www.statstest.com/) - Test selection
    2. [Effect Size](https://www.psychometrica.de/effect_size.html) - Effect size calculator

## Next Steps

- [Chapter 8: Data Collection & Management](08-data-management.md) - Handle research data
- [Chapter 9: Reproducing Research Papers](09-reproducing-papers.md) - Code reproduction

---

**Key Takeaways:**
- Research design is blueprint for experiments
- Define clear research questions and variables
- Use proper data splitting (train/val/test)
- Select strong baselines for comparison
- Tune hyperparameters on validation set only
- Use multiple metrics and multiple runs
- Conduct systematic ablation studies
- Avoid common mistakes like data leakage

