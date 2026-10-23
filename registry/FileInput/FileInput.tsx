'use client';
/* FileInput. Native file picker. onChange receives the chosen files. */
export interface FileInputProps {
  label: string;
  name?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Called with the chosen files (empty array when cleared). */
  onChange?: (files: File[]) => void;
}

export function FileInput({ label, name, accept, multiple = false, disabled, required, onChange }: FileInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="file" className="cieo cieo-input" name={name} accept={accept} multiple={multiple} disabled={disabled} required={required} onChange={(e) => onChange?.([...(e.currentTarget.files ?? [])])} />
    </label>
  );
}
