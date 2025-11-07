# Chapter 9: Datasets & DataLoaders

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">📊 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand PyTorch's data loading pipeline</li>
    <li>Work with built-in and custom datasets</li>
    <li>Master DataLoader configuration</li>
    <li>Optimize data loading performance</li>
  </ul>
</div>

## PyTorch Data Loading Pipeline

PyTorch provides a powerful and flexible data loading system:

**Flow:** `Dataset` → `DataLoader` → `Model`

- **Dataset**: Stores samples and labels
- **DataLoader**: Wraps dataset for batching, shuffling, parallel loading

!!! tip "Data Loading Best Practices"
    - Use `num_workers > 0` for parallel data loading (typically 4-8 workers)
    - Set `pin_memory=True` when using GPU for faster data transfer
    - Use `persistent_workers=True` to keep workers alive between epochs
    - Shuffle training data but not validation/test data

!!! note "Dataset vs DataLoader"
    `Dataset` defines what data to load and how to load it. `DataLoader` handles batching, shuffling, and parallel loading. Always use DataLoader for training - it's much more efficient than manual batching.

## Dataset Class

### Using Built-in Datasets

```python
from torchvision import datasets, transforms

# MNIST
mnist_train = datasets.MNIST(
    root='./data',
    train=True,
    download=True,
    transform=transforms.ToTensor()
)

mnist_test = datasets.MNIST(
    root='./data',
    train=False,
    download=True,
    transform=transforms.ToTensor()
)

# CIFAR-10
cifar_train = datasets.CIFAR10(
    root='./data',
    train=True,
    download=True,
    transform=transforms.ToTensor()
)

# ImageNet (requires download)
imagenet = datasets.ImageNet(
    root='./data/imagenet',
    split='train',
    transform=transforms.ToTensor()
)

# Fashion MNIST
fashion = datasets.FashionMNIST(
    root='./data',
    train=True,
    download=True,
    transform=transforms.ToTensor()
)
```

### Custom Dataset

```python
import torch
from torch.utils.data import Dataset
import pandas as pd
from PIL import Image

class CustomDataset(Dataset):
    """Custom dataset template"""
    
    def __init__(self, data_path, transform=None):
        """
        Args:
            data_path: Path to data
            transform: Optional transform to apply
        """
        self.data_path = data_path
        self.transform = transform
        
        # Load your data here
        self.data = self.load_data()
    
    def load_data(self):
        """Load and prepare data"""
        # Your data loading logic
        pass
    
    def __len__(self):
        """Return the total number of samples"""
        return len(self.data)
    
    def __getitem__(self, idx):
        """
        Get a sample at index idx
        
        Args:
            idx: Index of sample
            
        Returns:
            sample, label
        """
        # Load sample
        sample = self.data[idx]
        
        # Apply transform if specified
        if self.transform:
            sample = self.transform(sample)
        
        return sample, label


# Usage
dataset = CustomDataset(data_path='./data', transform=transforms.ToTensor())
print(f"Dataset size: {len(dataset)}")

# Get one sample
sample, label = dataset[0]
print(f"Sample shape: {sample.shape}")
```

### Image Dataset Example

```python
import torch
from torch.utils.data import Dataset
from PIL import Image
import os

class ImageDataset(Dataset):
    """Load images from folder"""
    
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        
        # Get all image paths and labels
        self.images = []
        self.labels = []
        
        # Assuming structure: root_dir/class_name/image.jpg
        for class_idx, class_name in enumerate(sorted(os.listdir(root_dir))):
            class_path = os.path.join(root_dir, class_name)
            if os.path.isdir(class_path):
                for img_name in os.listdir(class_path):
                    if img_name.endswith(('.jpg', '.png', '.jpeg')):
                        self.images.append(os.path.join(class_path, img_name))
                        self.labels.append(class_idx)
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        # Load image
        img_path = self.images[idx]
        image = Image.open(img_path).convert('RGB')
        label = self.labels[idx]
        
        # Apply transform
        if self.transform:
            image = self.transform(image)
        
        return image, label


# Usage
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                       std=[0.229, 0.224, 0.225])
])

dataset = ImageDataset(root_dir='./images', transform=transform)
```

