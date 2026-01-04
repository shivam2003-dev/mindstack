# Performance Analysis

Performance attribution, strategy optimization, parameter sensitivity, and continuous improvement.

## Performance Attribution

### Return Decomposition

```python
# Analyze sources of returns
def performance_attribution(returns, factors):
    """Decompose returns by factors"""
    from sklearn.linear_model import LinearRegression
    
    model = LinearRegression()
    model.fit(factors, returns)
    
    explained = model.predict(factors)
    residual = returns - explained
    
    return {
        'Explained': explained,
        'Residual': residual,
        'Factor Loadings': model.coef_
    }
```

## Strategy Optimization

### Parameter Optimization

```python
from scipy.optimize import minimize

def objective(params):
    # params: [window1, window2, threshold]
    # Calculate strategy performance
    return -sharpe_ratio  # Minimize negative Sharpe

result = minimize(objective, x0=[20, 50, 0.02], method='Nelder-Mead')
optimal_params = result.x
```

### Grid Search

```python
from itertools import product

# Test parameter combinations
windows = [10, 20, 30, 50]
thresholds = [0.01, 0.02, 0.03, 0.05]

best_sharpe = -np.inf
best_params = None

for window, threshold in product(windows, thresholds):
    sharpe = test_strategy(window, threshold)
    if sharpe > best_sharpe:
        best_sharpe = sharpe
        best_params = (window, threshold)
```

## Parameter Sensitivity

### Sensitivity Analysis

```python
def sensitivity_analysis(base_params, ranges):
    """Test parameter sensitivity"""
    results = []
    
    for param_name, param_range in ranges.items():
        for value in param_range:
            params = base_params.copy()
            params[param_name] = value
            performance = test_strategy(**params)
            results.append({
                'param': param_name,
                'value': value,
                'performance': performance
            })
    
    return pd.DataFrame(results)
```

## Continuous Improvement

### Performance Monitoring

```python
# Track performance over time
def track_performance(returns, window=30):
    """Rolling performance metrics"""
    rolling_sharpe = returns.rolling(window).apply(
        lambda x: x.mean() / x.std() * np.sqrt(252)
    )
    return rolling_sharpe
```

### Strategy Refinement

- Monitor performance regularly
- Identify underperforming periods
- Adjust parameters carefully
- Test changes before implementing

## Key Takeaways

- **Performance Attribution**: Understand return sources
- **Optimization**: Find best parameters
- **Sensitivity**: Test parameter robustness
- **Continuous Improvement**: Monitor and refine

---

**Previous**: [Paper Trading](16-paper-trading-live.md) | **Next**: [Resources](18-resources.md)

