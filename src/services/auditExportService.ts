import { getAccessToken } from './googleDriveService';
import { CourseAuditReport } from '../types';

export interface GoogleDocResult {
  docId: string;
  title: string;
  webViewLink: string;
}

export async function exportAuditToGoogleDoc(
  report: CourseAuditReport,
  courseTitle: string
): Promise<GoogleDocResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Drive authorization required.');

  // Create empty doc
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: `Audit Report: ${courseTitle}` }),
  });
  if (!createRes.ok) throw new Error('Failed to create Google Doc');
  const doc = await createRes.json();
  const docId = doc.documentId;

  // Prepare content
  const requests = [
    {
      insertText: {
        text: `Course Audit Report: ${courseTitle}\n\nHealth Score: ${report.healthScore}\n\n`,
        endOfSegmentLocation: { segmentId: '' },
      },
    },
  ];

  // Send content update
  await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  return {
    docId,
    title: doc.title,
    webViewLink: `https://docs.google.com/document/d/${docId}/view`,
  };
}

export async function exportAuditToGoogleSheet(
  report: CourseAuditReport,
  courseTitle: string
): Promise<{ spreadsheetId: string; webViewLink: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Drive authorization required.');

  // Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties: { title: `Audit Data: ${courseTitle}` } }),
  });
  if (!createRes.ok) throw new Error('Failed to create Google Sheet');
  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;

  // Prepare values
  const values = [
    ['Category', 'Score'],
    ['Health Score', report.healthScore],
    ['Completion %', report.completionPercentage],
    ['Critical Issues', report.criticalCount],
  ];

  // Write values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:B4?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  return {
    spreadsheetId,
    webViewLink: sheet.spreadsheetUrl,
  };
}
