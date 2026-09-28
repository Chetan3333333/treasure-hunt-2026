import { Question } from "@/data/gameData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

const QuestionCard = ({ question, onSubmit }: QuestionCardProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 border-primary/20 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
      <CardHeader>
        <CardTitle className="text-xl font-mono text-primary flex justify-between items-center">
          <span>:: QUESTION_ID_{question.id} ::</span>
          {question.timer_seconds > 0 && (
            <span className="text-destructive animate-pulse">{question.timer_seconds}s</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium leading-relaxed font-mono">
          {question.content}
        </p>

        {question.type === "IMAGE" && question.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
            <img
              src={question.image_url}
              alt="Puzzle"
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {question.type === "CODE" && question.code_snippet && (
          <div className="bg-black/80 p-4 rounded-md border border-primary/30 overflow-x-auto">
            <pre className="text-sm font-mono text-green-400">
              {question.code_snippet}
            </pre>
          </div>
        )}

        <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ENTER_DECRYPT_KEY..."
              className="font-mono bg-black/50 border-primary focus:border-primary focus:ring-1 focus:ring-primary h-12 text-lg text-primary placeholder:text-primary/40 ring-offset-black"
            />
            <Button type="submit" className="w-full font-mono font-bold h-12 text-lg tracking-widest bg-primary text-black hover:bg-primary/90 transition-all duration-300" variant="default">
              SUBMIT_PACKET()
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
