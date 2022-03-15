/** Control the weather		* @author David Nordlund		* © 2012 Government of Nova Scotia	**/
var Weather = {
	Balloon: { // white box w/ overlay content (webcam image)
		tag: document.getElementById('weatherBalloon'),
		closebtn: document.getElementById('weatherClose'),
		selbox : document.getElementById('weatherBalloonSelect'),
		imgbox : document.getElementById('weatherBalloonImg'),
		databox: document.getElementById('weatherBalloonData'),
		img: null,
		canFly: (document.body.clientWidth > 640) && (document.body.clientHeight > 480),
		inflate: function() { // fill balloon popup with data
			var sel = this.selbox.lastChild;
			if (!sel) {
				sel = this.selbox.appendChild(Weather.Panel.selector.cloneNode(true));
				sel.onchange = Weather.events.changeLocation;
			}
			sel.selectedIndex = Weather.Panel.selector.selectedIndex;
			sel.focus();
			this.update();
			this.closebtn.onclick = Weather.events.clicked;
			window.setTimeout(Weather.events.transition, 50);
			this.drift();
		},
		deflate: function() { // balloon is hidden, remove content
			Weather.Balloon.imgbox.innerHTML = Weather.Balloon.databox.innerHTML = '';
			Weather.Balloon.img = null;
		},
		outdated: function() {  // out with the old, in with the new (webcam image & weather data)
			if (this.img)
				this.img.className = 'weatherOldImg';
			this.databox.className = 'weatherData weatherChanging';
			if (this.databox.firstChild)
				this.databox.firstChild.className = 'weatherPreviousData';
		},
		update: function() { // copy the weather data from Weather.Panel into the balloon
			var data = Weather.Panel.databox.lastChild.cloneNode(true),
			    a = data.getElementsByTagName('a')[0];
			a.parentNode.removeChild(a); // except don't copy the "View Webcam" link.
			this.databox.appendChild(data);
			this.img = this.imgbox.appendChild(document.createElement('img'));
			if (typeof(this.img.onload)!='undefined') {
				this.imgbox.className = "weatherChanging";
				this.img.className = 'weatherNewImg';
				this.img.onload = Weather.events.imgLoaded;
			}
			this.img.src = a.href;
		},
		drift: function() {  // adjust size & position, when the weather changes
			var img = Weather.Balloon.img;
			if (img && img.naturalWidth) {
				var w = Math.max(320, img.naturalWidth)+'px', h = Math.max(240, img.naturalHeight)+'px';
				this.tag.style.width = w;
				this.imgbox.style.width = w;
				this.imgbox.style.height = h;
			}
			this.tag.style.top = Math.max((document.documentElement.clientHeight-this.tag.clientHeight)>>1, 0)+'px';
		}
	},

	Panel: { // components in the main page
		tag: document.getElementById('weatherBox'),
		databox: document.getElementById('weatherData'),
		init: function() {
			var sel = this.selector = this.tag.getElementsByTagName('select')[0], submit = this.tag.getElementsByTagName('input')[0];
			submit.style.display = 'none';
			if (Weather.xhr) {
				if (sel.options[0].hasAttribute)
					for (var i=sel.options.length; i--;)
						if (sel.options[i].hasAttribute('selected')) { sel.selectedIndex = i; break; }
				sel.onchange = Weather.events.changeLocation;
			} else
				sel.onchange = sel.form.submit;
			this.linkToBalloon();
		},
		linkToBalloon: function() {
			var camlinks;
			if (Weather.Balloon && (camlinks = this.databox.getElementsByTagName('a'))) {
				this.camlink = camlinks[camlinks.length-1];
				this.camlink.setAttribute("aria-haspopup", "true");
				this.camlink.setAttribute("aria-owns", "WeatherAtmosphere");
				this.camlink.onclick = Weather.viewHighwayCam;
			}
		},
		outdated: function() {
			this.databox.className = 'weatherData weatherChanging';
			if (this.databox.firstChild)
				this.databox.firstChild.className = 'weatherPreviousData';
		}
	},

	Sky: { // general overlay background
		atmosphere: document.getElementById('weatherAtmosphere'),
		front: document.getElementById('weatherFront'),
		init: function() {
			document.body.appendChild(this.atmosphere);
			this.front.onclick = Weather.events.clicked;
		},
		fall: function() {
			this.atmosphere.parentNode.removeChild(this.atmosphere);
			Weather.Sky = Weather.Balloon = null;
		},
		cloudOver: function() {
			Weather.isOvercast = true;
			this.atmosphere.setAttribute("aria-hidden", "false");
			Weather.Sky.atmosphere.className = 'weatherCloudingOver';
			if (document.addEventListener) {
				document.addEventListener('keyup', Weather.events.keyUp, false);
				window.addEventListener('resize', Weather.events.resized, false);
			} else if (document.attachEvent) {
				document.attachEvent('onkeyup', Weather.events.keyUp);
				window.attachEvent('onresize', Weather.events.resized);
			}
			window.setTimeout(Weather.events.overcast, 50);
		},
		clear: function() {
			Weather.isOvercast = false;
			Weather.Sky.atmosphere.className = 'weatherClearing';
			Weather.Sky.atmosphere.setAttribute("aria-hidden", "true");
			if (document.removeEventListener) {
				document.removeEventListener('keyup', Weather.events.keyUp, false);
				window.removeEventListener('resize', Weather.events.resized, false);
			} else if (document.detachEvent) {
				document.detachEvent('onkeyup', Weather.events.keyUp);
				window.detachEvent('resize', Weather.events.resized);
			}
			Weather.Balloon.tag.style.top = '0px';
			window.setTimeout(Weather.events.skyCleared, 500);
			Weather.Panel.camlink && Weather.Panel.camlink.focus();
		}
	},

	isOvercast: false,
	xhr: (typeof(XMLHttpRequest)!='undefined') ? new XMLHttpRequest() : null,
	init: function() {
		if (this.xhr && this.Balloon.canFly)
			this.Sky.init();
		else
			this.Sky.fall();
		this.Panel.init();
	},
	requestXML: function() {
		Weather.xhr.send();
	},
	updatable: function() {
		var u = {'Panel':1};
		if (Weather.isOvercast)
			u['Balloon']=1;
		return u;
	},
	events: {
		changeLocation: function() {
			var place = this.options[this.selectedIndex].value,
				url = location.protocol + '//' + location.hostname + '/homepage/bridgewater/weather/?location=' + place;
			Weather.Panel.selector.selectedIndex = this.selectedIndex;
			for (var i in Weather.updatable()) {
				Weather[i].tag.setAttribute("aria-busy", "true");
				Weather[i].outdated();
			}
			Weather.xhr.open('GET', url);
			Weather.xhr.onreadystatechange = Weather.events.xmlReceived; // set this exactly here, or IE fails
			window.setTimeout(Weather.requestXML, 50); // transitions don't always work without this delay
		},
		xmlReceived: function() {
			//alert('xhr.readyState: ' + Weather.xhr.readyState);
			switch(Weather.xhr.readyState) {
			case 4:
				if ((Weather.xhr.status==200) && Weather.xhr.responseText) {
					Weather.Panel.databox.innerHTML += String(Weather.xhr.responseText).replace(/(^\s+|\s+$)/, '');
					Weather.Panel.linkToBalloon();
					if (Weather.isOvercast)
						Weather.Balloon.update();
					window.setTimeout(Weather.events.transition, 50);
				} //else
					//alert('xmlReceived: status='+Weather.xhr.statusText+', text: ' + typeof(Weather.xhr.responseText));
				for (var i in Weather.updatable())
					Weather[i].tag.setAttribute("aria-busy", "false");
			}
		},
		transition: function() {
			if (Weather.Balloon && Weather.Balloon.img) {
				Weather.Balloon.img.className = '';
				Weather.Balloon.databox.className = 'weatherData';
			}
			Weather.Panel.databox.className = 'weatherData';
			window.setTimeout(Weather.events.conditionsChanged, 1000);
		},
		conditionsChanged: function() {
			for (var i in Weather.updatable()) {
				var o = Weather[i], olddata = o.databox.childNodes;
				if (olddata.length > 1)
					o.databox.removeChild(o.databox.firstChild);
			}
			if (Weather.Balloon && Weather.Balloon.img)
				while (Weather.Balloon.imgbox.childNodes.length > 1)
					Weather.Balloon.imgbox.removeChild(Weather.Balloon.imgbox.firstChild)
			Weather.track();
		},
		imgLoaded: function() {
			Weather.Balloon.imgbox.className = "";
			Weather.Balloon.drift();
		},
		resized: function() {
			Weather.Balloon.drift();
		},
		keyUp: function(e) {
			if (!e) e = window.event;
			var code = e.keyCode || e.which || null;
			if (code==27) // esc
				Weather.Sky.clear();
		},
		clicked: function(e) {
			if (Weather.isOvercast) {
				var closers = {weatherAtmosphere:0, weatherFront:0, weatherClose:0},
				    target = e ? e.target : window.event.srcElement || closers[0];
				if (target.nodeType==3) target = target.parentNode; // text node, so refer to parent
				if (target.id in closers)
					Weather.Sky.clear();
			}
		},
		overcast: function() {
			Weather.Sky.atmosphere.className = 'weatherOvercast';
		},
		skyCleared: function() {
			Weather.Sky.atmosphere.className = '';
			Weather.Balloon.deflate();
		}
	},
	track: function() {
		var action = 'Viewed ' + (Weather.isOvercast ? 'webcam' : 'weather data'),
		    place = Weather.Panel.selector.options[Weather.Panel.selector.selectedIndex].value,
		    params = ['_trackEvent', 'Homepage Weather', action, place];
		if (window._gaq && _gaq.push)	// CNS Framework excludes _gaq code if browser has Do Not Track set to 1.
			_gaq.push(params);
		//else
		//	alert(params.join(', '));
	},
	viewHighwayCam: function() {
		if (!Weather.isOvercast) {
			Weather.Sky.cloudOver();
			Weather.Balloon.inflate();
			return false;
		}
		return true;
	}
};
Weather.init();
