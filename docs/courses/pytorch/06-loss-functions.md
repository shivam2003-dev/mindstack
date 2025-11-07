# Chapter 6: Loss Functions

## What are Loss Functions?

Loss functions (also called cost functions or objective functions) measure how well your model's predictions match the actual targets. The goal of training is to minimize the loss.

**Key Concepts:**
- Lower loss = better predictions
- Different tasks require different loss functions
- Loss guides the gradient descent optimization

## Regression Loss Functions

### 1. Mean Squared Error (MSE)

**Use:** Regression tasks, predicting continuous values

```python
import torch
import torch.nn as nn

# MSE Loss
criterion = nn.MSELoss()

# Predictions and targets
predictions = torch.tensor([2.5, 3.0, 4.5])
targets = torch.tensor([3.0, 3.0, 4.0])

loss = criterion(predictions, targets)
print(f"MSE Loss: {loss.item():.4f}")

# Manual calculation
mse_manual = ((predictions - targets) ** 2).mean()
print(f"Manual MSE: {mse_manual.item():.4f}")
```

**Formula:** $\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$

**Characteristics:**
- Penalizes large errors more heavily (squared term)
- Sensitive to outliers
- Always positive
- Differentiable everywhere

### 2. Mean Absolute Error (MAE)

**Use:** Regression when outliers are present

```python
import torch.nn as nn

criterion = nn.L1Loss()

predictions = torch.tensor([2.5, 3.0, 4.5])
targets = torch.tensor([3.0, 3.0, 4.0])

loss = criterion(predictions, targets)
print(f"MAE Loss: {loss.item():.4f}")

# Manual calculation
mae_manual = (predictions - targets).abs().mean()
print(f"Manual MAE: {mae_manual.item():.4f}")
```

**Formula:** $\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$

**Characteristics:**
- Less sensitive to outliers than MSE
- All errors weighted equally
- Not differentiable at zero

### 3. Smooth L1 Loss (Huber Loss)

**Use:** Regression with outliers, object detection

```python
import torch.nn as nn

criterion = nn.SmoothL1Loss()

predictions = torch.tensor([2.5, 3.0, 10.0])  # One outlier
targets = torch.tensor([3.0, 3.0, 4.0])

loss = criterion(predictions, targets)
print(f"Smooth L1 Loss: {loss.item():.4f}")
```

**Formula:**
$$
\text{SmoothL1}(x) = \begin{cases}
0.5x^2 & \text{if } |x| < 1 \\
|x| - 0.5 & \text{otherwise}
\end{cases}
$$

**Characteristics:**
- Combines MSE and MAE
- Quadratic for small errors, linear for large errors
- Less sensitive to outliers than MSE

### Comparison Example

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

predictions = torch.tensor([1.0, 2.0, 10.0])  # One outlier
targets = torch.tensor([1.5, 2.0, 3.0])

mse_loss = nn.MSELoss()(predictions, targets)
mae_loss = nn.L1Loss()(predictions, targets)
smooth_loss = nn.SmoothL1Loss()(predictions, targets)

print(f"MSE Loss: {mse_loss.item():.4f}")      # High due to outlier
print(f"MAE Loss: {mae_loss.item():.4f}")      # Medium
print(f"Smooth L1: {smooth_loss.item():.4f}")  # Medium
```

## Classification Loss Functions

### 1. Binary Cross-Entropy (BCE)

**Use:** Binary classification (2 classes)

```python
import torch
import torch.nn as nn

# BCE Loss (requires sigmoid)
criterion = nn.BCELoss()

# Model outputs (after sigmoid)
predictions = torch.tensor([0.9, 0.2, 0.8, 0.3])
targets = torch.tensor([1.0, 0.0, 1.0, 0.0])

loss = criterion(predictions, targets)
print(f"BCE Loss: {loss.item():.4f}")

# Manual calculation
bce_manual = -(targets * torch.log(predictions) + 
               (1 - targets) * torch.log(1 - predictions)).mean()
