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

function drawLeaf(cx, cy, level, idx) {
  const scale = (0.55 + level * 0.18).toFixed(2);
  const rotate = (idx * 68) % 360;
  // Offset to grow out from the active cell sides
  const ox = cx + (idx % 2 === 0 ? 5 : -5);
  const oy = cy + (idx % 3 === 0 ? 5 : -5);
  const dur = (Math.random() * 2.5 + 2.0).toFixed(1);
  const del = (Math.random() * 3.5).toFixed(1);
  
  return `  <g transform="translate(${ox}, ${oy}) scale(${scale})">
    <path d="M 0 0 C -3 -3, -1 -8, 4 -9 C 5 -6, 4 -2, 0 0 Z" fill="#2bb35c" opacity="0.8" style="animation: leaf-sway ${dur}s ease-in-out ${del}s infinite alternate; transform-origin: 0px 0px;" />
  </g>\n`;
}

function drawFlower(cx, cy, level, idx, delay) {
  let r = 2;
  let petalColor = '#f2fff2'; // Honeydew / white
  let centerColor = '#39d353'; // Emerald center
  let isSpecial = false;
  
  if (level === 1) {
    r = 1.6;
    petalColor = '#e0fae0'; // Very pale green
    centerColor = '#106b3e';
  } else if (level === 2) {
    r = 2.4;
    petalColor = '#f5fff5'; // Light sage-white
    centerColor = '#2bb35c';
  } else if (level === 3) {
    r = 3.2;
    petalColor = '#ffffff'; // White
    centerColor = '#7bf099'; // Glowing pale green center
  } else if (level === 4) {
    r = 4.0;
    petalColor = '#ffffff'; // Pure white
    centerColor = '#00ff88'; // Glowing neon emerald center
    isSpecial = true;
  }
  
  let html = `  <g transform="translate(${cx}, ${cy})">
    <g class="flower" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">\n`;
  if (isSpecial) {
    html += `      <circle cx="0" cy="0" r="${r * 1.7}" fill="none" stroke="#00ff88" stroke-width="0.5" stroke-dasharray="1.5 1.5" opacity="0.6" />\n`;
  }
  html += `      <circle cx="0" cy="${-r}" r="${r}" fill="${petalColor}" opacity="0.95" />\n`;
  html += `      <circle cx="${r}" cy="${-r/3}" r="${r}" fill="${petalColor}" opacity="0.95" />\n`;
  html += `      <circle cx="${-r}" cy="${-r/3}" r="${r}" fill="${petalColor}" opacity="0.95" />\n`;
  html += `      <circle cx="${r/2}" cy="${r}" r="${r}" fill="${petalColor}" opacity="0.95" />\n`;
  html += `      <circle cx="${-r/2}" cy="${r}" r="${r}" fill="${petalColor}" opacity="0.95" />\n`;
  html += `      <circle cx="0" cy="0" r="${r * 0.7}" fill="${centerColor}" />\n`;
  html += `    </g>\n  </g>\n`;
  return html;
}

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

  let activeCells = processedCells.filter(c => c.level > 0);
  
  if (activeCells.length === 0) {
    console.log('No active contributions found. Creating a fallback vine path...');
    const simulatedIndices = [5, 12, 18, 25, 32, 40, 48];
    activeCells = simulatedIndices.map((col, idx) => {
      const row = 2 + Math.sin(idx) * 2;
      return {
        date: 'simulated',
        level: 2,
        col,
        row: Math.floor(row),
        x: 35 + col * 13,
        y: 35 + Math.floor(row) * 13
      };
    });
  }
  
  let pathD = '';
  let totalLength = 0;
  
  if (activeCells.length > 0) {
    pathD = `M ${activeCells[0].x} ${activeCells[0].y}`;
    for (let i = 1; i < activeCells.length; i++) {
      const p1 = activeCells[i - 1];
      const p2 = activeCells[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
      
      const cp1x = p1.x + dx / 2;
      const cp1y = p1.y;
      const cp2x = p1.x + dx / 2;
      const cp2y = p2.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }
  
  if (totalLength === 0) totalLength = 100;
  const animatedLength = Math.ceil(totalLength * 1.15);

  // Generate fireflies (forest green & yellow-green glows)
  let firefliesHtml = '';
  const numFireflies = 28;
  for (let i = 0; i < numFireflies; i++) {
    const fx = Math.floor(Math.random() * 700) + 30;
    const fy = Math.floor(Math.random() * 90) + 30;
    const fsize = (Math.random() * 1.4 + 0.6).toFixed(1);
    const fdx = (Math.random() * 26 - 13).toFixed(1);
    const fdy = (Math.random() * 26 - 13).toFixed(1);
    const fdur = (Math.random() * 4 + 3.2).toFixed(1);
    const fdel = (Math.random() * 5.0).toFixed(1);
    // Yellow-green firefly color
    const fcolor = i % 2 === 0 ? '#adff2f' : '#e8ffc2';
    
    firefliesHtml += `  <circle cx="${fx}" cy="${fy}" r="${fsize}" fill="${fcolor}" opacity="0.45" style="animation: firefly-float ${fdur}s ease-in-out ${fdel}s infinite; --dx: ${fdx}px; --dy: ${fdy}px;" />\n`;
  }

  // Generate falling green/white petals
  let petalsHtml = '';
  const numPetals = 16;
  for (let i = 0; i < numPetals; i++) {
    const randomActive = activeCells[Math.floor(Math.random() * activeCells.length)];
    const px = randomActive.x + Math.floor(Math.random() * 20 - 10);
    const py = randomActive.y;
    const pdx = (Math.random() * 36 - 18).toFixed(1);
    const prot = Math.floor(Math.random() * 360);
    const pdur = (Math.random() * 4.5 + 4.0).toFixed(1);
    const pdel = (Math.random() * 8.5).toFixed(1);
    const pcolor = i % 2 === 0 ? '#ffffff' : '#d0ffd0';
    
    petalsHtml += `  <path d="M ${px} ${py} c -1.5 -3, 1.5 -6, 3 -3 c 1.5 3, -1.5 6, -3 3" fill="${pcolor}" opacity="0" style="animation: petal-fall ${pdur}s ease-in-out ${pdel}s infinite; --fdx: ${pdx}px; --frot: ${prot}deg; transform-origin: ${px}px ${py}px;" />\n`;
  }

  // Render contribution cells (GitHub dark mode colors)
  let cellsHtml = '';
  processedCells.forEach(cell => {
    let fillColor = '#161b22'; // Level 0
    if (cell.level === 1) fillColor = '#0e4429';
    else if (cell.level === 2) fillColor = '#006d32';
    else if (cell.level === 3) fillColor = '#26a641';
    else if (cell.level === 4) fillColor = '#39d353';
    
    cellsHtml += `  <rect x="${cell.x - 5}" y="${cell.y - 5}" width="10" height="10" rx="2" fill="${fillColor}" class="grid-cell" />\n`;
  });

  // Leaves & Flowers
  let leavesHtml = '';
  let flowersHtml = '';
  const totalActive = activeCells.length;
  
  activeCells.forEach((cell, idx) => {
    const delay = ((idx / totalActive) * 11.0).toFixed(2);
    leavesHtml += drawLeaf(cell.x, cell.y, cell.level, idx);
    flowersHtml += drawFlower(cell.x, cell.y, cell.level, idx, delay);
  });

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
    <!-- Dark elegant card styling (GitHub themed) -->
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    
    <!-- Vine gradient (forest green to emerald to mint) -->
    <linearGradient id="vine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#106b3e" />
      <stop offset="60%" stop-color="#2bb35c" />
      <stop offset="100%" stop-color="#00ff88" />
    </linearGradient>
    
    <!-- Glassmorphic glow filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .bg { fill: url(#card-grad); }
    .border { stroke: #21262d; stroke-width: 1.5; fill: none; }
    .label {
      fill: #8b949e;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 9px;
      font-weight: 500;
    }
    .title {
      fill: #26a641;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
    }
    .grid-cell {
      opacity: 0.9;
    }
    .vine-path {
      stroke-dasharray: ${animatedLength};
      stroke-dashoffset: ${animatedLength};
      animation: vine-grow-key 15s ease-in-out infinite;
      filter: url(#glow);
      opacity: 0.9;
    }
    .flower {
      transform: scale(0);
      opacity: 0;
    }

    @keyframes vine-grow-key {
      0% { stroke-dashoffset: ${animatedLength}; }
      75% { stroke-dashoffset: 0; }
      90% { stroke-dashoffset: 0; opacity: 0.9; }
      95% { stroke-dashoffset: 0; opacity: 0; }
      100% { stroke-dashoffset: ${animatedLength}; opacity: 0; }
    }

    @keyframes bloom-key {
      0% { transform: scale(0); opacity: 0; }
      1.5% { transform: scale(0); opacity: 0; }
      5% { transform: scale(1.3); opacity: 1; }
      9% { transform: scale(1); opacity: 1; }
      75% { transform: scale(1); opacity: 1; }
      90% { transform: scale(1); opacity: 1; }
      95% { transform: scale(0); opacity: 0; }
      100% { transform: scale(0); opacity: 0; }
    }

    @keyframes leaf-sway {
      0% { transform: rotate(-6deg); }
      100% { transform: rotate(8deg); }
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
  <text x="35" y="22" class="title">🌿 CONTRIBUTION GARDEN</text>

  <!-- Day and Month Labels -->
  ${monthLabelsHtml}
  ${dayLabelsHtml}

  <!-- Calendar Heatmap Grid -->
${cellsHtml}

  <!-- Animated Contribution Vine -->
  <path d="${pathD}" fill="none" stroke="url(#vine-grad)" stroke-width="2.0" stroke-linecap="round" stroke-linejoin="round" class="vine-path" />

  <!-- Soft Swaying Leaves -->
${leavesHtml}

  <!-- Blooming Flowers -->
${flowersHtml}

  <!-- Falling Petals -->
${petalsHtml}

  <!-- Floating Sparkles (Fireflies) -->
${firefliesHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Contribution Garden SVG at ${outputPath}!`);
}
