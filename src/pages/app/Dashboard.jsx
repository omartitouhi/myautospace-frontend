import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import {
  vehicleApi,
  bookingApi,
  paymentApi,
  providerApi,
  reviewApi,
  messageApi,
  adminApi,
} from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatPrice } from '../../lib/format'
import { Spinner } from '../../components/app/ui'
import { VehicleCard } from '../../components/app/VehicleCard'

/* Role-aware home page. A user with multiple roles sees stacked sections.
   Every data call is best-effort — a failed fetch just hides its card. */
export function Dashboard() {
  const { t } = useUI()
  const { profile, session, isBuyer, isSeller, isServiceProvider, isAdmin } = useAuth()
  const d = t.app.dashboard
  const name = profile?.firstName || session?.email?.split('@')[0] || ''

  // Default everyone to the buyer view; specialised sections stack on top.
  const showBuyer = isBuyer || (!isSeller && !isServiceProvider && !isAdmin)

  const roleLabels = [
    showBuyer ? d.roles.Buyer : null,
    isSeller ? d.roles.Seller : null,
    isServiceProvider ? d.roles.ServiceProvider : null,
    isAdmin ? d.roles.Admin : null,
  ].filter(Boolean)

  return (
    <>
      <section className="mas-hero">
        <span className="eyebrow">
          <span className="dot" /> {roleLabels.join(' · ')}
        </span>
        <h1>{name ? d.greeting(name) : d.greetingPlain}</h1>
        <p>{d.sub}</p>
      </section>

      {showBuyer ? <BuyerSection /> : null}
      {isSeller ? <SellerSection /> : null}
      {isServiceProvider ? <ProviderSection /> : null}
      {isAdmin ? <AdminSection /> : null}
    </>
  )
}

/* ---- shared bits --------------------------------------------------- */
function StatCard({ icon, value, label, accent = false }) {
  return (
    <div className="mas-stat">
      <div className="mas-stat-ico">
        <Icon name={icon} />
      </div>
      <b className={accent ? 'accent-text' : undefined}>{value}</b>
      <span>{label}</span>
    </div>
  )
}

function SectionHead({ icon, lead, action }) {
  return (
    <div className="dash-section-head">
      <span className="badge">
        <Icon name={icon} /> {lead}
      </span>
      {action ?? null}
    </div>
  )
}

const BOOKING_ICONS = { Rental: 'card', TestDrive: 'car' }

