# Chapter 7: Optimizers

## What are Optimizers?

Optimizers update model parameters (weights and biases) to minimize the loss function. They implement various algorithms to find the optimal parameters efficiently.

**Basic Concept:**
$$\theta_{t+1} = \theta_t - \eta \nabla_\theta L(\theta_t)$$

Where:
- $\theta$ = parameters
- $\eta$ = learning rate
- $\nabla_\theta L$ = gradient of loss

## Basic Usage

```python
import torch
import torch.nn as nn
import torch.optim as optim

# Model
model = nn.Linear(10, 1)

# Optimizer
optimizer = optim.SGD(model.parameters(), lr=0.01)

# Training step
for epoch in range(100):
    # Forward pass
    predictions = model(inputs)
    loss = criterion(predictions, targets)
    
    # Backward pass
    optimizer.zero_grad()  # Clear old gradients
    loss.backward()        # Compute gradients
    optimizer.step()       # Update parameters
```

## Common Optimizers

### 1. Stochastic Gradient Descent (SGD)

**Most basic optimizer**

```python
import torch.optim as optim

# Basic SGD
optimizer = optim.SGD(model.parameters(), lr=0.01)

# SGD with momentum
optimizer = optim.SGD(
    model.parameters(),
    lr=0.01,
    momentum=0.9
)

# SGD with momentum and weight decay
optimizer = optim.SGD(
    model.parameters(),
    lr=0.01,
    momentum=0.9,
    weight_decay=1e-4  # L2 regularization
)

# SGD with Nesterov momentum
optimizer = optim.SGD(
    model.parameters(),
    lr=0.01,
    momentum=0.9,
    nesterov=True
)
```

**Update Rule:**
$$v_t = \gamma v_{t-1} + \eta \nabla_\theta L(\theta)$$
$$\theta = \theta - v_t$$

**Characteristics:**
- ✅ Simple and well-understood
- ✅ Works well with momentum
- ✅ Good for large datasets
- ❌ Requires manual learning rate tuning
- ❌ Same learning rate for all parameters

### 2. Adam (Adaptive Moment Estimation)

**Most popular optimizer**

```python
import torch.optim as optim

# Basic Adam
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Adam with custom betas
optimizer = optim.Adam(
    model.parameters(),
    lr=0.001,
    betas=(0.9, 0.999),     # Momentum parameters
    eps=1e-8,               # Numerical stability
    weight_decay=0.01       # L2 regularization
)
```

**Update Rule:**
$$m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t$$
$$v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2$$
$$\hat{m}_t = \frac{m_t}{1-\beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1-\beta_2^t}$$
$$\theta = \theta - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon}\hat{m}_t$$

**Characteristics:**
- ✅ Adaptive learning rates
- ✅ Works well out-of-the-box
- ✅ Handles sparse gradients well
- ✅ Requires less tuning
- ❌ Can overfit more than SGD
- ❌ Higher memory usage

**When to use:**
- Default choice for most tasks
- When you want quick convergence
- When you don't want to tune learning rate much

### 3. AdamW

**Adam with decoupled weight decay**

```python
import torch.optim as optim

optimizer = optim.AdamW(
    model.parameters(),
    lr=0.001,
    betas=(0.9, 0.999),
    weight_decay=0.01  # Proper weight decay
)
```

**Why AdamW?**
- Better weight decay implementation than Adam
- Often better generalization
- Preferred for transformers and modern architectures

**Comparison:**

```python
# Adam - weight decay applied to gradients
adam = optim.Adam(model.parameters(), lr=0.001, weight_decay=0.01)

# AdamW - weight decay applied directly to weights
adamw = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)
```

### 4. RMSprop

**Good for RNNs**

```python
import torch.optim as optim

optimizer = optim.RMSprop(
    model.parameters(),
    lr=0.01,
    alpha=0.99,         # Smoothing constant
    eps=1e-8,
    momentum=0.0,
    weight_decay=0
)
```

**Characteristics:**
- ✅ Adaptive learning rates
- ✅ Good for non-stationary objectives
- ✅ Works well with RNNs
- ❌ Can be unstable with high learning rates

