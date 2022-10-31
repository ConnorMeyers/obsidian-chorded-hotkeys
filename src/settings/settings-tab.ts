import ChordsPlugin from "../main";
import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { delayToWpm, wpmToDelay } from "./settings";
import { ChordType } from "src/chords/chord-manager";
import { CommandSuggster } from "src/suggesters/command-suggester";
import { FileSuggest } from "src/suggesters/file-suggester";

export default class ChordsSettingTab extends PluginSettingTab {
    private readonly _plugin: ChordsPlugin;

    private readonly _chordSettingFunctions = {
        [ChordType.Text]: this.addTextChordSettings,
        [ChordType.Command]: this.addCommandChordSettings,
        [ChordType.Template]: this.addFileChordSettings,
        [ChordType.File]: this.addFileChordSettings,
    }

    public constructor(app: App, plugin: ChordsPlugin) {
        super(app, plugin);
        this._plugin = plugin;
    }

    /**
     * Display settings tab
     */
    public display(): void {
        this.containerEl.empty();

        this.containerEl.createEl('h2', { text: `${this._plugin.AppName} - ${this._plugin.AppVersion}` });

        this.addNoticeToggle();

        this.containerEl.createEl('h3', { text: "Delay" });
        this.addDelayWPMToggle();
        if (this._plugin.Settings.setDelayManually) {
            this.addDelaySettings();
        }
        else {
            this.addWpmSettings();
        }

        this.containerEl.createEl('h3', { text: "Chords" });
        this.addChordsSettings()
    }

    /**
     * Adds notice toggles
     * Chords will create a notice when used if their toggle is on
     */
    private addNoticeToggle(): void {
        new Setting(this.containerEl.createDiv())
            .setName("Text Chord Notice")
            .setDesc("Show a notice when a text chord is executed")
            .addToggle(t => t.setValue(this._plugin.Settings.showTextChordExecuted).onChange(async v => {
                this._plugin.Settings.showTextChordExecuted = v;
                await this._plugin.saveSettings();
            }));

        new Setting(this.containerEl.createDiv())
            .setName("Command Template Notice")
            .setDesc("Show a notice when a template chord is executed")
            .addToggle(t => t.setValue(this._plugin.Settings.showTemplateChordExecuted).onChange(async v => {
                this._plugin.Settings.showTemplateChordExecuted = v;
                await this._plugin.saveSettings();
            }));

        new Setting(this.containerEl.createDiv())
            .setName("Command File Notice")
            .setDesc("Show a notice when a file chord is executed")
            .addToggle(t => t.setValue(this._plugin.Settings.showFileChordExecuted).onChange(async v => {
                this._plugin.Settings.showFileChordExecuted = v;
                await this._plugin.saveSettings();
            }));

        new Setting(this.containerEl.createDiv())
            .setName("Command Chord Notice")
            .setDesc("Show a notice when a command chord is executed")
            .addToggle(t => t.setValue(this._plugin.Settings.showCommandChordExecuted).onChange(async v => {
                this._plugin.Settings.showCommandChordExecuted = v;
                await this._plugin.saveSettings();
            }));
    }

    /**
     * Adds a toggle to switch between WPM input and manual delay setting
     */
    private addDelayWPMToggle(): void {
        new Setting(this.containerEl)
            .setName("Set Delay Manually")
            .setDesc("Delay is the maximum duration between key presses in a chord, toggle this to set it yourself")
            .addToggle(t => t.setValue(this._plugin.Settings.setDelayManually).onChange(async v => {
                this._plugin.Settings.setDelayManually = v;
                await this._plugin.saveSettings();
                this.display();
            }));
    }

    /**
     * Adds manual delay settings
     */
    private addDelaySettings(): void {
        new Setting(this.containerEl.createDiv())
            .setName("Delay (ms)")
            .setDesc("Must be tailored to your typing speed")
            .addText(text => {
                text.setValue(String(this._plugin.Settings.delay)).onChange(
                    async (value) => {
                        if (!isNaN(Number(value)) && Number(value) >= 0) {
                            this._plugin.Settings.delay = Number(value);
                            await this._plugin.saveSettings();
                        } else {
                            new Notice("Specify a valid number.");
                        }
                    }
                );
            });
    }

    /**
     * Adds automatic delay settings via wpm input
     */
    private addWpmSettings(): void {
        new Setting(this.containerEl.createDiv())
            .setName("Typing Speed (WPM)")
            .setDesc("The delay will be calculated automatically based on your typing speed")
            .addText(text => {
                text.setValue(String(delayToWpm(this._plugin.Settings.delay))).onChange(
                    async (value) => {
                        if (!isNaN(Number(value)) && Number(value) >= 0) {
                            this._plugin.Settings.delay = wpmToDelay(Number(value));
                            await this._plugin.saveSettings();
                        } else {
                            new Notice("Specify a valid number.");
                        }
                    }
                );
            });
    }

