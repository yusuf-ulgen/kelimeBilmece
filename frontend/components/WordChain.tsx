"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export const WordChain = ({ words }: { words: string[] }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Her kelime yaklaşık 220px genişliğinde varsayılır (gap dahil)
    // Hassas ölçüm yerine stabil sliding için bu değer kullanılır.
    const itemSpacing = 280; 
    const currentOffset = words.length > 0 ? (words.length - 1) * -itemSpacing : 0;

    return (
        <div 
            ref={containerRef}
            className="w-full h-40 relative flex items-center justify-center overflow-hidden"
        >
            {/* Arka Plan Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-white/5 to-black pointer-events-none z-10" />

            <motion.div 
                animate={{ x: currentOffset }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="flex items-center absolute left-1/2 -ml-[110px]" // Genişliğin yarısı kadar sola çekerek 'NANE'yi tam ortalarız
            >
                <AnimatePresence mode="popLayout">
                    {words.map((word, index) => {
                        const distance = words.length - 1 - index;
                        const opacity = Math.max(0.05, 1 - distance * 0.3); // Gittikçe saydamlaş
                        const scale = Math.max(0.6, 1 - distance * 0.1); // Gittikçe küçül
                        const isLast = index === words.length - 1;

                        return (
                            <motion.div
                                key={`${word}-${index}`}
                                initial={{ opacity: 0, scale: 0.5, x: 100 }}
                                animate={{ 
                                    opacity: opacity, 
                                    scale: isLast ? 1.2 : scale,
                                    x: 0,
                                    filter: isLast ? "brightness(1.2)" : "brightness(0.6)"
                                }}
                                exit={{ opacity: 0, scale: 0.5, x: -100 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                className="flex items-center shrink-0"
                                style={{ width: itemSpacing }}
                            >
                                <div className="flex items-center gap-4 w-full justify-center">
                                    <div className={`word-node ${isLast ? 'active-node shadow-[0_0_50px_rgba(255,255,255,0.4)] border-white' : 'border-white/10 opacity-70'}`}>
                                        <span className="text-2xl font-black uppercase tracking-tighter">
                                            {word}
                                        </span>
                                    </div>
                                    {index < words.length - 1 && (
                                        <motion.div 
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            className="w-12 h-[2px] bg-gradient-to-r from-white/20 to-transparent origin-left" 
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {words.length === 0 && (
                <div className="text-zinc-600 text-3xl font-black italic tracking-widest uppercase animate-pulse">
                    Kelime Zinciri Bekleniyor...
                </div>
            )}
        </div>
    );
};
