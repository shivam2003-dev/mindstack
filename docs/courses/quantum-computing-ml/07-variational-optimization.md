# Module 7: Quantum Variational Optimization and Adiabatic Methods

<div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand Variational Quantum Eigensolver (VQE)</li>
    <li>Implement VQE for ground state energy calculation</li>
    <li>Learn Quantum Approximate Optimization Algorithm (QAOA)</li>
    <li>Understand quantum adiabatic theorem</li>
    <li>Apply quantum algorithms to finance and optimization</li>
  </ul>
</div>

This module covers variational quantum algorithms and adiabatic methods for solving optimization problems, with applications in quantum chemistry, finance, and combinatorial optimization.

!!! success "Module Overview"
    Variational algorithms are well-suited for near-term quantum hardware, making them practical for real-world applications today.

## Variational Quantum Eigensolver (VQE)

**VQE** finds the ground state energy of a Hamiltonian using variational principles.

### Problem Statement

Given a Hamiltonian H, find the ground state |ψ₀⟩ and energy E₀ such that H|ψ₀⟩ = E₀|ψ₀⟩.

### VQE Algorithm

```python
from qiskit import QuantumCircuit, Aer, execute
from qiskit.algorithms import VQE
from qiskit.algorithms.optimizers import SPSA, COBYLA
from qiskit.circuit.library import RealAmplitudes
from qiskit.opflow import PauliSumOp, StateFn, PauliExpectation
from qiskit.quantum_info import SparsePauliOp
import numpy as np

def vqe_algorithm_explanation():
    """Explain VQE algorithm"""
    print("Variational Quantum Eigensolver (VQE):")
    print("\n1. Prepare variational state: |ψ(θ)⟩ = U(θ)|0⟩")
    print("2. Measure expectation value: ⟨ψ(θ)|H|ψ(θ)⟩")
    print("3. Optimize parameters θ to minimize energy")
    print("4. Result: Ground state energy E₀ ≈ min_θ ⟨ψ(θ)|H|ψ(θ)⟩")
    print("\nAdvantages:")
    print("- Suitable for near-term hardware")
    print("- Handles noise well")
    print("- Can find approximate solutions")

vqe_algorithm_explanation()
```

### VQE Implementation

```python
def vqe_implementation(hamiltonian, ansatz, optimizer):
    """Implement VQE algorithm"""
    
    # Create VQE instance
    vqe = VQE(
        ansatz=ansatz,
        optimizer=optimizer,
        quantum_instance=Aer.get_backend('statevector_simulator')
    )
    
    # Run VQE
    result = vqe.compute_minimum_eigenvalue(hamiltonian)
    
    return result

# Example: H₂ molecule Hamiltonian (simplified)
# H = a*I + b*Z₀ + c*Z₁ + d*Z₀Z₁
def create_h2_hamiltonian():
    """Create simplified H₂ molecule Hamiltonian"""
    # Coefficients (simplified)
    coeffs = [0.5, -0.2, -0.2, 0.3]
    paulis = ['II', 'ZI', 'IZ', 'ZZ']
    
    # Create PauliSumOp
    hamiltonian = SparsePauliOp.from_list(
        [(pauli, coeff) for pauli, coeff in zip(paulis, coeffs)]
    )
    
    return hamiltonian

# Create ansatz
ansatz = RealAmplitudes(num_qubits=2, reps=2)

# Create optimizer
optimizer = COBYLA(maxiter=100)

# Run VQE
hamiltonian = create_h2_hamiltonian()
vqe_result = vqe_implementation(hamiltonian, ansatz, optimizer)

print("VQE Results:")
print(f"Ground state energy: {vqe_result.eigenvalue.real:.4f}")
print(f"Optimal parameters: {vqe_result.optimal_parameters}")
```

### Expectation Computation

