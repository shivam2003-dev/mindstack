# Statistical Concepts for Trading

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand hypothesis testing for trading strategies</li>
    <li>Master regression analysis for financial data</li>
    <li>Learn time series statistical concepts</li>
    <li>Apply statistical methods to validate strategies</li>
  </ul>
</div>

Statistics is fundamental to quantitative trading. This chapter covers essential statistical concepts you'll use to validate strategies, analyze relationships, and make data-driven trading decisions.

## Hypothesis Testing

### Why Hypothesis Testing?

Hypothesis testing helps you determine if your trading strategy's results are statistically significant or just due to chance.

### T-Test for Returns

Test if mean return is significantly different from zero:

```python
from scipy import stats
import numpy as np
import pandas as pd
import yfinance as yf

# Get returns data
data = yf.download("AAPL", period="1y")['Close']
returns = data.pct_change().dropna()

# Test if mean return is significantly different from zero
t_stat, p_value = stats.ttest_1samp(returns, 0)
print(f"T-statistic: {t_stat:.4f}")
print(f"P-value: {p_value:.4f}")

if p_value < 0.05:
    print("Mean return is significantly different from zero (95% confidence)")
else:
    print("Cannot reject null hypothesis - mean return may be zero")
```

### Two-Sample T-Test

Compare returns of two strategies:

```python
# Strategy A returns
strategy_a = np.array([0.01, 0.02, -0.01, 0.03, 0.01, 0.02])

# Strategy B returns
strategy_b = np.array([0.015, 0.025, -0.005, 0.035, 0.015, 0.025])

# Test if means are significantly different
t_stat, p_value = stats.ttest_ind(strategy_a, strategy_b)
print(f"T-statistic: {t_stat:.4f}, P-value: {p_value:.4f}")

if p_value < 0.05:
    print("Strategies have significantly different returns")
```

### Correlation Testing

Test if correlation between two stocks is significant:

```python
from scipy.stats import pearsonr

# Get data for two stocks
stock_a = yf.download("AAPL", period="1y")['Close']
stock_b = yf.download("MSFT", period="1y")['Close']

# Calculate returns
returns_a = stock_a.pct_change().dropna()
returns_b = stock_b.pct_change().dropna()

# Test correlation
corr, p_value = pearsonr(returns_a, returns_b)
print(f"Correlation: {corr:.4f}")
print(f"P-value: {p_value:.4f}")

if p_value < 0.05:
    print("Correlation is statistically significant")
```

### Chi-Square Test

Test for independence (e.g., are winning trades independent?):

```python
from scipy.stats import chi2_contingency

# Contingency table: Win/Loss by Day of Week
observed = np.array([[50, 30, 40, 45, 35],  # Wins by day
                     [20, 30, 25, 20, 30]])  # Losses by day

chi2, p_value, dof, expected = chi2_contingency(observed)
print(f"Chi-square: {chi2:.4f}, P-value: {p_value:.4f}")

if p_value < 0.05:
    print("Win/loss is dependent on day of week")
```

## Regression Analysis

### Simple Linear Regression

Model relationship between stock return and market return:

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import matplotlib.pyplot as plt

# Get market and stock data
market = yf.download("SPY", period="1y")['Close']
stock = yf.download("AAPL", period="1y")['Close']

# Calculate returns
market_returns = market.pct_change().dropna()
stock_returns = stock.pct_change().dropna()

# Align data
aligned_data = pd.DataFrame({
    'Market': market_returns,
    'Stock': stock_returns
}).dropna()

# Fit model
model = LinearRegression()
X = aligned_data[['Market']].values
y = aligned_data['Stock'].values

model.fit(X, y)
predictions = model.predict(X)

# Results
beta = model.coef_[0]  # Market beta
alpha = model.intercept_  # Alpha (excess return)
r2 = r2_score(y, predictions)

print(f"Beta: {beta:.4f}")
print(f"Alpha: {alpha:.4f}")
print(f"R-squared: {r2:.4f}")

