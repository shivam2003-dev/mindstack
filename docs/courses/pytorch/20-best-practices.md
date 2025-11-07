# Chapter 20: Best Practices & Production Tips

A comprehensive guide to writing production-ready PyTorch code with best practices learned from industry experience.

## Project Structure

### Recommended Organization

```
project/
├── data/
│   ├── raw/                    # Original data
│   ├── processed/              # Processed data
│   └── external/               # External datasets
├── models/
│   ├── __init__.py
│   ├── model.py                # Model definitions
│   ├── layers.py               # Custom layers
│   └── losses.py               # Custom losses
├── utils/
│   ├── __init__.py
│   ├── data.py                 # Data utilities
│   ├── metrics.py              # Evaluation metrics
│   └── visualization.py        # Plotting functions
├── configs/
│   ├── config.yaml             # Hyperparameters
│   └── experiment_configs/     # Experiment-specific configs
├── scripts/
│   ├── train.py                # Training script
│   ├── evaluate.py             # Evaluation script
│   └── inference.py            # Inference script
├── notebooks/
│   ├── exploration.ipynb       # Data exploration
│   └── analysis.ipynb          # Results analysis
├── tests/
│   ├── test_models.py
│   ├── test_data.py
│   └── test_utils.py
├── checkpoints/                # Model checkpoints
├── logs/                       # Training logs
├── outputs/                    # Model outputs
├── requirements.txt
├── setup.py
└── README.md
```

### Configuration Management

```python
# configs/config.py
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ModelConfig:
    """Model architecture configuration"""
    name: str = 'resnet50'
    num_classes: int = 10
    pretrained: bool = True
    dropout: float = 0.5

@dataclass
class TrainingConfig:
    """Training configuration"""
    batch_size: int = 32
    num_epochs: int = 100
    learning_rate: float = 0.001
    weight_decay: float = 1e-4
    optimizer: str = 'adam'
    scheduler: str = 'cosine'
    
    # Paths
    data_dir: str = 'data/processed'
    checkpoint_dir: str = 'checkpoints'
    log_dir: str = 'logs'
    
    # Hardware
    device: str = 'cuda'
    num_workers: int = 4
    pin_memory: bool = True
    
    # Logging
    log_interval: int = 10
    save_interval: int = 5

@dataclass
class Config:
    """Complete configuration"""
    model: ModelConfig = ModelConfig()
    training: TrainingConfig = TrainingConfig()

# Usage
config = Config()
print(f"Batch size: {config.training.batch_size}")
```

### Using YAML Configs

```python
# config.yaml
model:
  name: resnet50
  num_classes: 10
  pretrained: true
  dropout: 0.5

training:
  batch_size: 32
  num_epochs: 100
  learning_rate: 0.001
  optimizer: adam
  scheduler: cosine

# Load config
import yaml
from pathlib import Path

def load_config(config_path):
    """Load YAML config"""
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config

config = load_config('config.yaml')
```

## Code Quality

### Type Hints

```python
import torch
import torch.nn as nn
from typing import Tuple, Optional, List, Dict
from torch import Tensor

class MyModel(nn.Module):
    def __init__(
        self,
        input_dim: int,
        hidden_dims: List[int],
        output_dim: int,
        dropout: float = 0.5
    ) -> None:
        super().__init__()
        # Implementation
    
    def forward(
        self,
        x: Tensor,
        mask: Optional[Tensor] = None
    ) -> Tuple[Tensor, Dict[str, Tensor]]:
        """
        Forward pass
        
        Args:
            x: Input tensor of shape (batch, input_dim)
            mask: Optional mask of shape (batch, seq_len)
        
        Returns:
            output: Predictions of shape (batch, output_dim)
            aux_outputs: Dictionary of auxiliary outputs
        """
        # Implementation
        return output, aux_outputs
```

### Docstrings

