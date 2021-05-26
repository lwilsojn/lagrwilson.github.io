function BR_Modal(trigger, target, eventType, showClose, restrictHeight) {
    var isOpen = false;
    var eventType = (typeof eventType === 'undefined' ? 'click' : eventType);
    initHandlers();

    $.widget('brooks.brDialog', $.ui.dialog, {
        destroy: function () {
            $("#modal-bg, .modal-backdrop").css("display", "none");
            return this._super();
        },
        close: function () {
            $("#modal-bg, .modal-backdrop").css("display", "none");
            return this._super();
        },
        _size: function () {
            var nonContentHeight, minContentHeight, maxContentHeight,
                options = this.options;

            // Reset content sizing
            this.element.show().css({
                minHeight: 0,
                maxHeight: "none",
                height: 0
            });

            if (options.minWidth > options.width) {
                options.width = options.minWidth;
            }

            // reset wrapper sizing
            // determine the height of all the non-content elements
            nonContentHeight = this.uiDialog.css({
                height: "auto",
                width: options.width
            })
                .outerHeight();
            minContentHeight = Math.max(0, options.minHeight - nonContentHeight);
            maxContentHeight = typeof options.maxHeight === "number" ?
                Math.max(0, options.maxHeight - nonContentHeight) :
                "none";

            if (options.height === "auto") {
                this.element.css({
                    minHeight: minContentHeight,
                    maxHeight: maxContentHeight,
                    height: "auto"
                });
            } else {
                this.element.height(Math.max(0, options.height - nonContentHeight));
            }

            if (this.uiDialog.is(":data(ui-resizable)")) {
                this.uiDialog.resizable("option", "minHeight", this._minHeight());
            }
        }
    });

    function getWidth() {
        var width = $(target).width();
        var bodyWidth = $("body").width();
        if (bodyWidth <= width || bodyWidth <= 595) {
            width = bodyWidth;
        }
        return width;
    }
    function initHandlers() {
        var closeBtn = $(target).find('.close-btn');
        $(trigger).bind(eventType, function () {
            $("#modal-bg, .modal-backdrop").css("display", "block");
            $(target).brDialog(getOptions())
                .brDialog("open");

            // Reset scroll on tall modals
            $("#modal-bg").scrollTop(0);
            isOpen = true;
        });
        closeBtn.click(function () {
            $(target).brDialog("destroy");
            isOpen = false;
        });
        $(window).resize(function () {
            if (isOpen)
            {
                $(target).brDialog(getOptions());
            }
        });
    }
    function getOptions(autoOpen) {
        var viewHeight = $("body").height();
        var modalHeight = ($(target).height() > viewHeight && restrictHeight ? viewHeight : 'auto');
        var modalWidth = getWidth();
        var offset = 20;
        if ($(window).width() < 595)
        {
            offset = 0;
        }

        // See: https://api.jqueryui.com/position //
        var options = {
            appendTo: "#modal-bg",
            position: {
                my: "top",
                at: "top+" + offset + "px",
                of: window
            },
            autoOpen: (autoOpen === false ? false : true),
            closeOnEscape: (showClose === false ? false : true),
            dialogClass: 'o-modal web-refresh',
            width: modalWidth,
            height: modalHeight
        };
        return options;
    }
}

// eslint-disable-next-line no-unused-vars
var BR_ProductCard = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.hasLoadedThumbnails = false;

    this.init = function () {
        var self = this;

        if (self.el.data('product-card-loaded') !== true) {
            self.el.data('product-card-loaded', true);

            self.lazyloadMainImage();
            self.resize();

            $(window).on('resize', function () {
                self.resize();
            });
        }
    };

    this.isMobile = function () {
        return window.innerWidth < window.WS.Breakpoints.mobileLg;
    };

    this.lazyloadMainImage = function () {
        window.lazyloadVanilla(this.el.find('.product__card--wrapper .card__slider'));
    };

    this.lazyloadThumbnailImages = function () {
        window.lazyloadVanilla(this.el.find('.product-container__thumbnails'));
    };

    this.resize = function () {
        if (!this.hasLoadedThumbnails) {
            if (!this.isMobile()) {
                this.hasLoadedThumbnails = true;

                this.lazyloadThumbnailImages();
            }
        }
    };
};

/* eslint-disable no-unused-vars */
function enableButton(button) {
    if (button && button.classList.contains("a-btn--primary--inactive")) {
        button.classList.remove("a-btn--primary--inactive");
        button.classList.add("a-btn--primary");
        button.disabled = false;
    }
}

function disableButton(button) {
    if (button && button.classList.contains("a-btn--primary")) {
        button.classList.remove("a-btn--primary");
        button.classList.add("a-btn--primary--inactive");
        button.disabled = true;
    }
}

// eslint-disable-next-line no-unused-vars
function callOutModal() {
    var modalClass = 'o-callout-modal';
    var triggers = document.querySelectorAll('[data-callout-target]');
    var dialogs = document.querySelectorAll('.' + modalClass);
    var hiddenClassName = 'o-callout-modal--hidden';
    var focusedElBeforeOpen = null;

    /**
     * Checks if element exist and focused it.
     * @param {!HTMLElement} element
     */
    function focusElement(element) {
        if (element) {
            element.focus();
        }
    }

    /**
     * Removes the overflowX hidden value on the page class.
     * This property was causing an bug in iOS safari when the iPad was portrait.
     *
     * TODO: If the offCanvas nav is removed, this can probably go with it.
     */
    function triggerOverflow() {
        $('.page').css('overflow-x', 'visible');
        setTimeout(function () {
            $('.page').css('overflow-x', '');
        }, 50);
    }

    /**
     * Closes dialog and focus on the element that had focus before it was opened.
     * @param {HTMLElement} dialogEl Main div of the dialog.
     */
    function closeDialog(dialogEl) {
        // Adding this class the dialog is hidden.
        dialogEl.classList.add(hiddenClassName);

        // Focus the element that was active before the dialog.
        focusElement(focusedElBeforeOpen);

        if (dialogEl.classList.contains('o-video-modal')) {
            var targetVideo = dialogEl.getElementsByTagName('video');
            targetVideo[0].pause();
        }
    }

    /**
     * Traps the focus inside the dialog elements.
     * @param {HTMLElement} element Main div of the dialog.
     */
    function trapFocus(element) {
        var focusableEls = $(element).find('a, object, :input, iframe, [tabindex]');
        var firstFocusableEl = focusableEls.first()[0];
        var lastFocusableEl = focusableEls.last()[0];
        var TABKEYCODE = 9;
        var ESCKEYCODE = 27;

        // Focus on firs focusable element.
        focusElement(firstFocusableEl);

        // eslint-disable-next-line complexity
        $(element).on('keydown', function (e) {
            if (e.keyCode === ESCKEYCODE) {
                closeDialog(element);
            }

            var isTabPressed = (e.key === 'Tab' || e.keyCode === TABKEYCODE);
            if (!isTabPressed) {
                return;
            }
            if (e.shiftKey) /* shift tab keypress */ {
                if (document.activeElement === firstFocusableEl) {
                    focusElement(lastFocusableEl);
                    e.preventDefault();
                }
            } else /* tab keypress */ {
                if (document.activeElement === lastFocusableEl) {
                    focusElement(firstFocusableEl);
                    e.preventDefault();
                }
            }
        });
    }

    /**
     * Event handler for opening modals/callouts
     * @param {*} event
     */
    function onOpen(event) {
        event.preventDefault();
        var targetId = $(event.currentTarget).attr('data-callout-target');
        var target = document.getElementById(targetId);

        // Removing this class the dialog is visible.
        target.classList.remove(hiddenClassName);

        // Prevent offCanvas nav from displaying below callout
        triggerOverflow();

        // Save current active element.
        focusedElBeforeOpen = document.activeElement;
        trapFocus(target);

        if (target.classList.contains('o-video-modal')) {
            var targetVideo = target.getElementsByTagName('video');
            targetVideo[0].play();
        }
    }

    /**
     * Add event handler to triggers to open dialogs
     * @param {HTMLElement} trigger element that will open the dialog on click.
     */
    function addHandlers(trigger) {
        trigger.addEventListener('click', onOpen);
        trigger.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === 'Spacebar') {
                onOpen(event);
            }
        });
    }

    /**
     *  Sets up dialog listeners.
     * @param {HTMLElement} dialogEl Main div of the dialog.
     */
    function setUpDialog(dialogEl) {
        // Sets listener for the close button.
        var closeBtn = dialogEl.querySelector('.o-callout-modal__close');
        closeBtn.addEventListener('click', function onCloseSetFocus() {
            closeDialog(dialogEl);
        });

        // Setls listener for the whole dialog.
        dialogEl.addEventListener('click', function onClickClose(e) {
            // Closes the dialog when the user clicks on the "backdrop"
            if (e.target.classList.contains(modalClass)) {
                closeDialog(dialogEl);
            }
        });
    }

    /**
     * Initializes triggers and dialogs on the page.
     */
    function init_() {
        dialogs.forEach(setUpDialog);
        triggers.forEach(addHandlers);
    }

    init_();
}

// eslint-disable-next-line no-unused-vars
var DetailsView = function (_requestAnimationFrame) {
    var ww = window.innerWidth;
    var bp = null;

    var isMobile = function () {
        return ww < window.WS.Breakpoints.tabletLg;
    };

    var breakPointChange = function () {
        var elements = $('details.collapse-mobile-only');
        if (bp === 'tabletLg') {
            elements.attr('open', true);
        } else {
            elements.removeAttr('open');
        }
    };
    
    // eslint-disable-next-line complexity
    var checkForBreakPointChange = function () {
        ww = window.innerWidth;

        if (!isMobile() && bp !== 'tabletLg') {
            bp = 'tabletLg';
            breakPointChange();
        } else if (isMobile() && bp !== 'mobile') {
            bp = 'mobile';
            breakPointChange();
        }
    };
    
    var eventHandler = function (e) {
        if (!isMobile()) {
            e.preventDefault();
        }
    };

    $(document).on('click', 'details.collapse-mobile-only summary', eventHandler);

    $(window).on('resize', function () {
        _requestAnimationFrame(checkForBreakPointChange);
    });

    checkForBreakPointChange();
};

(function () {
    if (window.Modernizr.touchevents) { 
        return;
    } else {
        [].slice.call(document.querySelectorAll('select.cs-select')).forEach (function (el) {
            new window.SelectFx(el);
        });
    }
})();

/* eslint-disable no-unused-vars */
var EmailSmsSignup = function ($form, formCount, sendDataToServer) {
    if ($form.data('isInitialized') !== true) {
    

        var self = this;
        $form.data('isInitialized', true);

        self.hiddenInputFields = $form.find('input[type=hidden]');
        self.inputField = $form.find('.e-text__input');
        self.inputFeedback = $form.find('.alert--verbose.alert--error');
        self.consentContainer = $form.find('.site-checkbox__wrapper');
        self.consentInput = $form.find('.e-input__checkbox');
        self.consentCheckboxIcon = $form.find('.icon-checkmark');
        self.consentFeedback = $form.find('.consent-error');
        self.submitButton = $form.find('.a-btn');
        self.arrowIcon = $form.find('.icon-caret-sm-white');
        self.checkmarkIcon = $form.find('.icon-checkmark-nocircle');

        // upon initialization, set unique id for the email/phone input field and
        // a matching for attribute of the corresponding label
        var initialInputId = self.inputField.attr('id');
        var uniqueInputId = initialInputId + formCount.toString();
        self.inputField.attr('id', uniqueInputId);
        self.inputField.siblings('label').attr('for', uniqueInputId);

        // upon initialization, set unique id for the consent checkbox and
        // a matching for attribute of the corresponding label
        var initialConsentId = self.consentInput.attr('id');
        var uniqueConsentId = initialConsentId + formCount.toString();
        self.consentInput.attr('id', uniqueConsentId);
        self.consentInput.siblings('label').attr('for', uniqueConsentId);


        /* EVENT LISTENERS */
        $form.submit(function (event) {
            event.preventDefault();
            self.handleSubmit(event);
        });

        //prevent the browser from showing default validation feedback
        self.inputField.on('invalid', function (event) {
            event.preventDefault();
            self.updateInputFeedback();
        });

        //display consent checkbox when user clicks input field
        self.inputField.focus(function () {
            if (self.consentContainer.attr('aria-hidden') === 'true') {
                self.consentContainer.attr('aria-hidden', 'false');
            }

            if (self.submitButton.prop('disabled') === true) {
                self.resetForm();
            }
        });

        //if user leaves input field without typing anything, remove consent checkbox
        //and remove input feedback if necessary
        self.inputField.blur(function () {
            if (self.inputField.val() === '') {
                //remove consent checkbox
                self.consentContainer.attr('aria-hidden', 'true');

                //remove input feedback, if necessary
                self.updateInputFeedback(true);
            }
        });

        //when input changes, check validity and remove error when it becomes valid
        self.inputField.on('input propertychange paste', function () {
            if (self.inputFeedback.attr('aria-hidden') === 'false') {
                self.updateInputFeedback(self.inputIsValid());
            }
        });

        //when email consent checkbox is clicked, remove error message if it exists
        self.consentInput.change(function () {
            self.updateConsentFeedback(self.consentIsGiven());
        });


        /* FUNCTION DEFINITIONS */
        this.inputIsValid = function () {
            var validInput = false;

            if ((self.inputField.val() !== '') && (self.inputField[0].checkValidity())) {
                validInput = true;
            }

            self.updateInputFeedback(validInput);

            return validInput;
        };

        this.updateInputFeedback = function (validInput) {
            if (validInput === true) {
                self.inputField.removeClass('e-text__input--error');
                self.inputFeedback.attr('aria-hidden', 'true');
                self.inputFeedback.removeAttr('role', 'alert');
            } else {
                self.inputField.addClass('e-text__input--error');
                self.inputFeedback.attr({
                    'aria-hidden': 'false',
                    role: 'alert'
                });

            }
        };

        this.consentIsGiven = function () {
            var consent = false;

            if (self.consentContainer.attr('aria-hidden') === 'false' && self.consentInput.is(':checked')) {
                consent = true;
            }

            self.updateConsentFeedback(consent);

            return consent;
        };

        this.updateConsentFeedback = function (consent) {
            if (self.consentContainer.attr('aria-hidden') === 'true') {
                self.consentContainer.attr('aria-hidden', 'false');
            } else if (consent === false) {
                self.consentFeedback.attr({
                    'aria-hidden':'false',
                    role:'alert'
                });
                self.consentCheckboxIcon.addClass('icon-checkmark--error');
            } else {
                self.consentFeedback.attr('aria-hidden', 'true');
                self.consentFeedback.removeAttr('role', 'alert');
                self.consentCheckboxIcon.removeClass('icon-checkmark--error');
            }
        };

        this.submitReady = function () {
            var validInput = self.inputIsValid();
            var consentGiven = self.consentIsGiven();
            var conditionsMet = false;

            if (validInput && consentGiven) {
                conditionsMet = true;
            }

            return conditionsMet;
        };

        this.handleSubmit = function () {
            if (self.submitReady()) {
                sendDataToServer(self); //the sendDataToServer() function lives in the inline script from Sitecore
            }
        };

        this.updateStylesOnResponse = function (brontoResult) {
            if (brontoResult === true) {
                //get form success text
                var successText = $form.data('successText');

                //update styles
                self.submitButton.addClass('a-btn--success').prop('disabled', true);
                self.arrowIcon.attr('aria-hidden', 'true');
                self.checkmarkIcon.attr('aria-hidden', 'false');
                self.inputField.addClass('e-text__input--success').val(successText);
                self.consentContainer.attr('aria-hidden', 'true');
            } else {
                //get form failure text
                var failureText = $form.data('failText');

                //update styles
                self.inputField.addClass('e-text__input--error').val(failureText);
            }
        };

        this.resetForm = function () {
            self.submitButton.removeClass('a-btn--success').prop('disabled', false);
            self.arrowIcon.attr('aria-hidden', 'false');
            self.checkmarkIcon.attr('aria-hidden', 'true');
            self.inputField.removeClass('e-text__input--success').val('');
        };
    }
};

/* eslint-disable no-unused-vars */
function FilterView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.tabs = this.opts.tabs || false;
    this.$filters = $('.filters-container');
    this.$filterToggle = $('.filter-btn').prop('disabled', false);
    this.$closeIcon = this.$filters.find('.close--mobile');
    var self = this;

    $(window).on('resize', function () {
        self.resize();
    });

    this.init = function () {
        if (this.tabs) {
            // if tabs true, intiialize a tab filter view
            var tfv = new TabFilterView({ el: $('.o-block--experience-filter') });
            tfv.init();
        }
        this.bindUIActions();
    };

    this.bindUIActions = function () {
        if (!self.$filterToggle.data.eventsBound)
        {
            self.$filterToggle.data.eventsBound = true;
            self.$filterToggle.on('click', function (e) { self.toggle(e); });
            self.$closeIcon.on('click', function (e) { self.toggle(e); });
        }
    };

    this.resize = function () {
        if (window.innerWidth > window.WS.Breakpoints.tabletLg) {
            if (self.$filters.hasClass('active')) {
                self.$filters.removeClass('active');
                $('body').removeClass('no-scroll');
            }
        }
    };

    this.toggle = function () {
        if (self.$filters.hasClass('active')) {
            self.$filters.removeClass('active');
            $('body').removeClass('no-scroll');
        } else {
            self.$filters.addClass('active');
            $('body').addClass('no-scroll');
        }
    };
}


function TabFilterView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    console.log('new tab filter view');

    this.ww = window.innerWidth || '';
    this.$accordion = $('.o-block--experience-filter__container');
    this.$links = this.el.find('.o-block--experience-filter__container-options');
    var self = this;

    $(window).on('resize', function () {
        self.resize();
    });
    this.init = function () {
        this.bindUIActions();
        this.resize();
        this.swapTitle();
    };

    this.bindUIActions = function () {
        self = this;

        $('.o-block--experience-filter__container__title').on('click', function (e) { self.expand(e); });
    };

    this.expand = function (e) {

        if (this.ww > window.WS.Breakpoints.tabletLg) { return; }
        var $this = $(e.currentTarget);
        if ($this.parent('ul').hasClass('active')) {
            $this.parent('ul').removeClass('active');
            self.el.find('.filter-item').fadeOut(300);
        } else {
            $this.parent('ul').addClass('active');
            self.el.find('.filter-item').fadeIn();
        }
    };

    this.close = function (e) {
        this.$accordion.removeClass('active');
        this.el.find('.filter-item').fadeOut();
    };

    this.resize = function () {
        this.ww = window.innerWidth;
        if (this.ww >= window.WS.Breakpoints.tabletLg) {
            this.el.find('.filter-item').css({'display': 'inline-block'});
        } else {
            this.el.find('.filter-item').css({'display': 'none'});
        }
    };

    this.swapTitle = function (target) {
        $('.o-block--experience-filter__container-options').click(function () {
            var $title = $(this).find('.experience-description').text();
            $('.o-block--experience-filter__container-options').removeClass('active');
            $(this).addClass('active');
            $('.o-block--experience-filter__container__title').text($title);
        });
        if (this.ww < window.WS.Breakpoints.tabletLg) {
            $('.o-block--experience-filter__container-options').click(function () {
                var $title = $(this).find('.experience-description').text();
                $('.o-block--experience-filter__container-options').removeClass('active');
                $(this).addClass('active');
                $('.o-block--experience-filter__container__title').text($title);
                $('.o-block--experience-filter__container').removeClass('active');
                $('.filter-item').fadeOut();
            });
        }
    };
}

function countdownTimer() {
    // Countdown Target
    var targetDate = new Date('Dec 5, 2017 15:37:25').getTime();

    var x = setInterval(function () {
        var currentDate = new Date().getTime();

        // Find the distance between currentDate and targetDate
        var distance = targetDate - currentDate;

        // Time calculations for days, hours, minutes and seconds
        var days = ('0' + Math.floor(distance / (1000 * 60 * 60 * 24))).slice(-2),
            hours = ('0' + Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).slice(-2),
            minutes = ('0' + Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).slice(-2),
            seconds = ('0' + Math.floor((distance % (1000 * 60)) / 1000)).slice(-2);

        // Display the results in specified containers
        $('.o-block--product-hero__countdown__days .o-block--product-hero__countdown__time').html(days);
        $('.o-block--product-hero__countdown__hours .o-block--product-hero__countdown__time').html(hours);
        $('.o-block--product-hero__countdown__minutes .o-block--product-hero__countdown__time').html(minutes);
        $('.o-block--product-hero__countdown__seconds .o-block--product-hero__countdown__time').html(seconds);
    }, 1000);
}

$(function () {
    if ($('.m-block--gutter-images--with-text')[1]) {
        var $sliderDomElement = $('.m-block--gutter-images--with-text');
        var options = window.BROOKS_IMAGE_SLIDER_OPTIONS;
        var breakpointClass = 'fourths-container';
        if ($sliderDomElement.find(breakpointClass))
        {
            options.responsive.map(function (currentElement, i, arr) {
                if (currentElement.hasOwnProperty('breakpoint'))
                {
                    currentElement.breakpoint = 767; // Tablet Size
                }
            });
        }
        var ivs = new window.SliderView({el: $sliderDomElement, sliderOpts: options });
        ivs.init();
    }

    var colletionGridSlider = new window.SliderView({el: $('.collection__grid .grid__items'), sliderOpts: window.BROOKS_COLLECTION_GRID_SLIDER_OPTIONS });
    colletionGridSlider.init();

    countdownTimer();
});

function initAfterLoad(initClass) {
    var element = $(initClass);
    if (element[0]) {
        $.each($(element), function (index, value) {
            if (initClass.indexOf('.grid__items') > -1) {
                var rpgv = new window.ProductGridView({el: $(value), gridItems: $('.o-block--related-product__product-card')});
		        rpgv.init();
		        var slider = new window.SliderView({el: $(value), sliderOpts: window.BROOKS_COLLECTION_GRID_SLIDER_OPTIONS });
                slider.init();
                window.wsApp.initProductCards();
            }
	  	  });
    }
}

function ajaxCallIsComplete(arrayItem) {
    return arrayItem === true;
}

function triggerDeferredPageLoadEvent() {
    if (!deferredPageLoadEventStatus) {
        const event = new Event('deferredPageLoadComplete');
        window.dispatchEvent(event);

        // set flag to signal that the event has been dispatched
        deferredPageLoadEventStatus = true;
    }
}

// create flag for checking if all AJAX calls have completed
var deferredPageLoadEventStatus = false;

// create array to track status of each AJAX call
var deferredMarkupLoaded = [];

$('.js-page-load').each(function () {
    var element = $(this);
    var url = element.attr('href');
    var initClass = element.data('initclass');

    deferredMarkupLoaded.push(false);
    var pIndex = deferredMarkupLoaded.length - 1;

    if (url === undefined) {
        url = element.data('href');
    }

    $.ajax({
        url: url,
        data: {'format': 'ajax'},
        dataType: 'html',
        success: function (html) {
            element.after(html);
            element.remove();
            if (initClass) {
                initAfterLoad(initClass);
            }

            deferredMarkupLoaded[pIndex] = true;
        }
    })
    .then(function () {
        if (deferredMarkupLoaded.every(ajaxCallIsComplete)) {
            triggerDeferredPageLoadEvent();
        }
    });
});

/* eslint-disable curly */
/* eslint-disable complexity */
var WS = window.WS || {};

/* Global sharing (only once necessary) */
window.WS = WS;

