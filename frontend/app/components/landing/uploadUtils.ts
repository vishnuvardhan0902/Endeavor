export function processUploadResponse(res: any) {
  const mapQuestion = (raw: any) => {
    // Accept raw string, otherwise use object properties
    if (typeof raw === 'string') {
      return {
        id: `q_${Math.random().toString(36).slice(2,9)}`,
        question: raw,
        answer: ''
      };
    }
    if (!raw || typeof raw !== 'object') {
      return {
        id: `q_${Math.random().toString(36).slice(2,9)}`,
        question: String(raw || ''),
        answer: ''
      };
    }
    const {
      id,
      q: qText,
      question: questionText,
      a,
      answer,
      examples,
      constraints,
      difficulty,
      complexity,
      code,
      ...rest
    } = raw;
    return {
      ...rest, // keep any additional metadata from microservice
      id: id || `q_${Math.random().toString(36).slice(2,9)}`,
      question: qText || questionText || '',
      answer: a ?? answer ?? '',
      ...(examples ? { examples } : {}),
      ...(constraints ? { constraints } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(complexity ? { complexity } : {}),
      ...(code ? { code } : {})
    };
  };

  let contestData: any = null;

  if (typeof res.data === 'object' && res.data !== null) {
    const payload = res.data;
    
    // If the microservice already returned `sections`, use them directly while preserving fields
    if (Array.isArray(payload.sections) && payload.sections.length > 0) {
      const sections = payload.sections.map((s: any) => ({
        title: s.title || 'Section',
        questions: Array.isArray(s.questions) ? s.questions.map((q: any) => mapQuestion(q)) : [],
      }));
      contestData = { sections };
    }

    // If no top-level sections, try to extract from llm_output only as fallback
    if (!contestData && payload.llm_output && typeof payload.llm_output === 'string') {
      const match = /```(?:json)?\s*([\s\S]*?)```/.exec(payload.llm_output);
      const inner = match ? match[1] : payload.llm_output;
      try {
        const parsed = JSON.parse(inner);
        const sections: any[] = [];
        if (Array.isArray(parsed.easy_medium)) {
          sections.push({ title: 'Easy/Medium', questions: parsed.easy_medium.map((it: any) => mapQuestion(it)) });
        }
        if (Array.isArray(parsed.hard)) {
          sections.push({ title: 'Hard', questions: parsed.hard.map((it: any) => mapQuestion(it)) });
        }
        if (Array.isArray(parsed.dsa)) {
          sections.push({ title: 'DSA', questions: parsed.dsa.map((it: any) => mapQuestion(it)) });
        }
        if (Array.isArray(parsed.behavioral)) {
          sections.push({ title: 'Behavioral', questions: parsed.behavioral.map((it: any) => mapQuestion(it)) });
        }
        if (sections.length) contestData = { sections };
      } catch (pe) {
        console.warn('failed to parse inner llm_output JSON', pe);
      }
    }
  }

  return contestData;
}
