# Chapter 14: Transfer Learning

<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 2rem; border-radius: 10px; color: #333; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: #333;">🚀 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem; color: #333;">
    <li>Understand transfer learning concepts</li>
    <li>Implement feature extraction and fine-tuning</li>
    <li>Choose the right pre-trained models</li>
    <li>Optimize transfer learning workflows</li>
  </ul>
</div>

Transfer learning leverages knowledge from pre-trained models to solve new tasks with less data and training time.

!!! tip "When to Use Transfer Learning"
    Use transfer learning when: you have limited data (< 10k samples), your task is similar to ImageNet (classification), or you need quick results. For very different tasks or large datasets, training from scratch might be better.

!!! note "Feature Extraction vs Fine-tuning"
    - **Feature Extraction**: Freeze backbone, train only classifier. Faster, less memory, good for very small datasets.
    - **Fine-tuning**: Update all/some layers. Slower, more memory, better for larger datasets or different domains.

## Why Transfer Learning?

**Benefits:**
- ✅ Faster training (hours vs days)
- ✅ Better performance with limited data
- ✅ Leverage pre-trained features
- ✅ Reduced computational cost

**When to use:**
- Small datasets
- Similar task/domain
- Limited computational resources
- Quick prototyping

## Two Main Approaches

### 1. Feature Extraction (Frozen Backbone)

**Idea:** Use pre-trained model as fixed feature extractor

```python
import torch
import torch.nn as nn
import torchvision.models as models

# Load pretrained model
model = models.resnet18(pretrained=True)

# Freeze all parameters
for param in model.parameters():
    param.requires_grad = False

# Replace final layer
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 10)  # 10 classes

# Only final layer will be trained
print("Trainable parameters:")
for name, param in model.named_parameters():
    if param.requires_grad:
        print(f"  {name}")
```

### 2. Fine-Tuning (Update All/Some Layers)

**Idea:** Update pre-trained weights with small learning rate

```python
import torch.optim as optim

# Load pretrained model
model = models.resnet18(pretrained=True)

# Replace final layer
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 10)

# Different learning rates for different parts
optimizer = optim.SGD([
    {'params': model.fc.parameters(), 'lr': 1e-3},           # New layer
    {'params': model.layer4.parameters(), 'lr': 1e-4},       # Last block
    {'params': model.layer3.parameters(), 'lr': 1e-5},       # Earlier layers
], momentum=0.9)
```

## Complete Transfer Learning Example

### Feature Extraction

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader

# 1. Data preparation
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

train_dataset = datasets.ImageFolder('data/train', transform=transform)
val_dataset = datasets.ImageFolder('data/val', transform=transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

# 2. Load pretrained model
model = models.resnet50(pretrained=True)

# 3. Freeze backbone
for param in model.parameters():
    param.requires_grad = False

# 4. Replace classifier
num_classes = len(train_dataset.classes)
model.fc = nn.Sequential(
    nn.Dropout(0.5),
    nn.Linear(model.fc.in_features, num_classes)
)

# 5. Setup training
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)

# 6. Train
def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for data, target in loader:
        data, target = data.to(device), target.to(device)
        
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = output.max(1)
        total += target.size(0)
        correct += predicted.eq(target).sum().item()
    
    return total_loss / len(loader), 100. * correct / total

# Train for a few epochs
for epoch in range(10):
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
    print(f'Epoch {epoch+1}: Loss={train_loss:.4f}, Acc={train_acc:.2f}%')
```

### Progressive Fine-Tuning

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.models as models

def freeze_layers(model, freeze_until='layer4'):
    """Freeze layers up to specified layer"""
    freeze = True
    for name, child in model.named_children():
        if name == freeze_until:
            freeze = False
        for param in child.parameters():
            param.requires_grad = not freeze

# Load model
model = models.resnet50(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 10)

# Stage 1: Train only classifier
print("Stage 1: Train classifier only")
freeze_layers(model, freeze_until='fc')
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-3)
# Train for 5 epochs...

# Stage 2: Fine-tune layer4
print("Stage 2: Fine-tune layer4")
freeze_layers(model, freeze_until='layer4')
optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4)
# Train for 5 epochs...

# Stage 3: Fine-tune all layers
print("Stage 3: Fine-tune all layers")
for param in model.parameters():
    param.requires_grad = True
optimizer = optim.Adam(model.parameters(), lr=1e-5)
# Train for 5 epochs...
```

## Working with Different Architectures

### ResNet

