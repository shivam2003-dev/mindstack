# Module 4: Quantum Fourier Transform and Related Algorithms

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Quantum Fourier Transform (QFT)</li>
    <li>Implement QFT in Qiskit</li>
    <li>Learn Quantum Phase Estimation</li>
    <li>Implement Shor's period finding algorithm</li>
    <li>Implement Grover's search algorithm</li>
  </ul>
</div>

This module covers the Quantum Fourier Transform (QFT) and its applications in famous quantum algorithms like Shor's and Grover's algorithms.

!!! success "Module Overview"
    QFT is a fundamental quantum algorithm that enables exponential speedup for period finding, which is crucial for factoring and other applications.

## Quantum Fourier Transform (QFT)

The **Quantum Fourier Transform** is the quantum analogue of the classical Discrete Fourier Transform (DFT).

### Classical vs Quantum Fourier Transform

```python
import numpy as np
from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit.library import QFT

# Classical DFT: O(N²) operations
def classical_dft(x):
    """Classical Discrete Fourier Transform"""
    N = len(x)
    X = np.zeros(N, dtype=complex)
    for k in range(N):
        for n in range(N):
            X[k] += x[n] * np.exp(-2j * np.pi * k * n / N)
    return X / np.sqrt(N)

# Quantum QFT: O(n²) operations where n = log₂(N)
# Exponential speedup: O(N²) → O(n²)

# Example input
x = np.array([1, 0, 0, 0, 0, 0, 0, 0])  # |000⟩ = |0⟩
X_classical = classical_dft(x)
print("Classical DFT:", X_classical)
```

### QFT Mathematical Definition

```python
# QFT transforms basis states:
# |j⟩ → (1/√N) Σₖ exp(2πijk/N) |k⟩

# For N = 2ⁿ, where n is number of qubits
def qft_formula():
    """QFT formula explanation"""
    print("QFT Formula:")
    print("QFT|j⟩ = (1/√N) Σₖ₌₀ᴺ⁻¹ exp(2πijk/N) |k⟩")
    print("\nKey properties:")
    print("- Unitary transformation")
    print("- Reversible (has inverse QFT†)")
    print("- O(n²) gates for n qubits")
    print("- Exponential speedup over classical DFT")

qft_formula()
```

### QFT Implementation in Qiskit

```python
from qiskit.circuit.library import QFT

# Built-in QFT
n_qubits = 3
qft_circuit = QFT(n_qubits)
print("QFT Circuit (3 qubits):")
print(qft_circuit.draw())

# Manual QFT implementation
def manual_qft(n_qubits):
    """Manually construct QFT circuit"""
    qc = QuantumCircuit(n_qubits)
    
    # Apply Hadamard and controlled rotations
    for qubit in range(n_qubits):
        qc.h(qubit)
        for j in range(qubit + 1, n_qubits):
            # Controlled phase rotation: R_k where k = j - qubit + 1
            k = j - qubit + 1
            angle = 2 * np.pi / (2 ** (k + 1))
            qc.cp(angle, j, qubit)
    
    # Swap qubits (reverse order)
    for i in range(n_qubits // 2):
        qc.swap(i, n_qubits - 1 - i)
    
    return qc

qc_manual = manual_qft(3)
print("\nManual QFT Circuit:")
print(qc_manual.draw())

# Test QFT on |000⟩
qc_test = QuantumCircuit(3)
qc_test = qc_test.compose(qc_manual)
qc_test.measure_all()

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_test, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_test)
print(f"\nQFT|000⟩ results: {counts}")
```

### Inverse QFT

```python
from qiskit.circuit.library import QFT

# Inverse QFT (QFT†)
def inverse_qft(n_qubits):
    """Create inverse QFT circuit"""
    qft = QFT(n_qubits)
    iqft = qft.inverse()
    return iqft

iqft_circuit = inverse_qft(3)
print("Inverse QFT Circuit:")
print(iqft_circuit.draw())

# Verify: QFT† QFT = I
qc_verify = QuantumCircuit(3)
qc_verify = qc_verify.compose(QFT(3))
qc_verify = qc_verify.compose(inverse_qft(3))

simulator_sv = Aer.get_backend('statevector_simulator')
job = execute(qc_verify, simulator_sv)
result = job.result()
statevector = result.get_statevector()
print(f"\nQFT† QFT|000⟩ = {statevector}")
print(f"Should be |000⟩: {np.allclose(statevector, [1, 0, 0, 0, 0, 0, 0, 0])}")
```

!!! tip "QFT Complexity"
    - **Classical DFT**: O(N²) operations for N elements
    - **Quantum QFT**: O(n²) gates for n qubits (N = 2ⁿ)
    - **Speedup**: Exponential (N² → n²)

## Quantum Phase Estimation

