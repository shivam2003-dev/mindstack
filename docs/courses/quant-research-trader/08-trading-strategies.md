# Trading Strategies

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand mean reversion trading strategies</li>
    <li>Learn momentum-based strategies</li>
    <li>Master breakout trading strategies</li>
    <li>Develop complete trading strategy systems</li>
  </ul>
</div>

This chapter covers fundamental trading strategies you can implement and backtest. Each strategy has different market conditions where it works best.

## Mean Reversion Strategies

### Concept

Mean reversion assumes prices will return to their average after deviating. This works well in ranging markets.

### Z-Score Mean Reversion

```python
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

# Get data
data = yf.download("AAPL", period="2y")

# Calculate z-score
window = 20
data['SMA'] = data['Close'].rolling(window=window).mean()
data['Std'] = data['Close'].rolling(window=window).std()
data['Z_Score'] = (data['Close'] - data['SMA']) / data['Std']

# Trading signals
data['Signal'] = 0
data.loc[data['Z_Score'] < -2, 'Signal'] = 1   # Buy when oversold
data.loc[data['Z_Score'] > 2, 'Signal'] = -1   # Sell when overbought
data.loc[abs(data['Z_Score']) < 0.5, 'Signal'] = 0  # Exit when near mean

# Calculate positions (hold until opposite signal)
data['Position'] = data['Signal'].replace(to_replace=0, method='ffill').fillna(0)

# Calculate returns
data['Returns'] = data['Close'].pct_change()
data['Strategy_Returns'] = data['Position'].shift(1) * data['Returns']
data['Cumulative_Returns'] = (1 + data['Strategy_Returns']).cumprod()

# Performance
total_return = data['Cumulative_Returns'].iloc[-1] - 1
sharpe = data['Strategy_Returns'].mean() / data['Strategy_Returns'].std() * np.sqrt(252)
print(f"Total Return: {total_return:.2%}")
print(f"Sharpe Ratio: {sharpe:.2f}")
```

### Bollinger Bands Mean Reversion

```python
# Bollinger Bands
data['BB_Middle'] = data['Close'].rolling(window=20).mean()
bb_std = data['Close'].rolling(window=20).std()
data['BB_Upper'] = data['BB_Middle'] + (bb_std * 2)
data['BB_Lower'] = data['BB_Middle'] - (bb_std * 2)

# Signals
data['BB_Signal'] = 0
data.loc[data['Close'] < data['BB_Lower'], 'BB_Signal'] = 1   # Buy at lower band
data.loc[data['Close'] > data['BB_Upper'], 'BB_Signal'] = -1  # Sell at upper band
data.loc[(data['Close'] >= data['BB_Lower']) & (data['Close'] <= data['BB_Upper']), 'BB_Signal'] = 0
```

### RSI Mean Reversion

```python
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

data['RSI'] = calculate_rsi(data['Close'])

# Mean reversion signals
data['RSI_Signal'] = 0
data.loc[data['RSI'] < 30, 'RSI_Signal'] = 1   # Oversold - buy
data.loc[data['RSI'] > 70, 'RSI_Signal'] = -1  # Overbought - sell
```

## Momentum Strategies

### Concept

Momentum strategies assume trends continue - "the trend is your friend."

### Price Momentum

```python
# Calculate momentum
momentum_period = 10
data['Momentum'] = data['Close'].pct_change(periods=momentum_period)

# Signals
data['Momentum_Signal'] = 0
data.loc[data['Momentum'] > 0.05, 'Momentum_Signal'] = 1   # Strong upward momentum
data.loc[data['Momentum'] < -0.05, 'Momentum_Signal'] = -1  # Strong downward momentum
```

### Moving Average Crossover

