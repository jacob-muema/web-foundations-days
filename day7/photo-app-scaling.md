# SnapShare Scaling & Architecture Plan

## 1. Assumptions & Baseline Calculations

### Starting Facts & Assumptions
- **Total Registered Users:** 10,000,000
- **Daily Active Percentage:** 10%
- **Daily Active Users (DAU):** $10,000,000 \times 10\% = 1,000,000$ active users/day
- **User Activity:**
  - Each active user uploads **1 photo per day**.
  - Each active user views **50 feed pages per day**.
- **Photo Sizes:**
  - Original photo: **2 MB**
  - Generated thumbnail: **50 KB** (0.05 MB)
  - Total per photo: **2.05 MB**
- **Seconds in a Day:** 86,400 seconds
- **Traffic Multiplier for Peak Load:** 5× average traffic

---

## 2. Capacity Estimates & Throughput

### Uploads per Second (Writes)
- **Total Uploads per Day:** $1,000,000 \times 1 = 1,000,000\text{ uploads/day}$
- **Average Uploads / Second:**
  $$\frac{1,000,000\text{ uploads}}{86,400\text{ seconds}} \approx 11.57\text{ uploads/second}$$
- **Peak Uploads / Second ($5\times$):**
  $$11.57 \times 5 \approx 57.87\text{ uploads/second}\quad (\sim 58\text{ uploads/second})$$

### Feed Views per Second (Reads)
- **Total Feed Views per Day:** $1,000,000 \times 50 = 50,000,000\text{ feed views/day}$
- **Average Feed Views / Second:**
  $$\frac{50,000,000\text{ views}}{86,400\text{ seconds}} \approx 578.70\text{ views/second}\quad (\sim 579\text{ views/second})$$
- **Peak Feed Views / Second ($5\times$):**
  $$578.70 \times 5 \approx 2,893.52\text{ views/second}\quad (\sim 2,894\text{ views/second})$$

### Storage Capacity per Year
- **Daily Storage Consumed:**
  - Original photos: $1,000,000 \times 2\text{ MB} = 2,000,000\text{ MB} = 2,000\text{ GB} = 2.00\text{ TB/day}$
  - Thumbnails: $1,000,000 \times 50\text{ KB} = 50,000,000\text{ KB} = 50\text{ GB} = 0.05\text{ TB/day}$
  - Combined daily storage: $2.05\text{ TB/day}$
- **Annual Storage Consumed (365 days):**
  - Original photos: $2.00\text{ TB/day} \times 365 = 730\text{ TB/year}$
  - Thumbnails: $0.05\text{ TB/day} \times 365 = 18.25\text{ TB/year}$
  - **Total Annual Media Storage:** $748.25\text{ TB/year}\quad (\sim 0.75\text{ Petabytes/year})$

---

## 3. Read-Heavy vs. Write-Heavy System

SnapShare is decisively **read-heavy**, operating at a **50:1 read-to-write ratio** (579 feed views/sec vs. 11.6 uploads/sec).

### Architectural Implications
Because the platform experiences 50 times more read requests than write requests:
1. **Aggressive Multi-Tier Caching:** Feed queries and user relationship graphs must be cached in memory (e.g., Redis) so that read operations rarely query persistent database disks.
2. **Database Read Scalability:** The database tier must be separated into a Primary instance (handling writes) and multiple Read Replicas to horizontally scale read throughput.
3. **Global Media Offloading (CDN):** Image and thumbnail delivery must never hit backend servers; static media must be cached globally at the edge on a Content Delivery Network (CDN) directly adjacent to users.

---

## 4. Why Photos Must NOT Be Stored Inside the Database

Photos must **never** be stored as raw binary blobs (BLOBs) inside relational or document databases for the following reasons:
- **Database Performance & Buffer Bloat:** Binary image files consume enormous amounts of database memory, polluting buffer pool caches and displacing hot index and relational row data, causing high disk I/O and query latency.
- **Backup, Replication, and Maintenance Bottlenecks:** Storing ~748 TB of binary media per year inside the database would make backups, database point-in-time recovery, schema migrations, and replication across nodes prohibitively slow and expensive.
- **Connection Holding Times:** Uploading and streaming large binary payloads directly through the database server ties up scarce database connection pools.

### Where Photos Go Instead
Photos and thumbnails must be stored in specialized **Object Storage** (such as Amazon S3, Google Cloud Storage, or MinIO). Object storage is specifically engineered for infinite, cost-effective, high-durability storage of unstructured binary objects. The database only retains lightweight structured metadata records containing the unique object key/URL, user ID, timestamp, and dimensions.

---

## 5. Architecture Diagram (Text Diagram)

