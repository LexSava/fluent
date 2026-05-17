export default function ProgressLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 rounded-md bg-[var(--bg-elevated)]" />

      {/* Stat cards row 1 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[90px] rounded-md border border-[var(--border)] bg-[var(--bg-elevated)]"
          />
        ))}
      </div>

      {/* Stat cards row 2 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[90px] rounded-md border border-[var(--border)] bg-[var(--bg-elevated)]"
          />
        ))}
      </div>

      {/* Chart block */}
      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="h-5 w-44 rounded bg-[var(--bg-elevated)]" />
        <div className="h-[200px] rounded-md bg-[var(--bg-elevated)]" />
      </div>

      {/* Calendar block */}
      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="h-5 w-44 rounded bg-[var(--bg-elevated)]" />
        <div className="h-[80px] rounded-md bg-[var(--bg-elevated)]" />
      </div>

      {/* Vocab block */}
      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4">
        <div className="h-5 w-36 rounded bg-[var(--bg-elevated)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-md bg-[var(--bg-elevated)]" />
        ))}
      </div>
    </div>
  )
}
