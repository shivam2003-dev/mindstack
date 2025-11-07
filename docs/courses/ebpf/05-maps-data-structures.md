# Maps & Data Structures

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🗺️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand eBPF maps and their types</li>
    <li>Create and use maps in eBPF programs</li>
    <li>Share data between kernel and user space</li>
    <li>Use maps for inter-program communication</li>
    <li>Choose the right map type for your use case</li>
  </ul>
</div>

## Introduction to Maps

eBPF maps are key-value data structures that enable:
- **Kernel-User Space Communication**: Share data between eBPF programs and user space
- **Inter-Program Communication**: Share data between multiple eBPF programs
- **Persistent Storage**: Store data across program invocations

!!! note "Map Persistence"
    Maps persist as long as they're pinned or referenced. They survive program unloads if pinned to the BPF filesystem.

## Map Types

### 1. Hash Maps

**BPF_MAP_TYPE_HASH** - Standard hash table

```c
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} my_hash_map SEC(".maps");

// Usage
u32 key = 1;
u64 value = 100;
u64 *lookup_value;

// Insert
bpf_map_update_elem(&my_hash_map, &key, &value, BPF_ANY);

// Lookup
lookup_value = bpf_map_lookup_elem(&my_hash_map, &key);
if (lookup_value) {
    // Use *lookup_value
}

// Delete
bpf_map_delete_elem(&my_hash_map, &key);
```

### 2. Array Maps

**BPF_MAP_TYPE_ARRAY** - Fixed-size array

```c
struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 256);
    __type(key, u32);
    __type(value, u64);
} my_array_map SEC(".maps");

// Usage - key is array index
u32 index = 0;
u64 value = 42;
bpf_map_update_elem(&my_array_map, &index, &value, BPF_ANY);
```

!!! tip "Array vs Hash"
    - **Array**: Fixed size, O(1) access, key must be u32
    - **Hash**: Dynamic, O(1) average, any key type

### 3. Per-CPU Maps

**BPF_MAP_TYPE_PERCPU_HASH** - Per-CPU hash table

```c
struct {
    __uint(type, BPF_MAP_TYPE_PERCPU_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} per_cpu_map SEC(".maps");
```

**Benefits:**
- No locking needed (each CPU has its own copy)
- Better performance for high-frequency updates
- Aggregate values in user space

### 4. Ring Buffer

**BPF_MAP_TYPE_RINGBUF** - Modern event buffer (kernel 5.8+)

```c
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 256 * 1024);  // 256KB
} events SEC(".maps");

// Usage
struct event {
    u32 pid;
    u64 timestamp;
} *e;

e = bpf_ringbuf_reserve(&events, sizeof(*e), 0);
if (e) {
    e->pid = bpf_get_current_pid_tgid() >> 32;
    e->timestamp = bpf_ktime_get_ns();
    bpf_ringbuf_submit(e, 0);
}
```

!!! success "Ring Buffer Advantages"
    - Lower overhead than perf buffers
    - Better performance
    - Simpler API
    - Recommended for new code

### 5. Perf Event Array

**BPF_MAP_TYPE_PERF_EVENT_ARRAY** - Send events to user space

```c
struct {
    __uint(type, BPF_MAP_TYPE_PERF_EVENT_ARRAY);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u32));
} events SEC(".maps");

// Usage
struct {
    u32 pid;
    u64 timestamp;
} event = {
    .pid = bpf_get_current_pid_tgid() >> 32,
    .timestamp = bpf_ktime_get_ns(),
};

bpf_perf_event_output(ctx, &events, BPF_F_CURRENT_CPU, &event, sizeof(event));
```

## Map Operations

### Creating Maps

```c
// Method 1: BTF-defined maps (recommended)
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} my_map SEC(".maps");

// Method 2: Legacy (for older kernels)
struct bpf_map_def SEC("maps") my_map = {
    .type = BPF_MAP_TYPE_HASH,
    .key_size = sizeof(u32),
    .value_size = sizeof(u64),
    .max_entries = 1024,
};
```

