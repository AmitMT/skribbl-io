socket = io.connect(`${location.protocol}//${location.host}`);
socket.on('id', (data) => {
	id = data;
	console.log(id);
});

setTimeout(() => {
	socket.emit('delete');
	window.removeEventListener('beforeunload', unload);
	window.location.href = `game?id=${encodeURIComponent(character.id)}`;
}, 1000);

window.addEventListener('beforeunload', unload);

function unload(event) {
	socket.emit('delete-semi-delete', character.id);
	socket.emit('delete');
}

socket.on('close-window', () => {
	window.location = '/removed-player';
});
