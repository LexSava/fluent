export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-52 rounded-md bg-bg-elevated" />
          <div className="h-4 w-36 rounded bg-bg-elevated" />
        </div>
        <div className="h-7 w-28 rounded-xs bg-bg-elevated" />
      </div>

      {/* Stats label */}
      <section>
        <div className="mb-3 h-3 w-20 rounded bg-bg-elevated" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-22.5 rounded-md border border-border bg-bg-elevated" />
          ))}
        </div>
      </section>

      {/* Session picker */}
      <section>
        <div className="mb-3 h-6 w-36 rounded-md bg-bg-elevated" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-25 rounded-md border border-border bg-bg-elevated" />
          ))}
        </div>
      </section>
    </div>
  )
}
