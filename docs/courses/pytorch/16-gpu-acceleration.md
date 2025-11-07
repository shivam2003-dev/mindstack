# Chapter 16: GPU Acceleration & Distributed Training

Learn how to leverage GPUs and multiple devices for faster training.

## GPU Basics

### Moving to GPU

```python
import torch

# Check CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA version: {torch.version.cuda}")
print(f"Number of GPUs: {torch.cuda.device_count()}")

# Get GPU name
if torch.cuda.is_available():
    print(f"GPU name: {torch.cuda.get_device_name(0)}")

# Device selection
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

# Move tensor to GPU
tensor_cpu = torch.randn(3, 3)
tensor_gpu = tensor_cpu.to(device)
# or
tensor_gpu = tensor_cpu.cuda()

# Move back to CPU
tensor_cpu = tensor_gpu.cpu()

# Check tensor device
print(f"Tensor on: {tensor_gpu.device}")
```

### Model on GPU

```python
import torch.nn as nn

# Create model
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10)
)

# Move to GPU
model = model.to(device)

# Or specify device in constructor (PyTorch 2.0+)
model = nn.Linear(784, 10, device='cuda')

# Check model device
print(f"Model on: {next(model.parameters()).device}")
```

### Complete Training Loop with GPU

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model
model = MyModel().to(device)
criterion = nn.CrossEntropyLoss().to(device)
optimizer = optim.Adam(model.parameters())

# Training
for epoch in range(num_epochs):
    for data, target in train_loader:
        # Move data to GPU
        data = data.to(device)
        target = target.to(device)
        
        optimizer.zero_grad()
        
        output = model(data)
        loss = criterion(output, target)
        
        loss.backward()
        optimizer.step()
```

## Memory Management

### Monitor GPU Memory

```python
import torch

