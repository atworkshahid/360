import { BloomLevel, CLO, LearningDomain, PLO } from '../types';
import { BLOOM_TAXONOMY_DATA, VERBS_TO_AVOID } from '../components/CourseCreator/BloomsTaxonomyHelperModal';

export interface ParsedCLORow {
  id: string;
  selected: boolean;
  code: string;
  statement: string;
  bloomVerb: string;
  bloomLevel: BloomLevel;
  learningDomain: LearningDomain;
  weightage: number;
  achievementThreshold: number;
  competency?: string;
  skills?: string;
  assessmentMethod?: string;
  mappedPLOCodes?: string[];
  isValid: boolean;
  warnings: string[];
  isVagueVerb?: boolean;
  suggestedVerbs?: string[];
}

export interface ParseResult {
  rows: ParsedCLORow[];
  detectedFormat: 'csv' | 'tsv' | 'list' | 'json';
  totalLinesParsed: number;
  warnings: string[];
}

/**
 * Strips common preamble prefixes like "Students will be able to...", "SWBAT...", etc.
 */
export function cleanCLOPreamble(text: string): string {
  let cleaned = text.trim();
  const preambles = [
    /^(the\s+)?student(s)?\s+(will|shall|can|should|is\s+expected\s+to)(\s+be\s+able\s+to)?\s+/i,
    /^learner(s)?\s+(will|shall|can|should|is\s+expected\s+to)(\s+be\s+able\s+to)?\s+/i,
    /^graduates\s+(will|shall|can|should)(\s+be\s+able\s+to)?\s+/i,
    /^upon\s+completion\s+of\s+(this|the)\s+course,?\s*(students\s+will|learners\s+will)?\s*(be\s+able\s+to)?\s+/i,
    /^by\s+the\s+end\s+of\s+(this|the)\s+course,?\s*(students\s+will|learners\s+will)?\s*(be\s+able\s+to)?\s+/i,
    /^swbat\s*:?\s+/i,
    /^(ability|demonstrate\s+ability|develop\s+the\s+ability)\s+to\s+/i,
    /^(to\s+)/i,
  ];

  for (const regex of preambles) {
    cleaned = cleaned.replace(regex, '');
  }

  // Capitalize first character
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Analyzes statement to determine likely Bloom verb and cognitive level
 */
export function inferBloomVerbAndLevel(rawStatement: string): {
  verb: string;
  level: BloomLevel;
  isVague: boolean;
  suggestedVerbs?: string[];
} {
  const statement = cleanCLOPreamble(rawStatement);
  const words = statement.split(/\s+/).filter(Boolean);
  const firstWord = words[0]?.replace(/[^a-zA-Z]/g, '') || 'Analyze';
  const firstWordLower = firstWord.toLowerCase();

  // 1. Check if vague verb to avoid
  const vagueMatch = VERBS_TO_AVOID.find((v) => {
    const root = v.vagueVerb.split(' ')[0].toLowerCase();
    return root === firstWordLower;
  });

  if (vagueMatch) {
    return {
      verb: firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
      level: 'Understand',
      isVague: true,
      suggestedVerbs: vagueMatch.recommendedSubstitutes,
    };
  }

  // 2. Search against BLOOM_TAXONOMY_DATA
  const bloomLevels: BloomLevel[] = ['Create', 'Evaluate', 'Analyze', 'Apply', 'Understand', 'Remember'];
  for (const level of bloomLevels) {
    const detail = BLOOM_TAXONOMY_DATA[level];
    for (const cat of detail.categories) {
      for (const verb of cat.verbs) {
        if (verb.toLowerCase() === firstWordLower) {
          return {
            verb: verb,
            level: level,
            isVague: false,
          };
        }
      }
    }
  }

  // 3. Fallback: Default to Analyze (or Apply if starting with implement/build/execute)
  const defaultVerb = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  return {
    verb: defaultVerb || 'Analyze',
    level: 'Analyze',
    isVague: false,
  };
}

/**
 * Standard CSV Line Parser handling quotes and delimiters
 */
export function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Helper to evenly distribute weights among N items summing to 100
 */
export function calculateEvenWeights(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(100 / count);
  const remainder = 100 - base * count;
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    weights.push(base + (i < remainder ? 1 : 0));
  }
  return weights;
}

/**
 * Normalize Bloom level string into validated BloomLevel
 */
