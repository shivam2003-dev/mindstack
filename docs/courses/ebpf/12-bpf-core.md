# BPF CO-RE

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🔧 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Understand BPF CO-RE (Compile Once - Run Everywhere)</li>
    <li>Write portable eBPF programs</li>
    <li>Use BTF for type information</li>
    <li>Handle kernel structure changes</li>
    <li>Build distribution-agnostic programs</li>
  </ul>
</div>

## Introduction to CO-RE

BPF CO-RE allows eBPF programs to run on different kernel versions without recompilation by using BTF (BPF Type Format) for type information.

!!! note "CO-RE Benefits"
    - Write once, run on multiple kernel versions
    - No kernel headers needed at runtime
    - Automatic handling of structure changes
    - Better portability

## BTF (BPF Type Format)

BTF provides type information about kernel data structures, enabling CO-RE.

### Checking BTF Support

```bash
# Check if kernel has BTF
ls /sys/kernel/btf/vmlinux

# Check BTF in object file
readelf -S program.o | grep BTF
```

## CO-RE Features

### 1. Field Existence Checks

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_core_read.h>

struct task_struct___old {
    // Old structure definition
} __attribute__((preserve_access_index));

SEC("kprobe/do_sys_openat2")
int trace_openat(struct pt_regs *ctx) {
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();
    u32 pid;
    
    // CO-RE: Check if field exists
    if (bpf_core_field_exists(task->pid)) {
        pid = BPF_CORE_READ(task, pid);
    } else {
        // Fallback for older kernels
        pid = bpf_get_current_pid_tgid() >> 32;
    }
    
    return 0;
}
```

### 2. Field Offset Relocation

```c
// Automatically handles structure layout changes
u32 pid = BPF_CORE_READ(task, pid);
u64 start_time = BPF_CORE_READ(task, start_time);
```

### 3. Type Existence Checks

```c
// Check if type exists
if (bpf_core_type_exists(struct task_struct)) {
    // Use task_struct
}
```

## Compiling CO-RE Programs

### Using clang with CO-RE

```bash
clang -O2 -target bpf \
      -D__TARGET_ARCH_x86 \
      -I/usr/include/linux \
      -I/usr/include/bpf \
      -g \  # Enable debug info for BTF
      -c program.c -o program.o
```

### Using libbpf

```c
// libbpf automatically handles CO-RE
struct bpf_object *obj = bpf_object__open_file("program.o", NULL);
bpf_object__load(obj);  // CO-RE relocations happen here
```

## Practical Example

### Portable Process Monitor

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_core_read.h>
#include <bpf/bpf_tracing.h>

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} process_start_time SEC(".maps");

SEC("tracepoint/sched/sched_process_exec")
int trace_exec(struct trace_event_raw_sched_process_exec *ctx) {
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();
    u32 pid;
    u64 start_time = bpf_ktime_get_ns();
    
    // CO-RE: Works across kernel versions
    if (bpf_core_field_exists(task->pid)) {
        pid = BPF_CORE_READ(task, pid);
    } else {
        pid = bpf_get_current_pid_tgid() >> 32;
    }
    
    bpf_map_update_elem(&process_start_time, &pid, &start_time, BPF_ANY);
    return 0;
}
```

## Best Practices

!!! success "CO-RE Best Practices"
    1. **Always use -g flag**: Required for BTF generation
    2. **Use BPF_CORE_READ**: For structure field access
    3. **Check field existence**: Handle kernel version differences
    4. **Test on multiple kernels**: Ensure portability
    5. **Use libbpf**: Automatic CO-RE support

**Next Steps:**
- Learn advanced techniques (Chapter 13)
- Review research papers (Chapter 14)
- Explore tools and libraries (Chapter 17)

---

**Previous**: [XDP Programming](11-xdp-programming)  
**Next**: [Advanced Techniques](13-advanced-techniques)

