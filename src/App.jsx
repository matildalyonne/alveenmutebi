import { useState, useRef, useEffect, useCallback } from 'react'
import './App.css'

/* ── DATA ─────────────────────────────────────────────────────────────── */

const experience = [
  {
    date: 'May – Sep 2026',
    role: 'CCTV, Security & LAN Installations',
    org: 'ISAM Technologies — Kampala',
    bullets: [
      'Installed and configured IP and analog camera systems for commercial and residential clients.',
      'Set up access control systems and electric fencing for security-focused deployments.',
      'Installed internet access points for local hotspot businesses.',
    ],
  },
  {
    date: 'Jun – Sep 2025',
    role: 'Data Entrant',
    org: 'Electoral Commission — Mityana',
    bullets: [
      'Registered candidates for Special Interest Groups ahead of the 2025 electoral cycle.',
      'Tallied and recorded SIG election results accurately and on schedule.',
      'Maintained data integrity and submitted records per Commission guidelines.',
    ],
  },
  {
    date: 'Apr – Jun 2025',
    role: 'IT Technician',
    org: 'Uganda Hotel Owners Association — Masaka',
    bullets: [
      'Installed and configured Wi-Fi networks across multiple hotel properties in the Masaka region.',
      'Set up CCTV security systems to improve premises security for hotel clients.',
      'Provided technical support and staff training on installed IT systems.',
    ],
  },
  {
    date: 'Apr – Jun 2025\nApr – Jun 2026',
    role: 'Data Entrant',
    org: 'Aunt Polly Primary School — Masaka',
    bullets: [
      'Registered PLE candidates and verified details for accuracy before submission to UNEB systems.',
    ],
  },
]

const education = [
  {
    degree: 'Diploma in Information Technology',
    school: 'Uganda Christian University, Mukono',
    year: '2024 – 2026',
    logo: '/logo/school/uganda_christian_university.png',
  },
  {
    degree: 'Uganda Advanced Certificate of Education (UACE)',
    school: 'Mengo Senior School, Kampala',
    year: '2020 – 2022',
    logo: '/logo/school/mengo_senior_school.png',
  },
  {
    degree: 'Uganda Certificate of Education (UCE)',
    school: "St Mary's College Kisubi, Entebbe",
    year: '2016 – 2019',
    logo: '/logo/school/st_marys_college_kisubi.png',
  },
  {
    degree: 'Primary Leaving Education (PLE)',
    school: 'Kyengera Parents School, Kyengera',
    year: '2009 – 2015',
    logo: '/logo/school/kyengera_parents_school.png',
  },
]

const technicalSkills = [
  'CCTV (IP & Analog) Installation',
  'Video Intercom Systems',
  'LAN & Wi-Fi Installation',
  'Access Control Systems',
  'Web & Mobile Development',
  'Digital Marketing',
  'Data Entry & Management',
  'Report Writing',
  'Basic Accounting',
]

// Base items (will be duplicated in the carousel component for seamless looping)
const toolsRow1Base = [
  { name: 'Figma',              file: 'figma-seeklogo.png' },
  { name: 'Git',                file: 'git-seeklogo.png' },
  { name: 'Netlify',            file: 'netlify-seeklogo.png' },
  { name: 'PicsArt',            file: 'picsart-seeklogo.png' },
  { name: 'Python',             file: 'python-seeklogo.png' },
  { name: 'React',              file: 'react-seeklogo.png' },
  { name: 'Supabase',           file: 'supabase-seeklogo.png' },
  { name: 'Vite',               file: 'vite-seeklogo.png' },
]

const toolsRow2Base = [
  { name: 'CSS3',               file: 'css3-seeklogo.png' },
  { name: 'Dahua',              file: 'dahua-seeklogo.png' },
  { name: 'DoLynk Care',        file: 'dolynk.png' },
  { name: 'HTML5',              file: 'html5-seeklogo.png' },
  { name: 'LaTeX',              file: 'latex-seeklogo.png' },
  { name: 'Microsoft Office',   file: 'microsoft office.png' },
  { name: 'MySQL',              file: 'mysql-seeklogo.png' },
  { name: 'Node.js',            file: 'node-js-seeklogo.png' },
  { name: 'Intuit QuickBooks',  file: 'quickbooks-seeklogo.png' },
]

const certifications = [
  {
    name: 'Access Control System Certified Associate (DHCA-ACS)',
    issuer: 'Dahua Technologies, Kampala — 2026',
    logo: '/logo/tools/dahua.png',
  },
  {
    name: 'Data Communication System Certified Associate (DHCA-TXM)',
    issuer: 'Dahua Technologies, Kampala — 2026',
    logo: '/logo/tools/dahua.png',
  },
]

