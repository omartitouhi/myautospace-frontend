import { useEffect, useMemo, useRef, useState } from 'react'
import { useUI } from '../../lib/ui'
import { vehicleApi, searchApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { VehicleCard } from '../../components/app/VehicleCard'
import { Alert, EmptyState, PageHead, Select, Spinner } from '../../components/app/ui'

const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']
const TRANSMISSIONS = ['Manual', 'Automatic', 'SemiAutomatic']
const BODIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck', 'Motorcycle', 'Other']
const LISTINGS = ['ForSale', 'ForRent']

const EMPTY_FILTERS = { fuel: '', transmission: '', body: '', listing: '', minPrice: '', maxPrice: '' }

export function Browse() {
  const { t } = useUI()
  const a = t.app
  const [vehicles, setVehicles] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  // When a SearchService query succeeded: ordered vehicle ids by relevance.
  const [searchRank, setSearchRank] = useState(null)
  const [searchNote, setSearchNote] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [sugsOpen, setSugsOpen] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('newest')
  const searchRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    vehicleApi
      .listActive()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Debounced autocomplete from SearchService while typing.
  useEffect(() => {
    const prefix = query.trim()
    let cancelled = false
    const id = setTimeout(() => {
      if (prefix.length < 2 || prefix === activeQuery) {
        if (!cancelled) setSuggestions([])
        return
      }
      searchApi
        .autocomplete(prefix)
        .then((data) => {
          if (!cancelled) setSuggestions(data.suggestions ?? [])
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query, activeQuery])

  const runSearch = async (term) => {
    const trimmed = term.trim()
    setSugsOpen(false)
    setSuggestions([])
    setActiveQuery(trimmed)
    setSearchNote(null)
    if (!trimmed) {
      setSearchRank(null)
      return
    }
    try {
      const res = await searchApi.search({ Query: trimmed, Type: 'Vehicle', PageSize: 100 })
      if (res.items.length > 0) {
        setSearchRank(res.items.map((item) => item.externalId))
        setSort('relevance')
      } else {
        // Vehicles aren't indexed into SearchService yet — an empty result is
        // inconclusive, so use local matching instead of showing nothing.
        setSearchRank(null)
      }
    } catch {
      // SearchService down — fall back to local matching.
      setSearchRank(null)
      setSearchNote(a.browse.searchFailed)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setActiveQuery('')
    setSearchRank(null)
    setSearchNote(null)
    if (sort === 'relevance') setSort('newest')
  }

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))

  const visible = useMemo(() => {
    if (!vehicles) return []
    let list = vehicles

    if (activeQuery) {
      if (searchRank) {
        const order = new Map(searchRank.map((id, i) => [id, i]))
        list = list.filter((v) => order.has(v.id))
        if (sort === 'relevance') {
          list = [...list].sort((x, y) => order.get(x.id) - order.get(y.id))
        }
      } else {
        // Local fallback: every token must match somewhere.
        const tokens = activeQuery.toLowerCase().split(/\s+/).filter(Boolean)
        list = list.filter((v) => {
          const hay = `${v.make} ${v.model} ${v.year} ${v.city} ${v.country} ${v.color ?? ''}`.toLowerCase()
          return tokens.every((tok) => hay.includes(tok))
        })
      }
    }

    if (filters.fuel) list = list.filter((v) => v.fuelType === filters.fuel)
    if (filters.transmission) list = list.filter((v) => v.transmission === filters.transmission)
    if (filters.body) list = list.filter((v) => v.bodyType === filters.body)
    if (filters.listing) list = list.filter((v) => v.listingType === filters.listing)
    const min = parseFloat(filters.minPrice)
    const max = parseFloat(filters.maxPrice)
    if (!Number.isNaN(min)) list = list.filter((v) => v.price >= min)
    if (!Number.isNaN(max)) list = list.filter((v) => v.price <= max)

    if (sort === 'newest') {
      list = [...list].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    } else if (sort === 'priceAsc') {
      list = [...list].sort((x, y) => x.price - y.price)
    } else if (sort === 'priceDesc') {
      list = [...list].sort((x, y) => y.price - x.price)
    }
    return list
  }, [vehicles, activeQuery, searchRank, filters, sort])

  const hasActiveFilters =
    activeQuery || Object.values(filters).some((v) => v !== '')

  const sortOptions = [
    ...(searchRank ? [['relevance', a.browse.sorts.relevance]] : []),
    ['newest', a.browse.sorts.newest],
    ['priceAsc', a.browse.sorts.priceAsc],
    ['priceDesc', a.browse.sorts.priceDesc],
  ]

  return (
    <>
      <PageHead title={a.browse.title} sub={a.browse.sub} />

      <div className="browse-bar glass">
        <form
          className="browse-search"
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
        >
          <Icon name="search" />
          <input
            ref={searchRef}
            type="search"
            placeholder={a.browse.searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSugsOpen(true)
            }}
            onFocus={() => setSugsOpen(true)}
            onBlur={() => setSugsOpen(false)}
          />
          {activeQuery ? (
            <button type="button" className="browse-clear" onClick={clearSearch} aria-label={t.app.common.reset}>
              <Icon name="x" />
            </button>
          ) : null}
          {sugsOpen && suggestions.length > 0 ? (
            <ul className="sugs glass">
              {suggestions.map((s) => (
                <li key={s}>
                  {/* mousedown beats the input blur */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setQuery(s)
                      runSearch(s)
                    }}
                  >
                    <Icon name="search" /> {s}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </form>

        <div className="browse-filters">
          <Select value={filters.listing} onChange={setFilter('listing')} aria-label={a.sell.listingType}
            options={[['', a.browse.anyListing], ...LISTINGS.map((v) => [v, a.enums.listing[v]])]} />
          <Select value={filters.fuel} onChange={setFilter('fuel')} aria-label={a.sell.fuel}
            options={[['', a.browse.anyFuel], ...FUELS.map((v) => [v, a.enums.fuel[v]])]} />
          <Select value={filters.transmission} onChange={setFilter('transmission')} aria-label={a.sell.transmission}
            options={[['', a.browse.anyTransmission], ...TRANSMISSIONS.map((v) => [v, a.enums.transmission[v]])]} />
          <Select value={filters.body} onChange={setFilter('body')} aria-label={a.sell.body}
            options={[['', a.browse.anyBody], ...BODIES.map((v) => [v, a.enums.body[v]])]} />
          <input
            className="input input-num"
            type="number"
            min="0"
            placeholder={a.browse.minPrice}
            value={filters.minPrice}
            onChange={setFilter('minPrice')}
          />
          <input
            className="input input-num"
            type="number"
            min="0"
            placeholder={a.browse.maxPrice}
            value={filters.maxPrice}
            onChange={setFilter('maxPrice')}
          />
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={a.browse.sort} options={sortOptions} />
        </div>
      </div>

      {searchNote ? <Alert tone="info">{searchNote}</Alert> : null}
      {loadError ? (
        <Alert>
          {a.browse.loadFailed} {loadError}
        </Alert>
      ) : null}

      {!vehicles && !loadError ? (
        <Spinner label={a.common.loading} />
      ) : vehicles ? (
        <>
          <p className="browse-count">{a.browse.results(visible.length)}</p>
          {visible.length === 0 ? (
            <EmptyState title={a.browse.empty} hint={a.browse.emptyHint}>
              {hasActiveFilters ? (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    clearSearch()
                    setFilters(EMPTY_FILTERS)
                  }}
                >
                  {a.common.reset}
                </button>
              ) : null}
            </EmptyState>
          ) : (
            <div className="cards-grid">
              {visible.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </>
  )
}
