# Chapter 3: Tensor Operations

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">⚙️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Perform mathematical operations on tensors</li>
    <li>Understand matrix operations</li>
    <li>Reshape and manipulate tensor dimensions</li>
    <li>Use broadcasting effectively</li>
  </ul>
</div>

!!! note "Tensor Operations Overview"
    Tensor operations are the building blocks of all PyTorch computations. Understanding element-wise operations, matrix operations, and reshaping is crucial for building neural networks.

## Mathematical Operations

### Element-wise Operations

```python
import torch

x = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
y = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)

# Addition
print(f"x + y:\n{x + y}")
print(f"torch.add(x, y):\n{torch.add(x, y)}")

# Subtraction
print(f"x - y:\n{x - y}")
print(f"torch.sub(x, y):\n{torch.sub(x, y)}")

# Multiplication
print(f"x * y:\n{x * y}")
print(f"torch.mul(x, y):\n{torch.mul(x, y)}")

# Division
print(f"x / y:\n{x / y}")
print(f"torch.div(x, y):\n{torch.div(x, y)}")

# Power
print(f"x ** 2:\n{x ** 2}")
print(f"torch.pow(x, 2):\n{torch.pow(x, 2)}")

# Square root
print(f"sqrt(x):\n{torch.sqrt(x)}")

# Exponential
print(f"exp(x):\n{torch.exp(x)}")

# Logarithm
print(f"log(x):\n{torch.log(x)}")
```

### In-place Operations

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0])
print(f"Original x: {x}")

# In-place operations (end with _)
x.add_(10)  # x = x + 10
print(f"After add_(10): {x}")

x.mul_(2)  # x = x * 2
print(f"After mul_(2): {x}")

x.sqrt_()  # x = sqrt(x)
print(f"After sqrt_(): {x}")

# Warning: In-place operations save memory but modify original tensor
```

!!! tip "In-place Operations"
    Use in-place operations (ending with `_`) to save memory, but be careful - they modify the original tensor and can break gradient computation. Avoid them when `requires_grad=True`.

!!! warning "Gradient Tracking"
    In-place operations on tensors with `requires_grad=True` can cause issues during backpropagation. Use regular operations instead when gradients are needed.

### Comparison Operations

```python
import torch

x = torch.tensor([1, 2, 3, 4, 5])
y = torch.tensor([5, 4, 3, 2, 1])

# Element-wise comparison
print(f"x == y: {x == y}")
print(f"x > y: {x > y}")
print(f"x < y: {x < y}")
print(f"x >= y: {x >= y}")

# Logical operations
print(f"x > 2 and x < 5: {(x > 2) & (x < 5)}")
print(f"x < 2 or x > 4: {(x < 2) | (x > 4)}")

# Finding elements
print(f"Max: {torch.max(x)}")
print(f"Min: {torch.min(x)}")
print(f"Argmax: {torch.argmax(x)}")
print(f"Argmin: {torch.argmin(x)}")
```

## Matrix Operations

### Matrix Multiplication

```python
import torch

# 2D matrix multiplication
A = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
B = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)

# Method 1: @ operator
C1 = A @ B
print(f"A @ B:\n{C1}")

# Method 2: torch.mm
C2 = torch.mm(A, B)
print(f"torch.mm(A, B):\n{C2}")

# Method 3: torch.matmul (works for batched matrices too)
C3 = torch.matmul(A, B)
print(f"torch.matmul(A, B):\n{C3}")

# Element-wise multiplication (NOT matrix multiplication)
element_wise = A * B
print(f"Element-wise (A * B):\n{element_wise}")
```

### Batched Matrix Multiplication

```python
import torch

# Batch of matrices: [batch_size, m, n]
A = torch.randn(10, 3, 4)  # 10 matrices of size 3x4
B = torch.randn(10, 4, 5)  # 10 matrices of size 4x5

# Batched matrix multiplication
C = torch.bmm(A, B)  # Result: 10 matrices of size 3x5
print(f"Batch matmul shape: {C.shape}")

# Using matmul (more flexible)
C2 = torch.matmul(A, B)
print(f"torch.matmul shape: {C2.shape}")
```

### Transpose and Permute

```python
import torch

x = torch.randn(2, 3, 4)
print(f"Original shape: {x.shape}")

