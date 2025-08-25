const exp = require('express');
const evalApp = exp.Router();
const axios = require('axios');

// simple evaluator fallback: compares string similarity and returns scores
function simpleScore(original, answer) {
  // If no student answer, zero
  if (!answer) return 0;
  const o = (original || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const a = (answer || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (o.length === 0 || a.length === 0) return 0;

  const oSet = new Set(o);
  const aSet = new Set(a);
  let common = 0;
  for (const w of aSet) if (oSet.has(w)) common++;

  const precision = common / aSet.size;
  const recall = common / oSet.size;
  if (precision === 0 && recall === 0) return 0;
  const f1 = (2 * precision * recall) / (precision + recall);
  return Math.round(f1 * 100);
}

// Ensure the microservice URL is configured via environment variables
const MICRO_SERVICE_URL = process.env.MICRO_SERVICE_URL || process.env.MICRO_SERVICE_URI || 'http://127.0.0.1:8000';
const MICRO_SERVICE_TIMEOUT_MS = parseInt(process.env.MICRO_SERVICE_TIMEOUT_MS || '120000', 10); // default 120s

async function callMicroEvaluator(original, questions) {
  if (!MICRO_SERVICE_URL) throw new Error('Evaluation microservice URL is not configured.');
  const payload = { original, questions };
  const payloadText = JSON.stringify(payload);
  const payloadBytes = Buffer.byteLength(payloadText, 'utf8');
  console.log(`Calling microservice ${MICRO_SERVICE_URL}/evaluate (bytes=${payloadBytes}) with timeout=${MICRO_SERVICE_TIMEOUT_MS}ms`);
  const start = Date.now();
  const res = await axios.post(`${MICRO_SERVICE_URL}/evaluate`, payload, { headers: { 'Content-Type': 'application/json' }, timeout: MICRO_SERVICE_TIMEOUT_MS });
  const took = Date.now() - start;
  console.log(`Microservice responded in ${took}ms (bytes=${payloadBytes})`);
  const data = res.data;

  // Validate the structure of the microservice response
  if (!data || typeof data !== 'object' || typeof data.overallScore !== 'number' || !Array.isArray(data.sections)) {
    const snippet = JSON.stringify(data).slice(0, 500);
    throw new Error('Microservice returned an unexpected response format: ' + snippet);
  }

  // Minimal validation of nested structures
  for (const sec of data.sections) {
    if (!sec || typeof sec !== 'object' || !Array.isArray(sec.questions)) {
      throw new Error('Microservice returned an invalid section structure.');
    }
    for (const q of sec.questions) {
      if (!q || typeof q !== 'object' || !q.id || typeof q.score !== 'number') {
        throw new Error('Microservice returned an invalid question entry.');
      }
    }
  }

  return data;
}

// Synthesize a fallback response when the microservice is unavailable
function synthesizeFallbackResponse(original, questions) {
  const sections = Array.isArray(original.sections) ? original.sections : [];
  const qById = new Map();
  for (const q of questions) {
    const qid = q.questionId || q.id || null;
    const ref = q.referenceAnswer || '';
    const stud = q.studentAnswer;
    const score = simpleScore(ref, stud);
    qById.set(qid, { id: qid, question: q.questionText || '', referenceAnswer: ref, score, feedback: stud ? 'Auto-evaluated (heuristic fallback)' : 'No answer provided', suggestions: [] });
  }

  // Get the set of answered question IDs to determine structure
  const answeredQuestionIds = new Set(questions.map(q => q.questionId || q.id));
  
  const outSections = [];
  let total = 0, count = 0;
  
  // Backend generates 4 sections: easy_medium, hard, dsa, behavioral
  // Frontend combines easy_medium + hard into "Based on projects and experience"
  // Check if we have answers from the first two sections (easy_medium + hard)
  const easyMediumQuestions = sections[0]?.questions || [];
  const hardQuestions = sections[1]?.questions || [];
  const combinedProjectQuestions = [...easyMediumQuestions, ...hardQuestions];
  const hasProjectAnswers = combinedProjectQuestions.some(q => answeredQuestionIds.has(q.id));
  
  // If there are answers from project sections (easy_medium + hard), create combined section
  if (hasProjectAnswers) {
    const outQ = [];
    let secSum = 0, secCount = 0;
    for (const q of combinedProjectQuestions) {
      if (answeredQuestionIds.has(q.id)) {
        const entry = qById.get(q.id) || { id: q.id, question: q.question, referenceAnswer: q.answer || '', score: 0, feedback: 'Question data not found in submission', suggestions: [] };
        outQ.push(entry);
        secSum += entry.score;
        secCount++;
      }
    }
    if (secCount > 0) {
      const secScore = Math.round(secSum / secCount);
      total += secSum;
      count += secCount;
      outSections.push({ 
        title: 'Based on projects and experience', 
        score: secScore, 
        improvements: 'Heuristic feedback: review topics with low scores.', 
        suggestions: secScore < 70 ? ['Review fundamentals and examples for this section'] : [], 
        questions: outQ 
      });
    }
  }
  
  // Process DSA section (section index 2)
  if (sections[2]) {
    const dsaQuestions = sections[2].questions || [];
    const outQ = [];
    let secSum = 0, secCount = 0;
    for (const q of dsaQuestions) {
      if (answeredQuestionIds.has(q.id)) {
        const entry = qById.get(q.id) || { id: q.id, question: q.question, referenceAnswer: q.answer || '', score: 0, feedback: 'Question data not found in submission', suggestions: [] };
        outQ.push(entry);
        secSum += entry.score;
        secCount++;
      }
    }
    if (secCount > 0) {
      const secScore = Math.round(secSum / secCount);
      total += secSum;
      count += secCount;
      outSections.push({ 
        title: 'DSA', 
        score: secScore, 
        improvements: 'Heuristic feedback: review algorithmic thinking and data structures.', 
        suggestions: secScore < 70 ? ['Practice more algorithmic problems and time complexity analysis'] : [], 
        questions: outQ 
      });
    }
  }
  
  // Process Behavioral section (section index 3)
  if (sections[3]) {
    const behavioralQuestions = sections[3].questions || [];
    const outQ = [];
    let secSum = 0, secCount = 0;
    for (const q of behavioralQuestions) {
      if (answeredQuestionIds.has(q.id)) {
        const entry = qById.get(q.id) || { id: q.id, question: q.question, referenceAnswer: q.answer || '', score: 0, feedback: 'Question data not found in submission', suggestions: [] };
        outQ.push(entry);
        secSum += entry.score;
        secCount++;
      }
    }
    if (secCount > 0) {
      const secScore = Math.round(secSum / secCount);
      total += secSum;
      count += secCount;
      outSections.push({ 
        title: 'Behavioural', 
        score: secScore, 
        improvements: 'Heuristic feedback: work on communication and situational responses.', 
        suggestions: secScore < 70 ? ['Practice behavioral interview scenarios and STAR method'] : [], 
        questions: outQ 
      });
    }
  }
  
  const overall = count ? Math.round(total / count) : 0;
  return { overallScore: overall, evaluatedAt: new Date().toISOString(), sections: outSections, usedFallback: true };
}

// POST /evaluate - Main evaluation endpoint
evalApp.post('/', exp.json(), async (req, res) => {
  const { original, answers, questions: incomingQuestions } = req.body;
  if (!original) return res.status(400).send({ error: 'Missing `original` contest data in request body' });

  // Normalize incoming answers/questions into a single consistent format
  let allQuestions = [];
  if (Array.isArray(incomingQuestions) && incomingQuestions.length > 0) {
    allQuestions = incomingQuestions.map(q => ({
      questionId: q.questionId || q.id,
      questionText: q.questionText || q.question || '',
      referenceAnswer: q.referenceAnswer || q.answer || '',
      studentAnswer: q.studentAnswer === undefined ? null : q.studentAnswer
    }));
  } else if (answers && typeof answers === 'object') {
    const sections = original.sections || [];
    for (const s of sections) {
      for (const q of s.questions) {
        allQuestions.push({ questionId: q.id, questionText: q.question, referenceAnswer: q.answer || '', studentAnswer: answers[q.id] === undefined ? null : answers[q.id] });
      }
    }
  }

  if (allQuestions.length === 0) {
    return res.status(400).send({ error: 'No questions or answers found to evaluate' });
  }

  // Try microservice with retries, then use local heuristic as a fallback
  let microResp = null;
  let lastErr = null;
  const maxAttempts = parseInt(process.env.MICRO_SERVICE_MAX_ATTEMPTS || '3', 10);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Microservice attempt ${attempt}/${maxAttempts}`);
      microResp = await callMicroEvaluator(original, allQuestions);
      break; // Success
    } catch (err) {
      lastErr = err;
      // Log axios-specific details when available
      if (err && err.isAxiosError) {
        console.warn(`Microservice attempt ${attempt} failed: code=${err.code} status=${err.response?.status}`, err.message);
      } else {
        console.warn(`Microservice attempt ${attempt} failed:`, err && err.message ? err.message : String(err));
      }
      if (attempt < maxAttempts) {
        // small exponential backoff (ms)
        const backoff = 300 * Math.pow(2, attempt - 1);
        console.log(`Waiting ${backoff}ms before retrying...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  if (microResp) {
    console.log('Successfully received and forwarding microservice response.');
    return res.send(microResp);
  }

  // If we get here, all microservice attempts failed.
  console.error('Microservice unavailable after all retries. Using heuristic fallback.', lastErr ? (lastErr.message || String(lastErr)) : 'No specific error');
  const fallback = synthesizeFallbackResponse(original, allQuestions);
  return res.send(fallback);

  // **FIXED**: The entire loop and response logic below this line was unreachable ("dead code")
  // because the code above will always return a response. It has been removed.
});

module.exports = evalApp;