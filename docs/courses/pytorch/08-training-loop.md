# Chapter 8: Training Loop

## Complete Training Pipeline

The training loop is the heart of deep learning. It involves forward pass, loss calculation, backward pass, and parameter updates.

!!! tip "Training Loop Pattern"
    The standard pattern is: zero gradients → forward pass → compute loss → backward pass → optimizer step. Always call `optimizer.zero_grad()` before each backward pass to avoid gradient accumulation.

!!! note "Training vs Evaluation Mode"
    Use `model.train()` during training and `model.eval()` during validation/testing. This affects layers like Dropout and BatchNorm that behave differently in training vs inference.

## Basic Training Loop

### Minimal Example

```python
import torch
import torch.nn as nn
import torch.optim as optim

# Setup
model = MyModel()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
num_epochs = 10

for epoch in range(num_epochs):
    for batch_idx, (data, target) in enumerate(train_loader):
        # 1. Zero gradients
        optimizer.zero_grad()
        
        # 2. Forward pass
        output = model(data)
        loss = criterion(output, target)
        
        # 3. Backward pass
        loss.backward()
        
        # 4. Update parameters
        optimizer.step()
    
    print(f"Epoch {epoch+1}/{num_epochs}, Loss: {loss.item():.4f}")
```

## Complete Training Loop with Validation

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from tqdm import tqdm

def train_one_epoch(model, train_loader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()  # Set to training mode
    
    running_loss = 0.0
    correct = 0
    total = 0
    
    # Progress bar
    pbar = tqdm(train_loader, desc='Training')
    
    for batch_idx, (data, target) in enumerate(pbar):
        # Move to device
        data, target = data.to(device), target.to(device)
        
        # Zero gradients
        optimizer.zero_grad()
        
        # Forward pass
        output = model(data)
        loss = criterion(output, target)
        
        # Backward pass
        loss.backward()
        
        # Update parameters
        optimizer.step()
        
        # Statistics
        running_loss += loss.item()
        _, predicted = output.max(1)
        total += target.size(0)
        correct += predicted.eq(target).sum().item()
        
        # Update progress bar
        pbar.set_postfix({
            'loss': running_loss / (batch_idx + 1),
            'acc': 100. * correct / total
        })
    
    epoch_loss = running_loss / len(train_loader)
    epoch_acc = 100. * correct / total
    
    return epoch_loss, epoch_acc


def validate(model, val_loader, criterion, device):
    """Validate the model"""
    model.eval()  # Set to evaluation mode
    
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():  # Disable gradient computation
        for data, target in tqdm(val_loader, desc='Validation'):
            # Move to device
            data, target = data.to(device), target.to(device)
            
            # Forward pass
            output = model(data)
            loss = criterion(output, target)
            
            # Statistics
            running_loss += loss.item()
            _, predicted = output.max(1)
            total += target.size(0)
            correct += predicted.eq(target).sum().item()
    
    val_loss = running_loss / len(val_loader)
    val_acc = 100. * correct / total
    
    return val_loss, val_acc


# Main training function
def train(model, train_loader, val_loader, criterion, optimizer, 
          num_epochs, device):
    """Complete training procedure"""
    
    best_val_acc = 0.0
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }
    
    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 60)
        
        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        # Print statistics
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_model.pth')
            print(f"✓ Saved best model (acc: {best_val_acc:.2f}%)")
    
    return history
```

## Usage Example

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Data
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

train_dataset = datasets.MNIST('data', train=True, download=True, transform=transform)
val_dataset = datasets.MNIST('data', train=False, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

# Model
model = SimpleNet().to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Train
history = train(model, train_loader, val_loader, criterion, optimizer,
                num_epochs=10, device=device)
```

## Advanced Training Loop

### With Early Stopping and Checkpointing

