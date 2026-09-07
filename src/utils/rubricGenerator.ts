import { BloomLevel, Course, CLO, Assessment, Rubric, RubricCriterion, RubricLevel } from '../types';

export interface BloomCriterionTemplate {
  id: string;
  criterionName: string;
  description: string;
  bloomLevel: BloomLevel;
  recommendedWeight: number;
  cognitiveFocus: string;
  keyVerbs: string[];
  levels: {
    level: 'Not Achieved' | 'Developing' | 'Achieved' | 'Proficient' | 'Exemplary';
    pointsRange: string;
    descriptor: string;
  }[];
}

/**
 * Pedagogically calibrated rubric criteria templates categorized by Bloom's Taxonomy Level.
 * Each template provides 5 objective achievement bands:
 * - Not Achieved (0-49%)
 * - Developing (50-64%)
 * - Achieved (65-74%)
 * - Proficient (75-84%)
 * - Exemplary (85-100%)
 */
export const BLOOM_RUBRIC_TEMPLATES: Record<BloomLevel, BloomCriterionTemplate[]> = {
  Remember: [
    {
      id: 'rem-1',
      criterionName: 'Factual Precision & Knowledge Recall',
      description: 'Accurate retrieval of fundamental definitions, historical facts, and primary rules without error.',
      bloomLevel: 'Remember',
      recommendedWeight: 35,
      cognitiveFocus: 'Terminology & foundational rule recall',
      keyVerbs: ['Define', 'Recall', 'State', 'List'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Unable to recall core definitions or foundational rules; pervasive factual errors throughout.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Recalls isolated terms but exhibits notable confusion between related concepts and incomplete factual memory.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Accurately defines and recalls standard terminology and governing principles without critical error.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Thorough and precise recall of principles, terminology, and operational specifications with consistent fidelity.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Flawless, comprehensive recall of doctrines, historical context, and technical specifications with authoritative precision.',
        },
      ],
    },
    {
      id: 'rem-2',
      criterionName: 'Statutory & Standard Identification',
      description: 'Locating, recognizing, and classifying governing provisions, standard codes, and formal guidelines.',
      bloomLevel: 'Remember',
      recommendedWeight: 25,
      cognitiveFocus: 'Provisions, standards & code recognition',
      keyVerbs: ['Identify', 'Locate', 'Recognize', 'Label'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Fails to recognize or locate governing statutory articles, industry standards, or regulatory frameworks.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Identifies general provisions but frequently misidentifies specific clauses or operational boundaries.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Correctly identifies and labels all relevant statutory provisions and operational standards.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Promptly and accurately cites specific clauses and regulatory requirements across diverse contexts.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Masterfully identifies subtle statutory cross-references, historical amendments, and authoritative guidelines.',
        },
      ],
    },
    {
      id: 'rem-3',
      criterionName: 'Completeness of Core Parameters',
      description: 'Exhaustive listing and enumeration of required structural elements, safety rules, and parameters.',
      bloomLevel: 'Remember',
      recommendedWeight: 25,
      cognitiveFocus: 'Scope completeness & enumeration',
      keyVerbs: ['Enumerate', 'List', 'Tabulate', 'Match'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Omits major essential parameters; answers are fragmentary and disorganized.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Lists superficial parameters but misses critical baseline elements or operational criteria.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Enumerates all required core parameters and protocols with clear categorization.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Comprehensive enumeration of required parameters including secondary specifications and relationships.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Exhaustive, systematically tabulated inventory of all primary and edge-case parameters with pristine rigor.',
        },
      ],
    },
    {
      id: 'rem-4',
      criterionName: 'Authoritative Citation & Reference Fidelity',
      description: 'Proper attribution of statutory, empirical, and academic sources according to standard citation conventions.',
      bloomLevel: 'Remember',
      recommendedWeight: 15,
      cognitiveFocus: 'Source citation & attribution',
      keyVerbs: ['Cite', 'Quote', 'Record', 'Select'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'No citations or attribution provided; relies on unverified assertions.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Inconsistent citations with frequent formatting lapses or reliance on unverified secondary sources.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Properly cites primary textbooks, standard codes, or statutory provisions using standard formatting.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Consistently accurate, polished citations adhering to professional citation rules throughout.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Impeccable scholarly apparatus citing primary legal precedents, original empirical studies, and statutory archives.',
        },
      ],
    },
  ],

  Understand: [
    {
      id: 'und-1',
      criterionName: 'Conceptual Explanation & Theoretical Clarity',
      description: 'Articulating the underlying rationale, system mechanisms, and principles in original words.',
      bloomLevel: 'Understand',
      recommendedWeight: 35,
      cognitiveFocus: 'Internal conceptual clarity & expression',
      keyVerbs: ['Explain', 'Describe', 'Paraphrase', 'Clarify'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Explanations reveal fundamental misunderstandings; unable to explain concepts beyond rote words.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Provides basic textbook definitions but struggles to articulate mechanisms in original language.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Clearly explains governing mechanisms and concepts using sound, original paraphrasing.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Articulates complex theoretical principles with lucid explanations and nuanced conceptual depth.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Authoritative, illuminating explanation that simplifies complex doctrines and highlights systemic dynamics.',
        },
      ],
    },
    {
      id: 'und-2',
      criterionName: 'Interpretation & Meaning Construction',
      description: 'Interpreting textual provisions, graphical models, and data summaries without distortion.',
      bloomLevel: 'Understand',
      recommendedWeight: 25,
      cognitiveFocus: 'Textual & graphical interpretation',
      keyVerbs: ['Interpret', 'Restate', 'Translate', 'Summarize'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Gross misinterpretation of core texts or charts; conclusions contradict source data.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Interprets superficial facts but overlooks context, resulting in incomplete summaries.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Accurately interprets text, graphs, or scenarios, producing faithful summaries of intent.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Nuanced interpretation capturing implicit themes, operational context, and secondary implications.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Profound interpretative insight, bridging disparate textual sources and context into seamless synthesis.',
        },
      ],
    },
    {
      id: 'und-3',
      criterionName: 'Contextual Exemplification & Analogy',
      description: 'Providing relevant, original real-world examples and analogies that demonstrate comprehension.',
      bloomLevel: 'Understand',
      recommendedWeight: 25,
      cognitiveFocus: 'Exemplification & contextual grounding',
      keyVerbs: ['Exemplify', 'Illustrate', 'Classify', 'Categorize'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Fails to provide examples or gives erroneous analogies that distort the concept.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Recycles obvious textbook examples with little evidence of personalized understanding.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Develops authentic, relevant examples that clearly illustrate how the principle operates.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Crafts insightful, diverse examples illustrating both standard and boundary applications.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Originates compelling, multifaceted case analogies illuminating subtle conceptual nuances.',
        },
      ],
    },
    {
      id: 'und-4',
      criterionName: 'Structural Organization & Narrative Cohesion',
      description: 'Logical sequencing of explanatory ideas to support reader comprehension and intellectual flow.',
      bloomLevel: 'Understand',
      recommendedWeight: 15,
      cognitiveFocus: 'Explanatory coherence & structure',
      keyVerbs: ['Summarize', 'Outline', 'Discuss', 'Express'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Disorganized narrative with abrupt transitions impairing reader comprehension.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Basic organization but frequent disjointed paragraphs that slow down understanding.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Clear structural progression with smooth transitions connecting conceptual elements.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Polished organization where each conceptual point systematically scaffolds subsequent insights.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Masterful narrative architecture that guides the reader effortlessly through complex material.',
        },
      ],
    },
  ],

  Apply: [
    {
      id: 'app-1',
      criterionName: 'Scenario Problem-Solving & Method Selection',
      description: 'Selecting and executing appropriate methods, formulas, and strategies to resolve practical challenges.',
      bloomLevel: 'Apply',
      recommendedWeight: 35,
      cognitiveFocus: 'Practical methodology execution',
      keyVerbs: ['Apply', 'Solve', 'Execute', 'Implement'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Selects inappropriate methods; unable to apply standard procedures to the scenario.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Selects correct method but executes with critical procedural errors or invalid assumptions.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Appropriately selects and executes standard procedures to solve the scenario successfully.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Skillfully adapts methodology to problem constraints, delivering precise, verified solutions.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Optimal, elegant problem-solving under tight constraints; flawless procedural precision.',
        },
      ],
    },
    {
      id: 'app-2',
      criterionName: 'Procedural Fidelity & Technical Accuracy',
      description: 'Adhering to required technical protocols, mathematical steps, safety guidelines, and conventions.',
      bloomLevel: 'Apply',
      recommendedWeight: 25,
      cognitiveFocus: 'Calculations, protocols & procedural rigor',
      keyVerbs: ['Calculate', 'Compute', 'Demonstrate', 'Operate'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Violates core technical protocols or produces pervasive calculation errors.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Follows general protocol but commits computational slips and omits intermediate steps.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Executes technical calculations and protocols with verified accuracy and proper units.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'High technical precision with proactive cross-checks and meticulous procedural discipline.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Zero-defect execution, incorporating automated validation and professional-grade proofs.',
        },
      ],
    },
    {
      id: 'app-3',
      criterionName: 'Contextual Adaptation & Transfer of Rules',
      description: 'Tailoring standard rules to realistic scenario variables, constraints, and operational context.',
      bloomLevel: 'Apply',
      recommendedWeight: 25,
      cognitiveFocus: 'Contextual adaptation & rule transfer',
      keyVerbs: ['Utilize', 'Employ', 'Adapt', 'Modify'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Rigidly applies textbook rules without acknowledging scenario facts or constraints.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Struggles when the scenario departs from standard examples; awkward adaptations.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Effectively adapts rules and techniques to fit specific factual conditions and constraints.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Dexterously handles non-routine situational constraints with practical operational wisdom.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Seamless transfer of abstract doctrines into volatile real-world conditions with resilient results.',
        },
      ],
    },
    {
      id: 'app-4',
      criterionName: 'Documentation of Process & Solution Steps',
      description: 'Clear recording of intermediate workings, computational paths, and practical rationales.',
      bloomLevel: 'Apply',
      recommendedWeight: 15,
      cognitiveFocus: 'Reproducibility & step-by-step documentation',
      keyVerbs: ['Show', 'Produce', 'Prepare', 'Demonstrate'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Fails to show intermediate steps; results cannot be audited or reproduced.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Skips critical intermediate steps, making verification difficult and disjointed.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Clearly documents all essential steps, assumptions, and formulas used in solving.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Thorough, structured documentation enabling full external audit and effortless reproducibility.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Exemplary professional documentation complete with annotated rationales, margins of error, and diagrams.',
        },
      ],
    },
  ],

  Analyze: [
    {
      id: 'ana-1',
      criterionName: 'Critical Decomposition & Diagnostic Inquiry',
      description: 'Disaggregating complex situations into constituent variables, identifying root drivers and mechanisms.',
      bloomLevel: 'Analyze',
      recommendedWeight: 35,
      cognitiveFocus: 'System breakdown & root-cause diagnostics',
      keyVerbs: ['Analyze', 'Deconstruct', 'Dissect', 'Diagnose'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Treats situation as an indivisible whole; fails to identify constituent factors or root causes.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Identifies obvious surface symptoms but overlooks underlying structural drivers and relationships.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Systematically dissects the problem into core variables, isolating primary mechanisms and causes.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'In-depth diagnostic inquiry uncovering multi-tiered causal chains, feedback dynamics, and hidden drivers.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Forensic decomposition that maps interdependencies, structural tensions, and systemic vulnerabilities.',
        },
      ],
    },
    {
      id: 'ana-2',
      criterionName: 'Comparative Analysis & Trade-Off Differentiation',
      description: 'Comparing competing alternatives or doctrines, evaluating subtle trade-offs and operational implications.',
      bloomLevel: 'Analyze',
      recommendedWeight: 30,
      cognitiveFocus: 'Trade-off differentiation & comparative analysis',
      keyVerbs: ['Differentiate', 'Distinguish', 'Discriminate', 'Contrast'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Fails to distinguish key differences; claims are biased, superficial, or unsupported.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Highlights superficial differences while missing core doctrinal, technical, or systemic trade-offs.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Rigorously contrasts options using defined criteria, highlighting trade-offs and impact areas.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Multidimensional contrast analyzing second-order consequences, edge cases, and systemic trade-offs.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Masterful comparative matrix evaluating lifecycle trade-offs, resource tensions, and institutional impacts.',
        },
      ],
    },
    {
      id: 'ana-3',
      criterionName: 'Evidentiary Deduction & Analytical Reasoning',
      description: 'Drawing valid inferences grounded in empirical evidence, avoiding cognitive biases and logical fallacies.',
      bloomLevel: 'Analyze',
      recommendedWeight: 20,
      cognitiveFocus: 'Evidence-based deduction & logic',
      keyVerbs: ['Examine', 'Investigate', 'Correlate', 'Test'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Conclusions rely on unfounded speculation with severe logical fallacies and zero evidence.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Uses anecdotal evidence with occasional leaps in logic and unexamined correlation assumptions.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Sound deductive reasoning where inferences are systematically substantiated by credible data.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Tight, compelling logical deductions with rigorous refutation of alternative inferences.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Airtight, publication-grade analytical reasoning with comprehensive verification and zero cognitive bias.',
        },
      ],
    },
    {
      id: 'ana-4',
      criterionName: 'Assumption Testing & Boundary Identification',
      description: 'Identifying underlying assumptions, scope boundaries, and the limits of the analytical model.',
      bloomLevel: 'Analyze',
      recommendedWeight: 15,
      cognitiveFocus: 'Boundary analysis & sensitivity testing',
      keyVerbs: ['Isolate', 'Troubleshoot', 'Audit', 'Inspect'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Fails to acknowledge assumptions; assumes boundless applicability without constraint.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Mentions basic assumptions but fails to evaluate their impact when conditions shift.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Clearly specifies operating assumptions, boundary conditions, and analytical constraints.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Evaluates sensitivity of analytical conclusions against boundary shifts and volatile constraints.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Rigorous sensitivity audit identifying hidden institutional dependencies and fragile boundaries.',
        },
      ],
    },
  ],

  Evaluate: [
    {
      id: 'eva-1',
      criterionName: 'Criteria-Based Appraisal & Justified Verdict',
      description: 'Making defensible judgments grounded in objective standards, benchmark criteria, and verified metrics.',
      bloomLevel: 'Evaluate',
      recommendedWeight: 35,
      cognitiveFocus: 'Objective appraisal & verdict defensibility',
      keyVerbs: ['Evaluate', 'Appraise', 'Judge', 'Decide'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Judgments are purely subjective or arbitrary; no reference to objective standards or criteria.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Applies criteria inconsistently; verdict lacks firm evidentiary backing and cohesive rationale.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Delivers defensible judgments grounded in explicit, objective criteria and standard benchmarks.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Thorough, well-calibrated evaluation balancing quantitative metrics against qualitative nuances.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Authoritative, precedent-setting appraisal delivering unequivocal, logically compelling verdicts.',
        },
      ],
    },
    {
      id: 'eva-2',
      criterionName: 'Critique of Counterarguments & Competing Claims',
      description: 'Fair evaluation and refutation of alternative viewpoints, counterarguments, and dissenting interpretations.',
      bloomLevel: 'Evaluate',
      recommendedWeight: 25,
      cognitiveFocus: 'Counter-thesis critique & dialectic refutation',
      keyVerbs: ['Critique', 'Defend', 'Dispute', 'Referee'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Ignores counterarguments; presents a one-sided, dogmatic evaluation without defense.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Acknowledges counterarguments superficially but dismisses them without substantive refutation.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Critiques counterarguments fairly and refutes them with reasoned evidence and standards.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Anticipates subtle counter-theses, dissecting their premises and fortifying the verdict persuasively.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Masterful dialectical critique that systematically deconstructs counterarguments to build an unassailable case.',
        },
      ],
    },
    {
      id: 'eva-3',
      criterionName: 'Evidentiary Rigor & Benchmark Validation',
      description: 'Validating conclusions against primary benchmarks, statutory precedents, and verified empirical standards.',
      bloomLevel: 'Evaluate',
      recommendedWeight: 25,
      cognitiveFocus: 'Benchmark validation & evidentiary strength',
      keyVerbs: ['Validate', 'Verify', 'Measure', 'Benchmark'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Claims rely on conjecture; lacks empirical or statutory validation.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Cites partial evidence but overlooks conflicting data sets or validation benchmarks.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Substantiates all evaluative verdicts with reliable benchmarks, statutory precedents, and verified metrics.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Synthesizes high-caliber peer-reviewed, statutory, or empirical benchmarks to validate verdicts.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Gold-standard verification employing rigorous statistical, legal, and operational validation protocols.',
        },
      ],
    },
    {
      id: 'eva-4',
      criterionName: 'Ethical, Statutory & Systemic Impact Appraisal',
      description: 'Assessing long-term consequences, compliance mandates, safety risks, and ethical considerations.',
      bloomLevel: 'Evaluate',
      recommendedWeight: 15,
      cognitiveFocus: 'Ethical, statutory & risk horizons',
      keyVerbs: ['Recommend', 'Prioritize', 'Rank', 'Assess'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Completely ignores ethical standards, statutory compliance, or societal risks.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Mentions compliance as an afterthought with no meaningful integration into the verdict.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Integrates ethical standards, statutory compliance, and stakeholder impacts into the verdict.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Proactively assesses risk horizons, regulatory changes, and long-term ethical implications.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Visionary ethical leadership prioritizing sustainability, social equity, and statutory integrity seamlessly.',
        },
      ],
    },
  ],

  Create: [
    {
      id: 'cre-1',
      criterionName: 'Original Synthesis & Architectural Design',
      description: 'Synthesizing disparate elements into a cohesive, original model, framework, or engineered artifact.',
      bloomLevel: 'Create',
      recommendedWeight: 35,
      cognitiveFocus: 'Novel design, formulation & synthesis',
      keyVerbs: ['Design', 'Create', 'Construct', 'Architect'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Merely copies existing models without originality; output is fragmented and non-viable.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Derivative design with minimal original synthesis; shows heavy reliance on canned components.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Synthesizes components into an original, coherent, and well-structured solution satisfying core specs.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Demonstrates creative elegance, integrating novel design paradigms and optimized architectural layout.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Groundbreaking, publication/patent-grade design showcasing visionary synthesis and exceptional elegance.',
        },
      ],
    },
    {
      id: 'cre-2',
      criterionName: 'Integrative Cohesion & Functional Viability',
      description: 'Building an integrated, functioning construct that satisfies all constraints, interfaces, and criteria.',
      bloomLevel: 'Create',
      recommendedWeight: 30,
      cognitiveFocus: 'Functionality, modular cohesion & viability',
      keyVerbs: ['Develop', 'Engineer', 'Build', 'Formulate'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Construct fails to function or satisfy specified constraints; non-viable in practice.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Partially functional but exhibits notable gaps, interface mismatches, or unmet specifications.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Delivers a fully operational, viable construct that satisfies all mandatory constraints and specs.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Robust, resilient construct with exceptional stability, verified edge-case handling, and modular cohesion.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Industrial-grade, fault-tolerant implementation with flawless integration and modular scalability.',
        },
      ],
    },
    {
      id: 'cre-3',
      criterionName: 'Innovation, Problem-Resolution & Elegance',
      description: 'Introducing creative problem-solving approaches that eliminate bottlenecks and optimize outcomes.',
      bloomLevel: 'Create',
      recommendedWeight: 20,
      cognitiveFocus: 'Innovation & problem resolution',
      keyVerbs: ['Invent', 'Originate', 'Propose', 'Synthesize'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'No evidence of creative problem solving; brute-force or ineffective approaches.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Incremental innovation that solves standard parts but leaves thorny bottlenecks unaddressed.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Introduces clever, practical innovations that resolve key operational bottlenecks and constraints.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Delivers elegant, high-leverage solutions that optimize performance, usability, and resource economy.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'Paradigm-shifting innovation delivering dramatic improvements in efficiency, usability, and impact.',
        },
      ],
    },
    {
      id: 'cre-4',
      criterionName: 'Technical Specifications & Handover Documentation',
      description: 'Comprehensive, structured documentation of design specifications, blueprints, and operating manuals.',
      bloomLevel: 'Create',
      recommendedWeight: 15,
      cognitiveFocus: 'Design documentation & specification delivery',
      keyVerbs: ['Author', 'Plan', 'Generate', 'Assemble'],
      levels: [
        {
          level: 'Not Achieved',
          pointsRange: '0-49%',
          descriptor: 'Documentation is absent or fragmented; cannot be implemented or reproduced by peers.',
        },
        {
          level: 'Developing',
          pointsRange: '50-64%',
          descriptor: 'Incomplete specifications with missing blueprints, user guides, or maintenance protocols.',
        },
        {
          level: 'Achieved',
          pointsRange: '65-74%',
          descriptor: 'Comprehensive, professional documentation including design specs, workflows, and user manuals.',
        },
        {
          level: 'Proficient',
          pointsRange: '75-84%',
          descriptor: 'Exhaustive, beautifully formatted documentation facilitating seamless handover and maintenance.',
        },
        {
          level: 'Exemplary',
          pointsRange: '85-100%',
          descriptor: 'World-class specification suite with architectural schematics, API docs, deployment manifests, and CQI metrics.',
        },
      ],
    },
  ],
};

