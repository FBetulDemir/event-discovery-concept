'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Chip } from './Chip';
import { addDays, addMonths, formatDateSelection, monthDays, parseDate, selectDay, todayInGothenburg, upcomingWeekend } from '@/lib/dates';
import type { DateSelection } from '@/types/preferences';

type Props = { value: DateSelection; onChange: (value: DateSelection) => void };
const weekdays = ['Må', 'Ti', 'On', 'To', 'Fr', 'Lö', 'Sö'];
const weekdayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
const modes = [{ value: 'single', label: 'En dag' }, { value: 'range', label: 'En period' }, { value: 'flexible', label: 'Flexibelt' }] as const;

export function DatePicker({ value, onChange }: Props) {
  const id = useId();
  const [today, setToday] = useState('');
  const [month, setMonth] = useState('');
  const [focusedDay, setFocusedDay] = useState('');
  const calendar = useRef<HTMLTableElement>(null);
  const initialValue = useRef(value);
  const focusAfterMove = useRef(false);

  useEffect(() => {
    const current = todayInGothenburg();
    const selection = initialValue.current;
    const initial = selection.mode === 'flexible' || !selection.start || selection.start < current ? current : selection.start;
    setToday(current);
    setMonth(initial.slice(0, 7));
    setFocusedDay(initial);
    // Initialize once on mount; subsequent selection changes retain the visible month.
  }, []);

  useEffect(() => {
    if (focusAfterMove.current) {
      calendar.current?.querySelector<HTMLButtonElement>(`button[data-date="${focusedDay}"]`)?.focus();
      focusAfterMove.current = false;
    }
  }, [focusedDay, month]);

  if (!today) return <div className="date-picker-loading" role="status">Öppnar kalendern…</div>;

  const days = monthDays(`${month}-01`);
  const monthTitle = new Intl.DateTimeFormat('sv-SE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseDate(`${month}-01`));
  const pendingRange = value.mode === 'range' && value.end === null;
  const weekend = upcomingWeekend(today);
  const weekendSelected = value.mode === 'range' && weekend.mode === 'range' && value.start === weekend.start && value.end === weekend.end;
  const helpText = value.mode === 'flexible' ? null : pendingRange ? (value.start ? 'Välj slutdatum. Du kan också välja en tidigare dag.' : 'Välj startdatum och sedan slutdatum.') : value.mode === 'range' ? 'Välj en ny startdag för att ändra perioden.' : 'Välj den dag du vill gå ut.';

  function choose(selection: DateSelection) {
    onChange(selection);
    if (selection.mode !== 'flexible' && selection.start) {
      setMonth(selection.start.slice(0, 7));
      setFocusedDay(selection.start);
    }
  }

  function changeMonth(offset: number) {
    const next = addMonths(`${month}-01`, offset);
    setMonth(next.slice(0, 7));
    setFocusedDay(next < today ? today : next);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    let target: string;
    const weekday = (parseDate(day).getUTCDay() + 6) % 7;
    switch (event.key) {
      case 'ArrowLeft': target = addDays(day, -1); break;
      case 'ArrowRight': target = addDays(day, 1); break;
      case 'ArrowUp': target = addDays(day, -7); break;
      case 'ArrowDown': target = addDays(day, 7); break;
      case 'Home': target = addDays(day, -weekday); break;
      case 'End': target = addDays(day, 6 - weekday); break;
      case 'PageUp': target = addMonths(day, event.shiftKey ? -12 : -1); break;
      case 'PageDown': target = addMonths(day, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    if (target < today) target = today;
    if (target === focusedDay) return;
    focusAfterMove.current = true;
    setMonth(target.slice(0, 7));
    setFocusedDay(target);
  }

  return (
    <div className="date-picker">
      <fieldset className="date-modes">
        <legend className="sr-only">Välj hur flexibel du är med datum</legend>
        {modes.map(mode => <label key={mode.value}><input className="sr-only" type="radio" name={id} checked={value.mode === mode.value} onChange={() => choose(mode.value === 'flexible' ? { mode: 'flexible' } : mode.value === 'single' ? { mode: 'single', start: value.mode === 'flexible' ? today : value.start ?? today } : { mode: 'range', start: null, end: null })} /><span>{mode.label}</span></label>)}
      </fieldset>
      <div className="date-shortcuts" role="group" aria-label="Snabbval för datum">
        <Chip selected={value.mode === 'single' && value.start === today} onClick={() => choose({ mode: 'single', start: today })}>Idag</Chip>
        <Chip selected={value.mode === 'single' && value.start === addDays(today, 1)} onClick={() => choose({ mode: 'single', start: addDays(today, 1) })}>Imorgon</Chip>
        <Chip selected={weekendSelected} onClick={() => choose(weekend)}>I helgen</Chip>
      </div>
      <div className="calendar-surface">
        <div className="calendar-toolbar">
          <button type="button" aria-label="Föregående månad" disabled={month <= today.slice(0, 7)} onClick={() => changeMonth(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
          <h2 id={`${id}-month`} aria-live="polite">{monthTitle}</h2>
          <button type="button" aria-label="Nästa månad" onClick={() => changeMonth(1)}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
        {helpText && <p id={`${id}-help`} className="calendar-help">{helpText}</p>}
        <table ref={calendar} role="grid" aria-labelledby={`${id}-month`} aria-describedby={helpText ? `${id}-help` : undefined} aria-multiselectable={value.mode === 'range'} className="calendar-grid">
          <thead><tr>{weekdays.map((day, index) => <th scope="col" key={day} aria-label={weekdayNames[index]}>{day}</th>)}</tr></thead>
          <tbody>{Array.from({ length: days.length / 7 }, (_, week) => <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((day, index) => {
            if (!day) return <td key={`empty-${index}`} />;
            const selected = value.mode !== 'flexible' && value.start !== null && (value.mode === 'single' ? value.start === day : day >= value.start && day <= (value.end ?? value.start));
            const endpoint = value.mode !== 'flexible' && (day === value.start || (value.mode === 'range' && day === value.end));
            return <td key={day} aria-selected={selected} className={selected && !endpoint ? 'in-range' : ''}><button type="button" data-date={day} data-endpoint={endpoint || undefined} aria-current={day === today ? 'date' : undefined} disabled={day < today} tabIndex={day === focusedDay ? 0 : -1} onFocus={() => setFocusedDay(day)} onKeyDown={event => handleKey(event, day)} onClick={() => onChange(selectDay(value, day))} aria-label={new Intl.DateTimeFormat('sv-SE', { dateStyle: 'full', timeZone: 'UTC' }).format(parseDate(day))}>{parseDate(day).getUTCDate()}</button></td>;
          })}</tr>)}</tbody>
        </table>
        <div className="calendar-legend"><span><i aria-hidden="true" />Idag</span><button type="button" onClick={() => { setMonth(today.slice(0, 7)); setFocusedDay(today); }}>Till dagens datum</button></div>
      </div>
      <div className="date-selection-summary" role="status" aria-live="polite" aria-atomic="true"><CalendarDays size={17} aria-hidden="true" /><span>{formatDateSelection(value)}</span>{value.mode !== 'flexible' && <button type="button" onClick={() => onChange({ mode: 'flexible' })}>Rensa</button>}</div>
    </div>
  );
}
