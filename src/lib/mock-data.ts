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
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  subtopic: string;
  difficultyLabel: string;
  difficultyLevel: number;
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

export const MOCK_STUDENT = {
  name: "Arjun Sharma",
  email: "arjun.sharma@parakh.edu",
  avatarUrl: "",
  rollNumber: "CS-2026-042",
  overallProficiency: 78,
  estimatedAbilityLevel: "Intermediate / Advanced",
  assessmentsCompleted: 14,
  totalQuestionsAnswered: 185,
  avgResponseTimeSec: 42,
};

export const MOCK_TOPICS: TopicPerformance[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    code: "DSA",
    proficiency: 88,
    totalQuestions: 65,
    accuracy: 86,
    trend: "up",
    color: "#6366f1",
  },
  {
    id: "os",
    name: "Operating Systems",
    code: "OS",
    proficiency: 78,
    totalQuestions: 45,
    accuracy: 76,
    trend: "up",
    color: "#06b6d4",
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    code: "DBMS",
    proficiency: 62,
    totalQuestions: 40,
    accuracy: 60,
    trend: "down",
    color: "#f59e0b",
  },
  {
    id: "networks",
    name: "Computer Networks",
    code: "CN",
    proficiency: 51,
    totalQuestions: 35,
    accuracy: 50,
    trend: "neutral",
    color: "#ec4899",
  },
];

export const MOCK_RECENT_ASSESSMENTS: RecentAssessment[] = [
  {
    id: "sess-001",
    title: "CS Core Adaptive Assessment #4",
    subject: "Computer Science",
    date: "Today, 14:30",
    score: 82,
    questionsCount: 15,
    abilityScore: 78,
    status: "completed",
  },
  {
    id: "sess-002",
    title: "DBMS Deep Dive",
    subject: "Database Systems",
    date: "Yesterday, 10:15",
    score: 64,
    questionsCount: 10,
    abilityScore: 62,
    status: "completed",
  },
  {
    id: "sess-003",
    title: "DSA Diagnostic Drill",
    subject: "Algorithms",
    date: "09 Aug 2026",
    score: 90,
    questionsCount: 12,
    abilityScore: 88,
    status: "completed",
  },
  {
    id: "sess-004",
    title: "OS Synchronization Practice",
    subject: "Operating Systems",
    date: "06 Aug 2026",
    score: 75,
    questionsCount: 10,
    abilityScore: 76,
    status: "completed",
  },
];

export const MOCK_STRENGTHS = [
  {
    topic: "Data Structures",
    detail: "High accuracy in Binary Trees & Graph Traversal (89% accuracy)",
  },
  {
    topic: "Memory Management",
    detail: "Strong grasp of Virtual Memory and Paging algorithms",
  },
  {
    topic: "Time Complexity",
    detail: "Consistently fast and accurate on Big-O recurrence relations",
  },
];

export const MOCK_AREAS_TO_IMPROVE = [
  {
    topic: "DBMS Normalization",
    detail: "Struggles with 3NF vs BCNF dependency preservation questions",
    recommendedAction: "Review functional dependency rules and losslessness",
  },
  {
    topic: "Networking Protocols",
    detail: "Sliding Window Protocols and TCP Congestion Control window sizing",
    recommendedAction: "Practice flow control problem sets",
  },
  {
    topic: "Process Synchronization",
    detail: "Deadlock prevention and Banker's Algorithm edge cases",
    recommendedAction: "Attempt medium-difficulty OS practice drills",
  },
];

export const MOCK_ABILITY_TRAJECTORY: AbilityDataPoint[] = [
  { questionNumber: "Q1", ability: 50, difficulty: 2, topic: "DSA", correct: true },
  { questionNumber: "Q2", ability: 58, difficulty: 3, topic: "DBMS", correct: true },
  { questionNumber: "Q3", ability: 66, difficulty: 3, topic: "OS", correct: true },
  { questionNumber: "Q4", ability: 76, difficulty: 4, topic: "DSA", correct: true },
  { questionNumber: "Q5", ability: 71, difficulty: 4, topic: "DBMS", correct: false },
  { questionNumber: "Q6", ability: 79, difficulty: 3, topic: "Networks", correct: true },
  { questionNumber: "Q7", ability: 87, difficulty: 4, topic: "OS", correct: true },
  { questionNumber: "Q8", ability: 81, difficulty: 5, topic: "DSA", correct: false },
  { questionNumber: "Q9", ability: 86, difficulty: 4, topic: "DBMS", correct: true },
  { questionNumber: "Q10", ability: 90, difficulty: 4, topic: "DSA", correct: true },
];

