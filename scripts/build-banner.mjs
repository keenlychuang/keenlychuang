import { mkdir, writeFile } from 'node:fs/promises';

// Notebook theme shared with the personal website prototype.
// Run: node scripts/build-banner.mjs (no dependencies).
const themes = {
  light: { paper: '#fbfcfc', ink: '#23313a', muted: '#596b76', line: '#d5dfe4', link: '#235f85' },
  dark: { paper: '#171c20', ink: '#e0e8ee', muted: '#a1afb9', line: '#35434d', link: '#9accea' },
};
const assets = new URL('../assets/', import.meta.url);
await mkdir(assets, { recursive: true });
const number = value => value.toFixed(2);

// Orthographic projection of a curved sheet. Height and depth both affect the
// screen position; the initial cloud occupies a volume around the same sheet.
function surface(mobile, ink) {
  const columns = 13, rows = 11;
  const center = mobile ? [240, 236] : [739, 130];
  const frame = mobile ? [370, 170] : [254, 146];
  let seed = 23823;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const project = (u, v, z) => [(u - v) * .73, (u + v) * .32 - z * .95];
  const vertices = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const u = col / (columns - 1) * 2 - 1;
      const v = row / (rows - 1) * 2 - 1;
      const z = .43 * (u * u - v * v) + .22 * Math.sin(2.2 * u + .5) * Math.cos(1.8 * v);
      vertices.push({
        final: project(u, v, z),
        start: project(random() * 2 - 1, random() * 2 - 1, random() * 1.4 - .7),
        depth: u + v,
        delay: random() * .18,
      });
    }
  }
  const all = vertices.flatMap(v => [v.final, v.start]);
  const bounds = [0, 1].map(axis => [Math.min(...all.map(v => v[axis])), Math.max(...all.map(v => v[axis]))]);
  const scale = Math.min(...frame.map((size, axis) => size / (bounds[axis][1] - bounds[axis][0])));
  const screen = position => position.map((value, axis) => center[axis] + (value - (bounds[axis][0] + bounds[axis][1]) / 2) * scale);
  const points = vertices.map(v => ({ ...v, final: screen(v.final), start: screen(v.start) }));
  const at = (row, col) => points[row * columns + col].final;
  const coordinate = p => p.map(number).join(' ');
  const wire = list => `<path d="${list.map((p, i) => `${i ? 'L' : 'M'}${coordinate(p)}`).join('')}"/>`;
  const wires = [];
  for (let row = 0; row < rows; row++) wires.push(wire(Array.from({ length: columns }, (_, col) => at(row, col))));
  for (let col = 0; col < columns; col++) wires.push(wire(Array.from({ length: rows }, (_, row) => at(row, col))));
  const faces = [];
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < columns - 1; col++) {
      // Quiet tonal changes let the curved sheet read as a surface, while
      // the crossing grid and depth-weighted points describe its geometry.
      const alpha = .025 + .035 * (row / (rows - 1)) + .018 * (col / (columns - 1));
      faces.push(`<path d="M${[at(row,col),at(row,col+1),at(row+1,col+1),at(row+1,col)].map(coordinate).join('L')}Z" fill-opacity="${alpha.toFixed(3)}"/>`);
    }
  }
  const dots = [...points].sort((a, b) => a.depth - b.depth).map(v => {
    const alpha = .48 + (v.depth + 2) / 4 * .45;
    return `<circle class="point" cx="${number(v.final[0])}" cy="${number(v.final[1])}" r="${number(1.05 + (v.depth + 2) / 4 * .55)}" style="--dx:${number(v.start[0]-v.final[0])}px;--dy:${number(v.start[1]-v.final[1])}px;--alpha:${alpha.toFixed(2)};--delay:${v.delay.toFixed(2)}s;opacity:${alpha.toFixed(2)}"/>`;
  });
  return `<g id="surface" fill="${ink}" stroke-linejoin="round"><g class="sheet">${faces.join('')}</g><g class="mesh" fill="none" stroke="${ink}" stroke-width=".65" opacity=".42">${wires.join('')}</g>${dots.join('')}</g>`;
}

function banner(theme, mobile) {
  const p = themes[theme], w = mobile ? 480 : 900, h = mobile ? 336 : 260;
  const tx = mobile ? 28 : 230;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">Keenly S. Chuang</title>
<desc id="desc">Working with data and intelligent systems. Scattered particles converge into a three-dimensional curved surface. Motion settles within four seconds; reduced-motion preferences show the finished surface immediately.</desc>
<style>
text{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.ink}}
.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.muted{fill:${p.muted}}
.point{animation:settle 3.2s var(--delay) both cubic-bezier(.22,.7,.25,1)}
@keyframes settle{0%,8%{transform:translate(var(--dx),var(--dy));opacity:.2}100%{transform:translate(0,0);opacity:var(--alpha)}}
.sheet{animation:sheet 3.5s both}@keyframes sheet{0%,48%{opacity:0}100%{opacity:1}}
.mesh{animation:mesh 3.5s both}@keyframes mesh{0%,48%{opacity:0}100%{opacity:.42}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="${w}" height="${h}" fill="${p.paper}"/>
${mobile ? `<text class="mono" x="28" y="39" font-size="18" font-weight="500" letter-spacing="-.7">Keenly S. Chuang</text><path d="M28 59H452" stroke="${p.line}"/>` :
`<path d="M193 29V232" stroke="${p.line}"/><g id="sidebar-copy" transform="translate(0 17)"><text class="mono" x="30" y="51" font-size="20" font-weight="500" letter-spacing="-.8">Keenly S.<tspan x="30" dy="29">Chuang</tspan></text><text class="mono muted" x="30" y="135" font-size="12">Engineering<tspan x="30" dy="27">Reading</tspan><tspan x="30" dy="27">Exploring</tspan></text></g>`}
<g id="main-copy"><text x="${tx}" y="${mobile ? 109 : 88}" font-size="${mobile ? 16 : 17}" font-weight="500">I work with data and intelligent systems.</text>
<text class="mono muted" x="${tx}" y="${mobile ? 141 : 135}" font-size="12">software &amp; data${mobile ? '' : `<tspan x="${tx}" dy="26">probabilistic computing</tspan><tspan x="${tx}" dy="26">AI interpretability</tspan>`}</text></g>
${surface(mobile, p.link)}
</svg>\n`;
}

for (const theme of Object.keys(themes)) {
  for (const mobile of [false, true]) {
    const name = `intro-${mobile ? 'mobile-' : ''}${theme}.svg`;
    const svg = banner(theme, mobile);
    await writeFile(new URL(name, assets), svg);
    console.log(`${name}: ${Buffer.byteLength(svg)} bytes`);
  }
}
