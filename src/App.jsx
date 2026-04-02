import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_CITY = {
  name: 'Bengaluru',
  admin1: 'Karnataka',
  country: 'India',
  latitude: 12.9762,
  longitude: 77.6033,
}

const WEATHER_LABELS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Severe thunderstorm with hail',
}

function normalizeCity(city) {
  return {
    name: city.name,
    admin1: city.admin1 ?? city.admin2 ?? '',
    country: city.country ?? '',
    latitude: city.latitude,
    longitude: city.longitude,
  }
}

function cityText(city) {
  return [city.name, city.admin1, city.country].filter(Boolean).join(', ')
}

function labelForWeatherCode(code) {
  return WEATHER_LABELS[code] ?? 'Unknown conditions'
}

function readableDay(dateText) {
  return new Date(dateText).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function readableDateTime(dateText, timezone) {
  const value = new Date(dateText)
  return value.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
}

function readableClock(dateText, timezone) {
  const value = new Date(dateText)
  return value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  })
}

function roundMetric(value) {
  return Number.isFinite(value) ? Math.round(value) : '--'
}

async function searchCities(name, count = 6) {
  const endpoint = new URL('https://geocoding-api.open-meteo.com/v1/search')
  endpoint.searchParams.set('name', name)
  endpoint.searchParams.set('count', String(count))
  endpoint.searchParams.set('language', 'en')
  endpoint.searchParams.set('format', 'json')

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error('Could not search cities')
  }

  const payload = await response.json()
  const results = payload.results ?? []
  return results
    .filter((city) => Number.isFinite(city.latitude) && Number.isFinite(city.longitude))
    .map(normalizeCity)
}

async function loadWeather(city) {
  const endpoint = new URL('https://api.open-meteo.com/v1/forecast')
  endpoint.searchParams.set('latitude', city.latitude)
  endpoint.searchParams.set('longitude', city.longitude)
  endpoint.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
  )
  endpoint.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
  )
  endpoint.searchParams.set('timezone', 'auto')
  endpoint.searchParams.set('forecast_days', '6')

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error('Could not load weather')
  }

  const payload = await response.json()
  if (!payload.current || !payload.daily) {
    throw new Error('Weather payload was missing data')
  }

  return payload
}

