# Module 6: Quantum Deep Learning

<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand hybrid quantum-classical neural networks</li>
    <li>Build quantum neural network architectures</li>
    <li>Implement classification using hybrid networks</li>
    <li>Design quantum neural networks for near-term processors</li>
    <li>Train and optimize quantum neural networks</li>
  </ul>
</div>

This module covers quantum deep learning, combining quantum computing with neural network architectures for enhanced learning capabilities.

!!! success "Module Overview"
    Quantum deep learning leverages quantum circuits as trainable layers in neural networks, potentially providing advantages for certain learning tasks.

## Hybrid Quantum-Classical Neural Networks

Hybrid networks combine classical and quantum layers for enhanced performance.

### Architecture Overview

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit.library import RealAmplitudes, ZZFeatureMap
from qiskit.algorithms.optimizers import SPSA, COBYLA
from qiskit_machine_learning.algorithms import VQC
import numpy as np
import torch
import torch.nn as nn

def hybrid_network_architecture():
    """Hybrid quantum-classical neural network architecture"""
    print("Hybrid Quantum-Classical Network:")
    print("\n1. Classical Input Layer:")
    print("   - Preprocesses data")
    print("   - Reduces dimensionality if needed")
    
    print("\n2. Quantum Layer:")
    print("   - Encodes data into quantum states")
    print("   - Applies variational quantum circuit")
    print("   - Measures expectation values")
    
    print("\n3. Classical Output Layer:")
    print("   - Post-processes quantum measurements")
    print("   - Produces final predictions")
    
    print("\nAdvantages:")
    print("- Leverages quantum advantage where beneficial")
    print("- Uses classical layers for compatibility")
    print("- Suitable for near-term quantum hardware")

hybrid_network_architecture()
```

### PyTorch + Qiskit Integration

```python
class HybridQuantumClassicalNN(nn.Module):
    """Hybrid quantum-classical neural network"""
    
    def __init__(self, n_qubits=4, n_features=8, n_classes=2):
        super().__init__()
        
        # Classical layers
        self.classical_layers = nn.Sequential(
            nn.Linear(n_features, n_qubits * 2),
            nn.ReLU(),
            nn.Linear(n_qubits * 2, n_qubits)
        )
        
        # Quantum layer (simulated)
        self.n_qubits = n_qubits
        self.n_classes = n_classes
        
        # Quantum circuit parameters
        self.quantum_params = nn.Parameter(
            torch.randn(2 * n_qubits)  # Parameters for variational circuit
        )
    
    def quantum_layer(self, x):
        """Simulate quantum layer"""
        # Encode classical data
        # Apply variational circuit
        # Measure expectation values
        
        # Simplified: return processed features
        # In practice, would call Qiskit circuit
        return x  # Placeholder
    
    def forward(self, x):
        # Classical preprocessing
        x = self.classical_layers(x)
        
        # Quantum layer
        x = self.quantum_layer(x)
        
        # Classical output
        output = nn.Linear(self.n_qubits, self.n_classes)(x)
        return output

