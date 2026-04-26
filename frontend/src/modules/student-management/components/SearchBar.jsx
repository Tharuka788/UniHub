export default function SearchBar({
  label = 'Search',
  placeholder = 'Search',
  value,
  onChange,
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-ink-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-ocean-500 focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  )
}
