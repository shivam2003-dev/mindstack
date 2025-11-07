# Advanced Techniques

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎓 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master advanced eBPF patterns</li>
    <li>Optimize eBPF program performance</li>
    <li>Use tail calls effectively</li>
    <li>Implement complex logic with eBPF</li>
    <li>Debug and troubleshoot advanced programs</li>
  </ul>
</div>

## Tail Calls

Tail calls allow chaining eBPF programs for complex logic.

### Tail Call Example

```c
struct {
    __uint(type, BPF_MAP_TYPE_PROG_ARRAY);
    __uint(max_entries, 10);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u32));
} prog_array SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int entry_prog(struct trace_event_raw_sys_enter *ctx) {
    u32 index = 0;
    
    // Tail call to handler
    bpf_tail_call(ctx, &prog_array, index);
    
    // Fallback if tail call fails
    return 0;
}

SEC("tracepoint/syscalls/sys_enter_openat")
int handler_prog(struct trace_event_raw_sys_enter *ctx) {
    // Handle the event
    bpf_printk("Handled by tail call");
    return 0;
}
```

## Bounded Loops

Modern kernels support bounded loops.

### Loop Example

```c
SEC("xdp")
int process_packet(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct iphdr *ip = data;
    u32 i;
    
    // Bounded loop (kernel 5.3+)
    #pragma unroll
    for (i = 0; i < 4; i++) {
        if ((void *)(ip + 1) > data_end) {
            return XDP_DROP;
        }
        // Process IP options
    }
    
    return XDP_PASS;
}
```

## Map-in-Map

Nested maps for complex data structures.

```c
// Inner map
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10);
    __type(key, u32);
    __type(value, u64);
} inner_map SEC(".maps");

// Outer map (map of maps)
struct {
    __uint(type, BPF_MAP_TYPE_HASH_OF_MAPS);
    __uint(max_entries, 10);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u32));
    __array(values, typeof(inner_map));
} outer_map SEC(".maps") = {
    .values = {
        [0] = &inner_map,
    },
};
```

## Performance Optimization

### Minimize Map Lookups

```c
// Bad: Multiple lookups
u64 *val1 = bpf_map_lookup_elem(&map, &key1);
u64 *val2 = bpf_map_lookup_elem(&map, &key2);

// Good: Cache when possible
u64 cached_value = 0;
if (some_condition) {
    u64 *val = bpf_map_lookup_elem(&map, &key);
    if (val) {
        cached_value = *val;
    }
}
```

### Use Per-CPU Maps

```c
// For high-frequency updates
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} per_cpu_counter SEC(".maps");
```

## Advanced Debugging

### Verifier Debugging

```bash
# Enable verifier logs
sudo bpftool prog load program.o /sys/fs/bpf/prog verbose

# Check verifier output
sudo dmesg | tail -100
```

### Program Inspection

```bash
# Dump program bytecode
sudo bpftool prog dump xlated id <prog_id>

# Dump JIT code
sudo bpftool prog dump jited id <prog_id>

# Show program stats
sudo bpftool prog show id <prog_id>
```

## Best Practices

!!! success "Advanced Techniques"
    1. **Use tail calls**: For complex logic
    2. **Optimize hot paths**: Minimize map operations
    3. **Use appropriate data structures**: Choose right map types
    4. **Handle errors**: Always check return values
    5. **Test thoroughly**: Verify on target kernels

**Next Steps:**
- Review research papers (Chapter 14)
- Read articles and blogs (Chapter 15)
- Explore recommended reading (Chapter 16)
- Check out tools and libraries (Chapter 17)

---

**Previous**: [BPF CO-RE](12-bpf-core)  
**Next**: [Research Papers](14-research-papers)