**Quantum Phase Estimation** finds the eigenvalue of a unitary operator.

### Problem Statement

Given a unitary operator U and eigenvector |ψ⟩ such that U|ψ⟩ = e^(2πiφ)|ψ⟩, find the phase φ.

### Implementation

```python
def quantum_phase_estimation(U, eigenvector, n_precision_qubits=3):
    """Implement Quantum Phase Estimation"""
    n = n_precision_qubits
    qc = QuantumCircuit(n + len(eigenvector), n)
    
    # Initialize precision qubits in |+⟩
    for i in range(n):
        qc.h(i)
    
    # Prepare eigenvector
    # (In practice, this would be prepared separately)
    
    # Apply controlled-U operations
    for i in range(n):
        # Apply U^(2^i) controlled on qubit i
        for _ in range(2**i):
            # Controlled-U (simplified - in practice use actual U)
            qc.append(U.control(), [i] + list(range(n, n + len(eigenvector))))
    
    # Apply inverse QFT
    iqft = inverse_qft(n)
    qc = qc.compose(iqft, qubits=range(n))
    
    # Measure precision qubits
    qc.measure(range(n), range(n))
    
    return qc

# Example: Phase estimation for T gate (phase = 1/8)
from qiskit.quantum_info import Operator
T_gate = Operator([[1, 0], [0, np.exp(1j * np.pi / 4)]])
eigenvector = np.array([0, 1])  # |1⟩ is eigenvector of T

qc_phase = quantum_phase_estimation(T_gate, eigenvector, n_precision_qubits=3)
print("Quantum Phase Estimation Circuit:")
print(qc_phase.draw())
```

### Phase Estimation in Qiskit

```python
from qiskit.algorithms import PhaseEstimation
from qiskit.circuit.library import QFT

# Using Qiskit's PhaseEstimation
def phase_estimation_example():
    """Example phase estimation"""
    # Create a unitary with known phase
    # U = T gate, phase = 1/8
    num_evaluation_qubits = 3
    unitary = Operator([[1, 0], [0, np.exp(1j * np.pi / 4)]])
    
    # Phase estimation circuit
    qc = QuantumCircuit(num_evaluation_qubits + 1, num_evaluation_qubits)
    
    # Initialize eigenstate |1⟩
    qc.x(num_evaluation_qubits)
    
    # Apply Hadamards
    for i in range(num_evaluation_qubits):
        qc.h(i)
    
    # Controlled unitaries
    for i in range(num_evaluation_qubits):
        for _ in range(2**i):
            qc.append(unitary.control(), [i, num_evaluation_qubits])
    
    # Inverse QFT
    qc.append(QFT(num_evaluation_qubits, inverse=True), range(num_evaluation_qubits))
    
    # Measure
    qc.measure(range(num_evaluation_qubits), range(num_evaluation_qubits))
    
    return qc

qc_pe = phase_estimation_example()
print("Phase Estimation Example:")
print(qc_pe.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_pe, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_pe)
print(f"\nResults: {counts}")
print("Expected: phase = 1/8 = 0.125")
print("Measurement should give binary representation of phase")
```

## Shor's Period Finding Algorithm

**Shor's algorithm** factors integers efficiently using quantum period finding.

### Problem Statement

Given a composite integer N, find its prime factors.

### Period Finding

```python
def shor_period_finding(a, N, n_qubits=5):
    """Shor's period finding subroutine"""
    qc = QuantumCircuit(2 * n_qubits, n_qubits)
    
    # Initialize first register in superposition
    for i in range(n_qubits):
        qc.h(i)
    
    # Modular exponentiation: |x⟩|0⟩ → |x⟩|a^x mod N⟩
    # This is the key quantum operation
    # (Simplified - full implementation requires quantum modular exponentiation)
    
    # Apply QFT to first register
    qft = QFT(n_qubits)
    qc = qc.compose(qft, qubits=range(n_qubits))
    
    # Measure first register
    qc.measure(range(n_qubits), range(n_qubits))
    
    return qc

# Example: Find period of f(x) = 2^x mod 15
# Period should be 4 (2^4 mod 15 = 1)
qc_shor = shor_period_finding(2, 15, n_qubits=4)
print("Shor's Period Finding:")
print(qc_shor.draw())
```

### Complete Shor's Algorithm

