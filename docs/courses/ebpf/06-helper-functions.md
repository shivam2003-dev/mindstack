# Helper Functions

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔧 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand eBPF helper functions</li>
    <li>Learn common helper functions and their usage</li>
    <li>Use helpers for kernel and user space access</li>
    <li>Work with time, process, and system information</li>
    <li>Understand helper function restrictions</li>
  </ul>
</div>

## Introduction

Helper functions are kernel functions that eBPF programs can call safely. They provide access to kernel functionality while maintaining safety guarantees.

!!! note "Helper Function Safety"
    All helper functions are carefully vetted. They cannot crash the kernel or cause security issues.

## Categories of Helpers

### 1. Kernel Function Helpers

Access kernel functions safely:

```c
// Read kernel memory
long bpf_probe_read_kernel(void *dst, u32 size, const void *unsafe_ptr);
long bpf_probe_read_kernel_str(void *dst, u32 size, const void *unsafe_ptr);

// Read user space memory
long bpf_probe_read_user(void *dst, u32 size, const void *unsafe_ptr);
long bpf_probe_read_user_str(void *dst, u32 size, const void *unsafe_ptr);

// Example
char filename[256];
bpf_probe_read_user_str(filename, sizeof(filename), (char *)ctx->filename);
```

### 2. Process Information Helpers

Get current process/thread information:

```c
// Get PID and TID
u64 bpf_get_current_pid_tgid(void);
// Returns: (pid << 32) | tid

// Get UID and GID
u64 bpf_get_current_uid_gid(void);
// Returns: (uid << 32) | gid

// Get task struct pointer
struct task_struct *bpf_get_current_task(void);

// Get task comm (process name)
long bpf_get_current_comm(void *buf, u32 size_of_buf);

// Example
u32 pid = bpf_get_current_pid_tgid() >> 32;
u32 tid = bpf_get_current_pid_tgid();
char comm[16];
bpf_get_current_comm(comm, sizeof(comm));
```

### 3. Time Helpers

Get time information:

```c
// Get kernel time in nanoseconds
u64 bpf_ktime_get_ns(void);

// Get boot time
u64 bpf_ktime_get_boot_ns(void);

// Get CPU ID
u32 bpf_get_smp_processor_id(void);

// Example
u64 timestamp = bpf_ktime_get_ns();
u32 cpu = bpf_get_smp_processor_id();
```

### 4. Map Operation Helpers

Work with maps:

```c
// Lookup element
void *bpf_map_lookup_elem(struct bpf_map *map, const void *key);

// Update element
long bpf_map_update_elem(struct bpf_map *map, const void *key, 
                         const void *value, u64 flags);

// Delete element
long bpf_map_delete_elem(struct bpf_map *map, const void *key);

// Get next key (for iteration)
long bpf_map_get_next_key(struct bpf_map *map, const void *key, void *next_key);
```

### 5. Output Helpers

Send data to user space:

```c
// Print to trace buffer
long bpf_trace_printk(const char *fmt, u32 fmt_size, ...);

// Perf event output
long bpf_perf_event_output(void *ctx, struct bpf_map *map, u64 flags,
                           void *data, u64 size);

// Ring buffer output
void *bpf_ringbuf_reserve(struct bpf_map *map, u64 size, u64 flags);
void bpf_ringbuf_submit(void *data, u64 flags);
```

### 6. Network Helpers

For network programs:

```c
// Load bytes from packet
long bpf_skb_load_bytes(const struct sk_buff *skb, u32 offset,
                        void *to, u32 len);

// Store bytes to packet
long bpf_skb_store_bytes(const struct sk_buff *skb, u32 offset,
                         const void *from, u32 len, u64 flags);

// Adjust packet head
long bpf_xdp_adjust_head(struct xdp_md *xdp_md, int delta);

// Get socket cookie
u64 bpf_get_socket_cookie(struct sk_buff *skb);
```

## Practical Examples

### Example 1: Process Monitor

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} process_start_time SEC(".maps");

SEC("tracepoint/sched/sched_process_exec")
int trace_exec(struct trace_event_raw_sched_process_exec *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 start_time = bpf_ktime_get_ns();
    char comm[16];
    
    bpf_get_current_comm(comm, sizeof(comm));
    bpf_map_update_elem(&process_start_time, &pid, &start_time, BPF_ANY);
    
    bpf_printk("Process %s (PID: %d) started", comm, pid);
    return 0;
}
```

### Example 2: System Call Tracer

```c
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u32 uid = bpf_get_current_uid_gid() >> 32;
    char comm[16];
    char filename[256];
    
    bpf_get_current_comm(comm, sizeof(comm));
    
    // Read filename from syscall arguments
    if (ctx->args[1]) {
        bpf_probe_read_user_str(filename, sizeof(filename), 
                                (char *)ctx->args[1]);
    }
    
    bpf_printk("PID: %d, UID: %d, Comm: %s, File: %s", 
               pid, uid, comm, filename);
    return 0;
}
```

## Helper Function Restrictions

### Program Type Restrictions

Different program types have access to different helpers:

```c
// XDP programs can use:
bpf_xdp_adjust_head()
bpf_xdp_adjust_meta()
bpf_xdp_adjust_tail()

// Socket programs can use:
bpf_get_socket_cookie()
bpf_get_socket_uid()

// Tracing programs can use:
bpf_probe_read_kernel()
bpf_probe_read_user()
bpf_get_current_task()
```

!!! warning "Helper Availability"
    Not all helpers are available to all program types. Check kernel documentation for your specific program type.

## Best Practices

!!! success "Using Helpers Effectively"
    1. **Check return values**: Always validate helper function returns
    2. **Use appropriate helpers**: Choose helpers that match your program type
    3. **Handle errors**: Helper functions can fail - handle gracefully
    4. **Minimize calls**: Cache results when possible
    5. **Use safe memory access**: Always use probe_read helpers for unsafe pointers

## Summary

!!! tip "Key Takeaways"
    - Helper functions provide safe kernel API access
    - Different program types have different helper access
    - Always check return values
    - Use probe_read helpers for unsafe memory access
    - Time helpers provide nanosecond precision
    - Process helpers identify current execution context

**Next Steps:**
- Build system monitoring tools (Chapter 7)
- Implement network tracing (Chapter 8)
- Create security tools (Chapter 9)

---

**Previous**: [Maps & Data Structures](05-maps-data-structures)  
**Next**: [System Monitoring](07-system-monitoring)

