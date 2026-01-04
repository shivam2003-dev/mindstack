# Backtesting & Validation

Learn to backtest trading strategies, validate results, and avoid common pitfalls like overfitting.

## Backtesting Framework

### Basic Backtest

```python
import pandas as pd
import numpy as np

def backtest_strategy(data, signals):
    """Simple backtest function"""
    positions = signals.shift(1).fillna(0)  # Enter position next day
    returns = data['Close'].pct_change()
    strategy_returns = positions * returns
    cumulative_returns = (1 + strategy_returns).cumprod()
    return cumulative_returns

# Example usage
data = yf.download("AAPL", period="1y")
signals = generate_signals(data)  # Your signal function
cumulative = backtest_strategy(data, signals['Signal'])
```

## Performance Metrics

### Calculate Metrics

```python
def calculate_metrics(returns):
    """Calculate key performance metrics"""
    total_return = (1 + returns).prod() - 1
    sharpe = returns.mean() / returns.std() * np.sqrt(252)
    max_dd = max_drawdown(returns)
    win_rate = (returns > 0).sum() / len(returns)
    
    return {
        'Total Return': total_return,
        'Sharpe Ratio': sharpe,
        'Max Drawdown': max_dd,
        'Win Rate': win_rate
    }

metrics = calculate_metrics(strategy_returns)
```

## Walk-Forward Analysis

### Concept

Test strategy on rolling windows to avoid overfitting.

### Implementation

```python
def walk_forward_analysis(data, window=252, step=63):
    """Walk-forward backtest"""
    results = []
    
    for start in range(0, len(data) - window, step):
        train_data = data.iloc[start:start+window]
        test_data = data.iloc[start+window:start+window+step]
        
        # Train on window, test on next period
        # ... your strategy logic ...
        
        results.append(test_performance)
    
    return results
```

## Overfitting Prevention

### Out-of-Sample Testing

```python
# Split data
train_size = int(len(data) * 0.7)
train_data = data[:train_size]
test_data = data[train_size:]

# Develop strategy on training data
# Test on out-of-sample data
```

### Cross-Validation

```python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(data):
    train = data.iloc[train_idx]
    test = data.iloc[test_idx]
    # Test strategy
```

## Key Takeaways

- **Backtesting**: Test strategies on historical data
- **Performance Metrics**: Use multiple metrics to evaluate
- **Walk-Forward**: Test on rolling windows
- **Overfitting**: Always validate on out-of-sample data

---

**Previous**: [Advanced Strategies](10-advanced-strategies.md) | **Next**: [Portfolio Management](12-portfolio-management.md)

