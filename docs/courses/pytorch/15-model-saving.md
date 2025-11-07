# Chapter 15: Model Saving & Loading

Proper model saving and loading is crucial for resuming training, deployment, and sharing models.

## Save/Load Entire Model (Not Recommended)

```python
import torch

# Save
torch.save(model, 'model_complete.pth')

# Load
model = torch.load('model_complete.pth')
model.eval()
```

**Problems:**
- ❌ Tied to specific Python class structure
- ❌ Can break with code changes
- ❌ Larger file size
- ❌ Not portable

## Save/Load State Dict (Recommended)

### Basic Usage

```python
import torch

# Save only the state dict (weights and biases)
torch.save(model.state_dict(), 'model_weights.pth')

# Load
model = MyModel()  # Must create model instance first
model.load_state_dict(torch.load('model_weights.pth'))
model.eval()
```

**Advantages:**
- ✅ Flexible and portable
- ✅ Smaller file size
- ✅ Can modify architecture slightly
- ✅ Industry standard

### Complete Example

```python
import torch
import torch.nn as nn

# Define model
class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 10)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

# Train model
model = MyModel()
# ... training code ...

# Save
torch.save(model.state_dict(), 'mnist_model.pth')
print("✓ Model saved")

# Load in different script
model = MyModel()
model.load_state_dict(torch.load('mnist_model.pth'))
model.eval()
print("✓ Model loaded")

# Use for inference
with torch.no_grad():
    predictions = model(test_data)
```

## Saving Training Checkpoints

### Complete Checkpoint

```python
import torch

def save_checkpoint(model, optimizer, epoch, loss, filepath):
    """Save complete training state"""
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'loss': loss,
    }
    torch.save(checkpoint, filepath)
    print(f"✓ Checkpoint saved: {filepath}")

def load_checkpoint(model, optimizer, filepath):
    """Load training state"""
    checkpoint = torch.load(filepath)
    
    model.load_state_dict(checkpoint['model_state_dict'])
    optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    epoch = checkpoint['epoch']
    loss = checkpoint['loss']
    
    print(f"✓ Resumed from epoch {epoch}")
    return epoch, loss

# Usage during training
for epoch in range(start_epoch, num_epochs):
    # Training code
    train_loss = train_one_epoch(...)
    
    # Save checkpoint
    if (epoch + 1) % 10 == 0:
        save_checkpoint(
            model, optimizer, epoch, train_loss,
            f'checkpoint_epoch_{epoch+1}.pth'
        )

# Resume training
model = MyModel()
optimizer = optim.Adam(model.parameters())

start_epoch, loss = load_checkpoint(model, optimizer, 'checkpoint_epoch_50.pth')

# Continue training
for epoch in range(start_epoch + 1, num_epochs):
    # ...
```

### Advanced Checkpoint with Scheduler

```python
import torch

class CheckpointManager:
    """Manage model checkpoints"""
    
    def __init__(self, save_dir='checkpoints', keep_last_n=5):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
        self.keep_last_n = keep_last_n
        self.checkpoints = []
    
    def save(self, model, optimizer, scheduler, epoch, metrics):
        """Save checkpoint with all training state"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
            'metrics': metrics,
            'timestamp': time.time()
        }
        
        filepath = self.save_dir / f'checkpoint_epoch_{epoch}.pth'
        torch.save(checkpoint, filepath)
        
        self.checkpoints.append(filepath)
        self._cleanup_old_checkpoints()
        
        print(f"✓ Saved checkpoint: {filepath}")
    
    def save_best(self, model, optimizer, scheduler, epoch, metrics, metric_name='val_loss'):
        """Save best model based on metric"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
            'metrics': metrics,
        }
        
        filepath = self.save_dir / 'best_model.pth'
        torch.save(checkpoint, filepath)
        print(f"✓ New best model saved: {metric_name}={metrics[metric_name]:.4f}")
    
    def load(self, model, optimizer=None, scheduler=None, filepath=None):
        """Load checkpoint"""
        if filepath is None:
            filepath = self.save_dir / 'best_model.pth'
        
        checkpoint = torch.load(filepath)
        
        model.load_state_dict(checkpoint['model_state_dict'])
        
        if optimizer and 'optimizer_state_dict' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        
        if scheduler and checkpoint.get('scheduler_state_dict'):
            scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        
        epoch = checkpoint.get('epoch', 0)
        metrics = checkpoint.get('metrics', {})
        
        print(f"✓ Loaded checkpoint from epoch {epoch}")
        return epoch, metrics
    
    def _cleanup_old_checkpoints(self):
        """Keep only last N checkpoints"""
        if len(self.checkpoints) > self.keep_last_n:
            old_checkpoint = self.checkpoints.pop(0)
            if old_checkpoint.exists():
                old_checkpoint.unlink()

# Usage
from pathlib import Path

checkpoint_manager = CheckpointManager(save_dir='checkpoints', keep_last_n=3)

best_val_loss = float('inf')

for epoch in range(num_epochs):
    # Training
    train_loss = train_one_epoch(...)
    val_loss = validate(...)
    
    metrics = {
        'train_loss': train_loss,
        'val_loss': val_loss
    }
    
    # Regular checkpoint
    checkpoint_manager.save(model, optimizer, scheduler, epoch, metrics)
    
    # Save best model
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        checkpoint_manager.save_best(model, optimizer, scheduler, epoch, metrics)
```

