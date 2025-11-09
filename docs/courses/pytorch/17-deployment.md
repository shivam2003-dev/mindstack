# Chapter 17: Model Deployment & Production

<div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 2rem; border-radius: 10px; color: #333; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: #333;">🚢 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem; color: #333;">
    <li>Export models to different formats (TorchScript, ONNX)</li>
    <li>Deploy models to production environments</li>
    <li>Optimize models for inference</li>
    <li>Build production-ready inference pipelines</li>
  </ul>
</div>

Learn how to deploy PyTorch models for real-world applications.

!!! tip "Export Format Selection"
    - **TorchScript**: Best for PyTorch-only deployments, supports control flow
    - **ONNX**: Cross-platform, works with TensorRT, OpenVINO, etc.
    - **TensorFlow Lite**: For mobile deployment
    - **CoreML**: For iOS/macOS apps

!!! note "Model Optimization for Production"
    Before deployment: convert to eval mode, use TorchScript/ONNX, enable optimizations (quantization, pruning), and test inference speed. Production models should be fast, small, and accurate.

## Model Export Formats

### TorchScript (Recommended)

```python
import torch
import torch.nn as nn

# Method 1: Tracing (for models without control flow)
model = MyModel()
model.eval()

example_input = torch.randn(1, 3, 224, 224)
traced_model = torch.jit.trace(model, example_input)

# Save
traced_model.save('model_traced.pt')

# Load (works in C++, no Python needed!)
loaded_model = torch.jit.load('model_traced.pt')
loaded_model.eval()

# Inference
with torch.no_grad():
    output = loaded_model(example_input)

print("✓ TorchScript tracing successful")
```

```python
# Method 2: Scripting (for models with control flow)
class ControlFlowModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 10)
    
    def forward(self, x):
        if x.sum() > 0:  # Control flow
            return self.linear(x)
        else:
            return x * 2

model = ControlFlowModel()
scripted_model = torch.jit.script(model)

# Save
scripted_model.save('model_scripted.pt')

print("✓ TorchScript scripting successful")
```

### ONNX Export

```python
import torch
import torch.onnx

model = MyModel()
model.eval()

dummy_input = torch.randn(1, 3, 224, 224)

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    'model.onnx',
    export_params=True,
    opset_version=14,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

print("✓ Exported to ONNX")

# Verify ONNX model
import onnx
import onnxruntime as ort

# Load and check
onnx_model = onnx.load('model.onnx')
onnx.checker.check_model(onnx_model)

# Run inference with ONNX Runtime
ort_session = ort.InferenceSession('model.onnx')

# Prepare input
input_data = dummy_input.numpy()
ort_inputs = {'input': input_data}

# Run
ort_outputs = ort_session.run(None, ort_inputs)

print("✓ ONNX model verified")
```

## Inference Optimization

### Model Quantization

```python
import torch
import torch.quantization as quantization

# Dynamic Quantization (easiest)
model_fp32 = MyModel()
model_fp32.load_state_dict(torch.load('model.pth'))
model_fp32.eval()

# Quantize
model_int8 = torch.quantization.quantize_dynamic(
    model_fp32,
    {torch.nn.Linear, torch.nn.Conv2d},
    dtype=torch.qint8
)

# Save quantized model
torch.save(model_int8.state_dict(), 'model_quantized.pth')

# Check size reduction
import os
size_fp32 = os.path.getsize('model.pth') / 1e6
size_int8 = os.path.getsize('model_quantized.pth') / 1e6

print(f"FP32 size: {size_fp32:.2f} MB")
print(f"INT8 size: {size_int8:.2f} MB")
print(f"Reduction: {(1 - size_int8/size_fp32)*100:.1f}%")

# Inference
with torch.no_grad():
    output = model_int8(input_data)
```

