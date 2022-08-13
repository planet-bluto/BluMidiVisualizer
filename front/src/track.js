(() => {
	let panels = ["properties", "tracks"]

	panels.forEach(panel => {
		let panel_btn = document.getElementById(panel + '-panel-btn')
		let panel_div = document.getElementById(panel + '-panel')
		panel_btn.onclick = () => {
			panels.forEach(sub_panel => {
				let sub_panel_btn = document.getElementById(sub_panel + '-panel-btn')
				let sub_panel_div = document.getElementById(sub_panel + '-panel')

				sub_panel_btn.removeAttribute('selected')
				sub_panel_div.style = "display: none;"
			})
			panel_btn.setAttribute('selected', '')
			panel_div.style = ""
		}
	})

	let properties_btn = document.getElementById('properties-panel-btn')
	properties_btn.click()
})()