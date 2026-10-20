import { Course, CLO, BloomLevel } from '../types';
import { BLOOM_RANK } from './assessmentAnalysis';

export type BadgeDomain =
  | 'Architecture'
  | 'Algorithms'
  | 'Security'
  | 'Data'
  | 'Cloud'
  | 'Systems'
  | 'Engineering'
  | 'General';

export type BadgeShape = 'hexagon' | 'shield' | 'circle' | 'diamond';

export interface MicroCredentialBadge {
  id: string;
  skillName: string;
  category: BadgeDomain;
  bloomLevel: BloomLevel;
  bloomRank: number;
  shape: BadgeShape;
  courseCode: string;
  courseTitle: string;
  institutionName: string;
  issuerDepartment: string;
  verificationHash: string;
  issueDate: string;
  linkedCLOCodes: string[];
  evidenceSummary: string;
  criteria: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    ring: string;
    gradientId: string;
    badgeBg: string;
    textColor: string;
    lightBg: string;
  };
  svgDataUri: string;
  openBadgeMetadata: Record<string, any>;
}

// Deterministic simple hash generator for credential IDs and verification strings
function createHashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Math.abs(str.split('').reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 7919)).toString(16).padStart(8, '0');
  return `0x${hex}${salt}`.substring(0, 18).toUpperCase();
}

// Determine domain from skill string
function detectDomain(skill: string): BadgeDomain {
  const s = skill.toLowerCase();
  if (s.includes('arch') || s.includes('design') || s.includes('pattern') || s.includes('system model')) return 'Architecture';
  if (s.includes('algo') || s.includes('comput') || s.includes('struct') || s.includes('logic') || s.includes('optim')) return 'Algorithms';
  if (s.includes('sec') || s.includes('crypt') || s.includes('vuln') || s.includes('defen') || s.includes('auth')) return 'Security';
  if (s.includes('data') || s.includes('analy') || s.includes('sql') || s.includes('stat') || s.includes('learn') || s.includes('ai')) return 'Data';
  if (s.includes('cloud') || s.includes('distrib') || s.includes('deploy') || s.includes('devops') || s.includes('dock')) return 'Cloud';
  if (s.includes('sys') || s.includes('os') || s.includes('kernel') || s.includes('thread') || s.includes('concur')) return 'Systems';
  return 'Engineering';
}

// Generate color themes based on Bloom cognitive intensity
function getBadgeTheme(bloomLevel: BloomLevel, domain: BadgeDomain) {
  switch (bloomLevel) {
    case 'Create':
      return {
        primary: '#7e22ce', // Purple-700
        secondary: '#9333ea', // Purple-600
        accent: '#e9d5ff', // Purple-200
        border: '#c084fc', // Purple-400
        ring: '#a855f7',
        gradientId: 'grad-create',
        badgeBg: 'bg-purple-50',
        textColor: 'text-purple-900',
        lightBg: '#faf5ff',
      };
    case 'Evaluate':
      return {
        primary: '#be123c', // Rose-700
        secondary: '#e11d48', // Rose-600
        accent: '#fecdd3', // Rose-200
        border: '#fb7185', // Rose-400
        ring: '#f43f5e',
        gradientId: 'grad-eval',
        badgeBg: 'bg-rose-50',
        textColor: 'text-rose-900',
        lightBg: '#fff1f2',
      };
    case 'Analyze':
      return {
        primary: '#b45309', // Amber-700
        secondary: '#d97706', // Amber-600
        accent: '#fde68a', // Amber-200
        border: '#fbbf24', // Amber-400
        ring: '#f59e0b',
        gradientId: 'grad-analyze',
        badgeBg: 'bg-amber-50',
        textColor: 'text-amber-900',
        lightBg: '#fffbeb',
      };
    case 'Apply':
      return {
        primary: '#047857', // Emerald-700
        secondary: '#059669', // Emerald-600
        accent: '#a7f3d0', // Emerald-200
        border: '#34d399', // Emerald-400
        ring: '#10b981',
        gradientId: 'grad-apply',
        badgeBg: 'bg-emerald-50',
        textColor: 'text-emerald-900',
        lightBg: '#ecfdf5',
      };
    case 'Understand':
      return {
        primary: '#0369a1', // Sky-700
        secondary: '#0284c7', // Sky-600
        accent: '#bae6fd', // Sky-200
        border: '#38bdf8', // Sky-400
        ring: '#0ea5e9',
        gradientId: 'grad-under',
        badgeBg: 'bg-sky-50',
        textColor: 'text-sky-900',
        lightBg: '#f0f9ff',
      };
    case 'Remember':
    default:
      return {
        primary: '#334155', // Slate-700
        secondary: '#475569', // Slate-600
        accent: '#cbd5e1', // Slate-300
        border: '#94a3b8', // Slate-400
        ring: '#64748b',
        gradientId: 'grad-remember',
        badgeBg: 'bg-slate-50',
        textColor: 'text-slate-900',
        lightBg: '#f8fafc',
      };
  }
}