### 5. Adagrad

**Adapts learning rate for each parameter**

```python
import torch.optim as optim

optimizer = optim.Adagrad(
    model.parameters(),
    lr=0.01,
    lr_decay=0,
    weight_decay=0
)
```

**Characteristics:**
- ✅ Good for sparse data
- ✅ No need to manually tune learning rate
- ❌ Learning rate can decay too aggressively
- ❌ May stop learning too early

### 6. Adadelta

**Extension of Adagrad**

```python
import torch.optim as optim

optimizer = optim.Adadelta(
    model.parameters(),
    lr=1.0,          # Often 1.0 works well
    rho=0.9,
    eps=1e-6
)
```

**Characteristics:**
- ✅ No need to set initial learning rate
- ✅ Continues learning unlike Adagrad
- ❌ Can be slow to converge

## Optimizer Comparison

### Quick Comparison

```python
import torch
import torch.nn as nn
import torch.optim as optim

# Simple model
model = nn.Linear(10, 1)

# Different optimizers
optimizers = {
    'SGD': optim.SGD(model.parameters(), lr=0.01),
    'SGD+Momentum': optim.SGD(model.parameters(), lr=0.01, momentum=0.9),
    'Adam': optim.Adam(model.parameters(), lr=0.001),
    'AdamW': optim.AdamW(model.parameters(), lr=0.001),
    'RMSprop': optim.RMSprop(model.parameters(), lr=0.01),
}

# Compare on same data
for name, optimizer in optimizers.items():
    model_copy = nn.Linear(10, 1)
    # Train and compare...
```

### Selection Guide

| Optimizer | Best For | Learning Rate | Speed | Memory |
|-----------|----------|---------------|-------|--------|
| **SGD** | Large datasets, need generalization | 0.01-0.1 | Medium | Low |
| **SGD+Momentum** | Computer vision (CNNs) | 0.01-0.1 | Medium | Low |
| **Adam** | Quick prototyping, general use | 0.0001-0.001 | Fast | High |
| **AdamW** | Transformers, modern architectures | 0.0001-0.001 | Fast | High |
| **RMSprop** | RNNs, non-stationary problems | 0.001-0.01 | Fast | Medium |

## Parameter Groups

### Different Learning Rates for Different Layers

```python
import torch.optim as optim

model = MyModel()

# Different learning rates
optimizer = optim.Adam([
    {'params': model.feature_extractor.parameters(), 'lr': 1e-5},
    {'params': model.classifier.parameters(), 'lr': 1e-3}
])
```

### Fine-tuning Pre-trained Models

```python
import torch.optim as optim
import torchvision.models as models

# Load pre-trained model
model = models.resnet18(pretrained=True)

# Freeze backbone
for param in model.parameters():
    param.requires_grad = False

# Unfreeze final layer
model.fc = nn.Linear(512, 10)

# Optimize only trainable parameters
optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.001
)

# Or use parameter groups
optimizer = optim.Adam([
    {'params': model.fc.parameters(), 'lr': 1e-3}
])
```

### Weight Decay for Specific Layers

```python
import torch.optim as optim

# No weight decay for batch norm and bias
def get_parameter_groups(model):
    decay = []
    no_decay = []
    
    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        # No weight decay for bias and batch norm
        if len(param.shape) == 1 or 'bias' in name or 'bn' in name:
            no_decay.append(param)
        else:
            decay.append(param)
    
    return [
        {'params': decay, 'weight_decay': 1e-4},
        {'params': no_decay, 'weight_decay': 0.0}
    ]

optimizer = optim.AdamW(get_parameter_groups(model), lr=0.001)
```

## Learning Rate Schedulers

### 1. Step LR

```python
from torch.optim.lr_scheduler import StepLR

optimizer = optim.Adam(model.parameters(), lr=0.001)

# Decay LR by 0.1 every 30 epochs
scheduler = StepLR(optimizer, step_size=30, gamma=0.1)

for epoch in range(100):
    train(...)
    validate(...)
    scheduler.step()  # Update learning rate
    
    print(f"Epoch {epoch}, LR: {optimizer.param_groups[0]['lr']:.6f}")
```

