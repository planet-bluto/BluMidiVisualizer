var PrevExtents = {width: 0, height: 0};
var Extents = {width: 0, height: 0};
var LayerTitles = ["background-image", "background", "bar", "note", "piano", "playhead", "note-icons"];
var PreviewLayers = {};
var PreviewContexts = {};
var RenderLayers = {};
var RenderContexts = {};
var RenderCanvas = createCanvas(Extents.width, Extents.height);
var RenderContext = RenderCanvas.getContext('2d');
(() => {
	Extents.width = (16/9)*SETTINGS["Output"].resolution
	Extents.height = SETTINGS["Output"].resolution
	let screen_box = document.getElementById("screen-box")

	LayerTitles.forEach((layer_title, i) => {
		let comp = document.createElement('canvas')
		comp.classList.add('screen-comp')
		comp.id = "screen-"+layer_title
		comp.style = `z-index: ${i}`
		comp.width = Extents.width
		comp.height = Extents.height
		PreviewContexts[layer_title] = comp.getContext('2d')
		PreviewLayers[layer_title] = new ContextQueue(layer_title)
		// print(Layers[layer_title])
		PreviewLayers[layer_title].context = comp.getContext('2d')
		screen_box.appendChild(comp)

		RenderLayers[layer_title] = new ContextQueue(layer_title)
		RenderLayers[layer_title].context = RenderContext
		RenderContexts[layer_title] = RenderContext
	})
})()

var current_background_image = ""
var redraw_image = false

var image_redraw_event = val => {
	redraw_image = true
}

SETTINGS_CHANGES["Background"]["image align"].push(image_redraw_event)
SETTINGS_CHANGES["Background"]["image type"].push(image_redraw_event)

SETTINGS_CHANGES["Background"].image.push(async val => {
	BackImg = await loadImage(SETTINGS["Background"].image)
	timeline_update()
})

async function loadImage(path) {
	return new Promise((res, rej) => {
		let img_elem = new Image()
		img_elem.src = path
		img_elem.onload = e => {
			res(img_elem)
		}
		if (img_elem.loaded) {
			res(img_elem)
		}
	})
}