```python
def shors_algorithm(N, a=2):
    """Complete Shor's algorithm for factoring N"""
    print(f"Shor's Algorithm for N = {N}")
    
    # Step 1: Check if N is even or perfect power
    if N % 2 == 0:
        return 2, N // 2
    
    # Step 2: Choose random a
    # Step 3: Find period r of f(x) = a^x mod N
    # Step 4: If r is even and a^(r/2) ≠ ±1 mod N:
    #        factors are gcd(a^(r/2) ± 1, N)
    
    # Simplified period finding (classical for demonstration)
    def find_period_classical(a, N):
        """Classical period finding (for small N)"""
        for r in range(1, N):
            if pow(a, r, N) == 1:
                return r
        return None
    
    r = find_period_classical(a, N)
    print(f"Period r = {r}")
    
    if r and r % 2 == 0:
        factor1 = np.gcd(a**(r//2) - 1, N)
        factor2 = np.gcd(a**(r//2) + 1, N)
        if factor1 > 1 and factor1 < N:
            return factor1, N // factor1
        if factor2 > 1 and factor2 < N:
            return factor2, N // factor2
    
    return None, None

# Test: Factor 15
factors = shors_algorithm(15)
print(f"Factors of 15: {factors}")
```

### Shor's Algorithm Implementation in Qiskit

```python
from qiskit.algorithms import Shor

# Shor's algorithm using Qiskit
def shor_qiskit_example():
    """Shor's algorithm using Qiskit"""
    # Note: Full implementation requires quantum modular exponentiation
    # This is a simplified version
    
    N = 15  # Number to factor
    a = 2   # Random base
    
    print(f"Factoring N = {N} using Shor's algorithm")
    print(f"Base a = {a}")
    
    # Quantum period finding (simplified)
    n = 4  # Number of qubits for period finding
    qc = QuantumCircuit(2*n, n)
    
    # Create superposition
    for i in range(n):
        qc.h(i)
    
    # Modular exponentiation (simplified)
    # Full implementation requires quantum arithmetic
    
    # QFT
    qc.append(QFT(n), range(n))
    
    # Measure
    qc.measure(range(n), range(n))
    
    print("\nShor's Algorithm Circuit (simplified):")
    print(qc.draw())
    
    return qc

qc_shor_full = shor_qiskit_example()
```

!!! warning "Shor's Algorithm Complexity"
    - **Classical**: Exponential time O(exp(N^(1/3)))
    - **Quantum**: Polynomial time O((log N)³)
    - **Speedup**: Exponential (breaks RSA encryption!)

## Grover's Search Algorithm

**Grover's algorithm** searches an unstructured database with quadratic speedup.

### Problem Statement

Given a function f: {0,1}ⁿ → {0,1} that is 1 for exactly one input (marked item), find that input.

### Classical vs Quantum

```python
# Classical: O(N) queries for N items
def classical_search(items, target):
    """Classical search: linear time"""
    for i, item in enumerate(items):
        if item == target:
            return i
    return -1

# Quantum: O(√N) queries
print("Grover's Algorithm:")
print("Classical: O(N) queries")
print("Quantum: O(√N) queries")
print("Speedup: Quadratic")
```

### Grover's Algorithm Implementation

```python
def grover_oracle(marked_state, n_qubits):
    """Create oracle that marks the target state"""
    qc = QuantumCircuit(n_qubits)
    
    # Mark |marked_state⟩ by flipping phase
    # For state |s⟩, apply: |s⟩ → -|s⟩, others unchanged
    
    # Convert marked_state to binary
    binary = format(marked_state, f'0{n_qubits}b')
    
    # Apply X gates to create |11...1⟩, then multi-controlled Z
    for i, bit in enumerate(binary):
        if bit == '0':
            qc.x(i)
    
    # Multi-controlled Z (flips phase of |11...1⟩)
    if n_qubits == 2:
        qc.cz(0, 1)
    elif n_qubits == 3:
        qc.h(2)
        qc.ccx(0, 1, 2)
        qc.h(2)
    # For more qubits, use more complex multi-controlled gates
    
    # Uncompute X gates
    for i, bit in enumerate(binary):
        if bit == '0':
            qc.x(i)
    
    return qc

def grover_diffusion(n_qubits):
    """Grover diffusion operator"""
    qc = QuantumCircuit(n_qubits)
    
    # Apply Hadamards
    for i in range(n_qubits):
        qc.h(i)
    
    # Apply X gates
    for i in range(n_qubits):
        qc.x(i)
    
    # Multi-controlled Z
    if n_qubits == 2:
        qc.cz(0, 1)
    elif n_qubits == 3:
        qc.h(2)
        qc.ccx(0, 1, 2)
        qc.h(2)
    
    # Uncompute X and H
    for i in range(n_qubits):
        qc.x(i)
    for i in range(n_qubits):
        qc.h(i)
    
    return qc

def grovers_algorithm(marked_state, n_qubits, num_iterations=None):
    """Complete Grover's algorithm"""
    if num_iterations is None:
        # Optimal number of iterations: ~π/4 * √N
        N = 2**n_qubits
        num_iterations = int(np.pi / 4 * np.sqrt(N))
    
    qc = QuantumCircuit(n_qubits, n_qubits)
    
    # Initialize superposition
    for i in range(n_qubits):
        qc.h(i)
    
    # Grover iterations
    for _ in range(num_iterations):
        # Apply oracle
        oracle = grover_oracle(marked_state, n_qubits)
        qc = qc.compose(oracle)
        
        # Apply diffusion
        diffusion = grover_diffusion(n_qubits)
        qc = qc.compose(diffusion)
    
    # Measure
    qc.measure_all()
    
    return qc

# Test: Find |11⟩ in 2-qubit search space
marked = 3  # |11⟩ in binary
qc_grover = grovers_algorithm(marked, n_qubits=2)
print("Grover's Algorithm (finding |11⟩):")
print(qc_grover.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_grover, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_grover)
print(f"\nResults: {counts}")
print(f"Should find |11⟩ with high probability")
```