```python
import torch
import os
from pathlib import Path

class EarlyStopping:
    """Early stopping to prevent overfitting"""
    def __init__(self, patience=7, min_delta=0, verbose=True):
        self.patience = patience
        self.min_delta = min_delta
        self.verbose = verbose
        self.counter = 0
        self.best_score = None
        self.early_stop = False
        
    def __call__(self, val_loss):
        score = -val_loss
        
        if self.best_score is None:
            self.best_score = score
        elif score < self.best_score + self.min_delta:
            self.counter += 1
            if self.verbose:
                print(f'EarlyStopping counter: {self.counter}/{self.patience}')
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_score = score
            self.counter = 0


class Checkpoint:
    """Save and load model checkpoints"""
    def __init__(self, save_dir='checkpoints'):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
        self.best_loss = float('inf')
    
    def save(self, model, optimizer, epoch, loss, filename='checkpoint.pth'):
        """Save checkpoint"""
        checkpoint = {
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'loss': loss,
        }
        path = self.save_dir / filename
        torch.save(checkpoint, path)
        print(f'✓ Checkpoint saved: {path}')
    
    def load(self, model, optimizer, filename='checkpoint.pth'):
        """Load checkpoint"""
        path = self.save_dir / filename
        checkpoint = torch.load(path)
        
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        epoch = checkpoint['epoch']
        loss = checkpoint['loss']
        
        print(f'✓ Checkpoint loaded: {path}')
        return epoch, loss
    
    def save_best(self, model, optimizer, epoch, loss):
        """Save if best model"""
        if loss < self.best_loss:
            self.best_loss = loss
            self.save(model, optimizer, epoch, loss, 'best_model.pth')
            return True
        return False


def train_advanced(model, train_loader, val_loader, criterion, optimizer,
                   scheduler, num_epochs, device, checkpoint_dir='checkpoints'):
    """Advanced training with early stopping and checkpointing"""
    
    early_stopping = EarlyStopping(patience=10, verbose=True)
    checkpoint = Checkpoint(save_dir=checkpoint_dir)
    
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': [],
        'lr': []
    }
    
    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 60)
        
        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Update scheduler
        if scheduler is not None:
            if isinstance(scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
                scheduler.step(val_loss)
            else:
                scheduler.step()
        
        # Get current learning rate
        current_lr = optimizer.param_groups[0]['lr']
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        history['lr'].append(current_lr)
        
        # Print statistics
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        print(f"Learning Rate: {current_lr:.6f}")
        
        # Save best model
        if checkpoint.save_best(model, optimizer, epoch, val_loss):
            print(f"✓ New best model (val_loss: {val_loss:.4f})")
        
        # Save regular checkpoint
        if (epoch + 1) % 5 == 0:
            checkpoint.save(model, optimizer, epoch, val_loss, 
                          f'checkpoint_epoch_{epoch+1}.pth')
        
        # Early stopping
        early_stopping(val_loss)
        if early_stopping.early_stop:
            print("\n⚠ Early stopping triggered!")
            break
    
    return history
```

## Metrics and Logging

### Computing Metrics

```python
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

def compute_metrics(predictions, targets, num_classes):
    """Compute various metrics"""
    
    # Convert to numpy
    predictions = predictions.cpu().numpy()
    targets = targets.cpu().numpy()
    
    # Accuracy
    accuracy = accuracy_score(targets, predictions)
    
    # Precision, Recall, F1
    precision, recall, f1, _ = precision_recall_fscore_support(
        targets, predictions, average='weighted', zero_division=0
    )
    
    # Per-class metrics
    per_class_precision, per_class_recall, per_class_f1, _ = \
        precision_recall_fscore_support(
            targets, predictions, average=None, zero_division=0
        )
    
    metrics = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'per_class_precision': per_class_precision,
        'per_class_recall': per_class_recall,
        'per_class_f1': per_class_f1,
    }
    
    return metrics


def evaluate_model(model, test_loader, device, num_classes):
    """Complete model evaluation"""
    model.eval()
    
    all_predictions = []
    all_targets = []
    
    with torch.no_grad():
        for data, target in tqdm(test_loader, desc='Evaluating'):
            data = data.to(device)
            output = model(data)
            
            _, predicted = output.max(1)
            all_predictions.extend(predicted.cpu().tolist())
            all_targets.extend(target.tolist())
    
    # Compute metrics
    predictions = torch.tensor(all_predictions)
    targets = torch.tensor(all_targets)
    metrics = compute_metrics(predictions, targets, num_classes)
    
    # Print results
    print("\n" + "="*60)
    print("EVALUATION RESULTS")
    print("="*60)
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1']:.4f}")
    print("="*60)
    
    return metrics
```

### TensorBoard Logging