```python
# Static Quantization (better accuracy)
class QuantizableModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.quant = torch.quantization.QuantStub()
        self.dequant = torch.quantization.DeQuantStub()
        
        self.conv1 = nn.Conv2d(3, 64, 3, padding=1)
        self.relu = nn.ReLU()
        self.fc = nn.Linear(64 * 224 * 224, 10)
    
    def forward(self, x):
        x = self.quant(x)
        x = self.conv1(x)
        x = self.relu(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        x = self.dequant(x)
        return x

# Prepare for quantization
model = QuantizableModel()
model.eval()

model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
torch.quantization.prepare(model, inplace=True)

# Calibrate with representative data
with torch.no_grad():
    for data, _ in calibration_loader:
        model(data)

# Convert to quantized model
torch.quantization.convert(model, inplace=True)

print("✓ Static quantization complete")
```

### Model Pruning

```python
import torch
import torch.nn.utils.prune as prune

model = MyModel()

# Prune individual layer
layer = model.conv1
prune.l1_unstructured(layer, name='weight', amount=0.3)  # 30% sparsity

# Check sparsity
print(f"Sparsity: {100. * float(torch.sum(layer.weight == 0)) / float(layer.weight.nelement()):.2f}%")

# Make pruning permanent
prune.remove(layer, 'weight')

# Global pruning (across all layers)
parameters_to_prune = []
for module in model.modules():
    if isinstance(module, (nn.Conv2d, nn.Linear)):
        parameters_to_prune.append((module, 'weight'))

prune.global_unstructured(
    parameters_to_prune,
    pruning_method=prune.L1Unstructured,
    amount=0.2  # 20% global sparsity
)

# Make permanent
for module, name in parameters_to_prune:
    prune.remove(module, name)

print("✓ Model pruned")
```

## Web Deployment

### Flask API

```python
# app.py
from flask import Flask, request, jsonify
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = Flask(__name__)

# Load model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = torch.jit.load('model_traced.pt', map_location=device)
model.eval()

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
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Predict
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)
            top5_prob, top5_idx = probabilities.topk(5)
        
        # Format response
        predictions = [
            {
                'class': int(idx),
                'probability': float(prob)
            }
            for idx, prob in zip(top5_idx[0], top5_prob[0])
        ]
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
    
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
    app.run(host='0.0.0.0', port=5000, debug=False)
```

```python
# client.py - Test the API
import requests

url = 'http://localhost:5000/predict'

# Send image
with open('test_image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post(url, files=files)

result = response.json()
print(result)
```

### FastAPI (Modern Alternative)

```python
# app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = FastAPI(title="PyTorch Model API")

# Load model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = torch.jit.load('model_traced.pt', map_location=device)
model.eval()

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Prediction endpoint"""
    
    # Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Preprocess
    image_tensor = transform(image).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        output = model(image_tensor)
        probabilities = torch.softmax(output, dim=1)
        top5_prob, top5_idx = probabilities.topk(5)
    
    # Format response
    predictions = [
        {
            'class': int(idx),
            'probability': float(prob)
        }
        for idx, prob in zip(top5_idx[0], top5_prob[0])
    ]
    
    return {
        'success': True,
        'predictions': predictions
    }

@app.get("/health")
def health():
    """Health check"""
    return {'status': 'healthy'}

# Run: uvicorn app:app --host 0.0.0.0 --port 8000
```

## Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and code
COPY model_traced.pt .
COPY app.py .

# Expose port
EXPOSE 8000

# Run app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```txt
# requirements.txt
fastapi==0.103.1
uvicorn==0.23.2
python-multipart==0.0.6
Pillow==10.0.0
```

```bash
# Build image
docker build -t pytorch-api:latest .

# Run container
docker run -p 8000:8000 --gpus all pytorch-api:latest

# Test
curl -X POST -F "file=@test.jpg" http://localhost:8000/predict
```

## Cloud Deployment

### AWS Lambda (Serverless)

```python
# lambda_handler.py
import json
import base64
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

# Load model (cold start)
model = torch.jit.load('model_traced.pt', map_location='cpu')
model.eval()

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def lambda_handler(event, context):
    """AWS Lambda handler"""
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(event['body'])
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        # Preprocess
        image_tensor = transform(image).unsqueeze(0)
        
        # Predict
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)
            top_prob, top_idx = probabilities.max(1)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'class': int(top_idx[0]),
                'probability': float(top_prob[0])
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### TorchServe (Production Serving)

