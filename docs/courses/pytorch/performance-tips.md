# Performance Optimization Tips

Strategies to speed up PyTorch training and inference.

## 🚀 Data Loading Optimization

### 1. Use Multiple Workers

```python
from torch.utils.data import DataLoader

# Slow - single worker
loader = DataLoader(dataset, batch_size=32, num_workers=0)

# Fast - multiple workers
loader = DataLoader(
    dataset, 
    batch_size=32, 
    num_workers=4,  # Use 4 CPU cores
    pin_memory=True,  # Speed up CPU->GPU transfer
    prefetch_factor=2  # Prefetch 2 batches per worker
)
```

**Finding optimal num_workers:**
```python
import time

for num_workers in [0, 2, 4, 8]:
    loader = DataLoader(dataset, batch_size=32, num_workers=num_workers)
    
    start = time.time()
    for i, (data, target) in enumerate(loader):
        if i >= 100:
            break
    
    print(f"num_workers={num_workers}: {time.time()-start:.2f}s")
```

### 2. Pin Memory

```python
# Enable pin_memory for faster data transfer to GPU
loader = DataLoader(dataset, batch_size=32, pin_memory=True)

# Use non_blocking transfer
for data, target in loader:
    data = data.to(device, non_blocking=True)
    target = target.to(device, non_blocking=True)
```

### 3. Data Prefetching

```python
class DataPrefetcher:
    def __init__(self, loader):
        self.loader = iter(loader)
        self.stream = torch.cuda.Stream()
        self.preload()

    def preload(self):
        try:
            self.next_input, self.next_target = next(self.loader)
        except StopIteration:
            self.next_input = None
            self.next_target = None
            return
        
        with torch.cuda.stream(self.stream):
            self.next_input = self.next_input.cuda(non_blocking=True)
            self.next_target = self.next_target.cuda(non_blocking=True)

    def next(self):
        torch.cuda.current_stream().wait_stream(self.stream)
        input = self.next_input
        target = self.next_target
        self.preload()
        return input, target

# Usage
prefetcher = DataPrefetcher(train_loader)
data, target = prefetcher.next()
while data is not None:
    # Training code
    data, target = prefetcher.next()
```

---

## ⚡ GPU Optimization

### 1. Mixed Precision Training

```python
from torch.cuda.amp import autocast, GradScaler

# Initialize scaler
scaler = GradScaler()

for data, target in train_loader:
    optimizer.zero_grad()
    
    # Automatic mixed precision
    with autocast():
        output = model(data)
        loss = criterion(output, target)
    
    # Scaled backward pass
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

**Benefits:**
- 2-3x faster training
- 50% less memory usage
- Minimal accuracy loss

### 2. Gradient Accumulation

```python
accumulation_steps = 4  # Simulate larger batch size

optimizer.zero_grad()
for i, (data, target) in enumerate(train_loader):
    output = model(data)
    loss = criterion(output, target)
    
    # Normalize loss
    loss = loss / accumulation_steps
    loss.backward()
    
    # Update every N steps
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### 3. Gradient Checkpointing

```python
from torch.utils.checkpoint import checkpoint

class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(1000, 1000)
        self.layer2 = nn.Linear(1000, 1000)
        self.layer3 = nn.Linear(1000, 10)
    
    def forward(self, x):
        # Use checkpointing for memory-intensive layers
        x = checkpoint(self.layer1, x)
        x = checkpoint(self.layer2, x)
        x = self.layer3(x)
        return x
```

**Trade-off:** Saves memory but increases computation time

### 4. Set Benchmark Mode

```python
# Enable cudnn autotuner (if input sizes are constant)
torch.backends.cudnn.benchmark = True

# For reproducibility (slower)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False
```

---

## 💾 Memory Optimization

### 1. Delete Intermediate Variables

