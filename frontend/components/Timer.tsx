import React, { useEffect, useState } from 'react';
import { sounds } from '@/utils/SoundManager';

export const Timer = ({ duration, onTimeUp, resetTrigger }: { duration: number, onTimeUp: () => void, resetTrigger: any }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration);
    }, [resetTrigger, duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 0.1;
                if (next < 3 && Math.abs(next % 0.5) < 0.1) {
                    sounds.playHeartbeat(440 + (3 - next) * 100);
                }
                return next;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const percentage = (timeLeft / duration) * 100;

    return (
        <div className="w-full h-1 bg-zinc-900 overflow-hidden relative">
            <div 
                className={`h-full bg-white transition-all duration-100 ease-linear ${timeLeft < 3 ? 'timer-critical' : ''}`}
                style={{ width: `${percentage}%` }}
            />
            <div className="absolute top-4 right-0 text-4xl font-black italic opacity-20 select-none">
                {Math.ceil(timeLeft)}s
            </div>
        </div>
    );
};