```python
def compute_expectation_value(hamiltonian, state):
    """Compute expectation value ⟨ψ|H|ψ⟩"""
    
    # Method 1: Direct computation (statevector)
    if isinstance(state, np.ndarray):
        expectation = np.vdot(state, hamiltonian @ state)
        return expectation.real
    
    # Method 2: Measurement-based (for real hardware)
    # Decompose Hamiltonian into Pauli terms
    # Measure each term and sum
    
    return expectation

# Example
hamiltonian_matrix = np.array([[1, 0], [0, -1]])  # Z operator
state = np.array([1/np.sqrt(2), 1/np.sqrt(2)])  # |+⟩

expectation = compute_expectation_value(hamiltonian_matrix, state)
print(f"Expectation value ⟨+|Z|+⟩ = {expectation:.4f}")
print("Expected: 0 (|+⟩ is eigenstate of X, not Z)")
```

### VQE for Molecules

```python
from qiskit_nature.drivers import Molecule
from qiskit_nature.drivers.second_quantization import ElectronicStructureDriverType
from qiskit_nature.problems.second_quantization import ElectronicStructureProblem
from qiskit_nature.converters.second_quantization import QubitConverter
from qiskit_nature.mappers.second_quantization import ParityMapper

def vqe_molecule_example():
    """VQE for molecular ground state energy"""
    
    # Define molecule (H₂)
    molecule = Molecule(
        geometry=[['H', [0., 0., 0.]],
                 ['H', [0., 0., 0.74]]],  # Bond length 0.74 Angstrom
        charge=0,
        multiplicity=1
    )
    
    print("VQE for H₂ Molecule:")
    print("1. Define molecule geometry")
    print("2. Compute electronic structure Hamiltonian")
    print("3. Map to qubits (Jordan-Wigner or Parity)")
    print("4. Run VQE to find ground state energy")
    print("5. Compare with exact diagonalization")
    
    # Note: Full implementation requires qiskit-nature
    # driver = ElectronicStructureDriverType.PYSCF
    # problem = ElectronicStructureProblem(driver)
    # qubit_converter = QubitConverter(ParityMapper())
    # qubit_op = qubit_converter.convert(problem.hamiltonian.second_q_op())
    
    return molecule

molecule = vqe_molecule_example()
```

## Implementation of the VQE Algorithm

Complete VQE implementation with all components.

### Step-by-Step Implementation

```python
def complete_vqe_implementation():
    """Complete VQE implementation"""
    
    # Step 1: Define Hamiltonian
    # H = -0.5*Z₀ - 0.3*Z₁ + 0.2*Z₀Z₁
    hamiltonian = SparsePauliOp.from_list([
        ('ZI', -0.5),
        ('IZ', -0.3),
        ('ZZ', 0.2)
    ])
    
    # Step 2: Choose ansatz
    ansatz = RealAmplitudes(num_qubits=2, reps=3)
    print(f"Ansatz parameters: {ansatz.num_parameters}")
    
    # Step 3: Define cost function
    def cost_function(params):
        """Cost function: expectation value"""
        # Bind parameters to ansatz
        qc = ansatz.bind_parameters(params)
        
        # Compute expectation value
        # (Simplified - full implementation uses measurement)
        simulator = Aer.get_backend('statevector_simulator')
        job = execute(qc, simulator)
        result = job.result()
        statevector = result.get_statevector()
        
        # Compute ⟨ψ|H|ψ⟩
        expectation = np.vdot(statevector, hamiltonian.to_matrix() @ statevector)
        return expectation.real
    
    # Step 4: Optimize
    from scipy.optimize import minimize
    
    initial_params = np.random.random(ansatz.num_parameters)
    result = minimize(cost_function, initial_params, method='COBYLA')
    
    print("\nVQE Results:")
    print(f"Ground state energy: {result.fun:.4f}")
    print(f"Optimal parameters: {result.x}")
    
    # Step 5: Verify with exact diagonalization
    eigenvalues, eigenvectors = np.linalg.eigh(hamiltonian.to_matrix())
    exact_energy = eigenvalues[0]
    
    print(f"\nExact ground state energy: {exact_energy:.4f}")
    print(f"VQE error: {abs(result.fun - exact_energy):.6f}")
    
    return result

vqe_result = complete_vqe_implementation()
```

## Quantum Max-Cut Graph Clustering

Apply VQE to solve Max-Cut problem.

### Max-Cut Problem

