# Options & Derivatives

Options basics, Greeks (Delta, Gamma, Theta, Vega), options strategies, and volatility trading.

## Options Basics

### Call and Put Options

**Call Option**: Right to buy at strike price
**Put Option**: Right to sell at strike price

### Key Terms

- **Strike Price**: Price at which option can be exercised
- **Expiration**: When option expires
- **Premium**: Cost of option
- **Intrinsic Value**: Value if exercised immediately
- **Time Value**: Premium - Intrinsic Value

## Greeks

### Delta

```python
# Delta: Price sensitivity to underlying
# Call delta: 0 to 1
# Put delta: -1 to 0
```

### Gamma

```python
# Gamma: Rate of change of delta
# Measures convexity
```

### Theta

```python
# Theta: Time decay
# Options lose value as expiration approaches
```

### Vega

```python
# Vega: Volatility sensitivity
# Higher volatility = higher option prices
```

## Options Strategies

### Covered Call

```python
# Own stock + sell call option
# Generate income from premium
```

### Protective Put

```python
# Own stock + buy put option
# Insurance against downside
```

### Straddle

```python
# Buy call + buy put (same strike)
# Profit from large moves in either direction
```

## Volatility Trading

### Implied Volatility

```python
# IV: Market's expectation of future volatility
# Compare IV to historical volatility
```

### Volatility Strategies

- **Long Volatility**: Buy options when IV is low
- **Short Volatility**: Sell options when IV is high

## Key Takeaways

- **Options**: Leverage and risk management tools
- **Greeks**: Measure option sensitivities
- **Strategies**: Combine options for different objectives
- **Volatility**: Key driver of option prices

---

**Previous**: [Portfolio Management](12-portfolio-management.md) | **Next**: [Quantitative Research Methods](14-quantitative-research.md)

