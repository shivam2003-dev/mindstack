# Chapter 18: Debugging & Visualization

Master debugging techniques and visualization tools for PyTorch models.

## Common Errors & Solutions

### 1. Shape Mismatches

```python
# ❌ Error: RuntimeError: size mismatch
x = torch.randn(32, 784)
linear = nn.Linear(512, 10)  # Expects 512 features!
output = linear(x)  # Error!

# ✅ Solution: Check shapes
print(f"Input shape: {x.shape}")
print(f"Expected features: {linear.in_features}")

# Fix
linear = nn.Linear(784, 10)
output = linear(x)  # Works!
```

### 2. CUDA Out of Memory

```python
# ❌ Error: CUDA out of memory

# ✅ Solutions:

# 1. Reduce batch size
train_loader = DataLoader(dataset, batch_size=16)  # Was 128

# 2. Use gradient accumulation
accumulation_steps = 8
for i, (data, target) in enumerate(train_loader):
    output = model(data)
    loss = criterion(output, target) / accumulation_steps
    loss.backward()
    
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()

# 3. Clear cache
torch.cuda.empty_cache()

# 4. Use gradient checkpointing
from torch.utils.checkpoint import checkpoint
x = checkpoint(expensive_layer, x)

# 5. Use mixed precision
from torch.cuda.amp import autocast
with autocast():
    output = model(data)
```

### 3. Gradients Not Updating

```python
# ❌ Problem: Loss not decreasing

# Debug gradients
def check_gradients(model):
    for name, param in model.named_parameters():
        if param.grad is None:
            print(f"⚠ No gradient: {name}")
        elif param.grad.abs().sum() == 0:
            print(f"⚠ Zero gradient: {name}")
        else:
            print(f"✓ {name}: {param.grad.norm().item():.6f}")

loss.backward()
check_gradients(model)

# Common causes:
# 1. Forgot optimizer.zero_grad()
# 2. Used detach() accidentally
# 3. Frozen layers (requires_grad=False)
# 4. Learning rate too small
```

### 4. NaN/Inf Values

```python
# ❌ Error: NaN loss

# ✅ Debug NaN issues
def find_nan(model, x):
    """Find where NaN appears"""
    
    def hook_fn(module, input, output):
        if torch.isnan(output).any():
            print(f"NaN found in {module.__class__.__name__}")
            print(f"Input range: [{input[0].min():.3f}, {input[0].max():.3f}]")
            print(f"Output contains {torch.isnan(output).sum()} NaN values")
    
    # Register hooks
    hooks = []
    for module in model.modules():
        hooks.append(module.register_forward_hook(hook_fn))
    
    # Forward pass
    model(x)
    
    # Remove hooks
    for hook in hooks:
        hook.remove()

# Solutions:
# 1. Clip gradients
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 2. Lower learning rate
optimizer = optim.Adam(model.parameters(), lr=1e-4)  # Was 1e-2

# 3. Add numerical stability
log_probs = torch.log(probs + 1e-8)  # Avoid log(0)

# 4. Check for inf in data
assert not torch.isinf(data).any(), "Data contains inf"
assert not torch.isnan(data).any(), "Data contains NaN"
```

## Debugging Tools

### Hooks for Intermediate Outputs

```python
class DebugModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, 3)
        self.relu = nn.ReLU()
        self.conv2 = nn.Conv2d(64, 128, 3)
        
        # Store activations
        self.activations = {}
    
    def forward(self, x):
        # Save intermediate activations
        x = self.conv1(x)
        self.activations['conv1'] = x.clone()
        
        x = self.relu(x)
        self.activations['relu'] = x.clone()
        
        x = self.conv2(x)
        self.activations['conv2'] = x.clone()
        
        return x

# Inspect activations
model = DebugModel()
output = model(input_tensor)

for name, activation in model.activations.items():
    print(f"{name}:")
    print(f"  Shape: {activation.shape}")
    print(f"  Range: [{activation.min():.3f}, {activation.max():.3f}]")
    print(f"  Mean: {activation.mean():.3f}")
    print(f"  Std: {activation.std():.3f}")
```

