# System Design

<div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 2rem; border-radius: 10px; color: white; margin-bottom: 2rem;">
  <h2 style="margin: 0; color: white;">🎯 Learning Objectives</h2>
  <ul style="margin: 1rem 0 0 0; padding-left: 1.5rem;">
    <li>Design scalable distributed systems</li>
    <li>Understand system design patterns</li>
    <li>Master load balancing and caching strategies</li>
    <li>Learn database design and sharding</li>
    <li>Know microservices vs monolith trade-offs</li>
  </ul>
</div>

System design is a critical DevOps interview topic. This comprehensive chapter covers designing scalable, distributed systems from scratch.

!!! tip "Interview Focus"
    Practice the design process, explain trade-offs clearly, and be ready to scale from 1 user to millions.

## System Design Process

### Step-by-Step Approach

**1. Requirements Clarification:**
- Functional requirements
- Non-functional requirements (scale, performance, availability)
- Constraints and assumptions

**2. Capacity Estimation:**
- Traffic estimates (reads/writes per second)
- Storage requirements
- Bandwidth requirements

**3. High-Level Design:**
- Draw major components
- Show interactions
- Identify APIs

**4. Detailed Design:**
- Deep dive into each component
- Database schema
- Algorithms
- Data flow

**5. Identify Bottlenecks:**
- Single points of failure
- Scalability issues
- Performance bottlenecks

**6. Scale the Design:**
- Load balancing
- Caching
- Database sharding
- CDN

## Core Components

### Load Balancers

**Types:**
- **Layer 4 (Transport)**: TCP/UDP, faster, less intelligent
- **Layer 7 (Application)**: HTTP/HTTPS, more features, slower

**Load Balancing Algorithms:**
- **Round Robin**: Distribute evenly
- **Least Connections**: Send to server with fewest connections
- **Weighted Round Robin**: Based on server capacity
- **IP Hash**: Consistent hashing based on client IP

**Health Checks:**
- Active: Send requests to check health
- Passive: Monitor responses
- Remove unhealthy servers automatically

### Caching Strategies

**Cache Levels:**
1. **Browser Cache**: Client-side
2. **CDN Cache**: Edge locations
3. **Application Cache**: In-memory (Redis, Memcached)
4. **Database Cache**: Query result cache

**Cache Patterns:**
- **Cache-Aside**: Application manages cache
- **Write-Through**: Write to cache and DB
- **Write-Back**: Write to cache, async to DB
- **Refresh-Ahead**: Pre-populate cache

**Cache Invalidation:**
- TTL (Time To Live)
- Event-based invalidation
- Manual invalidation

### Database Design

**SQL vs NoSQL:**
- **SQL**: ACID, structured data, complex queries
- **NoSQL**: Scalability, flexibility, eventual consistency

**Database Replication:**
- **Master-Slave**: Read scaling
- **Master-Master**: Write scaling, more complex
- **Multi-Master**: Multiple write nodes

**Database Sharding:**
- Horizontal partitioning
- Shard by user ID, geographic location
- Consistent hashing for distribution

## Design Patterns

### Microservices Architecture

**Benefits:**
- Independent scaling
- Technology diversity
- Fault isolation
- Team autonomy

**Challenges:**
- Service communication
- Data consistency
- Distributed transactions
- Increased complexity

**Service Communication:**
- **Synchronous**: REST, gRPC
- **Asynchronous**: Message queues (Kafka, RabbitMQ)

### Event-Driven Architecture

**Components:**
- Event producers
- Event bus (message broker)
- Event consumers

**Benefits:**
- Loose coupling
- Scalability
- Resilience

**Use Cases:**
- Real-time processing
- Microservices communication
- Event sourcing

## Comprehensive Design Examples

### Design a URL Shortener (like bit.ly)

**Requirements:**
- Shorten long URLs
- Redirect to original URL
- 100M URLs per day
- 10:1 read/write ratio

**Capacity Estimation:**
- Writes: 100M/day = ~1,160 writes/sec
- Reads: 1B/day = ~11,600 reads/sec
- Storage: 100M URLs * 500 bytes = 50GB/year

**High-Level Design:**
```
Client → Load Balancer → Web Servers → Database
                              ↓
                          Cache (Redis)
```

**Detailed Design:**
- **Encoding**: Base62 encoding (a-z, A-Z, 0-9)
- **Database**: Key-value store (original URL as value)
- **Cache**: Hot URLs in Redis
- **Scale**: Database sharding by hash of short URL

### Design a Distributed Cache

**Requirements:**
- Store key-value pairs
- High availability
- Low latency
- Handle 1M requests/sec

**Design:**
- **Consistent Hashing**: Distribute keys across nodes
- **Replication**: Each key on N nodes
- **Eviction Policy**: LRU (Least Recently Used)
- **Cache Invalidation**: TTL + event-based

## Comprehensive Interview Questions

### Q1: Design a scalable web application handling 1M users

**Answer:**

**Architecture:**
```
Users
  ↓
CDN (Static Assets)
  ↓
Load Balancer (Multi-Region)
  ↓
Web Servers (Stateless, Auto-Scaling)
  ↓
Application Servers
  ├── Cache Layer (Redis Cluster)
  └── Message Queue (Kafka)
       ↓
Database (Sharded, Read Replicas)
  ↓
Object Storage (S3)
```

**Key Decisions:**
- **Stateless Servers**: Enable horizontal scaling
- **Caching**: Reduce database load
- **Database Sharding**: Handle scale
- **CDN**: Reduce latency
- **Message Queue**: Async processing

### Q2: How do you handle database scaling?

**Answer:**

**Vertical Scaling:**
- Increase instance size
- Limited scalability
- Quick solution

**Horizontal Scaling:**
- **Read Replicas**: Scale reads
- **Sharding**: Partition data
- **Caching**: Reduce database load

**Sharding Strategies:**
- **Range-based**: By ID ranges
- **Hash-based**: Consistent hashing
- **Directory-based**: Lookup service

### Q3: Explain CAP theorem

**Answer:**

**CAP Theorem:**
- **Consistency**: All nodes see same data
- **Availability**: System remains operational
- **Partition Tolerance**: System works despite network failures

**Trade-offs:**
- **CP**: Consistency + Partition tolerance (e.g., MongoDB)
- **AP**: Availability + Partition tolerance (e.g., Cassandra)
- **CA**: Not possible in distributed systems

**Real-world:**
- Most systems choose AP or CP
- Depends on use case
- Can tune based on requirements

## Recommended Resources

### Books
- **"Designing Data-Intensive Applications" by Martin Kleppmann** - Comprehensive system design
- **"System Design Interview" by Alex Xu** - Interview preparation

### Articles
- [High Scalability Blog](http://highscalability.com/)
- [System Design Primer](https://github.com/donnemartin/system-design-primer)

---

**Previous**: [Monitoring & Logging](13-monitoring-logging) | **Next**: [Security Best Practices](15-security)
