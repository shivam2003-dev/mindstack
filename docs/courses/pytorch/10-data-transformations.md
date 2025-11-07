# Chapter 10: Data Transformations & Augmentation

Data transformations prepare and augment your data for training. PyTorch's `torchvision.transforms` module provides powerful tools for image preprocessing and augmentation.

## Basic Transformations

### Image Preprocessing

```python
import torchvision.transforms as transforms
from PIL import Image

# Basic preprocessing pipeline
transform = transforms.Compose([
    transforms.Resize(256),                # Resize shorter side to 256
    transforms.CenterCrop(224),            # Center crop to 224x224
    transforms.ToTensor(),                 # Convert to tensor [0, 1]
    transforms.Normalize(                  # Normalize
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Apply to image
image = Image.open('image.jpg')
tensor = transform(image)
print(tensor.shape)  # torch.Size([3, 224, 224])
```

### Common Transforms

```python
# Resize
resize = transforms.Resize((224, 224))  # Exact size
resize_ratio = transforms.Resize(256)   # Shorter side to 256

# Crop
center_crop = transforms.CenterCrop(224)
random_crop = transforms.RandomCrop(224, padding=4)
random_resized_crop = transforms.RandomResizedCrop(224, scale=(0.8, 1.0))

# Flip
hflip = transforms.RandomHorizontalFlip(p=0.5)
vflip = transforms.RandomVerticalFlip(p=0.5)

# Rotation
rotate = transforms.RandomRotation(degrees=15)

# Color
color_jitter = transforms.ColorJitter(
    brightness=0.2,
    contrast=0.2,
    saturation=0.2,
    hue=0.1
)
grayscale = transforms.Grayscale(num_output_channels=3)

# Convert
to_tensor = transforms.ToTensor()
to_pil = transforms.ToPILImage()

# Normalize
normalize = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
)
```

## Data Augmentation

### Training vs Validation Transforms

```python
# Training: with augmentation
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Validation: no augmentation
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Apply to datasets
train_dataset = datasets.ImageFolder('train/', transform=train_transform)
val_dataset = datasets.ImageFolder('val/', transform=val_transform)
```

### Advanced Augmentation Techniques

```python
import torchvision.transforms as transforms

# RandAugment (AutoAugment simplified)
from torchvision.transforms import RandAugment

advanced_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    RandAugment(num_ops=2, magnitude=9),  # Apply 2 random operations
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
```

### MixUp and CutMix

