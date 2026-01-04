# Paper Trading & Live Trading

Set up paper trading, understand order execution, real-time data feeds, and transition to live trading.

## Paper Trading

### Benefits

- Test strategies without risk
- Learn order execution
- Build confidence
- Refine strategies

### Paper Trading Platforms

- **Interactive Brokers Paper Trading**: Free, realistic
- **TD Ameritrade thinkorswim**: PaperMoney
- **Alpaca**: API-based paper trading
- **QuantConnect**: Cloud-based backtesting and paper trading

## Order Execution

### Order Types

```python
# Market order: Execute immediately
order = {
    'symbol': 'AAPL',
    'quantity': 100,
    'order_type': 'market',
    'side': 'buy'
}

# Limit order: Execute at specified price
order = {
    'symbol': 'AAPL',
    'quantity': 100,
    'order_type': 'limit',
    'price': 150.00,
    'side': 'buy'
}
```

### Slippage

- Difference between expected and actual execution price
- Minimize with limit orders
- Consider market impact

## Real-Time Data

### Data Feeds

```python
# Using Alpaca API (example)
import alpaca_trade_api as tradeapi

api = tradeapi.REST(api_key, api_secret, base_url, api_version='v2')

# Get real-time data
bars = api.get_bars('AAPL', '1Min', limit=100)
```

### Streaming Data

```python
# Stream real-time quotes
async def trade_callback(t):
    print(f"Trade: {t}")

api.subscribe_trades(trade_callback, 'AAPL')
```

## Live Trading Considerations

### Risk Management

- Start with small position sizes
- Use stop losses
- Monitor positions closely
- Set daily loss limits

### Monitoring

```python
# Monitor portfolio
def monitor_positions():
    positions = api.list_positions()
    for pos in positions:
        print(f"{pos.symbol}: {pos.qty} @ ${pos.avg_entry_price}")
```

## Key Takeaways

- **Paper Trade First**: Test without risk
- **Order Execution**: Understand different order types
- **Real-Time Data**: Get live market data
- **Risk Management**: Essential for live trading
- **Start Small**: Begin with small positions

---

**Previous**: [Machine Learning](15-machine-learning-trading.md) | **Next**: [Performance Analysis](17-performance-analysis.md)