print(f"Manual BCE: {bce_manual.item():.4f}")
```

**Formula:** $\text{BCE} = -\frac{1}{n}\sum_{i=1}^{n}[y_i\log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i)]$

### 2. Binary Cross-Entropy with Logits

**Use:** Binary classification (more stable)

```python
import torch.nn as nn

# BCE with Logits (no sigmoid needed)
criterion = nn.BCEWithLogitsLoss()

# Model outputs (raw logits)
logits = torch.tensor([2.5, -1.0, 1.5, -0.5])
targets = torch.tensor([1.0, 0.0, 1.0, 0.0])

loss = criterion(logits, targets)
print(f"BCE with Logits: {loss.item():.4f}")
```

**Why use this?**
- Numerically more stable
- Combines sigmoid and BCE in one operation
- Prevents gradient issues

**Complete Example:**

```python
import torch
import torch.nn as nn

class BinaryClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 1)
    
    def forward(self, x):
        # Return logits (no sigmoid)
        return self.fc(x)

model = BinaryClassifier()
criterion = nn.BCEWithLogitsLoss()

# Training
x = torch.randn(32, 10)
targets = torch.randint(0, 2, (32, 1)).float()

logits = model(x)
loss = criterion(logits, targets)
print(f"Loss: {loss.item():.4f}")

# Inference (apply sigmoid)
predictions = torch.sigmoid(logits)
predicted_classes = (predictions > 0.5).float()
```

### 3. Cross-Entropy Loss

**Use:** Multi-class classification

```python
import torch
import torch.nn as nn

# Cross-Entropy Loss
criterion = nn.CrossEntropyLoss()

# Model outputs (logits for 3 classes)
logits = torch.tensor([[2.0, 1.0, 0.1],
                       [0.5, 2.5, 0.3],
                       [0.1, 0.2, 2.8]])

# Targets (class indices)
targets = torch.tensor([0, 1, 2])

loss = criterion(logits, targets)
print(f"Cross-Entropy Loss: {loss.item():.4f}")

# Get predictions
predictions = torch.argmax(logits, dim=1)
print(f"Predicted classes: {predictions}")
print(f"True classes: {targets}")
print(f"Accuracy: {(predictions == targets).float().mean():.2f}")
```

**Important Notes:**
- Input: Raw logits (no softmax needed)
- Targets: Class indices (not one-hot)
- Combines LogSoftmax and NLLLoss

**Common Mistakes:**

```python
# ❌ Wrong - don't use softmax with CrossEntropyLoss
class WrongModel(nn.Module):
    def forward(self, x):
        x = self.fc(x)
        return F.softmax(x, dim=1)  # Wrong!

# ✅ Correct - return logits
class CorrectModel(nn.Module):
    def forward(self, x):
        return self.fc(x)  # Return raw logits
```

### 4. Negative Log Likelihood (NLL)

**Use:** Multi-class classification (when using log_softmax)

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

criterion = nn.NLLLoss()

# Model outputs (log probabilities)
log_probs = F.log_softmax(torch.tensor([[2.0, 1.0, 0.1],
                                        [0.5, 2.5, 0.3]]), dim=1)
targets = torch.tensor([0, 1])

loss = criterion(log_probs, targets)
print(f"NLL Loss: {loss.item():.4f}")
```

**Relationship:**
```python
# These are equivalent:
ce_loss = nn.CrossEntropyLoss()
nll_loss = nn.NLLLoss()

logits = torch.randn(10, 5)
targets = torch.randint(0, 5, (10,))

# Method 1: CrossEntropyLoss
loss1 = ce_loss(logits, targets)

# Method 2: LogSoftmax + NLLLoss
log_probs = F.log_softmax(logits, dim=1)
loss2 = nll_loss(log_probs, targets)

print(f"CrossEntropy: {loss1.item():.4f}")
print(f"NLL: {loss2.item():.4f}")
print(f"Equal: {torch.allclose(loss1, loss2)}")
```

## Advanced Loss Functions

### 1. Focal Loss

**Use:** Imbalanced classification, hard examples

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class FocalLoss(nn.Module):
    def __init__(self, alpha=1, gamma=2):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
    
    def forward(self, inputs, targets):
        ce_loss = F.cross_entropy(inputs, targets, reduction='none')
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        return focal_loss.mean()

