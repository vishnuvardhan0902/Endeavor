"use client";
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export function Navbar() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            // Send user details to backend after sign-in
            // const res = axios.post("http://localhost:4000/user-api/register", {
            //     name: session.user.name,
            //     email: session.user.email
            // });
        }
    }, [session?.user]);

    return (
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white shadow-md">
            <div className="flex items-center gap-4">
                <Link href="/" className="text-lg font-semibold brand-logo hover:opacity-80 transition-opacity">Endeavor</Link>
            </div>
            <div className="flex items-center gap-3">
                {session?.user && (
                    <Link href="/profile" className="px-3 py-1.5 rounded-md gradient-outline-btn text-sm font-medium text-slate-100 bg-slate-800/60 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all">
                        Profile
                    </Link>
                )}
                {!session?.user && (
                    <button
                        onClick={() => signIn()}
                        type="button" className="px-4 py-2 rounded-md gradient-outline-btn text-sm font-medium text-slate-100 bg-slate-800/60 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    >
                        Sign In
                    </button>
                )}
                {session?.user && (
                    <button
                        onClick={() => signOut()}
                        type="button" className="px-4 py-2 rounded-md gradient-outline-btn text-sm font-medium text-slate-100 bg-slate-800/60 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
}