### Forward Hooks

```python
def register_activation_hooks(model):
    """Register hooks to monitor activations"""
    
    activations = {}
    
    def get_activation(name):
        def hook(module, input, output):
            activations[name] = output.detach()
        return hook
    
    # Register hooks
    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear, nn.ReLU)):
            module.register_forward_hook(get_activation(name))
    
    return activations

# Usage
activations = register_activation_hooks(model)
output = model(input_tensor)

# Check activations
for name, activation in activations.items():
    print(f"{name}: {activation.shape}, range=[{activation.min():.3f}, {activation.max():.3f}]")
```

### Backward Hooks

```python
def register_gradient_hooks(model):
    """Monitor gradients during backprop"""
    
    gradients = {}
    
    def get_gradient(name):
        def hook(module, grad_input, grad_output):
            gradients[name] = grad_output[0].detach()
        return hook
    
    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            module.register_full_backward_hook(get_gradient(name))
    
    return gradients

# Usage
gradients = register_gradient_hooks(model)

output = model(input_tensor)
loss = output.sum()
loss.backward()

for name, grad in gradients.items():
    print(f"{name}: norm={grad.norm().item():.6f}")
```

## Visualization

### Loss Curves with TensorBoard

```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter('runs/experiment1')

for epoch in range(num_epochs):
    # Training
    train_loss = 0
    for batch_idx, (data, target) in enumerate(train_loader):
        output = model(data)
        loss = criterion(output, target)
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        train_loss += loss.item()
        
        # Log every 100 batches
        if batch_idx % 100 == 0:
            global_step = epoch * len(train_loader) + batch_idx
            writer.add_scalar('Loss/train_batch', loss.item(), global_step)
    
    # Validation
    val_loss = 0
    val_correct = 0
    with torch.no_grad():
        for data, target in val_loader:
            output = model(data)
            val_loss += criterion(output, target).item()
            pred = output.argmax(dim=1)
            val_correct += pred.eq(target).sum().item()
    
    # Log epoch metrics
    avg_train_loss = train_loss / len(train_loader)
    avg_val_loss = val_loss / len(val_loader)
    val_accuracy = 100. * val_correct / len(val_loader.dataset)
    
    writer.add_scalar('Loss/train', avg_train_loss, epoch)
    writer.add_scalar('Loss/val', avg_val_loss, epoch)
    writer.add_scalar('Accuracy/val', val_accuracy, epoch)
    
    # Log learning rate
    writer.add_scalar('LR', optimizer.param_groups[0]['lr'], epoch)
    
    # Log weight histograms
    for name, param in model.named_parameters():
        writer.add_histogram(f'weights/{name}', param, epoch)
        if param.grad is not None:
            writer.add_histogram(f'gradients/{name}', param.grad, epoch)

writer.close()

# View in browser: tensorboard --logdir=runs
```

### Visualize Filters

```python
import matplotlib.pyplot as plt
import torch

def visualize_conv_filters(model, layer_name='conv1', num_filters=16):
    """Visualize convolutional filters"""
    
    # Get layer
    layer = dict(model.named_modules())[layer_name]
    
    # Get weights
    weights = layer.weight.data.cpu()
    
    # Normalize to [0, 1]
    weights = (weights - weights.min()) / (weights.max() - weights.min())
    
    # Plot
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    
    for idx, ax in enumerate(axes.flat):
        if idx >= num_filters:
            break
        
        # Get filter (handle different input channels)
        if weights.shape[1] == 3:  # RGB
            filter = weights[idx].permute(1, 2, 0)
        else:
            filter = weights[idx, 0]
        
        ax.imshow(filter, cmap='viridis')
        ax.set_title(f'Filter {idx}')
        ax.axis('off')
    
    plt.tight_layout()
    plt.show()

# Usage
visualize_conv_filters(model, 'conv1')
```