/* ---- buyer --------------------------------------------------------- */
function BuyerSection() {
  const { t } = useUI()
  const d = t.app.dashboard
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      bookingApi.listMine(),
      messageApi.conversations(),
      vehicleApi.listActive(),
    ]).then(([bk, cv, vs]) => {
      if (cancelled) return
      setData({
        bookings: bk.status === 'fulfilled' ? bk.value : [],
        conversations: cv.status === 'fulfilled' ? cv.value : [],
        vehicles: vs.status === 'fulfilled' ? vs.value : [],
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return <Spinner />

  const activeBookings = data.bookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Confirmed',
  ).length
  const unread = data.conversations.reduce((n, c) => n + (c.unreadCount ?? 0), 0)
  const recommended = data.vehicles.slice(0, 4)
  const recent = [...data.bookings]
    .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    .slice(0, 4)

  return (
    <section>
      <SectionHead icon="search" lead={d.buyerLead} />

      <div className="mas-stats">
        <StatCard icon="cal" value={activeBookings} label={d.activeBookings} accent />
        <StatCard icon="chat" value={unread} label={d.unreadMessages} />
        <StatCard icon="heart" value="—" label={d.savedSearches} />
      </div>

      <div className="dash-quick">
        <Link to="/app/browse" className="btn btn-primary btn-sm">
          <Icon name="search" /> {d.browseCars}
        </Link>
        <Link to="/app/bookings" className="btn btn-ghost btn-sm">
          <Icon name="cal" /> {t.app.nav.bookings}
        </Link>
        <Link to="/app/messages" className="btn btn-ghost btn-sm">
          <Icon name="chat" /> {t.app.nav.messages}
        </Link>
      </div>

      <div className="dash-grid" style={{ marginTop: 22 }}>
        <div className="dash-col">
          <div className="panel glass">
            <div className="panel-head">
              <h2 className="panel-sub">{d.recommended}</h2>
              <Link to="/app/browse" className="btn btn-ghost btn-sm">
                {d.seeAll}
              </Link>
            </div>
            {recommended.length > 0 ? (
              <div className="cards-grid">
                {recommended.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            ) : (
              <p className="profile-meta">{d.noRecommended}</p>
            )}
          </div>
        </div>

        <div className="dash-col">
          <div className="panel glass">
            <h2 className="panel-sub">{d.recentBookings}</h2>
            {recent.length > 0 ? (
              <ul className="dash-mini">
                {recent.map((b) => (
                  <li key={b.id}>
                    <span className="dash-mini-ico">
                      <Icon name={BOOKING_ICONS[b.serviceType] ?? 'cal'} />
                    </span>
                    <div className="dash-mini-main">
                      <b>{b.vehicleTitle}</b>
                      <span>{t.app.bookings.statuses[b.status] ?? b.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-meta">{d.noBookings}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- seller -------------------------------------------------------- */
function SellerSection() {
  const { t, lang } = useUI()
  const d = t.app.dashboard
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      vehicleApi.listMine(),
      bookingApi.listIncoming(),
      paymentApi.wallet(),
    ]).then(([vs, bk, wl]) => {
      if (cancelled) return
      setData({
        vehicles: vs.status === 'fulfilled' ? vs.value : [],
        incoming: bk.status === 'fulfilled' ? bk.value : [],
        wallet: wl.status === 'fulfilled' ? wl.value : null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return <Spinner />

  const active = data.vehicles.filter((v) => v.status === 'Active').length
  const drafts = data.vehicles.filter((v) => v.status === 'Draft').length
  const sold = data.vehicles.filter((v) => v.status === 'Sold' || v.status === 'Rented').length
  const pending = data.incoming.filter((b) => b.status === 'Pending').length

  return (
    <section>
      <SectionHead icon="tag" lead={d.sellerLead} />

      <div className="mas-stats">
        <StatCard icon="car" value={active} label={d.activeListings} accent />
        <StatCard icon="doc" value={drafts} label={d.drafts} />
        <StatCard icon="check" value={sold} label={d.sold} />
        <StatCard icon="cal" value={pending} label={d.pendingRequests} />
        {data.wallet ? (
          <StatCard icon="card" value={formatPrice(data.wallet.balance, lang)} label={d.walletBalance} />
        ) : null}
      </div>

      <div className="dash-quick">
        <Link to="/app/sell" className="btn btn-primary btn-sm">
          <Icon name="plus" /> {d.newListing}
        </Link>
        <Link to="/app/garage" className="btn btn-ghost btn-sm">
          <Icon name="car" /> {d.myGarage}
        </Link>
        <Link to="/app/bookings" className="btn btn-ghost btn-sm">
          <Icon name="cal" /> {d.incomingRequests}
        </Link>
      </div>
    </section>
  )
}

/* ---- service provider ---------------------------------------------- */
function ProviderSection() {
  const { t } = useUI()
  const d = t.app.dashboard
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    providerApi
      .getMine()
      .then(async (profile) => {
        const summary = await reviewApi
          .summary('Provider', profile.id)
          .catch(() => null)
        const incoming = await bookingApi.listIncoming().catch(() => [])
        if (!cancelled) setData({ profile, summary, incoming })
      })
      .catch(() => {
        if (!cancelled) setData({ profile: null })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return <Spinner />

  if (!data.profile) {
    return (
      <section>
        <SectionHead icon="wrench" lead={d.providerLead} />
        <div className="panel glass">
          <p className="profile-meta">{d.noProviderProfile}</p>
          <Link to="/app/provider" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            <Icon name="plus" /> {d.createProfile}
          </Link>
        </div>
      </section>
    )
  }

  const { profile, summary } = data
  const rating = summary && summary.count > 0 ? summary.averageRating.toFixed(1) : '—'

  return (
    <section>
      <SectionHead icon="wrench" lead={d.providerLead} />

      <div className="mas-stats">
        <StatCard icon="wrench" value={profile.services?.length ?? 0} label={d.servicesOffered} />
        <StatCard icon="star" value={rating} label={d.rating} accent />
        <StatCard icon="check" value={profile.completedJobs ?? 0} label={t.app.providers.stats.jobs} />
        <StatCard
          icon="shield"
          value={t.app.enums.pstatus[profile.status] ?? profile.status}
          label={d.statusLabel}
        />
      </div>

      <div className="dash-quick">
        <Link to="/app/provider" className="btn btn-primary btn-sm">
          <Icon name="cog" /> {d.manageServices}
        </Link>
        <Link to={`/app/providers/${profile.id}`} className="btn btn-ghost btn-sm">
          <Icon name="eye" /> {d.viewPublicProfile}
        </Link>
      </div>
    </section>
  )
}

/* ---- admin --------------------------------------------------------- */
function AdminSection() {
  const { t, lang } = useUI()
  const d = t.app.dashboard
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      adminApi.payments.stats(),
      adminApi.moderation.list(),
      adminApi.users.list(),
    ]).then(([st, mo, us]) => {
      if (cancelled) return
      setData({
        stats: st.status === 'fulfilled' ? st.value : null,
        cases: mo.status === 'fulfilled' ? mo.value : [],
        users: us.status === 'fulfilled' ? us.value : [],
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return <Spinner />

  const openCases = data.cases.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected' && c.status !== 'Approved',
  ).length

  return (
    <section>
      <SectionHead icon="cog" lead={d.adminLead} />

      <div className="mas-kpi">
        <StatCard icon="user" value={data.users.length} label={d.totalUsers} />
        <StatCard icon="shield" value={openCases} label={d.openCases} accent />
        {data.stats ? (
          <>
            <StatCard icon="card" value={formatPrice(data.stats.totalAmount, lang)} label={d.revenue} />
            <StatCard icon="doc" value={data.stats.totalPayments} label={t.app.nav.contracts} />
          </>
        ) : null}
      </div>

      <div className="dash-quick">
        <Link to="/app/admin" className="btn btn-primary btn-sm">
          <Icon name="cog" /> {t.app.nav.admin}
        </Link>
      </div>
    </section>
  )
}
