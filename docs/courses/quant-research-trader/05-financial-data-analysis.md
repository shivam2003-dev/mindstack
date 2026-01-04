# Financial Data Analysis

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Learn to analyze financial time series data</li>
    <li>Understand returns, volatility, and risk metrics</li>
    <li>Master data visualization for finance</li>
    <li>Learn statistical analysis techniques</li>
  </ul>
</div>

This chapter covers essential techniques for analyzing financial data, calculating key metrics, and visualizing market behavior.

## Returns Analysis

### Simple Returns

```python
import pandas as pd
import numpy as np
import yfinance as yf

# Get data
data = yf.download("AAPL", period="1y")['Close']

# Calculate simple returns
returns = data.pct_change().dropna()

# Basic statistics
print(f"Mean Daily Return: {returns.mean():.4f}")
print(f"Std Dev: {returns.std():.4f}")
print(f"Annualized Return: {returns.mean() * 252:.4f}")
print(f"Annualized Volatility: {returns.std() * np.sqrt(252):.4f}")
```

### Log Returns

```python
# Log returns (better for statistical analysis)
log_returns = np.log(data / data.shift(1)).dropna()

# Cumulative log returns
cumulative_log_returns = log_returns.cumsum()
```

### Cumulative Returns

```python
# Cumulative simple returns
cumulative_returns = (1 + returns).cumprod() - 1

# Plot cumulative returns
import matplotlib.pyplot as plt
plt.figure(figsize=(12, 6))
plt.plot(cumulative_returns.index, cumulative_returns)
plt.title('Cumulative Returns')
plt.ylabel('Cumulative Return')
plt.grid(True)
plt.show()
```

## Volatility Analysis

### Historical Volatility

```python
# Rolling volatility (20-day window)
rolling_vol = returns.rolling(window=20).std() * np.sqrt(252)

# Plot volatility
plt.figure(figsize=(12, 6))
plt.plot(rolling_vol.index, rolling_vol)
plt.title('20-Day Rolling Volatility')
plt.ylabel('Annualized Volatility')
plt.grid(True)
plt.show()
```

### Volatility Clustering

```python
# Check for volatility clustering
from scipy import stats

# GARCH-like analysis
squared_returns = returns ** 2
autocorr = [squared_returns.autocorr(lag=i) for i in range(1, 21)]

plt.figure(figsize=(10, 6))
plt.bar(range(1, 21), autocorr)
plt.title('Autocorrelation of Squared Returns (Volatility Clustering)')
plt.xlabel('Lag')
plt.ylabel('Autocorrelation')
plt.show()
```

## Risk Metrics

### Value at Risk (VaR)

```python
from scipy import stats

# Parametric VaR (assuming normal distribution)
confidence_level = 0.95
z_score = stats.norm.ppf(1 - confidence_level)
var_parametric = returns.mean() - z_score * returns.std()

# Historical VaR
var_historical = np.percentile(returns, (1 - confidence_level) * 100)

print(f"95% VaR (Parametric): {var_parametric:.4f}")
print(f"95% VaR (Historical): {var_historical:.4f}")
```

### Conditional VaR (CVaR)

```python
# CVaR (Expected Shortfall)
cvar = returns[returns <= var_historical].mean()
print(f"95% CVaR: {cvar:.4f}")
```

### Maximum Drawdown

```python
# Calculate drawdown
cumulative = (1 + returns).cumprod()
running_max = cumulative.expanding().max()
drawdown = (cumulative - running_max) / running_max

# Maximum drawdown
max_drawdown = drawdown.min()
print(f"Maximum Drawdown: {max_drawdown:.4f} ({max_drawdown*100:.2f}%)")

# Plot drawdown
plt.figure(figsize=(12, 6))
plt.fill_between(drawdown.index, drawdown, 0, alpha=0.3, color='red')
plt.title('Drawdown Over Time')
plt.ylabel('Drawdown')
plt.grid(True)
plt.show()
```

## Performance Metrics

### Sharpe Ratio

```python
def sharpe_ratio(returns, risk_free_rate=0.02):
    excess_returns = returns - risk_free_rate / 252
    sharpe = np.sqrt(252) * excess_returns.mean() / returns.std()
    return sharpe

sharpe = sharpe_ratio(returns)
print(f"Sharpe Ratio: {sharpe:.4f}")
```

### Sortino Ratio

```python
def sortino_ratio(returns, risk_free_rate=0.02):
    excess_returns = returns - risk_free_rate / 252
    downside_returns = excess_returns[excess_returns < 0]
    downside_std = downside_returns.std()
    sortino = np.sqrt(252) * excess_returns.mean() / downside_std
    return sortino

sortino = sortino_ratio(returns)
print(f"Sortino Ratio: {sortino:.4f}")
```

### Calmar Ratio

```python
def calmar_ratio(returns):
    annual_return = returns.mean() * 252
    max_dd = abs(drawdown.min())
    calmar = annual_return / max_dd
    return calmar

calmar = calmar_ratio(returns)
print(f"Calmar Ratio: {calmar:.4f}")
```

