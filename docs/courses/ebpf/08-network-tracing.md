# Network Tracing

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🌐 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Trace network packets and connections</li>
    <li>Monitor network performance</li>
    <li>Analyze network protocols</li>
    <li>Build network debugging tools</li>
    <li>Implement packet filtering and analysis</li>
  </ul>
</div>

## Introduction

eBPF is powerful for network tracing because it can inspect packets at various points in the network stack with minimal overhead.

!!! note "Network Tracing Points"
    - XDP: Earliest point, before kernel networking
    - TC: Traffic control, can modify packets
    - Socket: Application-level network operations
    - Tracepoints: Stable kernel instrumentation

## XDP Packet Tracing

### Basic XDP Program

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/if_ether.h>
#include <linux/ip.h>

SEC("xdp")
int xdp_trace(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    
    // Check bounds
    if ((void *)(eth + 1) > data_end) {
        return XDP_DROP;
    }
    
    // Check Ethernet type
    if (eth->h_proto != __constant_htons(ETH_P_IP)) {
        return XDP_PASS;
    }
    
    // Check IP header bounds
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) {
        return XDP_DROP;
    }
    
    bpf_printk("Packet: %pI4 -> %pI4, Protocol: %d", 
               &ip->saddr, &ip->daddr, ip->protocol);
    
    return XDP_PASS;
}

char LICENSE[] SEC("license") = "GPL";
```

## Connection Tracking

### TCP Connection Monitor

```c
struct connection {
    u32 saddr;
    u32 daddr;
    u16 sport;
    u16 dport;
    u64 bytes_sent;
    u64 bytes_recv;
    u64 start_time;
};

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, struct connection);
    __type(value, struct connection);
} connections SEC(".maps");

SEC("kprobe/tcp_v4_connect")
int trace_connect(struct pt_regs *ctx) {
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    struct connection conn = {};
    
    // Extract connection info from socket
    bpf_probe_read_kernel(&conn.saddr, sizeof(conn.saddr), 
                          &sk->__sk_common.skc_rcv_saddr);
    bpf_probe_read_kernel(&conn.daddr, sizeof(conn.daddr),
                          &sk->__sk_common.skc_daddr);
    
    conn.start_time = bpf_ktime_get_ns();
    bpf_map_update_elem(&connections, &conn, &conn, BPF_ANY);
    
    return 0;
}
```

## Packet Analysis

### HTTP Request Parser

```c
SEC("xdp")
int parse_http(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    struct tcphdr *tcp;
    char *http;
    
    // Parse headers (simplified)
    if ((void *)(eth + 1) > data_end) return XDP_PASS;
    if (eth->h_proto != __constant_htons(ETH_P_IP)) return XDP_PASS;
    
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_PASS;
    if (ip->protocol != IPPROTO_TCP) return XDP_PASS;
    
    tcp = (struct tcphdr *)((char *)ip + (ip->ihl * 4));
    if ((void *)(tcp + 1) > data_end) return XDP_PASS;
    
    // Check for HTTP
    http = (char *)(tcp + 1);
    if ((void *)(http + 4) > data_end) return XDP_PASS;
    
    if (http[0] == 'G' && http[1] == 'E' && http[2] == 'T') {
        bpf_printk("HTTP GET request detected");
    }
    
    return XDP_PASS;
}
```

## Network Performance Monitoring

### Latency Measurement

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u64);  // Socket cookie
    __type(value, u64);  // Timestamp
} socket_timestamps SEC(".maps");

SEC("kprobe/tcp_sendmsg")
int trace_send_start(struct pt_regs *ctx) {
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    u64 cookie = bpf_get_socket_cookie(sk);
    u64 now = bpf_ktime_get_ns();
    
    bpf_map_update_elem(&socket_timestamps, &cookie, &now, BPF_ANY);
    return 0;
}

SEC("kretprobe/tcp_sendmsg")
int trace_send_end(struct pt_regs *ctx) {
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    u64 cookie = bpf_get_socket_cookie(sk);
    u64 *start_time, now = bpf_ktime_get_ns();
    
    start_time = bpf_map_lookup_elem(&socket_timestamps, &cookie);
    if (start_time) {
        u64 latency = now - *start_time;
        bpf_printk("Send latency: %llu ns", latency);
    }
    
    return 0;
}
```

## Best Practices

!!! success "Network Tracing Tips"
    1. **Use XDP for early packet processing**
    2. **Check packet bounds carefully**
    3. **Use socket cookies for connection tracking**
    4. **Minimize packet processing overhead**
    5. **Filter packets early in the pipeline**

**Next Steps:**
- Learn security enforcement (Chapter 9)
- Profile performance (Chapter 10)
- Master XDP programming (Chapter 11)

---

**Previous**: [System Monitoring](07-system-monitoring)  
**Next**: [Security & Enforcement](09-security-enforcement)
