# Risk Management

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master position sizing techniques</li>
    <li>Learn stop loss strategies</li>
    <li>Understand portfolio risk management</li>
    <li>Calculate and use Value at Risk (VaR)</li>
  </ul>
</div>

Risk management is the most important aspect of trading. This chapter covers essential risk management techniques to protect your capital.

## Position Sizing

### Fixed Dollar Amount

Risk a fixed dollar amount per trade:

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
print(f"Position Value: ${position_size * entry_price:.2f}")
```

### Fixed Percentage of Account

```python
# Risk fixed percentage of account
account_value = 100000
position_pct = 0.10  # 10% of account
position_value = account_value * position_pct

entry_price = 150
position_size = position_value / entry_price
print(f"Position Size: {position_size:.0f} shares")
```

### Volatility-Based Position Sizing

```python
import pandas as pd
import numpy as np
import yfinance as yf

# Size position based on volatility
data = yf.download("AAPL", period="1y")
returns = data['Close'].pct_change()
volatility = returns.std() * np.sqrt(252)  # Annualized volatility

account_value = 100000
target_volatility = 0.15  # 15% target portfolio volatility
position_volatility = volatility

# Adjust position size to achieve target volatility
position_size_pct = target_volatility / position_volatility
position_size_pct = min(position_size_pct, 1.0)  # Cap at 100%

position_value = account_value * position_size_pct
print(f"Position Size: {position_size_pct:.2%} of account")
print(f"Position Value: ${position_value:.2f}")
```

### Kelly Criterion

Optimal position sizing based on win rate and risk-reward:

```python
def kelly_criterion(win_rate, avg_win, avg_loss):
    """Calculate optimal position size using Kelly Criterion"""
    if avg_loss == 0:
        return 0
    
    win_loss_ratio = avg_win / abs(avg_loss)
    kelly = win_rate - ((1 - win_rate) / win_loss_ratio)
    
    # Kelly can be negative (don't trade) or > 1 (too aggressive)
    # Use fractional Kelly (e.g., 25% of full Kelly)
    return max(0, min(kelly, 1))  # Cap between 0 and 1

# Example
win_rate = 0.6  # 60% win rate
avg_win = 0.05  # 5% average win
avg_loss = -0.03  # 3% average loss

kelly_pct = kelly_criterion(win_rate, avg_win, avg_loss)
fractional_kelly = kelly_pct * 0.25  # Use 25% of Kelly

print(f"Full Kelly: {kelly_pct:.4f} ({kelly_pct*100:.2f}%)")
print(f"Fractional Kelly (25%): {fractional_kelly:.4f} ({fractional_kelly*100:.2f}%)")
```

### Risk Parity

Equal risk contribution from each position:

```python
def risk_parity_weights(returns):
    """Equal risk contribution from each asset"""
    inv_vol = 1 / returns.std()
    weights = inv_vol / inv_vol.sum()
    return weights

# Multiple assets
stocks = ['AAPL', 'GOOGL', 'MSFT']
data = yf.download(stocks, period="1y")['Close']
returns = data.pct_change().dropna()

weights = risk_parity_weights(returns)
print("Risk Parity Weights:")
for stock, weight in zip(stocks, weights):
    print(f"{stock}: {weight:.2%}")
```

## Stop Losses

### Fixed Percentage Stop

```python
entry_price = 150
stop_loss_pct = 0.05  # 5% stop loss
stop_loss_price = entry_price * (1 - stop_loss_pct)
print(f"Stop Loss Price: ${stop_loss_price:.2f}")
print(f"Risk per share: ${entry_price - stop_loss_price:.2f}")
```

### Fixed Dollar Stop

```python
entry_price = 150
max_loss_per_share = 5  # $5 maximum loss per share
stop_loss_price = entry_price - max_loss_per_share
print(f"Stop Loss Price: ${stop_loss_price:.2f}")
```

### ATR-Based Stop Loss

Use Average True Range for dynamic stops:

```python
def calculate_atr(high, low, close, period=14):
    """Calculate Average True Range"""
    tr1 = high - low
    tr2 = abs(high - close.shift())
    tr3 = abs(low - close.shift())
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr

