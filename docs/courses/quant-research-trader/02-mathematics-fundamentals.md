# Mathematics Fundamentals for Quantitative Finance

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Review essential calculus concepts</li>
    <li>Understand linear algebra basics</li>
    <li>Master statistics and probability</li>
    <li>Apply math to financial problems</li>
  </ul>
</div>

Mathematics is the foundation of quantitative finance. This chapter reviews essential mathematical concepts you'll use throughout your quant journey. Don't worry if you're rusty - we'll explain everything clearly!

## Calculus Basics

### Derivatives

**What it is**: The rate of change of a function

**In Finance**: Used to measure sensitivity (Greeks in options), optimization

**Key Concepts**:
- **First Derivative**: Rate of change
- **Second Derivative**: Rate of change of the rate of change
- **Chain Rule**: For composite functions

**Example - Price Change**:
```python
# If price P(t) = 100 + 5t (price increases by $5 per day)
# Derivative dP/dt = 5 (constant rate of change)
```

### Integration

**What it is**: The reverse of differentiation, finding the area under a curve

**In Finance**: Used in continuous-time models, calculating expected values

**Key Concepts**:
- **Definite Integral**: Area under curve between two points
- **Indefinite Integral**: Antiderivative

### Optimization

**What it is**: Finding maximum or minimum values

**In Finance**: Portfolio optimization, finding best parameters

**Methods**:
- **Gradient Descent**: Iterative optimization
- **Lagrange Multipliers**: Constrained optimization

## Linear Algebra

### Vectors and Matrices

**Vectors**: Arrays of numbers representing quantities with direction

**In Finance**: Portfolio weights, returns, prices

```python
import numpy as np

# Portfolio weights
weights = np.array([0.4, 0.3, 0.3])  # 40% stock A, 30% stock B, 30% stock C

# Returns
returns = np.array([0.05, 0.03, 0.02])  # 5%, 3%, 2% returns

# Portfolio return = weighted sum
portfolio_return = np.dot(weights, returns)
print(f"Portfolio Return: {portfolio_return:.4f}")  # 0.035 = 3.5%
```

### Matrix Operations

**Matrix Multiplication**: Used in portfolio calculations

**Inverse Matrix**: Solving systems of equations

**Eigenvalues/Eigenvectors**: Used in Principal Component Analysis (PCA)

### Dot Product

**Formula**: a · b = Σ(aᵢ × bᵢ)

**In Finance**: Calculating portfolio returns, correlations

```python
# Calculate portfolio return
weights = np.array([0.5, 0.3, 0.2])
returns = np.array([0.10, 0.05, 0.03])
portfolio_return = np.dot(weights, returns)
```

## Statistics

### Descriptive Statistics

**Mean (Average)**:
```python
import numpy as np

returns = [0.05, 0.03, -0.02, 0.08, 0.01]
mean_return = np.mean(returns)
print(f"Mean Return: {mean_return:.4f}")
```

**Median**: Middle value when sorted

**Standard Deviation**: Measure of volatility
```python
std_dev = np.std(returns)
print(f"Standard Deviation: {std_dev:.4f}")
```

**Variance**: Square of standard deviation
```python
variance = np.var(returns)
```

### Probability Distributions

**Normal Distribution**: Most common in finance
- Bell-shaped curve
- Defined by mean (μ) and standard deviation (σ)

```python
from scipy import stats
import matplotlib.pyplot as plt

# Generate normal distribution
mu, sigma = 0.05, 0.15  # 5% mean return, 15% volatility
normal_dist = stats.norm(mu, sigma)

# Calculate probability of return > 10%
prob = 1 - normal_dist.cdf(0.10)
print(f"Probability of return > 10%: {prob:.4f}")
```

