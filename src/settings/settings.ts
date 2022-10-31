import { ChordData } from "src/chords/chord-manager";

/**
 * @member delay maximum duration (ms) between keys to be considered part of the chord. Delay needs to be less than the users inter-character typing delay
 * @member showWPM determines if we should calculate the delay based on the user's WPM (false) or if the delay is entered manually
 * @member showTextChordExecuted if we should display a notice when a text chord is executed
 * @member showTemplateChordExecuted if we should display a notice when a template chord is executed
 * @member showFileChordExecuted if we should display a notice when a file chord is executed
 * @member showCommandChordExecuted if we should display a notice when a command chord is executed
 * @member chords array of user created chords
 */
export interface ChordsPluginSettings {
    delay: number;
    setDelayManually: boolean;
    showTextChordExecuted: boolean;
    showTemplateChordExecuted: boolean;
    showFileChordExecuted: boolean;
    showCommandChordExecuted: boolean;
    chords: Array<ChordData>;
}

export const DEFAULT_SETTINGS: ChordsPluginSettings = {
    delay: wpmToDelay(80),
    setDelayManually: false,
    showTextChordExecuted: false,
    showTemplateChordExecuted: false,
    showFileChordExecuted: false,
    showCommandChordExecuted: true,
    chords: [],
};

/**
 * The following two conversion functions are based on this math:
 * Delay is equal to the inter-character time of one's typing speed.
 * AVG_CHAR_PER_WORD represents the average amount of characters per word
 * The time it takes to type one word in ms is: AVG_CHAR_PER_WORD * delay
 * Convert to seconds: AVG_CHAR_PER_WORD * delay / 1,000
 * Wpm is 60 seconds over the time it takes for a word: wpm = 60 / (AVG_CHAR_PER_WORD * delay / 1,000)
 * The average amount of characters per word is 5, we'll add one for spaces: AVG_CHAR_PER_WORD = 6
 * Simplifying: wpm = 10,000 / delay
 * And the converse: delay = 10,000 / wpm
 * 
 * This converts wpm to delay (ms), but if we use the user's typing speed we will calculate their normal 
 * typing delay, we want the chord delay to be less than the user's normal delay, otherwise normal typing
 * will be considered a chord. To account for this, we'll divide the delay by k. I found that a k value of 3 works best
 * but this is more or less arbitrary: k = 3
 * 
 * delay = (10,000 / wpm) / k = 3,333 / wpm
 * wpm = 10,000 / (delay * k) = 3,333 / delay
 */

/**
 * Converts delay to wpm
 * @param delay delay in ms
 * @returns typing speed in wpm
 */
export function delayToWpm(delay: number): number {
    return 3_333 / delay;
}

/**
 * Converts wpm to delay
 * @param wpm typing speed in wpm
 * @returns delay in ms
 */
export function wpmToDelay(wpm: number): number {
    return 3_333 / wpm;
}
