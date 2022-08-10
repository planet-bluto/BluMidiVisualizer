const print = console.log
var MidiPath = null
var CurrentMidi = null
var TrackSort = []
var TrackInfo = {}
var BackAudio = new Audio()
var BackImg = new Image()
var loaded_image_path
var loaded_audio_path
var PlayHandler = null
var Session = {
    History: [],
    ProjectPath: null,
    updateProjectPath: path => {
        Session.ProjectPath = path
        window.document.title = "BluMidiVisualizer - " + path.replace(/^.*[\\\/]/, '')
    }
}

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
const { Converter } = require("ffmpeg-stream");
ffmpeg.setFfmpegPath(ffmpegPath);
const {Duplex} = require('stream');
var ProgressBar = require('progress');
// const { createCanvas, loadImage } = require('canvas');
const fs = require('fs')
var Frame = require("canvas-to-buffer")

// ipcRenderer.on('file-save', (e, path) => {
//     if (awaiting_project_path) {
//         Session.updateProjectPath(path)
//         awaiting_project_path = false
//     }
// })

var fade_users = 0

function fade_in() {
    fade_users++
    var fade = document.getElementById('screen-fade')
    fade.style = ""
}

function fade_out() {
    fade_users--
    if (fade_users <= 0) {
        var fade = document.getElementById('screen-fade')
        fade.style = "display: none;"
    }
}

function start_loading() {
    fade_in()

    var loading_box = document.getElementById('loading-box')
    loading_box.style = ""
}

function hide_loading() {
    fade_out()

    var loading_box = document.getElementById('loading-box')
    loading_box.style = "display: none;"
}

function hide_close_popup() {
    var close_button = document.getElementById('close-popup')
    close_button.style = "display: none;"
}

function show_close_popup() {
    var close_button = document.getElementById('close-popup')
    close_button.style = ""
}

function hide_popups() {
    fade_out()
    var popups = Array.from(document.getElementsByClassName('popup'))
    popups.forEach(popup => {
        popup.setAttribute('active', false)
    })
    hide_close_popup()
}

function show_popup(POPUP_NAME, close = true) {
    hide_popups()
    fade_in()

    var selected_popup = document.getElementById(`popup-${POPUP_NAME}`)
    selected_popup.setAttribute('active', true)
    if (close) { show_close_popup() }
}

function createCanvas(width, height) {
    let canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    return canvas
}

function PROJECT_JSON() {
    return JSON.stringify({MidiPath: MidiPath, TrackSort: TrackSort, SETTINGS: SETTINGS, TrackInfo: TrackInfo})
}

// const FILE_TYPES = {
//     "json": "application/json",
//     "video": "video/mp4"
// }

async function save_as(name, data) {
    return new Promise((res, rej) => {
        let sf = document.createElement('input')
        sf.type = "file"
        sf.setAttribute('nwsaveas', name)
        sf.click()
        sf.onchange = e => {
            res(sf.files[0].path)
        }
    })
}

document.getElementById('close-popup').onclick = e => {
    hide_popups()
}

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length + 1;
        while (k--) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
}

Array.prototype.remove = function (index) {
    if (index > -1 && index < this.length-1) {
    	var return_value = this.splice(index, 1)
    	return return_value
    }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}

class ContextQueue {
    constructor(title, context) {
        this.title = title
        this.context = context
        this.queue = []
    }

    exec() {
        this.queue.forEach(job => {
            if (job.type == "func") {
                this.context[job.title](...job.args)
            } else {
                this.context[job.title] = job.value
            }
        })
        this.queue.forEach(job => {
            if (job.type == "value") {
                this.context[job.title] = 1
            }
        })
        this.queue = []
    }

    // Methods //

    fill(...args) {
        this.queue.push({type: "func", title: "fill", args: args})
    }

    roundRect(...args) {
        this.queue.push({type: "func", title: "roundRect", args: args})
    }

    fillRect(...args) {
        this.queue.push({type: "func", title: "fillRect", args: args})
    }

    drawImage(...args) {
        this.queue.push({type: "func", title: "drawImage", args: args})
    }

    // Properties //

    fillStyle(...args) {
        this.queue.push({type: "value", title: "fillStyle", value: args[0]})
    }

    globalAlpha(...args) {
        this.queue.push({type: "value", title: "globalAlpha", value: args[0]})
    }
}

hide_loading()
show_popup("startup", false)