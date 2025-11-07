# Automatic Differentiation

PyTorch's automatic differentiation engine, called **autograd**, automatically computes gradients for tensor operations. This is crucial for training neural networks.

## The `requires_grad` Flag

To enable automatic differentiation, set `requires_grad=True`:

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
print(x.requires_grad)  # True
```

## Computing Gradients

```python
# Define a simple function
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x + 1

# Compute gradients
y.backward()

# Access the gradient
print(x.grad)  # tensor(7.0)
```

!!! info "Info"
    The gradient of y = x² + 3x + 1 at x=2 is 2x + 3 = 7.

## Gradient Flow

```python
# Multiple operations
a = torch.tensor(1.0, requires_grad=True)
b = torch.tensor(2.0, requires_grad=True)

c = a * b
d = c ** 2
e = d + 3

e.backward()

print(a.grad)  # tensor(8.0)
print(b.grad)  # tensor(4.0)
```

## Preventing Gradient Tracking

Sometimes you want to stop tracking gradients:

```python
# Method 1: Use .detach()
x = torch.tensor(1.0, requires_grad=True)
y = x.detach()  # y doesn't track gradients

# Method 2: Use torch.no_grad()
with torch.no_grad():
    z = x * 2  # z doesn't track gradients
```

## Gradient Accumulation

```python
# Zero gradients before backward pass
x = torch.tensor(1.0, requires_grad=True)
optimizer = torch.optim.SGD([x], lr=0.1)

for _ in range(3):
    y = x ** 2
    y.backward()
    # Don't zero here - gradients accumulate
    print(x.grad)

# Zero gradients
optimizer.zero_grad()
```

!!! tip "Best Practice"
    Always zero gradients before a new backward pass to prevent accumulation.

## Real Example: Linear Regression

```python
# Simple linear regression
x = torch.randn(10, 1)
y = 2 * x + 1 + 0.1 * torch.randn(10, 1)

# Model parameters
w = torch.randn(1, 1, requires_grad=True)
b = torch.randn(1, requires_grad=True)

# Training loop
learning_rate = 0.01
for epoch in range(100):
    # Forward pass
    y_pred = torch.matmul(x, w) + b
    
    # Loss
    loss = ((y_pred - y) ** 2).mean()
    
    # Backward pass
    loss.backward()
    
    # Update parameters
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
    
    # Zero gradients
    w.grad.zero_()
    b.grad.zero_()
```

## Exercises

1. Compute the gradient of f(x) = x³ at x = 2
2. Implement a simple neural network layer with autograd
3. Use autograd to find the minimum of a quadratic function

---

**Previous**: [Tensors and Operations](02-tensors.md)

