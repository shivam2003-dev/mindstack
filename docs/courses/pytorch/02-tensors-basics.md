# Chapter 2: Tensors Basics

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">📦 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand tensors and their properties</li>
    <li>Create tensors in various ways</li>
    <li>Manipulate tensor shapes and types</li>
    <li>Work with CPU and GPU tensors</li>
  </ul>
</div>

## What are Tensors?

Tensors are multi-dimensional arrays that are the fundamental building blocks of PyTorch. They are similar to NumPy arrays but with additional capabilities:

- GPU acceleration
- Automatic differentiation (autograd)
- Optimized for deep learning operations

!!! note "Tensors vs NumPy Arrays"
    While tensors are similar to NumPy arrays, they have key advantages: automatic differentiation for gradients, GPU acceleration, and optimized operations for deep learning. You can easily convert between them using `torch.from_numpy()` and `.numpy()`.

!!! tip "Understanding Dimensions"
    Think of tensor dimensions as nested lists. A 2D tensor is like a matrix (rows × columns), a 3D tensor is like a stack of matrices, and so on. The first dimension is often the batch size in deep learning.

### Tensor Dimensions

| Dimension | Name | Example Shape | Use Case |
|-----------|------|---------------|----------|
| 0D | Scalar | `()` | Single value |
| 1D | Vector | `(n,)` | Features, time series |
| 2D | Matrix | `(n, m)` | Grayscale image, tabular data |
| 3D | 3D Tensor | `(n, m, k)` | RGB image, sequence data |
| 4D | 4D Tensor | `(batch, channels, height, width)` | Batch of images |
| 5D+ | nD Tensor | `(batch, time, channels, height, width)` | Video data |

## Creating Tensors

### From Python Lists/Tuples

```python
import torch

# 1D tensor from list
x = torch.tensor([1, 2, 3, 4, 5])
print(f"1D tensor: {x}")
print(f"Shape: {x.shape}")

# 2D tensor from nested list
matrix = torch.tensor([[1, 2, 3],
                       [4, 5, 6]])
print(f"\n2D tensor:\n{matrix}")
print(f"Shape: {matrix.shape}")

# 3D tensor
tensor_3d = torch.tensor([[[1, 2], [3, 4]],
                          [[5, 6], [7, 8]]])
print(f"\n3D tensor:\n{tensor_3d}")
print(f"Shape: {tensor_3d.shape}")
```

**Output:**
```
1D tensor: tensor([1, 2, 3, 4, 5])
Shape: torch.Size([5])

2D tensor:
tensor([[1, 2, 3],
        [4, 5, 6]])
Shape: torch.Size([2, 3])

3D tensor:
tensor([[[1, 2],
         [3, 4]],
        [[5, 6],
         [7, 8]]])
Shape: torch.Size([2, 2, 2])
```

### From NumPy Arrays

```python
import numpy as np
import torch

# NumPy array to tensor
np_array = np.array([[1, 2, 3], [4, 5, 6]])
tensor = torch.from_numpy(np_array)
print(f"From NumPy:\n{tensor}")

# Tensor to NumPy array
back_to_numpy = tensor.numpy()
print(f"Back to NumPy:\n{back_to_numpy}")

# Note: They share memory!
np_array[0, 0] = 100
print(f"After modifying NumPy:\n{tensor}")  # Tensor also changed!
```

### Initialization Functions

```python
import torch

# Zeros
zeros = torch.zeros(3, 4)
print(f"Zeros:\n{zeros}")

# Ones
ones = torch.ones(2, 3)
print(f"\nOnes:\n{ones}")

# Identity matrix
identity = torch.eye(3)
print(f"\nIdentity:\n{identity}")

# Random values [0, 1) - uniform distribution
rand_uniform = torch.rand(2, 3)
print(f"\nRandom uniform:\n{rand_uniform}")

# Random values - standard normal distribution
rand_normal = torch.randn(2, 3)
print(f"\nRandom normal:\n{rand_normal}")

# Random integers
rand_int = torch.randint(0, 10, (3, 3))
print(f"\nRandom integers:\n{rand_int}")

# Full (constant value)
full = torch.full((2, 3), 7.5)
print(f"\nFull:\n{full}")

# Arange
arange = torch.arange(0, 10, 2)  # start, end, step
print(f"\nArange: {arange}")

# Linspace
linspace = torch.linspace(0, 1, 5)  # start, end, steps
print(f"Linspace: {linspace}")
```

