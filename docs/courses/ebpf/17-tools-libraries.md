# Tools & Libraries

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🛠️ Essential eBPF Tools & Libraries</h2>
  <p style="margin: 1rem 0 0 0;">Comprehensive collection of tools, libraries, and frameworks for eBPF development.</p>
</div>

## Core Libraries

???+ "libbpf"
    1. [libbpf](https://github.com/libbpf/libbpf) - Official eBPF library
    2. [libbpf-rs](https://github.com/libbpf/libbpf-rs) - Rust bindings
    3. [libbpf-go](https://github.com/cilium/ebpf) - Go bindings

???+ "BCC (BPF Compiler Collection)"
    1. [BCC](https://github.com/iovisor/bcc) - Tools and Python bindings
    2. [BCC Tools](https://github.com/iovisor/bcc/tree/master/tools) - Pre-built tools
    3. [BCC Python API](https://github.com/iovisor/bcc/blob/master/docs/reference_guide.md) - Python reference

## Development Tools

???+ "bpftool"
    1. [bpftool](https://github.com/libbpf/bpftool) - Official BPF tool
    2. [bpftool Documentation](https://www.mankier.com/8/bpftool) - Manual pages
    3. [bpftool Examples](https://github.com/libbpf/bpftool/tree/master/examples) - Usage examples

???+ "Compiler Tools"
    1. [clang](https://clang.llvm.org/) - eBPF compiler
    2. [llvm](https://llvm.org/) - Compiler infrastructure
    3. [BTF Generator](https://github.com/libbpf/btf) - BTF tools

## Monitoring Tools

???+ "Observability Tools"
    1. [bpftrace](https://github.com/iovisor/bpftrace) - High-level tracing language
    2. [kubectl-trace](https://github.com/iovisor/kubectl-trace) - Kubernetes tracing
    3. [Falco](https://falco.org/) - Security monitoring with eBPF

???+ "Performance Tools"
    1. [perf](https://perf.wiki.kernel.org/) - Linux performance tools
    2. [FlameGraph](https://github.com/brendangregg/FlameGraph) - Performance visualization
    3. [BCC Tools](https://github.com/iovisor/bcc/tree/master/tools) - Performance analysis

## Networking Tools

???+ "XDP Tools"
    1. [XDP Tools](https://github.com/xdp-project/xdp-tools) - XDP utilities
    2. [Cilium](https://cilium.io/) - eBPF-based networking
    3. [Katran](https://github.com/facebookincubator/katran) - Facebook's load balancer

???+ "Network Monitoring"
    1. [Pixie](https://pixielabs.ai/) - Kubernetes observability
    2. [Cilium Hubble](https://github.com/cilium/hubble) - Network observability
    3. [Flowmill](https://github.com/Flowmill) - Network flow monitoring

## Security Tools

???+ "Security Frameworks"
    1. [Falco](https://falco.org/) - Runtime security
    2. [Tetragon](https://github.com/cilium/tetragon) - Security observability
    3. [Tracee](https://github.com/aquasecurity/tracee) - Runtime security

## Language Bindings

???+ "Python"
    1. [BCC Python](https://github.com/iovisor/bcc) - BCC Python bindings
    2. [redbpf](https://github.com/foniod/redbpf) - Rust eBPF for Python

???+ "Go"
    1. [cilium/ebpf](https://github.com/cilium/ebpf) - Pure Go eBPF library
    2. [libbpf-go](https://github.com/aquasecurity/libbpfgo) - Go libbpf bindings

???+ "Rust"
    1. [libbpf-rs](https://github.com/libbpf/libbpf-rs) - Rust libbpf bindings
    2. [redbpf](https://github.com/foniod/redbpf) - Rust eBPF toolkit

## Testing & Debugging

???+ "Testing Tools"
    1. [bpf-test](https://github.com/libbpf/libbpf/tree/master/src) - Test framework
    2. [vmtest](https://github.com/libbpf/vmtest) - VM-based testing

???+ "Debugging Tools"
    1. [bpftool](https://github.com/libbpf/bpftool) - Program inspection
    2. [verifier logs](https://www.kernel.org/doc/html/latest/bpf/verifier.html) - Verifier debugging

## Best Practices

!!! success "Tool Selection"
    1. **libbpf**: For production, CO-RE support
    2. **BCC**: For rapid prototyping, Python
    3. **bpftrace**: For ad-hoc tracing
    4. **bpftool**: For program management

---

**Previous**: [Recommended Reading](16-recommended-reading)  
**Back to**: [Course Overview](README)