```python
class Trainer:
    """
    Training orchestrator for PyTorch models.
    
    This class handles the complete training loop including:
    - Forward/backward passes
    - Optimizer updates
    - Validation
    - Checkpointing
    - Logging
    
    Args:
        model: PyTorch model to train
        train_loader: DataLoader for training data
        val_loader: DataLoader for validation data
        optimizer: PyTorch optimizer
        criterion: Loss function
        device: Device to train on ('cuda' or 'cpu')
        config: Training configuration
    
    Example:
        >>> model = MyModel()
        >>> trainer = Trainer(model, train_loader, val_loader, optimizer, criterion)
        >>> trainer.train(num_epochs=100)
    """
    
    def __init__(
        self,
        model: nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        optimizer: torch.optim.Optimizer,
        criterion: nn.Module,
        device: str = 'cuda',
        config: Optional[Dict] = None
    ):
        self.model = model.to(device)
        # ... rest of initialization
    
    def train_epoch(self) -> Dict[str, float]:
        """
        Train for one epoch.
        
        Returns:
            Dictionary containing training metrics:
                - loss: Average training loss
                - accuracy: Training accuracy
                - learning_rate: Current learning rate
        """
        # Implementation
        pass
```

### Assertions and Validation

```python
def validate_inputs(x: Tensor, expected_shape: Tuple[int, ...]):
    """Validate tensor inputs"""
    assert x.dim() == len(expected_shape), \
        f"Expected {len(expected_shape)}D tensor, got {x.dim()}D"
    
    for i, (actual, expected) in enumerate(zip(x.shape, expected_shape)):
        if expected != -1:  # -1 means any size
            assert actual == expected, \
                f"Dimension {i}: expected {expected}, got {actual}"

class MyModel(nn.Module):
    def forward(self, x: Tensor) -> Tensor:
        batch_size = x.size(0)
        
        # Validate input
        validate_inputs(x, (-1, 3, 224, 224))
        
        # Check for NaN/Inf
        assert not torch.isnan(x).any(), "Input contains NaN"
        assert not torch.isinf(x).any(), "Input contains Inf"
        
        # Forward pass
        output = self.model(x)
        
        # Validate output
        assert output.size(0) == batch_size, "Batch size mismatch"
        
        return output
```

## Memory Management

### Gradient Accumulation

```python
def train_with_gradient_accumulation(
    model, dataloader, optimizer, criterion,
    accumulation_steps=4
):
    """Train with gradient accumulation for large batch sizes"""
    
    model.train()
    optimizer.zero_grad()
    
    for i, (data, target) in enumerate(dataloader):
        # Forward pass
        output = model(data)
        loss = criterion(output, target)
        
        # Normalize loss by accumulation steps
        loss = loss / accumulation_steps
        
        # Backward pass
        loss.backward()
        
        # Update weights every accumulation_steps
        if (i + 1) % accumulation_steps == 0:
            optimizer.step()
            optimizer.zero_grad()
    
    # Update for remaining batches
    if (i + 1) % accumulation_steps != 0:
        optimizer.step()
        optimizer.zero_grad()
```

### Memory Cleanup

```python
import gc
import torch

def clean_memory():
    """Clean up GPU/CPU memory"""
    gc.collect()
    torch.cuda.empty_cache()

# During training
for epoch in range(num_epochs):
    train_loss = train_epoch(...)
    val_loss = validate(...)
    
    # Clean up after epoch
    clean_memory()
```

### Gradient Checkpointing

```python
import torch.utils.checkpoint as checkpoint

class MemoryEfficientModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Sequential(...)
        self.layer2 = nn.Sequential(...)
        self.layer3 = nn.Sequential(...)
    
    def forward(self, x):
        # Use checkpointing for memory-intensive layers
        x = checkpoint.checkpoint(self.layer1, x)
        x = checkpoint.checkpoint(self.layer2, x)
        x = self.layer3(x)
        return x
```

## Reproducibility

### Seed Everything

```python
import random
import numpy as np
import torch

def seed_everything(seed: int = 42):
    """Set random seeds for reproducibility"""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)  # for multi-GPU
    
    # Make CUDA operations deterministic
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    
    # For DataLoader workers
    def worker_init_fn(worker_id):
        np.random.seed(seed + worker_id)
    
    return worker_init_fn

# Usage
worker_init_fn = seed_everything(42)

train_loader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=True,
    worker_init_fn=worker_init_fn
)
```