### Visualize Feature Maps

```python
def visualize_feature_maps(model, input_image, layer_name='conv1'):
    """Visualize feature maps from a layer"""
    
    # Get activation
    activation = {}
    
    def hook(module, input, output):
        activation['features'] = output.detach()
    
    # Register hook
    layer = dict(model.named_modules())[layer_name]
    handle = layer.register_forward_hook(hook)
    
    # Forward pass
    model.eval()
    with torch.no_grad():
        _ = model(input_image.unsqueeze(0))
    
    # Remove hook
    handle.remove()
    
    # Get features
    features = activation['features'][0].cpu()
    
    # Plot
    num_features = min(16, features.shape[0])
    fig, axes = plt.subplots(4, 4, figsize=(12, 12))
    
    for idx, ax in enumerate(axes.flat):
        if idx >= num_features:
            break
        
        feature_map = features[idx]
        ax.imshow(feature_map, cmap='viridis')
        ax.set_title(f'Feature {idx}')
        ax.axis('off')
    
    plt.tight_layout()
    plt.show()

# Usage
visualize_feature_maps(model, test_image, 'conv1')
```

### Grad-CAM (Class Activation Mapping)

```python
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import numpy as np

class GradCAM:
    """Gradient-weighted Class Activation Mapping"""
    
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self._register_hooks()
    
    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()
        
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
        
        target = dict(self.model.named_modules())[self.target_layer]
        target.register_forward_hook(forward_hook)
        target.register_full_backward_hook(backward_hook)
    
    def generate_cam(self, input_image, target_class=None):
        """Generate CAM for target class"""
        
        # Forward pass
        self.model.eval()
        output = self.model(input_image)
        
        if target_class is None:
            target_class = output.argmax(dim=1)
        
        # Backward pass
        self.model.zero_grad()
        output[0, target_class].backward()
        
        # Get gradients and activations
        gradients = self.gradients[0]  # (C, H, W)
        activations = self.activations[0]  # (C, H, W)
        
        # Global average pooling of gradients
        weights = gradients.mean(dim=(1, 2))  # (C,)
        
        # Weighted sum of activations
        cam = (weights.unsqueeze(-1).unsqueeze(-1) * activations).sum(dim=0)
        
        # ReLU
        cam = F.relu(cam)
        
        # Normalize to [0, 1]
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        
        return cam.cpu().numpy()
    
    def visualize(self, input_image, original_image, target_class=None):
        """Visualize Grad-CAM"""
        
        cam = self.generate_cam(input_image, target_class)
        
        # Resize CAM to image size
        cam = np.array(Image.fromarray(cam).resize(
            (original_image.shape[2], original_image.shape[1]),
            Image.BILINEAR
        ))
        
        # Convert to heatmap
        heatmap = plt.cm.jet(cam)[:, :, :3]
        
        # Overlay on original image
        original = original_image.cpu().permute(1, 2, 0).numpy()
        original = (original - original.min()) / (original.max() - original.min())
        
        overlay = 0.5 * original + 0.5 * heatmap
        
        # Plot
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        axes[0].imshow(original)
        axes[0].set_title('Original Image')
        axes[0].axis('off')
        
        axes[1].imshow(cam, cmap='jet')
        axes[1].set_title('Grad-CAM')
        axes[1].axis('off')
        
        axes[2].imshow(overlay)
        axes[2].set_title('Overlay')
        axes[2].axis('off')
        
        plt.tight_layout()
        plt.show()

# Usage
grad_cam = GradCAM(model, target_layer='layer4')
grad_cam.visualize(preprocessed_image, original_image, target_class=243)
```

### Attention Visualization

