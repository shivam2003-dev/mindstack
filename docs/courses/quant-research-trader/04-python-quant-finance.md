# Python for Quantitative Finance

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Learn Python basics for finance</li>
    <li>Master NumPy for numerical computing</li>
    <li>Master Pandas for data manipulation</li>
    <li>Learn to work with financial data</li>
  </ul>
</div>

Python is the most popular language for quantitative finance. This chapter covers essential Python skills you'll use daily as a quant researcher/trader.

## Python Basics Review

### Data Types

```python
# Numbers
price = 150.50  # float
shares = 100    # int

# Strings
symbol = "AAPL"
company = "Apple Inc."

# Lists
prices = [150.0, 151.5, 149.8, 152.3]

# Dictionaries
stock_info = {
    'symbol': 'AAPL',
    'price': 150.50,
    'volume': 50000000
}
```

### Control Flow

```python
# If statements
if price > 150:
    print("Price is above $150")
elif price < 150:
    print("Price is below $150")
else:
    print("Price is exactly $150")

# Loops
for price in prices:
    print(f"Price: ${price}")

# List comprehensions
high_prices = [p for p in prices if p > 150]
```

### Functions

```python
def calculate_return(price_today, price_yesterday):
    """Calculate simple return"""
    return (price_today - price_yesterday) / price_yesterday

return_pct = calculate_return(152.0, 150.0)
print(f"Return: {return_pct:.4f}")  # 0.0133 = 1.33%
```

## NumPy for Numerical Computing

### Arrays

```python
import numpy as np

# Create arrays
prices = np.array([150.0, 151.5, 149.8, 152.3, 153.0])
returns = np.array([0.01, -0.011, 0.017, 0.005])

# Array operations
mean_price = np.mean(prices)
std_price = np.std(prices)
max_price = np.max(prices)
min_price = np.min(prices)

print(f"Mean: ${mean_price:.2f}")
print(f"Std Dev: ${std_price:.2f}")
```

### Array Operations

```python
# Element-wise operations
doubled = prices * 2
squared = prices ** 2

# Mathematical functions
log_prices = np.log(prices)
exp_returns = np.exp(returns)

# Statistical functions
mean = np.mean(returns)
variance = np.var(returns)
std_dev = np.std(returns)
```

### Linear Algebra

```python
# Dot product (portfolio return)
weights = np.array([0.4, 0.3, 0.3])
returns = np.array([0.05, 0.03, 0.02])
portfolio_return = np.dot(weights, returns)

# Matrix operations
matrix = np.array([[1, 2], [3, 4]])
inverse = np.linalg.inv(matrix)
```

## Pandas for Data Manipulation

### Series and DataFrames

```python
import pandas as pd

# Create Series
prices_series = pd.Series([150.0, 151.5, 149.8, 152.3], 
                          index=['2023-01-01', '2023-01-02', 
                                 '2023-01-03', '2023-01-04'])

# Create DataFrame
data = {
    'Open': [150.0, 151.0, 149.5, 152.0],
    'High': [151.5, 152.0, 150.5, 153.0],
    'Low': [149.5, 150.5, 149.0, 151.5],
    'Close': [151.0, 150.5, 150.0, 152.5],
    'Volume': [50000000, 45000000, 55000000, 48000000]
}
df = pd.DataFrame(data, 
                  index=pd.date_range('2023-01-01', periods=4))
```

### Reading Financial Data

```python
import yfinance as yf

# Download stock data
ticker = yf.Ticker("AAPL")
data = ticker.history(period="1y")

# Basic info
print(data.head())
print(data.describe())
print(data.info())
```

### Data Selection and Filtering

```python
# Select columns
closes = data['Close']
high_low = data[['High', 'Low']]

# Filter by condition
high_volume = data[data['Volume'] > 50000000]
price_above_150 = data[data['Close'] > 150]

# Date filtering
recent_data = data['2023-01-01':'2023-06-30']
```

