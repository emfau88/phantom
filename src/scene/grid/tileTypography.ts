import type { Project } from '../../data/projects';

export const tileTypography = {
  titleSize: 80, titleLineHeight: 84, secondarySize: 38,
  captionTop: 644, captionHeight: 256, captionScale: 2,
  textWidth: 708, secondaryY: 850,
} as const;

export function titleLines(title: string, measure: (text: string) => number, width: number = tileTypography.textWidth): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= width) { line = candidate; continue; }
    if (line) { lines.push(line); line = ''; }
    // Keep long individual names readable without Canvas fillText's squeezing.
    for (const character of word) {
      const next = line + character;
      if (measure(next) > width && line) { lines.push(line); line = ''; }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function secondaryLabel(project: Pick<Project, 'category' | 'tags'>): string {
  const category = { GAME: 'Game', APP: 'App', WEB: 'Web' }[project.category];
  const technology = project.tags.find((tag) => ['HTML5', 'Phaser', 'Canvas', 'Flutter', 'Android', 'React Native'].includes(tag));
  const detail = technology ?? project.tags[0];
  return detail ? `${category} · ${detail}` : category;
}
