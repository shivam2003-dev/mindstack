# Chapter 4: Autograd & Gradients

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔢 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand automatic differentiation</li>
    <li>Compute gradients automatically</li>
    <li>Control gradient computation</li>
    <li>Debug gradient flow</li>
  </ul>
</div>

## What is Autograd?

**Autograd** is PyTorch's automatic differentiation engine that powers neural network training. It automatically computes gradients (derivatives) of tensor operations, which are essential for optimization algorithms like gradient descent.

!!! note "Why Autograd is Powerful"
    Autograd eliminates the need to manually compute derivatives, which is error-prone and time-consuming. It automatically builds a computation graph and computes gradients using the chain rule.

!!! tip "Understanding the Computation Graph"
    PyTorch builds a dynamic computation graph as you perform operations. When you call `.backward()`, it traverses this graph in reverse to compute gradients using backpropagation.

### Why Autograd Matters

- 🎯 **Automatic**: No manual derivative calculations
- 🔄 **Dynamic**: Build graphs on-the-fly (define-by-run)
- 📊 **Efficient**: Optimized backward pass computation
- 🧮 **Flexible**: Supports complex operations and custom functions

## Enabling Gradient Tracking

```python
import torch

# Create tensors with gradient tracking
x = torch.tensor([2.0, 3.0], requires_grad=True)
print(f"x: {x}")
print(f"Requires grad: {x.requires_grad}")
print(f"Is leaf: {x.is_leaf}")
print(f"Gradient: {x.grad}")  # None initially

# Create tensor without gradient tracking (default)
y = torch.tensor([1.0, 2.0])
print(f"\ny requires grad: {y.requires_grad}")

# Enable gradient tracking on existing tensor
y.requires_grad_(True)
print(f"y requires grad now: {y.requires_grad}")
```

## Computing Gradients

### Basic Example

```python
import torch

# Create tensor with gradient tracking
x = torch.tensor([3.0], requires_grad=True)
print(f"x = {x}")

# Perform operations
y = x ** 2  # y = x²
print(f"y = x² = {y}")

# Compute gradient dy/dx
y.backward()  # Computes gradients

# Access gradient
print(f"dy/dx = {x.grad}")  # Should be 2x = 2*3 = 6
```

**Mathematical Explanation:**
- $y = x^2$
- $\frac{dy}{dx} = 2x$
- At $x = 3$: $\frac{dy}{dx} = 2(3) = 6$

### Multi-Step Computation

```python
import torch

x = torch.tensor([2.0], requires_grad=True)
a = torch.tensor([3.0], requires_grad=True)

# Forward pass
y = x ** 2  # y = x²
z = a * y   # z = a * y = a * x²
w = z + 5   # w = a * x² + 5

print(f"x = {x}, a = {a}")
print(f"y = x² = {y}")
print(f"z = a*y = {z}")
print(f"w = z+5 = {w}")

# Backward pass
w.backward()

# Check gradients
print(f"\ndw/dx = {x.grad}")  # 2*a*x = 2*3*2 = 12
print(f"dw/da = {a.grad}")    # x² = 4
```

**Mathematical Explanation:**
- $w = ax^2 + 5$
- $\frac{\partial w}{\partial x} = 2ax = 2(3)(2) = 12$
- $\frac{\partial w}{\partial a} = x^2 = 2^2 = 4$

### Vector Gradients

```python
import torch

# Vector input
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# Scalar output
y = (x ** 2).sum()  # y = x₁² + x₂² + x₃²
print(f"y = {y}")

y.backward()
print(f"dy/dx = {x.grad}")  # [2x₁, 2x₂, 2x₃] = [2, 4, 6]
```

### Non-Scalar Backward Pass

For non-scalar outputs, you need to provide a gradient argument:

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# Vector output
y = x ** 2  # [1, 4, 9]

# Need to provide gradient for non-scalar
gradient = torch.tensor([1.0, 1.0, 1.0])
y.backward(gradient)

print(f"Gradient: {x.grad}")  # [2, 4, 6]
```

## Gradient Accumulation

```python
import torch

