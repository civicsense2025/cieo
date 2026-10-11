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
export declare function FileInput({ label, name, accept, multiple }: FileInputProps): import("react/jsx-runtime").JSX.Element;