### Creating Tensors Like Others

```python
import torch

x = torch.tensor([[1, 2], [3, 4]])

# Zeros like x
zeros_like = torch.zeros_like(x)
print(f"Zeros like:\n{zeros_like}")

# Ones like x
ones_like = torch.ones_like(x)
print(f"Ones like:\n{ones_like}")

# Random like x
rand_like = torch.rand_like(x.float())
print(f"Random like:\n{rand_like}")
```

## Tensor Properties

### Data Types (dtypes)

```python
import torch

# Different data types
int_tensor = torch.tensor([1, 2, 3], dtype=torch.int32)
float_tensor = torch.tensor([1.0, 2.0, 3.0], dtype=torch.float32)
double_tensor = torch.tensor([1.0, 2.0, 3.0], dtype=torch.float64)
bool_tensor = torch.tensor([True, False, True], dtype=torch.bool)
```

!!! tip "Choosing Data Types"
    Use `float32` for most deep learning tasks - it's the default and provides good precision with memory efficiency. Use `float64` only when you need extra precision. Use `float16` or `bfloat16` for memory-constrained scenarios or mixed precision training.

!!! note "Memory Considerations"
    `float32` uses 4 bytes per element, while `float64` uses 8 bytes. For large tensors, this difference can be significant. Most neural networks work fine with `float32`.

print(f"Int32: {int_tensor.dtype}")
print(f"Float32: {float_tensor.dtype}")
print(f"Float64: {double_tensor.dtype}")
print(f"Bool: {bool_tensor.dtype}")

# Default dtype
default = torch.tensor([1.0, 2.0])
print(f"Default dtype: {default.dtype}")  # float32
```

**Common Data Types:**

| PyTorch dtype | Python type | Description |
|---------------|-------------|-------------|
| `torch.float32` or `torch.float` | `float` | 32-bit floating point |
| `torch.float64` or `torch.double` | `float` | 64-bit floating point |
| `torch.float16` or `torch.half` | - | 16-bit floating point |
| `torch.int32` or `torch.int` | `int` | 32-bit integer |
| `torch.int64` or `torch.long` | `int` | 64-bit integer |
| `torch.int16` or `torch.short` | - | 16-bit integer |
| `torch.int8` | - | 8-bit integer |
| `torch.uint8` | - | 8-bit unsigned integer |
| `torch.bool` | `bool` | Boolean |

### Type Conversion

```python
import torch

x = torch.tensor([1, 2, 3])
print(f"Original dtype: {x.dtype}")

# Convert to different types
x_float = x.float()  # or x.to(torch.float32)
x_double = x.double()
x_long = x.long()

print(f"Float: {x_float.dtype}")
print(f"Double: {x_double.dtype}")
print(f"Long: {x_long.dtype}")

# Using .to()
x_half = x.to(torch.float16)
print(f"Half: {x_half.dtype}")
```

### Device (CPU vs GPU)

```python
import torch

# Check CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA device count: {torch.cuda.device_count()}")
```

!!! tip "Device Management Best Practice"
    Always use the device-agnostic pattern: `device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')`. This makes your code work on both CPU and GPU without modification.

!!! warning "Device Mismatch"
    Operations between tensors on different devices will fail. Always ensure tensors are on the same device before operations. Use `.to(device)` to move tensors.

# Create tensor on CPU
cpu_tensor = torch.tensor([1, 2, 3])
print(f"Device: {cpu_tensor.device}")

