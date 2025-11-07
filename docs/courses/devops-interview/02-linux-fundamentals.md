# Linux Fundamentals

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Master essential Linux commands</li>
    <li>Understand file system and permissions</li>
    <li>Learn process and system management</li>
    <li>Know networking and troubleshooting commands</li>
  </ul>
</div>

Linux is the foundation of DevOps. This chapter covers essential Linux commands and concepts you'll need for DevOps interviews and daily work.

!!! tip "Interview Focus"
    Interviewers often ask you to explain commands, not just list them. Understand what each command does and when to use it.

## Essential Commands

### File Operations

```bash
# List files with details
ls -lah

# Create directory
mkdir -p /path/to/directory

# Copy files
cp -r source/ destination/

# Move/rename files
mv oldname newname

# Remove files
rm -rf directory/

# Find files
find /path -name "*.log" -type f

# Search in files
grep -r "pattern" /path/to/search
```

!!! note "Command Flags"
    - `-r`: Recursive (for directories)
    - `-f`: Force (no confirmation)
    - `-h`: Human-readable sizes
    - `-a`: All files (including hidden)
    - `-l`: Long format

### File Permissions

```bash
# View permissions
ls -l file.txt
# Output: -rw-r--r-- 1 user group 1024 Jan 1 12:00 file.txt

# Change permissions
chmod 755 script.sh    # rwxr-xr-x
chmod +x script.sh     # Add execute permission
chmod -R 644 directory/ # Recursive

# Change ownership
chown user:group file.txt
chown -R user:group directory/
```

**Permission Numbers:**
- `4` = Read (r)
- `2` = Write (w)
- `1` = Execute (x)
- `755` = rwxr-xr-x (owner: rwx, group: r-x, others: r-x)

!!! warning "Common Interview Question"
    "Explain what `chmod 755` does" - Be ready to explain each digit and what permissions they grant.

### Process Management

```bash
# List processes
ps aux
ps -ef

# Find process by name
ps aux | grep nginx

# Kill process
kill -9 PID
killall nginx

# Background/foreground
command &          # Run in background
fg                 # Bring to foreground
jobs               # List background jobs
```

!!! tip "Process States"
    - **R**: Running
    - **S**: Sleeping
    - **Z**: Zombie
    - **D**: Uninterruptible sleep

### System Information

```bash
# System info
uname -a
hostname
uptime

# Disk usage
df -h
du -sh /path
du -h --max-depth=1

# Memory usage
free -h
cat /proc/meminfo

# CPU info
lscpu
cat /proc/cpuinfo

# Load average
top
htop
```

## File System

### Important Directories

```bash
/bin          # Essential binaries
/etc          # Configuration files
/var          # Variable data (logs, etc.)
/tmp          # Temporary files
/home         # User home directories
/usr          # User programs
/opt          # Optional software
/root         # Root user home
```

!!! note "Interview Question"
    "Where are log files typically stored?" - Answer: `/var/log/`

### Working with Files

```bash
# View file content
cat file.txt          # Entire file
head -n 20 file.txt   # First 20 lines
tail -n 20 file.txt   # Last 20 lines
tail -f file.txt      # Follow (watch) file

# Edit files
nano file.txt
vim file.txt

# Count lines, words, characters
wc -l file.txt
wc -w file.txt
wc -c file.txt
```

## Networking

### Network Commands

```bash
# Network configuration
ifconfig
ip addr show
ip route show

# Test connectivity
ping google.com
ping -c 4 google.com

# DNS lookup
nslookup domain.com
dig domain.com
host domain.com

# Network connections
netstat -tulpn
ss -tulpn

# Check ports
netstat -an | grep LISTEN
lsof -i :8080
```

!!! tip "Interview Tip"
    Know the difference between `netstat` and `ss`. `ss` is faster and more modern.

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw status
sudo ufw allow 22/tcp
sudo ufw enable

# firewalld (RHEL/CentOS)
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

## Text Processing

### sed and awk

```bash
# sed - stream editor
sed 's/old/new/g' file.txt
sed -i 's/old/new/g' file.txt  # In-place
sed -n '10,20p' file.txt        # Lines 10-20

# awk - pattern processing
awk '{print $1}' file.txt       # First column
awk -F: '{print $1}' /etc/passwd # Using : as delimiter
awk '/pattern/ {print $0}' file.txt
```

!!! note "Common Use Case"
    Extract specific columns from log files or CSV files using `awk`.

### Other Text Tools

```bash
# Sort
sort file.txt
sort -r file.txt        # Reverse
sort -n file.txt        # Numeric

# Unique lines
sort file.txt | uniq
sort file.txt | uniq -c  # Count occurrences

# Cut
cut -d: -f1 /etc/passwd  # First field with : delimiter

# tr (translate)
echo "HELLO" | tr '[:upper:]' '[:lower:]'
```