### 2. Multi-Step LR

```python
from torch.optim.lr_scheduler import MultiStepLR

optimizer = optim.SGD(model.parameters(), lr=0.1)

# Decay at specific epochs
scheduler = MultiStepLR(optimizer, milestones=[30, 60, 90], gamma=0.1)

for epoch in range(100):
    train(...)
    scheduler.step()
```

### 3. Exponential LR

```python
from torch.optim.lr_scheduler import ExponentialLR

optimizer = optim.Adam(model.parameters(), lr=0.001)

# LR = initial_lr * gamma^epoch
scheduler = ExponentialLR(optimizer, gamma=0.95)

for epoch in range(100):
    train(...)
    scheduler.step()
```

### 4. Cosine Annealing

```python
from torch.optim.lr_scheduler import CosineAnnealingLR

optimizer = optim.SGD(model.parameters(), lr=0.1)

# Cosine annealing over T_max epochs
scheduler = CosineAnnealingLR(optimizer, T_max=100, eta_min=0.0001)

for epoch in range(100):
    train(...)
    scheduler.step()
```

### 5. Reduce on Plateau

```python
from torch.optim.lr_scheduler import ReduceLROnPlateau

optimizer = optim.Adam(model.parameters(), lr=0.001)

# Reduce LR when validation loss plateaus
scheduler = ReduceLROnPlateau(
    optimizer,
    mode='min',        # Minimize loss
    factor=0.1,        # Multiply LR by 0.1
    patience=10,       # Wait 10 epochs
    verbose=True
)

for epoch in range(100):
    train_loss = train(...)
    val_loss = validate(...)
    
    # Step with validation loss
    scheduler.step(val_loss)
```

### 6. One Cycle LR

```python
from torch.optim.lr_scheduler import OneCycleLR

optimizer = optim.SGD(model.parameters(), lr=0.1)

# One cycle policy
scheduler = OneCycleLR(
    optimizer,
    max_lr=0.1,
    epochs=100,
    steps_per_epoch=len(train_loader)
)

for epoch in range(100):
    for batch in train_loader:
        train_step(...)
        optimizer.step()
        scheduler.step()  # Step after each batch!
```

### 7. Warm-up

```python
from torch.optim.lr_scheduler import LambdaLR

def warmup_lambda(epoch):
    warmup_epochs = 5
    if epoch < warmup_epochs:
        return (epoch + 1) / warmup_epochs
    return 1.0

optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = LambdaLR(optimizer, lr_lambda=warmup_lambda)

for epoch in range(100):
    train(...)
    scheduler.step()
```

## Complete Training Example

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau

# Model
model = MyModel()

# Optimizer
optimizer = optim.AdamW(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01
)

# Scheduler
scheduler = ReduceLROnPlateau(
    optimizer,
    mode='min',
    factor=0.5,
    patience=5,
    verbose=True
)

# Loss
criterion = nn.CrossEntropyLoss()

# Training loop
best_loss = float('inf')

for epoch in range(100):
    # Training
    model.train()
    train_loss = 0
    
    for data, target in train_loader:
        # Zero gradients
        optimizer.zero_grad()
        
        # Forward pass
        output = model(data)
        loss = criterion(output, target)
        
        # Backward pass
        loss.backward()
        
        # Gradient clipping (optional)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # Update parameters
        optimizer.step()
        
        train_loss += loss.item()
    
    # Validation
    model.eval()
    val_loss = 0
    
    with torch.no_grad():
        for data, target in val_loader:
            output = model(data)
            loss = criterion(output, target)
            val_loss += loss.item()
    
    val_loss /= len(val_loader)
    
    # Update learning rate
    scheduler.step(val_loss)
    
    # Save best model
    if val_loss < best_loss:
        best_loss = val_loss
        torch.save(model.state_dict(), 'best_model.pth')
    
    print(f"Epoch {epoch+1}/{100}")
    print(f"Train Loss: {train_loss/len(train_loader):.4f}")
    print(f"Val Loss: {val_loss:.4f}")
    print(f"LR: {optimizer.param_groups[0]['lr']:.6f}")
