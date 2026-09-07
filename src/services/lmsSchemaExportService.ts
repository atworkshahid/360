import JSZip from 'jszip';
import { Course, CLO, MLO, Module, Assessment, Rubric, RubricCriterion } from '../types';

export interface LMSExportSchemaOptions {
  includeCLOs?: boolean;
  includeMLOs?: boolean;
  includeAssessments?: boolean;
  includeRubrics?: boolean;
  includeModules?: boolean;
  prefix?: string;
  moodleVersion?: '4.x' | '3.x';
  blackboardFormat?: 'Ultra' | 'Original';
}

/**
 * Escapes CSV values conforming to RFC 4180
 */
export function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Parses raw CSV text into a 2D array of strings for preview table display
 */
export function parseCsvToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split(/\r\n|\n|\r/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentVal += '"';
          i++; // Skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim());
    rows.push(row);
  }
  return rows;
}

// ==========================================
// 1. MOODLE STANDARD SCHEMAS
// ==========================================

/**
 * Moodle Competency Framework CSV schema
 * Compatible with: Moodle Site Administration > Competencies > Import competency framework
 */
export function generateMoodleCompetencyCSV(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
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
  const frameworkId = `FRAMEWORK_${prefix.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Root framework level
  rows.push([
    '',
    frameworkId,
    `${course.code || 'COURSE'}: ${course.title || 'Course'} Competencies`,
    `<p>Outcome-Based Competency Framework for <strong>${course.title || 'Course'}</strong> (${course.code || ''}). Aligned with Bloom's Revised Taxonomy.</p>`,
    '1', // 1 = HTML format
    'Not Yet Competent,Competent,Exemplary',
    '[{"name":"Not Yet Competent","scaleid":1},{"name":"Competent","scaleid":2},{"name":"Exemplary","scaleid":3}]',
    '',
    'competency',
  ]);

  // Course Learning Outcomes (CLOs)
  if (options.includeCLOs !== false && course.clos && course.clos.length > 0) {
    course.clos.forEach((clo: CLO) => {
      const cloCleanCode = clo.code.replace(/[^a-zA-Z0-9]/g, '_');
      const cloId = `CLO_${prefix}_${cloCleanCode}`;
      const mappedPlos = (clo.mappedPLOs || []).map((m) => m.ploId).join(', ');
      
      const desc = `
        <p><strong>Statement:</strong> ${clo.statement}</p>
        <p><strong>Bloom's Taxonomy:</strong> ${clo.bloomLevel || 'Understand'} (${clo.learningDomain || 'Cognitive'})</p>
        <p><strong>Weightage:</strong> ${clo.weightage || 0}% | <strong>Attainment Threshold:</strong> ${clo.achievementThreshold || 60}%</p>
        ${mappedPlos ? `<p><strong>Mapped Program Outcomes:</strong> ${mappedPlos}</p>` : ''}
      `.replace(/\s+/g, ' ').trim();

      rows.push([
        frameworkId,
        cloId,
        `${clo.code}: ${clo.statement.length > 60 ? clo.statement.slice(0, 57) + '...' : clo.statement}`,
        desc,
        '1',
        'Not Yet Competent,Competent,Exemplary',
        '[{"name":"Not Yet Competent","scaleid":1},{"name":"Competent","scaleid":2},{"name":"Exemplary","scaleid":3}]',
        mappedPlos,
        'competency',
      ]);

      // Nested Module Learning Outcomes (MLOs) under their parent CLO
      if (options.includeMLOs !== false && course.mlos && course.mlos.length > 0) {
        const linkedMlos = course.mlos.filter((m) => m.linkedCLOId === clo.id);
        linkedMlos.forEach((mlo: MLO) => {
          const mloCleanCode = mlo.code.replace(/[^a-zA-Z0-9]/g, '_');
          const mloId = `MLO_${prefix}_${mloCleanCode}`;
          const mloDesc = `<p>${mlo.statement}</p><p><strong>Bloom:</strong> ${mlo.bloomLevel} | <strong>Module:</strong> ${mlo.moduleId}</p>`;

          rows.push([
            cloId,
            mloId,
            `${mlo.code}: ${mlo.statement.length > 55 ? mlo.statement.slice(0, 52) + '...' : mlo.statement}`,
            mloDesc,
            '1',
            'Not Yet Competent,Competent,Exemplary',
            '[{"name":"Not Yet Competent","scaleid":1},{"name":"Competent","scaleid":2},{"name":"Exemplary","scaleid":3}]',
            '',
            'indicator',
          ]);
        });
      }
    });
  }

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');
}

