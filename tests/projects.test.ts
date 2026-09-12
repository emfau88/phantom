import { describe, expect, it } from 'vitest';
import { projects, projectsForFilter } from '../src/data/projects';

describe('project data', () => {
  it('preserves the V16 project set and category counts', () => {
    expect(projects).toHaveLength(21);
    expect(projectsForFilter('GAME')).toHaveLength(13);
    expect(projectsForFilter('APP')).toHaveLength(6);
    expect(projectsForFilter('WEB')).toHaveLength(2);
  });

  it('has stable unique ids and valid years', () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
    expect(projects.every((project) => Number.isInteger(project.year))).toBe(true);
  });
});
