export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-36 rounded-md bg-bg-elevated" />
      <div className="flex max-w-lg flex-col gap-4">
        <div className="rounded-md border border-border bg-bg-card p-5">
          <div className="mb-4 h-6 w-24 rounded bg-bg-elevated" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="h-3 w-16 rounded bg-bg-elevated" />
                <div className="h-4 w-28 rounded bg-bg-elevated" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