### CSV Dataset Example

```python
import torch
from torch.utils.data import Dataset
import pandas as pd
import numpy as np

class CSVDataset(Dataset):
    """Load tabular data from CSV"""
    
    def __init__(self, csv_file, feature_cols, label_col):
        # Read CSV
        self.data = pd.read_csv(csv_file)
        
        # Extract features and labels
        self.features = self.data[feature_cols].values.astype(np.float32)
        self.labels = self.data[label_col].values.astype(np.int64)
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        features = torch.from_numpy(self.features[idx])
        label = torch.tensor(self.labels[idx])
        return features, label


# Usage
dataset = CSVDataset(
    csv_file='data.csv',
    feature_cols=['feat1', 'feat2', 'feat3'],
    label_col='target'
)
```

## DataLoader

### Basic DataLoader

```python
from torch.utils.data import DataLoader

# Create DataLoader
train_loader = DataLoader(
    dataset=train_dataset,
    batch_size=32,
    shuffle=True,      # Shuffle for training
    num_workers=4,     # Number of parallel workers
    pin_memory=True    # Faster data transfer to GPU
)

# Iterate through batches
for batch_idx, (data, target) in enumerate(train_loader):
    print(f"Batch {batch_idx}:")
    print(f"  Data shape: {data.shape}")
    print(f"  Target shape: {target.shape}")
    
    if batch_idx >= 2:  # Just show first 3 batches
        break
```

### DataLoader Parameters

```python
from torch.utils.data import DataLoader

loader = DataLoader(
    dataset=dataset,
    
    # Batch size
    batch_size=32,
    
    # Shuffling
    shuffle=True,           # Shuffle data each epoch
    
    # Parallel loading
    num_workers=4,          # Number of worker processes
    prefetch_factor=2,      # Batches to prefetch per worker
    persistent_workers=True, # Keep workers alive between epochs
    
    # Memory optimization
    pin_memory=True,        # Pin memory for faster GPU transfer
    
    # Batch handling
    drop_last=False,        # Drop last incomplete batch
    
    # Sampling
    sampler=None,           # Custom sampler
    batch_sampler=None,     # Custom batch sampler
    
    # Collation
    collate_fn=None,        # Custom batch collation
)
```

### Train vs Validation DataLoader

```python
# Training DataLoader
train_loader = DataLoader(
    train_dataset,
    batch_size=64,
    shuffle=True,          # Shuffle for training
    num_workers=4,
    pin_memory=True
)

# Validation DataLoader
val_loader = DataLoader(
    val_dataset,
    batch_size=128,         # Can use larger batch for validation
    shuffle=False,          # No need to shuffle validation
    num_workers=4,
    pin_memory=True
)

# Test DataLoader
test_loader = DataLoader(
    test_dataset,
    batch_size=128,
    shuffle=False,
    num_workers=4,
    pin_memory=True
)
```

## Data Splitting

### Train/Val/Test Split

```python
from torch.utils.data import random_split

# Split dataset: 70% train, 15% val, 15% test
dataset_size = len(dataset)
train_size = int(0.7 * dataset_size)
val_size = int(0.15 * dataset_size)
test_size = dataset_size - train_size - val_size

train_dataset, val_dataset, test_dataset = random_split(
    dataset,
    [train_size, val_size, test_size],
    generator=torch.Generator().manual_seed(42)  # For reproducibility
)

print(f"Train size: {len(train_dataset)}")
print(f"Val size: {len(val_dataset)}")
print(f"Test size: {len(test_dataset)}")
```

### Stratified Split

