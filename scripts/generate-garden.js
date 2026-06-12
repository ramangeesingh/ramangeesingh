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

// 🌱 Level 1 Sprout
function drawSprout(cx, cy, delay, idx) {
  const scale = 0.85;
  const swayDur = (Math.random() * 1.0 + 2.5).toFixed(1);
  const swayDel = (Math.random() * 2.0).toFixed(1);

  return `  <g transform="translate(${cx}, ${cy})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <g style="animation: leaf-sway ${swayDur}s ease-in-out ${swayDel}s infinite alternate; transform-origin: 0px 5px; transform: scale(${scale});">
        <!-- Stem -->
        <path d="M 0 5 L 0 -1" stroke="#2bb35c" stroke-width="1.0" fill="none" />
        <!-- Left Leaf -->
        <path d="M 0 -1 C -2 -3, -4 -3, -5 -1 C -4 1, -2 1, 0 -1 Z" fill="#2bb35c" />
        <!-- Right Leaf -->
        <path d="M 0 -1 C 2 -3, 4 -3, 5 -1 C 4 1, 2 1, 0 -1 Z" fill="#2bb35c" />
      </g>
    </g>
  </g>\n`;
}

// 🌿 Level 2 Bud
function drawBud(cx, cy, delay, idx) {
  const scale = 0.9;
  const swayDur = (Math.random() * 0.8 + 2.3).toFixed(1);
  const swayDel = (Math.random() * 2.0).toFixed(1);

  return `  <g transform="translate(${cx}, ${cy})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <g style="animation: leaf-sway ${swayDur}s ease-in-out ${swayDel}s infinite alternate; transform-origin: 0px 5px; transform: scale(${scale});">
        <!-- Stem -->
        <path d="M 0 5 L 0 -2" stroke="#2bb35c" stroke-width="1.2" fill="none" />
        <!-- Leaf -->
        <path d="M 0 2 C -2 1, -4 0, -5 -2 C -4 -3, -2 -2, 0 2 Z" fill="#2bb35c" />
        <!-- Bud Petals -->
        <circle cx="0" cy="-4.5" r="1.3" fill="#f5fff5" opacity="0.95" />
        <circle cx="1.3" cy="-3" r="1.3" fill="#f5fff5" opacity="0.95" />
        <circle cx="-1.3" cy="-3" r="1.3" fill="#f5fff5" opacity="0.95" />
        <circle cx="0" cy="-1.5" r="1.3" fill="#f5fff5" opacity="0.95" />
        <circle cx="0" cy="-3" r="0.8" fill="#2bb35c" />
      </g>
    </g>
  </g>\n`;
}

// 🌸 Level 3 Flower
function drawFlower(cx, cy, delay, idx) {
  const scale = 0.95;
  const swayDur = (Math.random() * 0.6 + 2.1).toFixed(1);
  const swayDel = (Math.random() * 2.0).toFixed(1);

  return `  <g transform="translate(${cx}, ${cy})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <g style="animation: leaf-sway ${swayDur}s ease-in-out ${swayDel}s infinite alternate; transform-origin: 0px 5px; transform: scale(${scale});">
        <!-- Stem -->
        <path d="M 0 5 L 0 -3" stroke="#2bb35c" stroke-width="1.3" fill="none" />
        <!-- Left Leaf -->
        <path d="M 0 2 C -3 1, -4 -1, -5 -3 C -3 -3, -1 -1, 0 2 Z" fill="#2bb35c" />
        <!-- Right Leaf -->
        <path d="M 0 1 C 3 0, 4 -2, 5 -4 C 3 -4, 1 -2, 0 1 Z" fill="#2bb35c" />
        <!-- Flower centered at (0, -3.5) -->
        <g transform="translate(0, -3.5)">
          <circle cx="0" cy="-2.2" r="2.2" fill="#ffffff" opacity="0.95" />
          <circle cx="2.2" cy="-0.7" r="2.2" fill="#ffffff" opacity="0.95" />
          <circle cx="-2.2" cy="-0.7" r="2.2" fill="#ffffff" opacity="0.95" />
          <circle cx="1.3" cy="1.6" r="2.2" fill="#ffffff" opacity="0.95" />
          <circle cx="-1.3" cy="1.6" r="2.2" fill="#ffffff" opacity="0.95" />
          <circle cx="0" cy="0" r="1.5" fill="#7bf099" />
        </g>
      </g>
    </g>
  </g>\n`;
}