# Interpret
if beta > 1:
    print("Stock is more volatile than market")
elif beta < 1:
    print("Stock is less volatile than market")
```

### Multiple Linear Regression

Use multiple factors to predict returns:

```python
# Prepare factors
factors = pd.DataFrame({
    'Market': market_returns,
    'Momentum': stock_returns.rolling(10).sum(),
    'Volatility': stock_returns.rolling(20).std()
}).dropna()

# Target: next period return
target = stock_returns.shift(-1).dropna()

# Align
aligned = pd.concat([factors, target], axis=1).dropna()
X = aligned[['Market', 'Momentum', 'Volatility']].values
y = aligned.iloc[:, -1].values

# Fit model
model = LinearRegression()
model.fit(X, y)

# Coefficients
print("Factor Loadings:")
for i, factor in enumerate(['Market', 'Momentum', 'Volatility']):
    print(f"{factor}: {model.coef_[i]:.4f}")
print(f"Intercept (Alpha): {model.intercept_:.4f}")
```

### Regression Diagnostics

Check regression assumptions:

```python
from scipy import stats

# Residuals
residuals = y - model.predict(X)

# Normality test
shapiro_stat, shapiro_p = stats.shapiro(residuals)
print(f"Shapiro-Wilk test: p-value = {shapiro_p:.4f}")

# Autocorrelation of residuals
from statsmodels.tsa.stattools import acf
resid_autocorr = acf(residuals, nlags=5)
print(f"Residual autocorrelation (lag 1): {resid_autocorr[1]:.4f}")

# Heteroscedasticity test
from statsmodels.stats.diagnostic import het_breuschpagan
bp_stat, bp_p, _, _ = het_breuschpagan(residuals, X)
print(f"Breusch-Pagan test: p-value = {bp_p:.4f}")
```

## Time Series Statistics

### Stationarity

Many time series models require stationary data:

```python
from statsmodels.tsa.stattools import adfuller

# Test for stationarity
adf_result = adfuller(returns)
print(f"ADF Statistic: {adf_result[0]:.4f}")
print(f"P-value: {adf_result[1]:.4f}")
print("Critical Values:")
for key, value in adf_result[4].items():
    print(f"\t{key}: {value:.4f}")

if adf_result[1] < 0.05:
    print("Series is stationary (reject null hypothesis)")
else:
    print("Series is not stationary (cannot reject null hypothesis)")
    # Make stationary by differencing
    returns_diff = returns.diff().dropna()
    adf_diff = adfuller(returns_diff)
    if adf_diff[1] < 0.05:
        print("First difference is stationary")
```

### Autocorrelation

Detect patterns and dependencies in returns:

```python
from statsmodels.tsa.stattools import acf, pacf
import matplotlib.pyplot as plt

# Calculate ACF and PACF
autocorr = acf(returns, nlags=20, fft=True)
partial_autocorr = pacf(returns, nlags=20)

# Plot
fig, axes = plt.subplots(2, 1, figsize=(12, 8))
axes[0].stem(range(len(autocorr)), autocorr)
axes[0].axhline(y=0, color='k', linestyle='-')
axes[0].axhline(y=1.96/np.sqrt(len(returns)), color='r', linestyle='--', label='95% confidence')
axes[0].axhline(y=-1.96/np.sqrt(len(returns)), color='r', linestyle='--')
axes[0].set_title('Autocorrelation Function (ACF)')
axes[0].set_xlabel('Lag')
axes[0].legend()

axes[1].stem(range(len(partial_autocorr)), partial_autocorr)
axes[1].axhline(y=0, color='k', linestyle='-')
axes[1].axhline(y=1.96/np.sqrt(len(returns)), color='r', linestyle='--')
axes[1].axhline(y=-1.96/np.sqrt(len(returns)), color='r', linestyle='--')
axes[1].set_title('Partial Autocorrelation Function (PACF)')
axes[1].set_xlabel('Lag')
plt.tight_layout()
plt.show()

