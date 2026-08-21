// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface TopicPerformance {
  id: string;
  name: string;
  code: string;
  proficiency: number; // 0 - 100
  totalQuestions: number;
  accuracy: number;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

export interface RecentAssessment {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  questionsCount: number;
  abilityScore: number;
  status: 'completed' | 'in_progress';
}

export interface AbilityDataPoint {
  questionNumber: string;
  ability: number;
  difficulty: number;
  topic: string;
  correct: boolean;
}

export const DIFFICULTY_LEVEL_TO_SCORE: Record<number, number> = {
  1: 15,
  2: 30,
  3: 50,
  4: 70,
  5: 88,
};

export function getDifficultyScoreFromLevel(level: number): number {
  return DIFFICULTY_LEVEL_TO_SCORE[level] ?? 50;
}

export interface AssessmentQuestion {
  id: string;
  topic: string;         // "DSA" | "DBMS" | "OS" | "CN"
  subtopic: string;
  difficultyLabel: string;
  difficultyLevel: number; // 1–5
  difficultyScore: number; // 0–100 continuous score
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AdminQuestionItem {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  difficultyLevel: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  status: "pending" | "approved" | "rejected";
  sourceLabel: string;
}

// ─── Demo Student ─────────────────────────────────────────────────────────────

export const MOCK_STUDENT = {
  name: "Demo Student",
  email: "demo@parakh.edu",
  avatarUrl: "",
  rollNumber: "DEMO-001",
  overallProficiency: 72,
  estimatedAbilityLevel: "Intermediate",
  assessmentsCompleted: 6,
  totalQuestionsAnswered: 52,
  avgResponseTimeSec: 38,
};

// ─── Topics ───────────────────────────────────────────────────────────────────

export const MOCK_TOPICS: TopicPerformance[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    code: "DSA",
    proficiency: 82,
    totalQuestions: 20,
    accuracy: 80,
    trend: "up",
    color: "#6366f1",
  },
  {
    id: "os",
    name: "Operating Systems",
    code: "OS",
    proficiency: 74,
    totalQuestions: 15,
    accuracy: 73,
    trend: "up",
    color: "#06b6d4",
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    code: "DBMS",
    proficiency: 60,
    totalQuestions: 12,
    accuracy: 58,
    trend: "down",
    color: "#f59e0b",
  },
  {
    id: "cn",
    name: "Computer Networks",
    code: "CN",
    proficiency: 55,
    totalQuestions: 10,
    accuracy: 54,
    trend: "neutral",
    color: "#ec4899",
  },
];

// ─── Demo Assessment History ──────────────────────────────────────────────────

export const MOCK_RECENT_ASSESSMENTS: RecentAssessment[] = [
  {
    id: "sess-001",
    title: "Mixed Adaptive Session",
    subject: "Mixed",
    date: "Today",
    score: 78,
    questionsCount: 10,
    abilityScore: 72,
    status: "completed",
  },
  {
    id: "sess-002",
    title: "DBMS Focus Drill",
    subject: "DBMS",
    date: "Yesterday",
    score: 60,
    questionsCount: 5,
    abilityScore: 58,
    status: "completed",
  },
  {
    id: "sess-003",
    title: "DSA Practice",
    subject: "DSA",
    date: "2 days ago",
    score: 85,
    questionsCount: 10,
    abilityScore: 82,
    status: "completed",
  },
  {
    id: "sess-004",
    title: "OS Synchronization",
    subject: "OS",
    date: "4 days ago",
    score: 70,
    questionsCount: 5,
    abilityScore: 68,
    status: "completed",
  },
];

// ─── Ability Trajectory (demo history for analytics page) ────────────────────

export const MOCK_ABILITY_TRAJECTORY: AbilityDataPoint[] = [
  { questionNumber: "Q1", ability: 50, difficulty: 2, topic: "DSA", correct: true },
  { questionNumber: "Q2", ability: 58, difficulty: 3, topic: "DBMS", correct: true },
  { questionNumber: "Q3", ability: 64, difficulty: 3, topic: "OS", correct: true },
  { questionNumber: "Q4", ability: 72, difficulty: 4, topic: "DSA", correct: true },
  { questionNumber: "Q5", ability: 66, difficulty: 4, topic: "DBMS", correct: false },
  { questionNumber: "Q6", ability: 73, difficulty: 3, topic: "CN", correct: true },
  { questionNumber: "Q7", ability: 80, difficulty: 4, topic: "OS", correct: true },
  { questionNumber: "Q8", ability: 74, difficulty: 5, topic: "DSA", correct: false },
  { questionNumber: "Q9", ability: 79, difficulty: 4, topic: "DBMS", correct: true },
  { questionNumber: "Q10", ability: 83, difficulty: 4, topic: "DSA", correct: true },
];

// ─── Demo Insights ────────────────────────────────────────────────────────────