# Simple transpose (2D only)
y = torch.randn(3, 4)
y_T = y.T
print(f"Transpose shape: {y_T.shape}")

# Transpose specific dimensions
x_transposed = x.transpose(0, 1)  # Swap dim 0 and 1
print(f"After transpose(0, 1): {x_transposed.shape}")

# Permute (rearrange all dimensions)
x_permuted = x.permute(2, 0, 1)  # New order: (4, 2, 3)
print(f"After permute(2, 0, 1): {x_permuted.shape}")

# Common pattern: Convert (B, H, W, C) to (B, C, H, W)
image = torch.randn(32, 224, 224, 3)  # Batch, Height, Width, Channels
image_pytorch = image.permute(0, 3, 1, 2)  # Batch, Channels, Height, Width
print(f"Image format conversion: {image.shape} -> {image_pytorch.shape}")
```

## Reshaping Operations

### View and Reshape

```python
import torch

x = torch.arange(12)
print(f"Original: {x}")
print(f"Shape: {x.shape}")

# Reshape to 3x4
x_3x4 = x.view(3, 4)
print(f"\nView (3, 4):\n{x_3x4}")

# Reshape to 2x6
x_2x6 = x.reshape(2, 6)
print(f"\nReshape (2, 6):\n{x_2x6}")

# Using -1 to infer dimension
x_auto = x.view(2, -1)  # -1 is inferred as 6
print(f"\nView (2, -1):\n{x_auto}")

# Difference between view and reshape:
# - view(): requires contiguous memory, faster
# - reshape(): may copy data if not contiguous, safer
```

### Squeeze and Unsqueeze

```python
import torch

# Unsqueeze: Add dimension
x = torch.randn(3, 4)
print(f"Original shape: {x.shape}")

x_unsqueezed_0 = x.unsqueeze(0)  # Add dimension at position 0
print(f"Unsqueeze(0): {x_unsqueezed_0.shape}")  # [1, 3, 4]

x_unsqueezed_1 = x.unsqueeze(1)  # Add dimension at position 1
print(f"Unsqueeze(1): {x_unsqueezed_1.shape}")  # [3, 1, 4]

x_unsqueezed_minus1 = x.unsqueeze(-1)  # Add at end
print(f"Unsqueeze(-1): {x_unsqueezed_minus1.shape}")  # [3, 4, 1]

# Squeeze: Remove dimensions of size 1
y = torch.randn(1, 3, 1, 4)
print(f"\nOriginal shape: {y.shape}")

y_squeezed = y.squeeze()  # Remove all dims of size 1
print(f"Squeeze(): {y_squeezed.shape}")  # [3, 4]

y_squeezed_0 = y.squeeze(0)  # Remove specific dim
print(f"Squeeze(0): {y_squeezed_0.shape}")  # [3, 1, 4]
```

### Flatten

```python
import torch

# Flatten tensor
x = torch.randn(2, 3, 4)
print(f"Original shape: {x.shape}")

# Flatten all dimensions
x_flat = x.flatten()
print(f"Flatten(): {x_flat.shape}")  # [24]

# Flatten from specific dimension
x_flat_from_1 = x.flatten(start_dim=1)
print(f"Flatten(start_dim=1): {x_flat_from_1.shape}")  # [2, 12]

# Common in neural networks: flatten except batch dimension
batch_images = torch.randn(32, 3, 28, 28)  # 32 images, 3 channels, 28x28
flattened = batch_images.flatten(start_dim=1)
print(f"Batch flatten: {batch_images.shape} -> {flattened.shape}")
```

## Broadcasting

Broadcasting allows operations between tensors of different shapes.

### Broadcasting Rules

1. If tensors have different number of dimensions, pad the smaller one with 1s on the left
2. Dimensions are compatible if they are equal or one of them is 1
3. Tensors are broadcast to the larger size in each dimension

```python
import torch

# Example 1: Scalar broadcasting
x = torch.tensor([[1, 2, 3], [4, 5, 6]])
scalar = 10
result = x + scalar  # Scalar broadcast to (2, 3)
print(f"Scalar broadcasting:\n{result}")

