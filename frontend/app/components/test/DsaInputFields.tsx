"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Target, Code, Clock } from 'lucide-react';
import { DsaParts, DsaOpenState } from './types';

interface DsaInputFieldsProps {
  questionId: string;
  dsaOpen: DsaOpenState;
  setDsaOpen: React.Dispatch<React.SetStateAction<DsaOpenState>>;
  dsaParts: DsaParts;
  setDsaParts: React.Dispatch<React.SetStateAction<DsaParts>>;
}

export const DsaInputFields: React.FC<DsaInputFieldsProps> = ({ 
  questionId, 
  dsaOpen, 
  setDsaOpen, 
  dsaParts, 
  setDsaParts 
}) => (
  <div className="space-y-4 mt-6">
    <Card className="border-slate-700 bg-slate-800/50 dark:border-slate-600 dark:bg-slate-800">
      <CardHeader 
        className="cursor-pointer transition-colors hover:bg-slate-700/50 dark:hover:bg-slate-700"
        onClick={() => {
          setDsaOpen(prev => ({ 
            ...prev, 
            [questionId]: { 
              ...prev[questionId], 
              approach: !prev[questionId]?.approach 
            } 
          }));
        }}
      >
        <CardTitle className="text-base flex items-center gap-2 text-slate-100">
          <Target className="h-4 w-4 text-blue-400" />
          Approach
          <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-200 hover:bg-slate-600">
            {dsaOpen[questionId]?.approach ? 'Expanded' : 'Collapsed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      {dsaOpen[questionId]?.approach && (
        <CardContent>
          <Textarea
            name={`approach_${questionId}`}
            value={dsaParts[questionId]?.approach || ''}
            onChange={(e) => setDsaParts((prev) => ({ ...prev, [questionId]: { ...prev[questionId], approach: e.target.value } }))}
            placeholder="Describe your approach to solve this problem..."
            className="min-h-[120px] resize-y bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-400"
          />
        </CardContent>
      )}
    </Card>

    <Card className="border-slate-700 bg-slate-800/50 dark:border-slate-600 dark:bg-slate-800">
      <CardHeader 
        className="cursor-pointer transition-colors hover:bg-slate-700/50 dark:hover:bg-slate-700"
        onClick={() => {
          setDsaOpen(prev => ({ 
            ...prev, 
            [questionId]: { 
              ...prev[questionId], 
              code: !prev[questionId]?.code 
            } 
          }));
        }}
      >
        <CardTitle className="text-base flex items-center gap-2 text-slate-100">
          <Code className="h-4 w-4 text-green-400" />
          Code Implementation
          <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-200 hover:bg-slate-600">
            {dsaOpen[questionId]?.code ? 'Expanded' : 'Collapsed'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-slate-300">Any programming language</CardDescription>
      </CardHeader>
      {dsaOpen[questionId]?.code && (
        <CardContent>
          <Textarea
            name={`code_${questionId}`}
            value={dsaParts[questionId]?.code || ''}
            onChange={(e) => setDsaParts((prev) => ({ ...prev, [questionId]: { ...prev[questionId], code: e.target.value } }))}
            placeholder="Write your code implementation here..."
            className="min-h-[200px] font-mono text-sm resize-y bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-400"
          />
        </CardContent>
      )}
    </Card>

    <Card className="border-slate-700 bg-slate-800/50 dark:border-slate-600 dark:bg-slate-800">
      <CardHeader 
        className="cursor-pointer transition-colors hover:bg-slate-700/50 dark:hover:bg-slate-700"
        onClick={() => {
          setDsaOpen(prev => ({ 
            ...prev, 
            [questionId]: { 
              ...prev[questionId], 
              complexity: !prev[questionId]?.complexity 
            } 
          }));
        }}
      >
        <CardTitle className="text-base flex items-center gap-2 text-slate-100">
          <Clock className="h-4 w-4 text-purple-400" />
          Time & Space Complexity
          <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-200 hover:bg-slate-600">
            {dsaOpen[questionId]?.complexity ? 'Expanded' : 'Collapsed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      {dsaOpen[questionId]?.complexity && (
        <CardContent>
          <Input
            name={`complexity_${questionId}`}
            value={dsaParts[questionId]?.complexity || ''}
            onChange={(e) => setDsaParts((prev) => ({ ...prev, [questionId]: { ...prev[questionId], complexity: e.target.value } }))}
            placeholder="e.g., Time: O(n log n), Space: O(1)"
            className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-400"
          />
        </CardContent>
      )}
    </Card>
  </div>
);