## System Services

### systemd

```bash
# Service management
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx

# Enable/disable
sudo systemctl enable nginx
sudo systemctl disable nginx

# List services
systemctl list-units --type=service
systemctl list-units --type=service --state=running
```

!!! tip "Interview Question"
    "What's the difference between `restart` and `reload`?" - Restart stops and starts, reload applies config without downtime.

## Package Management

### apt (Debian/Ubuntu)

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade

# Install package
sudo apt install nginx

# Remove package
sudo apt remove nginx
sudo apt purge nginx

# Search packages
apt search nginx

# Show package info
apt show nginx
```

### yum/dnf (RHEL/CentOS)

```bash
# Install
sudo yum install nginx
sudo dnf install nginx

# Update
sudo yum update
sudo dnf update

# Remove
sudo yum remove nginx
```

## Compression and Archives

```bash
# tar
tar -czf archive.tar.gz directory/
tar -xzf archive.tar.gz
tar -tzf archive.tar.gz  # List contents

# zip
zip -r archive.zip directory/
unzip archive.zip

# gzip
gzip file.txt
gunzip file.txt.gz
```

## Environment Variables

```bash
# View
echo $PATH
env
printenv

# Set (current session)
export VAR=value
export PATH=$PATH:/new/path

# Permanent (add to ~/.bashrc or ~/.bash_profile)
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Comprehensive Interview Questions

### Q1: Explain the difference between `kill`, `killall`, and `pkill`

**Answer:**
- **`kill`**: Requires a Process ID (PID), sends signal to specific process
  ```bash
  kill -9 1234  # Kill process with PID 1234
  ```
- **`killall`**: Uses process name, kills all matching processes
  ```bash
  killall nginx  # Kill all nginx processes
  ```
- **`pkill`**: Pattern-based, more flexible matching
  ```bash
  pkill -f "python script.py"  # Kill by pattern
  ```

**When to use:**
- Use `kill` when you know the exact PID
- Use `killall` for processes with known names
- Use `pkill` for pattern matching

### Q2: What does `grep -r` do and what are other useful grep options?

**Answer:**
- **`-r`**: Recursive search in directories and subdirectories
  ```bash
  grep -r "error" /var/log/
  ```
- **Other useful options:**
  - `-i`: Case-insensitive search
  - `-n`: Show line numbers
  - `-v`: Invert match (show non-matching lines)
  - `-l`: Show only filenames
  - `-c`: Count matches
  ```bash
  grep -rin "error" /var/log/  # Case-insensitive, recursive, with line numbers
  ```

### Q3: How do you find large files and directories?

**Answer:**

**Find files larger than 100MB:**
```bash
find / -type f -size +100M 2>/dev/null
find / -type f -size +100M -exec ls -lh {} \;
```

**Find top 10 largest files:**
```bash
find / -type f -exec du -h {} + 2>/dev/null | sort -h | tail -10
```

**Find top 10 largest directories:**
```bash
du -h /path | sort -h | tail -10
du -sh /path/* | sort -h | tail -10
```

**Using ncdu (interactive):**
```bash
ncdu /path
```

### Q4: Explain file permissions 755 in detail

**Answer:**
- **First digit (7)**: Owner permissions
  - 4 (read) + 2 (write) + 1 (execute) = 7
  - Owner can read, write, and execute
- **Second digit (5)**: Group permissions
  - 4 (read) + 1 (execute) = 5
  - Group can read and execute, but not write
- **Third digit (5)**: Others permissions
  - 4 (read) + 1 (execute) = 5
  - Others can read and execute, but not write

**Common permission patterns:**
- `755`: Executable files (scripts, binaries)
- `644`: Regular files (readable by all, writable by owner)
- `600`: Private files (readable/writable by owner only)
- `777`: Full permissions (not recommended for security)

### Q5: What is the difference between `restart` and `reload` for services?

**Answer:**
- **`restart`**: Stops the service completely, then starts it again
  - Causes brief downtime
  - All connections are dropped
  - Use when configuration changes require full restart
  ```bash
  systemctl restart nginx
  ```
- **`reload`**: Applies new configuration without stopping the service
  - No downtime
  - Existing connections are maintained
  - Use when service supports graceful reload
  ```bash
  systemctl reload nginx
  ```

**When to use:**
- Use `reload` when possible to avoid service interruption
- Use `restart` if service doesn't support reload or after major changes

### Q6: Explain the difference between `ps aux` and `ps -ef`

**Answer:**
- **`ps aux`**: BSD-style syntax
  - Shows: USER, PID, %CPU, %MEM, VSZ, RSS, TTY, STAT, START, TIME, COMMAND
  - More detailed memory and CPU information
