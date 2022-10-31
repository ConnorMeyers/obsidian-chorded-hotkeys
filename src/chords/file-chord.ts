import { Editor, Notice } from "obsidian";
import { replaceKeyInput } from "./chord-utils";

/**
 * Removes user input and pastes the content of a file
 * @param editor editor for active file
 * @param key user input to trigger the chord
 * @param value file path
 */
export default async function execute(editor: Editor, key: string, value: string): Promise<void> {
    replaceKeyInput(editor, key);

    const file = app.vault.getMarkdownFiles().find(f => f.path == value);
    if (file) {
        const content = await app.vault.read(file);
        replaceKeyInput(editor, "", content);

        const cursor = editor.getCursor();
        editor.setCursor({
            line: cursor.line,
            ch: cursor.ch + content.length,
        });
    }
    else {
        new Notice(`File not found for chord: ${value}`);
    }
}