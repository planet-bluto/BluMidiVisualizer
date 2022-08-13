var frames = 0
var render_step = ""

async function render_frame(FRAME) {
	if (BackImg == null && SETTINGS["Background"].image != null) {
		BackImg = await loadImage(SETTINGS["Background"].image)
	}
	TIME = (FRAME*(1/SETTINGS["Output"].FPS))
	// print(TIME)
	await DRAW_FRAME(FRAME, false, true)
	let times = []
	let loaded = 0
	return new Promise(async (res, rej) => {
		times.push({ name: "first block", time: Date.now() })
		let frame = new Frame(RenderCanvas, {image: {types: ["png"]}})
		// times.push({ name: "context to buffer", time: Date.now() })
		fs.writeFile(`.tmp/frame-${FRAME}.png`, frame.toBuffer(), err => {
			RenderContext.clearRect(0,0,Extents.width,Extents.height)
			times.push({ name: "buffer written", time: Date.now() })
			res(times)
		})
	})
}

var prog;

function go() {
	render_step = "temp"
	fs.ensureDirSync('.tmp')
	fs.emptyDirSync('.tmp')
	document.getElementById('popup-export').setAttribute('render', true)
	hide_close_popup()
	frames = Math.round(CurrentMidi.duration*SETTINGS.Output.FPS)
	// var bar = new ProgressBar(`Rendering... :percent (:eta seconds remain)`, { total: frames, width: 20, incomplete: ' ' })
	let last_time = Date.now()
	export_prog = 0
	document.getElementById('popup-export-status').textContent = `(0/${frames})`
	document.getElementById('export-progress').style = `--value: 0%`
	var STOP_NOW = false
	stop_rendering = () => { STOP_NOW = true }
	async function loop() {
		if (!STOP_NOW) {
			await render_frame(export_prog+1)
			export_prog++
			if (STOP_NOW) {
				document.getElementById('popup-export-status').textContent = `(STOPPED...)`
				document.getElementById('export-progress').style = `--value: 0%`
				document.getElementById('popup-export').setAttribute('render', false)
				show_close_popup()
				return
			}
			document.getElementById('export-progress').style = `--value: ${(export_prog/frames)*100}%`
			document.getElementById('popup-export-status').textContent = `(${export_prog}/${frames})`
			last_time = Date.now()
			// bar.tick()
			if (export_prog == frames) { render_video() } else { loop() }
		}
	}
	loop()
}

async function render_video() {
	const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
	var ffmpeg = require('fluent-ffmpeg');
	ffmpeg.setFfmpegPath(ffmpegPath);
	// const { Converter } = require("ffmpeg-stream");
	print("RENDER_VIDEO")
	render_step = "comp"
	var STOP_NOW = false
	// var bar = new ProgressBar(`Compiling Video... :percent (:eta seconds remain)`, { total: frames, width: 20, incomplete: ' ' })
	document.getElementById('popup-export').setAttribute('render', true)
	hide_close_popup()
	var process_prog = 0
	document.getElementById('popup-export-status').textContent = "Processing..."
	document.getElementById('export-progress').style = `--value: 0%; background: linear-gradient(to right, var(--theme-accent2-pos) 0% var(--value), var(--theme-accent1-pos) var(--value) 100%);`
	let command = new ffmpeg()
	command.addInput('.tmp/frame-%d.png')
	if (SETTINGS["Background"].music != null) { command.addInput(SETTINGS["Background"].music) } 
	print(SETTINGS["Output"].resolution)
	command.size(`?x${SETTINGS["Output"].resolution}`).aspect('16:9')
	command.autopad('black')
	// command.output('video-output.mp4')
	command.fps(SETTINGS["Output"].FPS)
	command.duration(CurrentMidi.duration)
	command.format('mp4')
	command.videoCodec('libx264')
	command.audioCodec('aac')
	command.audioBitrate('1536k')
	command.videoBitrate('5000k', true)
	command.outputOptions([
		"-c:v libx264",
		"-crf 23",
		"-preset medium",
		"-c:a aac",
		"-movflags +faststart",
		"-profile:v main",
		"-pix_fmt yuv420p"
	])
	command.videoFilters(`setpts=${25/SETTINGS["Output"].FPS}*PTS`)
	// command.run()
	command.save(await save_as("bmv output video.mp4"))
	print(command)
	command.on('error', (err, stout, sterr) => {
		console.error(err)
		if (STOP_NOW) {
			document.getElementById('popup-export').setAttribute('render', false)
			show_close_popup()
		}
	})
	command.on('progress', progress => {
		print(`progress...`)
		print(progress.frames)
		let amount = (progress.frames-process_prog)
		process_prog += (amount)
		document.getElementById('export-progress').style = `--value: ${(process_prog/frames)*100}%; background: linear-gradient(to right, var(--theme-accent2-pos) 0% var(--value), var(--theme-accent1-pos) var(--value) 100%);`
	})
	command.on('end', () => {
		print("+ Video Outputted!")
		document.getElementById('popup-export-status').textContent = "DONE!"
		document.getElementById('popup-export').setAttribute('render', false)
		show_close_popup()
	})
	stop_rendering = () => { command.kill(); STOP_NOW = true }
}

var stop_rendering = () => {
	print("no process right now?.... helllo??....")
}

async function test(FRAME) {
	let start = Date.now()
	let result = await render_frame(FRAME)
	result.forEach((time, i) => {
		let last_time = null
		if (i == 0) {
			last_time = start
		} else {
			last_time = result[i-1].time
		}
		print("[", ((time.time - last_time)/1000).toFixed(3), `] ${time.name}`)
	})
	let one_frame_time = (Date.now() - start)/1000
	print("completed in: ", (Date.now() - start)/1000)
	print("estimated times: ", (one_frame_time*frames))
	print("video duration: ", ((1/SETTINGS.Output.FPS)*frames))
}