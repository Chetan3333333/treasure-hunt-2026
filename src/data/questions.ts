export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  image?: string;
  points?: number;
}

// Helper: deterministic index from username
const getSeededIndex = (seed: string, poolSize: number, salt: string) => {
  let hash = 0;
  const str = seed + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % poolSize;
};

// ===== ROUND 1 =====

// Q1 pool: Logical Reasoning (9 questions — each player gets 1)
const logicalReasoningPool: Question[] = [
  {
    question: "Number Series: 3, 7, 15, 31, 63, ___",
    options: ["95", "127", "124", "111"],
    correctIndex: 1,
  },
  {
    question: "Number Series: 1, 4, 10, 22, 46, ___",
    options: ["92", "88", "94", "90"],
    correctIndex: 2,
  },
  {
    question: "Alphabet Pattern: B, E, I, N, T, ___",
    options: ["X", "Y", "A", "Z"],
    correctIndex: 2,
  },
  {
    question: "Coding-Decoding: If ROAD = URDG, then BOOK = ?",
    options: ["CQQM", "ERRN", "DRRN", "EQQN"],
    correctIndex: 1,
  },
  {
    question: "Direction Sense: A person walks 15m North, then 10m East, then 15m South. Where is he from the starting point?",
    options: ["15m East", "10m East", "10m West", "15m North"],
    correctIndex: 1,
  },
  {
    question: "Blood Relation: Pointing to a woman, Ramesh said, 'She is the daughter of my grandfather's only son.' How is the woman related to Ramesh?",
    options: ["Cousin", "Aunt", "Sister", "Mother"],
    correctIndex: 2,
  },
  {
    question: "Statement & Conclusion: All engineers are graduates. Some graduates are unemployed. Conclusion: Some engineers are unemployed.",
    options: ["Definitely true", "Definitely false", "Cannot be determined", "None"],
    correctIndex: 2,
  },
  {
    question: "Logical Puzzle: If All A are B and All B are C, which is true?",
    options: ["All C are A", "All A are C", "Some C are A", "None"],
    correctIndex: 1,
  },
  {
    question: "Missing Term: 2, 6, 7, 21, 22, 66, ___",
    options: ["198", "68", "67", "132"],
    correctIndex: 2,
  },
];

// Q2 pool: Verbal Reasoning (10 questions — each player gets 1)
const verbalReasoningPool: Question[] = [
  {
    question: "Odd One Out: Pen, Pencil, Eraser, Notebook",
    options: ["Pen", "Pencil", "Eraser", "Notebook"],
    correctIndex: 2,
  },
  {
    question: "Odd One Out: January, March, May, July, September",
    options: ["January", "May", "July", "September"],
    correctIndex: 3,
  },
  {
    question: "\"Once in a blue moon\" means:",
    options: ["Very often", "Very rarely", "At night", "Twice a month"],
    correctIndex: 1,
  },
  {
    question: "\"Under the weather\" means:",
    options: ["Feeling sick", "Standing in rain", "Feeling happy", "Very busy"],
    correctIndex: 0,
  },
  {
    question: "Antonym of \"Optimistic\":",
    options: ["Positive", "Cheerful", "Pessimistic", "Hopeful"],
    correctIndex: 2,
  },
  {
    question: "Antonym of \"Generous\":",
    options: ["Kind", "Selfish", "Friendly", "Helpful"],
    correctIndex: 1,
  },
  {
    question: "Synonym of \"Reluctant\":",
    options: ["Willing", "Angry", "Unwilling", "Confident"],
    correctIndex: 2,
  },
  {
    question: "Synonym of \"Ancient\":",
    options: ["Modern", "Old", "Future", "Young"],
    correctIndex: 1,
  },
  {
    question: "___ Earth revolves around ___ Sun.",
    options: ["The, the", "A, the", "The, a", "No article, the"],
    correctIndex: 0,
  },
  {
    question: "He has ___ MBA degree.",
    options: ["a", "an", "the", "no article"],
    correctIndex: 1,
  },
];

// Q3: Aptitude (fixed — will add pool later)
const aptitudeQ: Question = {
  question: "A train travels 60 km in 40 minutes. If it continues at the same speed, how far will it travel in 1.5 hours?",
  options: ["120 km", "135 km", "150 km", "90 km"],
  correctIndex: 1,
};

// Get Round 1 questions: Q1 & Q2 randomized from pools, Q3 fixed
export const getRound1Questions = (username: string): Question[] => {
  const q1 = logicalReasoningPool[getSeededIndex(username, logicalReasoningPool.length, "logical")];
  const q2 = verbalReasoningPool[getSeededIndex(username, verbalReasoningPool.length, "verbal")];
  return [q1, q2, aptitudeQ];
};

// Fallback for imports that don't pass username
export const round1Questions: Question[] = [logicalReasoningPool[0], verbalReasoningPool[0], aptitudeQ];

// ===== ROUND 2: Tech & Creativity (3 questions, 15pts each) =====
export const round2Questions: Question[] = [
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I in tech?",
    options: ["A microphone", "An echo / Echo service", "A speaker", "Bluetooth"],
    correctIndex: 1,
  },
  {
    question: "This meme shows a developer saying 'It works on my machine' while the server is on fire. What concept does this represent?",
    options: ["Version control", "Environment inconsistency", "Memory leak", "Syntax error"],
    correctIndex: 1,
    image: "https://i.imgflip.com/65efzo.jpg",
  },
  {
    question: "What design pattern is commonly described as: 'One class to rule them all — only one instance allowed'?",
    options: ["Factory Pattern", "Observer Pattern", "Singleton Pattern", "Strategy Pattern"],
    correctIndex: 2,
  },
];

// ===== ROUND 3: Rapid Fire (5 questions, 8pts each) =====
export const round3Questions: Question[] = [
  { question: "Keyword: The language used to style web pages.", options: ["HTML", "CSS", "JavaScript", "Python"], correctIndex: 1 },
  { question: "Fill in the blank: _____ is the process of finding and fixing bugs in code.", options: ["Compiling", "Debugging", "Deploying", "Refactoring"], correctIndex: 1 },
  { question: "True or False: Python is a compiled language.", options: ["True", "False", "Depends on implementation", "Only in Python 2"], correctIndex: 1 },
  { question: "Match: 'git push' is related to ___.", options: ["Downloading code", "Uploading code to remote", "Deleting branches", "Creating files"], correctIndex: 1 },
  { question: "What does API stand for?", options: ["Applied Programming Interface", "Application Programming Interface", "Application Process Integration", "Automated Programming Interface"], correctIndex: 1 },
];

// ===== ROUND 4: Final DSA Challenge (2 questions, 15+20pts) =====
export const round4Questions: Question[] = [
  { question: "You have a sorted array of 1 million elements. Which algorithm gives you O(log n) search time?", options: ["Linear Search", "Binary Search", "Bubble Sort", "BFS"], correctIndex: 1, points: 15 },
  { question: "What is the time complexity of inserting an element at the beginning of a linked list?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctIndex: 2, points: 20 },
];

export const locationHints = [
  "🏛️ Head to the library entrance — look near the notice board on the left side.",
  "🌳 Go to the campus garden — the QR is taped under the third bench.",
  "💻 Visit the computer lab — check the whiteboard near the projector.",
  "🏆 Final stop: Auditorium main door — your destiny awaits!",
];

export const roundPasswords: Record<number, string> = {
  1: "glitch_protocol_start",
  2: "echo_silence_break",
  3: "css_style_master",
  4: "binary_search_log_n",
};
