class Background {
	constructor(fill = 255,
		ground = {
			h: 1 / 10
		}) {

		this.ground = merge({
			x: 1 / 2,
			y: 1 - ground.h / 2,
			w: 1
		}, ground)

		this.ground.body = Bodies.rectangle(this.ground.x * width, this.ground.y * height, this.ground.w * width, this.ground.h * height, { isStatic: true })
		World.add(world, this.ground);
		console.log(this.ground);

	}

	// constructor(groundH = height / 10 * 9, goalpost1X = width / 100, goalpost1Y = height / 2, goalpost1W = width / 15) {
	// 	this.groundH = groundH
	// 	this.ground = Bodies.rectangle(width / 2, this.groundH + (height - this.groundH) / 2, width * 1.2, height - this.groundH, { isStatic: true })
	// 	World.add(world, this.ground);
	// 	this.goalpostPos = createVector(goalpost1X, goalpost1Y)
	// 	this.goalpostW = goalpost1W

	// }

	resize(groundH = height / 10 * 9, goalpost1X = width / 100, goalpost1Y = height / 2, goalpost1W = width / 15) {
		this.groundH = groundH
		this.goalpostPos.x = goalpost1X
		this.goalpostPos.y = goalpost1Y
		this.goalpostW = goalpost1W
	}

	show() {
		push()
		fill(0)
		stroke(33)
		strokeWeight(10)
		rectMode(CENTER)
		rect(this.ground.body.position.x, this.ground.body.position.y, this.ground.w * width, this.ground.h * height)
		pop()

		/*push()
		fill(51)
		rect(this.goalpostPos.x, this.goalpostPos.y, this.goalpostW, this.goalpostPos.y - height + this.groundH + 1, this.goalpostW / 2, 0, 0, 0)
		rect(width - this.goalpostPos.x - this.goalpostW, this.goalpostPos.y, this.goalpostW, this.goalpostPos.y - height + this.groundH + 1, 0, this.goalpostW / 2, 0, 0)
		pop()*/
	}
}

class Background2 {
	constructor(groundX = width / 2, groundY = height - 10, groundW = width, groundH = 100) {
		this.groundPos = createVector(groundX, groundY)
		this.groundW = groundW
		this.groundH = groundH
		this.ground = Bodies.rectangle(this.groundPos.x, this.groundPos.y, this.groundW, this.groundH, { isStatic: true })
		//Body.setAngle(this.ground, 90)
		//Body.setAngularVelocity(this.ground, 1);
		this.groundAngle = this.ground.angle
		World.add(world, this.ground);
	}

	show() {
		push()
		rectMode(CENTER)
		translate(this.groundPos.x, this.groundPos.y)
		rect(0, 0, this.groundW, this.groundH)
		pop()
	}
}

class Player {
	constructor(x = width / 2, y = height / 2, r = width / 30, v = createVector(0, 0), frictionX = 0.1,
		walk = {
			speed: 1 / 1000
		},
		jump = {
			speed: 1 / 160,
			jumpCount: 0
		},
		dash = {
			speed: 1 / 60,
			dashing: 0,
			time: 10,
			wait: 300,
			elapsed: 0
		}) {

		this.body = Bodies.circle(x, y, r, { inertia: Infinity, restitution: 0 })
		this.walk = walk
		this.jump = jump
		this.dash = dash

		this.frictionAirX = frictionX
		Body.setDensity(this.body, 30)
		Body.setVelocity(this.body, { x: v.x, y: v.y })
		World.add(world, this.body)
	}

