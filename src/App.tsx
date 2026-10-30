export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-400">NASA Space Apps 2026</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Project P.A.T.H.</h1>
        <p className="mt-2 text-sm text-slate-400">
          Polar Artemis Telemetry &amp; Horizon-Planner
        </p>
        <div className="mt-6 flex justify-center gap-2 font-mono text-xs text-slate-500">
          <span className="rounded bg-slate-800 px-2 py-1">React 18</span>
          <span className="rounded bg-slate-800 px-2 py-1">TypeScript</span>
          <span className="rounded bg-slate-800 px-2 py-1">Tailwind CSS</span>
        </div>
      </div>
    </div>
  );
}
