'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  LogOut,
  Mail,
  Menu,
  Phone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { site } from '../data/site'
import { businessSlug, getSiteUrl, isSupabaseConfigured, supabase } from '../lib/supabase'

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const statusLabels = Object.fromEntries(statusOptions.map((status) => [status.value, status.label]))

const emptyQuote = {
  name: '',
  email: '',
  phone: '',
  service: site.packages[0]?.name ?? 'Full Detail',
  message: '',
}

const serviceExamples = [
  {
    title: 'Exterior Detail',
    subtitle: 'Foam Wash',
    image: '/detail-example-1.jpg',
  },
  {
    title: 'Clay & Wax Service',
    subtitle: 'Gloss Protection',
    video: '/videos/clay-and-wax-service.mp4',
  },
  {
    title: 'Full Detail',
    subtitle: 'Clean Reset',
    image: '/detail-example-3.jpg',
  },
  {
    title: 'Interior Detail',
    subtitle: 'Deep Clean',
    video: '/videos/interior-detail.mp4',
  },
]

function normalizeSubmission(submission) {
  return {
    id: submission.id,
    customerName: submission.customerName ?? '',
    email: submission.email ?? '',
    phone: submission.phone ?? '',
    service: submission.service ?? '',
    message: submission.message ?? '',
    sourcePage: submission.sourcePage ?? '',
    status: submission.status ?? 'new',
    internalNotes: submission.internalNotes ?? '',
    scheduledAt: submission.scheduledAt ?? null,
    appointmentLocation: submission.appointmentLocation ?? '',
    contactedAt: submission.contactedAt ?? null,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  }
}

function formatDateTime(value) {
  if (!value) return 'Not scheduled'

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function toDateTimeLocalValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function fromDateTimeLocalValue(value) {
  return value ? new Date(value).toISOString() : null
}

async function loadBusinessMembership(userId) {
  if (!supabase) return { business: null, membership: null, error: new Error('Supabase is not configured.') }

  const { data, error } = await supabase
    .from('BusinessUser')
    .select('id, businessId, authUserId, role, createdAt, Business (*)')
    .eq('authUserId', userId)
    .maybeSingle()

  if (error) {
    return { business: null, membership: null, error }
  }

  return {
    business: data?.Business ?? null,
    membership: data ?? null,
    error: null,
  }
}

export function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="site-shell">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <ProofSection />
      <Services />
      <QuoteSection />
      <FAQ />
      <Footer />
      <MobileDock />
    </main>
  )
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="brand-lockup" aria-label={`${site.business.name} home`}>
          <span className="brand-mark">
            <Image src="/ez-logo-transparent.png" alt="" aria-hidden="true" width={44} height={44} />
          </span>
          <span>
            <strong>{site.business.name}</strong>
            <small>{site.business.tagline}</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#proof">Proof</a>
          <a href="#packages">Packages</a>
          <a href="#quote">Request</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <a className="nav-phone" href={site.business.phoneHref}>
            <Phone size={16} aria-hidden="true" />
            {site.business.phone}
          </a>
          <a className="nav-cta" href="#quote">
            Book Now
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <button
          type="button"
          className="icon-button mobile-menu-button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen ? (
          <div className="mobile-menu">
            <a href="#proof" onClick={() => setMenuOpen(false)}>
              Proof
            </a>
            <a href="#packages" onClick={() => setMenuOpen(false)}>
              Packages
            </a>
            <a href="#quote" onClick={() => setMenuOpen(false)}>
              Request
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
            <a href={site.business.phoneHref} onClick={() => setMenuOpen(false)}>
              {site.business.phone}
            </a>
            <a href="#quote" onClick={() => setMenuOpen(false)}>
              Book Now
            </a>
          </div>
        ) : null}
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero-section" id="top">
      {site.hero.image ? (
        <Image
          src={site.hero.image}
          alt={site.hero.imageAlt}
          fill
          priority
          className="hero-background"
          sizes="100vw"
        />
      ) : null}
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-text-block">
        {site.business.wordmark ? (
          <div className="hero-logo-card">
            <Image
              src={site.business.wordmark}
              alt={site.business.name}
              width={1080}
              height={1080}
              priority
              className="hero-logo-img"
            />
          </div>
        ) : (
          <h1 className="hero-name-fallback">{site.business.name}</h1>
        )}
      </div>
    </section>
  )
}

