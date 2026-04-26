export default function ActiveFilterChips({ chips, onRemove }) {
  const activeChips = chips.filter((chip) => chip.value)

  if (activeChips.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {activeChips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="rounded-full bg-ocean-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ocean-500 transition hover:bg-ocean-100"
        >
          {chip.label}: {chip.value} ×
        </button>
      ))}
    </div>
  )
}