```python
import torchvision.models as models

# ResNet family
resnet18 = models.resnet18(pretrained=True)
resnet34 = models.resnet34(pretrained=True)
resnet50 = models.resnet50(pretrained=True)
resnet101 = models.resnet101(pretrained=True)

# Modify for custom classes
num_classes = 10
resnet18.fc = nn.Linear(resnet18.fc.in_features, num_classes)
```

### VGG

```python
# VGG family
vgg16 = models.vgg16(pretrained=True)
vgg19 = models.vgg19(pretrained=True)

# Modify classifier
num_classes = 10
vgg16.classifier[6] = nn.Linear(4096, num_classes)
```

### EfficientNet

```python
# EfficientNet family
efficientnet_b0 = models.efficientnet_b0(pretrained=True)
efficientnet_b7 = models.efficientnet_b7(pretrained=True)

# Modify classifier
num_classes = 10
efficientnet_b0.classifier[1] = nn.Linear(
    efficientnet_b0.classifier[1].in_features,
    num_classes
)
```

### Vision Transformer (ViT)

```python
# Vision Transformer
vit = models.vit_b_16(pretrained=True)

# Modify head
num_classes = 10
vit.heads = nn.Linear(vit.heads.head.in_features, num_classes)
```

## Custom Classifier Head

### Simple Head

```python
class SimpleHead(nn.Module):
    def __init__(self, in_features, num_classes):
        super().__init__()
        self.fc = nn.Linear(in_features, num_classes)
    
    def forward(self, x):
        return self.fc(x)

model = models.resnet50(pretrained=True)
model.fc = SimpleHead(model.fc.in_features, 10)
```

### Advanced Head

```python
class AdvancedHead(nn.Module):
    def __init__(self, in_features, num_classes, hidden_dim=512):
        super().__init__()
        self.head = nn.Sequential(
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(hidden_dim // 2, num_classes)
        )
    
    def forward(self, x):
        return self.head(x)

model = models.resnet50(pretrained=True)
model.fc = AdvancedHead(model.fc.in_features, 10)
```

## Feature Extraction for Embeddings

### Extract Features

```python
import torch
import torchvision.models as models

class FeatureExtractor(nn.Module):
    def __init__(self, model_name='resnet50'):
        super().__init__()
        
        # Load pretrained model
        if model_name == 'resnet50':
            model = models.resnet50(pretrained=True)
            # Remove final FC layer
            self.features = nn.Sequential(*list(model.children())[:-1])
        
        # Freeze
        for param in self.features.parameters():
            param.requires_grad = False
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return x

# Usage
extractor = FeatureExtractor()
extractor.eval()

with torch.no_grad():
    features = extractor(images)
    print(f"Features shape: {features.shape}")  # [batch, 2048]
```

### Similarity Search

```python
import torch
import torch.nn.functional as F

def extract_embeddings(model, dataloader, device):
    """Extract embeddings for all images"""
    model.eval()
    embeddings = []
    labels = []
    
    with torch.no_grad():
        for data, target in dataloader:
            data = data.to(device)
            embedding = model(data)
            embeddings.append(embedding.cpu())
            labels.append(target)
    
    return torch.cat(embeddings), torch.cat(labels)

def find_similar(query_embedding, embeddings, k=5):
    """Find k most similar embeddings"""
    # Cosine similarity
    similarities = F.cosine_similarity(
        query_embedding.unsqueeze(0),
        embeddings
    )
    
    # Get top k
    top_k = similarities.topk(k)
    return top_k.indices, top_k.values

# Extract embeddings
extractor = FeatureExtractor().to(device)
embeddings, labels = extract_embeddings(extractor, dataloader, device)

# Find similar images
query_emb = embeddings[0]
indices, scores = find_similar(query_emb, embeddings, k=5)
print(f"Most similar: {indices}")
print(f"Scores: {scores}")
```

## Multi-Task Learning

### Multiple Heads

```python
class MultiTaskModel(nn.Module):
    def __init__(self, num_classes_task1, num_classes_task2):
        super().__init__()
        
        # Shared backbone
        backbone = models.resnet50(pretrained=True)
        self.features = nn.Sequential(*list(backbone.children())[:-1])
        
        # Task-specific heads
        in_features = 2048
        self.head_task1 = nn.Linear(in_features, num_classes_task1)
        self.head_task2 = nn.Linear(in_features, num_classes_task2)
    
    def forward(self, x):
        # Shared features
        features = self.features(x)
        features = features.view(features.size(0), -1)
        
        # Task outputs
        out1 = self.head_task1(features)
        out2 = self.head_task2(features)
        
        return out1, out2

# Training
model = MultiTaskModel(num_classes_task1=10, num_classes_task2=5)
criterion1 = nn.CrossEntropyLoss()
criterion2 = nn.CrossEntropyLoss()

for data, (target1, target2) in dataloader:
    out1, out2 = model(data)
    loss1 = criterion1(out1, target1)
    loss2 = criterion2(out2, target2)
    
    # Combined loss
    loss = loss1 + 0.5 * loss2  # Weight tasks differently
    loss.backward()
    optimizer.step()
```

