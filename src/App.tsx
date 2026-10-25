import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDown, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, CircleHelp, Clock3, Ellipsis, Filter, LayoutDashboard, LogOut, Plus, Search, Settings2, TicketCheck, Users, X } from 'lucide-react'
import './App.css'

type Status = 'Waiting' | 'Called' | 'Serving' | 'Completed' | 'No-show'
type Ticket = { id: string; name: string; service: string; status: Status; joined: string; wait: number; initials: string }

const seedTickets: Ticket[] = [
  { id: 'Q-104', name: 'Olivia Chen', service: 'Consultation', status: 'Serving', joined: '10:24 AM', wait: 0, initials: 'OC' },
  { id: 'Q-105', name: 'Marcus Johnson', service: 'Account support', status: 'Called', joined: '10:28 AM', wait: 4, initials: 'MJ' },
  { id: 'Q-106', name: 'Amara Okafor', service: 'Consultation', status: 'Waiting', joined: '10:31 AM', wait: 12, initials: 'AO' },
  { id: 'Q-107', name: 'Theo Park', service: 'Document pickup', status: 'Waiting', joined: '10:34 AM', wait: 18, initials: 'TP' },
  { id: 'Q-108', name: 'Sofia Martinez', service: 'Account support', status: 'Waiting', joined: '10:38 AM', wait: 24, initials: 'SM' },
  { id: 'Q-109', name: 'James Wilson', service: 'Consultation', status: 'Waiting', joined: '10:42 AM', wait: 30, initials: 'JW' },
  { id: 'Q-110', name: 'Priya Patel', service: 'Document pickup', status: 'Waiting', joined: '10:45 AM', wait: 36, initials: 'PP' },
  { id: 'Q-111', name: 'Noah Williams', service: 'Account support', status: 'Waiting', joined: '10:49 AM', wait: 42, initials: 'NW' },
]

const colors = ['#dcebe2', '#f7e2d8', '#e6e2f4', '#f4edcf', '#dceaf0']

