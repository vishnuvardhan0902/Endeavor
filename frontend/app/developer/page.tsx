"use client";

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, MapPin, Code, Sparkles } from 'lucide-react';
import { Button } from '../../src/components/ui/button';

const DeveloperPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    setIsLoaded(true);
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        ref={ref}
        className="relative z-10 container mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-20"
          variants={itemVariants}
        >
          <motion.div
            className="relative inline-block mb-8"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.42, 0, 0.58, 1] // easeInOut
            }}
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Code className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4"
            variants={itemVariants}
          >
            Vishnu Vardhan
          </motion.h1>
          
          <motion.p 
            className="text-xl text-slate-300 mb-6"
            variants={itemVariants}
          >
            Tech Enthusiast
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-2 text-slate-400 mb-8"
            variants={itemVariants}
          >
            <MapPin className="w-5 h-5" />
            <span>Hyderabad, India</span>
          </motion.div>

          <motion.div 
            className="flex gap-4 justify-center"
            variants={itemVariants}
          >
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              <a 
                href="https://www.linkedin.com/in/vishnu-vardhan-mvv09/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DeveloperPage;