/* Global mobile checkpoint */
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    WS.mobile = true;
    $('body').addClass('mobile');
}

/* Generate a unique key (for event listeners) */
WS.guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
    };
})();


/* Global JS Breakpoints */
WS.Breakpoints = {};
WS.Breakpoints.mobile = 320;
WS.Breakpoints.mobileLg = 595;
WS.Breakpoints.tablet = 768;
WS.Breakpoints.tabletLg = 975;
WS.Breakpoints.desktop = 1280;
WS.Breakpoints.desktopLg = 1440;

'use strict';

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, argument) {
        argument = argument || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(argument, this[i], i, this);
        }
    };
}
var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

function initSlidersOfType(sliderSelector, sliderOptions, usesControls) {
    const sliders = document.querySelectorAll(sliderSelector);
    if (sliders && sliders.length > 0) {
        const options = sliderOptions || {};
        sliders.forEach(function (slider) {
            if (slider && slider.childElementCount > 1) {
                if (usesControls && slider.parentNode) {
                    const controls = slider.parentNode.querySelector('.m-carousel-controls');
                    if (controls) {
                        options.prevArrow = controls.querySelector('.m-carousel-controls__button--left');
                        options.nextArrow = controls.querySelector('.m-carousel-controls__button--right');
                    }
                }
                new window.SliderView({
                    el: $(slider),
                    sliderOpts: options
                }).init();
            }
        });
    }
}

var lazyloadVanilla = function lazyloadVanilla(component) {
    // Test if image is in the viewport
    var isImageInViewport = function isImageInViewport(img) {
        var element = img.get(0); // get the raw HTML element
        var rect = element.getBoundingClientRect();
        var delta = 400; //add extra delta to offset when the bottom of the img comes into the viewport
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight + delta || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    };

    var isImageInView = function isImageInView(img) {
        var element = img.get(0); // get the raw HTML element
        var rect = element.getBoundingClientRect();
        var delta = 100;

        // bottom of our image is less than height of the window
        return rect.top >= 0 && rect.bottom <= (window.innerHeight + delta || document.documentElement.clientHeight);
    };

    var lazyloadImage = function (img, attribute, callback) {
        if (img.data(attribute) !== null) {
            img.attr(attribute, img.data(attribute));
            img.removeAttr('data-' + attribute);

            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    // Create custom fading effect for showing images
    var fadeInCustom = function fadeInCustom(element) {
        // var elementOpacity = 0.1; // initial opacity
        element.addClass('isLoading');

        // element.style.display = 'block';
        var timer = setInterval(function () {
        // if (elementOpacity >= 1) {
        //   clearInterval(timer);
        // }


            element.addClass('loaded');

        // element.style.opacity = elementOpacity;

        // element.style.filter = 'alpha(opacity=' + elementOpacity * 100 + ")";

        // elementOpacity += elementOpacity * 0.4;
        }, 10);
    };

    // lazyloadVanilla function
    var lazyloadVanillaLoader = function lazyloadVanillaLoader() {
        if (component === undefined) {
            component = $(document);
        }

        component.find('img[data-src]').each(function () {
            var image = $(this);
            var parent = image.parent();

            if (parent.hasClass('animate-in')) {

                // do custom lazy load
                if (isImageInView(image)) {
                    lazyloadImage(image, 'src', function () {
                        parent.addClass('show');
                    });
                }
            }
            if (isImageInViewport(image)) {
                lazyloadImage(image, 'src');
                lazyloadImage(image, 'srcset');

                image.data('loaded', true);

                fadeInCustom(image);
            }
        });

        // Remove event listeners if all images are loaded
        if (document.querySelectorAll('img[data-src]').length === 0 && document.querySelectorAll('img[data-srcset]')) {
            window.removeEventListener('DOMContentLoaded', lazyloadVanilla);

            window.removeEventListener('load', lazyloadVanillaLoader);

            window.removeEventListener('resize', lazyloadVanillaLoader);

            window.removeEventListener('scroll', lazyloadVanillaLoader);
        }
    };

    // Add event listeners to images
    window.addEventListener('DOMContentLoaded', lazyloadVanillaLoader);

    window.addEventListener('load', lazyloadVanillaLoader);

    window.addEventListener('resize', lazyloadVanillaLoader);

    window.addEventListener('scroll', lazyloadVanillaLoader);
};

// Test if JavaScript is available and allowed
if (document.querySelector('.no-js') !== null) {
    document.querySelector('.no-js').classList.remove('no-js');
}

var wsApp = {
    init: function () {
        new window.DetailsView(_requestAnimationFrame);
    },
    initPCP: function () {
        if ($('.category')[0]) {
            var fv = new window.FilterView({ el: $('.category'), tabs: true });
            fv.init();
        }
        if ($('.category__grid-items')[0]) {
            var pgv = new window.ProductGridView({el: $('.category__grid-items'), gridItems: $('.o-block--related-product__product-card')});
            pgv.init();
        }
        this.initProductCards();

        initSectionSelects('#main');
    },
    initSmoothScroll: function (targetSection) {

        var activeTargetSection = targetSection.parent('.current');

        // first find the offset of our target section
        // find the current scroll offset
        // change scroll position to the offset our target section
        if (activeTargetSection[0]) {
            var targetOffset = activeTargetSection.offset().top;
        } else {
            var targetOffset = $(targetSection).offset().top;
        }

        var currentOffset = $(window).scrollTop();
        $('html, body').animate({
            scrollTop: targetOffset
        }, 400);


    },
    initProductCarousel: function () {
        initSlidersOfType('.o-carousel__products', window.BROOKS_PRODUCT_CAROUSEL_OPTIONS, true);
    },
    initGearHighlight: function () {
        initSlidersOfType('.o-gear-highlight__gallery', window.BROOKS_GEAR_HIGHLIGHT_OPTIONS, true);
    },
    initRecommendedProductsHero: function () {
        if ($('.hero--recommended-products .grid__items .o-block--related-product__product-card')[0]) {
            var hpgv = new window.ProductGridView({el: $('.grid__items'), gridItems: $('.o-block--related-product__product-card')});
            hpgv.init();
            var heroGridSlider = new window.SliderView({el: $('.grid__items'), sliderOpts: window.BROOKS_COLLECTION_GRID_SLIDER_OPTIONS });
            heroGridSlider.init();

            this.initProductCards();

            $('.hero--recommended-products .o-block--related-product__product-card').each(function () {
                var image = $(this).find('.o-block--related-product__product-card__image');
                if (image) {
                    var src = image.attr('data-src');
                    if (src) {
                        image.attr('src', src);
                        image.removeAttr('data-src');
                    }
                }
            });
        }
    },
    initProductCards: function () {
        var BROOKS_THUMB_OPTIONS = {
            slide: '*:not(script)',
            slidesToShow: 3.5,
            slidesToScroll: 3,
            touchMove: false,
            dots: false,
            focusOnSelect: false,
            variableWidth: true,
            infinite: false,
            arrows: true,
            prevArrow: '<div class="slick-prev"><svg class="icon icon-caret-black"><use xlink:href="#icon-caret-black"></use></svg></div>',
            nextArrow: '<div class="slick-next"><svg class="icon icon-caret-black"><use xlink:href="#icon-caret-black"></use></svg></div>',
            responsive: [
                {
                    breakpoint: 1440,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3


                    }
                },
                {
                    breakpoint: 1020,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 975,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 595,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                }

            ]
        };
        var initProductCardsHelper = function () {
            if ($('.o-block--related-product__product-card .product-container__thumbnails')[0]) {
                $.each($('.o-block--related-product__product-card .product-container__thumbnails'), function (index, value) {
                    var ts = new window.SliderView({el: $(this), sliderOpts: BROOKS_THUMB_OPTIONS, hoverSwap: true });
                    ts.init();
                });
            }
        };

        if ($('.o-block--related-product__product-card .product-container__thumbnails')[0]) {
            initProductCardsHelper();

            _requestAnimationFrame(function () {
                initProductCardsHelper();
            });
        }
    },
    initCheckboxes: function () {
        var cv = new window.ButtonCheckboxView({ el: $('.site-checkbox__wrapper')});
        cv.init();
    }
};

wsApp.init();

var productSlider = function productSlider() {
    //remove active class from all thumbnail slides
    $('.product-container__thumbnails .slick-slide').removeClass('slick-active');

    //set active class to first thumbnail slides
    $('.product-container__thumbnails .slick-slide').eq(0).addClass('slick-active');

    // On before slide change match active thumbnail to current slide
    $('.product-container').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var mySlideNumber = nextSlide;
        $('.product-container__thumbnails .slick-slide').removeClass('slick-active');
        $('.product-container__thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
    });

    //UPDATED

    /**
     * This func is to trigger a custom swipe event that Brooksrunning-analytics is listening for
     *
     * @param {integer} currentSlide
     */
    var triggerAnalyticsSwipeEvent = function(currentSlide) {
        var $image = $('[data-product-image-interaction][data-event-label=' + currentSlide +']');
        $image.trigger('custom-swipe');
    };

    $('.product-container').on('afterChange', function (event, slick, currentSlide) {
        $('.content[data-id=' + (currentSlide + 1) + ']').show();

        // for analytics only
        triggerAnalyticsSwipeEvent(currentSlide);
        // end analytics

        $('.product-container__video').each(function () {
            $('video.product-container__video').trigger('pause');
        });
        $('.slick-active .product-container__video').each(function () {
            $('video.product-container__video').trigger('play');
        });
    });
};

var keyboardBtnClick = function keyboardBtnClick() {
    // Check to see if space or enter were pressed
    $('.product--meta__thumbnails .thumb').keypress(function (e) {
        var key = e.which;
        if (key === 13) {
            var $this = $(this);
            if (!$this.hasClass('unselectable') && !$this.hasClass('selected')) {
                window.updateCoreCommerce($this.children('img').attr('data-value'));
            }
        }
    });

    // VIDEO PLAY ICON
    $('.a-product-features__img--overlay .icon-video-play').keypress(function (e) {
        var key = e.which;
        if (key === 13) {
            $('.a-product-features__img--overlay, .a-product-features__img img').addClass('hide');
            $('.a-product-features__video').addClass('show');
            $('video.a-product-features__video').trigger('play');
        }
    });
};

var pdpClickFunctions = function pdpClickFunctions() {
    var $quantitySelector = $('#quantity-selector');

    // TO DO: UPDATE EVERYTHING GOING ON HERE
    $('.product--meta__thumbnails .thumb').click(function () {
        var $this = $(this);
        if (!$this.hasClass('unselectable') && !$this.hasClass('selected')) {
            window.updateCoreCommerce($this.children('img').attr('data-value'));
        }
    });

    $('.product-container__thumbnails .product-container__image').click(function () {
        $('.product-container__thumbnails .product-container__image').removeClass('selected');
        $(this).addClass('selected');
    });

    $('.product-container__badge, .zoom__close').click(function () {
        $('.product--images').toggleClass('zoom');
        $('.o-header').toggleClass('nav--hidden');
        $('.promo-bar').toggleClass('nav--hidden');
        $('.product--meta__alert').toggleClass('hidden');
        $('.product-container').slick('setPosition');
    });

    $quantitySelector.on('change', function () {
	  updateInventoryMessages($(this));
    });

    $quantitySelector.on('input', function () {
	  if (this.value.length > 3) {
	       this.value = this.value.slice(0, 3);
	   }
    });

    $('.increment').on('click', function () {
        var $button = $(this);
        var $input = $button.parent().find('input');
        var oldValue = $input.val();

        if ($button.text() === "+") {
            var newVal = parseFloat(oldValue) + 1;

            //Prevent quantity input from exceeding 3 digits
            if ($quantitySelector.val() >= 999) {
    	  var newVal = 999;
            }
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 1) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        $input.val(newVal);
        $input.trigger('change');
    });

    var video = document.getElementById('benefits-video');
    if (video != null) {
        video.addEventListener('ended', myHandler, false);

    }
    function myHandler(e) {
        $('.a-product-features__img--overlay, .a-product-features__img img').removeClass('hide');
        $('.a-product-features__video').removeClass('show');
    }
};

var coreCommerceSliders = function coreCommerceSliders() {
    if ($('.product-container')[0]) {
        var psv = new window.SliderView({el: $('.product-container'), sliderOpts: window.BROOKS_PRODUCT_CONTAINER_OPTIONS });
        psv.init();
    }

    var slideCount = $('.product-container__thumbnails img').length;
    var BROOKS_THUMB_OPTIONS = {
        slidesToShow: slideCount,
        dots: false,
        focusOnSelect: true,
        variableWidth: true,
        infinite: false,
        lazyLoadBuffer: 0,
        lazyLoad: 'ondemand',
        asNavFor: '.product-container'
    };

    if ($('#core-commerce .product-container__thumbnails')[0]) {
        if (slideCount) {
            var ts = new window.SliderView({el: $('#core-commerce .product-container__thumbnails'), sliderOpts: BROOKS_THUMB_OPTIONS });
            ts.init();
        }
    }
};

var updateInventoryMessages = function ($input) {
    var $pid = $('#pid');
    if ($pid.val()) {
        window.app.product.getAvailability($pid.val(), $input.val(), function (data) {
            $('.product--meta__quantity-alert.qtymsg-notavailable').remove();
            var $addToCart = $('#add-to-cart');
            $addToCart.removeClass('a-btn--primary--inactive');
            $addToCart.prop("disabled", false);

            if (data) {
        	if (!data.isAvailable) {
    			if (data.inStock || data.status === "PREORDER") {
	              $('.quantity-form').before('<p class="product--meta__quantity-alert x-small qtymsg-notavailable" tabindex="0">' + window.app.resources.REMAIN_NOT_AVAILABLE + '</p>');
	            } else {
	              $('.quantity-form').before('<p class="product--meta__quantity-alert x-small qtymsg-notavailable" tabindex="0">' + window.app.resources.NOT_AVAILABLE + '</p>');
	            }
        		$addToCart.addClass('a-btn--primary--inactive');
        		$addToCart.prop("disabled", true);
                }
            }
        });
    }
};

var initSectionSelects = function (sectionSelector) {
    if (!sectionSelector) {
        sectionSelector = '';
    }

    if (window.Modernizr.touchevents) { return; }
    else {
        [].slice.call(document.querySelectorAll(sectionSelector + ' select.cs-select')).forEach(function (el) {
            if ($(el).parents('.cs-select')[0]) { return;
            } else {
                new window.SelectFx(el);
            }
        });
    }
};

var wsPDP = {
    init: function () {
        productSlider();
        keyboardBtnClick();
        pdpClickFunctions();
        coreCommerceSliders();
        initSectionSelects('#pdp');
        lazyloadVanilla($('#core-commerce'));
    }
};

if (window.requestAnimationFrame && document.documentElement.classList) {
    // check that we have requet animation frame in the browser
    document.documentElement.classList.add('enhanced');
    var throttle = function (func, wait, options) {
        var _ = {
            now: window.Date.now || function () {
                return new window.Date().getTime();
            }
        };
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) {
            options = {};
        }
        var later = function () {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        };
        return function () {
            var now = _.now();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

// use the debounce function to limit the rate at which a function gets called
// For example: a resize listener. Pass the function you wish to call to the debounce method

// var superFunction = debounce(function() {
//  console.log('do some super stuff');
// }, 250);

// window.addEventListener('resize', superFunction);

// Button, Radio & Checkbox Animation Effects
'use strict';

var ButtonCheckboxView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    var check = this.el;
    var btn = $('.a-btn');

    this.init = function () {
        this.bindUIActions();
    };

    this.bindUIActions = function () {
        var self = this;
        btn.on('click', function (e) { self.animateButton(e); });
        $('.site-checkbox__wrapper').click(function (e) {
            var inputCheckbox = $(e.currentTarget).find('input.e-input__checkbox');
            var checkboxContainer = $(e.currentTarget).closest('li').removeClass('initial').toggleClass('selected');
            var isChecked = inputCheckbox.attr('checked');
            inputCheckbox.attr('checked', !isChecked);
            inputCheckbox.prop('checked', !isChecked);
            inputCheckbox.trigger('change');

        });
    };

    this.animateButton = function (e) {
        var $this = $(e.currentTarget);
        $($this).addClass('animate').delay(400).queue(function () {
            $($this).removeClass('animate');
            $($this).dequeue();
        });
    };
};

var initOverlay = function (selector) {
    if (selector) {
        $(selector).each(function () {
            var $element = $(this);
            if ($element.children('.collection-hero-overlay').length === 0) {
                $element.append('<div class="collection-hero-overlay"></div>');
            }
        });
    }
};

$(function () {
    $('.promo-bar').focus();

    // initialize views
    var hv = new window.HeaderView({ el: $('.o-header')});
    hv.init();

    wsApp.initCheckboxes();

    var sv = new window.SearchView({ el: $('.o-header__molecules--right')});
    sv.init();
});

$(function () {
    $('.a-text-plain').keypress(function (e) {
        if (e.which === 13 || e.keyCode === 13) {
            var $this = $(this).click();
        }
    });
});

(function ($) {

    // Use this variable to set up the common and page specific functions. If you
    // rename this variable, you will also need to rename the namespace below.

// The routing fires all common scripts, followed by the page specific scripts.
    // Add additional events for more control over timing e.g. a finalize event
    var app = {
    // add additional strings for each unique body tag to fire page specific javascript
        'common': {
            init: function () {
                // console.log('inside common init');

                if ($('.category__grid-items')[0]) {
                    var pgv = new window.ProductGridView({el: $('.category__grid-items'), gridItems: $('.o-block--related-product__product-card')});
                    pgv.init();
                }
                if ($('#search-results-container')[0]) {
                    var fv = new window.FilterView({ el: $('#search-results-container'), tabs: true });
                    fv.init();

                    $(function () {
                        initOverlay('.m-block--hero--basic--collection');
                    });
                }

                if ($('.collection .grid__items')[0]) {
                    var rpgv = new window.ProductGridView({el: $('.grid__items'), gridItems: $('.o-block--related-product__product-card')});
                    rpgv.init();
                    var colletionGridSlider = new window.SliderView({el: $('.grid__items'), sliderOpts: window.BROOKS_COLLECTION_GRID_SLIDER_OPTIONS });
                    colletionGridSlider.init();
                }

                wsApp.initProductCarousel();
                wsApp.initGearHighlight();
                wsApp.initRecommendedProductsHero();

                if ($('.social__block')[0]) {
                    var ssv = new window.SliderView({ el: $('.social__block'), sliderOpts: {} });
                    ssv.init();
                }

                $('.js-tooltip__trigger').each(function () {
                    var ttv = new window.ToolTipView({el: $(this)});
                    ttv.init();
                });

                if ($('.collection__hero .image__gallery')[0]) {
                    $.each($('.collection__hero .image__gallery'), function (index, value) {
                        var gsv = new window.SliderView({ el: $(this), sliderOpts: window.BROOKS_COLLECTION_GALLERY_OPTIONS, clickSlideToAdvance: true, appendArrows: $(this).find('.slick-list')});
                        gsv.init();
                    });
                }

                if ($('.o-block--interactive-collection .text__slider')[0]) {
                    var attachBtnScroll = function (parentEl, icv) {
                        $(parentEl).find('.btn-n').click(function (el) {
                            var slickIndex = $(el.target).data('slickIndex');
                            icv.goToSlickIndex(slickIndex);
                        });
                    };
                    var attachBtnActive = function (parentEl, icv) {
                        $(parentEl).find('.text__slider').on('afterChange', function (slick, currentslide) {
                            var thisNumBtn = $(parentEl).find('.btn-n');
                            icv.changeButtonState(thisNumBtn);
                        });
                    };
                    $.each($('.o-block--interactive-collection .text__slider'), function (index, value) {
                        var parentContainer = $(this).parent(); // o-block-interactive-collection
                        var icv = new window.SliderView({el: $(this), sliderOpts: window.BROOKS_INTERACTIVE_COLLECTION_GROUP_OPTIONS, clickSlideToAdvance: true });
                        icv.init();
                        $('.btn-n:first-of-type').addClass('btn-n--active').next().addClass('btn-n--pulse');
                        attachBtnScroll(parentContainer, icv);
                        attachBtnActive(parentContainer, icv);
                    });
                }

                if ($('.collection__hero--toggle')[0]) {
                    var htv = new window.HeroToggleView({ el: $('.collection__hero--toggle')});
                    htv.init();
                }

                // console.log(tooltip);

                if ($('#reviews-and-questions')[0]) {
                    var tnv = new window.TabbedNavigationView({el: $('nav.tabbed__navigation')});
                    tnv.init();

                    // Needed for Adobe analytics
                    var encodedCookie = this.readCookie('ss_bestMatches');
                    this.updateMatchAnalyticsData(encodedCookie, 'shoeFinder');
                    encodedCookie = this.readCookie('braFinderBestMatches');
                    this.updateMatchAnalyticsData(encodedCookie, 'braFinder');
                }
                if ($('.m-block--video-player')[0]) {
                    $.each($('.m-block--video-player'), function (index, value) {
                        var vvglobal = new window.YouTubePlayer({el: value, banner: true});
                        vvglobal.init();

                        lazyloadVanilla($(value));
                    });
                }
                var vv = new window.YouTubePlayer({el: $('.m-feature')});
                vv.init();
            },
            finalize: function () {

            },
            // eslint-disable-next-line complexity
            readCookie: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0;i < ca.length;i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
                return null;
            },
            decodeCookie: function (encodedCookie) {
                if (encodedCookie) {
                    return JSON.parse(atob(encodedCookie));
                }
                return encodedCookie;
            },
            getMatchAnalyticsDataAttribute: function (matchType) {
                if (matchType === 'shoeFinder') {
                    return 'data-product-shoe-finder-results-flag';
                }
                if (matchType === 'braFinder') {
                    return 'data-product-bra-finder-results-flag';
                }
                return undefined;
            },
            updateMatchAnalyticsData: function (encodedCookie, matchType) {
                if (encodedCookie)
                {
                    var data = this.decodeCookie(encodedCookie);
                    var dataAttribute = this.getMatchAnalyticsDataAttribute(matchType);
                    if (dataAttribute !== undefined) {
                        $('[data-product-style-id]').each(function (index, item) {
                            var productID = $(item).data('product-style-id').toString();
                            if (data.indexOf(productID) !== -1)
                            {
                                $(item).attr(dataAttribute, 'true');
                            }
                        });
                    }
                }
            }
        }
    };
    var UTIL = {
        fire: function (func, funcname, args) {
            var fire;
            var namespace = app;
            funcname = (funcname === undefined) ? 'init' : funcname;
            fire = func !== '';
            fire = fire && namespace[func];
            fire = fire && typeof namespace[func][funcname] === 'function';

            if (fire) {
                namespace[func][funcname](args);
            }
        },
        loadEvents: function () {
            // Fire common init JS
            UTIL.fire('common');

            // Fire page-specific init JS, and then finalize JS
            $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function (i, classnm) {
                UTIL.fire(classnm);
                UTIL.fire(classnm, 'finalize');
            });

            // Fire common finalize JS
            UTIL.fire('common', 'finalize');
            wsApp.initRecommendedProductsHero();
        }
    };

    // Load Events
    $(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.

function HeaderDropdownView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$primaryNavLinks = $(this.el).find('.m-primary-nav__link');
    this.$primaryNavDropdowns = $(this.el).find('.o-nav-dropdown');

    var self = this;

    $(window).on('resize', function () {
        self.offSetMobileMenu();
    });

    $(window).scroll(function () {
        self.hideNavDropdown();
    });

    this.init = function () {
        this.activatePromo();
        this.bindUIActions();
    };

    this.bindUIActions = function () {
        $('.m-header__utility, .o-header__molecules--left').mouseenter(function (e) { self.hideNavDropdown(e); });
        self.$primaryNavDropdowns.mouseleave(function (e) { self.hideNavDropdown(e); });

        self.$primaryNavLinks.mouseover(function (e) { self.showNavDropdown(e); });
        self.$primaryNavLinks.focusin(function (e) { self.showNavDropdown(e); });

        $('.promo-bar__close-icon').click(function (e) { self.dismissPromo(e); });

        $('.cs-options, .m-header__utility').mouseleave(function (e) { self.hideToolbarDropdown(e); });
        $('.wrap').mouseenter(function (e) { self.hideToolbarDropdown(e); });
        $('.cs-select--navigation').change(function (e) { self.handleToolbarDropdownChange(e); });
    };

    this.showNavDropdown = function (e) {
        var $this = $(e.currentTarget);

        // Hide other dropdowns
        self.hideNavDropdown(e);

        // Show hover effect on current link
        $this.addClass('m-primary-nav__link--hover');

        // Show current dropdown
        var $currentDropdown = $this.next('.o-nav-dropdown');
        $currentDropdown.addClass('o-nav-dropdown--visible');

        $currentDropdown.css('top', (100 + $('#header').offset().top) - $(window).scrollTop());
    };

    this.hideNavDropdown = function (e) {
        self.$primaryNavDropdowns.removeClass('o-nav-dropdown--visible');
        self.$primaryNavLinks.removeClass('m-primary-nav__link--hover');
    };

    this.offSetMobileMenu = function () {
        var iosToolbarHeight = 64;
        if (window.innerWidth < window.WS.Breakpoints.tabletLg) {
            var $offCanvas = $('.nav__container--offCanvas');
            var $promobar = $('.promo-bar');
            var pHeight = 0;
            var headerHeight = 60 + iosToolbarHeight;

            if ($promobar.hasClass('active')) {
                pHeight = $promobar.height();
            }
            $offCanvas.css('padding-bottom', pHeight + headerHeight);
        }
    };

    this.activatePromo = function (e) {
        var $a = $('a.promo-bar__open');
        var $promobar = $('.promo-bar');
        var $wrapper = $('#wrapper');

        if ($a && $a.attr('href')) {
            $promobar.addClass('active');
            $wrapper.addClass('promo--active');
        } else {
            $promobar.removeClass('active');
            $wrapper.removeClass('promo--active');
            $wrapper.css('paddingTop', '0');
        }

        this.offSetMobileMenu(); // offset mobile menu padding bottom by the height of the promo
    };

    this.dismissPromo = function (e) {
        var $promobar = $('.promo-bar');
        var $wrapper = $('#wrapper');
        var duration = 300;

        $wrapper
            .animate({
                paddingTop: '0'
            }, duration)
            .removeClass('promo--active');

        $promobar
            .animate({
                top: -1 * $promobar.height()
            }, duration)
            .removeClass('active');

        if (window.innerWidth < window.WS.Breakpoints.tabletLg) {
            $wrapper
                .find('.o-header')
                .animate({
                    top: 0
                }, duration);
        }

        this.offSetMobileMenu(); // remove extra padding on mobile menu that was added for the promo

        var $a = $('a.promo-bar__open');
        if ($a && $a.attr('href')) {
            e.preventDefault();
            $.ajax({
                url: $a.attr('href'),
                dataType: 'html'
            });
        }
    };

    this.hideToolbarDropdown = function (e) {
        $('.cs-select--navigation').removeClass('cs-active');
    };

    this.handleToolbarDropdownChange = function (e) {
        if (window.Modernizr.touchevents) {
            window.location.href = $(e.currentTarget).val();
        }
    };
}

var HeaderScrollView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$offCanvas = $('.nav__container--offCanvas');
    var lastTop = 0;
    var minimumChange = 5;
    var navbarHeight = this.el.outerHeight();
    var self = this;

    var scrollHandler = window.throttle(function () {
        window._requestAnimationFrame(self.hasScrolled);
    }, 17);

    $(window).scroll(scrollHandler);

    this.init = function () {
        self.show();
    };

    this.hasScrolled = function () {
        var currentTop = $(window).scrollTop();

        if (self.isMinorScroll(currentTop)) {
            return;
        }

        if (self.isScrollingDown(currentTop) && self.hasScrolledPastTriggerPoint(currentTop)) {
            if (self.isMobileNavOpen()) {
                return;
            } else {
                self.hide();
            }
        } else {
            self.show();
        }
        lastTop = currentTop;
    };

    this.show = function () {
        self.el.removeClass('nav-up').addClass('nav-down');
        $('body').removeClass('nav-up').addClass('nav-down');
    };

    this.hide = function () {
        self.el.removeClass('nav-down').addClass('nav-up');
        $('body').removeClass('nav-down').addClass('nav-up');
    };

    this.isMinorScroll = function (currentTop) {
        return Math.abs(lastTop - currentTop) <= minimumChange;
    };

    this.isScrollingDown = function (currentTop) {
        return currentTop > lastTop;
    };

    this.hasScrolledPastTriggerPoint = function (currentTop) {
        return currentTop > navbarHeight;
    };

    this.isMobileNavOpen = function () {
        return self.$offCanvas.hasClass('active');
    };
};

