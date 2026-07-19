import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Not using vitest's `globals: true`, so React Testing Library's auto-cleanup (which relies on
// detecting a global afterEach) doesn't kick in on its own — register it explicitly instead.
afterEach(() => {
  cleanup()
})

// Node 22+'s built-in `localStorage` shadows jsdom's and throws without a
// `--localstorage-file` flag. Replace it with a plain in-memory Storage for tests.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true })
Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true })
