# Chapter 12: Convolutional Neural Networks (CNNs)

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🖼️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand CNN architecture</li>
    <li>Implement convolutional and pooling layers</li>
    <li>Build complete CNN models</li>
    <li>Apply CNNs to image tasks</li>
  </ul>
</div>

Convolutional Neural Networks are specialized neural networks for processing grid-like data, especially images.

## Why CNNs for Images?

!!! note "Why CNNs Work for Images"
    CNNs are designed to capture spatial hierarchies in images. Convolutional layers detect local patterns (edges, textures), pooling layers reduce spatial dimensions, and deeper layers combine these into complex features (objects, scenes).

!!! tip "CNN Architecture Tips"
    Start with a simple CNN (2-3 conv layers) and gradually add complexity. Use padding='same' to preserve spatial dimensions, and add pooling layers to reduce computational cost. Batch normalization after convolutions often improves training stability.

**Problems with Fully Connected Networks:**
- Too many parameters (28×28 image = 784 parameters per neuron)
- No spatial information preservation
- Not translation invariant

**CNN Advantages:**
- ✅ Parameter sharing
- ✅ Spatial hierarchies
- ✅ Translation invariance
- ✅ Local connectivity

## Convolutional Layer

### Basic Conv2d

```python
import torch
import torch.nn as nn

# Convolutional layer
conv = nn.Conv2d(
    in_channels=3,      # RGB input
    out_channels=64,    # 64 filters
    kernel_size=3,      # 3x3 kernel
    stride=1,          # Step size
    padding=1,         # Keep spatial size
    bias=True
)

# Input: [batch, channels, height, width]
x = torch.randn(16, 3, 224, 224)
output = conv(x)
print(f"Output shape: {output.shape}")  # [16, 64, 224, 224]
```

**Output Size Formula:**
$$\text{output\_size} = \frac{\text{input\_size} + 2 \times \text{padding} - \text{kernel\_size}}{\text{stride}} + 1$$

### Understanding Parameters

```python
# Number of parameters
in_ch, out_ch, k = 3, 64, 3
params = out_ch * (in_ch * k * k + 1)  # +1 for bias
print(f"Parameters: {params:,}")  # 1,792

# Verify
conv = nn.Conv2d(3, 64, 3)
actual_params = sum(p.numel() for p in conv.parameters())
print(f"Actual: {actual_params:,}")
```

### Padding Modes

```python
# Valid (no padding)
conv_valid = nn.Conv2d(3, 64, 3, padding=0)  # Output shrinks

# Same (preserve size)
conv_same = nn.Conv2d(3, 64, 3, padding=1)  # Output same size

# Custom padding
conv_custom = nn.Conv2d(3, 64, 3, padding=2)

# Different padding for H and W
conv_asym = nn.Conv2d(3, 64, 3, padding=(1, 2))
```

### Stride and Dilation

```python
# Stride: Downsampling
conv_stride = nn.Conv2d(3, 64, 3, stride=2, padding=1)
x = torch.randn(1, 3, 224, 224)
out = conv_stride(x)
print(f"Strided output: {out.shape}")  # [1, 64, 112, 112]

# Dilation: Expand receptive field
conv_dilated = nn.Conv2d(3, 64, 3, dilation=2, padding=2)
```

## Pooling Layers

### Max Pooling

```python
import torch.nn as nn

# Max pooling
maxpool = nn.MaxPool2d(kernel_size=2, stride=2)

x = torch.randn(1, 64, 56, 56)
out = maxpool(x)
print(f"After maxpool: {out.shape}")  # [1, 64, 28, 28]

# Non-square kernel
maxpool_rect = nn.MaxPool2d(kernel_size=(2, 3), stride=(2, 3))
```

### Average Pooling

```python
# Average pooling
avgpool = nn.AvgPool2d(kernel_size=2, stride=2)

x = torch.randn(1, 64, 56, 56)
out = avgpool(x)
print(f"After avgpool: {out.shape}")  # [1, 64, 28, 28]
```

### Adaptive Pooling

```python
# Adaptive: specify output size, not kernel size
adaptive_maxpool = nn.AdaptiveMaxPool2d((7, 7))
adaptive_avgpool = nn.AdaptiveAvgPool2d((1, 1))  # Global pooling

x = torch.randn(1, 512, 14, 14)
out = adaptive_avgpool(x)
print(f"Global pooling: {out.shape}")  # [1, 512, 1, 1]

# Flatten
out = out.view(out.size(0), -1)
print(f"Flattened: {out.shape}")  # [1, 512]
```

