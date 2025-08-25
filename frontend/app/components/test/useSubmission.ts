"use client";
import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Contest, Question, DsaParts } from './types';
import { HISTORY_KEY, AUTO_CLEAN_LOCAL_HISTORY, SESSION_CONSUMED_KEY } from './constants';

interface SubmissionResult {
  overallScore: number;
  sections: any[];
}

export function useSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPercent, setSubmitPercent] = useState(0);
  const [submitMessages, setSubmitMessages] = useState<string[]>([]);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  
  const submitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRequestAbortRef = useRef<AbortController | null>(null);
  const { data: session } = useSession();

  const submitResultToHistory = useCallback((payload: any) => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY) || "[]";
      const history = JSON.parse(raw);
      history.unshift(payload);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
      
      // Attempt to save to server if user logged in
      try {
        saveHistoryToServer(payload).catch((e) => console.warn('server save failed', e));
      } catch (e) {}
    } catch (e) {
      console.warn("Could not save result to history", e);
    }
  }, []);

  const saveHistoryToServer = useCallback(async (record: any) => {
    try {
      if (!session?.user?.email) return;

      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "") || "http://127.0.0.1:4000";
      const url = `${baseUrl}/user-api/save-history`;
      const headers: any = { 'Content-Type': 'application/json' };
      const clientToken = (session as any)?.accessToken;
      if (clientToken) headers['Authorization'] = `Bearer ${clientToken}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ record }),
        credentials: 'include',
      });
      
      if (res.ok && AUTO_CLEAN_LOCAL_HISTORY && record?.id) {
        try {
          const raw = localStorage.getItem(HISTORY_KEY) || '[]';
          const history = JSON.parse(raw || '[]');
          const filtered = history.filter((r: any) => r.id !== record.id);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
        } catch (e) {}
      }
    } catch (e) {
      console.warn('saveHistoryToServer error', e);
    }
  }, [session]);

  const handleSubmit = useCallback(async (
    manual: boolean,
    contest: Contest | null,
    originalContest: Contest | null,
    flatQuestions: Question[],
    answers: Record<string, string>,
    dsaParts: DsaParts,
    contestKey: string | null,
    contestRunId: string | null
  ) => {
    if (isSubmitting) return;

    // Build answers including DSA parts
    const localAnswers = { ...answers };
    for (const [qid, parts] of Object.entries(dsaParts)) {
      if (!parts) continue;
      const combined = `Approach:\n${parts.approach || ''}\n\nCode:\n${parts.code || ''}\n\nTime & Space Complexity:\n${parts.complexity || ''}`;
      localAnswers[qid] = combined;
    }

    const questionsPayload = flatQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.question ?? "",
      referenceAnswer: (q as any).answer ?? "",
      studentAnswer: localAnswers[q.id] ?? ""
    }));

    const originalClone: Contest = {
      ...(originalContest as Contest),
      sections: (originalContest?.sections || []).map((s) => ({
        title: s.title,
        questions: (s.questions || []).map((q) => ({
          id: q.id,
          question: q.question,
          ...((q as any).answer ? { answer: (q as any).answer } : {})
        }))
      }))
    };

    const payload = {
      original: originalClone,
      questions: questionsPayload
    };

    // Manual submit confirmation
    if (manual) {
      try {
        // prefer a styled confirm if available (not implemented), fallback to window.confirm
        if (typeof window !== "undefined" && !window.confirm("Are you sure you want to submit your exam?")) {
          return;
        }
      } catch (e) {
        console.warn("confirm failed, proceeding", e);
      }
    }

    setIsSubmitting(true);
    setSubmitMessages(["Preparing your exam submission...", "Evaluating your answers...", "Calculating final scores..."]);
    setSubmitPercent(6);

    if (submitTimerRef.current) clearInterval(submitTimerRef.current);
    submitTimerRef.current = setInterval(() => {
      setSubmitPercent((p) => Math.min(96, p + Math.floor(Math.random() * 6) + 2));
    }, 600);

    // Abort previous request if present
    if (activeRequestAbortRef.current) {
      try { activeRequestAbortRef.current.abort(); } catch (e) {}
      activeRequestAbortRef.current = null;
    }
    const abortController = new AbortController();
    activeRequestAbortRef.current = abortController;

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "") || "http://127.0.0.1:4000";
      const url = `${baseUrl}/evaluate`;
      const payloadText = JSON.stringify(payload);

      const timeoutMs = 200000;
      const timeoutId = setTimeout(() => {
        try { abortController.abort(); } catch (e) {}
      }, timeoutMs);

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadText,
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);

      const resStatus = resp.status;
      let responseBody: any = null;
      try {
        responseBody = await resp.json();
      } catch (e) {
        try { responseBody = await resp.text(); } catch (e2) { responseBody = null; }
      }

      if (!resp.ok) {
        throw new Error(`Evaluator returned status ${resStatus}`);
      }

      if (!responseBody || typeof responseBody.overallScore !== "number") {
        throw new Error("Invalid response format from evaluator");
      }

      const normalizedResult = {
        ...responseBody,
        overallScore: responseBody.overallScore,
        sections: Array.isArray(responseBody.sections) ? responseBody.sections : []
      };

      // Process results to match display format
      const questionFeedbackById: Record<string, any> = {};
      for (const sec of normalizedResult.sections) {
        const qs = Array.isArray(sec.questions) ? sec.questions : [];
        for (const qf of qs) {
          if (qf && (qf.questionId || qf.id)) {
            const questionId = qf.questionId || qf.id;
            questionFeedbackById[String(questionId)] = { ...qf, _section: sec };
          }
        }
      }

      const presented = contest as Contest;
      const displaySections = (presented?.sections || []).map((s) => {
        const questions = (s.questions || []).map((q) => {
          const qfb = questionFeedbackById[q.id] || questionFeedbackById[`Q${q.id}`] || {};
          const payloadQ: any = questionsPayload.find((pq: any) => pq.questionId === q.id) || {};
          return {
            id: q.id,
            question: q.question,
            studentAnswer: payloadQ.studentAnswer || '',
            score: typeof qfb.score === 'number' ? qfb.score : (qfb.points ?? 0),
            feedback: qfb.feedback || qfb.explanation || ''
          };
        });

        const matched = normalizedResult.sections.find((ns: any) => {
          const nsq = Array.isArray(ns.questions) ? ns.questions : [];
          return nsq.some((nq: any) => {
            const nqId = nq.questionId || nq.id;
            return (s.questions || []).some((pq) => {
              return pq.id === nqId || `Q${pq.id}` === nqId || pq.id === nqId.replace(/^Q/, '');
            });
          });
        });

        let combinedScore = matched?.score ?? 0;
        let combinedImprovements = matched?.improvements ?? '';
        let combinedSuggestions = matched?.suggestions ?? [];

        if (!matched && s.title.toLowerCase().includes('project')) {
          const easyMediumSection = normalizedResult.sections.find((ns: any) => ns.title === 'Easy/Medium');
          const hardSection = normalizedResult.sections.find((ns: any) => ns.title === 'Hard');
          
          if (easyMediumSection && hardSection) {
            combinedScore = Math.round((easyMediumSection.score + hardSection.score) / 2);
            combinedImprovements = easyMediumSection.improvements || hardSection.improvements || '';
            combinedSuggestions = [...(easyMediumSection.suggestions || []), ...(hardSection.suggestions || [])];
          }
        }

        return {
          title: s.title,
          score: combinedScore,
          improvements: combinedImprovements,
          suggestions: combinedSuggestions,
          questions
        };
      });

      const displayResult = {
        overallScore: normalizedResult.overallScore,
        sections: displaySections
      };

      setSubmitPercent(100);
      setResult(displayResult);
      
      submitResultToHistory({
        id: `test_${Date.now()}`,
        takenAt: new Date().toISOString(),
        overall: displayResult.overallScore,
        sections: displayResult.sections,
      });

      // Mark as consumed
      if (contestKey && contestRunId) {
        const consumedKey = `${SESSION_CONSUMED_KEY}_${contestKey}_${contestRunId}`;
        sessionStorage.setItem(consumedKey, '1');
      }

    } catch (err: any) {
      console.error("Submission error:", err);
      try { (window as any).__app_show_alert?.({ message: err?.message || "Failed to submit exam. Please try again.", variant: 'destructive' }); } catch (e) {}
      try { if (!(window as any).__app_show_alert) window.alert(err.message || "Failed to submit exam. Please try again."); } catch (e) {}
    } finally {
      if (submitTimerRef.current) {
        clearInterval(submitTimerRef.current);
        submitTimerRef.current = null;
      }
      setIsSubmitting(false);
      setSubmitPercent(0);
    }
  }, [isSubmitting, submitResultToHistory, session]);

  return {
    isSubmitting,
    submitPercent,
    submitMessages,
    result,
    handleSubmit
  };
}
