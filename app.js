const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const url = require('url');

class Client {
	constructor(id, character = { name: '', language: '', monsterEyes: 0, monsterMouth: 0 }, semiId = null) {
		this.id = id;
		this.character = character;
		this.semiId = semiId;
	}

	static semiDeleted = [
		{
			id: 'AmitYeeet',
			character: { name: 'AmitYeeet', language: 'English', monsterEyes: 0, monsterMouth: 0 }
		}
	];

	static findId(id) {
		let index = clients.findIndex((n) => n.id === id);
		return index;
	}

	static findIdSemiDeleted(id) {
		let index = this.semiDeleted.findIndex((n) => n.id === id);
		return index;
	}

	static deleteById(id) {
		let index = clients.findIndex((n) => n.id === id);
		clients.splice(index, 1);
		return index;
	}

	static deleteByIdSemiDeleted(id) {
		let index = this.semiDeleted.findIndex((n) => n.id === id);
		this.semiDeleted.splice(index, 1);
		return index;
	}
}

class Room {
	constructor(id) {
		this.id = id;
		this.amount = 0;
		this.clients = [];
	}

	addClient(client) {
		this.clients.push(client);
		this.amount += 1;
	}

	removeClient(client) {
		const index = this.clients.indexOf(client);
		if (index > -1) {
			this.clients.splice(index, 1);
		}
		this.amount--;
		if (this.amount == 0) {
			let roomIndex = Room.rooms.indexOf(this);
			if (roomIndex > -1) {
				Room.rooms.splice(roomIndex, 1);
			}
		}
	}

	static rooms = [];
	static id = 0;

	static addRoom() {
		this.rooms.push(new Room(this.id));
		this.id++;
		return this.id - 1;
	}

	static findRoomByClient(client) {
		for (let i = 0; i < this.rooms.length; i++)
			for (let j = 0; j < this.rooms[i].clients.length; j++) if (client === this.rooms[i].clients[j]) return i;
	}
}

const app = express();
const bodyParser = require('body-parser');
const server = app.listen(process.env.PORT || 3000);

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const socket = require('socket.io');
const io = socket(server);

clients = [];
maxRoomCapacity = 3;

console.log(
	chalk.bold(chalk.underline('\nrunning')) +
		' - ' +
		chalk.cyan(chalk.underline(`http://localhost:${server.address().port}`))
);

// socket.io
io.sockets.on('connection', (socket) => {
	io.to(socket.id).emit('id', socket.id);

	clients.push(new Client(socket.id));
	console.log(
		chalk.yellow(chalk.bold('connecting: ') + Client.findId(socket.id)) +
			' - ' +
			chalk.blue(`length: ${clients.length}`) +
			chalk.magenta(chalk.bold('   at: ')) +
			socket.handshake.headers.referer
	);
	io.local.emit('amount', clients.length);
	io.local.emit('amountOfRooms', Room.rooms.length);

	socket.on('delete', () => {
		let index = Client.findId(socket.id);

		const myURL = new URL(socket.handshake.headers.referer);
		const path = myURL.pathname;

		if (path.startsWith('/game')) {
			let room = Room.findRoomByClient(clients[Client.findId(socket.id)]);
			Room.rooms[room].removeClient(clients[Client.findId(socket.id)]);
		}
		Client.deleteById(socket.id);
		io.local.emit('amountOfRooms', Room.rooms.length);

		console.log(
			chalk.red(chalk.bold('removing: ') + index) +
				' - ' +
				chalk.blue(`length: ${clients.length}`) +
				chalk.magenta(chalk.bold('   at: ')) +
				socket.handshake.headers.referer
		);

		io.local.emit('amount', clients.length);
	});

	socket.on('semi-delete', () => {
		Client.semiDeleted.push(clients[Client.findId(socket.id)]);

		Client.deleteById(socket.id);

		io.local.emit('amountOfRooms', Room.rooms.length);
		io.local.emit('amount', clients.length);
	});

	socket.on('delete-semi-delete', (id) => {
		Client.deleteByIdSemiDeleted(id);
		console.log(Client.semiDeleted);

		io.local.emit('amountOfRooms', Room.rooms.length);
		io.local.emit('amount', clients.length);
	});

	const myURL = new URL(socket.handshake.headers.referer);
	const path = myURL.pathname;

	if (path.startsWith('/game')) {
		var query = url.parse(socket.handshake.headers.referer, true).query;
		let semiId = query.id;
		clients[Client.findId(socket.id)].semiId = semiId;
		let semiClient = Client.semiDeleted[Client.findIdSemiDeleted(semiId)];
		console.log(semiClient);

		let roomId = null;
		if (Room.rooms.length == 0) {
			Room.addRoom();
			roomId = Room.rooms.length - 1;
			Room.rooms[roomId].addClient(semiClient);
			socket.join(Room.rooms[roomId].id);
		} else {
			let index = null;
			for (let i = 0; i < Room.rooms.length; i++) {
				if (Room.rooms[i].amount < maxRoomCapacity) {
					index = i;
					break;
				}
			}
			if (index !== null) {
				Room.rooms[index].addClient(semiClient);
				socket.join(Room.rooms[index].id);
				roomId = index;
			} else {
				Room.addRoom();
				roomId = Room.rooms.length - 1;
				Room.rooms[roomId].addClient(semiClient);
				socket.join(Room.rooms[Room.rooms.length - 1].id);
			}
		}
		io.to(socket.id).emit('room', roomId);
		io.to(Room.rooms[roomId].id).emit('room-people', { people: Room.rooms[roomId].clients });
		console.table(Room.rooms);
	}
	io.local.emit('amountOfRooms', Room.rooms.length);
});

app.get('/', (req, res) => {
	res.render('home.ejs');
});

app.post('/', (req, res) => {
	clients[Client.findId(req.body.id)].character = {
		name: req.body.name,
		language: req.body.language,
		monsterEyes: req.body.monsterEyes,
		monsterMouth: req.body.monsterMouth
	};
	res.send('ok');
});

app.get('/game', (req, res) => {
	let id = req.query.id;
	let semiIndex = Client.findIdSemiDeleted(id);
	if (semiIndex === -1) {
		console.log('hi');
		res.status(404).render('404.ejs', { error: 'Player Not Found' }); // res.redirect('/404?error=player%20not%20found');
	} else {
		let data = Client.semiDeleted[semiIndex].character;
		data.id = id;
		res.render('game.ejs', { character: data });
	}
});

app.get('/public', (req, res) => {
	let id = req.query.id;
	let semiIndex = Client.findIdSemiDeleted(id);
	if (semiIndex === -1) {
		res.redirect('/404?error=player%20not%20found');
	} else {
		let data = Client.semiDeleted[semiIndex].character;
		data.id = id;
		res.render('public-find.ejs', { character: data });
	}
});
