# Module 3: Introduction to Quantum Algorithms

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Qiskit programming for quantum circuits</li>
    <li>Implement Deutsch-Jozsa algorithm</li>
    <li>Implement Bernstein-Vazirani algorithm</li>
    <li>Implement Simon's algorithm</li>
    <li>Understand quantum advantage in these algorithms</li>
  </ul>
</div>

This module introduces fundamental quantum algorithms that demonstrate quantum advantage. You'll learn to implement these algorithms using Qiskit and understand when quantum computing provides speedup over classical methods.

!!! success "Module Overview"
    These algorithms show that quantum computers can solve certain problems faster than classical computers. Understanding them is crucial for quantum algorithm design.

## Qiskit Programming

**Qiskit** is IBM's open-source quantum computing framework. Let's master the essentials.

### Installation and Setup

```python
# Install Qiskit
# pip install qiskit qiskit-aer qiskit-visualization

from qiskit import QuantumCircuit, Aer, execute, IBMQ
from qiskit.visualization import plot_histogram, plot_circuit, plot_bloch_multivector
from qiskit.quantum_info import Statevector, Operator
import numpy as np
import matplotlib.pyplot as plt

print("Qiskit version:", qiskit.__version__)
```

### Basic Circuit Creation

```python
# Create a quantum circuit
qc = QuantumCircuit(2, 2)  # 2 qubits, 2 classical bits

# Apply gates
qc.h(0)      # Hadamard on qubit 0
qc.cx(0, 1)  # CNOT: control=0, target=1
qc.measure([0, 1], [0, 1])  # Measure qubits to classical bits

# Visualize
print("Circuit:")
print(qc.draw())

# Execute on simulator
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)

print(f"\nResults: {counts}")
plot_histogram(counts)
```

### Advanced Qiskit Features

```python
# Statevector simulation
simulator_sv = Aer.get_backend('statevector_simulator')
job = execute(qc, simulator_sv)
result = job.result()
statevector = result.get_statevector()
print(f"Statevector: {statevector}")

# Unitary simulation
simulator_unitary = Aer.get_backend('unitary_simulator')
job = execute(qc, simulator_unitary)
result = job.result()
unitary = result.get_unitary()
print(f"Unitary matrix shape: {unitary.shape}")

# Custom initial states
qc_custom = QuantumCircuit(1)
qc_custom.initialize([1/np.sqrt(2), 1j/np.sqrt(2)], 0)  # Custom state
```

!!! tip "Qiskit Backends"
    - **qasm_simulator**: Simulates measurements (returns counts)
    - **statevector_simulator**: Returns full quantum state
    - **unitary_simulator**: Returns unitary matrix
    - **Real hardware**: Access via IBM Quantum

## Deutsch-Jozsa Algorithm

The **Deutsch-Jozsa algorithm** determines if a function is constant or balanced using only one query (vs 2ⁿ⁻¹+1 classical queries).

### Problem Statement

Given a function f: {0,1}ⁿ → {0,1} that is either:
- **Constant**: f(x) = 0 for all x OR f(x) = 1 for all x
- **Balanced**: f(x) = 0 for exactly half the inputs, f(x) = 1 for the other half

Determine which type f is.

### Classical vs Quantum

```python
def classical_deutsch_jozsa(f, n):
    """Classical algorithm: requires 2^(n-1) + 1 queries"""
    results = []
    for i in range(2**(n-1) + 1):
        x = format(i, f'0{n}b')
        results.append(f(x))
    
    if all(r == results[0] for r in results):
        return "constant"
    else:
        return "balanced"

# Quantum: only 1 query needed!
```

### Quantum Implementation

