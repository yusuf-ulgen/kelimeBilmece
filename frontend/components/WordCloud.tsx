"use client";
import { motion, AnimatePresence } from 'framer-motion';

export const WordCloud = ({ words }: { words: string[] }) => {
    return (
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl p-10">
            {words.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ 
                        fontSize: `${Math.max(1, 4 - (i * 0.1))}rem`,
                        fontWeight: 900 - (i * 20)
                    }}
                    className="uppercase italic tracking-tighter text-white/80 hover:text-white transition-colors cursor-default"
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};
