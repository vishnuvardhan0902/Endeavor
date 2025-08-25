"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from './types';

interface NavigationControlsProps {
  showSingleQuestion: boolean;
  setShowSingleQuestion: (show: boolean) => void;
  currentQIndex: number;
  setCurrentQIndex: (index: number) => void;
  flatQuestions: Question[];
  selectedSectionIndex: number;
  setSelectedSectionIndex: (index: number) => void;
  sectionCount: number;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  showSingleQuestion,
  setShowSingleQuestion,
  currentQIndex,
  setCurrentQIndex,
  flatQuestions,
  selectedSectionIndex,
  setSelectedSectionIndex,
  sectionCount
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <Select
          value={showSingleQuestion ? "single" : "all"}
          onValueChange={(value) => setShowSingleQuestion(value === "single")}
        >
          <SelectTrigger className="w-[200px] bg-slate-800 border-slate-600 text-slate-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
            <SelectItem value="single">Single Question</SelectItem>
            <SelectItem value="all">All Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Controls */}
      {showSingleQuestion ? (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
            disabled={currentQIndex <= 0}
            className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Question</span>
            <Select
              value={String(currentQIndex)}
              onValueChange={(value) => setCurrentQIndex(Number(value))}
            >
              <SelectTrigger className="w-[100px] bg-slate-800 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
                {flatQuestions.map((_, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-300">of {flatQuestions.length}</span>
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentQIndex(Math.min(flatQuestions.length - 1, currentQIndex + 1))}
            disabled={currentQIndex >= flatQuestions.length - 1}
            className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">Section:</span>
          <Select
            value={String(selectedSectionIndex)}
            onValueChange={(value) => setSelectedSectionIndex(Number(value))}
          >
            <SelectTrigger className="w-[300px] bg-slate-800 border-slate-600 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-slate-100">
              {Array.from({ length: sectionCount }, (_, index) => (
                <SelectItem key={index} value={String(index)}>
                  Section {index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
