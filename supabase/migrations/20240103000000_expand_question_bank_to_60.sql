-- ─────────────────────────────────────────────────────────────────────────────
-- PARAKH — Expand Question Bank Migration (60 Questions)
-- Phase 5.3: Assessment Question Bank Expansion
--
-- Adds 39 additional curated questions to expand the foundation bank (21 items)
-- to a full 60-question bank (15 questions per topic: DSA, DBMS, OS, CN).
-- Exactly 3 questions per difficulty level (1–5) per topic.
--
-- IDEMPOTENT: Uses WHERE NOT EXISTS on question_text to prevent duplicates.
-- ─────────────────────────────────────────────────────────────────────────────

WITH topic_ids AS (
  SELECT id, code FROM public.topics WHERE code IN ('DSA', 'DBMS', 'OS', 'CN')
),
new_questions AS (
  SELECT
    t.id AS topic_id,
    q.subtopic,
    q.difficulty_level,
    q.difficulty_label,
    q.question_text,
    q.options::jsonb AS options,
    q.correct_option_index,
    q.explanation,
    'question_bank' AS source,
    'approved' AS review_status
  FROM topic_ids t
  JOIN (VALUES

    -- ── DSA (9 additional questions) ────────────────────────────────────────

    ('DSA', 'Stacks', 1, 'Easy',
     'Which data structure operates strictly on a Last-In, First-Out (LIFO) principle?',
     '["Queue", "Stack", "Priority Queue", "Deque"]',
     1,
     'A Stack enforces Last-In, First-Out (LIFO) access, where elements are inserted and removed from the same end (the top).'),

    ('DSA', 'Queues', 1, 'Easy',
     'In a standard FIFO queue, new elements are inserted at the ______ and removed from the ______.',
     '["Front; Rear", "Rear; Front", "Top; Bottom", "Head; Tail"]',
     1,
     'Queues follow First-In, First-Out (FIFO): enqueue occurs at the rear (tail) and dequeue occurs at the front (head).'),

    ('DSA', 'Searching', 2, 'Easy+',
     'What is the worst-case time complexity of Binary Search on a sorted array of n elements?',
     '["O(1)", "O(log n)", "O(n)", "O(n log n)"]',
     1,
     'Binary search cuts the search space in half with each comparison, yielding a worst-case time complexity of O(log n).'),

    ('DSA', 'Hashing', 2, 'Easy+',
     'In a hash table using separate chaining, what is the expected average-case lookup time complexity under uniform hashing?',
     '["O(1)", "O(log n)", "O(n)", "O(n²)"]',
     0,
     'With uniform hashing and an appropriate load factor, the expected chain length is O(1), making average lookup O(1).'),

    ('DSA', 'Heaps', 3, 'Medium',
     'What is the time complexity to build a Binary Min-Heap from an unsorted array of n elements using Floyd''s bottom-up algorithm?',
     '["O(log n)", "O(n)", "O(n log n)", "O(n²)"]',
     1,
     'Bottom-up heap construction (sift-down on internal nodes) runs in linear time O(n) because the sum of heights across all nodes converges to 2n.'),

    ('DSA', 'Graph Algorithms', 4, 'Hard',
     'Which algorithm finds the single-source shortest path in a directed graph that may contain negative edge weights and can detect negative cycles?',
     '["Dijkstra''s Algorithm", "Prim''s Algorithm", "Bellman-Ford Algorithm", "Kruskal''s Algorithm"]',
     2,
     'The Bellman-Ford algorithm relaxes all edges V-1 times in O(V × E) time and detects negative-weight cycles if an edge can still be relaxed on the V-th pass.'),

    ('DSA', 'Self-Balancing Trees', 4, 'Hard',
     'In an AVL Tree, when an insertion into the right subtree of the right child causes an imbalance (balance factor = -2), which single rotation restores balance?',
     '["Left Rotation (RR)", "Right Rotation (LL)", "Left-Right Rotation (LR)", "Right-Left Rotation (RL)"]',
     0,
     'An insertion in the right subtree of the right child is a Right-Right (RR) case, which is fixed with a single Left Rotation around the unbalanced node.'),

    ('DSA', 'String Algorithms', 5, 'Very Hard',
     'What is the worst-case time complexity of the Knuth-Morris-Pratt (KMP) string matching algorithm for a text of length n and pattern of length m?',
     '["O(n × m)", "O(n + m)", "O(n log m)", "O(m log n)"]',
     1,
     'KMP preprocesses the pattern into a prefix array in O(m) time and scans the text without backtracking in O(n) time, achieving O(n + m) overall.'),

    ('DSA', 'Network Flow', 5, 'Very Hard',
     'In a flow network with V vertices and E edges, what is the upper-bound time complexity of the Edmonds-Karp maximum flow algorithm (BFS augmenting paths)?',
     '["O(V × E²)", "O(V² × E)", "O(E log V)", "O(V³)"]',
     0,
     'The Edmonds-Karp algorithm uses BFS to find shortest augmenting paths. Each augmentation takes O(E), and there are at most O(V × E) total augmentations, yielding O(V × E²).'),

    -- ── DBMS (10 additional questions) ──────────────────────────────────────

    ('DBMS', 'SQL Basics', 1, 'Easy',
     'Which SQL clause is used to filter rows in a SELECT statement based on a boolean predicate?',
     '["GROUP BY", "WHERE", "ORDER BY", "HAVING"]',
     1,
     'The WHERE clause filters rows before any grouping occurs, returning only rows that satisfy the specified search condition.'),

    ('DBMS', 'Relational Model', 1, 'Easy',
     'In the formal relational model, what is a single record or row in a relation table called?',
     '["Attribute", "Domain", "Tuple", "Relation Schema"]',
     2,
     'In relational database theory, a single row representing an entity instance is formally called a Tuple.'),

    ('DBMS', 'Integrity Constraints', 2, 'Easy+',
     'A Foreign Key constraint in a relational database is designed to enforce:',
     '["Entity Integrity", "Referential Integrity", "Domain Integrity", "User-defined Integrity"]',
     1,
     'Referential Integrity ensures that foreign key values in a child table correspond to valid primary key values in the referenced parent table.'),

    ('DBMS', 'ACID Properties', 2, 'Easy+',
     'Which ACID property guarantees that either all operations of a database transaction execute successfully or none of them do?',
     '["Atomicity", "Consistency", "Isolation", "Durability"]',
     0,
     'Atomicity ensures ''all-or-nothing'' execution. If any operation within the transaction fails, the entire transaction is rolled back.'),

    ('DBMS', 'Indexing', 3, 'Medium',
     'Which data structure is most widely used by relational database storage engines for disk-based clustered and secondary indexes?',
     '["Binary Search Tree", "B+ Tree", "AVL Tree", "Red-Black Tree"]',
     1,
     'B+ Trees store all data/pointers in leaf nodes linked sequentially, providing high fan-out, shallow tree depth, and fast range scans on disk.'),

    ('DBMS', 'Transactions', 3, 'Medium',
     'In ANSI SQL transaction isolation levels, what is a ''Dirty Read''?',
     '["A transaction reads uncommitted changes made by another concurrent transaction", "A transaction re-reads a row and finds modified column values committed by another transaction", "A transaction re-executes a range query and discovers newly inserted rows", "Two transactions concurrently overwrite the same row without locking"]',
     0,
     'A Dirty Read occurs when Transaction A reads data modified by Transaction B that has not yet been committed (and may later be rolled back).'),

    ('DBMS', 'Database Recovery', 4, 'Hard',
     'In database crash recovery using Write-Ahead Logging (WAL), what rule must strictly be enforced before writing a modified data page to disk?',
     '["The entire database must be snapshotted", "The corresponding log record containing undo/redo info must be flushed to stable storage first", "All active transactions must commit", "The undo table must be deleted"]',
     1,
     'WAL requires that log records describing a database modification must be written to non-volatile stable storage before the dirty page is written to disk.'),

    ('DBMS', 'Query Optimization', 4, 'Hard',
     'In relational query execution, which join algorithm is optimal when both input relations are already sorted on the join attributes?',
     '["Nested Loop Join", "Block Nested Loop Join", "Sort-Merge Join", "Grace Hash Join"]',
     2,
     'When both relations are already sorted, Sort-Merge Join scans each relation in a single linear pass (O(M + N)), avoiding nested loops and hash tables.'),

    ('DBMS', 'Concurrency Control', 5, 'Very Hard',
     'In Multiversion Timestamp Ordering (MVTO), a write operation W(Q) with timestamp TS(T) is rejected and transaction T rolled back if:',
     '["TS(T) < R-timestamp(Qk), where Qk is the version with the largest write timestamp ≤ TS(T)", "TS(T) > W-timestamp(Qk)", "R-timestamp(Qk) equals W-timestamp(Qk)", "TS(T) is greater than the system clock"]',
     0,
     'In MVTO, if TS(T) < R-timestamp(Qk), it means a transaction with a larger timestamp has already read Qk, so T''s belated write would invalidate that read.'),

    ('DBMS', 'Advanced Normalization', 5, 'Very Hard',
     'What distinguishes Fourth Normal Form (4NF) from Boyce-Codd Normal Form (BCNF)?',
     '["4NF eliminates transitive functional dependencies", "4NF requires that every non-trivial multivalued dependency X ↠ Y has X as a superkey", "4NF allows partial primary key dependencies", "4NF applies only to denormalized star schemas"]',
     1,
     '4NF deals with Multivalued Dependencies (MVDs). A relation is in 4NF if it is in BCNF and for every non-trivial MVD X ↠ Y, X is a superkey.'),

    -- ── OS (10 additional questions) ────────────────────────────────────────

    ('OS', 'Process Concept', 1, 'Easy',
     'In operating systems, a program in execution loaded into main memory is called a:',
     '["Instruction", "Process", "Thread Pool", "System Call"]',
     1,
     'A Process is an active instance of a program in execution, containing program code, current activity (PC, registers), and memory sections (stack, heap).'),

    ('OS', 'OS Architecture', 1, 'Easy',
     'In dual-mode operating system architecture, user applications execute in ______ mode, while the kernel executes in ______ mode.',
     '["Kernel; User", "User; Kernel (Privileged)", "Protected; Supervisor", "Real; Virtual"]',
     1,
     'Dual-mode operation uses a hardware mode bit: User Mode restricts privileged instructions, while Kernel (Privileged/Supervisor) Mode has full hardware access.'),

    ('OS', 'Threads', 2, 'Easy+',
     'Which of the following resources is shared among all peer threads within the same process?',
     '["Register values", "Stack memory", "Heap memory and global variables", "Program counter"]',
     2,
     'Threads of the same process share the text (code), data (globals), heap, and open files, but each thread maintains its own private stack and register state.'),

    ('OS', 'CPU Scheduling', 2, 'Easy+',
     'Which CPU scheduling algorithm can cause indefinite blocking (starvation) for processes with large burst times?',
     '["First-Come, First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "First-In, First-Out (FIFO)"]',
     2,
     'Shortest Job First (SJF) always prioritizes shorter jobs, which can starve longer processes if short processes continuously arrive.'),

    ('OS', 'Synchronization Primitives', 3, 'Medium',
     'What is the primary role of a Counting Semaphore in concurrent programming?',
     '["To allocate CPU caches to threads", "To control access to a finite set of identical resources via atomic wait() and signal() operations", "To manage virtual memory page tables", "To encrypt inter-process communication sockets"]',
     1,
     'A counting semaphore maintains an integer counter initialized to the number of available resource units, updated atomically via wait() and signal().'),

    ('OS', 'File Systems', 3, 'Medium',
     'In Unix-like file systems (such as ext4), what data is stored inside an inode structure?',
     '["The file''s absolute path string and directory entries", "File metadata (size, permissions, timestamps) and direct/indirect block pointers", "The user''s encrypted password and shell path", "The contents of the disk partition table"]',
     1,
     'An inode stores all file metadata (owner, permissions, size, timestamps) and block pointers; file names are stored in directory tables mapping names to inode numbers.'),

    ('OS', 'Deadlock Avoidance', 4, 'Hard',
     'In Dijkstra''s Banker''s Algorithm for deadlock avoidance, a system state is defined as ''Safe'' if:',
     '["No process currently holds any resource", "There exists at least one safe execution sequence <P1, P2, ..., Pn> where each process can satisfy its maximum claim and terminate", "All resource requests are allocated immediately without checking", "Total available resources equal total allocated resources"]',
     1,
     'A state is safe if the system can allocate resources up to the maximum claim of each process in some sequence without encountering deadlock.'),

    ('OS', 'Memory Management', 4, 'Hard',
     'What condition defines ''Thrashing'' in a virtual memory system?',
     '["High CPU utilization caused by CPU-bound mathematical computation", "A pathological state where the OS spends more time swapping pages in/out than executing user instructions", "A mechanical failure in disk read/write heads", "Rapid memory allocation by multiple concurrent threads"]',
     1,
     'Thrashing occurs when the sum of process working sets exceeds total physical memory, causing continuous page faults and near-zero CPU throughput.'),

    ('OS', 'Synchronization', 5, 'Very Hard',
     'In Peterson''s algorithmic solution for two-process mutual exclusion, how does Process i safely enter the critical section?',
     '["Sets `flag[i] = true` and `turn = j`, then busy-waits while `flag[j] && turn == j`", "Sets `flag[i] = false` and `turn = i`, then enters immediately", "Executes an atomic hardware test-and-set instruction on a mutex word", "Disables all hardware interrupts until leaving the critical section"]',
     0,
     'Peterson''s algorithm sets flag[i] = true (intent) and gives away the turn (turn = j). It enters when either process j has no intent (flag[j] == false) or turn == i.'),

    ('OS', 'Memory Architecture', 5, 'Very Hard',
     'In standard x86-64 4-level paging (PML4) with 4 KB page size, how many index bits of a 48-bit canonical virtual address are mapped to each of the 4 table levels?',
     '["12 bits each (12 × 4 = 48 bits)", "9 bits each (9 × 4 = 36 bits for PML4/PDPT/PD/PT, plus 12-bit page offset)", "10 bits each plus 8-bit offset", "16 bits each"]',
     1,
     '4 KB pages have 512 (2⁹) 8-byte entries per table. Thus, 9 bits index each level (PML4, PDPT, PD, PT) = 36 bits, plus a 12-bit offset (2¹² = 4 KB) = 48 bits total.'),

    -- ── CN (10 additional questions) ────────────────────────────────────────

    ('CN', 'Network Devices', 1, 'Easy',
     'Which networking hardware device operates at Data Link Layer (Layer 2) to forward frames based on physical MAC addresses?',
     '["Repeater", "Switch", "Router", "Gateway"]',
     1,
     'A Layer 2 Switch maintains a MAC address table and forwards incoming Ethernet frames only to the port connected to the destination MAC address.'),

    ('CN', 'Application Protocols', 1, 'Easy',
     'Which application-layer protocol is used to translate human-readable domain names (e.g., example.com) into numerical IP addresses?',
     '["HTTP", "DNS", "FTP", "SMTP"]',
     1,
     'DNS (Domain Name System) is a distributed hierarchical naming system that resolves domain names to IPv4/IPv6 addresses over UDP/TCP port 53.'),

    ('CN', 'Transport Protocols', 2, 'Easy+',
     'What is the foundational architectural difference between TCP and UDP?',
     '["TCP is connection-oriented with guaranteed reliable delivery; UDP is connectionless and best-effort", "UDP provides sliding-window flow control while TCP does not", "TCP operates at Layer 3; UDP operates at Layer 4", "UDP guarantees strict in-order packet delivery"]',
     0,
     'TCP provides connection-oriented, reliable byte-stream delivery with ACKs, retransmissions, and flow control; UDP is connectionless with low-overhead best-effort delivery.'),

    ('CN', 'Data Link Layer', 2, 'Easy+',
     'In IPv4 local networks, which protocol resolves a known target IPv4 address to its physical hardware MAC address?',
     '["DHCP", "ICMP", "ARP (Address Resolution Protocol)", "NAT"]',
     2,
     'ARP broadcasts a query asking ''Who has IP X.X.X.X?'' on the local broadcast domain to obtain the associated 48-bit MAC address.'),

    ('CN', 'Error Detection', 3, 'Medium',
     'Which error-detection polynomial checksum mechanism is standard in Ethernet frames (Frame Check Sequence)?',
     '["Hamming Code (7,4)", "Cyclic Redundancy Check (CRC-32)", "Simple Parity Bit", "Two-dimensional Parity"]',
     1,
     'Ethernet uses CRC-32 (a 32-bit Cyclic Redundancy Check) in the trailer FCS field to detect transmission bit errors over the physical medium.'),

    ('CN', 'Subnetting', 3, 'Medium',
     'In IPv4 subnetting with a subnet mask of 255.255.255.224 (/27), how many usable host IP addresses are available per subnet?',
     '["30", "32", "62", "14"]',
     0,
     'A /27 mask leaves 32 - 27 = 5 host bits. Total addresses = 2⁵ = 32. Subtracting 2 (network ID and broadcast address) gives 30 usable host IPs.'),

    ('CN', 'Routing Protocols', 4, 'Hard',
     'Which interior gateway routing protocol organizes networks into hierarchical Areas and uses Dijkstra''s Shortest Path First (SPF) algorithm on link-state databases?',
     '["BGP-4", "OSPF (Open Shortest Path First)", "RIPv2", "EGP"]',
     1,
     'OSPF is an open standard link-state IGP that floods Link State Advertisements (LSAs) and runs Dijkstra''s algorithm to calculate the shortest path tree.'),

    ('CN', 'Congestion Control', 4, 'Hard',
     'In standard TCP congestion control (Tahoe/Reno), how does the Congestion Window (cwnd) grow during the Slow Start phase?',
     '["Increases linearly by 1 MSS per RTT", "Doubles every RTT (increases by 1 MSS for each acknowledged segment)", "Decreases exponentially", "Remains constant at the Slow Start threshold (ssthresh)"]',
     1,
     'In Slow Start, cwnd increases by 1 MSS for every ACK received, resulting in exponential growth (doubling cwnd every round-trip time) until reaching ssthresh.'),

    ('CN', 'Transport Protocols', 5, 'Very Hard',
     'During the TCP 3-Way Handshake, if Client A initiates with SYN (`SEQ = 1000`), what values must Server B include in its SYN-ACK response?',
     '["`ACK = 1000` and `SEQ = 2000`", "`ACK = 1001` and its own initial sequence number `SEQ = y`", "`ACK = 1000` and `SEQ = 1000`", "`ACK = 1002` and `RST = 1`"]',
     1,
     'Server B acknowledges Client A''s SYN by consuming 1 sequence number (`ACK = 1000 + 1 = 1001`) and provides its own independently generated Initial Sequence Number `SEQ = y`.'),

    ('CN', 'Inter-Domain Routing', 5, 'Very Hard',
     'In the Border Gateway Protocol (BGP-4), what mechanism is primarily used by routers to detect and prevent inter-domain routing loops?',
     '["Hop count limit of 15", "Inspecting the AS_PATH path attribute and discarding route advertisements containing the router''s own AS number", "Flooding link-state database advertisements periodically", "Split-horizon with poison reverse only"]',
     1,
     'BGP is a path-vector protocol that prepends its Autonomous System (AS) number to the AS_PATH attribute. If a router receives an update containing its own AS number in AS_PATH, it discards it to prevent loops.')
  ) AS q(topic_code, subtopic, difficulty_level, difficulty_label, question_text, options, correct_option_index, explanation)
  ON t.code = q.topic_code
)
INSERT INTO public.questions
  (topic_id, subtopic, difficulty_level, difficulty_label, question_text, options, correct_option_index, explanation, source, review_status)
SELECT
  nq.topic_id,
  nq.subtopic,
  nq.difficulty_level,
  nq.difficulty_label,
  nq.question_text,
  nq.options,
  nq.correct_option_index,
  nq.explanation,
  nq.source,
  nq.review_status
FROM new_questions nq
WHERE NOT EXISTS (
  SELECT 1 FROM public.questions existing
  WHERE existing.question_text = nq.question_text
);