// eslint-disable-next-line no-unused-vars
var HeaderView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$offCanvas = $(this.el).find('.nav__container--offCanvas');

    var navTwo = $(this.el).find('.m-mobile-nav__two');
    var navThree = $(this.el).find('.m-mobile-nav__three');

    this.$stepTwoMenus = navTwo.find('.m-mobile-nav__list');
    this.$stepThreeMenus = navThree.find('.m-mobile-nav__list');
    this.$stepTwoLabel = navTwo.find('.m-mobile-nav__header');
    this.$stepThreeLabel = navThree.find('.m-mobile-nav__header');

    this.$hamburger = $(this.el).find('.icon-Hamburger');
    this.menuTwoActive = false;
    this.menuThreeActive = false;

    var self = this;
    var resizeHandler = window.throttle(function () {
        window._requestAnimationFrame(self.resize);
    }, 17);
    $(window).on('resize', resizeHandler);

    this.init = function () {
        this.bindUIActions();
        this.hideHeaderMenus();

        var hdv = new window.HeaderDropdownView({
            el: $('.nav__container')
        });
        var hsv = new window.HeaderScrollView({
            el: $('.o-header')
        });
        hdv.init();
        hsv.init();
    };

    this.resize = function () {
        if (window.innerWidth >= window.WS.Breakpoints.tabletLg) {
            var $body = $('body');

            if ($body.hasClass('nav-open')) {
                $body.removeClass('nav-open');
                self.$offCanvas.removeClass('active');
                self.$hamburger.toggleClass('open');
            }
        }
    };

    this.bindUIActions = function () {
        self = this;

        // Open and close mobile menu
        this.$hamburger.on('click', function (e) { self.toggle(e); });

        // Show second level of mobile menu
        $('.m-mobile-nav__one .m-mobile-nav__item--expand').on('click', function (e) { self.showMenuTwo(e); });

        // Show next level up of mobile menu
        $('.m-mobile-nav__header').on('click', function (e) { self.hideActiveMenu(e); });

        // Show third level of mobile menu
        $('.m-mobile-nav__two .m-mobile-nav__item--expand').on('click', function (e) { self.showMenuThree(e); });
    };

    this.hideHeaderMenus = function () {
        this.hideMenuTwo();
        this.hideMenuThree();
    };

    this.toggle = function (e) {
        e.preventDefault();

        // The desired effect is to upon reopening the menu always start from step 1
        this.hideHeaderMenus();

        this.$offCanvas.toggleClass('active');
        this.$hamburger.toggleClass('open');
        this.$offCanvas.scrollTop(0);

        $('body').toggleClass('nav-open');
    };

    this.displayMenu = function (cat, subcat) {
        if (!subcat) {
            this.displayMenuHelper(this.$stepTwoLabel, this.$stepTwoMenus, cat, subcat, cat, 'step-two');

            this.menuTwoActive = true;
        } else {
            var label = cat + ' ' + subcat;
            this.displayMenuHelper(this.$stepThreeLabel, this.$stepThreeMenus, cat, subcat, label, 'step-three');

            this.menuThreeActive = true;
        }
    };

    this.displayMenuHelper = function ($label, $menu, cat, subcat, label, offCanvasClass) {
    // Update label of the menu
        $label.text(label);

        // Update the state/position of the container
        this.$offCanvas.addClass(offCanvasClass);
        this.$offCanvas.scrollTop(0);

        // Update visible menu items
        $.each($menu, function () {
            var $this = $(this);

            // Category always must match
            var fade = $this.data('category') === cat;

            // If a subcat exists, that must also match
            if (subcat) {
                fade = fade && $this.data('subcategory') === subcat;
            }

            if (fade) {
                $this.addClass('m-mobile-nav__list--show');
            }
        });
    };

    this.showMenuTwo = function (e) {
        e.preventDefault();
        var $this = $(e.currentTarget);

        // show the next level deep content
        var cat = $this.find('.m-mobile-nav__link').data('category');

        this.displayMenu(cat, null);
    };

    this.showMenuThree = function (e) {
        e.preventDefault();
        var $this = $(e.currentTarget);

        var cat = $this.parents('.m-mobile-nav__list').data('category');
        var subcat = $this.data('subcategory') || $this.next().data('subcategory');

        this.displayMenu(cat, subcat);
    };

    this.hideActiveMenu = function (e) {
        if (this.menuThreeActive) {
            this.hideMenuThree();
        } else if (this.menuTwoActive) {
            this.hideMenuTwo();
        }
    };

    this.hideMenuTwo = function () {
        this.menuTwoActive = false;
        this.$offCanvas.removeClass('step-two');
        this.$stepTwoMenus.removeClass('m-mobile-nav__list--show');
    };

    this.hideMenuThree = function () {
        this.menuThreeActive = false;
        this.$offCanvas.removeClass('step-three');
        this.$stepThreeMenus.removeClass('m-mobile-nav__list--show');
    };
};


// eslint-disable-next-line no-unused-vars
var HeroToggleView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$toggleList = $(this.el).find('.toggle__list');
    this.$toggle = $(this.el).find('.toggle__list .toggle');
    this.init = function () {
        this.bindUIActions();
    };

    this.bindUIActions = function () {
        var self = this;
        self.$toggle.on('click', function (e) {
            self.toggleState(e);
        });
    };

    this.toggleState = function (e) {
        var $this = $(e.currentTarget);
        var self = this;
        $(self.el).toggleClass('toggleActive');
        if (self.$toggle.hasClass('active')) {
            self.$toggle.removeClass('active');
        }
        if ($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    };
};


// eslint-disable-next-line no-unused-vars
function iconsAnimations() {
    function ieFallback() {
        // Fallback Hero Article
        var arrowLoopBasicHero = document.querySelectorAll('.o-hero--basic__arrow');
        var arrowBasicHero = document.querySelectorAll('.o-hero--basic__arrow--ie');

        arrowLoopBasicHero.forEach(function (arrowLink) {
            arrowLink.style.display = 'none';
        });

        arrowBasicHero.forEach(function (arrowLink) {
            arrowLink.style.display = 'inline-block';
        });
    }

    if ('IntersectionObserver' in window) {
        var arrowLoop = document.querySelectorAll('.icon-arrow-down-loop');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry && entry.intersectionRatio > 0) {
                    entry.target.classList.add('animate-arrow-loop-dash');
                    observer.unobserve(entry.target);
                }
            });
        });

        arrowLoop.forEach(function (icon) {
            observer.observe(icon);
        });
    } else {
        ieFallback();
    }
}

var ImageCompareView = function (opts) {
    this.opts = opts;
    this.el = this.el.opts;

    this.init = function () {
        this.bindUIActions();
    };

    this.bindUIActions = function () {

    };
};

$(function () {
    $('.image__slider-reveal').each(function () {
        var cur = $(this);

        // Adjust the slider
        var width = cur.width() + 'px';
        cur.find('.cd-resize-img img').css('width', width);

        // Bind dragging events
        drags(cur.find('.cd-handle'), cur.find('.cd-resize-img'), cur);
    });
});

$(window).resize(function () {
    $('.image__slider-reveal').each(function () {
        var cur = $(this);
        var width = cur.width() + 'px';
        cur.find('.cd-resize-img img').css('width', width);
    });
});
function drags(dragElement, resizeElement, container) {

    // Initialize the dragging event on mousedown.
    dragElement.on('mousedown touchstart', function (e) {

        dragElement.addClass('cd-draggable');
        resizeElement.addClass('resizable');

        // Check if it's a mouse or touch event and pass along the correct value
        var startX = (e.pageX) ? e.pageX : e.originalEvent.touches[0].pageX;

        // Get the initial position
        var position = {
            'posX': dragElement.offset().left + dragElement.outerWidth() - startX,
            'containerOffset': container.offset().left,
            'containerWidth': container.outerWidth(),
            'dragWidth': dragElement.outerWidth()
        };

        // Calculate the dragging distance on mousemove.
        dragElement.parents().on("mousemove touchmove", {'position': position, 'resizeElement': resizeElement}
            , mouseMoveHandler)
            .on('mouseup touchend touchcancel', {'dragElement': dragElement, 'resizeElement': resizeElement}, mouseCancelhandler);

        e.preventDefault();
    }).on('mouseup touchend touchcancel', {'dragElement': dragElement, 'resizeElement': resizeElement}, mouseCancelhandler);
}

function mouseMoveHandler(e) {
    var position = e.data.position;

    // Set limits
    var minLeft = position.containerOffset + 10;
    var maxLeft = position.containerOffset + position.containerWidth - position.dragWidth - 10;

    // Check if it's a mouse or touch event and pass along the correct value
    var moveX = (e.pageX) ? e.pageX : e.originalEvent.touches[0].pageX;

    var leftValue = moveX + position.posX - position.dragWidth;

    // Prevent going off limits
    if (leftValue < minLeft) {
        leftValue = minLeft;
    } else if (leftValue > maxLeft) {
        leftValue = maxLeft;
    }

    // Translate the handle's left value to masked divs width.
    // Set the new values for the slider and the handle.
    var widthValue = (leftValue + position.dragWidth / 2 - position.containerOffset) * 100 / position.containerWidth + '%';

    // Bind mouseup events to stop dragging.
    $('.cd-draggable').css('left', widthValue).on('mouseup touchend touchcancel', {'dragElement': $(this), 'resizeElement': e.data.resizeElement},
        mouseCancelhandler);
    $('.resizable').css('width', widthValue);
}

function mouseCancelhandler(e) {
    e.data.dragElement.removeClass('cd-draggable');
    e.data.resizeElement.removeClass('resizable');
}

(function (w) {
    /* eslint-disable no-unused-vars */
    var sw = document.body.clientWidth, 
        sh = document.body.clientHeight;

    $(w).resize(function () { //Update dimensions on resize
        sw = document.body.clientWidth;
        sh = document.body.clientHeight;

        //updateAds();
    });
  
    // Initialize functions for "DOMContentLoaded"
    document.addEventListener("DOMContentLoaded", function () {
        /* eslint-disable no-undef */
        scrollToElement();
        iconsAnimations();
        callOutModal();
    });
})(this);


function addSpinner($target) {
    var $veil = '';

    if ($target.is($('body'))) {
        $veil = $('<div class="a-loading a-loading--full"><div class="a-loading__spinner"></div></div>');
    } else {
        $veil = $('<div class="a-loading a-loading--section"><div class="a-loading__spinner"></div></div>');
    }

    $target.prepend($veil);
    $veil.click(function (e) {
        e.stopPropagation();
    });
}

function removeSpinner($veil) {
    if ($veil.hasClass('a-loading')) {
        $veil.remove();
    }
    $veil.off('click');
    $veil.remove();
}

// element level spinner:
$.fn.spinner = function () {
    var $element = $(this);
    var Fn = function () {
        this.start = function () {
            if ($element.length) {
                addSpinner($element);
            }
        };
        this.stop = function () {
            if ($element.length) {
                removeSpinner($('.a-loading'));
            }
        };
    };
    return new Fn();
};

// page-level spinner:
$.spinner = function () {
    /* eslint-disable no-unused-vars */
    var $element = $(this);
    var Fn = function () {
        this.start = function () {
            addSpinner($('body'));
        };
        this.stop = function () {
            removeSpinner($('.a-loading'));
        };
    };
    return new Fn();
};

/* eslint-disable no-unused-vars */
var TabbedNavigationView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$navItems = $(this.el).find('.tabbed__navigation-item');
    this.init = function () {
        this.activateFirstItem(); // activate the first tab on initialization
        this.bindUIActions();
    };

    this.bindUIActions = function () {
        var self = this;
        self.$navItems.on('click', function (e) {
            self.toggleNav(e);
        });
    };

    this.activateFirstItem = function () {
        var $first = $(this.$navItems).first();
        var $reviewsTab = $('.o-block--reviews');
        $first.addClass('current');
        $reviewsTab.addClass('current');
    };

    this.toggleNav = function (e) {
        e.preventDefault();
        var $this = $(e.currentTarget);
        var $reviewTab = $('.tabbed__navigation-item.reviews');
        var $questionTab = $('.tabbed__navigation-item.questions');
        /* eslint-disable no-unused-vars */
        var $tabs = $('.o-block--reviews, .o-block--questions');

        this.$navItems.each(function (tab) {
            if ($(this).hasClass('current')) {
                $(this).removeClass('current');
            }
        });
        $this.toggleClass('current');
        if ($questionTab.hasClass('current')) {
            $('.o-block--reviews').removeClass('current');
            $('.o-block--questions').addClass('current');
        } else if ($reviewTab.hasClass('current')) {
            $('.o-block--reviews').addClass('current');
            $('.o-block--questions').removeClass('current');
        }
    };
};


$(function () {
    var form = $('.m-payment-form, .m-promo-form, .m-gc-form');
    var button = form.find('button');
    var input = form.find('.e-text__input').first();
    var btnClass = 'a-btn--form--inactive';

    input.on('keyup change', function () {
        var val = $(this).val();
        if (val.trim().length > 0) {
            button.removeClass(btnClass).prop('disabled', false);
        } else {
            button.addClass(btnClass).prop('disabled', true);
        }
    });
});

$(function () {
    window.wsApp.initPCP();
});


function productSlider() {

    //remove active class from all thumbnail slides
    $('.product-container__thumbnails .slick-slide').removeClass('slick-active');

    //set active class to first thumbnail slides
    $('.product-container__thumbnails .slick-slide').eq(0).addClass('slick-active');

    // On before slide change match active thumbnail to current slide
    $('.product-container').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var mySlideNumber = nextSlide;
        $('.product-container__thumbnails .slick-slide').removeClass('slick-active');
        $('.product-container__thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
    });

    //UPDATED

    $('.product-container').on('afterChange', function (event, slick, currentSlide) {
        $('.content[data-id=' + (currentSlide + 1) + ']').show();
        $('.product-container__video').each(function () {
            $('video.product-container__video').trigger('pause');
        });
        $('.slick-active .product-container__video').each(function () {
            $('video.product-container__video').trigger('play');
        });
    });
}

function keyboardBtnClick() {
    // Check to see if space or enter were pressed
    $('.product--meta__thumbnails .thumb').keypress(function (e) {
        var key = e.which;
        if (key === 13) {
            var $this = $(this);
            if (!$this.hasClass('unselectable') && !$this.hasClass('selected')) {
                updateCoreCommerce($this.children('img').attr('data-value'));
            }
        }
    });

    // VIDEO PLAY ICON
    $('.a-product-features__img--overlay .icon-video-play').keypress(function (e) {
        var key = e.which;
        if (key === 13) {
            $('.a-product-features__img--overlay, .a-product-features__img img').addClass('hide');
            $('.a-product-features__video').addClass('show');
            $('video.a-product-features__video').trigger('play');
        }
    });
}

function pdpClickFunctions() {
    var $quantitySelector = $('#quantity-selector');

    // TO DO: UPDATE EVERYTHING GOING ON HERE
    $('.product--meta__thumbnails .thumb').click(function () {
        var $this = $(this);
        if (!$this.hasClass('unselectable') && !$this.hasClass('selected')) {
            updateCoreCommerce($this.children('img').attr('data-value'));
        }
    });

    $('.product-container__thumbnails .product-container__image').click(function () {
        $('.product-container__thumbnails .product-container__image').removeClass('selected');
        $(this).addClass('selected');
    });

    $('.product-container__badge, .zoom__close').click(function () {
        $('.product--images').toggleClass('zoom');
        $('.o-header').toggleClass('nav--hidden');
        $('.promo-bar').toggleClass('nav--hidden');
        $('.product--meta__alert').toggleClass('hidden');
        $('.product-container').slick('setPosition');
    });

    $quantitySelector.on('change', function () {
	  updateInventoryMessages($(this));
    });

    $quantitySelector.on('input', function () {
	  if (this.value.length > 3) {
	       this.value = this.value.slice(0, 3);
	   }
    });

    $('.increment').on('click', function () {
        var $button = $(this);
        var $input = $button.parent().find('input');
        var oldValue = $input.val();

        if ($button.text() === "+") {
            var newVal = parseFloat(oldValue) + 1;

            //Prevent quantity input from exceeding 3 digits
            if ($quantitySelector.val() >= 999) {
    	  var newVal = 999;
            }
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 1) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        $input.val(newVal);
        $input.trigger('change');
    });

    var video = document.getElementById('benefits-video');
    if (video != null) {
        video.addEventListener('ended', myHandler, false);

    }
    function myHandler(e) {
        $('.a-product-features__img--overlay, .a-product-features__img img').removeClass('hide');
        $('.a-product-features__video').removeClass('show');
    }
}

function benefitAnimations() {
    if (window.innerWidth > 1080) {
    // TO DO: UPDATE TO USE GLOBAL WW VAR
    /* Check the location of each desired element */
        $('.m-feature__img').each(function (i) {
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height() + 200;

            /* If the object is completely visible in the window, fade it it */
            if (bottom_of_window > bottom_of_object) {
                $(this).addClass('show');
            }
        });

        /* Check the location of each desired element */
        $('.m-feature__description').each(function (i) {
            var bottom_of_object = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height() + 200;

            /* If the object is completely visible in the window, fade it it */
            if (bottom_of_window > bottom_of_object) {
                $(this).addClass('show');
            }
        });
    }
}

function backToTop() {
    /* Check the location of each desired element */
    $('.product--page').each(function (i) {
        var bottom_of_object = $(this).offset().top + $(this).outerHeight();
        var bottom_of_window = $(window).scrollTop() + $(window).height() + 200;
        if (bottom_of_window > bottom_of_object) {
            $('.a-btn--back-to-top').addClass('show');
        } else if (bottom_of_window < bottom_of_object) {
            $('.a-btn--back-to-top').removeClass('show');
        }
    });
}

$(window).scroll(function () {
    benefitAnimations();
    backToTop();
});

// // Product Card
// $('.o-block--related-product__slider').slick({
//   mobileFirst: true,
//   speed: 600,
//   fade: true,
//   cssEase: 'ease',
//   slidesToShow: 1,
//   lazyLoadBuffer: 0,
//   lazyLoad: 'ondemand',
//   dots: true,
//   responsive: [
//     {
//       breakpoint: 594,
//       settings: 'unslick'
//     }
//   ]
// })

