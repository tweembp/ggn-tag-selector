// ==UserScript==
// @name				GGn Tag selector
// @namespace	 ggntagselector
// @match			 *://gazellegames.net/upload.php*
// @match			 *://gazellegames.net/user.php*action=edit*
// @match			 *://gazellegames.net/torrents.php*id=*
// @grant			 GM.setValue
// @grant			 GM.getValue
// @grant			 GM.info
// @version		 1.0.0
// @author			tweembp
// @description Enhanced Tag selector for GGn
// ==/UserScript==

/*
Copyright 2024 tweembp

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(async () => {
	const VERSION = GM.info.script.version
	const SEP = '|' 
	const TAGSEP = ', '
	const defaultHotkeys = {
		'favorite': [
			'shift + digit1',
			'shift + digit2',
			'shift + digit3',
			'shift + digit4',
			'shift + digit5',
			'shift + digit6',
			'shift + digit7',
			'shift + digit8',
			'shift + digit9',
		],
		'preset': [
			'alt + digit1',
			'alt + digit2',
			'alt + digit3',
			'alt + digit4',
			'alt + digit5',
			'alt + digit6',
			'alt + digit7',
			'alt + digit8',
			'alt + digit9',
		],
	}
	const defaulthotkeyPrefixes = {
		'show_indices': 'shift'
	}
	const modifiers = ["shift","alt","ctrl","cmd"]
	const categoryDict = {
		"genre": [
		"4x",
		"action",
		"adventure",
		"aerial.combat",
		"agriculture",
		"arcade",
		"auto.battler",
		"base.building",
		"beat.em.up",
		"board.game",
		"bullet.hell",
		"card.game",
		"casual",
		"childrens",
		"city.building",
		"clicker",
		"cooking",
		"driving",
		"dungeon.crawler",
		"educational",
		"exploration",
		"falling.block.puzzle",
		"fighting",
		"fishing",
		"game.show",
		"grand.strategy",
		"graphic.adventure",
		"hack.and.slash",
		"hidden.object",
		"horror",
		"hunting",
		"interactive.fiction",
		"jigsaw",
		"management",
		"martial.arts",
		"match.3",
		"minigames",
		"music",
		"platform",
		"point.and.click",
		"pong",
		"puzzle",
		"quiz",
		"racing",
		"rhythm",
		"roguelike",
		"role.playing.game",
		"runner",
		"sandbox",
		"science.fiction",
		"shoot.em.up",
		"shooter",
		"first.person.shooter",
		"third.person.shooter",
		"simulation",
		"solitaire",
		"sports",
		"stealth",
		"strategy",
		"turn.based.strategy",
		"real.time.strategy",
		"survival",
		"survival.horror",
		"tactics",
		"text.adventure",
		"tile.matching.puzzle",
		"time.management",
		"tower.defense",
		"trivia",
		"typing",
		"vehicular.combat",
		"visual.novel",
		"wargame"
	],
		"theme": [
			"adult",
			"romance",
			"comedy",
			"crime",
			"drama",
			"fantasy",
			"historical",
			"mystery",
			"thriller",
		],
		"sports": [
		"american.football",
		"baseball",
		"basketball",
		"billiards",
		"blackjack",
		"bowling",
		"boxing",
		"chess",
		"cycling",
		"extreme.sports",
		"gambling",
		"go",
		"golf",
		"hockey",
		"mahjong",
		"pachinko",
		"pinball",
		"poker",
		"rugby",
		"skateboarding",
		"snowboarding",
		"soccer",
		"tennis",
		"wrestling"
	],
		"simulation": [
			"business.simulation",
			"construction.simulation",
			"dating.simulation",
			"flight.simulation",
			"life.simulation",
			"space.simulation",
			"vehicle.simulation",
			"walking.simulation"
		],
		"ost": [
		"acoustic",
		"alternative",
		"ambient",
		"arrangement",
		"background",
		"ballad",
		"breakbeat",
		"chiptune",
		"classical",
		"compilation",
		"compositional",
		"country",
		"dance",
		"downtempo",
		"drum.and.bass",
		"dubstep",
		"electro",
		"electronic",
		"electronica",
		"experimental",
		"folk",
		"funk",
		"guitar",
		"hardstyle",
		"heavy.metal",
		"hip.hop",
		"industrial",
		"instrumental",
		"japanese",
		"japanese.pop",
		"jazz",
		"karaoke",
		"lo.fi",
		"metal",
		"modern.classical",
		"opera",
		"orchestral",
		"piano",
		"pop",
		"retro",
		"rock",
		"stagescreen",
		"symphonic",
		"synth",
		"synthwave",
		"techno",
		"traditional",
		"trance",
		"violin",
		"vocal"
	],
		"books": [
		 "art.book",
		 "collection",
		 "comic.book",
		 "fiction",
		 "game.design",
		 "game.programming",
			"psychology",
			"social.science",
		 "gamebook",
		 "graphic.novel",
		 "guide",
		 "magazine",
		 "non.fiction",
		 "novelization",
		 "programming",
		"business",
		 "reference",
		 "study"
		],
		"applications": [
		 "apps.windows",
		 "apps.linux",
		 "apps.mac",
		 "apps.android",
		"utility",
		 "development",
		],
	}
	// relevant keys for each upload category
	const categoryKeys = {
		'Games': ["genre", "theme", "setting", "sports", "simulation"],
		'E-Books': ['books'],
		'Applications': ['applications'],
		'OST': ['ost']
	}
	
	function compare_versions(v0, v1) {
		const v0n = v0.split('.').map((num) => parseInt(num, 10))
		const v1n = v1.split('.').map((num) => parseInt(num, 10))
		for(let i = 0; i < 3; i++) {
			if(v0n[i] > v1n[i]) {
				return 'larger'
			} else if(v0n[i] < v1n[i]) {
				return 'smaller'
			}
			if(i === 2) {
				return 'equal'
			}
		}
	}
	
	// async function fix_backward_compatibility(oldVersion) {
	// }
	
	// backward compatibility fixes
	savedVersion = (await GM.getValue('gts_version')) || '0.5.0'
	if(compare_versions(VERSION, savedVersion) === 'larger') {
		await GM.setValue('gts_version', VERSION)
		await fix_backward_compatibility(savedVersion)
	}
	
	// common functions
	function titlecase(s) {
		let out = s.split('.').map((e) => {
			if (!["and", "em"].includes(e)) {
				return e[0].toUpperCase() + e.slice(1)
			} else {
				return e
			}
		}).join(' ')
		return out[0].toUpperCase() + out.slice(1)
	}
	
	function normalise_combo_string(s) {
		return s.trim().split('+').map((c) => c.trim().toLowerCase()).join(' + ')
	}
	
	function inject_css(css) {
		let style = document.createElement('style')
		style.textContent = css
		document.head.appendChild(style)
	}
	
	function get_current_page() {
		const url = document.URL
		const d = {
			'/upload.php': 'upload',
			'/torrents.php': 'torrents',
			'/user.php': 'user'
		}
		for(const [k, v] of Object.entries(d)) {
			if(url.indexOf(k) !== -1) {
				return v
			} 
		}
		// not in the list
		const _s = url.split('/')
		return _s[_s.length - 1].split('#')[0].split('?')[0].replace('.php', '')
	}

	function observe_element(element, property, callback, delay = 0) {
		let elementPrototype = Object.getPrototypeOf(element);
		if (elementPrototype.hasOwnProperty(property)) {
			let descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
			Object.defineProperty(element, property, {
				get: function() {
					return descriptor.get.apply(this, arguments);
				},
				set: function () {
					let oldValue = this[property];
					descriptor.set.apply(this, arguments);
					let newValue = this[property];
					if (typeof callback == "function") {
						setTimeout(callback.bind(this, oldValue, newValue), delay);
					}
					return newValue;
				}
			});
		}
	}
	
	
	const currentPage = get_current_page()
	if(['upload', 'torrents'].includes(currentPage)) {
	
	// load settings
	let currentFavoritesDict = (await GM.getValue('gts_favorites')) || {}
	let currentPresetsDict = (await GM.getValue('gts_presets')) || {}
	let hotkeys = (await GM.getValue('gts_hotkeys')) || defaultHotkeys
	let hotkeyPrefixes = (await GM.getValue('gts_hotkey_prefixes')) || defaulthotkeyPrefixes
	
	let searchStringDict = make_search_string_dict(categoryDict)
	
	// generate a dict for search and title
	function make_search_string_dict(categoryDict) {
		let searchStringDict = {}
		for(const tags of Object.values(categoryDict)) {
			// map from tag => search title, string
			for(const tag of tags) {
				const title = titlecase(tag)
				searchStringDict[tag] = `${title.toLowerCase()}${SEP}${tag}`
			}
		}
		return searchStringDict
	}
	
	let foundTags = -1
	let windowEvents = []
	
	inject_css(`
		.gts-selector *::-webkit-scrollbar {
			width: 3px;
		}
		.gts-selector *::-webkit-scrollbar-track {
			background: transparent;
		}
		.gts-selector *::-webkit-scrollbar-thumb {
			background-color: rgba(155, 155, 155, 0.5);
			border-radius: 20px;
			border: transparent;
		}
		#genre_tags { display: none!important }
		.gts-add-preset {
			visibility: hidden;
		}
		#torrents .gts-add-preset {
			float: right;
		}
		.gts-selector {
			display: none;
			position: absolute;
			background-color: rgb(27, 48, 63);
			box-sizing: border-box;
			padding: .5em 1em 1em 1em;
			border: 3px solid var(--rowb);
			box-shadow: -3px 3px 5px var(--black);
			z-index: 99999;
			grid-template-columns: auto fit-content(180px) fit-content(180px);
			column-gap: 1em;
			min-width: min-content !important;
			max-width: 1000px !important;
			font-size: 13px;
		}
		.gts-selector h1 {
			margin: 0;
			font-weight: normal;
			padding-bottom: 0;
		}
		.gts-selector a {
			opacity: 1 !important;	
		}
		.gts-sidearea {
			min-width: 150px;
			box-sizing: border-box;
			border-left: 2px solid var(--grey); 
			padding-left: 1em;
		}
		.gts-selector .gts-sidearea h1 {
			font-size: 1.2em;
			margin-top: 1em;
			margin-bottom: 0.25em;
		}
		.gts-sidearea h1:nth-child(2) {
			margin-top: 0;
		}
		.gts-current-tags-inner {
			font-size: 0.9em;
			margin-top: 1em;
			overflow-y: auto;
			max-height: 320px;
		}
		.gts-searchbar {
			display: grid;
			align-items: center;
			grid-template-columns: 3fr auto 1fr;
			column-gap: 1em;
			margin-bottom: 1em;
		}
		.gts-categoryarea {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 10px;
		}
		.gts-categoryarea .gts-right {
			display: grid;
			grid-template-columns: 1fr 1fr;
			height: 100%;
			column-gap: 1em;
		}
		.gts-categoryarea .gts-left {
			height: 100%;
		}
		.gts-category .gts-category-inner, #gts-favoritearea, #gts-presetarea {
			font-size: .9em;
			margin-top: 0.5em;
		}
		#gts-presetarea {
			max-height: 140px;
			overflow-y: auto;
		}
		#gts-favoritearea {
			max-height: 140px;
			overflow-y: auto;
		}
		.gts-category h1 {
			font-size: 1.1em;
		}
		.gts-category .gts-category-inner {
			display: grid;
			grid-template-columns: 1fr;
			column-gap: 1em;
			overflow-y: auto;
			max-height: 140px;
		}
		.gts-category-genre .gts-category-inner {
			grid-template-columns: auto auto;
			max-height: 320px;
		}
		#gts-favoritearea {
			grid-template-columns: 1fr 1fr;
			display: grid;
			column-gap: .5em;
		}
		.gts-tag-idx {
			color: yellow;
			font-weight: bold;
			margin-left: 0.25em;
		}
		.hide-idx .gts-tag-idx{
			visibility: hidden;
		}
		#gts-selector a {
			font-size: inherit !important;
		}	
	
		/* Specific to non-Games */
		.gts-categoryarea-E-Books,
		.gts-categoryarea-E-Books .gts-right,
		.gts-categoryarea-Applications,
		.gts-categoryarea-Applications .gts-right,  
		.gts-categoryarea-OST,
		.gts-categoryarea-OST .gts-right {
			grid-template-columns: 1fr;
		}	
		.gts-categoryarea-E-Books .gts-category .gts-category-inner,
		.gts-categoryarea-OST .gts-category .gts-category-inner,
		.gts-categoryarea-Applications .gts-category .gts-category-inner {
			max-height: 300px;
			grid-template-columns: repeat(6, fit-content(180px));
			row-gap: 0.3em;
		}
		.gts-tag-link-wrapper {
			width: fit-content !important;
			max-width: 100px;
		}
		.gts-category .gts-tag-link-wrapper {
			width: fit-content(120px);
		}
		.gts-category-genre .gts-tag-link-wrapper {
			max-width: 120px;
			width: max-content !important;
		}
	`)
	
	// renderer functions
	let tagBox
	let searchBox 
	let modal
	let presetButton
	let currentUploadCategory
	let showIndicess
	
	function render_tag_links(tags, idx) {
		let html = ''
		for(const tag of tags) {
			html += `<div class="gts-tag-link-wrapper"><a class="gts-tag-link" href="#" data-tag-idx="${idx}" data-tag="${tag}">${titlecase(tag)}</a>`
			if(idx < 9) {
				html += `<span data-tag-idx="${idx}" class="gts-tag-idx">${idx+1}</span>`
			}
			html += `</div>`
			idx += 1
		}
		return [html, idx]
	}
	
	function filter_category_dict(query, categoryDict, currentUploadCategory='Games') {
		let filteredDict = {}
		foundTags = []
		for(const [category, tags] of Object.entries(categoryDict)) {
			if(!categoryKeys[currentUploadCategory].includes(category)) {
				continue
			}
			filteredDict[category] = []
			for(const tag of tags) {
				if (searchStringDict[tag].includes(query)) {
					filteredDict[category].push(tag)
					foundTags.push(tag)
				}
			}
		}
		return filteredDict
	}
	
	function draw_currenttagsarea() {
		let html = `<h1>Current Tags</h1> (<small>Click to remove</small>)
		<div class="gts-current-tags-inner">`
		const tags = parse_text_to_tag_list(tagBox.value.trim())
		for(const [idx, tag] of tags.entries()) {
			html += `<div>${idx + 1}. <a href="#" class="gts-tag-link" data-tag="${tag}">${titlecase(tag)}</a></div>`
		}
		html += `</div>`
		document.querySelector('#gts-currenttagsarea').innerHTML = html
		document.querySelectorAll('#gts-currenttagsarea .gts-tag-link').forEach((tagLink) => {
			tagLink.addEventListener('click', (event) => {
				event.preventDefault()
				const currentTags = parse_text_to_tag_list(tagBox.value.trim())
				const tag = event.target.getAttribute('data-tag')
				let _temp = []
				for(const currentTag of currentTags) {
					if(tag !== currentTag) {
						_temp.push(currentTag)
					}
				}
				tagBox.value = _temp.join(TAGSEP)
				// draw_currenttagsarea()
			})
		})
	}
	
	function draw_categoryarea(query=SEP) {
		let categoryAreaHTML = ''
		let idx = 0
		let tagLinks
		const filteredDict = filter_category_dict(query, categoryDict, currentUploadCategory)
		if(currentUploadCategory === 'Games') {	
			if(filteredDict['genre'].length > 0) {
				[tagLinks, idx] = render_tag_links(filteredDict['genre'], idx)
				categoryAreaHTML += `
							<div class="gts-left">
								<div class="gts-category gts-category-genre" tabindex="-1">
									<h1 class="gts-h1">Genre</h1>
									<div class="gts-category-inner" tabindex="-1">
										${tagLinks}
									</div>
								</div>
							</div>`
			}
			
		} 
		categoryAreaHTML += `<div class="gts-right" tabindex="-1">`
		for(const [category, tags] of Object.entries(filteredDict)) {
			if((currentUploadCategory === 'Games' && category === 'genre') || tags.length === 0) {
				continue
			}
			[tagLinks, idx] = render_tag_links(tags, idx)
			categoryAreaHTML +=`<div class="gts-category gts-category-${category}" tabindex="-1">`
			if(categoryKeys[currentUploadCategory].length > 1) {
				categoryAreaHTML += `<h1>${titlecase(category)}</h1>`
			}
			categoryAreaHTML += `
					<div class="gts-category-inner" tabindex="-1">
						${tagLinks}
					</div>
				</div>`
		}
		document.querySelector('#gts-categoryarea').innerHTML = categoryAreaHTML
		document.querySelectorAll('#gts-categoryarea .gts-tag-link').forEach((el) => { el.addEventListener('click', (event) => {
			event.preventDefault()
			const tag = event.target.getAttribute('data-tag').trim()
			const favoriteChecked = check_favorite()
			if(favoriteChecked) {
				add_favorite(tag).then((resp) => {
					draw_favoritearea()
					register_hotkeys('favorite')
				})
			} else {
				add_tag(tag)
			}
		}) })
	}
	
	function draw_presetarea() {
		let html = ''
		const currentPresets = currentPresetsDict[currentUploadCategory] || []
		for(const [idx, preset] of currentPresets.entries()) {
			html += `<div class="gts-preset">${idx+1}. 
				<a href="#" class="gts-preset-link" data-preset="${preset}">
					${preset.split(TAGSEP).map((tag) => titlecase(tag)).join(TAGSEP)}</a>
				</div>
			</div>`
		}
		document.querySelector('#gts-presetarea').innerHTML = html
		document.querySelectorAll('#gts-presetarea .gts-preset-link').forEach((el) => { el.addEventListener('click', (event) => {
			event.preventDefault()
			const preset = event.target.getAttribute('data-preset').trim()
			if(check_remove()) {
				remove_preset(preset).then((resp) => {
					draw_presetarea()
				})
			} else {
				tagBox.value = preset
				tagBox.focus()
				searchBox.value = ''
				searchBox.focus()
			}
		}) })
	}
	
	function draw_favoritearea() {
		let html = ''
		const currentFavorites = currentFavoritesDict[currentUploadCategory] || []
		for(const [idx, tag] of currentFavorites.entries()) {
			html += `<div class="gts-favorite">${idx+1}. <a href="#" class="gts-tag-link" data-tag="${tag}">${titlecase(tag)}</a></div></div>`
		}
		document.querySelector('#gts-favoritearea').innerHTML = html
		document.querySelectorAll('#gts-favoritearea .gts-tag-link').forEach((el) => { el.addEventListener('click', (event) => {
			event.preventDefault()
			const tag = event.target.getAttribute('data-tag').trim()
			if(check_remove()) {
				remove_favorite(tag).then((resp) => {
					draw_favoritearea()
					register_hotkeys('favorite')
				})
			} else {
				add_tag(tag)
			}
		}) })
	}
	
	function insert_modal() {
		modal = document.createElement('div')
		tagBoxStyle = tagBox.currentStyle || window.getComputedStyle(tagBox)
		tdStyle = tagBox.parentElement.currentStyle || window.getComputedStyle(tagBox.parentElement)
		const _rect = tagBox.getBoundingClientRect()
		modal.style.top = (parseInt(tagBoxStyle.marginTop.replace('px',''), 10) +
			parseInt(tagBoxStyle.marginBottom.replace('px',''), 10) +
				tagBoxStyle.offsetHeight) + 'px'
		modal.style.left = (parseInt(tagBoxStyle.marginLeft.replace('px', ''), 10) + parseInt(tdStyle.paddingLeft.replace('px', ''), 10)) + 'px'
		modal.id = 'gts-selector'
		modal.classList.add('gts-selector')
		modal.setAttribute('tabindex', '-1')
		modal.innerHTML = `
			<div class="gts-selectarea">
				<div class="gts-searchbar">
					<input id="gts-search" type="text" placeholder="Search (Enter to add as-is)">
					<div class="gts-settings-wrapper" tabindex="-1">
						<a href="/user.php?action=edit#ggn-tag-selector" target="_blank"  tabindex="-1">[Settings]</a>
					</div>
					<div class="gts-checkbox-wrapper" style="text-align: right; min-width: 80px;">
						<input id="gts-favorite-checkbox" type="checkbox" tabindex="-1"><label class="gts-label" for="gts-favorite-checkbox">Favorite</label>
					</div>
				</div>
				<div id="gts-categoryarea" class="hide-idx gts-categoryarea gts-categoryarea-${currentUploadCategory}">
				</div>
			</div>
			<div class="gts-sidearea">
				<div class="gts-sidetopbar" tabindex="-1" style="text-align: right !important;">
					<div class="gts-checkbox-wrapper" style="text-align: right !important;">
						<input id="gts-remove-checkbox" type="checkbox" tabindex="-1"><label class="gts-label" for="gts-remove-checkbox">Remove</label>
					</div>
				</div>
				<h1>Presets</h1>
				<div id="gts-presetarea" tabindex="-1">
				</div>
				<h1>Favorites</h1>
				<div id="gts-favoritearea" tabindex="-1">
				</div>
			</div>
			<div class="gts-sidearea">
				<div id="gts-currenttagsarea">
				</div>
			</div>
			`
		
		tagBox.parentElement.style.position = 'relative'
		tagBox.parentElement.appendChild(modal)
		draw_categoryarea()
	
		searchBox = document.querySelector('#gts-search')
		searchBox.addEventListener('keydown', (event) => {
			if(event.key === 'Enter' || (event.key === 'Tab' && foundTags.length === 1)) {
				event.preventDefault()
				event.stopPropagation()
			} 
		})
		searchBox.addEventListener('keyup', (event) => {
			if(event.key === 'Tab' && foundTags.length === 1) {
				add_tag(foundTags[0])
			} else if(event.key === 'Enter') {
				let tag = event.target.value.trim()
				tag = tag.replaceAll(' ', '.')
				if(tag.length > 0) {
					add_tag(tag)
				}
			}
			let query = event.target.value.trim()
			if(query === '') {
				query = SEP
			}
			query = query.toLowerCase()
			draw_categoryarea(query)
		})
		searchBox.addEventListener('keyup', (event) => {
			if(event.code === 'Escape') {
				hide_gts()
			}
		})
		draw_presetarea()
		draw_favoritearea()
		draw_currenttagsarea()
	}
	
	function insert_preset_button() {
		presetButton = document.createElement('input')
		presetButton.id = 'gts-add-preset'
		presetButton.classList.add('gts-add-preset')
		presetButton.type = 'button'
		presetButton.setAttribute('tabindex', '-1')
		presetButton.value = 'Add Preset'
	
		if(currentPage === 'upload') {
			let fakeLabel = document.createElement('label')
			fakeLabel.classList.add('error')
			fakeLabel.setAttribute('for', 'tags')
			fakeLabel.style.display = 'none'
			tagBox.after(fakeLabel)
			tagBox.after(presetButton)
		} else if(currentPage === 'torrents') {
			const submitButton = tagBox.nextElementSibling
			submitButton.after(presetButton)
			submitButton.setAttribute('tabindex', '-1')
		}
		presetButton.addEventListener('click', (event) => {
			const preset = tagBox.value.trim()
			add_preset(preset).then(() => {
				draw_presetarea()
			})
		})
	}
	
	// actions
	function add_tag(tag) {
		const currentValue = tagBox.value.trim()
		tag = tag.trim().toLowerCase()
		if(currentValue === "") {
			tagBox.value = tag
		} else {
			let tags = currentValue.split(TAGSEP)
			if(!tags.includes(tag)) {
				tags.push(tag)
			}
			tagBox.value = tags.join(TAGSEP)
		}
		tagBox.focus()
		tagBox.setSelectionRange(-1, -1)
		searchBox.focus()
		searchBox.value = ''
		draw_categoryarea()
	}
	
	async function add_favorite(tag) {
		const currentFavorites = currentFavoritesDict[currentUploadCategory] || []
		if(currentFavorites.length < 9 && !currentFavorites.includes(tag)) {
			currentFavoritesDict[currentUploadCategory] = currentFavorites.concat(tag)
			return GM.setValue('gts_favorites', currentFavoritesDict)
		}
	}
	
	async function remove_favorite(tag) {
		const currentFavorites = currentFavoritesDict[currentUploadCategory] || []
		let _temp = []
		for(const fav of currentFavorites) {
			if(fav !== tag) {
				_temp.push(fav)
			}
		}
		currentFavoritesDict[currentUploadCategory] = _temp
		return GM.setValue('gts_favorites', currentFavoritesDict)
	}
	
	function parse_text_to_tag_list(text) {
		let tagList = []
		for(let tag of text.split(TAGSEP.trim())) {
			tag = tag.trim()
			if(tag !== '') {
				tagList.push(tag)
			}
		}
		return tagList
	}
	
	async function add_preset(rawPreset) {
		let preset = parse_text_to_tag_list(rawPreset)
		const currentPresets = currentPresetsDict[currentUploadCategory] || []
		preset = preset.join(TAGSEP)
		if(!currentPresets.includes(preset)) {
			currentPresetsDict[currentUploadCategory] = currentPresets.concat(preset)
			return GM.setValue('gts_presets', currentPresetsDict)
		}
	}
	
	async function remove_preset(preset) {
		let _temp = []
		const currentPresets = currentPresetsDict[currentUploadCategory] || []
		for(const pres of currentPresets) {
			if(pres !== preset) {
				_temp.push(pres)
			}
		}
		currentPresetsDict[currentUploadCategory] = _temp
		return GM.setValue('gts_presets', currentPresetsDict)
	}
	
	function check_favorite() {
		return document.querySelector('#gts-favorite-checkbox').checked
	}
	
	function check_remove() {
		return document.querySelector('#gts-remove-checkbox').checked
	}
	
	function check_gts_element(element) {
		if (typeof element === 'undefined' || !(element instanceof HTMLElement)) {
			return false
		}
		const _id = element.id || ''
		const _class = element.getAttribute('class') || ''
		const r = (_id === 'tags' || 
			_id.includes('gts-') || 
			_class.includes('gts-'))
		return r
	}
	
	function hide_gts() {
		modal.style.display = 'none'
		presetButton.style.visibility = 'hidden'
	}
	
	function show_gts() {
		if(!check_gts_active()) {
			modal.style.display = 'grid'
			presetButton.style.visibility = 'visible'
			searchBox.focus()
			draw_currenttagsarea()
		}
	}
	
	function hide_indices() {
		document.querySelector('#gts-categoryarea').classList.add('hide-idx')
		showIndicess = false
	}
	
	function show_indices() {
		document.querySelector('#gts-categoryarea').classList.remove('hide-idx')
		showIndicess = true
	}
	
	function check_gts_active() {
		return (modal.style.display === 'grid') && (presetButton.style.visibility === 'visible')
	}
	
	function check_query_exists() {
		// returns true if there is query
		return searchBox.value.trim() !== ''
	}
	
	function get_index_from_code(code) {
		if(code.indexOf('Digit') === 0) {
			return parseInt(code.replaceAll('Digit', ''), 10) - 1
		}
		return null 
	}
	
	function get_current_upload_category(defaultCategory='Games') {
		let categoryElement = document.querySelector('#categories')
		if(categoryElement !== null) {
			return categoryElement.value
		}
		categoryElement = document.querySelector('#group_nofo_bigdiv .head:first-child')
		const s = categoryElement.innerText.trim()
		if(s.indexOf('Application') !== -1) {
			return 'Applications'
		} else if(s.indexOf('OST') !== -1) {
			return 'OST'
		} else if(s.indexOf('Book') !== -1) {
			return 'E-Books'
		} else if(s.indexOf('Game') !== -1) {
			return 'Games'
		}
		return defaultCategory
	}
	
	function check_hotkey_prefix(event, type) {
		let eventModifiers = [event.shiftKey, event.altKey, event.ctrlKey, event.metaKey]
		const targetKeys = hotkeyPrefixes[type].split(' + ').map((key) => key.trim().toLowerCase())
		for(let i = 0; i < modifiers.length; i++) {
			if(targetKeys.includes(modifiers[i]) !== eventModifiers[i]) {
				return false
			}
		}
		return true
	}
	
	function get_hotkey_target(event, type) {
		for(const [idx, hotkey] of Object.entries(hotkeys[type])) {
			let normalKeys = []
			const targetKeys = hotkey.split('+').map((s) => {
				key = s.toLowerCase().trim()
				if(!modifiers.includes(key)) {
					normalKeys.push(key)
				}
				return key
			})
			let modifierMismatch = false
			let eventModifiers = [event.shiftKey, event.altKey, event.ctrlKey, event.metaKey]
			for(let i = 0; i < modifiers.length; i++) {
				if(targetKeys.includes(modifiers[i]) !== eventModifiers[i]) {
					modifierMismatch = true
					break
				}
			}
			if(modifierMismatch) {
				continue
			}
			if(normalKeys.length > 0 && (
				!(normalKeys.includes(event.key.toLowerCase()) || normalKeys.includes(event.code.toLowerCase()))
			)) {
				continue
			}
			return idx
		}
		return null
	}
	
	function register_hotkeys(type) {
		if(['favorite', 'preset'].includes(type) && !windowEvents.includes(`hotkey-${type}`)) {
			window.addEventListener('keydown', (event) => {
				if(!check_gts_active()) {
					return
				}
				const target = get_hotkey_target(event, type)
				let currentList
				if(type === 'favorite') {
					if(check_query_exists()) {
						return // return early if query is active
					}
					currentList = currentFavoritesDict[currentUploadCategory] || []
				} else if(type === 'preset') {
					// if we're working with presets,
					// we proceed anyway
					currentList = currentPresetsDict[currentUploadCategory] || []
				}
				if(target !== null) {
					if(target < currentList.length) {
						event.preventDefault()
						if(type === 'favorite') {
							add_tag(currentList[target])
						} else if(type === 'preset') {				
							tagBox.value = currentList[target]
							tagBox.focus()
						}
						searchBox.focus()
					}
				}
			}, true)
		} else if (type === 'show_indices' && !windowEvents.includes(!`hotkey-${type}`)) {
			window.addEventListener('keydown', (event) => {
				if(!check_gts_active() || !check_query_exists()) {
					return
				} 
				if(check_hotkey_prefix(event, type)) {
					show_indices()
					const idx = get_index_from_code(event.code)
					if(idx !== null) {
						document.querySelector(`a.gts-tag-link[data-tag-idx="${idx}"]`).click()
						event.preventDefault()
					}
				}
			}, true)
			window.addEventListener('keyup', (event) => {
				if(showIndicess) {
					hide_indices()
				}
			}, true)
		}
		windowEvents.push(`hotkey-${type}`)
	}
	// initialiser
	async function init() {	
		if(document.querySelector('#gts-selector') !== null) {
			return
		}
		currentUploadCategory = get_current_upload_category()
		tagBox = document.querySelector('#tags')
		tagBox.setAttribute('onfocus', 'this.value = this.value')
		insert_modal()
		insert_preset_button()
		if(!windowEvents.includes('click')) {
			window.addEventListener('click', (event) => {
				if(!check_gts_element(event.target)) {
					setTimeout(() => {
						if(!check_gts_element(document.activeElement)) {
							hide_gts()
						}
					}, 50)
				}
			}, true)
			windowEvents.push('click')
		}
		if(!windowEvents.includes('esc')) {
			window.addEventListener('keyup', (event) => {
				if(event.code === 'Escape') {
					if(check_gts_active()) {
						hide_gts()
					}
				}
			}, true)
			windowEvents.push('esc')
		}
		tagBox.addEventListener('focus', show_gts)
		tagBox.addEventListener('click', show_gts)
		tagBox.addEventListener('keyup', (event) => {
			if(event.code !== 'Escape') {
				draw_currenttagsarea()
			}
		})
		register_hotkeys('favorite')
		register_hotkeys('preset')
		register_hotkeys('show_indices')
		draw_currenttagsarea()
		// watch for value change in the tagBox
		observe_element(tagBox, 'value', (_, newValue) => {
			draw_currenttagsarea()
		})
	}
	
	if(currentPage === 'upload') {
		const observerTarget = document.querySelector('#dynamic_form')
		let observer = new MutationObserver(init)
		const observerConfig = { childList: true, attributes: false, subtree: false }
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
			observer.observe(observerTarget, observerConfig)
		} else {
			init();
			observer.observe(observerTarget, observerConfig)
		}
	} else {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", init);
		} else {
			init();
		}
	}
	
	} else if(currentPage === 'user') {
	
	let hotkeys = (await GM.getValue('gts_hotkeys')) || defaultHotkeys
	let hotkeyPrefixes = (await GM.getValue('gts_hotkey_prefixes')) || defaulthotkeyPrefixes
	
	inject_css(`
		#gts-save-settings {
			min-width: 200px;
		}
		.gts-hotkey-grid {
			display: grid;
			column-gap: 1em;
			grid-template-columns: repeat(2, fit-content(400px)) 1fr;
		}
		.gts-hotkey-grid h1 {
			font-size: 1.1em;
		}
		.gts-hotkey-col div {
			margin-bottom: 0.25em;
		}
	`)
	
	async function init() {
		let colhead = document.createElement('tr')
		colhead.classList.add('colhead_dark')
		colhead.innerHTML = '<td colspan="2" id="ggn-tag-selector"><strong>GGn Tag Selector</strong></span>'
		const lastTr = document.querySelector('#userform > table > tbody > tr:last-child')
		lastTr.before(colhead)
		let hotkeyTr = document.createElement('tr')
		let html = `
			<td class="label"><strong>Hotkeys</strong></td>
			<td class="gts-hotkey-grid">
		`
		for(const [type, cHotkeys] of Object.entries(hotkeys)) {
			html += `<div class="gts-hotkey-col"><h1>${titlecase(type)}</h1>`
			for(const [idx, hotkey] of cHotkeys.entries()) {
				html += `<div>${idx + 1}. <input class="gts-settings" data-gts-settings="gts_hotkeys:${type}-${idx}" value="${hotkey}"></div>`
			}
			html += `</div>`
		}
		html += `<div class="gts-hotkey-col">
			<h1>Index peeker</h1>
			Hold <input type="text" style="width: 5em" class="gts-settings" data-gts-settings="gts_hotkey_prefixes:show_indices" value="${hotkeyPrefixes['show_indices']}"> to display indices of the filtered results (modifier keys/their combinations only). 
			Use the key along with a digit (1-9) to add the tag according to the index.
			Note that peeking/adding by index will not work if the filter query is empty.
			<h1>How to set combos/keys</h1>
			To set a combo, use the keys joined by the plus sign. For example, Ctrl + Shift + 1 is <span style="font-family: monospace">ctrl + shift + digit1</span>
			<ul>
				<li>Modifier keys: shift, alt, ctrl, cmd</li>
				<li>Numbers: digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9</li>
				<li>Alphabet: a, b, c, d, (etc.)</li>
			</ul>
			<div style="margin-top: 1em;">
				Other keys should also work. If not, use the <span style="font-family: monospace">event.code</span> value from <a target="_blank" href="https://www.toptal.com/developers/keycode">the keycode tool</a>.
			</div>
		</div>`
		html += `</td>`
		html += `<div style="margin-left: 1em;"><input type="button" id="gts-save-settings" value="Save GGn Tag Selector settings"></input>
		<input type="button" id="gts-restore-settings" value="Restore Defaults"></div>`
		hotkeyTr.innerHTML = html	
		colhead.after(hotkeyTr)
		document.querySelector('#gts-save-settings').addEventListener('click', (event) => {
			const originalText = event.target.value
			let newData = {
				'gts_hotkeys': hotkeys,
				'gts_hotkey_prefixes': hotkeyPrefixes
			}
			event.target.value = 'Saving ...'
			document.querySelectorAll('.gts-settings').forEach((el) => {
				const meta = el.getAttribute('data-gts-settings')
				const rawValue = el.value
				const [settingKey, settingSubKey] = meta.split(':')
				if(settingKey === 'gts_hotkey_prefixes') {
					newData[settingKey][settingSubKey] = normalise_combo_string(rawValue)
				} else if(settingKey === 'gts_hotkeys') {
					const [type, idx] = settingSubKey.split('-')
					// normalise the value
					value = normalise_combo_string(rawValue)
					newData[settingKey][type][idx] = value
				}
			})
			let promises = []
			for(const [key, value] of Object.entries(newData)) {
				promises.push(GM.setValue(key, value))
			}
			Promise.all(promises).then((arr) => {
				event.target.value = 'Saved!'
				setTimeout(() => {
					event.target.value = originalText
				}, 500)
			})
		})
		document.querySelector('#gts-restore-settings').addEventListener('click', (event) => {
			let defaults = {
				'gts_hotkeys': defaultHotkeys,
				'gts_hotkey_prefixes': hotkeyPrefixes
			}
			document.querySelectorAll('.gts-settings').forEach((el) => {
				const meta = el.getAttribute('data-gts-settings')
				const [settingKey, settingSubKey] = meta.split(':')
				if(settingKey === 'gts_hotkey_prefixes') {
					el.value = defaults[settingKey][settingSubKey]
				} else if(settingKey === 'gts_hotkeys') {
					const [type, idx] = settingSubKey.split('-')
					el.value = defaults[settingKey][type][idx]
				}
			})
		})
	
		if(window.location.hash.substring(1) === 'ggn-tag-selector') {
			document.querySelector('#ggn-tag-selector').scrollIntoView()
		} 
	}
	
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
	
	}
	
})()
	