### Calculating Returns

```python
# Simple returns
data['Returns'] = data['Close'].pct_change()

# Log returns
data['Log_Returns'] = np.log(data['Close'] / data['Close'].shift(1))

# Cumulative returns
data['Cumulative_Returns'] = (1 + data['Returns']).cumprod() - 1
```

### Rolling Statistics

```python
# Moving averages
data['MA_20'] = data['Close'].rolling(window=20).mean()
data['MA_50'] = data['Close'].rolling(window=50).mean()

# Rolling volatility
data['Volatility_20'] = data['Returns'].rolling(window=20).std() * np.sqrt(252)

# Rolling max/min
data['Rolling_High_20'] = data['High'].rolling(window=20).max()
data['Rolling_Low_20'] = data['Low'].rolling(window=20).min()
```

### Grouping and Aggregation

```python
# Group by month
monthly_returns = data['Returns'].resample('M').sum()
monthly_vol = data['Returns'].resample('M').std()

# Multiple stocks
stocks = ['AAPL', 'GOOGL', 'MSFT']
multi_data = yf.download(stocks, period="1y")['Close']
multi_returns = multi_data.pct_change()
```

## Working with Financial Data

### Data Cleaning

```python
# Handle missing values
data = data.dropna()  # Remove rows with NaN
data = data.fillna(method='ffill')  # Forward fill

# Remove duplicates
data = data.drop_duplicates()

# Handle outliers
Q1 = data['Returns'].quantile(0.25)
Q3 = data['Returns'].quantile(0.75)
IQR = Q3 - Q1
data_clean = data[(data['Returns'] >= Q1 - 1.5*IQR) & 
                  (data['Returns'] <= Q3 + 1.5*IQR)]
```

### Time Series Operations

```python
# Set date as index
data.index = pd.to_datetime(data.index)

# Resample to different frequencies
daily = data.resample('D').last()
weekly = data.resample('W').last()
monthly = data.resample('M').last()

# Shift data (lag)
data['Price_Lag1'] = data['Close'].shift(1)
data['Price_Lag5'] = data['Close'].shift(5)

# Lead data
data['Price_Lead1'] = data['Close'].shift(-1)
```

### Technical Indicators

```python
# RSI (Relative Strength Index)
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

data['RSI'] = calculate_rsi(data['Close'])

# MACD
exp1 = data['Close'].ewm(span=12, adjust=False).mean()
exp2 = data['Close'].ewm(span=26, adjust=False).mean()
data['MACD'] = exp1 - exp2
data['Signal'] = data['MACD'].ewm(span=9, adjust=False).mean()
```

## Data Visualization

### Matplotlib Basics

```python
import matplotlib.pyplot as plt

# Line plot
plt.figure(figsize=(12, 6))
plt.plot(data.index, data['Close'])
plt.title('Stock Price Over Time')
plt.xlabel('Date')
plt.ylabel('Price ($)')
plt.grid(True)
plt.show()

# Multiple plots
fig, axes = plt.subplots(2, 1, figsize=(12, 10))
axes[0].plot(data.index, data['Close'])
axes[0].set_title('Price')
axes[1].plot(data.index, data['Volume'])
axes[1].set_title('Volume')
plt.tight_layout()
plt.show()
```

### Seaborn for Statistical Visualization

```python
import seaborn as sns

# Distribution plot
sns.histplot(data['Returns'], kde=True)
plt.title('Returns Distribution')
plt.show()

# Correlation heatmap
correlation = multi_returns.corr()
sns.heatmap(correlation, annot=True, cmap='coolwarm')
plt.title('Stock Correlation Matrix')
plt.show()
```

### Candlestick Charts

```python
from mplfinance.original_flavor import candlestick_ohlc
import matplotlib.dates as mdates

# Prepare data
ohlc = data[['Open', 'High', 'Low', 'Close']].copy()
ohlc.index = mdates.date2num(ohlc.index)

fig, ax = plt.subplots(figsize=(12, 6))
candlestick_ohlc(ax, ohlc.values, width=0.6, colorup='green', colordown='red')
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
plt.title('Candlestick Chart')
plt.show()
```

