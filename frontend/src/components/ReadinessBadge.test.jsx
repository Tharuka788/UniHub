import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReadinessBadge from './ReadinessBadge'

describe('ReadinessBadge', () => {
  it('renders the readiness label, score, and helper text', () => {
    render(
      <ReadinessBadge
        readiness={{
          label: 'Almost Ready',
          score: 60,
        }}
      />,
    )

    expect(screen.getByText('Almost Ready')).toBeInTheDocument()
    expect(screen.getByText('60/100')).toBeInTheDocument()
    expect(
      screen.getByText('A few operational details still need attention.'),
    ).toBeInTheDocument()
  })
})
