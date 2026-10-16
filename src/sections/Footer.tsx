import { NAV } from '../components/Header'
import { Letters } from '../components/Letters'
import { instagramUrl } from '../lib/contact'
import { scrollToId } from '../lib/scroll'

export function Footer() {
  return (
    <footer className="footer" data-ground="velvet">
      <Letters text="SAINT ASLAN" as="p" className="footer__name" />
      <div className="footer__row">
        <p>Couture from Azerbaijan · Baku · Dubai</p>
        <nav aria-label="Footer">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToId(n.id)
              }}
            >
              {n.label}
            </a>
          ))}
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>
        <p>© {new Date().getFullYear()} Saint Aslan</p>
      </div>
    </footer>
  )
}
