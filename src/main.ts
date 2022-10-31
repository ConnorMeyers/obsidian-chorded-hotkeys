import { Plugin, Editor, MarkdownView, App, PluginManifest } from "obsidian";
import { ChordsPluginSettings, DEFAULT_SETTINGS } from "./settings/settings";
import ChordsSettingTab from "./settings/settings-tab";
import ChordManager from "./chords/chord-manager";

export default class ChordsPlugin extends Plugin {
    private _input: string;
    private _chordManager: ChordManager;
    private _timeoutId: NodeJS.Timeout;

    public Settings: ChordsPluginSettings;

    public readonly AppName: string;
    public readonly AppVersion: string;

    private constructor(app: App, manifest: PluginManifest) {
        super(app, manifest);

        this.AppName = manifest.name;
        this.AppVersion = manifest.version;

        this._input = "";
    }

    public async onload(): Promise<void> {
        await this.loadSettings();

        this._chordManager = new ChordManager(this);

        this.addSettingTab(new ChordsSettingTab(this.app, this));

        this.registerDomEvent(document, "keydown", this.onKeydown.bind(this));
    }

    public getCurrentEditor(): Editor | null {
        return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
    }

    public async saveSettings(): Promise<void> {
        await this.saveData(this.Settings);
    }

    public get ChordManager(): ChordManager {
        return this._chordManager;
    }

    private async loadSettings(): Promise<void> {
        this.Settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    private onKeydown(event: KeyboardEvent): void {
        const editor = this.getCurrentEditor();
        if (!editor || !editor.hasFocus()) return;

        // Ignore and reset input because a control key (ctrl, shift, win, etc) was used
        if (event.key.length > 1) {
            this._input = "";
            return;
        }

        this._input += event.key;

        // Reset timeout if one was running
        clearTimeout(this._timeoutId);

        // Create timeout to check for valid chords after the delay
        this._timeoutId = setTimeout(function () {
            this._chordManager.handleChord(this._input, editor);
            this._input = "";
        }.bind(this), this.Settings.delay);
    }
}