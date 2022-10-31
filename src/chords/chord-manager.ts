import { Editor, Notice } from "obsidian";
import "../utils/string.extensions";
import TextChord from "./text-chord";
import CommandChord from "./command-chord";
import ChordsPlugin from "src/main";
import TemplateChord from "./template-chord";
import FileChord from "./file-chord";

/**
 * Represents the different types of chords
 */
export enum ChordType { Text, Command, Template, File }

/**
 * The format in which chords are saved as
 */
export type ChordData = { key: string, value: string, chordType: ChordType };

/**
 * A mapping of user input to chord indexes (index of saved chords array) 
 */
type ChordDictionary = { [input: string]: number };

/**
 * Chord execution functions, should be a one-to-one mapping with ChordType
 */
const ChordFunctions = {
    [ChordType.Text]: TextChord,
    [ChordType.Command]: CommandChord,
    [ChordType.Template]: TemplateChord,
    [ChordType.File]: FileChord,
}

/**
 * Responsible for mapping user input to chords and updating the settings.chords
 * TODO: Split into two classes, one for managing settings.chords the other for managing the mapping
 */
export default class ChordManager {
    private readonly _plugin: ChordsPlugin;

    private _chordDict: ChordDictionary;

    public constructor(plugin: ChordsPlugin) {
        this._plugin = plugin;
        this._chordDict = {};

        this._plugin.Settings.chords.forEach((_, index) => {
            this.enableChord(index);
        });
    }

    /**
     * Attempts to execute a chord based on user input
     * @param input user input
     * @param editor current editor
     */
    public handleChord(input: string, editor: Editor): void {
        const chord = this.getChord(input);

        if (chord) {
            ChordFunctions[chord.chordType](editor, chord.key, chord.value);

            if ((this._plugin.Settings.showTextChordExecuted && chord.chordType == ChordType.Text) ||
                (this._plugin.Settings.showCommandChordExecuted && chord.chordType == ChordType.Command)) {
                new Notice(`${ChordType[chord.chordType]} Chord Executed: ${chord.key}`);
            }
        }
    }

    /**
     * Changes the key of a chord
     * @param index index of chord in settings.chords
     * @param newKey new key for the chord
     */
    public async updateChordKey(index: number, newKey: string): Promise<void> {
        this.disableChord(index);
        this._plugin.Settings.chords[index].key = newKey;
        this.enableChord(index);
        await this._plugin.saveSettings();
    }

    /**
     * Changes the value of a chord
     * @param index index of chord in settings.chords
     * @param newValue new value for chord
     */
    public async updateChordValue(index: number, newValue: string): Promise<void> {
        this._plugin.Settings.chords[index].value = newValue;
        await this._plugin.saveSettings();
    }

    /**
     * Changes the type of a chord
     * @param index index of chord in settings.chords
     * @param newChordType new ChordType for the chord
     */
    public async updateChordType(index: number, newChordType: ChordType): Promise<void> {
        this._plugin.Settings.chords[index].chordType = newChordType;
        await this._plugin.saveSettings();
    }

    /**
     * Deletes a chord
     * @param index index of chord in settings.chords
     */
    public async removeChord(index: number): Promise<void> {
        this.disableChord(index);
        this._plugin.Settings.chords.splice(index, 1);
        await this._plugin.saveSettings();
    }

    /**
     * Creates an empty text chord
     */
    public async addBlankChord(): Promise<void> {
        const newChord = { key: "", value: "", chordType: ChordType.Text };
        const count = this._plugin.Settings.chords.push(newChord);
        this.enableChord(count - 1);
        await this._plugin.saveSettings();
    }

    /**
     * Swaps the indexes (position in settings.chords) of two chords
     * Used to change display order
     * @param index1 index of first chord
     * @param index2 index of second chord
     */
    public async swapIndex(index1: number, index2: number): Promise<void> {
        const fromKey = this._plugin.Settings.chords[index1].key.sort();
        const toKey = this._plugin.Settings.chords[index2].key.sort();

        if (this._chordDict[fromKey as keyof ChordDictionary] == index1) {
            this._chordDict[fromKey as keyof ChordDictionary] = index2;
        }

        if (this._chordDict[toKey as keyof ChordDictionary] == index2) {
            this._chordDict[toKey as keyof ChordDictionary] = index1;
        }

        const element = this._plugin.Settings.chords[index1];
        this._plugin.Settings.chords[index1] = this._plugin.Settings.chords[index2];
        this._plugin.Settings.chords[index2] = element;

        await this._plugin.saveSettings();
    }

    /**
     * Checks if a key is a duplicate (both duplicates will return true)
     * @param index index of chord in settings.chords
     * @return if there are more than one copy of the key 
     */
    public isDuplicateKey(index: number): boolean {
        const key = this._plugin.Settings.chords[index].key.sort();
        return this._plugin.Settings.chords.findIndex((c, i) => c.key.sort() == key && i != index) >= 0;
    }

    /**
     * Enables a chord so it can be used
     * Required to set up hashing for keys to chords
     * @param index index of chord in settings.chords
     */
    private enableChord(index: number): void {
        const newKey = this._plugin.Settings.chords[index].key.sort();
        if (newKey in this._chordDict) {
            return;
        }

        this._chordDict[newKey] = index;
    }

    /**
     * Disables a chord so it can't be used
     * @param index index of chord in settings.chords
     */
    private disableChord(index: number): void {
        const key = this._plugin.Settings.chords[index].key.sort();

        if (this._chordDict[key as keyof ChordDictionary] == index) {
            delete this._chordDict[key as keyof ChordDictionary];

            const duplicateKey = this._plugin.Settings.chords.findIndex((c, i) => c.key.sort() == key && i != index);
            if (duplicateKey >= 0) {
                this.enableChord(duplicateKey);
            }
        }
    }

    /**
     * Gets a chord from user input
     * @param key user input
     * @returns chord if found
     */
    private getChord(key: string): ChordData | undefined {
        key = key.sort();
        const chordIndex = this._chordDict[key as keyof ChordDictionary];
        return this._plugin.Settings.chords[chordIndex];
    }
}