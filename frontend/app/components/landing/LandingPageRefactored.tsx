"use client";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import LoadingScreen from "../LoadingScreen";
import { useAppAlert } from "../useAppAlert";
import { FileUpload } from "./FileUpload";
import { processUploadResponse } from "./uploadUtils";

const MICRO_SERVICE_URI =
    process.env.NEXT_PUBLIC_MICRO_SERVICE_URI || process.env.MICRO_SERVICE_URI || "http://127.0.0.1:8000";

export interface LandingPageProps {
    onUpload?: (questions: any) => void;
}

export function LandingPageRefactored({ onUpload }: LandingPageProps) {
    const { showAlert, AlertStack } = useAppAlert();
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [percent, setPercent] = React.useState(0);
    const [messages, setMessages] = React.useState<string[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        const formData = new FormData();
        formData.append("resume", file);

        setLoading(true);
        setPercent(0);
        setMessages([
            "1/5 — Uploading resume",
            "2/5 — Analyzing resume",
            "3/5 — Extracting skills & focus",
            "4/5 — Retrieving technical contexts",
            "5/5 — Generating interview questions",
        ]);

        try {
            const res = await axios.post(`${MICRO_SERVICE_URI}/generate`, formData, {
                onUploadProgress: (evt) => {
                    if (evt.total) {
                        const p = Math.round((evt.loaded / evt.total) * 45);
                        setPercent(p);
                    }
                },
            });
            
            setPercent(55);
            console.log("microservice response:", res.data);

            const contestData = processUploadResponse(res);

            // Validate contestData
            const hasQuestions = contestData && Array.isArray(contestData.sections) && 
                contestData.sections.some((s: any) => Array.isArray(s.questions) && s.questions.length > 0);
            
            if (!hasQuestions) {
                showAlert({ message: 'No questions found in the contest data. Please go back to the upload page and try again.', variant: 'destructive' });
                setLoading(false);
                setPercent(0);
                return;
            }

            try {
                sessionStorage.setItem('contest_data', JSON.stringify(contestData));
            } catch (err) {
                console.warn('sessionStorage unavailable', err);
            }

            if (onUpload) onUpload(contestData);
            
            setPercent(85);
            setTimeout(() => {
                setPercent(100);
                router.replace('/test');
            }, 350);
            
        } catch (err: any) {
            console.error("upload error:", err?.response || err);
            if (err?.response) {
                showAlert({ message: `Upload failed: ${err.response.status} ${err.response.statusText}`, variant: 'destructive' });
            } else {
                showAlert({ message: "Upload failed: no response from microservice (check CORS and that it's running)", variant: 'destructive' });
            }
        } finally {
            setTimeout(() => setLoading(false), 400);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] p-8 bg-slate-800 text-slate-100">
            <AlertStack />
            <LoadingScreen active={loading} percent={percent} messages={messages} />
            <h2 className="text-2xl font-bold mb-4">Upload Your Resume</h2>
            <FileUpload onFileChange={handleFileChange} loading={loading} />
            <p className="mt-4 text-sm text-slate-400 text-center max-w-md">
                Upload your resume to generate personalized interview questions based on your experience and skills.
            </p>
        </div>
    );
}
