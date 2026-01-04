# Machine Learning for Trading

Introduction to ML in finance, feature selection, model training, and avoiding overfitting.

## ML Applications in Finance

### Prediction Tasks

- **Return Prediction**: Predict next period returns
- **Volatility Forecasting**: Predict future volatility
- **Classification**: Buy/sell/hold signals

## Feature Engineering

### Technical Features

```python
# Create features
data['MA_20'] = data['Close'].rolling(20).mean()
data['RSI'] = calculate_rsi(data['Close'])
data['MACD'] = calculate_macd(data['Close'])
```

### Market Features

```python
# Market microstructure features
data['Bid_Ask_Spread'] = data['Ask'] - data['Bid']
data['Volume_Ratio'] = data['Volume'] / data['Volume'].rolling(20).mean()
```

## Model Training

### Train-Test Split

```python
from sklearn.model_selection import train_test_split

# Time series split (important for finance!)
train_size = int(len(data) * 0.7)
X_train = features[:train_size]
X_test = features[train_size:]
y_train = target[:train_size]
y_test = target[train_size:]
```

### Model Selection

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
```

## Avoiding Overfitting

### Cross-Validation

```python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
for train_idx, test_idx in tscv.split(X):
    # Train and validate
    pass
```

### Regularization

```python
from sklearn.linear_model import Ridge

# Ridge regression with regularization
model = Ridge(alpha=1.0)
model.fit(X_train, y_train)
```

## Key Takeaways

- **Feature Engineering**: Create meaningful features
- **Time Series Split**: Use proper train-test split
- **Overfitting**: Always validate on out-of-sample data
- **Regularization**: Prevent overfitting

---

**Previous**: [Quantitative Research](14-quantitative-research.md) | **Next**: [Paper Trading & Live Trading](16-paper-trading-live.md)

