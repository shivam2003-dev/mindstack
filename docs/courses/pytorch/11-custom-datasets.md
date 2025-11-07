# Chapter 11: Custom Datasets

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔧 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Create custom Dataset classes</li>
    <li>Handle various data formats (images, text, audio)</li>
    <li>Implement efficient data loading</li>
    <li>Build reusable dataset patterns</li>
  </ul>
</div>

Creating custom datasets allows you to work with any data format. This chapter covers advanced dataset patterns and best practices.

!!! tip "Dataset Implementation Checklist"
    Your custom Dataset must implement: `__init__()` to load metadata, `__len__()` to return dataset size, and `__getitem__()` to return a sample. Keep `__getitem__()` fast - load data lazily, not in `__init__()`.

!!! note "Lazy Loading"
    Don't load all data in `__init__()`. Instead, load file paths/metadata and load actual data in `__getitem__()`. This saves memory and speeds up dataset creation.

## Basic Custom Dataset

### Image Classification Dataset

```python
import torch
from torch.utils.data import Dataset
from PIL import Image
import os

class CustomImageDataset(Dataset):
    """Custom dataset for image classification"""
    
    def __init__(self, image_dir, labels_file, transform=None):
        """
        Args:
            image_dir: Directory with images
            labels_file: Path to CSV with image_name, label columns
            transform: Optional transform to apply
        """
        self.image_dir = image_dir
        self.transform = transform
        
        # Read labels
        import pandas as pd
        self.labels_df = pd.read_csv(labels_file)
        
        # Create label to index mapping
        self.classes = sorted(self.labels_df['label'].unique())
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.classes)}
    
    def __len__(self):
        return len(self.labels_df)
    
    def __getitem__(self, idx):
        # Get image path and label
        img_name = self.labels_df.iloc[idx]['image_name']
        label = self.labels_df.iloc[idx]['label']
        
        # Load image
        img_path = os.path.join(self.image_dir, img_name)
        image = Image.open(img_path).convert('RGB')
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
        
        # Convert label to index
        label_idx = self.class_to_idx[label]
        
        return image, label_idx

# Usage
from torchvision import transforms

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset = CustomImageDataset(
    image_dir='data/images',
    labels_file='data/labels.csv',
    transform=transform
)

# Test
image, label = dataset[0]
print(f"Image shape: {image.shape}")
print(f"Label: {label}")
```

## Advanced Dataset Patterns

### Multi-Input Dataset

```python
class MultiInputDataset(Dataset):
    """Dataset with multiple inputs (e.g., image + metadata)"""
    
    def __init__(self, image_dir, metadata_file, transform=None):
        self.image_dir = image_dir
        self.transform = transform
        
        import pandas as pd
        self.metadata = pd.read_csv(metadata_file)
    
    def __len__(self):
        return len(self.metadata)
    
    def __getitem__(self, idx):
        row = self.metadata.iloc[idx]
        
        # Load image
        img_path = os.path.join(self.image_dir, row['image_name'])
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        # Get metadata features
        features = torch.tensor([
            row['age'],
            row['height'],
            row['weight']
        ], dtype=torch.float32)
        
        label = row['label']
        
        return {
            'image': image,
            'features': features,
            'label': label
        }

# Model for multi-input
class MultiInputModel(nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        
        # Image branch
        self.image_branch = models.resnet18(pretrained=True)
        self.image_branch.fc = nn.Identity()
        
        # Feature branch
        self.feature_branch = nn.Sequential(
            nn.Linear(num_features, 64),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        
        # Fusion
        self.classifier = nn.Linear(512 + 64, num_classes)
    
    def forward(self, image, features):
        img_feat = self.image_branch(image)
        meta_feat = self.feature_branch(features)
        
        combined = torch.cat([img_feat, meta_feat], dim=1)
        output = self.classifier(combined)
        
        return output

# Training loop
for batch in dataloader:
    images = batch['image'].to(device)
    features = batch['features'].to(device)
    labels = batch['label'].to(device)
    
    outputs = model(images, features)
    loss = criterion(outputs, labels)
```

### Multi-Output Dataset

```python
class MultiOutputDataset(Dataset):
    """Dataset with multiple labels/outputs"""
    
    def __init__(self, image_dir, labels_file, transform=None):
        self.image_dir = image_dir
        self.transform = transform
        
        import pandas as pd
        self.labels_df = pd.read_csv(labels_file)
    
    def __len__(self):
        return len(self.labels_df)
    
    def __getitem__(self, idx):
        row = self.labels_df.iloc[idx]
        
        # Load image
        img_path = os.path.join(self.image_dir, row['image_name'])
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        # Multiple labels
        labels = {
            'category': row['category'],
            'color': row['color'],
            'size': row['size']
        }
        
        return image, labels

# Collate function for multi-output
def multi_output_collate(batch):
    """Custom collate function"""
    images = torch.stack([item[0] for item in batch])
    
    labels = {
        'category': torch.tensor([item[1]['category'] for item in batch]),
        'color': torch.tensor([item[1]['color'] for item in batch]),
        'size': torch.tensor([item[1]['size'] for item in batch])
    }
    
    return images, labels

# DataLoader
dataloader = DataLoader(
    dataset,
    batch_size=32,
    collate_fn=multi_output_collate
)
```

