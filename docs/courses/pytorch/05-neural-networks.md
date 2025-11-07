# Chapter 5: Building Neural Networks

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🧠 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Build neural networks with nn.Module</li>
    <li>Understand common layer types</li>
    <li>Create custom architectures</li>
    <li>Implement activation functions</li>
  </ul>
</div>

## nn.Module - The Foundation

Every PyTorch model inherits from `nn.Module`. This provides:
- Parameter management
- Device movement (CPU/GPU)
- Training/evaluation modes
- State saving/loading

!!! tip "Always Inherit from nn.Module"
    All your custom models must inherit from `nn.Module` and call `super().__init__()`. This gives you access to powerful features like automatic parameter registration, `.to(device)`, and model saving.

!!! note "Forward vs __call__"
    You define `forward()`, but call the model with `model(x)`. PyTorch's `__call__` method handles hooks and other features before calling your `forward()` method.

### Basic Structure

```python
import torch
import torch.nn as nn

class MyModel(nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        # Define layers here
        
    def forward(self, x):
        # Define forward pass
        return x

# Create instance
model = MyModel()
```

## Simple Neural Network

### Linear Regression

```python
import torch
import torch.nn as nn

class LinearRegression(nn.Module):
    def __init__(self, input_dim, output_dim):
        super(LinearRegression, self).__init__()
        self.linear = nn.Linear(input_dim, output_dim)
    
    def forward(self, x):
        return self.linear(x)

# Create model
model = LinearRegression(input_dim=10, output_dim=1)
print(model)

# Forward pass
x = torch.randn(5, 10)  # Batch of 5 samples
y_pred = model(x)
print(f"Input shape: {x.shape}")
print(f"Output shape: {y_pred.shape}")
```

**Output:**
```
LinearRegression(
  (linear): Linear(in_features=10, out_features=1, bias=True)
)
Input shape: torch.Size([5, 10])
Output shape: torch.Size([5, 1])
```

### Multi-Layer Perceptron (MLP)

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(MLP, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)
    
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x

# Create model
model = MLP(input_dim=784, hidden_dim=128, output_dim=10)

# Test forward pass
x = torch.randn(32, 784)  # Batch of 32 images (28x28 flattened)
output = model(x)
print(f"Output shape: {output.shape}")  # [32, 10]
```

## Common Layers

### 1. Linear (Fully Connected) Layer

```python
import torch.nn as nn

# Linear layer: y = xW^T + b
fc = nn.Linear(in_features=100, out_features=50, bias=True)

# Input: [batch_size, in_features]
x = torch.randn(32, 100)
output = fc(x)  # [32, 50]

print(f"Weight shape: {fc.weight.shape}")  # [50, 100]
print(f"Bias shape: {fc.bias.shape}")      # [50]
```

### 2. Convolutional Layers

```python
import torch.nn as nn

# 2D Convolution for images
conv2d = nn.Conv2d(
    in_channels=3,      # RGB input
    out_channels=64,    # 64 filters
    kernel_size=3,      # 3x3 kernel
    stride=1,
    padding=1
)

# Input: [batch, channels, height, width]
x = torch.randn(16, 3, 224, 224)  # 16 RGB images
output = conv2d(x)  # [16, 64, 224, 224]

# 1D Convolution for sequences
conv1d = nn.Conv1d(
    in_channels=128,
    out_channels=256,
    kernel_size=3,
    padding=1
)

# Input: [batch, channels, sequence_length]
x = torch.randn(32, 128, 100)
output = conv1d(x)  # [32, 256, 100]
```

### 3. Pooling Layers

```python
import torch.nn as nn

# Max Pooling
maxpool = nn.MaxPool2d(kernel_size=2, stride=2)
x = torch.randn(16, 64, 28, 28)
output = maxpool(x)  # [16, 64, 14, 14]

# Average Pooling
avgpool = nn.AvgPool2d(kernel_size=2, stride=2)
output = avgpool(x)  # [16, 64, 14, 14]

# Adaptive Average Pooling (output size specified)
adaptive_pool = nn.AdaptiveAvgPool2d((1, 1))
output = adaptive_pool(x)  # [16, 64, 1, 1]

# Global Average Pooling pattern
gap = nn.AdaptiveAvgPool2d(1)
x = torch.randn(16, 512, 7, 7)
output = gap(x)  # [16, 512, 1, 1]
output = output.view(output.size(0), -1)  # [16, 512]
```

### 4. Normalization Layers

```python
import torch.nn as nn

