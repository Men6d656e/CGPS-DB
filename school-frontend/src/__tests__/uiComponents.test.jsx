import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../components/ui/dialog'
import { StatusBadge } from '../components/UI'

describe('shadcn Badge (SPEC3)', () => {
  it('renders children with the outline variant class', () => {
    const { container } = render(<Badge variant="outline">active</Badge>)
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(container.querySelector('div').className).toContain('border')
  })

  it('StatusBadge maps statuses to semantic styles', () => {
    const { container } = render(<StatusBadge status="overdue" />)
    expect(screen.getByText('overdue')).toBeInTheDocument()
    // overdue → destructive-ish red styling
    expect(container.querySelector('div').className).toContain('bg-red-500/15')
  })
})

describe('shadcn Dialog (SPEC3)', () => {
  it('opens on trigger click and closes on the close button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>
    )

    fireEvent.click(screen.getByRole('button', { name: /open dialog/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog body')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
