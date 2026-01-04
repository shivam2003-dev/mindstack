# Financial Markets Basics

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand how financial markets work</li>
    <li>Learn about different asset classes</li>
    <li>Understand market participants</li>
    <li>Learn about exchanges and trading mechanisms</li>
  </ul>
</div>

Understanding financial markets is essential for quantitative trading. This chapter covers the fundamentals of how markets operate, what you can trade, and who participates.

## What are Financial Markets?

Financial markets are places where buyers and sellers trade financial instruments (stocks, bonds, derivatives, etc.). They facilitate:

- **Price Discovery**: Finding the fair price through supply and demand
- **Liquidity**: Ability to buy/sell quickly without large price impact
- **Capital Allocation**: Directing money to productive uses
- **Risk Transfer**: Allowing participants to manage risk

## Asset Classes

### 1. Stocks (Equities)

**What they are**: Ownership shares in a company

**Characteristics**:
- Represent ownership stake
- Can pay dividends
- Price fluctuates based on company performance and market sentiment
- Higher risk, higher potential return

**Types**:
- **Common Stock**: Voting rights, dividends
- **Preferred Stock**: Fixed dividends, no voting rights

**Example**:
```python
# Stock price data
stock_data = {
    'symbol': 'AAPL',
    'price': 150.00,
    'shares_outstanding': 15_000_000_000,
    'market_cap': 150.00 * 15_000_000_000  # $2.25 trillion
}
```

### 2. Bonds (Fixed Income)

**What they are**: Loans to companies or governments

**Characteristics**:
- Fixed interest payments (coupons)
- Maturity date
- Lower risk than stocks
- Lower potential return

**Types**:
- **Government Bonds**: Treasury bonds (very safe)
- **Corporate Bonds**: Company debt (higher risk)
- **Municipal Bonds**: Local government debt

**Key Metrics**:
- **Yield**: Annual return percentage
- **Maturity**: When bond is repaid
- **Credit Rating**: Risk assessment (AAA to D)

### 3. Derivatives

**What they are**: Contracts whose value derives from underlying assets

**Types**:

#### Options
- **Call Option**: Right to buy at strike price
- **Put Option**: Right to sell at strike price
- **Expiration**: When option expires
- **Strike Price**: Price at which option can be exercised

#### Futures
- Agreement to buy/sell at future date
- Standardized contracts
- Used for hedging and speculation

#### Swaps
- Exchange cash flows
- Interest rate swaps, currency swaps

### 4. Commodities

**What they are**: Physical goods (gold, oil, wheat, etc.)

**Characteristics**:
- Physical delivery or cash settlement
- Affected by supply/demand
- Used for diversification

### 5. Currencies (Forex)

**What they are**: Trading currency pairs

**Characteristics**:
- Largest market by volume
- 24-hour trading
- High leverage available
- Major pairs: EUR/USD, GBP/USD, USD/JPY

### 6. Cryptocurrencies

**What they are**: Digital assets (Bitcoin, Ethereum, etc.)

**Characteristics**:
- High volatility
- 24/7 trading
- Decentralized
- Emerging asset class

## Market Participants

### 1. Retail Traders

**Who**: Individual investors trading for themselves

**Characteristics**:
- Small position sizes
- Often use online brokers
- May trade based on news/emotion
- Growing segment

### 2. Institutional Investors

**Who**: Large organizations (pension funds, insurance companies)

**Characteristics**:
- Large position sizes
- Professional management
- Long-term focus
- Significant market impact

### 3. Hedge Funds

**Who**: Private investment funds

**Characteristics**:
- Aggressive strategies
- Use leverage and derivatives
- High fees (2% management + 20% performance)
- Sophisticated quant strategies

### 4. Market Makers

**Who**: Firms providing liquidity

**Characteristics**:
- Buy and sell continuously
- Profit from bid-ask spread
- Essential for market liquidity
- Use automated systems

### 5. High-Frequency Traders (HFT)

**Who**: Firms using algorithms for ultra-fast trading

**Characteristics**:
- Microsecond execution
- High volume, small profits per trade
- Advanced technology
- Significant market share

## Exchanges and Trading Venues

### Stock Exchanges

**Major Exchanges**:
- **NYSE** (New York Stock Exchange): Largest by market cap
- **NASDAQ**: Technology-focused
- **London Stock Exchange**: UK market
- **Tokyo Stock Exchange**: Japan market

**How they work**:
- Centralized trading
- Price discovery through auctions
- Regulatory oversight
- Settlement and clearing

### Electronic Communication Networks (ECNs)

**What they are**: Electronic trading systems

**Characteristics**:
- Direct matching of orders
- Lower costs
- Faster execution
- Dark pools (private trading)

### Over-the-Counter (OTC) Markets

**What they are**: Direct trading between parties

**Characteristics**:
- Not exchange-traded
- Less regulated
- Custom contracts
- Lower transparency

## Order Types

### Market Orders

**What**: Execute immediately at current market price

**Use**: When speed is more important than price

**Risk**: Price may be worse than expected

### Limit Orders

**What**: Execute only at specified price or better

**Use**: When price is more important than speed

**Types**:
- **Buy Limit**: Buy at or below price
- **Sell Limit**: Sell at or above price