# Example 2: Vector broadcasting
x = torch.randn(3, 4)
y = torch.randn(4)  # Will broadcast to (3, 4)
result = x + y
print(f"\nVector broadcast: {x.shape} + {y.shape} = {result.shape}")

# Example 3: Matrix broadcasting
x = torch.randn(3, 1)
y = torch.randn(1, 4)
result = x + y  # Broadcasts to (3, 4)
print(f"Matrix broadcast: {x.shape} + {y.shape} = {result.shape}")

# Example 4: Batch operations
batch = torch.randn(32, 3, 28, 28)  # Batch of images
mean = torch.randn(1, 3, 1, 1)  # Channel-wise mean
normalized = batch - mean  # Broadcasting
print(f"Batch broadcast: {batch.shape} - {mean.shape} = {normalized.shape}")

# Example 5: Explicit broadcast
x = torch.randn(3, 1, 5)
y = torch.randn(1, 4, 1)
# Manually check broadcasting
broadcasted_shape = torch.broadcast_shapes(x.shape, y.shape)
print(f"Broadcast shape: {x.shape} + {y.shape} -> {broadcasted_shape}")
```

## Concatenation and Stacking

### Concatenate

```python
import torch

x = torch.tensor([[1, 2], [3, 4]])
y = torch.tensor([[5, 6], [7, 8]])

# Concatenate along dimension 0 (rows)
concat_0 = torch.cat([x, y], dim=0)
print(f"Concat dim=0:\n{concat_0}")
print(f"Shape: {concat_0.shape}")  # [4, 2]

# Concatenate along dimension 1 (columns)
concat_1 = torch.cat([x, y], dim=1)
print(f"\nConcat dim=1:\n{concat_1}")
print(f"Shape: {concat_1.shape}")  # [2, 4]

# Concatenate multiple tensors
z = torch.tensor([[9, 10], [11, 12]])
concat_3 = torch.cat([x, y, z], dim=0)
print(f"\nConcat 3 tensors:\n{concat_3}")
print(f"Shape: {concat_3.shape}")  # [6, 2]
```

### Stack

```python
import torch

x = torch.tensor([1, 2, 3])
y = torch.tensor([4, 5, 6])
z = torch.tensor([7, 8, 9])

# Stack along new dimension 0
stacked_0 = torch.stack([x, y, z], dim=0)
print(f"Stack dim=0:\n{stacked_0}")
print(f"Shape: {stacked_0.shape}")  # [3, 3]

# Stack along new dimension 1
stacked_1 = torch.stack([x, y, z], dim=1)
print(f"\nStack dim=1:\n{stacked_1}")
print(f"Shape: {stacked_1.shape}")  # [3, 3]

# Difference between cat and stack:
# - cat: concatenates along existing dimension
# - stack: creates new dimension
```

### Split and Chunk

```python
import torch

x = torch.arange(12).reshape(4, 3)
print(f"Original:\n{x}")

# Split into specific sizes
splits = torch.split(x, 2, dim=0)  # Split into chunks of size 2
print(f"\nSplit by size 2:")
for i, split in enumerate(splits):
    print(f"Split {i}: shape {split.shape}\n{split}")

# Split into specific number of chunks
chunks = torch.chunk(x, 2, dim=0)  # Split into 2 chunks
print(f"\nChunk into 2:")
for i, chunk in enumerate(chunks):
    print(f"Chunk {i}: shape {chunk.shape}\n{chunk}")

# Split along columns
col_splits = torch.split(x, [1, 2], dim=1)  # Split into sizes [1, 2]
print(f"\nColumn splits:")
for i, split in enumerate(col_splits):
    print(f"Split {i}: shape {split.shape}\n{split}")
```

## Reduction Operations

### Sum, Mean, etc.

```python
import torch

x = torch.tensor([[1, 2, 3],
                  [4, 5, 6]], dtype=torch.float32)

# Sum
print(f"Sum all: {x.sum()}")
print(f"Sum dim=0: {x.sum(dim=0)}")  # Column sums
print(f"Sum dim=1: {x.sum(dim=1)}")  # Row sums

# Mean
print(f"\nMean all: {x.mean()}")
print(f"Mean dim=0: {x.mean(dim=0)}")
print(f"Mean dim=1: {x.mean(dim=1)}")