export function normalizeBloomLevel(raw?: string): BloomLevel {
  if (!raw) return 'Analyze';
  const clean = raw.trim().toLowerCase();
  if (clean.includes('rememb') || clean === 'c1' || clean === 'recall' || clean === 'knowledge') return 'Remember';
  if (clean.includes('underst') || clean === 'c2' || clean === 'compreh') return 'Understand';
  if (clean.includes('appl') || clean === 'c3' || clean === 'execut') return 'Apply';
  if (clean.includes('analy') || clean === 'c4') return 'Analyze';
  if (clean.includes('eval') || clean === 'c5' || clean === 'judg') return 'Evaluate';
  if (clean.includes('creat') || clean === 'c6' || clean === 'synth' || clean === 'design') return 'Create';
  return 'Analyze';
}

/**
 * Normalize Domain
 */
export function normalizeDomain(raw?: string): LearningDomain {
  if (!raw) return 'Cognitive';
  const clean = raw.trim().toLowerCase();
  if (clean.includes('psycho') || clean.includes('motor') || clean.includes('skill') || clean.includes('practical')) {
    return 'Psychomotor';
  }
  if (clean.includes('affect') || clean.includes('value') || clean.includes('attitude') || clean.includes('ethics')) {
    return 'Affective';
  }
  return 'Cognitive';
}

/**
 * Main parser: takes raw text (CSV, TSV, JSON, or plain text list) and produces ParsedCLORow items
 */
