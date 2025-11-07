# eBPF Programs

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">📝 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Write your first eBPF program</li>
    <li>Understand eBPF program structure</li>
    <li>Learn about program sections and attributes</li>
    <li>Compile and load eBPF programs</li>
    <li>Handle errors and debugging</li>
  </ul>
</div>

## Your First eBPF Program

Let's start with a simple "Hello World" eBPF program:

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_openat")
int hello_world(void *ctx) {
    bpf_printk("Hello, eBPF World!");
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

!!! tip "Program Structure"
    Every eBPF program needs:
    1. Include headers
    2. Program function with `SEC()` attribute
    3. License declaration (required by kernel)

## Program Structure

### Basic Components

**1. Headers:**
```c
#include <linux/bpf.h>        // Core eBPF definitions
#include <bpf/bpf_helpers.h>  // Helper functions
```

**2. Program Function:**
```c
SEC("tracepoint/syscalls/sys_enter_openat")
int my_program(void *ctx) {
    // Program logic
    return 0;
}
```

**3. License:**
```c
char LICENSE[] SEC("license") = "GPL";
```

## Program Sections

The `SEC()` macro defines where the program attaches:

### Common Sections

```c
// Tracepoint
SEC("tracepoint/syscalls/sys_enter_openat")

// Kprobe
SEC("kprobe/do_sys_openat2")

// Kretprobe
SEC("kretprobe/do_sys_openat2")

// Uprobe
SEC("uprobe/my_function")

// XDP
SEC("xdp")

// TC ingress
SEC("tc")

// Socket
SEC("socket")
```

!!! note "Section Names"
    Section names determine attachment points. Use descriptive names that match your hook type.

## Complete Example: System Call Tracer

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_tracing.h>

// Map to store counts
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} syscall_count SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx) {
    u32 pid = bpf_get_current_pid_tgid() >> 32;
    u64 *count;
    u64 zero = 0;

    // Lookup or create entry
    count = bpf_map_lookup_elem(&syscall_count, &pid);
    if (!count) {
        bpf_map_update_elem(&syscall_count, &pid, &zero, BPF_NOEXIST);
        count = bpf_map_lookup_elem(&syscall_count, &pid);
    }

    // Increment count
    if (count) {
        __sync_fetch_and_add(count, 1);
    }

    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

## Compiling eBPF Programs

### Using clang

```bash
clang -O2 -target bpf -D__TARGET_ARCH_x86 \
      -I/usr/include/linux \
      -I/usr/include/bpf \
      -c program.c -o program.o
```

### Using Makefile

```makefile
CLANG ?= clang
ARCH := $(shell uname -m | sed 's/x86_64/x86/')

program.o: program.c
	$(CLANG) -O2 -target bpf -D__TARGET_ARCH_$(ARCH) \
	         -I/usr/include/linux \
	         -I/usr/include/bpf \
	         -c $< -o $@
```

## Loading Programs

### Using bpftool

```bash
# Load program
sudo bpftool prog load program.o /sys/fs/bpf/program

# List programs
sudo bpftool prog list

# Show program info
sudo bpftool prog show id <prog_id>

# Attach to tracepoint
sudo bpftool prog attach <prog_id> tracepoint syscalls/sys_enter_openat
```

### Using libbpf

```c
struct bpf_object *obj;
struct bpf_program *prog;
struct bpf_link *link;

// Open object file
obj = bpf_object__open_file("program.o", NULL);

// Load programs
bpf_object__load(obj);

// Find program
prog = bpf_object__find_program_by_name(obj, "trace_openat");

// Attach
link = bpf_program__attach(prog);
```

## Program Types and Contexts

### Tracepoint Programs

```c
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx) {
    // ctx contains syscall arguments
    return 0;
}
```

### Kprobe Programs

```c
SEC("kprobe/do_sys_openat2")
int kprobe_openat(struct pt_regs *ctx) {
    // ctx contains register state
    return 0;
}
```

### XDP Programs

```c
SEC("xdp")
int xdp_prog(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;
    
    // Process packet
    return XDP_PASS;
}
```

## Helper Functions

Common helper functions:

```c
// Get process ID
u32 pid = bpf_get_current_pid_tgid() >> 32;

// Get thread ID
u32 tid = bpf_get_current_pid_tgid();

// Get user ID
u32 uid = bpf_get_current_uid_gid() >> 32;

// Get current time
u64 time = bpf_ktime_get_ns();

// Print to trace buffer
bpf_printk("PID: %d", pid);

// Read kernel memory
bpf_probe_read_kernel(&value, sizeof(value), ptr);

// Read user memory
bpf_probe_read_user(&value, sizeof(value), ptr);
```

!!! warning "Helper Function Safety"
    Always check return values from helper functions. Invalid operations can cause verifier rejection.

## Error Handling

### Verifier Errors

Common verifier errors and solutions:

```c
// Error: Uninitialized variable
int value;  // Wrong
int value = 0;  // Correct

// Error: Invalid memory access
int *ptr = NULL;
*ptr = 5;  // Wrong - check pointer first

// Error: Unbounded loop
for (int i = 0; i < 10; i++) {  // OK - bounded
    // ...
}

for (int i = 0; i < n; i++) {  // Wrong - unbounded
    // ...
}
```

### Debugging Tips

```bash
# Check verifier output
sudo dmesg | tail -50

# Use verbose mode
sudo bpftool prog load program.o /sys/fs/bpf/prog verbose

# Dump program bytecode
sudo bpftool prog dump xlated id <prog_id>
```

## Best Practices

!!! success "Writing Good eBPF Programs"
    1. **Keep programs simple**: Complex logic should be in user space
    2. **Check all pointers**: Always validate before dereferencing
    3. **Use appropriate data types**: Choose types that match your use case
    4. **Minimize map operations**: Cache values when possible
    5. **Handle errors gracefully**: Check return values
    6. **Use meaningful names**: Make code readable
    7. **Add comments**: Document complex logic

## Advanced: Tail Calls

For complex logic, use tail calls:

```c
struct {
    __uint(type, BPF_MAP_TYPE_PROG_ARRAY);
    __uint(max_entries, 10);
    __uint(key_size, sizeof(u32));
    __uint(value_size, sizeof(u32));
} prog_array SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_openat")
int entry_prog(void *ctx) {
    u32 index = 0;
    bpf_tail_call(ctx, &prog_array, index);
    return 0;
}

SEC("tracepoint/syscalls/sys_enter_openat")
int handler_prog(void *ctx) {
    // Handle the event
    return 0;
}
```

## Summary

!!! tip "Key Takeaways"
    - eBPF programs are C-like functions with restrictions
    - Use `SEC()` to define attachment points
    - Always include a license declaration
    - Compile with clang targeting BPF
    - Load using bpftool or libbpf
    - Handle errors and validate pointers

**Next Steps:**
- Learn about maps and data structures (Chapter 5)
- Understand helper functions (Chapter 6)
- Build practical examples (Chapters 7-10)

---

**Previous**: [Development Environment](03-development-environment)  
**Next**: [Maps & Data Structures](05-maps-data-structures)

