import { Editor } from "obsidian";

/**
 * Replaces user input prior to the cursor
 * @param editor editor for active file
 * @param key user input to replace
 * @param replacement text to replace key with
 */
export function replaceKeyInput(editor: Editor, key: String, replacement: string = ""): void {
    const cursor = editor.getCursor();

    editor.replaceRange(
        replacement,
        { line: cursor.line, ch: cursor.ch - key.length },
        { line: cursor.line, ch: cursor.ch }
    );
}