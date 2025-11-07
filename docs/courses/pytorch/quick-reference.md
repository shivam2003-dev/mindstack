# Quick Reference - Common Operations

A quick lookup guide for the most frequently used PyTorch operations.

## Tensor Creation

```python
import torch

# From data
torch.tensor([1, 2, 3])
torch.from_numpy(numpy_array)

# Initialization
torch.zeros(3, 4)
torch.ones(2, 3)
torch.eye(3)
torch.rand(2, 3)
torch.randn(2, 3)
torch.arange(0, 10, 2)
torch.linspace(0, 1, 5)
torch.full((2, 3), 7.5)

# Like other tensors
torch.zeros_like(x)
torch.ones_like(x)
torch.rand_like(x)
```

## Tensor Properties

```python
x.shape          # or x.size()
x.dtype
x.device
x.requires_grad
x.dim()          # Number of dimensions
x.numel()        # Total elements
```

## Type Conversion

```python
x.float()        # torch.float32
x.double()       # torch.float64
x.half()         # torch.float16
x.long()         # torch.int64
x.int()          # torch.int32
x.bool()         # torch.bool

x.to(torch.float32)
x.to(device)
```

## Device Management

```python
# Check availability
torch.cuda.is_available()
torch.cuda.device_count()

# Move tensors
x.to('cuda')
x.to('cpu')
x.cuda()
x.cpu()

# Device-agnostic
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
x = x.to(device)
```

## Basic Operations

```python
# Element-wise
x + y, x - y, x * y, x / y
x ** 2
torch.sqrt(x)
torch.exp(x)
torch.log(x)

# Matrix operations
x @ y            # Matrix multiplication
torch.mm(x, y)   # 2D matrices
torch.bmm(x, y)  # Batched matrices
torch.matmul(x, y)  # General matmul

# Transpose
x.T              # 2D transpose
x.transpose(0, 1)
x.permute(2, 0, 1)
```

## Reshaping

```python
x.view(2, 3, 4)
x.reshape(2, -1)
x.flatten()
x.flatten(start_dim=1)

x.squeeze()      # Remove dims of size 1
x.squeeze(dim=0)
x.unsqueeze(0)   # Add dimension

x.expand(3, -1, -1)
x.repeat(2, 3, 1)
```

## Indexing & Slicing

```python
x[0]             # First element/row
x[:, 0]          # First column
x[1:3]           # Rows 1 and 2
x[..., 0]        # First in last dimension

# Boolean indexing
x[x > 0]
x[mask]

# Fancy indexing
x[[0, 2]]        # Rows 0 and 2
x[rows, cols]
```

## Concatenation

```python
torch.cat([x, y], dim=0)      # Concatenate
torch.stack([x, y], dim=0)    # Stack (new dimension)
torch.split(x, 2, dim=0)      # Split into chunks
torch.chunk(x, 3, dim=0)      # Split into n chunks
```

## Reductions

```python
x.sum()
x.sum(dim=0)
x.sum(dim=0, keepdim=True)

x.mean()
x.mean(dim=1)

x.max()
x.min()
x.argmax()
x.argmin()

x.std()
x.var()
```

## Autograd

```python
# Enable gradients
x = torch.tensor([1.0], requires_grad=True)
x.requires_grad_(True)

# Compute gradients
y = x ** 2
y.backward()
print(x.grad)

# Zero gradients
x.grad.zero_()

# Disable gradients
with torch.no_grad():
    y = x ** 2

y = x.detach()
```

## Neural Network Basics

```python
import torch.nn as nn

# Define model
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc1 = nn.Linear(10, 5)
        self.fc2 = nn.Linear(5, 1)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

model = Net()
```

## Common Layers

```python
# Fully connected
nn.Linear(in_features, out_features)

# Convolution
nn.Conv2d(in_channels, out_channels, kernel_size)
nn.Conv1d(in_channels, out_channels, kernel_size)

# Pooling
nn.MaxPool2d(kernel_size)
nn.AvgPool2d(kernel_size)
nn.AdaptiveAvgPool2d(output_size)

# Normalization
nn.BatchNorm2d(num_features)
nn.LayerNorm(normalized_shape)
nn.Dropout(p=0.5)

# Recurrent
nn.RNN(input_size, hidden_size)
nn.LSTM(input_size, hidden_size)
nn.GRU(input_size, hidden_size)
```

## Activation Functions

