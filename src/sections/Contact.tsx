import { useRef, useState } from 'react'
import { Letters } from '../components/Letters'
import { PIECES } from '../data/pieces'
import { useCity } from '../lib/city'
import { CITIES, CITY_IDS, instagramUrl, INSTAGRAM, whatsappUrl, type CityId } from '../lib/contact'
import { useClock } from '../lib/hooks'

function Boutique({ id }: { id: CityId }) {
  const c = CITIES[id]
  const time = useClock(c.zone)
  const { city } = useCity()
  return (
    <article className="boutique reveal" data-active={city === id}>
      <p className="label">{c.country}</p>
      <h3 className="boutique__name">{c.name}</h3>
      <p className="boutique__time">
        <span className="boutique__pulse" aria-hidden="true" />
        {time} local time
      </p>
      {c.address && <p className="boutique__address">{c.address}</p>}
      <div className="boutique__actions">
        <a className="button button--solid" href={whatsappUrl(id, `Hello Saint Aslan ${c.name}, I have a question.`)} target="_blank" rel="noreferrer">
          WhatsApp {c.name}
        </a>
      </div>
    </article>
  )
}

export function Contact() {
  const { city, setCity } = useCity()
  const [name, setName] = useState('')
  const [piece, setPiece] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  const lines = [
    `Hello Saint Aslan ${CITIES[city].name}, my name is ${name.trim()}.`,
    piece && `I am interested in the ${piece}.`,
    message.trim(),
  ].filter(Boolean)
  const url = whatsappUrl(city, lines.join('\n'))
  const linkRef = useRef<HTMLAnchorElement>(null)

  // The send control is a real link (it works in every browser and embed, where a
  // script-opened window may be blocked); it only refuses while the name is missing.
  const guard = (e: React.MouseEvent) => {
    if (name.trim()) return
    e.preventDefault()
    setError(true)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) setError(true)
    else linkRef.current?.focus()
  }

  return (
    <section id="contact" className="contact" data-ground="stone" aria-labelledby="contact-title">
      <header className="season-head">
        <p className="season-head__index" aria-hidden="true">
          05
        </p>
        <Letters text="Contact" className="season-head__title" />
        <div className="season-head__copy reveal">
          <p className="season-head__lede" id="contact-title">
            <em>Write to the boutique nearest you.</em>
          </p>
          <p>
            Questions about a size, a fitting, or a piece you saw on{' '}
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            : the message opens in WhatsApp, already written.
          </p>
        </div>
      </header>

      <div className="contact__grid">
        <div className="boutiques">
          {CITY_IDS.map((id) => (
            <Boutique key={id} id={id} />
          ))}
        </div>

        <form className="form reveal" onSubmit={submit} noValidate>
          <fieldset className="field field--chips">
            <legend className="label">Boutique</legend>
            <div className="chips">
              {CITY_IDS.map((id) => (
                <label key={id} className="chip">
                  <input type="radio" name="city" value={id} checked={city === id} onChange={() => setCity(id)} />
                  {CITIES[id].name}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span className="label">Your name</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(false)
              }}
              autoComplete="name"
              aria-invalid={error}
              aria-describedby={error ? 'name-error' : undefined}
            />
            {error && (
              <span id="name-error" className="field__error">
                Please add your name so the boutique knows who is writing.
              </span>
            )}
          </label>
          <label className="field">
            <span className="label">Piece (optional)</span>
            <select value={piece} onChange={(e) => setPiece(e.target.value)}>
              <option value="">Not sure yet</option>
              {PIECES.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Message (optional)</span>
            <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <a ref={linkRef} className="button button--solid button--wide" href={url} target="_blank" rel="noreferrer" onClick={guard}>
            Send on WhatsApp to {CITIES[city].name}
          </a>
          <p className="form__note">
            Opens WhatsApp. Nothing is stored on this site. Instagram: <a href={instagramUrl} target="_blank" rel="noreferrer">@{INSTAGRAM}</a>
          </p>
        </form>
      </div>
    </section>
  )
}