x = torch.tensor([3.0], requires_grad=True)

# First backward pass
y1 = x ** 2
y1.backward()
print(f"After first backward: x.grad = {x.grad}")

# Second backward pass (gradients accumulate!)
y2 = x ** 3
y2.backward()
print(f"After second backward: x.grad = {x.grad}")

# Zero gradients
x.grad.zero_()
print(f"After zeroing: x.grad = {x.grad}")

# Third backward pass
y3 = x ** 2
y3.backward()
print(f"After third backward: x.grad = {x.grad}")
```

**Important:** Gradients accumulate by default! Always zero gradients between iterations.

## Controlling Gradient Computation

### No Gradient Context

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# Normal operation - gradients tracked
y = x ** 2
print(f"y requires_grad: {y.requires_grad}")

# Disable gradient tracking temporarily
with torch.no_grad():
    z = x ** 2
    print(f"z requires_grad: {z.requires_grad}")

# Gradients tracked again
w = x ** 2
print(f"w requires_grad: {w.requires_grad}")
```

**Use Cases for `torch.no_grad()`:**
- Inference/evaluation (no training)
- Validation phase
- Saving memory
- Speeding up computation

### Detach

```python
import torch

x = torch.tensor([2.0], requires_grad=True)

# Create computation graph
y = x ** 2
z = y ** 3

# Detach y from graph
y_detached = y.detach()
print(f"y requires_grad: {y.requires_grad}")
print(f"y_detached requires_grad: {y_detached.requires_grad}")

# Backward through z
w = y_detached * 2
# w.backward()  # Error! y_detached has no gradient
```

### Set Gradient Enabled

```python
import torch

# Enable/disable globally
torch.set_grad_enabled(False)
x = torch.tensor([1.0], requires_grad=True)
y = x ** 2
print(f"Grad enabled False - y.requires_grad: {y.requires_grad}")

torch.set_grad_enabled(True)
z = x ** 2
print(f"Grad enabled True - z.requires_grad: {z.requires_grad}")
```

## Computational Graph

### Understanding the Graph

```python
import torch

x = torch.tensor([2.0], requires_grad=True)
w = torch.tensor([3.0], requires_grad=True)
b = torch.tensor([1.0], requires_grad=True)

# Build graph
y = w * x + b  # Linear function
z = y ** 2      # Square

print(f"y: {y}")
print(f"z: {z}")

# Check graph
print(f"\nz.grad_fn: {z.grad_fn}")  # PowBackward
print(f"y.grad_fn: {y.grad_fn}")    # AddBackward
print(f"x.grad_fn: {x.grad_fn}")    # None (leaf node)
```

### Leaf Nodes vs Non-Leaf Nodes

```python
import torch

x = torch.tensor([1.0], requires_grad=True)  # Leaf
y = x * 2                                     # Non-leaf
z = y + 3                                     # Non-leaf

print(f"x is_leaf: {x.is_leaf}")  # True
print(f"y is_leaf: {y.is_leaf}")  # False
print(f"z is_leaf: {z.is_leaf}")  # False

# Only leaf nodes retain gradients by default
z.backward()
print(f"\nx.grad: {x.grad}")      # Available
print(f"y.grad: {y.grad}")        # None (non-leaf)
print(f"z.grad: {z.grad}")        # None (non-leaf)
```

### Retaining Gradients for Non-Leaf Nodes

```python
import torch

x = torch.tensor([2.0], requires_grad=True)
y = x ** 2
y.retain_grad()  # Keep gradient for non-leaf node

z = y ** 3
z.backward()

print(f"x.grad: {x.grad}")  # Leaf - always available
print(f"y.grad: {y.grad}")  # Non-leaf - available due to retain_grad()
```

## Gradient Descent Example

### Simple Linear Regression