function coreCommerceSliders() {
    if ($('.product-container')[0]) {
        var psv = new window.SliderView({el: $('.product-container'), sliderOpts: window.BROOKS_PRODUCT_CONTAINER_OPTIONS });
        psv.init();
    }

    var slideCount = $('.product-container__thumbnails img').length;
    var BROOKS_THUMB_OPTIONS = {
        slidesToShow: slideCount,
        dots: false,
        focusOnSelect: true,
        variableWidth: true,
        infinite: false,
        lazyLoadBuffer: 0,
        lazyLoad: 'ondemand',
        asNavFor: '.product-container'
    };

    if ($('#core-commerce .product-container__thumbnails')[0]) {
        if (slideCount) {
            var ts = new window.SliderView({el: $('#core-commerce .product-container__thumbnails'), sliderOpts: BROOKS_THUMB_OPTIONS });
            ts.init();
        }
    }
}

//Add the core commerce variation update helpers
var getCoreCommerceElement = function () {
    return $('#core-commerce');
};
var showCoreCommerceLoading = function () {
    getCoreCommerceElement().spinner().start();
};
var hideCoreCommerceLoading = function () {
    $.spinner().stop();
};
var initializeCoreCommerce = function () {
    window.wsPDP.init();
    if (window.Modernizr.touchevents) { return; }
    else {
        [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function (el) {
            if ($(el).parents('.cs-select')[0]) { return;
            } else {
                new window.SelectFx(el);
            }
        });
    }
};
var updateCoreCommerce = function (url) {
    showCoreCommerceLoading();

    window.app.product.updateVariations(url, $('.quantity-form').first(), function (response) {
        if (response) {
            // Replace Core Commerce HTML
            getCoreCommerceElement().replaceWith(response);

            // Re-Initialize Core Commerce
            initializeCoreCommerce();

            window.wsApp.init();

            var lazyImagesList = document.querySelectorAll('#core-commerce img[data-src]');
            lazyImagesList.forEach(function (image) {
                image.setAttribute('src', image.getAttribute('data-src'));
                image.removeAttribute('data-src');
            });
        }

        hideCoreCommerceLoading();
    });
};
var updateInventoryMessages = function ($input) {
    var $pid = $('#pid');
    if ($pid.val()) {
        window.app.product.getAvailability($pid.val(), $input.val(), function (data) {
            $('.product--meta__quantity-alert.qtymsg-notavailable').remove();
            var $addToCart = $('#add-to-cart');
            $addToCart.removeClass('a-btn--primary--inactive');
            $addToCart.prop("disabled", false);

            if (data) {
        	if (!data.isAvailable) {
    			if (data.inStock || data.status === "PREORDER") {
	              $('.quantity-form').before('<p class="product--meta__quantity-alert x-small qtymsg-notavailable" tabindex="0">' + window.app.resources.REMAIN_NOT_AVAILABLE + '</p>');
	            } else {
	              $('.quantity-form').before('<p class="product--meta__quantity-alert x-small qtymsg-notavailable" tabindex="0">' + window.app.resources.NOT_AVAILABLE + '</p>');
	            }
        		$addToCart.addClass('a-btn--primary--inactive');
        		$addToCart.prop("disabled", true);
                }
            }
        });
    }
};

$(document).ready(function () {
    window.lazyloadVanilla($('#core-commerce'));

    /**************************/
    /* ADDITIONAL SLIDERS */
    /**************************/

    if ($('#testimonial__slider')[0]) {
    // var sv1 = new SliderView({el: $('#testimonial__slider'), sliderOpts: BROOKS_OPTIONS });
    // sv1.init();
    }
    if ($('#benefits__slider')[0]) {
        var sv2 = new window.SliderView({el: $('#benefits__slider'), sliderOpts: window.BROOKS_ALT_OPTIONS });
        sv2.init();
    }
    if ($('.section--benefits')[0]) {
        window.lazyloadVanilla($('.section--benefits'));
    }

    var logoCount = $('.logo__row .logo').length;
    var LOGO_OPTS = {
        slidesToShow: logoCount,
        asNavFor: '#testimonial__slider',
        focusOnSelect: true,
        variableWidth: true,
        responsive: [
            {
                breakpoint: 768,
                settings: 'unslick'
            }
        ]
    };

    /**************************/
    /* CORE COMMERCE SLIDERS  */
    /**************************/

    coreCommerceSliders();
    productSlider();
    pdpClickFunctions();
    keyboardBtnClick();

    $('.to-top').on('click', function (e) {
        e.preventDefault();
        console.log('to top');
    });

    // Add additional Core Commerce variation event listeners
    $(document).on('change', '.product--meta__selects-item select', function (e) {
	  var $this = $(e.currentTarget);

	  updateCoreCommerce($this.val());
    }).on('click', '#add-to-cart', function (e) {
	  var $this = $(e.currentTarget);
	  var $form = $('.quantity-form').first();
	  var $alerts = $('.product--meta__quantity-alert');

	  if (!$this.hasClass('a-btn--primary--inactive') && window.app.product.validateUpdateCart($form, $alerts)) {
            window.app.product.updateCart($form, $alerts, function (response) {
			  if (response) {
				  $(document.body).trigger('product:afterAddToCart', response);
			  }
		  });
	  }
    });

});

// eslint-disable-next-line no-unused-vars
function ProductGridView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$gridItems = this.opts.gridItems;
    this.$gridToggle = this.el.find('.grid-icon-container');
    this.$listToggle = this.el.find('.list-icon-container');

    var self = this;
    var resizeHandler = window.throttle(function () {
        window._requestAnimationFrame(self.resize);
    }, 17);

    if (window.addEventListener) {
        addEventListener('resize', resizeHandler, false);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', resizeHandler);
    } else {
        window.onresize = resizeHandler;
    }

    this.init = function () {
        this.$gridItems.each(function () {
            var productCard = new window.BR_ProductCard({
                el: $(this)
            });
            productCard.init();
        });

        this.bindUIActions();
        this.resize();
        var encodedCookie = this.readCookie('ss_bestMatches');
        this.getBestMatches(encodedCookie);
        this.updateMatchAnalyticsData(encodedCookie, 'shoeFinder');
        encodedCookie = this.readCookie('braFinderBestMatches');
        this.getBestMatches(encodedCookie);
        this.updateMatchAnalyticsData(encodedCookie, 'braFinder');
    };

    this.bindUIActions = function () {
        self = this;
        this.$gridToggle.on('click', function (e) { self.toggleView(e); });
        this.$listToggle.on('click', function (e) { self.toggleView(e); });

        $('.compare-tool').on('click', function (e) { self.compareinit(e); });
    };

    // eslint-disable-next-line complexity
    this.readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    this.decodeCookie = function (encodedCookie) {
        if (encodedCookie) {
            return JSON.parse(atob(encodedCookie));
        }

        return encodedCookie;
    };

    this.getBestMatches = function (encodedCookie) {
        if (encodedCookie)
        {
            var data = this.decodeCookie(encodedCookie);
            $('.m-match-badge').each(function (index, item) {
                var productID = $(item).data('product-id').toString();
                if (data.indexOf(productID) !== -1)
                {
                    $(item).show();
                }
            });
        }
    };

    this.getMatchAnalyticsDataAttribute = function (matchType) {
        if (matchType === 'shoeFinder') {
            return 'data-product-shoe-finder-results-flag';
        }
        if (matchType === 'braFinder') {
            return 'data-product-bra-finder-results-flag';
        }

        return undefined;
    };

    this.updateMatchAnalyticsData = function (encodedCookie, matchType) {
        if (encodedCookie)
        {
            var data = this.decodeCookie(encodedCookie);

            var dataAttribute = this.getMatchAnalyticsDataAttribute(matchType);

            if (dataAttribute !== undefined) {
                $('[data-product-style-id]').each(function (index, item) {
                    var productID = $(item).data('product-style-id').toString();
                    if (data.indexOf(productID) !== -1)
                    {
                        $(item).attr(dataAttribute, 'true');
                    }
                });
            }
        }
    };

    this.toggleView = function (e) {
        self = this;
        if ($(e.currentTarget).hasClass('grid-icon-container')) {
            self.$listToggle.removeClass('active');
            $(e.currentTarget).addClass('active');
            self.el.removeClass('list-view');
            self.$gridItems.removeClass('wide');

            // self.sliderResize();
            // setTimeout(function() {
            self.resize();

            // }, 350)
        } else {
            self.$gridToggle.removeClass('active');
            $(e.currentTarget).addClass('active');
            self.el.addClass('list-view');
            self.$gridItems.addClass('wide');

            // self.sliderResize();
            self.resize();
        }
    };

    this.resize = function () {
    // iterate through each grid item and assign a height property based off of its content
        var mh = -10000;
        var h = 0;
        self.$gridItems.each(function () {
            if ($('.product__box').hasClass('promo') && !$('.category__grid-items').hasClass('list-view')) {
                h = $(this).find('.product__box').outerHeight() - $(this).find('.x-small--blue').outerHeight();
            } else {
                h = $(this).find('.product__box').outerHeight();
            }
            if (h > mh) {
                mh = h;
            }
        }).height(mh);

        $(window).trigger('resize');
        var cardHeight = $(this).find('.product__card--wrapper').outerHeight();
        $('.category__featured-container__meta').height((mh) - 111.23);
        if ($('.category__grid-items ').hasClass('list-view')) {
            $('.category__featured-container__meta').height(mh);
        }
    };

    this.sliderResize = function () {
        console.log('inside slider resize');

    // TODO: figure out cleaner way of recalculating current slide when toggling grid views
    // console.log($(window));
    };

    this.compareinit = function () {
        $('.category__grid-items').toggleClass('compare');
    };
}

var progress = document.querySelectorAll(".c-progress");

[].forEach.call(progress, function (el) {
    el.classList.add("start");
    setTimeout(function () { 
        el.classList.remove("start"); 
        el.classList.add("anim") ;
    }, 10);
});

/*------------------------------------*\
    Select Items to Return js
\*------------------------------------*/
/* eslint-disable complexity */
$('.create-return-page div.site-checkbox__wrapper').on("click", function (e) {
    var checkbox = $(this).find('input.e-input__checkbox');
    var button = document.getElementById('generate-label-button');
    var select = $(this).closest('.return-item').find('.reason select')[0];
    checkbox.trigger('change');
    var checkboxIndex = checkbox.val();

    if (isCheckboxChecked(checkbox)) {
        addSpecialFocus(select);
    } else if (atLeastOneOtherCheckboxAndSelectIsValid(checkboxIndex)) {
        window.enableButton(button);
    } else if (!isCheckboxChecked(checkbox) && isSelectPopulated(select) && !atLeastOneOtherCheckboxAndSelectIsValid(checkboxIndex)) {
        window.disableButton(button);
    }
});


$('.create-return-page .reason select').on("change", function () {
    var button = document.getElementById('generate-label-button');
    /* eslint-disable no-unused-vars */
    var li = $(this).closest('.return-item')[0].classList.add('selected');
    window.enableButton(button);
});

function isCheckboxChecked(checkbox) {
    return checkbox.is(':checked');
}

function isSelectPopulated(checkbox) {
    var select = $(checkbox).closest('.return-item').find('.reason select')[0];

    return select.value > 0;
}

function atLeastOneOtherCheckboxAndSelectIsValid(index) {
    var checkboxList = document.getElementsByClassName('e-input__checkbox');
    var valid = false;
    for (var i = 0; i < checkboxList.length; i++) {
        if (i !== index) {
            if (checkboxList[i].checked === true && isSelectPopulated(checkboxList[i])) {
                valid = true;
            }
        }
    }
    return valid;
}

function addSpecialFocus(element) {
    element.focus();
    element.classList.add("special-focus");
}

/* eslint-disable no-unused-vars */
function removeSpecialFocus(element) {
    element.classList.remove("special-focus");
    element.blur();
}

$('#create-return').on("submit", function () {
    return window.validateForm();
});


/**
 * On click scroll to the bottom of itself.
 * Use data-reference for the parent HTML tag, and data-arrow to match. They should be identical
 * */

// eslint-disable-next-line no-unused-vars
function scrollToElement() {
    var arrowsAvailable = document.querySelectorAll('.js-scroll-to-next');

    arrowsAvailable.forEach(function (arrow) {
        var arrowReference = arrow.dataset.arrow;
        var elem = document.querySelector('[data-reference=' + arrowReference + ']');

        function scrollAction(speed) {
            var elemParams = elem.getBoundingClientRect();
            var scrollTop = window.scrollY || document.documentElement.scrollTop;
            var value = elemParams.bottom + scrollTop;
            
            $("html, body").animate({ scrollTop: value }, speed, function () {
                arrow.blur();
                elem.nextElementSibling.focus();
            });
        }

        /* eslint-disable no-undef */
        arrow.addEventListener('click', debounce(function (ev) {
            ev.preventDefault();

            scrollAction(800);
        }, 100));

        // eslint-disable-next-line complexity
        arrow.addEventListener('keydown', debounce(function (ev) {
            var isHeroProductArrow = ev.target.classList.contains('o-hero--product__arrow-link');
            ev.preventDefault();
            
            // Enter or space for voice over accesibility
            if (ev.keyCode === 13 || ev.keyCode === 32) {
                scrollAction(800);
            }
            
            if (ev.keyCode === 9 && isHeroProductArrow) {
                scrollAction(0);
            }  
        }, 100));
    });
}
/* eslint-disable no-unused-vars */
function SearchView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.$headerMolecules = $('.o-header');
    this.promoActive = false;
    this.$searchForm = $('.o-header__search-form');
    this.$searchInput = this.$searchForm.find('.site-search .o-header__search');
    var self = this;
    $(window).on('resize', function () {
        self.resize();
    });
    this.init = function () {
        this.bindUIActions();
        this.checkPromoBar();
    };

    this.bindUIActions = function () {
        self = this;
        $('body').on('click', '.btn-search, .search-close, .shadow-overlay:not(".cart-overlay"), .search--trigger', function (e) { self.toggle(e); });
        $('.icon-search-button').click(function () {
            $('input.search-submit').trigger('click');
        });
        /* eslint-disable complexity */
        document.onkeydown = function (e) {
            e = e || window.event;
            switch (e.which || e.keyCode) {

                case 27: // esc
                    $('.o-header__search-form.active .search-close').trigger('click');
                    break;

                default: return; // exit this handler for other keys
            }
        };
    };


    this.checkPromoBar = function () {
        if ($('.promo-bar.active')[0]) {
            this.promoActive = true;
        } else {
            this.promoActive = false;
        }
    };

    /* eslint-disable complexity */
    this.resize = function () {

        if (window.innerWidth >= window.WS.Breakpoints.tabletLg) {
            // this.$searchForm.css('top', '50%');
        } else {

            if ($('.o-header.nav-down')[0] || $('.o-header.nav-up')[0]) {
                this.$searchForm.css('top', '0');
            } else {
                var promoHeight = $('.promo-bar.active').height();
                this.$searchForm.css('top', promoHeight);

            }

        }
    };

    /* eslint-disable complexity */
    this.toggle = function (e) {
        self = this;
        var nav = $('.o__header');
        self.checkPromoBar();
        var ww = window.innerWidth;
        if ($('.o-header__search-form').hasClass('active')) {
            setTimeout(function () {
                // $(self.el).removeClass('search-animate');
                $(self.el).removeClass('search-active');
                $('.nav__container').removeClass('search-active');
            }, 100);
            nav.removeClass('search-animate');
            nav.removeClass('search-active');

            // remove focus state from input
            self.$searchInput.blur();
            $('.o-header__search-form').removeClass('active');
            $('.shadow-overlay').removeClass('show');
            $('.o-header__search').val('');
            $('body').removeClass('no-scroll');
        } else {
            $('.shadow-overlay').addClass('show');
            $('body').addClass('no-scroll');
            nav.addClass('search-animate');

            // add focus state to input after you open the search bar
            self.$searchInput.focus();
            $('.o-header__search-form').addClass('active');
            if (ww <= window.WS.Breakpoints.tabletLg) {
                var promoHeight = $('.promo-bar.active').height();
                if (self.promoActive === true) {
                    if ($('.o-header.nav-down')[0]) {
                        this.$searchForm.css('top', '0');
                    } else {
                        this.$searchForm.css('top', promoHeight);
                    }
                } else {
                    this.$searchForm.css('top', '0');
                }
            }


            setTimeout(function () {
                // $(self.el).removeClass('search-animate');
                $(self.el).addClass('search-active');
                $('.nav__container').addClass('search-active');

            }, 400);
        }
    };
}


/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
function SliderView(opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.sliderOpts = this.opts.sliderOpts;
    this.hoverSwap = this.opts.hoverSwap || false;
    this.clickSlideToAdvance = this.opts.clickSlideToAdvance || false;
    this.overlayEl = this.opts.overlayEl || '';
    var self = this;

    this.goToSlickIndex = function (index) {
        this.el.slick('slickGoTo', index);
    };

    /**
     * Adds tabIndex of -1 to all hidden links in
     * @param {*} event
     * @param {*} slick
     */
    var hideHiddenAnchors = function (event, slick) {
        var hiddenLinks = slick.$slider[0].querySelectorAll('.slick-slide[aria-hidden="true"] a');
        var allLinks = slick.$slider[0].querySelectorAll('.slick-slide a');

        allLinks.forEach(function (element) {
            element.removeAttribute('tabindex');
        });

        hiddenLinks.forEach(function (tile) {
            tile.setAttribute('tabindex', -1);
        });
    };

    this.el.on('init afterChange', hideHiddenAnchors);

    this.changeButtonState = function (btn) {
        var thisCurrentSlide = $(this.el).slick('slickCurrentSlide');
        $(btn).removeClass('btn-n--active btn-n--pulse');
        $(btn).each(function () {
            if ($(this).data('slickIndex') === thisCurrentSlide) {
                $(this).addClass('btn-n--active').next().addClass('btn-n--pulse');
            }
        });
    };


    var resizeHandler = window.throttle(function () {
        window._requestAnimationFrame(self.resize);
    }, 17);

    if (window.addEventListener) {
        addEventListener('resize', resizeHandler, false);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', resizeHandler);
    } else {
        window.onresize = resizeHandler;
    }
    this.init = function () {
        this.initSlider();
        this.bindUIActions();
        if (this.hoverSwap) {
            this.bindHoverSwap();
        }
        if (this.clickSlideToAdvance) {
            this.bindClickSlideToAdvance();
        }
    };

    this.bindUIActions = function () {
        var tapped = false;
        $(".product-container__thumbnails a").on("touchstart", function (e) {
            if (!tapped) { //if tap is not set, set up single tap
                tapped = setTimeout(function () {
                    tapped = null;

                    //insert things you want to do when single tapped
                    e.preventDefault();
                    var $this = $(e.currentTarget);
                    var $parentBox = $this.parents('.product__box');
                    if ($this.data('swap')) {
                        var img = $parentBox.find('.card__slider img');

                        img.attr('src', $this.data('swap'));

                    }
                }, 300); //wait 300ms then run single click code
            } else { //tapped within 300ms of last tap. double tap
                clearTimeout(tapped); //stop single tap callback
                tapped = null;

                //insert things you want to do when double tapped
            }

        });
        $('.product-container__thumbnails a').on('click', function (e) {


        });
    };

    this.bindHoverSwap = function () {
        self.productType = $(self.el).parents('.product__box').data('type');

        self.preselectFirstThumbnail();
        if (self.productType === 'apparel') {
            $('.product-container__thumbnails img').on('mouseover', function (e) {


                e.preventDefault();
                var $this = $(e.currentTarget);
                var $parentBox = $this.parents('.product__box');

                if ($this.data('swap')) {
                    var img = $parentBox.find('.product__card--bra a');
                    $this.parents('.product-container__thumbnails').find('img.active').removeClass('active');
                    $this.addClass('active');
                    img.attr('style', 'background-image:url(' + $this.data('swap') + ')');

                }
            });
        } else {

            $('.product-container__thumbnails img').on('mouseover', function (e) {


                e.preventDefault();
                var $this = $(e.currentTarget);
                var $parentBox = $this.parents('.product__box');

                if ($this.data('swap')) {
                    var img = $parentBox.find('.card__slider img');
                    $this.parents('.product-container__thumbnails').find('img.active').removeClass('active');
                    $this.addClass('active');
                    img.attr('src', $this.data('swap'));

                }
            });
        }
    };

    this.bindClickSlideToAdvance = function () {
        var slider = this.el;
        slider.on('mouseover', '.slick-slide', function (e) {
            e.stopPropagation();
            var index = $(this).data("slick-index");
            var curr = slider.slick('slickCurrentSlide');
            if (slider.slick('slickCurrentSlide') !== index) {

                if (curr < index) {
                    $('.next').addClass('visible');
                } else if (curr > index) {
                    $('.prev').addClass('visible');
                }
            }
        });
        slider.on('mouseout', '.slick-slide', function (e) {
            e.stopPropagation();
            var index = $(this).data("slick-index");
            if (slider.slick('slickCurrentSlide') === index) {
                $('.prev, .next').removeClass('visible');
            }
        });
        $('.next').on('mouseover', function (e) {
            e.stopPropagation();
            var curr = slider.slick('slickCurrentSlide');
            var item = curr + 1;
        }).on('mouseout', function (e) {
            e.stopPropagation();
            var curr = slider.slick('slickCurrentSlide');
            var item = curr + 1;
        });
        $('.prev').on('mouseover', function (e) {
            e.stopPropagation();
            var curr = slider.slick('slickCurrentSlide');
            var item = curr - 1;
        }).on('mouseout', function (e) {
            e.stopPropagation();
            var curr = slider.slick('slickCurrentSlide');
            var item = curr - 1;
        });

        slider.on('click', '.slick-slide', function (e) {
            e.stopPropagation();
            var index = $(this).data("slick-index");
            if (slider.slick('slickCurrentSlide') !== index) {
    	  slider.slick('slickGoTo', index);
            }
        });
    };

    this.initSlider = function () {
        var sliderNotInit = this.el.not('.slick-initialized');
        if (this.sliderOpts !== undefined && sliderNotInit) {
            sliderNotInit.slick(this.sliderOpts);
        }

    };

    this.resize = function () {
        self.el.slick('resize');
    };

    this.preselectFirstThumbnail = function () {
        $('.product-container__thumbnails').each(function () {
            var thumbnails = $(this).find('img');

            if (thumbnails.filter('active').length === 0) {
                thumbnails.first().addClass('active');
            }
        });
    };

    // Add counter feature to carousel
    if (this.sliderOpts.counter) {
        var currentSlide;
        var slidesCount;
        var $currentSlide = this.el[0].parentElement.querySelector('.m-carousel-controls__currentSlide');
        var $totalSlides = this.el[0].parentElement.querySelector('.m-carousel-controls__totalSlides');

        var updateSliderCounter = function (slick) {
            if ($currentSlide && $totalSlides) {
                currentSlide = slick.slickCurrentSlide() + 1;
                slidesCount = slick.slideCount;
                $currentSlide.textContent = currentSlide;
                $totalSlides.textContent = slidesCount;
            }
        };

        this.el.on('init', function (event, slick) {
            updateSliderCounter(slick);
        });

        this.el.on('afterChange', function (event, slick) {
            updateSliderCounter(slick, currentSlide);
        });
    }
}

// OPTIONS VARIABLES for sliders
var BROOKS_PRODUCT_CONTAINER_OPTIONS = {
    accessibility: false,
    speed: 600,
    cssEase: 'ease',
    fade: false,
    dots: false,
    arrows: false,
    slide: '*:not(script)',
    slidesToShow: 1,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    responsive: [
        {
            breakpoint: 975,
            settings: {
                asNavFor: '.product-container__thumbnails',
                dots: true,
            }
        }
    ]
};

