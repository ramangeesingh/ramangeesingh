const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'most-used-languages.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// User-customizable languages and percentages
const languages = [
  { name: 'Dart & Flutter', percentage: 40.5, color: '#ff63b1' },
  { name: 'JavaScript & Web', percentage: 32.8, color: '#a84cb0' },
  { name: 'C++', percentage: 15.2, color: '#ff80bf' },
  { name: 'Python & AI', percentage: 11.5, color: '#8a2be2' }
];

function generateSvg() {
  const width = 480;
  const height = 180;
  
  // Calculate distribution bar coordinates
  const barWidth = 410;
  const barHeight = 12;
  const barX = 35;
  const barY = 65;
  
  let currentX = barX;
  let barSegments = '';
  
  languages.forEach((lang, index) => {
    const segmentWidth = (barWidth * lang.percentage) / 100;
    
    // Determine corner rounding: round only left side of first segment, and right side of last segment
    let rx = 0;
    let ry = 0;
    if (index === 0) {
      rx = 6;
      ry = 6;
    } else if (index === languages.length - 1) {
      rx = 6;
      ry = 6;
    }
    
    barSegments += `  <rect x="${currentX}" y="${barY}" width="${segmentWidth}" height="${barHeight}" rx="${rx}" ry="${ry}" fill="${lang.color}" class="bar-segment" />\n`;
    currentX += segmentWidth;
  });

  // Calculate legend coordinates (2 columns, 2 rows)
  let legendHtml = '';
  languages.forEach((lang, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    
    const lx = 45 + col * 205;
    const ly = 110 + row * 30;
    
    legendHtml += `
    <g class="legend-item" transform="translate(${lx}, ${ly})">
      <circle cx="0" cy="-4" r="5" fill="${lang.color}" filter="url(#glow-soft)" />
      <text x="18" y="0" class="lang-name">${lang.name}</text>
      <text x="145" y="0" class="lang-pct">${lang.percentage.toFixed(1)}%</text>
    </g>`;
  });

  // Sparkles coordinate grid
  const sparkles = [
    { x: 25, y: 32, size: 6 },
    { x: 440, y: 150, size: 5 },
    { x: 410, y: 35, size: 4 },
    { x: 50, y: 155, size: 4 }
  ];
  let sparklesHtml = '';
  sparkles.forEach(s => {
    sparklesHtml += `  <path d="M ${s.x} ${s.y - s.size} Q ${s.x} ${s.y} ${s.x + s.size} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y + s.size} Q ${s.x} ${s.y} ${s.x - s.size} ${s.y} Q ${s.x} ${s.y} ${s.x} ${s.y - s.size} Z" fill="#ffb7d5" opacity="0.6" />\n`;
  });

  // Full SVG Template
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Dark elegant card styling -->
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0712" />
      <stop offset="100%" stop-color="#120c22" />
    </linearGradient>

    <!-- Glassmorphic glow filter -->
    <filter id="glow-card" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glow-soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .bg { fill: url(#card-grad); }
    .border { stroke: #ff80bf; stroke-width: 1.2; stroke-opacity: 0.35; fill: none; }
    .title {
      fill: #ffb7d5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1.2px;
    }
    .lang-name {
      fill: #e1def0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 500;
    }
    .lang-pct {
      fill: #8f85a8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-anchor: end;
    }
    .bar-segment {
      transition: opacity 0.3s;
    }
    .legend-item {
      cursor: pointer;
    }
    .legend-item:hover text {
      fill: #ffffff;
    }
  </style>

  <!-- Card Background with subtle neon pink border -->
  <rect width="${width}" height="${height}" rx="12" class="bg" />
  <rect width="${width - 1.5}" height="${height - 1.5}" x="0.75" y="0.75" rx="11.25" class="border" />

  <!-- Background Nebula Glow -->
  <circle cx="400" cy="140" r="60" fill="#a84cb0" opacity="0.15" filter="url(#glow-card)" />
  <circle cx="60" cy="40" r="40" fill="#ff63b1" opacity="0.1" filter="url(#glow-card)" />

  <!-- Decorative Sparkles -->
  ${sparklesHtml}

  <!-- Header Title -->
  <text x="35" y="38" class="title">🌸 MOST USED LANGUAGES</text>

  <!-- Distribution Bar -->
  <g class="bar-container">
    <!-- Background track -->
    <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="6" ry="6" fill="#1b1525" />
    ${barSegments}
  </g>

  <!-- Legend grid -->
  ${legendHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated Most Used Languages SVG at ${outputPath}!`);
}

generateSvg();