async function DRAW_FRAME(FRAME, redraw_static = false, render = false) {
	let Layers = PreviewLayers
	let Contexts = PreviewContexts

	if (render == true) {
		Layers = RenderLayers
		Contexts = RenderContext
	}

	Extents.width = (16/9)*SETTINGS["Output"].resolution
	Extents.height = SETTINGS["Output"].resolution

	// PIANO //
	let key_amount = SETTINGS["Piano"].notes
	let start_key = SETTINGS["Piano"]["starting note"]
	let key_height = Extents.height/key_amount
	let key_width = SETTINGS["Piano"].width
	let key_black_width = SETTINGS["Piano"]["black width"]
	let x_mid = (Extents.width/2)+key_width
	let y_mid = (Extents.height/2)

	Layers["piano"].fillStyle(SETTINGS["Piano"].colors.natural)
	Layers["piano"].fillRect(0, 0, key_width, Extents.height)

	var blacks = [1, 3, 6, 8, 10]
	blacks = blacks.map(black => {
		return (black - start_key)-(Math.floor((black - start_key)/12)*12)
	})

	for (let o = 0; o < key_amount; o++) {
		let i = o
		let octave = Math.floor(i/12)
		let note_id = (i-(octave*12))
		if (blacks.includes(note_id)) {
			Layers["piano"].fillStyle(SETTINGS["Piano"].colors.unnatural)
			Layers["piano"].fillRect(0, Extents.height-((key_height*i)+key_height), key_black_width, key_height)
		}
	}

	// BACKGROUND //

	if (redraw_static || SETTINGS["Background"].image != null) {
		let bits = SETTINGS["Background"]["image align"].split(" ")
		let hori = bits[1]
		let vert = bits[0]
		let x_pos = 0
		let y_pos = 0

		let size = JSON.parse(JSON.stringify(Extents))
		if (SETTINGS.Background["image type"] == "normal") { size = {width: BackImg.width, height: BackImg.height} }

		switch (hori) {
			case "left":
				x_pos = key_width
			break;
			case "center":
				x_pos = x_mid-(size.width/2)
			break;
			case "right":
				x_pos = Extents.width - size.width
			break;
		}

		switch (vert) {
			case "top":
				y_pos = 0
			break;
			case "middle":
				y_pos = y_mid-(size.height/2)
			break;
			case "bottom":
				y_pos = Extents.height - size.height
			break;
		}

		Layers["background-image"].drawImage(BackImg, x_pos, y_pos, size.width, size.height)
	}

	Layers["background"].globalAlpha(SETTINGS["Background"].opacity)
	for (let i = 0; i < key_amount; i++) {
		if ( (i+start_key) % 2 == 0 ) {
			Layers["background"].fillStyle(SETTINGS["Background"].colors.first)
			// Layers["background"].globalAlpha = 1
		} else {
			Layers["background"].fillStyle(SETTINGS["Background"].colors.second)
			// Layers["background"].globalAlpha = 1
		}
		Layers["background"].fillRect(0, key_height*i, Extents.width, key_height)
	}
	
	// PLAYHEAD
	let playhead_width = SETTINGS["Play Area"].playhead["playhead width"]
	Layers["playhead"].fillStyle(SETTINGS["Play Area"].playhead["playhead color"])
	Layers["playhead"].fillRect(x_mid-(playhead_width/2), 0, playhead_width, Extents.height)

	// MIDI TRACKS
	if (CurrentMidi != null) {
		let so_called_tracks = Object.assign([], CurrentMidi.tracks)
		so_called_tracks.reverse()
		so_called_tracks.forEach((track, t_i) => {
			let this_info = TrackInfo[String(track.id)]
			// print(`{c:${String(track.channel)}} [i:${String(track.id)}] `, [track, this_info])
			if (this_info.visible) {
				let p_a = this_info.parallax
				let r = (SETTINGS["Play Area"]["rounded notes"] ? key_height : 0)
				let sec = ( 200 * (SETTINGS["Play Area"].zoom + p_a) )
				track.notes.forEach(note => {
					Layers["note-icons"].fillStyle(this_info.color)
					Layers["note"].fillStyle(this_info.color)
					var visual_note = {
						x: (x_mid + (note.time*sec))-(TIME*sec),
						y: (Extents.height - (((note.midi+1) - start_key) * key_height) ),
						w: (note.duration*sec),
						h: key_height
					}

					let startDurr = 0.7
					let endDurr = 0
					let quinFunc = x => { return 1 - Math.pow(1 - x, 5) }

					let startDist = Math.abs(note.time-TIME)
					let endDist = Math.abs((note.time+note.duration)-TIME)


					if (TIME >= note.time && TIME < (note.time + note.duration)) {
						if (startDist < startDurr) {
							let e = quinFunc((TIME - note.time)/startDurr)
							let size = 20+(15*(1-e))
							Layers["note-icons"].fillRect(x_mid-(size/2), (visual_note.y+(key_height/2))-(size/2), size, size)
						} else if (TIME > (note.time + startDurr) && TIME < (note.time + note.duration)) {
							let size = 20
							Layers["note-icons"].fillRect(x_mid-(size/2), (visual_note.y+(key_height/2))-(size/2), size, size)
						}
					}

					if ( !(visual_note.x > Extents.width) || !(visual_note.x+visual_note.w < 0) ) {
						Layers["note"].roundRect(visual_note.x, visual_note.y, visual_note.w, visual_note.h, r)
						Layers["note"].fill()
					}
				})
			}
		})
	}


	Object.keys(Layers).forEach(layer_title => { let layer = Layers[layer_title]; layer.exec() })
}

function draw_screen(time) {
	let frame = (CurrentMidi.duration/SETTINGS["Output"].FPS)

	let redraw_static = false
	let skip_frame_clear = ["background-image"]

	let screen_comps = Array.from(document.getElementsByClassName("screen-comp"))
	// print(PrevExtents, Extents)
	if (PrevExtents != JSON.stringify(Extents)) {
		screen_comps.forEach((comp, i) => {
			comp.width = Extents.width
			comp.height = Extents.height
		})
		RenderCanvas.width = Extents.width
		RenderCanvas.height = Extents.height
		redraw_static = true
	}

	if (!redraw_static) {
		Object.keys(PreviewContexts).forEach(key => {
			if (redraw_image || !skip_frame_clear.includes(key)) {
				PreviewContexts[key].clearRect(0, 0, Extents.width, Extents.height)
			}
		})
	} 

	let goodStates = [2, 4]
	if ((loaded_audio_path != SETTINGS["Background"].music) || (SETTINGS["Background"].music != null && !goodStates.includes(BackAudio.readyState))) {
		BackAudio.src = SETTINGS["Background"].music
		loaded_audio_path = SETTINGS["Background"].music
		BackAudio.loop = true
	}

	PrevExtents = JSON.stringify(Extents)
	if (CurrentMidi != null) { DRAW_FRAME(frame, redraw_static) } // THING THING THING THING THIGN THIGN
}

// draw_screen(0)
