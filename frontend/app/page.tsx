"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Timer } from '@/components/Timer';
import { WordChain } from '@/components/WordChain';
import { GameInput } from '@/components/GameInput';
import { DynamicBackground } from '@/components/DynamicBackground';
import { WordCloud } from '@/components/WordCloud';
import { Trophy, RefreshCw, Layers, Zap, Info, HelpCircle, Github, Linkedin } from 'lucide-react';
import { sounds } from '@/utils/SoundManager';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/game` : "http://localhost:5000/api/game";

export default function GamePage() {
    // Game State
    const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
    const [sessionId, setSessionId] = useState('');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [words, setWords] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [category, setCategory] = useState('Genel');
    const [difficulty, setDifficulty] = useState('Medium');
    const [timerKey, setTimerKey] = useState(0);
    const [hintsRemaining, setHintsRemaining] = useState(3);
    
    // Effects State
    const [isPerfect, setIsPerfect] = useState(false);
    const [isGlitched, setIsGlitched] = useState(false);

    // Initial Start
    const startGame = async () => {
        try {
            const res = await fetch(`${API_BASE}/start?category=${category}&difficulty=${difficulty}`, { method: 'POST' });
            const data = await res.json();
            setSessionId(data.id);
            setScore(0);
            setWords(data.usedWords || []);
            setError('');
            setHintsRemaining(3);
            
            // Load HighScore
            const savedScore = localStorage.getItem(`vortex_highScore_${category}`);
            if (savedScore) {
                setHighScore(Number(savedScore));
            } else {
                setHighScore(0);
            }
            
            setGameState('playing');
        } catch (e) {
            setError("Backend bağlantısı kurulamadı!");
        }
    };

    const handleGameOver = () => {
        // Save score if it's the highest
        if (score > highScore) {
            localStorage.setItem(`vortex_highScore_${category}`, score.toString());
            setHighScore(score);
        }
        setGameState('gameover');
    };

    const handleHint = async () => {
        if (hintsRemaining <= 0 || gameState !== 'playing') return;

        try {
            const res = await fetch(`${API_BASE}/hint/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setHintsRemaining(prev => prev - 1);
                // Call handleWordSubmit directly to auto-complete and submit
                await handleWordSubmit(data.word);
            } else {
                const errorData = await res.text();
                setError("İpucu bulunamadı!");
                setIsGlitched(true);
                setTimeout(() => setIsGlitched(false), 500);
            }
        } catch (e) {
            setError("İpucu alınamadı!");
        }
    };

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
                const newScore = data.newScore;
                setScore(newScore);
                
                // Real-time high score update
                if (newScore > highScore) {
                    setHighScore(newScore);
                    localStorage.setItem(`vortex_highScore_${category}`, newScore.toString());
                }

                setError('');
                setTimerKey(prev => prev + 1);
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
        const difficultyMap = [{ id: 'Easy', label: 'Kolay' }, { id: 'Medium', label: 'Orta' }, { id: 'Hard', label: 'Zor' }];
        
        return (
            <div className="flex flex-col items-center gap-4 md:gap-6 z-10 w-full max-w-2xl px-6">
                <DynamicBackground />
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-2 md:space-y-3">
                    <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">VORTEX</h1>
                    <p className="text-zinc-500 font-bold tracking-[1em] uppercase text-[10px] md:text-xs">Premium Word Chain Experience</p>
                </motion.div>

                <div className="w-full space-y-3 md:space-y-4">
                    <div className="flex justify-center gap-2 mb-1 md:mb-2 text-zinc-500 font-bold tracking-widest text-[10px] md:text-xs uppercase">
                        Kategori Seç
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {['Genel', 'Hayvanlar', 'Şehirler'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`p-4 md:p-5 border-2 transition-all rounded-3xl font-black uppercase tracking-widest ${category === cat ? 'bg-white text-black scale-105' : 'border-white/10 text-zinc-600 hover:border-white/30'}`}
                            >
                                {cat}
                            </button>
                        ))}
                        <button className="p-4 md:p-5 border-2 border-dashed border-white/10 text-zinc-700 rounded-3xl font-black uppercase cursor-not-allowed">
                            DUEL (SOON)
                        </button>
                    </div>

                    <div className="flex justify-center gap-2 mt-4 mb-2 text-zinc-500 font-bold tracking-widest text-xs uppercase">
                        Zorluk Seviyesi
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {difficultyMap.map(diff => (
                            <button 
                                key={diff.id}
                                onClick={() => setDifficulty(diff.id)}
                                className={`p-3 md:p-4 border-2 transition-all rounded-3xl font-black uppercase tracking-widest text-sm py-3 md:py-4 ${difficulty === diff.id ? 'bg-white text-black scale-105' : 'border-white/10 text-zinc-600 hover:border-white/30'}`}
                            >
                                {diff.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={startGame}
                    className="w-full bg-white text-black p-5 md:p-6 rounded-[2rem] text-2xl md:text-3xl font-black italic uppercase hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all active:scale-95"
                >
                    BAŞLAT
                </button>

                {/* Social Links */}
                <div className="flex justify-center items-center gap-6 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                    <a href="https://github.com/yusuf-ulgen/kelimeBilmece" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-110 transition-transform">
                        <Github size={24} />
                    </a>
                    <a href="https://www.linkedin.com/in/yusuf-ulgen" target="_blank" rel="noopener noreferrer" className="text-white hover:scale-110 transition-transform">
                        <Linkedin size={24} />
                    </a>
                    <a href="https://yusufulgen.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="Yusuf Ülgen" className="w-6 h-6 object-contain" />
                    </a>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        const isNewRecord = score > 0 && score === highScore;
        
        return (
            <div className="z-20 flex flex-col items-center gap-6 w-full max-w-5xl">
                <DynamicBackground />
                <h2 className="text-7xl font-black uppercase italic text-white/20">SEANS ÖZETİ</h2>
                <div className="flex flex-col items-center bg-zinc-900/50 p-10 rounded-[3rem] border border-white/10 backdrop-blur-xl w-full relative">
                    {isNewRecord && (
                        <div className="absolute -top-6 bg-yellow-400 text-black px-6 py-2 rounded-full font-black italic tracking-widest flex items-center gap-2 animate-bounce">
                            <Trophy size={18} /> YENİ REKOR
                        </div>
                    )}
                    
                    <p className="text-zinc-500 uppercase font-black tracking-widest mb-2">Final Skor</p>
                    <p className="text-9xl font-black italic mb-10">{score}</p>
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
            
            {/* Top Bar with High Score */}
            <div className="absolute top-8 left-8 flex flex-col opacity-60">
                <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">En Yüksek ({category})</span>
                <span className="text-3xl font-black italic flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /> {highScore}</span>
            </div>

            <div className="w-full z-10 flex flex-col items-center">
                <Timer 
                    duration={difficulty === 'Hard' ? 10 : difficulty === 'Medium' ? 14 : 20} 
                    onTimeUp={handleGameOver} 
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
            </div>

            <div className="w-full max-w-3xl z-10 relative mt-auto">
                <GameInput 
                    onWordSubmit={handleWordSubmit} 
                    disabled={gameState !== 'playing'}
                    error={error}
                    lastLetter={words.length > 0 ? words[words.length - 1].slice(-1) : undefined}
                />
                
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                    <div className="flex items-center gap-1"><Zap size={10} /> {difficulty === 'Hard' ? 'ZOR' : difficulty === 'Medium' ? 'ORTA' : 'KOLAY'}</div>
                    <div className="flex items-center gap-1"><Layers size={10} /> {category}</div>
                    <button 
                        onClick={handleHint}
                        disabled={hintsRemaining <= 0}
                        className={`flex items-center gap-1 transition-colors ${hintsRemaining > 0 ? 'hover:text-white cursor-help' : 'opacity-30 cursor-not-allowed'}`}
                    >
                        <HelpCircle size={10} /> İPUCU ({hintsRemaining})
                    </button>
                </div>
            </div>
        </div>
    );
}
