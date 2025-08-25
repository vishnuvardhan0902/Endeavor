"use client";
import { useEffect } from 'react';

interface UseTimerProps {
  timeLeft: number | null;
  setTimeLeft: (time: number | null) => void;
  isSubmitting: boolean;
  onTimeUp: () => void;
}

export function useTimer({ timeLeft, setTimeLeft, isSubmitting, onTimeUp }: UseTimerProps) {
  useEffect(() => {
    if (timeLeft === null) return;
    if (isSubmitting) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const id = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, isSubmitting, onTimeUp, setTimeLeft]);
}
