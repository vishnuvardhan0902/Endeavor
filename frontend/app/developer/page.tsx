"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import { Linkedin, MapPin, Code, Sparkles } from "lucide-react";
import { Button } from "../../src/components/ui/button";

const DeveloperPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black text-white relative overflow-hidden">
      {/* Subtle gradient light following cursor */}
      <div
        className="absolute w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
        style={{
          left: mousePosition.x - 350,
          top: mousePosition.y - 350,
          transition: "all 0.25s ease-out",
        }}
      />

      {/* Background accent shapes */}
      <div className="absolute top-1/3 left-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -80, 0], opacity: [0, 1, 0] }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        ref={ref}
        className="relative z-10 container mx-auto px-6 py-24"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-20" variants={itemVariants}>
          <motion.div
            className="relative inline-block mb-8"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 p-1 shadow-2xl shadow-blue-800/40">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Code className="w-14 h-14 text-cyan-400" />
              </div>
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 tracking-tight"
            variants={itemVariants}
          >
            Vishnu Vardhan
          </motion.h1>

          <motion.p
            className="text-xl text-slate-300 mb-6 max-w-xl mx-auto"
            variants={itemVariants}
          >
            Tech is Fun
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-2 text-slate-400 mb-8"
            variants={itemVariants}
          >
            <MapPin className="w-5 h-5" />
            <span>Hyderabad, India</span>
          </motion.div>

          <motion.div className="flex gap-4 justify-center" variants={itemVariants}>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-800/40 transition-all duration-300 hover:scale-105"
            >
              <a
                href="https://www.linkedin.com/in/vishnu-vardhan-mvv09/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </Button>
          </motion.div>
        </motion.div>

        {/* About Section */}
        <motion.div
          className="max-w-3xl mx-auto text-center text-slate-300 leading-relaxed text-lg"
          variants={itemVariants}
        >
          I am passionate about solving complex problems through code.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DeveloperPage;
