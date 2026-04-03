export default function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200/70"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[1.75rem] bg-slate-200/60" />
    </div>
  )
}
