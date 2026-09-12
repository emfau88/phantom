import { useEffect, useRef } from 'react';
import type { Section } from './Chrome';

const content = {
  about: { kicker: 'About / EMFAU', title: 'Independent by design.', text: 'I build focused digital work across websites, interactive experiences and browser games — combining product thinking, visual systems and hands-on development in one process.', foot: 'Creative development / Germany / 2026' },
  contact: { kicker: 'Contact / New work', title: 'Build something worth noticing.', text: 'Available for selected website, interface and interactive projects. Final contact details and inquiry links can be connected here before release.', foot: 'Selected commissions / collaborations / 2026' },
};

export function SectionSheet({ section, onClose }: { section: Exclude<Section, 'work'>; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  const copy = content[section];
  return (
    <div className="sheet-layer" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="section-sheet" role="dialog" aria-modal="true" aria-labelledby="section-title">
        <div><div className="section-kicker">{copy.kicker}</div><h2 id="section-title">{copy.title}</h2><p>{copy.text}</p></div>
        <footer className="section-foot"><span>{copy.foot}</span><button ref={closeRef} type="button" onClick={onClose}>Close ×</button></footer>
      </section>
    </div>
  );
}