function ProofSection() {
  return (
    <section className="proof-section" id="proof">
      <div className="service-example-grid" aria-label="Service examples">
        {serviceExamples.map((item) => (
          <article
            className="service-example"
            key={item.title}
            style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
          >
            {item.video ? (
              <video className="service-example-media" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
                <source src={item.video} type="video/mp4" />
              </video>
            ) : null}
            <div className="service-example-copy">
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="section-block" id="packages">
      <div className="section-heading">
        <span className="eyebrow">Packages</span>
        <h2>Detailing packages for the way your vehicle is used.</h2>
        <p>
          Choose the package that fits the condition of the vehicle, then send the details so we can confirm the right
          service, timing, and next opening.
        </p>
      </div>
      <div className="package-grid">
        {site.packages.map((item, index) => (
          <article className="package-card" key={item.name}>
            <div className="package-card-header">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <Car size={22} aria-hidden="true" />
            </div>
            <h3>{item.name}</h3>
            <div className="package-block">
              <small>Best for</small>
              <p>{item.bestFor}</p>
            </div>
            <div className="package-block">
              <small>Includes</small>
              <ul>
                {item.includes.map((include) => (
                  <li key={include}>
                    <Check size={16} aria-hidden="true" />
                    {include}
                  </li>
                ))}
              </ul>
            </div>
            <div className="package-footer">
              <span>
                <Clock3 size={16} aria-hidden="true" />
                {item.time}
              </span>
              <a href="#quote">
                Request service
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuoteSection() {
  return (
    <section className="quote-section" id="quote">
      <div className="quote-section-inner">
        <div className="quote-copy">
          <span className="eyebrow">Request</span>
          <h2>Send the details and get a clear follow-up.</h2>
          <p>
            Share the vehicle, location, timing, and what needs attention. The detailer will review it and follow up
            with the right next step.
          </p>
          <div className="contact-strip">
            <a href={site.business.phoneHref}>
              <Phone size={18} aria-hidden="true" />
              {site.business.phone}
            </a>
            <a href={site.business.emailHref}>
              <Mail size={18} aria-hidden="true" />
              {site.business.email}
            </a>
          </div>
        </div>
        <QuoteForm />
      </div>
    </section>
  )
}

function QuoteForm() {
  const [form, setForm] = useState(emptyQuote)
  const [state, setState] = useState({ status: 'idle', message: '' })

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setState({ status: 'loading', message: '' })

    if (!isSupabaseConfigured || !businessSlug) {
      setState({
        status: 'error',
        message: 'Supabase is not configured yet. Add the NEXT_PUBLIC environment variables for this client.',
      })
      return
    }

    const { error } = await supabase.rpc('create_customer_submission_for_business_slug', {
      p_slug: businessSlug,
      p_customer_name: form.name.trim(),
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_service: form.service,
      p_message: form.message.trim(),
      p_source_page: getSiteUrl(),
    })

    if (error) {
      setState({ status: 'error', message: error.message })
      return
    }

    setForm(emptyQuote)
    setState({ status: 'success', message: 'Request sent. The detailer can now see it in the portal.' })
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} required />
      </label>
      <div className="form-row">
        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            required
          />
        </label>
        <label>
          <span>Phone</span>
          <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} required />
        </label>
      </div>
      <label>
        <span>Service</span>
        <select value={form.service} onChange={(event) => handleChange('service', event.target.value)}>
          {site.packages.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Vehicle condition and request</span>
        <textarea
          rows="5"
          value={form.message}
          onChange={(event) => handleChange('message', event.target.value)}
          placeholder="Vehicle, location, timing, and anything that needs special attention"
          required
        />
      </label>
      {state.message ? <p className={`form-message ${state.status}`}>{state.message}</p> : null}
      <button type="submit" className="button-primary full-width" disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Sending...' : 'Send Request'}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  )
}

function FAQ() {
  return (
    <section className="section-block faq-section" id="faq">
      <div className="section-heading compact">
        <span className="eyebrow">Questions</span>
        <h2>Built for clear details before the appointment.</h2>
      </div>
      <div className="faq-list">
        {site.faq.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <strong>{site.business.name}</strong>
          <p>{site.business.tagline}</p>
          <p>{site.business.serviceArea}</p>
        </div>
        <div className="footer-group">
          <span className="footer-label">Navigate</span>
          <div className="footer-links">
            <a href="#proof">Proof</a>
            <a href="#packages">Packages</a>
            <a href="#quote">Request</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <div className="footer-group">
          <span className="footer-label">Contact</span>
          <div className="footer-links">
            <a href={site.business.phoneHref}>{site.business.phone}</a>
            <a href={site.business.emailHref}>{site.business.email}</a>
            <Link href="/portal/signin">Detailer portal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function MobileDock() {
  return (
    <div className="mobile-dock" aria-label="Quick actions">
      <a href="#quote">Book Now</a>
      <a href={site.business.phoneHref}>Call</a>
    </div>
  )
}

export function PortalSignIn() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    if (!supabase) {
      setMessage('Supabase is not configured yet.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    router.push('/portal')
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link href="/" className="auth-brand">
          <span className="brand-mark auth-logo">
            {site.business.logo ? (
              <Image src={site.business.logo} alt="" aria-hidden="true" width={38} height={38} />
            ) : (
              <Sparkles size={18} aria-hidden="true" />
            )}
          </span>
          {site.business.name}
        </Link>
        <span className="eyebrow">Detailer Portal</span>
        <h1>Manage new quote requests.</h1>
        <p>Enter your email and password to view and manage your requests.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          {message ? <p className="form-message error">{message}</p> : null}
          <button type="submit" className="button-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  )
}

export function DetailerPortal() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState(null)
  const [requests, setRequests] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedRequest = requests.find((request) => request.id === selectedId) || requests[0] || null

  const stats = useMemo(
    () => ({
      open: requests.filter((request) => ['new', 'contacted', 'quote_sent'].includes(request.status)).length,
      scheduled: requests.filter((request) => request.status === 'scheduled' || request.scheduledAt).length,
      completed: requests.filter((request) => request.status === 'completed').length,
    }),
    [requests],
  )

  const loadPortal = useCallback(async () => {
    setLoading(true)
    setError('')

    if (!supabase) {
      setError('Supabase is not configured yet.')
      setLoading(false)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) {
      router.push('/portal/signin')
      return
    }

    const membership = await loadBusinessMembership(user.id)

    if (membership.error) {
      setError(membership.error.message)
      setLoading(false)
      return
    }

    if (!membership.business) {
      setError('This account is not linked to a business yet.')
      setLoading(false)
      return
    }

    setBusiness(membership.business)

    const { data, error: requestsError } = await supabase
      .from('CustomerSubmission')
      .select('id, customerName, phone, email, service, message, sourcePage, status, internalNotes, scheduledAt, appointmentLocation, createdAt, updatedAt, contactedAt')
      .eq('businessId', membership.business.id)
      .order('createdAt', { ascending: false })

    if (requestsError) {
      setError(requestsError.message)
      setLoading(false)
      return
    }

    const normalized = (data ?? []).map(normalizeSubmission)
    setRequests(normalized)
    setSelectedId((current) => current ?? normalized[0]?.id ?? null)
    setLoading(false)
  }, [router])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPortal()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadPortal])

  const updateRequestField = (requestId, field, value) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              [field]: value,
              status:
                field === 'scheduledAt' && value && !['completed', 'archived'].includes(request.status)
                  ? 'scheduled'
                  : request.status,
            }
          : request,
      ),
    )
  }

  const toggleExpanded = (requestId) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(requestId)) {
        next.delete(requestId)
      } else {
        next.add(requestId)
      }
      return next
    })
  }

  const saveRequest = async (request) => {
    setSavingId(request.id)
    setError('')
    setMessage('')

    const { data, error: saveError } = await supabase
      .from('CustomerSubmission')
      .update({
        status: request.status,
        internalNotes: request.internalNotes || null,
        scheduledAt: request.scheduledAt,
        appointmentLocation: request.appointmentLocation || null,
        contactedAt:
          ['contacted', 'quote_sent', 'scheduled', 'completed'].includes(request.status) && !request.contactedAt
            ? new Date().toISOString()
            : request.contactedAt,
      })
      .eq('id', request.id)
      .select('id, customerName, phone, email, service, message, sourcePage, status, internalNotes, scheduledAt, appointmentLocation, createdAt, updatedAt, contactedAt')
      .single()

    setSavingId(null)

    if (saveError) {
      setError(saveError.message)
      return
    }

    const normalized = normalizeSubmission(data)
    setRequests((current) => current.map((entry) => (entry.id === normalized.id ? normalized : entry)))
    setMessage('Request saved.')
  }

  const deleteRequest = async (request) => {
    const confirmed = window.confirm(
      `Delete this request from ${request.customerName || 'this customer'}? This removes it from the portal permanently.`,
    )

    if (!confirmed) return

    setDeletingId(request.id)
    setError('')
    setMessage('')

    const { error: deleteError } = await supabase.from('CustomerSubmission').delete().eq('id', request.id)

    setDeletingId(null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setRequests((current) => current.filter((entry) => entry.id !== request.id))
    setExpandedIds((current) => {
      const next = new Set(current)
      next.delete(request.id)
      return next
    })
    setSelectedId((current) => (current === request.id ? null : current))
    setMessage('Request deleted.')
  }

  const signOut = async () => {
    await supabase?.auth.signOut()
    router.push('/portal/signin')
  }

  if (loading) {
    return (
      <main className="portal-shell centered">
        <p>Loading portal...</p>
      </main>
    )
  }

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div>
          <span className="eyebrow">Detailer Portal</span>
          <h1>{business?.name ?? site.business.name}</h1>
        </div>
        <div className="portal-actions">
          <Link href="/" className="button-ghost">
            View Site
          </Link>
          <button type="button" className="icon-button" onClick={signOut} aria-label="Sign out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <section className="portal-stats" aria-label="Request stats">
        <div>
          <strong>{stats.open}</strong>
          <span>Open</span>
        </div>
        <div>
          <strong>{stats.scheduled}</strong>
          <span>Scheduled</span>
        </div>
        <div>
          <strong>{stats.completed}</strong>
          <span>Completed</span>
        </div>
      </section>

      {message ? <p className="portal-message success">{message}</p> : null}
      {error ? <p className="portal-message error">{error}</p> : null}

      <section className="portal-layout">
        <aside className="request-list" aria-label="Requests">
          <div className="list-heading">
            <h2>Requests</h2>
            <button type="button" className="button-small" onClick={loadPortal}>
              Refresh
            </button>
          </div>
          {requests.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={26} aria-hidden="true" />
              <p>No quote requests yet.</p>
            </div>
          ) : (
            requests.map((request) => (
              <button
                type="button"
                className={request.id === selectedRequest?.id ? 'request-card active' : 'request-card'}
                key={request.id}
                onClick={() => setSelectedId(request.id)}
              >
                <span className="request-card-top">
                  <span className={`status-pill status-${request.status}`}>{statusLabels[request.status]}</span>
                  <span>{formatDateTime(request.createdAt)}</span>
                </span>
                <strong>{request.customerName || 'Unnamed customer'}</strong>
                <small>{request.service || 'Quote request'}</small>
                <span
                  className="request-expand"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleExpanded(request.id)
                  }}
                >
                  {expandedIds.has(request.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {expandedIds.has(request.id) ? 'Collapse' : 'Expand'}
                </span>
                {expandedIds.has(request.id) ? (
                  <span className="request-card-extra">
                    <span>{request.phone || 'No phone'}</span>
                    <span>{request.email || 'No email'}</span>
                    <span>{request.message || 'No message provided'}</span>
                  </span>
                ) : null}
              </button>
            ))
          )}
        </aside>

        <RequestDetail
          request={selectedRequest}
          onFieldChange={updateRequestField}
          onSave={saveRequest}
          onDelete={deleteRequest}
          saving={savingId === selectedRequest?.id}
          deleting={deletingId === selectedRequest?.id}
        />
      </section>
    </main>
  )
}

