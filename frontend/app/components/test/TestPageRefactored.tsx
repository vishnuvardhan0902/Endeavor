"use client";
import React, { useState, useMemo, useEffect } from "react";
import LoadingScreen from "../LoadingScreen";
import { Navbar } from "../Navbar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Import our organized components
import { useContestData } from './useContestData';
import { useSubmission } from './useSubmission';
import { useTimer } from './useTimer';
import { TimerDisplay } from './TimerDisplay';
import { NavigationControls } from './NavigationControls';
import { QuestionDisplay } from './QuestionDisplay';
import { getSectionDisplayName } from './utils';
import { Question, Section } from './types';

export default function TestPage() {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Use our custom hooks
  const {
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
  } = useContestData();

  const {
    isSubmitting,
    submitPercent,
    submitMessages,
    result,
    handleSubmit
  } = useSubmission();

  // Flattened list of questions for navigation
  const flatQuestions = useMemo(() => {
    if (!contest) return [] as Question[];
    return contest.sections?.flatMap((s: Section) => s.questions || []) || [];
  }, [contest]);

  // Keep currentQIndex in bounds if questions length changes
  useEffect(() => {
    if (currentQIndex >= flatQuestions.length && flatQuestions.length > 0) {
      setCurrentQIndex(flatQuestions.length - 1);
    }
  }, [flatQuestions, currentQIndex]);

  // Auto-submit when timer reaches 0
  const onTimeUp = React.useCallback(() => {
    handleSubmit(
      false, // auto-submit, no confirmation
      contest,
      originalContest,
      flatQuestions,
      answers,
      dsaParts,
      contestKey,
      contestRunId
    );
  }, [handleSubmit, contest, originalContest, flatQuestions, answers, dsaParts, contestKey, contestRunId]);

  useTimer({ timeLeft, setTimeLeft, isSubmitting, onTimeUp });

  // Manual submit handler
  const onManualSubmit = React.useCallback(() => {
    handleSubmit(
      true, // manual submit, show confirmation
      contest,
      originalContest,
      flatQuestions,
      answers,
      dsaParts,
      contestKey,
      contestRunId
    );
  }, [handleSubmit, contest, originalContest, flatQuestions, answers, dsaParts, contestKey, contestRunId]);

  if (!contest) {
    return <LoadingScreen active={true} percent={0} messages={["Loading contest..."]} />;
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <div className="container mx-auto p-6 max-w-4xl">
          <Card className="border-slate-700 bg-slate-800 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-400 flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Exam Completed
              </CardTitle>
              <CardDescription className="text-slate-300">
                Your submission has been evaluated successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {result.overallScore}/100
                </div>
                <div className="text-slate-300">Overall Score</div>
              </div>
              
              <div className="space-y-4">
                {result.sections.map((section: any, index: number) => (
                  <Card key={index} className="border-slate-600 bg-slate-900">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-100">
                        {getSectionDisplayName(section.title, index)}
                      </CardTitle>
                      <div className="text-2xl font-bold text-blue-400">
                        {section.score}/100
                      </div>
                    </CardHeader>
                    <CardContent>
                      {section.improvements && (
                        <div className="mb-4">
                          <h4 className="font-medium text-slate-300 mb-2">Areas for Improvement:</h4>
                          <p className="text-slate-400 text-sm">{section.improvements}</p>
                        </div>
                      )}
                      {section.suggestions && section.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-slate-300 mb-2">Suggestions:</h4>
                          <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                            {section.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Loading overlay for submission */}
      <LoadingScreen 
        active={isSubmitting} 
        percent={submitPercent} 
        messages={submitMessages} 
      />
      
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header with timer and controls */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Technical Interview</h1>
          <div className="flex items-center gap-4">
            <TimerDisplay timeLeft={timeLeft} />
            <Button 
              onClick={onManualSubmit}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              Submit Exam
            </Button>
          </div>
        </div>

        {/* Warning for low time */}
        {timeLeft !== null && timeLeft <= 300 && (
          <Alert className="border-red-500 bg-red-950/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Warning: Less than 5 minutes remaining! Your exam will auto-submit when time runs out.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Controls */}
        <NavigationControls
          showSingleQuestion={showSingleQuestion}
          setShowSingleQuestion={setShowSingleQuestion}
          currentQIndex={currentQIndex}
          setCurrentQIndex={setCurrentQIndex}
          flatQuestions={flatQuestions}
          selectedSectionIndex={selectedSectionIndex}
          setSelectedSectionIndex={setSelectedSectionIndex}
          sectionCount={contest.sections?.length || 0}
        />

        <Separator className="bg-slate-600 mb-6" />

        {/* Questions Display */}
        {showSingleQuestion ? (
          // Single question view
          flatQuestions.length > 0 && (
            <QuestionDisplay
              question={flatQuestions[currentQIndex]}
              contest={contest}
              sectionIndex={
                contest.sections?.findIndex((s: Section) => 
                  s.questions?.some((q: Question) => q.id === flatQuestions[currentQIndex]?.id)
                ) || 0
              }
              answers={answers}
              setAnswers={setAnswers}
              dsaParts={dsaParts}
              setDsaParts={setDsaParts}
              dsaOpen={dsaOpen}
              setDsaOpen={setDsaOpen}
            />
          )
        ) : (
          // All questions view
          contest.sections && selectedSectionIndex < contest.sections.length && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                {getSectionDisplayName(contest.sections[selectedSectionIndex].title, selectedSectionIndex)}
              </h2>
              {contest.sections[selectedSectionIndex].questions?.map((question: Question, qIndex: number) => (
                <QuestionDisplay
                  key={question.id}
                  question={question}
                  contest={contest}
                  sectionIndex={selectedSectionIndex}
                  answers={answers}
                  setAnswers={setAnswers}
                  dsaParts={dsaParts}
                  setDsaParts={setDsaParts}
                  dsaOpen={dsaOpen}
                  setDsaOpen={setDsaOpen}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
