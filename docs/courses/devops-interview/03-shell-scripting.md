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

## Comprehensive Interview Questions

### Q1: Write a script to find and delete files older than 30 days

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

DIRECTORY="/var/log"
DAYS=30

# Find and delete files older than specified days
find "$DIRECTORY" -type f -mtime +$DAYS -delete

echo "Deleted files older than $DAYS days from $DIRECTORY"
```

**Enhanced version with logging:**
```bash
#!/bin/bash
set -euo pipefail

DIRECTORY="${1:-/var/log}"
DAYS="${2:-30}"
LOG_FILE="/var/log/cleanup.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting cleanup of files older than $DAYS days in $DIRECTORY"

# Count files before deletion
COUNT=$(find "$DIRECTORY" -type f -mtime +$DAYS | wc -l)

# Delete files
find "$DIRECTORY" -type f -mtime +$DAYS -delete

log "Deleted $COUNT files"
```

### Q2: Write a script to backup a directory with rotation

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

SOURCE_DIR="${1:-/home/user/data}"
BACKUP_DIR="${2:-/backup}"
RETENTION_DAYS=7

# Validate source directory
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory $SOURCE_DIR does not exist"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$(basename $SOURCE_DIR)_$TIMESTAMP.tar.gz"

# Create backup
tar -czf "$BACKUP_FILE" -C "$(dirname $SOURCE_DIR)" "$(basename $SOURCE_DIR)"

# Remove old backups
find "$BACKUP_DIR" -name "backup_$(basename $SOURCE_DIR)_*.tar.gz" \
     -mtime +$RETENTION_DAYS -delete

echo "Backup created: $BACKUP_FILE"
```

### Q3: Write a script to check if a service is running and restart if not

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

SERVICE="${1:-nginx}"
MAX_RETRIES=3
RETRY_DELAY=5

check_service() {
    if systemctl is-active --quiet "$SERVICE"; then
        return 0
    else
        return 1
    fi
}

start_service() {
    systemctl start "$SERVICE"
    sleep "$RETRY_DELAY"
}

# Check if service is running
if check_service; then
    echo "$SERVICE is running"
    exit 0
fi

# Try to start service
echo "$SERVICE is not running. Attempting to start..."
for i in $(seq 1 $MAX_RETRIES); do
    start_service
    if check_service; then
        echo "$SERVICE started successfully"
        exit 0
    fi
    echo "Attempt $i failed. Retrying..."
done

echo "Failed to start $SERVICE after $MAX_RETRIES attempts"
exit 1
```

### Q4: Write a script to monitor disk usage and send alert if above threshold

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

THRESHOLD=80
PARTITION="${1:-/}"
ALERT_EMAIL="admin@example.com"

# Get disk usage percentage
USAGE=$(df -h "$PARTITION" | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    MESSAGE="Warning: Disk usage on $PARTITION is ${USAGE}% (threshold: ${THRESHOLD}%)"
    echo "$MESSAGE"
    
    # Send email alert (requires mail configured)
    echo "$MESSAGE" | mail -s "Disk Usage Alert" "$ALERT_EMAIL"
    
    # Or log to syslog
    logger -t disk-monitor "$MESSAGE"
    
    exit 1
fi

echo "Disk usage is normal: ${USAGE}%"
exit 0
```

### Q5: Write a script to process log files and extract errors

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

LOG_DIR="${1:-/var/log}"
OUTPUT_FILE="${2:-/tmp/errors.txt}"
PATTERN="${3:-ERROR|FATAL|CRITICAL}"

# Clear output file
> "$OUTPUT_FILE"

# Process all log files
find "$LOG_DIR" -type f -name "*.log" | while read -r logfile; do
    echo "Processing: $logfile"
    grep -iE "$PATTERN" "$logfile" >> "$OUTPUT_FILE" || true
done

# Count errors
ERROR_COUNT=$(wc -l < "$OUTPUT_FILE")
echo "Found $ERROR_COUNT errors. Results saved to $OUTPUT_FILE"

# Show top 10 most common errors
echo -e "\nTop 10 most common errors:"
sort "$OUTPUT_FILE" | uniq -c | sort -rn | head -10
```

### Q6: Write a function to validate IP address

**Answer:**
```bash
#!/bin/bash

