import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/progress.js'

const LINKS = [
  { to: '/',          label: 'Overview',  icon: '◈', end: true },
  { to: '/roadmap',   label: 'Roadmap',   icon: '◧' },
  { to: '/practice',  label: 'Practice',  icon: '◑' },
  { to: '/exam',      label: 'Mock exam', icon: '⏱' },
  { to: '/glossary',  label: 'Glossary',  icon: '❖' },
  { to: '/resources', label: 'Resources', icon: '◇' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const [theme, toggleTheme] = useTheme()
  const loc = useLocation()

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])

  return (
    <div className="shell">
      <header className="nav">
        <div className="wrap">
          <Link to="/" className="brand">
            <span className="brand-mark">N</span>
            <span className="brand-name">NCP-AAI <span>Academy</span></span>
          </Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light / dark">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <button className="icon-btn burger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="drawer-scrim" onClick={() => setOpen(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              <span className="brand-name">Menu</span>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
            </div>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `drawer-link ${isActive ? 'active' : ''}`}>
                <span aria-hidden>{l.icon}</span> {l.label}
              </NavLink>
            ))}
          </aside>
        </>
      )}

      <main className="page">{children}</main>

      <footer className="foot">
        <div className="wrap">
          <p style={{ marginBottom: 6 }}>
            An independent, community-built study companion for the <b>NVIDIA-Certified Professional: Agentic AI (NCP-AAI)</b> exam.
            Not affiliated with or endorsed by NVIDIA.
          </p>
          <p style={{ margin: 0 }}>
            Always verify the current blueprint on the{' '}
            <a href="https://www.nvidia.com/en-us/learn/certification/agentic-ai-professional/" target="_blank" rel="noreferrer">official exam page</a>
            {' '}— domains and weights change between revisions. Progress is stored only in your own browser.
          </p>
        </div>
      </footer>
    </div>
  )
}
