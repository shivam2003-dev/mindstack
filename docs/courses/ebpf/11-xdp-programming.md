# XDP Programming

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🚀 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand XDP (Express Data Path)</li>
    <li>Write high-performance XDP programs</li>
    <li>Process packets at line rate</li>
    <li>Implement DDoS protection</li>
    <li>Build load balancers with XDP</li>
  </ul>
</div>

## Introduction to XDP

XDP (Express Data Path) runs eBPF programs at the earliest point in the Linux kernel networking stack, before any kernel networking processing.

!!! note "XDP Performance"
    XDP can process packets at line rate (10M+ packets/second) with minimal CPU overhead.

## XDP Program Structure

### Basic XDP Program

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>

SEC("xdp")
int xdp_pass(struct xdp_md *ctx) {
    return XDP_PASS;
}

char LICENSE[] SEC("license") = "GPL";
```

### XDP Return Codes

```c
XDP_PASS    // Pass packet to kernel stack
XDP_DROP    // Drop packet
XDP_ABORTED // Error occurred
XDP_REDIRECT // Redirect to another interface/CPU
XDP_TX      // Transmit packet back out same interface
```

## Packet Parsing

### Parse Ethernet and IP Headers

```c
SEC("xdp")
int parse_packet(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    
    // Check Ethernet header bounds
    if ((void *)(eth + 1) > data_end) {
        return XDP_DROP;
    }
    
    // Check for IP
    if (eth->h_proto != __constant_htons(ETH_P_IP)) {
        return XDP_PASS;
    }
    
    // Check IP header bounds
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) {
        return XDP_DROP;
    }
    
    // Process IP packet
    bpf_printk("Packet: %pI4 -> %pI4", &ip->saddr, &ip->daddr);
    
    return XDP_PASS;
}
```

## DDoS Protection

### Rate Limiting

```c
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, 10000);
    __type(key, u32);  // Source IP
    __type(value, u64);  // Packet count
} rate_limit SEC(".maps");

SEC("xdp")
int ddos_protection(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    u64 *count, zero = 0, one = 1;
    u64 now = bpf_ktime_get_ns();
    
    if ((void *)(eth + 1) > data_end) return XDP_DROP;
    if (eth->h_proto != __constant_htons(ETH_P_IP)) return XDP_PASS;
    
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_DROP;
    
    // Rate limit per source IP
    count = bpf_map_lookup_elem(&rate_limit, &ip->saddr);
    if (!count) {
        bpf_map_update_elem(&rate_limit, &ip->saddr, &one, BPF_ANY);
        return XDP_PASS;
    }
    
    if (*count > 1000) {  // Threshold
        return XDP_DROP;
    }
    
    __sync_fetch_and_add(count, 1);
    return XDP_PASS;
}
```

## Load Balancing

### Simple Load Balancer

```c
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 10);
    __type(key, u32);
    __type(value, u32);  // Backend IP
} backends SEC(".maps");

SEC("xdp")
int load_balance(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    u32 backend_idx = 0;
    u32 *backend_ip;
    
    if ((void *)(eth + 1) > data_end) return XDP_DROP;
    if (eth->h_proto != __constant_htons(ETH_P_IP)) return XDP_PASS;
    
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_DROP;
    
    // Simple round-robin (in production, use hash)
    backend_ip = bpf_map_lookup_elem(&backends, &backend_idx);
    if (backend_ip) {
        // Rewrite destination IP
        ip->daddr = *backend_ip;
        // Recalculate checksum
        ip->check = 0;
        // Update checksum (simplified)
    }
    
    return XDP_PASS;
}
```

## Packet Modification

### Rewrite Packet Headers

```c
SEC("xdp")
int rewrite_packet(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    struct ethhdr *eth = data;
    struct iphdr *ip;
    
    if ((void *)(eth + 1) > data_end) return XDP_DROP;
    if (eth->h_proto != __constant_htons(ETH_P_IP)) return XDP_PASS;
    
    ip = (struct iphdr *)(eth + 1);
    if ((void *)(ip + 1) > data_end) return XDP_DROP;
    
    // Modify TTL
    if (ip->ttl > 1) {
        ip->ttl--;
        // Recalculate checksum
        ip->check = 0;
    }
    
    return XDP_PASS;
}
```

## Best Practices

!!! success "XDP Best Practices"
    1. **Check bounds**: Always validate packet boundaries
    2. **Early returns**: Drop invalid packets quickly
    3. **Minimize processing**: Keep programs simple and fast
    4. **Use appropriate maps**: LRU hash for rate limiting
    5. **Handle errors**: Return appropriate XDP codes

**Next Steps:**
- Learn BPF CO-RE (Chapter 12)
- Explore advanced techniques (Chapter 13)
- Review research papers (Chapter 14)

---

**Previous**: [Performance Profiling](10-performance-profiling)  
**Next**: [BPF CO-RE](12-bpf-core)

