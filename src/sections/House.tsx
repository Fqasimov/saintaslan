import { Letters } from '../components/Letters'
import { ScrubText } from '../components/ScrubText'

const FACTS = [
  { n: '2', title: 'Seasons', text: 'Velvet for winter. Chiffon, satin and print for summer.' },
  { n: '2', title: 'Boutiques', text: 'A rail in Baku and a rail in Dubai, each with its own stock.' },
  { n: '1', title: 'Hour', text: 'Both cities keep GMT+4. Your message goes straight to the boutique you choose.' },
]

export function House() {
  return (
    <section id="house" className="house" data-ground="velvet" aria-labelledby="house-title">
      <header className="season-head">
        <p className="season-head__index" aria-hidden="true">
          04
        </p>
        <Letters text="The house" className="season-head__title" />
      </header>
      <h3 id="house-title" className="sr-only">
        About Saint Aslan
      </h3>
      <div className="house__body">
        <p className="house__aside reveal">
          <em>Aslan</em> is the Azerbaijani word for lion.
        </p>
        <ScrubText
          className="house__statement"
          text="Saint Aslan is a couture house from Azerbaijan. It makes clothes with a strict line and a soft hand: velvet pulled in at the waist, chiffon left free to move, satin draped until it falls on its own."
        />
      </div>
      <ul className="facts" role="list">
        {FACTS.map((f, i) => (
          <li key={f.title} className="fact reveal" style={{ ['--i' as string]: i }}>
            <span className="fact__n" aria-hidden="true">
              {f.n}
            </span>
            <h4 className="fact__title">
              <span className="sr-only">{f.n} </span>
              {f.title}
            </h4>
            <p>{f.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