function MetricCard({ label, value }) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3">
      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function App() {
  const [query, setQuery] = useState(DEFAULT_CITY.name)
  const [citySuggestions, setCitySuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [notification, setNotification] = useState('')
  const [activeCity, setActiveCity] = useState(DEFAULT_CITY)
  const [weatherData, setWeatherData] = useState(null)

  const notify = useCallback((message) => {
    setNotification(message)
  }, [])

  useEffect(() => {
    if (!notification) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      setNotification('')
    }, 3400)

    return () => clearTimeout(timeoutId)
  }, [notification])

  const hydrateWeather = useCallback(
    async (city) => {
      setIsLoadingWeather(true)

      try {
        const payload = await loadWeather(city)
        const forecast = payload.daily.time.slice(0, 5).map((dateText, index) => ({
          day: readableDay(dateText),
          high: payload.daily.temperature_2m_max[index],
          low: payload.daily.temperature_2m_min[index],
          code: payload.daily.weather_code[index],
        }))

        setWeatherData({
          timezone: payload.timezone,
          timezoneAbbreviation: payload.timezone_abbreviation,
          current: payload.current,
          currentUnits: payload.current_units,
          daily: payload.daily,
          dailyUnits: payload.daily_units,
          forecast,
        })
        setActiveCity(city)
      } catch {
        notify('Weather data is unavailable right now. Please try again shortly.')
      } finally {
        setIsLoadingWeather(false)
      }
    },
    [notify],
  )

  useEffect(() => {
    hydrateWeather(DEFAULT_CITY)
  }, [hydrateWeather])

  useEffect(() => {
    const text = query.trim()
    if (text.length < 2) {
      setCitySuggestions([])
      setIsSearching(false)
      return undefined
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCities(text, 6)
        setCitySuggestions(results)
      } catch {
        setCitySuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleCityPick = useCallback(
    (city) => {
      setQuery(city.name)
      setCitySuggestions([])
      hydrateWeather(city)
    },
    [hydrateWeather],
  )

  const handleSearchSubmit = useCallback(
    async (event) => {
      event.preventDefault()
      const text = query.trim()

      if (text.length < 2) {
        notify('Type at least 2 letters to search for a city.')
        return
      }

      if (citySuggestions.length > 0) {
        handleCityPick(citySuggestions[0])
        return
      }

      try {
        setIsSearching(true)
        const [firstResult] = await searchCities(text, 1)

        if (!firstResult) {
          notify('No matching city was found. Try another spelling.')
          return
        }

        handleCityPick(firstResult)
      } catch {
        notify('City search failed. Please retry in a few seconds.')
      } finally {
        setIsSearching(false)
      }
    },
    [citySuggestions, handleCityPick, notify, query],
  )

  const weatherLabel = useMemo(() => {
    if (!weatherData) {
      return 'Loading current conditions'
    }
    return labelForWeatherCode(weatherData.current.weather_code)
  }, [weatherData])

  return (
    <div className="relative min-h-screen overflow-x-clip px-4 py-6 sm:px-8 sm:py-10">
      <div className="sky-orb pointer-events-none absolute -left-24 top-14 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(250,204,21,.58),rgba(250,204,21,0))] blur-2xl" />
      <div className="sky-orb delay-2 pointer-events-none absolute -right-20 top-28 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,.5),rgba(34,211,238,0))] blur-2xl" />

      {notification && (
        <aside className="animate-rise fixed right-4 top-4 z-50 w-[min(24rem,92vw)] rounded-2xl border border-red-300/70 bg-white/94 px-4 py-3 text-sm font-medium text-red-700 shadow-xl backdrop-blur">
          {notification}
        </aside>
      )}

      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-panel animate-rise rounded-[2rem] p-5 sm:p-8">
          <header>
            <p className="text-[0.68rem] uppercase tracking-[0.27em] text-slate-700/80">
              Live atmosphere map
            </p>
            <h1 className="font-display mt-2 text-5xl leading-[0.9] text-slate-900 sm:text-7xl">
              Weather
              <br />
              Atelier
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-700 sm:text-base">
              Track current weather and a short outlook for cities worldwide. Search below,
              pick a city, and your weather board updates instantly.
            </p>
          </header>

          <form onSubmit={handleSearchSubmit} className="relative mt-6">
            <div className="flex items-center gap-2 rounded-2xl bg-white/85 p-2 ring-1 ring-slate-300/50">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by city name"
                className="w-full rounded-xl border border-transparent bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
                aria-label="Search city"
                autoComplete="off"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                disabled={isLoadingWeather}
              >
                {isLoadingWeather ? 'Loading...' : 'Find'}
              </button>
            </div>

            {isSearching && (
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Searching cities...
              </p>
            )}

            {citySuggestions.length > 0 && (
              <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
                {citySuggestions.map((city) => {
                  const suggestionKey = `${city.name}-${city.latitude}-${city.longitude}`
                  return (
                    <li key={suggestionKey}>
                      <button
                        type="button"
                        onClick={() => handleCityPick(city)}
                        className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-sky-50"
                      >
                        <span className="block font-semibold text-slate-800">{city.name}</span>
                        <span className="text-xs text-slate-500">{cityText(city)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </form>

          <div className="mt-7 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#155e75_48%,#22d3ee_100%)] p-5 text-white shadow-xl sm:p-6">
              <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/75">
                Current weather
              </p>
              <p className="mt-3 text-sm text-white/80">{cityText(activeCity)}</p>
              <p className="font-display mt-4 text-7xl leading-none sm:text-8xl">
                {weatherData
                  ? `${roundMetric(weatherData.current.temperature_2m)}${weatherData.currentUnits.temperature_2m}`
                  : '--'}
              </p>
              <p className="mt-3 text-xl font-semibold">{weatherLabel}</p>
              <p className="mt-1 text-sm text-white/80">
                Feels like{' '}
                {weatherData
                  ? `${roundMetric(weatherData.current.apparent_temperature)}${weatherData.currentUnits.apparent_temperature}`
                  : '--'}
              </p>
              <p className="mt-7 text-xs uppercase tracking-[0.17em] text-white/60">
                {weatherData
                  ? `Updated ${readableDateTime(weatherData.current.time, weatherData.timezone)}`
                  : 'Pulling latest update'}
              </p>
            </article>

            <div className="grid gap-3">
              <MetricCard
                label="Humidity"
                value={
                  weatherData
                    ? `${roundMetric(weatherData.current.relative_humidity_2m)}${weatherData.currentUnits.relative_humidity_2m}`
                    : '--'
                }
              />
              <MetricCard
                label="Wind"
                value={
                  weatherData
                    ? `${roundMetric(weatherData.current.wind_speed_10m)} ${weatherData.currentUnits.wind_speed_10m}`
                    : '--'
                }
              />
              <MetricCard
                label="Sunrise"
                value={
                  weatherData
                    ? readableClock(weatherData.daily.sunrise[0], weatherData.timezone)
                    : '--'
                }
              />
              <MetricCard
                label="Sunset"
                value={
                  weatherData
                    ? readableClock(weatherData.daily.sunset[0], weatherData.timezone)
                    : '--'
                }
              />
            </div>
          </div>
        </section>

        <section className="glass-panel animate-rise delay-1 rounded-[2rem] p-5 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-600">Outlook</p>
              <h2 className="font-display mt-1 text-3xl text-slate-900 sm:text-4xl">5-Day Forecast</h2>
            </div>
            <p className="rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
              {weatherData ? weatherData.timezoneAbbreviation : '---'}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {weatherData?.forecast.map((day) => (
              <article
                key={day.day}
                className="group rounded-2xl border border-white/60 bg-white/70 px-4 py-3 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{day.day}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                      {labelForWeatherCode(day.code)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-slate-900">
                      {roundMetric(day.high)}{weatherData.dailyUnits.temperature_2m_max}
                    </p>
                    <p className="text-sm text-slate-600">
                      {roundMetric(day.low)}{weatherData.dailyUnits.temperature_2m_min}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-4 text-sm text-slate-100">
            <p className="text-[0.64rem] uppercase tracking-[0.2em] text-slate-300">Data source</p>
            <p className="mt-2 leading-relaxed text-slate-200">
              Powered by Open-Meteo APIs for free city geocoding and forecast data. Updates are
              fetched live each time you choose a location.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
