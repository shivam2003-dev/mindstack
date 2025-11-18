# Module 5: Quantum Machine Learning

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand quantum data encoding techniques</li>
    <li>Implement HHL algorithm for linear systems</li>
    <li>Build quantum linear regression models</li>
    <li>Implement quantum clustering (K-Means)</li>
    <li>Build quantum SVM classifiers</li>
    <li>Understand quantum PCA</li>
  </ul>
</div>

This module introduces quantum machine learning techniques that leverage quantum computing for enhanced performance in ML tasks.

!!! success "Module Overview"
    Quantum ML combines quantum computing with machine learning to potentially achieve speedup in data processing, optimization, and pattern recognition.

## Data Encoding

Encoding classical data into quantum states is fundamental for quantum ML.

### Basis Encoding

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.quantum_info import Statevector
import numpy as np

def basis_encoding(data, n_qubits):
    """Encode classical data using basis states"""
    # Convert data to binary representation
    qc = QuantumCircuit(n_qubits)
    
    # For each data point, create corresponding basis state
    # Example: data = [1, 0, 1] → |101⟩
    for i, bit in enumerate(data):
        if bit == 1:
            qc.x(i)
    
    return qc

# Example: Encode [1, 0, 1]
qc_basis = basis_encoding([1, 0, 1], 3)
print("Basis Encoding [1,0,1]:")
print(qc_basis.draw())

simulator = Aer.get_backend('statevector_simulator')
job = execute(qc_basis, simulator)
result = job.result()
statevector = result.get_statevector()
print(f"State: {statevector}")
```

### Amplitude Encoding

```python
def amplitude_encoding(data, normalize=True):
    """Encode data in amplitudes of quantum state"""
    data = np.array(data)
    
    if normalize:
        # Normalize: |ψ⟩ = Σᵢ (xᵢ/||x||) |i⟩
        norm = np.linalg.norm(data)
        data = data / norm
    
    n_qubits = int(np.ceil(np.log2(len(data))))
    # Pad to power of 2
    padded_data = np.zeros(2**n_qubits)
    padded_data[:len(data)] = data
    if normalize:
        padded_data = padded_data / np.linalg.norm(padded_data)
    
    qc = QuantumCircuit(n_qubits)
    qc.initialize(padded_data, range(n_qubits))
    
    return qc

# Example: Encode [1, 2, 3, 4]
data = [1, 2, 3, 4]
qc_amplitude = amplitude_encoding(data)
print("\nAmplitude Encoding:")
print(qc_amplitude.draw())

job = execute(qc_amplitude, simulator)
result = job.result()
statevector = result.get_statevector()
print(f"Statevector: {statevector}")
print(f"Data encoded in amplitudes")
```

### Angle Encoding

```python
def angle_encoding(data, n_qubits):
    """Encode data using rotation angles"""
    qc = QuantumCircuit(n_qubits)
    
    # Encode each feature as rotation angle
    for i, feature in enumerate(data[:n_qubits]):
        qc.ry(feature, i)  # Rotate around Y-axis
    
    return qc

# Example: Encode [π/4, π/3, π/6]
data = [np.pi/4, np.pi/3, np.pi/6]
qc_angle = angle_encoding(data, 3)
print("\nAngle Encoding:")
print(qc_angle.draw())
```

!!! tip "Encoding Choice"
    - **Basis encoding**: Discrete data, simple
    - **Amplitude encoding**: Dense data, exponential compression
    - **Angle encoding**: Continuous features, easy to implement

## HHL Algorithm

**HHL (Harrow-Hassidim-Lloyd)** solves linear systems Ax = b exponentially faster than classical methods.

### Problem Statement

Given A (N×N matrix) and b (N×1 vector), find x such that Ax = b.

### HHL Implementation

```python
from qiskit.algorithms import HHL
from qiskit.algorithms.linear_solvers import HHL as HHL_solver
from qiskit.quantum_info import Operator
import numpy as np

def hhl_algorithm_simple(A, b):
    """Simplified HHL algorithm implementation"""
    # HHL steps:
    # 1. Encode b in quantum state |b⟩
    # 2. Apply quantum phase estimation to find eigenvalues
    # 3. Invert eigenvalues (1/λ)
    # 4. Uncompute phase estimation
    # 5. Result: |x⟩ proportional to A⁻¹|b⟩
    
    n = int(np.ceil(np.log2(len(b))))
    
    # Normalize b
    b_norm = np.linalg.norm(b)
    b_normalized = b / b_norm
    
    # Encode |b⟩
    qc = QuantumCircuit(n + 1, n)  # +1 for ancilla
    qc.initialize(b_normalized, range(n))
    
    # Phase estimation (simplified)
    # In full HHL, this involves:
    # - Hamiltonian simulation: exp(iAt)
    # - Quantum phase estimation
    # - Eigenvalue inversion
    
    print("HHL Algorithm (simplified):")
    print("1. Encode |b⟩")
    print("2. Phase estimation of A")
    print("3. Invert eigenvalues")
    print("4. Uncompute")
    print("5. Result: |x⟩")
    
    return qc

