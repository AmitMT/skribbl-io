socket = io.connect(window.location.href);
socket.on('id', (data) => {
	id = data;
	console.log(id);
});

setTimeout(() => {
	window.removeEventListener('beforeunload', unload);
	window.location.href = `game?id=${encodeURIComponent(character.id)}`;
}, 1000);

window.addEventListener('beforeunload', unload);

function unload(event) {
	socket.emit('delete-semi-delete', character.id);
	socket.emit('delete');
}
