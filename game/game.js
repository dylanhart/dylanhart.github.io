var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var config = {
	size: {
		width: 800,
		height: 600
	},
	keymap: {
		'left': 37,
		'right': 39,
		'up': 38
	}
}

var controls = {
	keystate: {},
	callbacks: {},
	press: function(key) {
		this.keystate[key] = true;

		if (this.callbacks[key] !== undefined) {
			for (var i = 0; i < this.callbacks[key].length; i++) {
				this.callbacks[key][i]();
			}
		}
	},
	release: function(key) {
		this.keystate[key] = false;
	},
	onPress: function(key, func) {
		if (this.callbacks[key] === undefined) {
			this.callbacks[key] = [];
		}
		this.callbacks[key].push(func);
	},
	getState: function(name) {
		var state = this.keystate[config.keymap[name]];
		if (state === undefined) {
			return this.keystate[config.keymap[name]] = false;
		}
		return state;
	},
	init: function() {
		document.addEventListener('keydown', function(event) {
			controls.press(event.keyCode);
		});
		document.addEventListener('keyup', function(event) {
			controls.release(event.keyCode);
		});		
	}
}
controls.init();


var game = {
	update: function(delta) {
		this.world.update(delta);
	},
	render: function(delta) {
		context.clearRect(0, 0, config.size.width, config.size.height);
		this.world.render(delta);
	},
	init: function() {
		canvas.height = config.size.height;
		canvas.width = config.size.width;

		this.world.init();
		this.player.init();
	}
}

game.world = {
	gravity: .0002,
	friction: .005,
	entities: [],
	register: function(ent) {
		this.entities.push(ent);
	},
	render: function(delta) {
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].render(delta);
		}
	},
	update: function(delta) {
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].update(delta);
		}
	},
	init: function() {

	}
}

game.player = {
	pos: {
		x: 0,
		y: 0
	},
	vel: {
		x: 0,
		y: 0
	},
	state: {
		isJumping: false
	},
	stats: {
		speed: .15,
		jump: .3
	},
	size: 10,
	render: function(delta) {
		context.fillRect(this.pos.x - this.size/2, this.pos.y - this.size, this.size, this.size);
		context.fillText("vel: " + JSON.stringify(this.vel), 10, 10);
	},
	update: function(delta) {


		this.pos.x += this.vel.x * delta;
		this.pos.y += this.vel.y * delta;
		

		var left = controls.getState('left');
		var right = controls.getState('right');
		if (left != right) {
			this.pos.x += (left ? -this.stats.speed : this.stats.speed) * delta;
		}

		if (this.pos.y >= config.size.height) {
			this.pos.y = config.size.height;
			this.vel.y *= this.vel.y > .1 ? -.5 : 0;
			this.state.isJumping = false;
		} else {
			this.vel.y += game.world.gravity * delta;
		}


	},
	jump: function() {
		if (!this.state.isJumping) {
			this.vel.y -= this.stats.jump;
			this.state.isJumping = true;
		}
	},
	init: function() {
		game.world.register(this);
		controls.onPress(config.keymap['up'], function() {
			game.player.jump();
		});
	}
}

game.init();


//start
var oldtime = Date.now();
var time;

(function loop() {
	window.requestAnimFrame(loop);

	time = Date.now();
	game.update(time - oldtime);
	game.render(time - oldtime);
	oldtime = time;
})();
