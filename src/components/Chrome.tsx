import { useEffect, useState } from 'react';
import type { ProjectFilter } from '../data/projects';
import { filterLabels, projectsForFilter } from '../data/projects';
import { Brand } from './Brand';

export type Section = 'work' | 'about' | 'contact';

interface Props {
  activeIndex: number;
  filter: ProjectFilter;
  filterOpen: boolean;
  hidden: boolean;
  section: Section;
  onFilterChange: (filter: ProjectFilter) => void;
  onFilterToggle: () => void;
  onSectionChange: (section: Section) => void;
  onBrowseProjects: () => void;
}

const filters: ProjectFilter[] = ['ALL', 'GAME', 'APP', 'WEB'];

function BerlinClock() {
  const format = () => new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const interval = window.setInterval(() => setTime(format()), 30_000);
    return () => window.clearInterval(interval);
  }, []);
  return <b>{time}</b>;
}

export function Chrome(props: Props) {
  const total = projectsForFilter(props.filter).length;
  return (
    <>
      <button className="browse-skip" type="button" onClick={props.onBrowseProjects}>Browse projects</button>
      <header className={`chrome ${props.hidden ? 'is-hidden' : ''}`}>
        <div className="top">
          <Brand />
          <div className="top-center">
            <p className="top-statement">EMFAU IS AN INDEPENDENT CREATIVE DEVELOPER BUILDING{' '}
              <span>DISTINCTIVE WEBSITES, INTERACTIVE EXPERIENCES &amp; PLAYABLE WORLDS.</span>
            </p>
          </div>
          <div className="top-right">
            <div className="header-meta">
              <span>GERMANY, DE</span><BerlinClock />
              <span><i className="status-dot" />AVAILABLE</span><button className="selected-work-trigger" type="button" onClick={props.onBrowseProjects}>SELECTED WORK</button>
            </div>
            <button className="talk-btn" type="button" onClick={() => props.onSectionChange('contact')}>Let's talk</button>
          </div>
        </div>
      </header>
      <button className={`counter ${props.hidden ? 'is-hidden' : ''}`} type="button" onClick={props.onBrowseProjects} aria-label="Browse all projects" aria-live="polite">
        <b>{String(props.activeIndex + 1).padStart(2, '0')}</b><span> / {String(total).padStart(2, '0')}</span>
      </button>
      <nav className={`dock ${props.hidden ? 'is-hidden' : ''}`} aria-label="Primary navigation">
        {(['work', 'about', 'contact'] as Section[]).map((item) => (
          <button key={item} type="button" className={props.section === item ? 'active' : ''}
            aria-current={props.section === item ? 'page' : undefined} onClick={() => props.onSectionChange(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>
      <div className={`filter-wrap ${props.filterOpen ? 'open' : ''} ${props.hidden ? 'is-hidden' : ''}`}>
        <div className="filter-menu" role="group" aria-label="Filter projects">
          {filters.map((item) => (
            <button key={item} type="button" className={props.filter === item ? 'active' : ''}
              aria-pressed={props.filter === item} onClick={() => props.onFilterChange(item)}>
              {filterLabels[item]} · {String(projectsForFilter(item).length).padStart(2, '0')}
            </button>
          ))}
        </div>
        <button className={`filter-trigger ${props.filter !== 'ALL' ? 'filtered' : ''}`} type="button"
          aria-expanded={props.filterOpen} onClick={props.onFilterToggle}>
          {props.filter === 'ALL' ? 'Filter' : filterLabels[props.filter]} <span>{String(total).padStart(2, '0')}</span>
        </button>
      </div>
    </>
  );
}