```python
from torch.utils.tensorboard import SummaryWriter

def train_with_tensorboard(model, train_loader, val_loader, criterion, 
                           optimizer, num_epochs, device, log_dir='runs'):
    """Training with TensorBoard logging"""
    
    writer = SummaryWriter(log_dir)
    
    for epoch in range(num_epochs):
        # Train
        model.train()
        train_loss = 0.0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(device), target.to(device)
            
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            
            # Log every 100 batches
            if batch_idx % 100 == 0:
                global_step = epoch * len(train_loader) + batch_idx
                writer.add_scalar('Loss/train_step', loss.item(), global_step)
        
        train_loss /= len(train_loader)
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Log epoch metrics
        writer.add_scalar('Loss/train_epoch', train_loss, epoch)
        writer.add_scalar('Loss/val', val_loss, epoch)
        writer.add_scalar('Accuracy/val', val_acc, epoch)
        writer.add_scalar('Learning_Rate', optimizer.param_groups[0]['lr'], epoch)
        
        # Log model weights (optional)
        for name, param in model.named_parameters():
            writer.add_histogram(f'Weights/{name}', param, epoch)
            if param.grad is not None:
                writer.add_histogram(f'Gradients/{name}', param.grad, epoch)
    
    writer.close()
    print(f"\n✓ TensorBoard logs saved to: {log_dir}")
    print(f"  Run: tensorboard --logdir={log_dir}")
```

## Visualization

### Plot Training History

```python
import matplotlib.pyplot as plt

def plot_history(history, save_path=None):
    """Plot training history"""
    
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Loss plot
    axes[0].plot(history['train_loss'], label='Train Loss')
    axes[0].plot(history['val_loss'], label='Val Loss')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Loss')
    axes[0].set_title('Training and Validation Loss')
    axes[0].legend()
    axes[0].grid(True)
    
    # Accuracy plot
    axes[1].plot(history['train_acc'], label='Train Acc')
    axes[1].plot(history['val_acc'], label='Val Acc')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Accuracy (%)')
    axes[1].set_title('Training and Validation Accuracy')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.show()

# Usage
plot_history(history, save_path='training_history.png')
```

### Confusion Matrix

```python
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix

def plot_confusion_matrix(model, test_loader, class_names, device):
    """Plot confusion matrix"""
    model.eval()
    
    all_preds = []
    all_targets = []
    
    with torch.no_grad():
        for data, target in test_loader:
            data = data.to(device)
            output = model(data)
            _, predicted = output.max(1)
            
            all_preds.extend(predicted.cpu().numpy())
            all_targets.extend(target.numpy())
    
    # Compute confusion matrix
    cm = confusion_matrix(all_targets, all_preds)
    
    # Plot
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names,
                yticklabels=class_names)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    plt.show()
```

## Complete Training Script

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.optim.lr_scheduler import ReduceLROnPlateau
import argparse

def main():
    # Arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--batch-size', type=int, default=64)
    parser.add_argument('--lr', type=float, default=0.001)
    parser.add_argument('--device', type=str, default='cuda')
    args = parser.parse_args()
    
    # Device
    device = torch.device(args.device if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Data
    train_loader, val_loader, test_loader = get_data_loaders(args.batch_size)
    
    # Model
    model = MyModel().to(device)
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', patience=5, verbose=True)
    
    # Train
    history = train_advanced(
        model, train_loader, val_loader,
        criterion, optimizer, scheduler,
        num_epochs=args.epochs,
        device=device
    )
    
    # Plot results
    plot_history(history)
    
    # Evaluate
    metrics = evaluate_model(model, test_loader, device, num_classes=10)
    
    # Save final model
    torch.save(model.state_dict(), 'final_model.pth')
    print("\n✓ Training complete!")

if __name__ == '__main__':
    main()
```

## Best Practices

### 1. Set Random Seeds

```python
import random
import numpy as np
import torch

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(42)
```

### 2. Mixed Precision Training

```python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for data, target in train_loader:
    optimizer.zero_grad()
    
    with autocast():
        output = model(data)
        loss = criterion(output, target)
    
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

### 3. Gradient Clipping

```python
# After loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()
```

## Next Steps

Continue to [Chapter 9: Datasets & DataLoaders](09-datasets-dataloaders.md) to learn about:
- Creating datasets
- DataLoader configuration
- Data augmentation
- Custom data pipelines

## Key Takeaways

- ✅ Always use `model.train()` and `model.eval()`
- ✅ Use `torch.no_grad()` during validation
- ✅ Implement early stopping to prevent overfitting
- ✅ Save checkpoints regularly
- ✅ Monitor multiple metrics, not just loss
- ✅ Use TensorBoard for visualization
- ✅ Set random seeds for reproducibility

---

**Reference:**
- [Training Neural Networks](https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html)
