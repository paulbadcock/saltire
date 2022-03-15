/*
Author: Able Sense Media
Web: ablesense.com
Date of creation: 2015/07/30
*/

var APP = (function () {
	var me = {},
	browser = {};

	function getSVGsupport() {
		return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
	}

	function getViewportSize() {
		browser.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		browser.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	}

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			}, wait);
			if (immediate && !timeout) func.apply(context, args);
		};
	}

	me.cancelEvent = function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	};

	me.onResize = function(callback) {
		callback();

		if (window.addEventListener) {
			window.addEventListener('resize', debounce(function() {
				callback();
			}, 200), false);
		}
	};

	browser.supportsSVG = getSVGsupport();
	browser.viewportSize = getViewportSize();
	browser.viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	browser.viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	me.onResize(getViewportSize);

	me.browser = browser;

	return me;
})();


(function() {
	var html = $('html');
	html.removeClass('no-js');

	if (document.createElement('input').placeholder !== undefined) {
		html.removeClass('no-placeholder');
	}

	if (!APP.browser.supportsSVG) {
		var imgElement = document.getElementsByTagName('img');

		for (var i = 0; imgElement.length > i; i++) {
			imgElement[i].src = imgElement[i].src.replace('.svg', '.png');
		}
	} else {
		html.removeClass('no-svg');
	}

	// Js Polyfills
	// Returns the largest number in an array
	Array.max = function(array){
		return Math.max.apply(Math, array);
	};

	// getComputedStyle polyfill
	if (!window.getComputedStyle) {
		window.getComputedStyle = function(el, pseudo) {
			this.el = el;
			this.getPropertyValue = function(prop) {
				var re = /(\-([a-z]){1})/g;
				if (prop == 'float') prop = 'styleFloat';
				if (re.test(prop)) {
					prop = prop.replace(re, function () {
						return arguments[2].toUpperCase();
					});
				}
				return el.currentStyle[prop] ? el.currentStyle[prop] : null;
			};
			return this;
		};
	}

	// Add angles with js - to featured container ( current on the homepage )
	var featuredImgContainer = $('.featured-img-container-add-angles-js'),
		featuredImg = $('.featured-img-container-add-angles-js img'),
		featuredAngles = document.createElement('div'),
		featuredAngles2 = document.createElement('div'),
		featuredAngles_container = document.createElement('div');

		featuredAngles.className = 'featured-angles-js';
		featuredAngles2.className = 'featured-angles-js';
		featuredAngles_container.className = 'featured-angles-container-js';

	if (featuredImgContainer.nodeType === 1) {
		featuredImgContainer.appendChild(featuredAngles_container);
		featuredAngles_container.appendChild(featuredImg);
		featuredAngles_container.appendChild(featuredAngles);
		featuredAngles_container.appendChild(featuredAngles2);
	}

	// Navigation
	var check_if_resized,
		check_bodyPseudo,
		bodyPseudo = document.createElement('div'),
		navigation = $('#navigation'),
		langSwitcher = $('.language-switcher-locale-session'),
		navList = $('#navigation .menu'),
		header = $('#header'),
		search = $('.search-box'),
		mobile_trigger = advanced_createElement('a', 'mobile-trigger'),
		mobile_close = advanced_createElement('a', 'mobile-close'),
		mobile_fake_body = advanced_createElement('a', 'mobile-close-body-area');

	bodyPseudo.className = 'pseudo__body';
	bodyPseudo.id = 'pseudo__body';

	if (search.nodeType === 1) {
		var	search_original_sibling;
		if (nextElementSibling(search)) {
			search_original_sibling = $('#navigation');
		}
	}

	mobile_close.className = 'hidden';
	mobile_trigger.className = 'hidden';
	mobile_fake_body.className = 'hidden';
	mobile_close.tabIndex = 500;
	mobile_trigger.tabIndex = 500;
	mobile_close.tabIndex = 500;

	// Add elements
	prependChild(document.body, mobile_fake_body);
	prependChild(navigation, mobile_close);
	prependChild(header, mobile_trigger);

	// Click functions
	mobile_close.onclick = close_nav;
	mobile_fake_body.onclick = close_nav;

	function close_nav() {
		if (checkClass(navigation, 'is-open')) {
			navigation.removeClass('is-open');
			removeClass(document.body, 'nav-is-open');
			removeClass(mobile_fake_body, 'is-visible');

			setTimeout(function() {
				mobile_fake_body.style.zIndex = -1000;
			}, 200);

		} else {
			return;
		}
	}

	APP.onResize(function() {
		if (APP.browser.viewportWidth < 768) {
			if (!check_if_resized) {
				wait_for_resize(navigation);

				navigation.addClass('mobile');

				removeClass(mobile_close, 'hidden');
				removeClass(mobile_fake_body, 'hidden');
				removeClass(mobile_trigger, 'hidden');

				mobile_trigger.onclick = function() {
					navigation.addClass('is-open');
					addClass(document.body, 'nav-is-open');
					addClass(mobile_fake_body, 'is-visible');
					mobile_fake_body.style.zIndex = 2000;
				};

				var timeoutClear2 = window.setTimeout(function() {
					try { // Added the back button to submenus injected from the sidebar navigation
						addClass($('li.expanded > a.active-trail').parentNode.parentNode.parentNode,
								'active-trail__has-child-active-trail');
						prepend_With_Back_Button($class('submenu'));
						window.clearTimeout(timeoutClear2);
					} catch(e) { // Used instead of multiple if statements with an optional error log check
						// cl(e); // Shorthand for console.log function that has a fallback
					}
				}, 5); // Wait for other dom manipulations with the min time allowed

				if (checkClass(navigation, 'has-search')) {
					addClass(mobile_trigger, 'add-search-icon');

					if (search) {
						prependChild(navigation, search);
					}
				}

				if (!check_bodyPseudo) {
					wrapIn_pseudo__body();
					check_bodyPseudo = true;
				}
				navigation.style.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) + 'px';

				check_if_resized = true;
				if (test($('.search-box')) && test(langSwitcher)) {
					appendElement($('.search-box'), langSwitcher);
				}
			}
		} else {
			if (check_if_resized) {
				check_if_resized = false;

				if (test($class('btn-back'))) {
					removeElement($class('btn-back'));
				}

				if (test($('.nav--is-open__submenu'))) {
					$('.nav--is-open__submenu').removeClass('nav--is-open__submenu');
				}

				if (checkClass(navigation, 'is-open')) {
					close_nav();
				}
				navigation.style.height = '';

				addClass(mobile_close, 'hidden');
				addClass(mobile_trigger, 'hidden');

				navigation.removeClass('mobile');

				if (check_bodyPseudo) {
					unWrap_pseudo__body();
					check_bodyPseudo = false;
				}
				try {
					prependChild($('#header .container'), langSwitcher);
				} catch(e) {
					// cl(e);
				}

				if (search) {
					prependElement(search_original_sibling, search);
				}
			}
		}
		var timeoutClear = window.setTimeout(function() {
			try {
				if ($('.has-children.active-trail').nodeType === 1 || $('.has-children.active-trail').length  > 0) {
					addClass($('.has-children.active-trail > ul > .active-trail').parentNode.parentNode, 'active-trail__has-child-active-trail');
				}
			} catch(e) {}
			window.clearTimeout(timeoutClear);
		}, 5);
	});

	function wrapIn_pseudo__body(el) {
		el = $('body > *');
		var el_l = el.length || 1;
		prependChild(document.body, bodyPseudo);
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			bodyPseudo.appendChild(el_i);
		}
		document.body.appendChild(navigation);
		document.body.appendChild(mobile_fake_body);
	}

	function unWrap_pseudo__body(el) {
		el = $('#pseudo__body > *');
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			document.body.appendChild(el_i);
		}
		$('#header > .container').appendChild(navigation);
		removeElement(bodyPseudo);
	}

	try {
		var youAreHereText = document.getElementById('you-are-here-text');
		youAreHereText.removeAttribute('aria-hidden');
		prependChild($('#navigation li.active-trail > a'), youAreHereText);
	} catch(e) {
		// cl(e);
	}

	var footer_has_moved_check,
		inner_Navigation = $('#navigation > div'),
		navigation_footer__Row = $('#navigation-footer .row'),
		navigation_footer__Row__Back_Button = $('.btn-back'),
		sidebar_has_moved_check,
		sidebar_first__menu = $('.sidebar_first > div > ul'),
		sidebar_first__menu__active = $('.sidebar_first > div > ul > li > .active-trail');

	try {
		if (sidebar_first__menu.nodeType === 1) {
			sidebar_first__menu.addClass('menu__sidebar');
		}
	} catch(e) {
		// cl(e);
	}

	function prepend_With_Back_Button(el) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.insertAdjacentHTML('afterbegin', '<li><a href="#navigation" class="btn-back" aria-hidden="false">Back</a></li>');
		}
	}

	try {
		var alert = $('.alert');
		if(alert.nodeType === 1) {
			window.onscroll = runAlertCalc;
		}
	} catch(e) {
		// cl(e);
	}

	function runAlertCalc() {
		var calcAlert = alert.getBoundingClientRect().top - Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		if(calcAlert < 0) {
			addClass(alert, 'alert-in-view');
		}
	}

	addClass(document.querySelector('#navigation .menu'), 'menu__first-of-type');

	//
	// Has to prevent default
	APP.onResize(function() {
		if (APP.browser.viewportWidth < 768) {
			if(!sidebar_has_moved_check) {
				try	{
					$('#navigation > div > ul > li.active-trail').appendChild(sidebar_first__menu);
				} catch(e) {
					// cl(e);
				}
				sidebar_has_moved_check = true;
			}
			if (!footer_has_moved_check) {

				try	{
					inner_Navigation.appendChild(navigation_footer__Row);
					remove_hidden(navigation_footer__Row__Back_Button);
				} catch(e) {
					// cl(e);
				}

				click($('.mobile-navigation-summary'), mobile_submenu__open);
				click(sidebar_first__menu__active, mobile_submenu__open);
				click(navigation_footer__Row__Back_Button, mobile_submenu__close);

				var timeoutClear3 = window.setTimeout(function() {
					click($class('btn-back'), mobile_submenu__close);
					window.clearTimeout(timeoutClear3);
				}, 5);

				footer_has_moved_check = true;
			}
		}
		else {
			if (sidebar_has_moved_check) {
				try	{
					$('.sidebar_first > div').appendChild(sidebar_first__menu);
				} catch(e) {
					// cl(e);
				}
				try	{
					removeElement($('.menu__sidebar .btn-back'));
				} catch(e) {
					// cl(e);
				}
				sidebar_has_moved_check = false;
			}

			if (footer_has_moved_check) {
				try	{
					$('#navigation-footer > div').appendChild(navigation_footer__Row);
				} catch(e) {
					// cl(e);
				}
				footer_has_moved_check = false;
			}
		}
	});

	function mobile_submenu__open() {
		if (this.nextElementSibling) {
			event.preventDefault();
			addClass(this.nextElementSibling, 'is-open__submenu');
			addClass(navigation, 'nav--is-open__submenu');
		}
	}

	function mobile_submenu__close() {
		event.preventDefault();
		removeClass($('.is-open__submenu'), 'is-open__submenu');
		removeClass(navigation, 'nav--is-open__submenu');
	}

	// Flag sidebar injection
	var sidebarList,
		activeLink,
		sidebar = $('.sidebar_first'),
		sidebarList_test = $('.sidebar_first ul'),
		activeLink_test = $('#navigation .active-trail');

		var breadcrumbs = $('#breadcrumbs'),
			heroHeadline = $('#hero-headline'),
			heroHeadlineContainer = $('#hero-headline-container'),
			heroHeadlineContainer_Img = $('#hero-headline-container>img');

		if (heroHeadline.nodeType && breadcrumbs.nodeType) {
			breadcrumbs.addClass('has-hero-headline');
		}

		if (heroHeadlineContainer_Img.nodeType) {
			if(!checkClass(html, 'ie')) {
				heroHeadlineContainer.style.backgroundImage = 'url('+ heroHeadlineContainer_Img.src+ ')';
				heroHeadlineContainer_Img.style.display = 'none';
			}
		}

	// Helper Functions
	//
	// Basic selector function
	function $(p) {
		if(document.querySelectorAll) {
			var el = document.querySelectorAll(p);

			if (el.length === 1) {
				el = el[0];
			}

			el.addClass = function(param) {
				addClass(el, param);
			};

			el.removeClass = function(param) {
				removeClass(el, param);
			};

			el.toggleClass = function(param) {
				toggleClass(el, param);
			};

			return el;
		}
	}

	function checkClass(el, param) {
		return el.className.indexOf(param) > -1;
	}

	function addClass(el, param) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (!checkClass(el_i, param)) {
				el_i.className += ' ' + param;
			}
		}
	}

	function removeClass(el, param) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (checkClass(el_i, param)) {
				el_i.className = el_i.className.replace(param, '');
			}
		}
	}

	function toggleClass(el, param) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (!checkClass(el_i, param)) {
				el_i.className += ' ' + param;
			} else if (checkClass(el_i, param)) {
				el_i.className = el_i.className.replace(param, '');
			}
		}
	}

	function removeElement(el) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.parentNode.removeChild(el_i);
		}
	}

	function click(el, p) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.onclick = p;
		}
	}

	function prevElementSibling_addClass(el, param) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (el_i.previousElementSibling) {
				addClass(el_i.previousElementSibling, param);
			}
		}
	}

	function $class(param) { // live node option
		var el = document.getElementsByTagName('*'),
			el_l = el.length || 1;
		var el_a = [];
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (checkClass(el_i, param)) {
				el_a.push(el_i);
			}
		}
		return el_a;
	}

	function remove_hidden(el) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.setAttribute('aria-hidden', 'false');
			removeClass(el_i, 'hidden');
		}
	}

	function add_hidden(el) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.setAttribute('aria-hidden', 'true');
			addClass(el_i, 'hidden');
		}
	}

	// Use the appendChild instead of 'beforeend'
	function pseudo_insertAdjacentElement(el_too, pos, el) {
		el_too.insertAdjacentHTML(pos, '<p id="i1_-"></p>');
		var temp_el = document.getElementById('i1_-');

		if (pos === 'afterbegin') {
			el_too.replaceChild(el, temp_el);
		} else {
			el_too.parentNode.replaceChild(el, temp_el);
		}
	}

	function prependChild(el_too, el) {
		pseudo_insertAdjacentElement(el_too, 'afterbegin', el);
	}

	function prependElement(el_too, el) {
		pseudo_insertAdjacentElement(el_too, 'beforebegin', el);
	}

	function appendElement(el_too, el) {
		pseudo_insertAdjacentElement(el_too, 'afterend', el);
	}

	function nextElementSibling(el) {
		var parent_children = el.parentNode.children;
		for (var i = 0; parent_children.length > i; i++) {
			if (parent_children[i] === el) {
				return parent_children[i + 1];
			}
		}
	}

	function advanced_createElement(el_tag, el_id, el_class) {
		var el = document.createElement(el_tag);
		el_id = el_id || el_tag + Math.floor(Math.random()*100);
		el_class = el_class || el_id;

		el.id = el_id;
		el.className = el_class;

		return el;
	}

	function wait_for_resize(el, p_time) {
		el.addClass('hidden');
		p_time = p_time || 200;

		var timeoutClear_for_resize = window.setTimeout(function() {
			el.removeClass('hidden');
			window.clearTimeout(timeoutClear_for_resize);
		}, p_time);
	}

	function findFirstElementOfType(el, f_el) {
		var el_c = el.children,
			f_el_u = f_el.toUpperCase();
			el_l = el_c.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el_c[i];

			if (el_i.nodeName === f_el_u) {
				return el_i;
			}
		}
	}

	function test(el) {
		if (el) {
			var el_l = el.length || 1;
			if(el_l > 1) {
				return el[0].nodeType === 1;
			} else {
				return el.nodeType === 1;
			}
		} else {
			return false;
		}
	}

	function copyElementHTML(el) {
		var temp_el = document.createElement('span');
		prependElement(el, temp_el);
		temp_el.appendChild(el);

		var get_HTML = temp_el.innerHTML;
		appendElement(temp_el, el);
		el.parentNode.removeChild(temp_el);
		return get_HTML;
	}

	function cl(p) {
		return window.console && console.log(p);
	}


	wrapInThis($('#navigation .menu > li > a'));
	function wrapInThis(el, wrap) {
		var el_l = el.length || 1;
		wrap = wrap || 'span';
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			el_i.innerHTML = '<'+ wrap +'>'+ el_i.innerHTML +'</'+ wrap +'>';
		}
	}

	var testScrollbarWidthEvent;
	APP.onResize(function() {
		function getScrollbarWidth() {
			var outer = document.createElement('div');
			outer.style.visibility = 'hidden';
			outer.style.width = '100px';
			outer.style.msOverflowStyle = 'scrollbar';
			document.body.appendChild(outer);

			var widthNoScroll = outer.offsetWidth;
			outer.style.overflow = 'scroll';

			var inner = document.createElement('div');
			inner.style.width = '100%';
			outer.appendChild(inner);

			var widthWithScroll = inner.offsetWidth;
			outer.parentNode.removeChild(outer);
			return widthNoScroll - widthWithScroll;
		}

		if (getScrollbarWidth() !== 0 && testScrollbarWidthEvent !== true) {
			search_Replace_CSS('@media only screen and (min-width: 768px)',
						 '@media only screen and (min-width: '+(768 - parseInt(getScrollbarWidth()))+'px)');
			testScrollbarWidthEvent = true;
		}
	});

	function find_from_href(el, param) {
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			if (el_i.href.indexOf(param) > -1) {
				return el_i;
			}
		}
	}

	function search_Replace_CSS(p, p_too) {
		// First get all the stylesheets
		var el = document.styleSheets;
		var el_l = el.length || 1;
		for (var i = 0; el_l > i; i++) {
			var el_i = el[i] || el;
			// Next check if it's the right stylesheet
			try {
				if (find_from_href($('link'), '/css/').href === document.styleSheets[i].href) {
					// Next get all the rules.csstext
					var el2 = el_i.rules;
					var el_l2 = el2.length || 1;
					for (var i2 = 0; el_l2 > i2; i2++) {
						var el_i2 = el2[i2].cssText || el2.cssText;
						// Finally we check for the param and mutate the stylesheet if it contains it
						if (el_i2.indexOf(p) > -1) {
							var ruleMutation = el_i2.replace(p, p_too);
							el_i.insertRule(ruleMutation, el_i2);
						}
					}
				}
			} catch(e) {
				// cl(e);
			}
		}
	}
})();

(function(d, w, fastActiveClassName, isFastActiveTarget) {
	if ((('ontouchstart' in w) || w.DocumentTouch && d instanceof DocumentTouch)) {
		var activeElement = null,
		clearActive = function() {
			if (activeElement) {
				activeElement.classList.remove(fastActiveClassName);
				activeElement = null;
			}
		},
		setActive = function(e) {
			clearActive();
			if (isFastActiveTarget(e)) {
				activeElement = e.target;
				activeElement.classList.add(fastActiveClassName);
			}
		};
		d.body.addEventListener('touchstart', setActive, false);
		d.body.addEventListener('touchmove', clearActive, false);
	}
})(document, window, 'active', function(e) {
return ['A', 'INPUT'].indexOf(e.target.tagName) > -1;
});