### Grover's Algorithm Analysis

```python
def grover_analysis():
    """Analyze Grover's algorithm"""
    print("Grover's Algorithm Analysis:")
    print("\n1. Initialization: Create uniform superposition")
    print("   |s⟩ = (1/√N) Σₓ |x⟩")
    
    print("\n2. Oracle: Marks target state")
    print("   O|x⟩ = -|x⟩ if x is marked, else |x⟩")
    
    print("\n3. Diffusion: Inverts about average")
    print("   D = 2|s⟩⟨s| - I")
    
    print("\n4. Iteration: O → D → O → D → ...")
    print("   Amplifies amplitude of marked state")
    
    print("\n5. Optimal iterations: ~π/4 * √N")
    print("   For N=4: ~1 iteration")
    print("   For N=16: ~3 iterations")
    print("   For N=1024: ~25 iterations")

grover_analysis()
```

## Complete Examples

### Example 1: QFT on Different States

```python
def qft_examples():
    """QFT on various input states"""
    n = 3
    
    states = {
        '|000⟩': [1, 0, 0, 0, 0, 0, 0, 0],
        '|100⟩': [0, 0, 0, 0, 1, 0, 0, 0],
        '|111⟩': [0, 0, 0, 0, 0, 0, 0, 1],
    }
    
    for name, state in states.items():
        qc = QuantumCircuit(3)
        qc.initialize(state, range(3))
        qc.append(QFT(3), range(3))
        
        simulator_sv = Aer.get_backend('statevector_simulator')
        job = execute(qc, simulator_sv)
        result = job.result()
        sv = result.get_statevector()
        
        print(f"\nQFT{name}:")
        print(f"Statevector: {sv}")

qft_examples()
```

### Example 2: Grover Search for Multiple Items

```python
def grover_multiple_targets():
    """Grover's algorithm with multiple marked items"""
    # If M items are marked out of N total:
    # Optimal iterations: ~π/4 * √(N/M)
    
    n_qubits = 3
    N = 2**n_qubits
    M = 2  # 2 marked items
    
    num_iterations = int(np.pi / 4 * np.sqrt(N / M))
    
    print(f"Grover with {M} marked items out of {N}:")
    print(f"Optimal iterations: {num_iterations}")
    print(f"Speedup: O(√(N/M)) vs O(N/M) classical")

grover_multiple_targets()
```

## Key Takeaways

- ✅ **QFT** provides exponential speedup for Fourier transforms
- ✅ **Phase Estimation** finds eigenvalues of unitary operators
- ✅ **Shor's Algorithm** factors integers in polynomial time
- ✅ **Grover's Algorithm** searches with quadratic speedup
- ✅ These algorithms demonstrate **quantum advantage** over classical methods

## Next Steps

Continue to [Module 5: Quantum Machine Learning](05-quantum-ml.md) to learn about:
- Data encoding in quantum states
- HHL algorithm
- Quantum linear regression
- Quantum clustering and classification

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit Textbook - QFT](https://qiskit.org/textbook/ch-algorithms/quantum-fourier-transform.html)
    2. [Qiskit Textbook - Phase Estimation](https://qiskit.org/textbook/ch-algorithms/quantum-phase-estimation.html)
    3. [Qiskit Textbook - Shor's Algorithm](https://qiskit.org/textbook/ch-algorithms/shor.html)
    4. [Qiskit Textbook - Grover's Algorithm](https://qiskit.org/textbook/ch-algorithms/grover.html)

???+ "📖 Essential Articles"
    1. [Quantum Fourier Transform](https://en.wikipedia.org/wiki/Quantum_Fourier_transform)
    2. [Shor's Algorithm](https://en.wikipedia.org/wiki/Shor%27s_algorithm)
    3. [Grover's Algorithm](https://en.wikipedia.org/wiki/Grover%27s_algorithm)

---

*Last Updated: November 2024*