/**
 * Retrieves criteria suggestions customized for a specific Bloom Level.
 * Can optionally interpolate context from the CLO statement and assessment.
 */
export function getBloomCriteriaSuggestions(
  bloomLevel: BloomLevel,
  cloStatement?: string,
  assessmentName?: string
): RubricCriterion[] {
  const templates = BLOOM_RUBRIC_TEMPLATES[bloomLevel] || BLOOM_RUBRIC_TEMPLATES.Analyze;

  return templates.map((tmpl, index) => {
    // Contextualize descriptors if CLO statement is provided
    const contextualizedLevels: RubricLevel[] = tmpl.levels.map((lvl) => {
      let descriptor = lvl.descriptor;
      if (cloStatement && cloStatement.length > 10) {
        const cleanStatement = cloStatement.trim().replace(/^([A-Z0-9.\- ]+:)?\s*/i, '');
        // For Achieved, Proficient, Exemplary, inject subtle relevance to CLO
        if (lvl.level === 'Achieved') {
          descriptor = `${descriptor} Explicitly demonstrates core competencies required to "${cleanStatement.slice(0, 60)}...".`;
        } else if (lvl.level === 'Proficient') {
          descriptor = `${descriptor} Consistently surpasses standard expectations in demonstrating "${cleanStatement.slice(0, 60)}...".`;
        } else if (lvl.level === 'Exemplary') {
          descriptor = `${descriptor} Sets the benchmark standard for excellence in "${cleanStatement.slice(0, 60)}...".`;
        }
      }

      return {
        level: lvl.level,
        pointsRange: lvl.pointsRange,
        descriptor,
      };
    });

    return {
      id: `crit-${Date.now()}-${index + 1}`,
      criterionName: tmpl.criterionName,
      cloId: '',
      weight: tmpl.recommendedWeight,
      levels: contextualizedLevels,
    };
  });
}