## Building CNN Architectures

### Simple CNN

```python
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(SimpleCNN, self).__init__()
        
        # Convolution layers
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        
        # Pooling
        self.pool = nn.MaxPool2d(2, 2)
        
        # Fully connected
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.fc2 = nn.Linear(512, num_classes)
        
        # Dropout
        self.dropout = nn.Dropout(0.5)
    
    def forward(self, x):
        # Input: [B, 3, 32, 32]
        
        # Conv block 1
        x = F.relu(self.conv1(x))  # [B, 32, 32, 32]
        x = self.pool(x)            # [B, 32, 16, 16]
        
        # Conv block 2
        x = F.relu(self.conv2(x))  # [B, 64, 16, 16]
        x = self.pool(x)            # [B, 64, 8, 8]
        
        # Conv block 3
        x = F.relu(self.conv3(x))  # [B, 128, 8, 8]
        x = self.pool(x)            # [B, 128, 4, 4]
        
        # Flatten
        x = x.view(x.size(0), -1)  # [B, 128*4*4]
        
        # Fully connected
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x

# Create model
model = SimpleCNN(num_classes=10)

# Test
x = torch.randn(4, 3, 32, 32)
output = model(x)
print(f"Output shape: {output.shape}")  # [4, 10]
```

### VGG-Style Network

```python
import torch.nn as nn

class VGGBlock(nn.Module):
    def __init__(self, in_channels, out_channels, num_convs):
        super(VGGBlock, self).__init__()
        
        layers = []
        for i in range(num_convs):
            in_c = in_channels if i == 0 else out_channels
            layers.extend([
                nn.Conv2d(in_c, out_channels, 3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            ])
        
        layers.append(nn.MaxPool2d(2, 2))
        self.block = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.block(x)


class VGGNet(nn.Module):
    def __init__(self, num_classes=1000):
        super(VGGNet, self).__init__()
        
        self.features = nn.Sequential(
            VGGBlock(3, 64, 2),    # 224 -> 112
            VGGBlock(64, 128, 2),  # 112 -> 56
            VGGBlock(128, 256, 3), # 56 -> 28
            VGGBlock(256, 512, 3), # 28 -> 14
            VGGBlock(512, 512, 3), # 14 -> 7
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x
```

### ResNet Block

```python
class ResidualBlock(nn.Module):
    """Residual block with skip connection"""
    
    def __init__(self, in_channels, out_channels, stride=1, downsample=None):
        super(ResidualBlock, self).__init__()
        
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.downsample = downsample
    
    def forward(self, x):
        identity = x
        
        # Main path
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        
        out = self.conv2(out)
        out = self.bn2(out)
        
        # Skip connection
        if self.downsample is not None:
            identity = self.downsample(x)
        
        out += identity
        out = self.relu(out)
        
        return out


class ResNet(nn.Module):
    def __init__(self, block, layers, num_classes=1000):
        super(ResNet, self).__init__()
        
        self.in_channels = 64
        
        # Initial conv
        self.conv1 = nn.Conv2d(3, 64, 7, stride=2, padding=3, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(3, stride=2, padding=1)
        
        # Residual layers
        self.layer1 = self._make_layer(block, 64, layers[0])
        self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
        self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
        self.layer4 = self._make_layer(block, 512, layers[3], stride=2)
        
        # Classification head
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc = nn.Linear(512, num_classes)
    
    def _make_layer(self, block, out_channels, blocks, stride=1):
        downsample = None
        if stride != 1 or self.in_channels != out_channels:
            downsample = nn.Sequential(
                nn.Conv2d(self.in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
        
        layers = []
        layers.append(block(self.in_channels, out_channels, stride, downsample))
        self.in_channels = out_channels
        
        for _ in range(1, blocks):
            layers.append(block(out_channels, out_channels))
        
        return nn.Sequential(*layers)
    
    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)
        
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        
        return x


# Create ResNet-18
def resnet18(num_classes=1000):
    return ResNet(ResidualBlock, [2, 2, 2, 2], num_classes)

model = resnet18(num_classes=10)
```

## Batch Normalization

