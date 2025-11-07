# System Monitoring

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">📊 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Monitor system calls and events</li>
    <li>Track process execution and lifecycle</li>
    <li>Monitor file system operations</li>
    <li>Build real-time monitoring tools</li>
    <li>Collect and analyze system metrics</li>
  </ul>
</div>

## Introduction

eBPF excels at system monitoring because it can observe kernel events with minimal overhead. This chapter shows how to build monitoring tools for system calls, processes, and file operations.

!!! tip "Monitoring Advantages"
    - Low overhead: Runs in kernel space
    - Real-time: Immediate event capture
    - Comprehensive: Access to all kernel events
    - Safe: Verified before execution

## Monitoring System Calls

### Basic System Call Tracer

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} syscall_count SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 *count, zero = 0, one = 1;
    
    count = bpf_map_lookup_elem(&syscall_count, &pid);
    if (!count) {
        bpf_map_update_elem(&syscall_count, &pid, &zero, BPF_NOEXIST);
        count = bpf_map_lookup_elem(&syscall_count, &pid);
    }
    if (count) {
        __sync_fetch_and_add(count, 1);
    }
    
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

### Advanced: System Call with Arguments

```c
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat_args(struct trace_event_raw_sys_enter *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    char comm[16];
    char filename[256] = {};
    
    bpf_get_current_comm(comm, sizeof(comm));
    
    // Read filename from syscall arguments
    if (ctx->args[1]) {
        bpf_probe_read_user_str(filename, sizeof(filename), 
                                (char *)ctx->args[1]);
    }
    
    bpf_printk("PID: %d, Comm: %s, File: %s", pid, comm, filename);
    return 0;
}
```

## Process Monitoring

### Process Execution Monitor

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, u32);
    __type(value, struct {
        char comm[16];
        u64 start_time;
        u32 pid;
    });
} processes SEC(".maps");

SEC("tracepoint/sched/sched_process_exec")
int trace_exec(struct trace_event_raw_sched_process_exec *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    struct {
        char comm[16];
        u64 start_time;
        u32 pid;
    } proc = {};
    
    bpf_get_current_comm(proc.comm, sizeof(proc.comm));
    proc.start_time = bpf_ktime_get_ns();
    proc.pid = pid;
    
    bpf_map_update_elem(&processes, &pid, &proc, BPF_ANY);
    bpf_printk("Process started: %s (PID: %d)", proc.comm, pid);
    
    return 0;
}

SEC("tracepoint/sched/sched_process_exit")
int trace_exit(struct trace_event_raw_sched_process_exit *ctx) {
    u32 pid = ctx->pid;
    struct {
        char comm[16];
        u64 start_time;
        u32 pid;
    } *proc;
    
    proc = bpf_map_lookup_elem(&processes, &pid);
    if (proc) {
        u64 duration = bpf_ktime_get_ns() - proc->start_time;
        bpf_printk("Process exited: %s (PID: %d, Duration: %llu ns)", 
                   proc->comm, pid, duration);
        bpf_map_delete_elem(&processes, &pid);
    }
    
    return 0;
}
```

## File System Monitoring

### File Open Monitor

```c
struct file_event {
    u32 pid;
    u32 uid;
    char comm[16];
    char filename[256];
    u64 timestamp;
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} file_events SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int trace_file_open(struct trace_event_raw_sys_enter *ctx) {
    struct file_event *event;
    
    event = bpf_ringbuf_reserve(&file_events, sizeof(*event), 0);
    if (!event) {
        return 0;
    }
    
    event->pid = bpf_get_current_pid_tgid() >> 32;
    event->uid = bpf_get_current_uid_gid() >> 32;
    event->timestamp = bpf_ktime_get_ns();
    
    bpf_get_current_comm(event->comm, sizeof(event->comm));
    
    if (ctx->args[1]) {
        bpf_probe_read_user_str(event->filename, sizeof(event->filename),
                                (char *)ctx->args[1]);
    }
    
    bpf_ringbuf_submit(event, 0);
    return 0;
}
```

## CPU and Performance Monitoring

### CPU Usage Monitor

```c
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} cpu_time SEC(".maps");

SEC("tracepoint/sched/sched_switch")
int trace_sched_switch(struct trace_event_raw_sched_switch *ctx) {
    u32 prev_pid = ctx->prev_pid;
    u32 next_pid = ctx->next_pid;
    u64 *time, zero = 0;
    u64 now = bpf_ktime_get_ns();
    
    // Account time for previous process
    if (prev_pid) {
        time = bpf_map_lookup_elem(&cpu_time, &prev_pid);
        if (!time) {
            bpf_map_update_elem(&cpu_time, &prev_pid, &zero, BPF_NOEXIST);
            time = bpf_map_lookup_elem(&cpu_time, &prev_pid);
        }
        if (time) {
            __sync_fetch_and_add(time, now - ctx->prev_state);
        }
    }
    
    return 0;
}
```

## Memory Monitoring

### Memory Allocation Tracker

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} memory_allocated SEC(".maps");

SEC("kprobe/kmalloc")
int trace_kmalloc(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 size = PT_REGS_PARM1(ctx);
    u64 *total, zero = 0;
    
    total = bpf_map_lookup_elem(&memory_allocated, &pid);
    if (!total) {
        bpf_map_update_elem(&memory_allocated, &pid, &zero, BPF_NOEXIST);
        total = bpf_map_lookup_elem(&memory_allocated, &pid);
    }
    if (total) {
        __sync_fetch_and_add(total, size);
    }
    
    return 0;
}
```

## Network Monitoring

### Socket Monitor

```c
struct socket_event {
    u32 pid;
    u32 uid;
    char comm[16];
    u64 timestamp;
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} socket_events SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_socket")
int trace_socket(struct trace_event_raw_sys_enter *ctx) {
    struct socket_event *event;
    
    event = bpf_ringbuf_reserve(&socket_events, sizeof(*event), 0);
    if (!event) {
        return 0;
    }
    
    event->pid = bpf_get_current_pid_tgid() >> 32;
    event->uid = bpf_get_current_uid_gid() >> 32;
    event->timestamp = bpf_ktime_get_ns();
    bpf_get_current_comm(event->comm, sizeof(event->comm));
    
    bpf_ringbuf_submit(event, 0);
    return 0;
}
```

## Best Practices

!!! success "Monitoring Best Practices"
    1. **Use appropriate map types**: Per-CPU maps for high-frequency events
    2. **Ring buffers for events**: Lower overhead than perf buffers
    3. **Filter early**: Reduce data collection overhead
    4. **Aggregate in kernel**: Minimize user space processing
    5. **Handle errors**: Check all map operations
    6. **Use atomic operations**: For concurrent updates

## Summary

!!! tip "Key Takeaways"
    - eBPF provides low-overhead system monitoring
    - Tracepoints are stable and recommended
    - Use ring buffers for event streaming
    - Per-CPU maps improve performance
    - Aggregate data in kernel when possible

**Next Steps:**
- Learn network tracing (Chapter 8)
- Build security tools (Chapter 9)
- Profile applications (Chapter 10)

---

**Previous**: [Helper Functions](06-helper-functions)  
**Next**: [Network Tracing](08-network-tracing)

