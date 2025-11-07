# Development Environment Setup

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🛠️ Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Set up a complete eBPF development environment</li>
    <li>Install required tools and dependencies</li>
    <li>Configure your system for eBPF development</li>
    <li>Verify your installation</li>
    <li>Set up a development workflow</li>
  </ul>
</div>

## Prerequisites

Before setting up your eBPF development environment, ensure you have:

- Linux kernel 4.9+ (5.8+ recommended for latest features)
- Root or sudo access
- Basic C programming knowledge
- Familiarity with Linux command line

!!! note "Kernel Version"
    eBPF features vary by kernel version. Check your kernel version with `uname -r`. For best experience, use kernel 5.8 or later.

## System Requirements

### Minimum Requirements

- **Kernel**: Linux 4.9+
- **Memory**: 2GB RAM minimum
- **Disk**: 10GB free space
- **CPU**: x86_64 or ARM64

### Recommended Setup

- **Kernel**: Linux 5.8+ (for CO-RE support)
- **Memory**: 4GB+ RAM
- **Disk**: 20GB+ free space
- **OS**: Ubuntu 20.04+, Fedora 33+, or similar

## Installation Methods

### Method 1: Ubuntu/Debian

```bash
# Update package list
sudo apt-get update

# Install build essentials
sudo apt-get install -y \
    build-essential \
    clang \
    llvm \
    libelf-dev \
    libbpf-dev \
    linux-headers-$(uname -r) \
    pkg-config \
    gcc-multilib

# Install BCC tools (optional but recommended)
sudo apt-get install -y bpfcc-tools libbpfcc python3-bpfcc

# Install bpftool
sudo apt-get install -y linux-tools-$(uname -r)
```

!!! tip "BCC vs libbpf"
    - **BCC**: Higher-level tools, easier for beginners, Python bindings
    - **libbpf**: Lower-level, more control, better performance, CO-RE support

### Method 2: Fedora/RHEL

```bash
# Install build tools
sudo dnf install -y \
    gcc \
    clang \
    llvm \
    elfutils-libelf-devel \
    libbpf-devel \
    kernel-devel \
    kernel-headers \
    bpftool

# Install BCC (optional)
sudo dnf install -y bcc-tools python3-bcc
```

### Method 3: Arch Linux

```bash
# Install packages
sudo pacman -S \
    base-devel \
    clang \
    llvm \
    libelf \
    linux-headers \
    bpftool

# Install BCC from AUR
yay -S bcc-tools
```

## Verify Installation

### Check Kernel Support

```bash
# Check kernel version
uname -r

# Check eBPF features
ls /sys/fs/bpf/

# Check JIT compiler
cat /proc/sys/net/core/bpf_jit_enable
# Should output: 1 or 2

# Check available program types
ls /sys/fs/bpf/ | head -5
```

### Check Tools

```bash
# Check clang version
clang --version
# Should be 10.0 or later

# Check llvm version
llvm-config --version

# Check bpftool
bpftool version

# Check BCC (if installed)
python3 -c "import bcc; print(bcc.__version__)"
```

!!! success "Installation Checklist"
    - ✅ Kernel 4.9+ installed
    - ✅ clang and llvm installed
    - ✅ libbpf-dev installed
    - ✅ Kernel headers installed
    - ✅ bpftool available
    - ✅ JIT compiler enabled

## Development Setup

### Project Structure

Create a standard eBPF project structure:

```
my-ebpf-project/
├── src/
│   ├── bpf/
│   │   └── program.c          # eBPF program
│   └── user/
│       └── loader.c           # User space loader
├── include/
│   └── common.h               # Shared headers
├── Makefile                   # Build configuration
└── README.md
```

### Basic Makefile

Create a `Makefile` for your project:

```makefile
CLANG ?= clang
LLC ?= llc
ARCH := $(shell uname -m | sed 's/x86_64/x86/' | sed 's/aarch64/arm64/')
BPFTOOL ?= bpftool

# Kernel headers path
KERN_SRC := /lib/modules/$(shell uname -r)/build

# Output directory
OUTPUT := output

# Source files
BPF_SRC := src/bpf/program.c
USER_SRC := src/user/loader.c

# Object files
BPF_OBJ := $(OUTPUT)/program.o
USER_OBJ := $(OUTPUT)/loader.o

# Flags
CLANG_FLAGS := -O2 -target bpf -D__TARGET_ARCH_$(ARCH) \
               -I$(KERN_SRC)/arch/$(ARCH)/include \
               -I$(KERN_SRC)/arch/$(ARCH)/include/generated \
               -I$(KERN_SRC)/include \
               -I$(KERN_SRC)/include/generated \
               -I$(KERN_SRC)/include/uapi \
               -I./include

.PHONY: all clean

all: $(BPF_OBJ) $(USER_OBJ)

$(OUTPUT):
	mkdir -p $(OUTPUT)

$(BPF_OBJ): $(BPF_SRC) | $(OUTPUT)
	$(CLANG) $(CLANG_FLAGS) -c $< -o $@

$(USER_OBJ): $(USER_SRC) | $(OUTPUT)
	$(CC) -I./include -L/usr/lib64 -lbpf -lelf -o $@ $<

clean:
	rm -rf $(OUTPUT)

.PHONY: load unload

load: $(BPF_OBJ)
	sudo $(BPFTOOL) prog load $(BPF_OBJ) /sys/fs/bpf/program

unload:
	sudo rm /sys/fs/bpf/program
```

## Using libbpf