## Domain Adaptation

### Fine-tune on New Domain

```python
def adapt_to_new_domain(model, source_loader, target_loader, epochs=10):
    """Adapt model from source to target domain"""
    
    # Freeze early layers
    for name, param in model.named_parameters():
        if 'layer1' in name or 'layer2' in name:
            param.requires_grad = False
    
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=1e-4
    )
    
    for epoch in range(epochs):
        model.train()
        
        # Train on target domain
        for data, target in target_loader:
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
    
    return model
```

## Best Practices

### 1. Learning Rate Selection

```python
def get_optimizer(model, base_lr=1e-3):
    """Different LR for different parts"""
    
    # Identify layer groups
    backbone_params = []
    head_params = []
    
    for name, param in model.named_parameters():
        if 'fc' in name or 'classifier' in name:
            head_params.append(param)
        else:
            backbone_params.append(param)
    
    optimizer = optim.Adam([
        {'params': backbone_params, 'lr': base_lr * 0.1},  # 10x smaller
        {'params': head_params, 'lr': base_lr}
    ])
    
    return optimizer
```

### 2. Gradual Unfreezing

```python
def unfreeze_gradually(model, epoch, unfreeze_schedule):
    """Unfreeze layers according to schedule"""
    
    for layer_name, unfreeze_epoch in unfreeze_schedule.items():
        if epoch >= unfreeze_epoch:
            for name, param in model.named_parameters():
                if layer_name in name:
                    param.requires_grad = True

# Usage
schedule = {
    'layer4': 5,
    'layer3': 10,
    'layer2': 15,
    'layer1': 20
}

for epoch in range(25):
    unfreeze_gradually(model, epoch, schedule)
    train_epoch(...)
```

### 3. Data Augmentation

```python
from torchvision import transforms

# Stronger augmentation for fine-tuning
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
```

## Decision Guide

### When to use Feature Extraction:
- Very small dataset (<1000 samples)
- Limited compute resources
- Very similar task to pre-trained model
- Quick prototyping

### When to use Fine-Tuning:
- Medium dataset (1000-100k samples)
- Sufficient compute resources
- Somewhat different task
- Want best performance

### Training from Scratch:
- Very large dataset (>100k samples)
- Very different domain
- Unique architecture needed
- Lots of compute resources

## Next Steps

Continue to [Chapter 15: Model Saving & Loading](15-model-saving.md) to learn about:
- Saving checkpoints
- Loading models
- Model versioning
- Deployment preparation

## Key Takeaways

- ✅ Transfer learning saves time and improves performance
- ✅ Feature extraction: freeze backbone, train new head
- ✅ Fine-tuning: use smaller learning rate for pre-trained layers
- ✅ Progressive unfreezing often works better
- ✅ Use different learning rates for different parts
- ✅ Always normalize inputs correctly for pre-trained models

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Transfer Learning Tutorial](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Complete transfer learning guide
    2. [torchvision.models](https://pytorch.org/vision/stable/models.html) - Pre-trained models
    3. [Model Zoo](https://pytorch.org/vision/stable/models.html) - Available models
    4. [Fine-Tuning Guide](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Fine-tuning strategies

???+ "📖 Essential Articles"
    1. [Transfer Learning Explained](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Transfer learning concepts
    2. [Feature Extraction vs Fine-Tuning](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - When to use each
    3. [Progressive Unfreezing](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Advanced techniques
    4. [Domain Adaptation](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Adapting to new domains

???+ "🎓 Learning Resources"
    1. [Computer Vision Transfer Learning](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - CV examples
    2. [NLP Transfer Learning](https://huggingface.co/transformers/) - Hugging Face transformers
    3. [Transfer Learning Best Practices](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Optimization tips

???+ "💡 Best Practices"
    1. [Learning Rate Selection](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - Choosing LRs for fine-tuning
    2. [Freezing Layers](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html) - When to freeze
    3. [Data Augmentation](https://pytorch.org/vision/stable/transforms.html) - Augmentation for transfer learning

???+ "🔬 Research Papers"
    1. [How transferable are features in deep neural networks?](https://arxiv.org/abs/1411.1792) - Transfer learning analysis
    2. [Rethinking ImageNet Pre-training](https://arxiv.org/abs/1811.08883) - Pre-training effectiveness
    3. [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805) - NLP transfer learning

---