## Correlation Analysis

### Pairwise Correlation

```python
# Multiple stocks
stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN']
multi_data = yf.download(stocks, period="1y")['Close']
multi_returns = multi_data.pct_change().dropna()

# Correlation matrix
correlation_matrix = multi_returns.corr()
print(correlation_matrix)

# Visualize
import seaborn as sns
plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
plt.title('Stock Correlation Matrix')
plt.show()
```

### Rolling Correlation

```python
# Rolling correlation between two stocks
rolling_corr = multi_returns['AAPL'].rolling(window=60).corr(multi_returns['GOOGL'])

plt.figure(figsize=(12, 6))
plt.plot(rolling_corr.index, rolling_corr)
plt.title('60-Day Rolling Correlation: AAPL vs GOOGL')
plt.ylabel('Correlation')
plt.grid(True)
plt.show()
```

## Distribution Analysis

### Returns Distribution

```python
# Plot returns distribution
plt.figure(figsize=(12, 6))
plt.hist(returns, bins=50, density=True, alpha=0.7, label='Returns')
plt.xlabel('Return')
plt.ylabel('Density')
plt.title('Returns Distribution')
plt.legend()
plt.grid(True)
plt.show()

# Test for normality
from scipy.stats import jarque_bera
jb_stat, jb_pvalue = jarque_bera(returns)
print(f"Jarque-Bera Test: Stat={jb_stat:.4f}, p-value={jb_pvalue:.4f}")
```

### Q-Q Plot

```python
from scipy import stats

# Q-Q plot against normal distribution
stats.probplot(returns, dist="norm", plot=plt)
plt.title('Q-Q Plot: Returns vs Normal Distribution')
plt.show()
```

## Time Series Analysis

### Stationarity Test

```python
from statsmodels.tsa.stattools import adfuller

# Augmented Dickey-Fuller test
adf_result = adfuller(returns)
print(f"ADF Statistic: {adf_result[0]:.4f}")
print(f"p-value: {adf_result[1]:.4f}")
print(f"Critical Values: {adf_result[4]}")

if adf_result[1] < 0.05:
    print("Returns are stationary")
else:
    print("Returns are not stationary")
```

### Autocorrelation

```python
from statsmodels.tsa.stattools import acf, pacf

# Autocorrelation function
autocorr = acf(returns, nlags=20)
partial_autocorr = pacf(returns, nlags=20)

# Plot ACF and PACF
fig, axes = plt.subplots(2, 1, figsize=(12, 8))
axes[0].stem(range(len(autocorr)), autocorr)
axes[0].set_title('Autocorrelation Function (ACF)')
axes[0].set_xlabel('Lag')
axes[1].stem(range(len(partial_autocorr)), partial_autocorr)
axes[1].set_title('Partial Autocorrelation Function (PACF)')
axes[1].set_xlabel('Lag')
plt.tight_layout()
plt.show()
```

## Portfolio Analysis

### Portfolio Returns

```python
# Portfolio with equal weights
weights = np.array([0.25, 0.25, 0.25, 0.25])
portfolio_returns = (multi_returns * weights).sum(axis=1)

# Portfolio statistics
print(f"Portfolio Mean Return: {portfolio_returns.mean():.4f}")
print(f"Portfolio Volatility: {portfolio_returns.std():.4f}")
print(f"Portfolio Sharpe Ratio: {sharpe_ratio(portfolio_returns):.4f}")
```

### Efficient Frontier

```python
# Generate random portfolios
num_portfolios = 10000
results = np.zeros((3, num_portfolios))

for i in range(num_portfolios):
    weights = np.random.random(len(stocks))
    weights /= weights.sum()
    
    portfolio_return = np.sum(multi_returns.mean() * weights) * 252
    portfolio_std = np.sqrt(np.dot(weights.T, np.dot(multi_returns.cov() * 252, weights)))
    sharpe = portfolio_return / portfolio_std
    
    results[0,i] = portfolio_return
    results[1,i] = portfolio_std
    results[2,i] = sharpe

# Plot efficient frontier
plt.figure(figsize=(12, 8))
plt.scatter(results[1,:], results[0,:], c=results[2,:], cmap='viridis')
plt.colorbar(label='Sharpe Ratio')
plt.xlabel('Volatility')
plt.ylabel('Expected Return')
plt.title('Efficient Frontier')
plt.show()
```

## Key Takeaways

- Returns analysis: Simple vs log returns, cumulative returns
- Volatility: Historical volatility, volatility clustering
- Risk metrics: VaR, CVaR, maximum drawdown
- Performance: Sharpe, Sortino, Calmar ratios
- Correlation: Pairwise and rolling correlations
- Distribution: Normality tests, Q-Q plots
- Time series: Stationarity, autocorrelation
- Portfolio: Portfolio returns, efficient frontier

---

**Previous**: [Python for Quantitative Finance](04-python-quant-finance.md) | **Next**: [Technical Analysis](06-technical-analysis.md)