```python
def deutsch_jozsa_oracle(f_type='constant', n=3):
    """Create oracle for Deutsch-Jozsa algorithm"""
    qc = QuantumCircuit(n+1)  # n input qubits + 1 ancilla
    
    if f_type == 'constant':
        # Constant function: f(x) = 0 or f(x) = 1
        # For f(x) = 1, flip ancilla
        qc.x(n)  # f(x) = 1 for all x
    else:
        # Balanced function: f(x) = x₀ ⊕ x₁ ⊕ ... ⊕ xₙ₋₁
        for i in range(n):
            qc.cx(i, n)  # XOR into ancilla
    
    return qc

def deutsch_jozsa_algorithm(f_type='constant', n=3):
    """Implement Deutsch-Jozsa algorithm"""
    qc = QuantumCircuit(n+1, n)
    
    # Initialize ancilla in |1⟩
    qc.x(n)
    
    # Apply Hadamard to all qubits
    for i in range(n+1):
        qc.h(i)
    
    # Apply oracle
    oracle = deutsch_jozsa_oracle(f_type, n)
    qc = qc.compose(oracle)
    
    # Apply Hadamard to input qubits
    for i in range(n):
        qc.h(i)
    
    # Measure input qubits
    qc.measure(range(n), range(n))
    
    return qc

# Test constant function
qc_constant = deutsch_jozsa_algorithm('constant', n=3)
print("Deutsch-Jozsa: Constant Function")
print(qc_constant.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_constant, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_constant)
print(f"\nResults: {counts}")
print("All zeros → constant function")

# Test balanced function
qc_balanced = deutsch_jozsa_algorithm('balanced', n=3)
print("\nDeutsch-Jozsa: Balanced Function")
job = execute(qc_balanced, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_balanced)
print(f"Results: {counts}")
print("Non-zero result → balanced function")
```

### Understanding the Algorithm

```python
def deutsch_jozsa_explanation():
    """Step-by-step explanation"""
    print("Deutsch-Jozsa Algorithm Steps:")
    print("1. Initialize: |0⟩ⁿ|1⟩")
    print("2. Apply H⊗ⁿ⁺¹: Creates superposition")
    print("3. Apply oracle: |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩")
    print("4. Apply H⊗ⁿ to input: Interference happens")
    print("5. Measure: |00...0⟩ → constant, else → balanced")
    print("\nQuantum Advantage:")
    print("- Classical: 2^(n-1) + 1 queries")
    print("- Quantum: 1 query")
    print("- Exponential speedup!")

deutsch_jozsa_explanation()
```

!!! note "Quantum Advantage"
    Deutsch-Jozsa shows exponential speedup:
    - **Classical**: Need to check 2ⁿ⁻¹ + 1 inputs
    - **Quantum**: Only 1 query needed
    - **Speedup**: Exponential (2ⁿ⁻¹ vs 1)

## Bernstein-Vazirani Algorithm

The **Bernstein-Vazirani algorithm** finds a hidden string s using only 1 query (vs n classical queries).

### Problem Statement

Given a function f(x) = s·x (mod 2) where s is a hidden string, find s.

### Implementation

```python
def bernstein_vazirani_oracle(s):
    """Create oracle for Bernstein-Vazirani"""
    n = len(s)
    qc = QuantumCircuit(n+1)
    
    # f(x) = s·x mod 2
    # Apply CNOT from qubit i to ancilla if s[i] = 1
    for i, bit in enumerate(s):
        if bit == '1':
            qc.cx(i, n)
    
    return qc

def bernstein_vazirani_algorithm(s):
    """Implement Bernstein-Vazirani algorithm"""
    n = len(s)
    qc = QuantumCircuit(n+1, n)
    
    # Initialize ancilla in |1⟩
    qc.x(n)
    
    # Apply Hadamard to all qubits
    for i in range(n+1):
        qc.h(i)
    
    # Apply oracle
    oracle = bernstein_vazirani_oracle(s)
    qc = qc.compose(oracle)
    
    # Apply Hadamard to input qubits
    for i in range(n):
        qc.h(i)
    
    # Measure input qubits
    qc.measure(range(n), range(n))
    
    return qc

# Test with hidden string s = "101"
hidden_string = "101"
qc_bv = bernstein_vazirani_algorithm(hidden_string)
print("Bernstein-Vazirani Algorithm")
print(f"Hidden string: {hidden_string}")
print(qc_bv.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_bv, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_bv)
print(f"\nResults: {counts}")
print(f"Measured string: {max(counts, key=counts.get)}")
print("Should match hidden string!")
```

