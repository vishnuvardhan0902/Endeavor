import { Contest, Question } from './types';

export function makeContestKey(obj: any): string {
  try {
    const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
    let hash = 5381;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) + hash) + s.charCodeAt(i);
      hash = hash & 0xffffffff;
    }
    return String(Math.abs(hash));
  } catch (e) {
    return String(Date.now());
  }
}

export function formatTime(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function isDsaQuestion(q: Question, contest: Contest | null, sectionIndex: number): boolean {
  if (!q) return false;
  const idCheck = String(q.id || '').toLowerCase().startsWith('ds_') || String(q.id || '').toLowerCase().includes('dsa');
  const titleCheck = Boolean(contest?.sections?.[sectionIndex]?.title?.toLowerCase().includes('dsa'));
  return idCheck || titleCheck;
}

export function getSectionDisplayName(originalTitle: string, index: number): string {
  const displayNames = [
    "Based on projects and experience", // Combined easy_medium + hard (2 random questions)
    "DSA",                             // DSA section (3 questions)
    "Behavioural"                      // Behavioral section (3 questions)
  ];
  return `Section ${index + 1}: ${displayNames[index] || originalTitle}`;
}

export function processContest(contest: Contest): Contest {
  if (!contest?.sections || contest.sections.length === 0) return contest;

  const processedSections = [];
  
  // Combine sections 1 & 2 and randomly select 2 questions
  const section1 = contest.sections[0]; // easy_medium
  const section2 = contest.sections[1]; // hard
  
  if (section1 && section2) {
    const combinedQuestions = [
      ...(section1.questions || []),
      ...(section2.questions || [])
    ];
    
    // Randomly select 2 questions from combined pool
    const shuffled = [...combinedQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 2);
    
    processedSections.push({
      title: "Based on projects and experience",
      questions: selectedQuestions
    });
  }
  
  // Add remaining sections (DSA, Behavioral) unchanged
  for (let i = 2; i < contest.sections.length; i++) {
    processedSections.push(contest.sections[i]);
  }
  
  return {
    ...contest,
    sections: processedSections
  };
}
