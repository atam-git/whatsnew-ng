'use client';

import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import './datetime-picker.css';
import { cn } from '@/lib/utils/cn';
import { APP_TIMEZONE } from '@/lib/utils/format';

/** "Now", but represented so the picker's local-time logic (day/hour comparisons)
 *  reflects WAT wall-clock time regardless of the admin's device timezone. */
function nowInAppZone(): Date {
  return toZonedTime(new Date(), APP_TIMEZONE);
}

interface DateTimePickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  /** Defaults to "now" in WAT — pass only to override (e.g. a later minimum). */
  minDate?: Date;
  /** Set false for date-only fields (deadlines, start dates) that have no time-of-day. */
  showTime?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  minDate,
  showTime = true,
  disabled = false,
  invalid = false,
  className,
}: DateTimePickerProps) {
  // Everything below operates on "WAT wall-clock, read via local Date getters" -
  // i.e. value stored/interpreted as if the admin's device were set to WAT. This
  // keeps calendar/time display and past-date blocking consistent for every admin,
  // no matter what timezone their computer is actually set to.
  const effectiveMinDate = minDate ?? nowInAppZone();
  const selectedDate = value ? toZonedTime(new Date(value), APP_TIMEZONE) : null;

  const handleChange = (date: Date | null) => {
    if (date) {
      // `date` carries the wall-clock fields the admin picked; treat them as WAT
      // and convert to the real UTC instant for storage.
      onChange(fromZonedTime(date, APP_TIMEZONE).toISOString());
    } else {
      onChange(null);
    }
  };

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={handleChange}
      showTimeSelect={showTime}
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat={showTime ? 'd MMM yyyy, h:mm aa' : 'd MMM yyyy'}
      minDate={effectiveMinDate}
      filterDate={(d) => d >= new Date(effectiveMinDate.toDateString())}
      minTime={
        showTime
          ? selectedDate && isSameDay(selectedDate, effectiveMinDate)
            ? effectiveMinDate
            : new Date(new Date().setHours(0, 0, 0, 0))
          : undefined
      }
      maxTime={showTime ? new Date(new Date().setHours(23, 59, 59, 999)) : undefined}
      disabled={disabled}
      placeholderText={showTime ? 'Select date and time' : 'Select date'}
      customInput={<DateInput invalid={invalid} />}
      className={className}
      popperClassName="z-50"
      calendarClassName="!font-sans"
    />
  );
}

interface DateInputProps {
  value?: string;
  onClick?: () => void;
  invalid?: boolean;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onClick, invalid }, ref) => {
    return (
      <input
        type="text"
        value={value || ''}
        onClick={onClick}
        ref={ref}
        readOnly
        placeholder="Select date and time"
        className={cn(
          'border-line bg-canvas text-ink placeholder:text-muted',
          'flex h-9 w-full rounded-md border px-3 py-2 text-[13px]',
          'transition-colors duration-100',
          'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20',
        )}
      />
    );
  },
);

DateInput.displayName = 'DateInput';
