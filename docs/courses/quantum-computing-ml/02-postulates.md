# Module 2: Postulates of Quantum Computing

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand the postulates of quantum mechanics</li>
    <li>Learn quantum state evolution and measurement</li>
    <li>Explore Bell's inequality and quantum entanglement</li>
    <li>Understand density matrices and quantum teleportation</li>
    <li>Learn BB84 protocol and quantum error correction</li>
  </ul>
</div>

This module covers the fundamental postulates of quantum mechanics that govern quantum computing. These postulates form the mathematical foundation for all quantum algorithms and protocols.

!!! success "Module Overview"
    The postulates of quantum mechanics provide the rules for how quantum systems behave. Understanding these postulates is essential for designing and analyzing quantum algorithms.

## Postulate 1: Quantum State

**Postulate 1**: The state of an isolated quantum system is described by a unit vector in a complex Hilbert space.

### Mathematical Representation

```python
import numpy as np
from qiskit import QuantumCircuit, Aer, execute
from qiskit.quantum_info import Statevector

# A quantum state is a unit vector: |ψ⟩ such that ⟨ψ|ψ⟩ = 1
def normalize_state(alpha, beta):
    """Normalize a quantum state to ensure ⟨ψ|ψ⟩ = 1"""
    norm = np.sqrt(np.abs(alpha)**2 + np.abs(beta)**2)
    return alpha / norm, beta / norm

# Example: Normalize |ψ⟩ = 3|0⟩ + 4|1⟩
alpha, beta = normalize_state(3, 4)
print(f"Normalized state: |ψ⟩ = {alpha:.3f}|0⟩ + {beta:.3f}|1⟩")
print(f"Verification: |α|² + |β|² = {np.abs(alpha)**2 + np.abs(beta)**2:.3f}")

# Using Qiskit
qc = QuantumCircuit(1)
qc.initialize([alpha, beta], 0)

simulator = Aer.get_backend('statevector_simulator')
job = execute(qc, simulator)
result = job.result()
statevector = result.get_statevector()

print(f"\nState vector: {statevector}")
print(f"Norm: {np.linalg.norm(statevector):.6f}")  # Should be 1.0
```

### Pure States vs Mixed States

```python
from qiskit.quantum_info import DensityMatrix

# Pure state: |ψ⟩ = α|0⟩ + β|1⟩
pure_state = Statevector([1/np.sqrt(2), 1/np.sqrt(2)])
print("Pure state:")
print(pure_state)

# Density matrix of pure state: ρ = |ψ⟩⟨ψ|
rho_pure = DensityMatrix(pure_state)
print("\nDensity matrix (pure state):")
print(rho_pure)

# Mixed state: statistical mixture
# ρ = p₁|ψ₁⟩⟨ψ₁| + p₂|ψ₂⟩⟨ψ₂|
# Example: 50% |0⟩, 50% |1⟩
rho_mixed = 0.5 * DensityMatrix([1, 0]) + 0.5 * DensityMatrix([0, 1])
print("\nDensity matrix (mixed state):")
print(rho_mixed)
```

!!! note "Pure vs Mixed States"
    - **Pure state**: System is in a definite quantum state |ψ⟩
    - **Mixed state**: System is in a statistical mixture of states
    - Pure states: Tr(ρ²) = 1
    - Mixed states: Tr(ρ²) < 1

## Postulate 2: Quantum Evolution

**Postulate 2**: The evolution of a closed quantum system is described by a unitary transformation.

### Unitary Evolution

```python
from qiskit.quantum_info import Operator

# Unitary operator: U such that U†U = I
# Time evolution: |ψ(t)⟩ = U(t)|ψ(0)⟩

# Example: Evolution under Hadamard gate
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
H_dagger = H.conj().T

# Verify unitarity: H†H = I
unitarity_check = H_dagger @ H
print("Unitarity check (H†H):")
print(unitarity_check)
print(f"Is unitary? {np.allclose(unitarity_check, np.eye(2))}")

# Evolution: |0⟩ → H|0⟩ = |+⟩
initial_state = np.array([1, 0])
evolved_state = H @ initial_state
print(f"\nEvolution: |0⟩ → {evolved_state}")
```

### Schrödinger Equation