```python
# Calculate moving averages
data['SMA_Short'] = data['Close'].rolling(window=20).mean()
data['SMA_Long'] = data['Close'].rolling(window=50).mean()

# Golden Cross / Death Cross
data['MA_Signal'] = 0
data.loc[data['SMA_Short'] > data['SMA_Long'], 'MA_Signal'] = 1   # Golden Cross - buy
data.loc[data['SMA_Short'] < data['SMA_Long'], 'MA_Signal'] = -1  # Death Cross - sell

# Entry/exit signals (only on crossovers)
data['MA_Cross'] = (data['SMA_Short'] > data['SMA_Long']).astype(int)
data['MA_Entry'] = data['MA_Cross'].diff()
data['MA_Trade_Signal'] = 0
data.loc[data['MA_Entry'] == 1, 'MA_Trade_Signal'] = 1   # Enter long
data.loc[data['MA_Entry'] == -1, 'MA_Trade_Signal'] = -1  # Enter short
```

### MACD Momentum

```python
# MACD
exp1 = data['Close'].ewm(span=12, adjust=False).mean()
exp2 = data['Close'].ewm(span=26, adjust=False).mean()
data['MACD'] = exp1 - exp2
data['Signal_Line'] = data['MACD'].ewm(span=9, adjust=False).mean()
data['Histogram'] = data['MACD'] - data['Signal_Line']

# Momentum signals
data['MACD_Signal'] = 0
data.loc[data['MACD'] > data['Signal_Line'], 'MACD_Signal'] = 1   # Bullish
data.loc[data['MACD'] < data['Signal_Line'], 'MACD_Signal'] = -1  # Bearish

# Crossover signals
data['MACD_Cross'] = (data['MACD'] > data['Signal_Line']).astype(int)
data['MACD_Entry'] = data['MACD_Cross'].diff()
data['MACD_Trade'] = 0
data.loc[data['MACD_Entry'] == 1, 'MACD_Trade'] = 1
data.loc[data['MACD_Entry'] == -1, 'MACD_Trade'] = -1
```

### Rate of Change (ROC)

```python
# Rate of change
roc_period = 12
data['ROC'] = (data['Close'] - data['Close'].shift(roc_period)) / data['Close'].shift(roc_period) * 100

# Momentum signals
data['ROC_Signal'] = 0
data.loc[data['ROC'] > 5, 'ROC_Signal'] = 1   # Strong positive momentum
data.loc[data['ROC'] < -5, 'ROC_Signal'] = -1  # Strong negative momentum
```

## Breakout Strategies

### Concept

Breakout strategies trade when price breaks through support or resistance levels, expecting continuation.

### Price Breakout

```python
# Identify breakout levels
lookback = 20
data['High_20'] = data['High'].rolling(window=lookback).max()
data['Low_20'] = data['Low'].rolling(window=lookback).min()

# Breakout signals
data['Breakout_Signal'] = 0
data.loc[data['Close'] > data['High_20'].shift(1), 'Breakout_Signal'] = 1   # Upward breakout
data.loc[data['Close'] < data['Low_20'].shift(1), 'Breakout_Signal'] = -1  # Downward breakout
```

### Volume Confirmation Breakout

```python
# Breakout with volume confirmation
data['Volume_MA'] = data['Volume'].rolling(window=20).mean()
data['High_Volume'] = data['Volume'] > data['Volume_MA'] * 1.5

# Breakout with volume
data['Volume_Breakout'] = 0
data.loc[(data['Close'] > data['High_20'].shift(1)) & data['High_Volume'], 'Volume_Breakout'] = 1
data.loc[(data['Close'] < data['Low_20'].shift(1)) & data['High_Volume'], 'Volume_Breakout'] = -1
```

### Donchian Channel Breakout

```python
# Donchian Channels
period = 20
data['Donchian_High'] = data['High'].rolling(window=period).max()
data['Donchian_Low'] = data['Low'].rolling(window=period).min()
data['Donchian_Mid'] = (data['Donchian_High'] + data['Donchian_Low']) / 2

# Breakout signals
data['Donchian_Signal'] = 0
data.loc[data['Close'] > data['Donchian_High'].shift(1), 'Donchian_Signal'] = 1
data.loc[data['Close'] < data['Donchian_Low'].shift(1), 'Donchian_Signal'] = -1
```

## Combined Strategies

### Multi-Signal Strategy