## Essential Libraries

### yfinance - Yahoo Finance Data

```python
import yfinance as yf

# Get stock info
ticker = yf.Ticker("AAPL")
info = ticker.info
print(f"Company: {info['longName']}")
print(f"Sector: {info['sector']}")
print(f"Market Cap: ${info['marketCap']:,}")

# Historical data
hist = ticker.history(period="5y")
```

### scipy - Scientific Computing

```python
from scipy import stats

# Statistical tests
returns = data['Returns'].dropna()
t_stat, p_value = stats.ttest_1samp(returns, 0)
print(f"T-statistic: {t_stat:.4f}, P-value: {p_value:.4f}")

# Normal distribution
mu, sigma = stats.norm.fit(returns)
print(f"Mean: {mu:.4f}, Std: {sigma:.4f}")
```

### scikit-learn - Machine Learning

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# Prepare data
X = data[['Volume', 'RSI']].values
y = data['Returns'].shift(-1).dropna().values
X = X[:-1]  # Align with y

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LinearRegression()
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)
```

## Best Practices

### Code Organization

```python
# Use functions for reusable code
def calculate_sharpe_ratio(returns, risk_free_rate=0.02):
    excess_returns = returns - risk_free_rate / 252
    sharpe = np.sqrt(252) * excess_returns.mean() / returns.std()
    return sharpe

# Use classes for complex strategies
class MovingAverageStrategy:
    def __init__(self, short_window=20, long_window=50):
        self.short_window = short_window
        self.long_window = long_window
    
    def generate_signals(self, data):
        data['Short_MA'] = data['Close'].rolling(self.short_window).mean()
        data['Long_MA'] = data['Close'].rolling(self.long_window).mean()
        data['Signal'] = 0
        data.loc[data['Short_MA'] > data['Long_MA'], 'Signal'] = 1
        data.loc[data['Short_MA'] < data['Long_MA'], 'Signal'] = -1
        return data
```

### Performance Tips

```python
# Use vectorized operations (fast)
returns = prices.pct_change()  # Fast

# Avoid loops when possible (slow)
# for i in range(len(prices)):
#     returns[i] = (prices[i] - prices[i-1]) / prices[i-1]  # Slow

# Use .loc for filtering (fast)
filtered = data.loc[data['Volume'] > 1000000]  # Fast

# Avoid chained indexing (slow)
# data[data['Volume'] > 1000000]['Close']  # Slow
```

## Practice Exercises

### Exercise 1: Calculate Portfolio Metrics

Given portfolio with:
- Stock A: 40% weight, 10% return, 15% volatility
- Stock B: 35% weight, 8% return, 12% volatility  
- Stock C: 25% weight, 6% return, 10% volatility
- Correlation: A-B = 0.5, A-C = 0.3, B-C = 0.4

Calculate portfolio return and volatility.

### Exercise 2: Build Technical Indicator

Create a function to calculate Bollinger Bands:
- Middle band = 20-day moving average
- Upper band = MA + 2 * standard deviation
- Lower band = MA - 2 * standard deviation

### Exercise 3: Analyze Stock Data

Download data for a stock and:
1. Calculate daily returns
2. Calculate 20-day and 50-day moving averages
3. Calculate RSI
4. Plot price with moving averages
5. Plot returns distribution

---

**Key Takeaways**:
- NumPy: Fast numerical computing with arrays
- Pandas: Powerful data manipulation for time series
- yfinance: Easy access to financial data
- Vectorized operations are much faster than loops
- Practice with real data to build skills

---

**Previous**: [Financial Markets Basics](03-financial-markets-basics.md) | **Next**: [Financial Data Analysis](05-financial-data-analysis.md)

