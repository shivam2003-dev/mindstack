# Quantum Computing & Machine Learning - Projects

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🚀 Project Portfolio</h2>
  <p style="margin: 1rem 0 0 0;">Hands-on projects to apply your quantum computing knowledge</p>
</div>

This section provides a comprehensive list of projects covering various aspects of quantum computing and machine learning. Each project includes objectives, implementation guidance, and expected outcomes.

!!! success "Project Overview"
    These projects range from beginner to advanced levels and cover quantum algorithms, quantum machine learning, optimization, and real-world applications.

## Project Categories

- **Quantum Algorithms**: Implementing and optimizing quantum algorithms
- **Quantum Machine Learning**: Building QML models for classification and regression
- **Quantum Optimization**: Solving optimization problems with quantum algorithms
- **Quantum Chemistry**: Computing molecular properties using VQE
- **Quantum Cryptography**: Implementing quantum key distribution protocols
- **Hybrid Systems**: Combining quantum and classical computing

## Beginner Projects

### Project 1: Implementing Grover's Algorithm and Proving Optimality

**Difficulty**: Beginner  
**Estimated Time**: 4-6 hours  
**Prerequisites**: Module 1, Module 3

#### Objectives
- Implement Grover's search algorithm in Qiskit
- Prove optimality of Grover's search (bounded error and zero error)
- Compare quantum search with classical search

#### Implementation Steps

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit.library import GroverOperator
from qiskit.algorithms import Grover
from qiskit.quantum_info import Statevector
import numpy as np

def grover_algorithm_implementation(marked_state, n_qubits):
    """Implement Grover's algorithm"""
    
    # Step 1: Create oracle that marks the target
    def create_oracle(marked_state, n_qubits):
        qc = QuantumCircuit(n_qubits)
        # Mark the target state
        binary = format(marked_state, f'0{n_qubits}b')
        for i, bit in enumerate(binary):
            if bit == '0':
                qc.x(i)
        # Multi-controlled Z
        if n_qubits == 2:
            qc.cz(0, 1)
        elif n_qubits == 3:
            qc.h(2)
            qc.ccx(0, 1, 2)
            qc.h(2)
        # Uncompute
        for i, bit in enumerate(binary):
            if bit == '0':
                qc.x(i)
        return qc
    
    # Step 2: Create diffusion operator
    def create_diffusion(n_qubits):
        qc = QuantumCircuit(n_qubits)
        for i in range(n_qubits):
            qc.h(i)
            qc.x(i)
        if n_qubits == 2:
            qc.cz(0, 1)
        elif n_qubits == 3:
            qc.h(2)
            qc.ccx(0, 1, 2)
            qc.h(2)
        for i in range(n_qubits):
            qc.x(i)
            qc.h(i)
        return qc
    
    # Step 3: Optimal number of iterations
    N = 2**n_qubits
    num_iterations = int(np.pi / 4 * np.sqrt(N))
    
    # Step 4: Build circuit
    qc = QuantumCircuit(n_qubits, n_qubits)
    
    # Initialize superposition
    for i in range(n_qubits):
        qc.h(i)
    
    # Grover iterations
    oracle = create_oracle(marked_state, n_qubits)
    diffusion = create_diffusion(n_qubits)
    
    for _ in range(num_iterations):
        qc = qc.compose(oracle)
        qc = qc.compose(diffusion)
    
    # Measure
    qc.measure_all()
    
    return qc, num_iterations

# Test
qc, iterations = grover_algorithm_implementation(3, 2)  # Find |11⟩
print(f"Grover's algorithm with {iterations} iterations")
print(qc.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)
print(f"Results: {counts}")
```

#### Proving Optimality

```python
def prove_grover_optimality():
    """Prove optimality of Grover's algorithm"""
    
    print("Grover's Algorithm Optimality Proof:")
    print("\n1. Bounded Error:")
    print("   - Classical: O(N) queries for bounded error")
    print("   - Grover: O(√N) queries for bounded error")
    print("   - Proved optimal by Bennett et al. (1997)")
    
    print("\n2. Zero Error:")
    print("   - Classical: O(N) queries")
    print("   - Grover: O(√N) queries (with small error)")
    print("   - For zero error, requires O(N) queries")
    
    print("\n3. Lower Bound:")
    print("   - Any quantum algorithm needs Ω(√N) queries")
    print("   - Grover achieves this bound")
    print("   - Therefore, Grover is optimal!")

