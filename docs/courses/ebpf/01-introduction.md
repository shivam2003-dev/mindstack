# Introduction to eBPF

<div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand what eBPF is and its history</li>
    <li>Learn why eBPF is revolutionary</li>
    <li>Know the use cases and applications</li>
    <li>Get an overview of the eBPF ecosystem</li>
  </ul>
</div>

Welcome to the eBPF Practical Course! This course will teach you eBPF through hands-on code examples, real-world use cases, and extensive resources. By the end, you'll be able to write eBPF programs and use them for system monitoring, networking, security, and more.

## What is eBPF?

**eBPF (extended Berkeley Packet Filter)** is a revolutionary technology that allows you to run sandboxed programs in the Linux kernel without changing kernel source code or loading kernel modules.

!!! note "eBPF Origins"
    eBPF evolved from BPF (Berkeley Packet Filter), which was originally designed for network packet filtering. The "extended" version added more capabilities, making it a general-purpose kernel programming interface.

!!! tip "Key eBPF Features"
    - **Safe**: Programs are verified before execution
    - **Fast**: Runs in kernel space with minimal overhead
    - **Flexible**: Can attach to various kernel events
    - **No Kernel Recompilation**: Load programs dynamically

## Why eBPF Matters

### Traditional Approach Problems

**Before eBPF:**
- Need to modify kernel source code
- Recompile and reboot kernel
- Risk of system crashes
- Difficult to maintain

**With eBPF:**
- Write programs in high-level languages
- Load dynamically without rebooting
- Safe execution with verification
- Easy to update and maintain

!!! success "eBPF Advantages"
    - **Performance**: Runs in kernel space, minimal overhead
    - **Safety**: Verifier ensures programs won't crash the kernel
    - **Flexibility**: Attach to various kernel hooks
    - **Observability**: Deep visibility into system behavior
    - **Security**: Can enforce security policies at kernel level

## eBPF Use Cases

### 1. System Monitoring

Monitor system calls, file operations, and process events:

```c
// Example: Trace all open() system calls
SEC("tracepoint/syscalls/sys_enter_open")
int trace_open(struct trace_event_raw_sys_enter *ctx) {
    char filename[256];
    bpf_probe_read_user_str(filename, sizeof(filename), 
                           (void *)ctx->args[0]);
    bpf_printk("File opened: %s", filename);
    return 0;
}
```

### 2. Network Tracing

Analyze network packets, trace connections, and monitor traffic:

```c
// Example: Count packets by protocol
SEC("xdp")
int xdp_prog(struct xdp_md *ctx) {
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;
    struct ethhdr *eth = data;
    
    if (eth + 1 > data_end) return XDP_DROP;
    
    // Process packet...
    return XDP_PASS;
}
```

### 3. Security & Enforcement

Enforce security policies, detect threats, and prevent attacks:

```c
// Example: Block unauthorized file access
SEC("kprobe/vfs_open")
int kprobe_vfs_open(struct pt_regs *ctx) {
    // Check permissions
    // Block if unauthorized
    return 0;
}
```

### 4. Performance Profiling

Profile CPU, memory, and I/O to identify bottlenecks:

```c
// Example: Profile CPU usage
SEC("perf_event")
int profile_cpu(struct bpf_perf_event_data *ctx) {
    // Collect CPU metrics
    return 0;
}
```

## eBPF Ecosystem

### Core Components

1. **eBPF Runtime**: Kernel subsystem that executes eBPF programs
2. **eBPF Verifier**: Ensures programs are safe to run
3. **eBPF Maps**: Data structures for kernel-userspace communication
4. **Helper Functions**: Kernel functions accessible to eBPF programs

### Tools & Libraries

- **BCC (BPF Compiler Collection)**: High-level tools and libraries
- **libbpf**: Modern library for eBPF development
- **bpftool**: Command-line utility for eBPF
- **Cilium**: eBPF-based networking and security

!!! tip "Choosing Tools"
    - **BCC**: Great for beginners, Python bindings
    - **libbpf**: Modern, recommended for production
    - **bpftool**: Essential for debugging and inspection

## Real-World Applications

### Companies Using eBPF

- **Netflix**: Network monitoring and security
- **Facebook**: Performance profiling and debugging
- **Google**: Container security and networking
- **Cloudflare**: DDoS protection and performance
- **Cilium**: Kubernetes networking and security

### Popular eBPF Projects

- **Cilium**: Kubernetes CNI using eBPF
- **Falco**: Runtime security monitoring
- **BCC Tools**: Collection of eBPF-based tools
- **bpftrace**: High-level tracing language
- **Katran**: Load balancer using XDP

## Course Structure

This course is organized into five parts:

### Part 1: Fundamentals (Chapters 1-3)
- Introduction, architecture, development environment

### Part 2: Core Concepts (Chapters 4-6)
- Programs, maps, helper functions

### Part 3: Practical Examples (Chapters 7-10)
- Monitoring, networking, security, profiling

### Part 4: Advanced Topics (Chapters 11-13)
- XDP, BPF CO-RE, advanced techniques

### Part 5: Resources & Research (Chapters 14-17)
- Research papers, articles, tools, recommended reading

## Prerequisites

### Required Knowledge

- **C Programming**: Basic to intermediate C knowledge
- **Linux**: Familiarity with Linux command line
- **Kernel Concepts**: Understanding of kernel basics (helpful)

### Recommended

- Understanding of system calls
- Basic networking knowledge
- Experience with debugging tools

!!! note "Don't Worry if You're New"
    This course explains concepts from the ground up. Even if you're new to kernel programming, you'll learn everything you need.

## Development Environment

### Quick Setup

```bash
# Install build tools
sudo apt-get update
sudo apt-get install -y build-essential clang llvm

# Install kernel headers
sudo apt-get install -y linux-headers-$(uname -r)

# Install libbpf
sudo apt-get install -y libbpf-dev

# Install BCC (optional, for tools)
sudo apt-get install -y bpfcc-tools
```

### Verify Installation

```bash
# Check kernel version (4.18+ recommended)
uname -r

# Check for eBPF support
ls /sys/fs/bpf

# Test bpftool
bpftool version
```

## Learning Approach

### Hands-On Learning

This course emphasizes practical, hands-on learning:

1. **Code Examples**: Every concept includes runnable code
2. **Step-by-Step**: Detailed explanations of each step
3. **Real Projects**: Build real-world eBPF tools
4. **Troubleshooting**: Learn to debug eBPF programs

### Resources Included

- **Research Papers**: Academic papers on eBPF
- **Articles**: Best blog posts and articles
- **Tools**: Complete tooling guide
- **Libraries**: Essential libraries and frameworks

!!! tip "Study Tips"
    1. **Code Along**: Type out all examples
    2. **Experiment**: Modify examples and see what happens
    3. **Read Papers**: Understand the theory
    4. **Join Community**: Engage with eBPF developers
    5. **Build Projects**: Create your own tools

## What You'll Build

Throughout this course, you'll build:

- System call tracer
- Network packet analyzer
- Security monitoring tool
- Performance profiler
- Custom eBPF-based tool

## Next Steps

Ready to dive in? Let's start with understanding the eBPF architecture:

1. **Next Chapter**: [eBPF Architecture](02-architecture)
2. **Set up environment**: Install required tools
3. **Start coding**: Hands-on practice is essential

---

**Key Takeaways:**
- eBPF allows safe kernel programming without kernel modifications
- Used for monitoring, networking, security, and profiling
- Growing ecosystem with powerful tools and libraries
- This course teaches through practical examples
- Resources include research papers and articles

---

**Next Lesson**: [eBPF Architecture](02-architecture)