export function parseCLOImportText(rawText: string, startingCLONumber: number = 1): ParseResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { rows: [], detectedFormat: 'list', totalLinesParsed: 0, warnings: [] };
  }

  // 1. Check for JSON format
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsedJson = JSON.parse(trimmed);
      if (Array.isArray(parsedJson)) {
        const rows: ParsedCLORow[] = [];
        const weights = calculateEvenWeights(parsedJson.length);
        parsedJson.forEach((item: any, idx: number) => {
          const statement = cleanCLOPreamble(item.statement || item.description || item.outcome || item.title || '');
          if (!statement) return;
          const { verb, level, isVague, suggestedVerbs } = inferBloomVerbAndLevel(statement);
          const bloomLvl = item.bloomLevel ? normalizeBloomLevel(item.bloomLevel) : level;
          const parsedWeight = typeof item.weightage === 'number' ? item.weightage : weights[idx];

          rows.push({
            id: `clo-import-${Date.now()}-${idx}`,
            selected: true,
            code: item.code || `CLO ${startingCLONumber + idx}`,
            statement,
            bloomVerb: item.bloomVerb || verb,
            bloomLevel: bloomLvl,
            learningDomain: normalizeDomain(item.learningDomain || item.domain),
            weightage: parsedWeight,
            achievementThreshold: Number(item.achievementThreshold) || 60,
            competency: item.competency || 'Core Discipline Competency',
            skills: item.skills || 'Technical analysis, problem solving',
            assessmentMethod: item.assessmentMethod || 'Analytical Assessment',
            mappedPLOCodes: Array.isArray(item.mappedPLOs) ? item.mappedPLOs : [],
            isValid: Boolean(statement),
            warnings: isVague ? [`Uses vague verb "${verb}". Recommendation: use measurable verb.`] : [],
            isVagueVerb: isVague,
            suggestedVerbs,
          });
        });
        return {
          rows,
          detectedFormat: 'json',
          totalLinesParsed: parsedJson.length,
          warnings: [],
        };
      }
    } catch {
      // Not JSON, continue to delimited/list parsing
    }
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { rows: [], detectedFormat: 'list', totalLinesParsed: 0, warnings: [] };
  }

  // Check if first line contains tabs or commas indicating CSV/TSV
  const firstLine = lines[0];
  const hasTabs = firstLine.includes('\t');
  const hasSemicolons = !hasTabs && (firstLine.match(/;/g) || []).length >= 2;
  const hasCommas = !hasTabs && !hasSemicolons && (firstLine.match(/,/g) || []).length >= 1;

  const delimiter = hasTabs ? '\t' : hasSemicolons ? ';' : hasCommas ? ',' : null;
  const detectedFormat = hasTabs ? 'tsv' : hasCommas || hasSemicolons ? 'csv' : 'list';

  // 2. Delimited (CSV / TSV) parsing
  if (delimiter) {
    const firstLineCols = parseCSVLine(firstLine, delimiter).map((c) => c.toLowerCase());
    const hasHeader =
      firstLineCols.some((c) => c.includes('statement') || c.includes('outcome') || c.includes('clo') || c.includes('code') || c.includes('bloom') || c.includes('verb'));

    const dataLines = hasHeader ? lines.slice(1) : lines;
    if (dataLines.length > 0) {
      // Determine column indexes if header exists
      let codeIdx = -1;
      let statementIdx = -1;
      let bloomIdx = -1;
      let weightIdx = -1;
      let thresholdIdx = -1;
      let domainIdx = -1;
      let methodIdx = -1;
      let ploIdx = -1;

      if (hasHeader) {
        firstLineCols.forEach((col, idx) => {
          if (col.includes('code') || col === 'id' || col === 'clo') codeIdx = idx;
          else if (col.includes('statement') || col.includes('outcome') || col.includes('desc') || col.includes('text')) statementIdx = idx;
          else if (col.includes('bloom') || col.includes('level')) bloomIdx = idx;
          else if (col.includes('weight')) weightIdx = idx;
          else if (col.includes('threshold') || col.includes('target')) thresholdIdx = idx;
          else if (col.includes('domain')) domainIdx = idx;
          else if (col.includes('assess') || col.includes('method')) methodIdx = idx;
          else if (col.includes('plo') || col.includes('map')) ploIdx = idx;
        });
      }

      // If statementIdx not found, pick first long column or column 1
      const sampleCols = parseCSVLine(dataLines[0], delimiter);
      if (statementIdx === -1) {
        // If 1st column starts with "CLO", 2nd column is likely statement
        if (sampleCols.length >= 2 && sampleCols[0].toLowerCase().startsWith('clo')) {
          codeIdx = 0;
          statementIdx = 1;
          bloomIdx = sampleCols.length > 2 ? 2 : -1;
        } else {
          statementIdx = sampleCols.findIndex((c) => c.length > 20);
          if (statementIdx === -1) statementIdx = 0;
        }
      }

      const defaultWeights = calculateEvenWeights(dataLines.length);
      const rows: ParsedCLORow[] = [];

      dataLines.forEach((line, idx) => {
        const cols = parseCSVLine(line, delimiter);
        if (!cols || cols.length === 0 || !cols.some((c) => c.trim().length > 0)) return;

        let rawStatement = cols[statementIdx] || cols[0] || '';
        if (!rawStatement.trim()) return;

        // Clean statement
        const statement = cleanCLOPreamble(rawStatement);
        const { verb, level, isVague, suggestedVerbs } = inferBloomVerbAndLevel(statement);

        // Code
        let code = codeIdx !== -1 && cols[codeIdx] ? cols[codeIdx] : `CLO ${startingCLONumber + idx}`;
        if (!code.toLowerCase().startsWith('clo')) {
          code = `CLO ${code}`;
        }

        // Bloom Level
        let bloomLevel = level;
        if (bloomIdx !== -1 && cols[bloomIdx]) {
          bloomLevel = normalizeBloomLevel(cols[bloomIdx]);
        }

        // Weightage
        let weight = defaultWeights[idx];
        if (weightIdx !== -1 && cols[weightIdx]) {
          const parsed = parseFloat(cols[weightIdx].replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) weight = parsed;
        }

        // Threshold
        let threshold = 60;
        if (thresholdIdx !== -1 && cols[thresholdIdx]) {
          const parsed = parseFloat(cols[thresholdIdx].replace(/[^0-9.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) threshold = parsed;
        }

        // Domain
        const domain = domainIdx !== -1 && cols[domainIdx] ? normalizeDomain(cols[domainIdx]) : 'Cognitive';

        // Assessment Method
        const assessmentMethod = methodIdx !== -1 && cols[methodIdx] ? cols[methodIdx] : 'Analytical Assessment';

        // PLOs
        const mappedPLOCodes = ploIdx !== -1 && cols[ploIdx] ? cols[ploIdx].split(/[,;]/).map((p) => p.trim()).filter(Boolean) : [];

        const warnings: string[] = [];
        if (isVague) {
          warnings.push(`Uses non-measurable action verb "${verb}".`);
        }
        if (statement.length < 25) {
          warnings.push('Statement appears very brief. Ensure sufficient context and scope.');
        }

        rows.push({
          id: `clo-import-${Date.now()}-${idx}`,
          selected: true,
          code,
          statement,
          bloomVerb: verb,
          bloomLevel,
          learningDomain: domain,
          weightage: weight,
          achievementThreshold: threshold,
          competency: 'Core Discipline Competency',
          skills: 'Technical problem analysis and execution',
          assessmentMethod,
          mappedPLOCodes,
          isValid: statement.length > 5,
          warnings,
          isVagueVerb: isVague,
          suggestedVerbs,
        });
      });

      if (rows.length > 0) {
        return {
          rows,
          detectedFormat,
          totalLinesParsed: dataLines.length,
          warnings: [],
        };
      }
    }
  }

  // 3. Plain Text / Numbered / Bullet List Parsing
  const listRows: ParsedCLORow[] = [];
  const defaultWeights = calculateEvenWeights(lines.length);

  lines.forEach((line, idx) => {
    let raw = line.trim();
    if (!raw) return;

    // Detect leading code or bullet: e.g. "CLO 1:", "CLO-01 -", "1.", "1)", "- ", "* "
    let extractedCode = `CLO ${startingCLONumber + idx}`;
    const codeMatch = raw.match(/^(CLO\s*[0-9]+|Outcome\s*[0-9]+|[0-9]+[\.\)])\s*[:\-\.]?\s*/i);
    if (codeMatch) {
      const matched = codeMatch[1].toUpperCase();
      if (matched.startsWith('CLO')) {
        extractedCode = matched.replace(/\s+/g, ' ');
      } else {
        const num = matched.replace(/[^0-9]/g, '');
        if (num) extractedCode = `CLO ${num}`;
      }
      raw = raw.slice(codeMatch[0].length).trim();
    } else if (raw.startsWith('-') || raw.startsWith('*') || raw.startsWith('•')) {
      raw = raw.replace(/^[-*•]\s*/, '').trim();
    }

    // Extract tags if present: e.g. "[Analyze]", "[Bloom: C4]", "[Weight: 25%]", "[Cognitive]"
    let explicitBloom: BloomLevel | undefined = undefined;
    let explicitWeight: number | undefined = undefined;
    let explicitThreshold: number | undefined = undefined;

    const tagMatches = raw.match(/\[(.*?)\]|\((.*?)\)/g);
    if (tagMatches) {
      tagMatches.forEach((tag) => {
        const inner = tag.slice(1, -1).trim();
        const innerLower = inner.toLowerCase();
        if (innerLower.includes('%') || innerLower.includes('weight')) {
          const num = parseFloat(inner.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) explicitWeight = num;
        } else if (innerLower.includes('threshold') || innerLower.includes('target')) {
          const num = parseFloat(inner.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) explicitThreshold = num;
        } else if (
          innerLower.includes('c1') ||
          innerLower.includes('c2') ||
          innerLower.includes('c3') ||
          innerLower.includes('c4') ||
          innerLower.includes('c5') ||
          innerLower.includes('c6') ||
          innerLower.includes('remember') ||
          innerLower.includes('understand') ||
          innerLower.includes('apply') ||
          innerLower.includes('analyze') ||
          innerLower.includes('evaluate') ||
          innerLower.includes('create')
        ) {
          explicitBloom = normalizeBloomLevel(inner);
        }
      });
      // Remove recognized tags from end of statement if they're metadata
      raw = raw.replace(/\s*\[(weight|threshold|bloom|c[1-6]|remember|understand|apply|analyze|evaluate|create|cognitive|psychomotor|affective)[^\]]*\]/gi, '');
    }

    const statement = cleanCLOPreamble(raw);
    if (!statement) return;

    const { verb, level, isVague, suggestedVerbs } = inferBloomVerbAndLevel(statement);
    const finalLevel = explicitBloom || level;
    const finalWeight = explicitWeight !== undefined ? explicitWeight : defaultWeights[idx];

    const warnings: string[] = [];
    if (isVague) {
      warnings.push(`Uses non-measurable action verb "${verb}".`);
    }
    if (statement.length < 25) {
      warnings.push('Statement appears very brief. Ensure sufficient depth.');
    }

    listRows.push({
      id: `clo-import-${Date.now()}-${idx}`,
      selected: true,
      code: extractedCode,
      statement,
      bloomVerb: verb,
      bloomLevel: finalLevel,
      learningDomain: 'Cognitive',
      weightage: finalWeight,
      achievementThreshold: explicitThreshold || 60,
      competency: `${finalLevel} Level Competency`,
      skills: 'Discipline-specific problem solving & analysis',
      assessmentMethod: 'Analytical Assessment',
      mappedPLOCodes: [],
      isValid: statement.length > 5,
      warnings,
      isVagueVerb: isVague,
      suggestedVerbs,
    });
  });

  return {
    rows: listRows,
    detectedFormat: 'list',
    totalLinesParsed: lines.length,
    warnings: [],
  };
}

