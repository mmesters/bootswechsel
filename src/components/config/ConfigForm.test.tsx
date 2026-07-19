import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useScheduleStore } from '../../state/useScheduleStore'
import { ConfigForm } from './ConfigForm'

beforeEach(() => {
  window.localStorage.clear()
  useScheduleStore.getState().reset()
})

// Rendered under StrictMode deliberately: it double-invokes effects on mount in development,
// which is exactly what defeated an earlier "skip the first effect run" fix for this bug.
function renderConfigForm() {
  return render(
    <StrictMode>
      <ConfigForm />
    </StrictMode>,
  )
}

describe('ConfigForm', () => {
  it('generates an initial plan on first mount using the defaults', async () => {
    renderConfigForm()
    await waitFor(() => expect(useScheduleStore.getState().result).not.toBeNull())
    expect(useScheduleStore.getState().result?.boatLabels).toHaveLength(8)
  })

  it('restores the last configuration after unmount/remount instead of resetting to defaults', async () => {
    const user = userEvent.setup()
    const { unmount } = renderConfigForm()
    await waitFor(() => expect(useScheduleStore.getState().result).not.toBeNull())

    const teamCountInput = screen.getByLabelText(/Anzahl Boote\/Teams/)
    await user.clear(teamCountInput)
    await user.type(teamCountInput, '12')

    await waitFor(() => expect(useScheduleStore.getState().result?.boatLabels).toHaveLength(12))
    const resultAfterEdit = useScheduleStore.getState().result

    unmount()
    renderConfigForm()

    // The regression this guards against: remounting used to reset the form to hardcoded
    // defaults and silently regenerate a fresh (8-boat) plan, discarding the user's setup —
    // and a naive "skip the first effect run" fix was itself defeated by StrictMode's
    // double-invoke, which is why this is rendered under StrictMode above.
    expect(screen.getByLabelText(/Anzahl Boote\/Teams/)).toHaveValue(12)
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(useScheduleStore.getState().result).toEqual(resultAfterEdit)
  })

  it('does not lose the regatta name after unmount/remount', async () => {
    const user = userEvent.setup()
    const { unmount } = renderConfigForm()
    await waitFor(() => expect(useScheduleStore.getState().result).not.toBeNull())

    await user.type(screen.getByLabelText(/Name der Regatta/), 'Vereinsregatta 2026')
    await waitFor(() => expect(useScheduleStore.getState().regattaName).toBe('Vereinsregatta 2026'))

    unmount()
    renderConfigForm()

    expect(screen.getByLabelText(/Name der Regatta/)).toHaveValue('Vereinsregatta 2026')
  })

  it('regenerates when a value is edited back to the originally restored value after an intermediate edit', async () => {
    const user = userEvent.setup()
    const { unmount } = renderConfigForm()
    await waitFor(() => expect(useScheduleStore.getState().result).not.toBeNull())

    const teamCountInput = screen.getByLabelText(/Anzahl Boote\/Teams/)
    await user.clear(teamCountInput)
    await user.type(teamCountInput, '12')
    await waitFor(() => expect(useScheduleStore.getState().result?.boatLabels).toHaveLength(12))

    // Edit back to the value the form was restored with (8) — must still regenerate for 8,
    // not silently keep showing the intermediate 12-boat plan.
    await user.clear(teamCountInput)
    await user.type(teamCountInput, '8')
    await waitFor(() => expect(useScheduleStore.getState().result?.boatLabels).toHaveLength(8))

    unmount()
  })
})
