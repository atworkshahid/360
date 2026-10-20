# Implementation Plan: AI-Powered Micro Learning Unit (MLU) Generator

## 1. Audit Phase
- Analyze `src/components/CourseCreator/MicroLearningUnitsEditor.tsx` and `src/components/CourseCreator/CourseWizard.tsx`.
- Review data flow for `CourseModule`, `MLO`, `CLO`, `PLO` in `Course`.
- Validate Firebase service calls for data persistence (using `firebase-integration-rpc` patterns).
- Identify integration points for the AI generation service.

## 2. Enhancement Phase
- Extend `MicroLearningUnitsEditor` to include an "AI Generate MLU" button/panel.
- Implement the AI generation service (using @google/genai or similar, as per `gemini-api` skill) to produce structured MLUs.
- Ensure strict adherence to the `MLO X.Y.Z` indexing format.

## 3. Alignment Phase
- Implement the bidirectional academic mapping engine (`PLO ↔ CLO ↔ MLO`).
- Create a visual alignment matrix component for the wizard.
- Ensure MLOs are linked to relevant competencies, skills, activities, and rubrics.

## 4. Integration & UI
- Integrate the lesson plan generator template.
- Enable editability for all AI-generated content.
- Final verification of alignment matrix and rubric generation.

Feedback is requested on these priorities and the proposed architecture.
