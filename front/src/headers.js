var to_ids = tracks => { return tracks.map(track => track.id) }

var HEADERS = {
	File: {
		"Load Midi | CTRL_M": (() => {
			print("hello?")
			let input = document.createElement('input')
			input.type = "file"
			input.setAttribute("accept", ".mid")
			input.onchange = async () => { LOAD_MIDI(Array.from(input.files)[0].path); hide_popups() }
			input.click()
		}),
		"div_0": "divider",
		"New Project | CTRL_N": (() => {
			print("new...")
		}),
		"Open Project... | CTRL_O": (() => {
			let input = document.createElement('input')
			input.type = "file"
			input.setAttribute("accept", ".json")
			input.onchange = async () => {
				let file = Array.from(input.files)[0]
				const reader = new FileReader()
				reader.addEventListener('load', async (event) => {
					let project = JSON.parse(event.target.result)
					Session.updateProjectPath(file.path)
					await LOAD_MIDI(project.MidiPath, true)
					TrackSort = project.TrackSort
					print(to_ids(CurrentMidi.tracks))
					CurrentMidi.tracks = CurrentMidi.tracks.sort((a, b) => {
						let a_id = String(CurrentMidi.tracks.indexOf(a))
						let b_id = String(CurrentMidi.tracks.indexOf(b))
						// print(`[IDS] a: `, a_id, `; b: `, b_id)
						let a_ind = TrackSort.indexOf(a_id)
						let b_ind = TrackSort.indexOf(b_id)
						// print(`[IND] a: `,a_ind,`; b: `,b_ind)
						// print(`[RES] `, (a_ind - b_ind))
						return a_ind - b_ind
					})
					print(to_ids(CurrentMidi.tracks))
					SETTINGS = project.SETTINGS
					let unformatted = ["file", "drop-down", "check"]
					Object.keys(SETTINGS).forEach(key => {
						function format(input, value, type) {
							print(type)
							if (!unformatted.includes(type)) {
								input.value = value
							}
							if (type == "drop-down") {
								Array.from(input.children).forEach((child, i) => {
									if (child.textContent == value) {
										input.selectedIndex = i
									}
								})
							}
							if (type == "check") {
								print(input)
								print(value)
								input.checked = value
							}
						}
						Object.keys(SETTINGS[key]).forEach(sub_key => {
							if (typeof SETTINGS[key][sub_key] !== 'object' || SETTINGS[key][sub_key] == null) {
								format(SETTINGS_INPUTS[key][sub_key], SETTINGS[key][sub_key], SETTINGS_DATA[key][sub_key].type)
							} else {
								Object.keys(SETTINGS[key][sub_key]).forEach(last_key => {
									format(SETTINGS_INPUTS[key][last_key], SETTINGS[key][sub_key][last_key], SETTINGS_DATA[key][last_key].type)
								})
							}
						})
					})
					TrackInfo = project.TrackInfo
					let track_list = document.getElementById('track-list')
					CurrentMidi.tracks.forEach((track, i) => {
						let info = TrackInfo[track.id]

						let track_box_li = document.createElement('li')
						let track_visible = document.createElement('button')
						let track_color = document.createElement('input')
						let track_parallax = document.createElement('input')
						let track_name = document.createElement('p')

						track_visible.classList.add("track-visible-btn")
						track_visible.innerHTML = `<span class="material-symbols-rounded"></span>`
						track_visible.setAttribute("visible", info.visible)

						track_color.type = "color"
						track_color.classList.add('track-color-picker') 
						track_color.value = info.color
						let color_update = () => {
							TrackInfo[track.id] .color = track_color.value
							timeline_update()
						}
						track_color.onchange = color_update
						track_color.oninput = color_update

						track_parallax.type = "number"
						track_parallax.classList.add('track-parallax-input')
						track_parallax.value = info.parallax
						let parallax_update = () => {
							TrackInfo[track.id].parallax = Number(track_parallax.value)
							timeline_update()
						}
						track_parallax.onchange = parallax_update
						track_parallax.oninput = parallax_update

						track_name.textContent = info.name

						track_box_li.appendChild(track_visible)
						track_box_li.appendChild(track_color)
						track_box_li.appendChild(track_name)
						track_box_li.appendChild(track_parallax)

						track_list.appendChild(track_box_li)

						// CurrentMidi.tracks[i].id = String(i)
						hide_popups()

						track_visible.onclick = () => {
							if (track_visible.getAttribute("visible") == "true") {
								track_visible.setAttribute("visible", false)
								TrackInfo[track.id].visible = false
							} else {
								track_visible.setAttribute("visible", true)
								TrackInfo[track.id].visible = true
							}
							timeline_update()
						}
					})

					var timeline_input = document.getElementById('timeline-input')
					var timeline_input_visual = document.getElementById('timeline-input-visual')
					timeline_input.max = CurrentMidi.duration
					timeline_input_visual.max = CurrentMidi.duration
					TIME = 0
					timeline_input.value = TIME
					timeline_input_visual.value = TIME

					if (SETTINGS["Background"].image != null) { BackImg = await loadImage(SETTINGS["Background"].image) }

					timeline_update()
				})
				reader.readAsText(file)
			}
			input.click()
		}),
		"div_1": "divider",
		"Save | CTRL_S": (async () => {
			var data = new Uint8Array(Buffer.from(PROJECT_JSON()))
			var path = (Session.ProjectPath || await save_as("untitled bmv project.json"))
			fs.writeFile(path, data, err => {
				print(err)
			})
		}),
		"Save As... | CTRL_SHIFT_S": (async () => {
			var data = new Uint8Array(Buffer.from(PROJECT_JSON()))
			var path = await save_as("untitled bmv project.json")
			fs.writeFile(path, data, err => {
				print(err)
			})
		}),
		"div_2": "divider",
		"Export... | CTRL_SHIFT_D": (() => {
			show_popup("export")
			// go()
			// print("Total Number of Frames: ", frames)
		}),
		"div_3": "divider",
		"Close | ALT_F4": (() => {
			nw.Window.get().close()
		}),
	},
	Help: {
		"Overview": (() => {
			nw.Shell.openExternal("https://github.com/planet-bluto/BluMidiVisualizer#readme")
		}),
		"div_0": "divider",
		"Planet Bluto": (() => {
			nw.Shell.openExternal("https://planet-bluto.neocities.org/")
		}),
	}
}