data = yf.download("AAPL", period="1y")
atr = calculate_atr(data['High'], data['Low'], data['Close'])

# Stop loss at 2 ATR below entry
entry_price = data['Close'].iloc[-1]
stop_loss = entry_price - 2 * atr.iloc[-1]
print(f"Entry: ${entry_price:.2f}")
print(f"ATR: ${atr.iloc[-1]:.2f}")
print(f"Stop Loss (2 ATR): ${stop_loss:.2f}")
```

### Trailing Stop

Stop loss that follows price up:

```python
def trailing_stop(prices, trail_pct=0.05):
    """Calculate trailing stop"""
    highest_price = prices.expanding().max()
    trailing_stop = highest_price * (1 - trail_pct)
    return trailing_stop

data = yf.download("AAPL", period="6m")['Close']
trailing_stops = trailing_stop(data, trail_pct=0.05)

# Plot
import matplotlib.pyplot as plt
plt.figure(figsize=(12, 6))
plt.plot(data.index, data.values, label='Price')
plt.plot(data.index, trailing_stops.values, label='Trailing Stop', linestyle='--')
plt.legend()
plt.title('Trailing Stop Loss')
plt.show()
```

### Time-Based Stop

Exit after certain time period:

```python
# Exit position after N days if not profitable
entry_date = pd.Timestamp('2023-01-01')
current_date = pd.Timestamp('2023-01-15')
max_holding_days = 10

if (current_date - entry_date).days > max_holding_days:
    print("Time stop triggered - exit position")
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

# Portfolio variance
portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
portfolio_volatility = np.sqrt(portfolio_variance)

print(f"Portfolio Volatility: {portfolio_volatility:.4f} ({portfolio_volatility*100:.2f}%)")
```

### Portfolio Beta

```python
# Calculate portfolio beta
stock_betas = np.array([1.2, 0.8, 1.0])  # Individual stock betas
weights = np.array([0.4, 0.3, 0.3])

portfolio_beta = np.dot(weights, stock_betas)
print(f"Portfolio Beta: {portfolio_beta:.2f}")

# Interpret
if portfolio_beta > 1:
    print("Portfolio is more volatile than market")
elif portfolio_beta < 1:
    print("Portfolio is less volatile than market")
else:
    print("Portfolio moves with market")
```

### Correlation Risk

```python
# High correlation increases portfolio risk
stocks = ['AAPL', 'GOOGL', 'MSFT']
data = yf.download(stocks, period="1y")['Close']
returns = data.pct_change().dropna()

correlation_matrix = returns.corr()
print("Correlation Matrix:")
print(correlation_matrix)

# Average correlation
avg_correlation = correlation_matrix.values[np.triu_indices_from(correlation_matrix.values, k=1)].mean()
print(f"\nAverage Correlation: {avg_correlation:.4f}")

if avg_correlation > 0.7:
    print("Warning: High correlation - limited diversification")
```

## Value at Risk (VaR)

### Parametric VaR

```python
from scipy import stats

returns = np.array([0.01, 0.02, -0.01, 0.03, -0.02, 0.01, -0.01, 0.02])
confidence = 0.95

# Parametric VaR (assuming normal distribution)
mean_return = returns.mean()
std_return = returns.std()
z_score = stats.norm.ppf(1 - confidence)
var = mean_return - z_score * std_return

print(f"Mean Return: {mean_return:.4f}")
print(f"Std Dev: {std_return:.4f}")
print(f"95% VaR: {var:.4f} ({var*100:.2f}%)")

# VaR in dollars
portfolio_value = 100000
var_dollars = abs(var) * portfolio_value
print(f"95% VaR: ${var_dollars:.2f}")
```

### Historical VaR

```python
# Historical VaR (no distribution assumption)
confidence = 0.95
var_historical = np.percentile(returns, (1 - confidence) * 100)

print(f"95% Historical VaR: {var_historical:.4f} ({var_historical*100:.2f}%)")
```

### Conditional VaR (CVaR)

Expected loss given VaR is exceeded:

```python
# CVaR (Expected Shortfall)
var_threshold = np.percentile(returns, 0.05)  # 5th percentile
cvar = returns[returns <= var_threshold].mean()

