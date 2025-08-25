"use client";
import { LandingPageRefactored as LandingPage } from "./components/landing/LandingPageRefactored";
import { TestPlace } from "./components/TestPlace";
import { useState } from "react";

export default function Home() {
  const [showTest, setShowTest] = useState(false);

  return (
    <>
      {showTest ? (
        <TestPlace />
      ) : (
        <LandingPage onUpload={() => setShowTest(true)} />
      )}
    </>
  );
}