function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem('queueflow-tickets')
      return saved ? JSON.parse(saved) as Ticket[] : seedTickets
    } catch { return seedTickets }
  })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All tickets')
  const [dialog, setDialog] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [service, setService] = useState('Consultation')
  const [notice, setNotice] = useState('')
  const [activeNav, setActiveNav] = useState('Overview')

  useEffect(() => { localStorage.setItem('queueflow-tickets', JSON.stringify(tickets)) }, [tickets])

  const waiting = tickets.filter((ticket) => ticket.status === 'Waiting')
  const serving = tickets.find((ticket) => ticket.status === 'Serving')
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesQuery = `${ticket.name} ${ticket.id} ${ticket.service}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'All tickets' || ticket.status === filter
    return matchesQuery && matchesFilter
  }), [tickets, query, filter])

  function updateStatus(id: string, status: Status) {
    setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket))
    if (status === 'Serving') setTickets((current) => current.map((ticket) => ticket.status === 'Serving' && ticket.id !== id ? { ...ticket, status: 'Completed' } : ticket))
    setNotice(`${id} marked ${status.toLowerCase()}`)
    window.setTimeout(() => setNotice(''), 2600)
  }

  function addTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = customerName.trim()
    if (!name) return
    const nextNumber = Math.max(103, ...tickets.map((ticket) => Number(ticket.id.slice(2)) || 0)) + 1
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
    setTickets((current) => [...current, { id: `Q-${nextNumber}`, name, service, status: 'Waiting', joined: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), wait: current.filter((ticket) => ticket.status === 'Waiting').length * 6 + 6, initials }])
    setCustomerName('')
    setDialog(false)
    setNotice(`Added to queue · Q-${nextNumber}`)
    window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Queueflow home"><span className="brand-mark"><Activity size={19} strokeWidth={2.5} /></span><span>queueflow<span className="brand-period">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="location-switch"><span className="location-dot" /> Downtown Studio <ChevronDown size={15} /></button>
        <div className="nav-label">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {[['Overview', LayoutDashboard], ['Queue', Users], ['Services', TicketCheck], ['Activity', Activity]].map(([label, Icon]) => <button key={label as string} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => setActiveNav(label as string)}><Icon size={18} /><span>{label as string}</span>{label === 'Queue' && <span className="nav-count">{waiting.length}</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><button className="nav-item" onClick={() => setNotice('Settings are up to date')}><Settings2 size={18} /><span>Settings</span></button><button className="help-link" onClick={() => setNotice('Help center is coming soon')}><CircleHelp size={17} /><span>Help center</span><ArrowUpRight size={14} /></button><div className="profile"><div className="profile-avatar">AM</div><div className="profile-copy"><strong>Alex Morgan</strong><span>Studio manager</span></div><button className="icon-button" aria-label="Sign out"><LogOut size={16} /></button></div></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div><div className="top-actions"><div className="open-status"><span /> Queue is open</div><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">AM</div></div></header>
        <div className="page-content">
          <section className="page-heading"><div><div className="eyebrow"><CalendarDays size={14} /> {todayLabel}</div><h1>Good morning, Alex <span>✳</span></h1><p>Here’s what’s happening at your studio today.</p></div><button className="primary-button" onClick={() => setDialog(true)}><Plus size={17} /> Add to queue</button></section>

          <section className="metrics" aria-label="Queue summary">
            <article className="metric-card"><div className="metric-top"><span>People waiting</span><span className="metric-icon green"><Users size={17} /></span></div><div className="metric-value">{waiting.length}<span className="metric-change positive"><ArrowDown size={13} /> 2</span></div><div className="metric-foot">vs. 9 at this time yesterday</div><div className="mini-bars" aria-hidden="true">{[25, 36, 30, 48, 39, 55, 43, 63, 45, 70, 54, 77, 60, 85].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></article>
            <article className="metric-card"><div className="metric-top"><span>Average wait</span><span className="metric-icon coral"><Clock3 size={17} /></span></div><div className="metric-value">18<span className="unit">min</span><span className="metric-change positive"><ArrowDown size={13} /> 4 min</span></div><div className="metric-foot">vs. 22 min last week</div><div className="metric-meter"><span style={{ width: '62%' }} /></div><div className="meter-label"><span>Target: under 20 min</span><strong>On track</strong></div></article>
            <article className="metric-card"><div className="metric-top"><span>Served today</span><span className="metric-icon yellow"><TicketCheck size={17} /></span></div><div className="metric-value">24<span className="metric-change positive"><ArrowUpRight size={13} /> 18%</span></div><div className="metric-foot">4 more than yesterday</div><div className="served-progress"><div className="served-avatars"><span>OC</span><span>RB</span><span>DK</span><span>+3</span></div><span>Across 3 service desks</span></div></article>
          </section>

          <section className="operations-grid">
            <article className="serving-panel"><div className="panel-heading"><div><div className="section-kicker">UP NEXT</div><h2>Currently serving</h2></div><span className="live-indicator"><i /> LIVE</span></div>{serving ? <><div className="serving-ticket"><div className="ticket-number">{serving.id}</div><div className="serving-person"><div className="customer-avatar large" style={{ backgroundColor: colors[0] }}>{serving.initials}</div><div><strong>{serving.name}</strong><span>{serving.service}</span></div></div><div className="serving-time"><span>Joined at</span><strong>{serving.joined}</strong></div></div><div className="serving-bottom"><span><span className="small-live" /> At service desk 01</span><button className="complete-button" onClick={() => updateStatus(serving.id, 'Completed')}><Check size={15} /> Complete visit</button></div></> : <div className="empty-serving">No one is being served right now.</div>}</article>
            <article className="wait-panel"><div className="panel-heading"><div><div className="section-kicker">QUEUE PULSE</div><h2>Wait time today</h2></div><button className="subtle-select">Today <ChevronDown size={14} /></button></div><div className="wait-chart"><div className="chart-y"><span>40m</span><span>30m</span><span>20m</span><span>10m</span></div><div className="chart-area"><div className="chart-grid"><i /><i /><i /><i /></div><svg viewBox="0 0 420 112" preserveAspectRatio="none" role="img" aria-label="Wait time trends downward through the day"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#397458" stopOpacity=".18" /><stop offset="100%" stopColor="#397458" stopOpacity="0" /></linearGradient></defs><path d="M0 35 C24 28 32 40 52 35 S82 42 105 48 S135 35 158 46 S187 44 210 60 S240 43 262 58 S291 62 315 72 S345 55 368 67 S397 78 420 77 L420 112 L0 112Z" fill="url(#chartFill)" /><path d="M0 35 C24 28 32 40 52 35 S82 42 105 48 S135 35 158 46 S187 44 210 60 S240 43 262 58 S291 62 315 72 S345 55 368 67 S397 78 420 77" fill="none" stroke="#397458" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /><circle cx="315" cy="72" r="4" fill="#fff" stroke="#397458" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x"><span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>1 PM</span></div></div></div><div className="chart-legend"><span><i /> Average wait</span><strong>18 min <small>now</small></strong></div></article>
          </section>

          <section className="queue-section"><div className="queue-heading"><div><div className="section-kicker">LIVE OVERVIEW</div><h2>Queue <span className="queue-total">{tickets.filter((ticket) => !['Completed', 'No-show'].includes(ticket.status)).length}</span></h2></div><button className="secondary-button" onClick={() => setDialog(true)}><Plus size={16} /> Add walk-in</button></div>
            <div className="queue-toolbar"><div className="queue-tabs"><button className={filter === 'All tickets' ? 'selected' : ''} onClick={() => setFilter('All tickets')}>All tickets <span>{tickets.length}</span></button><button className={filter === 'Waiting' ? 'selected' : ''} onClick={() => setFilter('Waiting')}>Waiting <span>{waiting.length}</span></button><button className={filter === 'Serving' ? 'selected' : ''} onClick={() => setFilter('Serving')}>In service <span>{tickets.filter((ticket) => ['Serving', 'Called'].includes(ticket.status)).length}</span></button><button className={filter === 'Completed' ? 'selected' : ''} onClick={() => setFilter('Completed')}>Completed</button></div><div className="queue-tools"><label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search queue" aria-label="Search queue" /><kbd>⌘ K</kbd></label><button className="filter-button" onClick={() => setFilter(filter === 'All tickets' ? 'Waiting' : 'All tickets')} aria-label="Filter tickets"><Filter size={16} /></button><button className="sort-button" onClick={() => setTickets([...tickets].reverse())}>Newest first <ArrowDown size={14} /></button></div></div>
            <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all tickets" /></th><th>TICKET</th><th>CUSTOMER</th><th>SERVICE TYPE</th><th>JOINED</th><th>EST. WAIT</th><th>STATUS</th><th aria-label="Actions" /></tr></thead><tbody>{visibleTickets.map((ticket, i) => <tr key={ticket.id}><td><input type="checkbox" aria-label={`Select ${ticket.name}`} /></td><td><span className="ticket-id">{ticket.id}</span></td><td><div className="customer-cell"><span className="customer-avatar" style={{ backgroundColor: colors[i % colors.length] }}>{ticket.initials}</span><span>{ticket.name}</span></div></td><td><span className="service-name">{ticket.service}</span></td><td className="joined-time">{ticket.joined}</td><td>{ticket.status === 'Serving' || ticket.status === 'Completed' ? <span className="wait-dash">—</span> : <span className="wait-time"><Clock3 size={13} /> {ticket.wait} min</span>}</td><td><span className={`status status-${ticket.status.toLowerCase().replace('-', '')}`}><i />{ticket.status}</span></td><td><div className="row-actions">{ticket.status === 'Waiting' && <button className="call-button" onClick={() => updateStatus(ticket.id, 'Called')}>Call</button>}{ticket.status === 'Called' && <button className="call-button" onClick={() => updateStatus(ticket.id, 'Serving')}>Start</button>}{ticket.status === 'Serving' && <button className="call-button" onClick={() => updateStatus(ticket.id, 'Completed')}>Finish</button>}{['Waiting', 'Called'].includes(ticket.status) && <button className="row-menu" title="Mark no-show" aria-label={`Mark ${ticket.id} no-show`} onClick={() => updateStatus(ticket.id, 'No-show')}><Ellipsis size={17} /></button>}</div></td></tr>)}</tbody></table>{visibleTickets.length === 0 && <div className="no-results">No tickets match your search.</div>}</div><footer className="table-footer"><span>Showing <strong>{visibleTickets.length}</strong> of <strong>{tickets.length}</strong> tickets</span><div><button aria-label="Previous page" disabled><ArrowDown className="rotate-arrow" size={14} /></button><span>Page 1 of 1</span><button aria-label="Next page" disabled><ArrowDown className="reverse-arrow" size={14} /></button></div></footer>
          </section>
          <footer className="page-footer"><span>Queueflow <span>·</span> Downtown Studio</span><span>Last synced just now <i /></span></footer>
        </div>
      </main>

      {dialog && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(false) }}><section className="join-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-top"><span className="modal-icon"><Users size={19} /></span><button className="icon-button" onClick={() => setDialog(false)} aria-label="Close"><X size={18} /></button></div><div className="section-kicker">NEW VISIT</div><h2 id="modal-title">Add to the queue</h2><p>Enter the customer’s details to create a ticket.</p><form onSubmit={addTicket}><label htmlFor="customer-name">Customer name</label><input autoFocus id="customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Jordan Lee" required /><label htmlFor="service-type">Service type</label><select id="service-type" value={service} onChange={(event) => setService(event.target.value)}><option>Consultation</option><option>Account support</option><option>Document pickup</option></select><div className="estimated-wait"><Clock3 size={15} /><span>Estimated wait</span><strong>~{waiting.length * 6 + 6} min</strong></div><button className="primary-button modal-submit" type="submit"><Plus size={16} /> Create ticket</button></form></section></div>}
      {notice && <div className="toast"><Check size={16} />{notice}</div>}
    </div>
  )
}

export default App
