# Performance Profiling

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">⚡ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Profile CPU performance with eBPF</li>
    <li>Monitor memory usage and allocations</li>
    <li>Track I/O performance</li>
    <li>Analyze application bottlenecks</li>
    <li>Build custom profiling tools</li>
  </ul>
</div>

## Introduction

eBPF enables detailed performance profiling with minimal overhead, making it ideal for production performance analysis.

!!! tip "Profiling Advantages"
    - Low overhead: Typically <1% CPU
    - Real-time: Immediate insights
    - Comprehensive: Access to all kernel events
    - Flexible: Custom profiling logic

## CPU Profiling

### Stack Trace Profiler

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct {
    __uint(type, BPF_MAP_TYPE_STACK_TRACE);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u64) * 127);
} stack_traces SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, u32);  // Stack ID
    __type(value, u64);  // Count
} stack_counts SEC(".maps");

SEC("perf_event")
int profile_cpu(struct bpf_perf_event_data *ctx) {
    u32 stack_id = bpf_get_stackid(ctx, &stack_traces, 
                                    BPF_F_USER_STACK);
    u64 *count, zero = 0, one = 1;
    
    count = bpf_map_lookup_elem(&stack_counts, &stack_id);
    if (!count) {
        bpf_map_update_elem(&stack_counts, &stack_id, &zero, BPF_NOEXIST);
        count = bpf_map_lookup_elem(&stack_counts, &stack_id);
    }
    if (count) {
        __sync_fetch_and_add(count, 1);
    }
    
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

## Memory Profiling

### Allocation Tracker

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);  // PID
    __type(value, u64);  // Total allocated
} memory_usage SEC(".maps");

SEC("kprobe/kmalloc")
int trace_kmalloc(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 size = PT_REGS_PARM1(ctx);
    u64 *total, zero = 0;
    
    total = bpf_map_lookup_elem(&memory_usage, &pid);
    if (!total) {
        bpf_map_update_elem(&memory_usage, &pid, &zero, BPF_NOEXIST);
        total = bpf_map_lookup_elem(&memory_usage, &pid);
    }
    if (total) {
        __sync_fetch_and_add(total, size);
    }
    
    return 0;
}

SEC("kprobe/kfree")
int trace_kfree(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    void *ptr = (void *)PT_REGS_PARM1(ctx);
    u64 *total;
    
    // Note: Getting size from kfree requires additional logic
    total = bpf_map_lookup_elem(&memory_usage, &pid);
    // Deallocation tracking would go here
    
    return 0;
}
```

## I/O Profiling

### Disk I/O Monitor

```c
struct io_event {
    u32 pid;
    u64 bytes;
    u64 latency;
    u64 timestamp;
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} io_events SEC(".maps");

SEC("kprobe/blk_start_request")
int trace_io_start(struct pt_regs *ctx) {
    struct request *req = (struct request *)PT_REGS_PARM1(ctx);
    u64 cookie = (u64)req;
    u64 now = bpf_ktime_get_ns();
    
    // Store start time (simplified)
    return 0;
}

SEC("kprobe/blk_mq_end_request")
int trace_io_end(struct pt_regs *ctx) {
    struct io_event *event;
    u64 latency = bpf_ktime_get_ns();
    
    event = bpf_ringbuf_reserve(&io_events, sizeof(*event), 0);
    if (event) {
        event->pid = bpf_get_current_pid_tgid() >> 32;
        event->timestamp = latency;
        bpf_ringbuf_submit(event, 0);
    }
    
    return 0;
}
```

## Function Latency Profiling

### Function Entry/Exit Tracker

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u64);  // Function address
    __type(value, u64);  // Start time
} function_starts SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u64);
    __type(value, struct {
        u64 total_time;
        u64 count;
    });
} function_stats SEC(".maps");

SEC("kprobe/do_sys_openat2")
int trace_entry(struct pt_regs *ctx) {
    u64 func_addr = (u64)PT_REGS_IP(ctx);
    u64 now = bpf_ktime_get_ns();
    
    bpf_map_update_elem(&function_starts, &func_addr, &now, BPF_ANY);
    return 0;
}

SEC("kretprobe/do_sys_openat2")
int trace_exit(struct pt_regs *ctx) {
    u64 func_addr = (u64)PT_REGS_IP(ctx);
    u64 *start_time;
    u64 now = bpf_ktime_get_ns();
    
    start_time = bpf_map_lookup_elem(&function_starts, &func_addr);
    if (start_time) {
        u64 duration = now - *start_time;
        struct {
            u64 total_time;
            u64 count;
        } *stats, zero = {};
        
        stats = bpf_map_lookup_elem(&function_stats, &func_addr);
        if (!stats) {
            bpf_map_update_elem(&function_stats, &func_addr, &zero, BPF_NOEXIST);
            stats = bpf_map_lookup_elem(&function_stats, &func_addr);
        }
        if (stats) {
            __sync_fetch_and_add(&stats->total_time, duration);
            __sync_fetch_and_add(&stats->count, 1);
        }
    }
    
    return 0;
}
```

## Best Practices

!!! success "Profiling Best Practices"
    1. **Minimize overhead**: Use sampling for high-frequency events
    2. **Aggregate in kernel**: Reduce user space processing
    3. **Use appropriate maps**: Per-CPU maps for counters
    4. **Filter early**: Only profile what you need
    5. **Handle errors**: Check all map operations

**Next Steps:**
- Learn XDP programming (Chapter 11)
- Understand BPF CO-RE (Chapter 12)
- Master advanced techniques (Chapter 13)

---

**Previous**: [Security & Enforcement](09-security-enforcement)  
**Next**: [XDP Programming](11-xdp-programming)

