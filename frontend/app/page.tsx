"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Timer } from '@/components/Timer';
import { WordChain } from '@/components/WordChain';
import { GameInput } from '@/components/GameInput';
import { DynamicBackground } from '@/components/DynamicBackground';
import { WordCloud } from '@/components/WordCloud';
import { Trophy, RefreshCw, Layers, Zap, Info, HelpCircle } from 'lucide-react';
import { sounds } from '@/utils/SoundManager';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:5000/api/game";

export default function GamePage() {
    // Game State
    const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
    const [sessionId, setSessionId] = useState('');
    const [score, setScore] = useState(0);
    const [words, setWords] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('Genel');
    const [difficulty, setDifficulty] = useState('Medium');
    const [timerKey, setTimerKey] = useState(0);
    
    // Effects State
    const [definition, setDefinition] = useState<string | null>(null);
    const [isPerfect, setIsPerfect] = useState(false);
    const [isGlitched, setIsGlitched] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);

    // Initial Start
    const startGame = async () => {
        try {
            const res = await fetch(`${API_BASE}/start?category=${category}&difficulty=${difficulty}`, { method: 'POST' });
            const data = await res.json();
            setSessionId(data.id);
            setScore(0);
            setWords([]);
            setError('');
            setGameState('playing');
        } catch (e) {
            setError("Backend bağlantısı kurulamadı!");
        }
    };

    // Metronome Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing' && timerKey > 0) { // Simple mock for timer countdown in page
            // Note: This would normally be synced with the Timer component
        }
        return () => clearInterval(interval);
    }, [gameState]);

    const handleWordSubmit = async (word: string): Promise<boolean> => {
        try {
            const lastWord = words.length > 0 ? words[words.length - 1] : '';
            const res = await fetch(`${API_BASE}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, word, previousWord: lastWord })
            });
            const data = await res.json();

            if (data.isValid) {
                sounds.playSuccess();
                if (data.isCombo) {
                    setIsPerfect(true);
                    setTimeout(() => setIsPerfect(false), 1500);
                }
                
                setWords([...words, word.toLowerCase()]);
                setScore(data.newScore);
                setDefinition(data.definition);
                setError('');
                setTimerKey(prev => prev + 1);
                
                // Clear definition after 3s
                setTimeout(() => setDefinition(null), 3000);
                return true;
            } else {
                sounds.playError();
                setIsGlitched(true);
                setTimeout(() => setIsGlitched(false), 500);
                setError(data.message);
                return false;
            }
        } catch (e) {
            setError("Sunucu hatası!");
            return false;
        }
    };

    if (gameState === 'lobby') {
        return (
            <div className="flex flex-col items-center gap-12 z-10 w-full max-w-2xl px-6">
                <DynamicBackground />
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-4">
                    <h1 className="text-9xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">VORTEX</h1>
                    <p className="text-zinc-500 font-bold tracking-[1em] uppercase text-xs">Premium Word Chain Experience</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    {['Genel', 'Hayvanlar', 'Şehirler'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`p-6 border-2 transition-all rounded-3xl font-black uppercase tracking-widest ${category === cat ? 'bg-white text-black scale-105' : 'border-white/10 text-zinc-600 hover:border-white/30'}`}
                        >
                            {cat}
                        </button>
                    ))}
                    <button className="p-6 border-2 border-dashed border-white/10 text-zinc-700 rounded-3xl font-black uppercase cursor-not-allowed">
                        DUEL (SOON)
                    </button>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full bg-white text-black p-10 rounded-[2.5rem] text-4xl font-black italic uppercase hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all active:scale-95"
                >
                    BAŞLAT
                </button>
            </div>
        );
    }

    if (gameState === 'gameover') {
        return (
            <div className="z-20 flex flex-col items-center gap-6 w-full max-w-5xl">
                <DynamicBackground />
                <h2 className="text-7xl font-black uppercase italic text-white/20">SEANS ÖZETİ</h2>
                <div className="flex flex-col items-center bg-zinc-900/50 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl w-full">
                    <p className="text-zinc-500 uppercase font-black tracking-widest mb-2">Final Skor</p>
                    <p className="text-9xl font-black italic mb-10">{score}</p>
                    <WordCloud words={words} />
                    <button 
                        onClick={() => setGameState('lobby')}
                        className="mt-12 flex items-center gap-4 bg-white text-black px-12 py-6 rounded-3xl text-3xl font-black uppercase hover:scale-105 transition-all"
                    >
                        <RefreshCw size={32} /> TEKRAR
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-screen flex flex-col items-center justify-between py-12 px-6 overflow-hidden ${isGlitched ? 'glitch-active' : ''} crt-overlay`}>
            <DynamicBackground />
            
            <div className="w-full z-10 flex flex-col items-center">
                <Timer 
                    duration={difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 7 : 10} 
                    onTimeUp={() => setGameState('gameover')} 
                    resetTrigger={timerKey} 
                />
            </div>

            <div className="z-10 flex flex-col items-center gap-4 text-center">
                <AnimatePresence>
                    {isPerfect && (
                        <motion.div 
                            initial={{ scale: 0, rotate: -10 }} 
                            animate={{ scale: 1.2, rotate: 0 }} 
                            exit={{ opacity: 0 }}
                            className="text-white font-black italic text-6xl text-perfect"
                        >
                            PERFECT!
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-baseline gap-2">
                    <span className="text-zinc-500 text-xs font-black uppercase tracking-tighter">SKOR:</span>
                    <span className="text-7xl font-black italic">{score}</span>
                </div>
            </div>

            <div className="z-10 w-full overflow-hidden flex flex-col items-center">
                <WordChain words={words} />
                <AnimatePresence>
                    {definition && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="max-w-md bg-white text-black p-4 rounded-xl text-sm font-medium italic shadow-2xl relative"
                        >
                            <Info size={16} className="absolute -top-2 -left-2 bg-black text-white rounded-full p-0.5" />
                            {definition}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full max-w-3xl z-10 relative">
                <GameInput 
                    onWordSubmit={handleWordSubmit} 
                    disabled={gameState !== 'playing'}
                    error={error}
                    lastLetter={words.length > 0 ? words[words.length - 1].slice(-1) : undefined}
                />
                
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <div className="flex items-center gap-1"><Zap size={10} /> {difficulty}</div>
                    <div className="flex items-center gap-1"><Layers size={10} /> {category}</div>
                    <button className="flex items-center gap-1 hover:text-white transition-colors cursor-help">
                        <HelpCircle size={10} /> İPUCU (3)
                    </button>
                </div>
            </div>
        </div>
    );
}