# Get memory info
print(f"Allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
print(f"Cached: {torch.cuda.memory_reserved() / 1e9:.2f} GB")

# Memory summary
print(torch.cuda.memory_summary())

# Clear cache
torch.cuda.empty_cache()
```

### Memory-Efficient Training

```python
import torch.utils.checkpoint as checkpoint

class MemoryEfficientModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Sequential(...)
        self.layer2 = nn.Sequential(...)
        self.layer3 = nn.Sequential(...)
    
    def forward(self, x):
        # Use gradient checkpointing
        x = checkpoint.checkpoint(self.layer1, x, use_reentrant=False)
        x = checkpoint.checkpoint(self.layer2, x, use_reentrant=False)
        x = self.layer3(x)
        return x
```

### Gradient Accumulation

```python
def train_with_gradient_accumulation(
    model, dataloader, criterion, optimizer,
    accumulation_steps=4, device='cuda'
):
    """Train with gradient accumulation for larger effective batch size"""
    
    model.train()
    optimizer.zero_grad()
    
    for i, (data, target) in enumerate(dataloader):
        data, target = data.to(device), target.to(device)
        
        output = model(data)
        loss = criterion(output, target)
        
        # Normalize loss
        loss = loss / accumulation_steps
        loss.backward()
        
        # Update weights every accumulation_steps
        if (i + 1) % accumulation_steps == 0:
            optimizer.step()
            optimizer.zero_grad()
    
    # Update remaining
    if (i + 1) % accumulation_steps != 0:
        optimizer.step()
        optimizer.zero_grad()
```

## Multi-GPU Training

### DataParallel (Simple but Limited)

```python
import torch
import torch.nn as nn

# Create model
model = MyModel()

# Wrap with DataParallel
if torch.cuda.device_count() > 1:
    print(f"Using {torch.cuda.device_count()} GPUs")
    model = nn.DataParallel(model)

model = model.to('cuda')

# Training works the same
for data, target in dataloader:
    data, target = data.to('cuda'), target.to('cuda')
    
    output = model(data)
    loss = criterion(output, target)
    
    loss.backward()
    optimizer.step()

# Save model (unwrap DataParallel)
if isinstance(model, nn.DataParallel):
    torch.save(model.module.state_dict(), 'model.pth')
else:
    torch.save(model.state_dict(), 'model.pth')
```

### DistributedDataParallel (Recommended)

```python
import torch
import torch.distributed as dist
import torch.multiprocessing as mp
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data.distributed import DistributedSampler

def setup(rank, world_size):
    """Initialize distributed training"""
    os.environ['MASTER_ADDR'] = 'localhost'
    os.environ['MASTER_PORT'] = '12355'
    
    # Initialize process group
    dist.init_process_group("nccl", rank=rank, world_size=world_size)

def cleanup():
    """Clean up distributed training"""
    dist.destroy_process_group()

def train_ddp(rank, world_size):
    """Training function for each process"""
    
    # Setup
    setup(rank, world_size)
    
    # Create model and move to GPU
    model = MyModel().to(rank)
    
    # Wrap with DDP
    model = DDP(model, device_ids=[rank])
    
    # Create dataset with DistributedSampler
    train_dataset = MyDataset()
    train_sampler = DistributedSampler(
        train_dataset,
        num_replicas=world_size,
        rank=rank,
        shuffle=True
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=32,
        sampler=train_sampler,
        num_workers=4,
        pin_memory=True
    )
    
    # Optimizer
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()
    
    # Training loop
    for epoch in range(num_epochs):
        # Set epoch for sampler
        train_sampler.set_epoch(epoch)
        
        model.train()
        for data, target in train_loader:
            data, target = data.to(rank), target.to(rank)
            
            optimizer.zero_grad()
            
            output = model(data)
            loss = criterion(output, target)
            
            loss.backward()
            optimizer.step()
        
        # Save checkpoint (only on rank 0)
        if rank == 0:
            torch.save(model.module.state_dict(), f'checkpoint_epoch_{epoch}.pth')
    
    cleanup()

def main():
    """Launch distributed training"""
    world_size = torch.cuda.device_count()
    
    mp.spawn(
        train_ddp,
        args=(world_size,),
        nprocs=world_size,
        join=True
    )

if __name__ == '__main__':
    main()
```

### Launch Script for DDP

```bash
# Single node, multiple GPUs
python -m torch.distributed.launch \
    --nproc_per_node=4 \
    train.py

# Multiple nodes (run on each node)
python -m torch.distributed.launch \
    --nproc_per_node=4 \
    --nnodes=2 \
    --node_rank=0 \
    --master_addr="192.168.1.1" \
    --master_port=1234 \
    train.py
```

## Mixed Precision Training

### Automatic Mixed Precision (AMP)

```python
import torch
from torch.cuda.amp import autocast, GradScaler

# Create GradScaler
scaler = GradScaler()

# Training loop
for epoch in range(num_epochs):
    for data, target in train_loader:
        data, target = data.to(device), target.to(device)
        
        optimizer.zero_grad()
        
        # Forward pass with autocast
        with autocast():
            output = model(data)
            loss = criterion(output, target)
        
        # Backward pass with scaled gradients
        scaler.scale(loss).backward()
        
        # Unscale and clip gradients
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # Optimizer step with scaler
        scaler.step(optimizer)
        scaler.update()

# Benefits: 2-3x speedup, 50% less memory
```

### Complete AMP Training Function

```python
def train_with_amp(model, train_loader, criterion, optimizer, device):
    """Training with Automatic Mixed Precision"""
    
    model.train()
    scaler = GradScaler()
    
    total_loss = 0
    correct = 0
    total = 0
    
    for data, target in train_loader:
        data, target = data.to(device), target.to(device)
        
        optimizer.zero_grad()
        
        # Mixed precision forward
        with autocast():
            output = model(data)
            loss = criterion(output, target)
        
        # Scaled backward
        scaler.scale(loss).backward()
        
        # Gradient clipping
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        
        # Optimizer step
        scaler.step(optimizer)
        scaler.update()
        
        # Metrics
        total_loss += loss.item()
        _, predicted = output.max(1)
        total += target.size(0)
        correct += predicted.eq(target).sum().item()
    
    avg_loss = total_loss / len(train_loader)
    accuracy = 100. * correct / total
    
    return avg_loss, accuracy
```

## Performance Optimization

### Efficient Data Loading

```python
# Optimized DataLoader
train_loader = DataLoader(
    dataset,
    batch_size=256,
    shuffle=True,
    num_workers=4,          # Parallel data loading
    pin_memory=True,        # Faster GPU transfer
    persistent_workers=True, # Keep workers alive
    prefetch_factor=2       # Prefetch batches
)

# Set number of threads
torch.set_num_threads(8)

# Enable cudnn benchmark (for fixed input sizes)
torch.backends.cudnn.benchmark = True
```

### Profiling

```python
import torch
from torch.profiler import profile, ProfilerActivity, record_function

# Profile code
with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    record_shapes=True,
    profile_memory=True,
    with_stack=True
) as prof:
    with record_function("model_training"):
        for _ in range(10):
            data = torch.randn(32, 3, 224, 224).cuda()
            output = model(data)
            loss = output.sum()
            loss.backward()

