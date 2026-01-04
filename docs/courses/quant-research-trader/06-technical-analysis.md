# Technical Analysis

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Learn chart patterns and price action</li>
    <li>Master technical indicators</li>
    <li>Understand support and resistance</li>
    <li>Build trading signals from technical analysis</li>
  </ul>
</div>

Technical analysis uses historical price and volume data to predict future price movements. This chapter covers essential technical analysis concepts and indicators.

## Price Patterns

### Trend Patterns

**Uptrend**: Higher highs and higher lows
**Downtrend**: Lower highs and lower lows
**Sideways**: No clear direction

### Chart Patterns

- **Head and Shoulders**: Reversal pattern
- **Double Top/Bottom**: Reversal patterns
- **Triangles**: Continuation patterns
- **Flags and Pennants**: Continuation patterns

## Moving Averages

### Simple Moving Average (SMA)

```python
import pandas as pd
import numpy as np
import yfinance as yf

data = yf.download("AAPL", period="1y")['Close']

# Calculate SMAs
data['SMA_20'] = data.rolling(window=20).mean()
data['SMA_50'] = data.rolling(window=50).mean()
data['SMA_200'] = data.rolling(window=200).mean()

# Trading signal: Golden Cross (SMA_20 > SMA_50)
data['Signal'] = 0
data.loc[data['SMA_20'] > data['SMA_50'], 'Signal'] = 1
data.loc[data['SMA_20'] < data['SMA_50'], 'Signal'] = -1
```

### Exponential Moving Average (EMA)

```python
# EMA gives more weight to recent prices
data['EMA_12'] = data.ewm(span=12, adjust=False).mean()
data['EMA_26'] = data.ewm(span=26, adjust=False).mean()
```

## Technical Indicators

### RSI (Relative Strength Index)

```python
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

data['RSI'] = calculate_rsi(data['Close'])

# Trading signals
# RSI < 30: Oversold (buy signal)
# RSI > 70: Overbought (sell signal)
```

### MACD (Moving Average Convergence Divergence)

```python
exp1 = data['Close'].ewm(span=12, adjust=False).mean()
exp2 = data['Close'].ewm(span=26, adjust=False).mean()
data['MACD'] = exp1 - exp2
data['Signal_Line'] = data['MACD'].ewm(span=9, adjust=False).mean()
data['Histogram'] = data['MACD'] - data['Signal_Line']

# Trading signal: MACD crosses above Signal Line (bullish)
```

### Bollinger Bands

```python
data['BB_Middle'] = data['Close'].rolling(window=20).mean()
bb_std = data['Close'].rolling(window=20).std()
data['BB_Upper'] = data['BB_Middle'] + (bb_std * 2)
data['BB_Lower'] = data['BB_Middle'] - (bb_std * 2)

# Trading signals
# Price touches lower band: Potential buy
# Price touches upper band: Potential sell
```

### Stochastic Oscillator

```python
def stochastic_oscillator(high, low, close, k_period=14, d_period=3):
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()
    k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
    d_percent = k_percent.rolling(window=d_period).mean()
    return k_percent, d_percent

data['Stoch_K'], data['Stoch_D'] = stochastic_oscillator(
    data['High'], data['Low'], data['Close']
)
```

## Support and Resistance

### Identifying Levels

```python
# Support: Price level where buying pressure is strong
# Resistance: Price level where selling pressure is strong

# Find local minima (support) and maxima (resistance)
from scipy.signal import argrelextrema

# Find local minima (potential support)
min_indices = argrelextrema(data['Low'].values, np.less, order=5)[0]
support_levels = data['Low'].iloc[min_indices]

# Find local maxima (potential resistance)
max_indices = argrelextrema(data['High'].values, np.greater, order=5)[0]
resistance_levels = data['High'].iloc[max_indices]
```

## Volume Analysis

### Volume Indicators

```python
# On-Balance Volume (OBV)
data['OBV'] = (np.sign(data['Close'].diff()) * data['Volume']).fillna(0).cumsum()

# Volume Moving Average
data['Volume_MA'] = data['Volume'].rolling(window=20).mean()

# Volume Price Trend (VPT)
data['VPT'] = (data['Close'].pct_change() * data['Volume']).fillna(0).cumsum()
```

## Combining Indicators

### Multi-Indicator Strategy

```python
def generate_signals(data):
    signals = pd.DataFrame(index=data.index)
    signals['Price'] = data['Close']
    
    # Moving average signals
    signals['MA_Signal'] = 0
    signals.loc[data['SMA_20'] > data['SMA_50'], 'MA_Signal'] = 1
    signals.loc[data['SMA_20'] < data['SMA_50'], 'MA_Signal'] = -1
    
    # RSI signals
    signals['RSI_Signal'] = 0
    signals.loc[data['RSI'] < 30, 'RSI_Signal'] = 1  # Oversold
    signals.loc[data['RSI'] > 70, 'RSI_Signal'] = -1  # Overbought
    
    # MACD signals
    signals['MACD_Signal'] = 0
    signals.loc[data['MACD'] > data['Signal_Line'], 'MACD_Signal'] = 1
    signals.loc[data['MACD'] < data['Signal_Line'], 'MACD_Signal'] = -1
    
    # Combined signal (majority vote)
    signals['Combined'] = (signals['MA_Signal'] + 
                           signals['RSI_Signal'] + 
                           signals['MACD_Signal']) / 3
    
    return signals
```

## Key Takeaways

- Technical analysis uses price and volume patterns
- Moving averages identify trends
- Indicators (RSI, MACD, Bollinger Bands) provide trading signals
- Support and resistance identify key price levels
- Volume confirms price movements
- Combining multiple indicators improves signal quality

---

**Previous**: [Financial Data Analysis](05-financial-data-analysis.md) | **Next**: [Statistical Concepts for Trading](07-statistical-concepts.md)