# Move to GPU (if available)
if torch.cuda.is_available():
    gpu_tensor = cpu_tensor.to('cuda')
    print(f"GPU Device: {gpu_tensor.device}")
    
    # Or create directly on GPU
    gpu_tensor2 = torch.tensor([1, 2, 3], device='cuda')
    print(f"Created on GPU: {gpu_tensor2.device}")
    
    # Move back to CPU
    back_to_cpu = gpu_tensor.to('cpu')
    print(f"Back to CPU: {back_to_cpu.device}")

# Device-agnostic code
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
tensor = torch.tensor([1, 2, 3]).to(device)
print(f"Using device: {device}")
```

### Shape and Size

```python
import torch

x = torch.randn(2, 3, 4)

# Get shape
print(f"Shape: {x.shape}")  # torch.Size([2, 3, 4])
print(f"Size: {x.size()}")  # Same as shape

# Get specific dimension
print(f"Dimension 0: {x.shape[0]}")
print(f"Dimension 1: {x.size(1)}")

# Number of dimensions
print(f"Number of dimensions: {x.dim()}")

# Total number of elements
print(f"Total elements: {x.numel()}")

# Check if empty
empty_tensor = torch.tensor([])
print(f"Is empty: {empty_tensor.numel() == 0}")
```

## Tensor Attributes Summary

```python
import torch

x = torch.randn(3, 4, dtype=torch.float32, device='cpu')

# All important attributes
print(f"Tensor: {x}")
print(f"Shape: {x.shape}")
print(f"Size: {x.size()}")
print(f"Dtype: {x.dtype}")
print(f"Device: {x.device}")
print(f"Requires grad: {x.requires_grad}")
print(f"Is leaf: {x.is_leaf}")
print(f"Dimensions: {x.dim()}")
print(f"Number of elements: {x.numel()}")
```

## Indexing and Slicing

### Basic Indexing

```python
import torch

x = torch.tensor([[1, 2, 3, 4],
                  [5, 6, 7, 8],
                  [9, 10, 11, 12]])

# Single element
print(f"Element [0, 0]: {x[0, 0]}")
print(f"Element [1, 2]: {x[1, 2]}")

# Entire row
print(f"First row: {x[0]}")
print(f"Last row: {x[-1]}")

# Entire column
print(f"First column: {x[:, 0]}")
print(f"Second column: {x[:, 1]}")

# Slicing
print(f"First 2 rows: \n{x[:2]}")
print(f"First 2 columns: \n{x[:, :2]}")
print(f"Submatrix: \n{x[1:, 2:]}")
```

### Advanced Indexing

```python
import torch

x = torch.arange(1, 13).reshape(3, 4)
print(f"Original:\n{x}")

# Boolean indexing
mask = x > 6
print(f"\nMask (x > 6):\n{mask}")
print(f"Elements > 6: {x[mask]}")

# Fancy indexing
rows = torch.tensor([0, 2])
cols = torch.tensor([1, 3])
print(f"\nElements at [0,1] and [2,3]: {x[rows, cols]}")

# Using lists
print(f"Rows 0 and 2:\n{x[[0, 2]]}")
```

## Tensor Operations Preview

```python
import torch

x = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
y = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)

# Element-wise operations
print(f"x + y:\n{x + y}")
print(f"x * y:\n{x * y}")
print(f"x / y:\n{x / y}")

# Matrix multiplication
print(f"Matrix multiply:\n{x @ y}")
# or
print(f"torch.mm:\n{torch.mm(x, y)}")

# Transpose
print(f"Transpose:\n{x.T}")
```

## Common Patterns

### Creating Batches of Data

```python
import torch

# Batch of 32 RGB images of size 224x224
batch_images = torch.randn(32, 3, 224, 224)
print(f"Batch shape: {batch_images.shape}")
# Shape: [batch_size, channels, height, width]

# Batch of sequences (NLP)
batch_sequences = torch.randn(16, 50, 300)
print(f"Sequence batch shape: {batch_sequences.shape}")
# Shape: [batch_size, sequence_length, embedding_dim]
```

### Setting Random Seed

```python
import torch

# For reproducibility
torch.manual_seed(42)
x1 = torch.rand(3, 3)