## Saving for Inference Only

### Minimal Save

```python
import torch

# Save only what's needed for inference
torch.save({
    'model_state_dict': model.state_dict(),
    'classes': class_names,
    'input_size': (224, 224),
}, 'model_inference.pth')

# Load for inference
checkpoint = torch.load('model_inference.pth')
model = MyModel(num_classes=len(checkpoint['classes']))
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

# Use
with torch.no_grad():
    output = model(input_tensor)
```

## Device Compatibility

### Save on GPU, Load on CPU

```python
# Save on GPU
model_gpu = model.cuda()
torch.save(model_gpu.state_dict(), 'model.pth')

# Load on CPU
model_cpu = MyModel()
model_cpu.load_state_dict(
    torch.load('model.pth', map_location=torch.device('cpu'))
)
```

### Save on CPU, Load on GPU

```python
# Save on CPU
torch.save(model.state_dict(), 'model.pth')

# Load on GPU
model = MyModel()
model.load_state_dict(torch.load('model.pth'))
model = model.cuda()
```

### Generic Device-Agnostic Loading

```python
def load_model(model_class, checkpoint_path, device=None):
    """Load model to specified device"""
    if device is None:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Create model
    model = model_class()
    
    # Load state dict
    state_dict = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(state_dict)
    
    # Move to device
    model = model.to(device)
    model.eval()
    
    return model

# Usage
model = load_model(MyModel, 'model.pth', device='cuda:0')
```

## Partial Loading

### Load Subset of Weights

```python
# Pretrained state dict
pretrained_dict = torch.load('pretrained_model.pth')

# Model state dict
model_dict = model.state_dict()

# Filter out layers that don't match
pretrained_dict = {k: v for k, v in pretrained_dict.items() 
                   if k in model_dict and v.shape == model_dict[k].shape}

# Update model dict
model_dict.update(pretrained_dict)

# Load updated dict
model.load_state_dict(model_dict)
```

### Load with Strict=False

```python
# Load weights, ignore mismatches
model.load_state_dict(torch.load('model.pth'), strict=False)
```

## Model Versioning

### Version Control

```python
import torch
from datetime import datetime

class VersionedModel:
    """Model with version tracking"""
    
    VERSION = '1.0.0'
    
    @staticmethod
    def save(model, filepath, metadata=None):
        """Save model with version info"""
        checkpoint = {
            'version': VersionedModel.VERSION,
            'timestamp': datetime.now().isoformat(),
            'model_state_dict': model.state_dict(),
            'architecture': model.__class__.__name__,
            'metadata': metadata or {}
        }
        
        torch.save(checkpoint, filepath)
        print(f"✓ Saved model version {VersionedModel.VERSION}")
    
    @staticmethod
    def load(model, filepath):
        """Load and verify model version"""
        checkpoint = torch.load(filepath)
        
        # Check version compatibility
        saved_version = checkpoint.get('version', '0.0.0')
        if saved_version != VersionedModel.VERSION:
            print(f"⚠ Version mismatch: saved={saved_version}, current={VersionedModel.VERSION}")
        
        # Check architecture
        saved_arch = checkpoint.get('architecture')
        if saved_arch != model.__class__.__name__:
            print(f"⚠ Architecture mismatch: saved={saved_arch}, current={model.__class__.__name__}")
        
        # Load weights
        model.load_state_dict(checkpoint['model_state_dict'])
        
        print(f"✓ Loaded model version {saved_version}")
        print(f"  Saved: {checkpoint.get('timestamp')}")
        
        return checkpoint.get('metadata', {})

# Usage
metadata = {
    'dataset': 'CIFAR-10',
    'accuracy': 0.95,
    'training_epochs': 100
}

VersionedModel.save(model, 'model_v1.pth', metadata)
metadata = VersionedModel.load(model, 'model_v1.pth')
```

## Export for Production

### TorchScript

```python
import torch

# Method 1: Tracing
model.eval()
example_input = torch.randn(1, 3, 224, 224)
traced_model = torch.jit.trace(model, example_input)

# Save
traced_model.save('model_traced.pt')

# Load (no Python needed!)
loaded = torch.jit.load('model_traced.pt')
output = loaded(example_input)

# Method 2: Scripting (for control flow)
scripted_model = torch.jit.script(model)
scripted_model.save('model_scripted.pt')
```