```python
import torch
import numpy as np

def mixup_data(x, y, alpha=1.0):
    """MixUp augmentation"""
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    
    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    
    return mixed_x, y_a, y_b, lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    """MixUp loss"""
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)

# Training with MixUp
for images, labels in train_loader:
    # Apply MixUp
    images, labels_a, labels_b, lam = mixup_data(images, labels, alpha=1.0)
    
    # Forward
    outputs = model(images)
    
    # Compute MixUp loss
    loss = mixup_criterion(criterion, outputs, labels_a, labels_b, lam)
    
    # Backward
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

```python
def cutmix_data(x, y, alpha=1.0):
    """CutMix augmentation"""
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    
    # Generate random box
    W, H = x.size(2), x.size(3)
    cut_rat = np.sqrt(1. - lam)
    cut_w = int(W * cut_rat)
    cut_h = int(H * cut_rat)
    
    cx = np.random.randint(W)
    cy = np.random.randint(H)
    
    bbx1 = np.clip(cx - cut_w // 2, 0, W)
    bby1 = np.clip(cy - cut_h // 2, 0, H)
    bbx2 = np.clip(cx + cut_w // 2, 0, W)
    bby2 = np.clip(cy + cut_h // 2, 0, H)
    
    # Apply CutMix
    x[:, :, bbx1:bbx2, bby1:bby2] = x[index, :, bbx1:bbx2, bby1:bby2]
    
    # Adjust lambda
    lam = 1 - ((bbx2 - bbx1) * (bby2 - bby1) / (W * H))
    
    y_a, y_b = y, y[index]
    return x, y_a, y_b, lam
```

## Custom Transforms

### Simple Custom Transform

```python
class AddGaussianNoise:
    """Add Gaussian noise to tensor"""
    
    def __init__(self, mean=0., std=1.):
        self.std = std
        self.mean = mean
    
    def __call__(self, tensor):
        noise = torch.randn(tensor.size()) * self.std + self.mean
        return tensor + noise
    
    def __repr__(self):
        return f'{self.__class__.__name__}(mean={self.mean}, std={self.std})'

# Usage
transform = transforms.Compose([
    transforms.ToTensor(),
    AddGaussianNoise(0., 0.1),
    transforms.Normalize([0.5], [0.5])
])
```

### Complex Custom Transform

```python
import random
import cv2
import numpy as np

class RandomErase:
    """Random erasing augmentation"""
    
    def __init__(self, p=0.5, scale=(0.02, 0.33), ratio=(0.3, 3.3)):
        self.p = p
        self.scale = scale
        self.ratio = ratio
    
    def __call__(self, img):
        if random.random() > self.p:
            return img
        
        # Convert to numpy if PIL Image
        if not isinstance(img, np.ndarray):
            img = np.array(img)
        
        h, w = img.shape[:2]
        area = h * w
        
        for _ in range(100):
            target_area = random.uniform(*self.scale) * area
            aspect_ratio = random.uniform(*self.ratio)
            
            h_erase = int(round(np.sqrt(target_area * aspect_ratio)))
            w_erase = int(round(np.sqrt(target_area / aspect_ratio)))
            
            if w_erase < w and h_erase < h:
                x1 = random.randint(0, w - w_erase)
                y1 = random.randint(0, h - h_erase)
                
                img[y1:y1+h_erase, x1:x1+w_erase] = np.random.randint(0, 255, (h_erase, w_erase, 3))
                break
        
        return Image.fromarray(img)

# Usage
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    RandomErase(p=0.5),
    transforms.ToTensor()
])
```

## Albumentations Library

For more advanced augmentations, use Albumentations:

```python
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

# Define augmentation pipeline
transform = A.Compose([
    A.Resize(256, 256),
    A.RandomCrop(224, 224),
    A.HorizontalFlip(p=0.5),
    A.ShiftScaleRotate(shift_limit=0.0625, scale_limit=0.1, rotate_limit=15, p=0.5),
    A.OneOf([
        A.GaussNoise(),
        A.GaussianBlur(),
        A.MotionBlur(),
    ], p=0.3),
    A.OneOf([
        A.OpticalDistortion(),
        A.GridDistortion(),
        A.ElasticTransform(),
    ], p=0.3),
    A.CLAHE(clip_limit=2.0, p=0.3),
    A.CoarseDropout(max_holes=8, max_height=32, max_width=32, p=0.3),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2()
])

# Custom Dataset with Albumentations
class AlbumentationsDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # Read image
        image = cv2.imread(self.image_paths[idx])
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Apply transform
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented['image']
        
        label = self.labels[idx]
        return image, label

# Usage
dataset = AlbumentationsDataset(image_paths, labels, transform=transform)
```

## Computing Dataset Statistics

```python
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

def compute_mean_std(dataset):
    """Compute mean and std of dataset"""
    loader = DataLoader(
        dataset,
        batch_size=64,
        num_workers=4,
        shuffle=False
    )
    
    mean = 0.
    std = 0.
    total_images = 0
    
    for images, _ in loader:
        batch_samples = images.size(0)
        images = images.view(batch_samples, images.size(1), -1)
        mean += images.mean(2).sum(0)
        std += images.std(2).sum(0)
        total_images += batch_samples
    
    mean /= total_images
    std /= total_images
    
    return mean, std

# Usage
dataset = datasets.ImageFolder('data/train', transform=transforms.ToTensor())
mean, std = compute_mean_std(dataset)
print(f"Mean: {mean}")
print(f"Std: {std}")
```

## Transform Composition

### Conditional Transforms

```python
class ConditionalTransform:
    """Apply transform based on condition"""
    
    def __init__(self, condition_fn, transform):
        self.condition_fn = condition_fn
        self.transform = transform
    
    def __call__(self, img):
        if self.condition_fn(img):
            return self.transform(img)
        return img

# Example: Only augment small images
transform = ConditionalTransform(
    condition_fn=lambda img: min(img.size) < 224,
    transform=transforms.Resize(224)
)
```

### Sequential vs Parallel Transforms

```python
# Sequential: One after another
sequential = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    transforms.ToTensor()
])

