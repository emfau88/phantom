import { describe, expect, it } from 'vitest';
import { projects, projectsForFilter } from '../src/data/projects';
import { caseStudies, hasCaseStudy } from '../src/data/caseStudies';

describe('project data', () => {
  it('contains the verified project set after removing the nonexistent entry', () => {
    expect(projects).toHaveLength(20);
    expect(projectsForFilter('GAME')).toHaveLength(13);
    expect(projectsForFilter('APP')).toHaveLength(6);
    expect(projectsForFilter('WEB')).toHaveLength(1);
  });

  it('has stable unique ids and valid years', () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
    expect(projects.every((project) => Number.isInteger(project.year))).toBe(true);
  });

  it('provides a complete premium case study for every project', () => {
    expect(Object.keys(caseStudies)).toHaveLength(projects.length);
    expect(projects.every((project) => hasCaseStudy(project.id))).toBe(true);
    expect(projects.every((project) => caseStudies[project.id as keyof typeof caseStudies].pillars.length === 3)).toBe(true);
  });
});
