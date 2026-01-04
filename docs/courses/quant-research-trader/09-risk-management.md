# Risk Management

Essential risk management concepts: position sizing, stop losses, portfolio risk, and Value at Risk.

## Position Sizing

### Fixed Dollar Amount

```python
# Risk fixed dollar amount per trade
account_value = 100000
risk_per_trade = 0.02  # 2% of account
risk_amount = account_value * risk_per_trade

entry_price = 150
stop_loss = 145
risk_per_share = entry_price - stop_loss

position_size = risk_amount / risk_per_share
print(f"Position Size: {position_size:.0f} shares")
```

### Kelly Criterion

```python
def kelly_criterion(win_rate, avg_win, avg_loss):
    """Calculate optimal position size using Kelly Criterion"""
    win_loss_ratio = avg_win / abs(avg_loss)
    kelly = win_rate - ((1 - win_rate) / win_loss_ratio)
    return kelly

# Example
win_rate = 0.6  # 60% win rate
avg_win = 0.05  # 5% average win
avg_loss = -0.03  # 3% average loss

kelly_pct = kelly_criterion(win_rate, avg_win, avg_loss)
print(f"Kelly Percentage: {kelly_pct:.4f} ({kelly_pct*100:.2f}%)")
```

## Stop Losses

### Fixed Percentage Stop

```python
entry_price = 150
stop_loss_pct = 0.05  # 5% stop loss
stop_loss_price = entry_price * (1 - stop_loss_pct)
print(f"Stop Loss Price: ${stop_loss_price:.2f}")
```

### Trailing Stop

```python
# Trailing stop that follows price up
def trailing_stop(prices, trail_pct=0.05):
    highest_price = prices.expanding().max()
    trailing_stop = highest_price * (1 - trail_pct)
    return trailing_stop

data = yf.download("AAPL", period="6m")['Close']
trailing_stops = trailing_stop(data, trail_pct=0.05)
```

## Portfolio Risk

### Portfolio Volatility

```python
import numpy as np

# Portfolio with multiple stocks
weights = np.array([0.4, 0.3, 0.3])
covariance_matrix = np.array([[0.04, 0.02, 0.01],
                              [0.02, 0.03, 0.015],
                              [0.01, 0.015, 0.025]])

portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
portfolio_volatility = np.sqrt(portfolio_variance)
print(f"Portfolio Volatility: {portfolio_volatility:.4f}")
```

### Value at Risk (VaR)

```python
from scipy import stats

returns = np.array([0.01, 0.02, -0.01, 0.03, -0.02])
confidence = 0.95

# Parametric VaR
mean_return = returns.mean()
std_return = returns.std()
z_score = stats.norm.ppf(1 - confidence)
var = mean_return - z_score * std_return

print(f"95% VaR: {var:.4f}")
```

## Risk Metrics

### Maximum Drawdown

```python
def max_drawdown(returns):
    cumulative = (1 + returns).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    return drawdown.min()

max_dd = max_drawdown(returns)
print(f"Maximum Drawdown: {max_dd:.4f}")
```

## Key Takeaways

- **Position Sizing**: Risk only a small percentage per trade
- **Stop Losses**: Limit losses on individual trades
- **Portfolio Risk**: Diversify to reduce overall risk
- **VaR**: Quantify potential losses
- Never risk more than you can afford to lose

---

**Previous**: [Trading Strategies](08-trading-strategies.md) | **Next**: [Advanced Trading Strategies](10-advanced-strategies.md)