# Example usage
model = HybridQuantumClassicalNN(n_qubits=4, n_features=8, n_classes=2)
print("Hybrid Model Architecture:")
print(model)
```

## Classification Using Hybrid Quantum-Classical Neural Network

Complete implementation for classification tasks.

### Data Preparation

```python
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def prepare_classification_data(n_samples=200, n_features=4, n_classes=2):
    """Prepare data for classification"""
    X, y = make_classification(
        n_samples=n_samples,
        n_features=n_features,
        n_classes=n_classes,
        n_informative=n_features,
        n_redundant=0,
        random_state=42
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Normalize
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    return X_train, X_test, y_train, y_test, scaler

X_train, X_test, y_train, y_test, scaler = prepare_classification_data()
print(f"Training set: {X_train.shape}")
print(f"Test set: {X_test.shape}")
```

### Quantum Feature Map

```python
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes

def create_quantum_classifier(n_qubits=4):
    """Create quantum classifier using VQC"""
    
    # Feature map: encodes classical data
    feature_map = ZZFeatureMap(
        feature_dimension=n_qubits,
        reps=2,
        entanglement='linear'
    )
    
    # Ansatz: variational circuit
    ansatz = RealAmplitudes(
        num_qubits=n_qubits,
        reps=3,
        entanglement='linear'
    )
    
    # Variational Quantum Classifier
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    return vqc, feature_map, ansatz

vqc, feature_map, ansatz = create_quantum_classifier(n_qubits=4)
print("Quantum Classifier Components:")
print(f"Feature Map: {feature_map.num_qubits} qubits")
print(f"Ansatz: {ansatz.num_parameters} parameters")
```

### Training the Hybrid Network

```python
def train_hybrid_classifier(X_train, y_train, n_qubits=4):
    """Train hybrid quantum-classical classifier"""
    
    # Reduce features to match qubits
    if X_train.shape[1] > n_qubits:
        from sklearn.decomposition import PCA
        pca = PCA(n_components=n_qubits)
        X_train_reduced = pca.fit_transform(X_train)
    else:
        X_train_reduced = X_train
        pca = None
    
    # Create and train VQC
    vqc, _, _ = create_quantum_classifier(n_qubits)
    
    print("Training Quantum Classifier...")
    vqc.fit(X_train_reduced, y_train)
    
    print("Training complete!")
    
    return vqc, pca

# Train
vqc_trained, pca_model = train_hybrid_classifier(X_train, y_train, n_qubits=4)

# Evaluate
if pca_model:
    X_test_reduced = pca_model.transform(X_test)
else:
    X_test_reduced = X_test

score = vqc_trained.score(X_test_reduced, y_test)
print(f"\nTest Accuracy: {score:.3f}")
```

### Complete Hybrid Classification Pipeline

```python
class CompleteHybridClassifier:
    """Complete hybrid quantum-classical classifier"""
    
    def __init__(self, n_qubits=4, use_pca=True):
        self.n_qubits = n_qubits
        self.use_pca = use_pca
        self.pca = None
        self.vqc = None
    
    def fit(self, X, y):
        """Train the classifier"""
        # Preprocessing
        if self.use_pca and X.shape[1] > self.n_qubits:
            from sklearn.decomposition import PCA
            self.pca = PCA(n_components=self.n_qubits)
            X_processed = self.pca.fit_transform(X)
        else:
            X_processed = X
        
        # Create VQC
        feature_map = ZZFeatureMap(
            feature_dimension=self.n_qubits,
            reps=2
        )
        ansatz = RealAmplitudes(
            num_qubits=self.n_qubits,
            reps=2
        )
        
        self.vqc = VQC(
            feature_map=feature_map,
            ansatz=ansatz,
            optimizer=SPSA(maxiter=100),
            quantum_instance=Aer.get_backend('qasm_simulator')
        )
        
        # Train
        self.vqc.fit(X_processed, y)
    
    def predict(self, X):
        """Make predictions"""
        if self.pca:
            X_processed = self.pca.transform(X)
        else:
            X_processed = X
        
        return self.vqc.predict(X_processed)
    
    def score(self, X, y):
        """Compute accuracy"""
        if self.pca:
            X_processed = self.pca.transform(X)
        else:
            X_processed = X
        
        return self.vqc.score(X_processed, y)

# Usage
classifier = CompleteHybridClassifier(n_qubits=4, use_pca=True)
classifier.fit(X_train, y_train)
accuracy = classifier.score(X_test, y_test)
print(f"Hybrid Classifier Accuracy: {accuracy:.3f}")
```

## Quantum Neural Network for Classification on Near-Term Processors

Designing quantum neural networks optimized for current quantum hardware.

### Near-Term Considerations

```python
def near_term_considerations():
    """Considerations for near-term quantum processors"""
    print("Near-Term Quantum Hardware Constraints:")
    print("\n1. Limited Qubits:")
    print("   - Current devices: 50-100+ qubits")
    print("   - Design circuits for available qubits")
    
    print("\n2. Limited Coherence Time:")
    print("   - Short circuit depth required")
    print("   - Minimize number of gates")
    
    print("\n3. Noise and Errors:")
    print("   - Use error mitigation techniques")
    print("   - Design robust circuits")
    
    print("\n4. Connectivity:")
    print("   - Limited qubit connectivity")
    print("   - Use linear or nearest-neighbor entanglement")
    
    print("\n5. Measurement Fidelity:")
    print("   - Multiple shots needed")
    print("   - Use error correction where possible")

near_term_considerations()
```

### Optimized Quantum Neural Network

```python
def optimized_qnn_near_term(n_qubits=4, n_features=4):
    """Optimized QNN for near-term processors"""
    
    # Use shallow circuits
    feature_map = ZZFeatureMap(
        feature_dimension=n_qubits,
        reps=1,  # Shallow: only 1 repetition
        entanglement='linear'  # Linear connectivity
    )
    
    # Shallow ansatz
    ansatz = RealAmplitudes(
        num_qubits=n_qubits,
        reps=1,  # Minimal depth
        entanglement='linear'
    )
    
    print("Optimized QNN for Near-Term Hardware:")
    print(f"- Feature map depth: {feature_map.reps}")
    print(f"- Ansatz depth: {ansatz.reps}")
    print(f"- Total parameters: {ansatz.num_parameters}")
    print(f"- Connectivity: linear (nearest neighbor)")
    
    # Use error mitigation
    from qiskit.utils import QuantumInstance
    from qiskit.providers.aer import QasmSimulator
    
    backend = QasmSimulator()
    quantum_instance = QuantumInstance(
        backend=backend,
        shots=1024,  # More shots for better statistics
        # error_mitigation=True  # Enable if available
    )
    
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=COBYLA(maxiter=50),  # Fewer iterations
        quantum_instance=quantum_instance
    )
    
    return vqc