```python
def visualize_attention_weights(attention_weights, input_tokens, output_tokens):
    """Visualize attention weights for sequence models"""
    
    import seaborn as sns
    
    plt.figure(figsize=(12, 8))
    
    # Convert to numpy
    attn = attention_weights.cpu().numpy()
    
    # Plot heatmap
    sns.heatmap(
        attn,
        xticklabels=input_tokens,
        yticklabels=output_tokens,
        cmap='viridis',
        cbar=True
    )
    
    plt.xlabel('Input Tokens')
    plt.ylabel('Output Tokens')
    plt.title('Attention Weights')
    plt.tight_layout()
    plt.show()

# Usage for transformer/attention models
# attention_weights: (output_len, input_len)
visualize_attention_weights(
    attention_weights,
    input_tokens=['the', 'cat', 'sat'],
    output_tokens=['le', 'chat', 'assis']
)
```

## Model Analysis

### Count Parameters

```python
def count_parameters(model):
    """Count model parameters"""
    
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"Total parameters: {total:,}")
    print(f"Trainable parameters: {trainable:,}")
    print(f"Non-trainable parameters: {total - trainable:,}")
    
    # Per-layer breakdown
    print("\nPer-layer parameters:")
    for name, param in model.named_parameters():
        print(f"{name}: {param.numel():,}")
    
    return total, trainable

count_parameters(model)
```

### Model Summary

```python
from torchsummary import summary

# Print model summary
summary(model, input_size=(3, 224, 224), device='cuda')

# Or use torchinfo
from torchinfo import summary

summary(
    model,
    input_size=(32, 3, 224, 224),  # (batch, channels, height, width)
    col_names=["input_size", "output_size", "num_params", "kernel_size"],
    depth=4,
    verbose=2
)
```

### Compute FLOPs

```python
from fvcore.nn import FlopCountAnalysis

model = MyModel()
input = torch.randn(1, 3, 224, 224)

flops = FlopCountAnalysis(model, input)
print(f"FLOPs: {flops.total() / 1e9:.2f} G")
print(f"Parameters: {sum(p.numel() for p in model.parameters()) / 1e6:.2f} M")
```

## Debugging Checklist

When model isn't training:

1. **Check data**
   ```python
   # Visualize batch
   for images, labels in train_loader:
       print(images.shape, labels.shape)
       print(images.min(), images.max())
       plt.imshow(images[0].permute(1, 2, 0))
       break
   ```

2. **Overfit single batch**
   ```python
   # Model should memorize single batch
   single_batch = next(iter(train_loader))
   for epoch in range(100):
       output = model(single_batch[0])
       loss = criterion(output, single_batch[1])
       loss.backward()
       optimizer.step()
       print(f"Epoch {epoch}: Loss={loss.item():.4f}")
   ```

3. **Check gradients**
   ```python
   # All parameters should have gradients
   for name, param in model.named_parameters():
       print(f"{name}: grad={param.grad is not None}")
   ```

4. **Monitor metrics**
   ```python
   # Loss should decrease
   # Accuracy should increase
   # No NaN/Inf values
   ```

## Next Steps

Continue to [Chapter 19: Advanced Topics](19-advanced-topics.md) for:
- Custom operators
- PyTorch Lightning
- Experiment tracking
- Advanced architectures

## Key Takeaways

- ✅ Use hooks to inspect intermediate activations
- ✅ Visualize filters and feature maps
- ✅ Use TensorBoard for training monitoring
- ✅ Grad-CAM shows what model focuses on
- ✅ Always check for NaN/Inf values
- ✅ Test on single batch first
- ✅ Monitor gradient norms
- ✅ Profile code to find bottlenecks

---

**Reference:**
- [PyTorch Debugging](https://pytorch.org/tutorials/recipes/recipes/debugging_recipe.html)
- [TensorBoard Tutorial](https://pytorch.org/tutorials/intermediate/tensorboard_tutorial.html)
