import JSZip from 'jszip';
import { Course, CLO, Module, Assessment, Rubric, RubricCriterion } from '../types';

export interface LMSExportOptions {
  includeSyllabus?: boolean;
  includeRubrics?: boolean;
  includeAssessments?: boolean;
  includeCQI?: boolean;
  packageFormat?: 'imscc12' | 'imscc13' | 'thin';
}

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an IMS Common Cartridge (v1.2 compliant) .imscc zip file.
 * Compatible with Moodle (Course Restore), Blackboard Learn / Ultra (Import Common Cartridge),
 * Canvas (Import CC 1.x), and D2L Brightspace.
 */
export async function generateCommonCartridgeZip(
  course: Course,
  options: LMSExportOptions = {}
): Promise<Blob> {
  const {
    includeSyllabus = true,
    includeRubrics = true,
    includeAssessments = true,
    includeCQI = true,
  } = options;

  const zip = new JSZip();
  const courseCode = course.code || 'COURSE';
  const courseTitle = course.title || 'OBE Course';
  const manifestId = `CC_${courseCode.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

  // 1. Generate imsmanifest.xml
  let itemsXml = '';
  let resourcesXml = '';

  // Syllabus resource
  if (includeSyllabus) {
    itemsXml += `
      <item identifier="item_syllabus" identifierref="res_syllabus">
        <title>Course Syllabus &amp; OBE Blueprint: ${escapeXml(courseTitle)}</title>
      </item>`;

    resourcesXml += `
    <resource identifier="res_syllabus" type="webcontent" href="syllabus.html">
      <file href="syllabus.html"/>
    </resource>`;

    const syllabusHtml = generateSyllabusHtml(course, includeCQI);
    zip.file('syllabus.html', syllabusHtml);
  }

  // Course Learning Outcomes document
  itemsXml += `
      <item identifier="item_outcomes" identifierref="res_outcomes">
        <title>Course Learning Outcomes (CLO) &amp; Bloom's Taxonomy Matrix</title>
      </item>`;

  resourcesXml += `
    <resource identifier="res_outcomes" type="webcontent" href="outcomes.html">
      <file href="outcomes.html"/>
    </resource>`;

  const outcomesHtml = generateOutcomesHtml(course);
  zip.file('outcomes.html', outcomesHtml);

  // Modular hierarchy
  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((mod: Module, index: number) => {
      const modId = `item_mod_${mod.number || index + 1}`;
      const resId = `res_mod_${mod.number || index + 1}`;
      const fileName = `module_${mod.number || index + 1}.html`;

      itemsXml += `
      <item identifier="${modId}" identifierref="${resId}">
        <title>Module ${mod.number || index + 1}: ${escapeXml(mod.title)}</title>
      </item>`;

      resourcesXml += `
    <resource identifier="${resId}" type="webcontent" href="${fileName}">
      <file href="${fileName}"/>
    </resource>`;

      const modHtml = generateModuleHtml(mod, course);
      zip.file(fileName, modHtml);
    });
  }

  // Assessments & Rubrics
  if (includeAssessments && course.assessments && course.assessments.length > 0) {
    itemsXml += `
      <item identifier="item_assessments" identifierref="res_assessments">
        <title>Assessment Blueprint &amp; Constructive Alignment Guide</title>
      </item>`;

    resourcesXml += `
    <resource identifier="res_assessments" type="webcontent" href="assessments.html">
      <file href="assessments.html"/>
    </resource>`;

    const assessHtml = generateAssessmentsHtml(course, includeRubrics);
    zip.file('assessments.html', assessHtml);
  }

  // Competency Framework CSV & XML for Moodle / Blackboard inside the CC package
  const moodleCsv = generateMoodleCompetencyCSV(course);
  zip.file('moodle_competencies.csv', moodleCsv);

  const bbRubricXml = generateBlackboardRubricXML(course);
  zip.file('blackboard_rubrics.xml', bbRubricXml);

  const canvasCsv = generateCanvasOutcomesCSV(course);
  zip.file('canvas_outcomes.csv', canvasCsv);

  // IMS Manifest XML
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" xmlns="http://www.imsglobal.org/xsd/imsccv1p2/imscp_v1p1"
          xmlns:lom="http://ltsc.ieee.org/xsd/imsccv1p2/LOM/resource"
          xmlns:lomimscc="http://ltsc.ieee.org/xsd/imsccv1p2/LOM/manifest"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imsccv1p2/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p2/ccv1p2_imscp_v1p1.xsd">
  <metadata>
    <schema>IMS Common Cartridge</schema>
    <schemaversion>1.2.0</schemaversion>
    <lomimscc:lom>
      <lomimscc:general>
        <lomimscc:title>
          <lomimscc:string language="en-US">${escapeXml(courseTitle)} (${escapeXml(courseCode)})</lomimscc:string>
        </lomimscc:title>
        <lomimscc:description>
          <lomimscc:string language="en-US">${escapeXml(course.description || '')}</lomimscc:string>
        </lomimscc:description>
        <lomimscc:keyword>
          <lomimscc:string language="en-US">OBE</lomimscc:string>
        </lomimscc:keyword>
        <lomimscc:keyword>
          <lomimscc:string language="en-US">Constructive Alignment</lomimscc:string>
        </lomimscc:keyword>
        <lomimscc:keyword>
          <lomimscc:string language="en-US">${escapeXml(course.category || course.programme || 'Education')}</lomimscc:string>
        </lomimscc:keyword>
      </lomimscc:general>
      <lomimscc:educational>
        <lomimscc:typicalLearningTime>
          <lomimscc:duration>P${course.durationWeeks || 16}W</lomimscc:duration>
        </lomimscc:typicalLearningTime>
      </lomimscc:educational>
    </lomimscc:lom>
  </metadata>
  <organizations default="org_1">
    <organization identifier="org_1" structure="rooted-hierarchy">
      <item identifier="root_item">
        <title>${escapeXml(courseTitle)}</title>
        ${itemsXml}
      </item>
    </organization>
  </organizations>
  <resources>
    ${resourcesXml}
  </resources>
</manifest>`;

  zip.file('imsmanifest.xml', manifestXml);

  // Generate binary blob (.imscc is a zip file)
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.ims.imscc.package',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Triggers browser download of the generated Common Cartridge (.imscc)
 */
export async function downloadCommonCartridge(course: Course, options: LMSExportOptions = {}): Promise<void> {
  const blob = await generateCommonCartridgeZip(course, options);
  const safeName = (course.code || 'course').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `${safeName}-common-cartridge.imscc`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates Moodle-compatible Competency Framework CSV.
 * Directly importable in Moodle: Site Admin > Competencies > Import competency framework.
 */
export function generateMoodleCompetencyCSV(course: Course): string {
  const headers = [
    'Parent ID number',
    'ID number',
    'Name',
    'Description',
    'Description format',
    'Scale values',
    'Scale configuration',
    'Related ID numbers',
    'Taxonomy',
  ];

  const rows: string[][] = [];
  const frameworkId = `FRAMEWORK_${course.code || 'OBE'}`;

  // Root competency framework row
  rows.push([
    '',
    frameworkId,
    `${course.code || 'OBE'}: ${course.title || 'Course'} Competencies`,
    `Outcome-Based Education Competency Framework for ${course.title}. Aligned with Bloom's Taxonomy.`,
    '1', // HTML
    'Not Yet Competent,Competent,Exemplary',
    '[{"name":"Not Yet Competent","scaleid":1},{"name":"Competent","scaleid":2},{"name":"Exemplary","scaleid":3}]',
    '',
    'competency',
  ]);

  // CLOs as direct competencies
  (course.clos || []).forEach((clo: CLO) => {
    const cloId = `CLO_${course.code || 'C'}_${clo.code.replace(/[^a-zA-Z0-9]/g, '')}`;
    const mappedPlos = (clo.mappedPLOs || []).map((m) => m.ploId).join(', ');
    const desc = `<p>${escapeXml(clo.statement)}</p><p><strong>Bloom's Taxonomy Level:</strong> ${escapeXml(clo.bloomLevel || '')} | <strong>Domain:</strong> ${escapeXml(clo.learningDomain || 'Cognitive')} | <strong>Weight:</strong> ${clo.weightage || 0}% | <strong>Pass Benchmark:</strong> ${clo.achievementThreshold || 60}%</p>${mappedPlos ? `<p><strong>Mapped PLOs:</strong> ${escapeXml(mappedPlos)}</p>` : ''}`;

    rows.push([
      frameworkId,
      cloId,
      `${clo.code}: ${clo.statement.slice(0, 60)}${clo.statement.length > 60 ? '...' : ''}`,
      desc,
      '1',
      'Not Yet Competent,Competent,Exemplary',
      '[{"name":"Not Yet Competent","scaleid":1},{"name":"Competent","scaleid":2},{"name":"Exemplary","scaleid":3}]',
      mappedPlos,
      'competency',
    ]);
  });

  // Convert to CSV
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((r) => r.map(escapeCSVValue).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Generates Canvas-compatible Learning Outcomes CSV.
 * Importable in Canvas LMS: Course Settings > Outcomes > Import.
 */
export function generateCanvasOutcomesCSV(course: Course): string {
  const headers = [
    'vendor_guid',
    'object_type',
    'title',
    'description',
    'calculation_method',
    'calculation_int',
    'mastery_points',
    'ratings',
  ];

  const rows: string[][] = [];

  // Group row
  const groupId = `group_${course.code || 'obe'}`;
  rows.push([
    groupId,
    'group',
    `${course.code} Outcomes`,
    `Course Learning Outcomes for ${course.title}`,
    '',
    '',
    '',
    '',
  ]);

  // Outcome rows
  (course.clos || []).forEach((clo: CLO) => {
    const guid = `clo_${course.code || 'c'}_${clo.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const ratings = `4,Exemplary,3,Mastery (Proficient),2,Developing,1,Unsatisfactory`;

    rows.push([
      guid,
      'outcome',
      `${clo.code} - ${clo.bloomLevel || 'Cognitive'}`,
      clo.statement,
      'highest',
      '',
      '3',
      ratings,
    ]);
  });

  return [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((r) => r.map(escapeCSVValue).join(',')),
  ].join('\r\n');
}

/**
 * Generates Blackboard Learn Rubric & Outcomes XML.
 * Standard format for Blackboard Learn Grade Center / Outcomes Assessment import.
 */
export function generateBlackboardRubricXML(course: Course): string {
  let rubricsXml = '';

  (course.rubrics || []).forEach((rubric, rIdx) => {
    let rowsXml = '';
    const criteria = rubric.criteria || [];

    criteria.forEach((crit: RubricCriterion, cIdx) => {
      let cellsXml = '';
      const levels = crit.levels || [
        { level: 'Exemplary', pointsRange: '100%', descriptor: 'Exceeds target performance benchmarks' },
        { level: 'Proficient', pointsRange: '75%', descriptor: 'Meets target performance benchmarks' },
        { level: 'Developing', pointsRange: '50%', descriptor: 'Partially meets expectations with gaps' },
        { level: 'Not Achieved', pointsRange: '25%', descriptor: 'Does not demonstrate minimum outcome threshold' },
      ];

      levels.forEach((lvl, lIdx) => {
        const percentage = lvl.pointsRange ? lvl.pointsRange.replace(/[^0-9]/g, '') || (100 - lIdx * 25) : (100 - lIdx * 25);
        cellsXml += `
          <CELL id="c_${cIdx}_${lIdx}">
            <PERCENTAGE>${percentage}</PERCENTAGE>
            <DESCRIPTION>${escapeXml(lvl.descriptor)}</DESCRIPTION>
          </CELL>`;
      });

      rowsXml += `
        <ROW id="row_${cIdx}">
          <HEADER>${escapeXml(crit.criterionName || `Criterion ${cIdx + 1}`)}</HEADER>
          <WEIGHT>${crit.weight || Math.round(100 / (criteria.length || 1))}</WEIGHT>
          <CELLS>
            ${cellsXml}
          </CELLS>
        </ROW>`;
    });

    rubricsXml += `
    <RUBRIC id="rubric_${rIdx + 1}">
      <TITLE>${escapeXml(rubric.title || `${course.code} Rubric ${rIdx + 1}`)}</TITLE>
      <DESCRIPTION>OBE Performance Rubric</DESCRIPTION>
      <TYPE>PERCENT</TYPE>
      <ROWS>
        ${rowsXml}
      </ROWS>
    </RUBRIC>`;
  });

  // If no rubrics configured yet, generate a default CLO assessment rubric
  if (!rubricsXml) {
    rubricsXml = `
    <RUBRIC id="rubric_default_obe">
      <TITLE>${escapeXml(course.code)} Comprehensive OBE Assessment Rubric</TITLE>
      <DESCRIPTION>Constructive Alignment Evaluation Rubric</DESCRIPTION>
      <TYPE>PERCENT</TYPE>
      <ROWS>
        <ROW id="row_1">
          <HEADER>Mastery of Course Learning Outcomes (CLOs)</HEADER>
          <WEIGHT>50</WEIGHT>
          <CELLS>
            <CELL id="c1_4"><PERCENTAGE>100</PERCENTAGE><DESCRIPTION>Exemplary integration and critical execution of outcomes.</DESCRIPTION></CELL>
            <CELL id="c1_3"><PERCENTAGE>75</PERCENTAGE><DESCRIPTION>Solid execution meeting course proficiency threshold.</DESCRIPTION></CELL>
            <CELL id="c1_2"><PERCENTAGE>50</PERCENTAGE><DESCRIPTION>Developing execution with minor conceptual gaps.</DESCRIPTION></CELL>
            <CELL id="c1_1"><PERCENTAGE>25</PERCENTAGE><DESCRIPTION>Unsatisfactory demonstration of outcome.</DESCRIPTION></CELL>
          </CELLS>
        </ROW>
        <ROW id="row_2">
          <HEADER>Direct Evidence &amp; Problem Solving</HEADER>
          <WEIGHT>50</WEIGHT>
          <CELLS>
            <CELL id="c2_4"><PERCENTAGE>100</PERCENTAGE><DESCRIPTION>Rigorous methodology with comprehensive evidence.</DESCRIPTION></CELL>
            <CELL id="c2_3"><PERCENTAGE>75</PERCENTAGE><DESCRIPTION>Appropriate methodology with sufficient evidence.</DESCRIPTION></CELL>
            <CELL id="c2_2"><PERCENTAGE>50</PERCENTAGE><DESCRIPTION>Inconsistent evidence or incomplete problem analysis.</DESCRIPTION></CELL>
            <CELL id="c2_1"><PERCENTAGE>25</PERCENTAGE><DESCRIPTION>Deficient evidence.</DESCRIPTION></CELL>
          </CELLS>
        </ROW>
      </ROWS>
    </RUBRIC>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<BLACKBOARD_RUBRICS xmlns="http://www.blackboard.com/rubrics/v1"
                    course_code="${escapeXml(course.code)}"
                    course_title="${escapeXml(course.title)}">
  ${rubricsXml}
</BLACKBOARD_RUBRICS>`;
}

/**
 * Generates QTI 2.1 Assessment Blueprint XML.
 * Standard format for quiz and test interoperability in Moodle and Blackboard.
 */
export function generateQTIAssessmentsXML(course: Course): string {
  let itemsXml = '';

  (course.assessments || []).forEach((item: Assessment, idx: number) => {
    itemsXml += `
    <assessmentSection identifier="section_${idx + 1}" title="${escapeXml(item.name)}" visible="true">
      <rubricBlock view="all">
        <p><strong>Assessment Type:</strong> ${escapeXml(item.type)}</p>
        <p><strong>Weightage:</strong> ${item.weightage}% | <strong>Passing Threshold:</strong> ${item.achievementThreshold || 50}%</p>
        <p><strong>Target CLOs:</strong> ${(item.linkedCLOIds || []).join(', ')}</p>
        <p><strong>Bloom's Taxonomy:</strong> ${escapeXml(item.bloomLevel || 'Evaluate')}</p>
      </rubricBlock>
    </assessmentSection>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                identifier="TEST_${course.code || 'OBE'}_ASSESSMENTS"
                title="${escapeXml(course.title)} - Assessment Blueprint">
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <testPart identifier="part_1" navigationMode="linear" submissionMode="individual">
    ${itemsXml}
  </testPart>
</assessmentTest>`;
}

// Helpers for CSV escaping
function escapeCSVValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// HTML Generator helpers for IMS Common Cartridge web content
function generateSyllabusHtml(course: Course, includeCQI: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(course.title)} - Syllabus</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 860px; margin: 0 auto; padding: 32px 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 8px; font-size: 26px; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 3px 8px; background: #e0e7ff; color: #4338ca; border-radius: 6px; font-size: 12px; font-weight: 600; margin-right: 6px; }
    h2 { color: #1e293b; margin-top: 28px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>${escapeXml(course.title)}</h1>
  <div class="meta">
    <span class="badge">${escapeXml(course.code || 'COURSE')}</span>
    <span class="badge">${course.creditHours || 3} Credit Hours</span>
    <span class="badge">${escapeXml(course.courseLevel || 'Undergraduate')}</span>
    <span class="badge">${course.durationWeeks || 16} Weeks</span>
  </div>

  <h2>Course Description</h2>
  <p>${escapeXml(course.description || 'Comprehensive OBE course curriculum specification.')}</p>

  <h2>Course Learning Outcomes (CLOs)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">CLO Code</th>
        <th style="width: 55%;">Learning Outcome Statement</th>
        <th style="width: 15%;">Bloom Level</th>
        <th style="width: 15%;">Weight / Target</th>
      </tr>
    </thead>
    <tbody>
      ${(course.clos || [])
        .map(
          (c) => `
        <tr>
          <td><strong>${escapeXml(c.code)}</strong></td>
          <td>${escapeXml(c.statement)}</td>
          <td>${escapeXml(c.bloomLevel || 'Analyze')}</td>
          <td>${c.weightage || 0}% (Pass: ${c.achievementThreshold || 60}%)</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>Grading &amp; Assessment Weightage Scheme</h2>
  <table>
    <thead>
      <tr>
        <th>Assessment Title</th>
        <th>Type</th>
        <th>Weight</th>
        <th>Passing Benchmark</th>
        <th>Mapped Outcomes</th>
      </tr>
    </thead>
    <tbody>
      ${(course.assessments || [])
        .map(
          (a) => `
        <tr>
          <td><strong>${escapeXml(a.name)}</strong></td>
          <td>${escapeXml(a.type)}</td>
          <td>${a.weightage}%</td>
          <td>${a.achievementThreshold || 50}%</td>
          <td>${(a.linkedCLOIds || []).join(', ')}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  ${
    includeCQI && course.cqiPlan
      ? `
  <h2>Continuous Quality Improvement (CQI)</h2>
  <div class="card">
    <p><strong>Cohort / Term:</strong> ${escapeXml(course.cqiPlan.cohortTerm)}</p>
    <p><strong>Reflection:</strong> ${escapeXml(course.cqiPlan.attainmentReflection)}</p>
    <p><strong>Intervention Plan:</strong> ${escapeXml(course.cqiPlan.plannedInterventions)}</p>
    <p><strong>Target Metric:</strong> ${escapeXml(course.cqiPlan.targetMetric)}</p>
  </div>`
      : ''
  }
</body>
</html>`;
}

function generateOutcomesHtml(course: Course): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OBE Learning Outcomes - ${escapeXml(course.code)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 860px; margin: 0 auto; padding: 32px 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; }
    .clo-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fff; }
    .clo-code { font-weight: bold; color: #4338ca; font-size: 16px; }
    .tags { margin-top: 8px; font-size: 12px; }
    .tag { display: inline-block; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; margin-right: 6px; color: #475569; }
  </style>
</head>
<body>
  <h1>Course Learning Outcomes (CLOs) &amp; Bloom's Alignment</h1>
  <p>Every outcome is designed around active verbs and mapped directly into Moodle/Blackboard competency tracking.</p>

  ${(course.clos || [])
    .map(
      (clo) => `
    <div class="clo-card">
      <div class="clo-code">${escapeXml(clo.code)}</div>
      <p style="margin: 8px 0; font-size: 14px;">${escapeXml(clo.statement)}</p>
      <div class="tags">
        <span class="tag">Bloom Level: <strong>${escapeXml(clo.bloomLevel || 'Analyze')}</strong></span>
        <span class="tag">Domain: <strong>${escapeXml(clo.learningDomain || 'Cognitive')}</strong></span>
        <span class="tag">Weightage: <strong>${clo.weightage || 0}%</strong></span>
        <span class="tag">Attainment Target: <strong>${clo.achievementThreshold || 60}%</strong></span>
        ${(clo.mappedPLOs || []).length > 0 ? `<span class="tag">Mapped PLOs: <strong>${clo.mappedPLOs.map((m) => m.ploId).join(', ')}</strong></span>` : ''}
      </div>
    </div>`
    )
    .join('')}
</body>
</html>`;
}

function generateModuleHtml(mod: Module, course: Course): string {
  const moduleMlos = (course.mlos || []).filter((m) => m.moduleId === mod.id);
  const moduleLessons = (course.lessons || []).filter((l) => l.moduleId === mod.id);
  const moduleActivities = (course.activities || []).filter((a) => a.moduleId === mod.id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Module ${mod.number}: ${escapeXml(mod.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 860px; margin: 0 auto; padding: 32px 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 22px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 18px; }
    h2 { font-size: 16px; color: #334155; margin-top: 20px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>Module ${mod.number}: ${escapeXml(mod.title)}</h1>
  <div class="meta">
    Duration: ${mod.durationWeeks || 1} Weeks | Expected Study: ${mod.expectedStudyHours || 10} Hours | Course: ${escapeXml(course.code || '')}
  </div>

  <h2>Description &amp; Objectives</h2>
  <p>${escapeXml(mod.description || 'Instructional unit content and delivery scaffolding.')}</p>

  ${
    moduleMlos.length > 0
      ? `
  <h2>Module Learning Outcomes (MLOs)</h2>
  <ul>
    ${moduleMlos.map((mlo) => `<li><strong>${escapeXml(mlo.code)}:</strong> ${escapeXml(mlo.statement)} (${escapeXml(mlo.bloomLevel)})</li>`).join('')}
  </ul>`
      : ''
  }

  ${
    moduleLessons.length > 0
      ? `
  <h2>Lessons &amp; Topics Covered</h2>
  <ul>
    ${moduleLessons.map((l) => `<li><strong>${escapeXml(l.title)}</strong> (${l.durationMins || 45} mins): ${escapeXml(l.learningObjective || '')}</li>`).join('')}
  </ul>`
      : ''
  }

  ${
    moduleActivities.length > 0
      ? `
  <h2>Learning Activities &amp; Evidence</h2>
  <ul>
    ${moduleActivities.map((act) => `<li><strong>${escapeXml(act.title)}</strong> [${escapeXml(act.activityType)}]: ${escapeXml(act.studentActionPrompt || '')}</li>`).join('')}
  </ul>`
      : ''
  }
</body>
</html>`;
}

function generateAssessmentsHtml(course: Course, includeRubrics: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Assessment Blueprint &amp; Rubrics - ${escapeXml(course.code)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 860px; margin: 0 auto; padding: 32px 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; font-size: 24px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fff; }
    h2 { font-size: 18px; color: #1e293b; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Constructive Assessment Blueprint</h1>
  <p>Every assessment item delivers direct evidence for specific Course Learning Outcomes (CLOs) according to Biggs' Constructive Alignment.</p>

  ${(course.assessments || [])
    .map(
      (a) => `
    <div class="card">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #4338ca;">${escapeXml(a.name)} (${escapeXml(a.type)})</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b;">
        Weight: <strong>${a.weightage}%</strong> | Passing Benchmark: <strong>${a.achievementThreshold || 50}%</strong> | Bloom's Level: <strong>${escapeXml(a.bloomLevel || 'Evaluate')}</strong>
      </p>
      <p style="margin: 0; font-size: 13px;">Target Outcomes: <strong>${(a.linkedCLOIds || []).join(', ') || 'All CLOs'}</strong></p>
    </div>`
    )
    .join('')}

  ${
    includeRubrics && course.rubrics && course.rubrics.length > 0
      ? `
  <h2>Grading Rubrics</h2>
  ${course.rubrics
    .map(
      (r) => `
    <div class="card">
      <h4 style="margin: 0 0 6px 0;">${escapeXml(r.title)}</h4>
      <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">OBE Performance Rubric</p>
      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Weight</th>
            <th>Mastery Expectations</th>
          </tr>
        </thead>
        <tbody>
          ${(r.criteria || [])
            .map(
              (c) => `
            <tr>
              <td><strong>${escapeXml(c.criterionName)}</strong></td>
              <td>${c.weight}%</td>
              <td>${escapeXml(c.levels && c.levels[0] ? c.levels[0].descriptor : 'Target evidence')}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
    )
    .join('')}`
      : ''
  }
</body>
</html>`;
}
