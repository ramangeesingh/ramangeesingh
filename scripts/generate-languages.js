const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'most-used-languages.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Languages data
const languages = [
  { name: 'Dart & Flutter', percentage: 40.5, color: '#ff63b1', badge: '#3d1b54' },
  { name: 'JavaScript', percentage: 32.8, color: '#c060d0', badge: '#2a1044' },
  { name: 'C++', percentage: 15.2, color: '#ff80bf', badge: '#1a0c30' },
  { name: 'Python', percentage: 11.5, color: '#8a2be2', badge: '#150a28' }
];

function star(x, y, size) {
  return `<path d="M ${x} ${y - size} Q ${x} ${y} ${x + size} ${y} Q ${x} ${y} ${x} ${y + size} Q ${x} ${y} ${x - size} ${y} Q ${x} ${y} ${x} ${y - size} Z" fill="#ffb7d5" opacity="0.6"/>`;
}

function dot(x, y, r, color, opacity) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
}

function generateSvg() {
  const W = 760;
  const H = 210;
  const barX = 48;
  const barW = W - 96;
  const barY = 90;
  const barH = 14;

  // ── Distribution bar segments ──────────────────────────────────────────────
  let currentX = barX;
  let barSegments = '';
  languages.forEach((lang, i) => {
    const segW = (barW * lang.percentage) / 100;
    const isFirst = i === 0;
    const isLast = i === languages.length - 1;
    // Use a clipPath trick: full rounded rect for first & last
    if (isFirst) {
      barSegments += `<rect x="${currentX.toFixed(2)}" y="${barY}" width="${segW.toFixed(2)}" height="${barH}" rx="7" ry="7" fill="${lang.color}"/>\n`;
      // Mask the right rounded corners of the first segment
      barSegments += `<rect x="${(currentX + segW - 7).toFixed(2)}" y="${barY}" width="7" height="${barH}" fill="${lang.color}"/>\n`;
    } else if (isLast) {
      barSegments += `<rect x="${currentX.toFixed(2)}" y="${barY}" width="${segW.toFixed(2)}" height="${barH}" rx="7" ry="7" fill="${lang.color}"/>\n`;
      // Mask the left rounded corners of the last segment
      barSegments += `<rect x="${currentX.toFixed(2)}" y="${barY}" width="7" height="${barH}" fill="${lang.color}"/>\n`;
    } else {
      barSegments += `<rect x="${currentX.toFixed(2)}" y="${barY}" width="${segW.toFixed(2)}" height="${barH}" fill="${lang.color}"/>\n`;
    }
    currentX += segW;
  });

  // ── Per-language mini indicator bars (stacked labels below) ───────────────
  let labelsHtml = '';
  const colW = Math.floor(barW / languages.length);
  languages.forEach((lang, i) => {
    // badge pill
    const bx = barX + i * colW;
    const bw = colW - 12;
    const by = 125;
    labelsHtml += `
    <g class="lang-group">
      <!-- pill badge -->
      <rect x="${bx}" y="${by}" width="${bw}" height="22" rx="11" fill="${lang.badge}" stroke="${lang.color}" stroke-width="1" stroke-opacity="0.5"/>
      <!-- dot -->
      <circle cx="${bx + 12}" cy="${by + 11}" r="4" fill="${lang.color}" filter="url(#dot-glow)"/>
      <!-- name -->
      <text x="${bx + 22}" y="${by + 15}" class="lang-name">${lang.name.replace(/&/g, '&amp;')}</text>
      <!-- percentage label -->
      <text x="${bx + bw - 8}" y="${by + 15}" class="lang-pct">${lang.percentage.toFixed(1)}%</text>
    </g>`;

    // mini vertical constellation line from bar to badge
    const lineX = (bx + bx + bw) / 2;
    labelsHtml += `<line x1="${lineX}" y1="${barY + barH + 1}" x2="${lineX}" y2="${by}" stroke="${lang.color}" stroke-width="0.7" stroke-opacity="0.22" stroke-dasharray="2 3"/>`;
  });

  // ── Stars & sparkles ───────────────────────────────────────────────────────
  const decorations = [
    star(22, 28, 5),
    star(740, 25, 4),
    star(738, 185, 5),
    star(16, 190, 4),
    star(380, 18, 4),
    star(585, 185, 3),
    star(175, 185, 3),
    dot(700, 55, 1.5, '#ffb7d5', 0.5),
    dot(55,  155, 1.5, '#c060d0', 0.5),
    dot(310, 195, 1.2, '#ff80bf', 0.4),
    dot(450,  22, 1.2, '#8a2be2', 0.45),
  ].join('\n  ');

  // ── Constellation lines (decorative) ──────────────────────────────────────
  const constellations = `
  <line x1="22" y1="28"  x2="380" y2="18"  stroke="#ff63b1" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="380" y1="18" x2="740" y2="25"  stroke="#c060d0" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="16"  y1="190" x2="175" y2="185" stroke="#ff80bf" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="175" y1="185" x2="585" y2="185" stroke="#8a2be2" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="585" y1="185" x2="738" y2="185" stroke="#c060d0" stroke-width="0.4" stroke-opacity="0.12"/>`;

  // ── Floating cosmic particles ──────────────────────────────────────────────
  const particles = [
    [60,  68, 1.0, '#ff63b1', 0.35, 4.1, 1.2],
    [200, 82, 0.9, '#c060d0', 0.3,  5.2, 2.8],
    [430, 72, 1.1, '#ffb7d5', 0.4,  3.8, 0.5],
    [600, 65, 0.8, '#8a2be2', 0.3,  6.0, 3.5],
    [710, 78, 1.0, '#ff80bf', 0.35, 4.5, 1.8],
    [130, 170, 0.8, '#c060d0', 0.25, 5.5, 2.0],
    [520, 172, 1.0, '#ff63b1', 0.3,  4.0, 0.8],
  ].map(([x, y, r, color, op, dur, del]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}" style="animation: float-p ${dur}s ease-in-out ${del}s infinite alternate;"/>`
  ).join('\n  ');

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#090611"/>
      <stop offset="50%"  stop-color="#0f0920"/>
      <stop offset="100%" stop-color="#130b26"/>
    </linearGradient>
    <filter id="nebula" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="22" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="dot-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="title-glow" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="bar-shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <style>
    .lang-name {
      fill: #e0daf0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11.5px;
      font-weight: 500;
    }
    .lang-pct {
      fill: #a898c8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      text-anchor: end;
    }
    .section-title {
      fill: #ffb7d5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      letter-spacing: 1.4px;
    }
    .sub-label {
      fill: #7a6e99;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    @keyframes float-p {
      from { transform: translateY(0px);  opacity: 0.3; }
      to   { transform: translateY(-5px); opacity: 0.7; }
    }
  </style>

  <!-- Background -->
  <rect width="${W}" height="${H}" rx="14" fill="url(#bg)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13.25" fill="none" stroke="#ff80bf" stroke-width="1" stroke-opacity="0.28"/>

  <!-- Nebula clouds -->
  <circle cx="90"  cy="50"  r="70"  fill="#ff4d94" opacity="0.07" filter="url(#nebula)"/>
  <circle cx="${W - 90}" cy="${H - 50}" r="80" fill="#8a2be2" opacity="0.09" filter="url(#nebula)"/>
  <circle cx="${W / 2}" cy="${H / 2}" r="50" fill="#c060d0" opacity="0.04" filter="url(#nebula)"/>

  <!-- Constellation lines -->
  ${constellations}

  <!-- Stars and sparkles -->
  ${decorations}

  <!-- Floating particles -->
  ${particles}

  <!-- Title -->
  <text x="48" y="42" class="section-title" filter="url(#title-glow)">🌸  MOST USED LANGUAGES</text>
  <text x="48" y="58" class="sub-label">Technology distribution across all repositories</text>

  <!-- Bar track -->
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="7" fill="#1c1530"/>
  <!-- Bar segments -->
  ${barSegments}
  <!-- Bar shine overlay -->
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH / 2}" rx="7" fill="url(#bar-shine)"/>

  <!-- Language badges -->
  ${labelsHtml}

  <!-- Total label -->
  <text x="${W - 48}" y="${barY - 6}" class="sub-label" text-anchor="end">100% of activity</text>
</svg>`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Generated: ${outputPath}`);
}

generateSvg();
