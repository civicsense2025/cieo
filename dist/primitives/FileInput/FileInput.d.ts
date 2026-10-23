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
export declare function FileInput({ label, name, accept, multiple, disabled, required, onChange }: FileInputProps): import("react/jsx-runtime").JSX.Element;
