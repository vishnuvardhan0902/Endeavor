"use client";
import React, { useEffect, useState } from "react";
import { useSession } from 'next-auth/react';

type HistoryRecord = {
  id: string;
  takenAt: string;
  overall: number;
  sections: any[];
  original?: any;
};

export default function ProfilePage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selected, setSelected] = useState<HistoryRecord | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    let mounted = true;

    (async () => {
      // When user is signed in, show server-saved history only.
      if (session?.user?.email) {
        try {
          const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "") || "http://127.0.0.1:4000";
          const headers: any = { 'Content-Type': 'application/json' };
          const clientToken = (session as any)?.accessToken;
          if (clientToken) headers['Authorization'] = `Bearer ${clientToken}`;
          const res = await fetch(`${baseUrl}/user-api/history`, {
            method: 'GET',
            headers,
            credentials: 'include',
          });
          if (res.ok) {
            const json = await res.json();
            const serverHistory = json.history || [];
            if (mounted) setHistory(serverHistory.slice(0, 50));
            return;
          }
        } catch (e) {
          // on error fall through to empty history
        }
      }

      // Not signed in or fetch failed: do not expose device-local history in the profile UI to avoid leaking
      // another user's data on shared browsers. Show empty history and prompt to sign in.
      if (mounted) setHistory([] as HistoryRecord[]);
    })();

    return () => { mounted = false };
  }, []);

  return (
    <div className="p-8 bg-slate-800 text-slate-100 min-h-[60vh]">
      <h2 className="text-2xl mb-4">Profile & Test History</h2>
      <div className="flex gap-6">
        <div className="w-1/3">
          <h3 className="font-semibold mb-2">Recent Tests</h3>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="p-3 border rounded hover:bg-slate-700 cursor-pointer" onClick={() => setSelected(h)}>
                <div className="flex justify-between">
                  <div className="font-medium">Test on {new Date(h.takenAt).toLocaleString()}</div>
                  <div className="text-sm text-emerald-400">{h.overall}%</div>
                </div>
                <div className="text-xs text-slate-300">Sections: {h.sections.length}</div>
              </div>
            ))}
            {history.length === 0 && <div className="text-sm text-slate-300">No tests taken yet.</div>}
          </div>
        </div>

        <div className="flex-1">
          {selected ? (
            <div>
              <h3 className="font-semibold">Details for {new Date(selected.takenAt).toLocaleString()}</h3>
              <div className="mt-3">Overall Score: <span className="font-bold">{selected.overall}</span></div>
              <div className="mt-3 space-y-3">
                {selected.sections.map((s, i) => (
                  <div key={i} className="p-3 border border-slate-700 bg-slate-900 rounded">
                    <div className="font-semibold">{s.title} - {s.score}%</div>
                    <div className="text-sm text-slate-300">Suggestions:</div>
                    <ul className="list-disc ml-5 text-sm text-emerald-400">
                      {s.suggestions?.map((sg: string, si: number) => <li key={si}>{sg}</li>)}
                    </ul>
                    <div className="mt-2 text-xs text-slate-400">Improvements: {s.improvements}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-300">Select a test to see details and LLM suggestions.</div>
          )}
        </div>
      </div>
    </div>
  );
}