```python
from sklearn.model_selection import train_test_split
from torch.utils.data import Subset

# Get all labels
all_labels = [label for _, label in dataset]

# Stratified split
indices = list(range(len(dataset)))
train_idx, test_idx = train_test_split(
    indices,
    test_size=0.2,
    stratify=all_labels,
    random_state=42
)

# Create subsets
train_dataset = Subset(dataset, train_idx)
test_dataset = Subset(dataset, test_idx)
```

## Samplers

### Random Sampler

```python
from torch.utils.data import RandomSampler, DataLoader

sampler = RandomSampler(dataset)
loader = DataLoader(dataset, batch_size=32, sampler=sampler)
```

### Weighted Random Sampler (for Imbalanced Data)

```python
from torch.utils.data import WeightedRandomSampler
import numpy as np

# Calculate class weights
labels = [label for _, label in dataset]
class_counts = np.bincount(labels)
class_weights = 1. / class_counts
sample_weights = [class_weights[label] for label in labels]

# Create sampler
sampler = WeightedRandomSampler(
    weights=sample_weights,
    num_samples=len(sample_weights),
    replacement=True
)

# Use in DataLoader
loader = DataLoader(dataset, batch_size=32, sampler=sampler)
```

### Subset Random Sampler

```python
from torch.utils.data import SubsetRandomSampler

# Use subset of data
indices = list(range(1000))  # First 1000 samples
sampler = SubsetRandomSampler(indices)

loader = DataLoader(dataset, batch_size=32, sampler=sampler)
```

## Custom Collate Function

### Default Behavior

```python
# Default: stack tensors into batch
# Input: List of (sample, label) tuples
# Output: (batch_samples, batch_labels) tensors
```

### Custom Collate

```python
def custom_collate_fn(batch):
    """
    Custom batch collation
    
    Args:
        batch: List of (sample, label) tuples
        
    Returns:
        Batched data
    """
    # Separate data and labels
    data = [item[0] for item in batch]
    labels = [item[1] for item in batch]
    
    # Custom processing
    # For variable-length sequences:
    max_len = max([len(seq) for seq in data])
    padded_data = [pad_sequence(seq, max_len) for seq in data]
    
    # Stack
    data = torch.stack(padded_data)
    labels = torch.tensor(labels)
    
    return data, labels

# Use in DataLoader
loader = DataLoader(
    dataset,
    batch_size=32,
    collate_fn=custom_collate_fn
)
```

### Padding Variable-Length Sequences

```python
from torch.nn.utils.rnn import pad_sequence

def collate_variable_length(batch):
    """Pad variable-length sequences"""
    # batch is list of (sequence, label)
    sequences = [item[0] for item in batch]
    labels = [item[1] for item in batch]
    
    # Pad sequences
    padded = pad_sequence(sequences, batch_first=True, padding_value=0)
    labels = torch.tensor(labels)
    
    # Get lengths for packing (optional)
    lengths = torch.tensor([len(seq) for seq in sequences])
    
    return padded, labels, lengths
```

## Data Augmentation

### Image Augmentation

```python
from torchvision import transforms

# Training transforms (with augmentation)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                       std=[0.229, 0.224, 0.225])
])

# Validation/Test transforms (no augmentation)
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                       std=[0.229, 0.224, 0.225])
])

# Apply to datasets
train_dataset = ImageDataset(train_dir, transform=train_transform)
val_dataset = ImageDataset(val_dir, transform=val_transform)
```

### Custom Transform

```python
import torch
import random

class AddNoise:
    """Add random noise to tensor"""
    def __init__(self, noise_level=0.1):
        self.noise_level = noise_level
    
    def __call__(self, tensor):
        noise = torch.randn_like(tensor) * self.noise_level
        return tensor + noise

class RandomMask:
    """Randomly mask parts of input"""
    def __init__(self, mask_prob=0.1):
        self.mask_prob = mask_prob
    
    def __call__(self, tensor):
        mask = torch.rand_like(tensor) > self.mask_prob
        return tensor * mask

# Use in transform pipeline
transform = transforms.Compose([
    transforms.ToTensor(),
    AddNoise(noise_level=0.05),
    RandomMask(mask_prob=0.1),
    transforms.Normalize((0.5,), (0.5,))
])
```

