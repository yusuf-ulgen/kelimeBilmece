"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export const WordChain = ({ words }: { words: string[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lastItemRef.current) {
            lastItemRef.current.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }, [words.length]);

    return (
        <div 
            ref={scrollRef}
            className="flex items-center w-full overflow-x-auto no-scrollbar scroll-smooth py-20"
        >
            <div className="flex items-center gap-4 px-[50%] min-w-full">
                <AnimatePresence mode="popLayout">
                    {words.map((word, index) => {
                        const isLast = index === words.length - 1;
                        return (
                            <motion.div
                                key={`${word}-${index}`}
                                ref={isLast ? lastItemRef : null}
                                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className="flex items-center gap-4 shrink-0"
                            >
                                <div className={`word-node ${isLast ? 'active-node scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'opacity-40'}`}>
                                    {word}
                                    <span className="ml-2 text-zinc-500 text-xs font-normal">
                                        {word.slice(-1).toUpperCase()}
                                    </span>
                                </div>
                                {index < words.length - 1 && (
                                    <div className="w-8 h-[2px] bg-white opacity-10" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {words.length === 0 && (
                    <div className="text-zinc-600 text-2xl font-light italic whitespace-nowrap">
                        Bir kelime yazarak tırtılı başlat...
                    </div>
                )}
            </div>
        </div>
    );
};