# Batch Normalization (2D)
bn = nn.BatchNorm2d(num_features=64)
x = torch.randn(16, 64, 28, 28)
output = bn(x)  # Same shape

# Layer Normalization
ln = nn.LayerNorm(normalized_shape=128)
x = torch.randn(32, 10, 128)
output = ln(x)  # Same shape

# Instance Normalization
instance_norm = nn.InstanceNorm2d(num_features=64)
x = torch.randn(16, 64, 28, 28)
output = instance_norm(x)  # Same shape

# Group Normalization
group_norm = nn.GroupNorm(num_groups=8, num_channels=64)
x = torch.randn(16, 64, 28, 28)
output = group_norm(x)  # Same shape
```

### 5. Dropout

```python
import torch.nn as nn

# Dropout for regularization
dropout = nn.Dropout(p=0.5)  # Drop 50% of neurons

# During training
x = torch.randn(32, 128)
output = dropout(x)  # Some values zeroed

# During evaluation (dropout disabled)
dropout.eval()
output = dropout(x)  # All values kept
```

### 6. Recurrent Layers

```python
import torch.nn as nn

# RNN
rnn = nn.RNN(input_size=100, hidden_size=256, num_layers=2, batch_first=True)
x = torch.randn(32, 10, 100)  # [batch, seq_len, features]
output, hidden = rnn(x)
print(f"Output: {output.shape}")  # [32, 10, 256]
print(f"Hidden: {hidden.shape}")  # [2, 32, 256]

# LSTM
lstm = nn.LSTM(input_size=100, hidden_size=256, num_layers=2, batch_first=True)
output, (hidden, cell) = lstm(x)

# GRU
gru = nn.GRU(input_size=100, hidden_size=256, num_layers=2, batch_first=True)
output, hidden = gru(x)
```

## Activation Functions

### Common Activations

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

x = torch.randn(10, 20)

# ReLU (most common)
relu_output = F.relu(x)
# or as a layer
relu_layer = nn.ReLU()

# Leaky ReLU
leaky_relu = F.leaky_relu(x, negative_slope=0.01)

# Sigmoid
sigmoid = torch.sigmoid(x)

# Tanh
tanh = torch.tanh(x)

# Softmax (for classification)
softmax = F.softmax(x, dim=1)  # Along feature dimension

# GELU (used in transformers)
gelu = F.gelu(x)

# Swish/SiLU
silu = F.silu(x)
```

### When to Use Which?

| Activation | Use Case | Range |
|------------|----------|-------|
| ReLU | Hidden layers (general) | [0, ∞) |
| Leaky ReLU | When ReLU causes dead neurons | (-∞, ∞) |
| GELU | Transformers, modern architectures | (-∞, ∞) |
| Sigmoid | Binary classification output | (0, 1) |
| Tanh | RNN hidden states | (-1, 1) |
| Softmax | Multi-class classification output | Sums to 1 |

## Sequential Models

### Using nn.Sequential

```python
import torch.nn as nn

# Method 1: Sequential with ordered arguments
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(128, 10)
)

# Method 2: Sequential with OrderedDict
from collections import OrderedDict

model = nn.Sequential(OrderedDict([
    ('fc1', nn.Linear(784, 256)),
    ('relu1', nn.ReLU()),
    ('dropout1', nn.Dropout(0.5)),
    ('fc2', nn.Linear(256, 128)),
    ('relu2', nn.ReLU()),
    ('dropout2', nn.Dropout(0.5)),
    ('fc3', nn.Linear(128, 10))
]))

# Forward pass
x = torch.randn(32, 784)
output = model(x)
```

### Sequential vs Custom Module

```python
import torch.nn as nn

# Sequential - simple, linear flow
simple_model = nn.Sequential(
    nn.Linear(10, 20),
    nn.ReLU(),
    nn.Linear(20, 10)
)

# Custom Module - complex flow, multiple branches
class ComplexModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.branch1 = nn.Linear(10, 20)
        self.branch2 = nn.Linear(10, 20)
        self.combine = nn.Linear(40, 10)
    
    def forward(self, x):
        # Parallel branches
        out1 = torch.relu(self.branch1(x))
        out2 = torch.relu(self.branch2(x))
        
        # Concatenate and combine
        combined = torch.cat([out1, out2], dim=1)
        output = self.combine(combined)
        return output
```

## ModuleList and ModuleDict

### ModuleList