```

## Advanced Techniques

### Gradient Accumulation

```python
accumulation_steps = 4

optimizer.zero_grad()
for i, (data, target) in enumerate(train_loader):
    output = model(data)
    loss = criterion(output, target)
    
    # Normalize loss
    loss = loss / accumulation_steps
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### Gradient Clipping

```python
# Clip gradient norm
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# Clip gradient value
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=0.5)
```

### Look-Ahead Optimizer

```python
from torch.optim import Adam

class Lookahead(torch.optim.Optimizer):
    def __init__(self, base_optimizer, k=5, alpha=0.5):
        self.base_optimizer = base_optimizer
        self.k = k
        self.alpha = alpha
        self.param_groups = self.base_optimizer.param_groups
        self.state = {}
        
    def step(self, closure=None):
        loss = self.base_optimizer.step(closure)
        
        for group in self.param_groups:
            for p in group['params']:
                param_state = self.state[p]
                if 'slow_params' not in param_state:
                    param_state['slow_params'] = torch.clone(p.data).detach()
                    param_state['counter'] = 0
                
                param_state['counter'] += 1
                
                if param_state['counter'] >= self.k:
                    slow = param_state['slow_params']
                    slow += (p.data - slow) * self.alpha
                    p.data = slow
                    param_state['counter'] = 0
        
        return loss

# Usage
base_opt = Adam(model.parameters(), lr=0.001)
optimizer = Lookahead(base_opt, k=5, alpha=0.5)
```

## Optimizer Best Practices

### 1. Start with Adam/AdamW

```python
# Good default choice
optimizer = optim.AdamW(
    model.parameters(),
    lr=0.001,
    weight_decay=0.01
)
```

### 2. Use Learning Rate Finder

```python
def find_lr(model, train_loader, criterion, optimizer):
    lrs = []
    losses = []
    
    lr = 1e-7
    for batch in train_loader:
        optimizer.param_groups[0]['lr'] = lr
        
        loss = train_step(batch)
        losses.append(loss)
        lrs.append(lr)
        
        lr *= 1.1
        if lr > 10:
            break
    
    # Plot and find best LR
    import matplotlib.pyplot as plt
    plt.plot(lrs, losses)
    plt.xscale('log')
    plt.xlabel('Learning Rate')
    plt.ylabel('Loss')
    plt.show()
```

### 3. Use Warm-up for Large Batch Sizes

```python
def get_lr(epoch, warmup_epochs=5, initial_lr=0.001):
    if epoch < warmup_epochs:
        return initial_lr * (epoch + 1) / warmup_epochs
    return initial_lr
```

## Common Issues and Solutions

### Issue 1: Loss Not Decreasing

```python
# Check learning rate
print(f"LR: {optimizer.param_groups[0]['lr']}")

# Try different learning rates
for lr in [1e-5, 1e-4, 1e-3, 1e-2]:
    optimizer = optim.Adam(model.parameters(), lr=lr)
    # Test...
```

### Issue 2: Training Unstable

```python
# Add gradient clipping
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# Reduce learning rate
optimizer = optim.Adam(model.parameters(), lr=0.0001)

# Use batch normalization
model.add_module('bn', nn.BatchNorm1d(hidden_size))
```

### Issue 3: Overfitting

```python
# Add weight decay
optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

# Add dropout
model.add_module('dropout', nn.Dropout(0.5))
```

## Next Steps

Continue to [Chapter 8: Training Loop](08-training-loop.md) to learn about:
- Complete training pipeline
- Validation and testing
- Checkpointing
- Early stopping

## Key Takeaways

- ✅ Adam/AdamW are good default choices
- ✅ SGD with momentum for computer vision
- ✅ Use learning rate schedulers
- ✅ Always call `optimizer.zero_grad()` before backward
- ✅ Use gradient clipping for RNNs
- ✅ Different learning rates for different layers (fine-tuning)
- ✅ Monitor learning rate during training

---

**Reference:**
- [Optimizers Documentation](https://pytorch.org/docs/stable/optim.html)
- [Learning Rate Schedulers](https://pytorch.org/docs/stable/optim.html#how-to-adjust-learning-rate)
