export default function AppShell({ navigation, children }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {navigation ? (
          <section className="rounded-[2rem] border border-white/60 bg-white/70 p-5 shadow-panel backdrop-blur">
            {navigation}
          </section>
        ) : null}
        {children}
      </div>
    </main>
  )
}