- **`ps -ef`**: Unix-style syntax
  - Shows: UID, PID, PPID, C, STIME, TTY, TIME, CMD
  - Shows parent process ID (PPID)
  - More compact output

**When to use:**
- Use `ps aux` for detailed resource usage
- Use `ps -ef` to see process hierarchy (parent-child relationships)

### Q7: How do you monitor system resources in real-time?

**Answer:**

**Using `top`:**
```bash
top  # Interactive process viewer
```

**Using `htop` (more user-friendly):**
```bash
htop  # Enhanced version of top
```

**Using `vmstat`:**
```bash
vmstat 1  # Update every 1 second
```

**Using `iostat` (for I/O):**
```bash
iostat -x 1  # Extended I/O statistics
```

**Using `free` (for memory):**
```bash
free -h  # Human-readable memory info
free -h -s 1  # Update every second
```

### Q8: How do you find and kill a process using a specific port?

**Answer:**

**Find process using port:**
```bash
# Method 1: Using lsof
lsof -i :8080

# Method 2: Using netstat
netstat -tulpn | grep :8080

# Method 3: Using ss (modern)
ss -tulpn | grep :8080
```

**Kill process using port:**
```bash
# Get PID and kill
lsof -ti :8080 | xargs kill -9

# Or in one command
kill -9 $(lsof -ti :8080)
```

### Q9: Explain the difference between `>` and `>>` in redirection

**Answer:**
- **`>`**: Overwrites the file (truncates if exists)
  ```bash
  echo "Hello" > file.txt  # Creates or overwrites file.txt
  ```
- **`>>`**: Appends to the file (creates if doesn't exist)
  ```bash
  echo "World" >> file.txt  # Appends to file.txt
  ```

**Examples:**
```bash
# Overwrite
ls > files.txt

# Append
ls >> files.txt

# Redirect both stdout and stderr
command > output.txt 2>&1
command &> output.txt  # Shorthand
```

### Q10: How do you check disk space and inode usage?

**Answer:**

**Check disk space:**
```bash
df -h  # Human-readable format
df -h /  # Specific filesystem
```

**Check inode usage:**
```bash
df -i  # Show inode usage
df -ih /  # Human-readable inode usage
```

**Find directories using most space:**
```bash
du -h --max-depth=1 / | sort -h
du -sh /path/* | sort -h | tail -10
```

### Q11: What is the difference between `su` and `sudo`?

**Answer:**
- **`su`**: Switch user (requires target user's password)
  ```bash
  su - username  # Switch to username (needs their password)
  su -  # Switch to root (needs root password)
  ```
- **`sudo`**: Execute command as another user (uses your password)
  ```bash
  sudo command  # Execute as root (uses your password)
  sudo -u username command  # Execute as specific user
  ```

**Best practices:**
- Use `sudo` instead of `su` for better audit trails
- Configure `sudoers` file for granular permissions
- Never share root password, use `sudo` instead

### Q12: How do you find files modified in the last 24 hours?

**Answer:**
```bash
# Files modified in last 24 hours
find /path -type f -mtime -1

# Files modified in last 7 days
find /path -type f -mtime -7

# Files modified in last hour (using -mmin)
find /path -type f -mmin -60
```

**Time modifiers:**
- `-mtime -1`: Modified less than 1 day ago
- `-mtime +7`: Modified more than 7 days ago
- `-mmin -60`: Modified less than 60 minutes ago

### Q13: Explain the difference between `systemctl` and `service` commands

**Answer:**
- **`systemctl`**: Modern systemd command (preferred)
  ```bash
  systemctl start nginx
  systemctl status nginx
  systemctl enable nginx
  ```
- **`service`**: Legacy SysV init command (still works for compatibility)
  ```bash
  service nginx start
  service nginx status
  ```

**When to use:**
- Always use `systemctl` on systemd-based systems (most modern Linux)
- `service` is a wrapper that calls `systemctl` on systemd systems
- Use `systemctl` for more features and better control

## Practice Exercises

1. **Find all .log files older than 7 days and delete them**
   ```bash
   find /var/log -name "*.log" -mtime +7 -delete
   ```

2. **Count number of processes running as root**
   ```bash
   ps aux | grep "^root" | wc -l
   ```

3. **Find top 10 largest files**
   ```bash
   find / -type f -exec du -h {} + 2>/dev/null | sort -h | tail -10
   ```

4. **Monitor disk I/O**
   ```bash
   iostat -x 1
   ```

## Next Steps

Master these commands through practice. Next, we'll learn shell scripting to automate these operations.

---

**Key Takeaways:**
- Master file operations, permissions, and process management
- Understand system information commands
- Know networking and troubleshooting tools
- Practice explaining commands, not just memorizing
- Combine commands with pipes (`|`) for powerful operations

---

**Previous**: [Introduction](01-introduction) | **Next**: [Shell Scripting](03-shell-scripting)

