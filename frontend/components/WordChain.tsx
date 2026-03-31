"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export const WordChain = ({ words }: { words: string[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastItemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Gecikme yeni kelimenin DOM'a tam yerleşmesini sağlar
        const timeout = setTimeout(() => {
            const container = scrollRef.current;
            const lastItem = lastItemRef.current;

            if (container && lastItem) {
                const containerWidth = container.offsetWidth;
                const itemOffset = lastItem.offsetLeft;
                const itemWidth = lastItem.offsetWidth;

                // Kelimeyi tam ortaya hizala
                const targetScroll = itemOffset - (containerWidth / 2) + (itemWidth / 2);
                
                container.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [words.length]);

    return (
        <div 
            ref={scrollRef}
            className="flex items-center w-full overflow-x-auto no-scrollbar scroll-smooth py-20"
        >
            <div className="flex items-center gap-6 px-[50%] min-w-max">
                <AnimatePresence mode="popLayout">
                    {words.map((word, index) => {
                        const isLast = index === words.length - 1;
                        return (
                            <motion.div
                                key={`${word}-${index}`}
                                ref={isLast ? lastItemRef : null}
                                initial={{ opacity: 0, x: 100, scale: 0.5 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: 0, 
                                    scale: isLast ? 1.2 : 0.9 
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="flex items-center gap-6 shrink-0"
                            >
                                <div className={`word-node ${isLast ? 'active-node shadow-[0_0_50px_rgba(255,255,255,0.4)]' : 'opacity-30'}`}>
                                    {word.toUpperCase()}
                                    <span className="ml-2 text-zinc-500 text-[10px] font-bold">
                                        {word.slice(-1).toUpperCase()}
                                    </span>
                                </div>
                                {index < words.length - 1 && (
                                    <div className="w-12 h-[1px] bg-white opacity-5" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {words.length === 0 && (
                    <div className="text-zinc-600 text-2xl font-light italic whitespace-nowrap">
                        Kelime bekleniyor...
                    </div>
                )}
            </div>
        </div>
    );
};