var HeaderFuncs = {}

Object.keys(HEADERS).forEach(key => {
	let header_div = document.getElementById(`header-buttons`)
	let button = document.getElementById(`header-${key.toLowerCase()}-btn`)
	let popout_menu_div = document.createElement('div')
	popout_menu_div.classList.add('popout-menu')
	HeaderFuncs[key] = {}
	Object.keys(HEADERS[key]).forEach(sub_key => {
		if (HEADERS[key][sub_key] != "divider") {
			let box = document.createElement('div')
			box.classList.add('popout-option')

			let subs = sub_key.split(" | ")

			let p = document.createElement('p')
			p.textContent = subs[0]

			let hotkey_p = document.createElement('p')
			hotkey_p.textContent = (subs[1] != null ? subs[1] : " ")

			box.appendChild(p)
			box.appendChild(hotkey_p)
			popout_menu_div.appendChild(box)

			HeaderFuncs[key][p.textContent] = HEADERS[key][sub_key]

			box.onclick = () => {
				HEADERS[key][sub_key]()
				button.blur()
			}
		} else {
			let divider = document.createElement('div')
			divider.classList.add('popout-menu-divider')

			popout_menu_div.appendChild(divider)
		}
	})
	button.appendChild(popout_menu_div)
})

// UTIL FUNCS //

async function LOAD_MIDI(midi_path, loading = false) {
	MidiPath = midi_path
	let midiData = fs.readFileSync(midi_path)
	let midi_obj = new Midi(midiData)
	CurrentMidi = midi_obj.toJSON()
	CurrentMidi.duration = midi_obj.duration
	frames = CurrentMidi.duration*SETTINGS["Output"].FPS
	TrackInfo = {}
	TrackSort = []

	var timeline_input = document.getElementById('timeline-input')
	var timeline_input_visual = document.getElementById('timeline-input-visual')

	// load into track list
	let track_list = document.getElementById('track-list')
	track_list.innerHTML = ''

	timeline_input.max = CurrentMidi.duration
	timeline_input_visual.max = CurrentMidi.duration

	CurrentMidi.tracks.sort((a, b) => {
		return b.notes.length - a.notes.length
	})

	CurrentMidi.tracks.forEach((track, i) => {
		if (!loading) {
			let track_box_li = document.createElement('li')
			let track_visible = document.createElement('button')
			let track_color = document.createElement('input')
			let track_parallax = document.createElement('input')
			let track_name = document.createElement('p')

			track_visible.classList.add("track-visible-btn")
			track_visible.innerHTML = `<span class="material-symbols-rounded"></span>`
			track_visible.setAttribute("visible", true)

			track_color.type = "color"
			track_color.classList.add('track-color-picker') 
			track_color.value = ("#" + Math.random().toString(16).slice(2, 8))
			let color_update = () => {
				TrackInfo[String(i)].color = track_color.value
				timeline_update()
			}
			track_color.onchange = color_update
			track_color.oninput = color_update

			track_parallax.type = "number"
			track_parallax.classList.add('track-parallax-input')
			track_parallax.value = 0
			let parallax_update = () => {
				TrackInfo[String(i)].parallax = Number(track_parallax.value)
				timeline_update()
			}
			track_parallax.onchange = parallax_update
			track_parallax.oninput = parallax_update

			track_name.textContent = `${(track.name == "" ? "Track" : track.name)} - ${track.notes.length} notes`

			track_box_li.appendChild(track_visible)
			track_box_li.appendChild(track_color)
			track_box_li.appendChild(track_name)
			track_box_li.appendChild(track_parallax)

			track_list.appendChild(track_box_li)

			track_visible.onclick = () => {
				if (track_visible.getAttribute("visible") == "true") {
					track_visible.setAttribute("visible", false)
					TrackInfo[String(i)].visible = false
				} else {
					track_visible.setAttribute("visible", true)
					TrackInfo[String(i)].visible = true
				}
				timeline_update()
			}

			TrackInfo[String(i)] = {
				id: String(i),
				name: track_name.textContent,
				color: track_color.value,
				parallax: Number(track_parallax.value),
				visible: true
			}
		}

		CurrentMidi.tracks[i].id = String(i)
		// print(CurrentMidi.tracks[i])
		TrackSort.push(String(i))
	})

	const sortable = new Sortable(track_list, {
	    draggable: 'li',
	    animation: 150,
	    onEnd: e => {
	    	print(e.oldIndex, e.newIndex)
	    	CurrentMidi.tracks.move(e.oldIndex, e.newIndex)
	    	TrackSort = to_ids(CurrentMidi.tracks)
	    	timeline_update()
	    }
	})

	if (!loading) {
		TIME = 0
		timeline_input.value = TIME
		timeline_input_visual.value = TIME
		timeline_update()
	} else { return }
}