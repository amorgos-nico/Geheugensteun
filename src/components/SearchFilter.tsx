import type { FilterValue } from '../types'

interface Props {
  search: string
  onSearchChange: (s: string) => void
  filter: FilterValue
  onFilterChange: (f: FilterValue) => void
}

export function SearchFilter({ search, onSearchChange, filter, onFilterChange }: Props) {
  const base =
    'px-3.5 py-3 text-base rounded-[10px] border border-[#e0ddd0] bg-white text-neutral-900 outline-none focus:border-neutral-500 dark:bg-night-sunk dark:text-neutral-100 dark:border-night-border'

  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        className={`${base} flex-1 min-w-0`}
        placeholder="Search..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        autoComplete="off"
      />
      <select
        className={`${base} flex-none w-[120px]`}
        value={filter}
        onChange={(e) => onFilterChange(e.target.value as FilterValue)}
      >
        <option value="all">All</option>
        <option value="de">de only</option>
        <option value="het">het only</option>
      </select>
    </div>
  )
}