	update() {
		if (this.dash.dashing !== 1) {
			if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
				Body.setVelocity(this.body, { x: this.body.velocity.x - width * this.walk.speed, y: this.body.velocity.y })
			}
			if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
				Body.setVelocity(this.body, { x: this.body.velocity.x + width * this.walk.speed, y: this.body.velocity.y })
			}
			Body.setVelocity(this.body, { x: this.body.velocity.x * (1 - this.frictionAirX), y: this.body.velocity.y })
		} else {
			this.dash.elapsed++
			if (this.dash.elapsed >= this.dash.time) {
				this.dash.dashing = 2
				setTimeout(() => {
					this.dash.dashing = 0
				}, this.dash.wait);
			}
		}

		if (this.body.position.x < this.body.circleRadius) {
			Body.setPosition(this.body, { x: this.body.circleRadius, y: this.body.position.y })
			if (Math.abs(-this.body.velocity.x < 7)) Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y })
			else Body.setVelocity(this.body, { x: -this.body.velocity.x, y: this.body.velocity.y })
		} else if (this.body.position.x > width - this.body.circleRadius) {
			Body.setPosition(this.body, { x: width - this.body.circleRadius, y: this.body.position.y })
			if (Math.abs(this.body.velocity.x < 7)) Body.setVelocity(this.body, { x: 0, y: this.body.velocity.y })
			else Body.setVelocity(this.body, { x: -this.body.velocity.x, y: this.body.velocity.y })
		}
	}

	startJump() {
		if (this.jump.jumpCount < 2) {
			Body.setVelocity(this.body, { x: this.body.velocity.x, y: -width * this.jump.speed })
			this.jump.jumpCount++
		}
		if (this.body.position.y + this.body.circleRadius >= myBackground.groundH) {
			Body.setVelocity(this.body, { x: this.body.velocity.x, y: -width * this.jump.speed })
			this.jump.jumpCount = 1
		}
	}

	startDash(side) {
		if (this.dash.dashing === 0) {
			if (side == 'right') Body.setVelocity(this.body, { x: width * this.dash.speed, y: 0 })
			if (side == 'left') Body.setVelocity(this.body, { x: -width * this.dash.speed, y: 0 })
			this.dash.dashing = 1
		}
	}

	show() {
		push()
		fill(150)
		noStroke()
		ellipseMode(RADIUS)
		ellipse(this.body.position.x, this.body.position.y, this.body.circleRadius)
		pop()
	}
}

class Ball {
	constructor(x, y, r) {
		this.pos = createVector(x, y)
		this.r = r
		this.body = Bodies.circle(this.pos.x, this.pos.y, this.r, { restitution: 1 });
		this.angle = this.body.angle
		World.add(world, this.body);
	}

	show() {
		if (this.body.position.x < this.r) {
			Body.setPosition(this.body, { x: this.r, y: this.body.position.y })
			Body.setVelocity(this.body, { x: -this.body.velocity.x, y: this.body.velocity.y })
		} else if (this.body.position.x > width - this.r) {
			Body.setPosition(this.body, { x: width - this.r, y: this.body.position.y })
			Body.setVelocity(this.body, { x: -this.body.velocity.x, y: this.body.velocity.y })
		}
		if (this.body.position.y + this.r > height) {
			Body.setPosition(this.body, { x: this.body.position.x, y: -this.r })
			Body.setVelocity(this.body, { x: this.body.velocity.x, y: this.body.velocity.y * 0.5 })
		}

		this.pos.x = this.body.position.x
		this.pos.y = this.body.position.y
		//Body.setAngle(this.body, 0);
		//Body.setAngularVelocity(this.body, 0);
		this.body.friction = 0.05
		this.angle = this.body.angle

		push()
		fill(51)
		translate(this.pos.x, this.pos.y)
		rotate(this.angle)
		ellipseMode(RADIUS)
		circle(0, 0, this.r)
		pop()
	}
}

class DoubleClick {
	constructor(keyCode, callback, speed = 400) {
		this.keyCode = keyCode
		this.callback = callback
		this.click = false
		this.time = speed
	}

	clicked() {
		if (!this.click) {
			this.click = true
			this.startTime = new Date()
		} else {
			this.elapsedTime = new Date() - this.startTime
			this.startTime = new Date()
			if (this.elapsedTime < this.time) {
				this.callback()
				this.click = false
			}
		}
	}
}

function merge(object1, object2) {
	for (let key in object2) if (!(key in object1)) object1[key] = object2[key]
	return object1;
};