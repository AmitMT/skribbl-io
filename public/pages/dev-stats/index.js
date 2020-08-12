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
	clients = [];

	document.getElementById('location').innerHTML = `${location.protocol}//${location.host}`;
	document.getElementById('location').href = `${location.protocol}//${location.host}`;
	$('#console').css();
	socket.on('console', (data) => {
		let div = document.createElement('div');
		for (let i = 0; i < data.log.length; i++) {
			let span = document.createElement('span');
			let content = data.log[i].str;
			span.innerHTML = content;
			for (const [ key, value ] of Object.entries(data.log[i])) span.style[key] = value;

			div.appendChild(span);
		}
		document.getElementById('console').appendChild(div);
	});

	socket.on('clients', (data) => {
		let clients = data;
		document.getElementById('clients').innerHTML = '';
		for (let i = 0; i < clients.length; i++) {
			let div = document.createElement('div');
			div.setAttribute('id', clients[i].id);

			let child = document.createElement('div');
			child.innerHTML = i;
			div.appendChild(child);
			child = document.createElement('div');
			child.innerHTML = clients[i].id;
			div.appendChild(child);
			if (clients[i].id != id) {
				child = document.createElement('button');
				child.innerHTML = 'delete';
				child.setAttribute('class', 'btn btn-danger');
				child.setAttribute('onclick', "socket.emit('close-client', this.parentNode.childNodes[1].innerHTML);");
				div.appendChild(child);
			} else {
				child = document.createElement('button');
				child.innerHTML = 'you';
				child.setAttribute('class', 'btn btn-info');
				div.appendChild(child);
			}

			document.getElementById('clients').appendChild(div);
		}
	});
	socket.emit('get-clients');

	socket.on('semi-deleted-clients', (data) => {
		let semiClients = data;
		document.getElementById('semi-deleted').innerHTML = '';
		for (let i = 0; i < semiClients.length; i++) {
			let div = document.createElement('div');
			div.setAttribute('id', semiClients[i].id);
			let child = document.createElement('div');
			child.innerHTML = i;
			div.appendChild(child);
			child = document.createElement('div');
			child.innerHTML = semiClients[i].character.name;
			div.appendChild(child);
			child = document.createElement('div');
			child.innerHTML = semiClients[i].id;
			div.appendChild(child);

			document.getElementById('semi-deleted').appendChild(div);
		}
	});
	socket.emit('get-semi-deleted-clients');
};

socket.on('close-window', () => {
	window.location = '/removed-player';
});
