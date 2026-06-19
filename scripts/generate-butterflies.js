const https = require('https');
const fs = require('fs');
const path = require('path');

const username = 'ramangeesingh';
const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'butterfly-migration.svg');

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

function parseAndGenerateSvg(html) {
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
      cells.push({
        date: dateMatch[1],
        level: parseInt(levelMatch[1], 10)
      });
    }
  }
  
  if (cells.length === 0) {
    throw new Error('Failed to parse contribution calendar days from HTML');
  }
  
  cells.sort((a, b) => a.date.localeCompare(b.date));
  const minDateStr = cells[0].date;
  const minDate = new Date(minDateStr + 'T00:00:00');
  
  const processedCells = cells.map(cell => {
    const currentDate = new Date(cell.date + 'T00:00:00');
    const diffTime = currentDate - minDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const col = Math.floor(diffDays / 7);
    const row = currentDate.getDay();
    
    return {
      ...cell,
      col,
      row,
      x: 35 + col * 13,
      y: 35 + row * 13
    };
  });
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels = [];
  let lastMonth = -1;
  processedCells.forEach(cell => {
    const date = new Date(cell.date + 'T00:00:00');
    const m = date.getMonth();
    if (m !== lastMonth && cell.row === 0) {
      monthLabels.push({
        text: months[m],
        x: cell.x
      });
      lastMonth = m;
    }
  });

  const cellMap = {};
  processedCells.forEach(c => {
    cellMap[`${c.col},${c.row}`] = c;
  });

  let activeCells = processedCells.filter(c => c.level > 0);
  
  if (activeCells.length === 0) {
    console.log('No active contributions found. Creating simulated butterfly migration...');
    const simulatedPairs = [[5,2], [5,3], [12,1], [12,2], [18,4], [18,5], [25,2], [26,2], [32,3], [40,2], [40,3], [41,3]];
    activeCells = simulatedPairs.map(([col, row], idx) => {
      const c = cellMap[`${col},${row}`] || { x: 35 + col * 13, y: 35 + row * 13 };
      return {
        ...c,
        date: 'simulated',
        level: (idx % 4) + 1,
        col,
        row
      };
    });
    activeCells.forEach(ac => {
      cellMap[`${ac.col},${ac.row}`] = ac;
    });
  }

  // ── Backbone Flight Path (gently curves through average coordinates of active cells) ───────────────────
  const colMap = {};
  activeCells.forEach(cell => {
    if (!colMap[cell.col]) {
      colMap[cell.col] = [];
    }
    colMap[cell.col].push(cell);
  });

  const sortedCols = Object.keys(colMap).map(Number).sort((a, b) => a - b);
  const backbonePoints = sortedCols.map(col => {
    const cells = colMap[col];
    const sumY = cells.reduce((sum, c) => sum + c.y, 0);
    const avgY = sumY / cells.length;
    return {
      col,
      x: 35 + col * 13,
      y: avgY
    };
  });

  // Calculate smooth bezier path
  let backboneD = '';
  let totalLength = 0;
  if (backbonePoints.length > 0) {
    backboneD = `M ${backbonePoints[0].x} ${backbonePoints[0].y}`;
    for (let i = 1; i < backbonePoints.length; i++) {
      const p1 = backbonePoints[i - 1];
      const p2 = backbonePoints[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
      
      const cp1x = p1.x + dx / 2;
      const cp1y = p1.y;
      const cp2x = p1.x + dx / 2;
      const cp2y = p2.y;
      backboneD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  if (totalLength === 0) totalLength = 100;
  const L = Math.ceil(totalLength * 1.15); // backbone path length

  // ── Sanctuary Loop Paths (figure-8 loops centered around the two most active clusters) ──────────────
  const activeClusterCols = sortedCols.filter(col => colMap[col].length >= 3);
  let sanctuary1D = '';
  let sanctuary2D = '';
  let s1Center = { x: 200, y: 70 };
  let s2Center = { x: 500, y: 70 };

  if (activeClusterCols.length > 0) {
    const col1 = activeClusterCols[0];
    const cells1 = colMap[col1];
    const avgY1 = cells1.reduce((sum, c) => sum + c.y, 0) / cells1.length;
    s1Center = { x: 35 + col1 * 13, y: avgY1 };
  }
  if (activeClusterCols.length > 1) {
    const col2 = activeClusterCols[1];
    const cells2 = colMap[col2];
    const avgY2 = cells2.reduce((sum, c) => sum + c.y, 0) / cells2.length;
    s2Center = { x: 35 + col2 * 13, y: avgY2 };
  }

  // Figure-8 (infinity) loop paths
  sanctuary1D = `M ${s1Center.x} ${s1Center.y} C ${s1Center.x - 16} ${s1Center.y - 12}, ${s1Center.x - 16} ${s1Center.y + 12}, ${s1Center.x} ${s1Center.y} C ${s1Center.x + 16} ${s1Center.y - 12}, ${s1Center.x + 16} ${s1Center.y + 12}, ${s1Center.x} ${s1Center.y}`;
  sanctuary2D = `M ${s2Center.x} ${s2Center.y} C ${s2Center.x - 16} ${s2Center.y + 12}, ${s2Center.x - 16} ${s2Center.y - 12}, ${s2Center.x} ${s2Center.y} C ${s2Center.x + 16} ${s2Center.y + 12}, ${s2Center.x + 16} ${s2Center.y - 12}, ${s2Center.x} ${s2Center.y}`;

  // ── Render Heatmap Grid Squares (standard GitHub greens for maximum visibility) ──────────────────────
  let cellsHtml = '';
  processedCells.forEach(cell => {
    let fillColor = '#161b22'; // Level 0
    if (cell.level === 1) fillColor = '#0e4429';
    else if (cell.level === 2) fillColor = '#006d32';
    else if (cell.level === 3) fillColor = '#26a641';
    else if (cell.level === 4) fillColor = '#39d353';
    
    cellsHtml += `  <rect x="${cell.x - 5}" y="${cell.y - 5}" width="10" height="10" rx="2" fill="${fillColor}" class="grid-cell" />\n`;
  });

  // ── Butterflies & Trails Definitions ─────────────────────────────────────────────────────────────
  
  // 3 migrating butterflies (different scales, colors, durations along backbone)
  const migrateButterflies = [
    { scale: 0.85, color: 'url(#grad-pink)', dur: '12s', delay: '0s', id: 1 },
    { scale: 0.70, color: 'url(#grad-lavender)', dur: '9s', delay: '-3s', id: 2 },
    { scale: 1.05, color: 'url(#grad-purple)', dur: '15s', delay: '-6s', id: 3 }
  ];

  let migrationHtml = '';
  migrateButterflies.forEach(b => {
    const flapDur = (Math.random() * 0.10 + 0.25).toFixed(2);
    migrationHtml += `
  <!-- Tail trail for Migrator ${b.id} -->
  <path d="${backboneD}" fill="none" stroke="${b.id === 1 ? '#ff69b4' : b.id === 2 ? '#dda0dd' : '#ba55d3'}" stroke-width="1.3" opacity="0.6" stroke-dasharray="24 ${L}" stroke-dashoffset="${L}">
    <animate attributeName="stroke-dashoffset" values="${L}; ${-24}" dur="${b.dur}" begin="${b.delay}" repeatCount="indefinite" />
  </path>
  
  <!-- Migrating Butterfly ${b.id} -->
  <g>
    <g style="animation: hover-1 2s ease-in-out infinite alternate; transform: scale(${b.scale}); transform-origin: 0px 0px;">
      <!-- Left Wing -->
      <path d="M 0 0 C -1.5 -3.5, -5.5 -4.5, -5.5 -1.5 C -5.5 1.5, -1.5 1, 0 0 Z" fill="${b.color}" opacity="0.9" style="animation: flap-left ${flapDur}s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <!-- Right Wing -->
      <path d="M 0 0 C 1.5 -3.5, 5.5 -4.5, 5.5 -1.5 C 5.5 1.5, 1.5 1, 0 0 Z" fill="${b.color}" opacity="0.9" style="animation: flap-right ${flapDur}s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <!-- Body -->
      <line x1="0" y1="-3.5" x2="0" y2="2" stroke="#120c22" stroke-width="0.8" />
    </g>
    <animateMotion dur="${b.dur}" begin="${b.delay}" repeatCount="indefinite" path="${backboneD}" rotate="auto" />
  </g>`;
  });

  // 2 sanctuary orbit butterflies (orbiting around the clusters)
  let sanctuaryHtml = `
  <!-- Sanctuary 1 Loop Trail -->
  <path d="${sanctuary1D}" fill="none" stroke="#ff4d94" stroke-width="1.2" opacity="0.55" stroke-dasharray="16 120" stroke-dashoffset="120">
    <animate attributeName="stroke-dashoffset" values="120; -120" dur="6s" repeatCount="indefinite" />
  </path>
  <!-- Sanctuary 1 Orbiting Butterfly -->
  <g>
    <g style="animation: hover-2 2.2s ease-in-out infinite alternate; transform: scale(0.85); transform-origin: 0px 0px;">
      <path d="M 0 0 C -1.5 -3.5, -5.5 -4.5, -5.5 -1.5 C -5.5 1.5, -1.5 1, 0 0 Z" fill="url(#grad-pink)" opacity="0.9" style="animation: flap-left 0.28s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <path d="M 0 0 C 1.5 -3.5, 5.5 -4.5, 5.5 -1.5 C 5.5 1.5, 1.5 1, 0 0 Z" fill="url(#grad-pink)" opacity="0.9" style="animation: flap-right 0.28s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <line x1="0" y1="-3.5" x2="0" y2="2" stroke="#120c22" stroke-width="0.8" />
    </g>
    <animateMotion dur="6s" repeatCount="indefinite" path="${sanctuary1D}" rotate="auto" />
  </g>

  <!-- Sanctuary 2 Loop Trail -->
  <path d="${sanctuary2D}" fill="none" stroke="#ba55d3" stroke-width="1.2" opacity="0.55" stroke-dasharray="16 120" stroke-dashoffset="120">
    <animate attributeName="stroke-dashoffset" values="120; -120" dur="7s" repeatCount="indefinite" />
  </path>
  <!-- Sanctuary 2 Orbiting Butterfly -->
  <g>
    <g style="animation: hover-3 2.5s ease-in-out infinite alternate; transform: scale(0.75); transform-origin: 0px 0px;">
      <path d="M 0 0 C -1.5 -3.5, -5.5 -4.5, -5.5 -1.5 C -5.5 1.5, -1.5 1, 0 0 Z" fill="url(#grad-purple)" opacity="0.9" style="animation: flap-left 0.32s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <path d="M 0 0 C 1.5 -3.5, 5.5 -4.5, 5.5 -1.5 C 5.5 1.5, 1.5 1, 0 0 Z" fill="url(#grad-purple)" opacity="0.9" style="animation: flap-right 0.32s ease-in-out infinite alternate; transform-origin: 0px 0px;" />
      <line x1="0" y1="-3.5" x2="0" y2="2" stroke="#120c22" stroke-width="0.8" />
    </g>
    <animateMotion dur="7s" repeatCount="indefinite" path="${sanctuary2D}" rotate="auto" />
  </g>`;

  // ── Sparkles & Environment Particles ─────────────────────────────────────────────────────────────
  
  // Floating petals (warm pink/sakura colors)
  let petalsHtml = '';
  const numPetals = 12;
  for (let i = 0; i < numPetals; i++) {
    const rx = Math.floor(Math.random() * 700) + 30;
    const ry = Math.floor(Math.random() * 60) + 30;
    const pdx = (Math.random() * 32 - 16).toFixed(1);
    const prot = Math.floor(Math.random() * 360);
    const pdur = (Math.random() * 4.0 + 4.5).toFixed(1);
    const pdel = (Math.random() * 8.0).toFixed(1);
    
    petalsHtml += `  <path d="M ${rx} ${ry} c -1.5 -3, 1.5 -6, 3 -3 c 1.5 3, -1.5 6, -3 3" fill="#ffb7d5" opacity="0" style="animation: petal-fall ${pdur}s ease-in-out ${pdel}s infinite; --fdx: ${pdx}px; --frot: ${prot}deg; transform-origin: ${rx}px ${ry}px;" />\n`;
  }

  // Floating fireflies (golden glow)
  let firefliesHtml = '';
  const numFireflies = 15;
  for (let i = 0; i < numFireflies; i++) {
    const fx = Math.floor(Math.random() * 700) + 30;
    const fy = Math.floor(Math.random() * 90) + 30;
    const fsize = (Math.random() * 1.0 + 0.6).toFixed(1);
    const fdx = (Math.random() * 20 - 10).toFixed(1);
    const fdy = (Math.random() * 20 - 10).toFixed(1);
    const fdur = (Math.random() * 3.5 + 3.0).toFixed(1);
    const fdel = (Math.random() * 5.0).toFixed(1);

    firefliesHtml += `  <circle cx="${fx}" cy="${fy}" r="${fsize}" fill="#ffd700" opacity="0.45" style="animation: firefly-float ${fdur}s ease-in-out ${fdel}s infinite; --dx: ${fdx}px; --dy: ${fdy}px;" />\n`;
  }

  let monthLabelsHtml = '';
  monthLabels.forEach(label => {
    monthLabelsHtml += `  <text x="${label.x}" y="22" class="label">${label.text}</text>\n`;
  });

  const dayLabelsHtml = `
    <text x="18" y="52" class="label" text-anchor="middle">M</text>
    <text x="18" y="78" class="label" text-anchor="middle">W</text>
    <text x="18" y="104" class="label" text-anchor="middle">F</text>
  `;

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 150" width="100%" height="150">
  <defs>
    <!-- Background Space Gradient -->
    <linearGradient id="bg-space" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#090c10" />
    </linearGradient>
    
    <!-- Butterfly Gradients -->
    <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffb7d5" />
      <stop offset="100%" stop-color="#ff4d94" />
    </linearGradient>
    <linearGradient id="grad-lavender" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8d7ff" />
      <stop offset="100%" stop-color="#dda0dd" />
    </linearGradient>
    <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dda0dd" />
      <stop offset="100%" stop-color="#ba55d3" />
    </linearGradient>
  </defs>

  <style>
    .bg { fill: url(#bg-space); }
    .border { stroke: #21262d; stroke-width: 1.5; fill: none; }
    .label {
      fill: #8b949e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 9px;
      font-weight: 500;
    }
    .title {
      fill: #ff69b4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
    }
    .grid-cell {
      stroke: #0d1117;
      stroke-width: 0.5;
      opacity: 0.82;
    }
    
    @keyframes flap-left {
      0% { transform: scaleX(1) rotate(-8deg); }
      100% { transform: scaleX(0.15) rotate(4deg); }
    }
    
    @keyframes flap-right {
      0% { transform: scaleX(1) rotate(8deg); }
      100% { transform: scaleX(0.15) rotate(-4deg); }
    }
    
    @keyframes hover-1 {
      0% { transform: translate(0px, 0px) rotate(-6deg); }
      100% { transform: translate(2px, -3px) rotate(6deg); }
    }
    
    @keyframes hover-2 {
      0% { transform: translate(0px, 0px) rotate(4deg); }
      100% { transform: translate(-2px, -4px) rotate(-4deg); }
    }
    
    @keyframes hover-3 {
      0% { transform: translate(0px, 0px) rotate(-4deg); }
      100% { transform: translate(1px, -4px) rotate(6deg); }
    }

    @keyframes firefly-float {
      0%, 100% { transform: translate(0, 0); opacity: 0.25; }
      50% { transform: translate(var(--dx), var(--dy)); opacity: 0.95; }
    }

    @keyframes petal-fall {
      0% { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
      10% { opacity: 0.7; }
      85% { opacity: 0.7; }
      95% { transform: translate(var(--fdx), 45px) rotate(var(--frot)); opacity: 0; }
      100% { transform: translate(var(--fdx), 45px) rotate(var(--frot)); opacity: 0; }
    }
  </style>

  <!-- Card Background -->
  <rect width="760" height="150" rx="12" class="bg" />
  <rect width="758.5" height="148.5" x="0.75" y="0.75" rx="11.25" class="border" />

  <!-- Header Title -->
  <text x="35" y="22" class="title">🦋 BUTTERFLY MIGRATION</text>

  <!-- Day and Month Labels -->
  ${monthLabelsHtml}
  ${dayLabelsHtml}

  <!-- Contribution Heatmap Grid Backdrop -->
  ${cellsHtml}

  <!-- Migrating Butterflies & Trails -->
  ${migrationHtml}

  <!-- Sanctuary Loop Butterflies & Trails -->
  ${sanctuaryHtml}

  <!-- Environmental Petals -->
  ${petalsHtml}

  <!-- Environmental Fireflies -->
  ${firefliesHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Butterfly Migration SVG at ${outputPath}!`);
}