    /**
     * Adds chord input settings
     */
    private addChordsSettings(): void {
        new Setting(this.containerEl)
            .setDesc(createFragment((descEl) => {
                descEl.appendText("Text chords are used to insert text (similar to text expander)");
            }))
            .setClass("chords-pre-editor-text");

        this._plugin.Settings.chords.forEach(({ key, value, chordType }, index) => {
            var chordSetting = new Setting(this.containerEl.createDiv())
                .addText(text => {
                    text.setPlaceholder("sav")
                        .setValue(key)
                        .onChange(async newKey => {
                            await this._plugin.ChordManager.updateChordKey(index, newKey);

                            if (this._plugin.ChordManager.isDuplicateKey(index)) {
                                text.inputEl.addClass("chords-error");
                            }
                            else {
                                text.inputEl.removeClass("chords-error");
                            }
                        });

                    text.inputEl.addClass("chords-key");
                });

            chordSetting = this._chordSettingFunctions[chordType].bind(this)(chordSetting, value, index);

            chordSetting.addDropdown(cb => {
                cb.addOptions(Object.fromEntries(Object.keys(ChordType).filter(c => isNaN(Number(c))).map(c => [c, c])))
                    .setValue(ChordType[chordType])
                    .onChange(async newValue => {
                        const newChordType = ChordType[newValue as keyof typeof ChordType]
                        await this._plugin.ChordManager.updateChordType(index, newChordType);
                        this.display();
                    });
            })
                .addExtraButton(cb => {
                    cb.setIcon("up-chevron-glyph")
                        .setTooltip("Move up")
                        .onClick(async () => {
                            await this._plugin.ChordManager.swapIndex(index, index - 1);
                            this.display();
                        });
                })
                .addExtraButton(cb => {
                    cb.setIcon("down-chevron-glyph")
                        .setTooltip("Move down")
                        .onClick(async () => {
                            await this._plugin.ChordManager.swapIndex(index, index + 1);
                            this.display();
                        });
                })
                .addExtraButton(cb => {
                    cb.setIcon("cross")
                        .setTooltip("Delete")
                        .onClick(async () => {
                            await this._plugin.ChordManager.removeChord(index);
                            this.display();
                        })
                });
            chordSetting.infoEl.remove();
        });

        new Setting(this.containerEl.createDiv())
            .addButton(cb => {
                cb.setButtonText("Add new chord")
                    .setCta()
                    .onClick(async () => {
                        await this._plugin.ChordManager.addBlankChord();
                        this.display();
                    });
            });
    }

    /**
     * Adds file chord settings
     * @param chordSetting current setting to add to
     * @param value file path
     * @param index index of chord in settings.chords
     * @returns updated setted for chaining
     */
    private addFileChordSettings(chordSetting: Setting, value: string, index: number): Setting {
        chordSetting = chordSetting.addSearch(cb => {
            new FileSuggest(app, cb.inputEl);
            cb.setPlaceholder("file.md")
                .setValue(value)
                .onChange(async (newValue) => {
                    await this._plugin.ChordManager.updateChordValue(index, newValue);
                });

            // @ts-ignore
            cb.containerEl.addClass("chords-search");
        });
        return chordSetting;
    }

    /**
     * Adds command chord settings
     * @param chordSetting current setting to add to
     * @param value command
     * @param index index of chord in settings.chords
     * @returns updated setted for chaining
     */
    private addCommandChordSettings(chordSetting: Setting, value: string, index: number): Setting {
        chordSetting = chordSetting.addSearch(cb => {
            new CommandSuggster(app, cb.inputEl);
            cb.setPlaceholder("Save current file")
                .setValue(value)
                .onChange(async (newValue) => {
                    await this._plugin.ChordManager.updateChordValue(index, newValue);
                });

            // @ts-ignore
            cb.containerEl.addClass("chords-search");
        });
        return chordSetting;
    }

    /**
     * Adds text chord settings
     * @param chordSetting current setting to add to
     * @param value replacement text
     * @param index index of chord in settings.chords
     * @returns updated setted for chaining
     */
    private addTextChordSettings(chordSetting: Setting, value: string, index: number): Setting {
        chordSetting = chordSetting.addTextArea(cb => {
            cb.setPlaceholder("chord here")
                .setValue(value)
                .onChange(async (newValue) => {
                    await this._plugin.ChordManager.updateChordValue(index, newValue);
                });

            // @ts-ignore
            cb.inputEl.addClass("chords-text-area");
        });
        return chordSetting;
    }
}