### This project is in a beta release and has several planned feature missing for the time being.
# ![](https://i.imgur.com/kC5TrgS.png) BluMidiVisualizer ![](https://i.imgur.com/kC5TrgS.png)
Make videos that shows every aspect of your cool music using midi files!

![A preview of the editor in use](https://i.imgur.com/XpJsfDc.png)
---

## Header Buttons
### File
- Load Midi: Load a new midi file. **WILL REPLACE CURRENTLY OPENED PROJECT SO BE CAREFUL!**
- Open Project...: Opens file prompt to open exported project json files
- Save: Saves project file, opens save as file prompt if project has never been saved before
- Save As: File prompt to decide where to save project file
- Export...: Opens video export popup
- Close: **CLOSES ENTIRE EDITOR, BE CAREFUL!**

### Help
- Overview: Links to this page
- Planet Bluto: Links to my portfolio site :)

## Properties Panel
There are a lot of properties to mess around with to make your midi video look neat!
### Play Area (configure the main play area space)
- Zoom ``(number)``: Controls the width of the notes
- Rounded Notes ``(toggle)``: Whether the notes should have "bullet-point" or squared ends
- Playhead Width ``(number)``: Width of the playhead that goes over notes
- Playhead Color ``(color)``: Default color of the playhead
### Piano (configure the look of the piano)
- Notes ``(number)``: The number of notes visible on the screen
- Starting Note ``(number)``: Offsets the piano roll by the specified amount of steps
- Width ``(number)``: Width of the piano in pixels
- Black Width ``(number)``: Width of the unnatural keys of the piano **(you can set this property and "Width" to 0 to hide piano)**
- Colors - Natural ``(color)``: Color of the natural keys on piano
- Colors - Unnatural ``(color)``: Color of the unnatural keys on piano
### Background (configure the look of the background)
- Image ``(file [png, jpeg, jpg, webp])``: Image visible behind alternating colors
- Image Align ``(drop-down)``: The alignment of the image
- Image Type ``(drop-down)``: Other image manipulation options
- Colors - First ``(color)``: Color of one of the alternating background lines
- Colors - Second ``(color)``: Color of other alternating background line
- Opacity ``(number)``: Opacity of alternating background lines
- Colors - Background ``(color)``: Color behind background image. Good if background image is set to "tiled"
### Output (more specific settings about the exported video)
- Music ``(file [mp3, wav, ogg])``: Music that plays with visualization. Must sync up with the midi. **Will be included in video export!**
- Resolution ``(number)``: The resolution of the video **(editor can only export 16:9 aspect ratio)**
- Render Type ``(drop-down)``: **CURRENTLY DOES NOTHING ON VIDEO EXPORT**
- FPS ``(number)``: Video framerate

*(My recommended settings for exporting videos to Twitter is the default settings, so leave those alone if you don't really know what you're doing)*

## Track Panel
This manages specific settings about the tracks.
- The eye icon controls the track's visibility
- The circle next to that is that track's color
- The text input is the track name (for organization purposes)
- The number input on the bottom is parallax. Can be negative and positive, and even a float value too. Higher numbers == higher note speed && less time on screen; Lower numbers == lower note speed && more time on screen;
- Dragging on the entire track element will change the drawing order. Example: You want people to see a melody over chords

![Dragging track element to change draw order](https://i.imgur.com/msinXks.gif)

## "Export..." Popup
Very straight forward at the moment. Click the big "[ START ]" button to start compiling the video. For advanced scenerios, there is a "Render Video" button under the start button. This is if the ".tmp" folder has all the frames of the video and you just want to recompiling it again, perhaps under different output settings.

!["Export..." Popup](https://i.imgur.com/BNgDfoq.png)
