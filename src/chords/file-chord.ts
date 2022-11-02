import { Editor, Notice, TFile } from "obsidian";
import { replaceKeyInput } from "./chord-utils";

/**
 * Removes user input and pastes the content of a file
 * @param editor editor for active file
 * @param key user input to trigger the chord
 * @param path file path
 */
export default async function execute(editor: Editor, key: string, path: string): Promise<void> {
    replaceKeyInput(editor, key);

    const file = app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
        const content = await app.vault.read(file);
        replaceKeyInput(editor, "", content);

        const cursor = editor.getCursor();
        editor.setCursor({
            line: cursor.line,
            ch: cursor.ch + content.length,
        });
    }
    else {
        new Notice(`File not found for chord: ${path}`);
    }
}