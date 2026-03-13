
import { Link, useLocation } from 'react-router-dom'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = parts.map((part, idx) => {
    const to = '/' + parts.slice(0, idx + 1).join('/')
    const label = part.charAt(0).toUpperCase() + part.slice(1)
    return { to, label }
  })

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-2 text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={c.to} className="flex items-center gap-2">
            {i === crumbs.length - 1 ? (
              <>
                <span className="text-foreground">{c.label}</span>
              </>
            ) : (
              <>
                <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
                  <span className="opacity-50">/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
