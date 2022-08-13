var TIME = 0;

function timeline_update(type) {
	var timeline_input = document.getElementById('timeline-input')
	var timeline_input_visual = document.getElementById('timeline-input-visual')
	timeline_input.step = 1/SETTINGS["Output"].FPS

	TIME = Number(timeline_input.value)
	let value = (TIME/timeline_input.max)*100
	timeline_input_visual.style = `--value: ${value}%`
	timeline_input_visual.value = TIME

	var date = new Date(null)
	date.setMilliseconds(TIME*1000)
	timestamp.textContent = date.toISOString().substr(14, 8)

	if (window.draw_screen != null) { draw_screen(TIME) }

	if (PlayHandler != null && PlayHandler.clickPlaying) {
		if (type == "change") {
			if (!PlayHandler.paused) { PlayHandler.toggle() }
			PlayHandler.toggle()
		} else {
			PlayHandler.pause()
			if (SETTINGS["Background"].music != null) {
				BackAudio.currentTime = TIME
			}
		}
	}
}

function time_update() {
	var timeline_input = document.getElementById('timeline-input')
	var timeline_input_visual = document.getElementById('timeline-input-visual')
	timeline_input.step = 1/SETTINGS["Output"].FPS

	timeline_input.value = TIME
	let value = (TIME/timeline_input.max)*100
	timeline_input_visual.style = `--value: ${value}%`
	timeline_input_visual.value = TIME

	var date = new Date(null)
	date.setMilliseconds(TIME*1000)
	timestamp.textContent = date.toISOString().substr(14, 8)

	if (window.draw_screen != null) { draw_screen(TIME) }
}

(() => {
	var timeline_input = document.getElementById('timeline-input')
	var timeline_input_visual = document.getElementById('timeline-input-visual')
	var timestamp = document.getElementById('timestamp')
	timeline_input.step = 1/SETTINGS["Output"].FPS

	timeline_input_visual.max = timeline_input.max
	timeline_input_visual.value = timeline_input.value
	timeline_input_visual.step = timeline_input.step

	timeline_update()

	timeline_input.onchange = () => { timeline_update("change") }
	timeline_input.oninput = () => { timeline_update("input") }

	timeline_input.addEventListener('mouseenter', () => {
		timeline_input_visual.setAttribute('hover', true)
	})

	timeline_input.addEventListener('mouseleave', () => {
		timeline_input_visual.setAttribute('hover', false)
	})
})()