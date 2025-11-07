# eBPF Architecture

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🏗️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand eBPF architecture and components</li>
    <li>Learn how eBPF programs execute in the kernel</li>
    <li>Understand the eBPF verifier and safety mechanisms</li>
    <li>Explore eBPF program types and attachment points</li>
    <li>Learn about the eBPF execution model</li>
  </ul>
</div>

## Introduction

eBPF (extended Berkeley Packet Filter) is a revolutionary technology that allows sandboxed programs to run in the Linux kernel without changing kernel source code or loading kernel modules. Understanding eBPF architecture is crucial for writing effective eBPF programs.

!!! note "What is eBPF?"
    eBPF is a virtual machine inside the Linux kernel that executes programs in a safe, sandboxed environment. It provides a way to extend kernel functionality dynamically.

## eBPF Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Space                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   eBPF Tool  │  │   eBPF Tool  │  │   eBPF Tool  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │   BPF System   │                    │
│                    │     Calls      │                    │
│                    └───────┬────────┘                    │
└────────────────────────────┼────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                    Kernel Space                          │
│                            │                             │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │          │
│  ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐ │
│  │   eBPF      │   │   eBPF       │   │   eBPF       │ │
│  │  Program    │   │  Program     │   │  Program    │ │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  eBPF Verifier │                    │
│                    └───────┬────────┘                    │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  eBPF Runtime │                    │
│                    │   (JIT Comp)  │                    │
│                    └───────┬────────┘                    │
│                            │                             │
│                    ┌───────▼────────┐                    │
│                    │  Hook Points  │                    │
│                    │  (Kprobes,    │                    │
│                    │   Tracepoints)│                    │
│                    └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. eBPF Programs

eBPF programs are small programs written in a restricted C-like language that run in the kernel.

**Key Characteristics:**
- Limited instruction set (around 100 instructions)
- No loops (except bounded loops in newer kernels)
- No function calls (except helper functions)
- Limited memory access
- Must terminate in bounded time

!!! tip "Program Constraints"
    eBPF programs are intentionally limited to ensure safety. The verifier ensures programs cannot crash the kernel or cause infinite loops.

### 2. eBPF Verifier

The verifier is the security mechanism that ensures eBPF programs are safe to run.

**What the Verifier Checks:**
- Program terminates in bounded time
- No invalid memory accesses
- No uninitialized variables
- No out-of-bounds array access
- Proper use of helper functions
- Valid program structure

```c
// Example: This would be rejected by the verifier
int invalid_program(void *ctx) {
    int *ptr;
    return *ptr;  // Error: uninitialized pointer
}
```

!!! warning "Verifier Rejection"
    If your program is rejected by the verifier, check the error message. Common issues include:
    - Uninitialized variables
    - Invalid memory accesses
    - Unbounded loops
    - Invalid helper function usage

### 3. eBPF Maps

Maps are key-value data structures that allow communication between:
- eBPF programs and user space
- Multiple eBPF programs
- eBPF programs and the kernel

**Common Map Types:**
- `BPF_MAP_TYPE_HASH` - Hash table
- `BPF_MAP_TYPE_ARRAY` - Array
- `BPF_MAP_TYPE_PERF_EVENT_ARRAY` - Perf events
- `BPF_MAP_TYPE_RINGBUF` - Ring buffer (newer)

```c
// Example: Creating a hash map
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} my_map SEC(".maps");
```

### 4. Helper Functions

Helper functions are kernel functions that eBPF programs can call safely.

**Categories of Helpers:**
- **Kernel functions**: `bpf_probe_read()`, `bpf_get_current_pid_tgid()`
- **Map operations**: `bpf_map_lookup_elem()`, `bpf_map_update_elem()`
- **Time functions**: `bpf_ktime_get_ns()`
- **Network functions**: `bpf_skb_load_bytes()`, `bpf_xdp_adjust_head()`

!!! note "Helper Function Safety"
    All helper functions are carefully vetted for safety. They cannot cause kernel crashes or security issues.

## eBPF Program Types

eBPF programs are attached to specific hook points in the kernel. Different program types have different capabilities:

### 1. Tracing Programs

**Kprobes/Kretprobes:**
- Attach to kernel function entry/exit
- Can read function arguments and return values
- Use case: Kernel function tracing

**Tracepoints:**
- Static kernel instrumentation points
- More stable than kprobes
- Use case: System call tracing, scheduler events

**Uprobes/Uretprobes:**
- Attach to user space functions
- Can trace user applications
- Use case: Application profiling