# Max and Min
print(f"\nMax: {x.max()}")
print(f"Min: {x.min()}")

# Max with indices
max_val, max_idx = x.max(dim=0)
print(f"Max dim=0: values={max_val}, indices={max_idx}")

# Standard deviation
print(f"\nStd: {x.std()}")

# Variance
print(f"Var: {x.var()}")

# Product
print(f"Product all: {x.prod()}")

# Keepdim parameter
sum_keepdim = x.sum(dim=1, keepdim=True)
print(f"\nSum with keepdim: shape {sum_keepdim.shape}")
print(sum_keepdim)
```

### Cumulative Operations

```python
import torch

x = torch.tensor([1, 2, 3, 4, 5])

# Cumulative sum
cumsum = torch.cumsum(x, dim=0)
print(f"Cumsum: {cumsum}")  # [1, 3, 6, 10, 15]

# Cumulative product
cumprod = torch.cumprod(x, dim=0)
print(f"Cumprod: {cumprod}")  # [1, 2, 6, 24, 120]

# 2D example
x_2d = torch.tensor([[1, 2, 3],
                     [4, 5, 6]])

cumsum_0 = torch.cumsum(x_2d, dim=0)
print(f"\nCumsum dim=0:\n{cumsum_0}")

cumsum_1 = torch.cumsum(x_2d, dim=1)
print(f"Cumsum dim=1:\n{cumsum_1}")
```

## Advanced Operations

### Clipping and Clamping

```python
import torch

x = torch.tensor([-2, -1, 0, 1, 2, 3, 4, 5])

# Clamp values between min and max
clamped = torch.clamp(x, min=0, max=3)
print(f"Clamped [0, 3]: {clamped}")

# Only min
clamped_min = torch.clamp(x, min=0)
print(f"Clamped min=0: {clamped_min}")

# Only max
clamped_max = torch.clamp(x, max=3)
print(f"Clamped max=3: {clamped_max}")

# In-place
x.clamp_(0, 3)
print(f"In-place clamped: {x}")
```

### Masking and Where

```python
import torch

x = torch.randn(3, 4)
print(f"Original:\n{x}")

# Create mask
mask = x > 0
print(f"\nMask (x > 0):\n{mask}")

# Apply mask
positive_vals = x[mask]
print(f"Positive values: {positive_vals}")

# Where: conditional selection
result = torch.where(x > 0, x, torch.zeros_like(x))
print(f"\nWhere (keep positive, else 0):\n{result}")

# Replace values
x_replaced = torch.where(x > 0, torch.tensor(1.0), torch.tensor(-1.0))
print(f"Replaced (+1 if >0, else -1):\n{x_replaced}")
```

### Sorting and Ordering

```python
import torch

x = torch.tensor([3, 1, 4, 1, 5, 9, 2, 6])

# Sort
sorted_vals, sorted_indices = torch.sort(x)
print(f"Sorted values: {sorted_vals}")
print(f"Sorted indices: {sorted_indices}")

# Descending order
sorted_desc, _ = torch.sort(x, descending=True)
print(f"Sorted descending: {sorted_desc}")

# Top-k values
top3_vals, top3_indices = torch.topk(x, 3)
print(f"Top 3 values: {top3_vals}")
print(f"Top 3 indices: {top3_indices}")

# Argsort
argsort = torch.argsort(x)
print(f"Argsort: {argsort}")

# 2D sorting
x_2d = torch.randint(0, 10, (3, 4))
print(f"\n2D tensor:\n{x_2d}")
sorted_2d, _ = torch.sort(x_2d, dim=1)
print(f"Sorted along dim=1:\n{sorted_2d}")
```

## Practice Exercises

### Exercise 1: Matrix Operations
```python
import torch

# Create two random matrices
A = torch.randn(3, 4)
B = torch.randn(4, 5)

# Tasks:
# 1. Perform matrix multiplication
# 2. Compute element-wise square of A
# 3. Find mean of each row in A

# Solutions:
C = torch.mm(A, B)
A_squared = A ** 2
row_means = A.mean(dim=1)
```

### Exercise 2: Reshaping
```python
import torch

# Create tensor of shape (2, 3, 4)
x = torch.randn(2, 3, 4)