```python
import torch.nn.functional as F

F.relu(x)
F.sigmoid(x)
F.tanh(x)
F.softmax(x, dim=1)
F.log_softmax(x, dim=1)
F.leaky_relu(x, negative_slope=0.01)
F.gelu(x)

# Or as layers
nn.ReLU()
nn.Sigmoid()
nn.Tanh()
nn.Softmax(dim=1)
```

## Loss Functions

```python
# Regression
nn.MSELoss()
nn.L1Loss()
nn.SmoothL1Loss()

# Classification
nn.CrossEntropyLoss()      # Multi-class
nn.BCELoss()               # Binary (requires sigmoid)
nn.BCEWithLogitsLoss()     # Binary (with logits)
nn.NLLLoss()               # Negative log likelihood
```

## Optimizers

```python
import torch.optim as optim

# Common optimizers
optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
optim.Adam(model.parameters(), lr=0.001)
optim.AdamW(model.parameters(), lr=0.001)
optim.RMSprop(model.parameters(), lr=0.01)

# Usage
optimizer.zero_grad()
loss.backward()
optimizer.step()
```

## Training Loop Template

```python
# Training mode
model.train()

for epoch in range(num_epochs):
    for batch_idx, (data, target) in enumerate(train_loader):
        # Move to device
        data, target = data.to(device), target.to(device)
        
        # Forward pass
        output = model(data)
        loss = criterion(output, target)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

# Evaluation mode
model.eval()

with torch.no_grad():
    for data, target in test_loader:
        data, target = data.to(device), target.to(device)
        output = model(data)
        # Calculate metrics
```

## Data Loading

```python
from torch.utils.data import Dataset, DataLoader

class CustomDataset(Dataset):
    def __init__(self, data, labels):
        self.data = data
        self.labels = labels
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]

# Create DataLoader
dataset = CustomDataset(data, labels)
loader = DataLoader(dataset, batch_size=32, shuffle=True, num_workers=4)
```

## Model Saving & Loading

```python
# Save model
torch.save(model.state_dict(), 'model.pth')

# Load model
model = Net()
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Save entire model (not recommended)
torch.save(model, 'model_complete.pth')
model = torch.load('model_complete.pth')

# Save checkpoint
checkpoint = {
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}
torch.save(checkpoint, 'checkpoint.pth')

# Load checkpoint
checkpoint = torch.load('checkpoint.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
epoch = checkpoint['epoch']
loss = checkpoint['loss']
```

## Common Patterns

### Gradient Clipping
```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

### Learning Rate Scheduling
```python
from torch.optim.lr_scheduler import StepLR, ReduceLROnPlateau

scheduler = StepLR(optimizer, step_size=30, gamma=0.1)
# or
scheduler = ReduceLROnPlateau(optimizer, mode='min', patience=10)

# In training loop
for epoch in range(num_epochs):
    train(...)
    validate(...)
    scheduler.step()
```

### Mixed Precision Training
```python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for data, target in loader:
    optimizer.zero_grad()
    
    with autocast():
        output = model(data)
        loss = criterion(output, target)
    
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

### Transfer Learning
```python
import torchvision.models as models

# Load pre-trained model
model = models.resnet18(pretrained=True)

# Freeze parameters
for param in model.parameters():
    param.requires_grad = False

# Replace final layer
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Only train final layer
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)
```

## Performance Tips

```python
# 1. Pin memory for faster data transfer
DataLoader(..., pin_memory=True)

# 2. Use multiple workers
DataLoader(..., num_workers=4)

# 3. Set benchmark mode
torch.backends.cudnn.benchmark = True

# 4. Use torch.no_grad() for inference
with torch.no_grad():
    predictions = model(input)

# 5. Empty cache
torch.cuda.empty_cache()

# 6. Use in-place operations
x.add_(1)  # Instead of x = x + 1
```

## Debugging

```python
# Check shapes
print(f"Shape: {tensor.shape}")

# Check values
print(f"Min: {tensor.min()}, Max: {tensor.max()}, Mean: {tensor.mean()}")

# Check for NaN/Inf
torch.isnan(tensor).any()
torch.isinf(tensor).any()

# Register hooks
def print_grad(grad):
    print(grad)

x.register_hook(print_grad)

# Model summary
from torchsummary import summary
summary(model, input_size=(3, 224, 224))
```

## Random Seed

```python
import random
import numpy as np

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(42)
```

---

**Pro Tips:**

1. Always move data and model to the same device
2. Use `model.train()` and `model.eval()` appropriately
3. Zero gradients before backward pass
4. Use `with torch.no_grad()` during evaluation
5. Save model state_dict, not the entire model
6. Monitor GPU memory with `torch.cuda.memory_allocated()`