### Stop Orders

**What**: Trigger market order when price reached

**Types**:
- **Stop Loss**: Limit losses
- **Stop Limit**: Combine stop and limit

### Other Order Types

- **Fill or Kill (FOK)**: Execute immediately or cancel
- **Immediate or Cancel (IOC)**: Fill what you can, cancel rest
- **Good Till Canceled (GTC)**: Order stays active until filled or canceled

## Market Data

### OHLCV Data

**Components**:
- **Open**: First price of period
- **High**: Highest price of period
- **Low**: Lowest price of period
- **Close**: Last price of period
- **Volume**: Number of shares/contracts traded

```python
import yfinance as yf

# Get OHLCV data
ticker = yf.Ticker("AAPL")
data = ticker.history(period="1mo")
print(data[['Open', 'High', 'Low', 'Close', 'Volume']].head())
```

### Tick Data

**What**: Every single trade

**Use**: High-frequency trading, detailed analysis

**Characteristics**:
- Very large datasets
- Requires special infrastructure
- Expensive

### Level 2 Data

**What**: Order book with all bids and asks

**Use**: See market depth, better execution

**Components**:
- Bid prices and sizes
- Ask prices and sizes
- Market maker IDs

## Trading Sessions

### Market Hours

**US Stock Market**:
- **Pre-Market**: 4:00 AM - 9:30 AM ET
- **Regular Hours**: 9:30 AM - 4:00 PM ET
- **After Hours**: 4:00 PM - 8:00 PM ET

**Forex Market**: 24 hours (Sunday 5 PM - Friday 5 PM ET)

**Futures Market**: Nearly 24 hours

### Market Phases

1. **Pre-Market**: Low volume, high volatility
2. **Opening**: High volume, price discovery
3. **Regular Trading**: Normal volume and volatility
4. **Closing**: High volume, final price discovery
5. **After Hours**: Low volume, news-driven

## Market Mechanics

### Bid-Ask Spread

**What**: Difference between highest bid and lowest ask

**Components**:
- **Bid**: Highest price buyers will pay
- **Ask**: Lowest price sellers will accept
- **Spread**: Ask - Bid

**Factors Affecting Spread**:
- Liquidity (more liquid = smaller spread)
- Volatility (higher volatility = larger spread)
- Market maker competition

```python
# Example bid-ask spread
bid = 150.00
ask = 150.05
spread = ask - bid
spread_percent = (spread / bid) * 100
print(f"Spread: ${spread:.2f} ({spread_percent:.3f}%)")
```

### Market Depth

**What**: Volume available at different price levels

**Use**: Understanding liquidity, execution impact

### Slippage

**What**: Difference between expected and actual execution price

**Causes**:
- Market movement during order
- Large order size
- Low liquidity

**Minimizing**:
- Use limit orders
- Split large orders
- Trade during high liquidity

## Market Indices

### What They Are

**Definition**: Baskets of stocks representing market segments

**Purpose**: Benchmark performance, market indicators

### Major Indices

**US Indices**:
- **S&P 500**: 500 large US companies
- **Dow Jones**: 30 large US companies
- **NASDAQ**: Technology-focused
- **Russell 2000**: Small-cap companies

**International**:
- **FTSE 100**: UK
- **Nikkei 225**: Japan
- **DAX**: Germany

```python
# Get index data
import yfinance as yf

sp500 = yf.Ticker("^GSPC")
data = sp500.history(period="1y")
print(f"S&P 500 Current: ${data['Close'].iloc[-1]:.2f}")
```

## Market Regulations

### Regulatory Bodies

**US**:
- **SEC** (Securities and Exchange Commission): Stock market regulation
- **CFTC** (Commodity Futures Trading Commission): Derivatives regulation
- **FINRA**: Broker-dealer regulation

**Key Regulations**:
- **Insider Trading**: Illegal use of non-public information
- **Market Manipulation**: Illegal price manipulation
- **Disclosure Requirements**: Public company reporting

## Getting Market Data

### Free Sources

**Yahoo Finance**:
```python
import yfinance as yf
data = yf.download("AAPL", start="2020-01-01", end="2023-01-01")
```

**Alpha Vantage**: Free API with rate limits

**Quandl**: Some free datasets

### Paid Sources

**Bloomberg Terminal**: Professional standard ($2,000+/month)

**Refinitiv (formerly Reuters)**: Financial data

**Interactive Brokers**: Real-time data with account

## Key Concepts Summary

!!! tip "Essential Market Concepts"
    - **Liquidity**: Ease of buying/selling
    - **Volatility**: Price fluctuations
    - **Volume**: Trading activity
    - **Market Cap**: Total company value
    - **Dividend Yield**: Annual dividend / price
    - **P/E Ratio**: Price / Earnings per share

---

**Key Takeaways**:
- Financial markets facilitate trading of various asset classes
- Different participants have different goals and strategies
- Understanding order types and execution is crucial
- Market data (OHLCV) is essential for analysis
- Regulations ensure fair and transparent markets

---

**Previous**: [Mathematics Fundamentals](02-mathematics-fundamentals.md) | **Next**: [Python for Quantitative Finance](04-python-quant-finance.md)

