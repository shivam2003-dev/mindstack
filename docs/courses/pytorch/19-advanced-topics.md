# Chapter 19: Advanced Topics & Modern Techniques

<div style="background: linear-gradient(135deg, #c471ed 0%, #f64f59 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">⚡ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Explore PyTorch Lightning for faster development</li>
    <li>Implement custom layers and functions</li>
    <li>Use advanced optimization techniques</li>
    <li>Apply modern deep learning patterns</li>
  </ul>
</div>

Explore cutting-edge PyTorch techniques and modern best practices.

!!! tip "When to Use PyTorch Lightning"
    Use Lightning when: building complex training loops, need multi-GPU/distributed training, want automatic logging, or need reproducible experiments. For simple projects, vanilla PyTorch is fine.

!!! note "Custom Operations"
    PyTorch allows custom autograd functions and layers. Use `Function` for stateless operations and `Module` for stateful layers. Always test custom operations thoroughly as they can affect gradients.

## PyTorch Lightning

### Why Lightning?

Lightning removes boilerplate code and enforces best practices:

```python
import pytorch_lightning as pl
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader

class LitModel(pl.LightningModule):
    """PyTorch Lightning module"""
    
    def __init__(self, input_dim, hidden_dim, num_classes, lr=1e-3):
        super().__init__()
        
        # Save hyperparameters
        self.save_hyperparameters()
        
        # Model
        self.model = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, num_classes)
        )
    
    def forward(self, x):
        return self.model(x)
    
    def training_step(self, batch, batch_idx):
        """Training step"""
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        
        # Log metrics
        self.log('train_loss', loss, prog_bar=True)
        
        return loss
    
    def validation_step(self, batch, batch_idx):
        """Validation step"""
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        
        # Calculate accuracy
        acc = (y_hat.argmax(dim=1) == y).float().mean()
        
        # Log metrics
        self.log('val_loss', loss, prog_bar=True)
        self.log('val_acc', acc, prog_bar=True)
    
    def configure_optimizers(self):
        """Configure optimizer and scheduler"""
        optimizer = torch.optim.Adam(self.parameters(), lr=self.hparams.lr)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            optimizer, T_max=10
        )
        return {
            'optimizer': optimizer,
            'lr_scheduler': scheduler
        }

# Training
model = LitModel(input_dim=784, hidden_dim=256, num_classes=10)

trainer = pl.Trainer(
    max_epochs=10,
    accelerator='gpu',
    devices=1,
    precision=16,  # Mixed precision
    log_every_n_steps=50
)

trainer.fit(model, train_loader, val_loader)
```

### Advanced Lightning Features

```python
class AdvancedLitModel(pl.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = MyModel()
    
    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        loss = F.cross_entropy(y_hat, y)
        
        # Multiple losses
        aux_loss = self.auxiliary_loss(y_hat, y)
        total_loss = loss + 0.5 * aux_loss
        
        # Log multiple metrics
        self.log_dict({
            'train_loss': loss,
            'train_aux_loss': aux_loss,
            'train_total_loss': total_loss
        })
        
        return total_loss
    
    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self(x)
        
        # Return predictions for epoch-end processing
        return {'preds': y_hat, 'targets': y}
    
    def validation_epoch_end(self, outputs):
        """Called at end of validation epoch"""
        
        # Gather all predictions
        preds = torch.cat([x['preds'] for x in outputs])
        targets = torch.cat([x['targets'] for x in outputs])
        
        # Compute metrics
        from torchmetrics import F1Score, AUROC
        
        f1 = F1Score(num_classes=10)(preds, targets)
        auroc = AUROC(num_classes=10)(preds, targets)
        
        self.log_dict({'val_f1': f1, 'val_auroc': auroc})
    
    def configure_callbacks(self):
        """Setup callbacks"""
        return [
            pl.callbacks.ModelCheckpoint(
                monitor='val_loss',
                mode='min',
                save_top_k=3,
                filename='{epoch}-{val_loss:.2f}'
            ),
            pl.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                mode='min'
            ),
            pl.callbacks.LearningRateMonitor(logging_interval='step')
        ]
```

## Experiment Tracking

### Weights & Biases

```python
import wandb
from pytorch_lightning.loggers import WandbLogger

# Initialize wandb
wandb.init(
    project="my-project",
    config={
        "learning_rate": 0.001,
        "epochs": 10,
        "batch_size": 32
    }
)

# Lightning integration
wandb_logger = WandbLogger(project='my-project')

trainer = pl.Trainer(
    logger=wandb_logger,
    max_epochs=10
)

trainer.fit(model, train_loader, val_loader)

# Manual logging
for epoch in range(num_epochs):
    train_loss = train_epoch(...)
    val_loss = validate(...)
    
    wandb.log({
        'epoch': epoch,
        'train_loss': train_loss,
        'val_loss': val_loss,
        'learning_rate': optimizer.param_groups[0]['lr']
    })

# Log images
images, labels = next(iter(val_loader))
wandb.log({"examples": [wandb.Image(img) for img in images[:5]]})

# Finish
wandb.finish()
```

