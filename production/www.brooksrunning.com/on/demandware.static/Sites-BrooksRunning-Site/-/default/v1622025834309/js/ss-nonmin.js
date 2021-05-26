/**
 * @file Brooks Finder
 *
 */

var BF =
	BF ||
	(function() {
		/** Create event emitter object */

		var emitter = new window.TinyEmitter()

		/** Create component library */

		var registeredComponents = {}

		/** Create service library */

		var registeredServices = {}

		/**
		 * Registers a component to the component library
		 *
		 * @param {String} name - a unique name for the component
		 * @param {Function} func - the component function
		 *
		 */
		function registerComponent(name, func) {
			registeredComponents[name] = func
		}

		/**
		 * Creates a new component
		 *
		 * @param {String} name - name of component
		 * @param {Element} element - dom element
		 *
		 */
		function createComponent(name, element) {
			var scope = new Scope(name)
			registeredComponents[name].call(scope, scope, element)
		}

		/**
		 * Create a new scope for a component or service
		 *
		 * @param {String} id - the name of the component or service
		 * @return {Object} the scope object
		 *
		 */
		var Scope = function(id) {
			var scope = {}

			/**
			 * Listen for an event
			 *
			 * @param {String} name - the name of the events. See extensions/events.js
			 * @param {Function} onCallback - callback function
			 *
			 */
			scope.on = function(name, onCallback) {
				emitter.on(name, function(data) {
					onCallback.call(scope, data)
				})
			}

			/**
			 * Emit an event
			 *
			 * @param {String} name - the name of the events. See extensions/events.js
			 * @param {Any} data - data for the event
			 *
			 */
			scope.emit = function(name, data) {
				emitter.emit(name, data)
			}

			/**
			 * Initialization function called after all components are registered
			 *
			 * @param {Func} initCallback - the initilization function
			 *
			 */
			scope.init = function(initCallback) {
				setTimeout(function() {
					initCallback.call(scope)
				})
			}

			/**
			 * Called on application start
			 *
			 * @param {Function} callback - callback function
			 *
			 */
			scope.start = function(callback) {
				emitter.on(BF.events.START, function() {
					callback.call(scope)
				})
			}

			/**
			 * Prints an error in the console
			 *
			 * @param {String} error - error message
			 *
			 */
			scope.error = function(error) {
				console.error(
					'Brooks Finder ERROR\n',
					'Location: ' + id + '\n',
					'Error: "' + error + '"'
				)
			}

			return scope
		}

		/**
		 * Searches a dom element for registered components and initializes them
		 *
		 * @param {Element} element - parent dom element
		 *
		 */
		function compile(element) {
			for (var componentName in registeredComponents) {
				var attribute = 'data-bf-' + componentName
				var selector = '[' + attribute + ']'
				var elements = element.querySelectorAll(selector)
				// children
				try {
					for (var i = 0; i < elements.length; i++) {
						createComponent(componentName, elements[i])
					}
					// self
					if (element.hasAttribute(attribute)) {
						createComponent(componentName, element)
					}
				} catch (error) {
					console.error(
						'Brooks Finder ERROR\n',
						'Location: compnent ' + componentName + '\n',
						'Error: "' + error + '"'
					)
					console.error(element)
				}
			}
		}

		/**
		 * Registers a singleton service
		 *
		 * @param {String} name - a unique name for the component
		 * @param {Function} func - the service function
		 *
		 */

		function registerService(name, func) {
			var scope = new Scope(name)
			registeredServices[name] = func.call(scope, scope)
		}

		/**
		 * Start the application by compiling root element
		 *
		 */

		function start() {
			var appEl = document.querySelector('[data-bf-app]')
			appEl !== null && compile(appEl)
			emitter.emit(BF.events.START)
		}

		/** BF API */

		return {
			start: start,
			component: registerComponent,
			service: registerService,
			services: registeredServices,
			compile: compile
		}
	})()

/**
 * @file Events
 * Events that can be sent from components and services. Some events accept or require arguments
 *
 */

BF.events = {
	/**
	 * Event on app start
	 *
	 */
	START: 'START',

	/**
	 * Emit new form values
	 *
	 * @param {Array} values
	 * @property {String} values.name - name of input
	 * @property {String} values.value - value of input
	 *
	 */
	SET_FORM_VALUES: 'SET_FORM_VALUES',

	/**
	 * The screen change has started
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	SCREEN_TRANSITION_START: 'SCREEN_TRANSITION_START',

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	SCREEN_TRANSITION_ACTIVE: 'SCREEN_TRANSITION_ACTIVE',

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	SCREEN_TRANSITION_END: 'SCREEN_TRANSTION_END',

	/**
	 * The browser window has been resized
	 *
	 * @param {Object} data
	 * @property {Number} data.width - width of window
	 * @property {Number} data.height - height of window
	 *
	 */
	WINDOW_RESIZE: 'WINDOW_RESIZE',

	/**
	 * Scroll position has changed
	 *
	 * @param {Object} data
	 * @property {Number} data.y - vertical scroll position of page
	 *
	 */
	USER_SCROLL: 'USER_SCROLL',

	/**
	 * Open an info overlay
	 *
	 * @param {String} template id - the DOM element Id of the template
	 *
	 */
	OPEN_INFO_OVERLAY: 'OPEN_INFO_OVERLAY',

	/**
	 * Close the info overlay
	 *
	 */
	CLOSE_INFO_OVERLAY: 'CLOSE_INFO_OVERLAY',

	/**
	 * Open an alert
	 *
	 * @param {String} template id - the DOM element Id of the template
	 *
	 */
	OPEN_ALERT: 'OPEN_ALERT',

	/**
	 * Close the alert
	 *
	 */
	CLOSE_ALERT: 'CLOSE_ALERT',

	/**
	 * Open the touch progress menu
	 *
	 */
	OPEN_PROGRESS_MENU: 'OPEN_PROGRESS_MENU',

	/**
	 * Close the touch progress menu
	 *
	 */
	CLOSE_PROGRESS_MENU: 'CLOSE_PROGRESS_MENU',

	/**
	 * Make the progress menu visible
	 *
	 */
	SHOW_PROGRESS_MENU: 'SHOW_PROGRESS_MENU',

	/**
	 * Hide the progress menu visible
	 *
	 */
	HIDE_PROGRESS_MENU: 'HIDE_PROGRESS_MENU',

	/**
	 * Hide all screen content
	 *
	 */
	HIDE_SCREENS: 'HIDE_SCREENS',

	/**
	 * Unhide screen content
	 *
	 */
	SHOW_SCREENS: 'SHOW_SCREENS',

	/**
	 * Screen dependency is loading
	 *
	 * @param {String} screen id that is being loaded
	 *
	 */
	LOADING_SCREEN_DATA: 'LOADING_SCREEN_DATA',

	/**
	 * Screen dependency has finished loading
	 *
	 * @param {Object} data
	 * @property {String} data.id - screen id that was loaded
	 * @property {Any} data.data - data returned from the server
	 *
	 */
	SCREEN_DATA_LOADED: 'SCREEN_DATA_LOADED'
}

/**
 * @file Brooks Finder Helper Functions
 *
 */

BF.helpers = {
	/**
	 * Add browser vendor prefixes to styles
	 *
	 * @param {Object} property name: value
	 *
	 * @returns {Object} of property names and values
	 *
	 */
	prefixedCssObject: function(obj) {
		var prefixes = ['webkit', 'ms', 'moz']
		var cssObj = {}
		for (var property in obj) {
			cssObj[property] = obj[property]
			prefixes.map(function(prefix) {
				cssObj['-' + prefix + '-' + property] = obj[property]
			})
		}
		return cssObj
	},
	/**
	 * Check if a screen is a form
	 *
	 * @param {Object} Screen object
	 *
	 * @returns {Bool}
	 *
	 */
	isFormScreen: function(screen) {
		return screen.type === 'form'
	},
	/**
	 * Check if browser is IE
	 * See https://stackoverflow.com/questions/21825157/internet-explorer-11-detection
	 *
	 * @returns {Bool}
	 *
	 */
	isIE: function() {
		return (
			navigator.userAgent.indexOf('MSIE') !== -1 ||
			navigator.appVersion.indexOf('Trident/') > 0
		)
	}
}

/**
 * @file Submit events to external analytics service provider
 *
 */

BF.service('analytics', function(scope) {
	/**
	 * Submit analytic event
	 *
	 * @param {String} name of event
	 * @param {Element} element associated with the event (optional)
	 *
	 */
	function event(name, el, data) {
		// if (!window.eventTrackingEvents) return
		// var eventConfig = window.eventTrackingEvents[name]
		// if (!eventConfig || !eventConfig.data || typeof eventConfig.data !== 'function') return
		// // if event should be unique to session check if already submitted
		// if (eventConfig.unique && eventAlreadySubmitted(name)) return
		// // submit event to GA
		// try {
		// 	var data = eventConfig.data(el, data)
		// } catch (error) {
		// 	return scope.error(error)
		// }
		// if (!!data) {
		// 	window.dataLayer = window.dataLayer || []
		// 	window.dataLayer.push(data)
		// }
	}

	/**
	 * Check if event has already been submitted
	 *
	 * @param {Object} data
	 * @property {String} data.category
	 * @property {String} data.action
	 * @property {String} data.label
	 *
	 * @return {Boolean}
	 *
	 */
	function eventAlreadySubmitted(name) {
		if (!window.dataLayer) return false

		return (
			window.dataLayer.filter(function(event) {
				return event.event === name
			}).length > 0
		)
	}

	return {
		event: event
	}
})

/**
 * @file API Service
 *
 */

BF.service('api', function(scope) {
	return {
		/**
		 * Make a call to the API
		 *
		 * @param {String} url - the endpoint url
		 * @param {String} type - the request type
		 *
		 * @returns {Function} promise
		 *
		 */
		call: function(url, type) {
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: url,
					type: type,
					data: BF.services.form.formValues(),
					success: function(data) {
						resolve(data)
					},
					error: function() {
						reject('There was an error. Please try again')
					}
				})
			})
		}
	}
})

/**
 * @file Device Service
 * Tracks device information
 *
 */

BF.service('device', function(scope) {
	/** Set props  */
	scope.props = {
		slowConnectionThreshold: 2000
	}

	/** Set initial state  */
	scope.state = {
		hasTouch: isTouchDevice(),
		hasSlowConnection: hasSlowNetworkConnection()
	}

	/**
	 * Determine if device supports touch events
	 *
	 * @returns {Bool}
	 *
	 */

	function isTouchDevice() {
		var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ')
		var mq = function(query) {
			return window.matchMedia(query).matches
		}

		if (
			'ontouchstart' in window ||
			(window.DocumentTouch && document instanceof DocumentTouch)
		) {
			return true
		}

		// include the 'heartz' as a way to have a non matching MQ to help terminate the join
		// https://git.io/vznFH
		var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('')
		return mq(query)
	}

	/**
	 * Determine if device has a slow network connection
	 *
	 * @returns {Bool}
	 *
	 */

	function hasSlowNetworkConnection() {
		if (!window.performance || !window.performance.timing) return false

		// if it took a long time to receive page response from server they have a very slow connection
		return (
			window.performance.timing.responseStart - window.performance.timing.requestStart >
			scope.props.slowConnectionThreshold
		)
	}

	return {
		hasTouch: scope.state.hasTouch,
		hasSlowConnection: scope.state.hasSlowConnection
	}
})

/**
 * @file Form Service
 * Tracks form input values
 *
 */

BF.service('form', function(scope) {
	/** Set initial state  */
	scope.state = {
		formValues: [],
		formSteps: [],
		sendProgressHandler: null
	}

	/** Define referenced DOM elements  */
	scope.els = {
		form: document.querySelector('form[name="bf-form"]')
	}

	/** Terminate if form element is not found  */
	if (!scope.els.form) {
		return scope.error('Form not found')
	}

	/**
	 * Read form values
	 *
	 * @return {Array} array of inputs and their values
	 *
	 */

	function formValues() {
		return $(scope.els.form).serializeArray()
	}

	/**
	 * Set form value state, broadcast to components
	 *
	 * @return {Array} array of inputs and their values
	 *
	 */

	function setFormValues() {
		scope.state.formValues = formValues()
		scope.emit(BF.events.SET_FORM_VALUES, scope.state.formValues)
	}

	/**
	 * Resets form progress
	 *
	 */
	function resetForm() {
		$(scope.els.form)
			.find('input:text, input:password, input:file, select, textarea')
			.val('')
		$(scope.els.form)
			.find('input:radio, input:checkbox')
			.removeAttr('checked')
			.removeAttr('selected')

		$(scope.els.form)
			.find('input:radio, input:checkbox')
			.each(function() {
				this.checked = false
			})

		setFormValues()
	}

	/**
	 * Check if a specific input currently has a value
	 *
	 * @param {String} fieldName - name of field
	 * @return {Bool}
	 *
	 */

	function inputHasValue(fieldName) {
		var filtered = scope.state.formValues.filter(function(item) {
			return item.name == fieldName
		})

		return filtered.length ? true : false
	}

	/**
	 * Check if a form step has been completed
	 *
	 * @param {Object} form step object
	 * @return {Bool}
	 *
	 */

	function stepCompleted(step) {
		if (!step) return false

		var completed = true
		step.requiredFields.map(function(name) {
			completed = completed ? inputHasValue(name) : completed
		})
		return completed
	}

	/**
	 * Check if step is completed by id
	 *
	 * @param {String} form step (screen) id
	 * @return {Bool}
	 *
	 */

	function completedById(id) {
		return stepCompleted(stepById(id))
	}

	/**
	 * Check if step is completed by index
	 *
	 * @param {Number} form step index
	 * @return {Bool}
	 *
	 */

	function completedByIndex(index) {
		return stepCompleted(scope.state.formSteps[index])
	}

	/**
	 * Get completed form steps
	 *
	 * @return {Array} of form step objects
	 *
	 */

	function completedSteps() {
		return scope.state.formSteps.filter(stepCompleted)
	}

	/**
	 * Check if form is copmlete
	 *
	 * @return {Boolean}
	 *
	 */

	function formIsComplete() {
		return scope.state.formSteps.filter(stepCompleted).length === scope.state.formSteps.length
	}

	/**
	 * Get a form step by it's id
	 *
	 * @param {String} form step (screen) id
	 * @return {Array} of form step objects
	 *
	 */

	function stepById(id) {
		return scope.state.formSteps.filter(function(item) {
			return item.id === id
		})[0]
	}

	/** Listen for events */

	// make sure form isn't submitted
	scope.els.form.addEventListener('submit', function(e) {
		e.preventDefault()
	})

	/** Set form values on page load */

	scope.start(function() {
		setFormValues()
	})

	/** Service API */

	return {
		/**
		 * Registers form step on page load
		 *
		 * @param {Object} data - object with screen id {String} and requiredFields {Array} (array of input names)
		 *
		 */
		registerFormStep: function(data) {
			scope.state.formSteps.push(data)
		},
		/**
		 * Tell Form service to update form input values
		 *
		 */
		updateFormValues: function() {
			// timeout ensures DOM values are updated
			setTimeout(function() {
				setFormValues()
			})
		},
		/**
		 * Send progress to server
		 *
		 */
		sendFormProgress: function() {
			// wait half a second so all updates are included
			clearTimeout(scope.state.sendProgressHandler)
			scope.state.sendProgressHandler = setTimeout(function() {
				BF.services.api.call(BF.endpoints.sendProgress.url, BF.endpoints.sendProgress.type)
			}, 500)
		},
		/**
		 * Get form values
		 *
		 * @return {Array} input names and their values
		 *
		 */
		formValues: function() {
			return scope.state.formValues
		},

		/**
		 * Get input value by name
		 *
		 * @return {String} form value
		 *
		 */
		inputValueString: function(inputName) {
			var matches = scope.state.formValues.filter(function(item) {
				return item.name == inputName
			})

			// if input not found or input value is empty return undefined
			if (
				!matches.length ||
				matches.filter(function(item) {
					return item.value.length > 0
				}).length === 0
			)
				return ''

			var valueString = ''
			matches.map(function(item, index) {
				valueString += (index > 0 ? ',' : '') + item.value
			})
			return valueString
        },

		/**
		 * Get input value by name and concatenate with pipe
		 *
		 * @return {String} form value
		 *
		 */
		inputValuePipeString: function(inputName) {
			var matches = scope.state.formValues.filter(function(item) {
				return item.name == inputName
			})

			// if input not found or input value is empty return undefined
			if (
				!matches.length ||
				matches.filter(function(item) {
					return item.value.length > 0
				}).length === 0
			)
				return ''

			var valueString = ''
			matches.map(function(item, index) {
				valueString += (index > 0 ? '|' : '') + item.value
			})
			return valueString
        },

		/**
		 * Check if all form steps are completed
		 *
		 * @return {Bool}
		 *
		 */
		allStepsCompleted: function() {
			return completedSteps().length === scope.state.formSteps.length
		},

		/** Get completed form steps
		 *
		 * @return {Array} of form step objects
		 *
		 */
		completedSteps: completedSteps,

		/**
		 * Check if step is completed by id
		 *
		 * @param {String} form step (screen) id
		 * @return {Bool}
		 *
		 */
		completedById: completedById,

		/**
		 * Check if step is completed by index
		 *
		 * @param {Number} form step index
		 * @return {Bool}
		 *
		 */
		completedByIndex: completedByIndex,

		/**
		 * Resets form progress
		 *
		 */
		reset: resetForm,
		/**
		 * Check if form is copmlete
		 *
		 * @return {Boolean}
		 *
		 */
		formIsComplete: formIsComplete
	}
})

/**
 * @file History service manages the browser history state and responds to popstate events
 *
 */

BF.service('history', function(scope) {
	/** Set initial state  */

	scope.state = {
		initialized: false,
		navigatingByPopstate: false
	}

	/**
	 * Registers screen on page load
	 *
	 * @param {Object} data - active {Object} screen object, previous {Object} screenobject, reverse {Bool}
	 *
	 */
	function onScreenChange(data) {
		// if first screen change, reset history state
		if (!scope.state.initialized) {
			scope.state.initialized = true
			return history.replaceState({ id: data.active.id }, data.active.id, '')
		}

		// if normal screen transition push to history stack
		if (!scope.state.navigatingByPopstate) {
			history.pushState({ id: data.active.id }, null, null)
		}

		scope.state.initialized = true
		scope.state.navigatingByPopstate = false
	}

	/** Listen for events */

	window.addEventListener('popstate', function(e) {
		if (!e.state || !e.state.id) return
		scope.state.navigatingByPopstate = true
		BF.services.screens.changeScreen(e.state.id)
	})

	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChange)
})

/**
 * @file Screens Service
 * Manages screen navigation, transitions, and browser history
 *
 */

BF.service('screens', function(scope) {
	/** Set props  */
	scope.props = {
		transitionLength: 2000
	}

	/** Set initial state  */
	scope.state = {
		initialized: false,
		transitionInProgress: false,
		loadingDependency: false,
		activeScreenId: null,
		previousScreenId: null,
		screens: []
	}

	/**
	 * Chooses initial screen
	 *
	 */
	function init() {
		// Make sure screens have registered before proceeding. Fix for Firefox timing issue
		if (!scope.state.screens.length) {
			return setTimeout(function() {
				init()
			}, 50)
		}

		// go directly to results page if all steps are completed
		if (BF.services.form.allStepsCompleted()) {
			return initScreenChange(scope.state.screens[scope.state.screens.length - 1].id)
		}
		// else go to start screen
		initScreenChange(scope.state.screens[0].id)
	}

	/**
	 * Softly request a screen change. If screen is already completed it will show next unvisited screen
	 *
	 * @param {Number} requestedIndex - requested screen index
	 *
	 */

	function requestScreenChange(requestedIndex) {
		var nextCompletedStep = null
		var nextIncompleteStep = null
		var currentScreenIndex = screenIndex(scope.state.activeScreenId)
		var requestedScreen = scope.state.screens[requestedIndex]

		// if requested screen is the last one or greater, show last screen
		if (requestedIndex >= scope.state.screens.length - 1) {
			return initScreenChange(scope.state.screens[scope.state.screens.length - 1].id)
		}

		// if requested screen does not exist return
		if (!scope.state.screens[requestedIndex]) return

		// if requested screen is complete skip it
		if (BF.helpers.isFormScreen(requestedScreen) && screenIsComplete(requestedScreen.id)) {
			return requestScreenChange(requestedIndex + 1)
		}

		// check form completion

		for (var i = 0; i < scope.state.screens.length; i++) {
			// ignore screens that aren't forms
			if (!BF.helpers.isFormScreen(scope.state.screens[i])) continue

			// if theres an incomplete form screen before requested index, go to that screen
			if (i < requestedIndex && !screenIsComplete(scope.state.screens[i].id)) {
				return initScreenChange(scope.state.screens[i].id)
			}

			// take note of the next completed and incomplete steps
			if (i > requestedIndex && screenIsComplete(scope.state.screens[i].id)) {
				nextCompletedStep = nextCompletedStep === null ? i : nextCompletedStep
			} else if (!screenIsComplete(scope.state.screens[i].id)) {
				nextIncompleteStep = nextIncompleteStep === null ? i : nextIncompleteStep
			}
		}

		// if there's a priority screen (checkpoint) between current and requested screen, go to it

		var priorityScreen = null

		if (currentScreenIndex !== null) {
			for (var i = 0; i < requestedIndex; i++) {
				// if another screen of same type as priority screen is passed, clear priority screen
				if (priorityScreen && scope.state.screens[i].type == priorityScreen.type) {
					priorityScreen = null
				}

				// if there's a priority screen between current and requested screen, mark it as the priority screen
				if (
					scope.state.screens[i].hasPriority &&
					i > screenIndex(scope.state.activeScreenId)
				) {
					priorityScreen = scope.state.screens[i]
				}
			}

			// check to make sure there is an unanswered question between requested and priority screen before transitioning to it
			if (priorityScreen) {
				for (var i = screenIndex(priorityScreen.id); i <= requestedIndex; i++) {
					if (
						BF.helpers.isFormScreen(scope.state.screens[i]) &&
						!screenIsComplete(scope.state.screens[i].id)
					) {
						return initScreenChange(priorityScreen.id)
					}
				}
			}
		}

		// if requested screen is incomplete go to it
		if (BF.helpers.isFormScreen(requestedScreen) && !screenIsComplete(requestedScreen.id)) {
			return initScreenChange(requestedScreen.id)
		}

		// if all steps are completed
		if (nextIncompleteStep === null) {
			var lastFormScreenIndex = screenIndex(screensByType('form').pop().id)
			// if requesting a screen past the last form screen go to it, otherwise go to screen directly after last form screen
			return requestedIndex > lastFormScreenIndex
				? initScreenChange(requestedScreen.id)
				: requestScreenChange(lastFormScreenIndex + 1)
		}

		// if there's a future completed step, go to screen after it
		if (nextCompletedStep !== null) {
			return requestScreenChange(nextCompletedStep + 1)
		}

		// go to requested screen
		initScreenChange(requestedScreen.id)
	}

	/**
	 * Initializes the screen change process
	 *
	 * @param {String} id - the id of the screen it should transition to
	 *
	 */

	function initScreenChange(id) {
		if (
			!id ||
			scope.state.activeScreenId == id ||
			scope.state.transitionInProgress ||
			scope.state.loadingDependency
		)
			return

		var screen = screenById(id)

		// check for dependency

		if (!screen.dependency) {
			return changeScreen(id)
		}

		scope.state.loadingDependency = true
		scope.emit(BF.events.LOADING_SCREEN_DATA, screen.id)

		screen
			.dependency()
			.then(function(data) {
				scope.state.loadingDependency = false
				scope.emit(BF.events.SCREEN_DATA_LOADED, {
					id: screen.id,
					data: data
				})
				setTimeout(function() {
					changeScreen(screen.id)
				})
			})
			.catch(function(message) {
				alert(message)
				scope.state.loadingDependency = false
			})
	}

	/**
	 * Changes the screen
	 *
	 * @param {String} id - the id of the screen it should transition to
	 *
	 */

	function changeScreen(id) {
		var active, previous, data

		// update state

		scope.state.transitionInProgress = true
		scope.state.previousScreenId = scope.state.activeScreenId
		scope.state.activeScreenId = id

		active = screenById(scope.state.activeScreenId)
		previous = screenById(scope.state.previousScreenId)

		var data = {
			active: active,
			previous: previous,
			reverse: previous ? screenIndex(active.id) < screenIndex(previous.id) : false
		}

		// prepare transition

		scope.emit(BF.events.SCREEN_TRANSITION_START, data)

		// after repaint start the animation

		setTimeout(function() {
			window.requestAnimationFrame(function() {
				scope.emit(BF.events.SCREEN_TRANSITION_ACTIVE, data)

				// scroll to top of page inbetween enter / leave transitions

				setTimeout(function() {
					window.scrollTo(0, 0)
				}, 750)

				// end transition

				setTimeout(function() {
					scope.emit(BF.events.SCREEN_TRANSITION_END, data)
					scope.state.transitionInProgress = false

					// emit screen event

                    if (window.CustomEvent === undefined) return

                    // custom event for analytics
                    if(data.active.id === 'Results') {
                        const targetAttribute = getAttributeContainingText('[data-finder-results]', "FinderStep");
                        $('[data-finder-results]').data(targetAttribute, "results:" + $('[data-finder-result]').length.toString());
                    }
                    // end custom event for analytics

                    // custom event for legacy GTM analytics
					var legacyEvent = new CustomEvent('shoeFinderScreenChange', {
						bubbles: true,
						cancelable: true,
						detail: {
							previous: data.previous ? data.previous.id : null,
							active: data.active.id
						}
                    })
                    // end legacy custom event

                    // custom event to match generic event naming schema - same CustomEvent in brafinder, for br-analytics

					var event = new CustomEvent('finderScreenChange', {
						bubbles: true,
						cancelable: true,
						detail: {
							previous: data.previous ? data.previous.id : null,
							active: data.active.id
						}
					})
                    // end br-analytics custom event

                    var screen = window.document.querySelector(
						'[data-shoe-finder-step][data-id="' + data.active.id + '"]'
                    )

                    if(screen){
                        screen.dispatchEvent(event)
                    }

				}, scope.props.transitionLength)
			})
		}, 50)
    }

    /**
     * Gets key of attribute containing specified text
     * @parameter targetAttributeName - name of the target attribute
     * @returns {String} key name of attribute
     *
     */
    function getAttributeContainingText(targetElement, targetAttributeName) {
        let data = Object.keys($(targetElement).data()).filter(function(key){
            if (key.indexOf(targetAttributeName) > 0) {
                return true;
            }
        });
        if (data.length > 0) {
            return data[0];
        }
        return '';
    }

	/**
	 * Get a screen by id
	 *
	 * @param {String} id - screen id
	 * @returns {Object} Screen object
	 *
	 */

	function screenById(id) {
		return id
			? scope.state.screens.filter(function(item) {
					return item.id === id
			  })[0]
			: null
	}

	/**
	 * Get a screen's index by id
	 *
	 * @param {String} id - screen id
	 * @returns {Number} the screen index
	 *
	 */

	function screenIndex(id) {
		var index = null
		scope.state.screens.map(function(item, i) {
			if (item.id === id) {
				index = i
			}
		})
		return index
	}

	/**
	 * Get the screen index of the active screen
	 *
	 * @param {String} id - screen id
	 * @returns {Number} index of active screen
	 *
	 */

	function activeScreenIndex() {
		return screenIndex(scope.state.activeScreenId)
	}

	/**
	 * Get all screens of a certain type
	 *
	 * @param {String} type - the type of screen
	 * @returns {Array} Array of screens of the requested type
	 *
	 */

	function screensByType(type) {
		return scope.state.screens.filter(function(item) {
			return item.type === type
		})
	}

	/**
	 * Check if a screen is completed
	 *
	 * @param {String} id - screen id
	 * @returns {Bool} is screen completed
	 *
	 */

	function screenIsComplete(id) {
		return BF.services.form.completedById(id)
	}

	/**
	 * Get the relative screen index by id, meaning the difference in position in the registered screen array
	 *
	 * @param {String} id - screen id
	 * @returns {Number} relative index
	 *
	 */

	function relativeScreenIndex(id) {
		return screenIndex(scope.state.activeScreenId) - screenIndex(id)
	}

	/**
	 * Get a screen's index of all screens of a certain type
	 *
	 * @param {String} id - screen id
	 * @returns {Number} relative index
	 *
	 */

	function screenIndexByType(id, type) {
		if (!id) return 0

		var index = 0

		for (var i = 0; i < scope.state.screens.length; i++) {
			if (scope.state.screens[i].id === id) {
				break
			}

			if (scope.state.screens[i].type === type) {
				index++
			}
		}

		return index
	}

	/** Show first screen on page load */

	scope.init(function() {
		setTimeout(init, 100)
	})

	/** Service API */

	return {
		/**
		 * Registers screen on page load
		 *
		 * @param {Object} data
		 * @property {String} screen.id - unique id for the screen
		 * @property {String} screen.type (e.g form, checkpoint) - type of screen
		 * @property {Function} screen.dependency - function that returns a promise
		 * @property {Boolean} screen.hasPriority - if present, this screen will be visited if attempting to navigate to another screen after this screen but before another screen of this type
		 *
		 */
		registerScreen: function(data) {
			scope.state.screens.push({
				id: data.id,
				type: data.type,
				hasPriority: data.hasPriority,
				dependency:
					data.dependency && typeof data.dependency === 'function'
						? data.dependency
						: null
			})
		},
		/**
		 * Navigates to the next screen
		 *
		 */
		nextScreen: function() {
			// make sure form values have updated
			setTimeout(function() {
				scope.state.activeScreenId === null
					? requestScreenChange(0)
					: requestScreenChange(activeScreenIndex() + 1)
			})
		},
		/**
		 * Initializes the screen change process
		 *
		 * @param {String} id - the id of the screen it should transition to
		 *
		 */
		changeScreen: initScreenChange,
		/**
		 * Softly request a screen change. If screen is already completed it will show next unvisited screen
		 *
		 * @param {Number} requestedIndex - requested screen index
		 *
		 */
		requestScreenChange: requestScreenChange,
		/**
		 * Get active screen object
		 *
		 * @returns {Object} active screen object
		 *
		 */
		activeScreen: function() {
			return screenById(scope.state.activeScreenId)
		},
		/**
		 * Get active screen id
		 *
		 * @returns {String} screen id
		 *
		 */
		activeScreenId: function() {
			return scope.state.activeScreenId
		},
		/**
		 * Get previous screen id
		 *
		 * @returns {String} screen id
		 *
		 */
		previousScreenId: function() {
			return scope.state.previousScreenId
		},
		/**
		 * Get screens
		 *
		 * @returns {Array} screen objects
		 *
		 */
		screens: function() {
			return scope.state.screens
		},
		/**
		 * Get all screens of a certain type
		 *
		 * @param {String} type - the type of screen
		 * @returns {Array} Array of screens of the requested type
		 *
		 */
		screensByType: screensByType,
		/**
		 * Get the relative screen index by id, meaning the difference in position in the registered screen array
		 *
		 * @param {String} id - screen id
		 * @returns {Number} relative index
		 *
		 */
		relativeScreenIndex: relativeScreenIndex,
		/**
		 * Get a form screen's index
		 *
		 * @param {String} id - screen id
		 * @returns {Number} index
		 *
		 */
		formScreenIndexById: function(id) {
			return screenIndexByType(id, 'form')
		},
		/**
		 * Get a form screen's index by id
		 *
		 * @param {String} id - screen id
		 * @returns {Number} index
		 *
		 */
		screenIndexById: function(id) {
			return screenIndex(id)
		},
		/**
		 * Get the current form screen index
		 *
		 * @returns {Number} index
		 *
		 */
		activeFormScreenIndex: function() {
			return screenIndexByType(scope.state.activeScreenId, 'form')
		}
	}
})

/**
 * @file Scroll Service
 * Tracks user scroll position in a single location to reduce document event listeners, measures scroll bar width
 *
 */

BF.service('scroll', function(scope) {
	/** Set initial state  */

	scope.state = {
		scrollPosition: 0,
		scrollbarWidth: 0
	}

	/** Define elements */

	scope.els = {
		$scrollContainer: $(window)
	}

	/**
	 * Handle scroll event
	 *
	 */

	function handleScroll() {
		scope.state.scrollPosition = scope.els.$scrollContainer.scrollTop()
		scope.emit(BF.events.USER_SCROLL, { y: scope.state.scrollPosition })
	}

	/**
	 * Measures the browser's scrollbar width
	 *
	 * @returns {Number} pixel width of scroll bar
	 *
	 */

	function scrollbarWidth() {
		var outer = document.createElement('div')
		outer.style.visibility = 'hidden'
		outer.style.width = '100px'
		outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps

		document.body.appendChild(outer)

		var widthNoScroll = outer.offsetWidth
		// force scrollbars
		outer.style.overflow = 'scroll'

		// add innerdiv
		var inner = document.createElement('div')
		inner.style.width = '100%'
		outer.appendChild(inner)

		var widthWithScroll = inner.offsetWidth

		// remove divs
		outer.parentNode.removeChild(outer)

		return widthNoScroll - widthWithScroll
	}

	/** Listen for events */

	scope.els.$scrollContainer.on('scroll', function() {
		handleScroll()
	})

	/** Set initial values */

	setTimeout(function() {
		scope.state.scrollbarWidth = scrollbarWidth()
	}, 100)

	/** Service API */

	return {
		/**
		 * Get the browser's scrollbar width
		 *
		 * @returns {Number} pixel width of scrollbar
		 *
		 */
		scrollbarWidth: function() {
			return scope.state.scrollbarWidth
		},
		/**
		 * Get the scroll position
		 *
		 * @returns {Number} pixels from top of page
		 *
		 */
		position: function() {
			return scope.state.scrollPosition
		}
	}
})

/**
 * @file Window Service
 * Tracks window size in a single location to reduce window event listeners
 *
 */

BF.service('window', function(scope) {
	/** Set props  */
	scope.props = {
		resizeTimeoutDuration: 60,
		desktopWidth: 1024
	}

	/** Set initial state  */
	scope.state = {
		width: 0,
		height: 0
	}

	/**
	 * Respond to and throttle resize events
	 *
	 */

	var resizeTimeout

	function handleResize() {
		if (!resizeTimeout) {
			resizeTimeout = setTimeout(function() {
				resizeTimeout = null
				onResize()
			}, scope.props.resizeTimeoutDuration)
		}
	}

	/**
	 * After browser resize
	 *
	 */

	function onResize() {
		updateWindowSize()

		scope.emit(BF.events.WINDOW_RESIZE, {
			width: scope.state.width,
			height: scope.state.height
		})
	}

	/**
	 * Update window size state
	 *
	 */

	function updateWindowSize() {
		scope.state.width = isNaN(window.innerWidth) ? window.clientWidth : window.innerWidth
		scope.state.height = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight
	}

	/** Listen for events */

	window.addEventListener('resize', handleResize)

	/** Set initial values */

	setTimeout(function() {
		updateWindowSize()
	}, 100)

	/** Service API */

	return {
		/**
		 * Get the window width
		 *
		 * @returns {Number} pixels
		 *
		 */
		width: function() {
			return scope.state.width
		},
		/**
		 * Get the window height
		 *
		 * @returns {Number} pixels
		 *
		 */
		height: function() {
			return scope.state.height
		},
		/**
		 * Determine if window is desktop size
		 *
		 * @returns {Boolean}
		 *
		 */
		isDesktop: function() {
			return scope.state.width >= scope.props.desktopWidth
		}
	}
})

/**
 * @file Alert Component
 * Shows an alert modal
 *
 * @property data-bf-alert
 *
 */

BF.component('alert', function(scope, el) {
	/** Set props  */
	scope.props = {
		activeClass: 'bf-info-overlay--open'
	}

	/** Define referenced DOM elements  */
	scope.els = {
		content: el.querySelector('[data-content]'),
		button: el.querySelector('[data-button]')
	}

	/** Terminate if content element is not found  */
	if (!scope.els.content) {
		return scope.error('Content element not found')
	}

	/** Hide from screen readers */
	el.style.display = 'none'
	el.setAttribute('aria-hidden', 'true')

	/**
	 * Opens the alert component
	 *
	 * @param {String} templateId - the template id of the alert content
	 *
	 */
	function open(templateId) {
		// Find template
		var template = document.getElementById(templateId)

		// Terminate if template does not exist
		if (!template) {
			return scope.error('Info overlay content not found')
		}

		// Set and complile template content
		scope.els.content.innerHTML = template.innerHTML
		BF.compile(scope.els.content)

		// Listen for key events that should close the alert
		document.addEventListener('keydown', onKeydown)

		// Show to screen readers

		el.style.display = ''
		el.setAttribute('aria-hidden', 'false')

		// Delay show animation so it appears correctly in Firefox
		setTimeout(function() {
			window.requestAnimationFrame(function() {
				el.classList.add(scope.props.activeClass)
			})
        }, 50)

		// Focus the content
		setTimeout(function() {
			scope.els.content.focus()
        }, 250)
	}

	/**
	 * Closes the alert component
	 *
	 */
	function close() {
		window.requestAnimationFrame(function() {
			el.classList.remove(scope.props.activeClass)
		})

		document.removeEventListener('keydown', onKeydown)

		// hide from screen readers

		setTimeout(function() {
			el.style.display = 'none'
			el.setAttribute('aria-hidden', 'true')
		}, 500)
	}

	/**
	 * Keydown handler function
	 *
	 * @param {KeyboardEvent}
	 *
	 */
	function onKeydown(e) {
		if (e.key === 'Escape') {
			scope.emit(BF.events.CLOSE_ALERT)
		}
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_START, close)
	scope.on(BF.events.OPEN_ALERT, open)
	scope.on(BF.events.CLOSE_ALERT, close)
})

/**
 * @file Alert Link Component
 * Opens an alert modal
 *
 * @property data-bf-alert-link
 * @property data-template-id - content template id
 * @property data-input-id - the name of the input selected when opening the alert
 *
 */

BF.component('alert-link', function(scope, el) {
    const $el = $(el)
	/** Set props */
	scope.props = {
		selectedClass: 'active',
		templateId: el.getAttribute('data-template-id'),
        inputId: el.getAttribute('data-input-id'),
        analytics: {
            'data-event-action': $el.data('eventAction'),
            'data-event-label': $el.data('eventLabel'),
            'data-shoe-finder-answers': $el.data('shoeFinderAnswers'),
            'data-shoe-finder-step': $el.data('shoeFinderStep')
        }
	}

	/** Set state */
	scope.state = {
		active: false
	}

	/**
	 * Navigates to the next screen
	 *
	 */
	function openAlert() {
		scope.emit(BF.events.OPEN_ALERT, scope.props.templateId)
        scope.state.active = true
	}

	/**
	 * Add 'selected' class to element
	 *
	 */
	function select() {
		el.classList.add(scope.props.selectedClass)
	}

	/**
	 * Remove 'selected' class from element
	 *
	 */
	function deselect() {
		el.classList.remove(scope.props.selectedClass)
		scope.state.active = false
    }

    /**
	 * Sets analytics data on the alert button from the clicked element
	 *
	 */
	function setAnalytics() {
        const $alertBtn = $('[data-alert-btn]')
        $alertBtn.attr(scope.props.analytics)
	}

	/**
	 * On click function
	 *
	 */
	function onClick() {
		select()
        openAlert()
        setAnalytics() // analytics customization
	}

	/**
	 * On alert close
	 *
	 */
	function onClose() {
		if (!scope.state.active) return
		deselect()
		clearInput()
	}

	/**
	 * Clear associated input value
	 *
	 */
	function clearInput() {
		var inputEl = document.querySelector('input#' + scope.props.inputId)
		if (!inputEl) return
		inputEl.checked = false
		BF.services.form.updateFormValues()
	}

	/** Listen for events */
	scope.on(BF.events.CLOSE_ALERT, onClose)
	scope.on(BF.events.SCREEN_TRANSITION_END, deselect)

	el.addEventListener('click', onClick)
})

/**
 * @file Aria Progress Component
 * Exposes finder progress to screen readers
 *
 * @property data-bf-aria-progress
 *
 */

BF.component('aria-progress', function(scope, el) {
	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeEnd(data) {
		setNumberOfSteps()
		el.setAttribute('aria-valuenow', completedFormSteps())
	}

	/**
	 * Set the number of form steps
	 *
	 */
	function setNumberOfSteps() {
		el.setAttribute('aria-valuemax', numberOfFormSteps())
	}

	/**
	 * Get the number of completed form steps
	 *
	 */
	function completedFormSteps() {
		return BF.services.form.completedSteps().length
	}

	/**
	 * Get the number of form steps on the page
	 *
	 */
	function numberOfFormSteps() {
		return BF.services.screens.screensByType('form').length
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenChangeEnd)
})

/**
 * @file Behind the Science Link Component
 * Inserts behind the science link
 *
 * @property data-bf-behind-the-science-link
 * @property {String} data-template-id - template id
 * @property {String} data-screen-title - screen title string for analytics event
 *
 */

BF.component('behind-the-science-link', function(scope, el) {
	/** Terminate if template id is not currectly defined  */
	if (!document.getElementById('BehindTheScienceLink')) {
		return scope.error('Behind the science link template not found')
    }

	/** Set props  */
	scope.props = {
		template: document.getElementById('BehindTheScienceLink').innerHTML,
		templateId: el.getAttribute('data-template-id'),
		screenTitle: el.getAttribute('data-screen-title') || undefined,
        isBTScomponent: el.hasAttribute('data-bf-behind-the-science-link'),
        analyticsEventAction: el.getAttribute('data-event-action') || ''
    }

	/** Initialize  */
	scope.init(function() {
        const setDataAttr = (str, attr, value, condition = value) => condition
            ? str.replace(new RegExp(`(?<=data-${attr})`), `="${value}"`)
            : str;

            let template = scope.props.template;

            template = setDataAttr(template, 'template-id', scope.props.templateId);
            template = setDataAttr(template, 'screen-title', scope.props.screenTitle);
            template = setDataAttr(template, 'event-action', scope.props.analyticsEventAction, scope.props.isBTScomponent);

		template = $(template)[0]

		$(el).html(template)
		BF.compile(template)
	})
})

/**
 * @file Button
 * Adds keyboard event listeners to trigger click on spacebar and enter (neccessary for screen readers)
 *
 * @property data-bf-cbutton
 * @property data-prevent-default - if attribute is present event default will be prevented
 *
 */

BF.component('button', function(scope, el) {
	/** Define props */
	scope.props = {
		preventDefault: el.hasAttribute('data-prevent-default')
	}

	el.addEventListener('keypress', function(e) {
		if (e.keyCode == 32 || e.keyCode == 13) {
			el.click()
			scope.props.preventDefault && e.preventDefault()
		}
	})
})

/**
 * @file Carousel Component
 * A simple image carousel using JQuery Slick
 *
 * @property data-bf-carousel
 * @property data-items - place on item container element
 * @property data-thumbnails - place on thumbnail container element
 *
 */

BF.component('carousel', function(scope, el) {
	/** Set props  */
	scope.props = {
		selectedThumbnailClass: 'selected'
	}

	/** Set state  */
	scope.state = {
		initiated: false
	}

	/** Define referenced DOM elements  */
	scope.els = {
		container: el.querySelector('[data-items]'),
		thumbnailContainer: el.querySelector('[data-thumbnails]')
	}

	/**
	 * Initialize the carousel carousel
	 *
	 */
	function initCarousel() {
		if (scope.state.initiated) return

		scope.state.initiated = true

		// copy items to thumbnails

		scope.els.thumbnailContainer.innerHTML = scope.els.container.innerHTML

		$(scope.els.container).slick({
			dots: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: false
		})

		// Make thumbnails clickable

		thumbnails().each(function() {
			this.addEventListener('click', function() {
				$(scope.els.container).slick('slickGoTo', $(this).index())
			})
		})

		// add active class to thumbnails

		$(scope.els.container).on('beforeChange', function(evt, slick, currentIndex, nextIndex) {
			thumbnails().removeClass(scope.props.selectedThumbnailClass)
			thumbnails()[nextIndex].classList.add(scope.props.selectedThumbnailClass)
		})

		// add border to first item

		// add border to first item
		if(thumbnails().length)
		{
			thumbnails()[0].classList.add(scope.props.selectedThumbnailClass)
		}else{
			console.log("No thumbnails found...");
		}
	}

	/**
	 * Get thumbnail elements
	 *
	 */
	function thumbnails() {
		return $(scope.els.thumbnailContainer).children()
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, initCarousel)
	scope.on(BF.events.SCREEN_TRANSITION_END, function() {
		$(scope.els.container).slick('setPosition')
	})
})

/**
 * @file Change Screen Link Component
 * Change the screen on click
 *
 * @property data-bf-change-screen-link
 * @property data-id - screen id to navigate to
 *
 */

BF.component('change-screen-link', function(scope, el) {
	/** Set props  */
	scope.props = {
		id: el.getAttribute('data-id')
	}

	if (!scope.props.id) return scope.error('Screen Id not specified')

	/**
	 * Emits change screen event
	 *
	 */
	function changeScreen(e) {
		e.preventDefault()
		BF.services.screens.changeScreen(scope.props.id)
	}

	/** Listen for events */
	el.addEventListener('click', changeScreen)
})

/**
 * @file Checkpoint Header Component
 * Shows the overall progress on checkpoint screens
 *
 * @property data-bf-checkpoint-header
 * @property data-bar - place this attribute on the 'progress bar' element
 *
 */

BF.component('checkpoint-header', function(scope, el) {
	/** Set props  */
	scope.props = {
		activeClass: 'bf-checkpoint-header--active',
		barTimeout: 500 // delay bar animation so it shows after screen transition is complete
	}

	/** Define referenced DOM elements  */
	scope.els = {
		bar: el.querySelector('[data-bar]')
	}

	/**
	 * Update the progress bar width
	 *
	 */
	function updateBar() {
		setTimeout(function() {
			$(scope.els.bar).css(
				BF.helpers.prefixedCssObject({
					transform: 'scaleX(' + activeFormStep() / numberOfFormSteps() + ')'
				})
			)
		}, scope.props.barTimeout)
	}

	/**
	 * Screen change start event callback
	 *
	 * @param {Object} screen
	 * @property {String} screen.id - unique id for the screen
	 * @property {String} screen.type (e.g form, checkpoint) - type of screen
	 * @property {Function} screen.dependency - function that returns a promise
	 *
	 */
	function onScreenChangeStart(data) {
		// if its a checkpoint screen reset bar to 0
		if (data.active.type === 'checkpoint') {
			$(scope.els.bar).css(
				BF.helpers.prefixedCssObject({
					transform: 'scaleX(0)'
				})
			)
		}
	}

	/**
	 * Screen change active event callback
	 *
	 * @param {Object} screen
	 * @property {String} screen.id - unique id for the screen
	 * @property {String} screen.type (e.g form, checkpoint) - type of screen
	 * @property {Function} screen.dependency - function that returns a promise
	 *
	 */
	function onScreenChangeActive(data) {
		// if its a checkpoint screen show the header and update progress bar
		if (data.active.type === 'checkpoint') {
			el.classList.add(scope.props.activeClass)
			updateBar()
			return
		}
		// if its not a checkpint hide the header
		el.classList.remove(scope.props.activeClass)
	}

	/**
	 * Get the active form step
	 *
	 */
	function activeFormStep() {
		return BF.services.screens.formScreenIndexById(BF.services.screens.activeScreenId())
	}

	/**
	 * Get the number of form steps on the page
	 *
	 */
	function numberOfFormSteps() {
		return BF.services.screens.screensByType('form').length
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChangeStart)
})

/**
 * @file Shoe Finder City / Trail SVG Component
 * Dynamic svg component specific to the shoe finder
 *
 * @property data-bf-city-trail
 * @property data-image-container - place this attribute on the image container element
 * @property {String} data-url - the url of the svg file
 * @property {String} data-terrain-input-name - the name of the form input
 * @property {String} data-trail-input-value - the value of trail
 * @property {String} data-road-input-value - the value of road
 *
 */

BF.component('city-trail', function(scope, el) {
	/* Add easing function to jquery */

	$.easing.easeInOutCubic = function(x, t, b, c, d) {
		if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b
		return (c / 2) * ((t -= 2) * t * t + 2) + b
	}

	/** Set props  */
	scope.props = {
		loadedClass: 'bf-city-trail--loaded',
		enteringClass: 'bf-city-trail--enter',
		enterActiveClass: 'bf-city-trail--enter-active',
		leavingClass: 'bf-city-trail--leave',
		leaveActiveClass: 'bf-city-trail--leave-active',
		leaveActiveReverseClass: 'bf-city-trail--leave-active-reverse',
		activeClass: 'bf-city-trail--active',
		svgUrl: el.getAttribute('data-url'),
		animationDuration: 500,
		animationEasing: 'easeInOutCubic',
		terrainInputName: el.getAttribute('data-terrain-input-name') || 'surface',
		trailInputValue: el.getAttribute('data-trail-input-value') || 'trail',
		roadInputValue: el.getAttribute('data-road-input-value') || 'road',
		imageAspectRatio: 1.54
	}

	/** Set initial State  */
	scope.state = {
		loaded: false
	}

	/** Define referenced DOM elements  */
	scope.els = {
		wrap: el.querySelector('.bf-city-trail__image-wrap'),
		container: el.querySelector('[data-image-container]'),
		mileageScreen: document.querySelector('[data-bf-screen][data-id="Mileage"]'),
		appContainer: document.querySelector('[data-bf-app]'),
		cityMask: null,
		trailMask: null,
		line: null
	}

	/** Terminate if svg url is not defined  */
	if (!scope.props.svgUrl) {
		return scope.error('SVG url not defined')
	}

	/**
	 * Find SVG Mask Elements
	 *
	 */
	function findMaskElements() {
		scope.els.cityMask = $(scope.els.container.querySelector('#CityMask rect'))
		scope.els.trailMask = $(scope.els.container.querySelector('#TrailMask rect'))
		scope.els.line = $(scope.els.container.querySelector('#Line line'))
	}

	/**
	 * Load the svg image
	 *
	 */
	function loadImage() {
		$.get(scope.props.svgUrl, function(doc) {
			var svg

			if (typeof doc === 'object' && typeof doc.querySelector === 'function') {
				svg = doc.querySelector('svg')
			} else {
				svg = $(doc).find('svg')[0]
			}

			if (svg !== undefined) {
				// append svg to DOM
				scope.els.container.appendChild(svg)
				// set loaded flag to true
				scope.state.loaded = true
				// add loaded class to element
				el.classList.add(scope.props.loadedClass)
				// update the active city / trail class
				setTimeout(function() {
					findMaskElements()
					updateActiveSide()
					sizeImage()
				})
			}
		}).fail(function() {
			scope.error('Failed to load image')
		})
	}

	/**
	 * The screen change has started
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeStart(data) {
		// reset city/trail selection when visiting terrain screen
		data.active.id == 'Terrain' && scope.state.loaded && showNeutral()

		// if screen is becoming active
		if (isActiveScreen(data.active) && !isActiveScreen(data.previous)) {
			el.classList.add(scope.props.enteringClass)
			return
		}

		// if screen was active
		if (!isActiveScreen(data.active) && isActiveScreen(data.previous)) {
			el.classList.remove(scope.props.activeClass)
			el.classList.add(scope.props.leavingClass)
		}
	}

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChange(data) {
		$(el).removeClass([scope.props.enteringClass, scope.props.leavingClass].join(' '))

		// if screen is becoming active
		if (isActiveScreen(data.active) && !isActiveScreen(data.previous)) {
			el.classList.add(scope.props.enterActiveClass, scope.props.activeClass)
			return
		}

		// if screen was active
		if (!isActiveScreen(data.active) && isActiveScreen(data.previous)) {
			data.reverse
				? el.classList.add(scope.props.leaveActiveReverseClass)
				: el.classList.add(scope.props.leaveActiveClass)
		}
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeEnd(data) {
		$(el).removeClass(
			[
				scope.props.activeClass,
				scope.props.enterActiveClass,
				scope.props.leaveActiveClass,
				scope.props.leaveActiveReverseClass
			].join(' ')
		)

		isActiveScreen(data.active) && el.classList.add(scope.props.activeClass)
	}

	/**
	 * Update the active class to show selected side (trail or city)
	 *
	 */
	function updateActiveSide() {
		if (!scope.state.loaded || !scope.els.cityMask || !scope.els.trailMask || !scope.els.line)
			return

		var input = BF.services.form.formValues().filter(function(item) {
			return item.name == scope.props.terrainInputName
		})

		if (input.length && input[0].value === scope.props.roadInputValue) {
			return showCity()
		}

		if (input.length && input[0].value === scope.props.trailInputValue) {
			return showTrail()
		}

		showNeutral()
	}

	/**
	 * Show Trail
	 *
	 */
	function showTrail() {
		// animate city mask to -100%
		$({ x: scope.els.cityMask.attr('x') }).animate(
			{ x: scope.els.cityMask.attr('width') * -1 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.cityMask.attr('x', x)
				}
			}
		)

		// animate trail mask to 0
		$({ x: scope.els.trailMask.attr('x') }).animate(
			{ x: 0 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.trailMask.attr('x', x)
				}
			}
		)

		// animate line to left side
		$({ x: scope.els.line.attr('x1') }).animate(
			{
				x: 0
			},
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.line.attr('x1', x)
					scope.els.line.attr('x2', x)
				}
			}
		)

		// animate line opacity
		scope.els.line.animate(
			{
				opacity: 0
			},
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing
			}
		)
	}

	/**
	 * Show City
	 *
	 */
	function showCity() {
		// animate city mask to 0%
		$({ x: scope.els.cityMask.attr('x') }).animate(
			{ x: 0 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.cityMask.attr('x', x)
				}
			}
		)

		// animate trail mask to 100%
		$({ x: scope.els.trailMask.attr('x') }).animate(
			{ x: scope.els.trailMask.attr('width') },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.trailMask.attr('x', x)
				}
			}
		)

		// animate line to right side
		$({ x: scope.els.line.attr('x1') }).animate(
			{
				x: scope.els.trailMask.attr('width')
			},
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.line.attr('x1', x)
					scope.els.line.attr('x2', x)
				}
			}
		)

		// animate line opacity
		scope.els.line.animate(
			{
				opacity: 0
			},
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing
			}
		)
	}

	/**
	 * Show Neutral
	 *
	 */
	function showNeutral() {
		// animate city mask to -50%
		$({ x: scope.els.cityMask.attr('x') }).animate(
			{ x: scope.els.cityMask.attr('width') / -2 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.cityMask.attr('x', x)
				}
			}
		)

		// animate trail mask to 50%
		$({ x: scope.els.trailMask.attr('x') }).animate(
			{ x: scope.els.trailMask.attr('width') / 2 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.trailMask.attr('x', x)
				}
			}
		)

		// animate line to middle
		$({ x: scope.els.line.attr('x1') }).animate(
			{ x: scope.els.trailMask.attr('width') / 2 },
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing,
				step: function(x) {
					scope.els.line.attr('x1', x)
					scope.els.line.attr('x2', x)
				}
			}
		)

		// animate line opacity
		scope.els.line.animate(
			{
				opacity: 1
			},
			{
				duration: scope.props.animationDuration,
				easing: scope.props.animationEasing
			}
		)
	}

	/**
	 * Determine if city / trail image should be visible
	 *
	 */
	function isActiveScreen(screen) {
		return screen ? ['Terrain', 'Mileage'].indexOf(screen.id) > -1 : false
	}

	/**
	 * Set image size
	 *
	 * Size the image to match the available space on the Distance screen
	 *
	 */
	function sizeImage() {
		if (!scope.state.loaded || !scope.els.mileageScreen || !scope.els.appContainer) {
			return
		}

		// create element clone so dimensions can be measured

		var tempEl = $(
			'<div style="position:absolute; width: 100%; height: 100%; overflow: hidden"></div>'
		)

		var finderHeight = $(window).height() - $(scope.els.appContainer).offset().top

		tempEl.append(
			$(scope.els.mileageScreen)
				.clone()
				.css({
					visibility: 'hidden',
					display: 'flex',
					height: finderHeight + 'px'
				})
		)

		scope.els.appContainer.appendChild(tempEl[0])

		var contentContainer = tempEl.find('.bf-screen__main')

		// get dimensions

		var height = contentContainer.height()
		var width = contentContainer.width()
		var offset = contentContainer.offset().top - $(scope.els.appContainer).offset().top
		var containerAspectRatio = width / height
		var imageAspectRatio = scope.props.imageAspectRatio

		// set wrapping element size and position
		$(scope.els.wrap).css({
			height: height + 'px',
			top: offset + 'px'
		})

		// set image size
		$(scope.els.container).css({
			width:
				containerAspectRatio >= imageAspectRatio
					? height * imageAspectRatio + 'px'
					: width + 'px',
			height:
				containerAspectRatio >= imageAspectRatio
					? height + 'px'
					: width / imageAspectRatio + 'px'
		})

		el.style.minHeight = height * 1.1 + offset + 'px'

		tempEl.remove()
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChangeStart)
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChange)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenChangeEnd)
	scope.on(BF.events.SET_FORM_VALUES, updateActiveSide)
	scope.on(BF.events.WINDOW_RESIZE, sizeImage)

	/** Start loading the image **/
	loadImage()
})

/**
 * @file Clear Form Value on Click Component
 *
 * Clears a specific input
 * @property {String} data-bf-clear-form-value-on-click - input name to clear
 *
 */

BF.component('clear-form-value-on-click', function(scope, el) {
	/** Set props  */
	scope.props = {
		propertyName: el.getAttribute('data-bf-clear-form-value-on-click')
	}

	/** Terminate if input name is not specified  */
	if (!scope.props.propertyName) return scope.error('Property name not specified')

	/**
	 * Clear specified form input on click
	 *
	 */
	function onClick() {
		var inputs = document.querySelectorAll('input[name="' + scope.props.propertyName + '"]')

		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].type == 'select' || inputs[i].type == 'text') {
				inputs[i].value = ''
				return
			}
			inputs[i].checked = false
		}
		// tell forms service to update values
		setTimeout(function() {
			BF.services.form.updateFormValues()
		})
	}

	/** Listen for events */
	el.addEventListener('click', onClick)
})

/**
 * @file Click Element Component
 * Click another element when this element is clicked
 *
 * @property data-bf-click-element
 *
 */

BF.component('click-element', function(scope, el) {
	scope.props = {
		elementSelector: el.getAttribute('data-bf-click-element')
	}

	if (!scope.props.elementSelector) return scope.error('Element Id not defined')

	scope.els = {
		element: document.querySelector(scope.props.elementSelector)
	}

	if (!scope.props.element) {
		return scope.error('Element not found')
	}

	el.addEventListener('click', function(e) {
		scope.props.element.click()
	})
})

/**
 * @file Close Alert Link Component
 * Closes the alert modal on click
 *
 * @property data-bf-close-alert-link
 *
 */

BF.component('close-alert-link', function(scope, el) {
	el.addEventListener('click', function(e) {
		e.preventDefault()
		scope.emit(BF.events.CLOSE_ALERT)
	})
})

/**
 * @file Close Info Overlay Component
 * Closes the info overlay modal on click
 *
 * @property data-bf-close-info-overlay-link
 *
 */

BF.component('close-info-overlay-link', function(scope, el) {
	el.addEventListener('click', function(e) {
		e.preventDefault()
		scope.emit(BF.events.CLOSE_INFO_OVERLAY)
	})
})

/**
 * @file Close Progress Component
 * Hides the progress nav on click
 *
 * @property data-bf-close-progress-link
 *
 */

BF.component('close-progress-link', function(scope, el) {
	el.addEventListener('click', function(e) {
		e.stopPropagation()
		e.preventDefault()
		scope.emit(BF.events.CLOSE_PROGRESS_MENU)
	})
})

/**
 * @file Collapsable Component
 * Adds/removes an 'open' class on click

 * data-bf-collapsable
 *
 */

BF.component('collapsable', function(scope, el) {
	/** Set props */
	scope.props = {
		openClass: 'open'
	}

	/**
	 * Toggle active class
	 *
	 */
	function onClick() {
		el.classList.contains(scope.props.openClass)
			? el.classList.remove(scope.props.openClass)
			: el.classList.add(scope.props.openClass)
	}

	/** Listen for events */
	el.addEventListener('click', onClick)
})

/**
 * @file Document Component
 * Manages styles on the document
 *
 * @property data-bf-document
 *
 */

BF.component('document', function(scope, el) {
	/**
	 * Hide overflow content
	 *
	 */
	function hideOverflow() {
		document.body.style.overflow = 'hidden'
	}

	/**
	 * Show overflow content
	 *
	 */
	function showOverflow() {
		document.body.style.overflow = ''
	}

	/** Listen for events */
	scope.on(BF.events.OPEN_INFO_OVERLAY, hideOverflow)
	scope.on(BF.events.CLOSE_INFO_OVERLAY, showOverflow)
})

/**
 * @file Dynamic Template Container
 * Shows screen dependency content (content that loads dynamically before changing to a screen)
 *
 * @property data-bf-dynamic-template-container
 * @param {String} data-screen-id - the screen id with template data dependency
 *
 */

BF.component('dynamic-template-container', function(scope, el) {
	/** Set props  */
	scope.props = {
		id: el.getAttribute('data-screen-id')
	}

	/**
	 * Screen dependency has finished loading
	 *
	 * @param {Object} data
	 * @property {String} data.id - screen id that was loaded
	 * @property {Any} data.data - data returned from the server
	 *
	 */
	function onScreenDataLoaded(data) {
		data.id === scope.props.id && insertContent(data.data)
	}

	/**
	 * Insert loaded template content
	 *
	 * @param {String} html
	 *
	 */
	function insertContent(html) {
		el.innerHTML = '<div>' + html + '</div>'
		setTimeout(function() {
			BF.compile(el.childNodes[0])
		})
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_DATA_LOADED, onScreenDataLoaded)
})

/**
 * @file Form Step Component
 * Registers required fields on a screen to forms service
 *
 * @property data-bf-form-step - must be placed on screen component
 * @property {String} data-id - screen id
 *
 */

BF.component('form-step', function(scope, el) {
	/** Set props */
	scope.props = {
		screenId: el.getAttribute('data-id')
	}

	/** Define referenced DOM elements  */
	scope.els = {
		inputs: $(el).find('input')
	}

	/**
	 * Register the form step
	 *
	 */
	function register() {
		var requiredFields = []

		// find required fields
		scope.els.inputs.each(function() {
			if (this.hasAttribute('required') && requiredFields.indexOf(this.name) === -1)
				requiredFields.push(this.name)
		})

		// emit registration event
		BF.services.form.registerFormStep({
			id: scope.props.screenId,
			requiredFields: requiredFields
		})
	}

	/** Initialize */

	scope.init(function() {
		register()
	})
})

/**
 * @file Analytics Click Event
 * Submits an analytics event on click
 *
 * @property {String} data-bf-gtm-click-event - the event name
 *
 * NOTE: ALL ANALYTICS COMPONENTS ARE NOW DISABLED
 *
 */

BF.component('gtm-click-event', function(scope, el) {
	// el.addEventListener('click', function() {
	// 	// timeout ensures form values have been updated
	// 	setTimeout(function() {
	// 		BF.services.analytics.event(el.getAttribute('data-bf-gtm-click-event'), el)
	// 	}, 50)
	// })
})

/**
 * @file GTM Event
 * Submits an analytics event when component is compiled
 *
 * @property {String} data-bf-gtm-event - the event name
 *
 * NOTE: ALL ANALYTICS COMPONENTS ARE NOW DISABLED
 *
 */

BF.component('gtm-event', function(scope, el) {
	// scope.init(function() {
	// 	BF.services.analytics.event(el.getAttribute('data-bf-gtm-event'), el)
	// })
})

/**
 * @file Analytics Screen Event
 * Submits an analytics event when screen is active
 *
 * @property {String} data-bf-gtm-screen-active-event - the event id
 * @property {String} data-id - screen id
 *
 * NOTE: ALL ANALYTICS COMPONENTS ARE NOW DISABLED
 *
 */

BF.component('gtm-screen-active-event', function(scope, el) {
	// scope.props = {
	// 	id: el.getAttribute('data-id')
	// }
	// if (!scope.props.id) return scope.error('Screen Id is required')
	// scope.on(BF.events.SCREEN_TRANSITION_END, function(data) {
	// 	data.active.id === scope.props.id &&
	// 		BF.services.analytics.event(el.getAttribute('data-bf-gtm-screen-active-event'), el)
	// })
})

/**
 * @file Analytics User Response
 * Sets the data-analytics-user-response attribute to an inputs current value
 *
 * @property {String} data-bf-analytics-user-response - the name of the input you want to track
 *
 */
BF.component('analytics-user-response', function(scope, el) {
	if (!el.getAttribute('data-bf-analytics-user-response'))
		return scope.error('data-bf-analytics-user-response is required, and must be a valid input name')

	/** Set props  */
	scope.props = {
		inputName: el.getAttribute('data-bf-analytics-user-response')
	}
	/**
	 * Update data attribute when form values update
	 *
	 */
	function onSetFormValues() {

        el.setAttribute(
			'data-event-label',
			BF.services.form.inputValuePipeString(scope.props.inputName)
        )

        el.setAttribute(
			'data-shoe-finder-answers',
			BF.services.form.inputValuePipeString(scope.props.inputName)
        )
	}

	function onClick() {
		setTimeout(function() {
			console.log(el.getAttribute('data-shoe-finder-answers'))
		})
	}

	el.addEventListener('click', onClick.bind(this))

	/** Initialize  */
	scope.init(function() {
		onSetFormValues()
		scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)
	})
})

/**
 * @file Header Component
 * Manages styles for the shoe finder header
 *
 * @property data-bf-alert-link
 *
 */

BF.component('header', function(scope, el) {
	/** Set props */
	scope.props = {
		progressOpenClass: 'bf-header--progress-open',
		progressActiveClass: 'bf-header--progress-active',
		closeProgressTimeoutLength: 1000
	}

	/** Component state */

	scope.state = {
		closeTimeoutHandler: null
	}

	/**
	 * Add progress open class when progress touch menu is open
	 *
	 */
	function onProgressOpen() {
		el.classList.add(scope.props.progressOpenClass)
	}

	/**
	 * Remove progress open class when progress touch menu is closed
	 *
	 */
	function onProgressClose() {
		el.classList.remove(scope.props.progressOpenClass)
		//BF.helpers.isFormScreen(data.active) ? activateProgress() : deactivateProgress()
	}

	/**
	 * Respond to screen changes
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeStart(data) {
		clearTimeout(scope.state.closeTimeoutHandler)
		el.removeEventListener('mouseenter', onMouseenter)
		el.removeEventListener('mouseleave', onMouseleave)
	}

	/**
	 * Respond to screen changes
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeActive(data) {
		BF.helpers.isFormScreen(data.active) ? activateProgress() : deactivateProgress()
	}

	/**
	 * Add active class when progress nav is visible
	 *
	 */
	function activateProgress() {
		el.classList.add(scope.props.progressActiveClass)
	}

	/**
	 * Remove active class when progress nav is hidden
	 *
	 */
	function deactivateProgress() {
		el.classList.remove(scope.props.progressActiveClass)
	}

	/**
	 * On show progress menu event, hide on mouseleave
	 *
	 */
	function onShowProgressMenu() {
		activateProgress()
		el.addEventListener('mouseenter', onMouseenter)
		el.addEventListener('mouseleave', onMouseleave)
	}

	/**
	 * On hide progress menu event
	 *
	 */
	function onHideProgressMenu() {
		deactivateProgress()
		el.removeEventListener('mouseenter', onMouseenter)
		el.removeEventListener('mouseleave', onMouseleave)
	}

	/**
	 * On mouseleave event
	 *
	 */
	function onMouseleave() {
		scope.state.closeTimeoutHandler = setTimeout(function() {
			scope.emit(BF.events.HIDE_PROGRESS_MENU)
			el.removeEventListener('mouseenter', onMouseenter)
			el.removeEventListener('mouseleave', onMouseleave)
		}, scope.props.closeProgressTimeoutLength)
	}

	/**
	 * On mouseenter
	 *
	 */
	function onMouseenter() {
		clearTimeout(scope.state.closeTimeoutHandler)
	}

	/** Listen for events */
	scope.on(BF.events.OPEN_PROGRESS_MENU, onProgressOpen)
	scope.on(BF.events.CLOSE_PROGRESS_MENU, onProgressClose)
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChangeStart)
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)
	scope.on(BF.events.SHOW_PROGRESS_MENU, onShowProgressMenu)
	scope.on(BF.events.HIDE_PROGRESS_MENU, onHideProgressMenu)
})

/**
 * @file Hide On Form Complete Component
 * Hides element if all form questions have been answered
 *
 * @property data-bf-hide-on-form-complete
 *
 */

BF.component('hide-on-form-complete', function(scope, el) {
	/** Set props  */
	scope.props = {
		pageLoadTime: 2000,
		changeLength: 1000
	}

	/** Set initial State  */
	scope.state = {
		pageLoaded: false
	}

	/**
	 * Show the element
	 *
	 */
	function show() {
		setTimeout(function() {
			el.removeAttribute('style')
			el.setAttribute('aria-hidden', 'false')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Hide the element
	 *
	 */
	function hide() {
		setTimeout(function() {
			el.style.display = 'none'
			el.setAttribute('aria-hidden', 'true')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * When form values are updated
	 *
	 * @param {Array} values
	 * @property {String} values.name - name of input
	 * @property {String} values.value - value of input
	 *
	 */
	function onSetFormValues(values) {
		// add timeout to fix Firefox timing bug
		setTimeout(function() {
			BF.services.form.formIsComplete() ? hide() : show()
		})
	}

	/** Listen for events */
	scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)

	setTimeout(function() {
		scope.state.pageLoaded = true
	}, scope.props.pageLoadTime)
})

/**
 * @file Hide on form progress
 * Hide an element if user has completed any form step
 *
 * @property data-bf-hide-on-form-progress
 *
 */

BF.component('hide-on-form-progress', function(scope, el) {
	/** Set props  */
	scope.props = {
		pageLoadTime: 2000,
		changeLength: 1000
	}

	/** Set initial State  */
	scope.state = {
		pageLoaded: false
	}

	/**
	 * Show the element
	 *
	 */
	function show() {
		// set timeout so it doesnt immediately show during transitions
		setTimeout(function() {
			el.removeAttribute('style')
			el.setAttribute('aria-hidden', 'false')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Hide the element
	 *
	 */
	function hide() {
		// set timeout so it doesnt immediately hide during transitions
		setTimeout(function() {
			el.style.display = 'none'
			el.setAttribute('aria-hidden', 'true')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Update visiblity
	 *

	 */
	function update() {
		var hasProgress = BF.services.form.completedSteps().length

		hasProgress ? hide() : show()
	}

	/** Listen for events */
	scope.on(BF.events.SET_FORM_VALUES, function() {
		setTimeout(update)
	})

	setTimeout(function() {
		scope.state.pageLoaded = true
	}, scope.props.pageLoadTime)
})

/**
 * @file Image Component
 * Adds a loaded class when image is loaded
 *
 * @property data-bf-image - must be an <img> element
 *
 */

BF.component('image', function(scope, el) {
	/**
	 * Add class on load
	 *
	 */
	function onLoad() {
		el.classList.add('loaded')
	}

	/**
	 * Check if image is loaded
	 *
	 */
	function imageLoaded() {
		return el.complete && el.naturalHeight !== 0
	}

	/** Initialize */
	imageLoaded() ? onLoad() : el.addEventListener('load', onLoad.bind(this))
})

/**
 * @file Initialize footer navigation
 * Inits footer navigation after shoe finder results load.
 */
BF.component('init-footer-navigation', function(scope, el) {
	if (BF.services.window.isDesktop()) {
        var elements = $('details.collapse-mobile-only');
	    elements.attr('open', true);
    }
});

/**
 * @file Info Overlay Component
 * Shows an info modal
 *
 * @property data-bf-info-overlay
 * @property data-content - place on content container
 *
 */

BF.component('info-overlay', function(scope, el) {
	/** Set props */
	scope.props = {
		activeClass: 'bf-info-overlay--open'
	}

	/** Define referenced DOM elements  */
	scope.els = {
		content: el.querySelector('[data-content]')
	}

	/** Terminate if content element is not found  */
	if (!scope.els.content) {
		return scope.error('Content element not found')
	}

	/** Hide from screen readers */
	el.style.display = 'none'

	/**
	 * Opens the info overlay component
	 *
	 * @param {String} templateId - the id of the info content template
	 *
	 */
	function open(templateId) {
		// Find template
		var template = document.getElementById(templateId)

		// Terminate if template does not exist
		if (!template) {
			return scope.error('Info overlay template not found')
		}

		// Set and complile template content
		scope.els.content.innerHTML = template.innerHTML
		BF.compile(scope.els.content)

		// Show content
		window.requestAnimationFrame(function() {
			el.classList.add(scope.props.activeClass)
		})

		// Listen for key events that should close the alert
		document.addEventListener('keydown', onKeydown)

		// Show to screen readers

		el.style.display = ''

		// Focus the content
		setTimeout(function() {
			scope.els.content.focus()
		}, 250)
	}

	/**
	 * Closes the info overlay component
	 *
	 */
	function close() {
		window.requestAnimationFrame(function() {
			el.classList.remove(scope.props.activeClass)
		})

		document.removeEventListener('keydown', onKeydown)

		// hide from screen readers

		setTimeout(function() {
			el.style.display = 'none'
		}, 500)
	}

	/**
	 * Keydown handler function
	 *
	 * @param {KeyboardEvent}
	 *
	 */
	function onKeydown(e) {
		if (e.key === 'Escape') {
			scope.emit(BF.events.CLOSE_INFO_OVERLAY)
		}
	}

	/** Listen for events */
	scope.on(BF.events.OPEN_INFO_OVERLAY, open)
	scope.on(BF.events.CLOSE_INFO_OVERLAY, close)
})

/**
 * @file Info Overlay Link Component
 * Opens info overlay on click
 *
 * @property data-bf-info-overlay-link
 * @property data-template-id - info overlay content template id
 *
 */

BF.component('info-overlay-link', function(scope, el) {
	/** Set props  */
	scope.props = {
		templateId: el.getAttribute('data-template-id')
	}

	/** Set state */
	scope.state = {
		open: false
	}

	/**
	 * Keydown handler function
	 *
	 * @param {ClickEvent}
	 *
	 */
	function onClick(e) {
		e.preventDefault()
		open()
	}

	/**
	 * Open the info overlay
	 *
	 */
	function open() {
		scope.state.open = true
		scope.emit(BF.events.OPEN_INFO_OVERLAY, scope.props.templateId)
	}

	/**
	 * Info overlay was closed
	 *
	 */
	function close() {
		if (!scope.state.open) return
		scope.state.open = false
		// focus link for screen readers
		el.focus()
	}

	/** Listen for events */
	el.addEventListener('click', onClick)
	scope.on(BF.events.CLOSE_INFO_OVERLAY, close)
})

/**
 * @file Injuries Component
 * Injury inputs on the shoe finder
 *
 * @property data-bf-injuries
 * @property {String} data-injury-input-name - the name of the form input
 * @property {String} data-no-injuries-value - the input value when no injuries are seleted
 * @property data-no-injuries-button - place attribute on 'no injuries' button
 * @property data-continue-button - place attribute on 'continue' button
 * @property data-injury-option - place attribute on injury input labels
 *
 */

BF.component('injuries', function(scope, el) {
	/** Set props  */
	scope.props = {
		injuryInputName: el.getAttribute('data-injury-input-name'),
		noInjuriesValue: el.getAttribute('data-no-injuries-value')
	}

	/** Define referenced DOM elements  */
	scope.els = {
		noInjuriesButton: el.querySelector('[data-no-injuries-button]'),
		noInjuriesInput: el.querySelector('[data-no-injuries-input]'),
		continueButton: el.querySelector('[data-continue-button]'),
		injuryOptions: el.querySelectorAll('[data-injury-option]')
	}

	/**
	 * Hide and show 'continue' and 'no injuries' buttons depending on input values
	 *
	 */
	function onSetFormValues() {
		var inputs = BF.services.form.formValues().filter(function(item) {
			return item.name == scope.props.injuryInputName
		})

		// if more than one is selected no injuries should not be checked

		if (inputs.length > 1) {
			scope.els.noInjuriesInput.checked = false
		}

		// if 'no injuries' is selected
		if (inputs.length === 0 || noInjuriesSelected(inputs)) {
			scope.els.continueButton.style.display = 'none'
			scope.els.noInjuriesButton.style.display = 'block'
		} else {
			scope.els.continueButton.style.display = 'block'
			scope.els.noInjuriesButton.style.display = 'none'
		}
	}

	/**
	 * Check if 'no injuries' is selected
	 *
	 */
	function noInjuriesSelected(inputs) {
		return (
			inputs.filter(function(input) {
				return input.value == scope.props.noInjuriesValue
			}).length > 0
		)
	}

	/**
	 * When clicking no injuries uncheck other options and check no injuries input
	 *
	 */
	function onNoInjuriesClick() {
		for (var i = 0; i < scope.els.injuryOptions.length; i++) {
			scope.els.injuryOptions[i].checked = false
		}
		scope.els.noInjuriesInput.checked = true
	}

	/** Initialize */

	scope.els.noInjuriesButton.addEventListener('click', onNoInjuriesClick)

	scope.init(function() {
		onSetFormValues()
		// listen for events
		scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)
	})
})

/**
 * @file Injury Value Component
 * Shows text string based on injury input values
 *
 * @property data-bf-injury-value
 * @property {String} data-input-name - the name of the input
 * @property {String} data-value-label-map - an object with input value to label mapping
 *
 */
BF.component('injury-value', function(scope, el) {
	if (!el.getAttribute('data-value-label-map'))
		return scope.error(
			'data-value-label-map attribute is required, and must be an object parsable to JSON'
		)

	if (!el.getAttribute('data-input-name'))
		return scope.error('data-input-name attribute is required')

	/** Set props  */
	scope.props = {
		injuryInputName: el.getAttribute('data-input-name'),
		labels: JSON.parse(el.getAttribute('data-value-label-map'))
	}

	/**
	 * Update text string when form values update
	 *
	 */
	function onSetFormValues() {
		var input = BF.services.form.formValues().filter(function(item) {
			return item.name == scope.props.injuryInputName
		})

		el.textContent = ''

		// if no value
		if (!input.length) {
			return
		}

		// if 'none' is selected
		if (input.length == 1) {
			el.textContent = scope.props.labels[input[0].value]
			return
		}

		input.map(function(item, index) {
			el.textContent +=
				index > 0 ? ', ' + scope.props.labels[item.value] : scope.props.labels[item.value]
		})
	}

	/** Initialize  */
	scope.init(function() {
		onSetFormValues()
		scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)
	})
})

/**
 * @file Input Button Component
 * Tell Form service to update values on click
 *
 * @property data-bf-input-button
 * @property data-input-id (optional)
 * @property data-input-value (optional)
 *
 */

BF.component('input-button', function(scope, el) {
	/** Set props  */
	scope.props = {
		inputId: el.getAttribute('data-input-id'),
		inputValue: el.getAttribute('data-input-value')
	}

	/** Define referenced elements  */
	scope.els = {
		input: scope.props.inputId ? document.getElementById(scope.props.inputId) : null
	}

	/** Listen for events */
	el.addEventListener('click', function(e) {
		if (scope.els.input) {
			if (scope.els.input.type == 'radio' || scope.els.input.type == 'checkbox') {
				scope.els.input.checked = true
			}
		}

		BF.services.form.updateFormValues()
	})
})

/**
 * @file Load Template Component
 * Loads a template
 *
 * @property data-bf-load-template
 * @property {String} data-template - template id
 *
 */

BF.component('load-template', function(scope, el) {
	/** Terminate if template id is not defined  */
	if (!el.getAttribute('data-template')) {
		return scope.error('Template id not specified')
	}

	/** Set props  */
	scope.props = {
		template: document.getElementById(el.getAttribute('data-template')).innerHTML
	}

	/** Terminate if template is invalid  */
	if (!scope.props.template) {
		return scope.error('Valid template ID required')
	}

	/** Initialize  */
	scope.init(function() {
		var template = $(scope.props.template)[0]
		$(el).replaceWith(template)
		BF.compile(template)
	})
})

/**
 * @file Load Template Before Screen Component
 * Loads a template before a specified screen
 *
 * @property data-bf-load-template-before-screen
 * @property {String} data-id - screen id
 * @property {String} data-template - template id
 *
 */

BF.component('load-template-before-screen', function(scope, el) {
	var templateId = el.getAttribute('data-template')
	var template = document.getElementById(templateId)

	/** Terminate if template is invalid  */
	if (!template) {
		return scope.error(
			'Valid template Id required. ' +
				(templateId ? 'Specified Id was ' + templateId : 'Id not specified')
		)
	}

	/** Set props  */
	scope.props = {
		id: el.getAttribute('data-id'),
		template: template.innerHTML
	}

	/** Set initial State  */
	scope.state = {
		loaded: false
	}

	/** Define referenced elements  */
	scope.els = {
		template: null
	}

	/**
	 * The screen change has started
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenTransitionStart(data) {
		// If current screen is the specified screen, show content
		!scope.state.loaded && data.active.id === scope.props.id && initLoad()
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenTransitionEnd(data) {
		// if template hasn't been loaded and screen is next, current, or previous, load template
		!scope.state.loaded &&
			(BF.services.screens.relativeScreenIndex(scope.props.id) >= -1 &&
				BF.services.screens.relativeScreenIndex(scope.props.id) <= 1) &&
			initLoad()
	}

	/**
	 * Initialized template load
	 *
	 */
	function initLoad() {
		scope.state.loaded = true
		scope.els.template = $(scope.props.template)[0]
		$(el).replaceWith(scope.els.template)
		BF.compile(scope.els.template)
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenTransitionStart)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenTransitionEnd)
})

/**
 * @file Loading Screen Component
 * Loads next screen when loading screen becomes active
 *
 * @property data-bf-loading-screen
 * @property {String} data-id - loading screen id
 *
 */

BF.component('loading-screen', function(scope, el) {
	/** Set props  */
	scope.props = {
		id: el.getAttribute('data-id'),
		loadingTime: 1500
	}

	/**
	 * Go to next screen if transition to loading screen is finished
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenTransitionEnd(data) {
		data.active.id === scope.props.id &&
			setTimeout(function() {
				BF.services.screens.nextScreen()
			}, scope.props.loadingTime)
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenTransitionEnd)
})

/**
 * @file Logo Component
 * Manages classes on the shoe finder logo
 *
 * @property data-bf-logo
 *
 */

BF.component('logo', function(scope, el) {
	/** Set props  */
	scope.props = {
		visibleClass: 'bf-logo--visible',
		disableTransitionClass: 'bf-logo--disable-transitions',
		checkpointClass: 'bf-logo--checkpoint',
		smallClass: 'bf-logo--small',
		largeClass: 'bf-logo--large'
	}

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeActive(data) {
		$(el).removeClass(
			[
				scope.props.visibleClass,
				scope.props.smallClass,
				scope.props.largeClass,
				scope.props.checkpointClass
			].join(' ')
		)

		if (data.active.type === 'checkpoint') {
			el.classList.remove(scope.props.visibleClass)
			el.classList.add(scope.props.checkpointClass)
		} else {
			el.classList.add(scope.props.visibleClass)
		}

		if (data.active.id !== 'Start') {
			el.classList.add(scope.props.smallClass)
		} else {
			el.classList.add(scope.props.largeClass)
		}
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)

	/** Add disable transitions on page load */
	el.classList.add(scope.props.disableTransitionClass)
	setTimeout(function() {
		el.classList.remove(scope.props.disableTransitionClass)
	}, 2000)
})

/**
 * @file Show Next Screen Link
 * Show next screen on click
 *
 * @property data-bf-next-screen-link
 *
 */

BF.component('next-screen-link', function(scope, el) {
	el.addEventListener('click', function(e) {
		BF.services.screens.nextScreen()
	})
})

/**
 * @file Open Progress Link Component
 * Open progress menu on click (touch devices only)
 *
 * @property data-bf-open-progress-link
 *
 */

BF.component('open-progress-link', function(scope, el) {
	// only open on touch devices
	if (!BF.services.device.hasTouch) return

	el.addEventListener('click', function(e) {
		scope.emit(BF.events.OPEN_PROGRESS_MENU)
	})
})

/**
 * @file Page Component
 * Add / remove scroll bar padding when info overlay or progress menu is open
 *
 * @property data-bf-page
 *
 */

BF.component('page', function(scope, el) {
	/**
	 * Adds scrollbar padding to container
	 *
	 */
	function addScrollbarPadding() {
		if (el.scrollHeight > el.offsetHeight) {
			el.style.paddingRight = BF.services.scroll.scrollbarWidth() + 'px'
		}
	}

	/**
	 * Removes scrollbar padding from container
	 *
	 */
	function removeScrollbarPadding() {
		el.style.paddingRight = ''
	}

	/** Listen for events */
	scope.on(BF.events.OPEN_INFO_OVERLAY, addScrollbarPadding)
	scope.on(BF.events.CLOSE_INFO_OVERLAY, removeScrollbarPadding)
})

/**
 * @file Progress Component
 * The progress nav component
 *
 * @property data-bf-progress
 * @property data-items - place on nav items container
 * @property data-active-indicator - place on active indicator item
 *
 */

BF.component('progress', function(scope, el) {
	/** Set props  */
	scope.props = {
		activeClass: 'bf-progress--active',
		openClass: 'bf-progress--open',
		openingClass: 'bf-progress--opening',
		closingClass: 'bf-progress--closing',
		hoveredClass: 'bf-progress--hovered',
		recentlyHoveredClass: 'bf-progress--recently-hovered',
		canHoverClass: 'bf-progress--can-hover',
		noTransitionDelayClass: 'bf-progress--no-delay',
		screenChangeClass: 'bf-progress--in-screen-change',
		numberOfItems: $(el.querySelector('[data-items]')).children().length,
		itemActiveClass: 'active',
		itemCompleteClass: 'completed',
		itemIncompleteClass: 'incomplete'
	}

	/** Set state  */
	scope.state = {
		width: el.offsetWidth,
		open: false
	}

	/** Define referenced DOM elements  */
	scope.els = {
		indicator: el.querySelector('[data-active-indicator]'),
		items: $(el.querySelector('[data-items]')).children()
	}

	/**
	 * The screen change has started
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeStart(data) {
		// add screen change class
		el.classList.add(scope.props.screenChangeClass)

		// remove hovered class
		el.classList.remove(
			scope.props.hoveredClass,
			el.classList.remove(scope.props.recentlyHoveredClass)
		)

		// remove active class on items
		scope.els.items.removeClass(scope.props.itemActiveClass)

		// update item classes
		//if (BF.helpers.isFormScreen(activeScreen())) {
		updateItems()
		//}

		// update indicator
		//if (BF.helpers.isFormScreen(data.active)) {
		setTimeout(function() {
			updateIndicator(BF.services.screens.formScreenIndexById(data.active.id))
		}, 700)
		//}
	}

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeActive(data) {
		BF.helpers.isFormScreen(data.active) ? show() : hide()
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeEnd(data) {
		el.classList.remove(scope.props.screenChangeClass)
		if (!BF.helpers.isFormScreen(data.active)) return
		setTimeout(function() {
			updateIndicatorPosition()
		}, 300)
	}

	/**
	 * Update the indicator position when browser window is resized
	 *
	 */
	function onWindowResize() {
		updateIndicatorPosition()
	}

	/**
	 * Bind nav item events
	 *
	 */
	function bindItemEvents() {
		scope.els.items.each(function(index) {
			// click
			this.addEventListener('click', function(e) {
				e.stopPropagation()
				itemClicked(index)
			})
			// space or enter for screen readers
			this.addEventListener('keypress', function(e) {
				if (e.keyCode == 32 || e.keyCode == 13) {
					e.stopPropagation()
					e.preventDefault()
					itemClicked(index)
				}
			})
		})

		// bind mouse only events
		!BF.services.device.hasTouch && bindMouseEvents()
	}

	/**
	 * On item click
	 *
	 * @param {Number} index - item index
	 *
	 */
	function itemClicked(index) {
		scope.state.open && scope.emit(BF.events.CLOSE_PROGRESS_MENU)
		// if step has been completed, change screens and submit analytics event
		if (BF.services.form.completedByIndex(index)) {
			// BF.services.analytics.event('navigation', null, {
			// 	from: BF.services.screens.activeFormScreenIndex(),
			// 	to: index
			// })
			BF.services.screens.changeScreen(formScreens()[index].id)
		}
	}

	/**
	 * Bind element events
	 *
	 */
	function bindMouseEvents() {
		el.classList.add(scope.props.canHoverClass)
		scope.els.items.each(function(index) {
			this.addEventListener('mouseenter', onItemMouseEnter.bind(scope))
		})

		el.addEventListener('mouseleave', function() {
			unhoverNav()
		})
	}

	/**
	 * When mouse enters nav item
	 *
	 * @param {MouseEvent}
	 *
	 */
	function onItemMouseEnter(event) {
		// if step is completed and not active add hover class to it
		if (
			BF.services.form.completedByIndex($(event.target).index()) &&
			activeIndex() !== $(event.target).index()
		) {
			// add classes
			el.classList.add(scope.props.hoveredClass)
		}
		// if step is not completed show the active step
		else {
			unhoverNav()
		}
	}

	/**
	 * When mouse leaves nav
	 *
	 */
	function unhoverNav() {
		el.classList.remove(scope.props.hoveredClass)
		el.classList.add(scope.props.recentlyHoveredClass)
		setTimeout(function() {
			el.classList.remove(scope.props.recentlyHoveredClass)
		}, 200)
	}

	/**
	 * Update nav item classes
	 *
	 */
	function updateItems() {
		// remove active class
		scope.els.items.removeClass(scope.props.itemActiveClass)

		// add active class
		activeIndex() !== null &&
			scope.els.items[activeIndex()] &&
			markItemAsActive(scope.els.items[activeIndex()])

		// remove complete, incomplete classes
		scope.els.items.removeClass(
			[scope.props.itemCompleteClass, scope.props.itemIncompleteClass].join(' ')
		)

		// add complete, incomplete classes
		scope.els.items.each(function(index) {
			if (index === activeIndex()) return
			BF.services.form.completedByIndex(index)
				? markItemAsComplete(this)
				: markItemAsIncomplete(this)
		})
	}

	/**
	 * Mark item as completed
	 *
	 * @param {Element} item
	 *
	 */

	function markItemAsComplete(item) {
		item.classList.add(scope.props.itemCompleteClass)
		setAttribute(item, 'role', 'link')
		setAttribute(item, 'tabindex', '0')
	}

	/**
	 * Mark item as active
	 *
	 * @param {Element} item
	 *
	 */

	function markItemAsActive(item) {
		item.classList.add(scope.props.itemActiveClass)
		setAttribute(item, 'role', 'heading')
		setAttribute(item, 'tabindex', '0')
	}

	/**
	 * Mark item as incomplete
	 *
	 * @param {Element} item
	 *
	 */

	function markItemAsIncomplete(item) {
		item.classList.add(scope.props.itemIncompleteClass)
		setAttribute(item, 'role', '')
		setAttribute(item, 'tabindex', '')
	}

	/**
	 * Update active indicator
	 *
	 * @param {Number} index - active form screen index
	 *
	 */
	function updateIndicator(index) {
		setIndicatorPosition(index)
		setTimeout(
			function(index) {
				scope.els.indicator.textContent =
					index + 1 < formScreens().length ? index + 1 : formScreens().length
			},
			250,
			index
		)
	}

	/**
	 * Update active indicator position
	 *
	 */
	function updateIndicatorPosition() {
		scope.state.width = el.offsetWidth
		setIndicatorPosition(activeIndex())
	}

	/**
	 * Set element attribute, if id doesn't already have it (this avoid repainting bugs)
	 *
	 */
	function setAttribute(el, property, value) {
		if (!el.hasAttribute(property) || el.getAttribute(property) != value) {
			el.setAttribute(property, value)
		}
	}

	/**
	 * Set active indicator position
	 *
	 * @param {Number} index - form screen index to move to
	 *
	 */
	function setIndicatorPosition(index) {
		scope.els.indicator.style.opacity = index >= formScreens().length ? 0 : 1

		var offsetPercent = index / (scope.props.numberOfItems - 1)

		// set transform x for unopened position

		$(scope.els.indicator).css(
			BF.helpers.prefixedCssObject({
				transform:
					'translateX(' +
					(index === formScreens().length
						? scope.state.width
						: scope.state.width * offsetPercent) +
					'px)'
			})
		)
		// set top value for opened (on touch devices) position

		$(scope.els.indicator).css({
			top: offsetPercent > 1 ? '100%' : offsetPercent * 100 + '%'
		})
	}

	/**
	 * On show progress nav event
	 *
	 */
	function onShow() {
		updateIndicatorPosition()
		el.classList.add(scope.props.noTransitionDelayClass)
		show()
	}

	/**
	 * On hide progress nav event
	 *
	 */
	function onHide() {
		el.classList.remove(scope.props.noTransitionDelayClass)
		hide()
	}

	/**
	 * Show progress nav
	 *
	 */
	function show() {
		el.classList.add(scope.props.activeClass)
		el.classList.add(scope.props.openingClass)
		setTimeout(function() {
			el.classList.remove(scope.props.openingClass)
		}, 500)
	}

	/**
	 * Hide progress nav
	 *
	 */
	function hide() {
		el.classList.remove(scope.props.activeClass)
	}

	/**
	 * On open progress touch nav event
	 *
	 */
	function onOpen() {
		if (scope.state.open) return
		scope.state.open = true

		el.classList.add(scope.props.openClass)
		scope.emit(BF.events.HIDE_SCREENS)
	}

	/**
	 * On close progress touch nav event
	 *
	 */
	function onClose() {
		if (!scope.state.open) return
		scope.state.open = false

		el.classList.remove(scope.props.openClass)
		scope.emit(BF.events.SHOW_SCREENS)
		// add class to prevent items from animating as they reposition
		el.classList.add(scope.props.closingClass)
		setTimeout(function() {
			el.classList.remove(scope.props.closingClass)
		}, 100)
		// reposition indicator in case viewport was resized
		setTimeout(function() {
			updateIndicatorPosition()
		})
	}

	/**
	 * Get the active screen
	 *
	 * @return {Object} screen
	 * @property {String} screen.id - unique id for the screen
	 * @property {String} screen.type (e.g form, checkpoint) - type of screen
	 * @property {Function} screen.dependency - function that returns a promise
	 *
	 */
	function activeScreen() {
		return BF.services.screens.activeScreen()
	}

	/**
	 * Get the active form screen index
	 *
	 * @return {Number} form screen index
	 *
	 */
	function activeIndex() {
		return BF.services.screens.formScreenIndexById(BF.services.screens.activeScreenId())
	}

	/**
	 * Get form screens
	 *
	 * @return {Array} array of screen objects
	 *
	 */
	function formScreens() {
		return BF.services.screens.screensByType('form')
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChangeStart)
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenChangeEnd)
	scope.on(BF.events.WINDOW_RESIZE, onWindowResize)
	scope.on(BF.events.OPEN_PROGRESS_MENU, onOpen)
	scope.on(BF.events.CLOSE_PROGRESS_MENU, onClose)
	scope.on(BF.events.SHOW_PROGRESS_MENU, onShow)
	scope.on(BF.events.HIDE_PROGRESS_MENU, onHide)

	/** Initialize */
	scope.init(function() {
		// update item classes on load
		setTimeout(updateItems)
		bindItemEvents()
	})
})

/**
 * @file Restart Link Component
 * Resets progress on click and redirects to first form step
 *
 * @property data-bf-restart-link
 *
 */

BF.component('restart-link', function(scope, el) {
	el.addEventListener('click', function(e) {
		BF.services.form.reset()
		setTimeout(function() {
			BF.services.screens.nextScreen()
		})
	})
})

/**
 * @file Results Header Pad Component
 *
 * Adds padding to results header on certain browser widths when 'edit answers' menu is open, ensuring it doesn't cover header content
 *
 *
 */

BF.component('results-header-pad', function(scope, el) {
	/** Set props  */
	scope.props = {
		padding: 65,
		transitionDuration: 400,
		browserEndWidth: 1200
	}

	function addPadding() {
		// check to make sure its not a touch device and browser width is in the correct range
		if (BF.services.device.hasTouch || BF.services.window.width() > scope.props.browserEndWidth)
			return

		$(el).animate(
			{
				'padding-top': scope.props.padding
			},
			scope.props.transitionDuration
		)
	}

	function removePadding() {
		$(el).animate(
			{
				'padding-top': 0
			},
			scope.props.transitionDuration
		)
	}

	scope.on(BF.events.SHOW_PROGRESS_MENU, addPadding)
	scope.on(BF.events.HIDE_PROGRESS_MENU, removePadding)
})

/**
 * @file Results Nav Component
 * Nav component on the results page
 *
 * @property data-bf-results-nav
 *
 */

BF.component('results-nav', function(scope, el) {
	/** Set props  */
	scope.props = {
		hiddenClass: 'hide'
	}

	/**
	 * Hides the nav
	 *
	 */
	function hide() {
		el.classList.add(scope.props.hiddenClass)
	}

	/**
	 * Shows the nav
	 *
	 */
	function show() {
		el.classList.remove(scope.props.hiddenClass)
	}

	/** Listen for events */
	scope.on(BF.events.SHOW_PROGRESS_MENU, hide)
	scope.on(BF.events.HIDE_PROGRESS_MENU, show)
})

/**
 * @file Results Sticky Nav Component
 * Jump link nav to finder results
 *
 * @property data-bf-results-sticky-nav
 * @property data-items - place on item container element
 * @property data-sticky-el - place on element that should stick
 * @property data-top-link - place on 'top of page' jump link
 * @property data-show-at-top - place on elements that should be visible before the user scrolls
 * @property data-show-on-scrolled - place on elements that should be visible after the user scrolls
 *
 */

BF.component('results-sticky-nav', function(scope, el) {
	/** Set props  */
	scope.props = {
		activeClass: 'bf-results-sticky-nav--active',
		stickyClass: 'bf-results-sticky-nav--sticky',
		completeClass: 'bf-results-sticky-nav--complete',
		itemClass: 'bf-results-sticky-nav__item',
		itemActiveClass: 'bf-results-sticky-nav__item--active',
		stickyOffset: 40
	}

	/** Set state  */
	scope.state = {
		resultOffsets: [],
		resultsHeight: 0,
		navHeight: 0,
		navOffset: 0,
		isStuck: false,
		windowResizeHandler: null
	}

	/** Define referenced DOM elements  */
	scope.els = {
		stickyEl: el.querySelector('[data-sticky-el]'),
		itemContainer: el.querySelector('[data-items]'),
		topLink: el.querySelector('[data-top-link]'),
		showOnTop: el.querySelectorAll('[data-show-at-top]'),
		showOnScroll: el.querySelectorAll('[data-show-on-scrolled]'),
		items: [],
		results: document.querySelectorAll('[data-finder-result]')
	}

	/**
	 * Insert nav elements (numbers)
	 *
	 */
	function insertItems() {
		for (var i = 0; i < scope.els.results.length; i++) {
			var item = $('<i class="' + scope.props.itemClass + '" >' + (i + 1) + '</i>')[0]
			// add event listeners
			item.addEventListener('click', onItemClick)
			// add to element
			scope.els.items.push(item)
			scope.els.itemContainer.appendChild(item)
		}
	}

	/**
	 * Measure elements and update state
	 *
	 */
	function measure() {
		for (var i = 0; i < scope.els.results.length; i++) {
			scope.state.resultOffsets[i] = $(scope.els.results[i]).offset().top

			// update height if last item

			if (scope.els.results.length === i + 1) {
				scope.state.resultsHeight =
					$(scope.els.results[i]).offset().top + $(scope.els.results[i]).height()
			}
		}

		// update nav height

		scope.state.navOffset = $(el).offset().top
		scope.state.navHeight = scope.els.stickyEl.offsetHeight
	}

	/**
	 * Update the active item based on scroll position
	 *
	 * @param {Number} scrollPosition
	 *
	 */
	function updateActiveItem(scrollPosition) {
		el.classList.remove(scope.props.completeClass)

		scope.els.items.map(function(item) {
			item.classList.remove(scope.props.itemActiveClass)
		})

		// return if scrolled past all results

		if (scrollPosition > scope.state.resultsHeight - windowHeight() / 2)
			return el.classList.add(scope.props.completeClass)

		var activeIndex = null
		scope.state.resultOffsets.map(function(offset, index) {
			activeIndex = scrollPosition + windowHeight() / 2 > offset ? index : activeIndex
		})

		if (activeIndex !== null) {
			scope.els.items[activeIndex].classList.add(scope.props.itemActiveClass)
		}
	}

	/**
	 * Decide if nav should stick
	 *
	 * @param {Number} scrollPosition
	 *
	 */
	function updateStickyPosition(scrollPosition) {
		scrollPosition > scope.state.navOffset - scope.props.stickyOffset
			? el.classList.add(scope.props.stickyClass)
			: el.classList.remove(scope.props.stickyClass)
	}

	/**
	 * Hide / Show elements depending on scroll position
	 *
	 * @param {Number} scrollPosition
	 *
	 */
	function updateElementVisibility(scrollPosition) {
		if (scrollPosition > 400) {
			$(scope.els.showOnTop).css('display', 'none')
			$(scope.els.showOnScroll).css('display', '')
		} else {
			$(scope.els.showOnScroll).css('display', 'none')
			$(scope.els.showOnTop).css('display', '')
		}
	}

	/**
	 * Get the window height
	 *
	 * @return {Number}
	 *
	 */
	function windowHeight() {
		return BF.services.window.height()
	}

	/**
	 * Get the scroll position
	 *
	 * @return {Number}
	 *
	 */
	function scrollPosition() {
		return BF.services.scroll.position()
	}

	/**
	 * Scroll position has changed
	 *
	 * @param {Object} data
	 * @property {Number} data.y - vertical scroll position of page
	 *
	 */
	function onScroll(data) {
		if (!scope.els.items.length) return
		updateStickyPosition(data.y)
		updateActiveItem(data.y)
		updateElementVisibility(data.y)
	}

	/**
	 * The browser window has been resized
	 *
	 * @param {Object} data
	 * @property {Number} data.width - width of window
	 * @property {Number} data.height - height of window
	 *
	 */
	function onWindowResize() {
		clearTimeout(scope.state.windowResizeHandler)
		scope.state.windowResizeHandler = setTimeout(function() {
			measure()
			updateStickyPosition(scrollPosition())
			updateActiveItem(scrollPosition())
		}, 500)
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenTransitionEnd() {
		measure()
		// only show nav if more than 1 result
		if (scope.els.results.length > 1) {
			el.classList.add(scope.props.activeClass)
		}
	}

	/**
	 * Scroll to item
	 *
	 */
	function scrollToItem(index) {
		scroll(scope.state.resultOffsets[index] - scope.props.stickyOffset)
	}

	/**
	 * Scroll to result when nav item is clicked
	 *
	 */
	function onItemClick() {
		scrollToItem($(this).index())
	}

	/**
	 * Scroll to top of page when 'top link' element is clicked
	 *
	 */
	function onTopClick() {
		scroll(0)
	}

	/**
	 * Animate scroll to page position
	 *
	 * @param {Number} offset -  pixel offset (relative to document) to scroll to
	 */
	function scroll(offset) {
		$('html, body').animate(
			{
				scrollTop: offset
			},
			1000
		)
	}

	/* Bind Events */

	scope.on(BF.events.USER_SCROLL, onScroll)
	scope.on(BF.events.WINDOW_RESIZE, onWindowResize)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenTransitionEnd)

	scope.els.topLink && scope.els.topLink.addEventListener('click', onTopClick)

	/* Initialize */

	scope.init(function() {
		insertItems()
		updateElementVisibility(scrollPosition())
	})
})

/**
 * @file Screen Component
 * App screen component
 *
 * @property data-bf-screen
 * @property {String} data-id - unique identifier for the screen
 * @property {String} data-type - type of string (e.g. form, checkpoint, null)
 * @property {String} data-wait-for - name of dependency/function from API service that should be loaded before showing the screen
 * @property data-focus-first - if present, this element will be focused first on screen change (for screen readers). default is first element with tabindex="0" attribute
 * @property data-priority-screen - if present, this screen will be visited if attempting to navigate to another screen after this screen but before another screen of this type
 *
 */

BF.component('screen', function(scope, el) {
	var classPrefix = el.getAttribute('data-class-prefix') || 'bf-screen--'

	/** Set props  */
	scope.props = {
		id: el.getAttribute('data-id'),
		type: el.getAttribute('data-type') || null,
		hasPriority: el.hasAttribute('data-priority-screen'),
		dependency: el.getAttribute('data-wait-for') || null,
		renderClass: classPrefix + 'render',
		enterClass: classPrefix + 'enter',
		enterActiveClass: classPrefix + 'enter-active',
		enterReverseActiveClass: classPrefix + 'enter-reverse-active',
		leaveClass: classPrefix + 'leave',
		leaveActiveClass: classPrefix + 'leave-active',
		leaveReverseActiveClass: classPrefix + 'leave-reverse-active',
		activeClass: classPrefix + 'active'
	}

	/**
	 * The screen change has started
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeStart(data) {
		el.classList.remove(scope.props.activeClass)

		// if active screen
		if (isActive(data)) {
			$(el).addClass([scope.props.renderClass, scope.props.enterClass].join(' '))
			/* Hack to get IE11 flexbox grow to work correctly */
			setTimeout(function() {
				updateScreenHeight()
			})
		}

		// if previous screen
		else if (isPrevious(data)) {
			$(el).addClass([scope.props.renderClass, scope.props.leaveClass].join(' '))
		}

		// if neither
		else {
			el.classList.remove(scope.props.renderClass)
		}
	}

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeActive(data) {
		$(el).removeClass([scope.props.enterClass, scope.props.leaveClass].join(' '))

		// if active screen
		if (isActive(data)) {
			el.classList.add(scope.props.enterActiveClass)
			if (data.reverse) el.classList.add(scope.props.enterReverseActiveClass)
		}

		// if previous screen
		if (isPrevious(data)) {
			el.classList.add(scope.props.leaveActiveClass)
			if (data.reverse) el.classList.add(scope.props.leaveReverseActiveClass)
		}

		// if active and not the first screen focus on screen
		if (isActive(data) && data.previous) focusOnScreen()
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeEnd(data) {
		$(el).removeClass(
			[
				scope.props.enterActiveClass,
				scope.props.leaveActiveClass,
				scope.props.enterReverseActiveClass,
				scope.props.leaveReverseActiveClass
			].join(' ')
		)

		// if active screen
		if (isActive(data)) {
			el.classList.add(scope.props.activeClass)
			/* Hack to get IE11 flexbox grow to work correctly */
			setTimeout(function() {
				updateScreenHeight()
			})
		}

		// if previous screen
		if (isPrevious(data)) el.classList.remove(scope.props.renderClass)
	}

	/**
	 * Set screen height to height of contents (fixes IE 11 flexbox grow bug)
	 *
	 */
	function updateScreenHeight() {
		if (!BF.helpers.isIE()) return

		setTimeout(function() {
			var height = $(el)
				.children()
				.first()
				.outerHeight()
			el.style.height =
				height > BF.services.window.height() || BF.services.window.width() < 1000
					? ''
					: height + 'px'
		})
	}

	/**
	 * Update height on window resize
	 *
	 */
	function onWindowResize() {
		if (BF.services.screens.activeScreenId() == scope.props.id) {
			setTimeout(updateScreenHeight, 50)
		}
	}

	/**
	 * Check if screen is active
	 *
	 * @param {Object} screen
	 * @property {String} screen.id - unique id for the screen
	 * @property {String} screen.type (e.g form, checkpoint) - type of screen
	 * @property {Function} screen.dependency - function that returns a promise
	 * @return {Bool}
	 *
	 */
	function isActive(data) {
		return data.active.id === scope.props.id
	}

	/**
	 * Check if screen is was the previous screen
	 *
	 * @param {Object} screen
	 * @property {String} screen.id - unique id for the screen
	 * @property {String} screen.type (e.g form, checkpoint) - type of screen
	 * @property {Function} screen.dependency - function that returns a promise
	 * @return {Bool}
	 *
	 */
	function isPrevious(data) {
		return data.previous ? data.previous.id === scope.props.id : false
	}

	/**
	 * Hide the screen
	 *
	 */
	function hideScreen() {
		el.style.display = 'none'
	}

	/**
	 * Show the screen
	 *
	 */
	function showScreen() {
		el.style.display = ''
	}

	/**
	 * Focus on screen
	 *
	 */
	function focusOnScreen() {
		var focusFirstElement = el.querySelector('[data-focus-first]')
		focusFirstElement ? focusFirstElement.focus() : el.focus()
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_START, onScreenChangeStart)
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenChangeEnd)
	scope.on(BF.events.HIDE_SCREENS, hideScreen)
	scope.on(BF.events.SHOW_SCREENS, showScreen)
	scope.on(BF.events.WINDOW_RESIZE, onWindowResize)

	/** Initialize */

	scope.init(function() {
		// register screen
		BF.services.screens.registerScreen({
			id: scope.props.id,
			type: scope.props.type,
			hasPriority: scope.props.hasPriority,
			dependency:
				scope.props.dependency && BF.endpoints[scope.props.dependency]
					? function() {
							return BF.services.api.call(
								BF.endpoints[scope.props.dependency].url,
								BF.endpoints[scope.props.dependency].type
							)
					  }
					: null
		})
	})
})

/**
 * @file Screen Load Button Component
 * Add loading class to button component when screen dependency is loading
 *
 * @property data-bf-screen-load-button
 *
 */

BF.component('screen-load-button', function(scope, el) {
	/** Set props  */
	scope.props = {
		buttonLoadingClass: 'bf-button--loading'
	}

	/**
	 * Show loader when screen data is loading
	 *
	 */
	function onLoading() {
		el.classList.add(scope.props.buttonLoadingClass)
	}

	/**
	 * Hide loader when screen data is finished loading
	 *
	 */
	function onLoaded() {
		el.classList.remove(scope.props.buttonLoadingClass)
	}

	scope.on(BF.events.LOADING_SCREEN_DATA, onLoading)
	scope.on(BF.events.SCREEN_DATA_LOADED, onLoaded)
})

/**
 * @file Send Form Progress
 * Sends form progress to server
 *
 * @property data-bf-send-form-progress
 *
 */

BF.component('send-form-progress', function(scope, el) {
	el.addEventListener('click', function(e) {
		BF.services.form.sendFormProgress()
	})
})

/**
 * @file Show On Form Complete Component
 * Shows element if all form questions have been answered
 *
 * @property data-bf-show-on-form-complete
 *
 */

BF.component('show-on-form-complete', function(scope, el) {
	/** Set props  */
	scope.props = {
		pageLoadTime: 2000,
		changeLength: 1000
	}

	/** Set initial State  */
	scope.state = {
		pageLoaded: false
	}

	/**
	 * Show the element
	 *
	 */
	function show() {
		setTimeout(function() {
			el.removeAttribute('style')
			el.setAttribute('aria-hidden', 'false')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Hide the element
	 *
	 */
	function hide() {
		setTimeout(function() {
			el.style.display = 'none'
			el.setAttribute('aria-hidden', 'true')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * When form values are updated
	 *
	 * @param {Array} values
	 * @property {String} values.name - name of input
	 * @property {String} values.value - value of input
	 *
	 */
	function onSetFormValues(values) {
		// add timeout to fix Firefox timing bug
		setTimeout(function() {
			BF.services.form.formIsComplete() ? show() : hide()
		})
	}

	/** Listen for events */
	scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)

	setTimeout(function() {
		scope.state.pageLoaded = true
	}, scope.props.pageLoadTime)
})

/**
 * @file Show on form progress
 * Show an element if user has completed any form step
 *
 * @property data-bf-show-on-form-progress
 *
 */

BF.component('show-on-form-progress', function(scope, el) {
	/** Set props  */
	scope.props = {
		pageLoadTime: 2000,
		changeLength: 1000
	}

	/** Set initial State  */
	scope.state = {
		pageLoaded: false
	}

	/**
	 * Show the element
	 *
	 */
	function show() {
		// set timeout so it doesnt immediately show during transitions
		setTimeout(function() {
			el.removeAttribute('style')
			el.setAttribute('aria-hidden', 'false')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Hide the element
	 *
	 */
	function hide() {
		// set timeout so it doesnt immediately hide during transitions
		setTimeout(function() {
			el.style.display = 'none'
			el.setAttribute('aria-hidden', 'true')
		}, scope.state.pageLoaded ? scope.props.changeLength : 0)
	}

	/**
	 * Update visiblity
	 *

	 */
	function update() {
		var hasProgress = BF.services.form.completedSteps().length

		hasProgress ? show() : hide()
	}

	/** Listen for events */
	scope.on(BF.events.SET_FORM_VALUES, function() {
		setTimeout(update)
	})

	setTimeout(function() {
		scope.state.pageLoaded = true
	}, scope.props.pageLoadTime)
})

/**
 * @file Show On Form Value Component
 * Shows and hides element based on specified form value
 *
 * @property data-bf-show-on-form-value
 * @property data-name - name of the form input
 * @property data-value - value of the form input
 *
 */

BF.component('show-on-form-value', function(scope, el) {
	/** Set props  */
	scope.props = {
		name: el.getAttribute('data-name'),
		value: el.getAttribute('data-value')
	}

	/**
	 * Show the element
	 *
	 */
	function show() {
		el.removeAttribute('style')
		el.setAttribute('aria-hidden', 'false')
	}

	/**
	 * Hide the element
	 *
	 */
	function hide() {
		el.style.display = 'none'
		el.setAttribute('aria-hidden', 'true')
	}

	/**
	 * When form values are updated
	 *
	 * @param {Array} values
	 * @property {String} values.name - name of input
	 * @property {String} values.value - value of input
	 *
	 */
	function onSetFormValues(values) {
		var input = values.filter(function(item) {
			return item.name == scope.props.name
		})

		input.length && input[0].value === scope.props.value ? show() : hide()
	}

	/** Listen for events */
	scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)
})

/**
 * @file Show Progress Link Component
 * Shows the progress menu on click
 *
 */

BF.component('show-progress-link', function(scope, el) {
	/* Define elements */
	scope.els = {
		nav: document.querySelector('[data-bf-progress]')
	}

	// on mobile open menu, on desktop show menu

	el.addEventListener('click', function(e) {
		e.preventDefault()
		BF.services.device.hasTouch
			? scope.emit(BF.events.OPEN_PROGRESS_MENU)
			: scope.emit(BF.events.SHOW_PROGRESS_MENU)
		// focus on progress for screen readers
		setTimeout(function() {
			scope.els.nav &&
				$(scope.els.nav.querySelector('[data-items]'))
					.children()[0]
					.focus()
		}, 500)
	})
})

/**
 * @file Injuries Skeleton Component
 * Dynamic svg component specific to the shoe finder
 *
 * @property data-bf-injuries
 * @property {String} data-url - the url of the svg image
 * @property {String} data-injury-input-name - the name of the form input
 * @property {String} data-foot-input-value - the form input value for foot
 * @property {String} data-leg-input-value - the form input value for leg
 * @property {String} data-knees-input-value - the form input value for knees
 * @property data-continue-button - place attribute on 'continue' button
 * @property data-injury-option - place attribute on injury input labels
 *
 */

BF.component('skeleton', function(scope, el) {
	/** Set props  */
	scope.props = {
		loadedClass: 'bf-media--loaded',
		footClass: 'bf-skeleton--foot',
		legClass: 'bf-skeleton--leg',
		kneeClass: 'bf-skeleton--knee',
		svgUrl: el.getAttribute('data-url'),
		injuryInputName: el.getAttribute('data-injury-input-name'),
		footValue: el.getAttribute('data-foot-input-value'),
		legValue: el.getAttribute('data-leg-input-value'),
		kneesValue: el.getAttribute('data-knees-input-value')
	}

	/** Terminate if svg url not specified  */
	if (!scope.props.svgUrl) {
		return scope.error('SVG url not found')
	}

	/**
	 * Load the SVG image
	 *
	 */
	 function loadImage() {
 		$.get(scope.props.svgUrl, function(doc) {
 			var svg;

 			if (typeof doc === "object" && typeof doc.querySelector === "function") {
 				svg = doc.querySelector('svg');
 			} else {
 				svg = $(doc).find('svg')[0];
 			}

 			if (svg !== undefined) {
 				el.appendChild(svg)
 				el.classList.add(scope.props.loadedClass)
 				onSetFormValues()
 			}
 		}).fail(function() {
 			scope.error('Failed to load image')
 		})
 	}

	/**
	 * When form values are updated
	 *
	 * @param {Array} values
	 * @property {String} values.name - name of input
	 * @property {String} values.value - value of input
	 *
	 */
	function onSetFormValues(values) {
		var input = BF.services.form.formValues().filter(function(item) {
			return item.name == scope.props.injuryInputName
		})
		$(el).removeClass(
			[scope.props.footClass, scope.props.legClass, scope.props.kneeClass].join(' ')
		)
		input.map(function(item) {
			item.value === scope.props.footValue && el.classList.add(scope.props.footClass)
			item.value === scope.props.legValue && el.classList.add(scope.props.legClass)
			item.value === scope.props.kneesValue && el.classList.add(scope.props.kneeClass)
		})
	}

	/** Initialize */
	scope.init(function() {
		loadImage()
		scope.on(BF.events.SET_FORM_VALUES, onSetFormValues)
	})
})

/**
 * @file Stepped Animation Component
 * Animates an inline svg
 *
 * @property data-bf-stepped-animation
 * @property {Number} data-steps - number of steps in the namation
 * @property {String} data-active-screens - screen ids animation should be active on, separated by a comma
 * @property {Number} data-start-delay - delay before starting the animation
 * @property data-injury-option - place attribute on injury input labels
 *
 */

BF.component('stepped-animation', function(scope, el) {
	/** Set state  */
	scope.state = {
		tick: 1,
		active: false,
		intervalHandler: null
	}

	/** Set props  */
	scope.props = {
		activeScreens: el.getAttribute('data-active-screens')
			? el.getAttribute('data-active-screens').split(',')
			: false,
		steps: el.getAttribute('data-steps') ? JSON.parse(el.getAttribute('data-steps')) : 3,
		intervalLength: 150,
		startDelay: el.getAttribute('data-start-delay')
			? JSON.parse(el.getAttribute('data-start-delay'))
			: 0
	}

	/**
	 * Start the animation
	 *
	 */
	function activate() {
		if (scope.state.active) return
		scope.state.active = true
		scope.state.intervalHandler = setInterval(function() {
			scope.state.tick = scope.state.tick >= scope.props.steps ? 1 : scope.state.tick + 1

			for (var i = 1; i <= scope.props.steps; i++) {
				el.classList.remove('animation-' + i)
			}

			el.classList.add('animation-' + scope.state.tick)
		}, scope.props.intervalLength)
	}

	/**
	 * Stop the animation
	 *
	 */
	function deactivate() {
		if (!scope.state.active) return
		scope.state.active = false
		clearInterval(scope.state.intervalHandler)
	}

	/**
	 * The screen change is active
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeActive(data) {
		scope.props.activeScreens &&
			scope.props.activeScreens.indexOf(data.active.id) > -1 &&
			activate()
	}

	/**
	 * The screen change has ended
	 *
	 * @param {Object} data
	 * @property {Object} data.active - screen object
	 * @property {Object} data.previous - screen object
	 * @property {Bool} data.reverse - true if going to a previous screen
	 *
	 */
	function onScreenChangeEnd(data) {
		scope.props.activeScreens &&
			scope.props.activeScreens.indexOf(data.active.id) === -1 &&
			deactivate()
	}

	/** Listen for events */
	scope.on(BF.events.SCREEN_TRANSITION_ACTIVE, onScreenChangeActive)
	scope.on(BF.events.SCREEN_TRANSITION_END, onScreenChangeEnd)

	/** Initialize */
	if (!scope.props.activeScreens) {
		setTimeout(function() {
			activate()
		}, scope.props.startDelay)
		return
	}
})

/**
 * @file SVG Component
 * Loads and appends an svg image
 *
 * @property data-bf-svg
 * @property data-image-container - place attribute on element
 * @property {String} data-loaded-class - class that should be added when loaded
 * @property {String} data-url - url of the svg image
 *
 */

BF.component('svg', function(scope, el) {
	/** Set props  */
	scope.props = {
		loadedClass: el.getAttribute('data-loaded-class') || 'bf-media--loaded',
		svgUrl: el.getAttribute('data-url')
	}

	/** Set state  */
	scope.state = {
		loaded: false
	}

	/** Define referenced DOM elements  */
	scope.els = {
		container: el.querySelector('[data-image-container]') || el
	}

	/** Terminate svg url not specified  */
	if (!scope.props.svgUrl) {
		return scope.error('SVG url not found')
	}

	/**
	 * Load the image
	 *
	 */
	 function loadImage() {
 		$.get(scope.props.svgUrl, function(doc) {
 			var svg;

 			if (typeof doc === "object" && typeof doc.querySelector === "function") {
 				svg = doc.querySelector('svg');
 			} else {
 				svg = $(doc).find('svg')[0];
 			}

 			if (svg !== undefined) {
 				scope.els.container.appendChild(svg)
 				scope.state.loaded = true
 				el.classList.add(scope.props.loadedClass)
 			}
 		}).fail(function() {
 			scope.error('Failed to load image')
 		})
 	}

	/** Initialize  */
	scope.init(function() {
		loadImage()
	})
})

/**
 * @file Video Component
 * Show a video
 *
 * @property data-bf-video
 * @property data-image-container - place attribute on element
 * @property {String} data-video-src - video mp4 source
 * @property {String} data-placeholder - placeholder image url
 *
 */

BF.component('video', function(scope, el) {
	/** Set props */
	scope.props = {
		src: el.getAttribute('data-video-src'),
		placeholder: el.getAttribute('data-placeholder'),
		title: el.getAttribute('data-title'),
		template: document.getElementById('VideoTemplate').innerHTML,
		noTouchClass: 'bf-video--no-touch',
		playingClass: 'bf-video--playing',
		readyClass: 'bf-video--ready',
		toggleActiveClass: 'bf-media-button--unhover',
		progressCircleCircumference: 0
	}

	/** Set state  */
	scope.state = {
		canPlay: false,
		playing: false,
		hasPlayed: false,
		progress: 0
	}

	/** Define referenced DOM elements  */
	scope.els = {
		container: null,
		video: null,
		toggle: null,
		pauseIcon: null,
		playIcon: null,
		hoverContainer: null,
		progressCircle: null
	}

	/** Terminate if video template not found  */
	if (!scope.props.template) {
		return scope.error('Video template not found')
	}

	/**
	 * Initialize component
	 *
	 */
	function initialize() {
		// if user has a slow connection only insert image

		if (BF.services.device && BF.services.device.hasSlowConnection) {
			insertImage()
			return
		}

		// if user doesnt have a slow connection insert video

		insertVideo()
		// wait for elements to appear in DOM
		setTimeout(function() {
			findElements()
			bindInteractionEvents()
			bindVideoEvents()
			initializeProgressCircle()
			// add class if device has touch
			!BF.services.device.hasTouch &&
				scope.els.container.classList.add(scope.props.noTouchClass)
		})
	}

	/**
	 * Insert video template
	 *
	 */
	function insertVideo() {
		var template = scope.props.template
		template = template.replace('source', 'source src="' + scope.props.src + '"')
		template = template.replace('img', 'img src="' + scope.props.placeholder + '" ')
		template = template.replace('alt=""', 'alt="' + scope.props.title + '"')
		el.innerHTML = template
	}

	/**
	 * Insert image template
	 *
	 */
	function insertImage() {
		el.innerHTML =
			'<img src="' +
			scope.props.placeholder +
			'"' +
			(scope.props.title ? ' alt="' + scope.props.title + '"' : '') +
			' />'
	}

	/**
	 * Find and define DOM elements
	 *
	 */
	function findElements() {
		scope.els.container = el.querySelector('[data-container]')
		scope.els.video = el.querySelector('video')
		scope.els.pauseIcon = el.querySelector('[data-pause-icon]')
		scope.els.playIcon = el.querySelector('[data-play-icon]')
		scope.els.toggle = el.querySelector('[data-pause-toggle]')
		scope.els.progressCircle = el.querySelector('[data-progress-circle]')
		scope.els.hoverContainer = $(el).parents('[data-bf-input-button]')[0] || el
	}

	/**
	 * Bind video interaction events
	 *
	 */
	function bindInteractionEvents() {
		// Play / pause toggle for touch screens
		BF.services.device.hasTouch &&
			scope.els.toggle.addEventListener('click', function(e) {
				e.preventDefault()
				e.stopPropagation()
				scope.state.playing ? pause() : play()
			})

		// Play / pause toggle for mouse

		scope.els.hoverContainer.addEventListener('mouseenter', function() {
			!isPlaying() && play()
		})

		scope.els.hoverContainer.addEventListener('mouseleave', function() {
			isPlaying() && pause()
			resetProgress()
		})

		// cancel hover styles when toggling play on touch devices

		scope.els.toggle.addEventListener('mouseleave', function() {
			scope.els.hoverContainer.classList.remove(scope.props.toggleActiveClass)
		})

		scope.els.toggle.addEventListener('mouseenter', function() {
			scope.els.hoverContainer.classList.add(scope.props.toggleActiveClass)
		})
	}

	/**
	 * Bind video events
	 *
	 */
	function bindVideoEvents() {
		scope.els.video.addEventListener('play', onPlay.bind(this))
		scope.els.video.addEventListener('pause', onPause.bind(this))
		scope.els.video.addEventListener('playing', onPlaying.bind(this))
		scope.els.video.addEventListener('timeupdate', onTimeUpdate.bind(this))
		scope.els.video.addEventListener('canplay', onCanPlay.bind(this))
	}

	/**
	 * Initialize progress circle
	 *
	 */
	function initializeProgressCircle() {
		if (!scope.els.progressCircle) return
		var circumference = scope.els.progressCircle.r.baseVal.value * 2 * Math.PI
		scope.props.progressCircleCircumference = circumference
		scope.els.progressCircle.style.strokeDasharray = circumference
		updateProgress(0)
	}

	/**
	 * Pause video
	 *
	 */
	function pause() {
		scope.els.video.pause()
	}

	/**
	 * Play video
	 *
	 */
	function play() {
		scope.state.canPlay && scope.els.video.play()
	}

	/**
	 * Reset video progress
	 *
	 */
	function resetProgress() {
		scope.els.video.currentTime = 0
	}

	/**
	 * Video play event
	 *
	 */
	function onPlay() {
		// if touch is not supported and has not played, stop video
		if (!scope.state.hasPlayed) {
			scope.state.hasPlayed = true
			scope.els.container.classList.add(scope.props.readyClass)
			if (!BF.services.device.hasTouch) {
				pause()
				resetProgress()
			}
		}

		scope.state.hasPlayed = true

		if (!scope.state.playing) {
			scope.state.playing = true
			scope.els.container.classList.add(scope.props.playingClass)
		}
	}

	/**
	 * Video canplay event
	 *
	 */
	function onCanPlay() {
		scope.state.canPlay = true
	}

	/**
	 * Video pause event
	 *
	 */
	function onPause() {
		scope.state.playing = false
		scope.els.container.classList.remove(scope.props.playingClass)
	}

	/**
	 * Video playing event
	 *
	 */
	function onPlaying() {
		!scope.state.playing && onPlay()
	}

	/**
	 * Video time update event
	 *
	 */
	function onTimeUpdate() {
		updateProgress(scope.els.video.currentTime / scope.els.video.duration)
	}

	/**
	 * Check if video is playing
	 *
	 * @return {Bool}
	 *
	 */
	function isPlaying() {
		return (
			scope.els.video.currentTime > 0 &&
			!scope.els.video.paused &&
			!scope.els.video.ended &&
			scope.els.video.readyState > 2
		)
	}

	/**
	 * Update progress circle
	 *
	 * @param {Number} progress - percentage complete (0 to 1)
	 *
	 */
	function updateProgress(progress) {
		// set dash offset
		scope.els.progressCircle.style.strokeDashoffset =
			scope.props.progressCircleCircumference * (1 - progress)

		// skip transition if restarting
		if (scope.state.progress && progress < scope.state.progress) {
			scope.els.progressCircle.style.transition = 'none'
		} else {
			scope.els.progressCircle.style.transition = ''
		}

		// set new progress
		scope.state.progress = progress
	}

	/* Initialize */

	scope.init(initialize)
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzQ29uY2F0dGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBmaWxlIEJyb29rcyBGaW5kZXJcclxuICpcclxuICovXHJcblxyXG52YXIgQkYgPVxyXG5cdEJGIHx8XHJcblx0KGZ1bmN0aW9uKCkge1xyXG5cdFx0LyoqIENyZWF0ZSBldmVudCBlbWl0dGVyIG9iamVjdCAqL1xyXG5cclxuXHRcdHZhciBlbWl0dGVyID0gbmV3IHdpbmRvdy5UaW55RW1pdHRlcigpXHJcblxyXG5cdFx0LyoqIENyZWF0ZSBjb21wb25lbnQgbGlicmFyeSAqL1xyXG5cclxuXHRcdHZhciByZWdpc3RlcmVkQ29tcG9uZW50cyA9IHt9XHJcblxyXG5cdFx0LyoqIENyZWF0ZSBzZXJ2aWNlIGxpYnJhcnkgKi9cclxuXHJcblx0XHR2YXIgcmVnaXN0ZXJlZFNlcnZpY2VzID0ge31cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFJlZ2lzdGVycyBhIGNvbXBvbmVudCB0byB0aGUgY29tcG9uZW50IGxpYnJhcnlcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIGEgdW5pcXVlIG5hbWUgZm9yIHRoZSBjb21wb25lbnRcclxuXHRcdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSB0aGUgY29tcG9uZW50IGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChuYW1lLCBmdW5jKSB7XHJcblx0XHRcdHJlZ2lzdGVyZWRDb21wb25lbnRzW25hbWVdID0gZnVuY1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3JlYXRlcyBhIG5ldyBjb21wb25lbnRcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIG5hbWUgb2YgY29tcG9uZW50XHJcblx0XHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgLSBkb20gZWxlbWVudFxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KG5hbWUsIGVsZW1lbnQpIHtcclxuXHRcdFx0dmFyIHNjb3BlID0gbmV3IFNjb3BlKG5hbWUpXHJcblx0XHRcdHJlZ2lzdGVyZWRDb21wb25lbnRzW25hbWVdLmNhbGwoc2NvcGUsIHNjb3BlLCBlbGVtZW50KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3JlYXRlIGEgbmV3IHNjb3BlIGZvciBhIGNvbXBvbmVudCBvciBzZXJ2aWNlXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gdGhlIG5hbWUgb2YgdGhlIGNvbXBvbmVudCBvciBzZXJ2aWNlXHJcblx0XHQgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBzY29wZSBvYmplY3RcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdHZhciBTY29wZSA9IGZ1bmN0aW9uKGlkKSB7XHJcblx0XHRcdHZhciBzY29wZSA9IHt9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogTGlzdGVuIGZvciBhbiBldmVudFxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBldmVudHMuIFNlZSBleHRlbnNpb25zL2V2ZW50cy5qc1xyXG5cdFx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkNhbGxiYWNrIC0gY2FsbGJhY2sgZnVuY3Rpb25cclxuXHRcdFx0ICpcclxuXHRcdFx0ICovXHJcblx0XHRcdHNjb3BlLm9uID0gZnVuY3Rpb24obmFtZSwgb25DYWxsYmFjaykge1xyXG5cdFx0XHRcdGVtaXR0ZXIub24obmFtZSwgZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRcdFx0b25DYWxsYmFjay5jYWxsKHNjb3BlLCBkYXRhKVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8qKlxyXG5cdFx0XHQgKiBFbWl0IGFuIGV2ZW50XHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGV2ZW50cy4gU2VlIGV4dGVuc2lvbnMvZXZlbnRzLmpzXHJcblx0XHRcdCAqIEBwYXJhbSB7QW55fSBkYXRhIC0gZGF0YSBmb3IgdGhlIGV2ZW50XHJcblx0XHRcdCAqXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRzY29wZS5lbWl0ID0gZnVuY3Rpb24obmFtZSwgZGF0YSkge1xyXG5cdFx0XHRcdGVtaXR0ZXIuZW1pdChuYW1lLCBkYXRhKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogSW5pdGlhbGl6YXRpb24gZnVuY3Rpb24gY2FsbGVkIGFmdGVyIGFsbCBjb21wb25lbnRzIGFyZSByZWdpc3RlcmVkXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSB7RnVuY30gaW5pdENhbGxiYWNrIC0gdGhlIGluaXRpbGl6YXRpb24gZnVuY3Rpb25cclxuXHRcdFx0ICpcclxuXHRcdFx0ICovXHJcblx0XHRcdHNjb3BlLmluaXQgPSBmdW5jdGlvbihpbml0Q2FsbGJhY2spIHtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0aW5pdENhbGxiYWNrLmNhbGwoc2NvcGUpXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0LyoqXHJcblx0XHRcdCAqIENhbGxlZCBvbiBhcHBsaWNhdGlvbiBzdGFydFxyXG5cdFx0XHQgKlxyXG5cdFx0XHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIGNhbGxiYWNrIGZ1bmN0aW9uXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqL1xyXG5cdFx0XHRzY29wZS5zdGFydCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblx0XHRcdFx0ZW1pdHRlci5vbihCRi5ldmVudHMuU1RBUlQsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChzY29wZSlcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvKipcclxuXHRcdFx0ICogUHJpbnRzIGFuIGVycm9yIGluIHRoZSBjb25zb2xlXHJcblx0XHRcdCAqXHJcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBlcnJvciAtIGVycm9yIG1lc3NhZ2VcclxuXHRcdFx0ICpcclxuXHRcdFx0ICovXHJcblx0XHRcdHNjb3BlLmVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKFxyXG5cdFx0XHRcdFx0J0Jyb29rcyBGaW5kZXIgRVJST1JcXG4nLFxyXG5cdFx0XHRcdFx0J0xvY2F0aW9uOiAnICsgaWQgKyAnXFxuJyxcclxuXHRcdFx0XHRcdCdFcnJvcjogXCInICsgZXJyb3IgKyAnXCInXHJcblx0XHRcdFx0KVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gc2NvcGVcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFNlYXJjaGVzIGEgZG9tIGVsZW1lbnQgZm9yIHJlZ2lzdGVyZWQgY29tcG9uZW50cyBhbmQgaW5pdGlhbGl6ZXMgdGhlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCAtIHBhcmVudCBkb20gZWxlbWVudFxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gY29tcGlsZShlbGVtZW50KSB7XHJcblx0XHRcdGZvciAodmFyIGNvbXBvbmVudE5hbWUgaW4gcmVnaXN0ZXJlZENvbXBvbmVudHMpIHtcclxuXHRcdFx0XHR2YXIgYXR0cmlidXRlID0gJ2RhdGEtYmYtJyArIGNvbXBvbmVudE5hbWVcclxuXHRcdFx0XHR2YXIgc2VsZWN0b3IgPSAnWycgKyBhdHRyaWJ1dGUgKyAnXSdcclxuXHRcdFx0XHR2YXIgZWxlbWVudHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXHJcblx0XHRcdFx0Ly8gY2hpbGRyZW5cclxuXHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHRjcmVhdGVDb21wb25lbnQoY29tcG9uZW50TmFtZSwgZWxlbWVudHNbaV0pXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBzZWxmXHJcblx0XHRcdFx0XHRpZiAoZWxlbWVudC5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlKSkge1xyXG5cdFx0XHRcdFx0XHRjcmVhdGVDb21wb25lbnQoY29tcG9uZW50TmFtZSwgZWxlbWVudClcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcclxuXHRcdFx0XHRcdFx0J0Jyb29rcyBGaW5kZXIgRVJST1JcXG4nLFxyXG5cdFx0XHRcdFx0XHQnTG9jYXRpb246IGNvbXBuZW50ICcgKyBjb21wb25lbnROYW1lICsgJ1xcbicsXHJcblx0XHRcdFx0XHRcdCdFcnJvcjogXCInICsgZXJyb3IgKyAnXCInXHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGVsZW1lbnQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZWdpc3RlcnMgYSBzaW5nbGV0b24gc2VydmljZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gYSB1bmlxdWUgbmFtZSBmb3IgdGhlIGNvbXBvbmVudFxyXG5cdFx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIHRoZSBzZXJ2aWNlIGZ1bmN0aW9uXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblxyXG5cdFx0ZnVuY3Rpb24gcmVnaXN0ZXJTZXJ2aWNlKG5hbWUsIGZ1bmMpIHtcclxuXHRcdFx0dmFyIHNjb3BlID0gbmV3IFNjb3BlKG5hbWUpXHJcblx0XHRcdHJlZ2lzdGVyZWRTZXJ2aWNlc1tuYW1lXSA9IGZ1bmMuY2FsbChzY29wZSwgc2NvcGUpXHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBTdGFydCB0aGUgYXBwbGljYXRpb24gYnkgY29tcGlsaW5nIHJvb3QgZWxlbWVudFxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cclxuXHRcdGZ1bmN0aW9uIHN0YXJ0KCkge1xyXG5cdFx0XHR2YXIgYXBwRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1iZi1hcHBdJylcclxuXHRcdFx0YXBwRWwgIT09IG51bGwgJiYgY29tcGlsZShhcHBFbClcclxuXHRcdFx0ZW1pdHRlci5lbWl0KEJGLmV2ZW50cy5TVEFSVClcclxuXHRcdH1cclxuXHJcblx0XHQvKiogQkYgQVBJICovXHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0c3RhcnQ6IHN0YXJ0LFxyXG5cdFx0XHRjb21wb25lbnQ6IHJlZ2lzdGVyQ29tcG9uZW50LFxyXG5cdFx0XHRzZXJ2aWNlOiByZWdpc3RlclNlcnZpY2UsXHJcblx0XHRcdHNlcnZpY2VzOiByZWdpc3RlcmVkU2VydmljZXMsXHJcblx0XHRcdGNvbXBpbGU6IGNvbXBpbGVcclxuXHRcdH1cclxuXHR9KSgpXHJcblxyXG4vKipcclxuICogQGZpbGUgRXZlbnRzXHJcbiAqIEV2ZW50cyB0aGF0IGNhbiBiZSBzZW50IGZyb20gY29tcG9uZW50cyBhbmQgc2VydmljZXMuIFNvbWUgZXZlbnRzIGFjY2VwdCBvciByZXF1aXJlIGFyZ3VtZW50c1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmV2ZW50cyA9IHtcclxuXHQvKipcclxuXHQgKiBFdmVudCBvbiBhcHAgc3RhcnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdFNUQVJUOiAnU1RBUlQnLFxyXG5cclxuXHQvKipcclxuXHQgKiBFbWl0IG5ldyBmb3JtIHZhbHVlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gdmFsdWVzXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHZhbHVlcy5uYW1lIC0gbmFtZSBvZiBpbnB1dFxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2YWx1ZXMudmFsdWUgLSB2YWx1ZSBvZiBpbnB1dFxyXG5cdCAqXHJcblx0ICovXHJcblx0U0VUX0ZPUk1fVkFMVUVTOiAnU0VUX0ZPUk1fVkFMVUVTJyxcclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNjcmVlbiBjaGFuZ2UgaGFzIHN0YXJ0ZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0U0NSRUVOX1RSQU5TSVRJT05fU1RBUlQ6ICdTQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCcsXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRTQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkU6ICdTQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUnLFxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgZW5kZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0U0NSRUVOX1RSQU5TSVRJT05fRU5EOiAnU0NSRUVOX1RSQU5TVElPTl9FTkQnLFxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgYnJvd3NlciB3aW5kb3cgaGFzIGJlZW4gcmVzaXplZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge051bWJlcn0gZGF0YS53aWR0aCAtIHdpZHRoIG9mIHdpbmRvd1xyXG5cdCAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBkYXRhLmhlaWdodCAtIGhlaWdodCBvZiB3aW5kb3dcclxuXHQgKlxyXG5cdCAqL1xyXG5cdFdJTkRPV19SRVNJWkU6ICdXSU5ET1dfUkVTSVpFJyxcclxuXHJcblx0LyoqXHJcblx0ICogU2Nyb2xsIHBvc2l0aW9uIGhhcyBjaGFuZ2VkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG5cdCAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBkYXRhLnkgLSB2ZXJ0aWNhbCBzY3JvbGwgcG9zaXRpb24gb2YgcGFnZVxyXG5cdCAqXHJcblx0ICovXHJcblx0VVNFUl9TQ1JPTEw6ICdVU0VSX1NDUk9MTCcsXHJcblxyXG5cdC8qKlxyXG5cdCAqIE9wZW4gYW4gaW5mbyBvdmVybGF5XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGUgaWQgLSB0aGUgRE9NIGVsZW1lbnQgSWQgb2YgdGhlIHRlbXBsYXRlXHJcblx0ICpcclxuXHQgKi9cclxuXHRPUEVOX0lORk9fT1ZFUkxBWTogJ09QRU5fSU5GT19PVkVSTEFZJyxcclxuXHJcblx0LyoqXHJcblx0ICogQ2xvc2UgdGhlIGluZm8gb3ZlcmxheVxyXG5cdCAqXHJcblx0ICovXHJcblx0Q0xPU0VfSU5GT19PVkVSTEFZOiAnQ0xPU0VfSU5GT19PVkVSTEFZJyxcclxuXHJcblx0LyoqXHJcblx0ICogT3BlbiBhbiBhbGVydFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlIGlkIC0gdGhlIERPTSBlbGVtZW50IElkIG9mIHRoZSB0ZW1wbGF0ZVxyXG5cdCAqXHJcblx0ICovXHJcblx0T1BFTl9BTEVSVDogJ09QRU5fQUxFUlQnLFxyXG5cclxuXHQvKipcclxuXHQgKiBDbG9zZSB0aGUgYWxlcnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdENMT1NFX0FMRVJUOiAnQ0xPU0VfQUxFUlQnLFxyXG5cclxuXHQvKipcclxuXHQgKiBPcGVuIHRoZSB0b3VjaCBwcm9ncmVzcyBtZW51XHJcblx0ICpcclxuXHQgKi9cclxuXHRPUEVOX1BST0dSRVNTX01FTlU6ICdPUEVOX1BST0dSRVNTX01FTlUnLFxyXG5cclxuXHQvKipcclxuXHQgKiBDbG9zZSB0aGUgdG91Y2ggcHJvZ3Jlc3MgbWVudVxyXG5cdCAqXHJcblx0ICovXHJcblx0Q0xPU0VfUFJPR1JFU1NfTUVOVTogJ0NMT1NFX1BST0dSRVNTX01FTlUnLFxyXG5cclxuXHQvKipcclxuXHQgKiBNYWtlIHRoZSBwcm9ncmVzcyBtZW51IHZpc2libGVcclxuXHQgKlxyXG5cdCAqL1xyXG5cdFNIT1dfUFJPR1JFU1NfTUVOVTogJ1NIT1dfUFJPR1JFU1NfTUVOVScsXHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpZGUgdGhlIHByb2dyZXNzIG1lbnUgdmlzaWJsZVxyXG5cdCAqXHJcblx0ICovXHJcblx0SElERV9QUk9HUkVTU19NRU5VOiAnSElERV9QUk9HUkVTU19NRU5VJyxcclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSBhbGwgc2NyZWVuIGNvbnRlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdEhJREVfU0NSRUVOUzogJ0hJREVfU0NSRUVOUycsXHJcblxyXG5cdC8qKlxyXG5cdCAqIFVuaGlkZSBzY3JlZW4gY29udGVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0U0hPV19TQ1JFRU5TOiAnU0hPV19TQ1JFRU5TJyxcclxuXHJcblx0LyoqXHJcblx0ICogU2NyZWVuIGRlcGVuZGVuY3kgaXMgbG9hZGluZ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNjcmVlbiBpZCB0aGF0IGlzIGJlaW5nIGxvYWRlZFxyXG5cdCAqXHJcblx0ICovXHJcblx0TE9BRElOR19TQ1JFRU5fREFUQTogJ0xPQURJTkdfU0NSRUVOX0RBVEEnLFxyXG5cclxuXHQvKipcclxuXHQgKiBTY3JlZW4gZGVwZW5kZW5jeSBoYXMgZmluaXNoZWQgbG9hZGluZ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS5pZCAtIHNjcmVlbiBpZCB0aGF0IHdhcyBsb2FkZWRcclxuXHQgKiBAcHJvcGVydHkge0FueX0gZGF0YS5kYXRhIC0gZGF0YSByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXJcclxuXHQgKlxyXG5cdCAqL1xyXG5cdFNDUkVFTl9EQVRBX0xPQURFRDogJ1NDUkVFTl9EQVRBX0xPQURFRCdcclxufVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEJyb29rcyBGaW5kZXIgSGVscGVyIEZ1bmN0aW9uc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmhlbHBlcnMgPSB7XHJcblx0LyoqXHJcblx0ICogQWRkIGJyb3dzZXIgdmVuZG9yIHByZWZpeGVzIHRvIHN0eWxlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IHByb3BlcnR5IG5hbWU6IHZhbHVlXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgdmFsdWVzXHJcblx0ICpcclxuXHQgKi9cclxuXHRwcmVmaXhlZENzc09iamVjdDogZnVuY3Rpb24ob2JqKSB7XHJcblx0XHR2YXIgcHJlZml4ZXMgPSBbJ3dlYmtpdCcsICdtcycsICdtb3onXVxyXG5cdFx0dmFyIGNzc09iaiA9IHt9XHJcblx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBvYmopIHtcclxuXHRcdFx0Y3NzT2JqW3Byb3BlcnR5XSA9IG9ialtwcm9wZXJ0eV1cclxuXHRcdFx0cHJlZml4ZXMubWFwKGZ1bmN0aW9uKHByZWZpeCkge1xyXG5cdFx0XHRcdGNzc09ialsnLScgKyBwcmVmaXggKyAnLScgKyBwcm9wZXJ0eV0gPSBvYmpbcHJvcGVydHldXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY3NzT2JqXHJcblx0fSxcclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBhIHNjcmVlbiBpcyBhIGZvcm1cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBTY3JlZW4gb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Qm9vbH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGlzRm9ybVNjcmVlbjogZnVuY3Rpb24oc2NyZWVuKSB7XHJcblx0XHRyZXR1cm4gc2NyZWVuLnR5cGUgPT09ICdmb3JtJ1xyXG5cdH0sXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgYnJvd3NlciBpcyBJRVxyXG5cdCAqIFNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMTgyNTE1Ny9pbnRlcm5ldC1leHBsb3Jlci0xMS1kZXRlY3Rpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtCb29sfVxyXG5cdCAqXHJcblx0ICovXHJcblx0aXNJRTogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gKFxyXG5cdFx0XHRuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEgfHxcclxuXHRcdFx0bmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZignVHJpZGVudC8nKSA+IDBcclxuXHRcdClcclxuXHR9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBTdWJtaXQgZXZlbnRzIHRvIGV4dGVybmFsIGFuYWx5dGljcyBzZXJ2aWNlIHByb3ZpZGVyXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuc2VydmljZSgnYW5hbHl0aWNzJywgZnVuY3Rpb24oc2NvcGUpIHtcclxuXHQvKipcclxuXHQgKiBTdWJtaXQgYW5hbHl0aWMgZXZlbnRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG9mIGV2ZW50XHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgZXZlbnQgKG9wdGlvbmFsKVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZXZlbnQobmFtZSwgZWwsIGRhdGEpIHtcclxuXHRcdC8vIGlmICghd2luZG93LmV2ZW50VHJhY2tpbmdFdmVudHMpIHJldHVyblxyXG5cdFx0Ly8gdmFyIGV2ZW50Q29uZmlnID0gd2luZG93LmV2ZW50VHJhY2tpbmdFdmVudHNbbmFtZV1cclxuXHRcdC8vIGlmICghZXZlbnRDb25maWcgfHwgIWV2ZW50Q29uZmlnLmRhdGEgfHwgdHlwZW9mIGV2ZW50Q29uZmlnLmRhdGEgIT09ICdmdW5jdGlvbicpIHJldHVyblxyXG5cdFx0Ly8gLy8gaWYgZXZlbnQgc2hvdWxkIGJlIHVuaXF1ZSB0byBzZXNzaW9uIGNoZWNrIGlmIGFscmVhZHkgc3VibWl0dGVkXHJcblx0XHQvLyBpZiAoZXZlbnRDb25maWcudW5pcXVlICYmIGV2ZW50QWxyZWFkeVN1Ym1pdHRlZChuYW1lKSkgcmV0dXJuXHJcblx0XHQvLyAvLyBzdWJtaXQgZXZlbnQgdG8gR0FcclxuXHRcdC8vIHRyeSB7XHJcblx0XHQvLyBcdHZhciBkYXRhID0gZXZlbnRDb25maWcuZGF0YShlbCwgZGF0YSlcclxuXHRcdC8vIH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHQvLyBcdHJldHVybiBzY29wZS5lcnJvcihlcnJvcilcclxuXHRcdC8vIH1cclxuXHRcdC8vIGlmICghIWRhdGEpIHtcclxuXHRcdC8vIFx0d2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW11cclxuXHRcdC8vIFx0d2luZG93LmRhdGFMYXllci5wdXNoKGRhdGEpXHJcblx0XHQvLyB9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBldmVudCBoYXMgYWxyZWFkeSBiZWVuIHN1Ym1pdHRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS5jYXRlZ29yeVxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLmFjdGlvblxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLmxhYmVsXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZXZlbnRBbHJlYWR5U3VibWl0dGVkKG5hbWUpIHtcclxuXHRcdGlmICghd2luZG93LmRhdGFMYXllcikgcmV0dXJuIGZhbHNlXHJcblxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0d2luZG93LmRhdGFMYXllci5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRyZXR1cm4gZXZlbnQuZXZlbnQgPT09IG5hbWVcclxuXHRcdFx0fSkubGVuZ3RoID4gMFxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGV2ZW50OiBldmVudFxyXG5cdH1cclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBBUEkgU2VydmljZVxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLnNlcnZpY2UoJ2FwaScsIGZ1bmN0aW9uKHNjb3BlKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdC8qKlxyXG5cdFx0ICogTWFrZSBhIGNhbGwgdG8gdGhlIEFQSVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgLSB0aGUgZW5kcG9pbnQgdXJsXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIHRoZSByZXF1ZXN0IHR5cGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7RnVuY3Rpb259IHByb21pc2VcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGNhbGw6IGZ1bmN0aW9uKHVybCwgdHlwZSkge1xyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcblx0XHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHRcdHVybDogdXJsLFxyXG5cdFx0XHRcdFx0dHlwZTogdHlwZSxcclxuXHRcdFx0XHRcdGRhdGE6IEJGLnNlcnZpY2VzLmZvcm0uZm9ybVZhbHVlcygpLFxyXG5cdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRcdFx0XHRyZXNvbHZlKGRhdGEpXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0XHRyZWplY3QoJ1RoZXJlIHdhcyBhbiBlcnJvci4gUGxlYXNlIHRyeSBhZ2FpbicpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9XHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgRGV2aWNlIFNlcnZpY2VcclxuICogVHJhY2tzIGRldmljZSBpbmZvcm1hdGlvblxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLnNlcnZpY2UoJ2RldmljZScsIGZ1bmN0aW9uKHNjb3BlKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdHNsb3dDb25uZWN0aW9uVGhyZXNob2xkOiAyMDAwXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IGluaXRpYWwgc3RhdGUgICovXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRoYXNUb3VjaDogaXNUb3VjaERldmljZSgpLFxyXG5cdFx0aGFzU2xvd0Nvbm5lY3Rpb246IGhhc1Nsb3dOZXR3b3JrQ29ubmVjdGlvbigpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZXRlcm1pbmUgaWYgZGV2aWNlIHN1cHBvcnRzIHRvdWNoIGV2ZW50c1xyXG5cdCAqXHJcblx0ICogQHJldHVybnMge0Jvb2x9XHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaXNUb3VjaERldmljZSgpIHtcclxuXHRcdHZhciBwcmVmaXhlcyA9ICcgLXdlYmtpdC0gLW1vei0gLW8tIC1tcy0gJy5zcGxpdCgnICcpXHJcblx0XHR2YXIgbXEgPSBmdW5jdGlvbihxdWVyeSkge1xyXG5cdFx0XHRyZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXNcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoXHJcblx0XHRcdCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyB8fFxyXG5cdFx0XHQod2luZG93LkRvY3VtZW50VG91Y2ggJiYgZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKVxyXG5cdFx0KSB7XHJcblx0XHRcdHJldHVybiB0cnVlXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaW5jbHVkZSB0aGUgJ2hlYXJ0eicgYXMgYSB3YXkgdG8gaGF2ZSBhIG5vbiBtYXRjaGluZyBNUSB0byBoZWxwIHRlcm1pbmF0ZSB0aGUgam9pblxyXG5cdFx0Ly8gaHR0cHM6Ly9naXQuaW8vdnpuRkhcclxuXHRcdHZhciBxdWVyeSA9IFsnKCcsIHByZWZpeGVzLmpvaW4oJ3RvdWNoLWVuYWJsZWQpLCgnKSwgJ2hlYXJ0eicsICcpJ10uam9pbignJylcclxuXHRcdHJldHVybiBtcShxdWVyeSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERldGVybWluZSBpZiBkZXZpY2UgaGFzIGEgc2xvdyBuZXR3b3JrIGNvbm5lY3Rpb25cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtCb29sfVxyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGhhc1Nsb3dOZXR3b3JrQ29ubmVjdGlvbigpIHtcclxuXHRcdGlmICghd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2UudGltaW5nKSByZXR1cm4gZmFsc2VcclxuXHJcblx0XHQvLyBpZiBpdCB0b29rIGEgbG9uZyB0aW1lIHRvIHJlY2VpdmUgcGFnZSByZXNwb25zZSBmcm9tIHNlcnZlciB0aGV5IGhhdmUgYSB2ZXJ5IHNsb3cgY29ubmVjdGlvblxyXG5cdFx0cmV0dXJuIChcclxuXHRcdFx0d2luZG93LnBlcmZvcm1hbmNlLnRpbWluZy5yZXNwb25zZVN0YXJ0IC0gd2luZG93LnBlcmZvcm1hbmNlLnRpbWluZy5yZXF1ZXN0U3RhcnQgPlxyXG5cdFx0XHRzY29wZS5wcm9wcy5zbG93Q29ubmVjdGlvblRocmVzaG9sZFxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGhhc1RvdWNoOiBzY29wZS5zdGF0ZS5oYXNUb3VjaCxcclxuXHRcdGhhc1Nsb3dDb25uZWN0aW9uOiBzY29wZS5zdGF0ZS5oYXNTbG93Q29ubmVjdGlvblxyXG5cdH1cclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBGb3JtIFNlcnZpY2VcclxuICogVHJhY2tzIGZvcm0gaW5wdXQgdmFsdWVzXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuc2VydmljZSgnZm9ybScsIGZ1bmN0aW9uKHNjb3BlKSB7XHJcblx0LyoqIFNldCBpbml0aWFsIHN0YXRlICAqL1xyXG5cdHNjb3BlLnN0YXRlID0ge1xyXG5cdFx0Zm9ybVZhbHVlczogW10sXHJcblx0XHRmb3JtU3RlcHM6IFtdLFxyXG5cdFx0c2VuZFByb2dyZXNzSGFuZGxlcjogbnVsbFxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIERPTSBlbGVtZW50cyAgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHRmb3JtOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdmb3JtW25hbWU9XCJiZi1mb3JtXCJdJylcclxuXHR9XHJcblxyXG5cdC8qKiBUZXJtaW5hdGUgaWYgZm9ybSBlbGVtZW50IGlzIG5vdCBmb3VuZCAgKi9cclxuXHRpZiAoIXNjb3BlLmVscy5mb3JtKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ0Zvcm0gbm90IGZvdW5kJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlYWQgZm9ybSB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4ge0FycmF5fSBhcnJheSBvZiBpbnB1dHMgYW5kIHRoZWlyIHZhbHVlc1xyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGZvcm1WYWx1ZXMoKSB7XHJcblx0XHRyZXR1cm4gJChzY29wZS5lbHMuZm9ybSkuc2VyaWFsaXplQXJyYXkoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IGZvcm0gdmFsdWUgc3RhdGUsIGJyb2FkY2FzdCB0byBjb21wb25lbnRzXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtBcnJheX0gYXJyYXkgb2YgaW5wdXRzIGFuZCB0aGVpciB2YWx1ZXNcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzZXRGb3JtVmFsdWVzKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUuZm9ybVZhbHVlcyA9IGZvcm1WYWx1ZXMoKVxyXG5cdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuU0VUX0ZPUk1fVkFMVUVTLCBzY29wZS5zdGF0ZS5mb3JtVmFsdWVzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzZXRzIGZvcm0gcHJvZ3Jlc3NcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHJlc2V0Rm9ybSgpIHtcclxuXHRcdCQoc2NvcGUuZWxzLmZvcm0pXHJcblx0XHRcdC5maW5kKCdpbnB1dDp0ZXh0LCBpbnB1dDpwYXNzd29yZCwgaW5wdXQ6ZmlsZSwgc2VsZWN0LCB0ZXh0YXJlYScpXHJcblx0XHRcdC52YWwoJycpXHJcblx0XHQkKHNjb3BlLmVscy5mb3JtKVxyXG5cdFx0XHQuZmluZCgnaW5wdXQ6cmFkaW8sIGlucHV0OmNoZWNrYm94JylcclxuXHRcdFx0LnJlbW92ZUF0dHIoJ2NoZWNrZWQnKVxyXG5cdFx0XHQucmVtb3ZlQXR0cignc2VsZWN0ZWQnKVxyXG5cclxuXHRcdCQoc2NvcGUuZWxzLmZvcm0pXHJcblx0XHRcdC5maW5kKCdpbnB1dDpyYWRpbywgaW5wdXQ6Y2hlY2tib3gnKVxyXG5cdFx0XHQuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR0aGlzLmNoZWNrZWQgPSBmYWxzZVxyXG5cdFx0XHR9KVxyXG5cclxuXHRcdHNldEZvcm1WYWx1ZXMoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBpbnB1dCBjdXJyZW50bHkgaGFzIGEgdmFsdWVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZE5hbWUgLSBuYW1lIG9mIGZpZWxkXHJcblx0ICogQHJldHVybiB7Qm9vbH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBpbnB1dEhhc1ZhbHVlKGZpZWxkTmFtZSkge1xyXG5cdFx0dmFyIGZpbHRlcmVkID0gc2NvcGUuc3RhdGUuZm9ybVZhbHVlcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRyZXR1cm4gaXRlbS5uYW1lID09IGZpZWxkTmFtZVxyXG5cdFx0fSlcclxuXHJcblx0XHRyZXR1cm4gZmlsdGVyZWQubGVuZ3RoID8gdHJ1ZSA6IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBhIGZvcm0gc3RlcCBoYXMgYmVlbiBjb21wbGV0ZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBmb3JtIHN0ZXAgb2JqZWN0XHJcblx0ICogQHJldHVybiB7Qm9vbH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdGVwQ29tcGxldGVkKHN0ZXApIHtcclxuXHRcdGlmICghc3RlcCkgcmV0dXJuIGZhbHNlXHJcblxyXG5cdFx0dmFyIGNvbXBsZXRlZCA9IHRydWVcclxuXHRcdHN0ZXAucmVxdWlyZWRGaWVsZHMubWFwKGZ1bmN0aW9uKG5hbWUpIHtcclxuXHRcdFx0Y29tcGxldGVkID0gY29tcGxldGVkID8gaW5wdXRIYXNWYWx1ZShuYW1lKSA6IGNvbXBsZXRlZFxyXG5cdFx0fSlcclxuXHRcdHJldHVybiBjb21wbGV0ZWRcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIGlmIHN0ZXAgaXMgY29tcGxldGVkIGJ5IGlkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZm9ybSBzdGVwIChzY3JlZW4pIGlkXHJcblx0ICogQHJldHVybiB7Qm9vbH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBjb21wbGV0ZWRCeUlkKGlkKSB7XHJcblx0XHRyZXR1cm4gc3RlcENvbXBsZXRlZChzdGVwQnlJZChpZCkpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBzdGVwIGlzIGNvbXBsZXRlZCBieSBpbmRleFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGZvcm0gc3RlcCBpbmRleFxyXG5cdCAqIEByZXR1cm4ge0Jvb2x9XHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29tcGxldGVkQnlJbmRleChpbmRleCkge1xyXG5cdFx0cmV0dXJuIHN0ZXBDb21wbGV0ZWQoc2NvcGUuc3RhdGUuZm9ybVN0ZXBzW2luZGV4XSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBjb21wbGV0ZWQgZm9ybSBzdGVwc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiB7QXJyYXl9IG9mIGZvcm0gc3RlcCBvYmplY3RzXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gY29tcGxldGVkU3RlcHMoKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuc3RhdGUuZm9ybVN0ZXBzLmZpbHRlcihzdGVwQ29tcGxldGVkKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgZm9ybSBpcyBjb3BtbGV0ZVxyXG5cdCAqXHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBmb3JtSXNDb21wbGV0ZSgpIHtcclxuXHRcdHJldHVybiBzY29wZS5zdGF0ZS5mb3JtU3RlcHMuZmlsdGVyKHN0ZXBDb21wbGV0ZWQpLmxlbmd0aCA9PT0gc2NvcGUuc3RhdGUuZm9ybVN0ZXBzLmxlbmd0aFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgZm9ybSBzdGVwIGJ5IGl0J3MgaWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBmb3JtIHN0ZXAgKHNjcmVlbikgaWRcclxuXHQgKiBAcmV0dXJuIHtBcnJheX0gb2YgZm9ybSBzdGVwIG9iamVjdHNcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzdGVwQnlJZChpZCkge1xyXG5cdFx0cmV0dXJuIHNjb3BlLnN0YXRlLmZvcm1TdGVwcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRyZXR1cm4gaXRlbS5pZCA9PT0gaWRcclxuXHRcdH0pWzBdXHJcblx0fVxyXG5cclxuXHQvKiogTGlzdGVuIGZvciBldmVudHMgKi9cclxuXHJcblx0Ly8gbWFrZSBzdXJlIGZvcm0gaXNuJ3Qgc3VibWl0dGVkXHJcblx0c2NvcGUuZWxzLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0fSlcclxuXHJcblx0LyoqIFNldCBmb3JtIHZhbHVlcyBvbiBwYWdlIGxvYWQgKi9cclxuXHJcblx0c2NvcGUuc3RhcnQoZnVuY3Rpb24oKSB7XHJcblx0XHRzZXRGb3JtVmFsdWVzKClcclxuXHR9KVxyXG5cclxuXHQvKiogU2VydmljZSBBUEkgKi9cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdC8qKlxyXG5cdFx0ICogUmVnaXN0ZXJzIGZvcm0gc3RlcCBvbiBwYWdlIGxvYWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIG9iamVjdCB3aXRoIHNjcmVlbiBpZCB7U3RyaW5nfSBhbmQgcmVxdWlyZWRGaWVsZHMge0FycmF5fSAoYXJyYXkgb2YgaW5wdXQgbmFtZXMpXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRyZWdpc3RlckZvcm1TdGVwOiBmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdHNjb3BlLnN0YXRlLmZvcm1TdGVwcy5wdXNoKGRhdGEpXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBUZWxsIEZvcm0gc2VydmljZSB0byB1cGRhdGUgZm9ybSBpbnB1dCB2YWx1ZXNcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdHVwZGF0ZUZvcm1WYWx1ZXM6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQvLyB0aW1lb3V0IGVuc3VyZXMgRE9NIHZhbHVlcyBhcmUgdXBkYXRlZFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNldEZvcm1WYWx1ZXMoKVxyXG5cdFx0XHR9KVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogU2VuZCBwcm9ncmVzcyB0byBzZXJ2ZXJcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdHNlbmRGb3JtUHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHQvLyB3YWl0IGhhbGYgYSBzZWNvbmQgc28gYWxsIHVwZGF0ZXMgYXJlIGluY2x1ZGVkXHJcblx0XHRcdGNsZWFyVGltZW91dChzY29wZS5zdGF0ZS5zZW5kUHJvZ3Jlc3NIYW5kbGVyKVxyXG5cdFx0XHRzY29wZS5zdGF0ZS5zZW5kUHJvZ3Jlc3NIYW5kbGVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRCRi5zZXJ2aWNlcy5hcGkuY2FsbChCRi5lbmRwb2ludHMuc2VuZFByb2dyZXNzLnVybCwgQkYuZW5kcG9pbnRzLnNlbmRQcm9ncmVzcy50eXBlKVxyXG5cdFx0XHR9LCA1MDApXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgZm9ybSB2YWx1ZXNcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJuIHtBcnJheX0gaW5wdXQgbmFtZXMgYW5kIHRoZWlyIHZhbHVlc1xyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0Zm9ybVZhbHVlczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY29wZS5zdGF0ZS5mb3JtVmFsdWVzXHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGlucHV0IHZhbHVlIGJ5IG5hbWVcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJuIHtTdHJpbmd9IGZvcm0gdmFsdWVcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGlucHV0VmFsdWVTdHJpbmc6IGZ1bmN0aW9uKGlucHV0TmFtZSkge1xyXG5cdFx0XHR2YXIgbWF0Y2hlcyA9IHNjb3BlLnN0YXRlLmZvcm1WYWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0XHRyZXR1cm4gaXRlbS5uYW1lID09IGlucHV0TmFtZVxyXG5cdFx0XHR9KVxyXG5cclxuXHRcdFx0Ly8gaWYgaW5wdXQgbm90IGZvdW5kIG9yIGlucHV0IHZhbHVlIGlzIGVtcHR5IHJldHVybiB1bmRlZmluZWRcclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdCFtYXRjaGVzLmxlbmd0aCB8fFxyXG5cdFx0XHRcdG1hdGNoZXMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0XHRcdHJldHVybiBpdGVtLnZhbHVlLmxlbmd0aCA+IDBcclxuXHRcdFx0XHR9KS5sZW5ndGggPT09IDBcclxuXHRcdFx0KVxyXG5cdFx0XHRcdHJldHVybiAnJ1xyXG5cclxuXHRcdFx0dmFyIHZhbHVlU3RyaW5nID0gJydcclxuXHRcdFx0bWF0Y2hlcy5tYXAoZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcclxuXHRcdFx0XHR2YWx1ZVN0cmluZyArPSAoaW5kZXggPiAwID8gJywnIDogJycpICsgaXRlbS52YWx1ZVxyXG5cdFx0XHR9KVxyXG5cdFx0XHRyZXR1cm4gdmFsdWVTdHJpbmdcclxuXHRcdH0sXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayBpZiBhbGwgZm9ybSBzdGVwcyBhcmUgY29tcGxldGVkXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybiB7Qm9vbH1cclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGFsbFN0ZXBzQ29tcGxldGVkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIGNvbXBsZXRlZFN0ZXBzKCkubGVuZ3RoID09PSBzY29wZS5zdGF0ZS5mb3JtU3RlcHMubGVuZ3RoXHJcblx0XHR9LFxyXG5cclxuXHRcdC8qKiBHZXQgY29tcGxldGVkIGZvcm0gc3RlcHNcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJuIHtBcnJheX0gb2YgZm9ybSBzdGVwIG9iamVjdHNcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGNvbXBsZXRlZFN0ZXBzOiBjb21wbGV0ZWRTdGVwcyxcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENoZWNrIGlmIHN0ZXAgaXMgY29tcGxldGVkIGJ5IGlkXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGZvcm0gc3RlcCAoc2NyZWVuKSBpZFxyXG5cdFx0ICogQHJldHVybiB7Qm9vbH1cclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGNvbXBsZXRlZEJ5SWQ6IGNvbXBsZXRlZEJ5SWQsXHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDaGVjayBpZiBzdGVwIGlzIGNvbXBsZXRlZCBieSBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBmb3JtIHN0ZXAgaW5kZXhcclxuXHRcdCAqIEByZXR1cm4ge0Jvb2x9XHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRjb21wbGV0ZWRCeUluZGV4OiBjb21wbGV0ZWRCeUluZGV4LFxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogUmVzZXRzIGZvcm0gcHJvZ3Jlc3NcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdHJlc2V0OiByZXNldEZvcm0sXHJcblx0XHQvKipcclxuXHRcdCAqIENoZWNrIGlmIGZvcm0gaXMgY29wbWxldGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJuIHtCb29sZWFufVxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0Zm9ybUlzQ29tcGxldGU6IGZvcm1Jc0NvbXBsZXRlXHJcblx0fVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEhpc3Rvcnkgc2VydmljZSBtYW5hZ2VzIHRoZSBicm93c2VyIGhpc3Rvcnkgc3RhdGUgYW5kIHJlc3BvbmRzIHRvIHBvcHN0YXRlIGV2ZW50c1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLnNlcnZpY2UoJ2hpc3RvcnknLCBmdW5jdGlvbihzY29wZSkge1xyXG5cdC8qKiBTZXQgaW5pdGlhbCBzdGF0ZSAgKi9cclxuXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRpbml0aWFsaXplZDogZmFsc2UsXHJcblx0XHRuYXZpZ2F0aW5nQnlQb3BzdGF0ZTogZmFsc2VcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlZ2lzdGVycyBzY3JlZW4gb24gcGFnZSBsb2FkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIGFjdGl2ZSB7T2JqZWN0fSBzY3JlZW4gb2JqZWN0LCBwcmV2aW91cyB7T2JqZWN0fSBzY3JlZW5vYmplY3QsIHJldmVyc2Uge0Jvb2x9XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZShkYXRhKSB7XHJcblx0XHQvLyBpZiBmaXJzdCBzY3JlZW4gY2hhbmdlLCByZXNldCBoaXN0b3J5IHN0YXRlXHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLmluaXRpYWxpemVkKSB7XHJcblx0XHRcdHNjb3BlLnN0YXRlLmluaXRpYWxpemVkID0gdHJ1ZVxyXG5cdFx0XHRyZXR1cm4gaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBpZDogZGF0YS5hY3RpdmUuaWQgfSwgZGF0YS5hY3RpdmUuaWQsICcnKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIG5vcm1hbCBzY3JlZW4gdHJhbnNpdGlvbiBwdXNoIHRvIGhpc3Rvcnkgc3RhY2tcclxuXHRcdGlmICghc2NvcGUuc3RhdGUubmF2aWdhdGluZ0J5UG9wc3RhdGUpIHtcclxuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoeyBpZDogZGF0YS5hY3RpdmUuaWQgfSwgbnVsbCwgbnVsbClcclxuXHRcdH1cclxuXHJcblx0XHRzY29wZS5zdGF0ZS5pbml0aWFsaXplZCA9IHRydWVcclxuXHRcdHNjb3BlLnN0YXRlLm5hdmlnYXRpbmdCeVBvcHN0YXRlID0gZmFsc2VcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmdW5jdGlvbihlKSB7XHJcblx0XHRpZiAoIWUuc3RhdGUgfHwgIWUuc3RhdGUuaWQpIHJldHVyblxyXG5cdFx0c2NvcGUuc3RhdGUubmF2aWdhdGluZ0J5UG9wc3RhdGUgPSB0cnVlXHJcblx0XHRCRi5zZXJ2aWNlcy5zY3JlZW5zLmNoYW5nZVNjcmVlbihlLnN0YXRlLmlkKVxyXG5cdH0pXHJcblxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgb25TY3JlZW5DaGFuZ2UpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2NyZWVucyBTZXJ2aWNlXHJcbiAqIE1hbmFnZXMgc2NyZWVuIG5hdmlnYXRpb24sIHRyYW5zaXRpb25zLCBhbmQgYnJvd3NlciBoaXN0b3J5XHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuc2VydmljZSgnc2NyZWVucycsIGZ1bmN0aW9uKHNjb3BlKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdHRyYW5zaXRpb25MZW5ndGg6IDIwMDBcclxuXHR9XHJcblxyXG5cdC8qKiBTZXQgaW5pdGlhbCBzdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdGluaXRpYWxpemVkOiBmYWxzZSxcclxuXHRcdHRyYW5zaXRpb25JblByb2dyZXNzOiBmYWxzZSxcclxuXHRcdGxvYWRpbmdEZXBlbmRlbmN5OiBmYWxzZSxcclxuXHRcdGFjdGl2ZVNjcmVlbklkOiBudWxsLFxyXG5cdFx0cHJldmlvdXNTY3JlZW5JZDogbnVsbCxcclxuXHRcdHNjcmVlbnM6IFtdXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaG9vc2VzIGluaXRpYWwgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KCkge1xyXG5cdFx0Ly8gTWFrZSBzdXJlIHNjcmVlbnMgaGF2ZSByZWdpc3RlcmVkIGJlZm9yZSBwcm9jZWVkaW5nLiBGaXggZm9yIEZpcmVmb3ggdGltaW5nIGlzc3VlXHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLnNjcmVlbnMubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdGluaXQoKVxyXG5cdFx0XHR9LCA1MClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBnbyBkaXJlY3RseSB0byByZXN1bHRzIHBhZ2UgaWYgYWxsIHN0ZXBzIGFyZSBjb21wbGV0ZWRcclxuXHRcdGlmIChCRi5zZXJ2aWNlcy5mb3JtLmFsbFN0ZXBzQ29tcGxldGVkKCkpIHtcclxuXHRcdFx0cmV0dXJuIGluaXRTY3JlZW5DaGFuZ2Uoc2NvcGUuc3RhdGUuc2NyZWVuc1tzY29wZS5zdGF0ZS5zY3JlZW5zLmxlbmd0aCAtIDFdLmlkKVxyXG5cdFx0fVxyXG5cdFx0Ly8gZWxzZSBnbyB0byBzdGFydCBzY3JlZW5cclxuXHRcdGluaXRTY3JlZW5DaGFuZ2Uoc2NvcGUuc3RhdGUuc2NyZWVuc1swXS5pZClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNvZnRseSByZXF1ZXN0IGEgc2NyZWVuIGNoYW5nZS4gSWYgc2NyZWVuIGlzIGFscmVhZHkgY29tcGxldGVkIGl0IHdpbGwgc2hvdyBuZXh0IHVudmlzaXRlZCBzY3JlZW5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSByZXF1ZXN0ZWRJbmRleCAtIHJlcXVlc3RlZCBzY3JlZW4gaW5kZXhcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiByZXF1ZXN0U2NyZWVuQ2hhbmdlKHJlcXVlc3RlZEluZGV4KSB7XHJcblx0XHR2YXIgbmV4dENvbXBsZXRlZFN0ZXAgPSBudWxsXHJcblx0XHR2YXIgbmV4dEluY29tcGxldGVTdGVwID0gbnVsbFxyXG5cdFx0dmFyIGN1cnJlbnRTY3JlZW5JbmRleCA9IHNjcmVlbkluZGV4KHNjb3BlLnN0YXRlLmFjdGl2ZVNjcmVlbklkKVxyXG5cdFx0dmFyIHJlcXVlc3RlZFNjcmVlbiA9IHNjb3BlLnN0YXRlLnNjcmVlbnNbcmVxdWVzdGVkSW5kZXhdXHJcblxyXG5cdFx0Ly8gaWYgcmVxdWVzdGVkIHNjcmVlbiBpcyB0aGUgbGFzdCBvbmUgb3IgZ3JlYXRlciwgc2hvdyBsYXN0IHNjcmVlblxyXG5cdFx0aWYgKHJlcXVlc3RlZEluZGV4ID49IHNjb3BlLnN0YXRlLnNjcmVlbnMubGVuZ3RoIC0gMSkge1xyXG5cdFx0XHRyZXR1cm4gaW5pdFNjcmVlbkNoYW5nZShzY29wZS5zdGF0ZS5zY3JlZW5zW3Njb3BlLnN0YXRlLnNjcmVlbnMubGVuZ3RoIC0gMV0uaWQpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgcmVxdWVzdGVkIHNjcmVlbiBkb2VzIG5vdCBleGlzdCByZXR1cm5cclxuXHRcdGlmICghc2NvcGUuc3RhdGUuc2NyZWVuc1tyZXF1ZXN0ZWRJbmRleF0pIHJldHVyblxyXG5cclxuXHRcdC8vIGlmIHJlcXVlc3RlZCBzY3JlZW4gaXMgY29tcGxldGUgc2tpcCBpdFxyXG5cdFx0aWYgKEJGLmhlbHBlcnMuaXNGb3JtU2NyZWVuKHJlcXVlc3RlZFNjcmVlbikgJiYgc2NyZWVuSXNDb21wbGV0ZShyZXF1ZXN0ZWRTY3JlZW4uaWQpKSB7XHJcblx0XHRcdHJldHVybiByZXF1ZXN0U2NyZWVuQ2hhbmdlKHJlcXVlc3RlZEluZGV4ICsgMSlcclxuXHRcdH1cclxuXHJcblx0XHQvLyBjaGVjayBmb3JtIGNvbXBsZXRpb25cclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjb3BlLnN0YXRlLnNjcmVlbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0Ly8gaWdub3JlIHNjcmVlbnMgdGhhdCBhcmVuJ3QgZm9ybXNcclxuXHRcdFx0aWYgKCFCRi5oZWxwZXJzLmlzRm9ybVNjcmVlbihzY29wZS5zdGF0ZS5zY3JlZW5zW2ldKSkgY29udGludWVcclxuXHJcblx0XHRcdC8vIGlmIHRoZXJlcyBhbiBpbmNvbXBsZXRlIGZvcm0gc2NyZWVuIGJlZm9yZSByZXF1ZXN0ZWQgaW5kZXgsIGdvIHRvIHRoYXQgc2NyZWVuXHJcblx0XHRcdGlmIChpIDwgcmVxdWVzdGVkSW5kZXggJiYgIXNjcmVlbklzQ29tcGxldGUoc2NvcGUuc3RhdGUuc2NyZWVuc1tpXS5pZCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gaW5pdFNjcmVlbkNoYW5nZShzY29wZS5zdGF0ZS5zY3JlZW5zW2ldLmlkKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyB0YWtlIG5vdGUgb2YgdGhlIG5leHQgY29tcGxldGVkIGFuZCBpbmNvbXBsZXRlIHN0ZXBzXHJcblx0XHRcdGlmIChpID4gcmVxdWVzdGVkSW5kZXggJiYgc2NyZWVuSXNDb21wbGV0ZShzY29wZS5zdGF0ZS5zY3JlZW5zW2ldLmlkKSkge1xyXG5cdFx0XHRcdG5leHRDb21wbGV0ZWRTdGVwID0gbmV4dENvbXBsZXRlZFN0ZXAgPT09IG51bGwgPyBpIDogbmV4dENvbXBsZXRlZFN0ZXBcclxuXHRcdFx0fSBlbHNlIGlmICghc2NyZWVuSXNDb21wbGV0ZShzY29wZS5zdGF0ZS5zY3JlZW5zW2ldLmlkKSkge1xyXG5cdFx0XHRcdG5leHRJbmNvbXBsZXRlU3RlcCA9IG5leHRJbmNvbXBsZXRlU3RlcCA9PT0gbnVsbCA/IGkgOiBuZXh0SW5jb21wbGV0ZVN0ZXBcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlJ3MgYSBwcmlvcml0eSBzY3JlZW4gKGNoZWNrcG9pbnQpIGJldHdlZW4gY3VycmVudCBhbmQgcmVxdWVzdGVkIHNjcmVlbiwgZ28gdG8gaXRcclxuXHJcblx0XHR2YXIgcHJpb3JpdHlTY3JlZW4gPSBudWxsXHJcblxyXG5cdFx0aWYgKGN1cnJlbnRTY3JlZW5JbmRleCAhPT0gbnVsbCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlcXVlc3RlZEluZGV4OyBpKyspIHtcclxuXHRcdFx0XHQvLyBpZiBhbm90aGVyIHNjcmVlbiBvZiBzYW1lIHR5cGUgYXMgcHJpb3JpdHkgc2NyZWVuIGlzIHBhc3NlZCwgY2xlYXIgcHJpb3JpdHkgc2NyZWVuXHJcblx0XHRcdFx0aWYgKHByaW9yaXR5U2NyZWVuICYmIHNjb3BlLnN0YXRlLnNjcmVlbnNbaV0udHlwZSA9PSBwcmlvcml0eVNjcmVlbi50eXBlKSB7XHJcblx0XHRcdFx0XHRwcmlvcml0eVNjcmVlbiA9IG51bGxcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vIGlmIHRoZXJlJ3MgYSBwcmlvcml0eSBzY3JlZW4gYmV0d2VlbiBjdXJyZW50IGFuZCByZXF1ZXN0ZWQgc2NyZWVuLCBtYXJrIGl0IGFzIHRoZSBwcmlvcml0eSBzY3JlZW5cclxuXHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRzY29wZS5zdGF0ZS5zY3JlZW5zW2ldLmhhc1ByaW9yaXR5ICYmXHJcblx0XHRcdFx0XHRpID4gc2NyZWVuSW5kZXgoc2NvcGUuc3RhdGUuYWN0aXZlU2NyZWVuSWQpXHJcblx0XHRcdFx0KSB7XHJcblx0XHRcdFx0XHRwcmlvcml0eVNjcmVlbiA9IHNjb3BlLnN0YXRlLnNjcmVlbnNbaV1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSB0aGVyZSBpcyBhbiB1bmFuc3dlcmVkIHF1ZXN0aW9uIGJldHdlZW4gcmVxdWVzdGVkIGFuZCBwcmlvcml0eSBzY3JlZW4gYmVmb3JlIHRyYW5zaXRpb25pbmcgdG8gaXRcclxuXHRcdFx0aWYgKHByaW9yaXR5U2NyZWVuKSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IHNjcmVlbkluZGV4KHByaW9yaXR5U2NyZWVuLmlkKTsgaSA8PSByZXF1ZXN0ZWRJbmRleDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAoXHJcblx0XHRcdFx0XHRcdEJGLmhlbHBlcnMuaXNGb3JtU2NyZWVuKHNjb3BlLnN0YXRlLnNjcmVlbnNbaV0pICYmXHJcblx0XHRcdFx0XHRcdCFzY3JlZW5Jc0NvbXBsZXRlKHNjb3BlLnN0YXRlLnNjcmVlbnNbaV0uaWQpXHJcblx0XHRcdFx0XHQpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIGluaXRTY3JlZW5DaGFuZ2UocHJpb3JpdHlTY3JlZW4uaWQpXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgcmVxdWVzdGVkIHNjcmVlbiBpcyBpbmNvbXBsZXRlIGdvIHRvIGl0XHJcblx0XHRpZiAoQkYuaGVscGVycy5pc0Zvcm1TY3JlZW4ocmVxdWVzdGVkU2NyZWVuKSAmJiAhc2NyZWVuSXNDb21wbGV0ZShyZXF1ZXN0ZWRTY3JlZW4uaWQpKSB7XHJcblx0XHRcdHJldHVybiBpbml0U2NyZWVuQ2hhbmdlKHJlcXVlc3RlZFNjcmVlbi5pZClcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiBhbGwgc3RlcHMgYXJlIGNvbXBsZXRlZFxyXG5cdFx0aWYgKG5leHRJbmNvbXBsZXRlU3RlcCA9PT0gbnVsbCkge1xyXG5cdFx0XHR2YXIgbGFzdEZvcm1TY3JlZW5JbmRleCA9IHNjcmVlbkluZGV4KHNjcmVlbnNCeVR5cGUoJ2Zvcm0nKS5wb3AoKS5pZClcclxuXHRcdFx0Ly8gaWYgcmVxdWVzdGluZyBhIHNjcmVlbiBwYXN0IHRoZSBsYXN0IGZvcm0gc2NyZWVuIGdvIHRvIGl0LCBvdGhlcndpc2UgZ28gdG8gc2NyZWVuIGRpcmVjdGx5IGFmdGVyIGxhc3QgZm9ybSBzY3JlZW5cclxuXHRcdFx0cmV0dXJuIHJlcXVlc3RlZEluZGV4ID4gbGFzdEZvcm1TY3JlZW5JbmRleFxyXG5cdFx0XHRcdD8gaW5pdFNjcmVlbkNoYW5nZShyZXF1ZXN0ZWRTY3JlZW4uaWQpXHJcblx0XHRcdFx0OiByZXF1ZXN0U2NyZWVuQ2hhbmdlKGxhc3RGb3JtU2NyZWVuSW5kZXggKyAxKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHRoZXJlJ3MgYSBmdXR1cmUgY29tcGxldGVkIHN0ZXAsIGdvIHRvIHNjcmVlbiBhZnRlciBpdFxyXG5cdFx0aWYgKG5leHRDb21wbGV0ZWRTdGVwICE9PSBudWxsKSB7XHJcblx0XHRcdHJldHVybiByZXF1ZXN0U2NyZWVuQ2hhbmdlKG5leHRDb21wbGV0ZWRTdGVwICsgMSlcclxuXHRcdH1cclxuXHJcblx0XHQvLyBnbyB0byByZXF1ZXN0ZWQgc2NyZWVuXHJcblx0XHRpbml0U2NyZWVuQ2hhbmdlKHJlcXVlc3RlZFNjcmVlbi5pZClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemVzIHRoZSBzY3JlZW4gY2hhbmdlIHByb2Nlc3NcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHRoZSBpZCBvZiB0aGUgc2NyZWVuIGl0IHNob3VsZCB0cmFuc2l0aW9uIHRvXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaW5pdFNjcmVlbkNoYW5nZShpZCkge1xyXG5cdFx0aWYgKFxyXG5cdFx0XHQhaWQgfHxcclxuXHRcdFx0c2NvcGUuc3RhdGUuYWN0aXZlU2NyZWVuSWQgPT0gaWQgfHxcclxuXHRcdFx0c2NvcGUuc3RhdGUudHJhbnNpdGlvbkluUHJvZ3Jlc3MgfHxcclxuXHRcdFx0c2NvcGUuc3RhdGUubG9hZGluZ0RlcGVuZGVuY3lcclxuXHRcdClcclxuXHRcdFx0cmV0dXJuXHJcblxyXG5cdFx0dmFyIHNjcmVlbiA9IHNjcmVlbkJ5SWQoaWQpXHJcblxyXG5cdFx0Ly8gY2hlY2sgZm9yIGRlcGVuZGVuY3lcclxuXHJcblx0XHRpZiAoIXNjcmVlbi5kZXBlbmRlbmN5KSB7XHJcblx0XHRcdHJldHVybiBjaGFuZ2VTY3JlZW4oaWQpXHJcblx0XHR9XHJcblxyXG5cdFx0c2NvcGUuc3RhdGUubG9hZGluZ0RlcGVuZGVuY3kgPSB0cnVlXHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5MT0FESU5HX1NDUkVFTl9EQVRBLCBzY3JlZW4uaWQpXHJcblxyXG5cdFx0c2NyZWVuXHJcblx0XHRcdC5kZXBlbmRlbmN5KClcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRcdHNjb3BlLnN0YXRlLmxvYWRpbmdEZXBlbmRlbmN5ID0gZmFsc2VcclxuXHRcdFx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5TQ1JFRU5fREFUQV9MT0FERUQsIHtcclxuXHRcdFx0XHRcdGlkOiBzY3JlZW4uaWQsXHJcblx0XHRcdFx0XHRkYXRhOiBkYXRhXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0Y2hhbmdlU2NyZWVuKHNjcmVlbi5pZClcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24obWVzc2FnZSkge1xyXG5cdFx0XHRcdGFsZXJ0KG1lc3NhZ2UpXHJcblx0XHRcdFx0c2NvcGUuc3RhdGUubG9hZGluZ0RlcGVuZGVuY3kgPSBmYWxzZVxyXG5cdFx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hhbmdlcyB0aGUgc2NyZWVuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSB0aGUgaWQgb2YgdGhlIHNjcmVlbiBpdCBzaG91bGQgdHJhbnNpdGlvbiB0b1xyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIGNoYW5nZVNjcmVlbihpZCkge1xyXG5cdFx0dmFyIGFjdGl2ZSwgcHJldmlvdXMsIGRhdGFcclxuXHJcblx0XHQvLyB1cGRhdGUgc3RhdGVcclxuXHJcblx0XHRzY29wZS5zdGF0ZS50cmFuc2l0aW9uSW5Qcm9ncmVzcyA9IHRydWVcclxuXHRcdHNjb3BlLnN0YXRlLnByZXZpb3VzU2NyZWVuSWQgPSBzY29wZS5zdGF0ZS5hY3RpdmVTY3JlZW5JZFxyXG5cdFx0c2NvcGUuc3RhdGUuYWN0aXZlU2NyZWVuSWQgPSBpZFxyXG5cclxuXHRcdGFjdGl2ZSA9IHNjcmVlbkJ5SWQoc2NvcGUuc3RhdGUuYWN0aXZlU2NyZWVuSWQpXHJcblx0XHRwcmV2aW91cyA9IHNjcmVlbkJ5SWQoc2NvcGUuc3RhdGUucHJldmlvdXNTY3JlZW5JZClcclxuXHJcblx0XHR2YXIgZGF0YSA9IHtcclxuXHRcdFx0YWN0aXZlOiBhY3RpdmUsXHJcblx0XHRcdHByZXZpb3VzOiBwcmV2aW91cyxcclxuXHRcdFx0cmV2ZXJzZTogcHJldmlvdXMgPyBzY3JlZW5JbmRleChhY3RpdmUuaWQpIDwgc2NyZWVuSW5kZXgocHJldmlvdXMuaWQpIDogZmFsc2VcclxuXHRcdH1cclxuXHJcblx0XHQvLyBwcmVwYXJlIHRyYW5zaXRpb25cclxuXHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgZGF0YSlcclxuXHJcblx0XHQvLyBhZnRlciByZXBhaW50IHN0YXJ0IHRoZSBhbmltYXRpb25cclxuXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNjb3BlLmVtaXQoQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX0FDVElWRSwgZGF0YSlcclxuXHJcblx0XHRcdFx0Ly8gc2Nyb2xsIHRvIHRvcCBvZiBwYWdlIGluYmV0d2VlbiBlbnRlciAvIGxlYXZlIHRyYW5zaXRpb25zXHJcblxyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHR3aW5kb3cuc2Nyb2xsVG8oMCwgMClcclxuXHRcdFx0XHR9LCA3NTApXHJcblxyXG5cdFx0XHRcdC8vIGVuZCB0cmFuc2l0aW9uXHJcblxyXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIGRhdGEpXHJcblx0XHRcdFx0XHRzY29wZS5zdGF0ZS50cmFuc2l0aW9uSW5Qcm9ncmVzcyA9IGZhbHNlXHJcblxyXG5cdFx0XHRcdFx0Ly8gZW1pdCBzY3JlZW4gZXZlbnRcclxuXHJcblx0XHRcdFx0XHRpZiAod2luZG93LkN1c3RvbUV2ZW50ID09PSB1bmRlZmluZWQpIHJldHVyblxyXG5cclxuXHRcdFx0XHRcdHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCgnc2hvZUZpbmRlclNjcmVlbkNoYW5nZScsIHtcclxuXHRcdFx0XHRcdFx0YnViYmxlczogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0Y2FuY2VsYWJsZTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0ZGV0YWlsOiB7XHJcblx0XHRcdFx0XHRcdFx0cHJldmlvdXM6IGRhdGEucHJldmlvdXMgPyBkYXRhLnByZXZpb3VzLmlkIDogbnVsbCxcclxuXHRcdFx0XHRcdFx0XHRhY3RpdmU6IGRhdGEuYWN0aXZlLmlkXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pXHJcblxyXG5cdFx0XHRcdFx0dmFyIHNjcmVlbiA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG5cdFx0XHRcdFx0XHQnW2RhdGEtYmYtc2NyZWVuXVtkYXRhLWlkPVwiJyArIGRhdGEuYWN0aXZlLmlkICsgJ1wiXSdcclxuXHRcdFx0XHRcdClcclxuXHJcblx0XHRcdFx0XHRpZiAoc2NyZWVuKSB7XHJcblx0XHRcdFx0XHRcdHNjcmVlbi5kaXNwYXRjaEV2ZW50KGV2ZW50KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0sIHNjb3BlLnByb3BzLnRyYW5zaXRpb25MZW5ndGgpXHJcblx0XHRcdH0pXHJcblx0XHR9LCA1MClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhIHNjcmVlbiBieSBpZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gc2NyZWVuIGlkXHJcblx0ICogQHJldHVybnMge09iamVjdH0gU2NyZWVuIG9iamVjdFxyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjcmVlbkJ5SWQoaWQpIHtcclxuXHRcdHJldHVybiBpZFxyXG5cdFx0XHQ/IHNjb3BlLnN0YXRlLnNjcmVlbnMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0XHRcdHJldHVybiBpdGVtLmlkID09PSBpZFxyXG5cdFx0XHQgIH0pWzBdXHJcblx0XHRcdDogbnVsbFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgc2NyZWVuJ3MgaW5kZXggYnkgaWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHRoZSBzY3JlZW4gaW5kZXhcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBzY3JlZW5JbmRleChpZCkge1xyXG5cdFx0dmFyIGluZGV4ID0gbnVsbFxyXG5cdFx0c2NvcGUuc3RhdGUuc2NyZWVucy5tYXAoZnVuY3Rpb24oaXRlbSwgaSkge1xyXG5cdFx0XHRpZiAoaXRlbS5pZCA9PT0gaWQpIHtcclxuXHRcdFx0XHRpbmRleCA9IGlcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHRcdHJldHVybiBpbmRleFxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IHRoZSBzY3JlZW4gaW5kZXggb2YgdGhlIGFjdGl2ZSBzY3JlZW5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IGluZGV4IG9mIGFjdGl2ZSBzY3JlZW5cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBhY3RpdmVTY3JlZW5JbmRleCgpIHtcclxuXHRcdHJldHVybiBzY3JlZW5JbmRleChzY29wZS5zdGF0ZS5hY3RpdmVTY3JlZW5JZClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCBhbGwgc2NyZWVucyBvZiBhIGNlcnRhaW4gdHlwZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSB0aGUgdHlwZSBvZiBzY3JlZW5cclxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEFycmF5IG9mIHNjcmVlbnMgb2YgdGhlIHJlcXVlc3RlZCB0eXBlXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NyZWVuc0J5VHlwZSh0eXBlKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuc3RhdGUuc2NyZWVucy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRyZXR1cm4gaXRlbS50eXBlID09PSB0eXBlXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgYSBzY3JlZW4gaXMgY29tcGxldGVkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSBzY3JlZW4gaWRcclxuXHQgKiBAcmV0dXJucyB7Qm9vbH0gaXMgc2NyZWVuIGNvbXBsZXRlZFxyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIHNjcmVlbklzQ29tcGxldGUoaWQpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy5mb3JtLmNvbXBsZXRlZEJ5SWQoaWQpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHJlbGF0aXZlIHNjcmVlbiBpbmRleCBieSBpZCwgbWVhbmluZyB0aGUgZGlmZmVyZW5jZSBpbiBwb3NpdGlvbiBpbiB0aGUgcmVnaXN0ZXJlZCBzY3JlZW4gYXJyYXlcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHJlbGF0aXZlIGluZGV4XHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gcmVsYXRpdmVTY3JlZW5JbmRleChpZCkge1xyXG5cdFx0cmV0dXJuIHNjcmVlbkluZGV4KHNjb3BlLnN0YXRlLmFjdGl2ZVNjcmVlbklkKSAtIHNjcmVlbkluZGV4KGlkKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGEgc2NyZWVuJ3MgaW5kZXggb2YgYWxsIHNjcmVlbnMgb2YgYSBjZXJ0YWluIHR5cGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHJlbGF0aXZlIGluZGV4XHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2NyZWVuSW5kZXhCeVR5cGUoaWQsIHR5cGUpIHtcclxuXHRcdGlmICghaWQpIHJldHVybiAwXHJcblxyXG5cdFx0dmFyIGluZGV4ID0gMFxyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc2NvcGUuc3RhdGUuc2NyZWVucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoc2NvcGUuc3RhdGUuc2NyZWVuc1tpXS5pZCA9PT0gaWQpIHtcclxuXHRcdFx0XHRicmVha1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoc2NvcGUuc3RhdGUuc2NyZWVuc1tpXS50eXBlID09PSB0eXBlKSB7XHJcblx0XHRcdFx0aW5kZXgrK1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGluZGV4XHJcblx0fVxyXG5cclxuXHQvKiogU2hvdyBmaXJzdCBzY3JlZW4gb24gcGFnZSBsb2FkICovXHJcblxyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHRzZXRUaW1lb3V0KGluaXQsIDEwMClcclxuXHR9KVxyXG5cclxuXHQvKiogU2VydmljZSBBUEkgKi9cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdC8qKlxyXG5cdFx0ICogUmVnaXN0ZXJzIHNjcmVlbiBvbiBwYWdlIGxvYWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG5cdFx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi5pZCAtIHVuaXF1ZSBpZCBmb3IgdGhlIHNjcmVlblxyXG5cdFx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi50eXBlIChlLmcgZm9ybSwgY2hlY2twb2ludCkgLSB0eXBlIG9mIHNjcmVlblxyXG5cdFx0ICogQHByb3BlcnR5IHtGdW5jdGlvbn0gc2NyZWVuLmRlcGVuZGVuY3kgLSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlXHJcblx0XHQgKiBAcHJvcGVydHkge0Jvb2xlYW59IHNjcmVlbi5oYXNQcmlvcml0eSAtIGlmIHByZXNlbnQsIHRoaXMgc2NyZWVuIHdpbGwgYmUgdmlzaXRlZCBpZiBhdHRlbXB0aW5nIHRvIG5hdmlnYXRlIHRvIGFub3RoZXIgc2NyZWVuIGFmdGVyIHRoaXMgc2NyZWVuIGJ1dCBiZWZvcmUgYW5vdGhlciBzY3JlZW4gb2YgdGhpcyB0eXBlXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRyZWdpc3RlclNjcmVlbjogZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRzY29wZS5zdGF0ZS5zY3JlZW5zLnB1c2goe1xyXG5cdFx0XHRcdGlkOiBkYXRhLmlkLFxyXG5cdFx0XHRcdHR5cGU6IGRhdGEudHlwZSxcclxuXHRcdFx0XHRoYXNQcmlvcml0eTogZGF0YS5oYXNQcmlvcml0eSxcclxuXHRcdFx0XHRkZXBlbmRlbmN5OlxyXG5cdFx0XHRcdFx0ZGF0YS5kZXBlbmRlbmN5ICYmIHR5cGVvZiBkYXRhLmRlcGVuZGVuY3kgPT09ICdmdW5jdGlvbidcclxuXHRcdFx0XHRcdFx0PyBkYXRhLmRlcGVuZGVuY3lcclxuXHRcdFx0XHRcdFx0OiBudWxsXHJcblx0XHRcdH0pXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIG5leHQgc2NyZWVuXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRuZXh0U2NyZWVuOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gbWFrZSBzdXJlIGZvcm0gdmFsdWVzIGhhdmUgdXBkYXRlZFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNjb3BlLnN0YXRlLmFjdGl2ZVNjcmVlbklkID09PSBudWxsXHJcblx0XHRcdFx0XHQ/IHJlcXVlc3RTY3JlZW5DaGFuZ2UoMClcclxuXHRcdFx0XHRcdDogcmVxdWVzdFNjcmVlbkNoYW5nZShhY3RpdmVTY3JlZW5JbmRleCgpICsgMSlcclxuXHRcdFx0fSlcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCAqIEluaXRpYWxpemVzIHRoZSBzY3JlZW4gY2hhbmdlIHByb2Nlc3NcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gaWQgLSB0aGUgaWQgb2YgdGhlIHNjcmVlbiBpdCBzaG91bGQgdHJhbnNpdGlvbiB0b1xyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0Y2hhbmdlU2NyZWVuOiBpbml0U2NyZWVuQ2hhbmdlLFxyXG5cdFx0LyoqXHJcblx0XHQgKiBTb2Z0bHkgcmVxdWVzdCBhIHNjcmVlbiBjaGFuZ2UuIElmIHNjcmVlbiBpcyBhbHJlYWR5IGNvbXBsZXRlZCBpdCB3aWxsIHNob3cgbmV4dCB1bnZpc2l0ZWQgc2NyZWVuXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IHJlcXVlc3RlZEluZGV4IC0gcmVxdWVzdGVkIHNjcmVlbiBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0cmVxdWVzdFNjcmVlbkNoYW5nZTogcmVxdWVzdFNjcmVlbkNoYW5nZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGFjdGl2ZSBzY3JlZW4gb2JqZWN0XHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge09iamVjdH0gYWN0aXZlIHNjcmVlbiBvYmplY3RcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGFjdGl2ZVNjcmVlbjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY3JlZW5CeUlkKHNjb3BlLnN0YXRlLmFjdGl2ZVNjcmVlbklkKVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGFjdGl2ZSBzY3JlZW4gaWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfSBzY3JlZW4gaWRcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGFjdGl2ZVNjcmVlbklkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHNjb3BlLnN0YXRlLmFjdGl2ZVNjcmVlbklkXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgcHJldmlvdXMgc2NyZWVuIGlkXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge1N0cmluZ30gc2NyZWVuIGlkXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRwcmV2aW91c1NjcmVlbklkOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHNjb3BlLnN0YXRlLnByZXZpb3VzU2NyZWVuSWRcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBzY3JlZW5zXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge0FycmF5fSBzY3JlZW4gb2JqZWN0c1xyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0c2NyZWVuczogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY29wZS5zdGF0ZS5zY3JlZW5zXHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgYWxsIHNjcmVlbnMgb2YgYSBjZXJ0YWluIHR5cGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIHRoZSB0eXBlIG9mIHNjcmVlblxyXG5cdFx0ICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBzY3JlZW5zIG9mIHRoZSByZXF1ZXN0ZWQgdHlwZVxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0c2NyZWVuc0J5VHlwZTogc2NyZWVuc0J5VHlwZSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSByZWxhdGl2ZSBzY3JlZW4gaW5kZXggYnkgaWQsIG1lYW5pbmcgdGhlIGRpZmZlcmVuY2UgaW4gcG9zaXRpb24gaW4gdGhlIHJlZ2lzdGVyZWQgc2NyZWVuIGFycmF5XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IGlkIC0gc2NyZWVuIGlkXHJcblx0XHQgKiBAcmV0dXJucyB7TnVtYmVyfSByZWxhdGl2ZSBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0cmVsYXRpdmVTY3JlZW5JbmRleDogcmVsYXRpdmVTY3JlZW5JbmRleCxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGEgZm9ybSBzY3JlZW4ncyBpbmRleFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdFx0ICogQHJldHVybnMge051bWJlcn0gaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGZvcm1TY3JlZW5JbmRleEJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XHJcblx0XHRcdHJldHVybiBzY3JlZW5JbmRleEJ5VHlwZShpZCwgJ2Zvcm0nKVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGEgZm9ybSBzY3JlZW4ncyBpbmRleCBieSBpZFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIHNjcmVlbiBpZFxyXG5cdFx0ICogQHJldHVybnMge051bWJlcn0gaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdHNjcmVlbkluZGV4QnlJZDogZnVuY3Rpb24oaWQpIHtcclxuXHRcdFx0cmV0dXJuIHNjcmVlbkluZGV4KGlkKVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSBjdXJyZW50IGZvcm0gc2NyZWVuIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge051bWJlcn0gaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGFjdGl2ZUZvcm1TY3JlZW5JbmRleDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY3JlZW5JbmRleEJ5VHlwZShzY29wZS5zdGF0ZS5hY3RpdmVTY3JlZW5JZCwgJ2Zvcm0nKVxyXG5cdFx0fVxyXG5cdH1cclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBTY3JvbGwgU2VydmljZVxyXG4gKiBUcmFja3MgdXNlciBzY3JvbGwgcG9zaXRpb24gaW4gYSBzaW5nbGUgbG9jYXRpb24gdG8gcmVkdWNlIGRvY3VtZW50IGV2ZW50IGxpc3RlbmVycywgbWVhc3VyZXMgc2Nyb2xsIGJhciB3aWR0aFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLnNlcnZpY2UoJ3Njcm9sbCcsIGZ1bmN0aW9uKHNjb3BlKSB7XHJcblx0LyoqIFNldCBpbml0aWFsIHN0YXRlICAqL1xyXG5cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdHNjcm9sbFBvc2l0aW9uOiAwLFxyXG5cdFx0c2Nyb2xsYmFyV2lkdGg6IDBcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgZWxlbWVudHMgKi9cclxuXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0JHNjcm9sbENvbnRhaW5lcjogJCh3aW5kb3cpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIYW5kbGUgc2Nyb2xsIGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUuc2Nyb2xsUG9zaXRpb24gPSBzY29wZS5lbHMuJHNjcm9sbENvbnRhaW5lci5zY3JvbGxUb3AoKVxyXG5cdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuVVNFUl9TQ1JPTEwsIHsgeTogc2NvcGUuc3RhdGUuc2Nyb2xsUG9zaXRpb24gfSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1lYXN1cmVzIHRoZSBicm93c2VyJ3Mgc2Nyb2xsYmFyIHdpZHRoXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBwaXhlbCB3aWR0aCBvZiBzY3JvbGwgYmFyXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gc2Nyb2xsYmFyV2lkdGgoKSB7XHJcblx0XHR2YXIgb3V0ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG5cdFx0b3V0ZXIuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nXHJcblx0XHRvdXRlci5zdHlsZS53aWR0aCA9ICcxMDBweCdcclxuXHRcdG91dGVyLnN0eWxlLm1zT3ZlcmZsb3dTdHlsZSA9ICdzY3JvbGxiYXInIC8vIG5lZWRlZCBmb3IgV2luSlMgYXBwc1xyXG5cclxuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob3V0ZXIpXHJcblxyXG5cdFx0dmFyIHdpZHRoTm9TY3JvbGwgPSBvdXRlci5vZmZzZXRXaWR0aFxyXG5cdFx0Ly8gZm9yY2Ugc2Nyb2xsYmFyc1xyXG5cdFx0b3V0ZXIuc3R5bGUub3ZlcmZsb3cgPSAnc2Nyb2xsJ1xyXG5cclxuXHRcdC8vIGFkZCBpbm5lcmRpdlxyXG5cdFx0dmFyIGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuXHRcdGlubmVyLnN0eWxlLndpZHRoID0gJzEwMCUnXHJcblx0XHRvdXRlci5hcHBlbmRDaGlsZChpbm5lcilcclxuXHJcblx0XHR2YXIgd2lkdGhXaXRoU2Nyb2xsID0gaW5uZXIub2Zmc2V0V2lkdGhcclxuXHJcblx0XHQvLyByZW1vdmUgZGl2c1xyXG5cdFx0b3V0ZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvdXRlcilcclxuXHJcblx0XHRyZXR1cm4gd2lkdGhOb1Njcm9sbCAtIHdpZHRoV2l0aFNjcm9sbFxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblxyXG5cdHNjb3BlLmVscy4kc2Nyb2xsQ29udGFpbmVyLm9uKCdzY3JvbGwnLCBmdW5jdGlvbigpIHtcclxuXHRcdGhhbmRsZVNjcm9sbCgpXHJcblx0fSlcclxuXHJcblx0LyoqIFNldCBpbml0aWFsIHZhbHVlcyAqL1xyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUuc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxiYXJXaWR0aCgpXHJcblx0fSwgMTAwKVxyXG5cclxuXHQvKiogU2VydmljZSBBUEkgKi9cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSBicm93c2VyJ3Mgc2Nyb2xsYmFyIHdpZHRoXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge051bWJlcn0gcGl4ZWwgd2lkdGggb2Ygc2Nyb2xsYmFyXHJcblx0XHQgKlxyXG5cdFx0ICovXHJcblx0XHRzY3JvbGxiYXJXaWR0aDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY29wZS5zdGF0ZS5zY3JvbGxiYXJXaWR0aFxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IHRoZSBzY3JvbGwgcG9zaXRpb25cclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7TnVtYmVyfSBwaXhlbHMgZnJvbSB0b3Agb2YgcGFnZVxyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0cG9zaXRpb246IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc2NvcGUuc3RhdGUuc2Nyb2xsUG9zaXRpb25cclxuXHRcdH1cclxuXHR9XHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgV2luZG93IFNlcnZpY2VcclxuICogVHJhY2tzIHdpbmRvdyBzaXplIGluIGEgc2luZ2xlIGxvY2F0aW9uIHRvIHJlZHVjZSB3aW5kb3cgZXZlbnQgbGlzdGVuZXJzXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuc2VydmljZSgnd2luZG93JywgZnVuY3Rpb24oc2NvcGUpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0cmVzaXplVGltZW91dER1cmF0aW9uOiA2MCxcclxuXHRcdGRlc2t0b3BXaWR0aDogMTAyNFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBpbml0aWFsIHN0YXRlICAqL1xyXG5cdHNjb3BlLnN0YXRlID0ge1xyXG5cdFx0d2lkdGg6IDAsXHJcblx0XHRoZWlnaHQ6IDBcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc3BvbmQgdG8gYW5kIHRocm90dGxlIHJlc2l6ZSBldmVudHNcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHR2YXIgcmVzaXplVGltZW91dFxyXG5cclxuXHRmdW5jdGlvbiBoYW5kbGVSZXNpemUoKSB7XHJcblx0XHRpZiAoIXJlc2l6ZVRpbWVvdXQpIHtcclxuXHRcdFx0cmVzaXplVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0cmVzaXplVGltZW91dCA9IG51bGxcclxuXHRcdFx0XHRvblJlc2l6ZSgpXHJcblx0XHRcdH0sIHNjb3BlLnByb3BzLnJlc2l6ZVRpbWVvdXREdXJhdGlvbilcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFmdGVyIGJyb3dzZXIgcmVzaXplXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gb25SZXNpemUoKSB7XHJcblx0XHR1cGRhdGVXaW5kb3dTaXplKClcclxuXHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5XSU5ET1dfUkVTSVpFLCB7XHJcblx0XHRcdHdpZHRoOiBzY29wZS5zdGF0ZS53aWR0aCxcclxuXHRcdFx0aGVpZ2h0OiBzY29wZS5zdGF0ZS5oZWlnaHRcclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGUgd2luZG93IHNpemUgc3RhdGVcclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiB1cGRhdGVXaW5kb3dTaXplKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUud2lkdGggPSBpc05hTih3aW5kb3cuaW5uZXJXaWR0aCkgPyB3aW5kb3cuY2xpZW50V2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aFxyXG5cdFx0c2NvcGUuc3RhdGUuaGVpZ2h0ID0gaXNOYU4od2luZG93LmlubmVySGVpZ2h0KSA/IHdpbmRvdy5jbGllbnRIZWlnaHQgOiB3aW5kb3cuaW5uZXJIZWlnaHRcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cclxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxyXG5cclxuXHQvKiogU2V0IGluaXRpYWwgdmFsdWVzICovXHJcblxyXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHR1cGRhdGVXaW5kb3dTaXplKClcclxuXHR9LCAxMDApXHJcblxyXG5cdC8qKiBTZXJ2aWNlIEFQSSAqL1xyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgdGhlIHdpbmRvdyB3aWR0aFxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHBpeGVsc1xyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0d2lkdGg6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gc2NvcGUuc3RhdGUud2lkdGhcclxuXHRcdH0sXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCB0aGUgd2luZG93IGhlaWdodFxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtOdW1iZXJ9IHBpeGVsc1xyXG5cdFx0ICpcclxuXHRcdCAqL1xyXG5cdFx0aGVpZ2h0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHNjb3BlLnN0YXRlLmhlaWdodFxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICogRGV0ZXJtaW5lIGlmIHdpbmRvdyBpcyBkZXNrdG9wIHNpemVcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Qm9vbGVhbn1cclxuXHRcdCAqXHJcblx0XHQgKi9cclxuXHRcdGlzRGVza3RvcDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiBzY29wZS5zdGF0ZS53aWR0aCA+PSBzY29wZS5wcm9wcy5kZXNrdG9wV2lkdGhcclxuXHRcdH1cclxuXHR9XHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQWxlcnQgQ29tcG9uZW50XHJcbiAqIFNob3dzIGFuIGFsZXJ0IG1vZGFsXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWFsZXJ0XHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdhbGVydCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRhY3RpdmVDbGFzczogJ2JmLWluZm8tb3ZlcmxheS0tb3BlbidcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0Y29udGVudDogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtY29udGVudF0nKSxcclxuXHRcdGJ1dHRvbjogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtYnV0dG9uXScpXHJcblx0fVxyXG5cclxuXHQvKiogVGVybWluYXRlIGlmIGNvbnRlbnQgZWxlbWVudCBpcyBub3QgZm91bmQgICovXHJcblx0aWYgKCFzY29wZS5lbHMuY29udGVudCkge1xyXG5cdFx0cmV0dXJuIHNjb3BlLmVycm9yKCdDb250ZW50IGVsZW1lbnQgbm90IGZvdW5kJylcclxuXHR9XHJcblxyXG5cdC8qKiBIaWRlIGZyb20gc2NyZWVuIHJlYWRlcnMgKi9cclxuXHRlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuXHJcblx0LyoqXHJcblx0ICogT3BlbnMgdGhlIGFsZXJ0IGNvbXBvbmVudFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlSWQgLSB0aGUgdGVtcGxhdGUgaWQgb2YgdGhlIGFsZXJ0IGNvbnRlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9wZW4odGVtcGxhdGVJZCkge1xyXG5cdFx0Ly8gRmluZCB0ZW1wbGF0ZVxyXG5cdFx0dmFyIHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZClcclxuXHJcblx0XHQvLyBUZXJtaW5hdGUgaWYgdGVtcGxhdGUgZG9lcyBub3QgZXhpc3RcclxuXHRcdGlmICghdGVtcGxhdGUpIHtcclxuXHRcdFx0cmV0dXJuIHNjb3BlLmVycm9yKCdJbmZvIG92ZXJsYXkgY29udGVudCBub3QgZm91bmQnKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCBhbmQgY29tcGxpbGUgdGVtcGxhdGUgY29udGVudFxyXG5cdFx0c2NvcGUuZWxzLmNvbnRlbnQuaW5uZXJIVE1MID0gdGVtcGxhdGUuaW5uZXJIVE1MXHJcblx0XHRCRi5jb21waWxlKHNjb3BlLmVscy5jb250ZW50KVxyXG5cclxuXHRcdC8vIExpc3RlbiBmb3Iga2V5IGV2ZW50cyB0aGF0IHNob3VsZCBjbG9zZSB0aGUgYWxlcnRcclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24pXHJcblxyXG5cdFx0Ly8gU2hvdyB0byBzY3JlZW4gcmVhZGVyc1xyXG5cclxuXHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnJ1xyXG5cdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXHJcblxyXG5cdFx0Ly8gRGVsYXkgc2hvdyBhbmltYXRpb24gc28gaXQgYXBwZWFycyBjb3JyZWN0bHkgaW4gRmlyZWZveFxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0XHR9KVxyXG5cdFx0fSwgNTApXHJcblxyXG5cdFx0Ly8gRm9jdXMgdGhlIGNvbnRlbnRcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNjb3BlLmVscy5jb250ZW50LmZvY3VzKClcclxuXHRcdH0sIDI1MClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb3NlcyB0aGUgYWxlcnQgY29tcG9uZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjbG9zZSgpIHtcclxuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuYWN0aXZlQ2xhc3MpXHJcblx0XHR9KVxyXG5cclxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleWRvd24pXHJcblxyXG5cdFx0Ly8gaGlkZSBmcm9tIHNjcmVlbiByZWFkZXJzXHJcblxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0ZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxyXG5cdFx0fSwgNTAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogS2V5ZG93biBoYW5kbGVyIGZ1bmN0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbktleWRvd24oZSkge1xyXG5cdFx0aWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xyXG5cdFx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5DTE9TRV9BTEVSVClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgY2xvc2UpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLk9QRU5fQUxFUlQsIG9wZW4pXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLkNMT1NFX0FMRVJULCBjbG9zZSlcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBBbGVydCBMaW5rIENvbXBvbmVudFxyXG4gKiBPcGVucyBhbiBhbGVydCBtb2RhbFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1hbGVydC1saW5rXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLXRlbXBsYXRlLWlkIC0gY29udGVudCB0ZW1wbGF0ZSBpZFxyXG4gKiBAcHJvcGVydHkgZGF0YS1pbnB1dC1pZCAtIHRoZSBuYW1lIG9mIHRoZSBpbnB1dCBzZWxlY3RlZCB3aGVuIG9wZW5pbmcgdGhlIGFsZXJ0XHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdhbGVydC1saW5rJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0c2VsZWN0ZWRDbGFzczogJ2FjdGl2ZScsXHJcblx0XHR0ZW1wbGF0ZUlkOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGVtcGxhdGUtaWQnKSxcclxuXHRcdGlucHV0SWQ6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pbnB1dC1pZCcpXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IHN0YXRlICovXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRhY3RpdmU6IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIG5leHQgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvcGVuQWxlcnQoKSB7XHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5PUEVOX0FMRVJULCBzY29wZS5wcm9wcy50ZW1wbGF0ZUlkKVxyXG5cdFx0c2NvcGUuc3RhdGUuYWN0aXZlID0gdHJ1ZVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkICdzZWxlY3RlZCcgY2xhc3MgdG8gZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2VsZWN0KCkge1xyXG5cdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5zZWxlY3RlZENsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlICdzZWxlY3RlZCcgY2xhc3MgZnJvbSBlbGVtZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBkZXNlbGVjdCgpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuc2VsZWN0ZWRDbGFzcylcclxuXHRcdHNjb3BlLnN0YXRlLmFjdGl2ZSA9IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBPbiBjbGljayBmdW5jdGlvblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25DbGljaygpIHtcclxuXHRcdHNlbGVjdCgpXHJcblx0XHRvcGVuQWxlcnQoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT24gYWxlcnQgY2xvc2VcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uQ2xvc2UoKSB7XHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLmFjdGl2ZSkgcmV0dXJuXHJcblx0XHRkZXNlbGVjdCgpXHJcblx0XHRjbGVhcklucHV0KClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsZWFyIGFzc29jaWF0ZWQgaW5wdXQgdmFsdWVcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGNsZWFySW5wdXQoKSB7XHJcblx0XHR2YXIgaW5wdXRFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0IycgKyBzY29wZS5wcm9wcy5pbnB1dElkKVxyXG5cdFx0aWYgKCFpbnB1dEVsKSByZXR1cm5cclxuXHRcdGlucHV0RWwuY2hlY2tlZCA9IGZhbHNlXHJcblx0XHRCRi5zZXJ2aWNlcy5mb3JtLnVwZGF0ZUZvcm1WYWx1ZXMoKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLkNMT1NFX0FMRVJULCBvbkNsb3NlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIGRlc2VsZWN0KVxyXG5cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQXJpYSBQcm9ncmVzcyBDb21wb25lbnRcclxuICogRXhwb3NlcyBmaW5kZXIgcHJvZ3Jlc3MgdG8gc2NyZWVuIHJlYWRlcnNcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtYXJpYS1wcm9ncmVzc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnYXJpYS1wcm9ncmVzcycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGhhcyBlbmRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUVuZChkYXRhKSB7XHJcblx0XHRzZXROdW1iZXJPZlN0ZXBzKClcclxuXHRcdGVsLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW5vdycsIGNvbXBsZXRlZEZvcm1TdGVwcygpKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBudW1iZXIgb2YgZm9ybSBzdGVwc1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2V0TnVtYmVyT2ZTdGVwcygpIHtcclxuXHRcdGVsLnNldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1heCcsIG51bWJlck9mRm9ybVN0ZXBzKCkpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIG51bWJlciBvZiBjb21wbGV0ZWQgZm9ybSBzdGVwc1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY29tcGxldGVkRm9ybVN0ZXBzKCkge1xyXG5cdFx0cmV0dXJuIEJGLnNlcnZpY2VzLmZvcm0uY29tcGxldGVkU3RlcHMoKS5sZW5ndGhcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgbnVtYmVyIG9mIGZvcm0gc3RlcHMgb24gdGhlIHBhZ2VcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG51bWJlck9mRm9ybVN0ZXBzKCkge1xyXG5cdFx0cmV0dXJuIEJGLnNlcnZpY2VzLnNjcmVlbnMuc2NyZWVuc0J5VHlwZSgnZm9ybScpLmxlbmd0aFxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX0VORCwgb25TY3JlZW5DaGFuZ2VFbmQpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQmVoaW5kIHRoZSBTY2llbmNlIExpbmsgQ29tcG9uZW50XHJcbiAqIEluc2VydHMgYmVoaW5kIHRoZSBzY2llbmNlIGxpbmtcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtYmVoaW5kLXRoZS1zY2llbmNlLWxpbmtcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtdGVtcGxhdGUtaWQgLSB0ZW1wbGF0ZSBpZFxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS1zY3JlZW4tdGl0bGUgLSBzY3JlZW4gdGl0bGUgc3RyaW5nIGZvciBhbmFseXRpY3MgZXZlbnRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2JlaGluZC10aGUtc2NpZW5jZS1saW5rJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFRlcm1pbmF0ZSBpZiB0ZW1wbGF0ZSBpZCBpcyBub3QgY3VycmVjdGx5IGRlZmluZWQgICovXHJcblx0aWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnQmVoaW5kVGhlU2NpZW5jZUxpbmsnKSkge1xyXG5cdFx0cmV0dXJuIHNjb3BlLmVycm9yKCdCZWhpbmQgdGhlIHNjaWVuY2UgbGluayB0ZW1wbGF0ZSBub3QgZm91bmQnKVxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdHRlbXBsYXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnQmVoaW5kVGhlU2NpZW5jZUxpbmsnKS5pbm5lckhUTUwsXHJcblx0XHR0ZW1wbGF0ZUlkOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGVtcGxhdGUtaWQnKSxcclxuXHRcdHNjcmVlblRpdGxlOiBlbC5oYXNBdHRyaWJ1dGUoJ2RhdGEtc2NyZWVuLXRpdGxlJylcclxuXHRcdFx0PyBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NyZWVuLXRpdGxlJylcclxuXHRcdFx0OiB1bmRlZmluZWRcclxuXHR9XHJcblxyXG5cdC8qKiBJbml0aWFsaXplICAqL1xyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdGVtcGxhdGUgPSBzY29wZS5wcm9wcy50ZW1wbGF0ZS5yZXBsYWNlKFxyXG5cdFx0XHQnZGF0YS10ZW1wbGF0ZS1pZCcsXHJcblx0XHRcdCdkYXRhLXRlbXBsYXRlLWlkPVwiJyArIHNjb3BlLnByb3BzLnRlbXBsYXRlSWQgKyAnXCInXHJcblx0XHQpXHJcblxyXG5cdFx0dGVtcGxhdGUgPSBzY29wZS5wcm9wcy5zY3JlZW5UaXRsZVxyXG5cdFx0XHQ/IHRlbXBsYXRlLnJlcGxhY2UoXHJcblx0XHRcdFx0XHQnZGF0YS1zY3JlZW4tdGl0bGUnLFxyXG5cdFx0XHRcdFx0J2RhdGEtc2NyZWVuLXRpdGxlPVwiJyArIHNjb3BlLnByb3BzLnNjcmVlblRpdGxlICsgJ1wiJ1xyXG5cdFx0XHQgIClcclxuXHRcdFx0OiB0ZW1wbGF0ZVxyXG5cclxuXHRcdHRlbXBsYXRlID0gJCh0ZW1wbGF0ZSlbMF1cclxuXHJcblx0XHQkKGVsKS5odG1sKHRlbXBsYXRlKVxyXG5cdFx0QkYuY29tcGlsZSh0ZW1wbGF0ZSlcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEJ1dHRvblxyXG4gKiBBZGRzIGtleWJvYXJkIGV2ZW50IGxpc3RlbmVycyB0byB0cmlnZ2VyIGNsaWNrIG9uIHNwYWNlYmFyIGFuZCBlbnRlciAobmVjY2Vzc2FyeSBmb3Igc2NyZWVuIHJlYWRlcnMpXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWNidXR0b25cclxuICogQHByb3BlcnR5IGRhdGEtcHJldmVudC1kZWZhdWx0IC0gaWYgYXR0cmlidXRlIGlzIHByZXNlbnQgZXZlbnQgZGVmYXVsdCB3aWxsIGJlIHByZXZlbnRlZFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnYnV0dG9uJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIERlZmluZSBwcm9wcyAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0cHJldmVudERlZmF1bHQ6IGVsLmhhc0F0dHJpYnV0ZSgnZGF0YS1wcmV2ZW50LWRlZmF1bHQnKVxyXG5cdH1cclxuXHJcblx0ZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbihlKSB7XHJcblx0XHRpZiAoZS5rZXlDb2RlID09IDMyIHx8IGUua2V5Q29kZSA9PSAxMykge1xyXG5cdFx0XHRlbC5jbGljaygpXHJcblx0XHRcdHNjb3BlLnByb3BzLnByZXZlbnREZWZhdWx0ICYmIGUucHJldmVudERlZmF1bHQoKVxyXG5cdFx0fVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQ2Fyb3VzZWwgQ29tcG9uZW50XHJcbiAqIEEgc2ltcGxlIGltYWdlIGNhcm91c2VsIHVzaW5nIEpRdWVyeSBTbGlja1xyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1jYXJvdXNlbFxyXG4gKiBAcHJvcGVydHkgZGF0YS1pdGVtcyAtIHBsYWNlIG9uIGl0ZW0gY29udGFpbmVyIGVsZW1lbnRcclxuICogQHByb3BlcnR5IGRhdGEtdGh1bWJuYWlscyAtIHBsYWNlIG9uIHRodW1ibmFpbCBjb250YWluZXIgZWxlbWVudFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnY2Fyb3VzZWwnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0c2VsZWN0ZWRUaHVtYm5haWxDbGFzczogJ3NlbGVjdGVkJ1xyXG5cdH1cclxuXHJcblx0LyoqIFNldCBzdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdGluaXRpYXRlZDogZmFsc2VcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0Y29udGFpbmVyOiBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pdGVtc10nKSxcclxuXHRcdHRodW1ibmFpbENvbnRhaW5lcjogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtdGh1bWJuYWlsc10nKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSB0aGUgY2Fyb3VzZWwgY2Fyb3VzZWxcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXRDYXJvdXNlbCgpIHtcclxuXHRcdGlmIChzY29wZS5zdGF0ZS5pbml0aWF0ZWQpIHJldHVyblxyXG5cclxuXHRcdHNjb3BlLnN0YXRlLmluaXRpYXRlZCA9IHRydWVcclxuXHJcblx0XHQvLyBjb3B5IGl0ZW1zIHRvIHRodW1ibmFpbHNcclxuXHJcblx0XHRzY29wZS5lbHMudGh1bWJuYWlsQ29udGFpbmVyLmlubmVySFRNTCA9IHNjb3BlLmVscy5jb250YWluZXIuaW5uZXJIVE1MXHJcblxyXG5cdFx0JChzY29wZS5lbHMuY29udGFpbmVyKS5zbGljayh7XHJcblx0XHRcdGRvdHM6IHRydWUsXHJcblx0XHRcdHNsaWRlc1RvU2hvdzogMSxcclxuXHRcdFx0c2xpZGVzVG9TY3JvbGw6IDEsXHJcblx0XHRcdGFycm93czogZmFsc2VcclxuXHRcdH0pXHJcblxyXG5cdFx0Ly8gTWFrZSB0aHVtYm5haWxzIGNsaWNrYWJsZVxyXG5cclxuXHRcdHRodW1ibmFpbHMoKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JChzY29wZS5lbHMuY29udGFpbmVyKS5zbGljaygnc2xpY2tHb1RvJywgJCh0aGlzKS5pbmRleCgpKVxyXG5cdFx0XHR9KVxyXG5cdFx0fSlcclxuXHJcblx0XHQvLyBhZGQgYWN0aXZlIGNsYXNzIHRvIHRodW1ibmFpbHNcclxuXHJcblx0XHQkKHNjb3BlLmVscy5jb250YWluZXIpLm9uKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbihldnQsIHNsaWNrLCBjdXJyZW50SW5kZXgsIG5leHRJbmRleCkge1xyXG5cdFx0XHR0aHVtYm5haWxzKCkucmVtb3ZlQ2xhc3Moc2NvcGUucHJvcHMuc2VsZWN0ZWRUaHVtYm5haWxDbGFzcylcclxuXHRcdFx0dGh1bWJuYWlscygpW25leHRJbmRleF0uY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5zZWxlY3RlZFRodW1ibmFpbENsYXNzKVxyXG5cdFx0fSlcclxuXHJcblx0XHQvLyBhZGQgYm9yZGVyIHRvIGZpcnN0IGl0ZW1cclxuXHJcblx0XHQvLyBhZGQgYm9yZGVyIHRvIGZpcnN0IGl0ZW1cclxuXHRcdGlmKHRodW1ibmFpbHMoKS5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdHRodW1ibmFpbHMoKVswXS5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnNlbGVjdGVkVGh1bWJuYWlsQ2xhc3MpXHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJObyB0aHVtYm5haWxzIGZvdW5kLi4uXCIpO1xyXG5cdFx0fVx0XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGh1bWJuYWlsIGVsZW1lbnRzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB0aHVtYm5haWxzKCkge1xyXG5cdFx0cmV0dXJuICQoc2NvcGUuZWxzLnRodW1ibmFpbENvbnRhaW5lcikuY2hpbGRyZW4oKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX0FDVElWRSwgaW5pdENhcm91c2VsKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIGZ1bmN0aW9uKCkge1xyXG5cdFx0JChzY29wZS5lbHMuY29udGFpbmVyKS5zbGljaygnc2V0UG9zaXRpb24nKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQ2hhbmdlIFNjcmVlbiBMaW5rIENvbXBvbmVudFxyXG4gKiBDaGFuZ2UgdGhlIHNjcmVlbiBvbiBjbGlja1xyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1jaGFuZ2Utc2NyZWVuLWxpbmtcclxuICogQHByb3BlcnR5IGRhdGEtaWQgLSBzY3JlZW4gaWQgdG8gbmF2aWdhdGUgdG9cclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2NoYW5nZS1zY3JlZW4tbGluaycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRpZDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJylcclxuXHR9XHJcblxyXG5cdGlmICghc2NvcGUucHJvcHMuaWQpIHJldHVybiBzY29wZS5lcnJvcignU2NyZWVuIElkIG5vdCBzcGVjaWZpZWQnKVxyXG5cclxuXHQvKipcclxuXHQgKiBFbWl0cyBjaGFuZ2Ugc2NyZWVuIGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjaGFuZ2VTY3JlZW4oZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0XHRCRi5zZXJ2aWNlcy5zY3JlZW5zLmNoYW5nZVNjcmVlbihzY29wZS5wcm9wcy5pZClcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2hhbmdlU2NyZWVuKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENoZWNrcG9pbnQgSGVhZGVyIENvbXBvbmVudFxyXG4gKiBTaG93cyB0aGUgb3ZlcmFsbCBwcm9ncmVzcyBvbiBjaGVja3BvaW50IHNjcmVlbnNcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtY2hlY2twb2ludC1oZWFkZXJcclxuICogQHByb3BlcnR5IGRhdGEtYmFyIC0gcGxhY2UgdGhpcyBhdHRyaWJ1dGUgb24gdGhlICdwcm9ncmVzcyBiYXInIGVsZW1lbnRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2NoZWNrcG9pbnQtaGVhZGVyJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGFjdGl2ZUNsYXNzOiAnYmYtY2hlY2twb2ludC1oZWFkZXItLWFjdGl2ZScsXHJcblx0XHRiYXJUaW1lb3V0OiA1MDAgLy8gZGVsYXkgYmFyIGFuaW1hdGlvbiBzbyBpdCBzaG93cyBhZnRlciBzY3JlZW4gdHJhbnNpdGlvbiBpcyBjb21wbGV0ZVxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIERPTSBlbGVtZW50cyAgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHRiYXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJhcl0nKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIHRoZSBwcm9ncmVzcyBiYXIgd2lkdGhcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZUJhcigpIHtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoc2NvcGUuZWxzLmJhcikuY3NzKFxyXG5cdFx0XHRcdEJGLmhlbHBlcnMucHJlZml4ZWRDc3NPYmplY3Qoe1xyXG5cdFx0XHRcdFx0dHJhbnNmb3JtOiAnc2NhbGVYKCcgKyBhY3RpdmVGb3JtU3RlcCgpIC8gbnVtYmVyT2ZGb3JtU3RlcHMoKSArICcpJ1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdClcclxuXHRcdH0sIHNjb3BlLnByb3BzLmJhclRpbWVvdXQpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTY3JlZW4gY2hhbmdlIHN0YXJ0IGV2ZW50IGNhbGxiYWNrXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gc2NyZWVuXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi5pZCAtIHVuaXF1ZSBpZCBmb3IgdGhlIHNjcmVlblxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzY3JlZW4udHlwZSAoZS5nIGZvcm0sIGNoZWNrcG9pbnQpIC0gdHlwZSBvZiBzY3JlZW5cclxuXHQgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBzY3JlZW4uZGVwZW5kZW5jeSAtIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2VcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uU2NyZWVuQ2hhbmdlU3RhcnQoZGF0YSkge1xyXG5cdFx0Ly8gaWYgaXRzIGEgY2hlY2twb2ludCBzY3JlZW4gcmVzZXQgYmFyIHRvIDBcclxuXHRcdGlmIChkYXRhLmFjdGl2ZS50eXBlID09PSAnY2hlY2twb2ludCcpIHtcclxuXHRcdFx0JChzY29wZS5lbHMuYmFyKS5jc3MoXHJcblx0XHRcdFx0QkYuaGVscGVycy5wcmVmaXhlZENzc09iamVjdCh7XHJcblx0XHRcdFx0XHR0cmFuc2Zvcm06ICdzY2FsZVgoMCknXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0KVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2NyZWVuIGNoYW5nZSBhY3RpdmUgZXZlbnQgY2FsbGJhY2tcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBzY3JlZW5cclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gc2NyZWVuLmlkIC0gdW5pcXVlIGlkIGZvciB0aGUgc2NyZWVuXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi50eXBlIChlLmcgZm9ybSwgY2hlY2twb2ludCkgLSB0eXBlIG9mIHNjcmVlblxyXG5cdCAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNjcmVlbi5kZXBlbmRlbmN5IC0gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5DaGFuZ2VBY3RpdmUoZGF0YSkge1xyXG5cdFx0Ly8gaWYgaXRzIGEgY2hlY2twb2ludCBzY3JlZW4gc2hvdyB0aGUgaGVhZGVyIGFuZCB1cGRhdGUgcHJvZ3Jlc3MgYmFyXHJcblx0XHRpZiAoZGF0YS5hY3RpdmUudHlwZSA9PT0gJ2NoZWNrcG9pbnQnKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMuYWN0aXZlQ2xhc3MpXHJcblx0XHRcdHVwZGF0ZUJhcigpXHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cdFx0Ly8gaWYgaXRzIG5vdCBhIGNoZWNrcGludCBoaWRlIHRoZSBoZWFkZXJcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuYWN0aXZlQ2xhc3MpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIGFjdGl2ZSBmb3JtIHN0ZXBcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGFjdGl2ZUZvcm1TdGVwKCkge1xyXG5cdFx0cmV0dXJuIEJGLnNlcnZpY2VzLnNjcmVlbnMuZm9ybVNjcmVlbkluZGV4QnlJZChCRi5zZXJ2aWNlcy5zY3JlZW5zLmFjdGl2ZVNjcmVlbklkKCkpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIG51bWJlciBvZiBmb3JtIHN0ZXBzIG9uIHRoZSBwYWdlXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBudW1iZXJPZkZvcm1TdGVwcygpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy5zY3JlZW5zLnNjcmVlbnNCeVR5cGUoJ2Zvcm0nKS5sZW5ndGhcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUsIG9uU2NyZWVuQ2hhbmdlQWN0aXZlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgb25TY3JlZW5DaGFuZ2VTdGFydClcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBTaG9lIEZpbmRlciBDaXR5IC8gVHJhaWwgU1ZHIENvbXBvbmVudFxyXG4gKiBEeW5hbWljIHN2ZyBjb21wb25lbnQgc3BlY2lmaWMgdG8gdGhlIHNob2UgZmluZGVyXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWNpdHktdHJhaWxcclxuICogQHByb3BlcnR5IGRhdGEtaW1hZ2UtY29udGFpbmVyIC0gcGxhY2UgdGhpcyBhdHRyaWJ1dGUgb24gdGhlIGltYWdlIGNvbnRhaW5lciBlbGVtZW50XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXVybCAtIHRoZSB1cmwgb2YgdGhlIHN2ZyBmaWxlXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXRlcnJhaW4taW5wdXQtbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBmb3JtIGlucHV0XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXRyYWlsLWlucHV0LXZhbHVlIC0gdGhlIHZhbHVlIG9mIHRyYWlsXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXJvYWQtaW5wdXQtdmFsdWUgLSB0aGUgdmFsdWUgb2Ygcm9hZFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnY2l0eS10cmFpbCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qIEFkZCBlYXNpbmcgZnVuY3Rpb24gdG8ganF1ZXJ5ICovXHJcblxyXG5cdCQuZWFzaW5nLmVhc2VJbk91dEN1YmljID0gZnVuY3Rpb24oeCwgdCwgYiwgYywgZCkge1xyXG5cdFx0aWYgKCh0IC89IGQgLyAyKSA8IDEpIHJldHVybiAoYyAvIDIpICogdCAqIHQgKiB0ICsgYlxyXG5cdFx0cmV0dXJuIChjIC8gMikgKiAoKHQgLT0gMikgKiB0ICogdCArIDIpICsgYlxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGxvYWRlZENsYXNzOiAnYmYtY2l0eS10cmFpbC0tbG9hZGVkJyxcclxuXHRcdGVudGVyaW5nQ2xhc3M6ICdiZi1jaXR5LXRyYWlsLS1lbnRlcicsXHJcblx0XHRlbnRlckFjdGl2ZUNsYXNzOiAnYmYtY2l0eS10cmFpbC0tZW50ZXItYWN0aXZlJyxcclxuXHRcdGxlYXZpbmdDbGFzczogJ2JmLWNpdHktdHJhaWwtLWxlYXZlJyxcclxuXHRcdGxlYXZlQWN0aXZlQ2xhc3M6ICdiZi1jaXR5LXRyYWlsLS1sZWF2ZS1hY3RpdmUnLFxyXG5cdFx0bGVhdmVBY3RpdmVSZXZlcnNlQ2xhc3M6ICdiZi1jaXR5LXRyYWlsLS1sZWF2ZS1hY3RpdmUtcmV2ZXJzZScsXHJcblx0XHRhY3RpdmVDbGFzczogJ2JmLWNpdHktdHJhaWwtLWFjdGl2ZScsXHJcblx0XHRzdmdVcmw6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSxcclxuXHRcdGFuaW1hdGlvbkR1cmF0aW9uOiA1MDAsXHJcblx0XHRhbmltYXRpb25FYXNpbmc6ICdlYXNlSW5PdXRDdWJpYycsXHJcblx0XHR0ZXJyYWluSW5wdXROYW1lOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGVycmFpbi1pbnB1dC1uYW1lJykgfHwgJ3N1cmZhY2UnLFxyXG5cdFx0dHJhaWxJbnB1dFZhbHVlOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHJhaWwtaW5wdXQtdmFsdWUnKSB8fCAndHJhaWwnLFxyXG5cdFx0cm9hZElucHV0VmFsdWU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1yb2FkLWlucHV0LXZhbHVlJykgfHwgJ3JvYWQnLFxyXG5cdFx0aW1hZ2VBc3BlY3RSYXRpbzogMS41NFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBpbml0aWFsIFN0YXRlICAqL1xyXG5cdHNjb3BlLnN0YXRlID0ge1xyXG5cdFx0bG9hZGVkOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIERPTSBlbGVtZW50cyAgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHR3cmFwOiBlbC5xdWVyeVNlbGVjdG9yKCcuYmYtY2l0eS10cmFpbF9faW1hZ2Utd3JhcCcpLFxyXG5cdFx0Y29udGFpbmVyOiBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pbWFnZS1jb250YWluZXJdJyksXHJcblx0XHRtaWxlYWdlU2NyZWVuOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1iZi1zY3JlZW5dW2RhdGEtaWQ9XCJNaWxlYWdlXCJdJyksXHJcblx0XHRhcHBDb250YWluZXI6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJmLWFwcF0nKSxcclxuXHRcdGNpdHlNYXNrOiBudWxsLFxyXG5cdFx0dHJhaWxNYXNrOiBudWxsLFxyXG5cdFx0bGluZTogbnVsbFxyXG5cdH1cclxuXHJcblx0LyoqIFRlcm1pbmF0ZSBpZiBzdmcgdXJsIGlzIG5vdCBkZWZpbmVkICAqL1xyXG5cdGlmICghc2NvcGUucHJvcHMuc3ZnVXJsKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ1NWRyB1cmwgbm90IGRlZmluZWQnKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmluZCBTVkcgTWFzayBFbGVtZW50c1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZmluZE1hc2tFbGVtZW50cygpIHtcclxuXHRcdHNjb3BlLmVscy5jaXR5TWFzayA9ICQoc2NvcGUuZWxzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcjQ2l0eU1hc2sgcmVjdCcpKVxyXG5cdFx0c2NvcGUuZWxzLnRyYWlsTWFzayA9ICQoc2NvcGUuZWxzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcjVHJhaWxNYXNrIHJlY3QnKSlcclxuXHRcdHNjb3BlLmVscy5saW5lID0gJChzY29wZS5lbHMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJyNMaW5lIGxpbmUnKSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgdGhlIHN2ZyBpbWFnZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gbG9hZEltYWdlKCkge1xyXG5cdFx0JC5nZXQoc2NvcGUucHJvcHMuc3ZnVXJsLCBmdW5jdGlvbihkb2MpIHtcclxuXHRcdFx0dmFyIHN2Z1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZiBkb2MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBkb2MucXVlcnlTZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cdFx0XHRcdHN2ZyA9IGRvYy5xdWVyeVNlbGVjdG9yKCdzdmcnKVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHN2ZyA9ICQoZG9jKS5maW5kKCdzdmcnKVswXVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoc3ZnICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHQvLyBhcHBlbmQgc3ZnIHRvIERPTVxyXG5cdFx0XHRcdHNjb3BlLmVscy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3ZnKVxyXG5cdFx0XHRcdC8vIHNldCBsb2FkZWQgZmxhZyB0byB0cnVlXHJcblx0XHRcdFx0c2NvcGUuc3RhdGUubG9hZGVkID0gdHJ1ZVxyXG5cdFx0XHRcdC8vIGFkZCBsb2FkZWQgY2xhc3MgdG8gZWxlbWVudFxyXG5cdFx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubG9hZGVkQ2xhc3MpXHJcblx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBhY3RpdmUgY2l0eSAvIHRyYWlsIGNsYXNzXHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGZpbmRNYXNrRWxlbWVudHMoKVxyXG5cdFx0XHRcdFx0dXBkYXRlQWN0aXZlU2lkZSgpXHJcblx0XHRcdFx0XHRzaXplSW1hZ2UoKVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1cclxuXHRcdH0pLmZhaWwoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNjb3BlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZScpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNjcmVlbiBjaGFuZ2UgaGFzIHN0YXJ0ZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5DaGFuZ2VTdGFydChkYXRhKSB7XHJcblx0XHQvLyByZXNldCBjaXR5L3RyYWlsIHNlbGVjdGlvbiB3aGVuIHZpc2l0aW5nIHRlcnJhaW4gc2NyZWVuXHJcblx0XHRkYXRhLmFjdGl2ZS5pZCA9PSAnVGVycmFpbicgJiYgc2NvcGUuc3RhdGUubG9hZGVkICYmIHNob3dOZXV0cmFsKClcclxuXHJcblx0XHQvLyBpZiBzY3JlZW4gaXMgYmVjb21pbmcgYWN0aXZlXHJcblx0XHRpZiAoaXNBY3RpdmVTY3JlZW4oZGF0YS5hY3RpdmUpICYmICFpc0FjdGl2ZVNjcmVlbihkYXRhLnByZXZpb3VzKSkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmVudGVyaW5nQ2xhc3MpXHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHNjcmVlbiB3YXMgYWN0aXZlXHJcblx0XHRpZiAoIWlzQWN0aXZlU2NyZWVuKGRhdGEuYWN0aXZlKSAmJiBpc0FjdGl2ZVNjcmVlbihkYXRhLnByZXZpb3VzKSkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmxlYXZpbmdDbGFzcylcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZShkYXRhKSB7XHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhbc2NvcGUucHJvcHMuZW50ZXJpbmdDbGFzcywgc2NvcGUucHJvcHMubGVhdmluZ0NsYXNzXS5qb2luKCcgJykpXHJcblxyXG5cdFx0Ly8gaWYgc2NyZWVuIGlzIGJlY29taW5nIGFjdGl2ZVxyXG5cdFx0aWYgKGlzQWN0aXZlU2NyZWVuKGRhdGEuYWN0aXZlKSAmJiAhaXNBY3RpdmVTY3JlZW4oZGF0YS5wcmV2aW91cykpIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5lbnRlckFjdGl2ZUNsYXNzLCBzY29wZS5wcm9wcy5hY3RpdmVDbGFzcylcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgc2NyZWVuIHdhcyBhY3RpdmVcclxuXHRcdGlmICghaXNBY3RpdmVTY3JlZW4oZGF0YS5hY3RpdmUpICYmIGlzQWN0aXZlU2NyZWVuKGRhdGEucHJldmlvdXMpKSB7XHJcblx0XHRcdGRhdGEucmV2ZXJzZVxyXG5cdFx0XHRcdD8gZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5sZWF2ZUFjdGl2ZVJldmVyc2VDbGFzcylcclxuXHRcdFx0XHQ6IGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubGVhdmVBY3RpdmVDbGFzcylcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGhhcyBlbmRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUVuZChkYXRhKSB7XHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhcclxuXHRcdFx0W1xyXG5cdFx0XHRcdHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzLFxyXG5cdFx0XHRcdHNjb3BlLnByb3BzLmVudGVyQWN0aXZlQ2xhc3MsXHJcblx0XHRcdFx0c2NvcGUucHJvcHMubGVhdmVBY3RpdmVDbGFzcyxcclxuXHRcdFx0XHRzY29wZS5wcm9wcy5sZWF2ZUFjdGl2ZVJldmVyc2VDbGFzc1xyXG5cdFx0XHRdLmpvaW4oJyAnKVxyXG5cdFx0KVxyXG5cclxuXHRcdGlzQWN0aXZlU2NyZWVuKGRhdGEuYWN0aXZlKSAmJiBlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIHRoZSBhY3RpdmUgY2xhc3MgdG8gc2hvdyBzZWxlY3RlZCBzaWRlICh0cmFpbCBvciBjaXR5KVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlQWN0aXZlU2lkZSgpIHtcclxuXHRcdGlmICghc2NvcGUuc3RhdGUubG9hZGVkIHx8ICFzY29wZS5lbHMuY2l0eU1hc2sgfHwgIXNjb3BlLmVscy50cmFpbE1hc2sgfHwgIXNjb3BlLmVscy5saW5lKVxyXG5cdFx0XHRyZXR1cm5cclxuXHJcblx0XHR2YXIgaW5wdXQgPSBCRi5zZXJ2aWNlcy5mb3JtLmZvcm1WYWx1ZXMoKS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRyZXR1cm4gaXRlbS5uYW1lID09IHNjb3BlLnByb3BzLnRlcnJhaW5JbnB1dE5hbWVcclxuXHRcdH0pXHJcblxyXG5cdFx0aWYgKGlucHV0Lmxlbmd0aCAmJiBpbnB1dFswXS52YWx1ZSA9PT0gc2NvcGUucHJvcHMucm9hZElucHV0VmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHNob3dDaXR5KClcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoaW5wdXQubGVuZ3RoICYmIGlucHV0WzBdLnZhbHVlID09PSBzY29wZS5wcm9wcy50cmFpbElucHV0VmFsdWUpIHtcclxuXHRcdFx0cmV0dXJuIHNob3dUcmFpbCgpXHJcblx0XHR9XHJcblxyXG5cdFx0c2hvd05ldXRyYWwoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBUcmFpbFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2hvd1RyYWlsKCkge1xyXG5cdFx0Ly8gYW5pbWF0ZSBjaXR5IG1hc2sgdG8gLTEwMCVcclxuXHRcdCQoeyB4OiBzY29wZS5lbHMuY2l0eU1hc2suYXR0cigneCcpIH0pLmFuaW1hdGUoXHJcblx0XHRcdHsgeDogc2NvcGUuZWxzLmNpdHlNYXNrLmF0dHIoJ3dpZHRoJykgKiAtMSB9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZHVyYXRpb246IHNjb3BlLnByb3BzLmFuaW1hdGlvbkR1cmF0aW9uLFxyXG5cdFx0XHRcdGVhc2luZzogc2NvcGUucHJvcHMuYW5pbWF0aW9uRWFzaW5nLFxyXG5cdFx0XHRcdHN0ZXA6IGZ1bmN0aW9uKHgpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmVscy5jaXR5TWFzay5hdHRyKCd4JywgeClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdClcclxuXHJcblx0XHQvLyBhbmltYXRlIHRyYWlsIG1hc2sgdG8gMFxyXG5cdFx0JCh7IHg6IHNjb3BlLmVscy50cmFpbE1hc2suYXR0cigneCcpIH0pLmFuaW1hdGUoXHJcblx0XHRcdHsgeDogMCB9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZHVyYXRpb246IHNjb3BlLnByb3BzLmFuaW1hdGlvbkR1cmF0aW9uLFxyXG5cdFx0XHRcdGVhc2luZzogc2NvcGUucHJvcHMuYW5pbWF0aW9uRWFzaW5nLFxyXG5cdFx0XHRcdHN0ZXA6IGZ1bmN0aW9uKHgpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmVscy50cmFpbE1hc2suYXR0cigneCcsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSBsaW5lIHRvIGxlZnQgc2lkZVxyXG5cdFx0JCh7IHg6IHNjb3BlLmVscy5saW5lLmF0dHIoJ3gxJykgfSkuYW5pbWF0ZShcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHg6IDBcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBzY29wZS5wcm9wcy5hbmltYXRpb25EdXJhdGlvbixcclxuXHRcdFx0XHRlYXNpbmc6IHNjb3BlLnByb3BzLmFuaW1hdGlvbkVhc2luZyxcclxuXHRcdFx0XHRzdGVwOiBmdW5jdGlvbih4KSB7XHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MScsIHgpXHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MicsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSBsaW5lIG9wYWNpdHlcclxuXHRcdHNjb3BlLmVscy5saW5lLmFuaW1hdGUoXHJcblx0XHRcdHtcclxuXHRcdFx0XHRvcGFjaXR5OiAwXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRkdXJhdGlvbjogc2NvcGUucHJvcHMuYW5pbWF0aW9uRHVyYXRpb24sXHJcblx0XHRcdFx0ZWFzaW5nOiBzY29wZS5wcm9wcy5hbmltYXRpb25FYXNpbmdcclxuXHRcdFx0fVxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBDaXR5XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93Q2l0eSgpIHtcclxuXHRcdC8vIGFuaW1hdGUgY2l0eSBtYXNrIHRvIDAlXHJcblx0XHQkKHsgeDogc2NvcGUuZWxzLmNpdHlNYXNrLmF0dHIoJ3gnKSB9KS5hbmltYXRlKFxyXG5cdFx0XHR7IHg6IDAgfSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBzY29wZS5wcm9wcy5hbmltYXRpb25EdXJhdGlvbixcclxuXHRcdFx0XHRlYXNpbmc6IHNjb3BlLnByb3BzLmFuaW1hdGlvbkVhc2luZyxcclxuXHRcdFx0XHRzdGVwOiBmdW5jdGlvbih4KSB7XHJcblx0XHRcdFx0XHRzY29wZS5lbHMuY2l0eU1hc2suYXR0cigneCcsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSB0cmFpbCBtYXNrIHRvIDEwMCVcclxuXHRcdCQoeyB4OiBzY29wZS5lbHMudHJhaWxNYXNrLmF0dHIoJ3gnKSB9KS5hbmltYXRlKFxyXG5cdFx0XHR7IHg6IHNjb3BlLmVscy50cmFpbE1hc2suYXR0cignd2lkdGgnKSB9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZHVyYXRpb246IHNjb3BlLnByb3BzLmFuaW1hdGlvbkR1cmF0aW9uLFxyXG5cdFx0XHRcdGVhc2luZzogc2NvcGUucHJvcHMuYW5pbWF0aW9uRWFzaW5nLFxyXG5cdFx0XHRcdHN0ZXA6IGZ1bmN0aW9uKHgpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmVscy50cmFpbE1hc2suYXR0cigneCcsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSBsaW5lIHRvIHJpZ2h0IHNpZGVcclxuXHRcdCQoeyB4OiBzY29wZS5lbHMubGluZS5hdHRyKCd4MScpIH0pLmFuaW1hdGUoXHJcblx0XHRcdHtcclxuXHRcdFx0XHR4OiBzY29wZS5lbHMudHJhaWxNYXNrLmF0dHIoJ3dpZHRoJylcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBzY29wZS5wcm9wcy5hbmltYXRpb25EdXJhdGlvbixcclxuXHRcdFx0XHRlYXNpbmc6IHNjb3BlLnByb3BzLmFuaW1hdGlvbkVhc2luZyxcclxuXHRcdFx0XHRzdGVwOiBmdW5jdGlvbih4KSB7XHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MScsIHgpXHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MicsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSBsaW5lIG9wYWNpdHlcclxuXHRcdHNjb3BlLmVscy5saW5lLmFuaW1hdGUoXHJcblx0XHRcdHtcclxuXHRcdFx0XHRvcGFjaXR5OiAwXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRkdXJhdGlvbjogc2NvcGUucHJvcHMuYW5pbWF0aW9uRHVyYXRpb24sXHJcblx0XHRcdFx0ZWFzaW5nOiBzY29wZS5wcm9wcy5hbmltYXRpb25FYXNpbmdcclxuXHRcdFx0fVxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBOZXV0cmFsXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93TmV1dHJhbCgpIHtcclxuXHRcdC8vIGFuaW1hdGUgY2l0eSBtYXNrIHRvIC01MCVcclxuXHRcdCQoeyB4OiBzY29wZS5lbHMuY2l0eU1hc2suYXR0cigneCcpIH0pLmFuaW1hdGUoXHJcblx0XHRcdHsgeDogc2NvcGUuZWxzLmNpdHlNYXNrLmF0dHIoJ3dpZHRoJykgLyAtMiB9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZHVyYXRpb246IHNjb3BlLnByb3BzLmFuaW1hdGlvbkR1cmF0aW9uLFxyXG5cdFx0XHRcdGVhc2luZzogc2NvcGUucHJvcHMuYW5pbWF0aW9uRWFzaW5nLFxyXG5cdFx0XHRcdHN0ZXA6IGZ1bmN0aW9uKHgpIHtcclxuXHRcdFx0XHRcdHNjb3BlLmVscy5jaXR5TWFzay5hdHRyKCd4JywgeClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdClcclxuXHJcblx0XHQvLyBhbmltYXRlIHRyYWlsIG1hc2sgdG8gNTAlXHJcblx0XHQkKHsgeDogc2NvcGUuZWxzLnRyYWlsTWFzay5hdHRyKCd4JykgfSkuYW5pbWF0ZShcclxuXHRcdFx0eyB4OiBzY29wZS5lbHMudHJhaWxNYXNrLmF0dHIoJ3dpZHRoJykgLyAyIH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRkdXJhdGlvbjogc2NvcGUucHJvcHMuYW5pbWF0aW9uRHVyYXRpb24sXHJcblx0XHRcdFx0ZWFzaW5nOiBzY29wZS5wcm9wcy5hbmltYXRpb25FYXNpbmcsXHJcblx0XHRcdFx0c3RlcDogZnVuY3Rpb24oeCkge1xyXG5cdFx0XHRcdFx0c2NvcGUuZWxzLnRyYWlsTWFzay5hdHRyKCd4JywgeClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdClcclxuXHJcblx0XHQvLyBhbmltYXRlIGxpbmUgdG8gbWlkZGxlXHJcblx0XHQkKHsgeDogc2NvcGUuZWxzLmxpbmUuYXR0cigneDEnKSB9KS5hbmltYXRlKFxyXG5cdFx0XHR7IHg6IHNjb3BlLmVscy50cmFpbE1hc2suYXR0cignd2lkdGgnKSAvIDIgfSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGR1cmF0aW9uOiBzY29wZS5wcm9wcy5hbmltYXRpb25EdXJhdGlvbixcclxuXHRcdFx0XHRlYXNpbmc6IHNjb3BlLnByb3BzLmFuaW1hdGlvbkVhc2luZyxcclxuXHRcdFx0XHRzdGVwOiBmdW5jdGlvbih4KSB7XHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MScsIHgpXHJcblx0XHRcdFx0XHRzY29wZS5lbHMubGluZS5hdHRyKCd4MicsIHgpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYW5pbWF0ZSBsaW5lIG9wYWNpdHlcclxuXHRcdHNjb3BlLmVscy5saW5lLmFuaW1hdGUoXHJcblx0XHRcdHtcclxuXHRcdFx0XHRvcGFjaXR5OiAxXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRkdXJhdGlvbjogc2NvcGUucHJvcHMuYW5pbWF0aW9uRHVyYXRpb24sXHJcblx0XHRcdFx0ZWFzaW5nOiBzY29wZS5wcm9wcy5hbmltYXRpb25FYXNpbmdcclxuXHRcdFx0fVxyXG5cdFx0KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGV0ZXJtaW5lIGlmIGNpdHkgLyB0cmFpbCBpbWFnZSBzaG91bGQgYmUgdmlzaWJsZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaXNBY3RpdmVTY3JlZW4oc2NyZWVuKSB7XHJcblx0XHRyZXR1cm4gc2NyZWVuID8gWydUZXJyYWluJywgJ01pbGVhZ2UnXS5pbmRleE9mKHNjcmVlbi5pZCkgPiAtMSA6IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTZXQgaW1hZ2Ugc2l6ZVxyXG5cdCAqXHJcblx0ICogU2l6ZSB0aGUgaW1hZ2UgdG8gbWF0Y2ggdGhlIGF2YWlsYWJsZSBzcGFjZSBvbiB0aGUgRGlzdGFuY2Ugc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaXplSW1hZ2UoKSB7XHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLmxvYWRlZCB8fCAhc2NvcGUuZWxzLm1pbGVhZ2VTY3JlZW4gfHwgIXNjb3BlLmVscy5hcHBDb250YWluZXIpIHtcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gY3JlYXRlIGVsZW1lbnQgY2xvbmUgc28gZGltZW5zaW9ucyBjYW4gYmUgbWVhc3VyZWRcclxuXHJcblx0XHR2YXIgdGVtcEVsID0gJChcclxuXHRcdFx0JzxkaXYgc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgb3ZlcmZsb3c6IGhpZGRlblwiPjwvZGl2PidcclxuXHRcdClcclxuXHJcblx0XHR2YXIgZmluZGVySGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpIC0gJChzY29wZS5lbHMuYXBwQ29udGFpbmVyKS5vZmZzZXQoKS50b3BcclxuXHJcblx0XHR0ZW1wRWwuYXBwZW5kKFxyXG5cdFx0XHQkKHNjb3BlLmVscy5taWxlYWdlU2NyZWVuKVxyXG5cdFx0XHRcdC5jbG9uZSgpXHJcblx0XHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0XHR2aXNpYmlsaXR5OiAnaGlkZGVuJyxcclxuXHRcdFx0XHRcdGRpc3BsYXk6ICdmbGV4JyxcclxuXHRcdFx0XHRcdGhlaWdodDogZmluZGVySGVpZ2h0ICsgJ3B4J1xyXG5cdFx0XHRcdH0pXHJcblx0XHQpXHJcblxyXG5cdFx0c2NvcGUuZWxzLmFwcENvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZW1wRWxbMF0pXHJcblxyXG5cdFx0dmFyIGNvbnRlbnRDb250YWluZXIgPSB0ZW1wRWwuZmluZCgnLmJmLXNjcmVlbl9fbWFpbicpXHJcblxyXG5cdFx0Ly8gZ2V0IGRpbWVuc2lvbnNcclxuXHJcblx0XHR2YXIgaGVpZ2h0ID0gY29udGVudENvbnRhaW5lci5oZWlnaHQoKVxyXG5cdFx0dmFyIHdpZHRoID0gY29udGVudENvbnRhaW5lci53aWR0aCgpXHJcblx0XHR2YXIgb2Zmc2V0ID0gY29udGVudENvbnRhaW5lci5vZmZzZXQoKS50b3AgLSAkKHNjb3BlLmVscy5hcHBDb250YWluZXIpLm9mZnNldCgpLnRvcFxyXG5cdFx0dmFyIGNvbnRhaW5lckFzcGVjdFJhdGlvID0gd2lkdGggLyBoZWlnaHRcclxuXHRcdHZhciBpbWFnZUFzcGVjdFJhdGlvID0gc2NvcGUucHJvcHMuaW1hZ2VBc3BlY3RSYXRpb1xyXG5cclxuXHRcdC8vIHNldCB3cmFwcGluZyBlbGVtZW50IHNpemUgYW5kIHBvc2l0aW9uXHJcblx0XHQkKHNjb3BlLmVscy53cmFwKS5jc3Moe1xyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodCArICdweCcsXHJcblx0XHRcdHRvcDogb2Zmc2V0ICsgJ3B4J1xyXG5cdFx0fSlcclxuXHJcblx0XHQvLyBzZXQgaW1hZ2Ugc2l6ZVxyXG5cdFx0JChzY29wZS5lbHMuY29udGFpbmVyKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDpcclxuXHRcdFx0XHRjb250YWluZXJBc3BlY3RSYXRpbyA+PSBpbWFnZUFzcGVjdFJhdGlvXHJcblx0XHRcdFx0XHQ/IGhlaWdodCAqIGltYWdlQXNwZWN0UmF0aW8gKyAncHgnXHJcblx0XHRcdFx0XHQ6IHdpZHRoICsgJ3B4JyxcclxuXHRcdFx0aGVpZ2h0OlxyXG5cdFx0XHRcdGNvbnRhaW5lckFzcGVjdFJhdGlvID49IGltYWdlQXNwZWN0UmF0aW9cclxuXHRcdFx0XHRcdD8gaGVpZ2h0ICsgJ3B4J1xyXG5cdFx0XHRcdFx0OiB3aWR0aCAvIGltYWdlQXNwZWN0UmF0aW8gKyAncHgnXHJcblx0XHR9KVxyXG5cclxuXHRcdGVsLnN0eWxlLm1pbkhlaWdodCA9IGhlaWdodCAqIDEuMSArIG9mZnNldCArICdweCdcclxuXHJcblx0XHR0ZW1wRWwucmVtb3ZlKClcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgb25TY3JlZW5DaGFuZ2VTdGFydClcclxuXHRzY29wZS5vbihCRi5ldmVudHMuU0NSRUVOX1RSQU5TSVRJT05fQUNUSVZFLCBvblNjcmVlbkNoYW5nZSlcclxuXHRzY29wZS5vbihCRi5ldmVudHMuU0NSRUVOX1RSQU5TSVRJT05fRU5ELCBvblNjcmVlbkNoYW5nZUVuZClcclxuXHRzY29wZS5vbihCRi5ldmVudHMuU0VUX0ZPUk1fVkFMVUVTLCB1cGRhdGVBY3RpdmVTaWRlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5XSU5ET1dfUkVTSVpFLCBzaXplSW1hZ2UpXHJcblxyXG5cdC8qKiBTdGFydCBsb2FkaW5nIHRoZSBpbWFnZSAqKi9cclxuXHRsb2FkSW1hZ2UoKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENsZWFyIEZvcm0gVmFsdWUgb24gQ2xpY2sgQ29tcG9uZW50XHJcbiAqXHJcbiAqIENsZWFycyBhIHNwZWNpZmljIGlucHV0XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWJmLWNsZWFyLWZvcm0tdmFsdWUtb24tY2xpY2sgLSBpbnB1dCBuYW1lIHRvIGNsZWFyXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdjbGVhci1mb3JtLXZhbHVlLW9uLWNsaWNrJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdHByb3BlcnR5TmFtZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJmLWNsZWFyLWZvcm0tdmFsdWUtb24tY2xpY2snKVxyXG5cdH1cclxuXHJcblx0LyoqIFRlcm1pbmF0ZSBpZiBpbnB1dCBuYW1lIGlzIG5vdCBzcGVjaWZpZWQgICovXHJcblx0aWYgKCFzY29wZS5wcm9wcy5wcm9wZXJ0eU5hbWUpIHJldHVybiBzY29wZS5lcnJvcignUHJvcGVydHkgbmFtZSBub3Qgc3BlY2lmaWVkJylcclxuXHJcblx0LyoqXHJcblx0ICogQ2xlYXIgc3BlY2lmaWVkIGZvcm0gaW5wdXQgb24gY2xpY2tcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uQ2xpY2soKSB7XHJcblx0XHR2YXIgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cIicgKyBzY29wZS5wcm9wcy5wcm9wZXJ0eU5hbWUgKyAnXCJdJylcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRpZiAoaW5wdXRzW2ldLnR5cGUgPT0gJ3NlbGVjdCcgfHwgaW5wdXRzW2ldLnR5cGUgPT0gJ3RleHQnKSB7XHJcblx0XHRcdFx0aW5wdXRzW2ldLnZhbHVlID0gJydcclxuXHRcdFx0XHRyZXR1cm5cclxuXHRcdFx0fVxyXG5cdFx0XHRpbnB1dHNbaV0uY2hlY2tlZCA9IGZhbHNlXHJcblx0XHR9XHJcblx0XHQvLyB0ZWxsIGZvcm1zIHNlcnZpY2UgdG8gdXBkYXRlIHZhbHVlc1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0QkYuc2VydmljZXMuZm9ybS51cGRhdGVGb3JtVmFsdWVzKClcclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHQvKiogTGlzdGVuIGZvciBldmVudHMgKi9cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgQ2xpY2sgRWxlbWVudCBDb21wb25lbnRcclxuICogQ2xpY2sgYW5vdGhlciBlbGVtZW50IHdoZW4gdGhpcyBlbGVtZW50IGlzIGNsaWNrZWRcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtY2xpY2stZWxlbWVudFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnY2xpY2stZWxlbWVudCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0ZWxlbWVudFNlbGVjdG9yOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmYtY2xpY2stZWxlbWVudCcpXHJcblx0fVxyXG5cclxuXHRpZiAoIXNjb3BlLnByb3BzLmVsZW1lbnRTZWxlY3RvcikgcmV0dXJuIHNjb3BlLmVycm9yKCdFbGVtZW50IElkIG5vdCBkZWZpbmVkJylcclxuXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0ZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzY29wZS5wcm9wcy5lbGVtZW50U2VsZWN0b3IpXHJcblx0fVxyXG5cclxuXHRpZiAoIXNjb3BlLnByb3BzLmVsZW1lbnQpIHtcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignRWxlbWVudCBub3QgZm91bmQnKVxyXG5cdH1cclxuXHJcblx0ZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHRzY29wZS5wcm9wcy5lbGVtZW50LmNsaWNrKClcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENsb3NlIEFsZXJ0IExpbmsgQ29tcG9uZW50XHJcbiAqIENsb3NlcyB0aGUgYWxlcnQgbW9kYWwgb24gY2xpY2tcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtY2xvc2UtYWxlcnQtbGlua1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnY2xvc2UtYWxlcnQtbGluaycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5DTE9TRV9BTEVSVClcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENsb3NlIEluZm8gT3ZlcmxheSBDb21wb25lbnRcclxuICogQ2xvc2VzIHRoZSBpbmZvIG92ZXJsYXkgbW9kYWwgb24gY2xpY2tcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtY2xvc2UtaW5mby1vdmVybGF5LWxpbmtcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2Nsb3NlLWluZm8tb3ZlcmxheS1saW5rJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0ZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHRlLnByZXZlbnREZWZhdWx0KClcclxuXHRcdHNjb3BlLmVtaXQoQkYuZXZlbnRzLkNMT1NFX0lORk9fT1ZFUkxBWSlcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENsb3NlIFByb2dyZXNzIENvbXBvbmVudFxyXG4gKiBIaWRlcyB0aGUgcHJvZ3Jlc3MgbmF2IG9uIGNsaWNrXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWNsb3NlLXByb2dyZXNzLWxpbmtcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2Nsb3NlLXByb2dyZXNzLWxpbmsnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHRcdGUucHJldmVudERlZmF1bHQoKVxyXG5cdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuQ0xPU0VfUFJPR1JFU1NfTUVOVSlcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIENvbGxhcHNhYmxlIENvbXBvbmVudFxyXG4gKiBBZGRzL3JlbW92ZXMgYW4gJ29wZW4nIGNsYXNzIG9uIGNsaWNrXHJcbiBcclxuICogZGF0YS1iZi1jb2xsYXBzYWJsZVxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnY29sbGFwc2FibGUnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRvcGVuQ2xhc3M6ICdvcGVuJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVG9nZ2xlIGFjdGl2ZSBjbGFzc1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25DbGljaygpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5jb250YWlucyhzY29wZS5wcm9wcy5vcGVuQ2xhc3MpXHJcblx0XHRcdD8gZWwuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5vcGVuQ2xhc3MpXHJcblx0XHRcdDogZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5vcGVuQ2xhc3MpXHJcblx0fVxyXG5cclxuXHQvKiogTGlzdGVuIGZvciBldmVudHMgKi9cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgRG9jdW1lbnQgQ29tcG9uZW50XHJcbiAqIE1hbmFnZXMgc3R5bGVzIG9uIHRoZSBkb2N1bWVudFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1kb2N1bWVudFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnZG9jdW1lbnQnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKipcclxuXHQgKiBIaWRlIG92ZXJmbG93IGNvbnRlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGhpZGVPdmVyZmxvdygpIHtcclxuXHRcdGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBvdmVyZmxvdyBjb250ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93T3ZlcmZsb3coKSB7XHJcblx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJydcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5PUEVOX0lORk9fT1ZFUkxBWSwgaGlkZU92ZXJmbG93KVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5DTE9TRV9JTkZPX09WRVJMQVksIHNob3dPdmVyZmxvdylcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBEeW5hbWljIFRlbXBsYXRlIENvbnRhaW5lclxyXG4gKiBTaG93cyBzY3JlZW4gZGVwZW5kZW5jeSBjb250ZW50IChjb250ZW50IHRoYXQgbG9hZHMgZHluYW1pY2FsbHkgYmVmb3JlIGNoYW5naW5nIHRvIGEgc2NyZWVuKVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1keW5hbWljLXRlbXBsYXRlLWNvbnRhaW5lclxyXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YS1zY3JlZW4taWQgLSB0aGUgc2NyZWVuIGlkIHdpdGggdGVtcGxhdGUgZGF0YSBkZXBlbmRlbmN5XHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdkeW5hbWljLXRlbXBsYXRlLWNvbnRhaW5lcicsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRpZDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXNjcmVlbi1pZCcpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTY3JlZW4gZGVwZW5kZW5jeSBoYXMgZmluaXNoZWQgbG9hZGluZ1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS5pZCAtIHNjcmVlbiBpZCB0aGF0IHdhcyBsb2FkZWRcclxuXHQgKiBAcHJvcGVydHkge0FueX0gZGF0YS5kYXRhIC0gZGF0YSByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXJcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uU2NyZWVuRGF0YUxvYWRlZChkYXRhKSB7XHJcblx0XHRkYXRhLmlkID09PSBzY29wZS5wcm9wcy5pZCAmJiBpbnNlcnRDb250ZW50KGRhdGEuZGF0YSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluc2VydCBsb2FkZWQgdGVtcGxhdGUgY29udGVudFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluc2VydENvbnRlbnQoaHRtbCkge1xyXG5cdFx0ZWwuaW5uZXJIVE1MID0gJzxkaXY+JyArIGh0bWwgKyAnPC9kaXY+J1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0QkYuY29tcGlsZShlbC5jaGlsZE5vZGVzWzBdKVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fREFUQV9MT0FERUQsIG9uU2NyZWVuRGF0YUxvYWRlZClcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBGb3JtIFN0ZXAgQ29tcG9uZW50XHJcbiAqIFJlZ2lzdGVycyByZXF1aXJlZCBmaWVsZHMgb24gYSBzY3JlZW4gdG8gZm9ybXMgc2VydmljZVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1mb3JtLXN0ZXAgLSBtdXN0IGJlIHBsYWNlZCBvbiBzY3JlZW4gY29tcG9uZW50XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWlkIC0gc2NyZWVuIGlkXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdmb3JtLXN0ZXAnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRzY3JlZW5JZDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWlkJylcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0aW5wdXRzOiAkKGVsKS5maW5kKCdpbnB1dCcpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZWdpc3RlciB0aGUgZm9ybSBzdGVwXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiByZWdpc3RlcigpIHtcclxuXHRcdHZhciByZXF1aXJlZEZpZWxkcyA9IFtdXHJcblxyXG5cdFx0Ly8gZmluZCByZXF1aXJlZCBmaWVsZHNcclxuXHRcdHNjb3BlLmVscy5pbnB1dHMuZWFjaChmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKHRoaXMuaGFzQXR0cmlidXRlKCdyZXF1aXJlZCcpICYmIHJlcXVpcmVkRmllbGRzLmluZGV4T2YodGhpcy5uYW1lKSA9PT0gLTEpXHJcblx0XHRcdFx0cmVxdWlyZWRGaWVsZHMucHVzaCh0aGlzLm5hbWUpXHJcblx0XHR9KVxyXG5cclxuXHRcdC8vIGVtaXQgcmVnaXN0cmF0aW9uIGV2ZW50XHJcblx0XHRCRi5zZXJ2aWNlcy5mb3JtLnJlZ2lzdGVyRm9ybVN0ZXAoe1xyXG5cdFx0XHRpZDogc2NvcGUucHJvcHMuc2NyZWVuSWQsXHJcblx0XHRcdHJlcXVpcmVkRmllbGRzOiByZXF1aXJlZEZpZWxkc1xyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKiBJbml0aWFsaXplICovXHJcblxyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHRyZWdpc3RlcigpXHJcblx0fSlcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBBbmFseXRpY3MgQ2xpY2sgRXZlbnRcclxuICogU3VibWl0cyBhbiBhbmFseXRpY3MgZXZlbnQgb24gY2xpY2tcclxuICpcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtYmYtZ3RtLWNsaWNrLWV2ZW50IC0gdGhlIGV2ZW50IG5hbWVcclxuICpcclxuICogTk9URTogQUxMIEFOQUxZVElDUyBDT01QT05FTlRTIEFSRSBOT1cgRElTQUJMRURcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2d0bS1jbGljay1ldmVudCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8vIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcblx0Ly8gXHQvLyB0aW1lb3V0IGVuc3VyZXMgZm9ybSB2YWx1ZXMgaGF2ZSBiZWVuIHVwZGF0ZWRcclxuXHQvLyBcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0Ly8gXHRcdEJGLnNlcnZpY2VzLmFuYWx5dGljcy5ldmVudChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmYtZ3RtLWNsaWNrLWV2ZW50JyksIGVsKVxyXG5cdC8vIFx0fSwgNTApXHJcblx0Ly8gfSlcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBHVE0gRXZlbnRcclxuICogU3VibWl0cyBhbiBhbmFseXRpY3MgZXZlbnQgd2hlbiBjb21wb25lbnQgaXMgY29tcGlsZWRcclxuICpcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtYmYtZ3RtLWV2ZW50IC0gdGhlIGV2ZW50IG5hbWVcclxuICpcclxuICogTk9URTogQUxMIEFOQUxZVElDUyBDT01QT05FTlRTIEFSRSBOT1cgRElTQUJMRURcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2d0bS1ldmVudCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8vIHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0Ly8gXHRCRi5zZXJ2aWNlcy5hbmFseXRpY3MuZXZlbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJmLWd0bS1ldmVudCcpLCBlbClcclxuXHQvLyB9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEFuYWx5dGljcyBTY3JlZW4gRXZlbnRcclxuICogU3VibWl0cyBhbiBhbmFseXRpY3MgZXZlbnQgd2hlbiBzY3JlZW4gaXMgYWN0aXZlXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWJmLWd0bS1zY3JlZW4tYWN0aXZlLWV2ZW50IC0gdGhlIGV2ZW50IGlkXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWlkIC0gc2NyZWVuIGlkXHJcbiAqXHJcbiAqIE5PVEU6IEFMTCBBTkFMWVRJQ1MgQ09NUE9ORU5UUyBBUkUgTk9XIERJU0FCTEVEXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdndG0tc2NyZWVuLWFjdGl2ZS1ldmVudCcsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8vIHNjb3BlLnByb3BzID0ge1xyXG5cdC8vIFx0aWQ6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpXHJcblx0Ly8gfVxyXG5cdC8vIGlmICghc2NvcGUucHJvcHMuaWQpIHJldHVybiBzY29wZS5lcnJvcignU2NyZWVuIElkIGlzIHJlcXVpcmVkJylcclxuXHQvLyBzY29wZS5vbihCRi5ldmVudHMuU0NSRUVOX1RSQU5TSVRJT05fRU5ELCBmdW5jdGlvbihkYXRhKSB7XHJcblx0Ly8gXHRkYXRhLmFjdGl2ZS5pZCA9PT0gc2NvcGUucHJvcHMuaWQgJiZcclxuXHQvLyBcdFx0QkYuc2VydmljZXMuYW5hbHl0aWNzLmV2ZW50KGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1iZi1ndG0tc2NyZWVuLWFjdGl2ZS1ldmVudCcpLCBlbClcclxuXHQvLyB9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEdUTSBVc2VyIFJlc3BvbnNlXHJcbiAqIFNldHMgdGhlIGRhdGEtZ3RtLXVzZXItcmVzcG9uc2UgYXR0cmlidXRlIHRvIGFuIGlucHV0cyBjdXJyZW50IHZhbHVlXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWJmLWd0bS11c2VyLXJlc3BvbnNlIC0gdGhlIG5hbWUgb2YgdGhlIGlucHV0IHlvdSB3YW50IHRvIHRyYWNrXHJcbiAqXHJcbiAqL1xyXG5CRi5jb21wb25lbnQoJ2d0bS11c2VyLXJlc3BvbnNlJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0aWYgKCFlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYmYtZ3RtLXVzZXItcmVzcG9uc2UnKSlcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignZGF0YS1iZi1ndG0tdXNlci1yZXNwb25zZSBpcyByZXF1aXJlZCwgYW5kIG11c3QgYmUgYSB2YWxpZCBpbnB1dCBuYW1lJylcclxuXHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGlucHV0TmFtZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJmLWd0bS11c2VyLXJlc3BvbnNlJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZSBkYXRhIGF0dHJpYnV0ZSB3aGVuIGZvcm0gdmFsdWVzIHVwZGF0ZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TZXRGb3JtVmFsdWVzKCkge1xyXG5cdFx0ZWwuc2V0QXR0cmlidXRlKFxyXG5cdFx0XHQnZGF0YS1ndG0tdXNlci1yZXNwb25zZScsXHJcblx0XHRcdEJGLnNlcnZpY2VzLmZvcm0uaW5wdXRWYWx1ZVN0cmluZyhzY29wZS5wcm9wcy5pbnB1dE5hbWUpXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbkNsaWNrKCkge1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWd0bS11c2VyLXJlc3BvbnNlJykpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0ZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrLmJpbmQodGhpcykpXHJcblxyXG5cdC8qKiBJbml0aWFsaXplICAqL1xyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHRvblNldEZvcm1WYWx1ZXMoKVxyXG5cdFx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgb25TZXRGb3JtVmFsdWVzKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSGVhZGVyIENvbXBvbmVudFxyXG4gKiBNYW5hZ2VzIHN0eWxlcyBmb3IgdGhlIHNob2UgZmluZGVyIGhlYWRlclxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1hbGVydC1saW5rXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdoZWFkZXInLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRwcm9ncmVzc09wZW5DbGFzczogJ2JmLWhlYWRlci0tcHJvZ3Jlc3Mtb3BlbicsXHJcblx0XHRwcm9ncmVzc0FjdGl2ZUNsYXNzOiAnYmYtaGVhZGVyLS1wcm9ncmVzcy1hY3RpdmUnLFxyXG5cdFx0Y2xvc2VQcm9ncmVzc1RpbWVvdXRMZW5ndGg6IDEwMDBcclxuXHR9XHJcblxyXG5cdC8qKiBDb21wb25lbnQgc3RhdGUgKi9cclxuXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRjbG9zZVRpbWVvdXRIYW5kbGVyOiBudWxsXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGQgcHJvZ3Jlc3Mgb3BlbiBjbGFzcyB3aGVuIHByb2dyZXNzIHRvdWNoIG1lbnUgaXMgb3BlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25Qcm9ncmVzc09wZW4oKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnByb2dyZXNzT3BlbkNsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIHByb2dyZXNzIG9wZW4gY2xhc3Mgd2hlbiBwcm9ncmVzcyB0b3VjaCBtZW51IGlzIGNsb3NlZFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25Qcm9ncmVzc0Nsb3NlKCkge1xyXG5cdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5wcm9ncmVzc09wZW5DbGFzcylcclxuXHRcdC8vQkYuaGVscGVycy5pc0Zvcm1TY3JlZW4oZGF0YS5hY3RpdmUpID8gYWN0aXZhdGVQcm9ncmVzcygpIDogZGVhY3RpdmF0ZVByb2dyZXNzKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc3BvbmQgdG8gc2NyZWVuIGNoYW5nZXNcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5DaGFuZ2VTdGFydChkYXRhKSB7XHJcblx0XHRjbGVhclRpbWVvdXQoc2NvcGUuc3RhdGUuY2xvc2VUaW1lb3V0SGFuZGxlcilcclxuXHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbk1vdXNlZW50ZXIpXHJcblx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25Nb3VzZWxlYXZlKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzcG9uZCB0byBzY3JlZW4gY2hhbmdlc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUFjdGl2ZShkYXRhKSB7XHJcblx0XHRCRi5oZWxwZXJzLmlzRm9ybVNjcmVlbihkYXRhLmFjdGl2ZSkgPyBhY3RpdmF0ZVByb2dyZXNzKCkgOiBkZWFjdGl2YXRlUHJvZ3Jlc3MoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkIGFjdGl2ZSBjbGFzcyB3aGVuIHByb2dyZXNzIG5hdiBpcyB2aXNpYmxlXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhY3RpdmF0ZVByb2dyZXNzKCkge1xyXG5cdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5wcm9ncmVzc0FjdGl2ZUNsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVtb3ZlIGFjdGl2ZSBjbGFzcyB3aGVuIHByb2dyZXNzIG5hdiBpcyBoaWRkZW5cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGRlYWN0aXZhdGVQcm9ncmVzcygpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMucHJvZ3Jlc3NBY3RpdmVDbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9uIHNob3cgcHJvZ3Jlc3MgbWVudSBldmVudCwgaGlkZSBvbiBtb3VzZWxlYXZlXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNob3dQcm9ncmVzc01lbnUoKSB7XHJcblx0XHRhY3RpdmF0ZVByb2dyZXNzKClcclxuXHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBvbk1vdXNlZW50ZXIpXHJcblx0XHRlbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25Nb3VzZWxlYXZlKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT24gaGlkZSBwcm9ncmVzcyBtZW51IGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbkhpZGVQcm9ncmVzc01lbnUoKSB7XHJcblx0XHRkZWFjdGl2YXRlUHJvZ3Jlc3MoKVxyXG5cdFx0ZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VlbnRlcilcclxuXHRcdGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlbGVhdmUpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBPbiBtb3VzZWxlYXZlIGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbk1vdXNlbGVhdmUoKSB7XHJcblx0XHRzY29wZS5zdGF0ZS5jbG9zZVRpbWVvdXRIYW5kbGVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuSElERV9QUk9HUkVTU19NRU5VKVxyXG5cdFx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZWVudGVyKVxyXG5cdFx0XHRlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgb25Nb3VzZWxlYXZlKVxyXG5cdFx0fSwgc2NvcGUucHJvcHMuY2xvc2VQcm9ncmVzc1RpbWVvdXRMZW5ndGgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBPbiBtb3VzZWVudGVyXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbk1vdXNlZW50ZXIoKSB7XHJcblx0XHRjbGVhclRpbWVvdXQoc2NvcGUuc3RhdGUuY2xvc2VUaW1lb3V0SGFuZGxlcilcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5PUEVOX1BST0dSRVNTX01FTlUsIG9uUHJvZ3Jlc3NPcGVuKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5DTE9TRV9QUk9HUkVTU19NRU5VLCBvblByb2dyZXNzQ2xvc2UpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX1NUQVJULCBvblNjcmVlbkNoYW5nZVN0YXJ0KVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUsIG9uU2NyZWVuQ2hhbmdlQWN0aXZlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TSE9XX1BST0dSRVNTX01FTlUsIG9uU2hvd1Byb2dyZXNzTWVudSlcclxuXHRzY29wZS5vbihCRi5ldmVudHMuSElERV9QUk9HUkVTU19NRU5VLCBvbkhpZGVQcm9ncmVzc01lbnUpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSGlkZSBPbiBGb3JtIENvbXBsZXRlIENvbXBvbmVudFxyXG4gKiBIaWRlcyBlbGVtZW50IGlmIGFsbCBmb3JtIHF1ZXN0aW9ucyBoYXZlIGJlZW4gYW5zd2VyZWRcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtaGlkZS1vbi1mb3JtLWNvbXBsZXRlXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdoaWRlLW9uLWZvcm0tY29tcGxldGUnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0cGFnZUxvYWRUaW1lOiAyMDAwLFxyXG5cdFx0Y2hhbmdlTGVuZ3RoOiAxMDAwXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IGluaXRpYWwgU3RhdGUgICovXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRwYWdlTG9hZGVkOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyB0aGUgZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2hvdygpIHtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKVxyXG5cdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSB0aGUgZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaGlkZSgpIHtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hlbiBmb3JtIHZhbHVlcyBhcmUgdXBkYXRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gdmFsdWVzXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHZhbHVlcy5uYW1lIC0gbmFtZSBvZiBpbnB1dFxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2YWx1ZXMudmFsdWUgLSB2YWx1ZSBvZiBpbnB1dFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TZXRGb3JtVmFsdWVzKHZhbHVlcykge1xyXG5cdFx0Ly8gYWRkIHRpbWVvdXQgdG8gZml4IEZpcmVmb3ggdGltaW5nIGJ1Z1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0QkYuc2VydmljZXMuZm9ybS5mb3JtSXNDb21wbGV0ZSgpID8gaGlkZSgpIDogc2hvdygpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgb25TZXRGb3JtVmFsdWVzKVxyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUucGFnZUxvYWRlZCA9IHRydWVcclxuXHR9LCBzY29wZS5wcm9wcy5wYWdlTG9hZFRpbWUpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSGlkZSBvbiBmb3JtIHByb2dyZXNzXHJcbiAqIEhpZGUgYW4gZWxlbWVudCBpZiB1c2VyIGhhcyBjb21wbGV0ZWQgYW55IGZvcm0gc3RlcFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1oaWRlLW9uLWZvcm0tcHJvZ3Jlc3NcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2hpZGUtb24tZm9ybS1wcm9ncmVzcycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRwYWdlTG9hZFRpbWU6IDIwMDAsXHJcblx0XHRjaGFuZ2VMZW5ndGg6IDEwMDBcclxuXHR9XHJcblxyXG5cdC8qKiBTZXQgaW5pdGlhbCBTdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdHBhZ2VMb2FkZWQ6IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaG93IHRoZSBlbGVtZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93KCkge1xyXG5cdFx0Ly8gc2V0IHRpbWVvdXQgc28gaXQgZG9lc250IGltbWVkaWF0ZWx5IHNob3cgZHVyaW5nIHRyYW5zaXRpb25zXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJylcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXHJcblx0XHR9LCBzY29wZS5zdGF0ZS5wYWdlTG9hZGVkID8gc2NvcGUucHJvcHMuY2hhbmdlTGVuZ3RoIDogMClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpZGUgdGhlIGVsZW1lbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGhpZGUoKSB7XHJcblx0XHQvLyBzZXQgdGltZW91dCBzbyBpdCBkb2VzbnQgaW1tZWRpYXRlbHkgaGlkZSBkdXJpbmcgdHJhbnNpdGlvbnNcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIHZpc2libGl0eVxyXG5cdCAqXHJcblxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHRcdHZhciBoYXNQcm9ncmVzcyA9IEJGLnNlcnZpY2VzLmZvcm0uY29tcGxldGVkU3RlcHMoKS5sZW5ndGhcclxuXHJcblx0XHRoYXNQcm9ncmVzcyA/IGhpZGUoKSA6IHNob3coKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgZnVuY3Rpb24oKSB7XHJcblx0XHRzZXRUaW1lb3V0KHVwZGF0ZSlcclxuXHR9KVxyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUucGFnZUxvYWRlZCA9IHRydWVcclxuXHR9LCBzY29wZS5wcm9wcy5wYWdlTG9hZFRpbWUpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSW1hZ2UgQ29tcG9uZW50XHJcbiAqIEFkZHMgYSBsb2FkZWQgY2xhc3Mgd2hlbiBpbWFnZSBpcyBsb2FkZWRcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtaW1hZ2UgLSBtdXN0IGJlIGFuIDxpbWc+IGVsZW1lbnRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2ltYWdlJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqXHJcblx0ICogQWRkIGNsYXNzIG9uIGxvYWRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uTG9hZCgpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5hZGQoJ2xvYWRlZCcpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGltYWdlTG9hZGVkKCkge1xyXG5cdFx0cmV0dXJuIGVsLmNvbXBsZXRlICYmIGVsLm5hdHVyYWxIZWlnaHQgIT09IDBcclxuXHR9XHJcblxyXG5cdC8qKiBJbml0aWFsaXplICovXHJcblx0aW1hZ2VMb2FkZWQoKSA/IG9uTG9hZCgpIDogZWwuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZC5iaW5kKHRoaXMpKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEluaXRpYWxpemUgZm9vdGVyIG5hdmlnYXRpb25cclxuICogSW5pdHMgZm9vdGVyIG5hdmlnYXRpb24gYWZ0ZXIgc2hvZSBmaW5kZXIgcmVzdWx0cyBsb2FkLlxyXG4gKi9cclxuQkYuY29tcG9uZW50KCdpbml0LWZvb3Rlci1uYXZpZ2F0aW9uJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0aWYgKEJGLnNlcnZpY2VzLndpbmRvdy5pc0Rlc2t0b3AoKSkge1xyXG4gICAgICAgIHZhciBlbGVtZW50cyA9ICQoJ2RldGFpbHMuY29sbGFwc2UtbW9iaWxlLW9ubHknKTtcclxuXHQgICAgZWxlbWVudHMuYXR0cignb3BlbicsIHRydWUpO1xyXG4gICAgfVx0XHJcbn0pO1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEluZm8gT3ZlcmxheSBDb21wb25lbnRcclxuICogU2hvd3MgYW4gaW5mbyBtb2RhbFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1pbmZvLW92ZXJsYXlcclxuICogQHByb3BlcnR5IGRhdGEtY29udGVudCAtIHBsYWNlIG9uIGNvbnRlbnQgY29udGFpbmVyXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdpbmZvLW92ZXJsYXknLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRhY3RpdmVDbGFzczogJ2JmLWluZm8tb3ZlcmxheS0tb3BlbidcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0Y29udGVudDogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtY29udGVudF0nKVxyXG5cdH1cclxuXHJcblx0LyoqIFRlcm1pbmF0ZSBpZiBjb250ZW50IGVsZW1lbnQgaXMgbm90IGZvdW5kICAqL1xyXG5cdGlmICghc2NvcGUuZWxzLmNvbnRlbnQpIHtcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignQ29udGVudCBlbGVtZW50IG5vdCBmb3VuZCcpXHJcblx0fVxyXG5cclxuXHQvKiogSGlkZSBmcm9tIHNjcmVlbiByZWFkZXJzICovXHJcblx0ZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxuXHQvKipcclxuXHQgKiBPcGVucyB0aGUgaW5mbyBvdmVybGF5IGNvbXBvbmVudFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRlbXBsYXRlSWQgLSB0aGUgaWQgb2YgdGhlIGluZm8gY29udGVudCB0ZW1wbGF0ZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb3Blbih0ZW1wbGF0ZUlkKSB7XHJcblx0XHQvLyBGaW5kIHRlbXBsYXRlXHJcblx0XHR2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZUlkKVxyXG5cclxuXHRcdC8vIFRlcm1pbmF0ZSBpZiB0ZW1wbGF0ZSBkb2VzIG5vdCBleGlzdFxyXG5cdFx0aWYgKCF0ZW1wbGF0ZSkge1xyXG5cdFx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ0luZm8gb3ZlcmxheSB0ZW1wbGF0ZSBub3QgZm91bmQnKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCBhbmQgY29tcGxpbGUgdGVtcGxhdGUgY29udGVudFxyXG5cdFx0c2NvcGUuZWxzLmNvbnRlbnQuaW5uZXJIVE1MID0gdGVtcGxhdGUuaW5uZXJIVE1MXHJcblx0XHRCRi5jb21waWxlKHNjb3BlLmVscy5jb250ZW50KVxyXG5cclxuXHRcdC8vIFNob3cgY29udGVudFxyXG5cdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5hY3RpdmVDbGFzcylcclxuXHRcdH0pXHJcblxyXG5cdFx0Ly8gTGlzdGVuIGZvciBrZXkgZXZlbnRzIHRoYXQgc2hvdWxkIGNsb3NlIHRoZSBhbGVydFxyXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5ZG93bilcclxuXHJcblx0XHQvLyBTaG93IHRvIHNjcmVlbiByZWFkZXJzXHJcblxyXG5cdFx0ZWwuc3R5bGUuZGlzcGxheSA9ICcnXHJcblxyXG5cdFx0Ly8gRm9jdXMgdGhlIGNvbnRlbnRcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNjb3BlLmVscy5jb250ZW50LmZvY3VzKClcclxuXHRcdH0sIDI1MClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENsb3NlcyB0aGUgaW5mbyBvdmVybGF5IGNvbXBvbmVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gY2xvc2UoKSB7XHJcblx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0fSlcclxuXHJcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duKVxyXG5cclxuXHRcdC8vIGhpZGUgZnJvbSBzY3JlZW4gcmVhZGVyc1xyXG5cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdH0sIDUwMClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEtleWRvd24gaGFuZGxlciBmdW5jdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25LZXlkb3duKGUpIHtcclxuXHRcdGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcclxuXHRcdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuQ0xPU0VfSU5GT19PVkVSTEFZKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLk9QRU5fSU5GT19PVkVSTEFZLCBvcGVuKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5DTE9TRV9JTkZPX09WRVJMQVksIGNsb3NlKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIEluZm8gT3ZlcmxheSBMaW5rIENvbXBvbmVudFxyXG4gKiBPcGVucyBpbmZvIG92ZXJsYXkgb24gY2xpY2tcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtaW5mby1vdmVybGF5LWxpbmtcclxuICogQHByb3BlcnR5IGRhdGEtdGVtcGxhdGUtaWQgLSBpbmZvIG92ZXJsYXkgY29udGVudCB0ZW1wbGF0ZSBpZFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnaW5mby1vdmVybGF5LWxpbmsnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0dGVtcGxhdGVJZDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlbXBsYXRlLWlkJylcclxuXHR9XHJcblxyXG5cdC8qKiBTZXQgc3RhdGUgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdG9wZW46IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBLZXlkb3duIGhhbmRsZXIgZnVuY3Rpb25cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7Q2xpY2tFdmVudH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xyXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0XHRvcGVuKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9wZW4gdGhlIGluZm8gb3ZlcmxheVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb3BlbigpIHtcclxuXHRcdHNjb3BlLnN0YXRlLm9wZW4gPSB0cnVlXHJcblx0XHRzY29wZS5lbWl0KEJGLmV2ZW50cy5PUEVOX0lORk9fT1ZFUkxBWSwgc2NvcGUucHJvcHMudGVtcGxhdGVJZClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluZm8gb3ZlcmxheSB3YXMgY2xvc2VkXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBjbG9zZSgpIHtcclxuXHRcdGlmICghc2NvcGUuc3RhdGUub3BlbikgcmV0dXJuXHJcblx0XHRzY29wZS5zdGF0ZS5vcGVuID0gZmFsc2VcclxuXHRcdC8vIGZvY3VzIGxpbmsgZm9yIHNjcmVlbiByZWFkZXJzXHJcblx0XHRlbC5mb2N1cygpXHJcblx0fVxyXG5cclxuXHQvKiogTGlzdGVuIGZvciBldmVudHMgKi9cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLkNMT1NFX0lORk9fT1ZFUkxBWSwgY2xvc2UpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSW5qdXJpZXMgQ29tcG9uZW50XHJcbiAqIEluanVyeSBpbnB1dHMgb24gdGhlIHNob2UgZmluZGVyXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWluanVyaWVzXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWluanVyeS1pbnB1dC1uYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGZvcm0gaW5wdXRcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtbm8taW5qdXJpZXMtdmFsdWUgLSB0aGUgaW5wdXQgdmFsdWUgd2hlbiBubyBpbmp1cmllcyBhcmUgc2VsZXRlZFxyXG4gKiBAcHJvcGVydHkgZGF0YS1uby1pbmp1cmllcy1idXR0b24gLSBwbGFjZSBhdHRyaWJ1dGUgb24gJ25vIGluanVyaWVzJyBidXR0b25cclxuICogQHByb3BlcnR5IGRhdGEtY29udGludWUtYnV0dG9uIC0gcGxhY2UgYXR0cmlidXRlIG9uICdjb250aW51ZScgYnV0dG9uXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWluanVyeS1vcHRpb24gLSBwbGFjZSBhdHRyaWJ1dGUgb24gaW5qdXJ5IGlucHV0IGxhYmVsc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnaW5qdXJpZXMnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0aW5qdXJ5SW5wdXROYW1lOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5qdXJ5LWlucHV0LW5hbWUnKSxcclxuXHRcdG5vSW5qdXJpZXNWYWx1ZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW5vLWluanVyaWVzLXZhbHVlJylcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0bm9Jbmp1cmllc0J1dHRvbjogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtbm8taW5qdXJpZXMtYnV0dG9uXScpLFxyXG5cdFx0bm9Jbmp1cmllc0lucHV0OiBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1uby1pbmp1cmllcy1pbnB1dF0nKSxcclxuXHRcdGNvbnRpbnVlQnV0dG9uOiBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb250aW51ZS1idXR0b25dJyksXHJcblx0XHRpbmp1cnlPcHRpb25zOiBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pbmp1cnktb3B0aW9uXScpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWRlIGFuZCBzaG93ICdjb250aW51ZScgYW5kICdubyBpbmp1cmllcycgYnV0dG9ucyBkZXBlbmRpbmcgb24gaW5wdXQgdmFsdWVzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNldEZvcm1WYWx1ZXMoKSB7XHJcblx0XHR2YXIgaW5wdXRzID0gQkYuc2VydmljZXMuZm9ybS5mb3JtVmFsdWVzKCkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0cmV0dXJuIGl0ZW0ubmFtZSA9PSBzY29wZS5wcm9wcy5pbmp1cnlJbnB1dE5hbWVcclxuXHRcdH0pXHJcblxyXG5cdFx0Ly8gaWYgbW9yZSB0aGFuIG9uZSBpcyBzZWxlY3RlZCBubyBpbmp1cmllcyBzaG91bGQgbm90IGJlIGNoZWNrZWRcclxuXHJcblx0XHRpZiAoaW5wdXRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0c2NvcGUuZWxzLm5vSW5qdXJpZXNJbnB1dC5jaGVja2VkID0gZmFsc2VcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiAnbm8gaW5qdXJpZXMnIGlzIHNlbGVjdGVkXHJcblx0XHRpZiAoaW5wdXRzLmxlbmd0aCA9PT0gMCB8fCBub0luanVyaWVzU2VsZWN0ZWQoaW5wdXRzKSkge1xyXG5cdFx0XHRzY29wZS5lbHMuY29udGludWVCdXR0b24uc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cdFx0XHRzY29wZS5lbHMubm9Jbmp1cmllc0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0c2NvcGUuZWxzLmNvbnRpbnVlQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblx0XHRcdHNjb3BlLmVscy5ub0luanVyaWVzQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIGlmICdubyBpbmp1cmllcycgaXMgc2VsZWN0ZWRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG5vSW5qdXJpZXNTZWxlY3RlZChpbnB1dHMpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdGlucHV0cy5maWx0ZXIoZnVuY3Rpb24oaW5wdXQpIHtcclxuXHRcdFx0XHRyZXR1cm4gaW5wdXQudmFsdWUgPT0gc2NvcGUucHJvcHMubm9Jbmp1cmllc1ZhbHVlXHJcblx0XHRcdH0pLmxlbmd0aCA+IDBcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdoZW4gY2xpY2tpbmcgbm8gaW5qdXJpZXMgdW5jaGVjayBvdGhlciBvcHRpb25zIGFuZCBjaGVjayBubyBpbmp1cmllcyBpbnB1dFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25Ob0luanVyaWVzQ2xpY2soKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjb3BlLmVscy5pbmp1cnlPcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHNjb3BlLmVscy5pbmp1cnlPcHRpb25zW2ldLmNoZWNrZWQgPSBmYWxzZVxyXG5cdFx0fVxyXG5cdFx0c2NvcGUuZWxzLm5vSW5qdXJpZXNJbnB1dC5jaGVja2VkID0gdHJ1ZVxyXG5cdH1cclxuXHJcblx0LyoqIEluaXRpYWxpemUgKi9cclxuXHJcblx0c2NvcGUuZWxzLm5vSW5qdXJpZXNCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbk5vSW5qdXJpZXNDbGljaylcclxuXHJcblx0c2NvcGUuaW5pdChmdW5jdGlvbigpIHtcclxuXHRcdG9uU2V0Rm9ybVZhbHVlcygpXHJcblx0XHQvLyBsaXN0ZW4gZm9yIGV2ZW50c1xyXG5cdFx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgb25TZXRGb3JtVmFsdWVzKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSW5qdXJ5IFZhbHVlIENvbXBvbmVudFxyXG4gKiBTaG93cyB0ZXh0IHN0cmluZyBiYXNlZCBvbiBpbmp1cnkgaW5wdXQgdmFsdWVzXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWluanVyeS12YWx1ZVxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS1pbnB1dC1uYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGlucHV0XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXZhbHVlLWxhYmVsLW1hcCAtIGFuIG9iamVjdCB3aXRoIGlucHV0IHZhbHVlIHRvIGxhYmVsIG1hcHBpbmdcclxuICpcclxuICovXHJcbkJGLmNvbXBvbmVudCgnaW5qdXJ5LXZhbHVlJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0aWYgKCFlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmFsdWUtbGFiZWwtbWFwJykpXHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoXHJcblx0XHRcdCdkYXRhLXZhbHVlLWxhYmVsLW1hcCBhdHRyaWJ1dGUgaXMgcmVxdWlyZWQsIGFuZCBtdXN0IGJlIGFuIG9iamVjdCBwYXJzYWJsZSB0byBKU09OJ1xyXG5cdFx0KVxyXG5cclxuXHRpZiAoIWVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pbnB1dC1uYW1lJykpXHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ2RhdGEtaW5wdXQtbmFtZSBhdHRyaWJ1dGUgaXMgcmVxdWlyZWQnKVxyXG5cclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0aW5qdXJ5SW5wdXROYW1lOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5wdXQtbmFtZScpLFxyXG5cdFx0bGFiZWxzOiBKU09OLnBhcnNlKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS12YWx1ZS1sYWJlbC1tYXAnKSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZSB0ZXh0IHN0cmluZyB3aGVuIGZvcm0gdmFsdWVzIHVwZGF0ZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TZXRGb3JtVmFsdWVzKCkge1xyXG5cdFx0dmFyIGlucHV0ID0gQkYuc2VydmljZXMuZm9ybS5mb3JtVmFsdWVzKCkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0cmV0dXJuIGl0ZW0ubmFtZSA9PSBzY29wZS5wcm9wcy5pbmp1cnlJbnB1dE5hbWVcclxuXHRcdH0pXHJcblxyXG5cdFx0ZWwudGV4dENvbnRlbnQgPSAnJ1xyXG5cclxuXHRcdC8vIGlmIG5vIHZhbHVlXHJcblx0XHRpZiAoIWlucHV0Lmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm5cclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiAnbm9uZScgaXMgc2VsZWN0ZWRcclxuXHRcdGlmIChpbnB1dC5sZW5ndGggPT0gMSkge1xyXG5cdFx0XHRlbC50ZXh0Q29udGVudCA9IHNjb3BlLnByb3BzLmxhYmVsc1tpbnB1dFswXS52YWx1ZV1cclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0aW5wdXQubWFwKGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XHJcblx0XHRcdGVsLnRleHRDb250ZW50ICs9XHJcblx0XHRcdFx0aW5kZXggPiAwID8gJywgJyArIHNjb3BlLnByb3BzLmxhYmVsc1tpdGVtLnZhbHVlXSA6IHNjb3BlLnByb3BzLmxhYmVsc1tpdGVtLnZhbHVlXVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKiBJbml0aWFsaXplICAqL1xyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHRvblNldEZvcm1WYWx1ZXMoKVxyXG5cdFx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgb25TZXRGb3JtVmFsdWVzKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSW5wdXQgQnV0dG9uIENvbXBvbmVudFxyXG4gKiBUZWxsIEZvcm0gc2VydmljZSB0byB1cGRhdGUgdmFsdWVzIG9uIGNsaWNrXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWlucHV0LWJ1dHRvblxyXG4gKiBAcHJvcGVydHkgZGF0YS1pbnB1dC1pZCAob3B0aW9uYWwpXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWlucHV0LXZhbHVlIChvcHRpb25hbClcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2lucHV0LWJ1dHRvbicsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRpbnB1dElkOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5wdXQtaWQnKSxcclxuXHRcdGlucHV0VmFsdWU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pbnB1dC12YWx1ZScpXHJcblx0fVxyXG5cclxuXHQvKiogRGVmaW5lIHJlZmVyZW5jZWQgZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0aW5wdXQ6IHNjb3BlLnByb3BzLmlucHV0SWQgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY29wZS5wcm9wcy5pbnB1dElkKSA6IG51bGxcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0aWYgKHNjb3BlLmVscy5pbnB1dCkge1xyXG5cdFx0XHRpZiAoc2NvcGUuZWxzLmlucHV0LnR5cGUgPT0gJ3JhZGlvJyB8fCBzY29wZS5lbHMuaW5wdXQudHlwZSA9PSAnY2hlY2tib3gnKSB7XHJcblx0XHRcdFx0c2NvcGUuZWxzLmlucHV0LmNoZWNrZWQgPSB0cnVlXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRCRi5zZXJ2aWNlcy5mb3JtLnVwZGF0ZUZvcm1WYWx1ZXMoKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgTG9hZCBUZW1wbGF0ZSBDb21wb25lbnRcclxuICogTG9hZHMgYSB0ZW1wbGF0ZVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1sb2FkLXRlbXBsYXRlXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXRlbXBsYXRlIC0gdGVtcGxhdGUgaWRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2xvYWQtdGVtcGxhdGUnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogVGVybWluYXRlIGlmIHRlbXBsYXRlIGlkIGlzIG5vdCBkZWZpbmVkICAqL1xyXG5cdGlmICghZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlbXBsYXRlJykpIHtcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignVGVtcGxhdGUgaWQgbm90IHNwZWNpZmllZCcpXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0dGVtcGxhdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS10ZW1wbGF0ZScpKS5pbm5lckhUTUxcclxuXHR9XHJcblxyXG5cdC8qKiBUZXJtaW5hdGUgaWYgdGVtcGxhdGUgaXMgaW52YWxpZCAgKi9cclxuXHRpZiAoIXNjb3BlLnByb3BzLnRlbXBsYXRlKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ1ZhbGlkIHRlbXBsYXRlIElEIHJlcXVpcmVkJylcclxuXHR9XHJcblxyXG5cdC8qKiBJbml0aWFsaXplICAqL1xyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHR2YXIgdGVtcGxhdGUgPSAkKHNjb3BlLnByb3BzLnRlbXBsYXRlKVswXVxyXG5cdFx0JChlbCkucmVwbGFjZVdpdGgodGVtcGxhdGUpXHJcblx0XHRCRi5jb21waWxlKHRlbXBsYXRlKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgTG9hZCBUZW1wbGF0ZSBCZWZvcmUgU2NyZWVuIENvbXBvbmVudFxyXG4gKiBMb2FkcyBhIHRlbXBsYXRlIGJlZm9yZSBhIHNwZWNpZmllZCBzY3JlZW5cclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtbG9hZC10ZW1wbGF0ZS1iZWZvcmUtc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWlkIC0gc2NyZWVuIGlkXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLXRlbXBsYXRlIC0gdGVtcGxhdGUgaWRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2xvYWQtdGVtcGxhdGUtYmVmb3JlLXNjcmVlbicsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdHZhciB0ZW1wbGF0ZUlkID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXRlbXBsYXRlJylcclxuXHR2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZUlkKVxyXG5cclxuXHQvKiogVGVybWluYXRlIGlmIHRlbXBsYXRlIGlzIGludmFsaWQgICovXHJcblx0aWYgKCF0ZW1wbGF0ZSkge1xyXG5cdFx0cmV0dXJuIHNjb3BlLmVycm9yKFxyXG5cdFx0XHQnVmFsaWQgdGVtcGxhdGUgSWQgcmVxdWlyZWQuICcgK1xyXG5cdFx0XHRcdCh0ZW1wbGF0ZUlkID8gJ1NwZWNpZmllZCBJZCB3YXMgJyArIHRlbXBsYXRlSWQgOiAnSWQgbm90IHNwZWNpZmllZCcpXHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0aWQ6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpLFxyXG5cdFx0dGVtcGxhdGU6IHRlbXBsYXRlLmlubmVySFRNTFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBpbml0aWFsIFN0YXRlICAqL1xyXG5cdHNjb3BlLnN0YXRlID0ge1xyXG5cdFx0bG9hZGVkOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIGVsZW1lbnRzICAqL1xyXG5cdHNjb3BlLmVscyA9IHtcclxuXHRcdHRlbXBsYXRlOiBudWxsXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgc3RhcnRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlblRyYW5zaXRpb25TdGFydChkYXRhKSB7XHJcblx0XHQvLyBJZiBjdXJyZW50IHNjcmVlbiBpcyB0aGUgc3BlY2lmaWVkIHNjcmVlbiwgc2hvdyBjb250ZW50XHJcblx0XHQhc2NvcGUuc3RhdGUubG9hZGVkICYmIGRhdGEuYWN0aXZlLmlkID09PSBzY29wZS5wcm9wcy5pZCAmJiBpbml0TG9hZCgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgZW5kZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5UcmFuc2l0aW9uRW5kKGRhdGEpIHtcclxuXHRcdC8vIGlmIHRlbXBsYXRlIGhhc24ndCBiZWVuIGxvYWRlZCBhbmQgc2NyZWVuIGlzIG5leHQsIGN1cnJlbnQsIG9yIHByZXZpb3VzLCBsb2FkIHRlbXBsYXRlXHJcblx0XHQhc2NvcGUuc3RhdGUubG9hZGVkICYmXHJcblx0XHRcdChCRi5zZXJ2aWNlcy5zY3JlZW5zLnJlbGF0aXZlU2NyZWVuSW5kZXgoc2NvcGUucHJvcHMuaWQpID49IC0xICYmXHJcblx0XHRcdFx0QkYuc2VydmljZXMuc2NyZWVucy5yZWxhdGl2ZVNjcmVlbkluZGV4KHNjb3BlLnByb3BzLmlkKSA8PSAxKSAmJlxyXG5cdFx0XHRpbml0TG9hZCgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplZCB0ZW1wbGF0ZSBsb2FkXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0TG9hZCgpIHtcclxuXHRcdHNjb3BlLnN0YXRlLmxvYWRlZCA9IHRydWVcclxuXHRcdHNjb3BlLmVscy50ZW1wbGF0ZSA9ICQoc2NvcGUucHJvcHMudGVtcGxhdGUpWzBdXHJcblx0XHQkKGVsKS5yZXBsYWNlV2l0aChzY29wZS5lbHMudGVtcGxhdGUpXHJcblx0XHRCRi5jb21waWxlKHNjb3BlLmVscy50ZW1wbGF0ZSlcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9TVEFSVCwgb25TY3JlZW5UcmFuc2l0aW9uU3RhcnQpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX0VORCwgb25TY3JlZW5UcmFuc2l0aW9uRW5kKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIExvYWRpbmcgU2NyZWVuIENvbXBvbmVudFxyXG4gKiBMb2FkcyBuZXh0IHNjcmVlbiB3aGVuIGxvYWRpbmcgc2NyZWVuIGJlY29tZXMgYWN0aXZlXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLWxvYWRpbmctc2NyZWVuXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWlkIC0gbG9hZGluZyBzY3JlZW4gaWRcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ2xvYWRpbmctc2NyZWVuJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGlkOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSxcclxuXHRcdGxvYWRpbmdUaW1lOiAxNTAwXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHbyB0byBuZXh0IHNjcmVlbiBpZiB0cmFuc2l0aW9uIHRvIGxvYWRpbmcgc2NyZWVuIGlzIGZpbmlzaGVkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLmFjdGl2ZSAtIHNjcmVlbiBvYmplY3RcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5wcmV2aW91cyAtIHNjcmVlbiBvYmplY3RcclxuXHQgKiBAcHJvcGVydHkge0Jvb2x9IGRhdGEucmV2ZXJzZSAtIHRydWUgaWYgZ29pbmcgdG8gYSBwcmV2aW91cyBzY3JlZW5cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uU2NyZWVuVHJhbnNpdGlvbkVuZChkYXRhKSB7XHJcblx0XHRkYXRhLmFjdGl2ZS5pZCA9PT0gc2NvcGUucHJvcHMuaWQgJiZcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRCRi5zZXJ2aWNlcy5zY3JlZW5zLm5leHRTY3JlZW4oKVxyXG5cdFx0XHR9LCBzY29wZS5wcm9wcy5sb2FkaW5nVGltZSlcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIG9uU2NyZWVuVHJhbnNpdGlvbkVuZClcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBMb2dvIENvbXBvbmVudFxyXG4gKiBNYW5hZ2VzIGNsYXNzZXMgb24gdGhlIHNob2UgZmluZGVyIGxvZ29cclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtbG9nb1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnbG9nbycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHR2aXNpYmxlQ2xhc3M6ICdiZi1sb2dvLS12aXNpYmxlJyxcclxuXHRcdGRpc2FibGVUcmFuc2l0aW9uQ2xhc3M6ICdiZi1sb2dvLS1kaXNhYmxlLXRyYW5zaXRpb25zJyxcclxuXHRcdGNoZWNrcG9pbnRDbGFzczogJ2JmLWxvZ28tLWNoZWNrcG9pbnQnLFxyXG5cdFx0c21hbGxDbGFzczogJ2JmLWxvZ28tLXNtYWxsJyxcclxuXHRcdGxhcmdlQ2xhc3M6ICdiZi1sb2dvLS1sYXJnZSdcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUFjdGl2ZShkYXRhKSB7XHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhcclxuXHRcdFx0W1xyXG5cdFx0XHRcdHNjb3BlLnByb3BzLnZpc2libGVDbGFzcyxcclxuXHRcdFx0XHRzY29wZS5wcm9wcy5zbWFsbENsYXNzLFxyXG5cdFx0XHRcdHNjb3BlLnByb3BzLmxhcmdlQ2xhc3MsXHJcblx0XHRcdFx0c2NvcGUucHJvcHMuY2hlY2twb2ludENsYXNzXHJcblx0XHRcdF0uam9pbignICcpXHJcblx0XHQpXHJcblxyXG5cdFx0aWYgKGRhdGEuYWN0aXZlLnR5cGUgPT09ICdjaGVja3BvaW50Jykge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLnZpc2libGVDbGFzcylcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5jaGVja3BvaW50Q2xhc3MpXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnZpc2libGVDbGFzcylcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoZGF0YS5hY3RpdmUuaWQgIT09ICdTdGFydCcpIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5zbWFsbENsYXNzKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5sYXJnZUNsYXNzKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX0FDVElWRSwgb25TY3JlZW5DaGFuZ2VBY3RpdmUpXHJcblxyXG5cdC8qKiBBZGQgZGlzYWJsZSB0cmFuc2l0aW9ucyBvbiBwYWdlIGxvYWQgKi9cclxuXHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmRpc2FibGVUcmFuc2l0aW9uQ2xhc3MpXHJcblx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuZGlzYWJsZVRyYW5zaXRpb25DbGFzcylcclxuXHR9LCAyMDAwKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFNob3cgTmV4dCBTY3JlZW4gTGlua1xyXG4gKiBTaG93IG5leHQgc2NyZWVuIG9uIGNsaWNrXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLW5leHQtc2NyZWVuLWxpbmtcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ25leHQtc2NyZWVuLWxpbmsnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdEJGLnNlcnZpY2VzLnNjcmVlbnMubmV4dFNjcmVlbigpXHJcblx0fSlcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBPcGVuIFByb2dyZXNzIExpbmsgQ29tcG9uZW50XHJcbiAqIE9wZW4gcHJvZ3Jlc3MgbWVudSBvbiBjbGljayAodG91Y2ggZGV2aWNlcyBvbmx5KVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1vcGVuLXByb2dyZXNzLWxpbmtcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ29wZW4tcHJvZ3Jlc3MtbGluaycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8vIG9ubHkgb3BlbiBvbiB0b3VjaCBkZXZpY2VzXHJcblx0aWYgKCFCRi5zZXJ2aWNlcy5kZXZpY2UuaGFzVG91Y2gpIHJldHVyblxyXG5cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdHNjb3BlLmVtaXQoQkYuZXZlbnRzLk9QRU5fUFJPR1JFU1NfTUVOVSlcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFBhZ2UgQ29tcG9uZW50XHJcbiAqIEFkZCAvIHJlbW92ZSBzY3JvbGwgYmFyIHBhZGRpbmcgd2hlbiBpbmZvIG92ZXJsYXkgb3IgcHJvZ3Jlc3MgbWVudSBpcyBvcGVuXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLXBhZ2VcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ3BhZ2UnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKipcclxuXHQgKiBBZGRzIHNjcm9sbGJhciBwYWRkaW5nIHRvIGNvbnRhaW5lclxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYWRkU2Nyb2xsYmFyUGFkZGluZygpIHtcclxuXHRcdGlmIChlbC5zY3JvbGxIZWlnaHQgPiBlbC5vZmZzZXRIZWlnaHQpIHtcclxuXHRcdFx0ZWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gQkYuc2VydmljZXMuc2Nyb2xsLnNjcm9sbGJhcldpZHRoKCkgKyAncHgnXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHNjcm9sbGJhciBwYWRkaW5nIGZyb20gY29udGFpbmVyXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiByZW1vdmVTY3JvbGxiYXJQYWRkaW5nKCkge1xyXG5cdFx0ZWwuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJydcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5PUEVOX0lORk9fT1ZFUkxBWSwgYWRkU2Nyb2xsYmFyUGFkZGluZylcclxuXHRzY29wZS5vbihCRi5ldmVudHMuQ0xPU0VfSU5GT19PVkVSTEFZLCByZW1vdmVTY3JvbGxiYXJQYWRkaW5nKVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFByb2dyZXNzIENvbXBvbmVudFxyXG4gKiBUaGUgcHJvZ3Jlc3MgbmF2IGNvbXBvbmVudFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1wcm9ncmVzc1xyXG4gKiBAcHJvcGVydHkgZGF0YS1pdGVtcyAtIHBsYWNlIG9uIG5hdiBpdGVtcyBjb250YWluZXJcclxuICogQHByb3BlcnR5IGRhdGEtYWN0aXZlLWluZGljYXRvciAtIHBsYWNlIG9uIGFjdGl2ZSBpbmRpY2F0b3IgaXRlbVxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgncHJvZ3Jlc3MnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0YWN0aXZlQ2xhc3M6ICdiZi1wcm9ncmVzcy0tYWN0aXZlJyxcclxuXHRcdG9wZW5DbGFzczogJ2JmLXByb2dyZXNzLS1vcGVuJyxcclxuXHRcdG9wZW5pbmdDbGFzczogJ2JmLXByb2dyZXNzLS1vcGVuaW5nJyxcclxuXHRcdGNsb3NpbmdDbGFzczogJ2JmLXByb2dyZXNzLS1jbG9zaW5nJyxcclxuXHRcdGhvdmVyZWRDbGFzczogJ2JmLXByb2dyZXNzLS1ob3ZlcmVkJyxcclxuXHRcdHJlY2VudGx5SG92ZXJlZENsYXNzOiAnYmYtcHJvZ3Jlc3MtLXJlY2VudGx5LWhvdmVyZWQnLFxyXG5cdFx0Y2FuSG92ZXJDbGFzczogJ2JmLXByb2dyZXNzLS1jYW4taG92ZXInLFxyXG5cdFx0bm9UcmFuc2l0aW9uRGVsYXlDbGFzczogJ2JmLXByb2dyZXNzLS1uby1kZWxheScsXHJcblx0XHRzY3JlZW5DaGFuZ2VDbGFzczogJ2JmLXByb2dyZXNzLS1pbi1zY3JlZW4tY2hhbmdlJyxcclxuXHRcdG51bWJlck9mSXRlbXM6ICQoZWwucXVlcnlTZWxlY3RvcignW2RhdGEtaXRlbXNdJykpLmNoaWxkcmVuKCkubGVuZ3RoLFxyXG5cdFx0aXRlbUFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcclxuXHRcdGl0ZW1Db21wbGV0ZUNsYXNzOiAnY29tcGxldGVkJyxcclxuXHRcdGl0ZW1JbmNvbXBsZXRlQ2xhc3M6ICdpbmNvbXBsZXRlJ1xyXG5cdH1cclxuXHJcblx0LyoqIFNldCBzdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdHdpZHRoOiBlbC5vZmZzZXRXaWR0aCxcclxuXHRcdG9wZW46IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKiogRGVmaW5lIHJlZmVyZW5jZWQgRE9NIGVsZW1lbnRzICAqL1xyXG5cdHNjb3BlLmVscyA9IHtcclxuXHRcdGluZGljYXRvcjogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtYWN0aXZlLWluZGljYXRvcl0nKSxcclxuXHRcdGl0ZW1zOiAkKGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWl0ZW1zXScpKS5jaGlsZHJlbigpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgc3RhcnRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZVN0YXJ0KGRhdGEpIHtcclxuXHRcdC8vIGFkZCBzY3JlZW4gY2hhbmdlIGNsYXNzXHJcblx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnNjcmVlbkNoYW5nZUNsYXNzKVxyXG5cclxuXHRcdC8vIHJlbW92ZSBob3ZlcmVkIGNsYXNzXHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKFxyXG5cdFx0XHRzY29wZS5wcm9wcy5ob3ZlcmVkQ2xhc3MsXHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMucmVjZW50bHlIb3ZlcmVkQ2xhc3MpXHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gcmVtb3ZlIGFjdGl2ZSBjbGFzcyBvbiBpdGVtc1xyXG5cdFx0c2NvcGUuZWxzLml0ZW1zLnJlbW92ZUNsYXNzKHNjb3BlLnByb3BzLml0ZW1BY3RpdmVDbGFzcylcclxuXHJcblx0XHQvLyB1cGRhdGUgaXRlbSBjbGFzc2VzXHJcblx0XHQvL2lmIChCRi5oZWxwZXJzLmlzRm9ybVNjcmVlbihhY3RpdmVTY3JlZW4oKSkpIHtcclxuXHRcdHVwZGF0ZUl0ZW1zKClcclxuXHRcdC8vfVxyXG5cclxuXHRcdC8vIHVwZGF0ZSBpbmRpY2F0b3JcclxuXHRcdC8vaWYgKEJGLmhlbHBlcnMuaXNGb3JtU2NyZWVuKGRhdGEuYWN0aXZlKSkge1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0dXBkYXRlSW5kaWNhdG9yKEJGLnNlcnZpY2VzLnNjcmVlbnMuZm9ybVNjcmVlbkluZGV4QnlJZChkYXRhLmFjdGl2ZS5pZCkpXHJcblx0XHR9LCA3MDApXHJcblx0XHQvL31cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUFjdGl2ZShkYXRhKSB7XHJcblx0XHRCRi5oZWxwZXJzLmlzRm9ybVNjcmVlbihkYXRhLmFjdGl2ZSkgPyBzaG93KCkgOiBoaWRlKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGhhcyBlbmRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUVuZChkYXRhKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLnNjcmVlbkNoYW5nZUNsYXNzKVxyXG5cdFx0aWYgKCFCRi5oZWxwZXJzLmlzRm9ybVNjcmVlbihkYXRhLmFjdGl2ZSkpIHJldHVyblxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0dXBkYXRlSW5kaWNhdG9yUG9zaXRpb24oKVxyXG5cdFx0fSwgMzAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIHRoZSBpbmRpY2F0b3IgcG9zaXRpb24gd2hlbiBicm93c2VyIHdpbmRvdyBpcyByZXNpemVkXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcclxuXHRcdHVwZGF0ZUluZGljYXRvclBvc2l0aW9uKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEJpbmQgbmF2IGl0ZW0gZXZlbnRzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBiaW5kSXRlbUV2ZW50cygpIHtcclxuXHRcdHNjb3BlLmVscy5pdGVtcy5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdC8vIGNsaWNrXHJcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdFx0XHRcdGl0ZW1DbGlja2VkKGluZGV4KVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQvLyBzcGFjZSBvciBlbnRlciBmb3Igc2NyZWVuIHJlYWRlcnNcclxuXHRcdFx0dGhpcy5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRpZiAoZS5rZXlDb2RlID09IDMyIHx8IGUua2V5Q29kZSA9PSAxMykge1xyXG5cdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXHJcblx0XHRcdFx0XHRpdGVtQ2xpY2tlZChpbmRleClcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHR9KVxyXG5cclxuXHRcdC8vIGJpbmQgbW91c2Ugb25seSBldmVudHNcclxuXHRcdCFCRi5zZXJ2aWNlcy5kZXZpY2UuaGFzVG91Y2ggJiYgYmluZE1vdXNlRXZlbnRzKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9uIGl0ZW0gY2xpY2tcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIGl0ZW0gaW5kZXhcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGl0ZW1DbGlja2VkKGluZGV4KSB7XHJcblx0XHRzY29wZS5zdGF0ZS5vcGVuICYmIHNjb3BlLmVtaXQoQkYuZXZlbnRzLkNMT1NFX1BST0dSRVNTX01FTlUpXHJcblx0XHQvLyBpZiBzdGVwIGhhcyBiZWVuIGNvbXBsZXRlZCwgY2hhbmdlIHNjcmVlbnMgYW5kIHN1Ym1pdCBhbmFseXRpY3MgZXZlbnRcclxuXHRcdGlmIChCRi5zZXJ2aWNlcy5mb3JtLmNvbXBsZXRlZEJ5SW5kZXgoaW5kZXgpKSB7XHJcblx0XHRcdC8vIEJGLnNlcnZpY2VzLmFuYWx5dGljcy5ldmVudCgnbmF2aWdhdGlvbicsIG51bGwsIHtcclxuXHRcdFx0Ly8gXHRmcm9tOiBCRi5zZXJ2aWNlcy5zY3JlZW5zLmFjdGl2ZUZvcm1TY3JlZW5JbmRleCgpLFxyXG5cdFx0XHQvLyBcdHRvOiBpbmRleFxyXG5cdFx0XHQvLyB9KVxyXG5cdFx0XHRCRi5zZXJ2aWNlcy5zY3JlZW5zLmNoYW5nZVNjcmVlbihmb3JtU2NyZWVucygpW2luZGV4XS5pZClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEJpbmQgZWxlbWVudCBldmVudHNcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGJpbmRNb3VzZUV2ZW50cygpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMuY2FuSG92ZXJDbGFzcylcclxuXHRcdHNjb3BlLmVscy5pdGVtcy5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uSXRlbU1vdXNlRW50ZXIuYmluZChzY29wZSkpXHJcblx0XHR9KVxyXG5cclxuXHRcdGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0dW5ob3Zlck5hdigpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hlbiBtb3VzZSBlbnRlcnMgbmF2IGl0ZW1cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TW91c2VFdmVudH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uSXRlbU1vdXNlRW50ZXIoZXZlbnQpIHtcclxuXHRcdC8vIGlmIHN0ZXAgaXMgY29tcGxldGVkIGFuZCBub3QgYWN0aXZlIGFkZCBob3ZlciBjbGFzcyB0byBpdFxyXG5cdFx0aWYgKFxyXG5cdFx0XHRCRi5zZXJ2aWNlcy5mb3JtLmNvbXBsZXRlZEJ5SW5kZXgoJChldmVudC50YXJnZXQpLmluZGV4KCkpICYmXHJcblx0XHRcdGFjdGl2ZUluZGV4KCkgIT09ICQoZXZlbnQudGFyZ2V0KS5pbmRleCgpXHJcblx0XHQpIHtcclxuXHRcdFx0Ly8gYWRkIGNsYXNzZXNcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5ob3ZlcmVkQ2xhc3MpXHJcblx0XHR9XHJcblx0XHQvLyBpZiBzdGVwIGlzIG5vdCBjb21wbGV0ZWQgc2hvdyB0aGUgYWN0aXZlIHN0ZXBcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR1bmhvdmVyTmF2KClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdoZW4gbW91c2UgbGVhdmVzIG5hdlxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdW5ob3Zlck5hdigpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuaG92ZXJlZENsYXNzKVxyXG5cdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5yZWNlbnRseUhvdmVyZWRDbGFzcylcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMucmVjZW50bHlIb3ZlcmVkQ2xhc3MpXHJcblx0XHR9LCAyMDApXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGUgbmF2IGl0ZW0gY2xhc3Nlc1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlSXRlbXMoKSB7XHJcblx0XHQvLyByZW1vdmUgYWN0aXZlIGNsYXNzXHJcblx0XHRzY29wZS5lbHMuaXRlbXMucmVtb3ZlQ2xhc3Moc2NvcGUucHJvcHMuaXRlbUFjdGl2ZUNsYXNzKVxyXG5cclxuXHRcdC8vIGFkZCBhY3RpdmUgY2xhc3NcclxuXHRcdGFjdGl2ZUluZGV4KCkgIT09IG51bGwgJiZcclxuXHRcdFx0c2NvcGUuZWxzLml0ZW1zW2FjdGl2ZUluZGV4KCldICYmXHJcblx0XHRcdG1hcmtJdGVtQXNBY3RpdmUoc2NvcGUuZWxzLml0ZW1zW2FjdGl2ZUluZGV4KCldKVxyXG5cclxuXHRcdC8vIHJlbW92ZSBjb21wbGV0ZSwgaW5jb21wbGV0ZSBjbGFzc2VzXHJcblx0XHRzY29wZS5lbHMuaXRlbXMucmVtb3ZlQ2xhc3MoXHJcblx0XHRcdFtzY29wZS5wcm9wcy5pdGVtQ29tcGxldGVDbGFzcywgc2NvcGUucHJvcHMuaXRlbUluY29tcGxldGVDbGFzc10uam9pbignICcpXHJcblx0XHQpXHJcblxyXG5cdFx0Ly8gYWRkIGNvbXBsZXRlLCBpbmNvbXBsZXRlIGNsYXNzZXNcclxuXHRcdHNjb3BlLmVscy5pdGVtcy5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdGlmIChpbmRleCA9PT0gYWN0aXZlSW5kZXgoKSkgcmV0dXJuXHJcblx0XHRcdEJGLnNlcnZpY2VzLmZvcm0uY29tcGxldGVkQnlJbmRleChpbmRleClcclxuXHRcdFx0XHQ/IG1hcmtJdGVtQXNDb21wbGV0ZSh0aGlzKVxyXG5cdFx0XHRcdDogbWFya0l0ZW1Bc0luY29tcGxldGUodGhpcylcclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXJrIGl0ZW0gYXMgY29tcGxldGVkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGl0ZW1cclxuXHQgKlxyXG5cdCAqL1xyXG5cclxuXHRmdW5jdGlvbiBtYXJrSXRlbUFzQ29tcGxldGUoaXRlbSkge1xyXG5cdFx0aXRlbS5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLml0ZW1Db21wbGV0ZUNsYXNzKVxyXG5cdFx0c2V0QXR0cmlidXRlKGl0ZW0sICdyb2xlJywgJ2xpbmsnKVxyXG5cdFx0c2V0QXR0cmlidXRlKGl0ZW0sICd0YWJpbmRleCcsICcwJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE1hcmsgaXRlbSBhcyBhY3RpdmVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gaXRlbVxyXG5cdCAqXHJcblx0ICovXHJcblxyXG5cdGZ1bmN0aW9uIG1hcmtJdGVtQXNBY3RpdmUoaXRlbSkge1xyXG5cdFx0aXRlbS5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLml0ZW1BY3RpdmVDbGFzcylcclxuXHRcdHNldEF0dHJpYnV0ZShpdGVtLCAncm9sZScsICdoZWFkaW5nJylcclxuXHRcdHNldEF0dHJpYnV0ZShpdGVtLCAndGFiaW5kZXgnLCAnMCcpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNYXJrIGl0ZW0gYXMgaW5jb21wbGV0ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtFbGVtZW50fSBpdGVtXHJcblx0ICpcclxuXHQgKi9cclxuXHJcblx0ZnVuY3Rpb24gbWFya0l0ZW1Bc0luY29tcGxldGUoaXRlbSkge1xyXG5cdFx0aXRlbS5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLml0ZW1JbmNvbXBsZXRlQ2xhc3MpXHJcblx0XHRzZXRBdHRyaWJ1dGUoaXRlbSwgJ3JvbGUnLCAnJylcclxuXHRcdHNldEF0dHJpYnV0ZShpdGVtLCAndGFiaW5kZXgnLCAnJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZSBhY3RpdmUgaW5kaWNhdG9yXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBhY3RpdmUgZm9ybSBzY3JlZW4gaW5kZXhcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZUluZGljYXRvcihpbmRleCkge1xyXG5cdFx0c2V0SW5kaWNhdG9yUG9zaXRpb24oaW5kZXgpXHJcblx0XHRzZXRUaW1lb3V0KFxyXG5cdFx0XHRmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRcdHNjb3BlLmVscy5pbmRpY2F0b3IudGV4dENvbnRlbnQgPVxyXG5cdFx0XHRcdFx0aW5kZXggKyAxIDwgZm9ybVNjcmVlbnMoKS5sZW5ndGggPyBpbmRleCArIDEgOiBmb3JtU2NyZWVucygpLmxlbmd0aFxyXG5cdFx0XHR9LFxyXG5cdFx0XHQyNTAsXHJcblx0XHRcdGluZGV4XHJcblx0XHQpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGUgYWN0aXZlIGluZGljYXRvciBwb3NpdGlvblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlSW5kaWNhdG9yUG9zaXRpb24oKSB7XHJcblx0XHRzY29wZS5zdGF0ZS53aWR0aCA9IGVsLm9mZnNldFdpZHRoXHJcblx0XHRzZXRJbmRpY2F0b3JQb3NpdGlvbihhY3RpdmVJbmRleCgpKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2V0IGVsZW1lbnQgYXR0cmlidXRlLCBpZiBpZCBkb2Vzbid0IGFscmVhZHkgaGF2ZSBpdCAodGhpcyBhdm9pZCByZXBhaW50aW5nIGJ1Z3MpXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzZXRBdHRyaWJ1dGUoZWwsIHByb3BlcnR5LCB2YWx1ZSkge1xyXG5cdFx0aWYgKCFlbC5oYXNBdHRyaWJ1dGUocHJvcGVydHkpIHx8IGVsLmdldEF0dHJpYnV0ZShwcm9wZXJ0eSkgIT0gdmFsdWUpIHtcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKHByb3BlcnR5LCB2YWx1ZSlcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBhY3RpdmUgaW5kaWNhdG9yIHBvc2l0aW9uXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBmb3JtIHNjcmVlbiBpbmRleCB0byBtb3ZlIHRvXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzZXRJbmRpY2F0b3JQb3NpdGlvbihpbmRleCkge1xyXG5cdFx0c2NvcGUuZWxzLmluZGljYXRvci5zdHlsZS5vcGFjaXR5ID0gaW5kZXggPj0gZm9ybVNjcmVlbnMoKS5sZW5ndGggPyAwIDogMVxyXG5cclxuXHRcdHZhciBvZmZzZXRQZXJjZW50ID0gaW5kZXggLyAoc2NvcGUucHJvcHMubnVtYmVyT2ZJdGVtcyAtIDEpXHJcblxyXG5cdFx0Ly8gc2V0IHRyYW5zZm9ybSB4IGZvciB1bm9wZW5lZCBwb3NpdGlvblxyXG5cclxuXHRcdCQoc2NvcGUuZWxzLmluZGljYXRvcikuY3NzKFxyXG5cdFx0XHRCRi5oZWxwZXJzLnByZWZpeGVkQ3NzT2JqZWN0KHtcclxuXHRcdFx0XHR0cmFuc2Zvcm06XHJcblx0XHRcdFx0XHQndHJhbnNsYXRlWCgnICtcclxuXHRcdFx0XHRcdChpbmRleCA9PT0gZm9ybVNjcmVlbnMoKS5sZW5ndGhcclxuXHRcdFx0XHRcdFx0PyBzY29wZS5zdGF0ZS53aWR0aFxyXG5cdFx0XHRcdFx0XHQ6IHNjb3BlLnN0YXRlLndpZHRoICogb2Zmc2V0UGVyY2VudCkgK1xyXG5cdFx0XHRcdFx0J3B4KSdcclxuXHRcdFx0fSlcclxuXHRcdClcclxuXHRcdC8vIHNldCB0b3AgdmFsdWUgZm9yIG9wZW5lZCAob24gdG91Y2ggZGV2aWNlcykgcG9zaXRpb25cclxuXHJcblx0XHQkKHNjb3BlLmVscy5pbmRpY2F0b3IpLmNzcyh7XHJcblx0XHRcdHRvcDogb2Zmc2V0UGVyY2VudCA+IDEgPyAnMTAwJScgOiBvZmZzZXRQZXJjZW50ICogMTAwICsgJyUnXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT24gc2hvdyBwcm9ncmVzcyBuYXYgZXZlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uU2hvdygpIHtcclxuXHRcdHVwZGF0ZUluZGljYXRvclBvc2l0aW9uKClcclxuXHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubm9UcmFuc2l0aW9uRGVsYXlDbGFzcylcclxuXHRcdHNob3coKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT24gaGlkZSBwcm9ncmVzcyBuYXYgZXZlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uSGlkZSgpIHtcclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMubm9UcmFuc2l0aW9uRGVsYXlDbGFzcylcclxuXHRcdGhpZGUoKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBwcm9ncmVzcyBuYXZcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNob3coKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5vcGVuaW5nQ2xhc3MpXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLm9wZW5pbmdDbGFzcylcclxuXHRcdH0sIDUwMClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpZGUgcHJvZ3Jlc3MgbmF2XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBoaWRlKCkge1xyXG5cdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5hY3RpdmVDbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIE9uIG9wZW4gcHJvZ3Jlc3MgdG91Y2ggbmF2IGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbk9wZW4oKSB7XHJcblx0XHRpZiAoc2NvcGUuc3RhdGUub3BlbikgcmV0dXJuXHJcblx0XHRzY29wZS5zdGF0ZS5vcGVuID0gdHJ1ZVxyXG5cclxuXHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMub3BlbkNsYXNzKVxyXG5cdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuSElERV9TQ1JFRU5TKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogT24gY2xvc2UgcHJvZ3Jlc3MgdG91Y2ggbmF2IGV2ZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbkNsb3NlKCkge1xyXG5cdFx0aWYgKCFzY29wZS5zdGF0ZS5vcGVuKSByZXR1cm5cclxuXHRcdHNjb3BlLnN0YXRlLm9wZW4gPSBmYWxzZVxyXG5cclxuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMub3BlbkNsYXNzKVxyXG5cdFx0c2NvcGUuZW1pdChCRi5ldmVudHMuU0hPV19TQ1JFRU5TKVxyXG5cdFx0Ly8gYWRkIGNsYXNzIHRvIHByZXZlbnQgaXRlbXMgZnJvbSBhbmltYXRpbmcgYXMgdGhleSByZXBvc2l0aW9uXHJcblx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmNsb3NpbmdDbGFzcylcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoc2NvcGUucHJvcHMuY2xvc2luZ0NsYXNzKVxyXG5cdFx0fSwgMTAwKVxyXG5cdFx0Ly8gcmVwb3NpdGlvbiBpbmRpY2F0b3IgaW4gY2FzZSB2aWV3cG9ydCB3YXMgcmVzaXplZFxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0dXBkYXRlSW5kaWNhdG9yUG9zaXRpb24oKVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgYWN0aXZlIHNjcmVlblxyXG5cdCAqXHJcblx0ICogQHJldHVybiB7T2JqZWN0fSBzY3JlZW5cclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gc2NyZWVuLmlkIC0gdW5pcXVlIGlkIGZvciB0aGUgc2NyZWVuXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi50eXBlIChlLmcgZm9ybSwgY2hlY2twb2ludCkgLSB0eXBlIG9mIHNjcmVlblxyXG5cdCAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNjcmVlbi5kZXBlbmRlbmN5IC0gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gYWN0aXZlU2NyZWVuKCkge1xyXG5cdFx0cmV0dXJuIEJGLnNlcnZpY2VzLnNjcmVlbnMuYWN0aXZlU2NyZWVuKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgYWN0aXZlIGZvcm0gc2NyZWVuIGluZGV4XHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9IGZvcm0gc2NyZWVuIGluZGV4XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhY3RpdmVJbmRleCgpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy5zY3JlZW5zLmZvcm1TY3JlZW5JbmRleEJ5SWQoQkYuc2VydmljZXMuc2NyZWVucy5hY3RpdmVTY3JlZW5JZCgpKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0IGZvcm0gc2NyZWVuc1xyXG5cdCAqXHJcblx0ICogQHJldHVybiB7QXJyYXl9IGFycmF5IG9mIHNjcmVlbiBvYmplY3RzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBmb3JtU2NyZWVucygpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy5zY3JlZW5zLnNjcmVlbnNCeVR5cGUoJ2Zvcm0nKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX1NUQVJULCBvblNjcmVlbkNoYW5nZVN0YXJ0KVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUsIG9uU2NyZWVuQ2hhbmdlQWN0aXZlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIG9uU2NyZWVuQ2hhbmdlRW5kKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5XSU5ET1dfUkVTSVpFLCBvbldpbmRvd1Jlc2l6ZSlcclxuXHRzY29wZS5vbihCRi5ldmVudHMuT1BFTl9QUk9HUkVTU19NRU5VLCBvbk9wZW4pXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLkNMT1NFX1BST0dSRVNTX01FTlUsIG9uQ2xvc2UpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNIT1dfUFJPR1JFU1NfTUVOVSwgb25TaG93KVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5ISURFX1BST0dSRVNTX01FTlUsIG9uSGlkZSlcclxuXHJcblx0LyoqIEluaXRpYWxpemUgKi9cclxuXHRzY29wZS5pbml0KGZ1bmN0aW9uKCkge1xyXG5cdFx0Ly8gdXBkYXRlIGl0ZW0gY2xhc3NlcyBvbiBsb2FkXHJcblx0XHRzZXRUaW1lb3V0KHVwZGF0ZUl0ZW1zKVxyXG5cdFx0YmluZEl0ZW1FdmVudHMoKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgUmVzdGFydCBMaW5rIENvbXBvbmVudFxyXG4gKiBSZXNldHMgcHJvZ3Jlc3Mgb24gY2xpY2sgYW5kIHJlZGlyZWN0cyB0byBmaXJzdCBmb3JtIHN0ZXBcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtcmVzdGFydC1saW5rXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdyZXN0YXJ0LWxpbmsnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdEJGLnNlcnZpY2VzLmZvcm0ucmVzZXQoKVxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0QkYuc2VydmljZXMuc2NyZWVucy5uZXh0U2NyZWVuKClcclxuXHRcdH0pXHJcblx0fSlcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBSZXN1bHRzIEhlYWRlciBQYWQgQ29tcG9uZW50XHJcbiAqXHJcbiAqIEFkZHMgcGFkZGluZyB0byByZXN1bHRzIGhlYWRlciBvbiBjZXJ0YWluIGJyb3dzZXIgd2lkdGhzIHdoZW4gJ2VkaXQgYW5zd2VycycgbWVudSBpcyBvcGVuLCBlbnN1cmluZyBpdCBkb2Vzbid0IGNvdmVyIGhlYWRlciBjb250ZW50XHJcbiAqXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdyZXN1bHRzLWhlYWRlci1wYWQnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0cGFkZGluZzogNjUsXHJcblx0XHR0cmFuc2l0aW9uRHVyYXRpb246IDQwMCxcclxuXHRcdGJyb3dzZXJFbmRXaWR0aDogMTIwMFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYWRkUGFkZGluZygpIHtcclxuXHRcdC8vIGNoZWNrIHRvIG1ha2Ugc3VyZSBpdHMgbm90IGEgdG91Y2ggZGV2aWNlIGFuZCBicm93c2VyIHdpZHRoIGlzIGluIHRoZSBjb3JyZWN0IHJhbmdlXHJcblx0XHRpZiAoQkYuc2VydmljZXMuZGV2aWNlLmhhc1RvdWNoIHx8IEJGLnNlcnZpY2VzLndpbmRvdy53aWR0aCgpID4gc2NvcGUucHJvcHMuYnJvd3NlckVuZFdpZHRoKVxyXG5cdFx0XHRyZXR1cm5cclxuXHJcblx0XHQkKGVsKS5hbmltYXRlKFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0J3BhZGRpbmctdG9wJzogc2NvcGUucHJvcHMucGFkZGluZ1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRzY29wZS5wcm9wcy50cmFuc2l0aW9uRHVyYXRpb25cclxuXHRcdClcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZVBhZGRpbmcoKSB7XHJcblx0XHQkKGVsKS5hbmltYXRlKFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0J3BhZGRpbmctdG9wJzogMFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzY29wZS5wcm9wcy50cmFuc2l0aW9uRHVyYXRpb25cclxuXHRcdClcclxuXHR9XHJcblxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TSE9XX1BST0dSRVNTX01FTlUsIGFkZFBhZGRpbmcpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLkhJREVfUFJPR1JFU1NfTUVOVSwgcmVtb3ZlUGFkZGluZylcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBSZXN1bHRzIE5hdiBDb21wb25lbnRcclxuICogTmF2IGNvbXBvbmVudCBvbiB0aGUgcmVzdWx0cyBwYWdlXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLXJlc3VsdHMtbmF2XHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdyZXN1bHRzLW5hdicsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRoaWRkZW5DbGFzczogJ2hpZGUnXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBIaWRlcyB0aGUgbmF2XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBoaWRlKCkge1xyXG5cdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5oaWRkZW5DbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNob3dzIHRoZSBuYXZcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNob3coKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmhpZGRlbkNsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNIT1dfUFJPR1JFU1NfTUVOVSwgaGlkZSlcclxuXHRzY29wZS5vbihCRi5ldmVudHMuSElERV9QUk9HUkVTU19NRU5VLCBzaG93KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFJlc3VsdHMgU3RpY2t5IE5hdiBDb21wb25lbnRcclxuICogSnVtcCBsaW5rIG5hdiB0byBmaW5kZXIgcmVzdWx0c1xyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1yZXN1bHRzLXN0aWNreS1uYXZcclxuICogQHByb3BlcnR5IGRhdGEtaXRlbXMgLSBwbGFjZSBvbiBpdGVtIGNvbnRhaW5lciBlbGVtZW50XHJcbiAqIEBwcm9wZXJ0eSBkYXRhLXN0aWNreS1lbCAtIHBsYWNlIG9uIGVsZW1lbnQgdGhhdCBzaG91bGQgc3RpY2tcclxuICogQHByb3BlcnR5IGRhdGEtdG9wLWxpbmsgLSBwbGFjZSBvbiAndG9wIG9mIHBhZ2UnIGp1bXAgbGlua1xyXG4gKiBAcHJvcGVydHkgZGF0YS1zaG93LWF0LXRvcCAtIHBsYWNlIG9uIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIHZpc2libGUgYmVmb3JlIHRoZSB1c2VyIHNjcm9sbHNcclxuICogQHByb3BlcnR5IGRhdGEtc2hvdy1vbi1zY3JvbGxlZCAtIHBsYWNlIG9uIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIHZpc2libGUgYWZ0ZXIgdGhlIHVzZXIgc2Nyb2xsc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgncmVzdWx0cy1zdGlja3ktbmF2JywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGFjdGl2ZUNsYXNzOiAnYmYtcmVzdWx0cy1zdGlja3ktbmF2LS1hY3RpdmUnLFxyXG5cdFx0c3RpY2t5Q2xhc3M6ICdiZi1yZXN1bHRzLXN0aWNreS1uYXYtLXN0aWNreScsXHJcblx0XHRjb21wbGV0ZUNsYXNzOiAnYmYtcmVzdWx0cy1zdGlja3ktbmF2LS1jb21wbGV0ZScsXHJcblx0XHRpdGVtQ2xhc3M6ICdiZi1yZXN1bHRzLXN0aWNreS1uYXZfX2l0ZW0nLFxyXG5cdFx0aXRlbUFjdGl2ZUNsYXNzOiAnYmYtcmVzdWx0cy1zdGlja3ktbmF2X19pdGVtLS1hY3RpdmUnLFxyXG5cdFx0c3RpY2t5T2Zmc2V0OiA0MFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBzdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdHJlc3VsdE9mZnNldHM6IFtdLFxyXG5cdFx0cmVzdWx0c0hlaWdodDogMCxcclxuXHRcdG5hdkhlaWdodDogMCxcclxuXHRcdG5hdk9mZnNldDogMCxcclxuXHRcdGlzU3R1Y2s6IGZhbHNlLFxyXG5cdFx0d2luZG93UmVzaXplSGFuZGxlcjogbnVsbFxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIERPTSBlbGVtZW50cyAgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHRzdGlja3lFbDogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtc3RpY2t5LWVsXScpLFxyXG5cdFx0aXRlbUNvbnRhaW5lcjogZWwucXVlcnlTZWxlY3RvcignW2RhdGEtaXRlbXNdJyksXHJcblx0XHR0b3BMaW5rOiBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10b3AtbGlua10nKSxcclxuXHRcdHNob3dPblRvcDogZWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2hvdy1hdC10b3BdJyksXHJcblx0XHRzaG93T25TY3JvbGw6IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNob3ctb24tc2Nyb2xsZWRdJyksXHJcblx0XHRpdGVtczogW10sXHJcblx0XHRyZXN1bHRzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1maW5kZXItcmVzdWx0XScpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBJbnNlcnQgbmF2IGVsZW1lbnRzIChudW1iZXJzKVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaW5zZXJ0SXRlbXMoKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjb3BlLmVscy5yZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHZhciBpdGVtID0gJCgnPGkgY2xhc3M9XCInICsgc2NvcGUucHJvcHMuaXRlbUNsYXNzICsgJ1wiID4nICsgKGkgKyAxKSArICc8L2k+JylbMF1cclxuXHRcdFx0Ly8gYWRkIGV2ZW50IGxpc3RlbmVyc1xyXG5cdFx0XHRpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25JdGVtQ2xpY2spXHJcblx0XHRcdC8vIGFkZCB0byBlbGVtZW50XHJcblx0XHRcdHNjb3BlLmVscy5pdGVtcy5wdXNoKGl0ZW0pXHJcblx0XHRcdHNjb3BlLmVscy5pdGVtQ29udGFpbmVyLmFwcGVuZENoaWxkKGl0ZW0pXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBNZWFzdXJlIGVsZW1lbnRzIGFuZCB1cGRhdGUgc3RhdGVcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG1lYXN1cmUoKSB7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNjb3BlLmVscy5yZXN1bHRzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHNjb3BlLnN0YXRlLnJlc3VsdE9mZnNldHNbaV0gPSAkKHNjb3BlLmVscy5yZXN1bHRzW2ldKS5vZmZzZXQoKS50b3BcclxuXHJcblx0XHRcdC8vIHVwZGF0ZSBoZWlnaHQgaWYgbGFzdCBpdGVtXHJcblxyXG5cdFx0XHRpZiAoc2NvcGUuZWxzLnJlc3VsdHMubGVuZ3RoID09PSBpICsgMSkge1xyXG5cdFx0XHRcdHNjb3BlLnN0YXRlLnJlc3VsdHNIZWlnaHQgPVxyXG5cdFx0XHRcdFx0JChzY29wZS5lbHMucmVzdWx0c1tpXSkub2Zmc2V0KCkudG9wICsgJChzY29wZS5lbHMucmVzdWx0c1tpXSkuaGVpZ2h0KClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIHVwZGF0ZSBuYXYgaGVpZ2h0XHJcblxyXG5cdFx0c2NvcGUuc3RhdGUubmF2T2Zmc2V0ID0gJChlbCkub2Zmc2V0KCkudG9wXHJcblx0XHRzY29wZS5zdGF0ZS5uYXZIZWlnaHQgPSBzY29wZS5lbHMuc3RpY2t5RWwub2Zmc2V0SGVpZ2h0XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBVcGRhdGUgdGhlIGFjdGl2ZSBpdGVtIGJhc2VkIG9uIHNjcm9sbCBwb3NpdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjcm9sbFBvc2l0aW9uXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVBY3RpdmVJdGVtKHNjcm9sbFBvc2l0aW9uKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmNvbXBsZXRlQ2xhc3MpXHJcblxyXG5cdFx0c2NvcGUuZWxzLml0ZW1zLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcblx0XHRcdGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5pdGVtQWN0aXZlQ2xhc3MpXHJcblx0XHR9KVxyXG5cclxuXHRcdC8vIHJldHVybiBpZiBzY3JvbGxlZCBwYXN0IGFsbCByZXN1bHRzXHJcblxyXG5cdFx0aWYgKHNjcm9sbFBvc2l0aW9uID4gc2NvcGUuc3RhdGUucmVzdWx0c0hlaWdodCAtIHdpbmRvd0hlaWdodCgpIC8gMilcclxuXHRcdFx0cmV0dXJuIGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMuY29tcGxldGVDbGFzcylcclxuXHJcblx0XHR2YXIgYWN0aXZlSW5kZXggPSBudWxsXHJcblx0XHRzY29wZS5zdGF0ZS5yZXN1bHRPZmZzZXRzLm1hcChmdW5jdGlvbihvZmZzZXQsIGluZGV4KSB7XHJcblx0XHRcdGFjdGl2ZUluZGV4ID0gc2Nyb2xsUG9zaXRpb24gKyB3aW5kb3dIZWlnaHQoKSAvIDIgPiBvZmZzZXQgPyBpbmRleCA6IGFjdGl2ZUluZGV4XHJcblx0XHR9KVxyXG5cclxuXHRcdGlmIChhY3RpdmVJbmRleCAhPT0gbnVsbCkge1xyXG5cdFx0XHRzY29wZS5lbHMuaXRlbXNbYWN0aXZlSW5kZXhdLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMuaXRlbUFjdGl2ZUNsYXNzKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGVjaWRlIGlmIG5hdiBzaG91bGQgc3RpY2tcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBzY3JvbGxQb3NpdGlvblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gdXBkYXRlU3RpY2t5UG9zaXRpb24oc2Nyb2xsUG9zaXRpb24pIHtcclxuXHRcdHNjcm9sbFBvc2l0aW9uID4gc2NvcGUuc3RhdGUubmF2T2Zmc2V0IC0gc2NvcGUucHJvcHMuc3RpY2t5T2Zmc2V0XHJcblx0XHRcdD8gZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5zdGlja3lDbGFzcylcclxuXHRcdFx0OiBlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLnN0aWNreUNsYXNzKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSAvIFNob3cgZWxlbWVudHMgZGVwZW5kaW5nIG9uIHNjcm9sbCBwb3NpdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHNjcm9sbFBvc2l0aW9uXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiB1cGRhdGVFbGVtZW50VmlzaWJpbGl0eShzY3JvbGxQb3NpdGlvbikge1xyXG5cdFx0aWYgKHNjcm9sbFBvc2l0aW9uID4gNDAwKSB7XHJcblx0XHRcdCQoc2NvcGUuZWxzLnNob3dPblRvcCkuY3NzKCdkaXNwbGF5JywgJ25vbmUnKVxyXG5cdFx0XHQkKHNjb3BlLmVscy5zaG93T25TY3JvbGwpLmNzcygnZGlzcGxheScsICcnKVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0JChzY29wZS5lbHMuc2hvd09uU2Nyb2xsKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpXHJcblx0XHRcdCQoc2NvcGUuZWxzLnNob3dPblRvcCkuY3NzKCdkaXNwbGF5JywgJycpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIHdpbmRvdyBoZWlnaHRcclxuXHQgKlxyXG5cdCAqIEByZXR1cm4ge051bWJlcn1cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHdpbmRvd0hlaWdodCgpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy53aW5kb3cuaGVpZ2h0KClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldCB0aGUgc2Nyb2xsIHBvc2l0aW9uXHJcblx0ICpcclxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzY3JvbGxQb3NpdGlvbigpIHtcclxuXHRcdHJldHVybiBCRi5zZXJ2aWNlcy5zY3JvbGwucG9zaXRpb24oKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2Nyb2xsIHBvc2l0aW9uIGhhcyBjaGFuZ2VkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxyXG5cdCAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBkYXRhLnkgLSB2ZXJ0aWNhbCBzY3JvbGwgcG9zaXRpb24gb2YgcGFnZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JvbGwoZGF0YSkge1xyXG5cdFx0aWYgKCFzY29wZS5lbHMuaXRlbXMubGVuZ3RoKSByZXR1cm5cclxuXHRcdHVwZGF0ZVN0aWNreVBvc2l0aW9uKGRhdGEueSlcclxuXHRcdHVwZGF0ZUFjdGl2ZUl0ZW0oZGF0YS55KVxyXG5cdFx0dXBkYXRlRWxlbWVudFZpc2liaWxpdHkoZGF0YS55KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIGJyb3dzZXIgd2luZG93IGhhcyBiZWVuIHJlc2l6ZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtOdW1iZXJ9IGRhdGEud2lkdGggLSB3aWR0aCBvZiB3aW5kb3dcclxuXHQgKiBAcHJvcGVydHkge051bWJlcn0gZGF0YS5oZWlnaHQgLSBoZWlnaHQgb2Ygd2luZG93XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcclxuXHRcdGNsZWFyVGltZW91dChzY29wZS5zdGF0ZS53aW5kb3dSZXNpemVIYW5kbGVyKVxyXG5cdFx0c2NvcGUuc3RhdGUud2luZG93UmVzaXplSGFuZGxlciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdG1lYXN1cmUoKVxyXG5cdFx0XHR1cGRhdGVTdGlja3lQb3NpdGlvbihzY3JvbGxQb3NpdGlvbigpKVxyXG5cdFx0XHR1cGRhdGVBY3RpdmVJdGVtKHNjcm9sbFBvc2l0aW9uKCkpXHJcblx0XHR9LCA1MDApXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgZW5kZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5UcmFuc2l0aW9uRW5kKCkge1xyXG5cdFx0bWVhc3VyZSgpXHJcblx0XHQvLyBvbmx5IHNob3cgbmF2IGlmIG1vcmUgdGhhbiAxIHJlc3VsdFxyXG5cdFx0aWYgKHNjb3BlLmVscy5yZXN1bHRzLmxlbmd0aCA+IDEpIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5hY3RpdmVDbGFzcylcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNjcm9sbCB0byBpdGVtXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzY3JvbGxUb0l0ZW0oaW5kZXgpIHtcclxuXHRcdHNjcm9sbChzY29wZS5zdGF0ZS5yZXN1bHRPZmZzZXRzW2luZGV4XSAtIHNjb3BlLnByb3BzLnN0aWNreU9mZnNldClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNjcm9sbCB0byByZXN1bHQgd2hlbiBuYXYgaXRlbSBpcyBjbGlja2VkXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbkl0ZW1DbGljaygpIHtcclxuXHRcdHNjcm9sbFRvSXRlbSgkKHRoaXMpLmluZGV4KCkpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTY3JvbGwgdG8gdG9wIG9mIHBhZ2Ugd2hlbiAndG9wIGxpbmsnIGVsZW1lbnQgaXMgY2xpY2tlZFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25Ub3BDbGljaygpIHtcclxuXHRcdHNjcm9sbCgwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQW5pbWF0ZSBzY3JvbGwgdG8gcGFnZSBwb3NpdGlvblxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCAtICBwaXhlbCBvZmZzZXQgKHJlbGF0aXZlIHRvIGRvY3VtZW50KSB0byBzY3JvbGwgdG9cclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzY3JvbGwob2Zmc2V0KSB7XHJcblx0XHQkKCdodG1sLCBib2R5JykuYW5pbWF0ZShcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHNjcm9sbFRvcDogb2Zmc2V0XHJcblx0XHRcdH0sXHJcblx0XHRcdDEwMDBcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdC8qIEJpbmQgRXZlbnRzICovXHJcblxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5VU0VSX1NDUk9MTCwgb25TY3JvbGwpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLldJTkRPV19SRVNJWkUsIG9uV2luZG93UmVzaXplKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIG9uU2NyZWVuVHJhbnNpdGlvbkVuZClcclxuXHJcblx0c2NvcGUuZWxzLnRvcExpbmsgJiYgc2NvcGUuZWxzLnRvcExpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvblRvcENsaWNrKVxyXG5cclxuXHQvKiBJbml0aWFsaXplICovXHJcblxyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHRpbnNlcnRJdGVtcygpXHJcblx0XHR1cGRhdGVFbGVtZW50VmlzaWJpbGl0eShzY3JvbGxQb3NpdGlvbigpKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2NyZWVuIENvbXBvbmVudFxyXG4gKiBBcHAgc2NyZWVuIGNvbXBvbmVudFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1zY3JlZW5cclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtaWQgLSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHNjcmVlblxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS10eXBlIC0gdHlwZSBvZiBzdHJpbmcgKGUuZy4gZm9ybSwgY2hlY2twb2ludCwgbnVsbClcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtd2FpdC1mb3IgLSBuYW1lIG9mIGRlcGVuZGVuY3kvZnVuY3Rpb24gZnJvbSBBUEkgc2VydmljZSB0aGF0IHNob3VsZCBiZSBsb2FkZWQgYmVmb3JlIHNob3dpbmcgdGhlIHNjcmVlblxyXG4gKiBAcHJvcGVydHkgZGF0YS1mb2N1cy1maXJzdCAtIGlmIHByZXNlbnQsIHRoaXMgZWxlbWVudCB3aWxsIGJlIGZvY3VzZWQgZmlyc3Qgb24gc2NyZWVuIGNoYW5nZSAoZm9yIHNjcmVlbiByZWFkZXJzKS4gZGVmYXVsdCBpcyBmaXJzdCBlbGVtZW50IHdpdGggdGFiaW5kZXg9XCIwXCIgYXR0cmlidXRlXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLXByaW9yaXR5LXNjcmVlbiAtIGlmIHByZXNlbnQsIHRoaXMgc2NyZWVuIHdpbGwgYmUgdmlzaXRlZCBpZiBhdHRlbXB0aW5nIHRvIG5hdmlnYXRlIHRvIGFub3RoZXIgc2NyZWVuIGFmdGVyIHRoaXMgc2NyZWVuIGJ1dCBiZWZvcmUgYW5vdGhlciBzY3JlZW4gb2YgdGhpcyB0eXBlXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdzY3JlZW4nLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHR2YXIgY2xhc3NQcmVmaXggPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtY2xhc3MtcHJlZml4JykgfHwgJ2JmLXNjcmVlbi0tJ1xyXG5cclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0aWQ6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpLFxyXG5cdFx0dHlwZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXR5cGUnKSB8fCBudWxsLFxyXG5cdFx0aGFzUHJpb3JpdHk6IGVsLmhhc0F0dHJpYnV0ZSgnZGF0YS1wcmlvcml0eS1zY3JlZW4nKSxcclxuXHRcdGRlcGVuZGVuY3k6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS13YWl0LWZvcicpIHx8IG51bGwsXHJcblx0XHRyZW5kZXJDbGFzczogY2xhc3NQcmVmaXggKyAncmVuZGVyJyxcclxuXHRcdGVudGVyQ2xhc3M6IGNsYXNzUHJlZml4ICsgJ2VudGVyJyxcclxuXHRcdGVudGVyQWN0aXZlQ2xhc3M6IGNsYXNzUHJlZml4ICsgJ2VudGVyLWFjdGl2ZScsXHJcblx0XHRlbnRlclJldmVyc2VBY3RpdmVDbGFzczogY2xhc3NQcmVmaXggKyAnZW50ZXItcmV2ZXJzZS1hY3RpdmUnLFxyXG5cdFx0bGVhdmVDbGFzczogY2xhc3NQcmVmaXggKyAnbGVhdmUnLFxyXG5cdFx0bGVhdmVBY3RpdmVDbGFzczogY2xhc3NQcmVmaXggKyAnbGVhdmUtYWN0aXZlJyxcclxuXHRcdGxlYXZlUmV2ZXJzZUFjdGl2ZUNsYXNzOiBjbGFzc1ByZWZpeCArICdsZWF2ZS1yZXZlcnNlLWFjdGl2ZScsXHJcblx0XHRhY3RpdmVDbGFzczogY2xhc3NQcmVmaXggKyAnYWN0aXZlJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVGhlIHNjcmVlbiBjaGFuZ2UgaGFzIHN0YXJ0ZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5DaGFuZ2VTdGFydChkYXRhKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cclxuXHRcdC8vIGlmIGFjdGl2ZSBzY3JlZW5cclxuXHRcdGlmIChpc0FjdGl2ZShkYXRhKSkge1xyXG5cdFx0XHQkKGVsKS5hZGRDbGFzcyhbc2NvcGUucHJvcHMucmVuZGVyQ2xhc3MsIHNjb3BlLnByb3BzLmVudGVyQ2xhc3NdLmpvaW4oJyAnKSlcclxuXHRcdFx0LyogSGFjayB0byBnZXQgSUUxMSBmbGV4Ym94IGdyb3cgdG8gd29yayBjb3JyZWN0bHkgKi9cclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0XHR1cGRhdGVTY3JlZW5IZWlnaHQoKVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHByZXZpb3VzIHNjcmVlblxyXG5cdFx0ZWxzZSBpZiAoaXNQcmV2aW91cyhkYXRhKSkge1xyXG5cdFx0XHQkKGVsKS5hZGRDbGFzcyhbc2NvcGUucHJvcHMucmVuZGVyQ2xhc3MsIHNjb3BlLnByb3BzLmxlYXZlQ2xhc3NdLmpvaW4oJyAnKSlcclxuXHRcdH1cclxuXHJcblx0XHQvLyBpZiBuZWl0aGVyXHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5yZW5kZXJDbGFzcylcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUFjdGl2ZShkYXRhKSB7XHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhbc2NvcGUucHJvcHMuZW50ZXJDbGFzcywgc2NvcGUucHJvcHMubGVhdmVDbGFzc10uam9pbignICcpKVxyXG5cclxuXHRcdC8vIGlmIGFjdGl2ZSBzY3JlZW5cclxuXHRcdGlmIChpc0FjdGl2ZShkYXRhKSkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmVudGVyQWN0aXZlQ2xhc3MpXHJcblx0XHRcdGlmIChkYXRhLnJldmVyc2UpIGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMuZW50ZXJSZXZlcnNlQWN0aXZlQ2xhc3MpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgcHJldmlvdXMgc2NyZWVuXHJcblx0XHRpZiAoaXNQcmV2aW91cyhkYXRhKSkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmxlYXZlQWN0aXZlQ2xhc3MpXHJcblx0XHRcdGlmIChkYXRhLnJldmVyc2UpIGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubGVhdmVSZXZlcnNlQWN0aXZlQ2xhc3MpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgYWN0aXZlIGFuZCBub3QgdGhlIGZpcnN0IHNjcmVlbiBmb2N1cyBvbiBzY3JlZW5cclxuXHRcdGlmIChpc0FjdGl2ZShkYXRhKSAmJiBkYXRhLnByZXZpb3VzKSBmb2N1c09uU2NyZWVuKClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGhhcyBlbmRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUVuZChkYXRhKSB7XHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhcclxuXHRcdFx0W1xyXG5cdFx0XHRcdHNjb3BlLnByb3BzLmVudGVyQWN0aXZlQ2xhc3MsXHJcblx0XHRcdFx0c2NvcGUucHJvcHMubGVhdmVBY3RpdmVDbGFzcyxcclxuXHRcdFx0XHRzY29wZS5wcm9wcy5lbnRlclJldmVyc2VBY3RpdmVDbGFzcyxcclxuXHRcdFx0XHRzY29wZS5wcm9wcy5sZWF2ZVJldmVyc2VBY3RpdmVDbGFzc1xyXG5cdFx0XHRdLmpvaW4oJyAnKVxyXG5cdFx0KVxyXG5cclxuXHRcdC8vIGlmIGFjdGl2ZSBzY3JlZW5cclxuXHRcdGlmIChpc0FjdGl2ZShkYXRhKSkge1xyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmFjdGl2ZUNsYXNzKVxyXG5cdFx0XHQvKiBIYWNrIHRvIGdldCBJRTExIGZsZXhib3ggZ3JvdyB0byB3b3JrIGNvcnJlY3RseSAqL1xyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHVwZGF0ZVNjcmVlbkhlaWdodCgpXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgcHJldmlvdXMgc2NyZWVuXHJcblx0XHRpZiAoaXNQcmV2aW91cyhkYXRhKSkgZWwuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy5yZW5kZXJDbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNldCBzY3JlZW4gaGVpZ2h0IHRvIGhlaWdodCBvZiBjb250ZW50cyAoZml4ZXMgSUUgMTEgZmxleGJveCBncm93IGJ1ZylcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZVNjcmVlbkhlaWdodCgpIHtcclxuXHRcdGlmICghQkYuaGVscGVycy5pc0lFKCkpIHJldHVyblxyXG5cclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBoZWlnaHQgPSAkKGVsKVxyXG5cdFx0XHRcdC5jaGlsZHJlbigpXHJcblx0XHRcdFx0LmZpcnN0KClcclxuXHRcdFx0XHQub3V0ZXJIZWlnaHQoKVxyXG5cdFx0XHRlbC5zdHlsZS5oZWlnaHQgPVxyXG5cdFx0XHRcdGhlaWdodCA+IEJGLnNlcnZpY2VzLndpbmRvdy5oZWlnaHQoKSB8fCBCRi5zZXJ2aWNlcy53aW5kb3cud2lkdGgoKSA8IDEwMDBcclxuXHRcdFx0XHRcdD8gJydcclxuXHRcdFx0XHRcdDogaGVpZ2h0ICsgJ3B4J1xyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZSBoZWlnaHQgb24gd2luZG93IHJlc2l6ZVxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25XaW5kb3dSZXNpemUoKSB7XHJcblx0XHRpZiAoQkYuc2VydmljZXMuc2NyZWVucy5hY3RpdmVTY3JlZW5JZCgpID09IHNjb3BlLnByb3BzLmlkKSB7XHJcblx0XHRcdHNldFRpbWVvdXQodXBkYXRlU2NyZWVuSGVpZ2h0LCA1MClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIENoZWNrIGlmIHNjcmVlbiBpcyBhY3RpdmVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBzY3JlZW5cclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gc2NyZWVuLmlkIC0gdW5pcXVlIGlkIGZvciB0aGUgc2NyZWVuXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi50eXBlIChlLmcgZm9ybSwgY2hlY2twb2ludCkgLSB0eXBlIG9mIHNjcmVlblxyXG5cdCAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNjcmVlbi5kZXBlbmRlbmN5IC0gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZVxyXG5cdCAqIEByZXR1cm4ge0Jvb2x9XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpc0FjdGl2ZShkYXRhKSB7XHJcblx0XHRyZXR1cm4gZGF0YS5hY3RpdmUuaWQgPT09IHNjb3BlLnByb3BzLmlkXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBpZiBzY3JlZW4gaXMgd2FzIHRoZSBwcmV2aW91cyBzY3JlZW5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBzY3JlZW5cclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gc2NyZWVuLmlkIC0gdW5pcXVlIGlkIGZvciB0aGUgc2NyZWVuXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHNjcmVlbi50eXBlIChlLmcgZm9ybSwgY2hlY2twb2ludCkgLSB0eXBlIG9mIHNjcmVlblxyXG5cdCAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNjcmVlbi5kZXBlbmRlbmN5IC0gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcHJvbWlzZVxyXG5cdCAqIEByZXR1cm4ge0Jvb2x9XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpc1ByZXZpb3VzKGRhdGEpIHtcclxuXHRcdHJldHVybiBkYXRhLnByZXZpb3VzID8gZGF0YS5wcmV2aW91cy5pZCA9PT0gc2NvcGUucHJvcHMuaWQgOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSB0aGUgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBoaWRlU2NyZWVuKCkge1xyXG5cdFx0ZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyB0aGUgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93U2NyZWVuKCkge1xyXG5cdFx0ZWwuc3R5bGUuZGlzcGxheSA9ICcnXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGb2N1cyBvbiBzY3JlZW5cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGZvY3VzT25TY3JlZW4oKSB7XHJcblx0XHR2YXIgZm9jdXNGaXJzdEVsZW1lbnQgPSBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1mb2N1cy1maXJzdF0nKVxyXG5cdFx0Zm9jdXNGaXJzdEVsZW1lbnQgPyBmb2N1c0ZpcnN0RWxlbWVudC5mb2N1cygpIDogZWwuZm9jdXMoKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9UUkFOU0lUSU9OX1NUQVJULCBvblNjcmVlbkNoYW5nZVN0YXJ0KVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUsIG9uU2NyZWVuQ2hhbmdlQWN0aXZlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIG9uU2NyZWVuQ2hhbmdlRW5kKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5ISURFX1NDUkVFTlMsIGhpZGVTY3JlZW4pXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNIT1dfU0NSRUVOUywgc2hvd1NjcmVlbilcclxuXHRzY29wZS5vbihCRi5ldmVudHMuV0lORE9XX1JFU0laRSwgb25XaW5kb3dSZXNpemUpXHJcblxyXG5cdC8qKiBJbml0aWFsaXplICovXHJcblxyXG5cdHNjb3BlLmluaXQoZnVuY3Rpb24oKSB7XHJcblx0XHQvLyByZWdpc3RlciBzY3JlZW5cclxuXHRcdEJGLnNlcnZpY2VzLnNjcmVlbnMucmVnaXN0ZXJTY3JlZW4oe1xyXG5cdFx0XHRpZDogc2NvcGUucHJvcHMuaWQsXHJcblx0XHRcdHR5cGU6IHNjb3BlLnByb3BzLnR5cGUsXHJcblx0XHRcdGhhc1ByaW9yaXR5OiBzY29wZS5wcm9wcy5oYXNQcmlvcml0eSxcclxuXHRcdFx0ZGVwZW5kZW5jeTpcclxuXHRcdFx0XHRzY29wZS5wcm9wcy5kZXBlbmRlbmN5ICYmIEJGLmVuZHBvaW50c1tzY29wZS5wcm9wcy5kZXBlbmRlbmN5XVxyXG5cdFx0XHRcdFx0PyBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQkYuc2VydmljZXMuYXBpLmNhbGwoXHJcblx0XHRcdFx0XHRcdFx0XHRCRi5lbmRwb2ludHNbc2NvcGUucHJvcHMuZGVwZW5kZW5jeV0udXJsLFxyXG5cdFx0XHRcdFx0XHRcdFx0QkYuZW5kcG9pbnRzW3Njb3BlLnByb3BzLmRlcGVuZGVuY3ldLnR5cGVcclxuXHRcdFx0XHRcdFx0XHQpXHJcblx0XHRcdFx0XHQgIH1cclxuXHRcdFx0XHRcdDogbnVsbFxyXG5cdFx0fSlcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFNjcmVlbiBMb2FkIEJ1dHRvbiBDb21wb25lbnRcclxuICogQWRkIGxvYWRpbmcgY2xhc3MgdG8gYnV0dG9uIGNvbXBvbmVudCB3aGVuIHNjcmVlbiBkZXBlbmRlbmN5IGlzIGxvYWRpbmdcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtc2NyZWVuLWxvYWQtYnV0dG9uXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdzY3JlZW4tbG9hZC1idXR0b24nLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0YnV0dG9uTG9hZGluZ0NsYXNzOiAnYmYtYnV0dG9uLS1sb2FkaW5nJ1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyBsb2FkZXIgd2hlbiBzY3JlZW4gZGF0YSBpcyBsb2FkaW5nXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvbkxvYWRpbmcoKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmJ1dHRvbkxvYWRpbmdDbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpZGUgbG9hZGVyIHdoZW4gc2NyZWVuIGRhdGEgaXMgZmluaXNoZWQgbG9hZGluZ1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25Mb2FkZWQoKSB7XHJcblx0XHRlbC5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLmJ1dHRvbkxvYWRpbmdDbGFzcylcclxuXHR9XHJcblxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5MT0FESU5HX1NDUkVFTl9EQVRBLCBvbkxvYWRpbmcpXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNDUkVFTl9EQVRBX0xPQURFRCwgb25Mb2FkZWQpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2VuZCBGb3JtIFByb2dyZXNzXHJcbiAqIFNlbmRzIGZvcm0gcHJvZ3Jlc3MgdG8gc2VydmVyXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLXNlbmQtZm9ybS1wcm9ncmVzc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnc2VuZC1mb3JtLXByb2dyZXNzJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0ZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcblx0XHRCRi5zZXJ2aWNlcy5mb3JtLnNlbmRGb3JtUHJvZ3Jlc3MoKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2hvdyBPbiBGb3JtIENvbXBsZXRlIENvbXBvbmVudFxyXG4gKiBTaG93cyBlbGVtZW50IGlmIGFsbCBmb3JtIHF1ZXN0aW9ucyBoYXZlIGJlZW4gYW5zd2VyZWRcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtc2hvdy1vbi1mb3JtLWNvbXBsZXRlXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdzaG93LW9uLWZvcm0tY29tcGxldGUnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0cGFnZUxvYWRUaW1lOiAyMDAwLFxyXG5cdFx0Y2hhbmdlTGVuZ3RoOiAxMDAwXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IGluaXRpYWwgU3RhdGUgICovXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHRwYWdlTG9hZGVkOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogU2hvdyB0aGUgZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gc2hvdygpIHtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKVxyXG5cdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSB0aGUgZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaGlkZSgpIHtcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hlbiBmb3JtIHZhbHVlcyBhcmUgdXBkYXRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gdmFsdWVzXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHZhbHVlcy5uYW1lIC0gbmFtZSBvZiBpbnB1dFxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2YWx1ZXMudmFsdWUgLSB2YWx1ZSBvZiBpbnB1dFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TZXRGb3JtVmFsdWVzKHZhbHVlcykge1xyXG5cdFx0Ly8gYWRkIHRpbWVvdXQgdG8gZml4IEZpcmVmb3ggdGltaW5nIGJ1Z1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0QkYuc2VydmljZXMuZm9ybS5mb3JtSXNDb21wbGV0ZSgpID8gc2hvdygpIDogaGlkZSgpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgb25TZXRGb3JtVmFsdWVzKVxyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUucGFnZUxvYWRlZCA9IHRydWVcclxuXHR9LCBzY29wZS5wcm9wcy5wYWdlTG9hZFRpbWUpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2hvdyBvbiBmb3JtIHByb2dyZXNzXHJcbiAqIFNob3cgYW4gZWxlbWVudCBpZiB1c2VyIGhhcyBjb21wbGV0ZWQgYW55IGZvcm0gc3RlcFxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1zaG93LW9uLWZvcm0tcHJvZ3Jlc3NcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ3Nob3ctb24tZm9ybS1wcm9ncmVzcycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRwYWdlTG9hZFRpbWU6IDIwMDAsXHJcblx0XHRjaGFuZ2VMZW5ndGg6IDEwMDBcclxuXHR9XHJcblxyXG5cdC8qKiBTZXQgaW5pdGlhbCBTdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdHBhZ2VMb2FkZWQ6IGZhbHNlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTaG93IHRoZSBlbGVtZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBzaG93KCkge1xyXG5cdFx0Ly8gc2V0IHRpbWVvdXQgc28gaXQgZG9lc250IGltbWVkaWF0ZWx5IHNob3cgZHVyaW5nIHRyYW5zaXRpb25zXHJcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJylcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXHJcblx0XHR9LCBzY29wZS5zdGF0ZS5wYWdlTG9hZGVkID8gc2NvcGUucHJvcHMuY2hhbmdlTGVuZ3RoIDogMClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhpZGUgdGhlIGVsZW1lbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGhpZGUoKSB7XHJcblx0XHQvLyBzZXQgdGltZW91dCBzbyBpdCBkb2VzbnQgaW1tZWRpYXRlbHkgaGlkZSBkdXJpbmcgdHJhbnNpdGlvbnNcclxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJylcclxuXHRcdH0sIHNjb3BlLnN0YXRlLnBhZ2VMb2FkZWQgPyBzY29wZS5wcm9wcy5jaGFuZ2VMZW5ndGggOiAwKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogVXBkYXRlIHZpc2libGl0eVxyXG5cdCAqXHJcblxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZSgpIHtcclxuXHRcdHZhciBoYXNQcm9ncmVzcyA9IEJGLnNlcnZpY2VzLmZvcm0uY29tcGxldGVkU3RlcHMoKS5sZW5ndGhcclxuXHJcblx0XHRoYXNQcm9ncmVzcyA/IHNob3coKSA6IGhpZGUoKVxyXG5cdH1cclxuXHJcblx0LyoqIExpc3RlbiBmb3IgZXZlbnRzICovXHJcblx0c2NvcGUub24oQkYuZXZlbnRzLlNFVF9GT1JNX1ZBTFVFUywgZnVuY3Rpb24oKSB7XHJcblx0XHRzZXRUaW1lb3V0KHVwZGF0ZSlcclxuXHR9KVxyXG5cclxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0c2NvcGUuc3RhdGUucGFnZUxvYWRlZCA9IHRydWVcclxuXHR9LCBzY29wZS5wcm9wcy5wYWdlTG9hZFRpbWUpXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgU2hvdyBPbiBGb3JtIFZhbHVlIENvbXBvbmVudFxyXG4gKiBTaG93cyBhbmQgaGlkZXMgZWxlbWVudCBiYXNlZCBvbiBzcGVjaWZpZWQgZm9ybSB2YWx1ZVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1zaG93LW9uLWZvcm0tdmFsdWVcclxuICogQHByb3BlcnR5IGRhdGEtbmFtZSAtIG5hbWUgb2YgdGhlIGZvcm0gaW5wdXRcclxuICogQHByb3BlcnR5IGRhdGEtdmFsdWUgLSB2YWx1ZSBvZiB0aGUgZm9ybSBpbnB1dFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnc2hvdy1vbi1mb3JtLXZhbHVlJywgZnVuY3Rpb24oc2NvcGUsIGVsKSB7XHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdG5hbWU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1uYW1lJyksXHJcblx0XHR2YWx1ZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXZhbHVlJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFNob3cgdGhlIGVsZW1lbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHNob3coKSB7XHJcblx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJylcclxuXHRcdGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAnZmFsc2UnKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGlkZSB0aGUgZWxlbWVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gaGlkZSgpIHtcclxuXHRcdGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHRcdGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBXaGVuIGZvcm0gdmFsdWVzIGFyZSB1cGRhdGVkXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXNcclxuXHQgKiBAcHJvcGVydHkge1N0cmluZ30gdmFsdWVzLm5hbWUgLSBuYW1lIG9mIGlucHV0XHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHZhbHVlcy52YWx1ZSAtIHZhbHVlIG9mIGlucHV0XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNldEZvcm1WYWx1ZXModmFsdWVzKSB7XHJcblx0XHR2YXIgaW5wdXQgPSB2YWx1ZXMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0cmV0dXJuIGl0ZW0ubmFtZSA9PSBzY29wZS5wcm9wcy5uYW1lXHJcblx0XHR9KVxyXG5cclxuXHRcdGlucHV0Lmxlbmd0aCAmJiBpbnB1dFswXS52YWx1ZSA9PT0gc2NvcGUucHJvcHMudmFsdWUgPyBzaG93KCkgOiBoaWRlKClcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TRVRfRk9STV9WQUxVRVMsIG9uU2V0Rm9ybVZhbHVlcylcclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBTaG93IFByb2dyZXNzIExpbmsgQ29tcG9uZW50XHJcbiAqIFNob3dzIHRoZSBwcm9ncmVzcyBtZW51IG9uIGNsaWNrXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdzaG93LXByb2dyZXNzLWxpbmsnLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiBEZWZpbmUgZWxlbWVudHMgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHRuYXY6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJmLXByb2dyZXNzXScpXHJcblx0fVxyXG5cclxuXHQvLyBvbiBtb2JpbGUgb3BlbiBtZW51LCBvbiBkZXNrdG9wIHNob3cgbWVudVxyXG5cclxuXHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdGUucHJldmVudERlZmF1bHQoKVxyXG5cdFx0QkYuc2VydmljZXMuZGV2aWNlLmhhc1RvdWNoXHJcblx0XHRcdD8gc2NvcGUuZW1pdChCRi5ldmVudHMuT1BFTl9QUk9HUkVTU19NRU5VKVxyXG5cdFx0XHQ6IHNjb3BlLmVtaXQoQkYuZXZlbnRzLlNIT1dfUFJPR1JFU1NfTUVOVSlcclxuXHRcdC8vIGZvY3VzIG9uIHByb2dyZXNzIGZvciBzY3JlZW4gcmVhZGVyc1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0c2NvcGUuZWxzLm5hdiAmJlxyXG5cdFx0XHRcdCQoc2NvcGUuZWxzLm5hdi5xdWVyeVNlbGVjdG9yKCdbZGF0YS1pdGVtc10nKSlcclxuXHRcdFx0XHRcdC5jaGlsZHJlbigpWzBdXHJcblx0XHRcdFx0XHQuZm9jdXMoKVxyXG5cdFx0fSwgNTAwKVxyXG5cdH0pXHJcbn0pXHJcblxyXG4vKipcclxuICogQGZpbGUgSW5qdXJpZXMgU2tlbGV0b24gQ29tcG9uZW50XHJcbiAqIER5bmFtaWMgc3ZnIGNvbXBvbmVudCBzcGVjaWZpYyB0byB0aGUgc2hvZSBmaW5kZXJcclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtaW5qdXJpZXNcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtdXJsIC0gdGhlIHVybCBvZiB0aGUgc3ZnIGltYWdlXHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWluanVyeS1pbnB1dC1uYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGZvcm0gaW5wdXRcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtZm9vdC1pbnB1dC12YWx1ZSAtIHRoZSBmb3JtIGlucHV0IHZhbHVlIGZvciBmb290XHJcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBkYXRhLWxlZy1pbnB1dC12YWx1ZSAtIHRoZSBmb3JtIGlucHV0IHZhbHVlIGZvciBsZWdcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEta25lZXMtaW5wdXQtdmFsdWUgLSB0aGUgZm9ybSBpbnB1dCB2YWx1ZSBmb3Iga25lZXNcclxuICogQHByb3BlcnR5IGRhdGEtY29udGludWUtYnV0dG9uIC0gcGxhY2UgYXR0cmlidXRlIG9uICdjb250aW51ZScgYnV0dG9uXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWluanVyeS1vcHRpb24gLSBwbGFjZSBhdHRyaWJ1dGUgb24gaW5qdXJ5IGlucHV0IGxhYmVsc1xyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgnc2tlbGV0b24nLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICAqL1xyXG5cdHNjb3BlLnByb3BzID0ge1xyXG5cdFx0bG9hZGVkQ2xhc3M6ICdiZi1tZWRpYS0tbG9hZGVkJyxcclxuXHRcdGZvb3RDbGFzczogJ2JmLXNrZWxldG9uLS1mb290JyxcclxuXHRcdGxlZ0NsYXNzOiAnYmYtc2tlbGV0b24tLWxlZycsXHJcblx0XHRrbmVlQ2xhc3M6ICdiZi1za2VsZXRvbi0ta25lZScsXHJcblx0XHRzdmdVcmw6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS11cmwnKSxcclxuXHRcdGluanVyeUlucHV0TmFtZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWluanVyeS1pbnB1dC1uYW1lJyksXHJcblx0XHRmb290VmFsdWU6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mb290LWlucHV0LXZhbHVlJyksXHJcblx0XHRsZWdWYWx1ZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWxlZy1pbnB1dC12YWx1ZScpLFxyXG5cdFx0a25lZXNWYWx1ZTogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWtuZWVzLWlucHV0LXZhbHVlJylcclxuXHR9XHJcblxyXG5cdC8qKiBUZXJtaW5hdGUgaWYgc3ZnIHVybCBub3Qgc3BlY2lmaWVkICAqL1xyXG5cdGlmICghc2NvcGUucHJvcHMuc3ZnVXJsKSB7XHJcblx0XHRyZXR1cm4gc2NvcGUuZXJyb3IoJ1NWRyB1cmwgbm90IGZvdW5kJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIExvYWQgdGhlIFNWRyBpbWFnZVxyXG5cdCAqXHJcblx0ICovXHJcblx0IGZ1bmN0aW9uIGxvYWRJbWFnZSgpIHtcclxuIFx0XHQkLmdldChzY29wZS5wcm9wcy5zdmdVcmwsIGZ1bmN0aW9uKGRvYykge1xyXG4gXHRcdFx0dmFyIHN2ZztcclxuIFx0XHRcdFxyXG4gXHRcdFx0aWYgKHR5cGVvZiBkb2MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGRvYy5xdWVyeVNlbGVjdG9yID09PSBcImZ1bmN0aW9uXCIpIHtcclxuIFx0XHRcdFx0c3ZnID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xyXG4gXHRcdFx0fSBlbHNlIHtcclxuIFx0XHRcdFx0c3ZnID0gJChkb2MpLmZpbmQoJ3N2ZycpWzBdO1xyXG4gXHRcdFx0fVxyXG4gXHRcdFx0XHJcbiBcdFx0XHRpZiAoc3ZnICE9PSB1bmRlZmluZWQpIHtcclxuIFx0XHRcdFx0ZWwuYXBwZW5kQ2hpbGQoc3ZnKVxyXG4gXHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLmxvYWRlZENsYXNzKVxyXG4gXHRcdFx0XHRvblNldEZvcm1WYWx1ZXMoKVxyXG4gXHRcdFx0fVxyXG4gXHRcdH0pLmZhaWwoZnVuY3Rpb24oKSB7XHJcbiBcdFx0XHRzY29wZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgaW1hZ2UnKVxyXG4gXHRcdH0pXHJcbiBcdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hlbiBmb3JtIHZhbHVlcyBhcmUgdXBkYXRlZFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtBcnJheX0gdmFsdWVzXHJcblx0ICogQHByb3BlcnR5IHtTdHJpbmd9IHZhbHVlcy5uYW1lIC0gbmFtZSBvZiBpbnB1dFxyXG5cdCAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2YWx1ZXMudmFsdWUgLSB2YWx1ZSBvZiBpbnB1dFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TZXRGb3JtVmFsdWVzKHZhbHVlcykge1xyXG5cdFx0dmFyIGlucHV0ID0gQkYuc2VydmljZXMuZm9ybS5mb3JtVmFsdWVzKCkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuXHRcdFx0cmV0dXJuIGl0ZW0ubmFtZSA9PSBzY29wZS5wcm9wcy5pbmp1cnlJbnB1dE5hbWVcclxuXHRcdH0pXHJcblx0XHQkKGVsKS5yZW1vdmVDbGFzcyhcclxuXHRcdFx0W3Njb3BlLnByb3BzLmZvb3RDbGFzcywgc2NvcGUucHJvcHMubGVnQ2xhc3MsIHNjb3BlLnByb3BzLmtuZWVDbGFzc10uam9pbignICcpXHJcblx0XHQpXHJcblx0XHRpbnB1dC5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG5cdFx0XHRpdGVtLnZhbHVlID09PSBzY29wZS5wcm9wcy5mb290VmFsdWUgJiYgZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5mb290Q2xhc3MpXHJcblx0XHRcdGl0ZW0udmFsdWUgPT09IHNjb3BlLnByb3BzLmxlZ1ZhbHVlICYmIGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubGVnQ2xhc3MpXHJcblx0XHRcdGl0ZW0udmFsdWUgPT09IHNjb3BlLnByb3BzLmtuZWVzVmFsdWUgJiYgZWwuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5rbmVlQ2xhc3MpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqIEluaXRpYWxpemUgKi9cclxuXHRzY29wZS5pbml0KGZ1bmN0aW9uKCkge1xyXG5cdFx0bG9hZEltYWdlKClcclxuXHRcdHNjb3BlLm9uKEJGLmV2ZW50cy5TRVRfRk9STV9WQUxVRVMsIG9uU2V0Rm9ybVZhbHVlcylcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFN0ZXBwZWQgQW5pbWF0aW9uIENvbXBvbmVudFxyXG4gKiBBbmltYXRlcyBhbiBpbmxpbmUgc3ZnXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSBkYXRhLWJmLXN0ZXBwZWQtYW5pbWF0aW9uXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBkYXRhLXN0ZXBzIC0gbnVtYmVyIG9mIHN0ZXBzIGluIHRoZSBuYW1hdGlvblxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS1hY3RpdmUtc2NyZWVucyAtIHNjcmVlbiBpZHMgYW5pbWF0aW9uIHNob3VsZCBiZSBhY3RpdmUgb24sIHNlcGFyYXRlZCBieSBhIGNvbW1hXHJcbiAqIEBwcm9wZXJ0eSB7TnVtYmVyfSBkYXRhLXN0YXJ0LWRlbGF5IC0gZGVsYXkgYmVmb3JlIHN0YXJ0aW5nIHRoZSBhbmltYXRpb25cclxuICogQHByb3BlcnR5IGRhdGEtaW5qdXJ5LW9wdGlvbiAtIHBsYWNlIGF0dHJpYnV0ZSBvbiBpbmp1cnkgaW5wdXQgbGFiZWxzXHJcbiAqXHJcbiAqL1xyXG5cclxuQkYuY29tcG9uZW50KCdzdGVwcGVkLWFuaW1hdGlvbicsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgc3RhdGUgICovXHJcblx0c2NvcGUuc3RhdGUgPSB7XHJcblx0XHR0aWNrOiAxLFxyXG5cdFx0YWN0aXZlOiBmYWxzZSxcclxuXHRcdGludGVydmFsSGFuZGxlcjogbnVsbFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBwcm9wcyAgKi9cclxuXHRzY29wZS5wcm9wcyA9IHtcclxuXHRcdGFjdGl2ZVNjcmVlbnM6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1hY3RpdmUtc2NyZWVucycpXHJcblx0XHRcdD8gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWFjdGl2ZS1zY3JlZW5zJykuc3BsaXQoJywnKVxyXG5cdFx0XHQ6IGZhbHNlLFxyXG5cdFx0c3RlcHM6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGVwcycpID8gSlNPTi5wYXJzZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RlcHMnKSkgOiAzLFxyXG5cdFx0aW50ZXJ2YWxMZW5ndGg6IDE1MCxcclxuXHRcdHN0YXJ0RGVsYXk6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zdGFydC1kZWxheScpXHJcblx0XHRcdD8gSlNPTi5wYXJzZShlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3RhcnQtZGVsYXknKSlcclxuXHRcdFx0OiAwXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBTdGFydCB0aGUgYW5pbWF0aW9uXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuXHRcdGlmIChzY29wZS5zdGF0ZS5hY3RpdmUpIHJldHVyblxyXG5cdFx0c2NvcGUuc3RhdGUuYWN0aXZlID0gdHJ1ZVxyXG5cdFx0c2NvcGUuc3RhdGUuaW50ZXJ2YWxIYW5kbGVyID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNjb3BlLnN0YXRlLnRpY2sgPSBzY29wZS5zdGF0ZS50aWNrID49IHNjb3BlLnByb3BzLnN0ZXBzID8gMSA6IHNjb3BlLnN0YXRlLnRpY2sgKyAxXHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMTsgaSA8PSBzY29wZS5wcm9wcy5zdGVwczsgaSsrKSB7XHJcblx0XHRcdFx0ZWwuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0aW9uLScgKyBpKVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRlbC5jbGFzc0xpc3QuYWRkKCdhbmltYXRpb24tJyArIHNjb3BlLnN0YXRlLnRpY2spXHJcblx0XHR9LCBzY29wZS5wcm9wcy5pbnRlcnZhbExlbmd0aClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFN0b3AgdGhlIGFuaW1hdGlvblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcclxuXHRcdGlmICghc2NvcGUuc3RhdGUuYWN0aXZlKSByZXR1cm5cclxuXHRcdHNjb3BlLnN0YXRlLmFjdGl2ZSA9IGZhbHNlXHJcblx0XHRjbGVhckludGVydmFsKHNjb3BlLnN0YXRlLmludGVydmFsSGFuZGxlcilcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoZSBzY3JlZW4gY2hhbmdlIGlzIGFjdGl2ZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtPYmplY3R9IGRhdGFcclxuXHQgKiBAcHJvcGVydHkge09iamVjdH0gZGF0YS5hY3RpdmUgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEucHJldmlvdXMgLSBzY3JlZW4gb2JqZWN0XHJcblx0ICogQHByb3BlcnR5IHtCb29sfSBkYXRhLnJldmVyc2UgLSB0cnVlIGlmIGdvaW5nIHRvIGEgcHJldmlvdXMgc2NyZWVuXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBvblNjcmVlbkNoYW5nZUFjdGl2ZShkYXRhKSB7XHJcblx0XHRzY29wZS5wcm9wcy5hY3RpdmVTY3JlZW5zICYmXHJcblx0XHRcdHNjb3BlLnByb3BzLmFjdGl2ZVNjcmVlbnMuaW5kZXhPZihkYXRhLmFjdGl2ZS5pZCkgPiAtMSAmJlxyXG5cdFx0XHRhY3RpdmF0ZSgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBUaGUgc2NyZWVuIGNoYW5nZSBoYXMgZW5kZWRcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXHJcblx0ICogQHByb3BlcnR5IHtPYmplY3R9IGRhdGEuYWN0aXZlIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBkYXRhLnByZXZpb3VzIC0gc2NyZWVuIG9iamVjdFxyXG5cdCAqIEBwcm9wZXJ0eSB7Qm9vbH0gZGF0YS5yZXZlcnNlIC0gdHJ1ZSBpZiBnb2luZyB0byBhIHByZXZpb3VzIHNjcmVlblxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25TY3JlZW5DaGFuZ2VFbmQoZGF0YSkge1xyXG5cdFx0c2NvcGUucHJvcHMuYWN0aXZlU2NyZWVucyAmJlxyXG5cdFx0XHRzY29wZS5wcm9wcy5hY3RpdmVTY3JlZW5zLmluZGV4T2YoZGF0YS5hY3RpdmUuaWQpID09PSAtMSAmJlxyXG5cdFx0XHRkZWFjdGl2YXRlKClcclxuXHR9XHJcblxyXG5cdC8qKiBMaXN0ZW4gZm9yIGV2ZW50cyAqL1xyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9BQ1RJVkUsIG9uU2NyZWVuQ2hhbmdlQWN0aXZlKVxyXG5cdHNjb3BlLm9uKEJGLmV2ZW50cy5TQ1JFRU5fVFJBTlNJVElPTl9FTkQsIG9uU2NyZWVuQ2hhbmdlRW5kKVxyXG5cclxuXHQvKiogSW5pdGlhbGl6ZSAqL1xyXG5cdGlmICghc2NvcGUucHJvcHMuYWN0aXZlU2NyZWVucykge1xyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0YWN0aXZhdGUoKVxyXG5cdFx0fSwgc2NvcGUucHJvcHMuc3RhcnREZWxheSlcclxuXHRcdHJldHVyblxyXG5cdH1cclxufSlcclxuXHJcbi8qKlxyXG4gKiBAZmlsZSBTVkcgQ29tcG9uZW50XHJcbiAqIExvYWRzIGFuZCBhcHBlbmRzIGFuIHN2ZyBpbWFnZVxyXG4gKlxyXG4gKiBAcHJvcGVydHkgZGF0YS1iZi1zdmdcclxuICogQHByb3BlcnR5IGRhdGEtaW1hZ2UtY29udGFpbmVyIC0gcGxhY2UgYXR0cmlidXRlIG9uIGVsZW1lbnRcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtbG9hZGVkLWNsYXNzIC0gY2xhc3MgdGhhdCBzaG91bGQgYmUgYWRkZWQgd2hlbiBsb2FkZWRcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtdXJsIC0gdXJsIG9mIHRoZSBzdmcgaW1hZ2VcclxuICpcclxuICovXHJcblxyXG5CRi5jb21wb25lbnQoJ3N2ZycsIGZ1bmN0aW9uKHNjb3BlLCBlbCkge1xyXG5cdC8qKiBTZXQgcHJvcHMgICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRsb2FkZWRDbGFzczogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWxvYWRlZC1jbGFzcycpIHx8ICdiZi1tZWRpYS0tbG9hZGVkJyxcclxuXHRcdHN2Z1VybDogZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXVybCcpXHJcblx0fVxyXG5cclxuXHQvKiogU2V0IHN0YXRlICAqL1xyXG5cdHNjb3BlLnN0YXRlID0ge1xyXG5cdFx0bG9hZGVkOiBmYWxzZVxyXG5cdH1cclxuXHJcblx0LyoqIERlZmluZSByZWZlcmVuY2VkIERPTSBlbGVtZW50cyAgKi9cclxuXHRzY29wZS5lbHMgPSB7XHJcblx0XHRjb250YWluZXI6IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWltYWdlLWNvbnRhaW5lcl0nKSB8fCBlbFxyXG5cdH1cclxuXHJcblx0LyoqIFRlcm1pbmF0ZSBzdmcgdXJsIG5vdCBzcGVjaWZpZWQgICovXHJcblx0aWYgKCFzY29wZS5wcm9wcy5zdmdVcmwpIHtcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignU1ZHIHVybCBub3QgZm91bmQnKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogTG9hZCB0aGUgaW1hZ2VcclxuXHQgKlxyXG5cdCAqL1xyXG5cdCBmdW5jdGlvbiBsb2FkSW1hZ2UoKSB7XHJcbiBcdFx0JC5nZXQoc2NvcGUucHJvcHMuc3ZnVXJsLCBmdW5jdGlvbihkb2MpIHtcclxuIFx0XHRcdHZhciBzdmc7XHJcbiBcdFx0XHRcclxuIFx0XHRcdGlmICh0eXBlb2YgZG9jID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBkb2MucXVlcnlTZWxlY3RvciA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiBcdFx0XHRcdHN2ZyA9IGRvYy5xdWVyeVNlbGVjdG9yKCdzdmcnKTtcclxuIFx0XHRcdH0gZWxzZSB7XHJcbiBcdFx0XHRcdHN2ZyA9ICQoZG9jKS5maW5kKCdzdmcnKVswXTtcclxuIFx0XHRcdH1cclxuIFx0XHRcdFxyXG4gXHRcdFx0aWYgKHN2ZyAhPT0gdW5kZWZpbmVkKSB7XHJcbiBcdFx0XHRcdHNjb3BlLmVscy5jb250YWluZXIuYXBwZW5kQ2hpbGQoc3ZnKVxyXG4gXHRcdFx0XHRzY29wZS5zdGF0ZS5sb2FkZWQgPSB0cnVlXHJcbiBcdFx0XHRcdGVsLmNsYXNzTGlzdC5hZGQoc2NvcGUucHJvcHMubG9hZGVkQ2xhc3MpXHJcbiBcdFx0XHR9XHJcbiBcdFx0fSkuZmFpbChmdW5jdGlvbigpIHtcclxuIFx0XHRcdHNjb3BlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbWFnZScpXHJcbiBcdFx0fSlcclxuIFx0fVxyXG5cclxuXHQvKiogSW5pdGlhbGl6ZSAgKi9cclxuXHRzY29wZS5pbml0KGZ1bmN0aW9uKCkge1xyXG5cdFx0bG9hZEltYWdlKClcclxuXHR9KVxyXG59KVxyXG5cclxuLyoqXHJcbiAqIEBmaWxlIFZpZGVvIENvbXBvbmVudFxyXG4gKiBTaG93IGEgdmlkZW9cclxuICpcclxuICogQHByb3BlcnR5IGRhdGEtYmYtdmlkZW9cclxuICogQHByb3BlcnR5IGRhdGEtaW1hZ2UtY29udGFpbmVyIC0gcGxhY2UgYXR0cmlidXRlIG9uIGVsZW1lbnRcclxuICogQHByb3BlcnR5IHtTdHJpbmd9IGRhdGEtdmlkZW8tc3JjIC0gdmlkZW8gbXA0IHNvdXJjZVxyXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZGF0YS1wbGFjZWhvbGRlciAtIHBsYWNlaG9sZGVyIGltYWdlIHVybFxyXG4gKlxyXG4gKi9cclxuXHJcbkJGLmNvbXBvbmVudCgndmlkZW8nLCBmdW5jdGlvbihzY29wZSwgZWwpIHtcclxuXHQvKiogU2V0IHByb3BzICovXHJcblx0c2NvcGUucHJvcHMgPSB7XHJcblx0XHRzcmM6IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS12aWRlby1zcmMnKSxcclxuXHRcdHBsYWNlaG9sZGVyOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2Vob2xkZXInKSxcclxuXHRcdHRpdGxlOiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnKSxcclxuXHRcdHRlbXBsYXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnVmlkZW9UZW1wbGF0ZScpLmlubmVySFRNTCxcclxuXHRcdG5vVG91Y2hDbGFzczogJ2JmLXZpZGVvLS1uby10b3VjaCcsXHJcblx0XHRwbGF5aW5nQ2xhc3M6ICdiZi12aWRlby0tcGxheWluZycsXHJcblx0XHRyZWFkeUNsYXNzOiAnYmYtdmlkZW8tLXJlYWR5JyxcclxuXHRcdHRvZ2dsZUFjdGl2ZUNsYXNzOiAnYmYtbWVkaWEtYnV0dG9uLS11bmhvdmVyJyxcclxuXHRcdHByb2dyZXNzQ2lyY2xlQ2lyY3VtZmVyZW5jZTogMFxyXG5cdH1cclxuXHJcblx0LyoqIFNldCBzdGF0ZSAgKi9cclxuXHRzY29wZS5zdGF0ZSA9IHtcclxuXHRcdGNhblBsYXk6IGZhbHNlLFxyXG5cdFx0cGxheWluZzogZmFsc2UsXHJcblx0XHRoYXNQbGF5ZWQ6IGZhbHNlLFxyXG5cdFx0cHJvZ3Jlc3M6IDBcclxuXHR9XHJcblxyXG5cdC8qKiBEZWZpbmUgcmVmZXJlbmNlZCBET00gZWxlbWVudHMgICovXHJcblx0c2NvcGUuZWxzID0ge1xyXG5cdFx0Y29udGFpbmVyOiBudWxsLFxyXG5cdFx0dmlkZW86IG51bGwsXHJcblx0XHR0b2dnbGU6IG51bGwsXHJcblx0XHRwYXVzZUljb246IG51bGwsXHJcblx0XHRwbGF5SWNvbjogbnVsbCxcclxuXHRcdGhvdmVyQ29udGFpbmVyOiBudWxsLFxyXG5cdFx0cHJvZ3Jlc3NDaXJjbGU6IG51bGxcclxuXHR9XHJcblxyXG5cdC8qKiBUZXJtaW5hdGUgaWYgdmlkZW8gdGVtcGxhdGUgbm90IGZvdW5kICAqL1xyXG5cdGlmICghc2NvcGUucHJvcHMudGVtcGxhdGUpIHtcclxuXHRcdHJldHVybiBzY29wZS5lcnJvcignVmlkZW8gdGVtcGxhdGUgbm90IGZvdW5kJylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemUgY29tcG9uZW50XHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0aWFsaXplKCkge1xyXG5cdFx0Ly8gaWYgdXNlciBoYXMgYSBzbG93IGNvbm5lY3Rpb24gb25seSBpbnNlcnQgaW1hZ2VcclxuXHJcblx0XHRpZiAoQkYuc2VydmljZXMuZGV2aWNlICYmIEJGLnNlcnZpY2VzLmRldmljZS5oYXNTbG93Q29ubmVjdGlvbikge1xyXG5cdFx0XHRpbnNlcnRJbWFnZSgpXHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHVzZXIgZG9lc250IGhhdmUgYSBzbG93IGNvbm5lY3Rpb24gaW5zZXJ0IHZpZGVvXHJcblxyXG5cdFx0aW5zZXJ0VmlkZW8oKVxyXG5cdFx0Ly8gd2FpdCBmb3IgZWxlbWVudHMgdG8gYXBwZWFyIGluIERPTVxyXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHRcdFx0ZmluZEVsZW1lbnRzKClcclxuXHRcdFx0YmluZEludGVyYWN0aW9uRXZlbnRzKClcclxuXHRcdFx0YmluZFZpZGVvRXZlbnRzKClcclxuXHRcdFx0aW5pdGlhbGl6ZVByb2dyZXNzQ2lyY2xlKClcclxuXHRcdFx0Ly8gYWRkIGNsYXNzIGlmIGRldmljZSBoYXMgdG91Y2hcclxuXHRcdFx0IUJGLnNlcnZpY2VzLmRldmljZS5oYXNUb3VjaCAmJlxyXG5cdFx0XHRcdHNjb3BlLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5ub1RvdWNoQ2xhc3MpXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5zZXJ0IHZpZGVvIHRlbXBsYXRlXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbnNlcnRWaWRlbygpIHtcclxuXHRcdHZhciB0ZW1wbGF0ZSA9IHNjb3BlLnByb3BzLnRlbXBsYXRlXHJcblx0XHR0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ3NvdXJjZScsICdzb3VyY2Ugc3JjPVwiJyArIHNjb3BlLnByb3BzLnNyYyArICdcIicpXHJcblx0XHR0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ2ltZycsICdpbWcgc3JjPVwiJyArIHNjb3BlLnByb3BzLnBsYWNlaG9sZGVyICsgJ1wiICcpXHJcblx0XHR0ZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoJ2FsdD1cIlwiJywgJ2FsdD1cIicgKyBzY29wZS5wcm9wcy50aXRsZSArICdcIicpXHJcblx0XHRlbC5pbm5lckhUTUwgPSB0ZW1wbGF0ZVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5zZXJ0IGltYWdlIHRlbXBsYXRlXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbnNlcnRJbWFnZSgpIHtcclxuXHRcdGVsLmlubmVySFRNTCA9XHJcblx0XHRcdCc8aW1nIHNyYz1cIicgK1xyXG5cdFx0XHRzY29wZS5wcm9wcy5wbGFjZWhvbGRlciArXHJcblx0XHRcdCdcIicgK1xyXG5cdFx0XHQoc2NvcGUucHJvcHMudGl0bGUgPyAnIGFsdD1cIicgKyBzY29wZS5wcm9wcy50aXRsZSArICdcIicgOiAnJykgK1xyXG5cdFx0XHQnIC8+J1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRmluZCBhbmQgZGVmaW5lIERPTSBlbGVtZW50c1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZmluZEVsZW1lbnRzKCkge1xyXG5cdFx0c2NvcGUuZWxzLmNvbnRhaW5lciA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvbnRhaW5lcl0nKVxyXG5cdFx0c2NvcGUuZWxzLnZpZGVvID0gZWwucXVlcnlTZWxlY3RvcigndmlkZW8nKVxyXG5cdFx0c2NvcGUuZWxzLnBhdXNlSWNvbiA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXBhdXNlLWljb25dJylcclxuXHRcdHNjb3BlLmVscy5wbGF5SWNvbiA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXBsYXktaWNvbl0nKVxyXG5cdFx0c2NvcGUuZWxzLnRvZ2dsZSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXBhdXNlLXRvZ2dsZV0nKVxyXG5cdFx0c2NvcGUuZWxzLnByb2dyZXNzQ2lyY2xlID0gZWwucXVlcnlTZWxlY3RvcignW2RhdGEtcHJvZ3Jlc3MtY2lyY2xlXScpXHJcblx0XHRzY29wZS5lbHMuaG92ZXJDb250YWluZXIgPSAkKGVsKS5wYXJlbnRzKCdbZGF0YS1iZi1pbnB1dC1idXR0b25dJylbMF0gfHwgZWxcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEJpbmQgdmlkZW8gaW50ZXJhY3Rpb24gZXZlbnRzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBiaW5kSW50ZXJhY3Rpb25FdmVudHMoKSB7XHJcblx0XHQvLyBQbGF5IC8gcGF1c2UgdG9nZ2xlIGZvciB0b3VjaCBzY3JlZW5zXHJcblx0XHRCRi5zZXJ2aWNlcy5kZXZpY2UuaGFzVG91Y2ggJiZcclxuXHRcdFx0c2NvcGUuZWxzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KClcclxuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXHJcblx0XHRcdFx0c2NvcGUuc3RhdGUucGxheWluZyA/IHBhdXNlKCkgOiBwbGF5KClcclxuXHRcdFx0fSlcclxuXHJcblx0XHQvLyBQbGF5IC8gcGF1c2UgdG9nZ2xlIGZvciBtb3VzZVxyXG5cclxuXHRcdHNjb3BlLmVscy5ob3ZlckNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCFpc1BsYXlpbmcoKSAmJiBwbGF5KClcclxuXHRcdH0pXHJcblxyXG5cdFx0c2NvcGUuZWxzLmhvdmVyQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0aXNQbGF5aW5nKCkgJiYgcGF1c2UoKVxyXG5cdFx0XHRyZXNldFByb2dyZXNzKClcclxuXHRcdH0pXHJcblxyXG5cdFx0Ly8gY2FuY2VsIGhvdmVyIHN0eWxlcyB3aGVuIHRvZ2dsaW5nIHBsYXkgb24gdG91Y2ggZGV2aWNlc1xyXG5cclxuXHRcdHNjb3BlLmVscy50b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzY29wZS5lbHMuaG92ZXJDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShzY29wZS5wcm9wcy50b2dnbGVBY3RpdmVDbGFzcylcclxuXHRcdH0pXHJcblxyXG5cdFx0c2NvcGUuZWxzLnRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNjb3BlLmVscy5ob3ZlckNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnRvZ2dsZUFjdGl2ZUNsYXNzKVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEJpbmQgdmlkZW8gZXZlbnRzXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBiaW5kVmlkZW9FdmVudHMoKSB7XHJcblx0XHRzY29wZS5lbHMudmlkZW8uYWRkRXZlbnRMaXN0ZW5lcigncGxheScsIG9uUGxheS5iaW5kKHRoaXMpKVxyXG5cdFx0c2NvcGUuZWxzLnZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BhdXNlJywgb25QYXVzZS5iaW5kKHRoaXMpKVxyXG5cdFx0c2NvcGUuZWxzLnZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXlpbmcnLCBvblBsYXlpbmcuYmluZCh0aGlzKSlcclxuXHRcdHNjb3BlLmVscy52aWRlby5hZGRFdmVudExpc3RlbmVyKCd0aW1ldXBkYXRlJywgb25UaW1lVXBkYXRlLmJpbmQodGhpcykpXHJcblx0XHRzY29wZS5lbHMudmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ2FuUGxheS5iaW5kKHRoaXMpKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSW5pdGlhbGl6ZSBwcm9ncmVzcyBjaXJjbGVcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXRpYWxpemVQcm9ncmVzc0NpcmNsZSgpIHtcclxuXHRcdGlmICghc2NvcGUuZWxzLnByb2dyZXNzQ2lyY2xlKSByZXR1cm5cclxuXHRcdHZhciBjaXJjdW1mZXJlbmNlID0gc2NvcGUuZWxzLnByb2dyZXNzQ2lyY2xlLnIuYmFzZVZhbC52YWx1ZSAqIDIgKiBNYXRoLlBJXHJcblx0XHRzY29wZS5wcm9wcy5wcm9ncmVzc0NpcmNsZUNpcmN1bWZlcmVuY2UgPSBjaXJjdW1mZXJlbmNlXHJcblx0XHRzY29wZS5lbHMucHJvZ3Jlc3NDaXJjbGUuc3R5bGUuc3Ryb2tlRGFzaGFycmF5ID0gY2lyY3VtZmVyZW5jZVxyXG5cdFx0dXBkYXRlUHJvZ3Jlc3MoMClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhdXNlIHZpZGVvXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBwYXVzZSgpIHtcclxuXHRcdHNjb3BlLmVscy52aWRlby5wYXVzZSgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBQbGF5IHZpZGVvXHJcblx0ICpcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBwbGF5KCkge1xyXG5cdFx0c2NvcGUuc3RhdGUuY2FuUGxheSAmJiBzY29wZS5lbHMudmlkZW8ucGxheSgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNldCB2aWRlbyBwcm9ncmVzc1xyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gcmVzZXRQcm9ncmVzcygpIHtcclxuXHRcdHNjb3BlLmVscy52aWRlby5jdXJyZW50VGltZSA9IDBcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZpZGVvIHBsYXkgZXZlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uUGxheSgpIHtcclxuXHRcdC8vIGlmIHRvdWNoIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIGhhcyBub3QgcGxheWVkLCBzdG9wIHZpZGVvXHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLmhhc1BsYXllZCkge1xyXG5cdFx0XHRzY29wZS5zdGF0ZS5oYXNQbGF5ZWQgPSB0cnVlXHJcblx0XHRcdHNjb3BlLmVscy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChzY29wZS5wcm9wcy5yZWFkeUNsYXNzKVxyXG5cdFx0XHRpZiAoIUJGLnNlcnZpY2VzLmRldmljZS5oYXNUb3VjaCkge1xyXG5cdFx0XHRcdHBhdXNlKClcclxuXHRcdFx0XHRyZXNldFByb2dyZXNzKClcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHNjb3BlLnN0YXRlLmhhc1BsYXllZCA9IHRydWVcclxuXHJcblx0XHRpZiAoIXNjb3BlLnN0YXRlLnBsYXlpbmcpIHtcclxuXHRcdFx0c2NvcGUuc3RhdGUucGxheWluZyA9IHRydWVcclxuXHRcdFx0c2NvcGUuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHNjb3BlLnByb3BzLnBsYXlpbmdDbGFzcylcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZpZGVvIGNhbnBsYXkgZXZlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uQ2FuUGxheSgpIHtcclxuXHRcdHNjb3BlLnN0YXRlLmNhblBsYXkgPSB0cnVlXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBWaWRlbyBwYXVzZSBldmVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25QYXVzZSgpIHtcclxuXHRcdHNjb3BlLnN0YXRlLnBsYXlpbmcgPSBmYWxzZVxyXG5cdFx0c2NvcGUuZWxzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHNjb3BlLnByb3BzLnBsYXlpbmdDbGFzcylcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFZpZGVvIHBsYXlpbmcgZXZlbnRcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIG9uUGxheWluZygpIHtcclxuXHRcdCFzY29wZS5zdGF0ZS5wbGF5aW5nICYmIG9uUGxheSgpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBWaWRlbyB0aW1lIHVwZGF0ZSBldmVudFxyXG5cdCAqXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gb25UaW1lVXBkYXRlKCkge1xyXG5cdFx0dXBkYXRlUHJvZ3Jlc3Moc2NvcGUuZWxzLnZpZGVvLmN1cnJlbnRUaW1lIC8gc2NvcGUuZWxzLnZpZGVvLmR1cmF0aW9uKVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgaWYgdmlkZW8gaXMgcGxheWluZ1xyXG5cdCAqXHJcblx0ICogQHJldHVybiB7Qm9vbH1cclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGlzUGxheWluZygpIHtcclxuXHRcdHJldHVybiAoXHJcblx0XHRcdHNjb3BlLmVscy52aWRlby5jdXJyZW50VGltZSA+IDAgJiZcclxuXHRcdFx0IXNjb3BlLmVscy52aWRlby5wYXVzZWQgJiZcclxuXHRcdFx0IXNjb3BlLmVscy52aWRlby5lbmRlZCAmJlxyXG5cdFx0XHRzY29wZS5lbHMudmlkZW8ucmVhZHlTdGF0ZSA+IDJcclxuXHRcdClcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZSBwcm9ncmVzcyBjaXJjbGVcclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBwcm9ncmVzcyAtIHBlcmNlbnRhZ2UgY29tcGxldGUgKDAgdG8gMSlcclxuXHQgKlxyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzKHByb2dyZXNzKSB7XHJcblx0XHQvLyBzZXQgZGFzaCBvZmZzZXRcclxuXHRcdHNjb3BlLmVscy5wcm9ncmVzc0NpcmNsZS5zdHlsZS5zdHJva2VEYXNob2Zmc2V0ID1cclxuXHRcdFx0c2NvcGUucHJvcHMucHJvZ3Jlc3NDaXJjbGVDaXJjdW1mZXJlbmNlICogKDEgLSBwcm9ncmVzcylcclxuXHJcblx0XHQvLyBza2lwIHRyYW5zaXRpb24gaWYgcmVzdGFydGluZ1xyXG5cdFx0aWYgKHNjb3BlLnN0YXRlLnByb2dyZXNzICYmIHByb2dyZXNzIDwgc2NvcGUuc3RhdGUucHJvZ3Jlc3MpIHtcclxuXHRcdFx0c2NvcGUuZWxzLnByb2dyZXNzQ2lyY2xlLnN0eWxlLnRyYW5zaXRpb24gPSAnbm9uZSdcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHNjb3BlLmVscy5wcm9ncmVzc0NpcmNsZS5zdHlsZS50cmFuc2l0aW9uID0gJydcclxuXHRcdH1cclxuXHJcblx0XHQvLyBzZXQgbmV3IHByb2dyZXNzXHJcblx0XHRzY29wZS5zdGF0ZS5wcm9ncmVzcyA9IHByb2dyZXNzXHJcblx0fVxyXG5cclxuXHQvKiBJbml0aWFsaXplICovXHJcblxyXG5cdHNjb3BlLmluaXQoaW5pdGlhbGl6ZSlcclxufSlcclxuIl19
