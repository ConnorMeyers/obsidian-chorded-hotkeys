import { Editor } from "obsidian";
import { replaceKeyInput } from "./chord-utils";

/**
 * Replaces the user input with the replacement text
 * @param editor editor for active file
 * @param key user input to trigger the chord
 * @param value file path
 */
export default function execute(editor: Editor, key: string, value: string): void {
    var text = value;
    var cursorOffset = value.length;

    [text, cursorOffset] = handleCursorTag(text, cursorOffset);

    // Handle backslash last since they can be used to prevent other features
    [text, cursorOffset] = handleEscapedBackslash(text, cursorOffset);

    const cursor = editor.getCursor();

    replaceKeyInput(editor, key, text);

    editor.setCursor({
        line: cursor.line,
        ch: cursor.ch + cursorOffset - key.length,
    });
}

/**
 * Handles the cursor tag {c}, moves cursor to its position if present
 * @param text current replacement text
 * @param cursorOffset current cursor offset
 * @returns [updated text, new cursor offset]
 */
function handleCursorTag(text: string, cursorOffset: number): [string, number] {
    var ctag = text.search(/\{c\}/);
    if (ctag >= 0 &&
        (ctag == 0 || text[ctag - 1] != "\\" || (ctag > 1 && text[ctag - 2] == "\\"))
    ) {
        cursorOffset += ctag - text.length;
        text = text.slice(0, ctag) + text.slice(ctag + 3);
    }

    return [text, cursorOffset];
}

/**
 * Handles replacement tags like {s} for space
 * @param text current replacement text
 * @param replacements mapping of tags to their replacement value
 * @returns updated text
 */
function replaceTags(text: string, replacements: { [tag: string]: string }): string {
    for (const [tag, replace] of Object.entries(replacements)) {
        text = text.replace(tag, replace);
    }

    return text;
}

/**
 * Replace double backslashes with single backslashes and updates the cursor offset
 * @param text current replacement text
 * @param cursorOffset current cursor offset
 * @returns [updated text, new cursor offset]
 */
function handleEscapedBackslash(text: string, cursorOffset: number): [string, number] {
    const count = (text.match(/\\\\/g) || []).length;
    text = text.replace(/\\\\/g, "\\");
    cursorOffset -= count;
    return [text, cursorOffset];
}