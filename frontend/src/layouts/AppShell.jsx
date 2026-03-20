export default function AppShell({ children }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">{children}</div>
    </main>
  )
}