### 2. Networking Programs

**XDP (Express Data Path):**
- Runs at the earliest point in network stack
- Highest performance
- Use case: DDoS protection, load balancing

**TC (Traffic Control):**
- Attach to network interfaces
- Can modify packets
- Use case: Traffic shaping, filtering

**Socket Programs:**
- Attach to sockets
- Can intercept socket operations
- Use case: Socket monitoring, filtering

### 3. Security Programs

**LSM (Linux Security Modules):**
- Attach to security hooks
- Can enforce security policies
- Use case: Access control, audit

## eBPF Execution Model

### Program Lifecycle

1. **Compilation**: C code → eBPF bytecode (using clang/llvm)
2. **Loading**: Bytecode loaded into kernel via `bpf()` syscall
3. **Verification**: Verifier checks program safety
4. **JIT Compilation**: Bytecode compiled to native machine code
5. **Attachment**: Program attached to hook point
6. **Execution**: Program runs when hook is triggered
7. **Cleanup**: Program removed when no longer needed

### JIT Compilation

eBPF programs are Just-In-Time (JIT) compiled to native machine code for performance.

**Benefits:**
- Near-native performance
- No interpretation overhead
- Optimized execution

```bash
# Check JIT status
cat /proc/sys/net/core/bpf_jit_enable
# 1 = JIT enabled
# 2 = JIT enabled with debug output
```

!!! tip "Performance Optimization"
    JIT compilation makes eBPF programs very fast. Most programs execute in microseconds, making them suitable for high-frequency events.

## Hook Points and Attachment

### Attachment Methods

**1. Direct Attachment:**
```c
// Attach to tracepoint
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx) {
    // Program code
    return 0;
}
```

**2. Programmatic Attachment:**
```c
// In user space
struct bpf_link *link = bpf_program__attach(prog);
```

**3. Netlink Attachment:**
```c
// For TC and XDP programs
// Use iproute2 or libbpf APIs
```

### Common Hook Points

| Hook Type | Use Case | Performance |
|-----------|----------|-------------|
| Kprobes | Kernel function tracing | Medium |
| Tracepoints | Stable kernel events | High |
| XDP | Early packet processing | Very High |
| TC | Network packet filtering | High |
| Uprobes | User space tracing | Medium |

## Memory Model

### eBPF Stack

- Limited to 512 bytes
- Used for local variables
- Automatically managed

### eBPF Maps

- Shared between programs and user space
- Persistent across program invocations
- Various types for different use cases

### Direct Packet Access

- For network programs (XDP, TC)
- Can read/write packet data directly
- Bounds checked by verifier

```c
// Example: Direct packet access in XDP
SEC("xdp")
int xdp_prog(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    
    // Safe packet access
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_DROP;
    
    // Process packet...
    return XDP_PASS;
}
```

## Safety Mechanisms

### 1. Verifier

- Static analysis of programs
- Ensures programs are safe
- Rejects unsafe programs

### 2. Runtime Checks

- Bounds checking on memory access
- Null pointer checks
- Array bounds validation

### 3. Resource Limits

- Limited instruction count
- Limited stack size
- Limited map sizes

!!! warning "Safety First"
    Never try to bypass eBPF safety mechanisms. They exist to protect the kernel from crashes and security issues.

## Performance Considerations

### Optimization Tips

1. **Minimize Map Lookups**: Cache frequently accessed values
2. **Use Appropriate Map Types**: Hash maps for lookups, arrays for indexing
3. **Avoid Unnecessary Operations**: Keep programs simple and focused
4. **Use Tail Calls**: For complex logic, use tail calls to chain programs

```c
// Example: Tail call
struct {
    __uint(type, BPF_MAP_TYPE_PROG_ARRAY);
    __uint(max_entries, 10);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u32));
} prog_array SEC(".maps");

// In program
bpf_tail_call(ctx, &prog_array, index);
```

## Summary

!!! success "Key Takeaways"
    - eBPF is a virtual machine in the Linux kernel
    - Programs are verified for safety before execution
    - Maps enable communication between kernel and user space
    - Helper functions provide safe kernel API access
    - JIT compilation ensures high performance
    - Different program types for different use cases

**Next Steps:**
- Set up your development environment (Chapter 3)
- Write your first eBPF program (Chapter 4)
- Learn about maps and data structures (Chapter 5)

---

**Previous**: [Introduction to eBPF](01-introduction)  
**Next**: [Development Environment](03-development-environment)