```python
import torch.nn as nn

class ConvBNReLU(nn.Module):
    """Conv -> BatchNorm -> ReLU pattern"""
    
    def __init__(self, in_channels, out_channels, **kwargs):
        super(ConvBNReLU, self).__init__()
        
        self.conv = nn.Conv2d(in_channels, out_channels, bias=False, **kwargs)
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
    
    def forward(self, x):
        x = self.conv(x)
        x = self.bn(x)
        x = self.relu(x)
        return x

# Usage
layer = ConvBNReLU(3, 64, kernel_size=3, padding=1)
x = torch.randn(16, 3, 224, 224)
out = layer(x)
```

## Modern CNN Techniques

### Depthwise Separable Convolution

```python
class DepthwiseSeparableConv(nn.Module):
    """Efficient convolution (MobileNet)"""
    
    def __init__(self, in_channels, out_channels, kernel_size=3, padding=1):
        super(DepthwiseSeparableConv, self).__init__()
        
        # Depthwise
        self.depthwise = nn.Conv2d(
            in_channels, in_channels, kernel_size,
            padding=padding, groups=in_channels, bias=False
        )
        
        # Pointwise
        self.pointwise = nn.Conv2d(
            in_channels, out_channels, 1, bias=False
        )
        
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
    
    def forward(self, x):
        x = self.depthwise(x)
        x = self.pointwise(x)
        x = self.bn(x)
        x = self.relu(x)
        return x
```

### Squeeze-and-Excitation Block

```python
class SEBlock(nn.Module):
    """Squeeze-and-Excitation block"""
    
    def __init__(self, channels, reduction=16):
        super(SEBlock, self).__init__()
        
        self.squeeze = nn.AdaptiveAvgPool2d(1)
        self.excitation = nn.Sequential(
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        batch, channels, _, _ = x.size()
        
        # Squeeze
        y = self.squeeze(x).view(batch, channels)
        
        # Excitation
        y = self.excitation(y).view(batch, channels, 1, 1)
        
        # Scale
        return x * y.expand_as(x)
```

## Training CNN Example

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Data
transform = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomCrop(32, padding=4),
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

train_dataset = datasets.CIFAR10('data', train=True, download=True, transform=transform)
test_dataset = datasets.CIFAR10('data', train=False, download=True, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True, num_workers=4)
test_loader = DataLoader(test_dataset, batch_size=128, shuffle=False, num_workers=4)

# Model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = resnet18(num_classes=10).to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=5e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=200)

# Training loop
for epoch in range(200):
    model.train()
    train_loss = 0
    correct = 0
    total = 0
    
    for data, target in train_loader:
        data, target = data.to(device), target.to(device)
        
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        
        train_loss += loss.item()
        _, predicted = output.max(1)
        total += target.size(0)
        correct += predicted.eq(target).sum().item()
    
    scheduler.step()
    
    # Validation
    model.eval()
    test_correct = 0
    test_total = 0
    
    with torch.no_grad():
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            _, predicted = output.max(1)
            test_total += target.size(0)
            test_correct += predicted.eq(target).sum().item()
    
    print(f'Epoch: {epoch+1}')
    print(f'Train Acc: {100.*correct/total:.2f}%')
    print(f'Test Acc: {100.*test_correct/test_total:.2f}%')
```

## Pretrained Models

```python
import torchvision.models as models

# Load pretrained model
resnet50 = models.resnet50(pretrained=True)
vgg16 = models.vgg16(pretrained=True)
mobilenet = models.mobilenet_v2(pretrained=True)
efficientnet = models.efficientnet_b0(pretrained=True)

# Use for inference
model = resnet50
model.eval()

with torch.no_grad():
    output = model(input_tensor)
```

## Next Steps

Continue to [Chapter 14: Transfer Learning](14-transfer-learning.md) to learn about:
- Using pretrained models
- Fine-tuning
- Feature extraction
- Domain adaptation

## Key Takeaways

- ✅ CNNs use convolution, pooling, and fully connected layers
- ✅ Batch normalization stabilizes training
- ✅ Skip connections help training deep networks
- ✅ Data augmentation is crucial for CNNs
- ✅ Use pretrained models when possible
- ✅ Modern architectures: ResNet, EfficientNet, Vision Transformers

---

**Reference:**
- [CNN Tutorial](https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html)
- [torchvision.models](https://pytorch.org/vision/stable/models.html)