### ONNX Export

```python
import torch
import torch.onnx

model.eval()

# Dummy input
dummy_input = torch.randn(1, 3, 224, 224)

# Export
torch.onnx.export(
    model,
    dummy_input,
    'model.onnx',
    export_params=True,
    opset_version=11,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print("✓ Exported to ONNX")

# Verify
import onnx
onnx_model = onnx.load('model.onnx')
onnx.checker.check_model(onnx_model)
print("✓ ONNX model is valid")
```

## Model Compression

### Quantization

```python
import torch

# Dynamic quantization
model_fp32 = MyModel()
model_fp32.load_state_dict(torch.load('model.pth'))

model_int8 = torch.quantization.quantize_dynamic(
    model_fp32,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# Save quantized model
torch.save(model_int8.state_dict(), 'model_quantized.pth')

# Check size reduction
import os
size_fp32 = os.path.getsize('model.pth') / 1e6
size_int8 = os.path.getsize('model_quantized.pth') / 1e6
print(f"FP32: {size_fp32:.2f} MB")
print(f"INT8: {size_int8:.2f} MB")
print(f"Reduction: {(1 - size_int8/size_fp32)*100:.1f}%")
```

### Pruning

```python
import torch
import torch.nn.utils.prune as prune

# Prune 30% of weights
module = model.fc1
prune.l1_unstructured(module, name='weight', amount=0.3)

# Make pruning permanent
prune.remove(module, 'weight')

# Save pruned model
torch.save(model.state_dict(), 'model_pruned.pth')
```

## Best Practices

### Complete Save/Load Template

```python
import torch
from pathlib import Path
from datetime import datetime

class ModelManager:
    """Complete model management"""
    
    def __init__(self, save_dir='models'):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
    
    def save_checkpoint(self, model, optimizer, scheduler, epoch, metrics, name='checkpoint'):
        """Save training checkpoint"""
        filepath = self.save_dir / f'{name}_epoch_{epoch}.pth'
        
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
            'metrics': metrics,
            'timestamp': datetime.now().isoformat()
        }
        
        torch.save(checkpoint, filepath)
        return filepath
    
    def save_best(self, model, metrics, name='best_model'):
        """Save best model for inference"""
        filepath = self.save_dir / f'{name}.pth'
        
        checkpoint = {
            'model_state_dict': model.state_dict(),
            'metrics': metrics,
            'timestamp': datetime.now().isoformat()
        }
        
        torch.save(checkpoint, filepath)
        return filepath
    
    def load_checkpoint(self, model, optimizer=None, scheduler=None, checkpoint_path=None):
        """Load training checkpoint"""
        if checkpoint_path is None:
            # Find latest checkpoint
            checkpoints = list(self.save_dir.glob('checkpoint_*.pth'))
            if not checkpoints:
                raise FileNotFoundError("No checkpoints found")
            checkpoint_path = max(checkpoints, key=lambda p: p.stat().st_mtime)
        
        checkpoint = torch.load(checkpoint_path)
        
        model.load_state_dict(checkpoint['model_state_dict'])
        
        if optimizer:
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        
        if scheduler and checkpoint.get('scheduler_state_dict'):
            scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        
        return checkpoint['epoch'], checkpoint['metrics']
    
    def load_best(self, model, name='best_model'):
        """Load best model"""
        filepath = self.save_dir / f'{name}.pth'
        checkpoint = torch.load(filepath)
        model.load_state_dict(checkpoint['model_state_dict'])
        return checkpoint['metrics']

# Usage
manager = ModelManager(save_dir='models')

# During training
for epoch in range(num_epochs):
    # Train
    metrics = train_and_validate(...)
    
    # Save checkpoint
    manager.save_checkpoint(model, optimizer, scheduler, epoch, metrics)
    
    # Save if best
    if metrics['val_acc'] > best_acc:
        best_acc = metrics['val_acc']
        manager.save_best(model, metrics)

# Resume training
epoch, metrics = manager.load_checkpoint(model, optimizer, scheduler)

# Load for inference
metrics = manager.load_best(model)
model.eval()
```

## Next Steps

Continue to [Chapter 20: Best Practices](20-best-practices.md) for:
- Project organization
- Code quality
- Debugging tips
- Production deployment

## Key Takeaways

- ✅ Save `state_dict()`, not entire model
- ✅ Include all training state in checkpoints
- ✅ Use `map_location` for device compatibility
- ✅ Version your models
- ✅ Export to TorchScript/ONNX for production
- ✅ Implement checkpoint management early
- ✅ Save best model separately from checkpoints

---

**Reference:**
- [Saving and Loading Models](https://pytorch.org/tutorials/beginner/saving_loading_models.html)
- [TorchScript Documentation](https://pytorch.org/docs/stable/jit.html)