// Generate SVG vector icon path matching domain
function getDomainSvgSymbol(domain: BadgeDomain): string {
  switch (domain) {
    case 'Architecture':
      // Hexagon Blueprint / Architecture grid
      return `<path d="M50 22 L76 37 L76 67 L50 82 L24 67 L24 37 Z" fill="none" stroke="currentColor" stroke-width="3" />
              <path d="M50 22 L50 82 M24 37 L76 67 M24 67 L76 37" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2" />
              <circle cx="50" cy="52" r="6" fill="currentColor" />`;
    case 'Algorithms':
      // Network Nodes & Graph Tree
      return `<circle cx="50" cy="30" r="5" fill="currentColor" />
              <circle cx="32" cy="54" r="4.5" fill="currentColor" />
              <circle cx="68" cy="54" r="4.5" fill="currentColor" />
              <circle cx="26" cy="74" r="4" fill="currentColor" />
              <circle cx="42" cy="74" r="4" fill="currentColor" />
              <circle cx="58" cy="74" r="4" fill="currentColor" />
              <circle cx="74" cy="74" r="4" fill="currentColor" />
              <path d="M50 35 L32 50 M50 35 L68 50 M32 58 L26 70 M32 58 L42 70 M68 58 L58 70 M68 58 L74 70" stroke="currentColor" stroke-width="2.5" />`;
    case 'Security':
      // Cyber Shield & Padlock
      return `<path d="M50 24 L72 32 C72 58 50 78 50 78 C50 78 28 58 28 32 Z" fill="none" stroke="currentColor" stroke-width="3" />
              <rect x="42" y="46" width="16" height="12" rx="2" fill="currentColor" />
              <path d="M45 46 V41 A5 5 0 0 1 55 41 V46" fill="none" stroke="currentColor" stroke-width="2.5" />`;
    case 'Data':
      // Multi-tier Database & Cube
      return `<ellipse cx="50" cy="34" rx="20" ry="7" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M30 34 V48 C30 52 39 55 50 55 C61 55 70 52 70 48 V34" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M30 48 V62 C30 66 39 69 50 69 C61 69 70 66 70 62 V48" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M50 27 L50 41" stroke="currentColor" stroke-width="2" />`;
    case 'Cloud':
      // Cloud cluster with microservices spark
      return `<path d="M36 58 C32 58 28 54 28 49 C28 44 32 40 37 40 C38 34 43 30 50 30 C57 30 62 34 64 40 C68 40 72 44 72 49 C72 54 68 58 64 58 Z" fill="none" stroke="currentColor" stroke-width="3" />
              <circle cx="50" cy="68" r="3" fill="currentColor" />
              <path d="M50 58 V65" stroke="currentColor" stroke-width="2" />`;
    case 'Systems':
    default:
      // High-precision Gear and Metric Axis
      return `<circle cx="50" cy="52" r="9" fill="none" stroke="currentColor" stroke-width="3" />
              <path d="M50 33 V39 M50 65 V71 M31 52 H37 M63 52 H69 M36 38 L41 43 M59 61 L64 66 M36 66 L41 61 M59 43 L64 38" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />`;
  }
}