# Print results
print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))

# Export to Chrome trace
prof.export_chrome_trace("trace.json")
```

## Device-Agnostic Code

### Best Practices

```python
class DeviceAgnosticModel:
    """Model that works on any device"""
    
    def __init__(self, model_class, device=None):
        self.device = device or torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu'
        )
        self.model = model_class().to(self.device)
    
    def train_epoch(self, dataloader, criterion, optimizer):
        """Device-agnostic training"""
        self.model.train()
        
        for data, target in dataloader:
            # Automatic device transfer
            data = data.to(self.device, non_blocking=True)
            target = target.to(self.device, non_blocking=True)
            
            optimizer.zero_grad()
            
            output = self.model(data)
            loss = criterion(output, target)
            
            loss.backward()
            optimizer.step()
    
    def predict(self, data):
        """Device-agnostic prediction"""
        self.model.eval()
        
        with torch.no_grad():
            data = data.to(self.device)
            output = self.model(data)
        
        return output.cpu()  # Return on CPU
```

## Benchmarking

### Compare Training Speeds

```python
import time
import torch

def benchmark_training(model, dataloader, device, num_iterations=100):
    """Benchmark training speed"""
    
    model = model.to(device)
    model.train()
    
    optimizer = torch.optim.Adam(model.parameters())
    criterion = nn.CrossEntropyLoss()
    
    # Warmup
    for i, (data, target) in enumerate(dataloader):
        if i >= 10:
            break
        data, target = data.to(device), target.to(device)
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
    
    # Benchmark
    torch.cuda.synchronize()
    start = time.time()
    
    for i, (data, target) in enumerate(dataloader):
        if i >= num_iterations:
            break
        
        data, target = data.to(device), target.to(device)
        
        output = model(data)
        loss = criterion(output, target)
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    torch.cuda.synchronize()
    end = time.time()
    
    elapsed = end - start
    throughput = num_iterations / elapsed
    
    print(f"Device: {device}")
    print(f"Time: {elapsed:.2f}s")
    print(f"Throughput: {throughput:.2f} iter/s")
    
    return throughput

# Compare CPU vs GPU
cpu_speed = benchmark_training(model, dataloader, 'cpu')
gpu_speed = benchmark_training(model, dataloader, 'cuda')

print(f"Speedup: {gpu_speed / cpu_speed:.2f}x")
```

## Multi-Node Training

### SLURM Script for Cluster

```bash
#!/bin/bash
#SBATCH --job-name=pytorch_ddp
#SBATCH --nodes=4
#SBATCH --ntasks-per-node=4
#SBATCH --cpus-per-task=8
#SBATCH --gres=gpu:4
#SBATCH --time=24:00:00

# Load modules
module load cuda/11.7
module load python/3.9

# Activate environment
source venv/bin/activate

# Run training
srun python train.py \
    --distributed \
    --world-size=$SLURM_NTASKS \
    --rank=$SLURM_PROCID
```

## Next Steps

Continue to [Chapter 17: Mixed Precision & Optimization](17-mixed-precision.md) to learn:
- Advanced AMP techniques
- Performance tuning
- Memory optimization strategies

## Key Takeaways

- ✅ Use `.to(device)` for device-agnostic code
- ✅ DistributedDataParallel > DataParallel
- ✅ Mixed precision training saves memory and time
- ✅ Use `pin_memory=True` and `num_workers>0`
- ✅ Enable `cudnn.benchmark` for fixed input sizes
- ✅ Profile code to find bottlenecks
- ✅ Gradient accumulation simulates larger batches
- ✅ Always clear GPU cache between experiments

---

**Reference:**
- [CUDA Semantics](https://pytorch.org/docs/stable/notes/cuda.html)
- [Distributed Training](https://pytorch.org/tutorials/intermediate/ddp_tutorial.html)
- [AMP Documentation](https://pytorch.org/docs/stable/amp.html)
