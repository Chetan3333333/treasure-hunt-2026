export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  image?: string;
}

export const round1Questions: Question[] = [
  {
    question: "You see a room with 3 doors: one red, one blue, one green. A sign reads 'The safe door is not red. The blue door leads to danger.' Which door is safe?",
    options: ["Red door", "Blue door", "Green door", "None of them"],
    correctIndex: 2,
  },
  {
    question: "If all Bloops are Razzles and all Razzles are Lazzles, then which of the following is true?",
    options: [
      "All Bloops are Lazzles",
      "All Lazzles are Bloops",
      "Some Razzles are not Bloops",
      "No Lazzles are Razzles",
    ],
    correctIndex: 0,
  },
];

export const round2Questions: Question[] = [
  {
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I in tech?",
    options: ["A microphone", "An echo / Echo service", "A speaker", "Bluetooth"],
    correctIndex: 1,
  },
  {
    question: "This meme shows a developer saying 'It works on my machine' while the server is on fire. What concept does this represent?",
    options: [
      "Version control",
      "Environment inconsistency",
      "Memory leak",
      "Syntax error",
    ],
    correctIndex: 1,
    image: "https://i.imgflip.com/65efzo.jpg",
  },
];

export const round3Questions: Question[] = [
  {
    question: "Keyword: The language used to style web pages.",
    options: ["HTML", "CSS", "JavaScript", "Python"],
    correctIndex: 1,
  },
  {
    question: "Fill in the blank: _____ is the process of finding and fixing bugs in code.",
    options: ["Compiling", "Debugging", "Deploying", "Refactoring"],
    correctIndex: 1,
  },
  {
    question: "Match: 'git push' is related to ___.",
    options: ["Downloading code", "Uploading code to remote", "Deleting branches", "Creating files"],
    correctIndex: 1,
  },
  {
    question: "What does API stand for?",
    options: [
      "Applied Programming Interface",
      "Application Programming Interface",
      "Application Process Integration",
      "Automated Programming Interface",
    ],
    correctIndex: 1,
  },
];

export const round4Questions: Question[] = [
  {
    question: "You have a sorted array of 1 million elements. Which algorithm gives you O(log n) search time?",
    options: ["Linear Search", "Binary Search", "Bubble Sort", "BFS"],
    correctIndex: 1,
  },
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