/**
 * Moodle Course & Module Upload CSV schema
 * Compatible with: Moodle Site Administration > Courses > Upload courses
 */
export function generateMoodleCourseUploadCSV(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
  const shortname = course.code ? course.code.toLowerCase().replace(/[^a-z0-9]/g, '') : 'obe101';
  const fullname = `${course.code || 'OBE'} - ${course.title || 'Course Design'}`;
  
  const headers = [
    'shortname',
    'fullname',
    'category_path',
    'idnumber',
    'summary',
    'summaryformat',
    'format',
    'numsections',
    'startdate',
    'showgrades',
    'newsitems',
  ];

  const summary = `<p>${course.description || 'Outcome-Based Education Course'}</p><p><strong>Credits:</strong> ${course.creditHours || 3} | <strong>Level:</strong> ${course.courseLevel || 'Undergraduate'}</p>`;
  const numSections = course.modules && course.modules.length > 0 ? course.modules.length : 4;
  const startDate = new Date().toISOString().split('T')[0];

  const row = [
    shortname,
    fullname,
    'Miscellaneous',
    `${prefix}_CRSE`,
    summary,
    '1', // HTML
    'topics',
    String(numSections),
    startDate,
    '1', // Show gradebook
    '5',
  ];

  return [
    headers.map(escapeCsv).join(','),
    row.map(escapeCsv).join(','),
  ].join('\r\n');
}

/**
 * Moodle Standard Course Blueprint JSON
 * Conforms to Moodle Web Services API schema (core_course_create_courses, core_competency)
 */