# Example: Solve 2x = 4 (trivial, but demonstrates concept)
A = np.array([[2]])
b = np.array([4])
qc_hhl = hhl_algorithm_simple(A, b)
print(qc_hhl.draw())
```

### HHL with Qiskit

```python
def hhl_qiskit_example():
    """HHL using Qiskit's implementation"""
    # Note: Full HHL requires quantum phase estimation
    # and Hamiltonian simulation
    
    # Simple 2x2 system: [[2, 1], [1, 2]] x = [1, 0]
    A = np.array([[2, 1], [1, 2]])
    b = np.array([1, 0])
    
    # Classical solution
    x_classical = np.linalg.solve(A, b)
    print("Classical solution:", x_classical)
    
    # Quantum solution (conceptual)
    print("\nHHL Algorithm:")
    print("- Encodes b in quantum state")
    print("- Uses phase estimation to find eigenvalues")
    print("- Inverts eigenvalues quantumly")
    print("- Outputs solution in quantum state")
    print("- Exponential speedup for sparse matrices")

hhl_qiskit_example()
```

!!! note "HHL Requirements"
    HHL provides speedup when:
    - Matrix A is sparse and well-conditioned
    - Solution is needed in quantum form
    - Condition number is low
    - **Not faster** for reading out full classical solution

## Quantum Linear Regression

Quantum version of linear regression using quantum circuits.

### Implementation

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit.library import RealAmplitudes
from qiskit.algorithms.optimizers import SPSA
import numpy as np

def quantum_linear_regression(X, y, n_qubits=2):
    """Quantum linear regression"""
    # Encode features X into quantum states
    # Use variational circuit to learn weights
    # Minimize loss: ||y - Xw||²
    
    # Variational circuit (ansatz)
    ansatz = RealAmplitudes(n_qubits, reps=2)
    
    # Cost function
    def cost_function(params):
        """Compute cost for given parameters"""
        qc = QuantumCircuit(n_qubits)
        
        # Encode data
        for i, x in enumerate(X[:n_qubits]):
            qc.ry(x, i)
        
        # Apply variational circuit
        qc = qc.compose(ansatz.bind_parameters(params))
        
        # Measure expectation value
        # (Simplified - full implementation measures <Z>)
        simulator = Aer.get_backend('qasm_simulator')
        job = execute(qc, simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)
        
        # Compute prediction and loss
        # (Simplified cost calculation)
        prediction = 0.5  # Placeholder
        loss = np.mean((y - prediction)**2)
        
        return loss
    
    # Optimize
    optimizer = SPSA(maxiter=100)
    initial_params = np.random.random(ansatz.num_parameters)
    
    print("Quantum Linear Regression:")
    print("- Encodes features in quantum states")
    print("- Uses variational circuit")
    print("- Optimizes parameters classically")
    print("- Can provide speedup for large datasets")
    
    return cost_function, ansatz

# Example
X = np.array([[0.5], [1.0], [1.5]])
y = np.array([1.0, 2.0, 3.0])
cost_fn, ansatz = quantum_linear_regression(X, y)
```

## Quantum Swap Test

**Swap test** measures the overlap between two quantum states.

### Implementation

```python
def swap_test(state1, state2, n_qubits):
    """Quantum swap test to measure |⟨ψ₁|ψ₂⟩|²"""
    qc = QuantumCircuit(2*n_qubits + 1, 1)  # +1 ancilla
    
    # Prepare states
    qc.initialize(state1, range(n_qubits))
    qc.initialize(state2, range(n_qubits, 2*n_qubits))
    
    # Swap test
    qc.h(2*n_qubits)  # Ancilla in |+⟩
    
    # Controlled swaps
    for i in range(n_qubits):
        qc.cswap(2*n_qubits, i, n_qubits + i)
    
    qc.h(2*n_qubits)  # Hadamard on ancilla
    
    # Measure ancilla
    qc.measure(2*n_qubits, 0)
    
    # Probability of |0⟩: P(0) = (1 + |⟨ψ₁|ψ₂⟩|²)/2
    # Overlap: |⟨ψ₁|ψ₂⟩|² = 2P(0) - 1
    
    return qc

# Example: Compare |00⟩ and |00⟩ (should have overlap 1)
state1 = [1, 0, 0, 0]  # |00⟩
state2 = [1, 0, 0, 0]  # |00⟩
qc_swap = swap_test(state1, state2, 2)

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_swap, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_swap)
p0 = counts.get('0', 0) / 1000
overlap = 2 * p0 - 1

print("Swap Test:")
print(f"P(0) = {p0:.3f}")
print(f"Overlap |⟨ψ₁|ψ₂⟩|² = {overlap:.3f}")
print("Expected: 1.0 (same states)")
```

