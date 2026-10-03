import { Course, StudentPersona } from '../types';
import { sendChatMultiTurn } from './api';

export const PersonaSimulationService = {
  async generatePersonas(course: Course, count: number): Promise<StudentPersona[]> {
    const context = {
      title: course.title,
      description: course.description,
      clos: course.clos.map(c => ({ code: c.code, statement: c.statement, bloomLevel: c.bloomLevel })),
      assessments: course.assessments.map(a => ({ name: a.name, type: a.type, weightage: a.weightage }))
    };

    const prompt = `Generate ${count} distinct, synthetic student profiles for this course. 
    For each student, provide a name, background, learning style (Visual, Auditory, Kinesthetic, Logical), top strengths and weaknesses.
    Then, simulate their performance (0-100 score) on each of these CLOs: ${JSON.stringify(context.clos)}.
    Identify at least 2 specific friction points (e.g., "Mismatched learning style", "weak prerequisite") for each student based on the course assessment plan: ${JSON.stringify(context.assessments)}.
    Return as a JSON array of StudentPersona objects.`;

    const history = [{ role: 'user' as const, text: prompt }];
    const response = await sendChatMultiTurn(history, 'curriculum_coach', 'gemini-3.5-flash', context);
    
    // Simplification: In a real app, this would use zod or similar to parse/validate the AI response
    try {
      const match = response.reply.match(/\[.*\]/s);
      return JSON.parse(match ? match[0] : response.reply);
    } catch (e) {
      console.error('Failed to parse persona generation:', e);
      return [];
    }
  }
};