```python
# Continuous time evolution: iℏ d|ψ⟩/dt = H|ψ⟩
# For constant Hamiltonian: |ψ(t)⟩ = exp(-iHt/ℏ)|ψ(0)⟩

def time_evolution(hamiltonian, initial_state, time):
    """Evolve state under Hamiltonian for time t"""
    # U(t) = exp(-iHt)
    # For small time, use Taylor expansion or matrix exponential
    from scipy.linalg import expm
    evolution_op = expm(-1j * hamiltonian * time)
    return evolution_op @ initial_state

# Example: Evolution under Pauli-X Hamiltonian
H_x = np.array([[0, 1], [1, 0]])  # Pauli-X
initial = np.array([1, 0])  # |0⟩
time = np.pi / 2

evolved = time_evolution(H_x, initial, time)
print(f"State after time π/2: {evolved}")
```

!!! tip "Unitary Evolution"
    All quantum gates are unitary operators. This ensures:
    - Probability is conserved (normalization preserved)
    - Evolution is reversible
    - No information is lost

## Postulate 3: Quantum Measurement

**Postulate 3**: Quantum measurements are described by a collection of measurement operators {Mₘ} that satisfy the completeness relation.

### Measurement Operators

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.quantum_info import Statevector

# Measurement in computational basis: {|0⟩⟨0|, |1⟩⟨1|}
M0 = np.array([[1, 0], [0, 0]])  # |0⟩⟨0|
M1 = np.array([[0, 0], [0, 1]])  # |1⟩⟨1|

# Completeness: M0†M0 + M1†M1 = I
completeness = M0.conj().T @ M0 + M1.conj().T @ M1
print("Completeness relation:")
print(completeness)
print(f"Is complete? {np.allclose(completeness, np.eye(2))}")

# Measurement probability: p(m) = ⟨ψ|Mₘ†Mₘ|ψ⟩
psi = np.array([1/np.sqrt(2), 1/np.sqrt(2)])  # |+⟩
prob_0 = psi.conj() @ M0.conj().T @ M0 @ psi
prob_1 = psi.conj() @ M1.conj().T @ M1 @ psi

print(f"\nMeasurement probabilities:")
print(f"P(0) = {prob_0.real:.3f}")
print(f"P(1) = {prob_1.real:.3f}")
print(f"Sum: {prob_0.real + prob_1.real:.3f}")

# Post-measurement state: |ψ'⟩ = Mₘ|ψ⟩ / √p(m)
post_measure_0 = (M0 @ psi) / np.sqrt(prob_0)
print(f"\nPost-measurement state (if measured 0): {post_measure_0}")
```

### Measurement in Qiskit

```python
# Standard measurement in computational basis
qc = QuantumCircuit(1, 1)
qc.h(0)  # Create |+⟩
qc.measure(0, 0)

simulator = Aer.get_backend('qasm_simulator')
job = execute(qc, simulator, shots=1000)
result = job.result()
counts = result.get_counts(qc)

print("Measurement results:")
print(counts)
print(f"P(0) ≈ {counts.get('0', 0) / 1000:.3f}")
print(f"P(1) ≈ {counts.get('1', 0) / 1000:.3f}")
```

!!! warning "Measurement Collapse"
    Measurement collapses the quantum state. After measuring |+⟩ and getting 0, the state becomes |0⟩. The superposition is destroyed!

## Bell's Inequality Test

**Bell's inequality** tests whether quantum mechanics can be explained by local hidden variables. Quantum mechanics violates Bell's inequality, proving quantum entanglement is real.

### Classical vs Quantum Correlation

```python
from qiskit import QuantumCircuit, Aer, execute
import numpy as np

