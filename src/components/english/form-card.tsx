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
        const wordTyped= userInput.trim().toLowerCase()
        handleCheckAnswer(wordTyped);
        setShow(true)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {show && (
                <div
                    className={`relative rounded-md p-2 font-semibold text-center ${
                    userInput === answer
                        ? "bg-green-500/10 text-green-600"
                        : "bg-destructive/10 text-destructive"
                    }`}
                > <p>{userInput === answer ? "Correct answer: nice one!" : "Incorrect answer: keep trying!"}</p>
                </div>
            )}
            <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word..."
                className="h-12 text-center text-lg font-mono tracking-widest"
                disabled={show}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
            />
            <Button type="submit" className="w-full" disabled={show}>
                Check Answer
            </Button>
        </form>
    )
}