## Handling Different Data Formats

### CSV Dataset

```python
import pandas as pd
import torch
from torch.utils.data import Dataset

class CSVDataset(Dataset):
    """Dataset from CSV file"""
    
    def __init__(self, csv_file, feature_cols, target_col):
        self.data = pd.read_csv(csv_file)
        self.feature_cols = feature_cols
        self.target_col = target_col
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        # Get features
        features = self.data.iloc[idx][self.feature_cols].values
        features = torch.tensor(features, dtype=torch.float32)
        
        # Get target
        target = self.data.iloc[idx][self.target_col]
        target = torch.tensor(target, dtype=torch.float32)
        
        return features, target

# Usage
dataset = CSVDataset(
    csv_file='data.csv',
    feature_cols=['feature1', 'feature2', 'feature3'],
    target_col='target'
)
```

### Text Dataset

```python
import torch
from torch.utils.data import Dataset
from torch.nn.utils.rnn import pad_sequence

class TextDataset(Dataset):
    """Dataset for text data"""
    
    def __init__(self, texts, labels, vocab, max_length=100):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        # Tokenize and convert to indices
        tokens = text.split()[:self.max_length]
        indices = [self.vocab.get(token, self.vocab['<UNK>']) for token in tokens]
        
        # Convert to tensor
        tensor = torch.tensor(indices, dtype=torch.long)
        label_tensor = torch.tensor(label, dtype=torch.long)
        
        return tensor, label_tensor

# Custom collate function for padding
def text_collate_fn(batch):
    """Pad sequences to same length"""
    texts, labels = zip(*batch)
    
    # Pad texts
    texts_padded = pad_sequence(texts, batch_first=True, padding_value=0)
    labels = torch.stack(labels)
    
    return texts_padded, labels

# DataLoader
dataloader = DataLoader(
    dataset,
    batch_size=32,
    collate_fn=text_collate_fn
)
```

### HDF5 Dataset

```python
import h5py
import torch
from torch.utils.data import Dataset

class HDF5Dataset(Dataset):
    """Dataset for large HDF5 files"""
    
    def __init__(self, h5_path, transform=None):
        self.h5_path = h5_path
        self.transform = transform
        
        # Get dataset length
        with h5py.File(h5_path, 'r') as f:
            self.length = len(f['images'])
    
    def __len__(self):
        return self.length
    
    def __getitem__(self, idx):
        # Open file for each access (thread-safe)
        with h5py.File(self.h5_path, 'r') as f:
            image = f['images'][idx]
            label = f['labels'][idx]
        
        # Convert to tensor
        image = torch.from_numpy(image).float()
        
        if self.transform:
            image = self.transform(image)
        
        return image, label
```

## Memory-Efficient Datasets

### Lazy Loading Dataset

```python
class LazyLoadDataset(Dataset):
    """Load data only when needed"""
    
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        # Load image only when accessed
        image = Image.open(self.image_paths[idx]).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        label = self.labels[idx]
        
        return image, label
```

### Cached Dataset

```python
from functools import lru_cache

class CachedDataset(Dataset):
    """Cache recently accessed items"""
    
    def __init__(self, image_paths, labels, transform=None, cache_size=100):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        
        # Create cached loading function
        self._load_image = lru_cache(maxsize=cache_size)(self._load_image_impl)
    
    def _load_image_impl(self, path):
        """Actual image loading (cached)"""
        return Image.open(path).convert('RGB')
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image = self._load_image(self.image_paths[idx])
        
        if self.transform:
            image = self.transform(image)
        
        label = self.labels[idx]
        
        return image, label
```

## Streaming Datasets

### Infinite Dataset

```python
class InfiniteDataset(Dataset):
    """Dataset that generates data on-the-fly"""
    
    def __init__(self, num_samples, data_shape):
        self.num_samples = num_samples
        self.data_shape = data_shape
    
    def __len__(self):
        return self.num_samples
    
    def __getitem__(self, idx):
        # Generate random data
        data = torch.randn(self.data_shape)
        label = torch.randint(0, 10, (1,)).item()
        
        return data, label
```

### IterableDataset

```python
from torch.utils.data import IterableDataset

class StreamingDataset(IterableDataset):
    """Dataset for streaming data"""
    
    def __init__(self, data_source):
        self.data_source = data_source
    
    def __iter__(self):
        """Iterate over data stream"""
        for data in self.data_source:
            # Process data
            features = torch.tensor(data['features'])
            label = data['label']
            
            yield features, label

# Usage with worker processes
def worker_init_fn(worker_id):
    """Initialize worker"""
    # Set different random seed for each worker
    torch.manual_seed(torch.initial_seed() + worker_id)

dataloader = DataLoader(
    streaming_dataset,
    batch_size=32,
    num_workers=4,
    worker_init_fn=worker_init_fn
)
```

## Data Validation

### Dataset Validation

