# Debugging Checklist

Common issues and how to fix them when working with PyTorch.

## 🔴 Runtime Errors

### 1. Dimension Mismatch

**Error:**
```
RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x100 and 50x10)
```

**Solutions:**
```python
# Check tensor shapes
print(f"Input shape: {x.shape}")
print(f"Weight shape: {weight.shape}")

# Common fixes:
x = x.view(batch_size, -1)  # Flatten
x = x.transpose(1, 2)        # Swap dimensions
x = x.unsqueeze(1)           # Add dimension
```

**Prevention:**
- Print shapes after each operation during development
- Use descriptive variable names with shape hints: `x_BxCxHxW`

---

### 2. CUDA Out of Memory

**Error:**
```
RuntimeError: CUDA out of memory
```

**Solutions:**
```python
# 1. Reduce batch size
batch_size = 16  # Instead of 32

# 2. Use gradient accumulation
for i, (data, target) in enumerate(loader):
    output = model(data)
    loss = criterion(output, target) / accumulation_steps
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()

# 3. Use mixed precision
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()

with autocast():
    output = model(data)
    loss = criterion(output, target)

# 4. Clear cache
torch.cuda.empty_cache()

# 5. Use gradient checkpointing
from torch.utils.checkpoint import checkpoint
```

**Prevention:**
- Monitor GPU memory: `torch.cuda.memory_allocated()`
- Start with smaller models/batches and scale up

---

### 3. Device Mismatch

**Error:**
```
RuntimeError: Expected all tensors to be on the same device
```

**Solutions:**
```python
# Move everything to same device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = model.to(device)
data = data.to(device)
target = target.to(device)

# Or in training loop
for data, target in loader:
    data, target = data.to(device), target.to(device)
```

**Prevention:**
- Always specify device at the beginning
- Use device-agnostic code

---

### 4. Gradient Issues

**Error:**
```
RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn
```

**Solutions:**
```python
# Enable gradients
x = torch.tensor([1.0], requires_grad=True)

# Or
x.requires_grad_(True)

# Check if gradients are enabled
print(f"Requires grad: {x.requires_grad}")
```

**Common Cause:**
```python
# Wrong - creates new tensor without gradients
x = x.detach()
y = x ** 2
y.backward()  # Error!

# Right - keep gradients
y = x ** 2
y.backward()
```

---

### 5. In-place Operations

**Error:**
```
RuntimeError: a leaf Variable that requires grad is being used in an in-place operation
```

**Solutions:**
```python
# Wrong
x = torch.tensor([1.0], requires_grad=True)
x += 1  # In-place operation - Error!

# Right
x = torch.tensor([1.0], requires_grad=True)
x = x + 1  # Creates new tensor

# Or use no_grad
with torch.no_grad():
    x += 1
```

---

### 6. Multiple Backward Calls

**Error:**
```
RuntimeError: Trying to backward through the graph a second time
```

**Solutions:**
```python
# Solution 1: Retain graph
y.backward(retain_graph=True)
y.backward()  # Now works

# Solution 2: Recompute forward pass
y = model(x)
y.backward()

optimizer.zero_grad()
y = model(x)  # Recompute
y.backward()
```

---

## 🟡 Numerical Issues

### 1. NaN or Inf in Loss

**Detection:**
```python
if torch.isnan(loss).any() or torch.isinf(loss).any():
    print("Warning: NaN or Inf in loss!")
    
# Check gradients
for name, param in model.named_parameters():
    if param.grad is not None:
        if torch.isnan(param.grad).any():
            print(f"NaN gradient in {name}")
```

**Common Causes & Solutions:**

**a) Learning rate too high**
```python
# Reduce learning rate
optimizer = optim.Adam(model.parameters(), lr=1e-4)  # Instead of 1e-2
```

**b) Exploding gradients**
```python
# Clip gradients
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

**c) Log of zero**
```python
# Wrong
loss = -torch.log(predictions)

# Right
loss = -torch.log(predictions + 1e-8)  # Add epsilon
```

**d) Division by zero**
```python
# Wrong
result = x / y

# Right
result = x / (y + 1e-8)
```

---

### 2. Vanishing Gradients

**Detection:**
```python
for name, param in model.named_parameters():
    if param.grad is not None:
        print(f"{name}: {param.grad.abs().mean():.6f}")
```

**Solutions:**
```python
# 1. Use better initialization
def init_weights(m):
    if isinstance(m, nn.Linear):
        torch.nn.init.xavier_uniform_(m.weight)
        m.bias.data.fill_(0.01)

model.apply(init_weights)

