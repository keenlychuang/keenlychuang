import { mkdir, writeFile } from 'node:fs/promises';

// Notebook theme shared with the personal website prototype.
// Run: node scripts/build-banner.mjs (no dependencies).
const themes = {
  light: {paper:'#fbfcfc',ink:'#23313a',muted:'#596b76',line:'#d5dfe4',link:'#235f85',wash:'#edf3f6'},
  dark: {paper:'#171c20',ink:'#e0e8ee',muted:'#a1afb9',line:'#35434d',link:'#9accea',wash:'#202a31'},
};
const assets = new URL('../assets/', import.meta.url);
await mkdir(assets, { recursive: true });
function banner(theme,mobile){
  const p=themes[theme], w=mobile?480:900, h=mobile?400:300;
  const tx=mobile?28:230, dy=mobile?244:167, dx=mobile?41:636, dw=mobile?398:206, dh=mobile?99:77;
  const nodes=[], rules=[], lines=[];
  // A sketch that retains the original diffusion idea, in the website's blue ink.
  for(let i=0;i<24;i++){
    const t=i/23, x=dx+dw*t, y=dy+dh/2-Math.sin(t*Math.PI*2)*dh*.35;
    const sx=dx+((i*71+33)%dw), sy=dy+((i*43+21)%dh);
    rules.push(`@keyframes n${i}{0%,8%{transform:translate(${(sx-x).toFixed(1)}px,${(sy-y).toFixed(1)}px);opacity:.35}72%,100%{transform:translate(0,0);opacity:1}}`);
    nodes.push(`<circle class="point" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.1" fill="${p.link}" style="animation:n${i} 2.7s ${(i*.007).toFixed(3)}s both cubic-bezier(.22,.7,.25,1)"/>`);
    lines.push(`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">Keenly S. Chuang — An engineer’s notebook</title>
<desc id="desc">A companion to the Notebook website: quiet blue ink, monospaced labels, and a small particle sketch that resolves into a signal. Motion finishes within three seconds.</desc>
<style>text{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${p.ink}}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.label{font-size:10px;letter-spacing:.8px;fill:${p.muted}}.muted{fill:${p.muted}}${rules.join('')}.connection{animation:connect 2.7s both;stroke-dasharray:1}@keyframes connect{0%,45%{stroke-dashoffset:1;opacity:0}100%{stroke-dashoffset:0;opacity:.65}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>
<rect width="${w}" height="${h}" fill="${p.paper}"/>
${mobile?`<text class="mono" x="28" y="39" font-size="18" font-weight="500" letter-spacing="-.7">Keenly S. Chuang</text><path d="M28 59H452" stroke="${p.line}"/>`:
`<path d="M193 29V272" stroke="${p.line}"/><text class="mono" x="30" y="51" font-size="20" font-weight="500" letter-spacing="-.8">Keenly S.<tspan x="30" dy="29">Chuang</tspan></text><text class="mono muted" x="30" y="135" font-size="12">Engineering<tspan x="30" dy="27">Reading</tspan><tspan x="30" dy="27">Exploring</tspan></text><text class="mono muted" x="30" y="270" font-size="10">@keenlychuang</text>`}
<text class="mono label" x="${tx}" y="${mobile?89:44}">AN ENGINEER’S NOTEBOOK</text>
<text x="${tx-2}" y="${mobile?139:101}" font-size="${mobile?36:43}" font-weight="500" letter-spacing="-1.7">Curious human.</text>
<text x="${tx}" y="${mobile?176:139}" font-size="${mobile?16:17}">I work with data and intelligent systems.</text>
<text class="mono muted" x="${tx}" y="${mobile?207:188}" font-size="12">software &amp; data${mobile?'':`<tspan x="${tx}" dy="26">probabilistic computing</tspan><tspan x="${tx}" dy="26">AI interpretability</tspan>`}</text>
<path d="M${dx} ${dy+dh/2}h${dw}" stroke="${p.line}" stroke-width=".7"/>
<path class="connection" d="${lines.join(' ')}" pathLength="1" fill="none" stroke="${p.link}" stroke-width=".8" opacity=".65"/>
${nodes.join('')}
<text class="mono label" x="${dx}" y="${dy+dh+17}" style="font-size:9px">FIG. 01 / FINDING THE SIGNAL</text>
<path d="M${tx} ${h-28}H${w-30}" stroke="${p.line}"/>
<text class="mono label" x="${tx}" y="${h-10}" style="font-size:9px">BUILDING · LEARNING · EXPLORING</text>
</svg>`;
}
for(const theme of Object.keys(themes))for(const mobile of [false,true]){
  const name=`intro-${mobile?'mobile-':''}${theme}.svg`;
  const svg=banner(theme,mobile);
  await writeFile(new URL(name,assets),svg);
  console.log(name+': '+Buffer.byteLength(svg)+' bytes');
}
