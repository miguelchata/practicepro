import { useState, useEffect } from 'react'

import { Progress } from '@/components/ui/progress';

type AccuracyCardProps = {
    accuracy: number | null;
}

export const AccuracyCard = ({ accuracy }: AccuracyCardProps) => {
    const [animate, setAnimate] = useState<number | null>(null)
    const progressPercent = accuracy ?? 0 * 100;
    console.log(accuracy ?? 0 * 100, " AccuracyCard...")

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimate(accuracy ?? 0 * 100);
        }, 1200);

        return () => clearTimeout(timer);
    }, [])


    return (
    <div className="w-full px-4 space-y-2">
        <div className="flex items-center gap-4 justify-center">
            <span className="text-sm font-medium text-center">
            Vocabulary progress: {animate && Math.round(animate)}%
            </span>
        </div>
        { animate && <Progress value={animate} /> }
    </div>
    )
}