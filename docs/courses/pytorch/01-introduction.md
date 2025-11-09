# Chapter 1: Introduction & Installation

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand what PyTorch is and why it's popular</li>
    <li>Install PyTorch correctly for your system</li>
    <li>Set up your development environment</li>
    <li>Write your first PyTorch program</li>
  </ul>
</div>

## What is PyTorch?

PyTorch is an open-source machine learning library developed by Facebook's AI Research lab (FAIR). It provides:

- **Dynamic Computational Graphs**: Build and modify networks on-the-fly
- **Python-First**: Pythonic API that feels natural
- **GPU Acceleration**: Easy transfer between CPU and GPU
- **Strong Community**: Extensive ecosystem and support

!!! note "Why PyTorch?"
    PyTorch's dynamic computation graph makes it ideal for research and experimentation. Unlike static graph frameworks, you can modify your network architecture during runtime, making debugging much easier.

!!! tip "Getting Started"
    If you're new to deep learning, PyTorch is an excellent choice because of its intuitive API and excellent documentation. Start with simple examples and gradually build complexity.

## Why PyTorch?

### Advantages
- ✅ Intuitive and easy to learn
- ✅ Dynamic computation graphs (define-by-run)
- ✅ Excellent for research and production
- ✅ Strong debugging capabilities (standard Python debuggers work)
- ✅ Extensive pre-trained models via `torchvision`, `torchaudio`, etc.

### Use Cases
- Deep Learning Research
- Computer Vision (CNNs)
- Natural Language Processing (Transformers)
- Reinforcement Learning
- Generative Models (GANs, VAEs)

## Installation

### Prerequisites
```bash
# Check Python version (3.8+ recommended)
python --version
```

### Install PyTorch

=== "CPU Only"
    ```bash
    pip install torch torchvision torchaudio
    ```

=== "CUDA 11.8"
    ```bash
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
    ```

=== "CUDA 12.1"
    ```bash
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    ```

=== "macOS (MPS)"
    ```bash
    pip install torch torchvision torchaudio
    ```

!!! tip "Installation Tip"
    For the best performance, use GPU-enabled PyTorch if you have an NVIDIA GPU. Check your CUDA version with `nvidia-smi` before installing. For Apple Silicon Macs, PyTorch automatically uses MPS (Metal Performance Shaders) for acceleration.

!!! note "Virtual Environments"
    Always install PyTorch in a virtual environment to avoid conflicts with other packages. Use `venv` or `conda` to create isolated environments.

### Verify Installation

```python
import torch
import torchvision

# Check PyTorch version
print(f"PyTorch version: {torch.__version__}")

# Check CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU device: {torch.cuda.get_device_name(0)}")

# Check MPS (Apple Silicon) availability
print(f"MPS available: {torch.backends.mps.is_available()}")
```

**Expected Output:**
```
PyTorch version: 2.1.0
CUDA available: True
CUDA version: 11.8
GPU device: NVIDIA GeForce RTX 3090
MPS available: False
```

## PyTorch Ecosystem

### Core Libraries

| Library | Purpose | Installation |
|---------|---------|--------------|
| `torch` | Core library with tensors and autograd | `pip install torch` |
| `torchvision` | Computer vision utilities | `pip install torchvision` |
| `torchaudio` | Audio processing | `pip install torchaudio` |
| `torchtext` | NLP utilities | `pip install torchtext` |

### Additional Tools

| Tool | Purpose |
|------|---------|
| **TensorBoard** | Visualization and monitoring |
| **ONNX** | Model export for deployment |
| **PyTorch Lightning** | High-level training framework |
| **Hugging Face Transformers** | Pre-trained transformer models |

## First PyTorch Program

```python
import torch

# Create a simple tensor
x = torch.tensor([1.0, 2.0, 3.0])
print(f"Tensor: {x}")
print(f"Shape: {x.shape}")
print(f"Data type: {x.dtype}")
print(f"Device: {x.device}")
```

!!! tip "Understanding Tensor Properties"
    Always check `shape`, `dtype`, and `device` when working with tensors. These properties determine how operations behave and where computations run.

!!! note "Default Behavior"
    By default, tensors are created on CPU with `float32` dtype. You can move them to GPU later with `.to('cuda')` or `.cuda()`.

**Output:**
```
Tensor: tensor([1., 2., 3.])
Shape: torch.Size([3])
Data type: torch.float32
Device: cpu
```

## Hello World Neural Network

```python
import torch
import torch.nn as nn

# Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc = nn.Linear(10, 1)  # 10 inputs, 1 output
    
    def forward(self, x):
        return self.fc(x)

# Create model instance
model = SimpleNet()
print(model)

# Create random input
x = torch.randn(5, 10)  # batch_size=5, features=10

# Forward pass
output = model(x)
print(f"Input shape: {x.shape}")
print(f"Output shape: {output.shape}")
```

**Output:**
```
SimpleNet(
  (fc): Linear(in_features=10, out_features=1, bias=True)
)
Input shape: torch.Size([5, 10])
Output shape: torch.Size([5, 1])
```

