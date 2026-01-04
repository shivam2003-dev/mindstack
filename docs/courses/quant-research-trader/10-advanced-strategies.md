# Advanced Trading Strategies

Advanced strategies: pairs trading, statistical arbitrage, market making, and multi-factor models.

## Pairs Trading

### Concept

Trade two correlated stocks when their price ratio deviates from historical mean.

### Implementation

```python
import pandas as pd
import numpy as np
import yfinance as yf

# Get data for two correlated stocks
stock1 = yf.download("AAPL", period="1y")['Close']
stock2 = yf.download("MSFT", period="1y")['Close']

# Calculate spread
spread = stock1 - stock2
spread_mean = spread.rolling(window=30).mean()
spread_std = spread.rolling(window=30).std()
z_score = (spread - spread_mean) / spread_std

# Trading signals
# Buy spread when z-score < -2 (spread too low)
# Sell spread when z-score > 2 (spread too high)
```

## Statistical Arbitrage

### Concept

Exploit temporary mispricings using statistical models.

### Implementation

```python
# Multi-stock mean reversion
stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN']
data = yf.download(stocks, period="1y")['Close']
returns = data.pct_change().dropna()

# Calculate portfolio z-score
portfolio_returns = returns.mean(axis=1)
portfolio_z = (portfolio_returns - portfolio_returns.rolling(20).mean()) / portfolio_returns.rolling(20).std()

# Trade when portfolio deviates
```

## Market Making

### Concept

Provide liquidity by quoting both bid and ask prices.

### Implementation

```python
# Simple market making strategy
mid_price = data['Close']
spread = 0.001  # 0.1% spread

bid_price = mid_price * (1 - spread/2)
ask_price = mid_price * (1 + spread/2)

# Profit from spread
```

## Multi-Factor Models

### Concept

Use multiple factors to predict returns.

### Implementation

```python
from sklearn.linear_model import LinearRegression

# Factors: market return, size, value, momentum
factors = pd.DataFrame({
    'Market': market_returns,
    'Size': size_factor,
    'Value': value_factor,
    'Momentum': momentum_factor
})

# Fit model
model = LinearRegression()
model.fit(factors, stock_returns)

# Use for prediction
predicted_returns = model.predict(factors)
```

## Key Takeaways

- **Pairs Trading**: Trade correlated stocks
- **Statistical Arbitrage**: Exploit mispricings
- **Market Making**: Profit from spreads
- **Multi-Factor Models**: Use multiple predictors

---

**Previous**: [Risk Management](09-risk-management.md) | **Next**: [Backtesting & Validation](11-backtesting-validation.md)

