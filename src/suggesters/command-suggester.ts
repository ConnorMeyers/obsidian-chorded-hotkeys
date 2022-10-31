import { App } from "obsidian";
import { TextInputSuggest } from "./suggest";

export class CommandSuggster extends TextInputSuggest<string> {
    private _commands: Array<string>;

    constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
        super(app, inputEl);

        // @ts-ignore
        this._commands = app.commands.listCommands().map(c => c.name);
    }

    public getSuggestions(inputStr?: string | undefined): string[] {
        const lowerCaseInputStr = inputStr?.toLowerCase() ?? "";
        return this._commands.filter(c => c.toLowerCase().contains(lowerCaseInputStr));
    }

    public renderSuggestion(item: string, el: HTMLElement): void {
        el.setText(item);
    }

    public selectSuggestion(item: string, evt: KeyboardEvent | MouseEvent): void {
        this.inputEl.value = item;
        this.inputEl.trigger("input");
        this.close();
    }
}