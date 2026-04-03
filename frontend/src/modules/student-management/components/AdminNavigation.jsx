export default function AdminNavigation({ items, currentView, onChange }) {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => {
        const isActive = item.id === currentView

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'bg-ink-900 text-white'
                : 'bg-white/80 text-ink-700 hover:bg-ocean-50 hover:text-ocean-500'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
