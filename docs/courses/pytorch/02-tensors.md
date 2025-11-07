# Tensors and Operations

Tensors are the fundamental building blocks of PyTorch. In this lesson, we'll explore how to create, manipulate, and perform operations on tensors.

## What is a Tensor?

A tensor is a multi-dimensional array, similar to NumPy's `ndarray`, but with GPU acceleration support.

## Creating Tensors

There are several ways to create tensors:

```python
import torch

# From a Python list
x = torch.tensor([1, 2, 3, 4, 5])

# Zeros tensor
zeros = torch.zeros(3, 4)

# Ones tensor
ones = torch.ones(2, 3)

# Random tensor
random = torch.randn(2, 3)
```

!!! note "Note"
    `torch.randn()` creates a tensor with values sampled from a standard normal distribution.

## Tensor Operations

### Basic Arithmetic

```python
a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])

# Addition
c = a + b
print(c)  # tensor([5., 7., 9.])

# Element-wise multiplication
d = a * b
print(d)  # tensor([4., 10., 18.])
```

### Matrix Operations

```python
# Matrix multiplication
x = torch.randn(3, 4)
y = torch.randn(4, 5)
z = torch.matmul(x, y)
print(z.shape)  # torch.Size([3, 5])
```

## Tensor Properties

```python
tensor = torch.randn(2, 3, 4)

print(tensor.shape)    # torch.Size([2, 3, 4])
print(tensor.dtype)    # torch.float32
print(tensor.device)   # cpu
print(tensor.requires_grad)  # False
```

## Reshaping Tensors

```python
x = torch.randn(2, 3)
y = x.view(3, 2)      # Reshape
z = x.reshape(6)      # Flatten
```

!!! warning "Warning"
    When using `view()`, the total number of elements must remain the same.

## GPU Support

```python
# Check if CUDA is available
if torch.cuda.is_available():
    device = torch.device("cuda")
    x = torch.randn(3, 3).to(device)
else:
    print("CUDA not available")
```

## Exercises

1. Create a 3x3 identity matrix using PyTorch
2. Multiply two random 2x2 matrices
3. Reshape a 4x4 tensor into a 1D tensor

---

**Previous**: [Introduction](01-intro.md) | **Next**: [Automatic Differentiation](03-autograd.md)