def bell_inequality_test():
    """Test Bell's inequality with entangled qubits"""
    
    # Create Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    
    # Measure in different bases
    # For Bell test, we need measurements at different angles
    qc.measure([0, 1], [0, 1])
    
    simulator = Aer.get_backend('qasm_simulator')
    job = execute(qc, simulator, shots=10000)
    result = job.result()
    counts = result.get_counts(qc)
    
    # Calculate correlations
    N00 = counts.get('00', 0)
    N01 = counts.get('01', 0)
    N10 = counts.get('10', 0)
    N11 = counts.get('11', 0)
    total = sum(counts.values())
    
    # Correlation: E = (N00 + N11 - N01 - N10) / total
    correlation = (N00 + N11 - N01 - N10) / total
    
    print("Bell State Measurement:")
    print(f"|00⟩: {N00/total:.3f}")
    print(f"|11⟩: {N11/total:.3f}")
    print(f"Correlation: {correlation:.3f}")
    print(f"\nBell's inequality: |E(a,b) - E(a,b') + E(a',b) + E(a',b')| ≤ 2")
    print("Quantum mechanics violates this (can reach 2√2 ≈ 2.828)")

bell_inequality_test()
```

### CHSH Inequality

```python
def chsh_inequality():
    """CHSH (Clauser-Horne-Shimony-Holt) inequality test"""
    
    # CHSH value: S = E(a,b) - E(a,b') + E(a',b) + E(a',b')
    # Classical: |S| ≤ 2
    # Quantum: |S| ≤ 2√2 ≈ 2.828
    
    # For maximally entangled state, S = 2√2
    S_quantum = 2 * np.sqrt(2)
    S_classical_max = 2
    
    print("CHSH Inequality:")
    print(f"Classical bound: |S| ≤ {S_classical_max}")
    print(f"Quantum bound: |S| ≤ {S_quantum:.3f}")
    print(f"Quantum mechanics violates classical bound!")

chsh_inequality()
```

!!! note "Bell's Theorem"
    Bell's inequality violation proves that:
    - Quantum mechanics cannot be explained by local hidden variables
    - Quantum entanglement is a real, non-local phenomenon
    - Nature is fundamentally non-classical

## Density Matrices

**Density matrices** provide a more general description of quantum states, including mixed states.

### Pure State Density Matrix

```python
from qiskit.quantum_info import DensityMatrix, Statevector

# Pure state: |ψ⟩ = (|0⟩ + |1⟩)/√2
psi = Statevector([1/np.sqrt(2), 1/np.sqrt(2)])

# Density matrix: ρ = |ψ⟩⟨ψ|
rho = DensityMatrix(psi)
print("Density matrix (pure state):")
print(rho)

# Properties of pure state:
# - Tr(ρ) = 1 (normalized)
# - Tr(ρ²) = 1 (pure)
# - ρ = ρ² (idempotent)

print(f"\nTrace: {rho.trace():.3f}")
print(f"Tr(ρ²): {np.trace(rho @ rho):.3f}")
print(f"Is pure? {np.isclose(np.trace(rho @ rho), 1.0)}")
```

### Mixed State Density Matrix

```python
# Mixed state: 50% |0⟩, 50% |1⟩
rho_mixed = 0.5 * DensityMatrix([1, 0]) + 0.5 * DensityMatrix([0, 1])

print("Density matrix (mixed state):")
print(rho_mixed)

print(f"\nTrace: {rho_mixed.trace():.3f}")
print(f"Tr(ρ²): {np.trace(rho_mixed @ rho_mixed):.3f}")
print(f"Is pure? {np.isclose(np.trace(rho_mixed @ rho_mixed), 1.0)}")
print(f"Is mixed? {np.trace(rho_mixed @ rho_mixed) < 1.0}")
```

### Partial Trace (Reduced Density Matrix)

```python
# For entangled state, tracing out one qubit gives mixed state
from qiskit.quantum_info import partial_trace

# Bell state: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
bell_state = Statevector([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])

# Density matrix of full system
rho_bell = DensityMatrix(bell_state)

# Partial trace: trace out qubit 1, keep qubit 0
rho_reduced = partial_trace(rho_bell, [1])  # Trace out qubit 1

