import { useState } from 'react';

interface InlineTimeEditorProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function InlineTimeEditor({ value: initialValue, onSave, onCancel, isPending }: InlineTimeEditorProps) {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (!value) return;
    onSave(value);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="time"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[36px]"
        autoFocus
      />
      <button
        onClick={handleSave}
        disabled={isPending || !value}
        className="text-green-600 font-medium min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-green-50 rounded-lg disabled:opacity-30"
        aria-label="Salvar"
      >✓</button>
      <button
        onClick={onCancel}
        className="text-gray-400 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-gray-100 rounded-lg"
        aria-label="Cancelar"
      >✕</button>
    </div>
  );
}