```python
def max_cut_problem():
    """Max-Cut problem formulation"""
    print("Max-Cut Problem:")
    print("Given graph G = (V, E), partition vertices into two sets")
    print("to maximize edges between sets.")
    print("\nQuantum formulation:")
    print("Hamiltonian: H = Σ_(i,j)∈E (1 - ZᵢZⱼ)/2")
    print("Ground state = optimal cut")
    
    # Example: 3-node graph
    # Edges: (0,1), (1,2)
    edges = [(0, 1), (1, 2)]
    
    # Construct Hamiltonian
    hamiltonian_terms = []
    for i, j in edges:
        # (1 - ZᵢZⱼ)/2 = I/2 - ZᵢZⱼ/2
        hamiltonian_terms.append(('II', 0.5))
        hamiltonian_terms.append((f'Z{"I"*(j-i-1)}Z{"I"*(2-j)}', -0.5))
    
    print(f"\nMax-Cut Hamiltonian terms: {len(hamiltonian_terms)}")
    return edges

edges = max_cut_problem()
```

### VQE for Max-Cut

```python
def vqe_max_cut(edges, n_qubits=3):
    """Solve Max-Cut using VQE"""
    
    # Construct Hamiltonian
    hamiltonian_terms = []
    for i, j in edges:
        # Simplified: use ZZ terms
        pauli_string = ['I'] * n_qubits
        pauli_string[i] = 'Z'
        pauli_string[j] = 'Z'
        hamiltonian_terms.append((''.join(pauli_string), -0.5))
    
    # Add constant term
    hamiltonian_terms.append(('I' * n_qubits, len(edges) * 0.5))
    
    hamiltonian = SparsePauliOp.from_list(hamiltonian_terms)
    
    # VQE
    ansatz = RealAmplitudes(num_qubits=n_qubits, reps=2)
    optimizer = COBYLA(maxiter=100)
    
    vqe = VQE(
        ansatz=ansatz,
        optimizer=optimizer,
        quantum_instance=Aer.get_backend('statevector_simulator')
    )
    
    result = vqe.compute_minimum_eigenvalue(hamiltonian)
    
    print("Max-Cut VQE Results:")
    print(f"Minimum energy: {result.eigenvalue.real:.4f}")
    
    # Extract cut from optimal state
    optimal_state = result.optimal_point
    print(f"Optimal parameters: {optimal_state}")
    
    return result

vqe_maxcut_result = vqe_max_cut(edges, n_qubits=3)
```

## Quantum Adiabatic Theorem

The **quantum adiabatic theorem** states that a system remains in its ground state if the Hamiltonian changes slowly enough.

### Adiabatic Evolution

```python
def adiabatic_theorem_explanation():
    """Explain quantum adiabatic theorem"""
    print("Quantum Adiabatic Theorem:")
    print("\nIf Hamiltonian H(t) changes slowly enough,")
    print("system stays in instantaneous ground state.")
    print("\nConditions:")
    print("1. H(t) varies slowly: dH/dt << gap²")
    print("2. Initial state is ground state of H(0)")
    print("3. Final state approximates ground state of H(T)")
    print("\nApplication:")
    print("Start with easy H₀, evolve to problem H₁")
    print("Final state solves optimization problem")

adiabatic_theorem_explanation()
```

### Adiabatic Algorithm

```python
def adiabatic_algorithm():
    """Quantum adiabatic algorithm"""
    
    # Time-dependent Hamiltonian: H(s) = (1-s)H₀ + s*H₁
    # s goes from 0 to 1
    
    def hamiltonian_interpolation(s, H0, H1):
        """Interpolate between H₀ and H₁"""
        return (1 - s) * H0 + s * H1
    
    # Example: H₀ = -Σᵢ Xᵢ (easy ground state: |+++...⟩)
    #          H₁ = problem Hamiltonian
    
    print("Adiabatic Algorithm:")
    print("1. Start: H(0) = H₀ (easy to prepare)")
    print("2. Evolve: H(s) = (1-s)H₀ + s*H₁")
    print("3. End: H(1) = H₁ (problem Hamiltonian)")
    print("4. Final state ≈ ground state of H₁")
    
    return hamiltonian_interpolation

adiabatic_interp = adiabatic_algorithm()
```

