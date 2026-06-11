const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets');
const outputPath = path.join(outputDir, 'projects.svg');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const projects = [
  {
    title: 'CivicSync',
    icon: '🏙️',
    description: 'Location-based civic reporting and management platform.',
    color: '#ff63b1',
    glow: '#ff4d94',
    badgeBg: '#3d1b54',
    badges: ['MERN', 'React', 'Node.js', 'MongoDB', 'Maps API', 'Auth'],
    highlights: [
      'Integrated interactive Maps API for real-time visualization and issue tracking.',
      'Built location-based reporting, categorization, and Role-Based Access Control.',
      'Developed dashboards for monitoring issue status, resolution progress, and transparency.'
    ]
  },
  {
    title: 'Euler',
    icon: '📚',
    description: 'AI-powered developer workspace and codebase intelligence hub.',
    color: '#c060d0',
    glow: '#d080e0',
    badgeBg: '#2a1044',
    badges: ['MERN', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'AI APIs'],
    highlights: [
      'Developed Architecture Engine generating system designs and blueprints from prompts.',
      'Built Repo Intelligence for code structure analysis and dependency mapping.',
      'Implemented AI Dev Assistant workflow and centralized developer chat experience.'
    ]
  },
  {
    title: 'Veda AI',
    icon: '🧠',
    description: 'AI-powered adaptive learning and performance diagnostic platform.',
    color: '#8a2be2',
    glow: '#aa4aff',
    badgeBg: '#150a28',
    badges: ['MERN', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Gemini API'],
    highlights: [
      'Developed a real-time adaptive engine dynamically adjusting question difficulty.',
      'Integrated Gemini API to auto-generate subject- and level-specific assessments.',
      'Created detailed diagnostic progress reports with parent/teacher/student dashboards.'
    ]
  }
];

function star(x, y, size) {
  return `<path d="M ${x} ${y - size} Q ${x} ${y} ${x + size} ${y} Q ${x} ${y} ${x} ${y + size} Q ${x} ${y} ${x - size} ${y} Q ${x} ${y} ${x} ${y - size} Z" fill="#ffb7d5" opacity="0.6"/>`;
}

function dot(x, y, r, color, opacity) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
}