# 2. Use ReLU instead of sigmoid/tanh
nn.ReLU()  # Instead of nn.Sigmoid()

# 3. Use batch normalization
nn.BatchNorm1d(hidden_size)

# 4. Use residual connections
class ResBlock(nn.Module):
    def forward(self, x):
        return x + self.layers(x)
```

---

### 3. Exploding Gradients

**Detection:**
```python
for name, param in model.named_parameters():
    if param.grad is not None:
        if param.grad.abs().max() > 100:
            print(f"Large gradient in {name}")
```

**Solutions:**
```python
# 1. Gradient clipping
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 2. Reduce learning rate
optimizer = optim.Adam(model.parameters(), lr=1e-4)

# 3. Use batch normalization
nn.BatchNorm1d(hidden_size)

# 4. Better weight initialization
torch.nn.init.xavier_uniform_(layer.weight)
```

---

## 🟢 Performance Issues

### 1. Slow Training

**Diagnosis:**
```python
import time

# Time forward pass
start = time.time()
output = model(data)
print(f"Forward pass: {time.time() - start:.4f}s")

# Time backward pass
start = time.time()
loss.backward()
print(f"Backward pass: {time.time() - start:.4f}s")

# Time data loading
start = time.time()
data, target = next(iter(loader))
print(f"Data loading: {time.time() - start:.4f}s")
```

**Solutions:**

**a) Data loading bottleneck**
```python
# Increase workers
loader = DataLoader(dataset, batch_size=32, num_workers=4, pin_memory=True)

# Prefetch data
loader = DataLoader(dataset, ..., prefetch_factor=2)
```

**b) CPU-GPU transfer**
```python
# Pin memory
loader = DataLoader(dataset, ..., pin_memory=True)

# Move data asynchronously
data = data.to(device, non_blocking=True)
```

**c) Inefficient operations**
```python
# Use vectorized operations
# Wrong
result = []
for i in range(len(x)):
    result.append(x[i] * 2)
result = torch.tensor(result)

# Right
result = x * 2
```

---

### 2. Memory Leaks

**Detection:**
```python
import torch
import gc

# Check memory
print(f"Allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
print(f"Cached: {torch.cuda.memory_reserved() / 1e9:.2f} GB")

# Monitor over time
for epoch in range(num_epochs):
    train(...)
    print(f"Memory: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
```

**Common Causes & Solutions:**

**a) Storing entire history**
```python
# Wrong - stores computation graph
losses = []
for data, target in loader:
    loss = criterion(output, target)
    losses.append(loss)  # Keeps graph!

# Right - detach from graph
losses.append(loss.item())
```

**b) Not deleting variables**
```python
# Delete large intermediate tensors
del intermediate_result
torch.cuda.empty_cache()

# Use context managers
with torch.no_grad():
    # Evaluation code
    pass
```

**c) Accumulating gradients unintentionally**
```python
# Always zero gradients
optimizer.zero_grad()
# or
model.zero_grad()
```

---

## 📊 Data Issues

### 1. Data Not Loading

**Checklist:**
```python
# 1. Check dataset size
print(f"Dataset size: {len(dataset)}")

# 2. Check single item
sample = dataset[0]
print(f"Sample: {sample}")

# 3. Check data types
print(f"Data type: {type(sample)}")

# 4. Check DataLoader
for batch_idx, (data, target) in enumerate(loader):
    print(f"Batch {batch_idx}: data shape {data.shape}")
    if batch_idx >= 2:
        break
```

---

### 2. Label Mismatch

**Detection:**
```python
# Check label range
print(f"Min label: {target.min()}")
print(f"Max label: {target.max()}")
print(f"Unique labels: {target.unique()}")

# Check with output classes
num_classes = 10
assert target.max() < num_classes, "Label exceeds number of classes!"
```

**Solutions:**
```python
# For CrossEntropyLoss, labels should be class indices
# Wrong
target = torch.tensor([0.0, 1.0, 0.0])  # One-hot

# Right
target = torch.tensor([1])  # Class index

# If you have one-hot, convert:
target = target.argmax(dim=1)
```

---

## 🎯 Model Issues

### 1. Model Not Learning

**Debugging Steps:**

**a) Check if loss is decreasing**
```python
losses = []
for epoch in range(num_epochs):
    # Training code
    losses.append(avg_loss)

import matplotlib.pyplot as plt
plt.plot(losses)
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.show()
```

**b) Verify gradients are flowing**
```python
for name, param in model.named_parameters():
    if param.grad is not None:
        print(f"{name}: grad norm = {param.grad.norm():.6f}")
    else:
        print(f"{name}: NO GRADIENT!")
```

**c) Check weight updates**
```python
# Save initial weights
initial_weights = {name: param.clone() 
                   for name, param in model.named_parameters()}

# Train for a few iterations

# Check if weights changed
for name, param in model.named_parameters():
    if torch.equal(param, initial_weights[name]):
        print(f"{name}: NOT UPDATED!")
```

**d) Test on small dataset**
```python
# Overfit on single batch
single_batch = next(iter(train_loader))
for epoch in range(100):
    loss = train_step(single_batch)
    if epoch % 10 == 0:
        print(f"Epoch {epoch}: Loss {loss:.4f}")

# Loss should go to ~0
```

**Common Fixes:**
```python
# 1. Learning rate too low
optimizer = optim.Adam(model.parameters(), lr=1e-3)  # Try higher

# 2. Wrong loss function
criterion = nn.CrossEntropyLoss()  # For classification

# 3. Forgot to set requires_grad
for param in model.parameters():
    param.requires_grad = True

# 4. Model in eval mode
model.train()  # Not model.eval()
```

---

### 2. Overfitting

**Detection:**
```python
train_loss, val_loss = [], []
for epoch in range(num_epochs):
    train_loss.append(train())
    val_loss.append(validate())

# If val_loss increases while train_loss decreases -> overfitting
```

**Solutions:**
```python
# 1. Add dropout
self.dropout = nn.Dropout(0.5)

# 2. L2 regularization
optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)

# 3. Data augmentation
transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
])