```python
import torch
import matplotlib.pyplot as plt

# Generate synthetic data: y = 2x + 1
torch.manual_seed(42)
x_data = torch.randn(100, 1)
y_true = 2 * x_data + 1 + torch.randn(100, 1) * 0.1

# Initialize parameters
w = torch.randn(1, requires_grad=True)
b = torch.randn(1, requires_grad=True)

# Training loop
learning_rate = 0.01
epochs = 100
losses = []

for epoch in range(epochs):
    # Forward pass
    y_pred = w * x_data + b
    
    # Compute loss (Mean Squared Error)
    loss = ((y_pred - y_true) ** 2).mean()
    losses.append(loss.item())
    
    # Backward pass
    loss.backward()
    
    # Update parameters
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
    
    # Zero gradients
    w.grad.zero_()
    b.grad.zero_()
    
    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1}, Loss: {loss.item():.4f}, w: {w.item():.4f}, b: {b.item():.4f}")

print(f"\nFinal: w = {w.item():.4f}, b = {b.item():.4f}")
print(f"True: w = 2.0000, b = 1.0000")
```

### Visualizing Gradient Descent

```python
import torch
import numpy as np
import matplotlib.pyplot as plt

# Function: f(x) = x²
x_range = np.linspace(-5, 5, 100)
y_range = x_range ** 2

# Gradient descent
x = torch.tensor([-4.0], requires_grad=True)
learning_rate = 0.1
steps = 20

x_history = [x.item()]

for step in range(steps):
    y = x ** 2
    y.backward()
    
    with torch.no_grad():
        x -= learning_rate * x.grad
    x.grad.zero_()
    
    x_history.append(x.item())

print(f"Start: x = -4.0")
print(f"End: x = {x.item():.4f}")
print(f"Optimum: x = 0.0")
```

## Higher-Order Gradients

### Second Derivatives

```python
import torch

x = torch.tensor([2.0], requires_grad=True)

# First derivative
y = x ** 3
y.backward(create_graph=True)  # Keep graph for second derivative

first_grad = x.grad.clone()
print(f"First derivative (3x²): {first_grad.item()}")

# Second derivative
x.grad.zero_()
first_grad.backward()
second_grad = x.grad
print(f"Second derivative (6x): {second_grad.item()}")
```

## Common Pitfalls and Solutions

### Pitfall 1: In-place Operations

```python
import torch

x = torch.tensor([1.0], requires_grad=True)

# Bad: In-place operation
# x += 1  # Error during backward!

# Good: Create new tensor
x = x + 1

y = x ** 2
y.backward()
print(f"Gradient: {x.grad}")
```

### Pitfall 2: Forgetting to Zero Gradients

```python
import torch

x = torch.tensor([2.0], requires_grad=True)

# Iteration 1
y = x ** 2
y.backward()
print(f"Iteration 1: {x.grad}")

# Iteration 2 (forgot to zero!)
y = x ** 2
y.backward()
print(f"Iteration 2 (accumulated): {x.grad}")

# Correct way
x.grad.zero_()
y = x ** 2
y.backward()
print(f"Iteration 3 (zeroed): {x.grad}")
```

### Pitfall 3: Multiple Backward Passes

```python
import torch

x = torch.tensor([2.0], requires_grad=True)
y = x ** 2

# First backward
y.backward(retain_graph=True)
print(f"First backward: {x.grad}")

# Second backward (need retain_graph=True)
x.grad.zero_()
y.backward()
print(f"Second backward: {x.grad}")
```

## Autograd Functions

### Custom Autograd Function

```python
import torch
from torch.autograd import Function

class MySquare(Function):
    @staticmethod
    def forward(ctx, input):
        # Save input for backward
        ctx.save_for_backward(input)
        return input ** 2
    
    @staticmethod
    def backward(ctx, grad_output):
        # Retrieve saved input
        input, = ctx.saved_tensors
        # Gradient: d(x²)/dx = 2x
        return grad_output * 2 * input

# Use custom function
x = torch.tensor([3.0], requires_grad=True)
square = MySquare.apply

y = square(x)
y.backward()

print(f"x: {x}")
print(f"y: {y}")
print(f"dy/dx: {x.grad}")  # 2*3 = 6
```

## Practice Exercises