torch.manual_seed(42)
x2 = torch.rand(3, 3)

print(f"Same random values: {torch.all(x1 == x2)}")

# For CUDA
if torch.cuda.is_available():
    torch.cuda.manual_seed(42)
    torch.cuda.manual_seed_all(42)  # For multi-GPU
```

## Practice Exercises

### Exercise 1: Create Tensors
```python
# Create the following tensors:
# 1. A 3x3 matrix of zeros
# 2. A 2x4 matrix of ones with dtype float64
# 3. A random 5x5 matrix from standard normal distribution
# 4. A tensor from [0, 2, 4, 6, 8, 10]

# Solutions:
zeros = torch.zeros(3, 3)
ones = torch.ones(2, 4, dtype=torch.float64)
randn_matrix = torch.randn(5, 5)
even_numbers = torch.arange(0, 11, 2)
```

### Exercise 2: Indexing
```python
# Given tensor:
x = torch.arange(1, 25).reshape(4, 6)

# Tasks:
# 1. Extract the first row
# 2. Extract the last column
# 3. Extract the 2x2 submatrix from center
# 4. Extract all elements > 15

# Solutions:
first_row = x[0]
last_col = x[:, -1]
center = x[1:3, 2:4]
greater_15 = x[x > 15]
```

## Next Steps

Continue to [Chapter 3: Tensor Operations](03-tensor-operations.md) to learn about:
- Mathematical operations
- Reshaping and manipulation
- Broadcasting
- Reduction operations

## Key Takeaways

- ✅ Tensors are multi-dimensional arrays optimized for deep learning
- ✅ Can create tensors from lists, NumPy arrays, or initialization functions
- ✅ Important attributes: shape, dtype, device, requires_grad
- ✅ Support indexing and slicing similar to NumPy
- ✅ Can move tensors between CPU and GPU with `.to(device)`

## Recommended Reads

???+ "📚 Official Documentation"
    1. [PyTorch Tensors](https://pytorch.org/docs/stable/tensors.html) - Complete tensor API reference
    2. [Tensor Creation](https://pytorch.org/docs/stable/torch.html#creation-ops) - All tensor creation functions
    3. [Tensor Attributes](https://pytorch.org/docs/stable/tensors.html#tensor-attributes) - Understanding tensor properties
    4. [Indexing and Slicing](https://pytorch.org/docs/stable/tensor_view.html) - Advanced indexing operations

???+ "📖 Essential Articles"
    1. [Understanding PyTorch Tensors](https://pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html) - Official tensor tutorial
    2. [Tensors vs NumPy Arrays](https://pytorch.org/tutorials/beginner/blitz/tensor_tutorial.html) - Comparison guide
    3. [Tensor Data Types](https://pytorch.org/docs/stable/tensor_attributes.html#torch-dtype) - Choosing the right dtype
    4. [GPU Tensors](https://pytorch.org/tutorials/beginner/blitz/tensor_tutorial.html#tensors) - Working with CUDA tensors

???+ "🎓 Learning Resources"
    1. [NumPy to PyTorch](https://pytorch.org/tutorials/beginner/former_torchies/tensor_tutorial.html) - Transition guide
    2. [Tensor Operations Cheat Sheet](https://pytorch.org/docs/stable/torch.html) - Quick reference
    3. [Advanced Indexing](https://pytorch.org/docs/stable/tensor_view.html#advanced-indexing) - Complex indexing patterns

???+ "💡 Best Practices"
    1. [Memory Management](https://pytorch.org/docs/stable/notes/cuda.html#memory-management) - Efficient tensor memory usage
    2. [Tensor Performance Tips](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Optimization strategies
    3. [Avoiding Common Tensor Errors](https://pytorch.org/docs/stable/notes/broadcasting.html) - Broadcasting pitfalls

???+ "🔬 Research Papers"
    1. [Array Programming with NumPy](https://www.nature.com/articles/s41586-020-2649-2) - Understanding array operations
    2. [GPU Computing](https://developer.nvidia.com/cuda-toolkit) - CUDA programming concepts

---
