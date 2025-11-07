# Chapter 1: Introduction & Installation

## What is PyTorch?

PyTorch is an open-source machine learning library developed by Facebook's AI Research lab (FAIR). It provides:

- **Dynamic Computational Graphs**: Build and modify networks on-the-fly
- **Python-First**: Pythonic API that feels natural
- **GPU Acceleration**: Easy transfer between CPU and GPU
- **Strong Community**: Extensive ecosystem and support

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

## Resources

- 📖 [Official PyTorch Documentation](https://pytorch.org/docs/stable/index.html)
- 🎓 [PyTorch Tutorials](https://pytorch.org/tutorials/)
- 💬 [PyTorch Forums](https://discuss.pytorch.org/)
- 📺 [PyTorch YouTube Channel](https://www.youtube.com/c/PyTorch)

---

**Key Takeaways:**
- PyTorch is a flexible, Python-first deep learning framework
- Installation is straightforward with pip
- The ecosystem includes libraries for vision, audio, and NLP
- Dynamic computation graphs make debugging easier
