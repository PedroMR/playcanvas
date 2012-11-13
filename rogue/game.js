pc.script.create('game', function (context) {
	var level, levelCreation;
	var player;
	var playerPos;
	
    var Game = function (entity) {
        this.entity = entity;
    };

    Game.prototype = {    	
        initialize: function () {
        	player = context.root.findByName('Player');
        },
        
        newGame: function() {
        	levelCreation = this.entity.script.send('levelCreation', 'getLevelCreation');
// 			this.entity.script.send('levelCreation', 'resetMaze');
//         	level = this.entity.script.send('levelCreation', 'getLevel');
			levelCreation.resetMaze();
			level = levelCreation.getLevel();
        	
        	var spawn = pc.math.vec2.create();
        	level.getRandomEmptyTile(spawn);
        	playerPos = spawn;
        	this.updatePlayerPosition();
        },
        
        updatePlayerPosition: function()
        {
            levelCreation.placeAtCell(player, playerPos[0], playerPos[1]);
        },  
              
        update: function (dt) {
        	if (playerPos)
        		this.tick();
        },
        
        tick: function() {
            var dx = 0;
            var dz = 0;
            if (context.keyboard.isPressed(pc.input.KEY_UP)) 
            {
                dz -= 1;
            }
            if (context.keyboard.isPressed(pc.input.KEY_LEFT)) {
                dx -= 1;
            }
            if (context.keyboard.isPressed(pc.input.KEY_DOWN)) {
                dz += 1;
            }
            if (context.keyboard.isPressed(pc.input.KEY_RIGHT)) {
                dx += 1;
            }
            
            playerPos[0] += dx;
            playerPos[1] += dz;
            
			this.updatePlayerPosition();        
        },
    };

   return Game;
});