## Development Environment Setup

### Recommended IDEs

1. **Jupyter Notebook** - Interactive development
   ```bash
   pip install jupyter
   jupyter notebook
   ```

2. **VS Code** - Full-featured editor
   - Install Python extension
   - Install Pylance for IntelliSense

3. **PyCharm** - Professional Python IDE
   - Configure PyTorch as a library

!!! tip "IDE Recommendation"
    For learning and experimentation, Jupyter Notebooks are excellent. For larger projects, VS Code or PyCharm provide better code organization and debugging tools.

!!! note "Interactive Development"
    PyTorch's dynamic nature makes it perfect for interactive development. Use Jupyter notebooks to experiment with different architectures and see results immediately.

### Useful Packages

```bash
# Scientific computing
pip install numpy pandas matplotlib seaborn

# Progress bars
pip install tqdm

# Experiment tracking
pip install tensorboard wandb

# Model summary
pip install torchsummary torchinfo
```

## Common Imports

```python
# Core PyTorch
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Vision
import torchvision
import torchvision.transforms as transforms
from torchvision import models

# Utilities
import numpy as np
import matplotlib.pyplot as plt
from tqdm import tqdm
```

## Quick Start Template

```python
import torch
import torch.nn as nn
import torch.optim as optim

# Set random seed for reproducibility
torch.manual_seed(42)

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")
```

!!! tip "Reproducibility"
    Always set random seeds (`torch.manual_seed()`) for reproducibility. Also set seeds for NumPy and Python's random module if you use them. This ensures your experiments are reproducible.

!!! note "Device Management"
    The `device` variable pattern is a best practice. It allows your code to work on both CPU and GPU without modification. Always move models and data to the same device.

# Define model
class MyModel(nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        # Define layers here
        
    def forward(self, x):
        # Define forward pass
        return x

# Initialize model
model = MyModel().to(device)

# Define loss and optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

print("Setup complete!")
```

## Next Steps

Now that you have PyTorch installed and understand the basics, proceed to:

- [Chapter 2: Tensors Basics](02-tensors-basics.md) - Learn about PyTorch tensors
- [Chapter 3: Tensor Operations](03-tensor-operations.md) - Master tensor manipulations

## Recommended Reads

???+ "📚 Official Documentation"
    1. [PyTorch Documentation](https://pytorch.org/docs/stable/index.html) - Complete API reference
    2. [PyTorch Tutorials](https://pytorch.org/tutorials/) - Official tutorials and examples
    3. [PyTorch Installation Guide](https://pytorch.org/get-started/locally/) - Detailed installation instructions
    4. [PyTorch Beginner's Guide](https://pytorch.org/tutorials/beginner/basics/intro.html) - Getting started tutorial

???+ "📖 Essential Articles"
    1. [Why PyTorch?](https://pytorch.org/blog/pytorch-1.0-released/) - PyTorch 1.0 announcement and philosophy
    2. [PyTorch vs TensorFlow](https://www.analyticsvidhya.com/blog/2021/06/pytorch-vs-tensorflow/) - Framework comparison
    3. [Dynamic vs Static Graphs](https://pytorch.org/blog/exploring-pytorch/) - Understanding computation graphs
    4. [PyTorch Ecosystem](https://pytorch.org/ecosystem/) - Overview of PyTorch tools and libraries

???+ "🎓 Learning Resources"
    1. [PyTorch Deep Learning Course](https://www.learnpytorch.io/) - Comprehensive course
    2. [Fast.ai Practical Deep Learning](https://course.fast.ai/) - Practical deep learning course
    3. [PyTorch for Deep Learning & Machine Learning](https://www.udemy.com/course/pytorch-for-deep-learning/) - Udemy course
    4. [Deep Learning with PyTorch](https://pytorch.org/assets/deep-learning/Deep-Learning-with-PyTorch.pdf) - Official book

???+ "💡 Best Practices & Tips"
    1. [PyTorch Best Practices](https://pytorch.org/tutorials/recipes/recipes_index.html) - Official recipes
    2. [Common PyTorch Mistakes](https://github.com/Kaixhin/grokking-pytorch) - Common pitfalls
    3. [PyTorch Performance Tuning](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Performance optimization
    4. [PyTorch Debugging Guide](https://pytorch.org/tutorials/recipes/debugging.html) - Debugging techniques

???+ "🔬 Research Papers"
    1. [Automatic Differentiation in Machine Learning](https://arxiv.org/abs/1502.05767) - Understanding autograd
    2. [PyTorch: An Imperative Style Deep Learning Library](https://papers.nips.cc/paper/9015-pytorch-an-imperative-style-high-performance-deep-learning-library) - PyTorch design paper

---

**Key Takeaways:**
- PyTorch is a flexible, Python-first deep learning framework
- Installation is straightforward with pip
- The ecosystem includes libraries for vision, audio, and NLP
- Dynamic computation graphs make debugging easier
