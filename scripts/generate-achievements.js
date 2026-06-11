const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'achievements.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const achievements = [
  {
    icon: '🏆',
    title: 'India Innovates',
    subtitle: 'Finalist',
    color: '#ff63b1',
    glow: '#ff4d94'
  },
  {
    icon: '🚀',
    title: 'BuildWithDelhi 2.0',
    subtitle: 'Top 40 Finalist',
    color: '#a84cb0',
    glow: '#c060d0'
  },
  {
    icon: '💡',
    title: 'BharatTechXperience 3.0',
    subtitle: 'Best Code Clarity Award',
    color: '#8a2be2',
    glow: '#aa4aff'
  }
];

function generateSvg() {
  const width = 760;
  const height = 120;
  const cardW = 220;
  const cardH = 80;
  const gap = 25;
  const totalCardsWidth = achievements.length * cardW + (achievements.length - 1) * gap;
  const startX = (width - totalCardsWidth) / 2;
  const cardY = (height - cardH) / 2;

  let cardsHtml = '';

  achievements.forEach((a, i) => {
    const cx = startX + i * (cardW + gap);
    // Soft sparkle positions (relative to card)
    const sp1x = cx + cardW - 14;
    const sp1y = cardY + 8;
    const sp2x = cx + 10;
    const sp2y = cardY + cardH - 10;

    cardsHtml += `
  <!-- Card ${i + 1}: ${a.title} -->
  <defs>
    <linearGradient id="cg${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a.color}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#0d0a1a" stop-opacity="0.92" />
    </linearGradient>
    <filter id="cf${i}" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Card glow halo -->
  <rect x="${cx - 2}" y="${cardY - 2}" width="${cardW + 4}" height="${cardH + 4}" rx="14" fill="${a.glow}" opacity="0.12" filter="url(#cf${i})" />
  <!-- Card body -->
  <rect x="${cx}" y="${cardY}" width="${cardW}" height="${cardH}" rx="12" fill="url(#cg${i})" />
  <!-- Card border -->
  <rect x="${cx + 0.75}" y="${cardY + 0.75}" width="${cardW - 1.5}" height="${cardH - 1.5}" rx="11.25" fill="none" stroke="${a.color}" stroke-width="1" stroke-opacity="0.45" />
  <!-- Top accent line -->
  <rect x="${cx + 30}" y="${cardY}" width="${cardW - 60}" height="2" rx="1" fill="${a.color}" opacity="0.6" />
  <!-- Icon -->
  <text x="${cx + 20}" y="${cardY + 34}" font-size="22" dominant-baseline="middle">${a.icon}</text>
  <!-- Title -->
  <text x="${cx + 50}" y="${cardY + 27}" class="card-title" fill="${a.color}">${a.title}</text>
  <!-- Subtitle -->
  <text x="${cx + 50}" y="${cardY + 46}" class="card-sub">${a.subtitle}</text>
  <!-- Sparkle 1 -->
  <path d="M ${sp1x} ${sp1y - 4} Q ${sp1x} ${sp1y} ${sp1x + 4} ${sp1y} Q ${sp1x} ${sp1y} ${sp1x} ${sp1y + 4} Q ${sp1x} ${sp1y} ${sp1x - 4} ${sp1y} Q ${sp1x} ${sp1y} ${sp1x} ${sp1y - 4} Z" fill="${a.color}" opacity="0.55" />
  <!-- Sparkle 2 -->
  <path d="M ${sp2x} ${sp2y - 3} Q ${sp2x} ${sp2y} ${sp2x + 3} ${sp2y} Q ${sp2x} ${sp2y} ${sp2x} ${sp2y + 3} Q ${sp2x} ${sp2y} ${sp2x - 3} ${sp2y} Q ${sp2x} ${sp2y} ${sp2x} ${sp2y - 3} Z" fill="${a.color}" opacity="0.4" />
`;
  });

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0712" />
      <stop offset="100%" stop-color="#120c22" />
    </linearGradient>
    <filter id="bg-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <style>
    .card-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .card-sub {
      fill: #c8bedd;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
  </style>

  <!-- Background -->
  <rect width="${width}" height="${height}" rx="14" fill="url(#bg-grad)" />
  <!-- Subtle bg nebula glows -->
  <circle cx="120" cy="60" r="55" fill="#ff63b1" opacity="0.06" filter="url(#bg-glow)" />
  <circle cx="640" cy="60" r="55" fill="#8a2be2" opacity="0.06" filter="url(#bg-glow)" />

  ${cardsHtml}
</svg>
`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated achievements SVG at ${outputPath}!`);
}

generateSvg();