print("Reduced density matrix (tracing out one qubit):")
print(rho_reduced)
print(f"\nThis is a mixed state: Tr(ρ²) = {np.trace(rho_reduced @ rho_reduced):.3f}")
```

!!! tip "When to Use Density Matrices"
    Use density matrices when:
    - Describing mixed states
    - Dealing with open quantum systems
    - Analyzing decoherence
    - Describing subsystems of entangled states

## Quantum Teleportation

**Quantum teleportation** transfers a quantum state from one location to another using entanglement and classical communication.

### Teleportation Protocol

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.quantum_info import Statevector

def quantum_teleportation():
    """Implement quantum teleportation protocol"""
    
    # Step 1: Create Bell pair shared by Alice and Bob
    qc = QuantumCircuit(3, 2)  # 3 qubits, 2 classical bits
    
    # Qubit 0: State to teleport (|ψ⟩ = |1⟩ for example)
    qc.x(0)  # Prepare |1⟩ to teleport
    
    # Qubits 1,2: Bell pair (Alice has 1, Bob has 2)
    qc.h(1)
    qc.cx(1, 2)
    
    # Step 2: Alice's operations
    qc.cx(0, 1)  # CNOT: control=0, target=1
    qc.h(0)      # Hadamard on qubit 0
    
    # Step 3: Alice measures and sends classical bits
    qc.measure([0, 1], [0, 1])
    
    # Step 4: Bob applies corrections based on measurement
    # (In real implementation, Bob would apply X and/or Z based on classical bits)
    qc.cx(1, 2)  # Conditional X
    qc.cz(0, 2)  # Conditional Z
    
    # Verify: Qubit 2 should now be in state |1⟩
    simulator = Aer.get_backend('statevector_simulator')
    job = execute(qc, simulator)
    result = job.result()
    statevector = result.get_statevector()
    
    print("Quantum Teleportation Protocol:")
    print(f"Final state vector: {statevector}")
    print("\nQubit 2 (Bob's qubit) should be in state |1⟩")
    
    return qc

qc_teleport = quantum_teleportation()
print("\nCircuit:")
print(qc_teleport.draw())
```

### Teleportation with Corrections

```python
def teleportation_with_corrections():
    """Complete teleportation with proper corrections"""
    
    # State to teleport: |ψ⟩ = (|0⟩ + i|1⟩)/√2
    state_to_teleport = [1/np.sqrt(2), 1j/np.sqrt(2)]
    
    qc = QuantumCircuit(3, 2)
    
    # Initialize qubit 0 with state to teleport
    qc.initialize(state_to_teleport, 0)
    
    # Create Bell pair
    qc.h(1)
    qc.cx(1, 2)
    
    # Alice's operations
    qc.barrier()  # Visual separator
    qc.cx(0, 1)
    qc.h(0)
    qc.measure([0, 1], [0, 1])
    
    # Bob's corrections (would be conditional in real implementation)
    qc.barrier()
    qc.x(2).c_if(0, 1)  # Apply X if bit 0 is 1
    qc.z(2).c_if(1, 1)  # Apply Z if bit 1 is 1
    
    print("Complete Teleportation Circuit:")
    print(qc.draw())
    
    return qc

teleportation_with_corrections()
```

!!! note "Teleportation Requirements"
    Quantum teleportation requires:
    1. **Entangled pair**: Shared Bell state
    2. **Classical communication**: 2 classical bits
    3. **Local operations**: CNOT and Hadamard
    - **No faster-than-light communication**: Classical bits are needed

## BB84 Protocol

**BB84** is a quantum key distribution (QKD) protocol that uses quantum mechanics to securely share encryption keys.

### BB84 Implementation

```python
import random

def bb84_protocol():
    """BB84 Quantum Key Distribution Protocol"""
    
    # Alice's random bits and basis choices
    n_bits = 100
    alice_bits = [random.randint(0, 1) for _ in range(n_bits)]
    alice_bases = [random.choice(['Z', 'X']) for _ in range(n_bits)]
    
    # Alice prepares qubits
    qc = QuantumCircuit(n_bits, n_bits)
    for i in range(n_bits):
        if alice_bits[i] == 1:
            qc.x(i)  # Flip to |1⟩
        if alice_bases[i] == 'X':
            qc.h(i)  # Change to X basis
    
    # Bob's random basis choices
    bob_bases = [random.choice(['Z', 'X']) for _ in range(n_bits)]
    
    # Bob measures in his chosen bases
    for i in range(n_bits):
        if bob_bases[i] == 'X':
            qc.h(i)  # Change to X basis before measurement
        qc.measure(i, i)
    
    # Simulate
    simulator = Aer.get_backend('qasm_simulator')
    job = execute(qc, simulator, shots=1)
    result = job.result()
    counts = result.get_counts(qc)
    
    # Extract Bob's measurement
    bob_measurement = list(counts.keys())[0]
    bob_bits = [int(bit) for bit in bob_measurement]
    
    # Sifting: Keep only bits where bases match
    sifted_key = []
    for i in range(n_bits):
        if alice_bases[i] == bob_bases[i]:
            sifted_key.append(bob_bits[i])
    
    print("BB84 Protocol:")
    print(f"Alice's bits: {alice_bits[:20]}...")
    print(f"Alice's bases: {alice_bases[:20]}...")
    print(f"Bob's bases: {bob_bases[:20]}...")
    print(f"Bob's bits: {bob_bits[:20]}...")
    print(f"\nSifted key length: {len(sifted_key)}")
    print(f"Sifted key: {sifted_key[:20]}...")
    
    # Check for eavesdropping (would compare subset in real protocol)
    return sifted_key

bb84_protocol()
```

