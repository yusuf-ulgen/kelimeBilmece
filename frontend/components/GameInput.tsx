"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface GameInputProps {
    onWordSubmit: (word: string) => Promise<boolean>;
    disabled: boolean;
    error: string;
    lastLetter?: string;
}

export const GameInput = ({ onWordSubmit, disabled, error, lastLetter }: GameInputProps) => {
    const [word, setWord] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!word || disabled) return;

        const success = await onWordSubmit(word);
        if (success === false) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
        } else {
            setWord('');
        }
    };

    return (
        <form 
            onSubmit={handleSubmit}
            className={`flex flex-col gap-2 w-full max-w-xl mx-auto transition-transform ${isShaking ? 'error-shake' : ''}`}
        >
            <div className="relative group">
                <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    disabled={disabled}
                    placeholder={lastLetter ? `'${lastLetter}' ile başlayan bir kelime...` : "İlk kelimeyi yaz..."}
                    className="w-full bg-black border-2 border-white/20 p-6 rounded-2xl text-2xl font-bold uppercase tracking-widest focus:border-white focus:outline-none transition-all group-hover:border-white/40"
                    autoFocus
                />
                <button 
                    disabled={disabled || !word}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white hover:text-black rounded-xl transition-all disabled:opacity-0"
                >
                    <Send size={24} />
                </button>
            </div>
            {error && (
                <p className="text-center font-bold text-xs uppercase tracking-tighter opacity-60">
                    {error}
                </p>
            )}
        </form>
    );
};