vqc_optimized = optimized_qnn_near_term(n_qubits=4, n_features=4)
```

### Error Mitigation Strategies

```python
def error_mitigation_strategies():
    """Error mitigation for near-term quantum neural networks"""
    
    print("Error Mitigation Strategies:")
    print("\n1. Measurement Error Mitigation:")
    print("   - Calibrate measurement errors")
    print("   - Apply correction matrix")
    
    print("\n2. Zero Noise Extrapolation:")
    print("   - Run at different noise levels")
    print("   - Extrapolate to zero noise")
    
    print("\n3. Symmetry Verification:")
    print("   - Check circuit symmetries")
    print("   - Reject invalid results")
    
    print("\n4. Readout Error Mitigation:")
    print("   - Characterize readout errors")
    print("   - Correct measurement results")
    
    print("\n5. Variational Error Suppression:")
    print("   - Optimize for error robustness")
    print("   - Use error-aware cost functions")

error_mitigation_strategies()
```

### Practical Implementation

```python
def practical_qnn_implementation():
    """Practical QNN implementation for near-term hardware"""
    
    # 1. Data preprocessing (classical)
    # Reduce to manageable size
    n_qubits = 4
    n_features = 8
    
    # 2. Feature selection/reduction
    from sklearn.feature_selection import SelectKBest, f_classif
    
    # 3. Create shallow quantum circuit
    feature_map = ZZFeatureMap(n_qubits, reps=1, entanglement='linear')
    ansatz = RealAmplitudes(n_qubits, reps=1, entanglement='linear')
    
    # 4. Use efficient optimizer
    optimizer = COBYLA(maxiter=30)  # Fast convergence
    
    # 5. Configure quantum instance
    backend = Aer.get_backend('qasm_simulator')
    quantum_instance = QuantumInstance(
        backend=backend,
        shots=2048,  # More shots for accuracy
        seed_simulator=42,
        seed_transpiler=42
    )
    
    # 6. Create and train VQC
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=optimizer,
        quantum_instance=quantum_instance
    )
    
    print("Practical QNN Implementation:")
    print("- Shallow circuits (depth = 1)")
    print("- Linear connectivity")
    print("- Efficient optimization")
    print("- Error-aware training")
    
    return vqc

vqc_practical = practical_qnn_implementation()
```

## Training Quantum Neural Networks

### Gradient-Based Optimization

```python
def quantum_gradient_estimation():
    """Estimate gradients for quantum neural networks"""
    
    print("Quantum Gradient Estimation:")
    print("\n1. Parameter Shift Rule:")
    print("   ∂f/∂θ = [f(θ + π/2) - f(θ - π/2)] / 2")
    print("   - Exact gradients")
    print("   - Requires 2 evaluations per parameter")
    
    print("\n2. Finite Differences:")
    print("   ∂f/∂θ ≈ [f(θ + ε) - f(θ - ε)] / (2ε)")
    print("   - Approximate gradients")
    print("   - Sensitive to noise")
    
    print("\n3. Simultaneous Perturbation:")
    print("   - Perturb all parameters simultaneously")
    print("   - Fewer circuit evaluations")
    
    print("\n4. Quantum Natural Gradients:")
    print("   - Uses quantum Fisher information")
    print("   - Better convergence")