// 🌺 Level 4 Cluster (Mini Garden Center)
function drawCluster(cx, cy, delay, idx) {
  const scale = 1.0;
  const swayDur = (Math.random() * 0.5 + 1.8).toFixed(1);
  const swayDel = (Math.random() * 2.0).toFixed(1);

  return `  <g transform="translate(${cx}, ${cy})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <g style="animation: leaf-sway ${swayDur}s ease-in-out ${swayDel}s infinite alternate; transform-origin: 0px 5px; transform: scale(${scale});">
        <!-- Stems -->
        <path d="M 0 5 L -2 -3" stroke="#2bb35c" stroke-width="1.4" fill="none" />
        <path d="M 0 2 Q 3 0, 4 -2" stroke="#2bb35c" stroke-width="1.2" fill="none" />
        
        <!-- Leaves -->
        <path d="M 0 2 C -3 1, -4 -1, -5 -3 C -3 -3, -1 -1, 0 2 Z" fill="#2bb35c" />
        <path d="M -1 3 C -4 3, -5 5, -6 7 C -4 6, -2 4, -1 3 Z" fill="#2bb35c" />
        <path d="M 2 1 C 4 0, 5 -1, 6 -3 C 5 -3, 3 -2, 2 1 Z" fill="#2bb35c" />
        
        <!-- Main Flower at (-2, -3) -->
        <g transform="translate(-2, -3)">
          <circle cx="0" cy="0" r="4.5" fill="none" stroke="#00ff88" stroke-width="0.4" stroke-dasharray="1.5 1.5" opacity="0.6" />
          <g transform="scale(1.1)">
            <circle cx="0" cy="-2.2" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="2.2" cy="-0.7" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="-2.2" cy="-0.7" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="1.3" cy="1.6" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="-1.3" cy="1.6" r="2.2" fill="#ffffff" opacity="0.95" />
            <circle cx="0" cy="0" r="1.6" fill="#00ff88" />
          </g>
        </g>
        
        <!-- Second Flower at (4, -2) -->
        <g transform="translate(4, -2) scale(0.8)">
          <circle cx="0" cy="-2" r="2" fill="#f2fff2" opacity="0.95" />
          <circle cx="2" cy="0" r="2" fill="#f2fff2" opacity="0.95" />
          <circle cx="-2" cy="0" r="2" fill="#f2fff2" opacity="0.95" />
          <circle cx="0" cy="2" r="2" fill="#f2fff2" opacity="0.95" />
          <circle cx="0" cy="0" r="1.2" fill="#39d353" />
        </g>
      </g>
    </g>
  </g>\n`;
}

// 🌿 Connecting Branch for streaks
function drawBranch(x1, y1, x2, y2, delay, idx) {
  const isHorizontal = y1 === y2;
  const bend = idx % 2 === 0 ? 2.0 : -2.0;
  let pathD = '';
  let leafD = '';
  if (isHorizontal) {
    pathD = `M 0 0 Q 6.5 ${bend} 13 0`;
    leafD = `<path d="M 0 0 C -1 -2, 1 -4, 3 -3 C 3 -1, 1 -1, 0 0 Z" fill="#1b8545" transform="translate(6.5, ${bend / 2}) scale(0.7) rotate(${bend > 0 ? 35 : -35})" />`;
  } else {
    pathD = `M 0 0 Q ${bend} 6.5 0 13`;
    leafD = `<path d="M 0 0 C -2 -1, -4 1, -3 3 C -1 3, -1 1, 0 0 Z" fill="#1b8545" transform="translate(${bend / 2}, 6.5) scale(0.7) rotate(${bend > 0 ? 55 : -55})" />`;
  }
  
  return `  <g transform="translate(${x1}, ${y1})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <path d="${pathD}" fill="none" stroke="#106b3e" stroke-width="1.0" opacity="0.6" />
      ${leafD}
    </g>
  </g>\n`;
}