### Classical vs Quantum

```python
def classical_bernstein_vazirani(n):
    """Classical algorithm: requires n queries"""
    s = ""
    for i in range(n):
        # Query with input that has 1 only at position i
        x = ['0'] * n
        x[i] = '1'
        x_str = ''.join(x)
        # In real scenario, would call oracle
        # result = oracle(x_str)
        # s += str(result)
    return s

print("Bernstein-Vazirani Comparison:")
print(f"Classical: {n} queries needed")
print(f"Quantum: 1 query needed")
print(f"Speedup: {n}x")
```

!!! tip "Bernstein-Vazirani Insight"
    The algorithm works because:
    1. Superposition explores all inputs simultaneously
    2. Oracle encodes s in the phase
    3. Hadamard transforms phase to amplitude
    4. Measurement reveals s directly

## Simon's Algorithm

**Simon's algorithm** finds a hidden period s such that f(x) = f(x ⊕ s) for all x.

### Problem Statement

Given a function f: {0,1}ⁿ → {0,1}ⁿ such that f(x) = f(y) if and only if y = x or y = x ⊕ s, find the hidden string s.

### Implementation

```python
def simon_oracle(s):
    """Create oracle for Simon's algorithm"""
    n = len(s)
    qc = QuantumCircuit(2*n)
    
    # Simplified oracle: f(x) = x ⊕ s if x < 2^(n-1), else x
    # In practice, this would be a black box
    for i in range(n):
        if s[i] == '1':
            for j in range(n):
                qc.cx(i, n+j)
    
    return qc

def simon_algorithm(s, n_rounds=2):
    """Implement Simon's algorithm"""
    n = len(s)
    qc = QuantumCircuit(2*n, n)
    
    # Apply Hadamard to first n qubits
    for i in range(n):
        qc.h(i)
    
    # Apply oracle
    oracle = simon_oracle(s)
    qc = qc.compose(oracle)
    
    # Apply Hadamard to first n qubits again
    for i in range(n):
        qc.h(i)
    
    # Measure first n qubits
    qc.measure(range(n), range(n))
    
    return qc

# Test with hidden string s = "11"
hidden_string = "11"
qc_simon = simon_algorithm(hidden_string)
print("Simon's Algorithm")
print(f"Hidden string: {hidden_string}")
print(qc_simon.draw())

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_simon, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_simon)
print(f"\nResults: {counts}")

# Collect measurements and solve linear system
measurements = list(counts.keys())[:n]
print(f"Measurements: {measurements}")
print("Solve: s·y = 0 mod 2 for all measurements y")
```

### Solving for Hidden String

```python
def solve_simon(measurements):
    """Solve linear system to find hidden string"""
    import numpy as np
    from scipy.linalg import null_space
    
    # Convert measurements to matrix
    n = len(measurements[0])
    A = []
    for m in measurements:
        row = [int(bit) for bit in m]
        A.append(row)
    
    A = np.array(A)
    print(f"Linear system matrix:\n{A}")
    
    # Find null space (solutions to Ax = 0)
    # In practice, use Gaussian elimination mod 2
    null = null_space(A)
    print(f"Null space: {null}")
    
    return null

# Example usage
measurements = ['01', '10']  # Example measurements
solution = solve_simon(measurements)
```

!!! note "Simon's Algorithm Complexity"
    - **Classical**: O(2^(n/2)) queries (birthday paradox)
    - **Quantum**: O(n) queries
    - **Speedup**: Exponential

## Complete Example: Comparing All Algorithms

