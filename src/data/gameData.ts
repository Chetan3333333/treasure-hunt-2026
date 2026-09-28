export type QuestionType = "TEXT" | "IMAGE" | "CODE" | "QR";

export interface Question {
    id: string;
    type: QuestionType;
    content: string;
    image_url: string | null;
    code_snippet: string | null;
    correct_answers: string[];
    timer_seconds: number;
}

export interface Level {
    id: number;
    name: string;
    questions: Question[];
}

export interface GameData {
    levels: Level[];
}

export const GAME_DATA: GameData = {
    levels: [
        {
            id: 1,
            name: "Initiation",
            questions: [
                {
                    id: "q101",
                    type: "TEXT",
                    content: "I speak without a mouth. What am I?",
                    image_url: null,
                    code_snippet: null,
                    correct_answers: ["echo", "an echo"],
                    timer_seconds: 0
                },
                {
                    id: "q102",
                    type: "CODE",
                    content: "What is the output of this function?",
                    image_url: null,
                    code_snippet: "console.log(1 + '1' - 1);",
                    correct_answers: ["10"],
                    timer_seconds: 0
                }
            ]
        },
        {
            id: 2,
            name: "Visual Decryption",
            questions: [
                {
                    id: "q201",
                    type: "IMAGE",
                    content: "Identify the missing character that breaks the build.",
                    image_url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop", // Placeholder
                    code_snippet: null,
                    correct_answers: ["semicolon", ";", "missing semicolon"],
                    timer_seconds: 0
                }
            ]
        },
        {
            id: 3,
            name: "Output Prediction",
            questions: [
                {
                    id: "q301",
                    type: "CODE",
                    content: "Analyze the loop. What is the final value of x?",
                    image_url: null,
                    code_snippet: "let x = 0;\nfor(let i=0; i<5; i++) x+=i;\nprint(x);",
                    correct_answers: ["10"],
                    timer_seconds: 0
                }
            ]
        },
        {
            id: 4,
            name: "Rapid Fire",
            questions: [
                {
                    id: "q401",
                    type: "TEXT",
                    content: "Protocol for secure communication over computer network?",
                    image_url: null,
                    code_snippet: null,
                    correct_answers: ["https", "ssl", "tls"],
                    timer_seconds: 15
                }
            ]
        }
    ]
};
