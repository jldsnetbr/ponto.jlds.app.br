import { Input } from './Input';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <Input
      label={label}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}