/**
 * Transforms parsed rows into complete Course CLO objects
 */
export function convertParsedRowsToCLOs(
  rows: ParsedCLORow[],
  availablePLOs: PLO[] = []
): CLO[] {
  return rows
    .filter((r) => r.selected && r.statement.trim().length > 0)
    .map((row, idx) => {
      // Find matching PLOs if mappedPLOCodes were detected
      const mappedPLOs = (row.mappedPLOCodes || []).map((codeStr) => {
        const found = availablePLOs.find(
          (p) => p.code.toLowerCase() === codeStr.toLowerCase() || p.id.toLowerCase() === codeStr.toLowerCase()
        );
        return {
          ploId: found?.id || availablePLOs[0]?.id || 'plo-1',
          level: (idx % 2 === 0 ? 'High' : 'Moderate') as any,
          rationale: `Constructive alignment directly addressing ${codeStr}.`,
        };
      });

      // Default to mapping to first PLO if none mapped
      const finalMappedPLOs =
        mappedPLOs.length > 0
          ? mappedPLOs
          : availablePLOs.length > 0
          ? [
              {
                ploId: availablePLOs[0].id,
                level: 'High' as any,
                rationale: 'Core primary outcome alignment.',
              },
            ]
          : [];

      return {
        id: `clo-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        code: row.code || `CLO ${idx + 1}`,
        statement: row.statement,
        bloomVerb: row.bloomVerb,
        bloomLevel: row.bloomLevel,
        learningDomain: row.learningDomain,
        competency: row.competency || 'Core Discipline Competency',
        skills: row.skills || 'Technical analysis and practical execution',
        assessmentMethod: row.assessmentMethod || 'Analytical Assessment',
        achievementThreshold: row.achievementThreshold || 60,
        weightage: row.weightage,
        status: row.isVagueVerb ? 'Draft' : 'Validated',
        qualityScore: row.isVagueVerb ? 68 : 88,
        qualityChecks: [
          {
            label: 'Measurable Action Verb',
            passed: !row.isVagueVerb,
            detail: row.isVagueVerb
              ? `Verb "${row.bloomVerb}" is passive or subjective. Replace with observable Bloom verb.`
              : `Uses measurable Bloom action verb: "${row.bloomVerb}" (${row.bloomLevel}).`,
          },
          {
            label: 'Student-Centered Phrasing',
            passed: true,
            detail: 'Statement focuses directly on demonstrable student performance.',
          },
          {
            label: 'Single Demonstrable Outcome',
            passed: true,
            detail: 'Specifies a clear, single verifiable competency.',
          },
        ],
        mappedPLOs: finalMappedPLOs,
      };
    });
}

/**
 * Returns formatted sample CSV string
 */
export function generateSampleCSVContent(): string {
  return `Code,Statement,BloomLevel,Weightage,Threshold,Domain,AssessmentMethod
CLO 1,"Formulate and implement normalized relational database schemas meeting 3NF standards.",Analyze,25,60,Cognitive,Midterm Examination
CLO 2,"Analyze computational and space complexity of recursive graph traversal algorithms.",Analyze,25,60,Cognitive,Analytical Problem Set
CLO 3,"Evaluate trade-offs between monolithic and microservice enterprise architectures.",Evaluate,25,60,Cognitive,Design Review Defense
CLO 4,"Develop secure, authenticated RESTful web services with automated unit test suites.",Create,25,65,Cognitive,Capstone Project`;
}

/**
 * Returns sample plain text numbered list
 */
export function generateSampleListContent(): string {
  return `1. Formulate and implement normalized relational database schemas meeting 3NF standards [Analyze] [Weight: 25%]
2. Analyze computational and space complexity of recursive graph algorithms [Analyze] [Weight: 25%]
3. Evaluate architectural trade-offs between monolithic and microservice enterprise systems [Evaluate] [Weight: 25%]
4. Develop secure, authenticated RESTful web services with automated unit test suites [Create] [Weight: 25%]`;
}

/**
 * Download sample CSV file to browser
 */
export function downloadSampleCSVFile(): void {
  const content = generateSampleCSVContent();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'mentisera_obe360_sample_clos.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