## Efficient Data Loading

### Prefetching

```python
class DataPrefetcher:
    """Prefetch data to GPU"""
    def __init__(self, loader, device):
        self.loader = iter(loader)
        self.device = device
        self.stream = torch.cuda.Stream()
        self.preload()
    
    def preload(self):
        try:
            self.next_data, self.next_target = next(self.loader)
        except StopIteration:
            self.next_data = None
            self.next_target = None
            return
        
        with torch.cuda.stream(self.stream):
            self.next_data = self.next_data.to(self.device, non_blocking=True)
            self.next_target = self.next_target.to(self.device, non_blocking=True)
    
    def next(self):
        torch.cuda.current_stream().wait_stream(self.stream)
        data = self.next_data
        target = self.next_target
        if data is not None:
            self.preload()
        return data, target

# Usage
prefetcher = DataPrefetcher(train_loader, device='cuda')
data, target = prefetcher.next()
while data is not None:
    # Training code
    data, target = prefetcher.next()
```

### Finding Optimal num_workers

```python
import time
from torch.utils.data import DataLoader

def benchmark_dataloader(dataset, num_workers_list):
    """Find optimal number of workers"""
    results = {}
    
    for num_workers in num_workers_list:
        loader = DataLoader(
            dataset,
            batch_size=32,
            num_workers=num_workers,
            pin_memory=True
        )
        
        start = time.time()
        for i, (data, target) in enumerate(loader):
            if i >= 100:  # Test first 100 batches
                break
        elapsed = time.time() - start
        
        results[num_workers] = elapsed
        print(f"num_workers={num_workers}: {elapsed:.2f}s")
    
    best = min(results, key=results.get)
    print(f"\nBest: num_workers={best}")
    return best

# Find optimal
optimal = benchmark_dataloader(dataset, [0, 2, 4, 8, 16])
```

## Complete Example

```python
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms
from PIL import Image
import os

# 1. Define Dataset
class MyImageDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = self._load_samples()
    
    def _load_samples(self):
        samples = []
        for class_name in os.listdir(self.root_dir):
            class_dir = os.path.join(self.root_dir, class_name)
            if os.path.isdir(class_dir):
                for img_name in os.listdir(class_dir):
                    if img_name.endswith(('.jpg', '.png')):
                        path = os.path.join(class_dir, img_name)
                        samples.append((path, class_name))
        return samples
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

# 2. Define Transforms
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# 3. Create Datasets
full_dataset = MyImageDataset('data/images', transform=train_transform)

# Split
train_size = int(0.8 * len(full_dataset))
val_size = len(full_dataset) - train_size
train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

# Apply different transforms
val_dataset.dataset.transform = val_transform

# 4. Create DataLoaders
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=4,
    pin_memory=True,
    persistent_workers=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=64,
    shuffle=False,
    num_workers=4,
    pin_memory=True
)

# 5. Use in Training
for epoch in range(10):
    for batch_idx, (data, target) in enumerate(train_loader):
        # Training code
        pass
```

## Next Steps

Continue to [Chapter 12: CNNs](12-cnns.md) to learn about:
- Convolutional layers
- CNN architectures
- Image classification
- Object detection

## Key Takeaways

- ✅ Inherit from `Dataset` and implement `__len__` and `__getitem__`
- ✅ Use `DataLoader` for batching and parallel loading
- ✅ Set `num_workers>0` for faster data loading
- ✅ Use `pin_memory=True` for GPU training
- ✅ Apply different transforms for train/val/test
- ✅ Use samplers for imbalanced data
- ✅ Implement custom collate functions for variable-length data

---

**Reference:**
- [Data Loading Tutorial](https://pytorch.org/tutorials/beginner/data_loading_tutorial.html)
- [Dataset Documentation](https://pytorch.org/docs/stable/data.html)