export const MOCK_STRENGTHS = [
  {
    topic: "Data Structures",
    detail: "Strong accuracy on tree traversal and graph problems.",
  },
  {
    topic: "OS Memory Management",
    detail: "Consistent performance on paging and virtual memory questions.",
  },
];

export const MOCK_AREAS_TO_IMPROVE = [
  {
    topic: "DBMS Normalization",
    detail: "Lower accuracy on 3NF vs BCNF dependency questions.",
    recommendedAction: "Review functional dependency rules.",
  },
  {
    topic: "Computer Networks",
    detail: "TCP congestion control and sliding window protocols.",
    recommendedAction: "Practice flow control problem sets.",
  },
];

// ─── Raw Question Bank (60 questions across DSA/DBMS/OS/CN, difficulty 1–5, 15 per topic) ──

const RAW_QUESTION_BANK: Array<Omit<AssessmentQuestion, "difficultyScore">> = [
  // ── DSA (15 questions: 3 per difficulty level) ────────────────────────────
  {
    id: "dsa-1",
    topic: "DSA",
    subtopic: "Arrays",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "What is the time complexity of accessing an element in an array by index?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctOptionIndex: 2,
    explanation: "Array elements are stored in contiguous memory. Accessing by index computes the address directly, giving O(1) constant time.",
  },
  {
    id: "dsa-7",
    topic: "DSA",
    subtopic: "Stacks",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which data structure operates strictly on a Last-In, First-Out (LIFO) principle?",
    options: ["Queue", "Stack", "Priority Queue", "Deque"],
    correctOptionIndex: 1,
    explanation: "A Stack enforces Last-In, First-Out (LIFO) access, where elements are inserted and removed from the same end (the top).",
  },
  {
    id: "dsa-8",
    topic: "DSA",
    subtopic: "Queues",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "In a standard FIFO queue, new elements are inserted at the ______ and removed from the ______.",
    options: ["Front; Rear", "Rear; Front", "Top; Bottom", "Head; Tail"],
    correctOptionIndex: 1,
    explanation: "Queues follow First-In, First-Out (FIFO): enqueue occurs at the rear (tail) and dequeue occurs at the front (head).",
  },
  {
    id: "dsa-2",
    topic: "DSA",
    subtopic: "Linked Lists",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "In a singly linked list, which operation is O(1) when performed at the head?",
    options: ["Deletion at tail", "Insertion at head", "Searching for a value", "Reversing the list"],
    correctOptionIndex: 1,
    explanation: "Insertion at the head only requires updating the head pointer, which takes O(1). All other options require traversal.",
  },
  {
    id: "dsa-9",
    topic: "DSA",
    subtopic: "Searching",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "What is the worst-case time complexity of Binary Search on a sorted array of n elements?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctOptionIndex: 1,
    explanation: "Binary search cuts the search space in half with each comparison, yielding a worst-case time complexity of O(log n).",
  },
  {
    id: "dsa-10",
    topic: "DSA",
    subtopic: "Hashing",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "In a hash table using separate chaining, what is the expected average-case lookup time complexity under uniform hashing?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctOptionIndex: 0,
    explanation: "With uniform hashing and an appropriate load factor, the expected chain length is O(1), making average lookup O(1).",
  },
  {
    id: "dsa-3",
    topic: "DSA",
    subtopic: "Binary Trees",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which traversal of a Binary Search Tree produces keys in sorted ascending order?",
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
    correctOptionIndex: 1,
    explanation: "In-order traversal (Left → Root → Right) visits BST nodes in non-decreasing order because every left subtree contains smaller keys.",
  },
  {
    id: "dsa-4",
    topic: "DSA",
    subtopic: "Sorting",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which sorting algorithm has guaranteed O(n log n) worst-case time complexity without relying on randomized pivots?",
    options: ["Bubble Sort — O(n²)", "Merge Sort — O(n log n)", "Insertion Sort — O(n²)", "Selection Sort — O(n²)"],
    correctOptionIndex: 1,
    explanation: "Merge Sort divides the array recursively and merges in O(n) per level, guaranteeing O(n log n) time even in the worst case.",
  },
  {
    id: "dsa-11",
    topic: "DSA",
    subtopic: "Heaps",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "What is the time complexity to build a Binary Min-Heap from an unsorted array of n elements using Floyd's bottom-up algorithm?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
    correctOptionIndex: 1,
    explanation: "Bottom-up heap construction (sift-down on internal nodes) runs in linear time O(n) because the sum of heights across all nodes converges to 2n.",
  },
  {
    id: "dsa-5",
    topic: "DSA",
    subtopic: "Graph Algorithms",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "What is the worst-case time complexity of Dijkstra's algorithm using a binary Min-Heap for a graph with V vertices and E edges?",
    options: ["O(V²)", "O((V + E) log V)", "O(V × E)", "O(E log E)"],
    correctOptionIndex: 1,
    explanation: "With a binary min-heap, each vertex is extracted once (O(V log V)) and each edge is relaxed once (O(E log V)), giving O((V + E) log V) total.",
  },
  {
    id: "dsa-12",
    topic: "DSA",
    subtopic: "Graph Algorithms",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which algorithm finds the single-source shortest path in a directed graph that may contain negative edge weights and can detect negative cycles?",
    options: ["Dijkstra's Algorithm", "Prim's Algorithm", "Bellman-Ford Algorithm", "Kruskal's Algorithm"],
    correctOptionIndex: 2,
    explanation: "The Bellman-Ford algorithm relaxes all edges V-1 times in O(V × E) time and detects negative-weight cycles if an edge can still be relaxed on the V-th pass.",
  },
  {
    id: "dsa-13",
    topic: "DSA",
    subtopic: "Self-Balancing Trees",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "In an AVL Tree, when an insertion into the right subtree of the right child causes an imbalance (balance factor = -2), which single rotation restores balance?",
    options: ["Left Rotation (RR)", "Right Rotation (LL)", "Left-Right Rotation (LR)", "Right-Left Rotation (RL)"],
    correctOptionIndex: 0,
    explanation: "An insertion in the right subtree of the right child is a Right-Right (RR) case, which is fixed with a single Left Rotation around the unbalanced node.",
  },
  {
    id: "dsa-6",
    topic: "DSA",
    subtopic: "Dynamic Programming",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In the 0/1 Knapsack problem with n items and maximum weight capacity W, the standard Dynamic Programming solution has time complexity:",
    options: ["O(n log n)", "O(n + W)", "O(n × W)", "O(2ⁿ)"],
    correctOptionIndex: 2,
    explanation: "The DP table has n rows and W+1 columns. Filling each cell takes O(1), so the total is O(n × W) — a pseudo-polynomial time complexity.",
  },
  {
    id: "dsa-14",
    topic: "DSA",
    subtopic: "String Algorithms",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "What is the worst-case time complexity of the Knuth-Morris-Pratt (KMP) string matching algorithm for a text of length n and pattern of length m?",
    options: ["O(n × m)", "O(n + m)", "O(n log m)", "O(m log n)"],
    correctOptionIndex: 1,
    explanation: "KMP preprocesses the pattern into a prefix array in O(m) time and scans the text without backtracking in O(n) time, achieving O(n + m) overall.",
  },
  {
    id: "dsa-15",
    topic: "DSA",
    subtopic: "Network Flow",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In a flow network with V vertices and E edges, what is the upper-bound time complexity of the Edmonds-Karp maximum flow algorithm (BFS augmenting paths)?",
    options: ["O(V × E²)", "O(V² × E)", "O(E log V)", "O(V³)"],
    correctOptionIndex: 0,
    explanation: "The Edmonds-Karp algorithm uses BFS to find shortest augmenting paths. Each augmentation takes O(E), and there are at most O(V × E) total augmentations, yielding O(V × E²).",
  },

  // ── DBMS (15 questions: 3 per difficulty level) ───────────────────────────
  {
    id: "dbms-1",
    topic: "DBMS",
    subtopic: "SQL Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which SQL command is used to retrieve data from a database table?",
    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
    correctOptionIndex: 2,
    explanation: "SELECT is the SQL Data Query Language (DQL) command used to fetch data from one or more tables based on specified conditions.",
  },
  {
    id: "dbms-6",
    topic: "DBMS",
    subtopic: "SQL Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which SQL clause is used to filter rows in a SELECT statement based on a boolean predicate?",
    options: ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
    correctOptionIndex: 1,
    explanation: "The WHERE clause filters rows before any grouping occurs, returning only rows that satisfy the specified search condition.",
  },
  {
    id: "dbms-7",
    topic: "DBMS",
    subtopic: "Relational Model",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "In the formal relational model, what is a single record or row in a relation table called?",
    options: ["Attribute", "Domain", "Tuple", "Relation Schema"],
    correctOptionIndex: 2,
    explanation: "In relational database theory, a single row representing an entity instance is formally called a Tuple.",
  },
  {
    id: "dbms-2",
    topic: "DBMS",
    subtopic: "Keys",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "A Primary Key in a relational database must satisfy which combination of constraints?",
    options: ["Nullable and unique", "Unique and not null", "Duplicate across rows", "A foreign key from another table"],
    correctOptionIndex: 1,
    explanation: "A Primary Key uniquely identifies each row. It must be unique (no duplicate values) and NOT NULL (every row must have a value).",
  },
  {
    id: "dbms-8",
    topic: "DBMS",
    subtopic: "Integrity Constraints",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "A Foreign Key constraint in a relational database is designed to enforce:",
    options: ["Entity Integrity", "Referential Integrity", "Domain Integrity", "User-defined Integrity"],
    correctOptionIndex: 1,
    explanation: "Referential Integrity ensures that foreign key values in a child table correspond to valid primary key values in the referenced parent table.",
  },
  {
    id: "dbms-9",
    topic: "DBMS",
    subtopic: "ACID Properties",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "Which ACID property guarantees that either all operations of a database transaction execute successfully or none of them do?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctOptionIndex: 0,
    explanation: "Atomicity ensures 'all-or-nothing' execution. If any operation within the transaction fails, the entire transaction is rolled back.",
  },
  {
    id: "dbms-3",
    topic: "DBMS",
    subtopic: "Normalization",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which normal form eliminates transitive functional dependencies of non-prime attributes on candidate keys?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctOptionIndex: 2,
    explanation: "Third Normal Form (3NF) requires a relation to be in 2NF and have no non-prime attribute transitively dependent on any candidate key.",
  },
  {
    id: "dbms-10",
    topic: "DBMS",
    subtopic: "Indexing",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which data structure is most widely used by relational database storage engines for disk-based clustered and secondary indexes?",
    options: ["Binary Search Tree", "B+ Tree", "AVL Tree", "Red-Black Tree"],
    correctOptionIndex: 1,
    explanation: "B+ Trees store all data/pointers in leaf nodes linked sequentially, providing high fan-out, shallow tree depth, and fast range scans on disk.",
  },
  {
    id: "dbms-11",
    topic: "DBMS",
    subtopic: "Transactions",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "In ANSI SQL transaction isolation levels, what is a 'Dirty Read'?",
    options: [
      "A transaction reads uncommitted changes made by another concurrent transaction",
      "A transaction re-reads a row and finds modified column values committed by another transaction",
      "A transaction re-executes a range query and discovers newly inserted rows",
      "Two transactions concurrently overwrite the same row without locking"
    ],
    correctOptionIndex: 0,
    explanation: "A Dirty Read occurs when Transaction A reads data modified by Transaction B that has not yet been committed (and may later be rolled back).",
  },
  {
    id: "dbms-4",
    topic: "DBMS",
    subtopic: "Concurrency Control",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which locking protocol prevents cascading aborts by holding all exclusive (write) locks until the transaction commits or terminates?",
    options: ["Conservative 2PL", "Strict 2PL", "Basic Timestamp Ordering", "Optimistic Concurrency Control"],
    correctOptionIndex: 1,
    explanation: "Strict Two-Phase Locking (Strict 2PL) holds all exclusive locks until end-of-transaction (commit/abort), ensuring dirty data is never exposed.",
  },
  {
    id: "dbms-12",
    topic: "DBMS",
    subtopic: "Database Recovery",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "In database crash recovery using Write-Ahead Logging (WAL), what rule must strictly be enforced before writing a modified data page to disk?",
    options: [
      "The entire database must be snapshotted",
      "The corresponding log record containing undo/redo info must be flushed to stable storage first",
      "All active transactions must commit",
      "The undo table must be deleted"
    ],
    correctOptionIndex: 1,
    explanation: "WAL requires that log records describing a database modification must be written to non-volatile stable storage before the dirty page is written to disk.",
  },
  {
    id: "dbms-13",
    topic: "DBMS",
    subtopic: "Query Optimization",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "In relational query execution, which join algorithm is optimal when both input relations are already sorted on the join attributes?",
    options: ["Nested Loop Join", "Block Nested Loop Join", "Sort-Merge Join", "Grace Hash Join"],
    correctOptionIndex: 2,
    explanation: "When both relations are already sorted, Sort-Merge Join scans each relation in a single linear pass (O(M + N)), avoiding nested loops and hash tables.",
  },
  {
    id: "dbms-5",
    topic: "DBMS",
    subtopic: "Normalization",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "Which condition must hold for a relation schema R to be in Boyce-Codd Normal Form (BCNF)?",
    options: [
      "Every non-prime attribute is fully dependent on the primary key",
      "For every non-trivial functional dependency X → Y in R, X must be a superkey",
      "There are no multi-valued dependencies",
      "All foreign keys reference valid primary keys"
    ],
    correctOptionIndex: 1,
    explanation: "BCNF requires that for every non-trivial functional dependency X → Y, X must be a superkey. This is strictly stronger than 3NF.",
  },
  {
    id: "dbms-14",
    topic: "DBMS",
    subtopic: "Concurrency Control",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In Multiversion Timestamp Ordering (MVTO), a write operation W(Q) with timestamp TS(T) is rejected and transaction T rolled back if:",
    options: [
      "TS(T) < R-timestamp(Qk), where Qk is the version with the largest write timestamp ≤ TS(T)",
      "TS(T) > W-timestamp(Qk)",
      "R-timestamp(Qk) equals W-timestamp(Qk)",
      "TS(T) is greater than the system clock"
    ],
    correctOptionIndex: 0,
    explanation: "In MVTO, if TS(T) < R-timestamp(Qk), it means a transaction with a larger timestamp has already read Qk, so T's belated write would invalidate that read.",
  },
  {
    id: "dbms-15",
    topic: "DBMS",
    subtopic: "Advanced Normalization",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "What distinguishes Fourth Normal Form (4NF) from Boyce-Codd Normal Form (BCNF)?",
    options: [
      "4NF eliminates transitive functional dependencies",
      "4NF requires that every non-trivial multivalued dependency X ↠ Y has X as a superkey",
      "4NF allows partial primary key dependencies",
      "4NF applies only to denormalized star schemas"
    ],
    correctOptionIndex: 1,
    explanation: "4NF deals with Multivalued Dependencies (MVDs). A relation is in 4NF if it is in BCNF and for every non-trivial MVD X ↠ Y, X is a superkey.",
  },

  // ── OS (15 questions: 3 per difficulty level) ─────────────────────────────
  {
    id: "os-1",
    topic: "OS",
    subtopic: "OS Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which of the following is NOT a core responsibility of an Operating System kernel?",
    options: ["Memory management", "Process scheduling", "Compiling high-level source code", "File system management"],
    correctOptionIndex: 2,
    explanation: "Compiling source code is the job of a user-level compiler (e.g., gcc), not the OS kernel. The OS manages hardware resources, processes, memory, and I/O.",
  },
  {
    id: "os-6",
    topic: "OS",
    subtopic: "Process Concept",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "In operating systems, a program in execution loaded into main memory is called a:",
    options: ["Instruction", "Process", "Thread Pool", "System Call"],
    correctOptionIndex: 1,
    explanation: "A Process is an active instance of a program in execution, containing program code, current activity (PC, registers), and memory sections (stack, heap).",
  },
  {
    id: "os-7",
    topic: "OS",
    subtopic: "OS Architecture",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "In dual-mode operating system architecture, user applications execute in ______ mode, while the kernel executes in ______ mode.",
    options: ["Kernel; User", "User; Kernel (Privileged)", "Protected; Supervisor", "Real; Virtual"],
    correctOptionIndex: 1,
    explanation: "Dual-mode operation uses a hardware mode bit: User Mode restricts privileged instructions, while Kernel (Privileged/Supervisor) Mode has full hardware access.",
  },
  {
    id: "os-2",
    topic: "OS",
    subtopic: "CPU Scheduling",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "In Round-Robin CPU scheduling, what parameter directly dictates how frequently context switches occur?",
    options: ["Process priority", "Memory size", "Time quantum (time slice)", "Number of CPU cores"],
    correctOptionIndex: 2,
    explanation: "Round-Robin assigns each process a fixed time quantum. A smaller time quantum increases the frequency of timer interrupts and context switches.",
  },
  {
    id: "os-8",
    topic: "OS",
    subtopic: "Threads",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "Which of the following resources is shared among all peer threads within the same process?",
    options: ["Register values", "Stack memory", "Heap memory and global variables", "Program counter"],
    correctOptionIndex: 2,
    explanation: "Threads of the same process share the text (code), data (globals), heap, and open files, but each thread maintains its own private stack and register state.",
  },
  {
    id: "os-9",
    topic: "OS",
    subtopic: "CPU Scheduling",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "Which CPU scheduling algorithm can cause indefinite blocking (starvation) for processes with large burst times?",
    options: ["First-Come, First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "First-In, First-Out (FIFO)"],
    correctOptionIndex: 2,
    explanation: "Shortest Job First (SJF) always prioritizes shorter jobs, which can starve longer processes if short processes continuously arrive.",
  },
  {
    id: "os-3",
    topic: "OS",
    subtopic: "Process Synchronization",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which of the following is NOT one of Coffman's four necessary conditions for a deadlock to occur?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption Enabled", "Circular Wait"],
    correctOptionIndex: 2,
    explanation: "Deadlock requires No Preemption (resources cannot be forcibly taken). If preemption is enabled, resources can be reclaimed, preventing deadlock.",
  },
  {
    id: "os-10",
    topic: "OS",
    subtopic: "Synchronization Primitives",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "What is the primary role of a Counting Semaphore in concurrent programming?",
    options: [
      "To allocate CPU caches to threads",
      "To control access to a finite set of identical resources via atomic wait() and signal() operations",
      "To manage virtual memory page tables",
      "To encrypt inter-process communication sockets"
    ],
    correctOptionIndex: 1,
    explanation: "A counting semaphore maintains an integer counter initialized to the number of available resource units, updated atomically via wait() and signal().",
  },
  {
    id: "os-11",
    topic: "OS",
    subtopic: "File Systems",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "In Unix-like file systems (such as ext4), what data is stored inside an inode structure?",
    options: [
      "The file's absolute path string and directory entries",
      "File metadata (size, permissions, timestamps) and direct/indirect block pointers",
      "The user's encrypted password and shell path",
      "The contents of the disk partition table"
    ],
    correctOptionIndex: 1,
    explanation: "An inode stores all file metadata (owner, permissions, size, timestamps) and block pointers; file names are stored in directory tables mapping names to inode numbers.",
  },
  {
    id: "os-4",
    topic: "OS",
    subtopic: "Virtual Memory",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which page replacement algorithm suffers from Belady's Anomaly (where increasing the number of physical frames increases page faults)?",
    options: ["Least Recently Used (LRU)", "First-In, First-Out (FIFO)", "Optimal Page Replacement (OPT)", "Second Chance (Clock)"],
    correctOptionIndex: 1,
    explanation: "FIFO does not satisfy the stack property, meaning the set of pages in memory for n frames is not necessarily a subset of n+1 frames, leading to Belady's Anomaly.",
  },
  {
    id: "os-12",
    topic: "OS",
    subtopic: "Deadlock Avoidance",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "In Dijkstra's Banker's Algorithm for deadlock avoidance, a system state is defined as 'Safe' if:",
    options: [
      "No process currently holds any resource",
      "There exists at least one safe execution sequence <P1, P2, ..., Pn> where each process can satisfy its maximum claim and terminate",
      "All resource requests are allocated immediately without checking",
      "Total available resources equal total allocated resources"
    ],
    correctOptionIndex: 1,
    explanation: "A state is safe if the system can allocate resources up to the maximum claim of each process in some sequence without encountering deadlock.",
  },
  {
    id: "os-13",
    topic: "OS",
    subtopic: "Memory Management",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "What condition defines 'Thrashing' in a virtual memory system?",
    options: [
      "High CPU utilization caused by CPU-bound mathematical computation",
      "A pathological state where the OS spends more time swapping pages in/out than executing user instructions",
      "A mechanical failure in disk read/write heads",
      "Rapid memory allocation by multiple concurrent threads"
    ],
    correctOptionIndex: 1,
    explanation: "Thrashing occurs when the sum of process working sets exceeds total physical memory, causing continuous page faults and near-zero CPU throughput.",
  },
  {
    id: "os-5",
    topic: "OS",
    subtopic: "Memory Architecture",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In a segmented-paging virtual memory architecture, how is a logical address translated into a physical memory address?",
    options: [
      "Direct offset addition using a single base register",
      "Segment table lookup finds the page table base → page table lookup maps page to physical frame → frame + offset",
      "Inverted page table hash lookup only",
      "Physical translation via TLB without RAM tables"
    ],
    correctOptionIndex: 1,
    explanation: "In segmented paging, the segment number indexes the segment table to find the page table base for that segment, which translates the page number to a physical frame.",
  },
  {
    id: "os-14",
    topic: "OS",
    subtopic: "Synchronization",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In Peterson's algorithmic solution for two-process mutual exclusion, how does Process i safely enter the critical section?",
    options: [
      "Sets `flag[i] = true` and `turn = j`, then busy-waits while `flag[j] && turn == j`",
      "Sets `flag[i] = false` and `turn = i`, then enters immediately",
      "Executes an atomic hardware test-and-set instruction on a mutex word",
      "Disables all hardware interrupts until leaving the critical section"
    ],
    correctOptionIndex: 0,
    explanation: "Peterson's algorithm sets flag[i] = true (intent) and gives away the turn (turn = j). It enters when either process j has no intent (flag[j] == false) or turn == i.",
  },
  {
    id: "os-15",
    topic: "OS",
    subtopic: "Memory Architecture",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In standard x86-64 4-level paging (PML4) with 4 KB page size, how many index bits of a 48-bit canonical virtual address are mapped to each of the 4 table levels?",
    options: [
      "12 bits each (12 × 4 = 48 bits)",
      "9 bits each (9 × 4 = 36 bits for PML4/PDPT/PD/PT, plus 12-bit page offset)",
      "10 bits each plus 8-bit offset",
      "16 bits each"
    ],
    correctOptionIndex: 1,
    explanation: "4 KB pages have 512 (2⁹) 8-byte entries per table. Thus, 9 bits index each level (PML4, PDPT, PD, PT) = 36 bits, plus a 12-bit offset (2¹² = 4 KB) = 48 bits total.",
  },

  // ── CN (15 questions: 3 per difficulty level) ─────────────────────────────
  {
    id: "cn-1",
    topic: "CN",
    subtopic: "OSI Model",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which layer of the OSI model is responsible for end-to-end communication, error recovery, and flow control between applications?",
    options: ["Network Layer", "Data Link Layer", "Transport Layer", "Physical Layer"],
    correctOptionIndex: 2,
    explanation: "The Transport Layer (Layer 4) provides end-to-end communication, segmentation, error recovery, and flow control via protocols like TCP and UDP.",
  },
  {
    id: "cn-6",
    topic: "CN",
    subtopic: "Network Devices",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which networking hardware device operates at Data Link Layer (Layer 2) to forward frames based on physical MAC addresses?",
    options: ["Repeater", "Switch", "Router", "Gateway"],
    correctOptionIndex: 1,
    explanation: "A Layer 2 Switch maintains a MAC address table and forwards incoming Ethernet frames only to the port connected to the destination MAC address.",
  },
  {
    id: "cn-7",
    topic: "CN",
    subtopic: "Application Protocols",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which application-layer protocol is used to translate human-readable domain names (e.g., example.com) into numerical IP addresses?",
    options: ["HTTP", "DNS", "FTP", "SMTP"],
    correctOptionIndex: 1,
    explanation: "DNS (Domain Name System) is a distributed hierarchical naming system that resolves domain names to IPv4/IPv6 addresses over UDP/TCP port 53.",
  },
  {
    id: "cn-2",
    topic: "CN",
    subtopic: "IP Addressing",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "How many bits are in a standard IPv4 address?",
    options: ["16 bits", "32 bits", "64 bits", "128 bits"],
    correctOptionIndex: 1,
    explanation: "IPv4 addresses are 32 bits (4 bytes) long, typically expressed in dotted-decimal format (e.g., 192.168.1.1). IPv6 addresses are 128 bits.",
  },
  {
    id: "cn-8",
    topic: "CN",
    subtopic: "Transport Protocols",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "What is the foundational architectural difference between TCP and UDP?",
    options: [
      "TCP is connection-oriented with guaranteed reliable delivery; UDP is connectionless and best-effort",
      "UDP provides sliding-window flow control while TCP does not",
      "TCP operates at Layer 3; UDP operates at Layer 4",
      "UDP guarantees strict in-order packet delivery"
    ],
    correctOptionIndex: 0,
    explanation: "TCP provides connection-oriented, reliable byte-stream delivery with ACKs, retransmissions, and flow control; UDP is connectionless with low-overhead best-effort delivery.",
  },
  {
    id: "cn-9",
    topic: "CN",
    subtopic: "Data Link Layer",
    difficultyLabel: "Easy+",
    difficultyLevel: 2,
    questionText: "In IPv4 local networks, which protocol resolves a known target IPv4 address to its physical hardware MAC address?",
    options: ["DHCP", "ICMP", "ARP (Address Resolution Protocol)", "NAT"],
    correctOptionIndex: 2,
    explanation: "ARP broadcasts a query asking 'Who has IP X.X.X.X?' on the local broadcast domain to obtain the associated 48-bit MAC address.",
  },
  {
    id: "cn-3",
    topic: "CN",
    subtopic: "Transport Protocols",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "What event triggers TCP's Fast Retransmit mechanism before the retransmission timer (RTO) expires?",
    options: [
      "Receipt of 3 duplicate ACKs (4 identical ACKs total)",
      "Retransmission timeout (RTO) timer expiration",
      "The advertised receive window dropping to zero",
      "Receipt of a TCP RST packet"
    ],
    correctOptionIndex: 0,
    explanation: "When a sender receives 3 duplicate ACKs for the same segment, it assumes the missing segment was lost and retransmits it immediately without waiting for RTO.",
  },
  {
    id: "cn-10",
    topic: "CN",
    subtopic: "Error Detection",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which error-detection polynomial checksum mechanism is standard in Ethernet frames (Frame Check Sequence)?",
    options: ["Hamming Code (7,4)", "Cyclic Redundancy Check (CRC-32)", "Simple Parity Bit", "Two-dimensional Parity"],
    correctOptionIndex: 1,
    explanation: "Ethernet uses CRC-32 (a 32-bit Cyclic Redundancy Check) in the trailer FCS field to detect transmission bit errors over the physical medium.",
  },
  {
    id: "cn-11",
    topic: "CN",
    subtopic: "Subnetting",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "In IPv4 subnetting with a subnet mask of 255.255.255.224 (/27), how many usable host IP addresses are available per subnet?",
    options: ["30", "32", "62", "14"],
    correctOptionIndex: 0,
    explanation: "A /27 mask leaves 32 - 27 = 5 host bits. Total addresses = 2⁵ = 32. Subtracting 2 (network ID and broadcast address) gives 30 usable host IPs.",
  },
  {
    id: "cn-4",
    topic: "CN",
    subtopic: "Routing Protocols",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which distance-vector routing protocol uses the Bellman-Ford algorithm and enforces a maximum metric limit of 15 hops to mitigate routing loops?",
    options: ["OSPF", "BGP", "RIP (Routing Information Protocol)", "IS-IS"],
    correctOptionIndex: 2,
    explanation: "RIP uses distance-vector routing based on Bellman-Ford with hop count as metric. A metric of 16 represents infinity/unreachable, limiting networks to 15 hops.",
  },
  {
    id: "cn-12",
    topic: "CN",
    subtopic: "Routing Protocols",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which interior gateway routing protocol organizes networks into hierarchical Areas and uses Dijkstra's Shortest Path First (SPF) algorithm on link-state databases?",
    options: ["BGP-4", "OSPF (Open Shortest Path First)", "RIPv2", "EGP"],
    correctOptionIndex: 1,
    explanation: "OSPF is an open standard link-state IGP that floods Link State Advertisements (LSAs) and runs Dijkstra's algorithm to calculate the shortest path tree.",
  },
  {
    id: "cn-13",
    topic: "CN",
    subtopic: "Congestion Control",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "In standard TCP congestion control (Tahoe/Reno), how does the Congestion Window (cwnd) grow during the Slow Start phase?",
    options: [
      "Increases linearly by 1 MSS per RTT",
      "Doubles every RTT (increases by 1 MSS for each acknowledged segment)",
      "Decreases exponentially",
      "Remains constant at the Slow Start threshold (ssthresh)"
    ],
    correctOptionIndex: 1,
    explanation: "In Slow Start, cwnd increases by 1 MSS for every ACK received, resulting in exponential growth (doubling cwnd every round-trip time) until reaching ssthresh.",
  },
  {
    id: "cn-5",
    topic: "CN",
    subtopic: "Congestion Control",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In TCP CUBIC congestion control (default in Linux), how is the congestion window adjusted immediately upon detecting a packet loss event?",
    options: [
      "Multiplicative decrease: cwnd is scaled by factor β (typically cwnd × 0.7)",
      "cwnd resets to 1 MSS and restarts slow start",
      "cwnd remains unchanged while ssthresh doubles",
      "Additive decrease: cwnd decreases by exactly 1 MSS"
    ],
    correctOptionIndex: 0,
    explanation: "TCP CUBIC uses a multiplicative decrease factor β = 0.7 on packet loss, setting ssthresh = cwnd × β and cwnd = ssthresh, then growing via a cubic function of elapsed time.",
  },
  {
    id: "cn-14",
    topic: "CN",
    subtopic: "Transport Protocols",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "During the TCP 3-Way Handshake, if Client A initiates with SYN (`SEQ = 1000`), what values must Server B include in its SYN-ACK response?",
    options: [
      "`ACK = 1000` and `SEQ = 2000`",
      "`ACK = 1001` and its own initial sequence number `SEQ = y`",
      "`ACK = 1000` and `SEQ = 1000`",
      "`ACK = 1002` and `RST = 1`"
    ],
    correctOptionIndex: 1,
    explanation: "Server B acknowledges Client A's SYN by consuming 1 sequence number (`ACK = 1000 + 1 = 1001`) and provides its own independently generated Initial Sequence Number `SEQ = y`.",
  },
  {
    id: "cn-15",
    topic: "CN",
    subtopic: "Inter-Domain Routing",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In the Border Gateway Protocol (BGP-4), what mechanism is primarily used by routers to detect and prevent inter-domain routing loops?",
    options: [
      "Hop count limit of 15",
      "Inspecting the AS_PATH path attribute and discarding route advertisements containing the router's own AS number",
      "Flooding link-state database advertisements periodically",
      "Split-horizon with poison reverse only"
    ],
    correctOptionIndex: 1,
    explanation: "BGP is a path-vector protocol that prepends its Autonomous System (AS) number to the AS_PATH attribute. If a router receives an update containing its own AS number in AS_PATH, it discards it to prevent loops.",
  },
];

// Exported question bank with continuous difficultyScore (0–100) populated for all 60 questions
export const QUESTION_BANK: AssessmentQuestion[] = RAW_QUESTION_BANK.map((q) => ({
  ...q,
  difficultyScore: getDifficultyScoreFromLevel(q.difficultyLevel),
}));

// ─── Admin Question Queue (for admin review page) ─────────────────────────────

export const MOCK_ADMIN_QUESTIONS: AdminQuestionItem[] = [
  {
    id: "q-gen-201",
    topic: "DBMS",
    subtopic: "Normalization",
    difficulty: "Medium",
    difficultyLevel: 3,
    questionText: "Which condition must be met for a relation schema R to be in Boyce-Codd Normal Form (BCNF)?",
    options: [
      "Every non-prime attribute is fully functionally dependent on the primary key.",
      "For every non-trivial functional dependency X → Y, X must be a superkey.",
      "There are no multi-valued dependencies in the relation.",
      "All foreign keys reference primary keys in valid relations."
    ],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question",
  },
  {
    id: "q-gen-202",
    topic: "OS",
    subtopic: "Virtual Memory",
    difficulty: "Hard",
    difficultyLevel: 4,
    questionText: "Which page replacement algorithm suffers from Belady's Anomaly where increasing frames leads to more page faults?",
    options: [
      "Least Recently Used (LRU)",
      "First-In, First-Out (FIFO)",
      "Optimal Page Replacement (OPT)",
      "Second Chance (Clock) Algorithm"
    ],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question",
  },
  {
    id: "q-gen-203",
    topic: "DSA",
    subtopic: "Graph Algorithms",
    difficulty: "Hard",
    difficultyLevel: 4,
    questionText: "What is the worst-case time complexity of Dijkstra's single-source shortest path algorithm using a Min-Heap priority queue?",
    options: ["O(V²)", "O((V + E) log V)", "O(V × E)", "O(E log E)"],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question",
  },
];

// Legacy alias for any references still using MOCK_ASSESSMENT_QUESTIONS
export const MOCK_ASSESSMENT_QUESTIONS = QUESTION_BANK;