### Installing libbpf

If not available in your package manager:

```bash
# Clone libbpf
git clone https://github.com/libbpf/libbpf.git
cd libbpf/src

# Build
make

# Install
sudo make install
```

### libbpf Project Template

```c
// src/user/loader.c
#include <stdio.h>
#include <stdlib.h>
#include <bpf/libbpf.h>
#include <bpf/bpf.h>

int main(int argc, char **argv) {
    struct bpf_object *obj;
    struct bpf_program *prog;
    int err;

    // Load BPF object file
    obj = bpf_object__open_file("program.o", NULL);
    if (libbpf_get_error(obj)) {
        fprintf(stderr, "Error opening BPF object file\n");
        return 1;
    }

    // Load BPF programs
    err = bpf_object__load(obj);
    if (err) {
        fprintf(stderr, "Error loading BPF object\n");
        return 1;
    }

    // Attach program
    prog = bpf_object__find_program_by_name(obj, "your_program");
    if (!prog) {
        fprintf(stderr, "Program not found\n");
        return 1;
    }

    struct bpf_link *link = bpf_program__attach(prog);
    if (libbpf_get_error(link)) {
        fprintf(stderr, "Error attaching program\n");
        return 1;
    }

    printf("eBPF program loaded and attached\n");

    // Keep running
    while (1) {
        sleep(1);
    }

    bpf_link__destroy(link);
    bpf_object__close(obj);
    return 0;
}
```

## Using BCC

### BCC Installation

```bash
# Ubuntu/Debian
sudo apt-get install -y bpfcc-tools python3-bpfcc

# Or build from source
git clone https://github.com/iovisor/bcc.git
cd bcc
mkdir build && cd build
cmake ..
make
sudo make install
```

### BCC Example

```python
#!/usr/bin/env python3
from bcc import BPF

# eBPF program
program = """
int hello(void *ctx) {
    bpf_trace_printk("Hello, eBPF!\\n");
    return 0;
}
"""

# Load BPF program
b = BPF(text=program)

# Attach to tracepoint
b.attach_tracepoint(tp="syscalls:sys_enter_openat", fn_name="hello")

# Read trace output
b.trace_print()
```

## Development Tools

### bpftool

Essential tool for eBPF development:

```bash
# List all loaded programs
sudo bpftool prog list

# Show program details
sudo bpftool prog show id <prog_id>

# Dump program bytecode
sudo bpftool prog dump xlated id <prog_id>

# List all maps
sudo bpftool map list

# Show map details
sudo bpftool map show id <map_id>

# Load program from object file
sudo bpftool prog load program.o /sys/fs/bpf/program

# Attach program
sudo bpftool prog attach <prog_id> <attach_type> <target>
```

### perf

For performance analysis:

```bash
# List available tracepoints
perf list

# Trace system calls
sudo perf trace -e syscalls:sys_enter_openat

# Profile with eBPF
sudo perf record -e bpf-output/no-inherit,name=my_event/ -e ./program.o
```

### strace

For system call tracing:

```bash
# Trace system calls
strace -e trace=openat ./your_program

# Trace with eBPF
strace -c ./your_program
```

## IDE Setup

### VS Code

Install extensions:
- C/C++ (Microsoft)
- clangd
- BPF Tools

Create `.vscode/c_cpp_properties.json`:

```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**",
                "/usr/include",
                "/usr/src/linux-headers-$(uname -r)/include",
                "/usr/src/linux-headers-$(uname -r)/arch/x86/include"
            ],
            "defines": [
                "__BPF__",
                "__TARGET_ARCH_x86"
            ],
            "compilerPath": "/usr/bin/clang",
            "cStandard": "c11",
            "intelliSenseMode": "linux-clang-x64"
        }
    ]
}
```

### Vim/Neovim

Use plugins:
- coc-clangd
- vim-bpf

## Testing Your Setup

### Simple Test Program

Create `test.c`:

```c
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_openat")
int test_prog(void *ctx) {
    bpf_printk("eBPF is working!");
    return 0;
}

char LICENSE[] SEC("license") = "GPL";
```

Compile and test:

```bash
# Compile
clang -O2 -target bpf -c test.c -o test.o

# Load
sudo bpftool prog load test.o /sys/fs/bpf/test

# Verify
sudo bpftool prog list | grep test

# Cleanup
sudo rm /sys/fs/bpf/test
```

!!! success "Setup Complete"
    If the test program loads successfully, your development environment is ready!

## Common Issues and Solutions

### Issue: "Kernel headers not found"

```bash
# Install kernel headers
sudo apt-get install linux-headers-$(uname -r)
```

### Issue: "libbpf not found"

```bash
# Install libbpf
sudo apt-get install libbpf-dev

# Or build from source (see above)
```

### Issue: "Permission denied"

```bash
# eBPF requires root or capabilities
sudo ./your_program

# Or add capabilities
sudo setcap cap_sys_admin+ep your_program
```

### Issue: "Verifier rejects program"

- Check verifier output: `sudo dmesg | tail -20`
- Simplify your program
- Ensure all variables are initialized
- Check for unbounded loops

## Next Steps

!!! tip "Ready to Code"
    Your development environment is now set up! Next:
    1. Review the architecture chapter (Chapter 2)
    2. Write your first eBPF program (Chapter 4)
    3. Learn about maps and data structures (Chapter 5)

---

**Previous**: [eBPF Architecture](02-architecture)  
**Next**: [eBPF Programs](04-ebpf-programs)

