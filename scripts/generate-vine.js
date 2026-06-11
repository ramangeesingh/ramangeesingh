const https = require('https');
const fs = require('fs');
const path = require('path');

// Target username
const username = 'ramangeesingh';
const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'contribution-vine.svg');

// Create assets directory if it doesn't exist
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
  // Regex to extract calendar days
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
  
  // Sort chronologically
  cells.sort((a, b) => a.date.localeCompare(b.date));
  
  const minDateStr = cells[0].date;
  const minDate = new Date(minDateStr + 'T00:00:00');
  
  // Map cells to coordinate grid
  const processedCells = cells.map(cell => {
    const currentDate = new Date(cell.date + 'T00:00:00');
    const diffTime = currentDate - minDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const col = Math.floor(diffDays / 7);
    const row = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Grid alignment: x-spacing is 13px, y-spacing is 13px
    // Padding left: 35, Padding top: 35
    return {
      ...cell,
      col,
      row,
      x: 35 + col * 13,
      y: 35 + row * 13
    };
  });
  
  // Extract month labels
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels = [];
  let lastMonth = -1;
  processedCells.forEach(cell => {
    const date = new Date(cell.date + 'T00:00:00');
    const m = date.getMonth();
    // Only place label when month changes and it's Sunday (row === 0) to align with columns
    if (m !== lastMonth && cell.row === 0) {
      monthLabels.push({
        text: months[m],
        x: cell.x
      });
      lastMonth = m;
    }
  });

  // Collect active cells for the vine path
  let activeCells = processedCells.filter(c => c.level > 0);
  
  // Fallback: If 0 contributions, simulate a simple vine path wave to keep it beautiful
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
  
  // Build vine SVG path
  let pathD = '';
  let totalLength = 0;
  
  if (activeCells.length > 0) {
    pathD = `M ${activeCells[0].x} ${activeCells[0].y}`;
    for (let i = 1; i < activeCells.length; i++) {
      const p1 = activeCells[i - 1];
      const p2 = activeCells[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      
      // Calculate straight line distance for dasharray animation
      totalLength += Math.sqrt(dx * dx + dy * dy);
      
      // Draw a smooth S-curve between points
      const cp1x = p1.x + dx / 2;
      const cp1y = p1.y;
      const cp2x = p1.x + dx / 2;
      const cp2y = p2.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }
  
  // Prevent zero division
  if (totalLength === 0) totalLength = 100;
  // Add 10% buffer to dasharray length for bezier curve elongation
  const animatedLength = Math.ceil(totalLength * 1.15);

  // Generate fireflies
  let firefliesHtml = '';
  const numFireflies = 25;
  for (let i = 0; i < numFireflies; i++) {
    const fx = Math.floor(Math.random() * 700) + 30;
    const fy = Math.floor(Math.random() * 90) + 30;
    const fsize = (Math.random() * 1.5 + 0.5).toFixed(1);
    const fdx = (Math.random() * 30 - 15).toFixed(1);
    const fdy = (Math.random() * 30 - 15).toFixed(1);
    const fdur = (Math.random() * 4 + 3).toFixed(1);
    const fdel = (Math.random() * 5).toFixed(1);
    
    firefliesHtml += `  <circle cx="${fx}" cy="${fy}" r="${fsize}" fill="#ffb7d5" opacity="0.4" style="animation: firefly-float ${fdur}s ease-in-out ${fdel}s infinite; --dx: ${fdx}px; --dy: ${fdy}px;" />\n`;
  }

  // Generate falling petals
  let petalsHtml = '';
  const numPetals = 15;
  for (let i = 0; i < numPetals; i++) {
    // Start falling from near one of the active cells
    const randomActive = activeCells[Math.floor(Math.random() * activeCells.length)];
    const px = randomActive.x + Math.floor(Math.random() * 20 - 10);
    const py = randomActive.y;
    const pdx = (Math.random() * 40 - 20).toFixed(1);
    const prot = Math.floor(Math.random() * 360);
    const pdur = (Math.random() * 5 + 4).toFixed(1);
    const pdel = (Math.random() * 10).toFixed(1);
    
    // Small leaf/petal path
    petalsHtml += `  <path d="M ${px} ${py} c -2 -4, 2 -8, 4 -4 c 2 4, -2 8, -4 4" fill="#ffb7d5" opacity="0" style="animation: petal-fall ${pdur}s ease-in-out ${pdel}s infinite; --fdx: ${pdx}px; --frot: ${prot}deg; transform-origin: ${px}px ${py}px;" />\n`;
  }

  // Render contribution cells XML
  let cellsHtml = '';
  processedCells.forEach(cell => {
    // Custom theme: dark violet-black for empty, pinks/purples for active
    let fillColor = '#140f22'; // Level 0
    if (cell.level === 1) fillColor = '#3d1b54';
    else if (cell.level === 2) fillColor = '#6c2b8a';
    else if (cell.level === 3) fillColor = '#a84cb0';
    else if (cell.level === 4) fillColor = '#ff63b1';
    
    cellsHtml += `  <rect x="${cell.x - 5}" y="${cell.y - 5}" width="10" height="10" rx="2.5" ry="2.5" fill="${fillColor}" class="grid-cell" />\n`;
  });

  // Render month labels XML
  let monthLabelsHtml = '';
  monthLabels.forEach(label => {
    monthLabelsHtml += `  <text x="${label.x}" y="22" class="label">${label.text}</text>\n`;
  });

  // Render day labels (M, W, F)
  const dayLabelsHtml = `
    <text x="18" y="52" class="label" text-anchor="middle">M</text>
    <text x="18" y="78" class="label" text-anchor="middle">W</text>
    <text x="18" y="104" class="label" text-anchor="middle">F</text>
  `;

  // Render flowers XML
  let flowersHtml = '';
  const totalActive = activeCells.length;
  activeCells.forEach((cell, idx) => {
    const delay = ((idx / totalActive) * 11.2).toFixed(2); // Leave some buffer at the end of the 15s loop
    
    // Choose size and colors based on contribution level
    let r = 2; // Petal radius
    let petalColor = '#e6b2e6';
    let centerColor = '#ffffff';
    let isSpecial = false;
    
    if (cell.level === 1) {
      r = 1.8;
      petalColor = '#b382d9'; // Lavender
      centerColor = '#ffcce6';
    } else if (cell.level === 2) {
      r = 2.6;
      petalColor = '#ff99cc'; // Sakura pink
      centerColor = '#ffe6ff';
    } else if (cell.level === 3) {
      r = 3.4;
      petalColor = '#ff66b2'; // Rich pink
      centerColor = '#fff066'; // Glowing yellow center
    } else if (cell.level === 4) {
      r = 4.2;
      petalColor = '#ff3399'; // Bright magenta-pink
      centerColor = '#ffffff';
      isSpecial = true;
    }
    
    const cx = cell.x;
    const cy = cell.y;
    
    flowersHtml += `  <g class="flower" style="animation: bloom-key 15s infinite; animation-delay: ${delay}s; transform-origin: ${cx}px ${cy}px;">\n`;
    if (isSpecial) {
      // Draw extra glowing ring behind level 4 blossoms
      flowersHtml += `    <circle cx="${cx}" cy="${cy}" r="${r * 1.8}" fill="none" stroke="#ff80bf" stroke-width="0.5" stroke-dasharray="2 2" opacity="0.6" />\n`;
    }
    // 5-Petal Flower geometry
    flowersHtml += `    <circle cx="${cx}" cy="${cy - r}" r="${r}" fill="${petalColor}" opacity="0.9" />\n`;
    flowersHtml += `    <circle cx="${cx + r}" cy="${cy - r/3}" r="${r}" fill="${petalColor}" opacity="0.9" />\n`;
    flowersHtml += `    <circle cx="${cx - r}" cy="${cy - r/3}" r="${r}" fill="${petalColor}" opacity="0.9" />\n`;
    flowersHtml += `    <circle cx="${cx + r/2}" cy="${cy + r}" r="${r}" fill="${petalColor}" opacity="0.9" />\n`;
    flowersHtml += `    <circle cx="${cx - r/2}" cy="${cy + r}" r="${r}" fill="${petalColor}" opacity="0.9" />\n`;
    flowersHtml += `    <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="${centerColor}" />\n`;
    flowersHtml += `  </g>\n`;
  });

  // Full SVG content
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 150" width="100%" height="150">
  <defs>
    <!-- Dark elegant card styling -->
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0712" />
      <stop offset="100%" stop-color="#120c22" />
    </linearGradient>
    
    <!-- Vine gradient (purple to lavender) -->
    <linearGradient id="vine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8a2be2" />
      <stop offset="50%" stop-color="#d87093" />
      <stop offset="100%" stop-color="#ff69b4" />
    </linearGradient>
    
    <!-- Glassmorphic glow filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .bg { fill: url(#card-grad); }
    .border { stroke: #2a1c44; stroke-width: 1.5; fill: none; }
    .label {
      fill: #8f85a8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 9px;
      font-weight: 500;
    }
    .title {
      fill: #ffb7d5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
    }
    .grid-cell {
      opacity: 0.85;
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
      5% { transform: scale(1.4); opacity: 1; }
      9% { transform: scale(1); opacity: 1; }
      75% { transform: scale(1); opacity: 1; }
      90% { transform: scale(1); opacity: 1; }
      95% { transform: scale(0); opacity: 0; }
      100% { transform: scale(0); opacity: 0; }
    }

    @keyframes firefly-float {
      0%, 100% { transform: translate(0, 0); opacity: 0.2; }
      50% { transform: translate(var(--dx), var(--dy)); opacity: 0.95; }
    }

    @keyframes petal-fall {
      0% { transform: translate(0, -10px) rotate(0deg); opacity: 0; }
      10% { opacity: 0.75; }
      85% { opacity: 0.75; }
      95% { transform: translate(var(--fdx), 45px) rotate(var(--frot)); opacity: 0; }
      100% { transform: translate(var(--fdx), 45px) rotate(var(--frot)); opacity: 0; }
    }
  </style>

  <!-- Card Background -->
  <rect width="760" height="150" rx="12" class="bg" />
  <rect width="758.5" height="148.5" x="0.75" y="0.75" rx="11.25" class="border" />

  <!-- Header Title -->
  <text x="35" y="22" class="title">✨ EVERY CONTRIBUTION HELPS THE GARDEN GROW</text>

  <!-- Day and Month Labels -->
  ${monthLabelsHtml}
  ${dayLabelsHtml}

  <!-- Calendar Heatmap Grid -->
${cellsHtml}

  <!-- Animated Contribution Vine -->
  <path d="${pathD}" fill="none" stroke="url(#vine-grad)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="vine-path" />

  <!-- Blooming Flowers -->
${flowersHtml}

  <!-- Falling Petals -->
${petalsHtml}

  <!-- Floating Sparkles (Fireflies) -->
${firefliesHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Contribution Vine SVG at ${outputPath}!`);
}