## Quantum Euclidean Distance

Compute distance between data points using quantum circuits.

```python
def quantum_euclidean_distance(x1, x2, n_qubits):
    """Compute Euclidean distance using quantum circuit"""
    # Encode x1 and x2 in quantum states
    # Use swap test to measure distance
    
    # Normalize vectors
    x1_norm = x1 / np.linalg.norm(x1)
    x2_norm = x2 / np.linalg.norm(x2)
    
    # Encode in quantum states
    qc = QuantumCircuit(2*n_qubits + 1, 1)
    qc.initialize(x1_norm, range(n_qubits))
    qc.initialize(x2_norm, range(n_qubits, 2*n_qubits))
    
    # Swap test gives overlap
    qc.h(2*n_qubits)
    for i in range(n_qubits):
        qc.cswap(2*n_qubits, i, n_qubits + i)
    qc.h(2*n_qubits)
    qc.measure(2*n_qubits, 0)
    
    # Distance: ||x1 - x2||² = ||x1||² + ||x2||² - 2⟨x1|x2⟩
    # Can be computed from overlap
    
    return qc

# Example
x1 = np.array([1, 0])
x2 = np.array([0, 1])
qc_dist = quantum_euclidean_distance(x1, x2, 1)
print("Quantum Euclidean Distance:")
print("Uses swap test to compute inner product")
print("Distance derived from overlap measurement")
```

## Quantum K-Means Clustering

Quantum version of K-means clustering algorithm.

```python
def quantum_kmeans(X, k, n_qubits=2, max_iter=10):
    """Quantum K-means clustering"""
    # 1. Initialize k centroids
    centroids = X[np.random.choice(len(X), k, replace=False)]
    
    for iteration in range(max_iter):
        # 2. Assign points to nearest centroid (quantum)
        assignments = []
        for x in X:
            # Compute distances to all centroids using quantum circuits
            distances = []
            for centroid in centroids:
                # Use quantum distance computation
                qc = quantum_euclidean_distance(x, centroid, n_qubits)
                # Execute and get distance (simplified)
                distance = np.linalg.norm(x - centroid)  # Classical for now
                distances.append(distance)
            assignments.append(np.argmin(distances))
        
        # 3. Update centroids
        for i in range(k):
            cluster_points = X[np.array(assignments) == i]
            if len(cluster_points) > 0:
                centroids[i] = np.mean(cluster_points, axis=0)
    
    print("Quantum K-Means:")
    print("- Uses quantum distance computation")
    print("- Can provide speedup for high-dimensional data")
    print("- Quantum advantage in distance calculations")
    
    return centroids, assignments

# Example
X = np.random.rand(10, 2)
centroids, assignments = quantum_kmeans(X, k=2)
print(f"Centroids: {centroids}")
print(f"Assignments: {assignments[:5]}...")
```

## Quantum Principal Component Analysis

Quantum PCA for dimensionality reduction.

```python
def quantum_pca(X, n_components=2):
    """Quantum Principal Component Analysis"""
    # 1. Encode data in quantum states
    # 2. Use quantum phase estimation to find eigenvalues
    # 3. Extract principal components
    
    # Encode covariance matrix
    cov_matrix = np.cov(X.T)
    
    # Use HHL-like approach to find eigenvectors
    # (Simplified - full QPCA uses phase estimation)
    
    print("Quantum PCA:")
    print("- Encodes covariance matrix")
    print("- Uses phase estimation for eigenvalues")
    print("- Extracts principal components quantumly")
    print("- Exponential speedup for large matrices")
    
    # Classical PCA for comparison
    from sklearn.decomposition import PCA
    pca_classical = PCA(n_components=n_components)
    X_reduced = pca_classical.fit_transform(X)
    
    return X_reduced

# Example
X = np.random.rand(100, 10)
X_qpca = quantum_pca(X, n_components=2)
print(f"Reduced shape: {X_qpca.shape}")
```

## Quantum Support Vector Machines

Quantum SVM for classification tasks.

### Implementation

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit.algorithms.optimizers import SPSA
from qiskit_machine_learning.algorithms import VQC
from qiskit_machine_learning.kernels import QuantumKernel
import numpy as np

