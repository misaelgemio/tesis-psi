export default function ProgressBar({ valor, total }: { valor: number; total: number }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur py-2 z-10">
      <div className="flex justify-between text-sm mb-1">
        <span>
          {valor} de {total} respondidos
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-2 bg-gray-200 rounded"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-2 bg-marca rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