const documents = [
  { label: 'Curriculum Vitae',       type: 'PDF', file: 'Mutebi_Alveen_CV.pdf',     icon: '📄' },
  {},
]

/* ── SCRUBABLE CAROUSEL ROW ────────────────────────────────────────────── */
/*
 * Each row is self-contained. It:
 *   • auto-scrolls via requestAnimationFrame (not CSS animation) so we can
 *     pause / offset it independently per row
 *   • accepts pointer/touch drag to scrub position
 *   • shows a tooltip on tap (touchstart → touchend without move = tap)
 */
function CarouselRow({ items, direction = 'left', speed = 0.4 }) {
  // Duplicate items for seamless looping
  const doubled = [...items, ...items]

  const trackRef  = useRef(null)
  const posRef    = useRef(0)          // current pixel offset
  const rafRef    = useRef(null)
  const dragging  = useRef(false)
  const dragStart = useRef({ x: 0, pos: 0 })
  const hasMoved  = useRef(false)      // distinguish tap from drag
  const [activeTooltip, setActiveTooltip] = useState(null) // index or null
  const [paused, setPaused] = useState(false)

  // The natural "half width" is the width of one copy of the items
  // We measure it from the DOM after mount
  const halfWidthRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    // measure after first paint
    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // RAF loop
  const tick = useCallback(() => {
    if (!dragging.current && !paused) {
      const half = halfWidthRef.current
      if (half === 0) { rafRef.current = requestAnimationFrame(tick); return }
      const delta = direction === 'left' ? speed : -speed
      posRef.current = ((posRef.current + delta) % half + half) % half
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${posRef.current}px)`
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [direction, speed, paused])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  // ── Pointer events (mouse + touch via pointer API) ──
  const onPointerDown = (e) => {
    dragging.current = true
    hasMoved.current = false
    dragStart.current = { x: e.clientX, pos: posRef.current }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.x
    if (Math.abs(dx) > 4) hasMoved.current = true
    const half = halfWidthRef.current || 1
    posRef.current = ((dragStart.current.pos - dx) % half + half) % half
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  // ── Tap (touch: touchstart/end without significant move) ──
  const touchStartX = useRef(0)

  const onTouchStart = (e, idx) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e, idx) => {
    const moved = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
    if (moved < 8) {
      // it's a tap — toggle tooltip
      setActiveTooltip(prev => prev === idx ? null : idx)
    }
  }

  // Dismiss tooltip when tapping elsewhere
  useEffect(() => {
    const dismiss = () => setActiveTooltip(null)
    document.addEventListener('touchstart', dismiss, { passive: true })
    return () => document.removeEventListener('touchstart', dismiss)
  }, [])

  return (
    <div
      className="carousel-row-outer"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-track" ref={trackRef}>
        {doubled.map((t, i) => (
          <div
            key={i}
            className="tool-logo-item"
            onMouseEnter={() => setActiveTooltip(i)}
            onMouseLeave={() => setActiveTooltip(null)}
            onTouchStart={(e) => onTouchStart(e, i)}
            onTouchEnd={(e) => { e.stopPropagation(); onTouchEnd(e, i) }}
          >
            <img
              src={`/logo/tools/${t.file}`}
              alt={t.name}
              className="tool-logo-img"
              draggable={false}
              onError={e => { e.target.style.opacity = '0.15' }}
            />
            {activeTooltip === i && (
              <div className="tool-tooltip">{t.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── COMPONENTS ───────────────────────────────────────────────────────── */

function Nav({ dark, toggleDark }) {
  return (
    <nav className="nav">
      <div className="nav-logo">Mutebi Alveen</div>
      <div className="nav-links">
        <a href="#experience">Experience</a>
        <a href="#education">Education</a>
        <a href="#skills">Skills</a>
        <a href="#contact">Contact</a>
      </div>
      <button
        className="theme-toggle"
        onClick={toggleDark}
        aria-label="Toggle colour mode"
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-line" />
      <div className="hero-glow" />
      <p className="hero-eyebrow">IT Professional · Web Developer · Kampala, Uganda</p>
      <h1>
        Building networks,<br />
        <em>digital &amp; physical.</em>
      </h1>
      <p className="hero-desc">
        I install the cables, configure the systems, and write the code.
        From LAN deployments and CCTV setups across Uganda to full-stack
        web applications — I work across the full hardware-to-browser stack.
      </p>
      <div className="hero-ctas">
        <a href="#contact" className="btn-primary">Get in touch</a>
        <div className="docs-grid">
                  {documents.map((doc, i) => (
                            <a
                                        key={i}
                                                    className="doc-card"
                                                                href={`/documents/${doc.file}`}
                                                                            download={doc.file}
                                                                                      >
                                                                                                  <div className="doc-icon-wrap">{doc.icon}</div>
                                                                                                              <div><div className="doc-name">{doc.label}</div></div>
                                                                                                                          <div className="doc-dl">↓</div>
                                                                                                                                    </a>
                                                                                                                                            ))}
                                                                                                                                                  </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="section" id="experience">
      <p className="section-label">Work History</p>
      <h2 className="section-heading">Experience <em>in the field</em></h2>
      <div className="timeline">
        {experience.map((item, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-date">{item.date}</div>
            <div className="timeline-spine" />
            <div className="timeline-content">
              <div className="timeline-role">{item.role}</div>
              <div className="timeline-org">{item.org}</div>
              <ul className="timeline-bullets">
                {item.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Education() {
  return (
    <section className="section section-alt" id="education">
      <p className="section-label">Academic Background</p>
      <h2 className="section-heading"><em>Education</em></h2>
      <div className="edu-grid">
        {education.map((ed, i) => (
          <div className="edu-card" key={i}>
            <div className="edu-card-header">
              <img
                src={ed.logo}
                alt={`${ed.school} logo`}
                className="edu-logo"
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <div className="edu-school">{ed.school}</div>
                <div className="edu-year">{ed.year}</div>
              </div>
            </div>
            <div className="edu-degree">{ed.degree}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section className="section" id="skills">
      <p className="section-label">Capabilities</p>
      <h2 className="section-heading">Skills &amp; <em>Tools</em></h2>

      <div className="skills-grid">
        <div>
          <p className="skills-group-label">Technical Skills</p>
          <div className="chips">
            {technicalSkills.map((s, i) => <span className="chip" key={i}>{s}</span>)}
          </div>
        </div>
        <div>
          <p className="skills-group-label">Certifications</p>
          <div className="cert-list">
            {certifications.map((c, i) => (
              <div className="cert-item" key={i}>
                <img
                  src={c.logo}
                  alt="Dahua Technologies"
                  className="cert-logo"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <div>
                  <div className="cert-name">{c.name}</div>
                  <div className="cert-issuer">{c.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two independently-scrubable carousel rows */}
      <div className="carousel-section">
        <p className="skills-group-label" style={{ marginBottom: '1.2rem' }}>
          Tools &amp; Platforms
        </p>
        <div className="carousel-outer">
          <CarouselRow items={toolsRow1Base} direction="left"  speed={0.45} />
          <CarouselRow items={toolsRow2Base} direction="right" speed={0.35} />
        </div>
        <p className="carousel-hint">Drag to scrub · Hover or tap a logo for its name</p>
      </div>
    </section>
  )
}


function Contact() {
  return (
    <section className="section" id="contact">
      <div className="contact-grid">
        <div>
          <p className="section-label">Get In Touch</p>
          <p className="contact-lead">
            Open to <em>opportunities</em>,<br />
            projects &amp; collaborations.
          </p>
          <div className="langs">
            <div className="lang-badge"><span>English</span> — Fluent</div>
            <div className="lang-badge"><span>Luganda</span> — Native</div>
          </div>
        </div>
        <div className="contact-items">
          <div className="contact-item">
            <div className="contact-icon">📞</div>
            <div>
              <a href="tel:+256779082094">+256 779 082 094</a>
              {' / '}
              <a href="tel:+256753431647">+256 753 431 647</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">✉️</div>
            <a href="mailto:vaematilda@gmail.com">vaematilda@gmail.com</a>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                  -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                  .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                  -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
                  1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
                  1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
                  1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </div>
            <a href="https://github.com/matildalyonne" target="_blank" rel="noreferrer">
              github.com/matildalyonne
            </a>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📍</div>
            <span>Kampala, Uganda</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} <span className="footer-name">Mutebi Alveen Mulungi</span></span>
      <span>Built with React · Hosted on Netlify</span>
    </footer>
  )
}

/* ── APP ──────────────────────────────────────────────────────────────── */
export default function App() {
  const [dark, setDark] = useState(true)
  return (
    <div className={dark ? 'theme-dark' : 'theme-light'}>
      <Nav dark={dark} toggleDark={() => setDark(d => !d)} />
      <main>
        <Hero />
        <hr className="lav-rule" />
        <Experience />
        <hr className="lav-rule" />
        <Education />
        <hr className="lav-rule" />
        <Skills />
        <hr className="lav-rule" />
        <Documents />
        <hr className="lav-rule" />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