```python
# Bad - keeps intermediate tensors
def forward(self, x):
    h1 = self.layer1(x)
    h2 = self.layer2(h1)
    out = self.layer3(h2)
    return out

# Good - delete when not needed
def forward(self, x):
    x = self.layer1(x)
    x = self.layer2(x)
    x = self.layer3(x)
    return x
```

### 2. Use In-Place Operations

```python
# Creates new tensor
x = x + 1
x = torch.relu(x)

# In-place (saves memory)
x.add_(1)
x = F.relu(x, inplace=True)

# In nn.Module
self.relu = nn.ReLU(inplace=True)
```

### 3. Empty Cache

```python
# Free unused cached memory
torch.cuda.empty_cache()

# Monitor memory usage
print(f"Allocated: {torch.cuda.memory_allocated()/1e9:.2f} GB")
print(f"Reserved: {torch.cuda.memory_reserved()/1e9:.2f} GB")
```

### 4. Use torch.no_grad()

```python
# During inference
model.eval()
with torch.no_grad():
    for data, target in test_loader:
        output = model(data)
        # No gradients stored
```

### 5. Reduce Precision

```python
# Use float16 instead of float32
model = model.half()
data = data.half()

# Or use bfloat16 (better range than float16)
model = model.to(torch.bfloat16)
```

---

## 🔄 Model Optimization

### 1. Use Efficient Layers

```python
# Slow
class SlowModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = []
        for i in range(10):
            self.layers.append(nn.Linear(100, 100))
    
    def forward(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

# Fast
class FastModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(*[
            nn.Linear(100, 100) for _ in range(10)
        ])
    
    def forward(self, x):
        return self.layers(x)
```

### 2. Fuse Operations

```python
# Fuse BatchNorm into Conv for inference
def fuse_conv_bn(conv, bn):
    # Get conv weights
    w = conv.weight
    
    # Get bn parameters
    mean = bn.running_mean
    var = bn.running_var
    gamma = bn.weight
    beta = bn.bias
    eps = bn.eps
    
    # Fuse
    std = torch.sqrt(var + eps)
    w_fused = (gamma / std).view(-1, 1, 1, 1) * w
    b_fused = beta - gamma * mean / std
    
    # Update conv
    conv.weight.data = w_fused
    conv.bias = nn.Parameter(b_fused)
    
    return conv
```

### 3. Use TorchScript

```python
import torch

# Define model
class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 5)
    
    def forward(self, x):
        return self.fc(x)

model = MyModel()

# Convert to TorchScript
scripted_model = torch.jit.script(model)

# Or use tracing
example_input = torch.randn(1, 10)
traced_model = torch.jit.trace(model, example_input)

# Save
torch.jit.save(scripted_model, 'model_scripted.pt')

# Load and use
loaded = torch.jit.load('model_scripted.pt')
output = loaded(example_input)
```

**Benefits:**
- Faster inference (10-30% speedup)
- Can run without Python
- Optimization passes

---

## 📊 Batch Size Optimization

### Finding Optimal Batch Size

```python
def find_optimal_batch_size(model, input_shape, max_batch_size=1024):
    device = next(model.parameters()).device
    batch_size = 2
    
    while batch_size <= max_batch_size:
        try:
            # Create dummy input
            dummy_input = torch.randn(batch_size, *input_shape).to(device)
            
            # Forward pass
            output = model(dummy_input)
            
            # Backward pass
            loss = output.sum()
            loss.backward()
            
            # Clear memory
            del dummy_input, output, loss
            torch.cuda.empty_cache()
            
            print(f"Batch size {batch_size}: OK")
            batch_size *= 2
            
        except RuntimeError as e:
            if "out of memory" in str(e):
                print(f"Max batch size: {batch_size // 2}")
                break
            else:
                raise e
    
    return batch_size // 2

# Usage
optimal_bs = find_optimal_batch_size(model, input_shape=(3, 224, 224))
```

---

## 🎯 Training Loop Optimization

### 1. Vectorize Operations