```python
class ValidatedDataset(Dataset):
    """Dataset with validation checks"""
    
    def __init__(self, image_paths, labels, transform=None, validate=True):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        
        if validate:
            self._validate_data()
    
    def _validate_data(self):
        """Validate dataset before training"""
        print("Validating dataset...")
        
        # Check lengths match
        assert len(self.image_paths) == len(self.labels), \
            "Number of images and labels don't match"
        
        # Check files exist
        missing_files = []
        for path in self.image_paths:
            if not os.path.exists(path):
                missing_files.append(path)
        
        if missing_files:
            raise FileNotFoundError(
                f"Missing {len(missing_files)} files: {missing_files[:5]}"
            )
        
        # Try loading first item
        try:
            _ = self[0]
        except Exception as e:
            raise RuntimeError(f"Failed to load first item: {e}")
        
        print(f"✓ Validated {len(self)} items")
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        try:
            image = Image.open(self.image_paths[idx]).convert('RGB')
            
            if self.transform:
                image = self.transform(image)
            
            label = self.labels[idx]
            
            return image, label
            
        except Exception as e:
            print(f"Error loading {self.image_paths[idx]}: {e}")
            # Return a default/fallback item
            return self[0]  # or raise exception
```

## Weighted Sampling

### Class-Balanced Sampling

```python
from torch.utils.data import WeightedRandomSampler
import numpy as np

def create_weighted_sampler(dataset, num_samples=None):
    """Create sampler for balanced class distribution"""
    
    # Count class occurrences
    labels = [dataset[i][1] for i in range(len(dataset))]
    class_counts = np.bincount(labels)
    
    # Calculate weights
    class_weights = 1. / class_counts
    sample_weights = np.array([class_weights[label] for label in labels])
    
    # Create sampler
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=num_samples or len(dataset),
        replacement=True
    )
    
    return sampler

# Usage
sampler = create_weighted_sampler(train_dataset)
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    sampler=sampler  # Don't use shuffle=True with sampler
)
```

## Best Practices

### Complete Custom Dataset Template

```python
import torch
from torch.utils.data import Dataset
from PIL import Image
import os
from pathlib import Path
from typing import List, Tuple, Optional, Callable

class ProductionDataset(Dataset):
    """Production-ready custom dataset template"""
    
    def __init__(
        self,
        root_dir: str,
        split: str = 'train',
        transform: Optional[Callable] = None,
        cache: bool = False,
        validate: bool = True
    ):
        """
        Args:
            root_dir: Root directory of dataset
            split: 'train', 'val', or 'test'
            transform: Optional transform
            cache: Whether to cache loaded images
            validate: Whether to validate dataset on init
        """
        self.root_dir = Path(root_dir)
        self.split = split
        self.transform = transform
        self.cache = cache
        
        # Load data
        self.samples = self._load_samples()
        
        # Validate
        if validate:
            self._validate()
        
        # Cache
        if cache:
            self._cache = {}
    
    def _load_samples(self) -> List[Tuple[str, int]]:
        """Load sample paths and labels"""
        samples = []
        split_dir = self.root_dir / self.split
        
        # Assuming directory structure: root/split/class/image.jpg
        for class_dir in sorted(split_dir.iterdir()):
            if not class_dir.is_dir():
                continue
            
            class_idx = int(class_dir.name)  # or use mapping
            
            for img_path in class_dir.glob('*.jpg'):
                samples.append((str(img_path), class_idx))
        
        return samples
    
    def _validate(self):
        """Validate dataset"""
        assert len(self.samples) > 0, f"No samples found in {self.root_dir}/{self.split}"
        
        # Check first sample loads
        _ = self[0]
        
        print(f"✓ Loaded {len(self.samples)} samples for {self.split}")
    
    def __len__(self) -> int:
        return len(self.samples)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        if self.cache and idx in self._cache:
            image, label = self._cache[idx]
        else:
            img_path, label = self.samples[idx]
            image = Image.open(img_path).convert('RGB')
            
            if self.cache:
                self._cache[idx] = (image, label)
        
        if self.transform:
            image = self.transform(image)
        
        return image, label
    
    def get_class_distribution(self):
        """Get class distribution statistics"""
        labels = [label for _, label in self.samples]
        return np.bincount(labels)
```

## Next Steps

Continue to [Chapter 13: Recurrent Neural Networks](13-rnns.md) to learn:
- LSTM and GRU networks
- Sequence modeling
- Text and time series processing

## Key Takeaways

- ✅ Inherit from `Dataset` and implement `__len__` and `__getitem__`
- ✅ Load data lazily to save memory
- ✅ Validate your dataset before training
- ✅ Use custom collate functions for variable-length data
- ✅ Consider caching for small datasets
- ✅ Use weighted sampling for imbalanced datasets
- ✅ Handle errors gracefully in `__getitem__`

---

**Reference:**
- [Dataset Documentation](https://pytorch.org/docs/stable/data.html#torch.utils.data.Dataset)
- [DataLoader Documentation](https://pytorch.org/docs/stable/data.html#torch.utils.data.DataLoader)
