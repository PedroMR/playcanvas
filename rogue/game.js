pc.script.create('game', function (context) {
	var level, levelCreation;
	var player;
	var playerPos;
	var goal, goalPos;
	var debugOutput;
	var container;
	var camera;
	var moveCount;
	var dtSincePlayerMoved = 0;
	
    var Game = function (entity) {
        this.entity = entity;
    };

	var vecToString = function(vec) {
		var str = "";
		for (var i=0; i < vec.length; i++) {
			str += (i>0 ? ", " : "")+vec[i];
		}
		return str;
	};

    Game.prototype = {    	
        initialize: function () {
        	player = context.root.findByName('Player');
        	goal = context.root.findByName('Goal');
	        camera  = context.root.findByName('Camera');
        	
			container = document.getElementById('application-container');
        	
        	debugOutput = document.createElement('div');
        	debugOutput.id = 'debugOutput';
			debugOutput.style.position = 'absolute';
			debugOutput.style.left = '2%';
			debugOutput.style.top = '5%';
//			debugOutput.style.marginLeft = '-10%';
			debugOutput.style.width = '50%';
			debugOutput.style.color = '#ffffff';
			debugOutput.style.fontFamily = 'Courier';
			debugOutput.style.display = true ? 'block' : 'none';
        	debugOutput.innerHTML = "---";
        	container.appendChild(debugOutput);
        	
        	this.newGame();
        },
        
        newGame: function() {
        	levelCreation = this.entity.script.send('levelCreation', 'getLevelCreation');
// 			this.entity.script.send('levelCreation', 'resetMaze');
//         	level = this.entity.script.send('levelCreation', 'getLevel');
			levelCreation.resetMaze();
			level = levelCreation.getLevel();
        	
        	goalPos = pc.math.vec2.create();
        	level.getRandomEmptyTile(goalPos);
        	levelCreation.placeAtCell(goal, 9999, 9999);
        	
        	playerPos = pc.math.vec2.create();
        	level.getRandomEmptyTile(playerPos);
        	this.updatePlayerPosition();
        	
        	moveCount = 0;        	
        },
        
        updatePlayerPosition: function()
        {
            levelCreation.placeAtCell(player, playerPos[0], playerPos[1]);
			level.seeCellsFrom(playerPos[0], playerPos[1]);
			levelCreation.renderSeenCells();
			
			if (level.hasSeenCell(goalPos[0], goalPos[1]))
				levelCreation.placeAtCell(goal, goalPos[0], goalPos[1]);
				
			if (playerPos[0] == goalPos[0] && playerPos[1] == goalPos[1])
				this.newGame();
        },  
              
        update: function (dt) {
        	if (playerPos)
        		this.tick(dt);
        },
        
        tick: function(dt) {
			dtSincePlayerMoved += dt;
        	if (dtSincePlayerMoved > 0.15) {
				var dx = 0;
				var dz = 0;
				
				if (context.keyboard.isPressed(pc.input.KEY_RIGHT)) {
					dz -= 1;
				}
				if (context.keyboard.isPressed(pc.input.KEY_UP)) {
					dx -= 1;
				}
				if (context.keyboard.isPressed(pc.input.KEY_LEFT)) {
					dz += 1;
				}
				if (context.keyboard.isPressed(pc.input.KEY_DOWN)) {
					dx += 1;
				}
				
				if (dx != 0 || dz != 0) {
					if (level.isCellEmpty(playerPos[0] + dx, playerPos[1] + dz)) {
						playerPos[0] += dx;
						playerPos[1] += dz;
						
						this.updatePlayerPosition();
						dtSincePlayerMoved = 0;
						moveCount++;
						
						debugOutput.innerHTML = "Moves: "+moveCount;
					}
				}
			}
			var targetCameraPos = pc.math.vec3.create(playerPos[0]*10 - 150, 150, playerPos[1]*10 - 150);
			var cameraPos = camera.getLocalPosition();
			var r = pc.math.vec3.create();
			pc.math.vec3.subtract(cameraPos, targetCameraPos, r);
			if (pc.math.vec3.length(r) > 0.1) {
				pc.math.vec3.lerp(cameraPos, targetCameraPos, 0.04, r);
				camera.setLocalPosition(r);
			}
// 			debugOutput.innerHTML = "Player: "+vecToString(playerPos)+" Camera: "+vecToString(cameraPos);
        },
    };

   return Game;
});