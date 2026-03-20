import { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

export const INITIAL_EVENTS: EventInput[] = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: TODAY_STR,
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
    textColor: '#fff'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T00:00:00',
    end: TODAY_STR + 'T03:00:00'
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: TODAY_STR + 'T12:00:00',
    end: TODAY_STR + 'T15:00:00'
  },
    {
    id: '1',
    created_at: 1774034542262,
    title: 'watermelon goumi',
    start: '2025-11-16',
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
    textColor: '#fff',
    nm_cliente: 'salsify eggnut',
    nm_vendedor: 'celery peach',
    id_vendedor: 43,
    telefone_cliente: 'voavanga cherry',
    email: 'june.hughes@americanexpress.com'
    }
]
 

export function createEventId() {
  return String(eventGuid++);
}