### Map Operations

```c
// Update (insert or update)
u32 key = 1;
u64 value = 100;
long ret = bpf_map_update_elem(&my_map, &key, &value, BPF_ANY);
// Flags: BPF_ANY, BPF_NOEXIST, BPF_EXIST

// Lookup
u64 *value_ptr = bpf_map_lookup_elem(&my_map, &key);
if (value_ptr) {
    // Use *value_ptr
}

// Delete
bpf_map_delete_elem(&my_map, &key);

// Get next key (for iteration in user space)
u32 next_key;
bpf_map_get_next_key(&my_map, &key, &next_key);
```

## Practical Example: Process Counter

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

// Map to count syscalls per process
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 10240);
    __type(key, u32);  // PID
    __type(value, u64);  // Count
} process_count SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int count_syscalls(struct trace_event_raw_sys_enter *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 *count, zero = 0, one = 1;

    // Lookup or initialize
    count = bpf_map_lookup_elem(&process_count, &pid);
    if (!count) {
        bpf_map_update_elem(&process_count, &pid, &zero, BPF_NOEXIST);
        count = bpf_map_lookup_elem(&process_count, &pid);
    }

    // Increment atomically
    if (count) {
        __sync_fetch_and_add(count, 1);
    }

    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

## User Space Interaction

### Reading from Maps (User Space)

```c
#include <bpf/libbpf.h>
#include <bpf/bpf.h>

int fd = bpf_map_get_fd_by_id(map_id);
// Or
int fd = bpf_obj_get("/sys/fs/bpf/my_map");

// Read value
u32 key = 1;
u64 value;
bpf_map_lookup_elem(fd, &key, &value);

// Iterate all keys
u32 next_key = 0;
while (bpf_map_get_next_key(fd, &next_key, &next_key) == 0) {
    bpf_map_lookup_elem(fd, &next_key, &value);
    printf("Key: %u, Value: %llu\n", next_key, value);
}
```

### Writing to Maps (User Space)

```c
// Update map from user space
u32 key = 1;
u64 value = 200;
bpf_map_update_elem(fd, &key, &value, BPF_ANY);
```

## Advanced Map Types

### Stack Trace Maps

```c
struct {
    __uint(type, BPF_MAP_TYPE_STACK_TRACE);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u64) * 127);  // Max stack depth
} stack_traces SEC(".maps");

// Usage
u32 key = bpf_get_stackid(ctx, &stack_traces, BPF_F_USER_STACK);
```

### LRU Hash Maps

```c
struct {
    __uint(type, BPF_MAP_TYPE_LRU_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} lru_map SEC(".maps");
```

**Benefits:**
- Automatically evicts least recently used entries
- No manual cleanup needed
- Good for caches

## Map Pinning

Pin maps to filesystem for persistence:

```c
// In user space
bpf_map__pin(map, "/sys/fs/bpf/my_map");

// Access later
int fd = bpf_obj_get("/sys/fs/bpf/my_map");
```

## Best Practices

!!! success "Map Usage Tips"
    1. **Choose the right type**: Hash for lookups, Array for indexing
    2. **Use per-CPU maps**: For high-frequency updates
    3. **Pin important maps**: For persistence
    4. **Check return values**: Always validate map operations
    5. **Initialize values**: Use BPF_NOEXIST for new entries
    6. **Use atomic operations**: For concurrent updates
    7. **Size appropriately**: Don't waste memory

## Summary

!!! tip "Key Takeaways"
    - Maps enable kernel-user space communication
    - Choose map type based on use case
    - Hash maps for dynamic lookups
    - Array maps for fixed indexing
    - Ring buffers for modern event streaming
    - Per-CPU maps for performance

**Next Steps:**
- Learn about helper functions (Chapter 6)
- Build practical monitoring tools (Chapter 7)
- Implement network tracing (Chapter 8)

---

**Previous**: [eBPF Programs](04-ebpf-programs)  
**Next**: [Helper Functions](06-helper-functions)

