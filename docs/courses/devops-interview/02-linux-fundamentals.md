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

## Common Interview Questions

### Q: Explain the difference between `kill` and `killall`

**Answer:**
- `kill` requires a Process ID (PID)
- `killall` uses process name
- Example: `kill 1234` vs `killall nginx`

### Q: What does `grep -r` do?

**Answer:**
- `-r` means recursive
- Searches in all files in directory and subdirectories
- Example: `grep -r "error" /var/log/`

### Q: How do you find large files?

**Answer:**
```bash
find / -type f -size +100M
du -h /path | sort -h | tail -10
```

### Q: Explain file permissions 755

**Answer:**
- First digit (7): Owner - read, write, execute (4+2+1)
- Second digit (5): Group - read, execute (4+1)
- Third digit (5): Others - read, execute (4+1)

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

