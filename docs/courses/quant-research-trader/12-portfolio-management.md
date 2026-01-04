# Portfolio Management

Modern Portfolio Theory, efficient frontier, asset allocation, and rebalancing strategies.

## Modern Portfolio Theory

### Efficient Frontier

```python
import numpy as np
import pandas as pd

def efficient_frontier(returns, num_portfolios=10000):
    """Generate efficient frontier"""
    num_assets = len(returns.columns)
    results = np.zeros((3, num_portfolios))
    
    for i in range(num_portfolios):
        weights = np.random.random(num_assets)
        weights /= weights.sum()
        
        portfolio_return = np.sum(returns.mean() * weights) * 252
        portfolio_std = np.sqrt(np.dot(weights.T, np.dot(returns.cov() * 252, weights)))
        sharpe = portfolio_return / portfolio_std
        
        results[0,i] = portfolio_return
        results[1,i] = portfolio_std
        results[2,i] = sharpe
    
    return results

# Usage
stocks = ['AAPL', 'GOOGL', 'MSFT']
data = yf.download(stocks, period="1y")['Close']
returns = data.pct_change().dropna()
frontier = efficient_frontier(returns)
```

## Asset Allocation

### Equal Weight

```python
num_assets = len(stocks)
equal_weights = np.array([1/num_assets] * num_assets)
```

### Risk Parity

```python
def risk_parity_weights(returns):
    """Equal risk contribution from each asset"""
    inv_vol = 1 / returns.std()
    weights = inv_vol / inv_vol.sum()
    return weights

weights = risk_parity_weights(returns)
```

## Rebalancing

### Periodic Rebalancing

```python
def rebalance_portfolio(weights, target_weights, rebalance_freq='M'):
    """Rebalance portfolio to target weights"""
    current_value = weights * prices
    total_value = current_value.sum()
    new_weights = target_weights
    return new_weights
```

## Key Takeaways

- **Efficient Frontier**: Optimal risk-return combinations
- **Asset Allocation**: Distribute capital across assets
- **Rebalancing**: Maintain target allocation
- **Diversification**: Reduce portfolio risk

---

**Previous**: [Backtesting](11-backtesting-validation.md) | **Next**: [Options & Derivatives](13-options-derivatives.md)