## Debugging

### Debug Mode

```python
class DebugModel(nn.Module):
    """Model with debug prints"""
    
    def __init__(self, debug=False):
        super().__init__()
        self.debug = debug
        self.layers = nn.Sequential(...)
    
    def forward(self, x):
        if self.debug:
            print(f"Input shape: {x.shape}")
            print(f"Input range: [{x.min():.3f}, {x.max():.3f}]")
        
        for i, layer in enumerate(self.layers):
            x = layer(x)
            
            if self.debug:
                print(f"After layer {i}: shape={x.shape}, "
                      f"range=[{x.min():.3f}, {x.max():.3f}]")
        
        return x

# Usage
model = DebugModel(debug=True)
output = model(input_tensor)
```

### Gradient Monitoring

```python
def check_gradients(model):
    """Check gradient statistics"""
    for name, param in model.named_parameters():
        if param.grad is not None:
            grad_norm = param.grad.norm().item()
            grad_mean = param.grad.mean().item()
            grad_std = param.grad.std().item()
            
            print(f"{name}:")
            print(f"  Norm: {grad_norm:.6f}")
            print(f"  Mean: {grad_mean:.6f}")
            print(f"  Std: {grad_std:.6f}")
            
            # Check for issues
            if grad_norm > 100:
                print(f"  ⚠ Large gradient!")
            if grad_norm < 1e-7:
                print(f"  ⚠ Vanishing gradient!")

# Usage during training
loss.backward()
check_gradients(model)
optimizer.step()
```

## Testing

### Unit Tests

```python
# tests/test_model.py
import unittest
import torch
from models.model import MyModel

class TestModel(unittest.TestCase):
    def setUp(self):
        """Setup before each test"""
        self.model = MyModel(input_dim=784, output_dim=10)
        self.batch_size = 32
    
    def test_forward_shape(self):
        """Test output shape"""
        x = torch.randn(self.batch_size, 784)
        output = self.model(x)
        self.assertEqual(output.shape, (self.batch_size, 10))
    
    def test_backward(self):
        """Test backward pass"""
        x = torch.randn(self.batch_size, 784)
        output = self.model(x)
        loss = output.sum()
        loss.backward()
        
        # Check gradients exist
        for param in self.model.parameters():
            self.assertIsNotNone(param.grad)
    
    def test_device_transfer(self):
        """Test CPU/GPU transfer"""
        if torch.cuda.is_available():
            model_gpu = self.model.cuda()
            x = torch.randn(self.batch_size, 784).cuda()
            output = model_gpu(x)
            self.assertEqual(output.device.type, 'cuda')

if __name__ == '__main__':
    unittest.main()
```

### Integration Tests

```python
# tests/test_training.py
import unittest
from scripts.train import train_one_epoch

class TestTraining(unittest.TestCase):
    def test_overfitting_single_batch(self):
        """Test if model can overfit single batch"""
        # Create small dataset
        x = torch.randn(10, 784)
        y = torch.randint(0, 10, (10,))
        
        model = MyModel(784, 10)
        optimizer = torch.optim.Adam(model.parameters())
        criterion = nn.CrossEntropyLoss()
        
        # Train on single batch
        initial_loss = None
        for epoch in range(100):
            output = model(x)
            loss = criterion(output, y)
            
            if epoch == 0:
                initial_loss = loss.item()
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        
        final_loss = loss.item()
        
        # Loss should decrease significantly
        self.assertLess(final_loss, initial_loss * 0.1)
```

## Logging

### Comprehensive Logger

```python
import logging
from pathlib import Path
from datetime import datetime

def setup_logger(name: str, log_dir: str = 'logs') -> logging.Logger:
    """Setup logger with file and console handlers"""
    
    # Create log directory
    log_dir = Path(log_dir)
    log_dir.mkdir(exist_ok=True)
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # File handler
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    log_file = log_dir / f'{name}_{timestamp}.log'
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Usage
logger = setup_logger('training')
logger.info('Training started')
logger.debug(f'Batch size: {batch_size}')
logger.warning('Learning rate is high')
logger.error('CUDA out of memory')
```

