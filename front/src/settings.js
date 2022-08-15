// AUTOMATE THIS SHIT INTO DIV AND INPUT ELEMENTS MAYBE?
// (MIGHT BE USEFUL FOR OTHER PROJECTS TOO???)

// Input Types
const NumberInput = (def, min = 1, max = null) => { return {def: def, type: "number", min: min, max: max} }
const RangeInput = (def, min, max, step) => { return {def: def, type: "range", min: min, max: max, step: step} }
const DropDownInput = (def, elems) => { return {def: def, type: "drop-down", elems: elems} }
const CheckInput = (def) => { return {def: def, type: "check"} }
const StringInput = (def) => { return {def: def, type: "string"} }
const ColorInput = (def) => { return {def: def, type: "color"} }
const FileInput = (def, allowed) => { return {def: def, type: "file", allowed: allowed} }
const Divider = (show = false) => { return {type: "divider", show_name: show} }
const DividerEnd = () => { return {type: "divider-end"} }

// The Actual Settings
var SETTINGS_DATA = {
	"Play Area": {
		zoom: RangeInput(2.5, 0.01, 5, 0.01),
		"rounded notes": CheckInput(true),
		"vertical scrolling": CheckInput(false),
		playhead: Divider(),
		"playhead width": NumberInput(3),
		"playhead color": ColorInput("#ffffff"),
		end: DividerEnd(),
		percussion: Divider(true),
		"area size": NumberInput(0, 0),
		"div width": NumberInput(5, 0),
		"div color": ColorInput("#ffffff"),
	},
	"Piano": {
		notes: NumberInput(12*7, 12),
		"starting note": NumberInput(0, 0),
		width: NumberInput(60),
		"black width": NumberInput(40),
		colors: Divider(true),
		natural: ColorInput("#ffffff"),
		unnatural: ColorInput("#151515")
	},
	"Background": {
		image: FileInput(null, [".png", ".jpeg", ".jpg", ".webp"]),
		"image align": DropDownInput(4, ["top left", "top center", "top right", "middle left", "middle center", "middle right", "bottom left", "bottom center", "bottom right"]),
		"image type": DropDownInput(1, ["strech", "normal"]),
		music: FileInput(null, [".mp3", ".wav", ".ogg"]),
		colors: Divider(true),
		"line 1": ColorInput("#151515"),
		"line 2": ColorInput("#252525"),
		background: ColorInput("#151515"),
		"percussion line 1": ColorInput("#151515"),
		"percussion line 2": ColorInput("#000000"),
		"percussion background": ColorInput("#000000"),
		end: DividerEnd(),
		opacity: RangeInput(0.5, 0, 1, 0.01)
	},
	"Output": {
		resolution: NumberInput(720, 36),
		"render type": DropDownInput(3, ["high-quality", "bilinear", "bicubic", "nearest-neighbor"]),
		FPS: NumberInput(60, 1)
	}
}
var SETTINGS = {}
var SETTINGS_CHANGES = {}
var SETTINGS_INPUTS = {}

// SETTINGS_CHANGES[key][sub_key].push(() => { print("wtf") })

//// 🔽🔽AUTOMATION🔽🔽 ////

// Serialize SETTINGS_DATA into usable object ! 😤😤😤
Object.keys(SETTINGS_DATA).forEach(key => {
	let curr_div = null
	let show_div = false
	SETTINGS[key] = {}
	SETTINGS_CHANGES[key] = {}
	SETTINGS_INPUTS[key] = {}
	Object.keys(SETTINGS_DATA[key]).forEach(sub_key => {
		if (curr_div == null) {
			if (SETTINGS_DATA[key][sub_key].type != "divider") {
				if (SETTINGS_DATA[key][sub_key].type != "drop-down") {
					SETTINGS[key][sub_key] = SETTINGS_DATA[key][sub_key].def
					SETTINGS_CHANGES[key][sub_key] = []
				} else {
					SETTINGS[key][sub_key] = SETTINGS_DATA[key][sub_key].elems[SETTINGS_DATA[key][sub_key].def]
					SETTINGS_CHANGES[key][sub_key] = []
				}
			} else {
				SETTINGS[key][sub_key] = {}
				SETTINGS_CHANGES[key][sub_key] = {}
				curr_div = sub_key
				show_div = SETTINGS_DATA[key][sub_key].show_name
			}
		} else {
			if (SETTINGS_DATA[key][sub_key].type != "divider-end") {
				if (SETTINGS_DATA[key][sub_key].type != "drop-down") {
					SETTINGS[key][curr_div][sub_key] = SETTINGS_DATA[key][sub_key].def
					SETTINGS_CHANGES[key][curr_div][sub_key] = []
				} else {
					SETTINGS[key][curr_div][sub_key] = SETTINGS_DATA[key][sub_key].elems[SETTINGS_DATA[key][sub_key].def]
					SETTINGS_CHANGES[key][curr_div][sub_key] = []
				}
			} else {
				curr_div = null
				show_div = false
			}
		}
		SETTINGS_DATA[key][sub_key].div = curr_div
		SETTINGS_DATA[key][sub_key].show_div = show_div
	})
})