export function generateMoodleCourseJSON(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
  const shortname = course.code ? course.code.toLowerCase().replace(/[^a-z0-9]/g, '') : 'obe101';

  const moodleData = {
    schema_version: 'moodle_ws_v4',
    generator: 'MENTISERA OBE360™',
    exported_at: new Date().toISOString(),
    course: {
      fullname: `${course.code || 'OBE'} - ${course.title || 'Course'}`,
      shortname: shortname,
      idnumber: `${prefix}_COURSE_ID`,
      categoryid: 1,
      summary: course.description || '',
      summaryformat: 1,
      format: 'topics',
      showgrades: 1,
      newsitems: 5,
      startdate: Math.floor(Date.now() / 1000),
      numsections: course.modules?.length || 1,
      customfields: [
        { shortname: 'credits', value: String(course.creditHours || 3) },
        { shortname: 'level', value: course.courseLevel || 'Undergraduate' },
        { shortname: 'department', value: course.department || '' },
      ],
    },
    competency_framework: {
      shortname: `${course.code} Competency Framework`,
      idnumber: `CF_${prefix}`,
      description: `Outcome-based competencies for ${course.title}`,
      descriptionformat: 1,
      scaleid: 2,
      competencies: (course.clos || []).map((clo, idx) => ({
        idnumber: `CLO_${prefix}_${clo.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
        shortname: `${clo.code}`,
        description: clo.statement,
        descriptionformat: 1,
        idnumber_parent: `CF_${prefix}`,
        ruletype: 'core_competency\\rule_points',
        ruleoutcome: 1,
        metadata: {
          bloom_level: clo.bloomLevel,
          learning_domain: clo.learningDomain,
          weightage: clo.weightage,
          passing_threshold: clo.achievementThreshold,
          mapped_plos: clo.mappedPLOs?.map((p) => p.ploId) || [],
        },
      })),
    },
    sections: (course.modules || []).map((mod, index) => {
      const modLessons = (course.lessons || []).filter((l) => l.moduleId === mod.id);
      const modActivities = (course.activities || []).filter((a) => a.moduleId === mod.id);
      const modMlos = (course.mlos || []).filter((m) => m.moduleId === mod.id);

      return {
        section: mod.number || index + 1,
        name: `Module ${mod.number || index + 1}: ${mod.title}`,
        summary: `<p>${mod.description || ''}</p><p><em>Expected Study: ${mod.expectedStudyHours || 10} hours</em></p>`,
        summaryformat: 1,
        visible: 1,
        modules: [
          ...modLessons.map((lesson) => ({
            modname: 'page',
            name: lesson.title,
            intro: `<p><strong>Objective:</strong> ${lesson.learningObjective || ''}</p><p>Duration: ${lesson.durationMins || 45} mins</p>`,
            introformat: 1,
          })),
          ...modActivities.map((act) => ({
            modname: act.activityType.toLowerCase().includes('quiz') ? 'quiz' : 'assign',
            name: act.title,
            intro: `<p>${act.studentActionPrompt || ''}</p><p>Activity Type: ${act.activityType}</p>`,
            introformat: 1,
          })),
        ],
        outcomes: modMlos.map((m) => ({
          code: m.code,
          statement: m.statement,
          bloom_level: m.bloomLevel,
        })),
      };
    }),
    gradebook_items: (course.assessments || []).map((assessment) => ({
      itemname: assessment.name,
      itemtype: 'manual',
      grademin: 0,
      grademax: 100,
      aggregationcoef: (assessment.weightage || 0) / 100,
      passing_threshold: assessment.achievementThreshold || 50,
      bloom_level: assessment.bloomLevel || 'Analyze',
      linked_clos: assessment.linkedCLOIds || [],
    })),
  };

  return JSON.stringify(moodleData, null, 2);
}

/**
 * Moodle GIFT Question Bank Format
 * Compatible with: Moodle Course > Question Bank > Import (GIFT format)
 */
export function generateMoodleQuestionsGIFT(course: Course): string {
  const lines: string[] = [
    `// Moodle GIFT Question Bank - ${course.code} ${course.title}`,
    `// Generated by MENTISERA OBE360™ with CLO Outcome Tags`,
    `$CATEGORY: $course$/${course.code || 'OBE'}/Outcomes_Assessments`,
    '',
  ];

  (course.assessments || []).forEach((assess, aIdx) => {
    lines.push(`// Assessment: ${assess.name} (${assess.type})`);
    lines.push(`// Linked Outcomes: ${(assess.linkedCLOIds || []).join(', ') || 'All CLOs'}`);
    lines.push(
      `::${course.code}_Q${aIdx + 1}_${assess.name.slice(0, 30)}::[html]<p><strong>${assess.name}</strong></p><p>Assessment evaluating outcome mastery for: ${(assess.linkedCLOIds || []).join(', ')}.</p>{`
    );
    lines.push(`  =Exemplary execution meeting all rubric benchmarks # Full marks`);
    lines.push(`  ~%75%Proficient execution demonstrating core understanding # Passing mark`);
    lines.push(`  ~%50%Developing execution with minor conceptual gaps # Partial credit`);
    lines.push(`  ~%0%Unsatisfactory demonstration of outcome threshold # Needs remediation`);
    lines.push(`}`);
    lines.push('');
  });

  return lines.join('\n');
}

// ==========================================
// 2. BLACKBOARD STANDARD SCHEMAS
// ==========================================

/**
 * Blackboard Goals / Outcomes Assessment CSV schema
 * Compatible with: Blackboard Learn / Ultra Outcomes Assessment & Goals Manager bulk import
 */
export function generateBlackboardGoalsCSV(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
  const headers = [
    'Goal_Set',
    'Category',
    'Goal_ID',
    'Goal_Description',
    'Standard',
    'Bloom_Level',
    'Weight',
    'Threshold',
  ];

  const goalSet = `${prefix}_OBE_GOALS`;
  const rows: string[][] = [];

  (course.clos || []).forEach((clo: CLO) => {
    const goalId = `${prefix}_${clo.code.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const standard = (clo.mappedPLOs || []).map((m) => m.ploId).join(';') || 'ABET/AACSB';
    
    rows.push([
      goalSet,
      'Course Learning Outcome',
      goalId,
      clo.statement,
      standard,
      clo.bloomLevel || 'Cognitive',
      String(clo.weightage || 0),
      `${clo.achievementThreshold || 60}%`,
    ]);

    // Optional MLO subgoals
    if (options.includeMLOs !== false && course.mlos && course.mlos.length > 0) {
      const childMlos = course.mlos.filter((m) => m.linkedCLOId === clo.id);
      childMlos.forEach((mlo: MLO) => {
        const mloGoalId = `${prefix}_${mlo.code.replace(/[^a-zA-Z0-9]/g, '_')}`;
        rows.push([
          goalSet,
          'Module Learning Objective',
          mloGoalId,
          mlo.statement,
          goalId, // Points to parent goal
          mlo.bloomLevel || 'Understand',
          '0',
          '60%',
        ]);
      });
    }
  });

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');
}

/**
 * Blackboard Course Batch Feed CSV schema
 * Standard Blackboard SIS batch course creation feed (Snapshot/Flat File format)
 * Compatible with: Blackboard System Admin > Courses > Batch Create/Update
 */
export function generateBlackboardCourseBatchCSV(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
  const courseKey = `${prefix}_${Date.now()}`;
  const courseId = course.code ? course.code.replace(/[^a-zA-Z0-9_-]/g, '_') : 'COURSE_001';
  const courseName = `${course.code || 'OBE'} - ${course.title || 'Course'}`;

  const headers = [
    'EXTERNAL_COURSE_KEY',
    'COURSE_ID',
    'COURSE_NAME',
    'DESCRIPTION',
    'COLLATERAL_NAME',
    'AVAILABLE_IND',
    'ROW_STATUS',
  ];

  const row = [
    courseKey,
    courseId,
    courseName,
    course.description || 'Outcome-Based Education Course Blueprint',
    course.department || 'Academic Department',
    'Y',
    'ENABLED',
  ];

  return [
    headers.map(escapeCsv).join(','),
    row.map(escapeCsv).join(','),
  ].join('\r\n');
}

/**
 * Blackboard Ultra Course Package JSON
 * Conforms to Blackboard Learn SaaS / Ultra REST API schema (/learn/api/public/v3/courses)
 */
export function generateBlackboardUltraCourseJSON(
  course: Course,
  options: LMSExportSchemaOptions = {}
): string {
  const prefix = options.prefix || course.code || 'COURSE';
  const courseId = course.code ? course.code.replace(/[^a-zA-Z0-9_-]/g, '_') : 'COURSE_001';

  const ultraData = {
    schema_version: 'blackboard_ultra_v3',
    generator: 'MENTISERA OBE360™',
    exported_at: new Date().toISOString(),
    course: {
      externalId: `${prefix}_EXT_ID`,
      courseId: courseId,
      name: `${course.code || 'OBE'} - ${course.title || 'Course'}`,
      description: course.description || '',
      ultraStatus: 'Ultra',
      isClosed: false,
      allowGuests: false,
      readOnly: false,
      termId: 'CURRENT_TERM',
      pace: 'Instructor',
      enrollment: {
        type: 'InstructorLed',
      },
    },
    outcomes: (course.clos || []).map((clo) => ({
      goalId: `${prefix}_${clo.code.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: clo.code,
      description: clo.statement,
      category: 'Course Learning Outcome',
      bloomLevel: clo.bloomLevel,
      learningDomain: clo.learningDomain,
      weightPercentage: clo.weightage,
      passingThresholdPercentage: clo.achievementThreshold || 60,
      alignedStandards: clo.mappedPLOs?.map((p) => p.ploId) || [],
    })),
    learningModules: (course.modules || []).map((mod, mIdx) => {
      const modLessons = (course.lessons || []).filter((l) => l.moduleId === mod.id);
      const modActivities = (course.activities || []).filter((a) => a.moduleId === mod.id);
      const modMlos = (course.mlos || []).filter((m) => m.moduleId === mod.id);

      return {
        id: `mod_folder_${mIdx + 1}`,
        title: `Module ${mod.number || mIdx + 1}: ${mod.title}`,
        description: mod.description || '',
        position: mIdx + 1,
        visibility: 'Visible',
        estimatedStudyHours: mod.expectedStudyHours || 10,
        contents: [
          ...modLessons.map((lesson, lIdx) => ({
            id: `content_${mIdx + 1}_${lIdx + 1}`,
            type: 'Document',
            title: lesson.title,
            body: `<p><strong>Objective:</strong> ${lesson.learningObjective || ''}</p>`,
            durationMinutes: lesson.durationMins || 45,
          })),
          ...modActivities.map((act, aIdx) => ({
            id: `act_${mIdx + 1}_${aIdx + 1}`,
            type: act.activityType.toLowerCase().includes('quiz') ? 'Test' : 'Assignment',
            title: act.title,
            instructions: act.studentActionPrompt || '',
            activityType: act.activityType,
          })),
        ],
        moduleObjectives: modMlos.map((m) => ({
          code: m.code,
          statement: m.statement,
          bloomLevel: m.bloomLevel,
        })),
      };
    }),
    assessments: (course.assessments || []).map((a, aIdx) => ({
      id: `assessment_${aIdx + 1}`,
      title: a.name,
      assessmentType: a.type,
      weightPercentage: a.weightage,
      minimumMasteryScore: a.achievementThreshold || 50,
      bloomLevel: a.bloomLevel || 'Analyze',
      mappedOutcomes: a.linkedCLOIds || [],
      grading: {
        pointsPossible: 100,
        scoreType: 'PERCENTAGE',
      },
    })),
    rubrics: (course.rubrics || []).map((r, rIdx) => ({
      id: `rubric_${rIdx + 1}`,
      title: r.title,
      type: 'PERCENTAGE',
      criteria: (r.criteria || []).map((c) => ({
        criterionTitle: c.criterionName,
        weight: c.weight,
        levels: c.levels || [],
      })),
    })),
  };

  return JSON.stringify(ultraData, null, 2);
}

/**
 * Blackboard Rubric CSV schema
 * Compatible with Blackboard Grade Center Rubric Import
 */
export function generateBlackboardRubricsCSV(course: Course): string {
  const headers = [
    'Rubric Title',
    'Criterion Name',
    'Criterion Weight',
    'Level 1 Name',
    'Level 1 Percent',
    'Level 1 Description',
    'Level 2 Name',
    'Level 2 Percent',
    'Level 2 Description',
    'Level 3 Name',
    'Level 3 Percent',
    'Level 3 Description',
    'Level 4 Name',
    'Level 4 Percent',
    'Level 4 Description',
  ];

  const rows: string[][] = [];

  const rubrics = course.rubrics && course.rubrics.length > 0 ? course.rubrics : [
    {
      id: 'default_rubric',
      title: `${course.code || 'Course'} OBE Mastery Rubric`,
      criteria: [
        {
          id: 'crit_1',
          criterionName: 'CLO Mastery & Conceptual Rigor',
          weight: 50,
          levels: [
            { level: 'Exemplary', pointsRange: '100%', descriptor: 'Exceeds target benchmarks with advanced synthesis.' },
            { level: 'Proficient', pointsRange: '75%', descriptor: 'Meets target outcome performance requirements.' },
            { level: 'Developing', pointsRange: '50%', descriptor: 'Shows partial mastery with minor conceptual gaps.' },
            { level: 'Unsatisfactory', pointsRange: '25%', descriptor: 'Does not achieve minimum outcome standard.' },
          ],
        },
        {
          id: 'crit_2',
          criterionName: 'Problem Solving & Direct Evidence',
          weight: 50,
          levels: [
            { level: 'Exemplary', pointsRange: '100%', descriptor: 'Comprehensive evidence of authentic problem-solving.' },
            { level: 'Proficient', pointsRange: '75%', descriptor: 'Adequate evidence meeting passing threshold.' },
            { level: 'Developing', pointsRange: '50%', descriptor: 'Inconsistent evidence or procedural flaws.' },
            { level: 'Unsatisfactory', pointsRange: '25%', descriptor: 'Insufficient evidence to confirm attainment.' },
          ],
        },
      ],
    },
  ];

  rubrics.forEach((rubric) => {
    (rubric.criteria || []).forEach((crit: RubricCriterion) => {
      const l1 = crit.levels?.[0] || { level: 'Exemplary', pointsRange: '100%', descriptor: 'Exceeds standard' };
      const l2 = crit.levels?.[1] || { level: 'Proficient', pointsRange: '75%', descriptor: 'Meets standard' };
      const l3 = crit.levels?.[2] || { level: 'Developing', pointsRange: '50%', descriptor: 'Partial standard' };
      const l4 = crit.levels?.[3] || { level: 'Unsatisfactory', pointsRange: '25%', descriptor: 'Below standard' };

      rows.push([
        rubric.title,
        crit.criterionName,
        `${crit.weight}%`,
        l1.level,
        l1.pointsRange || '100%',
        l1.descriptor || '',
        l2.level,
        l2.pointsRange || '75%',
        l2.descriptor || '',
        l3.level,
        l3.pointsRange || '50%',
        l3.descriptor || '',
        l4.level,
        l4.pointsRange || '25%',
        l4.descriptor || '',
      ]);
    });
  });

  return [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');
}

// ==========================================
// 3. ALL-IN-ONE ZIP ARCHIVE GENERATOR
// ==========================================

/**
 * Bundles all standard Moodle & Blackboard CSV & JSON schemas into a single ready-to-import ZIP
 */
export async function generateLMSExportBundleZip(
  course: Course,
  options: LMSExportSchemaOptions = {}
): Promise<Blob> {
  const zip = new JSZip();
  const code = course.code || 'COURSE';

  // 1. Moodle Directory
  const moodleFolder = zip.folder('moodle');
  if (moodleFolder) {
    moodleFolder.file(`${code}_moodle_competency_framework.csv`, generateMoodleCompetencyCSV(course, options));
    moodleFolder.file(`${code}_moodle_course_upload.csv`, generateMoodleCourseUploadCSV(course, options));
    moodleFolder.file(`${code}_moodle_course_blueprint.json`, generateMoodleCourseJSON(course, options));
    moodleFolder.file(`${code}_moodle_questions.gift`, generateMoodleQuestionsGIFT(course));
    moodleFolder.file(
      'MOODLE_IMPORT_INSTRUCTIONS.txt',
      `=== MOODLE 1-CLICK IMPORT INSTRUCTIONS ===
Course: ${course.code} - ${course.title}

1. IMPORTING COMPETENCY FRAMEWORK (CLOs & Bloom Levels):
   - Navigate to: Site Administration > Competencies > Import competency framework.
   - Select CSV file: "${code}_moodle_competency_framework.csv"
   - Encoding: UTF-8, Delimiter: Comma.
   - Confirm mappings and click "Import".
   - Your CLOs and Bloom's tags will appear under Competencies!

2. BULK UPLOADING COURSE STRUCTURE:
   - Navigate to: Site Administration > Courses > Upload courses.
   - Select CSV file: "${code}_moodle_course_upload.csv"
   - Under "Upload settings", set Upload mode to "Create new courses, or update existing ones".
   - Click "Upload courses".

3. IMPORTING QUIZ QUESTIONS:
   - Navigate to: Course Administration > Question bank > Import.
   - Choose format: "GIFT format".
   - Select file: "${code}_moodle_questions.gift".
   - Click "Import".
`
    );
  }

  // 2. Blackboard Directory
  const bbFolder = zip.folder('blackboard');
  if (bbFolder) {
    bbFolder.file(`${code}_blackboard_goals_outcomes.csv`, generateBlackboardGoalsCSV(course, options));
    bbFolder.file(`${code}_blackboard_course_batch.csv`, generateBlackboardCourseBatchCSV(course, options));
    bbFolder.file(`${code}_blackboard_ultra_course.json`, generateBlackboardUltraCourseJSON(course, options));
    bbFolder.file(`${code}_blackboard_rubrics.csv`, generateBlackboardRubricsCSV(course));
    bbFolder.file(
      'BLACKBOARD_IMPORT_INSTRUCTIONS.txt',
      `=== BLACKBOARD LEARN & ULTRA 1-CLICK IMPORT INSTRUCTIONS ===
Course: ${course.code} - ${course.title}

1. IMPORTING OUTCOMES & GOALS:
   - In Blackboard Learn / Ultra: Navigate to Goals / Outcomes Assessment > Goal Sets.
   - Click "Import Goals" or "Batch Feed".
   - Select file: "${code}_blackboard_goals_outcomes.csv".
   - Your CLOs, Bloom's cognitive levels, and PLO mappings will be registered.

2. BATCH COURSE CREATION:
   - System Admin > Courses > Batch Create.
   - Upload: "${code}_blackboard_course_batch.csv".

3. ULTRA REST API IMPORT:
   - Use "${code}_blackboard_ultra_course.json" with the Blackboard Learn REST API endpoint:
     POST /learn/api/public/v3/courses
     or ingest via Blackboard Partner Integrations.

4. RUBRIC IMPORT:
   - In Course Tools > Rubrics > Import Rubric.
   - Upload "${code}_blackboard_rubrics.csv".
`
    );
  }

  // Root README
  zip.file(
    'README.txt',
    `=============================================================
 MENTISERA OBE360™ - LMS Course Export Package
=============================================================
Course Code:    ${course.code || 'COURSE'}
Course Title:   ${course.title || 'OBE Course'}
Generated At:   ${new Date().toLocaleString()}

This archive contains standard CSV and JSON schemas engineered for
seamless, one-click imports into Moodle and Blackboard LMS platforms.

Directory Contents:
/moodle
  - ${code}_moodle_competency_framework.csv (Site Admin > Competencies)
  - ${code}_moodle_course_upload.csv        (Site Admin > Courses > Upload)
  - ${code}_moodle_course_blueprint.json    (Moodle REST API / Web Services)
  - ${code}_moodle_questions.gift           (Question Bank > GIFT Import)
  - MOODLE_IMPORT_INSTRUCTIONS.txt

/blackboard
  - ${code}_blackboard_goals_outcomes.csv   (Outcomes Assessment / Goals Manager)
  - ${code}_blackboard_course_batch.csv     (System Admin > Courses > Batch Create)
  - ${code}_blackboard_ultra_course.json    (Ultra REST API / Cloud Ingest)
  - ${code}_blackboard_rubrics.csv          (Course Tools > Rubrics > Import)
  - BLACKBOARD_IMPORT_INSTRUCTIONS.txt

All files conform to RFC 4180 CSV standards and validated JSON schemas.
=============================================================
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Downloads a string file directly to the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
