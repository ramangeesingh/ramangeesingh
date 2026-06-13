const https = require('https');
const fs = require('fs');
const path = require('path');

const username = 'ramangeesingh';
const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'contribution-garden.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Fetching contributions for ${username}...`);

https.get(`https://github.com/users/${username}/contributions`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      parseAndGenerateSvg(data);
    } catch (err) {
      console.error('Error generating SVG:', err);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching contributions:', err);
  process.exit(1);
});

// ─── Seeded pseudo-random (deterministic per run) ─────────────────────────────
function makeRng(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

// ─── Cubic bezier helper ───────────────────────────────────────────────────────
function cubicPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 2] || pts[i - 1];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const cp1x = (p1.x + p2.x) / 2 - (p2.x - p0.x) * 0.18;
    const cp1y = (p1.y + p2.y) / 2 - (p2.y - p0.y) * 0.18;
    const cp2x = (p1.x + p2.x) / 2 + (p2.x - p0.x) * 0.18;
    const cp2y = (p1.y + p2.y) / 2 + (p2.y - p0.y) * 0.18;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function parseAndGenerateSvg(html) {
  // ── Parse contribution cells ────────────────────────────────────────────────
  const cellRegex = /<td[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
  const dateRegex = /data-date="([^"]+)"/;
  const levelRegex = /data-level="([^"]+)"/;

  const cells = [];
  let match;
  while ((match = cellRegex.exec(html)) !== null) {
    const cellHtml = match[0];
    const dateMatch = dateRegex.exec(cellHtml);
    const levelMatch = levelRegex.exec(cellHtml);
    if (dateMatch && levelMatch) {
      cells.push({ date: dateMatch[1], level: parseInt(levelMatch[1], 10) });
    }
  }

  if (cells.length === 0) {
    throw new Error('Failed to parse contribution calendar days from HTML');
  }

  cells.sort((a, b) => a.date.localeCompare(b.date));
  const minDate = new Date(cells[0].date + 'T00:00:00');

  const processedCells = cells.map(cell => {
    const d = new Date(cell.date + 'T00:00:00');
    const diffDays = Math.floor((d - minDate) / 86400000);
    const col = Math.floor(diffDays / 7);
    const row = d.getDay();
    return { ...cell, col, row, x: 35 + col * 13, y: 35 + row * 13 };
  });

  // Month labels
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthLabels = [];
  let lastMonth = -1;
  processedCells.forEach(cell => {
    const m = new Date(cell.date + 'T00:00:00').getMonth();
    if (m !== lastMonth && cell.row === 0) {
      monthLabels.push({ text: MONTHS[m], x: cell.x });
      lastMonth = m;
    }
  });

  // Active-cell map
  const activeCells = processedCells.filter(c => c.level > 0);

  // ── Heatmap grid HTML ───────────────────────────────────────────────────────
  const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  let cellsHtml = '';
  processedCells.forEach(cell => {
    const fill = LEVEL_COLORS[cell.level] || LEVEL_COLORS[0];
    cellsHtml += `  <rect x="${cell.x - 5}" y="${cell.y - 5}" width="10" height="10" rx="2" fill="${fill}" class="grid-cell" />\n`;
  });

  // ── Build backbone vine path ────────────────────────────────────────────────
  const rng = makeRng(42);

  // Compute per-column average Y of active cells; fill gaps by interpolation
  const colMap = {};
  activeCells.forEach(c => {
    if (!colMap[c.col]) colMap[c.col] = [];
    colMap[c.col].push(c);
  });

  const maxCol = processedCells.reduce((m, c) => Math.max(m, c.col), 0);

  // Anchor points: every ~4 columns, pick avg Y of active cells (or center if none)
  const anchorStep = 4;
  const anchorPts = [];
  for (let col = 0; col <= maxCol; col += anchorStep) {
    const x = 35 + col * 13;
    let y;
    if (colMap[col] && colMap[col].length > 0) {
      y = colMap[col].reduce((s, c) => s + c.y, 0) / colMap[col].length;
    } else {
      // Interpolate from neighbours
      let prevCol = col - 1, nextCol = col + 1;
      while (prevCol >= 0 && !colMap[prevCol]) prevCol--;
      while (nextCol <= maxCol && !colMap[nextCol]) nextCol++;
      const prevY = prevCol >= 0 && colMap[prevCol]
        ? colMap[prevCol].reduce((s, c) => s + c.y, 0) / colMap[prevCol].length
        : 70;
      const nextY = nextCol <= maxCol && colMap[nextCol]
        ? colMap[nextCol].reduce((s, c) => s + c.y, 0) / colMap[nextCol].length
        : 70;
      y = (prevY + nextY) / 2;
    }
    // Add gentle organic undulation
    y += (rng() - 0.5) * 14;
    y = Math.max(32, Math.min(118, y));
    anchorPts.push({ x, y });
  }

  const backboneD = cubicPath(anchorPts);

  // ── Branches: short offshoots from the vine toward active clusters ──────────
  // Pick up to 8 prominent active columns (level >= 2, spaced apart)
  const prominentCols = [];
  const sortedActiveCols = [...new Set(activeCells.filter(c => c.level >= 2).map(c => c.col))].sort((a, b) => a - b);
  let lastPickedCol = -20;
  sortedActiveCols.forEach(col => {
    if (col - lastPickedCol >= 5) {
      prominentCols.push(col);
      lastPickedCol = col;
    }
  });
  const branchCols = prominentCols.slice(0, 8);

  let branchesHtml = '';
  branchCols.forEach((col, bi) => {
    const cells = colMap[col] || [];
    // Find the lowest and highest active cell in this column
    const sortedY = cells.map(c => c.y).sort((a, b) => a - b);
    const topY = sortedY[0] || 70;
    const botY = sortedY[sortedY.length - 1] || 70;

    const bx = 35 + col * 13;
    // Vine baseline Y at this x (approximate from anchor pts)
    const nearAnchor = anchorPts.reduce((best, p) => Math.abs(p.x - bx) < Math.abs(best.x - bx) ? p : best, anchorPts[0]);
    const vineY = nearAnchor.y;

    // Upward branch
    if (topY < vineY - 6) {
      const midX = bx + (rng() - 0.5) * 8;
      const midY = (topY + vineY) / 2 + (rng() - 0.5) * 10;
      const bD = `M ${bx.toFixed(1)} ${vineY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)}, ${bx.toFixed(1)} ${(topY + 4).toFixed(1)}`;
      branchesHtml += `  <path d="${bD}" fill="none" stroke="url(#vine-grad)" stroke-width="${(1.2 + rng() * 0.6).toFixed(1)}" stroke-linecap="round" opacity="0.82" />\n`;
    }
    // Downward branch
    if (botY > vineY + 6) {
      const midX = bx + (rng() - 0.5) * 8;
      const midY = (botY + vineY) / 2 + (rng() - 0.5) * 10;
      const bD = `M ${bx.toFixed(1)} ${vineY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)}, ${bx.toFixed(1)} ${(botY - 4).toFixed(1)}`;
      branchesHtml += `  <path d="${bD}" fill="none" stroke="url(#vine-grad)" stroke-width="${(1.0 + rng() * 0.5).toFixed(1)}" stroke-linecap="round" opacity="0.75" />\n`;
    }
  });

  // ── Leaves along the vine ───────────────────────────────────────────────────
  // Sample ~30 positions along the backbone
  let leavesHtml = '';
  const numLeaves = 30;
  anchorPts.forEach((pt, idx) => {
    if (idx === 0) return;
    const prev = anchorPts[idx - 1];
    const steps = Math.ceil((pt.x - prev.x) / 13);
    for (let s = 0; s < steps; s++) {
      if (rng() > 0.55) continue;
      const t = s / steps;
      const lx = prev.x + (pt.x - prev.x) * t;
      const ly = prev.y + (pt.y - prev.y) * t;
      const side = rng() > 0.5 ? 1 : -1;
      const angle = -30 + rng() * 60;
      const leafSize = 3.5 + rng() * 3;
      const leafId = `leaf-${idx}-${s}`;
      const swayDur = (2.5 + rng() * 2.0).toFixed(1);
      const swayDel = (rng() * 3.0).toFixed(1);
      const swayAmp = side * (8 + rng() * 8);
      leavesHtml += `  <ellipse id="${leafId}" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="${leafSize.toFixed(1)}" ry="${(leafSize * 0.42).toFixed(1)}" fill="url(#leaf-grad)" opacity="0.88" transform="rotate(${(angle + side * 35).toFixed(0)} ${lx.toFixed(1)} ${ly.toFixed(1)})" style="animation: leaf-sway-${side > 0 ? 'r' : 'l'} ${swayDur}s ease-in-out ${swayDel}s infinite; transform-origin: ${lx.toFixed(1)}px ${ly.toFixed(1)}px;" />\n`;
    }
  });

  // ── Flowers at active contribution clusters ─────────────────────────────────
  const FLOWER_COLORS = [
    ['#ffb7d5','#ff4d94'],   // hot pink
    ['#e8d7ff','#c084fc'],   // lavender
    ['#dda0dd','#a855f7'],   // purple
    ['#fcd5f0','#e879c0'],   // magenta-pink
    ['#f9d5ff','#d946ef'],   // fuchsia
  ];

  let flowersHtml = '';
  // Large blossoms at high-activity clusters (level >= 3)
  const highCols = branchCols.filter(col => (colMap[col]||[]).some(c => c.level >= 3));
  highCols.slice(0, 6).forEach((col, fi) => {
    const cells = colMap[col] || [];
    const topCell = cells.reduce((best, c) => c.level > best.level ? c : best, cells[0]);
    const fx = topCell.x;
    const fy = topCell.y - 7;
    const [inner, outer] = FLOWER_COLORS[fi % FLOWER_COLORS.length];
    const bloomDur = (2.0 + rng() * 1.5).toFixed(1);
    const bloomDel = (rng() * 4.0).toFixed(1);
    const flId = `fl-${fi}`;
    // 5-petal flower as overlapping ellipses rotated around center
    for (let p = 0; p < 5; p++) {
      const ang = p * 72;
      flowersHtml += `  <ellipse cx="${fx.toFixed(1)}" cy="${(fy - 3.5).toFixed(1)}" rx="3.2" ry="1.8" fill="${outer}" opacity="0.82" transform="rotate(${ang} ${fx.toFixed(1)} ${fy.toFixed(1)})" style="animation: petal-bloom ${bloomDur}s ease-in-out ${bloomDel}s infinite; transform-origin: ${fx.toFixed(1)}px ${fy.toFixed(1)}px;" />\n`;
    }
    // Center
    flowersHtml += `  <circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="2.2" fill="${inner}" opacity="0.95" style="animation: center-glow ${bloomDur}s ease-in-out ${bloomDel}s infinite; transform-origin: ${fx.toFixed(1)}px ${fy.toFixed(1)}px;" />\n`;
  });

  // Smaller buds at medium-activity areas (level 1-2)
  const medCols = branchCols.filter(col => !(highCols.includes(col)));
  medCols.slice(0, 8).forEach((col, bi) => {
    const cells = colMap[col] || [];
    const topCell = cells[0] || { x: 35 + col * 13, y: 70 };
    const bx = topCell.x;
    const by = topCell.y - 5;
    const [inner, outer] = FLOWER_COLORS[(bi + 2) % FLOWER_COLORS.length];
    const budDur = (3.0 + rng() * 2.0).toFixed(1);
    const budDel = (rng() * 5.0).toFixed(1);
    for (let p = 0; p < 4; p++) {
      const ang = p * 90 + 45;
      flowersHtml += `  <ellipse cx="${bx.toFixed(1)}" cy="${(by - 2.5).toFixed(1)}" rx="2.0" ry="1.2" fill="${outer}" opacity="0.72" transform="rotate(${ang} ${bx.toFixed(1)} ${by.toFixed(1)})" style="animation: petal-bloom ${budDur}s ease-in-out ${budDel}s infinite; transform-origin: ${bx.toFixed(1)}px ${by.toFixed(1)}px;" />\n`;
    }
    flowersHtml += `  <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="1.6" fill="${inner}" opacity="0.88" />\n`;
  });

  // ── Fireflies ───────────────────────────────────────────────────────────────
  let firefliesHtml = '';
  const numFireflies = 18;
  for (let i = 0; i < numFireflies; i++) {
    const fx = 30 + rng() * 700;
    const fy = 28 + rng() * 95;
    const fr = (0.7 + rng() * 1.1).toFixed(1);
    const fdx = ((rng() - 0.5) * 22).toFixed(1);
    const fdy = ((rng() - 0.5) * 18).toFixed(1);
    const fdur = (3.5 + rng() * 3.5).toFixed(1);
    const fdel = (rng() * 6.0).toFixed(1);
    firefliesHtml += `  <circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${fr}" fill="#ffe066" opacity="0" style="animation: firefly ${fdur}s ease-in-out ${fdel}s infinite; --dx:${fdx}px; --dy:${fdy}px;" />\n`;
  }

  // ── Falling petals ──────────────────────────────────────────────────────────
  let petalsHtml = '';
  const numPetals = 14;
  for (let i = 0; i < numPetals; i++) {
    const px = 30 + rng() * 700;
    const py = 25 + rng() * 30;
    const pColor = ['#ffb7d5','#e8d7ff','#dda0dd','#f9d5ff'][Math.floor(rng() * 4)];
    const pdx = ((rng() - 0.5) * 30).toFixed(1);
    const prot = Math.floor(rng() * 360);
    const pdur = (5.0 + rng() * 4.0).toFixed(1);
    const pdel = (rng() * 9.0).toFixed(1);
    petalsHtml += `  <path d="M ${px.toFixed(1)} ${py.toFixed(1)} c -2 -4, 2 -8, 4 -4 c 2 4, -2 8, -4 4" fill="${pColor}" opacity="0" style="animation: petal-fall ${pdur}s ease-in-out ${pdel}s infinite; --fdx:${pdx}px; --frot:${prot}deg; transform-origin:${px.toFixed(1)}px ${py.toFixed(1)}px;" />\n`;
  }

  // ── Sparkles ────────────────────────────────────────────────────────────────
  let sparklesHtml = '';
  const numSparkles = 12;
  for (let i = 0; i < numSparkles; i++) {
    const sx = 40 + rng() * 680;
    const sy = 32 + rng() * 90;
    const ss = (1.2 + rng() * 1.8).toFixed(1);
    const sdur = (1.5 + rng() * 2.5).toFixed(1);
    const sdel = (rng() * 6.0).toFixed(1);
    sparklesHtml += `  <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${ss}" fill="white" opacity="0" style="animation: sparkle ${sdur}s ease-in-out ${sdel}s infinite;" />\n`;
  }

  // ── Month and day labels ────────────────────────────────────────────────────
  let monthLabelsHtml = '';
  monthLabels.forEach(l => {
    monthLabelsHtml += `  <text x="${l.x}" y="22" class="label">${l.text}</text>\n`;
  });

  const dayLabelsHtml = `
    <text x="18" y="52" class="label" text-anchor="middle">M</text>
    <text x="18" y="78" class="label" text-anchor="middle">W</text>
    <text x="18" y="104" class="label" text-anchor="middle">F</text>
  `;

  // ── SVG assembly ─────────────────────────────────────────────────────────────
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 150" width="100%" height="150">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#0a0e15" />
    </linearGradient>

    <!-- Vine gradient (emerald) -->
    <linearGradient id="vine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="60%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#16a34a" />
    </linearGradient>

    <!-- Leaf gradient (forest green) -->
    <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac" />
      <stop offset="100%" stop-color="#16a34a" />
    </linearGradient>

    <!-- Vine glow filter -->
    <filter id="vine-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="1.8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Flower glow filter -->
    <filter id="flower-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Firefly glow filter -->
    <filter id="firefly-glow" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="2.0" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .bg { fill: url(#bg-grad); }
    .border { stroke: #21262d; stroke-width: 1.5; fill: none; }
    .label {
      fill: #8b949e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 9px;
      font-weight: 500;
    }
    .title {
      fill: #4ade80;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
    }
    .tagline {
      fill: #6ee7b7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 8px;
      font-style: italic;
      opacity: 0.75;
    }
    .grid-cell {
      stroke: #0d1117;
      stroke-width: 0.5;
      opacity: 0.85;
    }

    /* Backbone vine pulse */
    @keyframes vine-pulse {
      0%, 100% { opacity: 0.78; stroke-width: 1.8px; }
      50% { opacity: 1; stroke-width: 2.2px; }
    }

    /* Leaf gentle sway */
    @keyframes leaf-sway-r {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(12deg); }
    }
    @keyframes leaf-sway-l {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-12deg); }
    }

    /* Petal bloom (scale pulse) */
    @keyframes petal-bloom {
      0%, 100% { transform: scale(1); opacity: 0.82; }
      50% { transform: scale(1.12); opacity: 1; }
    }

    /* Center glow */
    @keyframes center-glow {
      0%, 100% { r: 2.2; opacity: 0.95; }
      50% { r: 2.8; opacity: 1; }
    }

    /* Firefly float + fade */
    @keyframes firefly {
      0%, 100% { transform: translate(0, 0); opacity: 0; }
      20% { opacity: 0.9; }
      50% { transform: translate(var(--dx), var(--dy)); opacity: 0.6; }
      80% { opacity: 0.9; }
    }

    /* Falling petal */
    @keyframes petal-fall {
      0% { transform: translate(0, -8px) rotate(0deg); opacity: 0; }
      10% { opacity: 0.75; }
      85% { opacity: 0.75; }
      95% { transform: translate(var(--fdx), 55px) rotate(var(--frot)); opacity: 0; }
      100% { transform: translate(var(--fdx), 55px) rotate(var(--frot)); opacity: 0; }
    }

    /* Sparkle twinkle */
    @keyframes sparkle {
      0%, 100% { transform: scale(0); opacity: 0; }
      40% { transform: scale(1.4); opacity: 0.9; }
      60% { transform: scale(0.8); opacity: 0.6; }
    }
  </style>

  <!-- Card Background -->
  <rect width="760" height="150" rx="12" class="bg" />
  <rect width="758.5" height="148.5" x="0.75" y="0.75" rx="11.25" class="border" />

  <!-- Header -->
  <text x="35" y="14" class="title">🌿 CONTRIBUTION GARDEN</text>
  <text x="200" y="14" class="tagline">"Every commit seeds a new bloom."</text>

  <!-- Month and Day Labels -->
${monthLabelsHtml}${dayLabelsHtml}

  <!-- ── Contribution Heatmap (always visible, always on bottom) ── -->
${cellsHtml}

  <!-- ── Vine Branches (offshoots) ── -->
${branchesHtml}

  <!-- ── Backbone Vine ── -->
  <path d="${backboneD}" fill="none" stroke="url(#vine-grad)" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" filter="url(#vine-glow)" style="animation: vine-pulse 3.5s ease-in-out infinite;" />

  <!-- ── Leaves ── -->
${leavesHtml}

  <!-- ── Flowers ── -->
  <g filter="url(#flower-glow)">
${flowersHtml}  </g>

  <!-- ── Fireflies ── -->
  <g filter="url(#firefly-glow)">
${firefliesHtml}  </g>

  <!-- ── Falling Petals ── -->
${petalsHtml}

  <!-- ── Sparkles ── -->
${sparklesHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Contribution Garden SVG at ${outputPath}!`);
}
