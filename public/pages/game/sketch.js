function setup() {
	socket = io.connect(location.protocol + '//' + location.host + location.pathname);
	alert(location.protocol + '//' + location.host + location.pathname);
	alert(window.location.href);
	socket.on('id', (data) => {
		id = data;
		console.log(id);
	});
	socket.on('room', (room) => {
		document.getElementById('room-number').innerHTML = room;
	});
	socket.on('room-people', (data) => {
		room = {};
		room.people = data.people;
		peopleInRoom(room.people);
	});
	//
	canvas = createCanvas(500, 700);
	canvas.id('canvas');
	canvas.parent('game-colors');
	shapes = [];
	currentStroke = 'rgb(0, 0, 0)';
	currentStrokeWeight = 17;
	strokeWeight(10);
	noFill();
	noCursor();
	document.getElementById('canvas').oncontextmenu = (event) => {
		event.preventDefault();
		return false;
	};
	drawing = false;
	draggable(
		document.getElementById('game-stroke-pick'),
		(x, y) => {
			y = Math.min(Math.max(y, 25), 775);
			if (Math.abs(y - 600) <= 10) {
				y = 600;
			}
			document.getElementById('game-stroke-pick').style.top = y + 'px';
			y = parseInt(map(y, 25, 775, 60, 4));
			currentStrokeWeight = y;
		},
		document.getElementById('game-stroke-inside')
	);
	mouseX = -200;
	mouseY = -200;
	setTimeout(() => {
		$('#loading').fadeOut(200);
	}, 500);

	lerpedColor = 'rgba(0, 0, 0, 0.5)';
}

window.addEventListener('beforeunload', unload);

function unload(event) {
	// socket.emit('delete-semi-delete', character.id);
	// socket.emit('delete');
}

function mousePressed() {
	if (mouseX >= -20 && mouseX < width + 20 && mouseY >= 0 && mouseY < height + 20) {
		if (mouseButton === LEFT) {
			shapes.push({ stroke: currentStroke, strokeWeight: currentStrokeWeight, points: [] });
			drawing = true;
		} else if (mouseButton === RIGHT) {
			shapes.pop();
		} else if (mouseButton === CENTER) {
			shapes = [];
		}
	}
}

function mouseReleased() {
	drawing = false;
}

function draw() {
	background(255);
	if (mouseIsPressed) {
		if (mouseX >= -10 && mouseX < width + 10 && mouseY >= 0 && mouseY < height + 10) {
			if (mouseButton === LEFT) {
				if (drawing) if (shapes.length != 0) shapes[shapes.length - 1].points.push([ mouseX, mouseY ]);
			}
		}
	}
	for (let i = 0; i < shapes.length; i++) {
		stroke(shapes[i].stroke);
		strokeWeight(shapes[i].strokeWeight);
		beginShape();
		for (let j = 0; j < shapes[i].points.length; j++) {
			curveVertex(shapes[i].points[j][0], shapes[i].points[j][1]);
		}
		endShape();
	}

	let rgbFrom = colorValues(lerpedColor);
	let rgbTo = colorValues(currentStroke);
	if (rgbFrom[0] !== rgbTo[0] && rgbFrom[2] !== rgbTo[2] && rgbFrom[3] !== rgbTo[3]) {
		for (let i = 0; i < rgbFrom.length; i++) {
			let value = lerp(rgbFrom[i], rgbTo[i], 0.05);
			if (rgbFrom[i] > rgbTo[i]) rgbFrom[i] = Math.floor(value);
			else rgbFrom[i] = Math.ceil(value);
		}
		lerpedColor = `rgba(${rgbFrom[0]}, ${rgbFrom[1]}, ${rgbFrom[2]}, 0.75)`;
	}
	push();
	fill(lerpedColor);
	stroke(200);
	strokeWeight(currentStrokeWeight / 5);
	circle(mouseX, mouseY, currentStrokeWeight * (1 + 1 / 5));
	pop();
}

function changeColor(td) {
	currentStroke = td.style.backgroundColor;
}

function peopleInRoom(people) {
	console.log(people);
	let divs = document.getElementsByClassName('name');
	for (let i = 0; i < people.length; i++) {
		divs[i].innerHTML = people[i].character.name;
	}
}

function draggable(element, callback = (x, y) => {}, inside = null) {
	if (inside) {
		inside.onmousedown = (e) => {
			let x = e.pageX - inside.getBoundingClientRect().left - element.getBoundingClientRect().width / 2;
			let y = e.pageY - inside.getBoundingClientRect().top - element.getBoundingClientRect().height / 2;
			callback(x, y);
			document.onmousemove = (e) => {
				let x = e.pageX - inside.getBoundingClientRect().left - element.getBoundingClientRect().width / 2;
				let y = e.pageY - inside.getBoundingClientRect().top - element.getBoundingClientRect().height / 2;

				e.preventDefault();
				callback(x, y);
			};
		};
		document.onmouseup = (e) => {
			document.onmousemove = () => {};
		};
	} else {
		element.onmousedown = (e) => {
			let x = e.pageX - element.getBoundingClientRect().left - element.getBoundingClientRect().width / 2;
			let y = e.pageY - element.getBoundingClientRect().top - element.getBoundingClientRect().height / 2;
			callback(x, y);
			document.onmousemove = (e) => {
				let x = e.pageX - element.getBoundingClientRect().left - element.getBoundingClientRect().width / 2;
				let y = e.pageY - element.getBoundingClientRect().top - element.getBoundingClientRect().height / 2;

				e.preventDefault();
				callback(x, y);
			};
		};
		document.onmouseup = (e) => {
			document.onmousemove = () => {};
		};
	}
}

// return array of [r,g,b,a] from any valid color. if failed returns undefined
function colorValues(color) {
	if (color === '') return;
	if (color.toLowerCase() === 'transparent') return [ 0, 0, 0, 0 ];
	if (color[0] === '#') {
		if (color.length < 7) {
			color =
				'#' +
				color[1] +
				color[1] +
				color[2] +
				color[2] +
				color[3] +
				color[3] +
				(color.length > 4 ? color[4] + color[4] : '');
		}
		return [
			parseInt(color.substr(1, 2), 16),
			parseInt(color.substr(3, 2), 16),
			parseInt(color.substr(5, 2), 16),
			color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1
		];
	}
	if (color.indexOf('rgb') === -1) {
		// convert named colors
		var temp_elem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
		var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
		temp_elem.style.color = flag;
		if (temp_elem.style.color !== flag) return; // color set failed - some monstrous css rule is probably taking over the color of our object
		temp_elem.style.color = color;
		if (temp_elem.style.color === flag || temp_elem.style.color === '') return; // color parse failed
		color = getComputedStyle(temp_elem).color;
		document.body.removeChild(temp_elem);
	}
	if (color.indexOf('rgb') === 0) {
		if (color.indexOf('rgba') === -1) color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
		return color.match(/[\.\d]+/g).map(function(a) {
			return +a;
		});
	}
}
