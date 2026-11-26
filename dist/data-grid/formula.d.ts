/** True when a spreadsheet could read the text as a formula once it is opened. A minus sign followed by a plain number is safe; any other minus sign is not. */
export declare function startsAsFormula(text: string): boolean;
/** The export form of a cell: one apostrophe added in front when the cell would start a formula. */
export declare function neutralizeFormula(text: string): string;
/** The import form of a cell: removes the one apostrophe that neutralizeFormula added, and nothing else. */
export declare function restoreFormula(cell: string): string;
