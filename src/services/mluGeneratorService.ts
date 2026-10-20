import { GoogleGenAI, Type } from "@google/genai";
import { Course, PLO } from "../types";
import { MicroLearningUnit, ModularLearningOutcome } from "../types/mlu";
import { Quiz } from "../types/quiz";

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export interface MLUGenerationRequest {
  course: Course;
  weeks: number;
  modality: string;
  contactHours: number;
}

export interface GeneratedMLUContent {
  mlus: MicroLearningUnit[];
  mlos: ModularLearningOutcome[];
}

export async function generateMLUs(request: MLUGenerationRequest): Promise<GeneratedMLUContent> {
  const { course, weeks, modality, contactHours } = request;

  const prompt = `
    You are an expert instructional designer in Outcome-Based Education (OBE).
    Generate weekly Micro Learning Units (MLUs) and Modular Learning Outcomes (MLOs) for the course: "${course.title}".
    Discipline: ${course.discipline || 'General'}
    Level: ${course.level || 'Undergraduate'}
    Duration: ${weeks} weeks
    Teaching Modality: ${modality}
    Weekly Contact Hours: ${contactHours}

    Context:
    Program Learning Outcomes (PLOs): ${JSON.stringify(course.plos || [])}
    Course Learning Outcomes (CLOs): ${JSON.stringify(course.clos || [])}

    Requirements:
    1. Generate MLUs for each week.
    2. Generate MLOs for each MLU, using the indexing format MLO X.Y.Z (X=week, Y=MLU number within week, Z=MLO sequence).
    3. Ensure every MLO aligns with at least one CLO.
    4. Include Bloom's taxonomy cognitive levels for each MLO.
    5. Output the result in JSON format following the defined structure.
  `;

  // Define schema for structured JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      mlus: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            weekNumber: { type: Type.INTEGER },
            unitNumber: { type: Type.INTEGER },
            description: { type: Type.STRING },
            mloIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "weekNumber", "unitNumber", "mloIds"],
        },
      },
      mlos: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            statement: { type: Type.STRING },
            bloomVerb: { type: Type.STRING },
            bloomLevel: { type: Type.STRING }, // BloomLevel
            parentMLUId: { type: Type.STRING },
            relatedCLOIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["code", "statement", "bloomVerb", "bloomLevel", "parentMLUId", "relatedCLOIds"],
        },
      },
    },
    required: ["mlus", "mlos"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a senior academic instructional designer. Generate highly structured, academically rigorous OBE content in JSON format.",
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.5,
    },
  });

  const result = JSON.parse(response.text || "{}");
  
  return result as GeneratedMLUContent;
}


export async function suggestSemanticPLOAlignments(unmappedMLOs: ModularLearningOutcome[], plos: PLO[]): Promise<Record<string, string[]>> {
  const prompt = `
    You are an expert instructional designer in OBE. Align the following unmapped MLOs to the provided PLOs based on semantic similarity.
    
    Unmapped MLOs: ${JSON.stringify(unmappedMLOs.map(m => ({ id: m.id, statement: m.statement })))}
    Available PLOs: ${JSON.stringify(plos.map(p => ({ id: p.id, description: p.description })))}

    Return a JSON object where keys are MLO IDs and values are arrays of PLO IDs that they best align to.
    Return only JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    additionalProperties: { type: Type.ARRAY, items: { type: Type.STRING } }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2,
    },
  });

  return JSON.parse(response.text || "{}");
}
export async function generateMLOEvidence(mlo: ModularLearningOutcome, course: Course): Promise<Partial<ModularLearningOutcome>> {
  const prompt = `
    You are an expert instructional designer. Generate specific assessment evidence and rubric criteria for the following MLO:
    MLO: ${mlo.statement}
    Course: ${course.title}
    CLOs: ${JSON.stringify(course.clos.filter(c => mlo.relatedCLOIds.includes(c.id)))}

    Provide:
    1. A clear assessment activity.
    2. Assessment method.
    3. Rubric criteria (list of 3-4 specific expectations).
    4. Performance threshold.
    5. Evidence of achievement.
    Return only JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      requiredActivity: { type: Type.STRING },
      assessmentMethod: { type: Type.STRING },
      rubricCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
      performanceThreshold: { type: Type.STRING },
      evidenceOfAchievement: { type: Type.STRING },
    },
    required: ["requiredActivity", "assessmentMethod", "rubricCriteria", "performanceThreshold", "evidenceOfAchievement"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.5,
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateMLOQuiz(mlo: ModularLearningOutcome): Promise<Quiz> {
  const prompt = `
    You are an expert instructional designer. Generate a 5-question high-quality formative self-assessment quiz for the following MLO:
    MLO: ${mlo.statement}
    Bloom Level: ${mlo.bloomLevel}

    Provide 5 multiple-choice questions. For each question:
    1. The question text.
    2. An array of 4 options, including 3 plausible distractors and 1 correct answer.
    3. The index of the correct option (0-3).
    4. Pedagogical Rationale: A detailed explanation of why the correct answer is correct and why the distractors are incorrect, aimed at enhancing student understanding.
    Return only JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      mloId: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            feedback: { type: Type.STRING, description: "Pedagogical rationale explaining correct answer and distractors" },
          },
          required: ["question", "options", "correctAnswer", "feedback"],
        },
      },
    },
    required: ["mloId", "questions"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.5,
    },
  });

  const quiz = JSON.parse(response.text || "{}");
  return { ...quiz, mloId: mlo.id } as Quiz;
}