### Security of BB84

```python
def bb84_security_analysis():
    """Analyze security properties of BB84"""
    
    print("BB84 Security Properties:")
    print("1. **No Cloning**: Eavesdropper cannot copy quantum states")
    print("2. **Measurement Disturbance**: Measuring disturbs the state")
    print("3. **Basis Mismatch**: Wrong basis gives random results")
    print("4. **Privacy Amplification**: Removes leaked information")
    print("5. **Error Detection**: Detects eavesdropping attempts")
    
    # Example: Eavesdropper effect
    print("\nEavesdropper Effect:")
    print("- If Eve measures in wrong basis: 50% error rate")
    print("- If Eve measures in correct basis: 0% error (but detectable)")
    print("- Any measurement disturbs the state (detectable)")

bb84_security_analysis()
```

!!! warning "BB84 Security"
    BB84 is secure against:
    - **Passive eavesdropping**: Cannot copy quantum states
    - **Active attacks**: Measurement disturbs the state
    - **Man-in-the-middle**: Requires authentication
    - **Not secure against**: Side-channel attacks, implementation flaws

## Quantum Error Correction

Quantum error correction protects quantum information from decoherence and noise.

### Bit-Flip Code

```python
def bit_flip_code():
    """3-qubit bit-flip error correction code"""
    
    # Encode: |0⟩ → |000⟩, |1⟩ → |111⟩
    qc_encode = QuantumCircuit(3, 3)
    qc_encode.cx(0, 1)  # |0⟩|0⟩|0⟩ → |0⟩|0⟩|0⟩
    qc_encode.cx(0, 2)  # |0⟩|0⟩|0⟩ → |0⟩|0⟩|0⟩
    # For |1⟩: |1⟩|0⟩|0⟩ → |1⟩|1⟩|1⟩
    
    print("Bit-Flip Encoding:")
    print(qc_encode.draw())
    
    # Introduce error (bit flip on qubit 1)
    qc_error = QuantumCircuit(3, 3)
    qc_error.cx(0, 1)
    qc_error.cx(0, 2)
    qc_error.x(1)  # Error: bit flip on qubit 1
    
    # Syndrome measurement
    qc_syndrome = QuantumCircuit(3, 2)
    qc_syndrome.cx(0, 1)
    qc_syndrome.cx(0, 2)
    qc_syndrome.x(1)  # Error
    qc_syndrome.cx(0, 1)  # Syndrome: compare 0 and 1
    qc_syndrome.cx(0, 2)  # Syndrome: compare 0 and 2
    qc_syndrome.measure([1, 2], [0, 1])
    
    print("\nSyndrome Measurement:")
    print(qc_syndrome.draw())
    
    # Correction (would be conditional based on syndrome)
    qc_correct = QuantumCircuit(3, 2)
    qc_correct.cx(0, 1)
    qc_correct.cx(0, 2)
    qc_correct.x(1)  # Error
    qc_correct.cx(0, 1)
    qc_correct.cx(0, 2)
    qc_correct.measure([1, 2], [0, 1])
    # If syndrome is 01: error on qubit 1, apply X
    # If syndrome is 10: error on qubit 2, apply X
    # If syndrome is 11: error on qubit 0, apply X
    
    return qc_correct

bit_flip_code()
```