### MLflow

```python
import mlflow
import mlflow.pytorch

# Start run
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("learning_rate", 0.001)
    mlflow.log_param("batch_size", 32)
    mlflow.log_param("epochs", 10)
    
    # Training
    for epoch in range(num_epochs):
        train_loss = train_epoch(...)
        val_loss = validate(...)
        
        # Log metrics
        mlflow.log_metric("train_loss", train_loss, step=epoch)
        mlflow.log_metric("val_loss", val_loss, step=epoch)
    
    # Log model
    mlflow.pytorch.log_model(model, "model")
    
    # Log artifacts
    mlflow.log_artifact("config.yaml")
```

## Custom Operators

### Custom Autograd Function

```python
import torch
from torch.autograd import Function

class MyReLU(Function):
    """Custom ReLU with custom backward"""
    
    @staticmethod
    def forward(ctx, input):
        """Forward pass"""
        # Save for backward
        ctx.save_for_backward(input)
        
        # Custom forward
        return input.clamp(min=0)
    
    @staticmethod
    def backward(ctx, grad_output):
        """Backward pass"""
        input, = ctx.saved_tensors
        
        # Custom gradient
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0
        
        return grad_input

# Usage
class CustomModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 10)
    
    def forward(self, x):
        x = self.linear(x)
        x = MyReLU.apply(x)  # Use custom function
        return x
```

### CUDA Custom Kernel

```python
from torch.utils.cpp_extension import load

# Load C++/CUDA extension
custom_ops = load(
    name='custom_ops',
    sources=['custom_ops.cpp', 'custom_ops_cuda.cu']
)

# Use in model
class FastModel(nn.Module):
    def forward(self, x):
        # Use custom CUDA kernel
        return custom_ops.forward(x)
```

## Advanced Architectures

### Vision Transformer (ViT)

```python
import torch
import torch.nn as nn

class PatchEmbedding(nn.Module):
    """Split image into patches and embed"""
    
    def __init__(self, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
        super().__init__()
        
        self.num_patches = (img_size // patch_size) ** 2
        
        # Patch extraction using conv
        self.proj = nn.Conv2d(
            in_channels, embed_dim,
            kernel_size=patch_size,
            stride=patch_size
        )
    
    def forward(self, x):
        # x: (B, C, H, W)
        x = self.proj(x)  # (B, embed_dim, H', W')
        x = x.flatten(2)  # (B, embed_dim, num_patches)
        x = x.transpose(1, 2)  # (B, num_patches, embed_dim)
        return x

class VisionTransformer(nn.Module):
    """Vision Transformer"""
    
    def __init__(
        self,
        img_size=224,
        patch_size=16,
        in_channels=3,
        num_classes=1000,
        embed_dim=768,
        depth=12,
        num_heads=12,
        mlp_ratio=4.0
    ):
        super().__init__()
        
        # Patch embedding
        self.patch_embed = PatchEmbedding(
            img_size, patch_size, in_channels, embed_dim
        )
        num_patches = self.patch_embed.num_patches
        
        # Class token
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        
        # Position embedding
        self.pos_embed = nn.Parameter(
            torch.zeros(1, num_patches + 1, embed_dim)
        )
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=int(embed_dim * mlp_ratio),
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=depth
        )
        
        # Classification head
        self.head = nn.Linear(embed_dim, num_classes)
    
    def forward(self, x):
        # Patch embedding
        x = self.patch_embed(x)  # (B, num_patches, embed_dim)
        
        # Add class token
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)  # (B, num_patches+1, embed_dim)
        
        # Add position embedding
        x = x + self.pos_embed
        
        # Transformer
        x = self.transformer(x)
        
        # Classification head (use class token)
        x = self.head(x[:, 0])
        
        return x

# Usage
model = VisionTransformer(num_classes=10)
output = model(torch.randn(2, 3, 224, 224))
print(output.shape)  # torch.Size([2, 10])
```

### EfficientNet (MBConv Block)