```python
def compare_algorithms():
    """Compare all three algorithms"""
    print("Algorithm Comparison:")
    print("\n1. Deutsch-Jozsa:")
    print("   Problem: Constant or balanced function?")
    print("   Classical: 2^(n-1) + 1 queries")
    print("   Quantum: 1 query")
    print("   Speedup: Exponential")
    
    print("\n2. Bernstein-Vazirani:")
    print("   Problem: Find hidden string s")
    print("   Classical: n queries")
    print("   Quantum: 1 query")
    print("   Speedup: n-fold")
    
    print("\n3. Simon's:")
    print("   Problem: Find hidden period s")
    print("   Classical: O(2^(n/2)) queries")
    print("   Quantum: O(n) queries")
    print("   Speedup: Exponential")

compare_algorithms()
```

## Practice Exercises

### Exercise 1: Implement Deutsch-Jozsa
```python
# Create a Deutsch-Jozsa oracle for a 4-qubit balanced function
# where f(x) = x₀ ⊕ x₁ ⊕ x₂ ⊕ x₃

def exercise_deutsch_jozsa():
    qc = QuantumCircuit(5, 4)  # 4 input + 1 ancilla
    
    # Your code here
    qc.x(4)  # Initialize ancilla
    for i in range(5):
        qc.h(i)
    
    # Balanced oracle: XOR all inputs
    for i in range(4):
        qc.cx(i, 4)
    
    for i in range(4):
        qc.h(i)
    
    qc.measure(range(4), range(4))
    
    return qc

qc_ex = exercise_deutsch_jozsa()
simulator = Aer.get_backend('qasm_simulator')
job = execute(qc_ex, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_ex)
print("Exercise 1 Results:", counts)
```

### Exercise 2: Bernstein-Vazirani Variant
```python
# Find hidden string s = "1101" using Bernstein-Vazirani

def exercise_bernstein_vazirani():
    s = "1101"
    n = len(s)
    qc = QuantumCircuit(n+1, n)
    
    # Your code here
    qc.x(n)
    for i in range(n+1):
        qc.h(i)
    
    for i, bit in enumerate(s):
        if bit == '1':
            qc.cx(i, n)
    
    for i in range(n):
        qc.h(i)
    
    qc.measure(range(n), range(n))
    
    return qc

qc_ex2 = exercise_bernstein_vazirani()
job = execute(qc_ex2, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc_ex2)
print("Exercise 2 Results:", counts)
print("Expected: 1101")
```

## Key Takeaways

- ✅ **Qiskit** provides powerful tools for quantum programming
- ✅ **Deutsch-Jozsa** shows exponential speedup for function classification
- ✅ **Bernstein-Vazirani** finds hidden strings with 1 query
- ✅ **Simon's algorithm** finds hidden periods efficiently
- ✅ These algorithms demonstrate **quantum advantage** over classical methods

## Next Steps

Continue to [Module 4: Quantum Fourier Transform and Related Algorithms](04-quantum-fourier-transform.md) to learn about:
- Quantum Fourier Transform
- Shor's algorithm
- Grover's search algorithm

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit Textbook - Deutsch-Jozsa](https://qiskit.org/textbook/ch-algorithms/deutsch-jozsa.html)
    2. [Qiskit Textbook - Bernstein-Vazirani](https://qiskit.org/textbook/ch-algorithms/bernstein-vazirani.html)
    3. [Qiskit Textbook - Simon's Algorithm](https://qiskit.org/textbook/ch-algorithms/simon.html)
    4. [Qiskit API Reference](https://qiskit.org/documentation/apidoc/circuit.html)

???+ "📖 Essential Articles"
    1. [Deutsch-Jozsa Algorithm](https://en.wikipedia.org/wiki/Deutsch%E2%80%93Jozsa_algorithm)
    2. [Bernstein-Vazirani Algorithm](https://en.wikipedia.org/wiki/Bernstein%E2%80%93Vazirani_algorithm)
    3. [Simon's Problem](https://en.wikipedia.org/wiki/Simon%27s_problem)

---

*Last Updated: November 2024*