**Other Distributions**:
- **Log-normal**: For stock prices (prices can't be negative)
- **Student's t**: For small samples
- **Chi-square**: For variance testing

### Correlation and Covariance

**Covariance**: Measures how two variables move together
```python
# Covariance between two stocks
stock_a = [0.05, 0.03, -0.02, 0.08]
stock_b = [0.04, 0.02, -0.01, 0.07]
covariance = np.cov(stock_a, stock_b)[0, 1]
```

**Correlation**: Normalized covariance (-1 to +1)
- **+1**: Perfect positive correlation
- **0**: No correlation
- **-1**: Perfect negative correlation

```python
correlation = np.corrcoef(stock_a, stock_b)[0, 1]
print(f"Correlation: {correlation:.4f}")
```

## Probability

### Basic Probability

**Probability**: Likelihood of an event (0 to 1)

**In Finance**: Probability of profit, probability of loss

### Conditional Probability

**P(A|B)**: Probability of A given B

**In Finance**: Probability of stock going up given market is up

### Bayes' Theorem

**Formula**: P(A|B) = P(B|A) × P(A) / P(B)

**In Finance**: Updating beliefs based on new information

### Expected Value

**Formula**: E[X] = Σ(xᵢ × P(xᵢ))

**In Finance**: Expected return, expected profit

```python
# Expected return
returns = [0.10, 0.05, -0.05]
probabilities = [0.5, 0.3, 0.2]
expected_return = sum(r * p for r, p in zip(returns, probabilities))
print(f"Expected Return: {expected_return:.4f}")
```

## Time Series Mathematics

### Returns

**Simple Return**: R = (P₁ - P₀) / P₀

**Log Return**: r = ln(P₁ / P₀)

```python
import pandas as pd

# Calculate simple returns
prices = [100, 105, 103, 108]
returns = pd.Series(prices).pct_change().dropna()
print(returns)

# Calculate log returns
log_returns = np.log(pd.Series(prices) / pd.Series(prices).shift(1)).dropna()
```

### Volatility

**Historical Volatility**: Standard deviation of returns

**Annualized Volatility**: σ_annual = σ_daily × √252

```python
# Calculate annualized volatility
daily_returns = [0.01, -0.02, 0.03, 0.01, -0.01]
daily_std = np.std(daily_returns)
annual_vol = daily_std * np.sqrt(252)  # 252 trading days per year
print(f"Annualized Volatility: {annual_vol:.4f}")
```

## Financial Mathematics

### Compound Interest

**Formula**: A = P(1 + r)ⁿ

**In Finance**: Future value of investments

```python
# Future value
principal = 1000
rate = 0.05  # 5% annual
years = 10
future_value = principal * (1 + rate) ** years
print(f"Future Value: ${future_value:.2f}")
```

### Present Value

**Formula**: PV = FV / (1 + r)ⁿ

**In Finance**: Discounting future cash flows

### Net Present Value (NPV)

**Formula**: NPV = Σ(CFₜ / (1 + r)ᵗ)

**In Finance**: Evaluating investment opportunities

## Regression Analysis

### Linear Regression

**Formula**: y = α + βx + ε

**In Finance**: Finding relationships (e.g., stock vs. market)

```python
from sklearn.linear_model import LinearRegression

# Example: Stock return vs Market return
market_returns = [0.05, 0.03, -0.02, 0.08]
stock_returns = [0.06, 0.04, -0.01, 0.09]

model = LinearRegression()
model.fit(np.array(market_returns).reshape(-1, 1), stock_returns)
beta = model.coef_[0]
alpha = model.intercept_

print(f"Beta: {beta:.4f}")
print(f"Alpha: {alpha:.4f}")
```

### R-squared

**What it is**: Proportion of variance explained

**In Finance**: How well model explains returns

## Key Formulas for Quantitative Finance

### Sharpe Ratio

**Formula**: SR = (Rₚ - Rₑ) / σₚ

- Rₚ = Portfolio return
- Rₑ = Risk-free rate
- σₚ = Portfolio volatility

### Value at Risk (VaR)

**Formula**: VaR = μ - z × σ

- μ = Mean return
- z = Z-score (e.g., 1.96 for 95% confidence)
- σ = Standard deviation

```python
# Calculate VaR
mean_return = 0.05
std_dev = 0.15
confidence = 0.95
z_score = stats.norm.ppf(1 - confidence)
var = mean_return - z_score * std_dev
print(f"95% VaR: {var:.4f}")
```

## Practice Exercises

### Exercise 1: Calculate Portfolio Return

Given:
- Stock A: 40% weight, 10% return
- Stock B: 35% weight, 5% return
- Stock C: 25% weight, 8% return

Calculate portfolio return.

### Exercise 2: Calculate Correlation

Calculate correlation between two stocks with returns:
- Stock X: [0.05, 0.03, -0.02, 0.08]
- Stock Y: [0.04, 0.02, -0.01, 0.07]

### Exercise 3: Calculate Volatility

Calculate annualized volatility from daily returns:
- Daily returns: [0.01, -0.02, 0.03, 0.01, -0.01, 0.02, -0.01]

## Resources for Further Learning

- **Khan Academy**: Free math courses
- **3Blue1Brown**: Visual math explanations
- **Coursera**: Mathematics for Finance courses
- **Books**: "Mathematics for Finance" by Capinski & Zastawniak

---

**Key Takeaways**:
- Calculus: Derivatives measure sensitivity, integration for continuous models
- Linear Algebra: Vectors and matrices for portfolio calculations
- Statistics: Mean, variance, correlation for data analysis
- Probability: Expected values and distributions
- Time Series: Returns and volatility calculations

---

**Previous**: [Introduction](01-introduction.md) | **Next**: [Financial Markets Basics](03-financial-markets-basics.md)