print(f"95% VaR: {var_threshold:.4f}")
print(f"95% CVaR: {cvar:.4f} ({cvar*100:.2f}%)")
```

### Portfolio VaR

```python
# VaR for portfolio
portfolio_returns = np.dot(returns, weights)
portfolio_var = np.percentile(portfolio_returns, 0.05)

print(f"Portfolio 95% VaR: {portfolio_var:.4f}")
```

## Risk Metrics

### Maximum Drawdown

```python
def max_drawdown(returns):
    """Calculate maximum drawdown"""
    cumulative = (1 + returns).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    return drawdown.min()

returns = pd.Series([0.01, 0.02, -0.01, -0.02, 0.03, -0.01, 0.02])
max_dd = max_drawdown(returns)
print(f"Maximum Drawdown: {max_dd:.4f} ({max_dd*100:.2f}%)")
```

### Drawdown Duration

```python
def drawdown_duration(returns):
    """Calculate time to recover from drawdown"""
    cumulative = (1 + returns).cumprod()
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    
    # Find periods in drawdown
    in_drawdown = drawdown < 0
    drawdown_periods = in_drawdown.groupby((in_drawdown != in_drawdown.shift()).cumsum()).sum()
    max_duration = drawdown_periods.max()
    
    return max_duration

max_duration = drawdown_duration(returns)
print(f"Maximum Drawdown Duration: {max_duration} periods")
```

### Risk-Adjusted Returns

```python
def sharpe_ratio(returns, risk_free_rate=0.02):
    """Calculate Sharpe ratio"""
    excess_returns = returns - risk_free_rate / 252
    sharpe = np.sqrt(252) * excess_returns.mean() / returns.std()
    return sharpe

def sortino_ratio(returns, risk_free_rate=0.02):
    """Calculate Sortino ratio (only penalizes downside volatility)"""
    excess_returns = returns - risk_free_rate / 252
    downside_returns = excess_returns[excess_returns < 0]
    downside_std = downside_returns.std()
    sortino = np.sqrt(252) * excess_returns.mean() / downside_std
    return sortino

def calmar_ratio(returns):
    """Calculate Calmar ratio (return / max drawdown)"""
    annual_return = returns.mean() * 252
    max_dd = abs(max_drawdown(returns))
    calmar = annual_return / max_dd
    return calmar

sharpe = sharpe_ratio(returns)
sortino = sortino_ratio(returns)
calmar = calmar_ratio(returns)

print(f"Sharpe Ratio: {sharpe:.2f}")
print(f"Sortino Ratio: {sortino:.2f}")
print(f"Calmar Ratio: {calmar:.2f}")
```

## Risk Limits

### Daily Loss Limit

```python
# Set daily loss limit
daily_loss_limit = 0.02  # 2% daily loss limit
account_value = 100000

def check_daily_loss(current_value, starting_value, limit):
    daily_return = (current_value - starting_value) / starting_value
    if daily_return < -limit:
        print(f"Daily loss limit exceeded: {daily_return:.2%}")
        return True
    return False
```

### Position Limits

```python
# Maximum position size
max_position_pct = 0.20  # 20% max per position
max_correlation = 0.70  # Max correlation between positions

def check_position_limits(new_position_pct, existing_positions, new_correlation):
    if new_position_pct > max_position_pct:
        print(f"Position size exceeds limit: {new_position_pct:.2%} > {max_position_pct:.2%}")
        return False
    
    if new_correlation > max_correlation:
        print(f"Correlation too high: {new_correlation:.2f} > {max_correlation:.2f}")
        return False
    
    return True
```

## Key Takeaways

- **Position Sizing**: Risk only 1-2% of account per trade
- **Stop Losses**: Always use stops to limit losses
- **Portfolio Risk**: Diversify to reduce overall risk
- **VaR**: Quantify potential losses at confidence levels
- **Risk Metrics**: Monitor drawdown, Sharpe, Sortino ratios
- **Risk Limits**: Set and enforce daily and position limits
- **Never risk more than you can afford to lose**

---

**Previous**: [Trading Strategies](08-trading-strategies.md) | **Next**: [Advanced Trading Strategies](10-advanced-strategies.md)
