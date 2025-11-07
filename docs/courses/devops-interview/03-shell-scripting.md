# Shell Scripting

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master Bash scripting fundamentals</li>
    <li>Learn variables, loops, and conditionals</li>
    <li>Understand functions and error handling</li>
    <li>Write production-ready scripts</li>
  </ul>
</div>

Shell scripting is essential for DevOps automation. This chapter covers Bash scripting from basics to advanced patterns.

!!! tip "Interview Focus"
    Be ready to write scripts on the spot. Practice common patterns like file processing, error handling, and automation.

## Basic Script Structure

```bash
#!/bin/bash
# Script description
# Author: Your Name
# Date: 2024

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Script body
echo "Hello, World!"
```

!!! note "Shebang"
    `#!/bin/bash` tells the system which interpreter to use. Always include it.

## Variables

```bash
# Declare variables
NAME="John"
AGE=30

# Use variables
echo "Name: $NAME"
echo "Age: $AGE"

# Command substitution
CURRENT_DIR=$(pwd)
DATE=$(date +%Y-%m-%d)

# Environment variables
echo "Home: $HOME"
echo "User: $USER"
```

!!! warning "Variable Naming"
    - Use uppercase for constants
    - Use lowercase for variables
    - No spaces around `=`
    - Quote variables to prevent word splitting

## Conditionals

```bash
# If statement
if [ "$AGE" -gt 18 ]; then
    echo "Adult"
elif [ "$AGE" -gt 13 ]; then
    echo "Teenager"
else
    echo "Child"
fi

# File checks
if [ -f "file.txt" ]; then
    echo "File exists"
fi

if [ -d "directory" ]; then
    echo "Directory exists"
fi

# String comparison
if [ "$NAME" == "John" ]; then
    echo "Hello John"
fi
```

**File Test Operators:**
- `-f`: File exists and is regular file
- `-d`: Directory exists
- `-r`: File is readable
- `-w`: File is writable
- `-x`: File is executable
- `-s`: File exists and is not empty

## Loops

### For Loop

```bash
# Iterate over list
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

# Iterate over files
for file in *.txt; do
    echo "Processing: $file"
done

# C-style for loop
for ((i=1; i<=10; i++)); do
    echo "Count: $i"
done
```

### While Loop

```bash
# While condition
count=1
while [ $count -le 5 ]; do
    echo "Count: $count"
    ((count++))
done

# Read file line by line
while IFS= read -r line; do
    echo "Line: $line"
done < file.txt
```

## Functions

```bash
# Define function
function greet() {
    local name=$1
    echo "Hello, $name!"
}

# Call function
greet "John"

# Function with return value
function add() {
    local a=$1
    local b=$2
    echo $((a + b))
}

result=$(add 5 3)
echo "Sum: $result"
```

!!! tip "Best Practices"
    - Use `local` for function variables
    - Return values via `echo` and capture with `$()`
    - Keep functions small and focused

## Error Handling

```bash
#!/bin/bash
set -euo pipefail

# Trap errors
trap 'echo "Error on line $LINENO"' ERR

# Check command success
if ! command -v docker &> /dev/null; then
    echo "Docker not found"
    exit 1
fi

# Handle errors gracefully
if ! docker ps; then
    echo "Docker daemon not running"
    exit 1
fi
```

## Common Patterns

### Logging

```bash
LOG_FILE="/var/log/script.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Script started"
log "Processing files"
log "Script completed"
```

### Input Validation

```bash
# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

# Validate file exists
if [ ! -f "$1" ]; then
    echo "Error: File $1 not found"
    exit 1
fi
```

### Processing Files

```bash
# Process all files in directory
for file in /path/to/files/*; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        # Process file
    fi
done
```

## Advanced Topics

### Arrays

```bash
# Declare array
fruits=("apple" "banana" "orange")

# Access elements
echo "${fruits[0]}"
echo "${fruits[@]}"  # All elements

# Array length
echo "${#fruits[@]}"

# Iterate array
for fruit in "${fruits[@]}"; do
    echo "$fruit"
done
```

### String Manipulation

```bash
STRING="Hello World"

# Length
echo "${#STRING}"

# Substring
echo "${STRING:0:5}"  # "Hello"
echo "${STRING:6}"    # "World"

# Replace
echo "${STRING/World/Universe}"

# Remove prefix/suffix
echo "${STRING#Hello }"  # Remove prefix
echo "${STRING% World}"  # Remove suffix
```

## Interview Questions

### Q: Write a script to find and delete files older than 30 days

```bash
#!/bin/bash
find /path/to/directory -type f -mtime +30 -delete
```

### Q: Write a script to backup a directory

```bash
#!/bin/bash
SOURCE_DIR="/path/to/source"
BACKUP_DIR="/path/to/backup"
DATE=$(date +%Y%m%d)

tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" "$SOURCE_DIR"
```

### Q: Write a script to check if a service is running

```bash
#!/bin/bash
SERVICE="nginx"

if systemctl is-active --quiet "$SERVICE"; then
    echo "$SERVICE is running"
else
    echo "$SERVICE is not running"
    systemctl start "$SERVICE"
fi
```

## Best Practices

1. **Always use `set -euo pipefail`**
2. **Quote variables** to prevent word splitting
3. **Use `local`** in functions
4. **Check return codes** of commands
5. **Add comments** for complex logic
6. **Validate input** before processing
7. **Use meaningful variable names**
8. **Handle errors gracefully**

---

**Previous**: [Linux Fundamentals](02-linux-fundamentals) | **Next**: [Git & Version Control](04-git-version-control)

