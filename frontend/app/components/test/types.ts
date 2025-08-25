export type Question = { 
  id: string; 
  question: string; 
  answer?: string;
  // DSA specific fields
  examples?: string;
  constraints?: string;
  difficulty?: string;
  complexity?: string;
  code?: string;
};

export type Section = { 
  title: string; 
  questions: Question[] 
};

export type Contest = { 
  sections: Section[]; 
  timeLimitMinutes?: number 
};

export type DsaParts = Record<string, { 
  approach?: string; 
  code?: string; 
  complexity?: string 
}>;

export type DsaOpenState = Record<string, { 
  approach?: boolean; 
  code?: boolean; 
  complexity?: boolean 
}>;