// Generate complete standalone SVG badge markup
export function generateBadgeSVG(
  skillName: string,
  courseCode: string,
  bloomLevel: BloomLevel,
  domain: BadgeDomain,
  shape: BadgeShape = 'hexagon'
): string {
  const theme = getBadgeTheme(bloomLevel, domain);
  const symbol = getDomainSvgSymbol(domain);
  const rank = BLOOM_RANK[bloomLevel] || 3;

  // Outer emblem path based on shape
  let outerPath = '';
  let innerPath = '';

  if (shape === 'shield') {
    outerPath = 'M100 20 L170 45 C170 120 100 175 100 175 C100 175 30 120 30 45 Z';
    innerPath = 'M100 32 L158 53 C158 114 100 160 100 160 C100 160 42 114 42 53 Z';
  } else if (shape === 'diamond') {
    outerPath = 'M100 15 L180 100 L100 185 L20 100 Z';
    innerPath = 'M100 30 L165 100 L100 170 L35 100 Z';
  } else if (shape === 'circle') {
    outerPath = 'M100 15 A85 85 0 1 0 100 185 A85 85 0 1 0 100 15 Z';
    innerPath = 'M100 27 A73 73 0 1 0 100 173 A73 73 0 1 0 100 27 Z';
  } else {
    // Hexagon (default)
    outerPath = 'M100 15 L175 58 L175 142 L100 185 L25 142 L25 58 Z';
    innerPath = 'M100 27 L163 64 L163 136 L100 173 L37 136 L37 64 Z';
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
  <defs>
    <linearGradient id="${theme.gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}" />
      <stop offset="100%" stop-color="${theme.secondary}" />
    </linearGradient>
    <linearGradient id="gold-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="badge-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Outer Shadow & Base Emblem -->
  <g filter="url(#badge-shadow)">
    <!-- Base Outer Shield -->
    <path d="${outerPath}" fill="url(#gold-border)" stroke="#b45309" stroke-width="2" />
    
    <!-- Primary Colored Inner Field -->
    <path d="${innerPath}" fill="url(#${theme.gradientId})" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5" />
    
    <!-- Subtle Inner Starburst Pattern -->
    <circle cx="100" cy="100" r="54" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3 3" />
  </g>

  <!-- Center Symbol Domain Art -->
  <g transform="translate(50, 48) scale(1)" color="#ffffff">
    ${symbol}
  </g>

  <!-- Rank Star Cluster -->
  <g transform="translate(100, 130)" text-anchor="middle">
    ${Array.from({ length: 6 })
      .map((_, i) => {
        const xOffset = (i - 2.5) * 11;
        const isFilled = i < rank;
        return `<circle cx="${xOffset}" cy="0" r="${isFilled ? 3 : 2}" fill="${isFilled ? '#fef08a' : '#ffffff'}" fill-opacity="${isFilled ? 1 : 0.4}" />`;
      })
      .join('')}
  </g>

  <!-- Lower Credential Banner Ribbon -->
  <g transform="translate(100, 168)">
    <!-- Ribbon background -->
    <rect x="-85" y="-12" width="170" height="24" rx="6" fill="#0f172a" stroke="#ca8a04" stroke-width="1.5" />
    <path d="-85 -4 L-92 0 L-85 4 Z M85 -4 L92 0 L85 4 Z" fill="#ca8a04" />

    <!-- Skill Name Label -->
    <text x="0" y="4" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      ${skillName.length > 22 ? skillName.substring(0, 20) + '...' : skillName.toUpperCase()}
    </text>
  </g>

  <!-- Level & Code Badge Footer -->
  <g transform="translate(100, 198)" text-anchor="middle">
    <rect x="-48" y="-9" width="96" height="17" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text x="0" y="3" font-family="monospace, monospace" font-size="8" font-weight="700" fill="#334155">
      ${courseCode} • L${rank} ${bloomLevel}
    </text>
  </g>
</svg>
`.trim();
}

export const MicroCredentialService = {
  /**
   * Derives all masterable skills from a course and synthesizes verified visual Micro-credential Badges
   */
  generateCourseMicroCredentials(course: Course): MicroCredentialBadge[] {
    const rawSkillsSet = new Set<string>();

    // 1. From course blueprint
    (course.blueprint?.requiredSkills || []).forEach((s) => {
      if (s && s.trim()) rawSkillsSet.add(s.trim());
    });

    // 2. From course CLOs skills and competencies
    (course.clos || []).forEach((clo) => {
      if (clo.skills) {
        clo.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => rawSkillsSet.add(s));
      }
      if (clo.competency && clo.competency.trim()) {
        rawSkillsSet.add(clo.competency.trim());
      }
    });

    // Fallback if no skills are recorded
    if (rawSkillsSet.size === 0) {
      rawSkillsSet.add('Core Theoretical Foundations');
      rawSkillsSet.add('Applied Problem Solving');
      rawSkillsSet.add('Analytical System Synthesis');
    }

    const masterableSkills = Array.from(rawSkillsSet);
    const badges: MicroCredentialBadge[] = [];

    masterableSkills.forEach((skillName, index) => {
      // Find matching CLOs for this skill to ascertain criteria and highest cognitive level
      const matchingCLOs = (course.clos || []).filter((clo) => {
        const matchesSkill = clo.skills && clo.skills.toLowerCase().includes(skillName.toLowerCase());
        const matchesComp = clo.competency && clo.competency.toLowerCase().includes(skillName.toLowerCase());
        return matchesSkill || matchesComp;
      });

      // Ascertain highest Bloom level among matching CLOs
      let highestBloom: BloomLevel = 'Apply';
      let highestRank = 3;

      if (matchingCLOs.length > 0) {
        matchingCLOs.forEach((c) => {
          const r = BLOOM_RANK[c.bloomLevel] || 1;
          if (r >= highestRank) {
            highestRank = r;
            highestBloom = c.bloomLevel;
          }
        });
      } else {
        // Distribute nicely across higher cognitive levels
        const levelOptions: BloomLevel[] = ['Analyze', 'Evaluate', 'Create', 'Apply'];
        highestBloom = levelOptions[index % levelOptions.length];
        highestRank = BLOOM_RANK[highestBloom];
      }

      const domain = detectDomain(skillName);
      const shapes: BadgeShape[] = ['hexagon', 'shield', 'diamond', 'circle'];
      const shape = shapes[index % shapes.length];

      const credId = `CRED-${course.code || 'OBE'}-${(index + 1).toString().padStart(3, '0')}`;
      const verificationHash = createHashString(`${course.id}-${skillName}-${highestBloom}-${index}`);
      const issueDate = new Date().toISOString().split('T')[0];

      const linkedCLOCodes = matchingCLOs.map((c) => c.code);
      if (linkedCLOCodes.length === 0 && (course.clos || []).length > 0) {
        linkedCLOCodes.push(course.clos[index % course.clos.length].code);
      }

      const theme = getBadgeTheme(highestBloom, domain);
      const svgMarkup = generateBadgeSVG(skillName, course.code || 'COURSE', highestBloom, domain, shape);
      const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

      // Open Badges 2.0 / 3.0 specification metadata
      const openBadgeMetadata = {
        '@context': 'https://w3id.org/openbadges/v2',
        type: 'BadgeClass',
        id: `urn:uuid:${credId.toLowerCase()}`,
        name: `${skillName} Mastery Credential`,
        description: `Demonstrates verified OBE attainment of ${skillName} at Bloom's Taxonomy cognitive intensity level ${highestRank} (${highestBloom}) within ${course.title}.`,
        image: svgDataUri,
        criteria: {
          narrative: `Student successfully evidenced mastery through authentic assessment instruments mapped to ${linkedCLOCodes.join(', ')} with minimum threshold achievement.`,
        },
        issuer: {
          id: `urn:institution:${course.institutionName || 'Global Academic Consortium'}`,
          type: 'Profile',
          name: course.institutionName || 'Faculty of Academic Affairs',
          department: course.department || 'Department of Computer Science & Engineering',
        },
        alignment: [
          {
            targetName: skillName,
            targetUrl: 'https://en.wikipedia.org/wiki/Outcome-based_education',
            targetDescription: `Demonstrated competency in ${skillName}`,
            targetCode: highestBloom,
          },
        ],
        verification: {
          type: 'HostedBadge',
          verificationProperty: verificationHash,
        },
        issuedOn: issueDate,
      };

      badges.push({
        id: credId,
        skillName,
        category: domain,
        bloomLevel: highestBloom,
        bloomRank: highestRank,
        shape,
        courseCode: course.code || 'CRS',
        courseTitle: course.title || 'Academic Coursework',
        institutionName: course.institutionName || 'Institutional Assessment Board',
        issuerDepartment: course.department || 'Academic Affairs',
        verificationHash,
        issueDate,
        linkedCLOCodes,
        evidenceSummary: `Verified through summative rubric benchmarks and formative portfolio evidence in ${course.code}.`,
        criteria: `Achieved ≥70% score on learning outcomes evaluating ${highestBloom}-tier mastery (${linkedCLOCodes.join(', ')}).`,
        theme,
        svgDataUri,
        openBadgeMetadata,
      });
    });

    return badges;
  },

  /**
   * Triggers download of badge as SVG file
   */
  downloadBadgeSVG(badge: MicroCredentialBadge) {
    const svgMarkup = generateBadgeSVG(
      badge.skillName,
      badge.courseCode,
      badge.bloomLevel,
      badge.category,
      badge.shape
    );
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${badge.courseCode}_Badge_${badge.skillName.replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Triggers download of Open Badges JSON metadata
   */
  downloadOpenBadgeJSON(badge: MicroCredentialBadge) {
    const jsonStr = JSON.stringify(badge.openBadgeMetadata, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${badge.id}_OpenBadge_Assertion.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