/**
 * Builds a single custom rubric for a CLO based on its Bloom Level.
 */
export function generateRubricForCLO(
  clo: CLO,
  assessment?: Assessment,
  options?: {
    customTitle?: string;
    overrideBloomLevel?: BloomLevel;
  }
): Rubric {
  const bloom = options?.overrideBloomLevel || clo.bloomLevel || 'Analyze';
  const criteria = getBloomCriteriaSuggestions(bloom, clo.statement, assessment?.name);

  // Set cloId for each criterion
  const finalizedCriteria: RubricCriterion[] = criteria.map((c) => ({
    ...c,
    cloId: clo.id,
  }));

  const rubricTitle =
    options?.customTitle ||
    `${clo.code} (${bloom}) Assessment Rubric${assessment ? ` - ${assessment.name}` : ''}`;

  return {
    id: `rubric-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: rubricTitle,
    assessmentId: assessment?.id || '',
    criteria: finalizedCriteria,
  };
}

/**
 * Automatically creates custom Bloom-aligned rubrics for each CLO in the course.
 */
export function generateRubricsForEachCLO(
  course: Course,
  options?: {
    replaceExisting?: boolean;
    assignAssessments?: boolean;
  }
): { updatedRubrics: Rubric[]; updatedAssessments?: Assessment[]; generatedCount: number } {
  const generatedRubrics: Rubric[] = [];
  const updatedAssessments = options?.assignAssessments && course.assessments ? [...course.assessments] : undefined;

  course.clos.forEach((clo, idx) => {
    // Find candidate assessment linked to this CLO or match by index
    let matchedAssessment: Assessment | undefined;
    if (course.assessments && course.assessments.length > 0) {
      matchedAssessment =
        course.assessments.find((a) => a.linkedCLOIds?.includes(clo.id)) ||
        course.assessments[idx % course.assessments.length];
    }

    const newRubric = generateRubricForCLO(clo, matchedAssessment);
    generatedRubrics.push(newRubric);

    // If linking to assessment, update assessment rubricId
    if (updatedAssessments && matchedAssessment) {
      const asmtIdx = updatedAssessments.findIndex((a) => a.id === matchedAssessment?.id);
      if (asmtIdx !== -1 && !updatedAssessments[asmtIdx].rubricId) {
        updatedAssessments[asmtIdx] = {
          ...updatedAssessments[asmtIdx],
          rubricId: newRubric.id,
        };
      }
    }
  });

  const finalRubrics = options?.replaceExisting
    ? generatedRubrics
    : [...course.rubrics, ...generatedRubrics];

  return {
    updatedRubrics: finalRubrics,
    updatedAssessments,
    generatedCount: generatedRubrics.length,
  };
}

/**
 * Normalizes an array of criterion weights so their sum equals exactly 100%.
 */
export function balanceCriteriaWeights(criteria: RubricCriterion[]): RubricCriterion[] {
  if (criteria.length === 0) return criteria;

  const currentTotal = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  if (currentTotal === 0) {
    const equalShare = Math.floor(100 / criteria.length);
    const remainder = 100 - equalShare * criteria.length;
    return criteria.map((c, i) => ({
      ...c,
      weight: equalShare + (i === 0 ? remainder : 0),
    }));
  }

  // Proportionally scale to 100
  let accumulated = 0;
  const scaled = criteria.map((c, index) => {
    if (index === criteria.length - 1) {
      return { ...c, weight: Math.max(1, 100 - accumulated) };
    }
    const scaledWeight = Math.max(1, Math.round((c.weight / currentTotal) * 100));
    accumulated += scaledWeight;
    return { ...c, weight: scaledWeight };
  });

  return scaled;
}