// Convert into HTML and hook up change/input events 😵
Object.keys(SETTINGS_DATA).forEach((key, i) => {
	var properties_panel = document.getElementById('properties-panel')
	if (i > 0) {
		var div = document.createElement('div')
		div.classList.add('section-divider')
		properties_panel.appendChild(div)
	}
	var header = document.createElement('h1')
	header.textContent = key
	properties_panel.appendChild(header)
	var property_section = document.createElement('div')
	property_section.classList.add('property-section')
	Object.keys(SETTINGS_DATA[key]).forEach(sub_key => {
		var current = SETTINGS_DATA[key][sub_key]
		switch (current.type) {
			case "divider":
				var div = document.createElement('div')
				div.classList.add('property-divider')
				property_section.appendChild(div)
			break;
			case "number":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = document.createElement('input')
				SETTINGS_INPUTS[key][sub_key] = input
				input.setAttribute("type", "number")
				input.setAttribute("min", current.min)
				if (current.max != null) { input.setAttribute("max", current.max) }
				input.setAttribute("value", current.def)

				var update = () => {
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = Number(input.value)
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = Number(input.value)
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.onchange = update
				input.oninput = update

				div.appendChild(input)
				property_section.appendChild(div)
			break;
			case "color":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = new ColorPicker(current.def)
				SETTINGS_INPUTS[key][sub_key] = input.button

				var update = color => {
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = color.hex()
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = color.hex()
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.on("change", update)
				input.on("done", update)

				div.appendChild(input.button)
				property_section.appendChild(div)
			break;
			case "file":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = document.createElement('input')
				SETTINGS_INPUTS[key][sub_key] = input
				input.setAttribute("type", "file")
				input.setAttribute("accept", current.allowed.join(","))

				var update = () => {
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = input.files[0].path
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = input.files[0].path
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.oninput = update
				input.onchange = update

				div.appendChild(input)
				property_section.appendChild(div)
			break;
			case "range":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = document.createElement('input')
				SETTINGS_INPUTS[key][sub_key] = input
				input.setAttribute("type", "range")
				input.setAttribute("min", current.min)
				input.setAttribute("max", current.max)
				input.setAttribute("step", current.step)
				input.setAttribute("value", current.def)

				var update = () => {
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = Number(input.value)
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = Number(input.value)
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.onchange = update
				input.oninput = update

				div.appendChild(input)
				property_section.appendChild(div)
			break;
			case "drop-down":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = document.createElement('select')
				SETTINGS_INPUTS[key][sub_key] = input
				current.elems.forEach(elem => {
					var option = document.createElement('option')
					option.textContent = elem
					option.value = elem.toLowerCase()
					input.appendChild(option)
				})
				input.selectedIndex = current.def

				var update = () => {
					let val = input.options[input.selectedIndex].value
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = val
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = val
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.onchange = update
				input.oninput = update

				div.appendChild(input)
				property_section.appendChild(div)
			break;
			case "check":
				var p = document.createElement('p')
				if (SETTINGS_DATA[key][sub_key].div != null && SETTINGS_DATA[key][sub_key].show_div == true) {
					p.textContent = `${SETTINGS_DATA[key][sub_key].div} - ${sub_key}`
				} else {
					p.textContent = sub_key
				}
				property_section.appendChild(p)

				var div = document.createElement('div')
				div.classList.add('property-input')

				var input = document.createElement('input')
				SETTINGS_INPUTS[key][sub_key] = input
				if (def = true) { input.setAttribute("checked", "") }
				input.setAttribute('type', 'checkbox')

				var update = () => {
					if (SETTINGS_DATA[key][sub_key].div == null) {
						SETTINGS[key][sub_key] = (input.checked ? true : false)
						SETTINGS_CHANGES[key][sub_key].forEach(func => { func(SETTINGS[key][sub_key]) })
					} else {
						let curr_div = SETTINGS_DATA[key][sub_key].div
						SETTINGS[key][curr_div][sub_key] = (input.checked ? true : false)
						SETTINGS_CHANGES[key][curr_div][sub_key].forEach(func => { func(SETTINGS[key][curr_div][sub_key]) })
					}
					draw_screen(TIME)
				}
				input.onchange = update
				input.oninput = update

				div.appendChild(input)
				property_section.appendChild(div)
			break;
		}
	})
	properties_panel.appendChild(property_section)
})