```python
# handler.py
import torch
from ts.torch_handler.base_handler import BaseHandler
from torchvision import transforms
from PIL import Image
import io

class MyModelHandler(BaseHandler):
    """Custom TorchServe handler"""
    
    def initialize(self, context):
        """Initialize handler"""
        super().initialize(context)
        
        # Load model
        self.model = torch.jit.load('model_traced.pt')
        self.model.eval()
        
        # Setup transform
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        self.initialized = True
    
    def preprocess(self, data):
        """Preprocess input"""
        images = []
        
        for row in data:
            image_bytes = row.get('data') or row.get('body')
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            image_tensor = self.transform(image)
            images.append(image_tensor)
        
        return torch.stack(images)
    
    def inference(self, data):
        """Run inference"""
        with torch.no_grad():
            output = self.model(data)
        return output
    
    def postprocess(self, data):
        """Postprocess output"""
        probabilities = torch.softmax(data, dim=1)
        top5_prob, top5_idx = probabilities.topk(5)
        
        results = []
        for probs, indices in zip(top5_prob, top5_idx):
            results.append({
                'predictions': [
                    {'class': int(idx), 'probability': float(prob)}
                    for idx, prob in zip(indices, probs)
                ]
            })
        
        return results
```

```bash
# Create model archive
torch-model-archiver \
    --model-name my_model \
    --version 1.0 \
    --serialized-file model_traced.pt \
    --handler handler.py \
    --export-path model-store

# Start TorchServe
torchserve \
    --start \
    --model-store model-store \
    --models my_model=my_model.mar

# Make prediction
curl -X POST http://localhost:8080/predictions/my_model \
    -T test_image.jpg
```

## Performance Monitoring

### Latency Tracking

```python
import time
import torch

class LatencyMonitor:
    """Monitor inference latency"""
    
    def __init__(self):
        self.latencies = []
    
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    
    def __exit__(self, *args):
        elapsed = time.perf_counter() - self.start
        self.latencies.append(elapsed * 1000)  # Convert to ms
    
    def report(self):
        """Print latency statistics"""
        import numpy as np
        
        latencies = np.array(self.latencies)
        
        print(f"Mean latency: {latencies.mean():.2f} ms")
        print(f"Median latency: {np.median(latencies):.2f} ms")
        print(f"P95 latency: {np.percentile(latencies, 95):.2f} ms")
        print(f"P99 latency: {np.percentile(latencies, 99):.2f} ms")

# Usage
monitor = LatencyMonitor()

for image in test_images:
    with monitor:
        output = model(image)

monitor.report()
```

## Best Practices Checklist

### Pre-Deployment

- ✅ Export to TorchScript or ONNX
- ✅ Quantize model for faster inference
- ✅ Prune unnecessary weights
- ✅ Test on representative data
- ✅ Measure latency and throughput
- ✅ Set up error handling
- ✅ Implement health checks
- ✅ Version your models

### Deployment

- ✅ Use Docker for consistency
- ✅ Enable GPU if available
- ✅ Set up monitoring and logging
- ✅ Implement request batching
- ✅ Add authentication/authorization
- ✅ Set resource limits
- ✅ Use load balancer for scale
- ✅ Implement A/B testing

### Production

- ✅ Monitor model performance
- ✅ Track prediction distributions
- ✅ Detect model drift
- ✅ Set up alerts
- ✅ Regular model updates
- ✅ Backup and rollback strategy
- ✅ Document API endpoints
- ✅ Maintain model registry

## Complete Deployment Example

