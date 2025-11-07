# Security & Enforcement

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔒 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Implement security monitoring with eBPF</li>
    <li>Enforce security policies at kernel level</li>
    <li>Detect suspicious activities</li>
    <li>Monitor file access and system calls</li>
    <li>Build intrusion detection systems</li>
  </ul>
</div>

## Introduction

eBPF enables powerful security monitoring and enforcement capabilities by observing kernel events in real-time with minimal overhead.

!!! warning "Security Considerations"
    eBPF security tools run with kernel privileges. Ensure proper access controls and validation.

## File Access Monitoring

### Sensitive File Monitor

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

struct file_access_event {
    u32 pid;
    u32 uid;
    char comm[16];
    char filename[256];
    u64 timestamp;
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} security_events SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int monitor_file_access(struct trace_event_raw_sys_enter *ctx) {
    struct file_access_event *event;
    char filename[256] = {};
    char sensitive[] = "/etc/passwd";
    
    if (ctx->args[1]) {
        bpf_probe_read_user_str(filename, sizeof(filename), 
                                (char *)ctx->args[1]);
        
        // Check for sensitive files
        for (int i = 0; i < sizeof(sensitive) - 1; i++) {
            if (filename[i] != sensitive[i]) {
                return 0;
            }
        }
        
        // Log access to sensitive file
        event = bpf_ringbuf_reserve(&security_events, sizeof(*event), 0);
        if (event) {
            event->pid = bpf_get_current_pid_tgid() >> 32;
            event->uid = bpf_get_current_uid_gid() >> 32;
            event->timestamp = bpf_ktime_get_ns();
            bpf_get_current_comm(event->comm, sizeof(event->comm));
            __builtin_memcpy(event->filename, filename, sizeof(filename));
            bpf_ringbuf_submit(event, 0);
        }
    }
    
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

## System Call Filtering

### Block Unauthorized System Calls

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);  // UID
    __type(value, u64);  // Allowed syscalls bitmap
} allowed_syscalls SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int filter_syscalls(struct trace_event_raw_sys_enter *ctx) {
    u32 uid = bpf_get_current_uid_gid() >> 32;
    u64 *allowed;
    u64 syscall_nr = ctx->id;
    
    allowed = bpf_map_lookup_elem(&allowed_syscalls, &uid);
    if (!allowed) {
        // Default: deny all
        bpf_printk("Blocked syscall %llu from UID %d", syscall_nr, uid);
        return -EPERM;
    }
    
    // Check if syscall is allowed
    if (!(*allowed & (1ULL << syscall_nr))) {
        bpf_printk("Blocked syscall %llu from UID %d", syscall_nr, uid);
        return -EPERM;
    }
    
    return 0;
}
```

## Process Monitoring

### Unauthorized Process Detection

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, char[16]);  // Process name
    __type(value, u8);  // Allowed flag
} allowed_processes SEC(".maps");

SEC("tracepoint/sched/sched_process_exec")
int monitor_process_exec(struct trace_event_raw_sched_process_exec *ctx) {
    char comm[16];
    u8 *allowed;
    
    bpf_get_current_comm(comm, sizeof(comm));
    allowed = bpf_map_lookup_elem(&allowed_processes, comm);
    
    if (!allowed || !*allowed) {
        u32 pid = bpf_get_current_pid_tgid() >> 32;
        u32 uid = bpf_get_current_uid_gid() >> 32;
        bpf_printk("ALERT: Unauthorized process: %s (PID: %d, UID: %d)", 
                   comm, pid, uid);
    }
    
    return 0;
}
```

## Network Security

### Connection Monitoring

```c
struct connection_alert {
    u32 saddr;
    u32 daddr;
    u16 sport;
    u16 dport;
    u32 pid;
    u64 timestamp;
};

struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);
} connection_alerts SEC(".maps");

SEC("kprobe/tcp_v4_connect")
int monitor_connections(struct pt_regs *ctx) {
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    struct connection_alert *alert;
    u32 daddr;
    
    bpf_probe_read_kernel(&daddr, sizeof(daddr), 
                          &sk->__sk_common.skc_daddr);
    
    // Check for suspicious destinations
    // (Example: block connections to specific IPs)
    if (daddr == 0x01010101) {  // 1.1.1.1
        alert = bpf_ringbuf_reserve(&connection_alerts, sizeof(*alert), 0);
        if (alert) {
            alert->pid = bpf_get_current_pid_tgid() >> 32;
            alert->timestamp = bpf_ktime_get_ns();
            bpf_probe_read_kernel(&alert->daddr, sizeof(alert->daddr),
                                  &sk->__sk_common.skc_daddr);
            bpf_ringbuf_submit(alert, 0);
        }
    }
    
    return 0;
}
```

## Best Practices

!!! success "Security Best Practices"
    1. **Least privilege**: Only monitor what's necessary
    2. **Logging**: Record security events for analysis
    3. **Performance**: Minimize overhead in hot paths
    4. **Validation**: Verify all inputs and map lookups
    5. **Testing**: Thoroughly test security policies

**Next Steps:**
- Learn performance profiling (Chapter 10)
- Master XDP programming (Chapter 11)
- Explore advanced techniques (Chapter 13)

---

**Previous**: [Network Tracing](08-network-tracing)  
**Next**: [Performance Profiling](10-performance-profiling)