# Test for significant autocorrelation
from statsmodels.stats.diagnostic import acorr_ljungbox
lb_stat, lb_pvalue = acorr_ljungbox(returns, lags=10, return_p=True)
print(f"Ljung-Box test p-value: {lb_pvalue[-1]:.4f}")
if lb_pvalue[-1] < 0.05:
    print("Significant autocorrelation detected")
```

### Cointegration

Test for long-term relationships (important for pairs trading):

```python
from statsmodels.tsa.stattools import coint

# Get two correlated stocks
stock1 = yf.download("AAPL", period="2y")['Close']
stock2 = yf.download("MSFT", period="2y")['Close']

# Test for cointegration
score, pvalue, _ = coint(stock1, stock2)
print(f"Cointegration test statistic: {score:.4f}")
print(f"P-value: {pvalue:.4f}")

if pvalue < 0.05:
    print("Stocks are cointegrated - good for pairs trading")
    # Calculate spread
    spread = stock1 - stock2
    print(f"Spread mean: {spread.mean():.2f}")
    print(f"Spread std: {spread.std():.2f}")
```

## Distribution Analysis

### Normality Tests

Test if returns follow normal distribution:

```python
from scipy import stats

# Jarque-Bera test
jb_stat, jb_pvalue = stats.jarque_bera(returns)
print(f"Jarque-Bera statistic: {jb_stat:.4f}")
print(f"P-value: {jb_pvalue:.4f}")

if jb_pvalue < 0.05:
    print("Returns are NOT normally distributed")
else:
    print("Returns may be normally distributed")

# Kolmogorov-Smirnov test
ks_stat, ks_pvalue = stats.kstest(returns, 'norm', 
                                   args=(returns.mean(), returns.std()))
print(f"\nKS statistic: {ks_stat:.4f}")
print(f"P-value: {ks_pvalue:.4f}")
```

### Q-Q Plot

Visual test for normality:

```python
from scipy import stats
import matplotlib.pyplot as plt

# Q-Q plot
stats.probplot(returns, dist="norm", plot=plt)
plt.title('Q-Q Plot: Returns vs Normal Distribution')
plt.grid(True)
plt.show()
```

## Statistical Significance in Trading

### Multiple Testing Problem

When testing many strategies, adjust for multiple comparisons:

```python
from statsmodels.stats.multitest import multipletests

# P-values from testing 10 strategies
p_values = [0.03, 0.05, 0.01, 0.08, 0.02, 0.04, 0.06, 0.09, 0.01, 0.07]

# Bonferroni correction
rejected, p_corrected, _, _ = multipletests(p_values, alpha=0.05, method='bonferroni')
print("Original p-values:", p_values)
print("Corrected p-values:", p_corrected)
print("Rejected hypotheses:", rejected)
```

### Confidence Intervals

Calculate confidence intervals for strategy returns:

```python
from scipy import stats

# 95% confidence interval for mean return
mean_return = returns.mean()
std_error = returns.std() / np.sqrt(len(returns))
confidence = 0.95
alpha = 1 - confidence

t_critical = stats.t.ppf(1 - alpha/2, len(returns) - 1)
margin_error = t_critical * std_error

ci_lower = mean_return - margin_error
ci_upper = mean_return + margin_error

print(f"Mean return: {mean_return:.4f}")
print(f"95% Confidence Interval: [{ci_lower:.4f}, {ci_upper:.4f}]")
```

## Key Takeaways

- **Hypothesis Testing**: Validate if strategy results are statistically significant
- **Regression**: Model relationships between variables (e.g., stock vs market)
- **Stationarity**: Required for many time series models - test and transform if needed
- **Autocorrelation**: Detect patterns and dependencies in returns
- **Cointegration**: Important for pairs trading strategies
- **Multiple Testing**: Adjust p-values when testing many strategies
- **Confidence Intervals**: Quantify uncertainty in estimates

---

**Previous**: [Technical Analysis](06-technical-analysis.md) | **Next**: [Trading Strategies](08-trading-strategies.md)

