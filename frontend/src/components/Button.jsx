export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}) {
  const variants = {
    primary: 'bg-ink-900 text-white hover:bg-ocean-500',
    subtle: 'bg-white text-ink-900 hover:bg-ocean-50',
    ghost: 'bg-transparent text-ink-700 hover:bg-white/70',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant] || variants.primary
      } ${className}`}
    >
      {children}
    </button>
  )
}