prove_grover_optimality()
```

#### Expected Outcomes
- Working Grover's algorithm implementation
- Understanding of optimality proofs
- Comparison with classical search algorithms

---

### Project 2: To Implement Grover's Search Algorithm Where 1101 Is the Marked State

**Difficulty**: Beginner  
**Estimated Time**: 3-4 hours  
**Prerequisites**: Module 1, Module 3

#### Objectives
- Implement Grover's algorithm for a specific marked state
- Visualize the search process
- Analyze success probability

#### Implementation

```python
def grover_specific_state():
    """Grover's algorithm for |1101⟩"""
    
    marked_state = int('1101', 2)  # Binary 1101 = decimal 13
    n_qubits = 4
    
    qc, iterations = grover_algorithm_implementation(marked_state, n_qubits)
    
    print(f"Searching for state |1101⟩ (decimal {marked_state})")
    print(f"Number of iterations: {iterations}")
    
    simulator = Aer.get_backend('qasm_simulator')
    job = execute(qc, simulator, shots=1000)
    result = job.result()
    counts = result.get_counts(qc)
    
    print(f"\nMeasurement results: {counts}")
    print(f"Success rate: {counts.get('1101', 0) / 1000 * 100:.1f}%")
    
    return qc

grover_specific_state()
```

---

### Project 3: To Understand and Implement Quantum Counting

**Difficulty**: Beginner-Intermediate  
**Estimated Time**: 5-7 hours  
**Prerequisites**: Module 3, Module 4

#### Objectives
- Understand quantum counting algorithm
- Implement quantum counting using phase estimation
- Count marked items in a database

#### Implementation

```python
from qiskit.algorithms import AmplitudeEstimation
from qiskit.circuit.library import GroverOperator

def quantum_counting(marked_items, total_items, n_qubits):
    """Quantum counting algorithm"""
    
    # Number of marked items
    M = len(marked_items)
    N = total_items
    
    # Amplitude: √(M/N)
    amplitude = np.sqrt(M / N)
    
    print("Quantum Counting:")
    print(f"Total items: {N}")
    print(f"Marked items: {M}")
    print(f"Amplitude: {amplitude:.4f}")
    
    # Use amplitude estimation
    # (Simplified - full implementation uses phase estimation)
    
    # Estimate using Grover iterations
    # Number of iterations gives estimate of M
    
    return M, N

quantum_counting([1, 3, 5], 8, 3)
```

---

## Intermediate Projects

### Project 4: Hybrid Quantum Neural Networks for Remote Sensing Imagery Classification

**Difficulty**: Intermediate  
**Estimated Time**: 15-20 hours  
**Prerequisites**: Module 5, Module 6

#### Objectives
- Build hybrid quantum-classical neural network
- Classify remote sensing images
- Compare with classical methods

#### Implementation Guide

```python
from qiskit_machine_learning.algorithms import VQC
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit.algorithms.optimizers import SPSA
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

def hybrid_qnn_remote_sensing():
    """Hybrid QNN for remote sensing classification"""
    
    print("Hybrid Quantum Neural Network for Remote Sensing:")
    print("\n1. Data Preparation:")
    print("   - Load remote sensing imagery")
    print("   - Extract features (spectral bands)")
    print("   - Normalize and preprocess")
    
    print("\n2. Classical Preprocessing:")
    print("   - PCA for dimensionality reduction")
    print("   - Feature selection")
    print("   - Data augmentation")
    
    print("\n3. Quantum Layer:")
    print("   - Encode features using quantum feature map")
    print("   - Apply variational quantum circuit")
    print("   - Measure expectation values")
    
    print("\n4. Classical Post-processing:")
    print("   - Dense layers for final classification")
    print("   - Softmax activation")
    
    # Example structure
    n_features = 10
    n_qubits = 4
    n_classes = 3
    
    # Feature map
    feature_map = ZZFeatureMap(feature_dimension=n_qubits, reps=2)
    
    # Ansatz
    ansatz = RealAmplitudes(num_qubits=n_qubits, reps=2)
    
    # VQC
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    print("\n5. Training:")
    print("   - Train on remote sensing dataset")
    print("   - Validate on test set")
    print("   - Compare accuracy with classical CNN")
    
    return vqc