validate_ip() {
    local ip=$1
    local stat=1
    
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        OIFS=$IFS
        IFS='.'
        ip=($ip)
        IFS=$OIFS
        [[ ${ip[0]} -le 255 && ${ip[1]} -le 255 && \
           ${ip[2]} -le 255 && ${ip[3]} -le 255 ]]
        stat=$?
    fi
    return $stat
}

# Usage
if validate_ip "192.168.1.1"; then
    echo "Valid IP"
else
    echo "Invalid IP"
fi
```

### Q7: Write a script to parse CSV file and process data

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

CSV_FILE="${1:-data.csv}"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: File $CSV_FILE not found"
    exit 1
fi

# Skip header and process each line
tail -n +2 "$CSV_FILE" | while IFS=',' read -r name email age; do
    echo "Name: $name, Email: $email, Age: $age"
    # Process data here
done
```

### Q8: Write a script with proper error handling and logging

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/script.log"

# Logging function
log() {
    local level=$1
    shift
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# Trap errors
trap 'error_exit "Error on line $LINENO"' ERR

log "INFO" "Script started"

# Your script logic here
if [ $# -eq 0 ]; then
    error_exit "No arguments provided"
fi

log "INFO" "Processing argument: $1"
# Process argument...

log "INFO" "Script completed successfully"
```

### Q9: Explain the difference between `$*` and `$@`

**Answer:**
- **`$*`**: Expands to all arguments as a single word
  ```bash
  # If called with: script.sh "arg1" "arg2" "arg3"
  echo $*  # Output: arg1 arg2 arg3 (single word)
  ```
- **`$@`**: Expands to all arguments as separate words
  ```bash
  # If called with: script.sh "arg1" "arg2" "arg3"
  echo "$@"  # Output: arg1 arg2 arg3 (preserves arguments)
  ```

**When to use:**
- Use `"$@"` when you want to preserve arguments (recommended)
- Use `$*` when you want all arguments as one string

### Q10: Write a script to check multiple services and report status

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

SERVICES=("nginx" "mysql" "redis" "docker")

check_services() {
    local all_ok=true
    
    for service in "${SERVICES[@]}"; do
        if systemctl is-active --quiet "$service"; then
            echo "✓ $service is running"
        else
            echo "✗ $service is NOT running"
            all_ok=false
        fi
    done
    
    if [ "$all_ok" = true ]; then
        echo "All services are running"
        return 0
    else
        echo "Some services are not running"
        return 1
    fi
}

check_services
```

### Q11: How do you handle command-line arguments in a script?

**Answer:**
```bash
#!/bin/bash

# Method 1: Positional parameters
FIRST_ARG=$1
SECOND_ARG=$2

# Method 2: Using getopts (for options)
while getopts "a:b:c:" opt; do
    case $opt in
        a) ARG_A="$OPTARG" ;;
        b) ARG_B="$OPTARG" ;;
        c) ARG_C="$OPTARG" ;;
        \?) echo "Invalid option" ;;
    esac
done

# Method 3: Using shift
while [ $# -gt 0 ]; do
    case $1 in
        --name) NAME=$2; shift ;;
        --age) AGE=$2; shift ;;
        *) echo "Unknown option: $1" ;;
    esac
    shift
done
```

### Q12: Write a script to monitor process and restart if it dies

**Answer:**
```bash
#!/bin/bash
set -euo pipefail

PROCESS_NAME="${1:-myapp}"
CHECK_INTERVAL=60
MAX_RESTARTS=5
RESTART_COUNT=0

monitor_process() {
    while true; do
        if ! pgrep -f "$PROCESS_NAME" > /dev/null; then
            echo "[$(date)] Process $PROCESS_NAME not found. Restarting..."
            
            if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
                echo "Max restarts reached. Exiting."
                exit 1
            fi
            
            # Restart process (adjust command as needed)
            /path/to/$PROCESS_NAME &
            ((RESTART_COUNT++))
        else
            RESTART_COUNT=0  # Reset counter if process is running
        fi
        
        sleep $CHECK_INTERVAL
    done
}

monitor_process
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

