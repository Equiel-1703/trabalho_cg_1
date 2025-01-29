const tabs_mapping = {
	'tab_model_properties': 'model_properties',
	'tab_model_selector': 'model_selector'
};

const tab_active_class = 'tab_active';

let active_tab_id = '';
const default_tab_id = 'tab_model_properties';

function setActiveTab(tab_button_id, tab_content_id) {
	const tab_button = document.getElementById(tab_button_id);
	const tab_content = document.getElementById(tab_content_id);

	if (active_tab_id !== '') {
		const active_tab_button = document.getElementById(active_tab_id);
		const active_tab_content = document.getElementById(tabs_mapping[active_tab_id]);

		active_tab_button.classList.remove(tab_active_class);
		active_tab_content.style.display = 'none';
	}

	tab_button.classList.add(tab_active_class);
	tab_content.style.display = 'block';

	active_tab_id = tab_button_id;
}

function initTabs() {
	const tabs_buttons = document.getElementsByClassName('tab_button');

	const tab_button_click = (e) => {
		const tab_content_id = tabs_mapping[e.target.id];

		if (tab_content_id !== undefined && tab_content_id !== active_tab_id) {
			setActiveTab(e.target.id, tab_content_id);
		}
	};

	// Add event listeners to tab buttons
	for (let i = 0; i < tabs_buttons.length; i++) {
		tabs_buttons[i].addEventListener('click', tab_button_click);
	}

	// Hide all tabs content
	hideAllTabsContent();

	// Set default tab
	setActiveTab(default_tab_id, tabs_mapping[default_tab_id]);
}

function hideAllTabsContent() {
	const tabs_content = document.getElementsByClassName('tab_content');

	for (let i = 0; i < tabs_content.length; i++) {
		tabs_content[i].style.display = 'none';
	}
}

initTabs();