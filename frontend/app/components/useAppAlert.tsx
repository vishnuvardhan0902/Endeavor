"use client";
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export type AppAlert = { id: string; title?: string; message: string; variant?: 'default' | 'destructive' };

export function useAppAlert() {
  const [alerts, setAlerts] = React.useState<AppAlert[]>([]);

  // allow non-component code to trigger alerts by setting a global callback
  React.useEffect(() => {
    (window as any).__app_show_alert = (opts: { title?: string; message: string; variant?: AppAlert['variant'] }) => {
      const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
      const a: AppAlert = { id, title: opts.title, message: opts.message, variant: opts.variant || 'default' };
      setAlerts((s) => [a, ...s]);
      setTimeout(() => setAlerts((s) => s.filter((x) => x.id !== id)), 5000);
    };
    return () => { (window as any).__app_show_alert = undefined; };
  }, []);

  const showAlert = (opts: { title?: string; message: string; variant?: AppAlert['variant'] }) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    const a: AppAlert = { id, title: opts.title, message: opts.message, variant: opts.variant || 'default' };
    setAlerts((s) => [a, ...s]);
    // auto-dismiss after 5s
    setTimeout(() => {
      setAlerts((s) => s.filter((x) => x.id !== id));
    }, 5000);
  };

  const AlertStack = () => (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2">
      {alerts.map((a) => (
        <Alert key={a.id} variant={a.variant === 'destructive' ? 'destructive' : 'default'} className="shadow-lg">
          {a.title && <AlertTitle className="text-sm">{a.title}</AlertTitle>}
          <AlertDescription className="text-sm">{a.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );

  return { showAlert, AlertStack };
}