```python
# production_inference.py
import torch
import time
import logging
from pathlib import Path
from typing import Dict, List
import numpy as np

class ProductionModel:
    """Production-ready inference wrapper"""
    
    def __init__(self, model_path: str, device: str = 'cuda'):
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Load model
        self.model = self._load_model(model_path)
        
        # Warmup
        self._warmup()
        
        # Metrics
        self.request_count = 0
        self.total_latency = 0
    
    def _load_model(self, model_path: str):
        """Load and optimize model"""
        self.logger.info(f"Loading model from {model_path}")
        
        model = torch.jit.load(model_path, map_location=self.device)
        model.eval()
        
        # Optimize for inference
        if self.device.type == 'cuda':
            model = model.half()  # FP16
        
        return model
    
    def _warmup(self, num_iterations: int = 10):
        """Warmup model"""
        self.logger.info("Warming up model...")
        
        dummy_input = torch.randn(1, 3, 224, 224).to(self.device)
        
        with torch.no_grad():
            for _ in range(num_iterations):
                _ = self.model(dummy_input)
        
        if self.device.type == 'cuda':
            torch.cuda.synchronize()
        
        self.logger.info("Warmup complete")
    
    @torch.no_grad()
    def predict(self, inputs: torch.Tensor) -> Dict:
        """Make prediction"""
        
        start_time = time.perf_counter()
        
        # Move to device
        inputs = inputs.to(self.device)
        
        # Inference
        outputs = self.model(inputs)
        probabilities = torch.softmax(outputs, dim=1)
        
        # Get top predictions
        top5_prob, top5_idx = probabilities.topk(5)
        
        # Move to CPU
        top5_prob = top5_prob.cpu().numpy()
        top5_idx = top5_idx.cpu().numpy()
        
        # Calculate latency
        latency = (time.perf_counter() - start_time) * 1000
        
        # Update metrics
        self.request_count += 1
        self.total_latency += latency
        
        return {
            'predictions': [
                {'class': int(idx), 'probability': float(prob)}
                for idx, prob in zip(top5_idx[0], top5_prob[0])
            ],
            'latency_ms': latency
        }
    
    def get_metrics(self) -> Dict:
        """Get performance metrics"""
        return {
            'total_requests': self.request_count,
            'avg_latency_ms': self.total_latency / max(self.request_count, 1)
        }
```

## Next Steps

You've completed the PyTorch deployment guide! Practice by:
1. Deploying a model to cloud (AWS/GCP/Azure)
2. Building a production API
3. Setting up monitoring
4. Implementing CI/CD pipeline

## Key Takeaways

- ✅ Export models to TorchScript or ONNX
- ✅ Quantize and prune for faster inference
- ✅ Use FastAPI for modern APIs
- ✅ Containerize with Docker
- ✅ Monitor latency and errors
- ✅ Implement proper logging
- ✅ Version control your models
- ✅ Test thoroughly before deploying

## Recommended Reads

???+ "📚 Official Documentation"
    1. [TorchScript](https://pytorch.org/docs/stable/jit.html) - TorchScript documentation
    2. [ONNX Export](https://pytorch.org/docs/stable/onnx.html) - ONNX model export
    3. [TorchServe](https://pytorch.org/serve/) - Model serving framework
    4. [Model Optimization](https://pytorch.org/docs/stable/quantization.html) - Quantization and optimization

???+ "📖 Essential Articles"
    1. [TorchScript Tutorial](https://pytorch.org/tutorials/beginner/Intro_to_TorchScript_tutorial.html) - TorchScript guide
    2. [ONNX Tutorial](https://pytorch.org/tutorials/advanced/super_resolution_with_onnxruntime.html) - ONNX export
    3. [Model Deployment](https://pytorch.org/tutorials/intermediate/flask_rest_api_tutorial.html) - REST API deployment
    4. [Production Best Practices](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Production tips

???+ "🎓 Learning Resources"
    1. [Deployment Tutorials](https://pytorch.org/tutorials/intermediate/flask_rest_api_tutorial.html) - Deployment examples
    2. [Model Serving](https://pytorch.org/serve/) - Serving models at scale
    3. [Edge Deployment](https://pytorch.org/mobile/home/) - Mobile and edge deployment

???+ "💡 Best Practices"
    1. [Model Optimization](https://pytorch.org/docs/stable/quantization.html) - Quantization strategies
    2. [Performance Monitoring](https://pytorch.org/tutorials/recipes/recipes/tuning_guide.html) - Monitoring deployed models
    3. [Version Control](https://pytorch.org/tutorials/recipes/recipes/saving_and_loading_models_for_inference.html) - Model versioning

???+ "🔬 Research Papers"
    1. [ONNX: Open Neural Network Exchange](https://onnx.ai/) - ONNX specification
    2. [Model Compression](https://arxiv.org/abs/1710.09282) - Compression techniques

---