function generateSvg() {
  const W = 760;
  const H = 530;
  const cardW = 712;
  const cardH = 132;
  const cardX = 24;
  const startY = 70;
  const gap = 16;

  let cardsHtml = '';

  projects.forEach((proj, idx) => {
    const cy = startY + idx * (cardH + gap);
    
    // Build badges dynamically with wrapping
    let badgeHtml = '';
    let currentBadgeX = 96;
    let currentBadgeY = cy + 56;
    proj.badges.forEach(badge => {
      const badgeWidth = Math.floor(badge.length * 6.0) + 14;
      if (currentBadgeX + badgeWidth > 260) {
        currentBadgeX = 96;
        currentBadgeY += 21;
      }
      badgeHtml += `
      <rect x="${currentBadgeX}" y="${currentBadgeY}" width="${badgeWidth}" height="16" rx="8" fill="${proj.badgeBg}" stroke="${proj.color}" stroke-width="0.8" stroke-opacity="0.45"/>
      <text x="${currentBadgeX + badgeWidth / 2}" y="${currentBadgeY + 8.5}" font-size="8.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-weight="700" fill="${proj.color}" text-anchor="middle" dominant-baseline="middle">${badge.replace(/&/g, '&amp;')}</text>`;
      currentBadgeX += badgeWidth + 5;
    });

    // Render Highlights
    let highlightsHtml = '';
    proj.highlights.forEach((hl, i) => {
      const hly = cy + 52 + i * 23;
      highlightsHtml += `
      <g>
        <!-- Sparkle bullet -->
        <path d="M 295 ${hly} Q 295 ${hly + 4} 299 ${hly + 4} Q 295 ${hly + 4} 295 ${hly + 8} Q 295 ${hly + 4} 291 ${hly + 4} Q 295 ${hly + 4} 295 ${hly} Z" fill="${proj.color}" opacity="0.8"/>
        <!-- Highlight text -->
        <text x="310" y="${hly + 5}" class="project-highlight">${hl.replace(/&/g, '&amp;')}</text>
      </g>`;
    });

    cardsHtml += `
  <!-- Card ${idx + 1}: ${proj.title} -->
  <g class="project-card-group">
    <!-- Card glow halo -->
    <rect x="${cardX - 1.5}" y="${cy - 1.5}" width="${cardW + 3}" height="${cardH + 3}" rx="13" fill="${proj.glow}" opacity="0.08" filter="url(#card-glow)"/>
    <!-- Card body -->
    <rect x="${cardX}" y="${cy}" width="${cardW}" height="${cardH}" rx="12" fill="url(#cg-${idx})"/>
    <!-- Card border -->
    <rect x="${cardX + 0.75}" y="${cy + 0.75}" width="${cardW - 1.5}" height="${cardH - 1.5}" rx="11.25" fill="none" stroke="${proj.color}" stroke-width="1" stroke-opacity="0.35"/>
    
    <!-- Icon Circle -->
    <circle cx="56" cy="${cy + 36}" r="22" fill="#0c0717" stroke="${proj.color}" stroke-width="1.2" stroke-opacity="0.6" filter="url(#dot-glow)"/>
    <text x="56" y="56" transform="translate(0, ${cy - 20})" font-size="22" text-anchor="middle" dominant-baseline="middle">${proj.icon}</text>
    
    <!-- Title -->
    <text x="96" y="${cy + 34}" class="project-title" fill="${proj.color}">${proj.title}</text>
    
    <!-- Tech stack badges -->
    ${badgeHtml}
    
    <!-- Description -->
    <text x="295" y="${cy + 32}" class="project-desc">${proj.description.replace(/&/g, '&amp;')}</text>
    
    <!-- Highlights -->
    ${highlightsHtml}
  </g>
  `;
  });

  const decorations = [
    star(20, 24, 4),
    star(740, 22, 5),
    star(735, 510, 4),
    star(25, 505, 5),
    star(380, 18, 4),
    dot(705, 65, 1.5, '#ffb7d5', 0.5),
    dot(55, 480, 1.5, '#c060d0', 0.4),
    dot(310, 515, 1.2, '#ff80bf', 0.4),
    dot(450, 22, 1.2, '#8a2be2', 0.45),
  ].join('\n  ');

  const constellations = `
  <line x1="20" y1="24"  x2="380" y2="18"  stroke="#ff63b1" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="380" y1="18" x2="740" y2="22"  stroke="#c060d0" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="25"  y1="505" x2="310" y2="515" stroke="#ff80bf" stroke-width="0.4" stroke-opacity="0.12"/>
  <line x1="310" y1="515" x2="735" y2="510" stroke="#8a2be2" stroke-width="0.4" stroke-opacity="0.12"/>`;

  // Floating particles
  const particles = [
    [60, 120, 0.9, '#ff63b1', 0.35, 4.1, 1.2],
    [710, 150, 1.0, '#c060d0', 0.3, 5.2, 2.8],
    [45, 270, 0.8, '#ffb7d5', 0.4, 3.8, 0.5],
    [705, 340, 1.1, '#8a2be2', 0.3, 6.0, 3.5],
    [55, 420, 1.0, '#ff80bf', 0.35, 4.5, 1.8],
  ].map(([x, y, r, color, op, dur, del]) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}" style="animation: float-p ${dur}s ease-in-out ${del}s infinite alternate;"/>`
  ).join('\n  ');

  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090611"/>
      <stop offset="50%" stop-color="#0f0920"/>
      <stop offset="100%" stop-color="#130b26"/>
    </linearGradient>
    <filter id="nebula" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="card-glow" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="title-glow" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${projects.map((proj, idx) => `
    <linearGradient id="cg-${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${proj.color}" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#0e0a1b" stop-opacity="0.92" />
    </linearGradient>`).join('\n')}
  </defs>

  <style>
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
    .project-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .project-desc {
      fill: #e1daf2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .project-highlight {
      fill: #c5bcdb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.1px;
      dominant-baseline: middle;
    }
    @keyframes float-p {
      from { transform: translateY(0px); opacity: 0.3; }
      to   { transform: translateY(-6px); opacity: 0.75; }
    }
  </style>

  <!-- Background -->
  <rect width="${W}" height="${H}" rx="14" fill="url(#bg)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="13.25" fill="none" stroke="#ff80bf" stroke-width="1" stroke-opacity="0.28"/>

  <!-- Nebula clouds -->
  <circle cx="100" cy="150" r="110" fill="#ff4d94" opacity="0.06" filter="url(#nebula)"/>
  <circle cx="660" cy="380" r="120" fill="#8a2be2" opacity="0.08" filter="url(#nebula)"/>
  <circle cx="380" cy="260" r="90" fill="#c060d0" opacity="0.04" filter="url(#nebula)"/>

  <!-- Constellations -->
  ${constellations}

  <!-- Stars & sparkles -->
  ${decorations}

  <!-- Floating particles -->
  ${particles}

  <!-- Title -->
  <text x="24" y="38" class="section-title" filter="url(#title-glow)">✨  FEATURED PROJECTS</text>
  <text x="24" y="53" class="sub-label">Flagship applications and portfolio centerpieces</text>

  <!-- Project Cards -->
  ${cardsHtml}

</svg>`;

  fs.writeFileSync(outputPath, svgContent, 'utf8');
  console.log(`Successfully generated projects SVG at: ${outputPath}`);
}

generateSvg();
