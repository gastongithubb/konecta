'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes"

const motivationalQuotes = [
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "La única forma de hacer un gran trabajo es amar lo que haces.",
    "No cuentes los días, haz que los días cuenten.",
    "El mejor momento para plantar un árbol era hace 20 años. El segundo mejor momento es ahora.",
    "Cree que puedes y ya estás a medio camino.",
    "La vida es 10% lo que te ocurre y 90% cómo reaccionas ante ello.",
    "El fracaso es la oportunidad de comenzar de nuevo, pero más inteligentemente.",
    "No te preocupes por los fracasos, preocúpate por las oportunidades que pierdes cuando ni siquiera lo intentas.",
    "La confianza en ti mismo es el primer secreto del éxito.",
    "El único modo de hacer un gran trabajo es amar lo que haces."
];

const MotivationalQuotesCarousel: React.FC = () => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [fade, setFade] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const intervalId = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setCurrentQuoteIndex((prevIndex) => 
                    prevIndex === motivationalQuotes.length - 1 ? 0 : prevIndex + 1
                );
                setFade(false);
            }, 500);
        }, 8000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='text-center min-h-[200px] flex items-center justify-center 
            border-t border-b 
            border-gray-200 dark:border-gray-700/50
            bg-white/50 dark:bg-[#020817]
            backdrop-blur-sm
            transition-colors duration-300'>
            <div className="relative max-w-2xl px-4 py-16 mx-auto sm:px-6 lg:max-w-7xl lg:px-8">
                {/* Decorative elements */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 
                    text-blue-500/10 dark:text-blue-400/10">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h10zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.999v-10h9.999z"/>
                    </svg>
                </div>
                <div 
                    className={`text-2xl font-bold 
                        text-gray-900 dark:text-gray-100
                        transition-all duration-500 ease-in-out 
                        ${fade ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}
                        selection:bg-blue-500/20 dark:selection:bg-blue-400/30`}
                >
                    {motivationalQuotes[currentQuoteIndex]}
                </div>
                <div className="absolute right-0 bottom-1/2 translate-y-1/2 w-8 h-8 
                    text-blue-500/10 dark:text-blue-400/10 transform rotate-180">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h10zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.999v-10h9.999z"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default MotivationalQuotesCarousel;