# Usage
criterion = FocalLoss(alpha=1, gamma=2)
logits = torch.randn(32, 10)
targets = torch.randint(0, 10, (32,))

loss = criterion(logits, targets)
print(f"Focal Loss: {loss.item():.4f}")
```

**Why Focal Loss?**
- Down-weights easy examples
- Focuses on hard examples
- Good for class imbalance

### 2. Dice Loss

**Use:** Segmentation tasks

```python
import torch
import torch.nn as nn

class DiceLoss(nn.Module):
    def __init__(self, smooth=1.0):
        super().__init__()
        self.smooth = smooth
    
    def forward(self, predictions, targets):
        predictions = torch.sigmoid(predictions)
        
        # Flatten
        predictions = predictions.view(-1)
        targets = targets.view(-1)
        
        intersection = (predictions * targets).sum()
        dice = (2. * intersection + self.smooth) / (
            predictions.sum() + targets.sum() + self.smooth
        )
        
        return 1 - dice

# Usage
criterion = DiceLoss()
predictions = torch.randn(1, 1, 256, 256)
targets = torch.randint(0, 2, (1, 1, 256, 256)).float()

loss = criterion(predictions, targets)
print(f"Dice Loss: {loss.item():.4f}")
```

### 3. Contrastive Loss

**Use:** Metric learning, similarity learning

```python
import torch
import torch.nn as nn

class ContrastiveLoss(nn.Module):
    def __init__(self, margin=1.0):
        super().__init__()
        self.margin = margin
    
    def forward(self, output1, output2, label):
        euclidean_distance = F.pairwise_distance(output1, output2)
        loss = torch.mean((1 - label) * torch.pow(euclidean_distance, 2) +
                         label * torch.pow(torch.clamp(self.margin - euclidean_distance, min=0.0), 2))
        return loss
```

## Custom Loss Functions

### Simple Custom Loss

```python
import torch
import torch.nn as nn

class CustomMSELoss(nn.Module):
    def __init__(self):
        super().__init__()
    
    def forward(self, predictions, targets):
        return torch.mean((predictions - targets) ** 2)

# Usage
criterion = CustomMSELoss()
predictions = torch.randn(10, 1)
targets = torch.randn(10, 1)

loss = criterion(predictions, targets)
print(f"Custom MSE: {loss.item():.4f}")
```

### Weighted Loss

```python
import torch.nn as nn

class WeightedMSELoss(nn.Module):
    def __init__(self, weights):
        super().__init__()
        self.weights = weights
    
    def forward(self, predictions, targets):
        squared_errors = (predictions - targets) ** 2
        weighted_errors = squared_errors * self.weights
        return weighted_errors.mean()

# Usage
weights = torch.tensor([1.0, 2.0, 3.0])  # Weight recent samples more
criterion = WeightedMSELoss(weights)

predictions = torch.tensor([1.0, 2.0, 3.0])
targets = torch.tensor([1.5, 2.5, 3.5])

loss = criterion(predictions, targets)
print(f"Weighted MSE: {loss.item():.4f}")
```

### Combined Loss

```python
import torch
import torch.nn as nn

class CombinedLoss(nn.Module):
    def __init__(self, alpha=0.5):
        super().__init__()
        self.alpha = alpha
        self.mse = nn.MSELoss()
        self.l1 = nn.L1Loss()
    
    def forward(self, predictions, targets):
        mse_loss = self.mse(predictions, targets)
        l1_loss = self.l1(predictions, targets)
        return self.alpha * mse_loss + (1 - self.alpha) * l1_loss

# Usage
criterion = CombinedLoss(alpha=0.7)
predictions = torch.randn(10, 1)
targets = torch.randn(10, 1)

