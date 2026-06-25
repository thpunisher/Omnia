export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
}

export type CreateEventInput = Omit<CalendarEvent, 'id'>;