### TensorBoard Integration

```python
from torch.utils.tensorboard import SummaryWriter
import torch

class TensorBoardLogger:
    """TensorBoard logging wrapper"""
    
    def __init__(self, log_dir: str = 'runs'):
        self.writer = SummaryWriter(log_dir)
        self.step = 0
    
    def log_scalar(self, tag: str, value: float, step: Optional[int] = None):
        """Log scalar value"""
        step = step if step is not None else self.step
        self.writer.add_scalar(tag, value, step)
    
    def log_scalars(self, tag: str, values: Dict[str, float], step: Optional[int] = None):
        """Log multiple scalars"""
        step = step if step is not None else self.step
        self.writer.add_scalars(tag, values, step)
    
    def log_image(self, tag: str, image: Tensor, step: Optional[int] = None):
        """Log image"""
        step = step if step is not None else self.step
        self.writer.add_image(tag, image, step)
    
    def log_histogram(self, tag: str, values: Tensor, step: Optional[int] = None):
        """Log histogram"""
        step = step if step is not None else self.step
        self.writer.add_histogram(tag, values, step)
    
    def log_model_graph(self, model: nn.Module, input_tensor: Tensor):
        """Log model architecture"""
        self.writer.add_graph(model, input_tensor)
    
    def close(self):
        """Close writer"""
        self.writer.close()

# Usage
logger = TensorBoardLogger('runs/experiment1')

for epoch in range(num_epochs):
    train_loss = train_epoch(...)
    val_loss = validate(...)
    
    # Log metrics
    logger.log_scalars('loss', {
        'train': train_loss,
        'val': val_loss
    }, epoch)
    
    # Log learning rate
    logger.log_scalar('lr', optimizer.param_groups[0]['lr'], epoch)
    
    # Log weight histograms
    for name, param in model.named_parameters():
        logger.log_histogram(f'weights/{name}', param, epoch)

logger.close()
```

## Production Deployment

### Model Serving

```python
# inference.py
import torch
import torch.nn as nn
from pathlib import Path
from typing import Union, List
import numpy as np

class ModelInference:
    """Production inference wrapper"""
    
    def __init__(
        self,
        model_path: Union[str, Path],
        device: str = 'cuda'
    ):
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        
        # Load model
        self.model = self._load_model(model_path)
        self.model.to(self.device)
        self.model.eval()
    
    def _load_model(self, model_path: Path) -> nn.Module:
        """Load model from checkpoint"""
        checkpoint = torch.load(model_path, map_location=self.device)
        
        # Reconstruct model
        model = MyModel()  # You'd typically load architecture from checkpoint
        model.load_state_dict(checkpoint['model_state_dict'])
        
        return model
    
    @torch.no_grad()
    def predict(
        self,
        inputs: Union[torch.Tensor, np.ndarray, List],
        return_probs: bool = False
    ) -> np.ndarray:
        """
        Make predictions
        
        Args:
            inputs: Input data
            return_probs: Return probabilities instead of class labels
        
        Returns:
            Predictions as numpy array
        """
        # Convert to tensor
        if isinstance(inputs, np.ndarray):
            inputs = torch.from_numpy(inputs)
        elif isinstance(inputs, list):
            inputs = torch.tensor(inputs)
        
        # Move to device
        inputs = inputs.to(self.device)
        
        # Forward pass
        outputs = self.model(inputs)
        
        # Process outputs
        if return_probs:
            probs = torch.softmax(outputs, dim=1)
            return probs.cpu().numpy()
        else:
            predictions = outputs.argmax(dim=1)
            return predictions.cpu().numpy()
    
    def predict_batch(
        self,
        inputs: List,
        batch_size: int = 32
    ) -> np.ndarray:
        """Predict in batches"""
        all_predictions = []
        
        for i in range(0, len(inputs), batch_size):
            batch = inputs[i:i + batch_size]
            predictions = self.predict(batch)
            all_predictions.append(predictions)
        
        return np.concatenate(all_predictions)

# Usage
inference = ModelInference('best_model.pth')

# Single prediction
image = torch.randn(1, 3, 224, 224)
prediction = inference.predict(image)

# Batch prediction
images = [torch.randn(3, 224, 224) for _ in range(100)]
predictions = inference.predict_batch(images, batch_size=32)
```