export const MOCK_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-101",
    questionNumber: 1,
    totalQuestions: 5,
    topic: "Database Management Systems",
    subtopic: "Concurrency Control",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "In a DBMS supporting ACID properties, which locking protocol guarantees serializability under strict execution rules while preventing cascading rollbacks?",
    options: [
      "2-Phase Locking (2PL)",
      "Strict 2-Phase Locking (Strict 2PL)",
      "Basic Timestamp Ordering",
      "Optimistic Concurrency Control"
    ],
    correctOptionIndex: 1,
    explanation: "Strict 2-Phase Locking requires that all exclusive locks held by a transaction be released only after the transaction commits or aborts, preventing cascading rollbacks."
  },
  {
    id: "q-102",
    questionNumber: 2,
    totalQuestions: 5,
    topic: "Operating Systems",
    subtopic: "Process Synchronization",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "What condition is NOT necessary for a deadlock to occur in a multi-threaded execution environment?",
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption Enabled",
      "Circular Wait"
    ],
    correctOptionIndex: 2,
    explanation: "No Preemption is a necessary condition for deadlock. If preemption is enabled, resources can be taken away from threads, preventing deadlock."
  },
  {
    id: "q-103",
    questionNumber: 3,
    totalQuestions: 5,
    topic: "Data Structures & Algorithms",
    subtopic: "Binary Trees",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "Which traversal of a Binary Search Tree (BST) produces keys in sorted ascending order?",
    options: [
      "Pre-order Traversal",
      "In-order Traversal",
      "Post-order Traversal",
      "Level-order Traversal"
    ],
    correctOptionIndex: 1,
    explanation: "In-order traversal visits Left Subtree -> Node -> Right Subtree, which yields elements in non-decreasing sorted order for a BST."
  },
  {
    id: "q-104",
    questionNumber: 4,
    totalQuestions: 5,
    topic: "Database Management Systems",
    subtopic: "Normalization",
    difficultyLabel: "Medium",
    difficultyLevel: 3,
    questionText: "Which normal form removes transitive functional dependencies of non-prime attributes on candidate keys?",
    options: [
      "First Normal Form (1NF)",
      "Second Normal Form (2NF)",
      "Third Normal Form (3NF)",
      "Boyce-Codd Normal Form (BCNF)"
    ],
    correctOptionIndex: 2,
    explanation: "Third Normal Form (3NF) requires a relation to be in 2NF and have no non-prime attribute transitively dependent on any candidate key."
  },
  {
    id: "q-105",
    questionNumber: 5,
    totalQuestions: 5,
    topic: "Computer Networks",
    subtopic: "Transport Layer Protocols",
    difficultyLabel: "Hard",
    difficultyLevel: 4,
    questionText: "During TCP congestion control, what triggers the Fast Retransmit algorithm prior to retransmission timeout?",
    options: [
      "Receipt of 3 duplicate ACKs",
      "Window size reduction to 1 MSS",
      "Expiration of the RTO timer",
      "TCP SYN flag re-synchronization"
    ],
    correctOptionIndex: 0,
    explanation: "Fast Retransmit is triggered when a sender receives 3 duplicate ACKs for the same data packet, signaling packet loss without waiting for the timer to expire."
  }
];

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
      "For every non-trivial functional dependency X -> Y, X must be a superkey.",
      "There are no multi-valued dependencies in the relation.",
      "All foreign keys reference primary keys in valid relations."
    ],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question"
  },
  {
    id: "q-gen-202",
    topic: "Operating Systems",
    subtopic: "Virtual Memory",
    difficulty: "Hard",
    difficultyLevel: 4,
    questionText: "Which page replacement algorithm suffers from Belady's Anomaly where increasing the number of page frames leads to more page faults?",
    options: [
      "Least Recently Used (LRU)",
      "First-In, First-Out (FIFO)",
      "Optimal Page Replacement (OPT)",
      "Second Chance (Clock) Algorithm"
    ],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question"
  },
  {
    id: "q-gen-203",
    topic: "Data Structures",
    subtopic: "Graph Algorithms",
    difficulty: "Hard",
    difficultyLevel: 4,
    questionText: "What is the worst-case time complexity of Dijkstra's single-source shortest path algorithm using a Min-Heap priority queue?",
    options: [
      "O(V^2)",
      "O((V + E) log V)",
      "O(V * E)",
      "O(E log E)"
    ],
    correctOptionIndex: 1,
    status: "pending",
    sourceLabel: "AI Generated Demo Question"
  }
];