var BROOKS_IMAGE_SLIDER_OPTIONS = {
    mobileFirst: true,
    speed: 600,
    arrows: false,
    cssEase: 'ease',
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    dots: true,
    centerMode: true,
    centerPadding: '30px',
    slide: '*:not(script)',
    slidesToShow: 1,
    infinite: false,
    responsive: [
        {
            breakpoint: 594,
            accessibility: false,
            settings: 'unslick'
        }
    ]
};

var BROOKS_PCP_OPTIONS = {
    speed: 600,
    fade: true,
    cssEase: 'ease',
    slide: '*:not(script)',
    slidesToShow: 1,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    dots: false,
    arrows: false,
};

var BROOKS_ALT_OPTIONS = {
    accessibility: false,
    mobileFirst: true,
    speed: 600,
    cssEase: 'ease',
    slide: '*:not(script)',
    slidesToShow: 1,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    dots: true,
    arrows: false,
    variableHeight: true,
    responsive: [

        {
            breakpoint: 768,
            settings: 'unslick'
        }

    ]
};

var BROOKS_OPTIONS = {
    accessibility: false,
    mobileFirst: true,
    speed: 600,
    fade: true,
    cssEase: 'ease',
    slide: '*:not(script)',
    slidesToShow: 1,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    dots: true,
    arrows: false,
    responsive: [
        {
            breakpoint: 767,
            settings: {
                dots: false,
                asNavFor: '.logo__row',
            }
        }
    ]
};

var BROOKS_COLLECTION_GALLERY_OPTIONS = {
    accessibility: true,
    speed: 600,
    slide: '*:not(script)',
    dots: true,
    arrows: true,

    // slidesToScroll: 1,
    variableWidth: true,

    // variableHeight: true,
    centerMode: true,
    centerPadding: '30px',
    prevArrow: '<div class="prev"><svg class="icon icon-arrow-circle"><use xlink:href="#icon-arrow-circle"></use></svg></div>',
    nextArrow: '<div class="next"><svg class="icon icon-arrow-circle"><use xlink:href="#icon-arrow-circle"></use></svg></div>',

    responsive: [
        {
            breakpoint: 768,
            settings: {
                arrows: false,
                slidesToShow: 1,
                centerMode: false,
                variableWidth: false,
                variableHeight: false,
                infinite: true,
                dots: true


                // adaptiveHeight: true
            }
        }
    ]
};

var BROOKS_COLLECTION_GRID_SLIDER_OPTIONS = {
    mobileFirst: true,
    speed: 600,
    cssEase: 'ease',
    slide: '*:not(script)',
    slidesToShow: 1.2,
    centerMode: true,
    centerPadding: '0px',
    infinite: false,
    dots: true,
    arrows: false,
    responsive: [
        {
            breakpoint: 594,
            settings: 'unslick'
        }
    ]
};

var BROOKS_SHOP_LOOK_SLIDER_OPTIONS = {
    mobileFirst: true,
    speed: 600,
    arrows: false,
    cssEase: 'ease',
    dots: false,
    slide: '*:not(script)',
    slidesToShow: 1.95,
    slidesToScroll: 1,
    infinite: false,
    responsive: [
        {
            breakpoint: 975,
            settings: {
                dots: false,
                arrows: true,
                slidesToShow: 3.26,
                slidesToScroll: 3
            }
        }
    ]
};

var BROOKS_INTERACTIVE_COLLECTION_GROUP_OPTIONS = {
    accessibility: true,
    arrows: false,
    cssEase: 'ease',
    dots: true,
    draggable: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    focusOnSelect: true,
    infinite: true,
    speed: 600,
};

var BROOKS_PRODUCT_CAROUSEL_OPTIONS = {
    accessibility: false,
    speed: 600,
    cssEase: 'ease',
    fade: false,
    dots: false,
    arrows: true,
    slide: '*:not(script)',
    slidesToShow: 3,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    prevArrow: document.querySelector('.m-carousel-controls__button--left'),
    nextArrow: document.querySelector('.m-carousel-controls__button--right'),
    responsive: [
        {
            breakpoint: 975,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

var BROOKS_GEAR_HIGHLIGHT_OPTIONS = {
    accessibility: false,
    speed: 600,
    cssEase: 'ease',
    fade: false,
    dots: false,
    counter: true,
    arrows: true,
    slide: '*:not(script)',
    slidesToShow: 1,
    lazyLoadBuffer: 0,
    lazyLoad: 'ondemand',
    responsive: [
        {
            breakpoint: 975,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
};

/* eslint-disable complexity */
function singleOrNull(items) {
    if (items && items.length && items.length === 1) {
        return items[0];
    }
    return null;
}

function positionSocialMediaShare() {
    var social = singleOrNull(document.getElementsByClassName('o-social-media-share'));
    if (!social) {
        return;
    }

    // eslint-disable-next-line no-undef
    var breakpointMinimumWidthForSticky = WS.Breakpoints.tablet;
    var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (viewportWidth < breakpointMinimumWidthForSticky) {
        social.classList.remove('o-social-media-share--absolute', 'o-social-media-share--fixed');
        social.style.top = 'unset';
        return;
    }

    var hero = singleOrNull(document.getElementsByClassName('o-hero--basic'));
    if (!hero) {
        return;
    }
    var offsetFromBottomOfHero = 62;
    var defaultSocialTop = 675;
    var socialTop = hero ? hero.offsetTop + hero.offsetHeight + offsetFromBottomOfHero : defaultSocialTop;
    var nextSibling = social.nextElementSibling || social.parentNode.nextElementSibling;

    social.classList.add('o-social-media-share--absolute');
    social.classList.remove('o-social-media-share--fixed');
    social.style.top = socialTop + 'px';

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            var heroEntry = entries.find(function (entry) { return entry.target === hero; });
            var heroVisible = heroEntry ? heroEntry.isIntersecting : false;
            var nextSiblingEntry = entries.find(function (entry) { return entry.target === nextSibling; });
            var nextSiblingVisible = nextSiblingEntry ? nextSiblingEntry.isIntersecting : false;

            if (!heroVisible && !nextSiblingVisible) {
                if (!social.classList.contains('o-social-media-share--fixed') && window.scrollY < nextSibling.offsetTop) {
                    social.classList.remove('o-social-media-share--absolute');
                    social.classList.add('o-social-media-share--fixed');
                    social.style.top = offsetFromBottomOfHero + 'px';
                }
            } else {
                if (!social.classList.contains('o-social-media-share--absolute')) {
                    social.classList.add('o-social-media-share--absolute');
                    social.classList.remove('o-social-media-share--fixed');
                    social.style.top = (heroVisible ? socialTop : window.scrollY + offsetFromBottomOfHero) + 'px';
                }
            }
        });

        observer.observe(hero);
        observer.observe(nextSibling);
    }
}

var resizeTimer;

function debouncePositionSocialMediaShare() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionSocialMediaShare, 250);
}

document.addEventListener("DOMContentLoaded", function () {
    positionSocialMediaShare();
    $(window).resize(debouncePositionSocialMediaShare);
});

// eslint-disable-next-line no-unused-vars
var ToolTipView = function (opts) {
    this.opts = opts;
    this.el = this.opts.el;
    this.tooltip = null;
    this.guid = null;
    this.isOpen = false;

    this.init = function () {
        // Create unique target for each tooltip
        this.guid = window.WS.guid();
        $('body').append('<div id="' + this.guid + '" class="" title=""></div>');

        this.bindUIActions();
    };

    this.bindUIActions = function () {
        var self = this;
        this.el.on('click', function (e) {
            self.show(e);
        });
        this.el.keypress(function (e) {
            var key = e.which;
            if (key === 13) {
                self.show(e);
            }
        });
    };

    // eslint-disable-next-line no-unused-vars
    this.hide = function (e) {
        this.tooltip.find('.close__icon').removeAttr('tabindex');
        this.tooltip.tooltip('destroy');
        this.isOpen = false;
    };

    this.show = function (e) {
        if ($(".ui-tooltip").length > 0) {
            $(".ui-tooltip").find('.close__icon').click();
        }

        if (!this.isOpen) {

            this.tooltip = $('#' + this.guid).tooltip(this.setOptions(e.currentTarget)); // setOptions needs to be used within tooltip to get access to tooltip UI object
            this.tooltip.trigger('mouseenter');
            this.isOpen = true;

            this.addWindowResizeListener();
        }
    };

    this.addWindowResizeListener = function () {
        var self = this;

        $(window).on('resize', function (e) {
            self.hide(e);
            $(window).off('resize');
        });
    };

    this.setOptions = function (currentTarget) {
        var self = this;
        var options = {
            content: $('<div />').append($(currentTarget).find('.tooltip__content').clone().removeClass('v--hidden')).html(),
            open: function (e, ui) {
                $(ui.tooltip).find('.close__icon')
                    .attr('tabindex', 0)
                    .focus()
                    .on('click', {'event': e, 'self': self}, self.handleCloseClickEvent)
                    .on('keypress', {'event': e, 'self': self}, self.handleKeypressEvent);
            }
        };

        if (window.innerWidth >= window.WS.Breakpoints.tablet) {
            options.position = {
                of: $(currentTarget),
                my: 'center bottom-10',
                at: 'center top',
                collision: 'flipfit flip'
            };
        } else {
            options.position = {
                of: $(window),
                my: 'left bottom',
                at: 'left bottom'
            };
        }
        return options;
    };

    this.handleCloseClickEvent = function (e) {
        e.data.self.hide(e.data.event);
    };

    this.handleKeypressEvent = function (e) {
        var key = e.which;

        // the enter key code
        if (key === 13) {
            e.data.self.hide(e);
        }
    };
};

// TODO: Refactor hideOverlay and showOverlay

var VideoPlayer = function (configs) {
    this.configs = configs;
    this.$el = $(this.configs.el);
    this.$fluidEl = this.$el.find('.videoWrapper'); // will be used to set the height and width of the iframe
    this.$videoEl = this.$el.find('iframe');
    this.$playBtn = this.$el.find('.play__btn');
    this.videoId = this.setVideoId();
    this.guid = window.WS.guid();
    this.player;
};

// BEGIN CONVENIENCE FUNCTIONS
VideoPlayer.prototype.getVideoLink = function () {
    return this.$el.find('a.js-watch-video');
};

VideoPlayer.prototype.setVideoId = function () {
    console.log('VideoPlayer.setVideoId must be overridden by implementing class');
};

VideoPlayer.prototype.getVideoId = function () {
    return this.videoId;
};

// END CONVENIENCE FUNCTIONS

// BEGIN HIDE/SHOW FUNCTIONS
VideoPlayer.prototype.showOverlay = function () {
    this.$el.find('.m-block--video-player--overlay, img').removeClass('hide');
    this.$el.find('.a-product-features__video').removeClass('show');
};

VideoPlayer.prototype.hideOverlay = function () {
    this.$el.find('.m-block--video-player--overlay, img').addClass('hide');
    this.$el.find('.a-product-features__video').addClass('show');
};

// END HIDE/SHOW FUNCTIONS

VideoPlayer.prototype.enhance = function () {
    console.log('VideoPlayer.enhance must be overridden by implementing class');
};

VideoPlayer.prototype.resize = function () {
    var newWidth = this.$fluidEl.width();
    this.$videoEl
        .width(newWidth)
        .height(newWidth * this.$videoEl.attr('data-aspectRatio'));
};

// BEGIN EVENT HANDLER FUNCTIONS
VideoPlayer.prototype.onEnd = function () {
    this.showOverlay();
};

VideoPlayer.prototype.onPlay = function () {};

VideoPlayer.prototype.onPause = function () {};

VideoPlayer.prototype.onBuffer = function () {};

VideoPlayer.prototype.onCued = function () {};

// END EVENT HANDLER FUNCTIONS

// BEGIN INIT FUNCTIONS
VideoPlayer.prototype.play = function () {
    this.hideOverlay();
};

VideoPlayer.prototype.bindUIActions = function () {
    var self = this;

    self.$playBtn.on('click', function () {
        self.play();
    });
};

VideoPlayer.prototype.initPlayer = function () {
    console.log('VideoPlayer.initPlayer must be overridden by implementing class');
};

VideoPlayer.prototype.init = function () {
    this.enhance();
    this.resize();
    this.bindUIActions();
    this.initPlayer();

    var self = this;
    var resizeHandler = window.throttle(function () {
        window._requestAnimationFrame(function () {
            self.resize();
        });
    }, 17);

    if (window.addEventListener) {
        addEventListener('resize', resizeHandler, false);
    } else if (window.attachEvent) {
        window.attachEvent('onresize', resizeHandler);
    } else {
        window.onresize = resizeHandler;
    }
};

// END INIT FUNCTIONS

var YouTubePlayer = function (configs) {
    VideoPlayer.call(this, configs);
    this.libraryLoaded = false;
};
YouTubePlayer.prototype = Object.create(VideoPlayer.prototype);