# 4. Early stopping
if val_loss > best_val_loss:
    patience_counter += 1
    if patience_counter >= patience:
        break
```

---

## 🔧 Debugging Tools

### 1. Print Debugging
```python
def debug_tensor(tensor, name="Tensor"):
    print(f"\n{name}:")
    print(f"  Shape: {tensor.shape}")
    print(f"  Dtype: {tensor.dtype}")
    print(f"  Device: {tensor.device}")
    print(f"  Min: {tensor.min():.4f}, Max: {tensor.max():.4f}")
    print(f"  Mean: {tensor.mean():.4f}, Std: {tensor.std():.4f}")
    print(f"  Has NaN: {torch.isnan(tensor).any()}")
    print(f"  Has Inf: {torch.isinf(tensor).any()}")
```

### 2. Hooks
```python
# Register hook to inspect gradients
def print_grad(name):
    def hook(grad):
        print(f"{name} gradient: {grad.norm():.6f}")
    return hook

for name, param in model.named_parameters():
    param.register_hook(print_grad(name))
```

### 3. Assertions
```python
# Add assertions during development
assert x.shape[0] == batch_size, f"Expected batch size {batch_size}, got {x.shape[0]}"
assert not torch.isnan(loss).any(), "NaN in loss!"
assert 0 <= target.max() < num_classes, "Invalid label!"
```

---

## ✅ Checklist Before Training

- [ ] Data loads correctly
- [ ] Data types are correct (float32 for inputs, long for labels)
- [ ] All tensors on same device
- [ ] Model architecture makes sense
- [ ] Loss function matches task
- [ ] Optimizer configured correctly
- [ ] Learning rate is reasonable
- [ ] Gradients are being computed
- [ ] Gradients are being zeroed
- [ ] Model is in training mode
- [ ] Random seed set for reproducibility

```python
# Complete setup check
def sanity_check(model, loader, criterion, optimizer, device):
    print("=== Sanity Check ===")
    
    # 1. Get one batch
    data, target = next(iter(loader))
    print(f"✓ Data shape: {data.shape}")
    print(f"✓ Target shape: {target.shape}")
    
    # 2. Move to device
    data, target = data.to(device), target.to(device)
    print(f"✓ Device: {device}")
    
    # 3. Forward pass
    output = model(data)
    print(f"✓ Output shape: {output.shape}")
    
    # 4. Compute loss
    loss = criterion(output, target)
    print(f"✓ Loss: {loss.item():.4f}")
    
    # 5. Backward pass
    optimizer.zero_grad()
    loss.backward()
    print(f"✓ Gradients computed")
    
    # 6. Check gradients
    for name, param in model.named_parameters():
        if param.grad is None:
            print(f"✗ No gradient for {name}")
        else:
            print(f"✓ {name}: grad norm = {param.grad.norm():.6f}")
    
    # 7. Update
    optimizer.step()
    print(f"✓ Optimizer step completed")
    
    print("===================")
```

---

**Remember:** Most bugs are simple mistakes in setup. Check the basics first!

