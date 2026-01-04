# Trading Strategies

Learn to develop and implement common trading strategies: mean reversion, momentum, and breakout strategies.

## Mean Reversion Strategies

### Concept

Prices tend to revert to their mean after moving away from it.

### Implementation

```python
import pandas as pd
import numpy as np
import yfinance as yf

data = yf.download("AAPL", period="1y")

# Calculate z-score
data['SMA'] = data['Close'].rolling(window=20).mean()
data['Std'] = data['Close'].rolling(window=20).std()
data['Z_Score'] = (data['Close'] - data['SMA']) / data['Std']

# Trading signals
# Buy when z-score < -2 (oversold)
# Sell when z-score > 2 (overbought)
data['Signal'] = 0
data.loc[data['Z_Score'] < -2, 'Signal'] = 1
data.loc[data['Z_Score'] > 2, 'Signal'] = -1
```

## Momentum Strategies

### Concept

Trends tend to continue - "buy high, sell higher"

### Implementation

```python
# Price momentum
data['Returns'] = data['Close'].pct_change()
data['Momentum'] = data['Returns'].rolling(window=10).sum()

# Trading signals
data['Signal'] = 0
data.loc[data['Momentum'] > 0.05, 'Signal'] = 1  # Strong upward momentum
data.loc[data['Momentum'] < -0.05, 'Signal'] = -1  # Strong downward momentum
```

## Breakout Strategies

### Concept

Price breaking through support/resistance levels indicates continuation.

### Implementation

```python
# Identify breakout levels
data['High_20'] = data['High'].rolling(window=20).max()
data['Low_20'] = data['Low'].rolling(window=20).min()

# Breakout signals
data['Signal'] = 0
data.loc[data['Close'] > data['High_20'].shift(1), 'Signal'] = 1  # Upward breakout
data.loc[data['Close'] < data['Low_20'].shift(1), 'Signal'] = -1  # Downward breakout
```

## Strategy Development Process

1. **Idea Generation**: Based on market observation or research
2. **Hypothesis**: Formulate testable hypothesis
3. **Backtesting**: Test on historical data
4. **Validation**: Out-of-sample testing
5. **Implementation**: Code the strategy
6. **Monitoring**: Track performance

## Key Takeaways

- **Mean Reversion**: Prices revert to mean
- **Momentum**: Trends continue
- **Breakout**: Price breaks key levels
- Always backtest strategies before live trading

---

**Previous**: [Statistical Concepts](07-statistical-concepts.md) | **Next**: [Risk Management](09-risk-management.md)