hybrid_qnn_remote_sensing()
```

#### Dataset
- Use publicly available remote sensing datasets (e.g., UC Merced Land Use, EuroSAT)
- Extract spectral features from satellite imagery
- Create classification labels

#### Expected Outcomes
- Working hybrid QNN model
- Classification accuracy report
- Comparison with classical methods

---

### Project 5: Analysis and Implementation of Quantum Encoding Techniques

**Difficulty**: Intermediate  
**Estimated Time**: 10-12 hours  
**Prerequisites**: Module 1, Module 5

#### Objectives
- Implement various quantum encoding methods
- Compare encoding techniques
- Analyze resource requirements

#### Implementation

```python
def quantum_encoding_analysis():
    """Analyze different quantum encoding techniques"""
    
    data = np.array([1, 2, 3, 4, 5, 6, 7, 8])
    
    print("Quantum Encoding Techniques Analysis:")
    
    # 1. Basis Encoding
    print("\n1. Basis Encoding:")
    print("   - Pros: Simple, exact representation")
    print("   - Cons: Requires many qubits (n qubits for n values)")
    print("   - Use case: Discrete, small datasets")
    
    # 2. Amplitude Encoding
    print("\n2. Amplitude Encoding:")
    print("   - Pros: Exponential compression (log₂(n) qubits)")
    print("   - Cons: Difficult to prepare, requires normalization")
    print("   - Use case: Large, dense datasets")
    
    # 3. Angle Encoding
    print("\n3. Angle Encoding:")
    print("   - Pros: Easy to implement, continuous values")
    print("   - Cons: Limited expressivity, requires many qubits")
    print("   - Use case: Continuous features")
    
    # 4. Dense Angle Encoding
    print("\n4. Dense Angle Encoding:")
    print("   - Pros: Better expressivity than angle encoding")
    print("   - Cons: More complex circuit")
    print("   - Use case: High-dimensional continuous data")
    
    # Implementation comparison
    n_qubits_basis = len(data)
    n_qubits_amplitude = int(np.ceil(np.log2(len(data))))
    n_qubits_angle = len(data)
    
    print(f"\nResource Comparison for {len(data)} data points:")
    print(f"Basis encoding: {n_qubits_basis} qubits")
    print(f"Amplitude encoding: {n_qubits_amplitude} qubits")
    print(f"Angle encoding: {n_qubits_angle} qubits")
    
    return {
        'basis': n_qubits_basis,
        'amplitude': n_qubits_amplitude,
        'angle': n_qubits_angle
    }

quantum_encoding_analysis()
```

---

### Project 6: Quantum Convolutional Neural Network for Classical Data Classification

**Difficulty**: Intermediate  
**Estimated Time**: 12-15 hours  
**Prerequisites**: Module 5, Module 6

#### Objectives
- Design quantum convolutional layers
- Build QCNN for image classification
- Compare with classical CNNs

#### Implementation

```python
def quantum_cnn_classification():
    """Quantum CNN for classification"""
    
    print("Quantum Convolutional Neural Network:")
    print("\n1. Quantum Convolutional Layer:")
    print("   - Apply parameterized quantum gates")
    print("   - Pooling using measurement")
    print("   - Feature extraction")
    
    print("\n2. Architecture:")
    print("   - Input: Classical image data")
    print("   - Encoding: Quantum feature map")
    print("   - Quantum conv layers: Variational circuits")
    print("   - Pooling: Measurement and reduction")
    print("   - Output: Classical classification")
    
    # Example QCNN structure
    from qiskit.circuit.library import RealAmplitudes
    
    def quantum_conv_layer(n_qubits, reps=2):
        """Quantum convolutional layer"""
        qc = QuantumCircuit(n_qubits)
        # Alternating layers
        for _ in range(reps):
            # Entangling gates
            for i in range(n_qubits - 1):
                qc.cz(i, i+1)
            # Parameterized rotations
            for i in range(n_qubits):
                qc.ry(f'θ_{i}', i)
        return qc
    
    print("\n3. Training:")
    print("   - Hybrid quantum-classical training")
    print("   - Gradient estimation")
    print("   - Parameter optimization")
    
    return quantum_conv_layer(4)