```
                            [ User Clients ]
                               /         \
                 Image Views  /           \  Uploads & Feed Requests
                             v             v
                    +----------------+  +--------------------+
                    |      CDN       |  |   Load Balancer    |
                    +----------------+  +--------------------+
                           |                      |
                           | Cache Miss           | Distributes Traffic
                           v                      v
                +--------------------+  +--------------------+
                |   Object Storage   |  |    App Servers     |
                | (Originals/Thumbs) |  |   (Stateless)      |
                +--------------------+  +--------------------+
                     ^            ^      /     |          \
                     |            |     /      |           \
         Worker saves|            |    /       |            \
           thumbnails|            |   /        |             \
                     |   Reads orig  /         |              \
                     |            | v          v               v
                +-------------------+   +-------------+  +---------------+
                | Background Worker |<--| Message     |  | In-Memory     |
                +-------------------+   | Queue       |  | Cache (Redis) |
                          |             +-------------+  +---------------+
                          | Updates                            |
                          | Metadata                           | Cache Aside
                          v                                    v
                     +---------------------------------------------+
                     |                 DATABASE                    |
                     |  +---------------+       +---------------+  |
                     |  |  Primary DB   | ----> | Read Replica  |  |
                     |  |   (Writes)    |Replica|    (Reads)    |  |
                     |  +---------------+       +---------------+  |
                     +---------------------------------------------+
```

---

## 6. Component Explanations (One Sentence per Component)

- **CDN (Content Delivery Network):** Caches and serves photo files and thumbnails from geographic edge locations close to users, minimizing read latency and shielding backend storage from repeated traffic.
- **Load Balancer:** Distributes incoming user traffic evenly across multiple stateless application servers to prevent bottlenecks, maximize throughput, and eliminate single points of failure.
- **App Servers:** Executes core application business logic, handles user authentication, coordinates feed aggregation, and writes metadata without storing state locally.
- **Cache (Redis / Memcached):** Stores frequently accessed timeline feeds, user profiles, and session states in high-speed RAM to dramatically reduce database read queries.
- **Primary Database:** Handles all write operations (photo metadata, follows, user records) and enforces ACID transactional consistency.
- **Read Replica Database:** Continuously mirrors the primary database to serve read-only queries (such as fetching user posts or friend lists) and scale feed reading capacity.
- **Object Storage (e.g., S3):** Provides horizontally scalable, highly durable, and cost-effective distributed storage for unstructured original images and generated thumbnail files.
- **Message Queue (e.g., RabbitMQ / Kafka / SQS):** Decouples time-consuming background tasks from the user-facing request cycle, buffering thumbnail generation jobs reliably.
- **Background Worker:** Asynchronously consumes thumbnail tasks from the message queue, resizes the original images into 50 KB thumbnails, and writes them back to object storage.

---

## 7. Step-by-Step Flow: Uploading a Photo

1. **Client Request:** The user client submits an HTTP POST request containing the 2 MB image file and caption metadata to the Load Balancer.
2. **Request Routing:** The Load Balancer forwards the upload request to an available stateless App Server instance.
3. **Authentication & Validation:** The App Server validates the user session, verifies the uploaded file type and size, and generates a unique photo ID (`photo_id`).
4. **Persist Original Photo:** The App Server streams the 2 MB original image to Object Storage under a deterministic key (e.g., `photos/originals/{photo_id}.jpg`).
5. **Persist Metadata:** The App Server writes the photo record (`photo_id`, `user_id`, `created_at`, `status: processing`, `original_url`) to the Primary Database.
6. **Enqueue Asynchronous Thumbnail Job:** The App Server publishes an event payload `{ "photo_id": "...", "original_url": "..." }` into the Message Queue.
7. **Immediate User Acknowledgment:** The App Server responds with HTTP `201 Created` back to the user client, allowing the user interface to stay responsive without waiting for thumbnail generation.
8. **Worker Consumption:** A Background Worker pulls the job from the Message Queue.
9. **Thumbnail Generation:** The Worker fetches the 2 MB image, resizes and compresses it into a 50 KB thumbnail, and uploads the thumbnail to Object Storage (e.g., `photos/thumbnails/{photo_id}.jpg`).
10. **Metadata & Cache Update:** The Worker updates the photo record in the Database with the `thumbnail_url` and pushes the new post ID into the user's followers' cached timelines in Redis.

---

## 8. Architectural Trade-offs

### Trade-off 1: Asynchronous Thumbnail Processing vs. Synchronous Processing
- **Choice Made:** We decoupled thumbnail generation using a Message Queue and Background Workers rather than processing thumbnails synchronously during the upload request.
- **Advantage:** The user experiences near-instantaneous upload response times (~100-200ms) because the App Server does not perform CPU-intensive image resizing before responding. Peak upload traffic spikes do not crash application servers, as the queue absorbs bursts.
- **Disadvantage / Trade-off:** Eventual consistency. There is a slight window of time (typically 1-3 seconds) where the photo is recorded in the feed, but the thumbnail is still being processed and may temporarily appear as a placeholder or loading skeleton.

### Trade-off 2: Fan-Out on Write (Push) vs. Fan-Out on Read (Pull) for Feeds
- **Choice Made:** A hybrid approach favoring Fan-Out on Write for active users, where uploading a photo pre-computes and inserts the post reference directly into followers' cached Redis feeds.
- **Advantage:** Feed viewing (the dominant 50:1 operation) is exceptionally fast ($O(1)$ lookup from memory), requiring zero expensive multi-table database joins when a user refreshes their feed.
- **Disadvantage / Trade-off:** High write amplification when high-follower accounts ("celebrities" with millions of followers) upload a photo, as thousands/millions of cache writes are triggered at once. (This is mitigated by switching users with >100k followers to a Fan-Out on Read pull pattern).
