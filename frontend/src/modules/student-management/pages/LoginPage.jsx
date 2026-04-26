import { useState } from 'react'
import Button from '../components/Button'

export default function LoginPage({ onSubmit, isSubmitting, errorMessage }) {
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      username: formValues.username.trim(),
      password: formValues.password,
    })
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <section className="flex h-full flex-col rounded-[2.5rem] border border-white/65 bg-white/55 p-8 shadow-panel backdrop-blur sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-ocean-500">
            Admin Access
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Sign in to manage confirmed students, sessions, and class-link dispatch.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-700">
            Enter your admin credentials to continue to the Kuppi management workspace.
          </p>
        </section>

        <section className="flex h-full flex-col rounded-[2.25rem] border border-white/70 bg-white/80 p-7 shadow-panel backdrop-blur sm:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean-500">
              Admin Login
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink-900">Welcome back</h2>
            <p className="text-sm leading-6 text-ink-700">
              Enter the backend-managed admin credentials to continue.
            </p>
          </div>

          <form className="mt-8 flex flex-1 flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-ink-900">
              Username
              <input
                name="username"
                type="text"
                autoComplete="username"
                value={formValues.username}
                onChange={handleChange}
                className="rounded-[1.2rem] border border-ocean-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
                placeholder="admin"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-ink-900">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={formValues.password}
                onChange={handleChange}
                className="rounded-[1.2rem] border border-ocean-100 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
                placeholder="Enter your password"
                required
              />
            </label>

            {errorMessage ? (
              <div className="rounded-[1.2rem] border border-coral-100 bg-coral-100 px-4 py-3 text-sm leading-6 text-coral-600">
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-auto w-full justify-center"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
