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

export interface AssessmentQuestion {
  id: string;
  topic: string;         // "DSA" | "DBMS" | "OS" | "CN"
  subtopic: string;
  difficultyLabel: string;
  difficultyLevel: number; // 1–5
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

// ─── Question Bank (20 questions across DSA/DBMS/OS/CN, difficulty 1–5) ──────

export const QUESTION_BANK: AssessmentQuestion[] = [
  // ── DSA ────────────────────────────────────────────────────────────────────
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
    id: "dsa-2",
    topic: "DSA",
    subtopic: "Linked Lists",
    difficultyLabel: "Easy",
    difficultyLevel: 2,
    questionText: "In a singly linked list, which operation is O(1) when performed at the head?",
    options: ["Deletion at tail", "Insertion at head", "Searching for a value", "Reversing the list"],
    correctOptionIndex: 1,
    explanation: "Insertion at the head only requires updating the head pointer, which takes O(1). All other options require traversal.",
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
    questionText: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort — O(n²)", "Merge Sort — O(n log n)", "Insertion Sort — O(n²)", "Selection Sort — O(n²)"],
    correctOptionIndex: 1,
    explanation: "Merge Sort divides the array recursively and merges in O(n) per level, giving O(n log n) average and worst-case complexity.",
  },
  {
    id: "dsa-5",
    topic: "DSA",
    subtopic: "Graph Algorithms",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "What is the worst-case time complexity of Dijkstra's algorithm using a Min-Heap?",
    options: ["O(V²)", "O((V + E) log V)", "O(V × E)", "O(E log E)"],
    correctOptionIndex: 1,
    explanation: "With a binary min-heap, each vertex is extracted once (O(V log V)) and each edge is relaxed once (O(E log V)), giving O((V + E) log V) total.",
  },
  {
    id: "dsa-6",
    topic: "DSA",
    subtopic: "Dynamic Programming",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In the 0/1 Knapsack problem with n items and capacity W, the standard DP solution has time complexity:",
    options: ["O(n log n)", "O(n + W)", "O(n × W)", "O(2ⁿ)"],
    correctOptionIndex: 2,
    explanation: "The DP table has n rows and W+1 columns. Filling each cell takes O(1), so the total is O(n × W) — pseudo-polynomial time.",
  },
  // ── DBMS ───────────────────────────────────────────────────────────────────
  {
    id: "dbms-1",
    topic: "DBMS",
    subtopic: "Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which SQL command is used to retrieve data from a database table?",
    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
    correctOptionIndex: 2,
    explanation: "SELECT is the SQL Data Query Language (DQL) command used to fetch data from one or more tables based on specified conditions.",
  },
  {
    id: "dbms-2",
    topic: "DBMS",
    subtopic: "Keys",
    difficultyLabel: "Easy",
    difficultyLevel: 2,
    questionText: "A Primary Key in a relational database must be:",
    options: ["Nullable and unique", "Unique and not null", "Duplicate across rows", "A foreign key from another table"],
    correctOptionIndex: 1,
    explanation: "A Primary Key uniquely identifies each row. It must be unique (no two rows share the same value) and NOT NULL (every row must have a value).",
  },
  {
    id: "dbms-3",
    topic: "DBMS",
    subtopic: "Normalization",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which normal form removes transitive functional dependencies of non-prime attributes?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctOptionIndex: 2,
    explanation: "Third Normal Form (3NF) requires the relation to be in 2NF with no non-prime attribute transitively dependent on any candidate key.",
  },
  {
    id: "dbms-4",
    topic: "DBMS",
    subtopic: "Concurrency Control",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which locking protocol prevents cascading rollbacks by releasing exclusive locks only at commit/abort?",
    options: ["2-Phase Locking (2PL)", "Strict 2PL", "Basic Timestamp Ordering", "Optimistic Concurrency Control"],
    correctOptionIndex: 1,
    explanation: "Strict 2PL holds all exclusive locks until the transaction commits or aborts, ensuring dirty data is never read by other transactions.",
  },
  {
    id: "dbms-5",
    topic: "DBMS",
    subtopic: "Normalization",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "Which condition must hold for a relation to be in Boyce-Codd Normal Form (BCNF)?",
    options: [
      "Every non-prime attribute is fully dependent on the primary key",
      "For every non-trivial FD X → Y, X must be a superkey",
      "There are no multi-valued dependencies",
      "All foreign keys reference valid primary keys"
    ],
    correctOptionIndex: 1,
    explanation: "BCNF requires that for every non-trivial functional dependency X → Y, X must be a superkey. This is stricter than 3NF.",
  },
  // ── OS ─────────────────────────────────────────────────────────────────────
  {
    id: "os-1",
    topic: "OS",
    subtopic: "Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which of the following is NOT a function of an Operating System?",
    options: ["Memory management", "Process scheduling", "Compiling source code", "File system management"],
    correctOptionIndex: 2,
    explanation: "Compiling source code is the job of a compiler, not the OS. The OS manages hardware resources, processes, memory, and files.",
  },
  {
    id: "os-2",
    topic: "OS",
    subtopic: "Scheduling",
    difficultyLabel: "Easy",
    difficultyLevel: 2,
    questionText: "In Round-Robin CPU scheduling, what determines the context switch frequency?",
    options: ["Process priority", "Memory size", "Time quantum", "Number of CPU cores"],
    correctOptionIndex: 2,
    explanation: "Round-Robin assigns each process a fixed time quantum. When it expires, the CPU switches to the next process regardless of completion.",
  },
  {
    id: "os-3",
    topic: "OS",
    subtopic: "Process Synchronization",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which condition is NOT required for a deadlock to occur?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption Enabled", "Circular Wait"],
    correctOptionIndex: 2,
    explanation: "Deadlock requires No Preemption (resources cannot be forcibly taken). If preemption is enabled, resources can be reclaimed, preventing deadlock.",
  },
  {
    id: "os-4",
    topic: "OS",
    subtopic: "Virtual Memory",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which page replacement algorithm suffers from Belady's Anomaly?",
    options: ["LRU", "FIFO", "Optimal (OPT)", "Second Chance (Clock)"],
    correctOptionIndex: 1,
    explanation: "FIFO can produce more page faults when the number of frames increases — this counterintuitive behavior is called Belady's Anomaly.",
  },
  {
    id: "os-5",
    topic: "OS",
    subtopic: "Memory Management",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In a segmented-paging memory model, a logical address is typically resolved through:",
    options: [
      "Direct mapping via a single-level page table",
      "Segment table → page table → physical frame",
      "Inverted page table only",
      "Base register addition only"
    ],
    correctOptionIndex: 1,
    explanation: "In segmented-paging, the segment table locates the page table for the segment, which then maps the page number to a physical frame plus offset.",
  },
  // ── CN ─────────────────────────────────────────────────────────────────────
  {
    id: "cn-1",
    topic: "CN",
    subtopic: "Basics",
    difficultyLabel: "Easy",
    difficultyLevel: 1,
    questionText: "Which layer of the OSI model is responsible for end-to-end communication between applications?",
    options: ["Network Layer", "Data Link Layer", "Transport Layer", "Physical Layer"],
    correctOptionIndex: 2,
    explanation: "The Transport Layer (Layer 4) provides end-to-end communication, segmentation, error recovery, and flow control via TCP or UDP.",
  },
  {
    id: "cn-2",
    topic: "CN",
    subtopic: "IP Addressing",
    difficultyLabel: "Easy",
    difficultyLevel: 2,
    questionText: "How many bits are in an IPv4 address?",
    options: ["16 bits", "32 bits", "64 bits", "128 bits"],
    correctOptionIndex: 1,
    explanation: "IPv4 addresses are 32 bits long, written as four 8-bit octets in dotted-decimal notation (e.g., 192.168.1.1).",
  },
  {
    id: "cn-3",
    topic: "CN",
    subtopic: "Transport Protocols",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "What triggers TCP's Fast Retransmit algorithm?",
    options: [
      "Three duplicate ACKs received",
      "Retransmission timeout (RTO) expiry",
      "Window size dropping to 1 MSS",
      "TCP SYN re-synchronization"
    ],
    correctOptionIndex: 0,
    explanation: "Fast Retransmit is triggered when the sender receives 3 duplicate ACKs, indicating packet loss without waiting for the RTO timer to expire.",
  },
  {
    id: "cn-4",
    topic: "CN",
    subtopic: "Routing",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which routing protocol uses the Bellman-Ford algorithm and is limited to 15 hops?",
    options: ["OSPF", "BGP", "RIP", "EIGRP"],
    correctOptionIndex: 2,
    explanation: "RIP (Routing Information Protocol) uses distance-vector routing based on Bellman-Ford with a maximum hop count of 15 to prevent routing loops.",
  },
  {
    id: "cn-5",
    topic: "CN",
    subtopic: "Congestion Control",
    difficultyLabel: "Very Hard",
    difficultyLevel: 5,
    questionText: "In TCP CUBIC congestion control, after a packet loss event, the congestion window (cwnd) is set to:",
    options: [
      "Half of the current cwnd (multiplicative decrease)",
      "1 MSS (restart from slow start)",
      "A fixed value unrelated to current cwnd",
      "ssthresh remains unchanged"
    ],
    correctOptionIndex: 0,
    explanation: "TCP CUBIC uses multiplicative decrease: after loss, cwnd is multiplied by a factor β (typically 0.7), then CUBIC growth resumes from that point.",
  },
];

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
