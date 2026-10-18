'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Chip } from './Chip';
import { addDays, addMonths, formatDateSelection, formatDay, monthDays, parseDate, selectDay, todayInGothenburg, upcomingWeekend } from '@/lib/dates';
import type { DateSelection } from '@/types/preferences';

type Props = { value: DateSelection; onChange: (value: DateSelection) => void };
const modes = ['single', 'range', 'flexible'] as const;
// 2026-01-05 is a Monday: the week starts there, as the grid does.
const capitalise = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

export function DatePicker({ value, onChange }: Props) {
  const id = useId();
  const t = useTranslations('match.datePicker');
  const all = useTranslations();
  const locale = useLocale();
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

  if (!today) return <div className="date-picker-loading" role="status">{t('loading')}</div>;

  const days = monthDays(`${month}-01`);
  const monthTitle = formatDay(`${month}-01`, locale, { month: 'long', year: 'numeric' });
  const weekdayDates = Array.from({ length: 7 }, (_, index) => addDays('2026-01-05', index));
  const pendingRange = value.mode === 'range' && value.end === null;
  const weekend = upcomingWeekend(today);
  const weekendSelected = value.mode === 'range' && weekend.mode === 'range' && value.start === weekend.start && value.end === weekend.end;
  const helpText = value.mode === 'flexible' ? null : pendingRange ? (value.start ? t('helpEnd') : t('helpStart')) : value.mode === 'range' ? t('helpChange') : t('helpSingle');

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
        <legend className="sr-only">{t('modesLegend')}</legend>
        {modes.map(mode => <label key={mode}><input className="sr-only" type="radio" name={id} checked={value.mode === mode} onChange={() => choose(mode === 'flexible' ? { mode: 'flexible' } : mode === 'single' ? { mode: 'single', start: value.mode === 'flexible' ? today : value.start ?? today } : { mode: 'range', start: null, end: null })} /><span>{t(mode)}</span></label>)}
      </fieldset>
      <div className="date-shortcuts" role="group" aria-label={t('shortcuts')}>
        <Chip selected={value.mode === 'single' && value.start === today} onClick={() => choose({ mode: 'single', start: today })}>{t('today')}</Chip>
        <Chip selected={value.mode === 'single' && value.start === addDays(today, 1)} onClick={() => choose({ mode: 'single', start: addDays(today, 1) })}>{t('tomorrow')}</Chip>
        <Chip selected={weekendSelected} onClick={() => choose(weekend)}>{t('weekend')}</Chip>
      </div>
      <div className="calendar-surface">
        <div className="calendar-toolbar">
          <button type="button" aria-label={t('previousMonth')} disabled={month <= today.slice(0, 7)} onClick={() => changeMonth(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
          <h2 id={`${id}-month`} aria-live="polite">{monthTitle}</h2>
          <button type="button" aria-label={t('nextMonth')} onClick={() => changeMonth(1)}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
        {helpText && <p id={`${id}-help`} className="calendar-help">{helpText}</p>}
        <table ref={calendar} role="grid" aria-labelledby={`${id}-month`} aria-describedby={helpText ? `${id}-help` : undefined} aria-multiselectable={value.mode === 'range'} className="calendar-grid">
          <thead><tr>{weekdayDates.map(day => <th scope="col" key={day} aria-label={capitalise(formatDay(day, locale, { weekday: 'long' }))}>{capitalise(formatDay(day, locale, { weekday: 'short' }).slice(0, 2))}</th>)}</tr></thead>
          <tbody>{Array.from({ length: days.length / 7 }, (_, week) => <tr key={week}>{days.slice(week * 7, week * 7 + 7).map((day, index) => {
            if (!day) return <td key={`empty-${index}`} />;
            const selected = value.mode !== 'flexible' && value.start !== null && (value.mode === 'single' ? value.start === day : day >= value.start && day <= (value.end ?? value.start));
            const endpoint = value.mode !== 'flexible' && (day === value.start || (value.mode === 'range' && day === value.end));
            return <td key={day} aria-selected={selected} className={selected && !endpoint ? 'in-range' : ''}><button type="button" data-date={day} data-endpoint={endpoint || undefined} aria-current={day === today ? 'date' : undefined} disabled={day < today} tabIndex={day === focusedDay ? 0 : -1} onFocus={() => setFocusedDay(day)} onKeyDown={event => handleKey(event, day)} onClick={() => onChange(selectDay(value, day))} aria-label={formatDay(day, locale, { dateStyle: 'full' })}>{parseDate(day).getUTCDate()}</button></td>;
          })}</tr>)}</tbody>
        </table>
        <div className="calendar-legend"><span><i aria-hidden="true" />{t('today')}</span><button type="button" onClick={() => { setMonth(today.slice(0, 7)); setFocusedDay(today); }}>{t('toToday')}</button></div>
      </div>
      <div className="date-selection-summary" role="status" aria-live="polite" aria-atomic="true"><CalendarDays size={17} aria-hidden="true" /><span>{formatDateSelection(value, locale, all)}</span>{value.mode !== 'flexible' && <button type="button" onClick={() => onChange({ mode: 'flexible' })}>{t('clear')}</button>}</div>
    </div>
  );
}
