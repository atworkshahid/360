import React from 'react';
import { Course } from '../../types';
import { OBEFrameworkRegistry } from '../../utils/OBEFrameworkRegistry';
import { DEFAULT_INSTITUTION } from '../../data/institutionData';
import { MicroCredentialService } from '../../utils/microCredentialService';

interface PrintableCourseSummaryProps {
  course: Course;
}

export const PrintableCourseSummary: React.FC<PrintableCourseSummaryProps> = ({ course }) => {
  const framework = OBEFrameworkRegistry.getGuidebook(
    course.frameworkId || course.accreditationFramework
  );

  const totalAssessmentWeight = (course.assessments || []).reduce(
    (acc, a) => acc + (Number(a.weightage) || 0),
    0
  );

  const totalMarks = (course.assessments || []).reduce(
    (acc, a) => acc + (Number(a.marks) || 0),
    0
  );

  // Generate verified micro-credential badges for masterable skills
  const badges = MicroCredentialService.generateCourseMicroCredentials(course);

  // Extract competencies and skills
  const compSet = new Set<string>();
  const skillSet = new Set<string>();
  (course.blueprint?.targetCompetencies || []).forEach(c => compSet.add(c));
  (course.blueprint?.requiredSkills || []).forEach(s => skillSet.add(s));
  (course.clos || []).forEach(clo => {
    if (clo.competency) compSet.add(clo.competency);
    if (clo.skills) {
      clo.skills.split(',').map(s => s.trim()).filter(Boolean).forEach(s => skillSet.add(s));
    }
  });

  return (
    <div
      id="printable-course-summary"
      className="hidden print:block print:w-full print:bg-white text-slate-900 font-sans text-left print:m-0 print:p-0"
    >
      {/* 1. Institutional & Header Block */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10pt] font-bold uppercase tracking-wider text-slate-500">
              {course.institutionName || DEFAULT_INSTITUTION.name}
            </div>
            <div className="text-[9pt] text-slate-500">
              {course.department || 'Department of Academic Affairs'} • {course.programme || 'Undergraduate Curriculum'}
            </div>
            <h1 className="text-[18pt] font-black text-slate-950 mt-1 leading-tight">
              {course.title || 'Untitled Course'}
            </h1>
            <div className="text-[10pt] font-mono text-slate-700 mt-1 font-bold">
              Course Code: <span className="text-slate-900">{course.code || 'OBE-COURSE'}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {course.institutionLogo ? (
              <img
                src={course.institutionLogo}
                alt="Institution Logo"
                className="max-h-14 max-w-[140px] object-contain ml-auto mb-1"
              />
            ) : (
              <div className="inline-block border border-slate-300 rounded px-2.5 py-1 text-[8pt] font-mono uppercase bg-slate-50">
                Official Syllabus
              </div>
            )}
            <div className="text-[8.5pt] text-slate-500 mt-1">
              Standard: <strong>{framework.code}</strong>
            </div>
            <div className="text-[8pt] text-slate-400 font-mono">
              Printed: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Essential Academic Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 text-[9pt]">
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[7.5pt] uppercase font-bold">Credits</span>
            <span className="font-bold text-slate-900">
              {course.creditHours} Units ({course.theoryHours ?? 3} Th - {course.labHours ?? 0} Lab)
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[7.5pt] uppercase font-bold">Level & Term</span>
            <span className="font-bold text-slate-900">
              {course.courseLevel || 'Undergraduate'} • {course.semester || 'Semester 1'}
            </span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[7.5pt] uppercase font-bold">Delivery Mode</span>
            <span className="font-bold text-slate-900">{course.deliveryMode || 'In-Person'}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 block text-[7.5pt] uppercase font-bold">Pass Benchmark</span>
            <span className="font-bold text-slate-900">{course.passingBenchmark || 50}%</span>
          </div>
        </div>
      </div>

      {/* 2. Course Description & Pedagogical Purpose */}
      <section className="print-avoid-break mb-6 space-y-3">
        <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
          1. Course Description &amp; Educational Purpose
        </h2>
        <div className="text-[9.5pt] leading-relaxed text-slate-800">
          <p>{course.description || 'No description entered.'}</p>
        </div>

        {course.courseRationale && (
          <div className="text-[9pt] text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong className="text-slate-900 block text-[8pt] uppercase font-bold mb-0.5">
              Course Rationale &amp; Industry Relevance:
            </strong>
            {course.courseRationale}
          </div>
        )}

        {course.capstoneGoal && (
          <div className="text-[9pt] text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong className="text-slate-900 block text-[8pt] uppercase font-bold mb-0.5">
              Capstone Learning Promise:
            </strong>
            {course.capstoneGoal}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-[9pt] pt-1">
          <div>
            <span className="font-bold text-slate-900 text-[8pt] uppercase block">Prerequisites:</span>
            <span className="text-slate-700">{course.prerequisites || 'None specified'}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-[8pt] uppercase block">Target Learners:</span>
            <span className="text-slate-700">{course.targetLearners || 'Open Enrollment'}</span>
          </div>
        </div>

        {/* Competencies & Skills Tags */}
        {(compSet.size > 0 || skillSet.size > 0) && (
          <div className="pt-2 border-t border-slate-100 text-[8.5pt]">
            <span className="font-bold text-slate-900 block mb-1">Target Competencies &amp; Skills:</span>
            <div className="flex flex-wrap gap-1">
              {Array.from(compSet).map((c) => (
                <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 text-[8pt] font-medium">
                  ★ {c}
                </span>
              ))}
              {Array.from(skillSet).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[8pt]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Course Learning Outcomes (CLOs) */}
      <section className="print-avoid-break mb-6">
        <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          2. Course Learning Outcomes (CLOs)
        </h2>
        <table className="w-full text-[9pt] border-collapse print-table">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300">
              <th className="p-2 border border-slate-300 w-16 text-center">Outcome</th>
              <th className="p-2 border border-slate-300">Statement</th>
              <th className="p-2 border border-slate-300 w-28 text-center">Bloom Depth</th>
              <th className="p-2 border border-slate-300 w-20 text-center">Weight</th>
              <th className="p-2 border border-slate-300 w-20 text-center">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {(course.clos || []).map((clo, idx) => (
              <tr key={clo.id || idx} className="border border-slate-300">
                <td className="p-2 border border-slate-300 font-mono font-bold text-center bg-slate-50/50">
                  {clo.code}
                </td>
                <td className="p-2 border border-slate-300 leading-snug">
                  <div>{clo.statement}</div>
                  {(clo.competency || clo.skills) && (
                    <div className="text-[7.5pt] text-slate-500 mt-1">
                      {clo.competency && <span>Competency: <strong>{clo.competency}</strong></span>}
                      {clo.skills && <span> • Skills: {clo.skills}</span>}
                    </div>
                  )}
                </td>
                <td className="p-2 border border-slate-300 text-center">
                  <span className="font-bold text-slate-900">{clo.bloomLevel}</span>
                  <span className="block text-[7.5pt] text-slate-500">{clo.learningDomain}</span>
                </td>
                <td className="p-2 border border-slate-300 text-center font-mono">
                  {clo.weightage}%
                </td>
                <td className="p-2 border border-slate-300 text-center font-mono">
                  ≥{clo.achievementThreshold}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 3.5 Certified Micro-credential Badges for Masterable Skills */}
      {badges.length > 0 && (
        <section className="print-avoid-break mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
            <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide">
              Certified Micro-credentials &amp; Masterable Skills
            </h2>
            <span className="text-[8pt] font-mono text-slate-500">
              Open Badges 2.0 / 3.0 Standard
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {badges.slice(0, 8).map((badge) => (
              <div
                key={badge.id}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 flex flex-col items-center justify-between"
              >
                <div className="w-16 h-20 mb-1 flex items-center justify-center">
                  <img
                    src={badge.svgDataUri}
                    alt={badge.skillName}
                    className="w-full h-full object-contain filter drop-shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[8pt] font-bold text-slate-900 truncate w-full" title={badge.skillName}>
                  {badge.skillName}
                </div>
                <div className="text-[7pt] text-slate-500 font-mono mt-0.5">
                  L{badge.bloomRank} {badge.bloomLevel} • {badge.id}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PLO Constructive Alignment Matrix */}
      {course.plos && course.plos.length > 0 && (
        <section className="print-avoid-break mb-6">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            3. Program Learning Outcome (PLO) Alignment Matrix
          </h2>
          <table className="w-full text-[8.5pt] border-collapse print-table">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300">
                <th className="p-2 border border-slate-300 w-16 text-center">CLO</th>
                {course.plos.map((plo) => (
                  <th key={plo.id} className="p-2 border border-slate-300 text-center">
                    {plo.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(course.clos || []).map((clo) => {
                const mappedMap = new Map(
                  (clo.mappedPLOs || []).map((m) => [m.ploId, m.level])
                );
                return (
                  <tr key={clo.id} className="border border-slate-300">
                    <td className="p-2 border border-slate-300 font-mono font-bold text-center bg-slate-50/50">
                      {clo.code}
                    </td>
                    {course.plos.map((plo) => {
                      const level = mappedMap.get(plo.id);
                      return (
                        <td key={plo.id} className="p-2 border border-slate-300 text-center font-bold">
                          {level ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8pt] ${
                                level === 'Mastered'
                                  ? 'bg-emerald-100 text-emerald-950 font-black'
                                  : level === 'Reinforced'
                                  ? 'bg-blue-100 text-blue-950 font-bold'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {level[0]}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex gap-4 text-[7.5pt] text-slate-500 mt-1 font-mono">
            <span>[I] = Introduced</span>
            <span>[R] = Reinforced</span>
            <span>[M] = Mastered</span>
          </div>
        </section>
      )}

      {/* 5. Instructional Plan & Weekly Scaffold */}
      {(course.weeklyPlan?.length || 0) > 0 && (
        <section className="print-avoid-break mb-6">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            4. Instructional Schedule &amp; Modular Scaffolding
          </h2>
          <table className="w-full text-[8.5pt] border-collapse print-table">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300">
                <th className="p-1.5 border border-slate-300 w-12 text-center">Wk</th>
                <th className="p-1.5 border border-slate-300">Topic &amp; Subtopics</th>
                <th className="p-1.5 border border-slate-300">Pedagogical Activity</th>
                <th className="p-1.5 border border-slate-300 w-16 text-center">Hrs</th>
              </tr>
            </thead>
            <tbody>
              {(course.weeklyPlan || []).map((week) => (
                <tr key={week.weekNumber} className="border border-slate-300">
                  <td className="p-1.5 border border-slate-300 text-center font-mono font-bold bg-slate-50/50">
                    {week.weekNumber}
                  </td>
                  <td className="p-1.5 border border-slate-300">
                    <strong className="text-slate-900">{week.topic}</strong>
                    {week.subtopics && (
                      <div className="text-[7.5pt] text-slate-500 leading-snug">{week.subtopics}</div>
                    )}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-slate-700">
                    {week.learningActivity || 'Interactive lecture & problem sets'}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-center font-mono">
                    {week.contactHours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 6. Assessment Plan & Grading Blueprint */}
      <section className="print-avoid-break mb-6">
        <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
          5. Assessment &amp; Evaluation Blueprint
        </h2>
        <table className="w-full text-[9pt] border-collapse print-table">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border border-slate-300">
              <th className="p-2 border border-slate-300">Assessment Instrument</th>
              <th className="p-2 border border-slate-300 w-28 text-center">Type</th>
              <th className="p-2 border border-slate-300 w-24 text-center">Bloom Level</th>
              <th className="p-2 border border-slate-300 w-20 text-center">Marks</th>
              <th className="p-2 border border-slate-300 w-20 text-center">Weight</th>
            </tr>
          </thead>
          <tbody>
            {(course.assessments || []).map((a, idx) => (
              <tr key={a.id || idx} className="border border-slate-300">
                <td className="p-2 border border-slate-300">
                  <div className="font-bold text-slate-900">{a.name}</div>
                  <div className="text-[7.5pt] text-slate-500">
                    {a.isSummative ? 'Summative Assessment' : 'Formative Assessment'} • Evidence: {a.evidenceType || 'Direct'}
                  </div>
                </td>
                <td className="p-2 border border-slate-300 text-center text-slate-700 font-medium">
                  {a.type}
                </td>
                <td className="p-2 border border-slate-300 text-center font-bold text-slate-900">
                  {a.bloomLevel}
                </td>
                <td className="p-2 border border-slate-300 text-center font-mono">
                  {a.marks}
                </td>
                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-900">
                  {a.weightage}%
                </td>
              </tr>
            ))}
            <tr className="border border-slate-300 font-bold bg-slate-100 text-slate-950">
              <td colSpan={3} className="p-2 border border-slate-300 text-right">
                Total Assessment Weight:
              </td>
              <td className="p-2 border border-slate-300 text-center font-mono">{totalMarks}</td>
              <td className="p-2 border border-slate-300 text-center font-mono">{totalAssessmentWeight}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 7. Rubrics Overview (If any exist) */}
      {(course.rubrics || []).length > 0 && (
        <section className="print-avoid-break mb-6">
          <h2 className="text-[12pt] font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            6. Analytic Rubric Criteria Summary
          </h2>
          <div className="space-y-3">
            {course.rubrics.map((r) => (
              <div key={r.id} className="border border-slate-300 rounded p-2.5 bg-slate-50/50">
                <h3 className="text-[9.5pt] font-bold text-slate-950 mb-1">{r.title}</h3>
                <div className="space-y-1.5">
                  {(r.criteria || []).map((c) => (
                    <div key={c.id} className="text-[8pt] text-slate-700 border-l-2 border-slate-400 pl-2">
                      <span className="font-bold text-slate-900">{c.criterionName}</span> ({c.weight}%)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Accreditation Quality Assurance & Institutional Sign-Off Block */}
      <section className="print-avoid-break border-t-2 border-slate-900 pt-4 mt-8">
        <h2 className="text-[10pt] font-bold text-slate-900 uppercase tracking-wider mb-2">
          7. Accreditation Verification &amp; Board of Studies Sign-Off
        </h2>
        <p className="text-[8pt] text-slate-600 mb-6 leading-relaxed">
          This course specification has been verified in accordance with Outcome-Based Education (OBE) guidelines, ensuring constructive alignment across outcomes, instructional methodologies, and criterion-referenced assessment instruments.
        </p>

        <div className="grid grid-cols-3 gap-8 pt-6 text-[8.5pt]">
          <div className="border-t border-slate-400 pt-1">
            <span className="font-bold text-slate-900 block">Course Instructor / Lead</span>
            <span className="text-[7.5pt] text-slate-500 block">Signature &amp; Date</span>
          </div>
          <div className="border-t border-slate-400 pt-1">
            <span className="font-bold text-slate-900 block">Department QA / Curriculum Chair</span>
            <span className="text-[7.5pt] text-slate-500 block">Signature &amp; Date</span>
          </div>
          <div className="border-t border-slate-400 pt-1">
            <span className="font-bold text-slate-900 block">Dean / Board of Studies Seal</span>
            <span className="text-[7.5pt] text-slate-500 block">Signature &amp; Date</span>
          </div>
        </div>
      </section>
    </div>
  );
};
