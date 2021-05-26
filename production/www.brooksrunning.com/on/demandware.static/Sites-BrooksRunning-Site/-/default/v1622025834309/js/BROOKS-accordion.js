/*-------------------------------------------------------------------------------------
::
::  Brooks accordion
::  Code Chris Burke
::  NOTE: Initialized in brooks.js
::  
::-------------------------------------------------------------------------------------
:: Initalization:
:: BROOKS.accordion = new accordion({ el: $('footer .accordion') });
:: 
:: Initialize as many times as needed, each time binding to the new relevant elements
::
::-------------------------------------------------------------------------------------*/

var accordion = function (options) {
	var thisAccordion = this;
    this.el = options.el;
    var control = this.el.find('.control');
	var accordionOpen = false;
    //methods
    
    this.open = function () {
        this.el.addClass('open');
        accordionOpen = true;
    };
  
    
    this.close = function () {
        this.el.removeClass('open');
        accordionOpen = false;
    };
    
    control.off('click').on('click',function(a) {
    	
    	a.preventDefault();
        if(!accordionOpen) {
            thisAccordion.open();
        } else {
            thisAccordion.close();
        };
    });
};
    