```python
# Combine multiple signals
data['Combined_Signal'] = 0

# Weighted combination
data['Combined_Signal'] = (
    0.4 * data['MA_Signal'] +
    0.3 * data['MACD_Signal'] +
    0.3 * data['RSI_Signal']
)

# Normalize to -1, 0, 1
data['Combined_Signal'] = np.where(data['Combined_Signal'] > 0.5, 1,
                                   np.where(data['Combined_Signal'] < -0.5, -1, 0))
```

### Strategy with Filters

```python
# Add trend filter to mean reversion
data['Trend'] = np.where(data['SMA_Short'] > data['SMA_Long'], 1, -1)

# Only take mean reversion trades in direction of trend
data['Filtered_Signal'] = 0
data.loc[(data['Z_Score'] < -2) & (data['Trend'] == 1), 'Filtered_Signal'] = 1   # Buy in uptrend
data.loc[(data['Z_Score'] > 2) & (data['Trend'] == -1), 'Filtered_Signal'] = -1  # Sell in downtrend
```

## Strategy Development Process

### 1. Idea Generation

- Market observation
- Research papers
- Backtesting ideas
- Combining indicators

### 2. Hypothesis Formulation

```python
# Example hypothesis
hypothesis = """
Hypothesis: Stocks that are oversold (RSI < 30) in an uptrend 
(SMA_20 > SMA_50) will revert to mean and generate positive returns 
over the next 5 days.
"""
```

### 3. Strategy Implementation

```python
def mean_reversion_strategy(data, z_threshold=2, window=20):
    """Mean reversion strategy"""
    data = data.copy()
    data['SMA'] = data['Close'].rolling(window=window).mean()
    data['Std'] = data['Close'].rolling(window=window).std()
    data['Z_Score'] = (data['Close'] - data['SMA']) / data['Std']
    
    data['Signal'] = 0
    data.loc[data['Z_Score'] < -z_threshold, 'Signal'] = 1
    data.loc[data['Z_Score'] > z_threshold, 'Signal'] = -1
    
    return data
```

### 4. Backtesting

```python
def backtest_strategy(data, signal_col='Signal'):
    """Simple backtest"""
    data = data.copy()
    data['Returns'] = data['Close'].pct_change()
    data['Position'] = data[signal_col].shift(1).fillna(0)
    data['Strategy_Returns'] = data['Position'] * data['Returns']
    data['Cumulative'] = (1 + data['Strategy_Returns']).cumprod()
    
    # Metrics
    total_return = data['Cumulative'].iloc[-1] - 1
    sharpe = data['Strategy_Returns'].mean() / data['Strategy_Returns'].std() * np.sqrt(252)
    max_dd = (data['Cumulative'] / data['Cumulative'].expanding().max() - 1).min()
    
    return {
        'Total Return': total_return,
        'Sharpe Ratio': sharpe,
        'Max Drawdown': max_dd
    }

# Test strategy
results = backtest_strategy(data, 'Signal')
print(results)
```

### 5. Optimization

```python
# Optimize parameters
best_sharpe = -np.inf
best_params = None

for window in [10, 20, 30, 50]:
    for threshold in [1.5, 2.0, 2.5, 3.0]:
        test_data = mean_reversion_strategy(data, threshold, window)
        results = backtest_strategy(test_data, 'Signal')
        
        if results['Sharpe Ratio'] > best_sharpe:
            best_sharpe = results['Sharpe Ratio']
            best_params = (window, threshold)

print(f"Best parameters: window={best_params[0]}, threshold={best_params[1]}")
print(f"Best Sharpe: {best_sharpe:.2f}")
```

### 6. Validation

- Out-of-sample testing
- Walk-forward analysis
- Parameter stability
- Market regime testing

## Key Takeaways

- **Mean Reversion**: Works in ranging markets, buy oversold, sell overbought
- **Momentum**: Works in trending markets, follow the trend
- **Breakout**: Trade when price breaks key levels with volume confirmation
- **Combination**: Combine multiple signals for better performance
- **Filters**: Use trend filters to improve signal quality
- **Backtesting**: Always test strategies before live trading
- **Optimization**: Find optimal parameters but avoid overfitting

---

**Previous**: [Statistical Concepts](07-statistical-concepts.md) | **Next**: [Risk Management](09-risk-management.md)
