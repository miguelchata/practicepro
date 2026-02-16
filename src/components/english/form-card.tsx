import { useState } from "react"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormCardProps = {
    handleCheckAnswer: (wordTyped: string) => void
    inputDisabled: boolean
    answer: string
}

export const FormCard = ({ handleCheckAnswer, inputDisabled, answer }: FormCardProps) => {
    const [userInput, setUserInput] = useState("");
    const [show, setShow] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const wordTyped = userInput.trim().toLowerCase()
        handleCheckAnswer(wordTyped);
        setShow(true)
    }

    const isCorrect = userInput.trim().toLowerCase() === answer.toLowerCase();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {show && (
                <div
                    className={`relative rounded-xl p-4 font-semibold text-center border shadow-sm ${
                    isCorrect
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-destructive/5 border-destructive/20 text-destructive"
                    }`}
                > 
                    <p className="text-lg">{isCorrect ? "Perfect match!" : "Not quite right..."}</p>
                </div>
            )}
            <div className="space-y-4">
                <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the word..."
                    className="h-16 text-center text-2xl font-mono tracking-wider border-2 focus-visible:ring-primary rounded-xl"
                    disabled={show}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                />
                <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-16 text-xl font-headline tracking-tight shadow-md rounded-xl active:scale-[0.98] transition-all" 
                    disabled={show || !userInput.trim()}
                >
                    Check Answer
                </Button>
            </div>
        </form>
    )
}