## Quantum Approximate Optimization Algorithm (QAOA)

**QAOA** is a hybrid algorithm for combinatorial optimization.

### QAOA Algorithm

```python
from qiskit.algorithms import QAOA
from qiskit.circuit.library import QAOAAnsatz

def qaoa_algorithm():
    """Quantum Approximate Optimization Algorithm"""
    
    print("QAOA Algorithm:")
    print("\n1. Problem Hamiltonian: H_C (cost function)")
    print("2. Mixer Hamiltonian: H_M = -Σᵢ Xᵢ")
    print("3. Ansatz: |γ,β⟩ = e^(-iβₚH_M) e^(-iγₚH_C) ... e^(-iβ₁H_M) e^(-iγ₁H_C) |+⟩")
    print("4. Optimize parameters γ, β")
    print("5. Measure: expectation ⟨γ,β|H_C|γ,β⟩")
    
    # QAOA for Max-Cut
    # H_C = Σ_(i,j)∈E (1 - ZᵢZⱼ)/2
    # H_M = -Σᵢ Xᵢ
    
    return None

qaoa_algorithm()
```

### QAOA Implementation

```python
def qaoa_implementation(hamiltonian, p=1):
    """Implement QAOA"""
    
    # Create QAOA ansatz
    qaoa_ansatz = QAOAAnsatz(
        cost_operator=hamiltonian,
        reps=p  # Number of layers
    )
    
    # QAOA algorithm
    qaoa = QAOA(
        ansatz=qaoa_ansatz,
        optimizer=COBYLA(maxiter=100),
        quantum_instance=Aer.get_backend('qasm_simulator')
    )
    
    result = qaoa.compute_minimum_eigenvalue(hamiltonian)
    
    print("QAOA Results:")
    print(f"Optimal value: {result.eigenvalue.real:.4f}")
    print(f"Optimal parameters: {result.optimal_parameters}")
    
    return result

# Example: Max-Cut with QAOA
# (Use same Hamiltonian as VQE example)
# qaoa_result = qaoa_implementation(hamiltonian, p=2)
```

### QAOA vs VQE

```python
def qaoa_vs_vqe():
    """Compare QAOA and VQE"""
    
    print("QAOA vs VQE:")
    print("\nQAOA:")
    print("- Specifically for optimization")
    print("- Uses problem and mixer Hamiltonians")
    print("- Fixed ansatz structure")
    print("- Good for combinatorial problems")
    
    print("\nVQE:")
    print("- General variational method")
    print("- Flexible ansatz choice")
    print("- Good for chemistry and physics")
    print("- More general purpose")
    
    print("\nBoth:")
    print("- Hybrid quantum-classical")
    print("- Suitable for near-term hardware")
    print("- Use parameter optimization")

qaoa_vs_vqe()
```

## Quantum Algorithm for Finance

Apply quantum algorithms to financial problems.

### Portfolio Optimization

```python
def quantum_portfolio_optimization():
    """Quantum portfolio optimization"""
    
    print("Quantum Portfolio Optimization:")
    print("\nProblem: Maximize return - λ*risk")
    print("Subject to: Σᵢ wᵢ = 1, wᵢ ≥ 0")
    
    # Formulate as QUBO (Quadratic Unconstrained Binary Optimization)
    # H = -Σᵢ μᵢxᵢ + λ*Σᵢⱼ σᵢⱼxᵢxⱼ
    # where xᵢ ∈ {0,1} represents asset selection
    
    print("\nQuantum approach:")
    print("1. Encode portfolio as binary variables")
    print("2. Formulate as Ising model")
    print("3. Use QAOA or VQE to optimize")
    print("4. Extract optimal portfolio")
    
    # Example: 3 assets
    returns = [0.1, 0.15, 0.12]  # Expected returns
    risk_aversion = 0.5
    
    print(f"\nAssets: {len(returns)}")
    print(f"Returns: {returns}")
    print(f"Risk aversion: {risk_aversion}")

quantum_portfolio_optimization()
```

### Option Pricing

