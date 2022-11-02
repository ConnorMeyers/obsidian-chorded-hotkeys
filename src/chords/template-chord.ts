import { Editor, Notice, TFile } from "obsidian";
import { replaceKeyInput } from "./chord-utils";

/**
 * Removes user input and pastes the content of a template file
 * @param editor editor for active file
 * @param key user input to trigger the chord
 * @param path template file path
 */
export default async function execute(editor: Editor, key: string, path: string): Promise<void> {
    replaceKeyInput(editor, key);

    //@ts-ignore
    const templaterPlugin = app.plugins.plugins["templater-obsidian"];

    if (templaterPlugin) {
        const file = app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            var content = await app.vault.read(file);
            const activeFile = app.workspace.getActiveFile();

            //@ts-ignore
            content = await templaterPlugin.templater.parse_template({ target_file: activeFile, run_mode: 4 }, content);

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
    else {
        new Notice("Templater plugin must be enabled for template chords");
    }
}