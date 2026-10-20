import { getAccessToken } from '../services/firebaseAuth';

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

export const exportToCalendar = async (course: any) => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available. Please sign in with Google.');
  }

  const confirmed = window.confirm(
    'Are you sure you want to export course modules and assessments to your Google Calendar?'
  );
  if (!confirmed) return;

  const events: CalendarEvent[] = [];

  // Export module start dates
  course.modules.forEach((mod: any, index: number) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (index * 7 * (mod.durationWeeks || 1)));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    events.push({
      summary: `Module ${mod.number}: ${mod.title}`,
      description: mod.description,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
    });
  });

  // Export assessment dates
  course.assessments.forEach((asmt: any) => {
    const date = new Date();
    date.setDate(date.getDate() + (asmt.scheduledWeek * 7));
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    events.push({
      summary: `Assessment: ${asmt.name}`,
      description: `Type: ${asmt.type}, Weight: ${asmt.weightage}%`,
      start: { dateTime: date.toISOString() },
      end: { dateTime: endDate.toISOString() },
    });
  });

  for (const event of events) {
    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
    });
  }
};
