# Statistical Concepts for Trading

Essential statistical concepts for quantitative trading: hypothesis testing, regression, time series analysis, and statistical arbitrage.

## Hypothesis Testing

### T-Test for Returns

```python
from scipy import stats
import numpy as np

returns = np.array([0.01, 0.02, -0.01, 0.03, 0.01])

# Test if mean return is significantly different from zero
t_stat, p_value = stats.ttest_1samp(returns, 0)
print(f"T-statistic: {t_stat:.4f}, P-value: {p_value:.4f}")
```

### Correlation Testing

```python
# Test if correlation is significant
from scipy.stats import pearsonr

stock_a_returns = np.array([0.01, 0.02, -0.01, 0.03])
stock_b_returns = np.array([0.015, 0.025, -0.005, 0.035])

corr, p_value = pearsonr(stock_a_returns, stock_b_returns)
print(f"Correlation: {corr:.4f}, P-value: {p_value:.4f}")
```

## Regression Analysis

### Linear Regression

```python
from sklearn.linear_model import LinearRegression

# Market model: Stock return vs Market return
market_returns = np.array([0.01, 0.02, -0.01, 0.03, 0.01])
stock_returns = np.array([0.015, 0.025, -0.005, 0.035, 0.015])

model = LinearRegression()
model.fit(market_returns.reshape(-1, 1), stock_returns)

beta = model.coef_[0]  # Market beta
alpha = model.intercept_  # Alpha (excess return)

print(f"Beta: {beta:.4f}")
print(f"Alpha: {alpha:.4f}")
```

## Time Series Statistics

### Stationarity

```python
from statsmodels.tsa.stattools import adfuller

# Test for stationarity
adf_result = adfuller(returns)
if adf_result[1] < 0.05:
    print("Series is stationary")
```

### Autocorrelation

```python
from statsmodels.tsa.stattools import acf

# Calculate autocorrelation
autocorr = acf(returns, nlags=10)
print(f"First-order autocorrelation: {autocorr[1]:.4f}")
```

## Key Concepts

- **Hypothesis Testing**: Validate trading strategies statistically
- **Regression**: Model relationships between variables
- **Stationarity**: Required for many time series models
- **Autocorrelation**: Detect patterns in returns

---

**Previous**: [Technical Analysis](06-technical-analysis.md) | **Next**: [Trading Strategies](08-trading-strategies.md)

