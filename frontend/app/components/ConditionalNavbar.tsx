"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on test page to provide full-screen exam experience
  if (pathname === "/test") {
    return null;
  }
  
  return <Navbar />;
}
