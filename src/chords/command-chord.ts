import { Editor, Notice } from "obsidian";
import { replaceKeyInput } from "./chord-utils";

/**
 * Removes user input and executes a command
 * @param editor editor for active file
 * @param key user input to trigger the chord
 * @param value command name
 */
export default function execute(editor: Editor, key: string, value: string): void {
    replaceKeyInput(editor, key);

    //@ts-ignore
    const command = app.commands.listCommands().find(c => c.name == value);

    if (command) {
        //@ts-ignore
        app.commands.executeCommandById(command.id);
    }
    else {
        new Notice(`Command not found: ${value}`);
    }
}