```python
def quantum_option_pricing():
    """Quantum algorithms for option pricing"""
    
    print("Quantum Option Pricing:")
    print("\n1. Encode asset price paths")
    print("2. Compute payoff function")
    print("3. Use quantum amplitude estimation")
    print("4. Extract option price")
    
    # Monte Carlo simulation on quantum computer
    # Can provide quadratic speedup
    
    print("\nAdvantages:")
    print("- Faster Monte Carlo simulation")
    print("- Better accuracy with fewer samples")
    print("- Suitable for complex derivatives")

quantum_option_pricing()
```

## Complete Examples

### Example 1: VQE for H₂ Molecule

```python
def vqe_h2_complete():
    """Complete VQE example for H₂"""
    
    # Simplified H₂ Hamiltonian
    # H = -1.05*I + 0.4*Z₀ + 0.4*Z₁ + 0.2*Z₀Z₁ + 0.2*X₀X₁
    
    hamiltonian = SparsePauliOp.from_list([
        ('II', -1.05),
        ('ZI', 0.4),
        ('IZ', 0.4),
        ('ZZ', 0.2),
        ('XX', 0.2)
    ])
    
    # Ansatz
    ansatz = RealAmplitudes(num_qubits=2, reps=3)
    
    # Optimizer
    optimizer = SPSA(maxiter=200)
    
    # VQE
    vqe = VQE(
        ansatz=ansatz,
        optimizer=optimizer,
        quantum_instance=Aer.get_backend('statevector_simulator')
    )
    
    result = vqe.compute_minimum_eigenvalue(hamiltonian)
    
    print("H₂ Molecule VQE:")
    print(f"Ground state energy: {result.eigenvalue.real:.4f} Hartree")
    print(f"Optimal parameters: {list(result.optimal_parameters.values())[:3]}...")
    
    # Compare with exact
    exact_energy = np.min(np.linalg.eigvalsh(hamiltonian.to_matrix()))
    print(f"Exact energy: {exact_energy:.4f} Hartree")
    print(f"Error: {abs(result.eigenvalue.real - exact_energy):.6f} Hartree")
    
    return result

vqe_h2_result = vqe_h2_complete()
```

### Example 2: QAOA for Traveling Salesman Problem

```python
def qaoa_tsp():
    """QAOA for Traveling Salesman Problem"""
    
    print("QAOA for TSP:")
    print("\n1. Encode cities and routes as qubits")
    print("2. Formulate cost: minimize total distance")
    print("3. Add constraints: visit each city once")
    print("4. Use QAOA to find optimal route")
    
    # Simplified: 3 cities
    distances = {
        (0, 1): 10,
        (1, 2): 15,
        (2, 0): 12
    }
    
    print(f"\nCities: 3")
    print(f"Distances: {distances}")
    print("Optimal route: Find using QAOA")
    
    return distances

tsp_distances = qaoa_tsp()
```

## Key Takeaways

- ✅ **VQE** finds ground states using variational methods
- ✅ **Expectation values** computed via measurement or simulation
- ✅ **QAOA** optimizes combinatorial problems
- ✅ **Adiabatic theorem** enables ground state preparation
- ✅ **Quantum finance** applications include portfolio optimization
- ✅ **Hybrid algorithms** are practical for near-term hardware

## Next Steps

You've completed all 7 modules! Review the course materials and explore the project suggestions in the README.

## Recommended Reads

???+ "📚 Official Documentation"
    1. [Qiskit VQE](https://qiskit.org/documentation/nature/tutorials/01_electronic_structure.html)
    2. [Qiskit QAOA](https://qiskit.org/documentation/optimization/tutorials/06_examples_max_cut_and_tsp.html)
    3. [Variational Algorithms](https://qiskit.org/textbook/ch-applications/vqe-molecules.html)
    4. [Quantum Optimization](https://qiskit.org/documentation/optimization/)

???+ "📖 Essential Articles"
    1. [VQE Paper](https://arxiv.org/abs/1304.3061)
    2. [QAOA Paper](https://arxiv.org/abs/1411.4028)
    3. [Quantum Adiabatic Theorem](https://en.wikipedia.org/wiki/Adiabatic_theorem)

---

*Last Updated: November 2024*

