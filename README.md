# Obsidian Chorded Hotkeys 
Use 🎵 chords 🎵 to trigger text insertion, template insertion, or command execution.
A chord is a set of keys pressed at the same time, the order doesn't matter! 

## Warning
Chorded Hotkeys works through text replacement, it is advised that you create a backup of your vault before installing this plugin.

## Use Case
The use of chorded hotkeys is that it lets you quickly and easily trigger an action without using modifier keys (ctrl, alt, shift, etc). Chords are fast to use because the order of key-presses doesn't matter, you just press a set of keys at the same time, and presto, you've triggered a chord.

You might find this plugin helpful if there are specific commands you use often, templates you include frequently, or patterns of text you repeat.

## Creating Your First Chord
1. After installing, go to the Chored Hotkeys settings tab.
2. Click 'Add new chord' it will default to a 'Text' chord, which will be a simple text insertion.
3. The first field is the chord-trigger, the set of keys to execute the chord, these are the keys you'll have to press simultaneously to trigger the chord. So keep it short, Between two and four letters work best. For now, put 'hew' in the first box.
4. The second field is the value for the chord, it's treated differently depending on the chord type. For a text chord, it's the text to insert. Put 'Hello World'.
5. That's it! Your first chord is done. To try it out: close the settings, go to a file, and press the three letters 'hew' all at the same time.

## Chord Types
The current chord types are:
1. **Text:** Inserts text. 
2. **Command:** Runs a command.
3. **File:** Pastes the contents of a file.
4. **Template:** (Requires [Templater](https://github.com/SilentVoid13/Templater)) Pastes the contents of a template. Functionally equivalent to the file chord but also evaluates templates.

*Remark*: Since the order of key-presses doesn't matter, the chord-triggers of 'hew', 'hwe', 'ehw', etc. are all considered duplicates. Each chord must have a unique trigger.

## Tags 
A tag is a special element added to a chord to augment it's effect.
Currently there is only one tag, the cursor tag. Adding '{c}' in the value field of a text chord will move the cursor to that position upon activation.

## Demo
https://user-images.githubusercontent.com/14039575/199102931-e87a107d-202f-42e9-8247-10f9b4d6f397.mp4

## Roadmap 
- [ ] Change chord input to work like setting a hotkey instead of typing it out. 
- [ ] Improve duplicate key presentation in settings.
- [ ] Add error presentation in settings for invalid chord value (*e.g.* file that doesn't exist).
- [ ] Support for event keys (ctrl, shift, alt, etc.)
- [ ] Support for using command templates outside of a markdown editor.
- [ ] Support for vim mode.