def quantum_svm(X_train, y_train, X_test, n_qubits=2):
    """Quantum Support Vector Machine"""
    
    # Feature map: encodes data into quantum states
    feature_map = ZZFeatureMap(feature_dimension=n_qubits, reps=2)
    
    # Variational circuit (ansatz)
    ansatz = RealAmplitudes(n_qubits, reps=2)
    
    # Quantum kernel: K(xᵢ, xⱼ) = |⟨φ(xᵢ)|φ(xⱼ)⟩|²
    quantum_kernel = QuantumKernel(
        feature_map=feature_map,
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    # Compute kernel matrix
    kernel_matrix = quantum_kernel.evaluate(X_train, X_train)
    
    print("Quantum SVM:")
    print("- Uses quantum feature map")
    print("- Quantum kernel: K(xᵢ, xⱼ) = |⟨φ(xᵢ)|φ(xⱼ)⟩|²")
    print("- Can capture complex patterns")
    print("- Potential speedup for large feature spaces")
    
    # Variational Quantum Classifier
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    # Train
    vqc.fit(X_train, y_train)
    
    # Predict
    predictions = vqc.predict(X_test)
    
    return vqc, predictions

# Example
X_train = np.random.rand(20, 2)
y_train = np.random.randint(0, 2, 20)
X_test = np.random.rand(5, 2)

# Note: This is a simplified example
# Full implementation requires proper data encoding
print("Quantum SVM Implementation:")
print("1. Encode features using quantum feature map")
print("2. Compute quantum kernel matrix")
print("3. Train classifier (variational or kernel-based)")
print("4. Make predictions")
```

### SVM with Qiskit

```python
def qsvm_qiskit_example():
    """Complete QSVM example using Qiskit"""
    from qiskit_machine_learning.datasets import ad_hoc_data
    
    # Load data
    feature_dim = 2
    training_size = 20
    test_size = 10
    
    # Generate dataset
    training_data, training_labels, test_data, test_labels = ad_hoc_data(
        training_size=training_size,
        test_size=test_size,
        n=feature_dim,
        gap=0.3
    )
    
    # Feature map
    feature_map = ZZFeatureMap(feature_dimension=feature_dim, reps=2)
    
    # Ansatz
    ansatz = RealAmplitudes(feature_dim, reps=2)
    
    # VQC
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    # Train
    vqc.fit(training_data, training_labels)
    
    # Test
    score = vqc.score(test_data, test_labels)
    print(f"QSVM Accuracy: {score:.3f}")
    
    return vqc

# Uncomment to run (requires qiskit_machine_learning)
# vqc_model = qsvm_qiskit_example()
```

## Complete Example: Quantum ML Pipeline

```python
def quantum_ml_pipeline():
    """Complete quantum ML pipeline"""
    print("Quantum ML Pipeline:")
    print("\n1. Data Encoding:")
    print("   - Choose encoding (basis, amplitude, angle)")
    print("   - Encode classical data into quantum states")
    
    print("\n2. Feature Engineering:")
    print("   - Quantum feature maps")
    print("   - Quantum kernels")
    
    print("\n3. Model Training:")
    print("   - Variational quantum circuits")
    print("   - Quantum optimization")
    
    print("\n4. Prediction:")
    print("   - Quantum measurement")
    print("   - Classical post-processing")
    
    print("\n5. Evaluation:")
    print("   - Compare with classical methods")
    print("   - Assess quantum advantage")

quantum_ml_pipeline()
```

## Key Takeaways

- ✅ **Data encoding** is crucial for quantum ML
- ✅ **HHL algorithm** solves linear systems quantumly
- ✅ **Quantum regression** uses variational circuits
- ✅ **Swap test** measures state overlap
- ✅ **Quantum clustering** leverages quantum distance computation
- ✅ **Quantum SVM** uses quantum kernels for classification
- ✅ **Quantum PCA** provides dimensionality reduction

## Next Steps

Continue to [Module 6: Quantum Deep Learning](06-quantum-deep-learning.md) to learn about:
- Hybrid quantum-classical neural networks
- Quantum neural network architectures
- Training quantum neural networks

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit Machine Learning](https://qiskit.org/ecosystem/machine-learning/)
    2. [PennyLane QML](https://pennylane.ai/qml/)
    3. [Quantum Feature Maps](https://qiskit.org/documentation/machine-learning/tutorials/01_quantum_feature_maps.html)
    4. [Variational Quantum Classifiers](https://qiskit.org/documentation/machine-learning/tutorials/02_vqc.html)

???+ "📖 Essential Articles"
    1. [Quantum Machine Learning](https://en.wikipedia.org/wiki/Quantum_machine_learning)
    2. [HHL Algorithm](https://arxiv.org/abs/0811.3171)
    3. [Quantum SVM](https://arxiv.org/abs/1307.0471)

---

*Last Updated: November 2024*