quantum_gradient_estimation()
```

### Optimization Strategies

```python
def optimization_strategies():
    """Optimization strategies for QNNs"""
    
    optimizers = {
        'SPSA': {
            'description': 'Simultaneous Perturbation Stochastic Approximation',
            'use_case': 'Noisy quantum hardware',
            'advantages': 'Robust to noise, few evaluations'
        },
        'COBYLA': {
            'description': 'Constrained Optimization BY Linear Approximation',
            'use_case': 'Smooth cost landscapes',
            'advantages': 'No gradients needed'
        },
        'L-BFGS-B': {
            'description': 'Limited-memory BFGS',
            'use_case': 'Classical simulation',
            'advantages': 'Fast convergence'
        },
        'Adam': {
            'description': 'Adaptive moment estimation',
            'use_case': 'Hybrid training',
            'advantages': 'Adaptive learning rate'
        }
    }
    
    print("Optimization Strategies:")
    for name, info in optimizers.items():
        print(f"\n{name}:")
        print(f"  Description: {info['description']}")
        print(f"  Use case: {info['use_case']}")
        print(f"  Advantages: {info['advantages']}")

optimization_strategies()
```

## Complete Example: End-to-End Quantum Neural Network

```python
def complete_qnn_example():
    """Complete end-to-end quantum neural network example"""
    
    # 1. Load and prepare data
    from sklearn.datasets import load_iris
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    
    data = load_iris()
    X, y = data.data, data.target
    
    # Binary classification (setosa vs others)
    y_binary = (y == 0).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_binary, test_size=0.2, random_state=42
    )
    
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # 2. Reduce features to 4 qubits
    from sklearn.decomposition import PCA
    pca = PCA(n_components=4)
    X_train_reduced = pca.fit_transform(X_train)
    X_test_reduced = pca.transform(X_test)
    
    # 3. Create quantum classifier
    feature_map = ZZFeatureMap(feature_dimension=4, reps=2)
    ansatz = RealAmplitudes(num_qubits=4, reps=2)
    
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    # 4. Train
    print("Training Quantum Neural Network...")
    vqc.fit(X_train_reduced, y_train)
    
    # 5. Evaluate
    train_score = vqc.score(X_train_reduced, y_train)
    test_score = vqc.score(X_test_reduced, y_test)
    
    print(f"\nTraining Accuracy: {train_score:.3f}")
    print(f"Test Accuracy: {test_score:.3f}")
    
    # 6. Predictions
    predictions = vqc.predict(X_test_reduced)
    print(f"\nSample Predictions: {predictions[:5]}")
    print(f"True Labels: {y_test[:5]}")
    
    return vqc, pca, scaler

# Run complete example
print("Complete Quantum Neural Network Example:")
vqc_model, pca_model, scaler_model = complete_qnn_example()
```

## Key Takeaways

- ✅ **Hybrid networks** combine classical and quantum layers
- ✅ **Quantum feature maps** encode classical data
- ✅ **Variational circuits** provide trainable quantum layers
- ✅ **Near-term optimization** requires shallow circuits
- ✅ **Error mitigation** is crucial for noisy hardware
- ✅ **Gradient estimation** uses parameter shift rules
- ✅ **Optimization** strategies depend on hardware and problem

## Next Steps

Continue to [Module 7: Quantum Variational Optimization and Adiabatic Methods](07-variational-optimization.md) to learn about:
- Variational Quantum Eigensolver (VQE)
- Quantum Approximate Optimization Algorithm (QAOA)
- Quantum adiabatic methods
- Applications in finance and optimization

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit Machine Learning](https://qiskit.org/ecosystem/machine-learning/)
    2. [Variational Quantum Classifiers](https://qiskit.org/documentation/machine-learning/tutorials/02_vqc.html)
    3. [Quantum Neural Networks](https://pennylane.ai/qml/)
    4. [Hybrid Quantum-Classical Models](https://pennylane.ai/qml/demos/tutorial_quantum_neural_net.html)

???+ "📖 Essential Articles"
    1. [Quantum Neural Networks](https://arxiv.org/abs/1802.06002)
    2. [Hybrid Quantum-Classical Machine Learning](https://arxiv.org/abs/1907.02085)
    3. [Variational Quantum Algorithms](https://arxiv.org/abs/2012.09265)

---

*Last Updated: November 2024*

