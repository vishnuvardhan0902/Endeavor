"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Contest, DsaParts, DsaOpenState } from './types';
import { 
  SESSION_KEY, 
  SESSION_TIME_KEY, 
  SESSION_CONSUMED_KEY, 
  SINGLE_QUESTION_KEY,
  ANSWERS_AUTOSAVE_KEY,
  DSA_AUTOSAVE_KEY,
  DEFAULT_TIME_MIN 
} from './constants';
import { makeContestKey, processContest } from './utils';

export function useContestData() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [originalContest, setOriginalContest] = useState<Contest | null>(null);
  const [contestKey, setContestKey] = useState<string | null>(null);
  const [contestRunId, setContestRunId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dsaParts, setDsaParts] = useState<DsaParts>({});
  const [dsaOpen, setDsaOpen] = useState<DsaOpenState>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSingleQuestion, setShowSingleQuestion] = useState<boolean>(true);
  
  const router = useRouter();

  // Load contest & restore autosaved answers
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        router.replace("/");
        return;
      }
      
      const c: Contest = JSON.parse(raw);
      const key = makeContestKey(c);
      setContestKey(key);

      let runId = sessionStorage.getItem(SESSION_KEY + "_run");
      const storedHash = sessionStorage.getItem(SESSION_KEY + "_hash");
      if (!runId || storedHash !== key) {
        runId = String(Date.now());
        sessionStorage.setItem(SESSION_KEY + "_run", runId);
        sessionStorage.setItem(SESSION_KEY + "_hash", key);
      }
      setContestRunId(runId);

      const answersKey = `${ANSWERS_AUTOSAVE_KEY}_${key}_${runId}`;
      const dsaKey = `${DSA_AUTOSAVE_KEY}_${key}_${runId}`;
      const timeKey = `${SESSION_TIME_KEY}_${key}_${runId}`;
      const consumedKey = `${SESSION_CONSUMED_KEY}_${key}_${runId}`;
      const singleQuestionKey = `${SINGLE_QUESTION_KEY}_${key}_${runId}`;

      // Prevent re-access if this run already consumed
      const consumed = sessionStorage.getItem(consumedKey);
      if (consumed === '1') {
        // prefer in-app alert if provided by useAppAlert, otherwise fall back to window.alert
        try { (window as any).__app_show_alert?.({ message: 'This test has already been taken and cannot be accessed again.', variant: 'destructive' }); } catch (e) { /* noop */ }
        try { if (!(window as any).__app_show_alert) window.alert('This test has already been taken and cannot be accessed again.'); } catch (e) {}
        router.replace('/');
        return;
      }

      setOriginalContest(c);
      const processedContest = processContest(c);
      setContest(processedContest);
      
      // Initialize DSA open states
      const initialOpen: DsaOpenState = {};
      for (const s of processedContest.sections || []) {
        for (const q of s.questions || []) {
          const idCheck = String(q.id || '').toLowerCase().startsWith('ds_') || String(q.id || '').toLowerCase().includes('dsa');
          const titleCheck = Boolean(s.title?.toLowerCase().includes('dsa'));
          if (idCheck || titleCheck) {
            initialOpen[q.id] = { approach: true, code: true, complexity: true };
          }
        }
      }
      setDsaOpen(prev => ({ ...initialOpen, ...prev }));
      
      // Restore saved time
      const savedTime = sessionStorage.getItem(timeKey);
      const t = processedContest.timeLimitMinutes || DEFAULT_TIME_MIN;
      setTimeLeft(savedTime ? Number(savedTime) : t * 60);

      // Restore showSingleQuestion state
      try {
        const savedSingleQuestion = sessionStorage.getItem(singleQuestionKey);
        if (savedSingleQuestion !== null) {
          setShowSingleQuestion(savedSingleQuestion === 'true');
        }
      } catch (e) {}

      // Restore answers
      try {
        const saved = localStorage.getItem(answersKey);
        if (saved) setAnswers(JSON.parse(saved));
      } catch (e) {}

      // Restore DSA parts
      try {
        const savedDsa = localStorage.getItem(dsaKey);
        if (savedDsa) {
          const parsed = JSON.parse(savedDsa);
          setDsaParts(parsed);
          const openState: DsaOpenState = {};
          for (const [qid, partsRaw] of Object.entries(parsed)) {
            const parts = partsRaw as any;
            openState[qid] = {
              approach: Boolean(parts?.approach && parts.approach.trim().length > 0),
              code: Boolean(parts?.code && parts.code.trim().length > 0),
              complexity: Boolean(parts?.complexity && parts.complexity.trim().length > 0)
            };
          }
          setDsaOpen(openState);
        }
      } catch (e) {}
      
    } catch (e) {
      console.error("Failed to load contest data from session storage", e);
      router.replace("/");
    }
  }, [router]);

  // Auto-save functions
  useEffect(() => {
    try {
      if (!contestKey || !contestRunId) return;
      const answersKey = `${ANSWERS_AUTOSAVE_KEY}_${contestKey}_${contestRunId}`;
      localStorage.setItem(answersKey, JSON.stringify(answers));
    } catch (e) {
      // ignore quota errors
    }
  }, [answers, contestKey, contestRunId]);

  useEffect(() => {
    try {
      if (!contestKey || !contestRunId) return;
      const dsaKey = `${DSA_AUTOSAVE_KEY}_${contestKey}_${contestRunId}`;
      localStorage.setItem(dsaKey, JSON.stringify(dsaParts));
    } catch (e) {}
  }, [dsaParts, contestKey, contestRunId]);

  useEffect(() => {
    if (timeLeft === null || !contestKey || !contestRunId) return;
    const timeKey = `${SESSION_TIME_KEY}_${contestKey}_${contestRunId}`;
    sessionStorage.setItem(timeKey, String(timeLeft));
  }, [timeLeft, contestKey, contestRunId]);

  useEffect(() => {
    if (!contestKey || !contestRunId) return;
    const singleQuestionKey = `${SINGLE_QUESTION_KEY}_${contestKey}_${contestRunId}`;
    sessionStorage.setItem(singleQuestionKey, String(showSingleQuestion));
  }, [showSingleQuestion, contestKey, contestRunId]);

  return {
    contest,
    originalContest,
    contestKey,
    contestRunId,
    answers,
    setAnswers,
    dsaParts,
    setDsaParts,
    dsaOpen,
    setDsaOpen,
    timeLeft,
    setTimeLeft,
    showSingleQuestion,
    setShowSingleQuestion
  };
}
