'use client';
// src/primitives/FileInput/FileInput.tsx
/* FileInput. Labelled file picker: one native file input reusing the shared input style from styles/controls.css. No new CSS. */
export interface FileInputProps {
  /** Visible label for the picker (e.g. "Upload report"). Required. */
  label: string;
  /** Form field name. Optional. */
  name?: string;
  /** Accepted MIME types or extensions (e.g. ".pdf,.docx"). Optional. */
  accept?: string;
  /** Allow multiple files. Defaults to false. */
  multiple?: boolean;
}

export function FileInput({ label, name, accept, multiple = false }: FileInputProps) {
  return (
    <label className="cieo">
      <span className="cieo-label">{label}</span>
      <input type="file" className="cieo cieo-input" name={name} accept={accept} multiple={multiple} />
    </label>
  );
}