// ✨ Glowing sparkles for highly active clusters
function drawSparkles(cx, cy, delay, idx) {
  const sx1 = cx + (idx % 2 === 0 ? 8 : -8);
  const sy1 = cy + (idx % 3 === 0 ? -6 : -10);
  const sx2 = cx + (idx % 2 === 0 ? -9 : 9);
  const sy2 = cy + (idx % 3 === 0 ? 9 : 6);
  
  const sparklePath1 = `M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z`;
  const sparklePath2 = `M 0 -2 Q 0 0 2 0 Q 0 0 0 2 Q 0 0 -2 0 Q 0 0 0 -2 Z`;
  
  const del1 = (Math.random() * 1.5).toFixed(1);
  const del2 = (Math.random() * 1.5).toFixed(1);

  return `  <g transform="translate(${sx1}, ${sy1})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <path d="${sparklePath1}" fill="#ffffff" opacity="0" style="animation: sparkle-glow 1.5s ease-in-out ${del1}s infinite alternate; transform-origin: 0px 0px;" />
    </g>
  </g>
  <g transform="translate(${sx2}, ${sy2})">
    <g class="garden-plant" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: 0px 0px;">
      <path d="${sparklePath2}" fill="#00ff88" opacity="0" style="animation: sparkle-glow 1.8s ease-in-out ${del2}s infinite alternate; transform-origin: 0px 0px;" />
    </g>
  </g>\n`;
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

  // Map coordinate indices for neighbor checks
  const cellMap = {};
  processedCells.forEach(c => {
    cellMap[`${c.col},${c.row}`] = c;
  });

  let activeCells = processedCells.filter(c => c.level > 0);
  
  if (activeCells.length === 0) {
    console.log('No active contributions found. Creating a simulated garden...');
    // Fallback simulation to make it look active
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
    // Add them to the map for connections
    activeCells.forEach(ac => {
      cellMap[`${ac.col},${ac.row}`] = ac;
    });
  }

  // Generate fireflies (forest green & yellow-green glows)
  let firefliesHtml = '';
  const numFireflies = 28;
  for (let i = 0; i < numFireflies; i++) {
    const fx = Math.floor(Math.random() * 700) + 30;
    const fy = Math.floor(Math.random() * 90) + 30;
    const fsize = (Math.random() * 1.3 + 0.6).toFixed(1);
    const fdx = (Math.random() * 26 - 13).toFixed(1);
    const fdy = (Math.random() * 26 - 13).toFixed(1);
    const fdur = (Math.random() * 4 + 3.2).toFixed(1);
    const fdel = (Math.random() * 5.0).toFixed(1);
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

  // Cell-Independent Plants & Branches & Sparkles
  let plantsHtml = '';
  let branchesHtml = '';
  let sparklesHtml = '';

  activeCells.forEach((cell, idx) => {
    const delay = ((cell.col / 53) * 11.0).toFixed(2);
    
    // 1. Sprout/Bud/Flower/Cluster according to level
    if (cell.level === 1) {
      plantsHtml += drawSprout(cell.x, cell.y, delay, idx);
    } else if (cell.level === 2) {
      plantsHtml += drawBud(cell.x, cell.y, delay, idx);
    } else if (cell.level === 3) {
      plantsHtml += drawFlower(cell.x, cell.y, delay, idx);
    } else if (cell.level === 4) {
      plantsHtml += drawCluster(cell.x, cell.y, delay, idx);
    }

    // 2. Streak branch connections: check Right (col + 1, row) and Down (col, row + 1)
    const rightNeighbor = cellMap[`${cell.col + 1},${cell.row}`];
    if (rightNeighbor && rightNeighbor.level > 0) {
      branchesHtml += drawBranch(cell.x, cell.y, rightNeighbor.x, rightNeighbor.y, delay, idx);
    }

    const downNeighbor = cellMap[`${cell.col},${cell.row + 1}`];
    if (downNeighbor && downNeighbor.level > 0) {
      branchesHtml += drawBranch(cell.x, cell.y, downNeighbor.x, downNeighbor.y, delay, idx);
    }

    // 3. Cluster detections: count 4-way neighbors
    let neighborCount = 0;
    const upN = cellMap[`${cell.col},${cell.row - 1}`];
    const downN = cellMap[`${cell.col},${cell.row + 1}`];
    const leftN = cellMap[`${cell.col - 1},${cell.row}`];
    const rightN = cellMap[`${cell.col + 1},${cell.row}`];

    if (upN && upN.level > 0) neighborCount++;
    if (downN && downN.level > 0) neighborCount++;
    if (leftN && leftN.level > 0) neighborCount++;
    if (rightN && rightN.level > 0) neighborCount++;

    if (neighborCount >= 3) {
      sparklesHtml += drawSparkles(cell.x, cell.y, delay, idx);
    }
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
      opacity: 0.8;
    }
    .garden-plant {
      transform: scale(0);
      opacity: 0;
    }

    @keyframes bloom-key {
      0% { transform: scale(0); opacity: 0; }
      1.5% { transform: scale(0); opacity: 0; }
      6% { transform: scale(1.15); opacity: 1; }
      9% { transform: scale(1); opacity: 1; }
      75% { transform: scale(1); opacity: 1; }
      90% { transform: scale(1); opacity: 1; }
      95% { transform: scale(0); opacity: 0; }
      100% { transform: scale(0); opacity: 0; }
    }

    @keyframes leaf-sway {
      0% { transform: rotate(-5deg); }
      100% { transform: rotate(8deg); }
    }

    @keyframes sparkle-glow {
      0% { opacity: 0.2; transform: scale(0.85); }
      100% { opacity: 0.95; transform: scale(1.15); }
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

  <!-- Connecting Branches (Streaks) -->
${branchesHtml}

  <!-- Vegetation Growth (Sprouts, Buds, Flowers, Clusters) -->
${plantsHtml}

  <!-- Sparkles near Lush Clusters -->
${sparklesHtml}

  <!-- Falling Petals -->
${petalsHtml}

  <!-- Floating Sparkles (Fireflies) -->
${firefliesHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Contribution Garden SVG at ${outputPath}!`);
}
