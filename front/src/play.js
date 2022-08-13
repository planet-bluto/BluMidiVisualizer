var play_time = 0;
var play_TIME = 0;

PlayHandler = {
	int: null,
	everyInt: [],
	paused: true,
	clickPlaying: false,
	toggle: async () => {
		if (PlayHandler.paused) {
			if (SETTINGS["Background"].music != null) {
				BackAudio.currentTime = Number(TIME)
				// BackAudio.loop = true
				await BackAudio.play()
			}
			PlayHandler.play()
		} else { PlayHandler.pause() }
	},
	play: async ()=> {
		PlayHandler.paused = false
		PlayHandler.everyInt.forEach((someInt, i) => {
			clearInterval(someInt)
			PlayHandler.everyInt.remove(i)
		})
		play_time = Date.now()
		play_TIME = TIME
		const frame_step = Math.round(1000/SETTINGS["Output"].FPS)
		PlayHandler.int = setInterval(() => {
			var timeline_input = document.getElementById('timeline-input')
			var timeline_input_visual = document.getElementById('timeline-input-visual')

			if (play_TIME+((Date.now() - play_time)/1000) > (BackAudio.duration || CurrentMidi.duration)) {
				TIME = 0
				play_TIME = 0
				play_time = Date.now()
				setTimeout(() => {PlayHandler.toggle()}, 1)
				PlayHandler.pause()
			} else {
				TIME = play_TIME+((Date.now() - play_time)/1000)
			}
			time_update()
		}, frame_step)
	},
	pause: () => {
		if (!BackAudio.paused) {
			BackAudio.pause()
		}
		clearInterval(PlayHandler.int)
		PlayHandler.paused = true
	}
}

document.body.addEventListener('keydown', e => {
	if (e.which == 32) { PlayHandler.toggle() }
	PlayHandler.clickPlaying = !PlayHandler.paused
})

document.getElementById('timeline-input').onmousedown = e => {
	PlayHandler.clickPlaying = !PlayHandler.paused
}