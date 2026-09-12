import { useEffect, useRef } from 'react';

const hero = 'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/02-level-06-divided-field.png';
const atlas = 'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/01-campaign-map.png';
const mirror = 'https://raw.githubusercontent.com/emfau88/hexwars/main/docs/portal/kongregate/03-level-09-mirror.png';

export function HexfrontCaseStudy({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  return (
    <article className="case-study" role="dialog" aria-modal="true" aria-labelledby="hexfront-title" data-testid="hexfront-case-study">
      <section className="case-hero">
        <img src={hero} alt="HEXFRONT — Split Field battle" />
        <div className="case-topbar"><span><b>EMFAU</b> / Selected work / 01</span><button ref={closeRef} type="button" onClick={onClose}>Close ×</button></div>
        <div className="case-hero-copy"><div><div className="case-kicker">Real-time tactics / browser game / 2026</div><h1 id="hexfront-title">HEXFRONT</h1></div><p>Expand. Distribute. Capture. A compact tactics game designed around readable pressure on a hex battlefield.</p></div>
      </section>
      <main>
        <section className="case-intro"><div><p className="case-lead">A small battlefield where every transfer changes the front.</p><p className="case-copy">HEXFRONT is a public playable vertical slice and browser-portal release candidate. The game compresses real-time territorial tactics into short missions that work with mouse or touch: grow forces, choose how much to commit, reinforce weak positions and break the opposing base.</p></div><div className="case-facts">{[
          ['Role', 'Game design / development / visual system'], ['Format', 'HTML5 browser game'], ['Campaign', '10 deterministic levels'], ['Input', 'Mouse / touch / fullscreen'], ['Language', 'English + German'], ['Status', 'Playable vertical slice'],
        ].map(([label, value]) => <div className="case-fact" key={label}><span>{label}</span><b>{value}</b></div>)}</div></section>
        <section className="case-media"><figure><img src={atlas} alt="HEXFRONT campaign atlas" /><figcaption><span>Campaign atlas</span><span>Mission selection / progression</span></figcaption></figure></section>
        <section className="case-duo"><figure><img src={hero} alt="HEXFRONT Split Field gameplay" /></figure><figure><img src={mirror} alt="HEXFRONT Three Passes gameplay" /></figure></section>
        <section className="case-statement"><div>Interaction / system</div><div><h2>Designed for decisions, not interface friction.</h2><p>Dragging from an owned field to a reachable target is the core verb. Partial sends preserve a reserve; later missions introduce full sends, grouped sends and manual reinforcement. Real-time AI, supply and visible endgame states build pressure without turning the interface into a control panel.</p></div></section>
        <footer className="case-footer"><h2>Play the<br /><span>current build.</span></h2><div><a className="primary" href="https://emfau88.github.io/hexwars/" target="_blank" rel="noopener noreferrer">Live project ↗</a><a href="https://github.com/emfau88/hexwars" target="_blank" rel="noopener noreferrer">GitHub ↗</a><button type="button" onClick={onClose}>Back to grid</button></div></footer>
      </main>
    </article>
  );
}
