export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-ocean-500">
        {eyebrow}
      </p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-ink-700">{description}</p>
        </div>
      </div>
    </div>
  )
}
