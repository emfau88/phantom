import { expect, test } from '@playwright/test';
import { secondaryLabel, tileTypography, titleLines } from '../../src/scene/grid/tileTypography';

test('every project caption fits at full size without squeezing or overlapping', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Typography layout is shared across devices.');
  await page.goto('/');
  const projects = await page.evaluate(async () => {
    const source = new URL('src/data/projects.ts', document.baseURI).href;
    const catalogue = await import(source);
    return catalogue.projects as Array<{ title: string; category: 'GAME' | 'APP' | 'WEB'; tags: string[] }>;
  });
  const widths = await page.evaluate(async ({ titles, subtitles, titleSize, subtitleSize }) => {
    await document.fonts.ready;
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `700 ${titleSize}px Manrope, Arial, sans-serif`;
    const measurements: Record<string, number> = {};
    for (const title of titles) {
      // All substrings cover the greedy wrap candidates and word splitting.
      for (let start = 0; start < title.length; start++) {
        for (let end = start + 1; end <= title.length; end++) {
          const text = title.slice(start, end);
          measurements[text] = context.measureText(text).width;
        }
      }
    }
    context.font = `550 ${subtitleSize}px Manrope, Arial, sans-serif`;
    return { titles: measurements, subtitles: subtitles.map((text) => context.measureText(text).width) };
  }, { titles: projects.map((p) => p.title), subtitles: projects.map(secondaryLabel), titleSize: tileTypography.titleSize, subtitleSize: tileTypography.secondarySize });
  for (const [index, project] of projects.entries()) {
    const lines = titleLines(project.title, (text) => widths.titles[text] ?? 0);
    expect(lines.length, project.title).toBeLessThanOrEqual(2);
    for (const line of lines) expect(widths.titles[line], project.title).toBeLessThanOrEqual(tileTypography.textWidth);
    expect(widths.subtitles[index], project.title).toBeLessThan(636);
  }
});