# Parallel: Choose one randomly
parallel = transforms.RandomChoice([
    transforms.ColorJitter(brightness=0.3),
    transforms.RandomGrayscale(p=1.0),
    transforms.RandomPosterize(bits=2)
])

# Combined
combined = transforms.Compose([
    transforms.Resize(256),
    parallel,  # Apply one of the color transforms
    transforms.RandomCrop(224),
    transforms.ToTensor()
])
```

## Test-Time Augmentation (TTA)

```python
import torch
import torch.nn.functional as F

class TTAWrapper:
    """Test-Time Augmentation wrapper"""
    
    def __init__(self, model, transforms):
        self.model = model
        self.transforms = transforms
    
    @torch.no_grad()
    def predict(self, image):
        """Predict with TTA"""
        predictions = []
        
        for transform in self.transforms:
            # Apply transform
            aug_image = transform(image)
            
            # Predict
            output = self.model(aug_image.unsqueeze(0))
            pred = F.softmax(output, dim=1)
            predictions.append(pred)
        
        # Average predictions
        avg_pred = torch.stack(predictions).mean(0)
        return avg_pred

# Define TTA transforms
tta_transforms = [
    transforms.Compose([transforms.ToTensor(), normalize]),  # Original
    transforms.Compose([transforms.RandomHorizontalFlip(p=1.0), transforms.ToTensor(), normalize]),  # Flip
    transforms.Compose([transforms.RandomRotation(5), transforms.ToTensor(), normalize]),  # Rotate
    transforms.Compose([transforms.ColorJitter(brightness=0.1), transforms.ToTensor(), normalize]),  # Brightness
]

# Usage
tta_model = TTAWrapper(model, tta_transforms)
prediction = tta_model.predict(image)
```

## Best Practices

### 1. Start Simple

```python
# Start with basic transforms
basic_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Gradually add augmentation
augmented_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
```

### 2. Match Augmentation to Task

```python
# Classification: Aggressive augmentation OK
classification_transform = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.5, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(30),
    transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Segmentation: Preserve spatial structure
segmentation_transform = transforms.Compose([
    transforms.RandomCrop((512, 512)),
    transforms.RandomHorizontalFlip(),
    # No rotation or heavy distortion!
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
```

### 3. Validate Your Augmentations

```python
import matplotlib.pyplot as plt

def visualize_augmentations(dataset, transform, num_samples=5):
    """Visualize augmentation effects"""
    fig, axes = plt.subplots(num_samples, 5, figsize=(15, 3*num_samples))
    
    for i in range(num_samples):
        # Get original image
        image, _ = dataset[i]
        
        # Show original
        axes[i, 0].imshow(image)
        axes[i, 0].set_title('Original')
        axes[i, 0].axis('off')
        
        # Show augmented versions
        for j in range(1, 5):
            aug_image = transform(image)
            axes[i, j].imshow(aug_image.permute(1, 2, 0))
            axes[i, j].set_title(f'Aug {j}')
            axes[i, j].axis('off')
    
    plt.tight_layout()
    plt.show()

# Usage
visualize_augmentations(dataset, train_transform)
```

## Next Steps

Continue to [Chapter 11: Custom Datasets](11-custom-datasets.md) to learn:
- Building custom datasets
- Handling different data formats
- Advanced data loading patterns

## Key Takeaways

- ✅ Use `transforms.Compose()` to chain transformations
- ✅ Different transforms for training vs validation
- ✅ MixUp and CutMix improve generalization
- ✅ Always normalize using dataset statistics
- ✅ Start simple, add augmentation gradually
- ✅ Visualize augmentations before training
- ✅ Test-Time Augmentation can boost accuracy

---

**Reference:**
- [torchvision.transforms](https://pytorch.org/vision/stable/transforms.html)
- [Albumentations](https://albumentations.ai/)
