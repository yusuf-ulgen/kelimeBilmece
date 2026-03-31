"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export const WordChain = ({ words }: { words: string[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: scrollRef.current.scrollWidth,
                behavior: 'smooth'
            });
        }
    }, [words.length]);

    return (
        <div 
            ref={scrollRef}
            className="flex items-center gap-4 py-20 px-10 overflow-x-auto no-scrollbar scroll-smooth w-full"
        >
            <AnimatePresence mode="popLayout">
                {words.map((word, index) => (
                    <motion.div
                        key={`${word}-${index}`}
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className="flex items-center gap-4 shrink-0"
                    >
                        <div className="word-node">
                            {word}
                            <span className="ml-2 text-zinc-500 text-xs font-normal">
                                {word.slice(-1).toUpperCase()}
                            </span>
                        </div>
                        {index < words.length - 1 && (
                            <div className="w-8 h-[2px] bg-white opacity-20" />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            {words.length === 0 && (
                <div className="text-zinc-600 text-2xl font-light italic">
                    Bir kelime yazarak tırtılı başlat...
                </div>
            )}
        </div>
    );
};