# Tasks:
# 1. Flatten to 1D
# 2. Reshape to (6, 4)
# 3. Add a batch dimension at the beginning
# 4. Permute to (4, 2, 3)

# Solutions:
flat = x.flatten()
reshaped = x.reshape(6, 4)
with_batch = x.unsqueeze(0)
permuted = x.permute(2, 0, 1)
```

### Exercise 3: Broadcasting
```python
import torch

# Normalize a batch of images
images = torch.randn(32, 3, 64, 64)  # Batch, Channels, H, W
mean = torch.tensor([0.485, 0.456, 0.406]).reshape(1, 3, 1, 1)
std = torch.tensor([0.229, 0.224, 0.225]).reshape(1, 3, 1, 1)

# Normalize
normalized = (images - mean) / std
print(f"Normalized shape: {normalized.shape}")
```

## Performance Tips

```python
import torch
import time

# 1. Use in-place operations to save memory
x = torch.randn(1000, 1000)
x.add_(5)  # Better than x = x + 5

# 2. Avoid unnecessary copies
y = x.view(-1)  # No copy
z = x.reshape(-1)  # May copy

# 3. Vectorize operations
# Bad: Loop
result = []
for i in range(len(x)):
    result.append(x[i] * 2)

# Good: Vectorized
result = x * 2

# 4. Use appropriate dtype
x_float16 = torch.randn(1000, 1000, dtype=torch.float16)  # Faster on GPU
```

## Next Steps

Continue to [Chapter 4: Autograd & Gradients](04-autograd.md) to learn about:
- Automatic differentiation
- Computing gradients
- Gradient descent
- Building custom functions

## Key Takeaways

- ✅ PyTorch supports extensive mathematical operations
- ✅ Broadcasting enables operations on different-shaped tensors
- ✅ Reshape operations: view, reshape, squeeze, unsqueeze, flatten
- ✅ Use in-place operations (\_) for memory efficiency
- ✅ Reduction operations: sum, mean, max, min with keepdim option
- ✅ Matrix operations: mm, bmm, matmul for different scenarios

## Recommended Reads

???+ "📚 Official Documentation"
    1. [PyTorch Operations](https://pytorch.org/docs/stable/torch.html) - Complete operations reference
    2. [Tensor Operations](https://pytorch.org/docs/stable/torch.html#math-operations) - Mathematical operations
    3. [Matrix Operations](https://pytorch.org/docs/stable/torch.html#blas-and-lapack-operations) - Linear algebra functions
    4. [Reduction Operations](https://pytorch.org/docs/stable/torch.html#reduction-ops) - Sum, mean, max, min, etc.

???+ "📖 Essential Articles"
    1. [Understanding Broadcasting](https://pytorch.org/docs/stable/notes/broadcasting.html) - Broadcasting rules and examples
    2. [Tensor Reshaping Guide](https://pytorch.org/docs/stable/tensor_view.html) - View, reshape, and memory layout
    3. [Efficient Tensor Operations](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Performance optimization
    4. [Matrix Multiplication Guide](https://pytorch.org/docs/stable/generated/torch.matmul.html) - When to use mm, bmm, matmul

???+ "🎓 Learning Resources"
    1. [NumPy Operations in PyTorch](https://pytorch.org/tutorials/beginner/former_torchies/tensor_tutorial.html) - NumPy to PyTorch mapping
    2. [Linear Algebra with PyTorch](https://pytorch.org/tutorials/beginner/introyt/tensors_deeper_tutorial.html) - Advanced tensor operations
    3. [Broadcasting Tutorial](https://pytorch.org/tutorials/beginner/introyt/tensors_deeper_tutorial.html#broadcasting) - Broadcasting examples

???+ "💡 Best Practices"
    1. [In-Place Operations](https://pytorch.org/docs/stable/tensors.html#in-place-operations) - When to use in-place ops
    2. [Memory Efficient Operations](https://pytorch.org/docs/stable/notes/cuda.html#memory-management) - Reducing memory usage
    3. [Vectorization Best Practices](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Optimizing operations

???+ "🔬 Research Papers"
    1. [Array Programming with NumPy](https://www.nature.com/articles/s41586-020-2649-2) - Understanding array operations
    2. [BLAS and LAPACK](https://www.netlib.org/blas/) - Linear algebra libraries

---
