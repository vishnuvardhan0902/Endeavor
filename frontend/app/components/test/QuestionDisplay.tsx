"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { Question, DsaParts, DsaOpenState, Contest } from './types';
import { isDsaQuestion } from './utils';
import { DsaInputFields } from './DsaInputFields';

interface QuestionDisplayProps {
  question: Question;
  contest: Contest | null;
  sectionIndex: number;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dsaParts: DsaParts;
  setDsaParts: React.Dispatch<React.SetStateAction<DsaParts>>;
  dsaOpen: DsaOpenState;
  setDsaOpen: React.Dispatch<React.SetStateAction<DsaOpenState>>;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  contest,
  sectionIndex,
  answers,
  setAnswers,
  dsaParts,
  setDsaParts,
  dsaOpen,
  setDsaOpen
}) => {
  const isDsa = isDsaQuestion(question, contest, sectionIndex);

  return (
    <Card className="border-slate-700 bg-slate-900/50 dark:border-slate-600 dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Question
          </CardTitle>
          <div className="flex gap-2">
            {question.difficulty && (
              <Badge variant="outline" className="border-purple-400 text-purple-300">
                {question.difficulty}
              </Badge>
            )}
            {isDsa && (
              <Badge variant="outline" className="border-green-400 text-green-300">
                DSA
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-invert max-w-none">
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
            {question.question}
          </div>
        </div>

        {/* Additional DSA information (render inline beneath the question) */}
        {(question.examples || question.constraints) && (
          <div className="mt-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {question.examples && (
              <div className="text-slate-300">
                <span className="font-medium">Examples:</span>
                <div className="text-slate-200 mt-1">{question.examples}</div>
              </div>
            )}

            {question.constraints && (
              <div className="text-slate-300 mt-3">
                <span className="font-medium">Constraints:</span>
                <div className="text-slate-200 mt-1">{question.constraints}</div>
              </div>
            )}
          </div>
        )}

        {/* Answer input - for non-DSA questions */}
        {!isDsa && (
          <div className="mt-6">
            <Textarea
              name={`answer_${question.id}`}
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer here..."
              className="min-h-[150px] resize-y bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}

        {/* DSA-specific input fields */}
        {isDsa && (
          <DsaInputFields
            questionId={question.id}
            dsaOpen={dsaOpen}
            setDsaOpen={setDsaOpen}
            dsaParts={dsaParts}
            setDsaParts={setDsaParts}
          />
        )}
      </CardContent>
    </Card>
  );
};
