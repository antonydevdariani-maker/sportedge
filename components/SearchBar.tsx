'use client'

import { useState, FormEvent } from 'react'

interface Props {
  onSearch: (query: string) => void
  onClear: () => void
  loading: boolean
}

export default function SearchBar({ onSearch, onClear, loading }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  function handleClear() {
    setValue('')
    onClear()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Filter markets…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {loading ? '…' : 'Search'}
      </button>
    </form>
  )
}