```python
class MBConvBlock(nn.Module):
    """Mobile Inverted Residual Bottleneck block"""
    
    def __init__(self, in_channels, out_channels, expand_ratio, stride):
        super().__init__()
        
        hidden_dim = in_channels * expand_ratio
        self.use_residual = (stride == 1 and in_channels == out_channels)
        
        layers = []
        
        # Expansion
        if expand_ratio != 1:
            layers.append(nn.Conv2d(in_channels, hidden_dim, 1, bias=False))
            layers.append(nn.BatchNorm2d(hidden_dim))
            layers.append(nn.SiLU(inplace=True))
        
        # Depthwise
        layers.extend([
            nn.Conv2d(
                hidden_dim, hidden_dim, 3,
                stride=stride, padding=1,
                groups=hidden_dim, bias=False
            ),
            nn.BatchNorm2d(hidden_dim),
            nn.SiLU(inplace=True)
        ])
        
        # Squeeze-and-Excitation
        layers.append(SEBlock(hidden_dim))
        
        # Projection
        layers.extend([
            nn.Conv2d(hidden_dim, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels)
        ])
        
        self.conv = nn.Sequential(*layers)
    
    def forward(self, x):
        if self.use_residual:
            return x + self.conv(x)
        return self.conv(x)

class SEBlock(nn.Module):
    """Squeeze-and-Excitation block"""
    
    def __init__(self, channels, reduction=4):
        super().__init__()
        
        self.se = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(channels, channels // reduction, 1),
            nn.SiLU(inplace=True),
            nn.Conv2d(channels // reduction, channels, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return x * self.se(x)
```

## Hyperparameter Tuning

### Ray Tune

```python
from ray import tune
from ray.tune import CLIReporter
from ray.tune.schedulers import ASHAScheduler

def train_model(config):
    """Training function for Ray Tune"""
    
    # Build model with config
    model = MyModel(
        hidden_dim=config["hidden_dim"],
        dropout=config["dropout"]
    ).to(device)
    
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=config["lr"]
    )
    
    # Training loop
    for epoch in range(10):
        train_loss = train_epoch(model, train_loader, optimizer)
        val_loss = validate(model, val_loader)
        
        # Report to Tune
        tune.report(loss=val_loss, accuracy=val_acc)

# Define search space
config = {
    "hidden_dim": tune.choice([128, 256, 512]),
    "dropout": tune.uniform(0.1, 0.5),
    "lr": tune.loguniform(1e-4, 1e-2)
}

# Scheduler
scheduler = ASHAScheduler(
    metric="loss",
    mode="min",
    max_t=10,
    grace_period=1,
    reduction_factor=2
)

# Reporter
reporter = CLIReporter(
    metric_columns=["loss", "accuracy", "training_iteration"]
)

# Run hyperparameter search
result = tune.run(
    train_model,
    resources_per_trial={"cpu": 2, "gpu": 0.5},
    config=config,
    num_samples=10,
    scheduler=scheduler,
    progress_reporter=reporter
)

# Best config
best_trial = result.get_best_trial("loss", "min", "last")
print(f"Best config: {best_trial.config}")
```

## Model Interpretability

### Integrated Gradients

```python
def integrated_gradients(model, input, target_class, baseline=None, steps=50):
    """Compute integrated gradients"""
    
    if baseline is None:
        baseline = torch.zeros_like(input)
    
    # Generate interpolated inputs
    alphas = torch.linspace(0, 1, steps).to(input.device)
    
    gradients = []
    for alpha in alphas:
        # Interpolate
        interpolated = baseline + alpha * (input - baseline)
        interpolated.requires_grad_(True)
        
        # Forward
        output = model(interpolated)
        
        # Backward
        model.zero_grad()
        output[0, target_class].backward()
        
        # Save gradient
        gradients.append(interpolated.grad.detach())
    
    # Average gradients
    avg_gradients = torch.stack(gradients).mean(dim=0)
    
    # Integrated gradients
    integrated_grads = (input - baseline) * avg_gradients
    
    return integrated_grads
```

## Next Steps

You've completed the advanced topics! Keep learning:
1. Explore research papers and implement them
2. Contribute to open-source PyTorch projects
3. Participate in ML competitions
4. Build production ML systems

## Key Takeaways

- ✅ PyTorch Lightning simplifies training code
- ✅ Track experiments with W&B or MLflow
- ✅ Custom autograd functions for special operations
- ✅ Vision Transformers are state-of-the-art for vision
- ✅ Use Ray Tune for hyperparameter optimization
- ✅ Interpretability tools explain model decisions
- ✅ Stay updated with latest research

---

**Reference:**
- [PyTorch Lightning](https://www.pytorchlightning.ai/)
- [Weights & Biases](https://wandb.ai/)
- [Ray Tune](https://docs.ray.io/en/latest/tune/index.html)