### REST API with Flask

```python
# app.py
from flask import Flask, request, jsonify
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = Flask(__name__)

# Load model
inference = ModelInference('best_model.pth')

# Preprocessing
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        # Get image from request
        image_bytes = request.files['image'].read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess
        image_tensor = transform(image).unsqueeze(0)
        
        # Predict
        prediction = inference.predict(image_tensor, return_probs=True)
        
        # Format response
        response = {
            'success': True,
            'predictions': prediction[0].tolist()
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## Common Pitfalls

### 1. Forgetting model.eval()

```python
# ❌ Wrong
model.load_state_dict(torch.load('model.pth'))
predictions = model(test_data)  # Still in training mode!

# ✅ Correct
model.load_state_dict(torch.load('model.pth'))
model.eval()  # Set to evaluation mode
with torch.no_grad():
    predictions = model(test_data)
```

### 2. Not Detaching Tensors

```python
# ❌ Wrong - memory leak
losses = []
for epoch in range(num_epochs):
    loss = train_epoch(...)
    losses.append(loss)  # Keeps computation graph!

# ✅ Correct
losses = []
for epoch in range(num_epochs):
    loss = train_epoch(...)
    losses.append(loss.item())  # Only keep value
```

### 3. Incorrect Data Normalization

```python
# ❌ Wrong - normalize per batch
for images, labels in dataloader:
    images = (images - images.mean()) / images.std()  # Different stats per batch!

# ✅ Correct - use dataset statistics
transform = transforms.Normalize(
    mean=[0.485, 0.456, 0.406],  # ImageNet mean
    std=[0.229, 0.224, 0.225]     # ImageNet std
)
```

### 4. Not Clearing Gradients

```python
# ❌ Wrong
for epoch in range(num_epochs):
    loss = train_epoch(...)
    loss.backward()  # Gradients accumulate!
    optimizer.step()

# ✅ Correct
for epoch in range(num_epochs):
    optimizer.zero_grad()  # Clear gradients
    loss = train_epoch(...)
    loss.backward()
    optimizer.step()
```

## Performance Checklist

- ✅ Use `DataLoader` with `num_workers > 0`
- ✅ Enable `pin_memory=True` for GPU training
- ✅ Use mixed precision training (AMP)
- ✅ Batch normalization instead of layer normalization when possible
- ✅ Use `torch.no_grad()` for inference
- ✅ Prefer in-place operations (`relu(inplace=True)`)
- ✅ Use `torch.backends.cudnn.benchmark = True` for fixed input size
- ✅ Profile code to find bottlenecks
- ✅ Use gradient accumulation for large batches
- ✅ Clear GPU cache periodically

## Next Steps

You've completed the PyTorch cheatsheet! Now you can:

1. **Practice**: Implement models from papers
2. **Compete**: Join Kaggle competitions
3. **Contribute**: Contribute to open-source projects
4. **Advanced Topics**: Explore GANs, Transformers, RL
5. **Deploy**: Build production ML systems

## Key Takeaways

- ✅ Organize code into modular structure
- ✅ Use configuration files for hyperparameters
- ✅ Write type hints and docstrings
- ✅ Implement comprehensive logging
- ✅ Test your code thoroughly
- ✅ Make training reproducible
- ✅ Monitor gradients and activations
- ✅ Follow production best practices

---

**Congratulations!** You now have a comprehensive understanding of PyTorch. Keep building and learning! 🚀

**Helpful Resources:**
- [PyTorch Documentation](https://pytorch.org/docs/)
- [PyTorch Tutorials](https://pytorch.org/tutorials/)
- [PyTorch Forums](https://discuss.pytorch.org/)
- [Papers with Code](https://paperswithcode.com/)