function RequestDetail({ request, onFieldChange, onSave, onDelete, saving, deleting }) {
  if (!request) {
    return (
      <section className="request-detail empty-state">
        <Sparkles size={28} aria-hidden="true" />
        <p>Select a request to view details.</p>
      </section>
    )
  }

  return (
    <section className="request-detail">
      <div className="detail-heading">
        <div>
          <span className="eyebrow">{request.service || 'Custom quote'}</span>
          <h2>{request.customerName || 'Unnamed customer'}</h2>
          <p>Submitted {formatDateTime(request.createdAt)}</p>
        </div>
        <span className={`status-pill status-${request.status}`}>{statusLabels[request.status]}</span>
      </div>

      <div className="contact-cards">
        <a href={request.phone ? `tel:${request.phone}` : undefined} className="contact-card">
          <Phone size={18} aria-hidden="true" />
          <span>Phone</span>
          <strong>{request.phone || 'Not provided'}</strong>
        </a>
        <a href={request.email ? `mailto:${request.email}` : undefined} className="contact-card">
          <Mail size={18} aria-hidden="true" />
          <span>Email</span>
          <strong>{request.email || 'Not provided'}</strong>
        </a>
      </div>

      <div className="detail-grid">
        <label>
          <span>Status</span>
          <select value={request.status} onChange={(event) => onFieldChange(request.id, 'status', event.target.value)}>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Appointment</span>
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(request.scheduledAt)}
            onChange={(event) => onFieldChange(request.id, 'scheduledAt', fromDateTimeLocalValue(event.target.value))}
          />
        </label>
      </div>

      <label>
        <span>Appointment location</span>
        <input
          value={request.appointmentLocation}
          onChange={(event) => onFieldChange(request.id, 'appointmentLocation', event.target.value)}
          placeholder="Home, office, or service address"
        />
      </label>

      <div className="message-panel">
        <span>Customer message</span>
        <p>{request.message || 'No message provided.'}</p>
      </div>

      <label>
        <span>Internal notes</span>
        <textarea
          rows="6"
          value={request.internalNotes}
          onChange={(event) => onFieldChange(request.id, 'internalNotes', event.target.value)}
          placeholder="Add quote notes, follow-up details, or appointment prep"
        />
      </label>

      <div className="detail-actions">
        <button type="button" className="button-danger" onClick={() => onDelete(request)} disabled={deleting}>
          <Trash2 size={18} aria-hidden="true" />
          {deleting ? 'Deleting...' : 'Delete Request'}
        </button>
        <button type="button" className="button-primary" onClick={() => onSave(request)} disabled={saving}>
          {saving ? 'Saving...' : 'Save Request'}
        </button>
      </div>
    </section>
  )
}

export function ChangePassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setMessage('Supabase is not configured yet.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    setMessage(error ? error.message : 'Password updated.')
    if (!error) setPassword('')
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">Detailer Portal</span>
        <h1>Change password.</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength="8"
              required
            />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button type="submit" className="button-primary full-width">
            Update Password
          </button>
        </form>
      </section>
    </main>
  )
}

export function ResetPassword() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">Detailer Portal</span>
        <h1>Reset link opened.</h1>
        <p>Enter a new password on the change password page once Supabase has restored your session.</p>
        <Link className="button-primary full-width" href="/portal/change-password">
          Continue
        </Link>
      </section>
    </main>
  )
}
