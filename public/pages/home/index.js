socket = io.connect(`${location.protocol}//${location.host}`);
socket.on('id', (data) => {
	id = data;
	console.log(id);
});

window.addEventListener('beforeunload', unload);

function unload(event) {
	socket.emit('delete');
}

window.onload = () => {
	$('#start').click(function() {
		$([ document.documentElement, document.body ]).animate(
			{
				scrollTop: $('#sec').offset().top
			},
			50
		);
	});
	let imgSpan = $('#character > span');
	imgSpan.css({
		padding: `0 ${imgSpan.width() / 2 - $('#eyes').height() / 2}px`
	});
	let imgs = $('#character > img');
	imgs.css({
		margin: `10px calc(50% - ${imgs.width() / 2}px)`
	});

	selectBackground = () => {
		if ($('#language-help').height() != 0) {
			$('#sec > div > div.form-group.row > div.dropdown.bootstrap-select.form-control.col-sm-3 > button').css({
				background: '#f8f9fa',
				color: '#999'
			});
			$('#language-help').animate({ height: 0 }, 150, () => {
				$('#language-help').css({ display: 'none' });
			});
			$('#sec > div').css({
				height: '660px'
			});
			$('#sec > div').animate(
				{
					height: '550px'
				},
				150
			);
		}
	};

	GETPublic = () => {
		if (document.getElementById('language').value == '') {
			$('#sec > div > div.form-group.row > div.dropdown.bootstrap-select.form-control.col-sm-3 > button').css({
				background: '#f44',
				color: '#fff'
			});
			$('#language-help').css({ display: 'inline' });
			$('#language-help').animate({ height: '20px' }, 150);
			$('#sec > div').css({
				height: '640px'
			});
			$('#sec > div').animate(
				{
					height: '570px'
				},
				150
			);
		} else {
			let name = document.getElementById('name').value;
			let language = document.getElementById('language').value;
			let data = { name, language, monsterEyes, monsterMouth, id };

			fetch('/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			}).then((res) => {
				window.removeEventListener('beforeunload', unload);
				socket.emit('semi-delete');
				window.location.href = `public?id=${encodeURIComponent(id)}`;
			});
		}
	};

	// GETPublic = () => {
	// 	if (document.getElementById('language').value == '') {
	// 		document.querySelector(
	// 			'#sec > div > div.form-group.row > div.dropdown.bootstrap-select.form-control.col-sm-3 > button'
	// 		).style.background =
	// 			'#f44';
	// 	} else {
	// 		let name = encodeURIComponent(document.getElementById('name').value);
	// 		let language = encodeURIComponent(document.getElementById('language').value);
	// 		window.location.href = `public?name=${name}&language=${language}`;
	// 	}
	// };
};

socket.on('amount', (data) => {
	amount = data;
	if (amount > 1) document.getElementById('amount').innerHTML = `<b>${amount}</b> people are`;
	else document.getElementById('amount').innerHTML = `<b>${amount}</b> person is`;
});

socket.on('amountOfRooms', (data) => {
	amountRooms = data;
	if (amountRooms > 1) document.getElementById('amountRooms').innerHTML = `<b>${amountRooms}</b> rooms are`;
	else document.getElementById('amountRooms').innerHTML = `<b>${amountRooms}</b> room is`;
});

let speed = 0.04;
let start;
function draw(timestamp) {
	if (start === undefined) start = timestamp;
	const elapsed = timestamp - start;

	angle = (elapsed / (60 / (speed * 2) / Math.PI)) % (2 * Math.PI);
	for (let i = 0; i < $('#game-colors-3').children().length; i++) {
		$('#game-colors-3 div:nth-child(' + (i + 1) + ')').css({ top: (Math.cos(angle - i / 2) + 1) / 2 * 50 });
	}
	// if (elapsed > 1000000) {
	// 	return
	// }

	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);

monsterEyes = 0;
monsterMouth = 0;
monsterAmount = 4;

function eyesLeft() {
	monsterEyes--;
	if (monsterEyes < 0) monsterEyes += monsterAmount;
	document.getElementById('eyes').src = `gif/monster${monsterEyes}_eyes.gif`;
}

function eyesRight() {
	monsterEyes++;
	monsterEyes = monsterEyes % monsterAmount;
	document.getElementById('eyes').src = `gif/monster${monsterEyes}_eyes.gif`;
}

function mouthLeft() {
	monsterMouth--;
	if (monsterMouth < 0) monsterMouth += monsterAmount;
	document.getElementById('mouth').src = `gif/monster${monsterMouth}_mouth.gif`;
}

function mouthRight() {
	monsterMouth++;
	monsterMouth = monsterMouth % monsterAmount;
	document.getElementById('mouth').src = `gif/monster${monsterMouth}_mouth.gif`;
}

socket.on('close-window', () => {
	window.location = '/removed-player';
});