// BEGIN OVERRIDES OF VideoPlayer FUNCTIONS
YouTubePlayer.prototype.setVideoId = function () {
    var $a = this.getVideoLink();
    if ($a) {
        function getURLParameter(url, name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=([^&;]+?)(&|#|;|$)').exec(url) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        }

        return getURLParameter(this.getVideoLink().attr('href'), 'v');
    }
    return $a;
};

YouTubePlayer.prototype.enhance = function () {
    var $a = this.getVideoLink();
    $a.after('<iframe id="' + this.guid + '" class="product-container__video-youtube" data-id="' + this.getVideoId() + '" src="https://www.youtube.com/embed/' + this.getVideoId() + '?enablejsapi=1&rel=0&loop=1&showinfo=0" frameborder="0"></iframe>');
    $a.remove();

    this.$videoEl = this.$el.find('#' + this.guid);
    this.loadPlayerLibrary();
};

/* eslint-disable complexity */
YouTubePlayer.prototype.play = function () {
    this.hideOverlay();

    if (this.libraryLoaded && this.player && this.player.playVideo) {
        this.$videoEl.addClass('active');
        this.player.playVideo();
    }
};

YouTubePlayer.prototype.initPlayer = function () {
    if (this.libraryLoaded) {
        var self = this;

        self.player = new window.YT.Player(self.guid, {
            playerVars: {
                controls: 0
            },
            events: {
                onStateChange: function (event) {
                    self.onPlayerStateChange(event);
                }
            },
            videoId: self.getVideoId()
        });
    }
};

// END OVERRIDES OF VideoPlayer FUNCTIONS

// BEGIN YouTubePlayer FUNCTIONS
YouTubePlayer.prototype.onPlayerStateChange = function (event) {
    switch (event.data) {
        case window.YT.PlayerState.ENDED:
            this.onEnd();
            break;
        case window.YT.PlayerState.PLAYING:
            this.onPlay();
            break;
        case window.YT.PlayerState.PAUSED:
            this.onPause();
            break;
        case window.YT.PlayerState.BUFFERING:
            this.onBuffer();
            break;
        case window.YT.PlayerState.CUED:
            this.onCued();
            break;
        default:
            break;
    }
};

YouTubePlayer.prototype.loadPlayerLibrary = function () {
    if (window.YT === undefined) {
        var self = this;

        var initialCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (typeof initialCallback === 'function') {
                initialCallback();
            }

            self.libraryLoaded = true;
            self.initPlayer();
        };

        //Append iframe API to head
        if (!document.getElementById("YouTubeIframeApi")) {
            $('head').append('<script src="https://www.youtube.com/iframe_api" id="YouTubeIframeApi"></script>');
        }
    }
};

// END YouTubePlayer FUNCTIONS

!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=22)}({0:function(e,t,n){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}n.r(t),n.d(t,"store",(function(){return r}));var r=new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var t,n,r;return t=e,(n=[{key:"setState",value:function(e){this._state=Object.assign(this._state,e)}},{key:"getStateValue",value:function(e){return this._state[e]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(e,t){this._subscribers[e]||(this._subscribers[e]=[]),this._subscribers[e].push(t)}},{key:"publish",value:function(e,t){this._subscribers[e]&&this._subscribers[e].forEach((function(e){return e(t)}))}}])&&i(t.prototype,n),r&&i(t,r),e}())},22:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return o}));var i=n(0);function r(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var o=function(){function e(t){var n=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._element=t,this._CLASSES={TRIGGER:"m-accordion__trigger",TRIGGER_EXPANDING:"m-accordion__trigger--expanding",TRIGGER_EXPANDED:"m-accordion__trigger--expanded",PANEL_EXPANDED:"m-accordion__panel--expanded"},this._triggers=t.querySelectorAll(".".concat(this._CLASSES.TRIGGER));var r=t.dataset.expanded;r&&this._toggleByIndex(r-1),this._triggers.forEach((function(e){e.addEventListener("click",n._addClickEvent.bind(n),!0),e.addEventListener("keydown",n._addKeyListener.bind(n))})),i.store.subscribe(i.store.topics.PCP_PROD_FILTERS_RESIZE,(function(e){n._toggleSection(e.trigger,!0,!0),n._expanded=null}))}var t,n,o;return t=e,(n=[{key:"_toggleByIndex",value:function(e){var t=this._triggers[e];this._toggleSection(t)}},{key:"_toggleSection",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=e.getAttribute("aria-controls"),o=document.getElementById(r);this._toggleTrigger(e,t),this._togglePanel(o,t),this._expanded=e,i.store.publish(i.store.topics.TOGGLE_ACCORDION,{panel:o,trigger:e}),n&&e.classList.remove(this._CLASSES.TRIGGER_EXPANDED)}},{key:"_addClickEvent",value:function(e){var t=e.target;t.classList.contains(this._CLASSES.TRIGGER_EXPANDED)?(this._toggleSection(t,!0),this._expanded=null):(t.blur(),this._expanded&&this._toggleSection(this._expanded,!0),this._toggleSection(t),setTimeout((function(){t.focus()}),300))}},{key:"_toggleTrigger",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];e.setAttribute("aria-expanded",!t),e.classList.toggle(this._CLASSES.TRIGGER_EXPANDED)}},{key:"_togglePanel",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];e.classList.toggle(this._CLASSES.PANEL_EXPANDED);var n=t?"0":"".concat(e.firstElementChild.offsetHeight,"px");e.setAttribute("style","--height: ".concat(n)),e.setAttribute("ie-style","--height: ".concat(n))}},{key:"_addKeyListener",value:function(e){var t=e.which.toString();this._bindUpDownKeys(e),this._bindHomeKey(t),this._bindEndKey(t)}},{key:"_bindUpDownKeys",value:function(e){var t=e.which.toString();if(/38|40/.test(t)||this._getCtrlModifier(e)){var n=this._getNewIndex(e.target,/38|40/.test(t));this._focusTrigger(n)}}},{key:"_bindHomeKey",value:function(e){36===e&&this._focusTrigger(0)}},{key:"_bindEndKey",value:function(e){35===e&&this._focusTrigger(this._triggers.length-1)}},{key:"_getCtrlModifier",value:function(e){var t=e.which.toString();return e.ctrlKey&&/33|34/.test(t)}},{key:"_getNewIndex",value:function(e,t){var n=Array.prototype.indexOf.call(this._triggers,e),i=this._triggers.length;return(n+i+(t?1:-1))%i}},{key:"_focusTrigger",value:function(e){this._triggers[e].focus()}}])&&r(t.prototype,n),o&&r(t,o),e}()}});
!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=19)}({19:function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}n.r(t),n.d(t,"default",(function(){return i}));var i=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._element=t,this._selectors={AMBIENT_VIDEO:".a-ambient-video__video",CTA:".a-ambient-video__cta"},this._video=this._element.querySelector(this._selectors.AMBIENT_VIDEO),this._button=this._element.querySelector(this._selectors.CTA),this._button.addEventListener("click",this._handleClick.bind(this))}var t,n,i;return t=e,(n=[{key:"_handleClick",value:function(){this._video.paused?this._video.play():this._video.pause(),this._element.classList.toggle("playing",!this._video.paused)}}])&&r(t.prototype,n),i&&r(t,i),e}()}});
!function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=13)}({0:function(t,e,n){"use strict";function r(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}n.r(e),n.d(e,"store",(function(){return i}));var i=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var e,n,i;return e=t,(n=[{key:"setState",value:function(t){this._state=Object.assign(this._state,t)}},{key:"getStateValue",value:function(t){return this._state[t]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(t,e){this._subscribers[t]||(this._subscribers[t]=[]),this._subscribers[t].push(e)}},{key:"publish",value:function(t,e){this._subscribers[t]&&this._subscribers[t].forEach((function(t){return t(e)}))}}])&&r(e.prototype,n),i&&r(e,i),t}())},1:function(t,e,n){"use strict";n.r(e),e.default={toCamel:function(t){return t.replace(/([-_][a-z])/gi,(function(t){return t.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(t){return this.toCamel(t.replace("data-","").replace("[","").replace("]",""))},attachClass:function(t,e){if(t.dataset){var n=this.getSimpleDataAttribute(t,e);n&&t.classList.add(n)}},getSimpleDataAttribute:function(t,e){if(!t.dataset)return"";var n=this.getDataAttributeKey(e);return t.dataset[n]||""},debounce:function(t,e,n){var r,i=arguments,a=this;return function(){var s=a,o=i,u=n&&!r;clearTimeout(r),r=setTimeout((function(){r=null,n||t.apply(s,o)}),e),u&&t.apply(s,o)}},throttle:function(t,e){var n=0;return function(){var r=new Date;r-n>=e&&(t(),n=r)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(t){return this.isIE()?t.offsetHeight:+getComputedStyle(t,null).height.replace("px","")},getElementWidth:function(t){return+getComputedStyle(t,null).width.replace("px","")}}},13:function(t,e,n){"use strict";n.r(e),n.d(e,"default",(function(){return s}));var r=n(0),i=n(1);function a(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var s=function(){function t(e){var n=this;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._svg=e,this._CssSelectors={PATH:"path"},this._paths=Array.from(this._svg.querySelectorAll(this._CssSelectors.PATH)),i.default.isIE())return this._paths.forEach((function(t){n._fallbackIE(t)})),void(this._svg.style.opacity=1);this._pathsMap=this._paths.map((function(t){return{path:t,totalLength:t.getTotalLength(),visible:!1}})),this._pathsMap.forEach((function(t){n._initPath(t)})),this._svg.style.opacity=1,r.store.subscribe(r.store.topics.SCROLL_CHANGE,(function(){n._handleScroll()})),r.store.subscribe(r.store.topics.ELEMENT_VISIBLE,(function(t){n._updateSvgVisibility(t,!0)})),r.store.subscribe(r.store.topics.ELEMENT_NOT_VISIBLE,(function(t){n._updateSvgVisibility(t,!1)}))}var e,n,s;return e=t,(n=[{key:"_initPath",value:function(t){t.path.style.strokeDasharray="".concat(t.totalLength," ").concat(t.totalLength),t.path.style.strokeDashoffset=t.totalLength}},{key:"_fallbackIE",value:function(t){t.style.strokeDasharray=0,t.style.strokeDashoffset=0}},{key:"_handleScroll",value:function(){var t=this;this._pathsMap.forEach((function(e){e.visible&&window.requestAnimationFrame((function(){t._animatePath(e)}))}))}},{key:"_updateSvgVisibility",value:function(t,e){this._svg===t&&this._pathsMap.forEach((function(t){t.visible=e}))}},{key:"_animatePath",value:function(t){var e=window.innerHeight/2,n=t.path.getBoundingClientRect(),r=(e-n.top)/n.height,i=r>0?t.totalLength*r:0;t.path.style.strokeDashoffset=i<t.totalLength?t.totalLength-i:0}}])&&a(e.prototype,n),s&&a(e,s),t}()}});
!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=14)}({14:function(e,t,n){"use strict";function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}n.r(t),n.d(t,"default",(function(){return r}));var r=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var n=t.dataset.deadline,o=this._getTimeRemaining(n);this._CLASSES={NUMBER:"m-countdown-clock__number",LABEL:"m-countdown-clock__label",BLOCK:"m-countdown-clock",ALERT:"m-countdown-alert"},this._setClock(t,o),this._start(t,n,6e4)}var t,n,r;return t=e,(n=[{key:"_getIntervalElement",value:function(e,t){return{span:t.querySelector(".".concat(this._CLASSES.BLOCK,"__").concat(e," .").concat(this._CLASSES.NUMBER)),label:t.querySelector(".".concat(this._CLASSES.BLOCK,"__").concat(e," .").concat(this._CLASSES.LABEL))}}},{key:"_getIntervalLabel",value:function(e,t){var n=e.label.dataset;return t?n.singular:n.plural}},{key:"_getTimeRemaining",value:function(e){var t=Date.parse(e)-Date.parse(new Date),n=0,o=0,r=0,a=0;return t>=0&&(n=Math.floor(t/1e3%60),o=Math.floor(t/1e3/60%60),r=Math.floor(t/36e5%24),a=Math.floor(t/864e5)),{total:t,days:a,hours:r,minutes:o,seconds:n}}},{key:"_setIntervalElement",value:function(e,t,n){var o=this._getIntervalElement(e,t);o.span.textContent=n[e],o.label.textContent=this._getIntervalLabel(o,1===n[e])}},{key:"_setClock",value:function(e,t){this._setIntervalElement("days",e,t),this._setIntervalElement("hours",e,t),this._setIntervalElement("minutes",e,t)}},{key:"_setAlert",value:function(e,t){var n=e.querySelector(".".concat(this._CLASSES.ALERT));n.textContent="".concat(n.dataset.label," ").concat(t.days,":").concat(t.hours,":").concat(t.minutes)}},{key:"_start",value:function(e,t){var n=this,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:6e4,r=this._getTimeRemaining(t).total;if(r<=0)this._countdownComplete();else var a=setInterval((function(){var o=n._getTimeRemaining(t);n._setClock(e,o),n._setAlert(e,o),o.total<=0&&(n._countdownComplete(),clearInterval(a))}),o)}},{key:"_countdownComplete",value:function(){console.warn("Countdown ended!")}}])&&o(t.prototype,n),r&&o(t,r),e}()}});
!function(e){var t={};function n(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(i,s,function(t){return e[t]}.bind(null,s));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=15)}({0:function(e,t,n){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}n.r(t),n.d(t,"store",(function(){return s}));var s=new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var t,n,s;return t=e,(n=[{key:"setState",value:function(e){this._state=Object.assign(this._state,e)}},{key:"getStateValue",value:function(e){return this._state[e]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(e,t){this._subscribers[e]||(this._subscribers[e]=[]),this._subscribers[e].push(t)}},{key:"publish",value:function(e,t){this._subscribers[e]&&this._subscribers[e].forEach((function(e){return e(t)}))}}])&&i(t.prototype,n),s&&i(t,s),e}())},1:function(e,t,n){"use strict";n.r(t),t.default={toCamel:function(e){return e.replace(/([-_][a-z])/gi,(function(e){return e.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(e){return this.toCamel(e.replace("data-","").replace("[","").replace("]",""))},attachClass:function(e,t){if(e.dataset){var n=this.getSimpleDataAttribute(e,t);n&&e.classList.add(n)}},getSimpleDataAttribute:function(e,t){if(!e.dataset)return"";var n=this.getDataAttributeKey(t);return e.dataset[n]||""},debounce:function(e,t,n){var i,s=arguments,r=this;return function(){var a=r,o=s,l=n&&!i;clearTimeout(i),i=setTimeout((function(){i=null,n||e.apply(a,o)}),t),l&&e.apply(a,o)}},throttle:function(e,t){var n=0;return function(){var i=new Date;i-n>=t&&(e(),n=i)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(e){return this.isIE()?e.offsetHeight:+getComputedStyle(e,null).height.replace("px","")},getElementWidth:function(e){return+getComputedStyle(e,null).width.replace("px","")}}},15:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return l}));var i=n(0),s=n(1);function r(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return a(e,t)}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var i=0,s=function(){};return{s:s,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,o=!0,l=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return o=e.done,e},e:function(e){l=!0,r=e},f:function(){try{o||null==n.return||n.return()}finally{if(l)throw r}}}}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}function o(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var l=function(){function e(t){var n=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),s.default.isIE()||(this._element=t,this._parentElement=this._element.parentElement,this._elementOffsetTop=this._element.offsetTop,this._hasExploded=!1,this._explodedSelector=".o-exploded-view__exploded-container",this._explodedElements=this._parentElement.querySelectorAll(this._explodedSelector),this._explodedElementsConfig=[],this._animationClasses={ANIMATION:"o-exploded-view__animation",ANIMATION_START:"o-exploded-view__animation--start",ANIMATION_ANIMATE:"o-exploded-view__animation--animate",NO_ANIMATE:"o-exploded-view__animation--no-animation"},this._cssValues={HEIGHT:"height",MAX_HEIGHT:"max-height",TRANSLATE_Y_OFFSET:"--translate-y-offset",VISIBILITY:"visibility",HIDDEN:"hidden",VISIBLE:"visible"},this._heights=null,this._transitionCounter=0,this._animationFinished=!1,this._initializeElements(),i.store.subscribe(i.store.topics.ELEMENT_VISIBLE,(function(e){n._handleElementIsVisible(e)})),i.store.subscribe(i.store.topics.RESIZE,(function(){n._resetAnimation()})))}var t,n,a;return t=e,(n=[{key:"_initializeElements",value:function(){var e=this;this._element.style.zIndex=this._explodedElements.length+1;for(var t=function(t){var n=e._explodedElements[t];n.style.zIndex=e._explodedElements.length-t,n.addEventListener("transitionend",(function(t){"opacity"===t.propertyName&&(e._setVisibilitityHidden(n),e._transitionCounter++),e._transitionCounter===e._explodedElements.length&&(e._transitionCounter=0,e._animationFinished=!0)}))},n=0;n<this._explodedElements.length;n++)t(n);this._resetAnimation()}},{key:"_handleElementIsVisible",value:function(e){var t=i.store.getStateValue("isScrollingDown");e===this._element&&t&&!this._hasExploded&&this._explodedAnimation(),e===this._element&&!t&&this._hasExploded&&this._compressAnimation()}},{key:"_explodedAnimation",value:function(){var e=this;this._animationFinished&&(this._animationFinished=!1,this._explodedElementsConfig.forEach((function(t){t.target.style.setProperty(e._cssValues.VISIBILITY,e._cssValues.VISIBLE),t.target.classList.add(e._animationClasses.ANIMATION_ANIMATE)})),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.explodedHeight),this._hasExploded=!0)}},{key:"_compressAnimation",value:function(){var e=this;this._animationFinished&&(this._animationFinished=!1,this._explodedElementsConfig.forEach((function(t){t.target.classList.remove(e._animationClasses.ANIMATION_ANIMATE)})),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.compressHeight),this._hasExploded=!1)}},{key:"_getHeights",value:function(){var e=+window.getComputedStyle(this._parentElement,null).getPropertyValue("padding-top").replace("px","");this._heights={explodedHeight:"".concat(this._parentElement.offsetHeight,"px"),compressHeight:"".concat(this._element.offsetHeight+e,"px")}}},{key:"_resetAnimation",value:function(){var e=this;this._parentElement.classList.add(this._animationClasses.NO_ANIMATE),this._parentElement.style.setProperty(this._cssValues.HEIGHT,"auto"),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,"unset"),this._getHeights(),this._parentElement.style.setProperty(this._cssValues.HEIGHT,this._heights.explodedHeight),this._hasExploded?this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.explodedHeight):this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.compressHeight),this._explodedElementsConfig=[];var t,n=r(this._explodedElements);try{var i=function(){var n=t.value,i=n.offsetTop;n.style.setProperty(e._cssValues.VISIBILITY,e._cssValues.VISIBLE),e._explodedElementsConfig.push({target:n,position:i}),window.requestAnimationFrame((function(){var t=i-e._elementOffsetTop-180;n.style.setProperty(e._cssValues.TRANSLATE_Y_OFFSET,"-".concat(t,"px")),n.classList.add(e._animationClasses.ANIMATION),n.classList.add(e._animationClasses.ANIMATION_START)}))};for(n.s();!(t=n.n()).done;)i()}catch(e){n.e(e)}finally{n.f()}this._hasExploded?(this._parentElement.classList.remove(this._animationClasses.NO_ANIMATE),this._compressAnimation()):this._parentElement.classList.remove(this._animationClasses.NO_ANIMATE)}},{key:"_setVisibilitityHidden",value:function(e){this._hasExploded||e.style.setProperty(this._cssValues.VISIBILITY,this._cssValues.HIDDEN)}}])&&o(t.prototype,n),a&&o(t,a),e}()}});
!function(e){var t={};function i(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(n,s,function(t){return e[t]}.bind(null,s));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=16)}({0:function(e,t,i){"use strict";function n(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}i.r(t),i.d(t,"store",(function(){return s}));var s=new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var t,i,s;return t=e,(i=[{key:"setState",value:function(e){this._state=Object.assign(this._state,e)}},{key:"getStateValue",value:function(e){return this._state[e]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(e,t){this._subscribers[e]||(this._subscribers[e]=[]),this._subscribers[e].push(t)}},{key:"publish",value:function(e,t){this._subscribers[e]&&this._subscribers[e].forEach((function(e){return e(t)}))}}])&&n(t.prototype,i),s&&n(t,s),e}())},1:function(e,t,i){"use strict";i.r(t),t.default={toCamel:function(e){return e.replace(/([-_][a-z])/gi,(function(e){return e.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(e){return this.toCamel(e.replace("data-","").replace("[","").replace("]",""))},attachClass:function(e,t){if(e.dataset){var i=this.getSimpleDataAttribute(e,t);i&&e.classList.add(i)}},getSimpleDataAttribute:function(e,t){if(!e.dataset)return"";var i=this.getDataAttributeKey(t);return e.dataset[i]||""},debounce:function(e,t,i){var n,s=arguments,r=this;return function(){var o=r,a=s,l=i&&!n;clearTimeout(n),n=setTimeout((function(){n=null,i||e.apply(o,a)}),t),l&&e.apply(o,a)}},throttle:function(e,t){var i=0;return function(){var n=new Date;n-i>=t&&(e(),i=n)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(e){return this.isIE()?e.offsetHeight:+getComputedStyle(e,null).height.replace("px","")},getElementWidth:function(e){return+getComputedStyle(e,null).width.replace("px","")}}},16:function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return o}));var n=i(0),s=i(1);function r(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}var o=function(){function e(t){var i=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._element=t,this._elementHeight=0,this._scrollDifference=0,this._elementOffsetTop=this._element.offsetTop,this._currentScroll=0,this._smallDevices=!1,this._viewportHeight=0,this._viewportWidth=0,this._selectors={ARROW:".o-hero--product__arrow",BACKGROUND_IMAGES:".o-hero--product__background",IMAGES:".o-hero--product__image",MAIN_SECTION:".o-hero--product__main",TEXT:".o-hero--product__text--top",TEXT_BOTTOM:".o-hero--product__text--bottom",TEXT_CENTER:".o-hero--product__text--center",SCENE:".o-hero--product__scene",VIDEO:".o-hero--product__video"},this._animationClasses={START:"o-hero--product__animation",UPDATE:"o-hero--product__animation--update",SEQUENCE:"o-hero--product__sequence",CANCEL_ANIMATION:"no-animation",EXPLORER:"o-hero--product__ie"},this._arrowElement=this._element.querySelector(this._selectors.ARROW),this._backgroundAssets=this._element.querySelectorAll(this._selectors.BACKGROUND_IMAGES),this._imageSequence=this._element.querySelectorAll(this._selectors.IMAGES),this._scene=this._element.querySelector(this._selectors.SCENE),this._videos=this._element.querySelectorAll(this._selectors.VIDEO),this._mainSection=document.querySelector(this._selectors.MAIN_SECTION),this._centerText=document.querySelector(this._selectors.TEXT_CENTER),this._bottomText=document.querySelector(this._selectors.TEXT_BOTTOM),this._topText=document.querySelector(this._selectors.TEXT),this._init(),n.store.subscribe(n.store.topics.ELEMENT_VISIBLE,(function(e){i._handleElementIsVisible(e)})),n.store.subscribe(n.store.topics.SCROLL_CHANGE,(function(){i._handleScrollChange()})),n.store.subscribe(n.store.topics.RESIZE,(function(){i._calculateSceneValues()}))}var t,i,o;return t=e,(i=[{key:"_init",value:function(){this._calculateSceneValues(),this._imageControl();var e=this._element.nextElementSibling;e&&(e.style.backgroundColor="#FFFFFF",e.style.position="relative"),s.default.isIE()&&this._element.classList.add(this._animationClasses.EXPLORER)}},{key:"_imageControl",value:function(){this._imageSequence.length>1&&this._element.classList.add(this._animationClasses.SEQUENCE)}},{key:"_handleElementIsVisible",value:function(e){e===this._scene&&this._pinElement()}},{key:"_handleScrollChange",value:function(){if(this._currentScroll=n.store.getStateValue("scrollPosition"),this._calculateScrollDiference(),this._scrollDifference>this._elementHeight+50)this._cancelAnimations();else if(s.default.isIE())this._scrollDifference<this._elementHeight+50&&this._scene.classList.add(this._animationClasses.CANCEL_ANIMATION);else{var e=10*this._elementHeight/100;this._pinElement(),this._backgroundAnimation(),this._scrollDifference>e?(this._element.classList.add(this._animationClasses.UPDATE),this._playVideo()):this._element.classList.remove(this._animationClasses.UPDATE)}}},{key:"_backgroundAnimation",value:function(){this._element.classList.contains(this._animationClasses.UPDATE)?this._backgroundAssets.forEach((function(e){var t=e.dataset,i=t.mainAsset,n=t.secondAsset;e.style.backgroundImage="url('".concat(n||i,"')")})):this._backgroundAssets.forEach((function(e){var t=e.dataset.mainAsset;e.style.backgroundImage="url('".concat(t,"')")}))}},{key:"_cancelAnimations",value:function(){var e=this;[this._animationClasses.START,this._animationClasses.UPDATE].forEach((function(t){e._element.classList.remove(t)})),this._scene.classList.remove(this._animationClasses.CANCEL_ANIMATION)}},{key:"_pinElement",value:function(){this._element.classList.add(this._animationClasses.START)}},{key:"_playVideo",value:function(){this._videos.forEach((function(e){e&&e.paused&&e.play()}))}},{key:"_calculateSceneValues",value:function(){var e=this._element.getBoundingClientRect();this._elementHeight=e.height,this._viewportHeight=window.innerHeight,this._viewportWidth=window.innerWidth,this._smallDevices=this._viewportHeight<=568&&this._viewportWidth<=480}},{key:"_calculateScrollDiference",value:function(){var e=this._elementOffsetTop,t=this._currentScroll;this._scrollDifference=e<t?Math.abs(e-t):0}}])&&r(t.prototype,i),o&&r(t,o),e}()}});
!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=21)}({21:function(t,e,n){"use strict";function r(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}n.r(e),n.d(e,"default",(function(){return o}));var o=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._CLASSES={CONTENT:"m-loader__content",BUTTON_CONTAINER:"m-loader__button-container",CONTENT_HIDDEN:"m-loader__content--hidden",BUTTON_CONTAINER_HIDDEN:"m-loader__button-container--hidden"},this._loaderContent=e.querySelector(".".concat(this._CLASSES.CONTENT)),this._loaderButtonContainer=e.querySelector(".".concat(this._CLASSES.BUTTON_CONTAINER)),this._loaderButton=this._loaderButtonContainer.firstElementChild,this._loaderButton.addEventListener("click",this._toggleLoader.bind(this))}var e,n,o;return e=t,(n=[{key:"_toggleLoader",value:function(){this._loaderContent.classList.toggle(this._CLASSES.CONTENT_HIDDEN),this._loaderButtonContainer.classList.toggle(this._CLASSES.BUTTON_CONTAINER_HIDDEN)}}])&&r(e.prototype,n),o&&r(e,o),t}()}});
!function(e){var t={};function i(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=17)}({0:function(e,t,i){"use strict";function n(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}i.r(t),i.d(t,"store",(function(){return r}));var r=new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var t,i,r;return t=e,(i=[{key:"setState",value:function(e){this._state=Object.assign(this._state,e)}},{key:"getStateValue",value:function(e){return this._state[e]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(e,t){this._subscribers[e]||(this._subscribers[e]=[]),this._subscribers[e].push(t)}},{key:"publish",value:function(e,t){this._subscribers[e]&&this._subscribers[e].forEach((function(e){return e(t)}))}}])&&n(t.prototype,i),r&&n(t,r),e}())},1:function(e,t,i){"use strict";i.r(t),t.default={toCamel:function(e){return e.replace(/([-_][a-z])/gi,(function(e){return e.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(e){return this.toCamel(e.replace("data-","").replace("[","").replace("]",""))},attachClass:function(e,t){if(e.dataset){var i=this.getSimpleDataAttribute(e,t);i&&e.classList.add(i)}},getSimpleDataAttribute:function(e,t){if(!e.dataset)return"";var i=this.getDataAttributeKey(t);return e.dataset[i]||""},debounce:function(e,t,i){var n,r=arguments,a=this;return function(){var o=a,s=r,c=i&&!n;clearTimeout(n),n=setTimeout((function(){n=null,i||e.apply(o,s)}),t),c&&e.apply(o,s)}},throttle:function(e,t){var i=0;return function(){var n=new Date;n-i>=t&&(e(),i=n)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(e){return this.isIE()?e.offsetHeight:+getComputedStyle(e,null).height.replace("px","")},getElementWidth:function(e){return+getComputedStyle(e,null).width.replace("px","")}}},17:function(e,t,i){"use strict";i.r(t),i.d(t,"default",(function(){return o}));var n=i(0),r=i(1);function a(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}var o=function(){function e(t,i){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._tabletLargeBreakpoint="(min-width: 975px)",this._block=i,this._selectors={main:i,media:"".concat(i,"__media"),mediaContainer:"".concat(i,"__media-container"),mediaContainerSticky:"".concat(i,"__media-container--sticky").substring(1),mediaContainerBottom:"".concat(i,"__media-container--bottom").substring(1)};var a=t.querySelector(this._selectors.media),o=t.querySelector(this._selectors.mediaContainer);a&&(this._element=t,this._media=a,this._mediaContainer=o,this._isIE=r.default.isIE(),this._handleScroll(),n.store.subscribe(n.store.topics.SCROLL_CHANGE,this._handleScroll.bind(this)),this.ieFallback())}var t,i,o;return t=e,(i=[{key:"ieFallback",value:function(){if(this._isIE){var e=this._mediaContainer.querySelectorAll("[data-object-fit]");objectFitPolyfill(e)}}},{key:"_setMediaSticky",value:function(){this._mediaContainer.classList.add(this._selectors.mediaContainerSticky),this._mediaContainer.classList.remove(this._selectors.mediaContainerBottom)}},{key:"_setMediaBottom",value:function(){this._mediaContainer.classList.remove(this._selectors.mediaContainerSticky),this._mediaContainer.classList.add(this._selectors.mediaContainerBottom)}},{key:"_removeMediaModifiers",value:function(){this._mediaContainer.classList.remove(this._selectors.mediaContainerSticky),this._mediaContainer.classList.remove(this._selectors.mediaContainerBottom)}},{key:"_handleScroll",value:function(){var e=this;window.matchMedia(this._tabletLargeBreakpoint).matches?window.requestAnimationFrame((function(){var t=-1*e._element.getBoundingClientRect().top;t>0&&t<e._maxGap?e._setMediaSticky():t>=e._maxGap?e._setMediaBottom():e._removeMediaModifiers()})):this._removeMediaModifiers()}},{key:"_maxGap",get:function(){return r.default.getElementHeight(this._element)-r.default.getElementHeight(this._mediaContainer)}}])&&a(t.prototype,i),o&&a(t,o),e}()}});
!function(t){var e={};function r(i){if(e[i])return e[i].exports;var n=e[i]={i:i,l:!1,exports:{}};return t[i].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=t,r.c=e,r.d=function(t,e,i){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(r.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)r.d(i,n,function(e){return t[e]}.bind(null,n));return i},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=23)}({0:function(t,e,r){"use strict";function i(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}r.r(e),r.d(e,"store",(function(){return n}));var n=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var e,r,n;return e=t,(r=[{key:"setState",value:function(t){this._state=Object.assign(this._state,t)}},{key:"getStateValue",value:function(t){return this._state[t]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(t,e){this._subscribers[t]||(this._subscribers[t]=[]),this._subscribers[t].push(e)}},{key:"publish",value:function(t,e){this._subscribers[t]&&this._subscribers[t].forEach((function(t){return t(e)}))}}])&&i(e.prototype,r),n&&i(e,n),t}())},23:function(t,e,r){"use strict";r.r(e),r.d(e,"default",(function(){return o}));var i=r(0);function n(t,e){for(var r=0;r<e.length;r++){var i=e[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}var o=function(){function t(e){var r=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._element=e,this._width=0,this._tabletLarge=975,this._dropdownLeftOffset=20,this._CLASSES={MODAL_DESKTOP:"o-pcp-product-filters--modal-desktop",SORT_ITEM:"o-pcp-product-filters__sort-item",PRIMARY_FIRST:"o-pcp-product-filters__primary-item--first"},this._mobileModal=e,this._desktopModal=this._element.querySelector(".".concat(this._CLASSES.MODAL_DESKTOP)),this._currentPanel=null,this._openedPanels=[],this._currentTrigger=null,this._modalAttributes={role:"dialog","aria-label":"",id:"","aria-modal":"true"},this._resetModals(),i.store.subscribe(i.store.topics.RESIZE,(function(){r._resetModals(),r._currentTrigger&&i.store.publish(i.store.topics.PCP_PROD_FILTERS_RESIZE,{panel:r._currentPanel,trigger:r._currentTrigger})})),i.store.subscribe(i.store.topics.TOGGLE_ACCORDION,(function(t){r._currentPanel=t.panel,r._openedPanels.find((function(e){return e===t.panel}))||r._openedPanels.push(t.panel),r._currentTrigger=t.trigger}))}var e,r,o;return e=t,(r=[{key:"_resetModals",value:function(){this._width=window.innerWidth,this._clearModal(this._mobileModal),this._clearModal(this._desktopModal),this._width>this._tabletLarge?this._initModal(this._desktopModal):this._initModal(this._mobileModal)}},{key:"_initModal",value:function(t){var e=this;t&&(this._modalAttributes["aria-label"]=t.dataset.modalTitle,this._modalAttributes.id=t.dataset.modalId,Object.keys(this._modalAttributes).forEach((function(r){t.setAttribute(r,e._modalAttributes[r])})))}},{key:"_clearModal",value:function(t){t&&Object.keys(this._modalAttributes).forEach((function(e){t.removeAttribute(e)}))}}])&&n(e.prototype,r),o&&n(e,o),t}()}});
!function(t){var e={};function n(o){if(e[o])return e[o].exports;var r=e[o]={i:o,l:!1,exports:{}};return t[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(o,r,function(e){return t[e]}.bind(null,r));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=20)}({20:function(t,e,n){"use strict";n.r(e),n.d(e,"default",(function(){return o}));var o=function t(e,n){var o=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var r=n.replace(".","");this._el=e,this._$el=$(e),this._slider=this._$el.find("".concat(n,"__items")),this._$el.on("click",(function(t){var e=$(t.target),o=e.closest("".concat(n,"__button-cta")).length>0,r=e.closest("".concat(n,"__dots")).length>0,c=e.closest("".concat(n,"__compare")).length>0;(o||r||c)&&t.preventDefault()})),this._$el.find("".concat(n,"__compare")).on("click",(function(){o._$el.toggleClass("".concat(r,"--selected"))}));var c=this._$el.find("".concat(n,"__button-prev")),i=this._$el.find("".concat(n,"__button-next"));this._slider.slick({accessibility:!1,dots:!0,infinite:!0,dotsClass:"slick-dots ".concat(r,"__dots"),prevArrow:c.html(),nextArrow:i.html()})}}});
!function(e){var t={};function n(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(i,s,function(t){return e[t]}.bind(null,s));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=18)}({0:function(e,t,n){"use strict";function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}n.r(t),n.d(t,"store",(function(){return s}));var s=new(function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var t,n,s;return t=e,(n=[{key:"setState",value:function(e){this._state=Object.assign(this._state,e)}},{key:"getStateValue",value:function(e){return this._state[e]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(e,t){this._subscribers[e]||(this._subscribers[e]=[]),this._subscribers[e].push(t)}},{key:"publish",value:function(e,t){this._subscribers[e]&&this._subscribers[e].forEach((function(e){return e(t)}))}}])&&i(t.prototype,n),s&&i(t,s),e}())},1:function(e,t,n){"use strict";n.r(t),t.default={toCamel:function(e){return e.replace(/([-_][a-z])/gi,(function(e){return e.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(e){return this.toCamel(e.replace("data-","").replace("[","").replace("]",""))},attachClass:function(e,t){if(e.dataset){var n=this.getSimpleDataAttribute(e,t);n&&e.classList.add(n)}},getSimpleDataAttribute:function(e,t){if(!e.dataset)return"";var n=this.getDataAttributeKey(t);return e.dataset[n]||""},debounce:function(e,t,n){var i,s=arguments,o=this;return function(){var r=o,a=s,u=n&&!i;clearTimeout(i),i=setTimeout((function(){i=null,n||e.apply(r,a)}),t),u&&e.apply(r,a)}},throttle:function(e,t){var n=0;return function(){var i=new Date;i-n>=t&&(e(),n=i)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(e){return this.isIE()?e.offsetHeight:+getComputedStyle(e,null).height.replace("px","")},getElementWidth:function(e){return+getComputedStyle(e,null).width.replace("px","")}}},18:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return r}));var i=n(1),s=n(0);function o(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var r=function(){function e(t,n){var i=this;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._referenceElementEnd,this._isPinned=!1,this._pinnedConfig={position:0,end:"",activeClass:null,endless:!1},this._currentScroll=0,this._boundaries=[],this._pinnedElement=t,this._pinnedElementSelector=n,s.store.subscribe(s.store.topics.SCROLL_CHANGE,(function(){i._handleScrollChange()})),s.store.subscribe(s.store.topics.RESIZE,(function(){i._resetPosition()})),s.store.subscribe(s.store.topics.SLICK_EVENT,(function(){i._updateBoundaries()})),this._init()}var t,n,r;return t=e,(n=[{key:"_resetPosition",value:function(){var e=this._isPinned;e&&this._unPinElement(),this._updateBoundaries(),e&&this._pinElement()}},{key:"_handleScrollChange",value:function(){this._currentScroll=s.store.getStateValue("scrollPosition"),this._updateElementPosition()}},{key:"_init",value:function(){var e=this._pinnedElement.dataset[i.default.getDataAttributeKey(this._pinnedElementSelector)];this._pinnedConfig=Object.assign(this._pinnedConfig,JSON.parse((e||"{}").replace(/'/g,'"'))),this._pinnedConfig.end&&(this._referenceElementEnd=document.querySelector(this._pinnedConfig.end)),this._updateBoundaries(),this._updateElementPosition()}},{key:"_updateBoundaries",value:function(){var e=this._referenceElementEnd?this._referenceElementEnd.offsetTop:this._pinnedElement.offsetTop+this._pinnedElement.offsetHeight;this._boundaries=[this._pinnedElement.offsetTop,e],this._updateElementPosition()}},{key:"_updateElementPosition",value:function(){this._isInBoundaries()?this._updatePositionInsideBoundaries():this._updatePositionOutsideBoundaries()}},{key:"_updatePositionInsideBoundaries",value:function(){s.store.getStateValue("isScrollingDown")?this._pinElement():this._isPinned||(this._pinElement(),this._fadeInDown()),this._isPinned=!0}},{key:"_pinElement",value:function(){this._pinnedElement.style.position="fixed",this._pinnedConfig.activeClass?this._pinnedElement.classList.add(this._pinnedConfig.activeClass):this._pinnedElement.style.top="".concat(this._pinnedConfig.position,"px")}},{key:"_fadeInDown",value:function(){var e=this;this._pinnedElement.classList.add("p-animations__fade-in-down-pinned"),setTimeout((function(){e._pinnedElement.classList.remove("p-animations__fade-in-down-pinned")}),500)}},{key:"_updatePositionOutsideBoundaries",value:function(){this._isPinned&&(s.store.getStateValue("isScrollingDown")?this._fadeOut():this._unPinElement(),this._isPinned=!1)}},{key:"_unPinElement",value:function(){this._pinnedElement.style.position="",this._pinnedElement.style.top="auto",this._pinnedConfig.activeClass&&this._pinnedElement.classList.remove(this._pinnedConfig.activeClass)}},{key:"_fadeOut",value:function(){var e=this;this._pinnedElement.classList.add("p-animations__fade-out-pinned"),setTimeout((function(){e._unPinElement(),e._pinnedElement.classList.remove("p-animations__fade-out-pinned")}),500)}},{key:"_isInBoundaries",value:function(){var e=this._pinnedConfig,t=e.position,n=e.endless,i=this._currentScroll>this._boundaries[0]-t,s=n||this._currentScroll<this._boundaries[1];return i&&s}}])&&o(t.prototype,n),r&&o(t,r),e}()}});
!function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=45)}([function(t,e,i){"use strict";function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.r(e),i.d(e,"store",(function(){return s}));var s=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._state={},this._subscribers={},this.topics={SCROLL_CHANGE:"SCROLL_CHANGE",ELEMENT_VISIBLE:"ELEMENT_VISIBLE",ELEMENT_NOT_VISIBLE:"ELEMENT_NOT_VISIBLE",RESIZE:"RESIZE",TOGGLE_ACCORDION:"TOGGLE_ACCORDION",PCP_PROD_FILTERS_RESIZE:"PCP_PROD_FILTERS_RESIZE"}}var e,i,s;return e=t,(i=[{key:"setState",value:function(t){this._state=Object.assign(this._state,t)}},{key:"getStateValue",value:function(t){return this._state[t]}},{key:"getState",value:function(){return this._state}},{key:"subscribe",value:function(t,e){this._subscribers[t]||(this._subscribers[t]=[]),this._subscribers[t].push(e)}},{key:"publish",value:function(t,e){this._subscribers[t]&&this._subscribers[t].forEach((function(t){return t(e)}))}}])&&n(e.prototype,i),s&&n(e,s),t}())},function(t,e,i){"use strict";i.r(e),e.default={toCamel:function(t){return t.replace(/([-_][a-z])/gi,(function(t){return t.toUpperCase().replace("-","").replace("_","")}))},getDataAttributeKey:function(t){return this.toCamel(t.replace("data-","").replace("[","").replace("]",""))},attachClass:function(t,e){if(t.dataset){var i=this.getSimpleDataAttribute(t,e);i&&t.classList.add(i)}},getSimpleDataAttribute:function(t,e){if(!t.dataset)return"";var i=this.getDataAttributeKey(e);return t.dataset[i]||""},debounce:function(t,e,i){var n,s=arguments,r=this;return function(){var o=r,a=s,l=i&&!n;clearTimeout(n),n=setTimeout((function(){n=null,i||t.apply(o,a)}),e),l&&t.apply(o,a)}},throttle:function(t,e){var i=0;return function(){var n=new Date;n-i>=e&&(t(),i=n)}},isIE:function(){return window.matchMedia("all and (-ms-high-contrast: none)").matches},getElementHeight:function(t){return this.isIE()?t.offsetHeight:+getComputedStyle(t,null).height.replace("px","")},getElementWidth:function(t){return+getComputedStyle(t,null).width.replace("px","")}}},,,,,,,,,,,,function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return o}));var n=i(0),s=i(1);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=function(){function t(e){var i=this;if(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._svg=e,this._CssSelectors={PATH:"path"},this._paths=Array.from(this._svg.querySelectorAll(this._CssSelectors.PATH)),s.default.isIE())return this._paths.forEach((function(t){i._fallbackIE(t)})),void(this._svg.style.opacity=1);this._pathsMap=this._paths.map((function(t){return{path:t,totalLength:t.getTotalLength(),visible:!1}})),this._pathsMap.forEach((function(t){i._initPath(t)})),this._svg.style.opacity=1,n.store.subscribe(n.store.topics.SCROLL_CHANGE,(function(){i._handleScroll()})),n.store.subscribe(n.store.topics.ELEMENT_VISIBLE,(function(t){i._updateSvgVisibility(t,!0)})),n.store.subscribe(n.store.topics.ELEMENT_NOT_VISIBLE,(function(t){i._updateSvgVisibility(t,!1)}))}var e,i,o;return e=t,(i=[{key:"_initPath",value:function(t){t.path.style.strokeDasharray="".concat(t.totalLength," ").concat(t.totalLength),t.path.style.strokeDashoffset=t.totalLength}},{key:"_fallbackIE",value:function(t){t.style.strokeDasharray=0,t.style.strokeDashoffset=0}},{key:"_handleScroll",value:function(){var t=this;this._pathsMap.forEach((function(e){e.visible&&window.requestAnimationFrame((function(){t._animatePath(e)}))}))}},{key:"_updateSvgVisibility",value:function(t,e){this._svg===t&&this._pathsMap.forEach((function(t){t.visible=e}))}},{key:"_animatePath",value:function(t){var e=window.innerHeight/2,i=t.path.getBoundingClientRect(),n=(e-i.top)/i.height,s=n>0?t.totalLength*n:0;t.path.style.strokeDashoffset=s<t.totalLength?t.totalLength-s:0}}])&&r(e.prototype,i),o&&r(e,o),t}()},function(t,e,i){"use strict";function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.r(e),i.d(e,"default",(function(){return s}));var s=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var i=e.dataset.deadline,n=this._getTimeRemaining(i);this._CLASSES={NUMBER:"m-countdown-clock__number",LABEL:"m-countdown-clock__label",BLOCK:"m-countdown-clock",ALERT:"m-countdown-alert"},this._setClock(e,n),this._start(e,i,6e4)}var e,i,s;return e=t,(i=[{key:"_getIntervalElement",value:function(t,e){return{span:e.querySelector(".".concat(this._CLASSES.BLOCK,"__").concat(t," .").concat(this._CLASSES.NUMBER)),label:e.querySelector(".".concat(this._CLASSES.BLOCK,"__").concat(t," .").concat(this._CLASSES.LABEL))}}},{key:"_getIntervalLabel",value:function(t,e){var i=t.label.dataset;return e?i.singular:i.plural}},{key:"_getTimeRemaining",value:function(t){var e=Date.parse(t)-Date.parse(new Date),i=0,n=0,s=0,r=0;return e>=0&&(i=Math.floor(e/1e3%60),n=Math.floor(e/1e3/60%60),s=Math.floor(e/36e5%24),r=Math.floor(e/864e5)),{total:e,days:r,hours:s,minutes:n,seconds:i}}},{key:"_setIntervalElement",value:function(t,e,i){var n=this._getIntervalElement(t,e);n.span.textContent=i[t],n.label.textContent=this._getIntervalLabel(n,1===i[t])}},{key:"_setClock",value:function(t,e){this._setIntervalElement("days",t,e),this._setIntervalElement("hours",t,e),this._setIntervalElement("minutes",t,e)}},{key:"_setAlert",value:function(t,e){var i=t.querySelector(".".concat(this._CLASSES.ALERT));i.textContent="".concat(i.dataset.label," ").concat(e.days,":").concat(e.hours,":").concat(e.minutes)}},{key:"_start",value:function(t,e){var i=this,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:6e4,s=this._getTimeRemaining(e).total;if(s<=0)this._countdownComplete();else var r=setInterval((function(){var n=i._getTimeRemaining(e);i._setClock(t,n),i._setAlert(t,n),n.total<=0&&(i._countdownComplete(),clearInterval(r))}),n)}},{key:"_countdownComplete",value:function(){console.warn("Countdown ended!")}}])&&n(e.prototype,i),s&&n(e,s),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return l}));var n=i(0),s=i(1);function r(t,e){var i;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(i=function(t,e){if(!t)return;if("string"==typeof t)return o(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);"Object"===i&&t.constructor&&(i=t.constructor.name);if("Map"===i||"Set"===i)return Array.from(t);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return o(t,e)}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var n=0,s=function(){};return{s:s,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,a=!0,l=!1;return{s:function(){i=t[Symbol.iterator]()},n:function(){var t=i.next();return a=t.done,t},e:function(t){l=!0,r=t},f:function(){try{a||null==i.return||i.return()}finally{if(l)throw r}}}}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function a(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var l=function(){function t(e){var i=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),s.default.isIE()||(this._element=e,this._parentElement=this._element.parentElement,this._elementOffsetTop=this._element.offsetTop,this._hasExploded=!1,this._explodedSelector=".o-exploded-view__exploded-container",this._explodedElements=this._parentElement.querySelectorAll(this._explodedSelector),this._explodedElementsConfig=[],this._animationClasses={ANIMATION:"o-exploded-view__animation",ANIMATION_START:"o-exploded-view__animation--start",ANIMATION_ANIMATE:"o-exploded-view__animation--animate",NO_ANIMATE:"o-exploded-view__animation--no-animation"},this._cssValues={HEIGHT:"height",MAX_HEIGHT:"max-height",TRANSLATE_Y_OFFSET:"--translate-y-offset",VISIBILITY:"visibility",HIDDEN:"hidden",VISIBLE:"visible"},this._heights=null,this._transitionCounter=0,this._animationFinished=!1,this._initializeElements(),n.store.subscribe(n.store.topics.ELEMENT_VISIBLE,(function(t){i._handleElementIsVisible(t)})),n.store.subscribe(n.store.topics.RESIZE,(function(){i._resetAnimation()})))}var e,i,o;return e=t,(i=[{key:"_initializeElements",value:function(){var t=this;this._element.style.zIndex=this._explodedElements.length+1;for(var e=function(e){var i=t._explodedElements[e];i.style.zIndex=t._explodedElements.length-e,i.addEventListener("transitionend",(function(e){"opacity"===e.propertyName&&(t._setVisibilitityHidden(i),t._transitionCounter++),t._transitionCounter===t._explodedElements.length&&(t._transitionCounter=0,t._animationFinished=!0)}))},i=0;i<this._explodedElements.length;i++)e(i);this._resetAnimation()}},{key:"_handleElementIsVisible",value:function(t){var e=n.store.getStateValue("isScrollingDown");t===this._element&&e&&!this._hasExploded&&this._explodedAnimation(),t===this._element&&!e&&this._hasExploded&&this._compressAnimation()}},{key:"_explodedAnimation",value:function(){var t=this;this._animationFinished&&(this._animationFinished=!1,this._explodedElementsConfig.forEach((function(e){e.target.style.setProperty(t._cssValues.VISIBILITY,t._cssValues.VISIBLE),e.target.classList.add(t._animationClasses.ANIMATION_ANIMATE)})),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.explodedHeight),this._hasExploded=!0)}},{key:"_compressAnimation",value:function(){var t=this;this._animationFinished&&(this._animationFinished=!1,this._explodedElementsConfig.forEach((function(e){e.target.classList.remove(t._animationClasses.ANIMATION_ANIMATE)})),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.compressHeight),this._hasExploded=!1)}},{key:"_getHeights",value:function(){var t=+window.getComputedStyle(this._parentElement,null).getPropertyValue("padding-top").replace("px","");this._heights={explodedHeight:"".concat(this._parentElement.offsetHeight,"px"),compressHeight:"".concat(this._element.offsetHeight+t,"px")}}},{key:"_resetAnimation",value:function(){var t=this;this._parentElement.classList.add(this._animationClasses.NO_ANIMATE),this._parentElement.style.setProperty(this._cssValues.HEIGHT,"auto"),this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,"unset"),this._getHeights(),this._parentElement.style.setProperty(this._cssValues.HEIGHT,this._heights.explodedHeight),this._hasExploded?this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.explodedHeight):this._parentElement.style.setProperty(this._cssValues.MAX_HEIGHT,this._heights.compressHeight),this._explodedElementsConfig=[];var e,i=r(this._explodedElements);try{var n=function(){var i=e.value,n=i.offsetTop;i.style.setProperty(t._cssValues.VISIBILITY,t._cssValues.VISIBLE),t._explodedElementsConfig.push({target:i,position:n}),window.requestAnimationFrame((function(){var e=n-t._elementOffsetTop-180;i.style.setProperty(t._cssValues.TRANSLATE_Y_OFFSET,"-".concat(e,"px")),i.classList.add(t._animationClasses.ANIMATION),i.classList.add(t._animationClasses.ANIMATION_START)}))};for(i.s();!(e=i.n()).done;)n()}catch(t){i.e(t)}finally{i.f()}this._hasExploded?(this._parentElement.classList.remove(this._animationClasses.NO_ANIMATE),this._compressAnimation()):this._parentElement.classList.remove(this._animationClasses.NO_ANIMATE)}},{key:"_setVisibilitityHidden",value:function(t){this._hasExploded||t.style.setProperty(this._cssValues.VISIBILITY,this._cssValues.HIDDEN)}}])&&a(e.prototype,i),o&&a(e,o),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return o}));var n=i(0),s=i(1);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=function(){function t(e){var i=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._element=e,this._elementHeight=0,this._scrollDifference=0,this._elementOffsetTop=this._element.offsetTop,this._currentScroll=0,this._smallDevices=!1,this._viewportHeight=0,this._viewportWidth=0,this._selectors={ARROW:".o-hero--product__arrow",BACKGROUND_IMAGES:".o-hero--product__background",IMAGES:".o-hero--product__image",MAIN_SECTION:".o-hero--product__main",TEXT:".o-hero--product__text--top",TEXT_BOTTOM:".o-hero--product__text--bottom",TEXT_CENTER:".o-hero--product__text--center",SCENE:".o-hero--product__scene",VIDEO:".o-hero--product__video"},this._animationClasses={START:"o-hero--product__animation",UPDATE:"o-hero--product__animation--update",SEQUENCE:"o-hero--product__sequence",CANCEL_ANIMATION:"no-animation",EXPLORER:"o-hero--product__ie"},this._arrowElement=this._element.querySelector(this._selectors.ARROW),this._backgroundAssets=this._element.querySelectorAll(this._selectors.BACKGROUND_IMAGES),this._imageSequence=this._element.querySelectorAll(this._selectors.IMAGES),this._scene=this._element.querySelector(this._selectors.SCENE),this._videos=this._element.querySelectorAll(this._selectors.VIDEO),this._mainSection=document.querySelector(this._selectors.MAIN_SECTION),this._centerText=document.querySelector(this._selectors.TEXT_CENTER),this._bottomText=document.querySelector(this._selectors.TEXT_BOTTOM),this._topText=document.querySelector(this._selectors.TEXT),this._init(),n.store.subscribe(n.store.topics.ELEMENT_VISIBLE,(function(t){i._handleElementIsVisible(t)})),n.store.subscribe(n.store.topics.SCROLL_CHANGE,(function(){i._handleScrollChange()})),n.store.subscribe(n.store.topics.RESIZE,(function(){i._calculateSceneValues()}))}var e,i,o;return e=t,(i=[{key:"_init",value:function(){this._calculateSceneValues(),this._imageControl();var t=this._element.nextElementSibling;t&&(t.style.backgroundColor="#FFFFFF",t.style.position="relative"),s.default.isIE()&&this._element.classList.add(this._animationClasses.EXPLORER)}},{key:"_imageControl",value:function(){this._imageSequence.length>1&&this._element.classList.add(this._animationClasses.SEQUENCE)}},{key:"_handleElementIsVisible",value:function(t){t===this._scene&&this._pinElement()}},{key:"_handleScrollChange",value:function(){if(this._currentScroll=n.store.getStateValue("scrollPosition"),this._calculateScrollDiference(),this._scrollDifference>this._elementHeight+50)this._cancelAnimations();else if(s.default.isIE())this._scrollDifference<this._elementHeight+50&&this._scene.classList.add(this._animationClasses.CANCEL_ANIMATION);else{var t=10*this._elementHeight/100;this._pinElement(),this._backgroundAnimation(),this._scrollDifference>t?(this._element.classList.add(this._animationClasses.UPDATE),this._playVideo()):this._element.classList.remove(this._animationClasses.UPDATE)}}},{key:"_backgroundAnimation",value:function(){this._element.classList.contains(this._animationClasses.UPDATE)?this._backgroundAssets.forEach((function(t){var e=t.dataset,i=e.mainAsset,n=e.secondAsset;t.style.backgroundImage="url('".concat(n||i,"')")})):this._backgroundAssets.forEach((function(t){var e=t.dataset.mainAsset;t.style.backgroundImage="url('".concat(e,"')")}))}},{key:"_cancelAnimations",value:function(){var t=this;[this._animationClasses.START,this._animationClasses.UPDATE].forEach((function(e){t._element.classList.remove(e)})),this._scene.classList.remove(this._animationClasses.CANCEL_ANIMATION)}},{key:"_pinElement",value:function(){this._element.classList.add(this._animationClasses.START)}},{key:"_playVideo",value:function(){this._videos.forEach((function(t){t&&t.paused&&t.play()}))}},{key:"_calculateSceneValues",value:function(){var t=this._element.getBoundingClientRect();this._elementHeight=t.height,this._viewportHeight=window.innerHeight,this._viewportWidth=window.innerWidth,this._smallDevices=this._viewportHeight<=568&&this._viewportWidth<=480}},{key:"_calculateScrollDiference",value:function(){var t=this._elementOffsetTop,e=this._currentScroll;this._scrollDifference=t<e?Math.abs(t-e):0}}])&&r(e.prototype,i),o&&r(e,o),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return o}));var n=i(0),s=i(1);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=function(){function t(e,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._tabletLargeBreakpoint="(min-width: 975px)",this._block=i,this._selectors={main:i,media:"".concat(i,"__media"),mediaContainer:"".concat(i,"__media-container"),mediaContainerSticky:"".concat(i,"__media-container--sticky").substring(1),mediaContainerBottom:"".concat(i,"__media-container--bottom").substring(1)};var r=e.querySelector(this._selectors.media),o=e.querySelector(this._selectors.mediaContainer);r&&(this._element=e,this._media=r,this._mediaContainer=o,this._isIE=s.default.isIE(),this._handleScroll(),n.store.subscribe(n.store.topics.SCROLL_CHANGE,this._handleScroll.bind(this)),this.ieFallback())}var e,i,o;return e=t,(i=[{key:"ieFallback",value:function(){if(this._isIE){var t=this._mediaContainer.querySelectorAll("[data-object-fit]");objectFitPolyfill(t)}}},{key:"_setMediaSticky",value:function(){this._mediaContainer.classList.add(this._selectors.mediaContainerSticky),this._mediaContainer.classList.remove(this._selectors.mediaContainerBottom)}},{key:"_setMediaBottom",value:function(){this._mediaContainer.classList.remove(this._selectors.mediaContainerSticky),this._mediaContainer.classList.add(this._selectors.mediaContainerBottom)}},{key:"_removeMediaModifiers",value:function(){this._mediaContainer.classList.remove(this._selectors.mediaContainerSticky),this._mediaContainer.classList.remove(this._selectors.mediaContainerBottom)}},{key:"_handleScroll",value:function(){var t=this;window.matchMedia(this._tabletLargeBreakpoint).matches?window.requestAnimationFrame((function(){var e=-1*t._element.getBoundingClientRect().top;e>0&&e<t._maxGap?t._setMediaSticky():e>=t._maxGap?t._setMediaBottom():t._removeMediaModifiers()})):this._removeMediaModifiers()}},{key:"_maxGap",get:function(){return s.default.getElementHeight(this._element)-s.default.getElementHeight(this._mediaContainer)}}])&&r(e.prototype,i),o&&r(e,o),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return o}));var n=i(1),s=i(0);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=function(){function t(e,i){var n=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._referenceElementEnd,this._isPinned=!1,this._pinnedConfig={position:0,end:"",activeClass:null,endless:!1},this._currentScroll=0,this._boundaries=[],this._pinnedElement=e,this._pinnedElementSelector=i,s.store.subscribe(s.store.topics.SCROLL_CHANGE,(function(){n._handleScrollChange()})),s.store.subscribe(s.store.topics.RESIZE,(function(){n._resetPosition()})),s.store.subscribe(s.store.topics.SLICK_EVENT,(function(){n._updateBoundaries()})),this._init()}var e,i,o;return e=t,(i=[{key:"_resetPosition",value:function(){var t=this._isPinned;t&&this._unPinElement(),this._updateBoundaries(),t&&this._pinElement()}},{key:"_handleScrollChange",value:function(){this._currentScroll=s.store.getStateValue("scrollPosition"),this._updateElementPosition()}},{key:"_init",value:function(){var t=this._pinnedElement.dataset[n.default.getDataAttributeKey(this._pinnedElementSelector)];this._pinnedConfig=Object.assign(this._pinnedConfig,JSON.parse((t||"{}").replace(/'/g,'"'))),this._pinnedConfig.end&&(this._referenceElementEnd=document.querySelector(this._pinnedConfig.end)),this._updateBoundaries(),this._updateElementPosition()}},{key:"_updateBoundaries",value:function(){var t=this._referenceElementEnd?this._referenceElementEnd.offsetTop:this._pinnedElement.offsetTop+this._pinnedElement.offsetHeight;this._boundaries=[this._pinnedElement.offsetTop,t],this._updateElementPosition()}},{key:"_updateElementPosition",value:function(){this._isInBoundaries()?this._updatePositionInsideBoundaries():this._updatePositionOutsideBoundaries()}},{key:"_updatePositionInsideBoundaries",value:function(){s.store.getStateValue("isScrollingDown")?this._pinElement():this._isPinned||(this._pinElement(),this._fadeInDown()),this._isPinned=!0}},{key:"_pinElement",value:function(){this._pinnedElement.style.position="fixed",this._pinnedConfig.activeClass?this._pinnedElement.classList.add(this._pinnedConfig.activeClass):this._pinnedElement.style.top="".concat(this._pinnedConfig.position,"px")}},{key:"_fadeInDown",value:function(){var t=this;this._pinnedElement.classList.add("p-animations__fade-in-down-pinned"),setTimeout((function(){t._pinnedElement.classList.remove("p-animations__fade-in-down-pinned")}),500)}},{key:"_updatePositionOutsideBoundaries",value:function(){this._isPinned&&(s.store.getStateValue("isScrollingDown")?this._fadeOut():this._unPinElement(),this._isPinned=!1)}},{key:"_unPinElement",value:function(){this._pinnedElement.style.position="",this._pinnedElement.style.top="auto",this._pinnedConfig.activeClass&&this._pinnedElement.classList.remove(this._pinnedConfig.activeClass)}},{key:"_fadeOut",value:function(){var t=this;this._pinnedElement.classList.add("p-animations__fade-out-pinned"),setTimeout((function(){t._unPinElement(),t._pinnedElement.classList.remove("p-animations__fade-out-pinned")}),500)}},{key:"_isInBoundaries",value:function(){var t=this._pinnedConfig,e=t.position,i=t.endless,n=this._currentScroll>this._boundaries[0]-e,s=i||this._currentScroll<this._boundaries[1];return n&&s}}])&&r(e.prototype,i),o&&r(e,o),t}()},function(t,e,i){"use strict";function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.r(e),i.d(e,"default",(function(){return s}));var s=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._element=e,this._selectors={AMBIENT_VIDEO:".a-ambient-video__video",CTA:".a-ambient-video__cta"},this._video=this._element.querySelector(this._selectors.AMBIENT_VIDEO),this._button=this._element.querySelector(this._selectors.CTA),this._button.addEventListener("click",this._handleClick.bind(this))}var e,i,s;return e=t,(i=[{key:"_handleClick",value:function(){this._video.paused?this._video.play():this._video.pause(),this._element.classList.toggle("playing",!this._video.paused)}}])&&n(e.prototype,i),s&&n(e,s),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return n}));var n=function t(e,i){var n=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var s=i.replace(".","");this._el=e,this._$el=$(e),this._slider=this._$el.find("".concat(i,"__items")),this._$el.on("click",(function(t){var e=$(t.target),n=e.closest("".concat(i,"__button-cta")).length>0,s=e.closest("".concat(i,"__dots")).length>0,r=e.closest("".concat(i,"__compare")).length>0;(n||s||r)&&t.preventDefault()})),this._$el.find("".concat(i,"__compare")).on("click",(function(){n._$el.toggleClass("".concat(s,"--selected"))}));var r=this._$el.find("".concat(i,"__button-prev")),o=this._$el.find("".concat(i,"__button-next"));this._slider.slick({accessibility:!1,dots:!0,infinite:!0,dotsClass:"slick-dots ".concat(s,"__dots"),prevArrow:r.html(),nextArrow:o.html()})}},function(t,e,i){"use strict";function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.r(e),i.d(e,"default",(function(){return s}));var s=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._CLASSES={CONTENT:"m-loader__content",BUTTON_CONTAINER:"m-loader__button-container",CONTENT_HIDDEN:"m-loader__content--hidden",BUTTON_CONTAINER_HIDDEN:"m-loader__button-container--hidden"},this._loaderContent=e.querySelector(".".concat(this._CLASSES.CONTENT)),this._loaderButtonContainer=e.querySelector(".".concat(this._CLASSES.BUTTON_CONTAINER)),this._loaderButton=this._loaderButtonContainer.firstElementChild,this._loaderButton.addEventListener("click",this._toggleLoader.bind(this))}var e,i,s;return e=t,(i=[{key:"_toggleLoader",value:function(){this._loaderContent.classList.toggle(this._CLASSES.CONTENT_HIDDEN),this._loaderButtonContainer.classList.toggle(this._CLASSES.BUTTON_CONTAINER_HIDDEN)}}])&&n(e.prototype,i),s&&n(e,s),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return r}));var n=i(0);function s(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var r=function(){function t(e){var i=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._element=e,this._CLASSES={TRIGGER:"m-accordion__trigger",TRIGGER_EXPANDING:"m-accordion__trigger--expanding",TRIGGER_EXPANDED:"m-accordion__trigger--expanded",PANEL_EXPANDED:"m-accordion__panel--expanded"},this._triggers=e.querySelectorAll(".".concat(this._CLASSES.TRIGGER));var s=e.dataset.expanded;s&&this._toggleByIndex(s-1),this._triggers.forEach((function(t){t.addEventListener("click",i._addClickEvent.bind(i),!0),t.addEventListener("keydown",i._addKeyListener.bind(i))})),n.store.subscribe(n.store.topics.PCP_PROD_FILTERS_RESIZE,(function(t){i._toggleSection(t.trigger,!0,!0),i._expanded=null}))}var e,i,r;return e=t,(i=[{key:"_toggleByIndex",value:function(t){var e=this._triggers[t];this._toggleSection(e)}},{key:"_toggleSection",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],s=t.getAttribute("aria-controls"),r=document.getElementById(s);this._toggleTrigger(t,e),this._togglePanel(r,e),this._expanded=t,n.store.publish(n.store.topics.TOGGLE_ACCORDION,{panel:r,trigger:t}),i&&t.classList.remove(this._CLASSES.TRIGGER_EXPANDED)}},{key:"_addClickEvent",value:function(t){var e=t.target;e.classList.contains(this._CLASSES.TRIGGER_EXPANDED)?(this._toggleSection(e,!0),this._expanded=null):(e.blur(),this._expanded&&this._toggleSection(this._expanded,!0),this._toggleSection(e),setTimeout((function(){e.focus()}),300))}},{key:"_toggleTrigger",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t.setAttribute("aria-expanded",!e),t.classList.toggle(this._CLASSES.TRIGGER_EXPANDED)}},{key:"_togglePanel",value:function(t){var e=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];t.classList.toggle(this._CLASSES.PANEL_EXPANDED);var i=e?"0":"".concat(t.firstElementChild.offsetHeight,"px");t.setAttribute("style","--height: ".concat(i)),t.setAttribute("ie-style","--height: ".concat(i))}},{key:"_addKeyListener",value:function(t){var e=t.which.toString();this._bindUpDownKeys(t),this._bindHomeKey(e),this._bindEndKey(e)}},{key:"_bindUpDownKeys",value:function(t){var e=t.which.toString();if(/38|40/.test(e)||this._getCtrlModifier(t)){var i=this._getNewIndex(t.target,/38|40/.test(e));this._focusTrigger(i)}}},{key:"_bindHomeKey",value:function(t){36===t&&this._focusTrigger(0)}},{key:"_bindEndKey",value:function(t){35===t&&this._focusTrigger(this._triggers.length-1)}},{key:"_getCtrlModifier",value:function(t){var e=t.which.toString();return t.ctrlKey&&/33|34/.test(e)}},{key:"_getNewIndex",value:function(t,e){var i=Array.prototype.indexOf.call(this._triggers,t),n=this._triggers.length;return(i+n+(e?1:-1))%n}},{key:"_focusTrigger",value:function(t){this._triggers[t].focus()}}])&&s(e.prototype,i),r&&s(e,r),t}()},function(t,e,i){"use strict";i.r(e),i.d(e,"default",(function(){return r}));var n=i(0);function s(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var r=function(){function t(e){var i=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._element=e,this._width=0,this._tabletLarge=975,this._dropdownLeftOffset=20,this._CLASSES={MODAL_DESKTOP:"o-pcp-product-filters--modal-desktop",SORT_ITEM:"o-pcp-product-filters__sort-item",PRIMARY_FIRST:"o-pcp-product-filters__primary-item--first"},this._mobileModal=e,this._desktopModal=this._element.querySelector(".".concat(this._CLASSES.MODAL_DESKTOP)),this._currentPanel=null,this._openedPanels=[],this._currentTrigger=null,this._modalAttributes={role:"dialog","aria-label":"",id:"","aria-modal":"true"},this._resetModals(),n.store.subscribe(n.store.topics.RESIZE,(function(){i._resetModals(),i._currentTrigger&&n.store.publish(n.store.topics.PCP_PROD_FILTERS_RESIZE,{panel:i._currentPanel,trigger:i._currentTrigger})})),n.store.subscribe(n.store.topics.TOGGLE_ACCORDION,(function(t){i._currentPanel=t.panel,i._openedPanels.find((function(e){return e===t.panel}))||i._openedPanels.push(t.panel),i._currentTrigger=t.trigger}))}var e,i,r;return e=t,(i=[{key:"_resetModals",value:function(){this._width=window.innerWidth,this._clearModal(this._mobileModal),this._clearModal(this._desktopModal),this._width>this._tabletLarge?this._initModal(this._desktopModal):this._initModal(this._mobileModal)}},{key:"_initModal",value:function(t){var e=this;t&&(this._modalAttributes["aria-label"]=t.dataset.modalTitle,this._modalAttributes.id=t.dataset.modalId,Object.keys(this._modalAttributes).forEach((function(i){t.setAttribute(i,e._modalAttributes[i])})))}},{key:"_clearModal",value:function(t){t&&Object.keys(this._modalAttributes).forEach((function(e){t.removeAttribute(e)}))}}])&&s(e.prototype,i),r&&s(e,r),t}()},,,,,,function(t,e,i){"use strict";i.r(e),i.d(e,"resizeService",(function(){return o}));var n=i(0),s=i(1);function r(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var o=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t)}var e,i,o;return e=t,(i=[{key:"initialize",value:function(){var t=this;window.addEventListener("resize",s.default.debounce((function(){t._handleResize()}),1e3))}},{key:"_handleResize",value:function(){n.store.publish(n.store.topics.RESIZE)}}])&&r(e.prototype,i),o&&r(e,o),t}())},function(t,e,i){"use strict";i.r(e),i.d(e,"scrollService",(function(){return l}));var n=i(1),s=i(0);function r(t,e){var i;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(i=function(t,e){if(!t)return;if("string"==typeof t)return o(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);"Object"===i&&t.constructor&&(i=t.constructor.name);if("Map"===i||"Set"===i)return Array.from(t);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return o(t,e)}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var n=0,s=function(){};return{s:s,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,a=!0,l=!1;return{s:function(){i=t[Symbol.iterator]()},n:function(){var t=i.next();return a=t.done,t},e:function(t){l=!0,r=t},f:function(){try{a||null==i.return||i.return()}finally{if(l)throw r}}}}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function a(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var l=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._animatedElements=new Set,this._trackingAttribute="[data-track-scrolling]",this._cssScrollPositionVariable="--scroll-position",this._observerDefaults={rootMargin:"350px 0px 350px 0px",threshold:[0,.5,1]},this._lastKnownScrollPosition=0,this._isTicking=!1,this._observer=null,this._fallBackClass="no-animation",this._trackedSections=[]}var e,i,o;return e=t,(i=[{key:"initialize",value:function(){var t=this;window.addEventListener("scroll",(function(){t._handleScroll()})),"IntersectionObserver"in window&&(this._observer=new IntersectionObserver((function(e){t._handleVisibility(e)}),this._observerDefaults),this._trackElements())}},{key:"_handleScroll",value:function(){var t=window.pageYOffset;s.store.setState({scrollPosition:this._lastKnownScrollPosition,isScrollingDown:this._lastKnownScrollPosition<t}),s.store.publish(s.store.topics.SCROLL_CHANGE),this._lastKnownScrollPosition=t>=0?t:0,this._requestTick()}},{key:"_requestTick",value:function(){var t=this;this._isTicking||requestAnimationFrame((function(){t._updateScrollPosition()}))}},{key:"_updateScrollPosition",value:function(){var t=Math.round(this._lastKnownScrollPosition);this._setScrollPosition(this._animatedElements,t),this._isTicking=!1}},{key:"_setScrollPosition",value:function(t,e){var i=this;t.forEach((function(t){t.style.setProperty(i._cssScrollPositionVariable,"".concat(e,"px"))}))}},{key:"_trackElements",value:function(){this._trackedElements=document.querySelectorAll(this._trackingAttribute),this._setScrollPosition(this._trackedElements,window.scrollY);var t,e=r(this._trackedElements);try{for(e.s();!(t=e.n()).done;){var i=t.value;n.default.attachClass(i,this._trackingAttribute),this._observer.observe(i)}}catch(t){e.e(t)}finally{e.f()}}},{key:"_handleVisibility",value:function(t){var e=this;t.forEach((function(t){t.isIntersecting?e._animatedElements.add(t.target):e._animatedElements.delete(t.target)}))}}])&&a(e.prototype,i),o&&a(e,o),t}())},function(t,e,i){"use strict";i.r(e),i.d(e,"stickyService",(function(){return a}));var n=i(0),s=i(1);function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var a=new(function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},i=e.targetClass,n=void 0===i?"m-sticky-ctas-header":i,s=e.triggerSelector,o=void 0===s?"[data-sticky-trigger]":s;r(this,t),this._triggerSelector=o,this._targetClass=n,this._visibleClass="".concat(this._targetClass,"--visible"),this._hiddenClass="".concat(this._targetClass,"--hidden"),this._uninitializedClass="".concat(this._targetClass,"--uninitialized"),this._targets=[],this._trigger=null,this._enabledIntersectionObserver="IntersectionObserver"in window&&!!window.IntersectionObserver,this._intersectionObserverOptions={},this._observer=null,this._resizeTimer=null}var e,i,a;return e=t,(i=[{key:"initialize",value:function(){this._targets=Array.from(document.getElementsByClassName(this._targetClass)),this._trigger=document.querySelector(this._triggerSelector),this._targets.length<1||(this._trigger?this._enabledIntersectionObserver?(this._createObserver(),window.addEventListener("resize",this._createTimer.bind(this),!1)):this._initIE():this._uninitialized())}},{key:"_initIE",value:function(){var t=this,e=s.default.throttle((function(){var e=t._trigger.getBoundingClientRect().bottom;t._assignTargetClasses(e>0)}),100);n.store.subscribe(n.store.topics.SCROLL_CHANGE,e),e()}},{key:"_createTimer",value:function(){var t=this;this._resizeTimer&&clearTimeout(this._resizeTimer),this._resizeTimer=setTimeout((function(){t._destroyObserver(),t._createObserver()}),250)}},{key:"_createObserver",value:function(){var t=this;this._observer=new IntersectionObserver((function(e){var i=e.find((function(e){return e.target===t._trigger})),n=i&&i.isIntersecting;t._assignTargetClasses(n)})),this._observer.observe(this._trigger)}},{key:"_destroyObserver",value:function(){this._observer&&this._observer.disconnect()}},{key:"_assignTargetClasses",value:function(t){var e=this;this._targets.forEach((function(i){i.classList.add(t?e._hiddenClass:e._visibleClass),i.classList.remove(t?e._visibleClass:e._hiddenClass)}))}},{key:"_uninitialized",value:function(){var t=this;this._targets.forEach((function(e){e.classList.remove(t._hiddenClass,t._visibleClass),e.classList.add(t._uninitializedClass)}))}}])&&o(e.prototype,i),a&&o(e,a),t}())},function(t,e,i){"use strict";i.r(e),i.d(e,"viewService",(function(){return m}));var n=i(13),s=i(14),r=i(15),o=i(16),a=i(17),l=i(18),c=i(19),u=i(20),h=i(21),_=i(22),d=i(23);function f(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var m=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._components={".a-ambient-video":c.default,".o-exploded-view__animation":r.default,"[data-pinned]":l.default,".o-hero--product":o.default,".o-media-with-list":a.default,"[data-role=countdown]":s.default,"[data-animate-svg]":n.default,".m-product-tile":u.default,".m-loader":h.default,"[data-role=accordion]":_.default,".o-pcp-product-filters":d.default}}var e,i,m;return e=t,(i=[{key:"initialize",value:function(){var t=this,e=Object.keys(this._components);console.warn("======== refresh-staging ========"),e.forEach((function(e){for(var i=document.querySelectorAll(e),n=0;n<i.length;n++){var s=i[n];t._createAnimation(s,e)}}))}},{key:"_createAnimation",value:function(t,e){this._components[e]&&new this._components[e](t,e)}}])&&f(e.prototype,i),m&&f(e,m),t}())},function(t,e,i){"use strict";i.r(e),i.d(e,"visibilityService",(function(){return l}));var n=i(1),s=i(0);function r(t,e){var i;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(i=function(t,e){if(!t)return;if("string"==typeof t)return o(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);"Object"===i&&t.constructor&&(i=t.constructor.name);if("Map"===i||"Set"===i)return Array.from(t);if("Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return o(t,e)}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var n=0,s=function(){};return{s:s,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:s}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,a=!0,l=!1;return{s:function(){i=t[Symbol.iterator]()},n:function(){var t=i.next();return a=t.done,t},e:function(t){l=!0,r=t},f:function(){try{a||null==i.return||i.return()}finally{if(l)throw r}}}}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,n=new Array(e);i<e;i++)n[i]=t[i];return n}function a(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var l=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._observerDefaults={root:null,rootMargin:"0px 0px -25% 0px",threshold:[0,.33,.66,1]},this._trackingAttribute="[data-track-visibility]",this._animationDelay="[data-animation-delay]",this._intersectionRatio="[data-intersection-ratio]",this._componentPositionVariable="--component-position",this._trackedSections=[],this._fallBackClass="no-animation"}var e,i,o;return e=t,(i=[{key:"initialize",value:function(){var t=this;if(this._trackedSections=document.querySelectorAll(this._trackingAttribute),"IntersectionObserver"in window){var e,i=new IntersectionObserver((function(e){return t._handleVisibility(e)}),this._observerDefaults),n=r(this._trackedSections);try{for(n.s();!(e=n.n()).done;){var s=e.value;i.observe(s)}}catch(t){n.e(t)}finally{n.f()}}else this._setAllVisible()}},{key:"_setAllVisible",value:function(){for(var t=0;t<this._trackedSections.length;t++)this._trackedSections[t].classList.add(this._fallBackClass)}},{key:"_setComponentPosition",value:function(t){var e=this,i=t.$pos||null;requestAnimationFrame((function(){var n=Math.round(t.offsetTop);i!==n&&(t.style.setProperty(e._componentPositionVariable,"".concat(n,"px")),t.$pos=n)}))}},{key:"_handleVisibility",value:function(t){var e=this;t.forEach((function(t){e._setComponentPosition(t.target);var i=n.default.getSimpleDataAttribute(t.target,e._intersectionRatio),r=n.default.getSimpleDataAttribute(t.target,e._animationDelay)||0;t.isIntersecting&&e._checkIntersectionRatio(t,i)?setTimeout((function(){n.default.attachClass(t.target,e._trackingAttribute),s.store.publish(s.store.topics.ELEMENT_VISIBLE,t.target)}),1e3*r):s.store.publish(s.store.topics.ELEMENT_NOT_VISIBLE,t.target)}))}},{key:"_checkIntersectionRatio",value:function(t,e){return!(!this._isLandscape()&&e)||t.intersectionRatio>e}},{key:"_isLandscape",value:function(){var t=(screen.orientation||{}).type||screen.mozOrientation||screen.msOrientation;return t&&t.indexOf("landscape")>-1}}])&&a(e.prototype,i),o&&a(e,o),t}())},,,,,,,,,,,,function(t,e,i){"use strict";i.r(e);var n=i(29),s=i(30),r=i(31),o=i(32),a=i(33);document.addEventListener("DOMContentLoaded",(function(){s.scrollService.initialize(),r.stickyService.initialize(),n.resizeService.initialize()})),window.addEventListener("load",(function(){a.visibilityService.initialize(),o.viewService.initialize()}))}]);