loss = criterion(predictions, targets)
print(f"Combined Loss: {loss.item():.4f}")
```

## Loss Function Selection Guide

### For Regression

| Task | Loss Function | When to Use |
|------|---------------|-------------|
| Standard regression | MSE | General purpose |
| Regression with outliers | MAE or Smooth L1 | Robust to outliers |
| Percentage errors matter | MAPE | Relative errors important |

### For Classification

| Task | Loss Function | When to Use |
|------|---------------|-------------|
| Binary classification | BCEWithLogitsLoss | 2 classes |
| Multi-class classification | CrossEntropyLoss | Multiple classes |
| Imbalanced classes | Focal Loss or Weighted CE | Class imbalance |
| Multi-label classification | BCEWithLogitsLoss | Multiple labels per sample |

### For Special Tasks

| Task | Loss Function |
|------|---------------|
| Segmentation | Dice Loss, IoU Loss |
| Object Detection | Smooth L1 + Cross-Entropy |
| Metric Learning | Contrastive Loss, Triplet Loss |
| GANs | BCE, Wasserstein Loss |

## Practical Examples

### Multi-Class Classification

```python
import torch
import torch.nn as nn

# Model
class Classifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(784, 10)
    
    def forward(self, x):
        return self.fc(x)  # Return logits

model = Classifier()
criterion = nn.CrossEntropyLoss()

# Training
x = torch.randn(32, 784)
targets = torch.randint(0, 10, (32,))

outputs = model(x)
loss = criterion(outputs, targets)

print(f"Loss: {loss.item():.4f}")
```

### Imbalanced Classification

```python
import torch
import torch.nn as nn

# Class weights (inverse frequency)
class_counts = torch.tensor([1000, 100, 10])  # Imbalanced
weights = 1.0 / class_counts
weights = weights / weights.sum()

criterion = nn.CrossEntropyLoss(weight=weights)

logits = torch.randn(32, 3)
targets = torch.randint(0, 3, (32,))

loss = criterion(logits, targets)
print(f"Weighted Loss: {loss.item():.4f}")
```

### Multi-Label Classification

```python
import torch
import torch.nn as nn

# Multi-label (each sample can have multiple labels)
criterion = nn.BCEWithLogitsLoss()

# 5 samples, 3 possible labels each
logits = torch.randn(5, 3)
targets = torch.tensor([[1, 0, 1],
                        [0, 1, 1],
                        [1, 1, 0],
                        [0, 0, 1],
                        [1, 0, 0]], dtype=torch.float32)

loss = criterion(logits, targets)
print(f"Multi-label Loss: {loss.item():.4f}")

# Predictions
predictions = (torch.sigmoid(logits) > 0.5).float()
print(f"Predictions:\n{predictions}")
```

## Debugging Loss Values

### Check for NaN or Inf

```python
import torch

def check_loss(loss, name="Loss"):
    if torch.isnan(loss):
        print(f"{name} is NaN!")
        return False
    if torch.isinf(loss):
        print(f"{name} is Inf!")
        return False
    if loss < 0:
        print(f"{name} is negative: {loss.item()}")
        return False
    return True

# Usage
loss = criterion(predictions, targets)
if check_loss(loss):
    loss.backward()
```

### Monitor Loss Trends

```python
import matplotlib.pyplot as plt

losses = []
for epoch in range(100):
    # Training code
    loss = train_one_epoch()
    losses.append(loss)

plt.plot(losses)
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training Loss')
plt.show()

# Check if loss is decreasing
if losses[-1] > losses[0]:
    print("Warning: Loss not decreasing!")
```

## Next Steps

Continue to [Chapter 7: Optimizers](07-optimizers.md) to learn about:
- SGD, Adam, and other optimizers
- Learning rate scheduling
- Optimizer selection
- Advanced optimization techniques

## Key Takeaways

- ✅ Different tasks require different loss functions
- ✅ Use CrossEntropyLoss for multi-class classification
- ✅ Use BCEWithLogitsLoss for binary classification
- ✅ MSE for regression, MAE for outlier-robust regression
- ✅ Don't apply softmax/sigmoid before CrossEntropyLoss/BCEWithLogitsLoss
- ✅ Can create custom losses by inheriting from nn.Module
- ✅ Use class weights for imbalanced datasets

---

**Reference:**
- [Loss Functions Documentation](https://pytorch.org/docs/stable/nn.html#loss-functions)
