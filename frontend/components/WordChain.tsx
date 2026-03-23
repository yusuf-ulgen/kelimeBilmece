"use client";
import { motion, AnimatePresence } from 'framer-motion';

export const WordChain = ({ words }: { words: string[] }) => {
    return (
        <div className="flex items-center gap-4 py-20 px-10 overflow-x-auto no-scrollbar scroll-smooth">
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