### Exercise 1: Basic Gradients
```python
import torch

# Compute gradient of f(x, y) = x²y + y³ at x=2, y=3
x = torch.tensor([2.0], requires_grad=True)
y = torch.tensor([3.0], requires_grad=True)

f = x**2 * y + y**3
f.backward()

print(f"∂f/∂x = {x.grad.item()}")  # 2xy = 2*2*3 = 12
print(f"∂f/∂y = {y.grad.item()}")  # x² + 3y² = 4 + 27 = 31
```

### Exercise 2: Training Loop Pattern
```python
import torch

# Model parameters
w = torch.randn(1, requires_grad=True)

# Training loop structure
for epoch in range(10):
    # 1. Forward pass
    output = w * 2
    loss = output ** 2
    
    # 2. Backward pass
    loss.backward()
    
    # 3. Update parameters
    with torch.no_grad():
        w -= 0.01 * w.grad
    
    # 4. Zero gradients
    w.grad.zero_()
```

## Optimization Tips

```python
import torch

# 1. Use torch.no_grad() for inference
model_output = None
with torch.no_grad():
    model_output = model(input_data)

# 2. Detach when you don't need gradients
loss_value = loss.detach().item()

# 3. Use gradient checkpointing for memory
from torch.utils.checkpoint import checkpoint

# 4. Gradient clipping
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

## Next Steps

Continue to [Chapter 5: Building Neural Networks](05-neural-networks.md) to learn about:
- nn.Module class
- Layers and activation functions
- Building custom models
- Forward pass

## Key Takeaways

- ✅ Autograd automatically computes gradients via backward()
- ✅ Use `requires_grad=True` to track gradients
- ✅ Always zero gradients between iterations
- ✅ Use `torch.no_grad()` for inference
- ✅ Computational graph is built dynamically
- ✅ Gradients accumulate by default

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Autograd Documentation](https://pytorch.org/docs/stable/autograd.html) - Complete autograd API
    2. [Autograd Mechanics](https://pytorch.org/docs/stable/notes/autograd.html) - How autograd works internally
    3. [Gradient Computation](https://pytorch.org/docs/stable/autograd.html#gradient-computation) - Understanding gradients
    4. [Function API](https://pytorch.org/docs/stable/autograd.html#function) - Custom autograd functions

???+ "📖 Essential Articles"
    1. [Understanding Autograd](https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html) - Official autograd tutorial
    2. [Computation Graphs](https://pytorch.org/docs/stable/notes/autograd.html#automatic-differentiation-package) - Graph construction
    3. [Gradient Accumulation](https://pytorch.org/docs/stable/notes/autograd.html#gradient-accumulation) - Accumulating gradients
    4. [Custom Autograd Functions](https://pytorch.org/tutorials/beginner/examples_autograd/two_layer_net_custom_function.html) - Creating custom functions

???+ "🎓 Learning Resources"
    1. [Backpropagation Explained](https://pytorch.org/tutorials/beginner/introyt/autogradyt_tutorial.html) - Deep dive into backprop
    2. [Automatic Differentiation](https://pytorch.org/tutorials/beginner/introyt/autogradyt_tutorial.html) - AD fundamentals
    3. [Gradient Checking](https://pytorch.org/tutorials/beginner/examples_autograd/two_layer_net_custom_function.html) - Verifying gradients

???+ "💡 Best Practices"
    1. [Gradient Management](https://pytorch.org/docs/stable/autograd.html#gradient-checkpointing) - Efficient gradient computation
    2. [No Grad Context](https://pytorch.org/docs/stable/autograd.html#locally-disabling-gradient-computation) - When to disable gradients
    3. [Gradient Clipping](https://pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html) - Preventing exploding gradients

???+ "🔬 Research Papers"
    1. [Automatic Differentiation in Machine Learning](https://arxiv.org/abs/1502.05767) - AD survey paper
    2. [Backpropagation Through Time](https://www.cs.cmu.edu/~bhiksha/courses/deeplearning/Fall.2016/pdfs/Werbos.backprop.pdf) - BPTT algorithm
    3. [Gradient-Based Learning](https://www.iro.umontreal.ca/~lisa/pointeurs/bengio+lecun2007.pdf) - Deep learning foundations

---