quantum_cnn_classification()
```

---

### Project 7: Prediction of Solar Irradiation using Quantum Support Vector Machine

**Difficulty**: Intermediate  
**Estimated Time**: 10-14 hours  
**Prerequisites**: Module 5

#### Objectives
- Implement quantum SVM
- Predict solar irradiation from weather data
- Evaluate regression performance

#### Implementation

```python
def quantum_svm_solar_irradiation():
    """Quantum SVM for solar irradiation prediction"""
    
    print("Quantum SVM for Solar Irradiation Prediction:")
    print("\n1. Data Collection:")
    print("   - Weather features: temperature, humidity, cloud cover")
    print("   - Target: Solar irradiation (kWh/m²)")
    print("   - Time series data")
    
    print("\n2. Feature Engineering:")
    print("   - Normalize features")
    print("   - Reduce dimensionality to match qubits")
    print("   - Create training/test splits")
    
    print("\n3. Quantum SVM:")
    print("   - Use ZZFeatureMap for encoding")
    print("   - Compute quantum kernel matrix")
    print("   - Train SVM with quantum kernel")
    
    from qiskit_machine_learning.kernels import QuantumKernel
    from qiskit.circuit.library import ZZFeatureMap
    
    feature_map = ZZFeatureMap(feature_dimension=4, reps=2)
    quantum_kernel = QuantumKernel(
        feature_map=feature_map,
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    print("\n4. Evaluation:")
    print("   - Mean squared error")
    print("   - R² score")
    print("   - Compare with classical SVM")
    
    return quantum_kernel

quantum_svm_solar_irradiation()
```

---

### Project 8: Variational Quantum Classifier

**Difficulty**: Intermediate  
**Estimated Time**: 8-10 hours  
**Prerequisites**: Module 5, Module 6

#### Objectives
- Build complete VQC pipeline
- Classify multiple datasets
- Optimize hyperparameters

#### Implementation

```python
def variational_quantum_classifier():
    """Complete VQC implementation"""
    
    from qiskit_machine_learning.algorithms import VQC
    from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
    from sklearn.datasets import make_classification
    
    # Generate dataset
    X, y = make_classification(n_samples=100, n_features=4, n_classes=2)
    
    # Feature map
    feature_map = ZZFeatureMap(feature_dimension=4, reps=2)
    
    # Ansatz
    ansatz = RealAmplitudes(num_qubits=4, reps=2)
    
    # VQC
    vqc = VQC(
        feature_map=feature_map,
        ansatz=ansatz,
        optimizer=SPSA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    # Train
    vqc.fit(X, y)
    
    # Evaluate
    score = vqc.score(X, y)
    print(f"VQC Accuracy: {score:.3f}")
    
    return vqc

variational_quantum_classifier()
```

---

## Advanced Projects

### Project 9: To Solve any Combinatorial Optimisation Problem (Like Knapsack) Using a Quantum Annealing Approach

**Difficulty**: Advanced  
**Estimated Time**: 20-25 hours  
**Prerequisites**: Module 7

#### Objectives
- Formulate knapsack as QUBO problem
- Implement quantum annealing solution
- Compare with classical methods

#### Implementation

```python
def quantum_annealing_knapsack():
    """Quantum annealing for knapsack problem"""
    
    print("Quantum Annealing for Knapsack Problem:")
    print("\n1. Problem Formulation:")
    print("   - Items with weights and values")
    print("   - Maximize value within weight constraint")
    print("   - Binary variables: xᵢ ∈ {0,1}")
    
    print("\n2. QUBO Formulation:")
    print("   H = -Σᵢ vᵢxᵢ + λ(Σᵢ wᵢxᵢ - W)²")
    print("   - First term: Maximize value")
    print("   - Second term: Weight constraint (penalty)")
    
    # Example: 3 items
    weights = [2, 3, 4]
    values = [5, 7, 9]
    capacity = 5
    
    # Construct QUBO matrix
    n = len(weights)
    Q = np.zeros((n, n))
    
    # Linear terms (value)
    for i in range(n):
        Q[i, i] = -values[i]
    
    # Quadratic terms (constraint)
    lambda_penalty = 10
    for i in range(n):
        for j in range(n):
            Q[i, j] += lambda_penalty * weights[i] * weights[j]
        Q[i, i] -= 2 * lambda_penalty * capacity * weights[i]
    
    print(f"\nQUBO Matrix:\n{Q}")
    
    print("\n3. Quantum Annealing:")
    print("   - Use D-Wave or simulated annealing")
    print("   - Find ground state of Ising model")
    print("   - Extract solution")
    
    return Q

quantum_annealing_knapsack()
```

---

### Project 10: Comparative Study of Data Preparation Methods in Quantum Clustering Algorithms

**Difficulty**: Advanced  
**Estimated Time**: 15-18 hours  
**Prerequisites**: Module 5

#### Objectives
- Compare different data preparation methods
- Evaluate impact on quantum clustering
- Provide best practices

#### Implementation

```python
def quantum_clustering_data_preparation():
    """Compare data preparation for quantum clustering"""
    
    print("Data Preparation Methods for Quantum Clustering:")
    
    methods = {
        'Normalization': {
            'description': 'Scale features to [0,1] or standardize',
            'impact': 'Affects distance calculations',
            'use_case': 'Features with different scales'
        },
        'PCA': {
            'description': 'Principal Component Analysis',
            'impact': 'Reduces dimensionality, may lose information',
            'use_case': 'High-dimensional data'
        },
        'Quantum Encoding': {
            'description': 'Basis, amplitude, or angle encoding',
            'impact': 'Affects quantum circuit complexity',
            'use_case': 'Depends on data characteristics'
        },
        'Feature Selection': {
            'description': 'Select relevant features',
            'impact': 'Reduces qubit requirements',
            'use_case': 'Many irrelevant features'
        }
    }
    
    for method, info in methods.items():
        print(f"\n{method}:")
        print(f"  Description: {info['description']}")
        print(f"  Impact: {info['impact']}")
        print(f"  Use case: {info['use_case']}")
    
    print("\nComparative Study:")
    print("1. Test each method on same dataset")
    print("2. Measure clustering quality (silhouette score)")
    print("3. Compare resource requirements")
    print("4. Provide recommendations")

quantum_clustering_data_preparation()
```

---

### Project 11: To Calculate the Ground State Energy of a Simple Molecule (H₂, LiH, or H₂O) Using VQE

**Difficulty**: Advanced  
**Estimated Time**: 18-22 hours  
**Prerequisites**: Module 7

#### Objectives
- Set up molecular Hamiltonian
- Implement VQE for ground state
- Compare with exact diagonalization

#### Implementation

```python
def vqe_molecular_ground_state():
    """VQE for molecular ground state energy"""
    
    print("VQE for Molecular Ground State Energy:")
    print("\n1. Molecule Selection:")
    print("   - H₂: Simplest (2 electrons, 2 qubits)")
    print("   - LiH: Intermediate (4 electrons, 4-6 qubits)")
    print("   - H₂O: Complex (10 electrons, 8-12 qubits)")
    
    print("\n2. Hamiltonian Construction:")
    print("   - Use quantum chemistry packages (PySCF, Qiskit Nature)")
    print("   - Compute electronic structure")
    print("   - Map to qubits (Jordan-Wigner or Parity)")
    
    print("\n3. VQE Implementation:")
    print("   - Choose ansatz (UCCSD, hardware-efficient)")
    print("   - Optimize parameters")
    print("   - Compute ground state energy")
    
    print("\n4. Validation:")
    print("   - Compare with exact diagonalization")
    print("   - Check convergence")
    print("   - Analyze error sources")
    
    # Example for H₂
    from qiskit_nature.drivers import Molecule
    from qiskit_nature.problems.second_quantization import ElectronicStructureProblem
    
    molecule = Molecule(
        geometry=[['H', [0., 0., 0.]],
                 ['H', [0., 0., 0.74]]],
        charge=0,
        multiplicity=1
    )
    
    print(f"\nH₂ Molecule:")
    print(f"Bond length: 0.74 Angstrom")
    print(f"Expected ground state energy: ~-1.137 Hartree")
    
    return molecule

vqe_molecular_ground_state()
```

---

### Project 12: Implementing HHL Algorithm and Proving BQP-completeness of Matrix Inversion

**Difficulty**: Advanced  
**Estimated Time**: 20-25 hours  
**Prerequisites**: Module 4, Module 5

#### Objectives
- Implement HHL algorithm
- Understand BQP-completeness
- Apply to linear systems

#### Implementation

```python
def hhl_algorithm_bqp():
    """HHL algorithm and BQP-completeness"""
    
    print("HHL Algorithm and BQP-completeness:")
    print("\n1. HHL Algorithm:")
    print("   - Solves Ax = b for sparse, well-conditioned A")
    print("   - Steps:")
    print("     a. Encode |b⟩")
    print("     b. Phase estimation of A")
    print("     c. Invert eigenvalues")
    print("     d. Uncompute")
    print("     e. Output |x⟩")
    
    print("\n2. BQP-completeness:")
    print("   - BQP: Bounded-error Quantum Polynomial time")
    print("   - Matrix inversion is BQP-complete")
    print("   - Any BQP problem can be reduced to matrix inversion")
    print("   - Proves HHL is optimal for this problem class")
    
    print("\n3. Implementation Challenges:")
    print("   - Hamiltonian simulation: exp(iAt)")
    print("   - Quantum phase estimation")
    print("   - Eigenvalue inversion")
    print("   - Condition number requirements")
    
    # Simplified HHL
    def hhl_simplified(A, b):
        """Simplified HHL implementation"""
        # Note: Full implementation requires:
        # - Quantum phase estimation
        # - Hamiltonian simulation
        # - Eigenvalue inversion
        
        print("\nHHL Algorithm (conceptual):")
        print("1. Prepare |b⟩")
        print("2. Apply exp(iAt) for various t")
        print("3. Phase estimation → eigenvalues")
        print("4. Invert: 1/λ")
        print("5. Uncompute")
        print("6. Result: |x⟩")
        
        return None
    
    return hhl_simplified

hhl_algorithm_bqp()
```

---

### Project 13: Quantum Computing for Finance

**Difficulty**: Advanced  
**Estimated Time**: 25-30 hours  
**Prerequisites**: Module 7

#### Objectives
- Apply quantum algorithms to finance
- Implement portfolio optimization
- Option pricing with quantum methods

#### Implementation

```python
def quantum_finance_applications():
    """Quantum computing applications in finance"""
    
    print("Quantum Computing for Finance:")
    
    applications = {
        'Portfolio Optimization': {
            'algorithm': 'QAOA or VQE',
            'problem': 'Maximize return - λ*risk',
            'formulation': 'QUBO/Ising model'
        },
        'Option Pricing': {
            'algorithm': 'Quantum Monte Carlo',
            'problem': 'Price financial derivatives',
            'formulation': 'Amplitude estimation'
        },
        'Risk Analysis': {
            'algorithm': 'Quantum simulation',
            'problem': 'Model financial scenarios',
            'formulation': 'Quantum walks'
        },
        'Credit Scoring': {
            'algorithm': 'Quantum ML',
            'problem': 'Classify credit risk',
            'formulation': 'Quantum SVM/VQC'
        }
    }
    
    for app, details in applications.items():
        print(f"\n{app}:")
        print(f"  Algorithm: {details['algorithm']}")
        print(f"  Problem: {details['problem']}")
        print(f"  Formulation: {details['formulation']}")
    
    return applications

quantum_finance_applications()
```

---

### Project 14: To Solve Crop-Yield Problem using QAOA and VQE, and Run the Same on Real Quantum Computer

**Difficulty**: Advanced  
**Estimated Time**: 30-35 hours  
**Prerequisites**: Module 7

#### Objectives
- Formulate crop yield as optimization problem
- Solve using QAOA and VQE
- Execute on real quantum hardware

#### Implementation

```python
def crop_yield_quantum():
    """Crop yield optimization using QAOA and VQE"""
    
    print("Crop Yield Optimization:")
    print("\n1. Problem Formulation:")
    print("   - Variables: Crop types, planting times, resources")
    print("   - Objective: Maximize yield")
    print("   - Constraints: Budget, land, water, time")
    
    print("\n2. QAOA Approach:")
    print("   - Encode as QUBO")
    print("   - Use QAOA to find optimal solution")
    print("   - Parameters: crop selection, timing")
    
    print("\n3. VQE Approach:")
    print("   - Formulate as Hamiltonian")
    print("   - Use VQE to find ground state")
    print("   - Extract optimal configuration")
    
    print("\n4. Real Quantum Hardware:")
    print("   - IBM Quantum Experience")
    print("   - D-Wave quantum annealer")
    print("   - Error mitigation")
    print("   - Compare results")
    
    # Example QUBO formulation
    def crop_yield_qubo():
        """Formulate crop yield as QUBO"""
        # Variables: x[i,j] = 1 if crop i planted at time j
        # Objective: Maximize yield
        # Constraints: Budget, land availability
        
        print("\nQUBO Formulation:")
        print("H = -Σᵢⱼ yᵢⱼxᵢⱼ + λ₁(Σᵢⱼ cᵢⱼxᵢⱼ - B)² + λ₂(Σᵢⱼ aᵢxᵢⱼ - L)²")
        print("  - First term: Maximize yield")
        print("  - Second term: Budget constraint")
        print("  - Third term: Land constraint")
        
        return None
    
    crop_yield_qubo()
    
    return None

crop_yield_quantum()
```

---

### Project 15: Analysis of Solving Combinatorial Optimisation Problems on Quantum and Quantum-like Annealers

**Difficulty**: Advanced  
**Estimated Time**: 20-25 hours  
**Prerequisites**: Module 7

#### Objectives
- Compare quantum and quantum-like annealers
- Analyze performance on optimization problems
- Provide recommendations

#### Implementation

```python
def quantum_annealer_comparison():
    """Compare quantum and quantum-like annealers"""
    
    print("Quantum vs Quantum-like Annealers:")
    
    annealers = {
        'D-Wave Quantum Annealer': {
            'type': 'Quantum',
            'qubits': '5000+',
            'connectivity': 'Pegasus topology',
            'use_case': 'Large QUBO problems'
        },
        'Fujitsu Digital Annealer': {
            'type': 'Quantum-like',
            'qubits': '8192+',
            'connectivity': 'Fully connected',
            'use_case': 'Fully connected problems'
        },
        'Simulated Annealing': {
            'type': 'Classical',
            'qubits': 'N/A',
            'connectivity': 'N/A',
            'use_case': 'Small problems'
        }
    }
    
    for name, details in annealers.items():
        print(f"\n{name}:")
        print(f"  Type: {details['type']}")
        print(f"  Capacity: {details['qubits']}")
        print(f"  Connectivity: {details['connectivity']}")
        print(f"  Use case: {details['use_case']}")
    
    print("\nComparison Metrics:")
    print("1. Problem size scalability")
    print("2. Solution quality")
    print("3. Execution time")
    print("4. Cost")
    print("5. Connectivity requirements")

quantum_annealer_comparison()
```

---

### Project 16: To Implement Shor's Code in Qiskit with Noise Models

**Difficulty**: Advanced  
**Estimated Time**: 15-20 hours  
**Prerequisites**: Module 2, Module 4

#### Objectives
- Implement Shor's 9-qubit error correction code
- Add noise models
- Test error correction performance

#### Implementation

```python
def shor_code_noise():
    """Shor's code with noise models"""
    
    from qiskit.providers.aer.noise import NoiseModel
    from qiskit.providers.aer.noise import depolarizing_error
    
    print("Shor's Code with Noise Models:")
    print("\n1. Shor's 9-Qubit Code:")
    print("   - Encodes 1 logical qubit in 9 physical qubits")
    print("   - Corrects 1 bit-flip OR 1 phase-flip error")
    print("   - Combines bit-flip and phase-flip codes")
    
    # Create noise model
    noise_model = NoiseModel()
    
    # Depolarizing error
    error = depolarizing_error(0.1, 1)  # 10% error rate
    noise_model.add_all_qubit_quantum_error(error, ['x', 'y', 'z'])
    
    print("\n2. Noise Model:")
    print("   - Depolarizing noise: 10%")
    print("   - Affects X, Y, Z gates")
    print("   - Simulates realistic hardware")
    
    print("\n3. Error Correction:")
    print("   - Encode logical qubit")
    print("   - Introduce noise")
    print("   - Measure syndrome")
    print("   - Apply correction")
    print("   - Decode and verify")
    
    return noise_model

shor_code_noise()
```

---

## Specialized Projects

### Project 17: Research on Quantum Computing usage to Expedite the Drug Discovery Process (Life Sciences)

**Difficulty**: Advanced  
**Estimated Time**: 40-50 hours  
**Prerequisites**: Module 7

#### Objectives
- Apply VQE to molecular docking
- Optimize drug-target interactions
- Accelerate drug discovery pipeline

#### Implementation

```python
def quantum_drug_discovery():
    """Quantum computing for drug discovery"""
    
    print("Quantum Computing for Drug Discovery:")
    print("\n1. Molecular Docking:")
    print("   - Use VQE to find optimal binding conformations")
    print("   - Optimize drug-target interactions")
    print("   - Search conformational space")
    
    print("\n2. Molecular Property Prediction:")
    print("   - Use quantum ML to predict properties")
    print("   - ADMET properties (Absorption, Distribution, etc.)")
    print("   - Toxicity prediction")
    
    print("\n3. Compound Optimization:")
    print("   - Use QAOA to optimize molecular structures")
    print("   - Maximize desired properties")
    print("   - Minimize side effects")
    
    print("\n4. Quantum Simulation:")
    print("   - Simulate molecular dynamics")
    print("   - Study protein folding")
    print("   - Understand mechanisms")
    
    return None

quantum_drug_discovery()
```

---

### Project 18: To Design and Build an Educational Game Using Fundamentals of Quantum Computing

**Difficulty**: Intermediate  
**Estimated Time**: 30-40 hours  
**Prerequisites**: All modules

#### Objectives
- Create interactive quantum computing game
- Teach quantum concepts through gameplay
- Make quantum computing accessible

#### Game Ideas

```python
def quantum_educational_game():
    """Design quantum computing educational game"""
    
    game_concepts = {
        'Quantum Puzzle Solver': {
            'concept': 'Use quantum gates to solve puzzles',
            'learning': 'Gate operations, superposition'
        },
        'Quantum Cryptography Challenge': {
            'concept': 'Implement BB84 protocol',
            'learning': 'Quantum key distribution'
        },
        'Quantum Algorithm Race': {
            'concept': 'Race to implement algorithms',
            'learning': 'Algorithm design, optimization'
        },
        'Quantum State Visualizer': {
            'concept': 'Interactive Bloch sphere',
            'learning': 'Quantum states, measurements'
        }
    }
    
    for game, details in game_concepts.items():
        print(f"\n{game}:")
        print(f"  Concept: {details['concept']}")
        print(f"  Learning: {details['learning']}")
    
    return game_concepts

quantum_educational_game()
```

---

### Project 19: Solving Travelling Salesman Problem Using QAOA

**Difficulty**: Advanced  
**Estimated Time**: 18-22 hours  
**Prerequisites**: Module 7

#### Objectives
- Formulate TSP as QUBO
- Implement QAOA solution
- Compare with classical methods

#### Implementation

```python
def qaoa_tsp():
    """QAOA for Traveling Salesman Problem"""
    
    print("QAOA for Traveling Salesman Problem:")
    print("\n1. Problem Formulation:")
    print("   - Cities: n vertices")
    print("   - Distances: edge weights")
    print("   - Objective: Minimize total distance")
    print("   - Constraint: Visit each city once")
    
    print("\n2. QUBO Formulation:")
    print("   - Variables: x[i,t] = 1 if city i visited at time t")
    print("   - Objective: Minimize Σᵢⱼᵗ dᵢⱼxᵢᵗxⱼᵗ₊₁")
    print("   - Constraints:")
    print("     * Each city visited once: Σᵗ xᵢᵗ = 1")
    print("     * One city per time: Σᵢ xᵢᵗ = 1")
    
    print("\n3. QAOA Implementation:")
    print("   - Encode as Ising model")
    print("   - Use QAOA to find optimal route")
    print("   - Extract solution from measurement")
    
    # Example: 3 cities
    distances = {
        (0, 1): 10,
        (1, 2): 15,
        (2, 0): 12
    }
    
    print(f"\nExample: 3 cities")
    print(f"Distances: {distances}")
    
    return distances

qaoa_tsp()
```

---

### Project 20: Implementing Clinical Data Classification by Quantum Machine Learning (QML)

**Difficulty**: Advanced  
**Estimated Time**: 25-30 hours  
**Prerequisites**: Module 5, Module 6

#### Objectives
- Classify clinical/medical data using QML
- Handle sensitive healthcare data
- Compare with classical ML

#### Implementation

```python
def qml_clinical_classification():
    """QML for clinical data classification"""
    
    print("QML for Clinical Data Classification:")
    print("\n1. Data Considerations:")
    print("   - Privacy: Use synthetic or anonymized data")
    print("   - Features: Patient vitals, lab results, demographics")
    print("   - Labels: Disease diagnosis, risk assessment")
    
    print("\n2. Quantum Models:")
    print("   - Variational Quantum Classifier (VQC)")
    print("   - Quantum Support Vector Machine (QSVM)")
    print("   - Quantum Neural Networks")
    
    print("\n3. Implementation:")
    print("   - Encode clinical features")
    print("   - Train quantum classifier")
    print("   - Evaluate on test set")
    print("   - Compare with classical methods")
    
    print("\n4. Applications:")
    print("   - Disease diagnosis")
    print("   - Drug response prediction")
    print("   - Risk stratification")
    print("   - Treatment recommendation")
    
    return None

qml_clinical_classification()
```

---

## Project Submission Guidelines

### Report Structure

1. **Introduction**: Problem statement and objectives
2. **Background**: Relevant quantum computing concepts
3. **Methodology**: Implementation approach
4. **Results**: Performance metrics and analysis
5. **Discussion**: Insights and limitations
6. **Conclusion**: Summary and future work

### Code Requirements

- Well-documented code
- Reproducible experiments
- Clear file structure
- Requirements.txt included

### Evaluation Criteria

- **Correctness**: Algorithm implementation accuracy
- **Completeness**: All objectives met
- **Documentation**: Clear explanations
- **Innovation**: Creative solutions
- **Analysis**: Deep understanding demonstrated

## Getting Started with Projects

1. **Choose a Project**: Select based on your skill level and interests
2. **Review Prerequisites**: Ensure you understand required concepts
3. **Set Up Environment**: Install Qiskit, PennyLane, or other frameworks
4. **Plan Implementation**: Break down into smaller tasks
5. **Implement**: Code step by step
6. **Test and Validate**: Verify correctness
7. **Document**: Write clear documentation

## Resources for Projects

- [Qiskit Tutorials](https://qiskit.org/documentation/tutorials/)
- [PennyLane Examples](https://pennylane.ai/qml/demos.html)
- [IBM Quantum Lab](https://quantum-computing.ibm.com/lab)
- [Quantum Computing Stack Exchange](https://quantumcomputing.stackexchange.com/)

---

*Last Updated: November 2024*