```python
# Slow - loop
predictions = []
for i in range(batch_size):
    pred = model(data[i:i+1])
    predictions.append(pred)
predictions = torch.cat(predictions)

# Fast - batch processing
predictions = model(data)
```

### 2. Avoid CPU-GPU Transfers

```python
# Bad - transfer each iteration
for epoch in range(num_epochs):
    for data, target in train_loader:
        data = data.to(device)  # Slow transfer
        target = target.to(device)

# Good - create data on GPU
# Use pin_memory and non_blocking
loader = DataLoader(dataset, pin_memory=True)
for data, target in loader:
    data = data.to(device, non_blocking=True)
```

### 3. Optimize Loss Calculation

```python
# Slow - compute loss for each sample
losses = []
for i in range(batch_size):
    loss = criterion(output[i], target[i])
    losses.append(loss)
total_loss = sum(losses)

# Fast - vectorized
total_loss = criterion(output, target)
```

---

## 📈 Profiling

### 1. PyTorch Profiler

```python
from torch.profiler import profile, ProfilerActivity

with profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) as prof:
    for data, target in train_loader:
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        
        if i >= 10:  # Profile first 10 batches
            break

# Print results
print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))

# Export Chrome trace
prof.export_chrome_trace("trace.json")
```

### 2. Simple Timing

```python
import time

# Time individual operations
start = time.time()
output = model(data)
print(f"Forward: {time.time() - start:.4f}s")

start = time.time()
loss.backward()
print(f"Backward: {time.time() - start:.4f}s")

# Time with CUDA synchronization
start = time.time()
output = model(data)
torch.cuda.synchronize()
print(f"Forward (sync): {time.time() - start:.4f}s")
```

### 3. Memory Profiling

```python
# Track memory usage
torch.cuda.reset_peak_memory_stats()

# Training code
output = model(data)
loss = criterion(output, target)
loss.backward()

# Check peak memory
peak_memory = torch.cuda.max_memory_allocated() / 1e9
print(f"Peak memory: {peak_memory:.2f} GB")
```

---

## 🔧 Compiler Optimizations

### 1. torch.compile (PyTorch 2.0+)

```python
# Compile model for faster execution
model = torch.compile(model)

# Or with specific backend
model = torch.compile(model, backend="inductor")

# Full options
model = torch.compile(
    model,
    mode="max-autotune",  # or "reduce-overhead", "default"
    fullgraph=True,
    dynamic=False
)
```

**Expected speedup:** 30-200% depending on model

---

## 📝 Best Practices Checklist

### Before Training
- [ ] Use DataLoader with multiple workers
- [ ] Enable pin_memory for GPU training
- [ ] Set cudnn.benchmark = True (if input size is constant)
- [ ] Use appropriate batch size
- [ ] Consider mixed precision training

### During Training
- [ ] Use torch.no_grad() for validation
- [ ] Avoid unnecessary CPU-GPU transfers
- [ ] Delete large intermediate variables
- [ ] Use in-place operations where safe
- [ ] Profile your code to find bottlenecks

### Model Design
- [ ] Use efficient architectures
- [ ] Fuse operations for inference
- [ ] Consider using TorchScript
- [ ] Use appropriate precision (float16/bfloat16)
- [ ] Implement gradient checkpointing for large models

---

## 🎯 Quick Wins

Apply these for immediate speedup:

```python
# 1. DataLoader optimization
train_loader = DataLoader(
    dataset,
    batch_size=32,
    num_workers=4,
    pin_memory=True,
    persistent_workers=True  # Keep workers alive
)

# 2. Mixed precision
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()

# 3. cudnn benchmark
torch.backends.cudnn.benchmark = True

# 4. Compile (PyTorch 2.0+)
model = torch.compile(model)

# 5. Efficient evaluation
@torch.no_grad()
def evaluate(model, loader):
    model.eval()
    # evaluation code
    model.train()
```

---

**Benchmark your changes!** Always measure performance before and after optimization.