### Phase-Flip Code

```python
def phase_flip_code():
    """3-qubit phase-flip error correction code"""
    
    # Encode: |0⟩ → |+++⟩, |1⟩ → |---⟩
    qc = QuantumCircuit(3, 3)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(0, 2)
    qc.h(0)
    qc.h(1)
    qc.h(2)
    
    print("Phase-Flip Encoding:")
    print(qc.draw())
    
    # Phase-flip code protects against Z errors
    # Similar structure to bit-flip but in different basis

phase_flip_code()
```

### Shor's Code

```python
def shor_code():
    """9-qubit Shor code (corrects both bit and phase errors)"""
    
    # Shor code: combines bit-flip and phase-flip codes
    qc = QuantumCircuit(9, 9)
    
    # First encode in bit-flip code (3 qubits)
    qc.cx(0, 3)
    qc.cx(0, 6)
    
    # Then encode each in phase-flip code
    for i in [0, 3, 6]:
        qc.h(i)
        qc.cx(i, i+1)
        qc.cx(i, i+2)
        qc.h(i)
        qc.h(i+1)
        qc.h(i+2)
    
    print("Shor's 9-Qubit Code:")
    print("Encodes 1 logical qubit in 9 physical qubits")
    print("Corrects: 1 bit-flip error OR 1 phase-flip error")
    
    return qc

shor_code()
```

!!! tip "Error Correction Requirements"
    Quantum error correction requires:
    1. **Redundancy**: Encode 1 logical qubit in multiple physical qubits
    2. **Syndrome measurement**: Detect errors without measuring data
    3. **Correction**: Apply recovery operations based on syndrome
    4. **Fault tolerance**: Correct errors in error correction itself

## Complete Example: Quantum Teleportation with Error Correction

```python
def teleportation_with_error_correction():
    """Combine teleportation with error correction"""
    
    qc = QuantumCircuit(5, 3)
    
    # State to teleport
    qc.x(0)  # |1⟩
    
    # Encode in bit-flip code
    qc.cx(0, 1)
    qc.cx(0, 2)
    
    # Teleport each qubit (simplified)
    # In practice, would teleport encoded state
    
    print("Teleportation with Error Correction:")
    print("1. Encode state in error-correcting code")
    print("2. Teleport encoded qubits")
    print("3. Decode at destination")
    print("4. Errors during teleportation are corrected")
    
    return qc

teleportation_with_error_correction()
```

## Key Takeaways

- ✅ **Postulate 1**: Quantum states are unit vectors in Hilbert space
- ✅ **Postulate 2**: Evolution is unitary (U†U = I)
- ✅ **Postulate 3**: Measurement collapses the state probabilistically
- ✅ **Bell's inequality**: Quantum mechanics violates classical bounds
- ✅ **Density matrices**: General description including mixed states
- ✅ **Quantum teleportation**: Transfers quantum states using entanglement
- ✅ **BB84 protocol**: Secure quantum key distribution
- ✅ **Error correction**: Protects quantum information from noise

## Next Steps

Continue to [Module 3: Introduction to Quantum Algorithms](03-quantum-algorithms.md) to learn about:
- Qiskit programming
- Deutsch-Jozsa algorithm
- Bernstein-Vazirani algorithm
- Simon's algorithm

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit Textbook - Quantum States](https://qiskit.org/textbook/ch-states/introduction.html)
    2. [Qiskit Quantum Information](https://qiskit.org/documentation/apidoc/quantum_info.html)
    3. [Quantum Teleportation](https://qiskit.org/textbook/ch-algorithms/teleportation.html)
    4. [Quantum Error Correction](https://qiskit.org/textbook/ch-quantum-hardware/error-correction-repetition-code.html)

???+ "📖 Essential Articles"
    1. [Bell's Theorem](https://en.wikipedia.org/wiki/Bell%27s_theorem)
    2. [BB84 Protocol](https://en.wikipedia.org/wiki/BB84)
    3. [Quantum Error Correction](https://en.wikipedia.org/wiki/Quantum_error_correction)
    4. [Density Matrix](https://en.wikipedia.org/wiki/Density_matrix)

---

*Last Updated: November 2024*