```python
import torch.nn as nn

class DynamicNet(nn.Module):
    def __init__(self, num_layers):
        super().__init__()
        # ModuleList for variable number of layers
        self.layers = nn.ModuleList([
            nn.Linear(100, 100) for _ in range(num_layers)
        ])
        self.output = nn.Linear(100, 10)
    
    def forward(self, x):
        for layer in self.layers:
            x = torch.relu(layer(x))
        return self.output(x)

# Create model with 5 hidden layers
model = DynamicNet(num_layers=5)
```

### ModuleDict

```python
import torch.nn as nn

class MultiTaskNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.shared = nn.Linear(100, 50)
        
        # ModuleDict for task-specific heads
        self.task_heads = nn.ModuleDict({
            'classification': nn.Linear(50, 10),
            'regression': nn.Linear(50, 1),
            'segmentation': nn.Linear(50, 20)
        })
    
    def forward(self, x, task='classification'):
        x = torch.relu(self.shared(x))
        return self.task_heads[task](x)

model = MultiTaskNet()
output = model(x, task='classification')
```

## Real-World Example: CNN for Image Classification

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(SimpleCNN, self).__init__()
        
        # Convolutional layers
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        
        # Pooling
        self.pool = nn.MaxPool2d(2, 2)
        
        # Fully connected layers
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, num_classes)
    
    def forward(self, x):
        # Conv block 1: 32x32 -> 16x16
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        
        # Conv block 2: 16x16 -> 8x8
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        
        # Conv block 3: 8x8 -> 4x4
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x

# Create model
model = SimpleCNN(num_classes=10)

# Test with CIFAR-10 sized images
x = torch.randn(4, 3, 32, 32)
output = model(x)
print(f"Output shape: {output.shape}")  # [4, 10]
```

## Model Inspection

### View Model Architecture

```python
import torch
import torch.nn as nn

model = SimpleCNN()

# Print model
print(model)

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total parameters: {total_params:,}")
print(f"Trainable parameters: {trainable_params:,}")

# Inspect specific layers
for name, module in model.named_modules():
    print(f"{name}: {module.__class__.__name__}")

# Inspect parameters
for name, param in model.named_parameters():
    print(f"{name}: {param.shape}")
```

### Using torchsummary

```python
from torchsummary import summary

model = SimpleCNN().cuda()
summary(model, input_size=(3, 32, 32))
```

## Weight Initialization

### Common Initialization Methods

```python
import torch
import torch.nn as nn

def init_weights(m):
    if isinstance(m, nn.Linear):
        # Xavier/Glorot initialization
        nn.init.xavier_uniform_(m.weight)
        if m.bias is not None:
            nn.init.zeros_(m.bias)
    
    elif isinstance(m, nn.Conv2d):
        # He initialization (good for ReLU)
        nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
        if m.bias is not None:
            nn.init.zeros_(m.bias)
    
    elif isinstance(m, nn.BatchNorm2d):
        nn.init.ones_(m.weight)
        nn.init.zeros_(m.bias)

# Apply initialization
model = SimpleCNN()
model.apply(init_weights)
```

### Manual Initialization

```python
import torch.nn as nn

class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 5)
        
        # Manual initialization in __init__
        nn.init.xavier_uniform_(self.fc.weight)
        nn.init.zeros_(self.fc.bias)
    
    def forward(self, x):
        return self.fc(x)
```

## Practice Exercise

### Build a ResNet-like Block

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(ResidualBlock, self).__init__()
        
        self.conv1 = nn.Conv2d(in_channels, out_channels, 
                               kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        
        self.conv2 = nn.Conv2d(out_channels, out_channels,
                               kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        # Shortcut connection
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 
                          kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
    
    def forward(self, x):
        # Main path
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        
        # Add shortcut
        out += self.shortcut(x)
        out = torch.relu(out)
        
        return out

# Test
block = ResidualBlock(64, 128, stride=2)
x = torch.randn(4, 64, 32, 32)
output = block(x)
print(f"Output shape: {output.shape}")  # [4, 128, 16, 16]
```

## Next Steps

Continue to [Chapter 6: Loss Functions](06-loss-functions.md) to learn about:
- Regression losses
- Classification losses
- Custom loss functions
- Loss weighting

## Key Takeaways

- ✅ All models inherit from `nn.Module`
- ✅ Define layers in `__init__`, logic in `forward`
- ✅ Use `nn.Sequential` for simple linear models
- ✅ Use custom modules for complex architectures
- ✅ Choose appropriate activation functions
- ✅ Initialize weights properly
- ✅ Inspect model architecture before training

---

**Reference:**
- [nn.Module Documentation](https://pytorch.org/docs/stable/generated/torch.nn.Module.html)
- [Layer Documentation](https://pytorch.org/docs/stable/nn.html)
