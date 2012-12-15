//requirejs([], function($) {

pc.script.create('game', function (context) {
	var level, levelCreation;
	var player;
	var playerPos;
	var goal, goalPos;
	var debugOutput, distanceOutput;
	var container;
	var camera;
	var moveCount;
	var lastPosition;
	var dtSincePlayerMoved = 0;
	var SEE_EVERYTHING = false;
	var MANUAL_MOVE = false;
	var SECONDS_BETWEEN_MOVES = 0.5;
	var creatures = [];
	var zombieModel;

    var Game = function (entity) {
        this.entity = entity;
//	request('http://world.pmr.jit.su', function (error, response, body) {
//	  if (!error && response.statusCode == 200) {
//	    console.log(body) // Print the google web page.
//	  }
//	})
	    };

	var vecToString = function(vec) {
		var str = "";
		for (var i=0; i < vec.length; i++) {
			str += (i>0 ? ", " : "")+vec[i];
		}
		return str;
	};
	
	var createDiv = function(id, left, top) {
		var div = document.createElement('div');
		div.id = id;
		div.style.position = 'absolute';
		div.style.left = left;
		div.style.top = top;
//			div.style.marginLeft = '-10%';
		div.style.width = '50%';
		div.style.color = '#ffffff';
		div.style.fontFamily = 'Courier';
		div.style.display = true ? 'block' : 'none';
		container.appendChild(div);

		return div;
	};

    Game.prototype = {    	
        initialize: function () {
			container = document.getElementById('application-container');
			
        	player = context.root.findByName('Player');
        	goal = context.root.findByName('Goal');
	        camera  = context.root.findByName('Camera');
	        zombieModel  = context.root.findByName('Zombie');
        	
        	debugOutput = createDiv('debugOutput', '2%', '5%');
        	debugOutput.innerHTML = "---";
        	
        	distanceOutput = createDiv('distanceOutput', '50%', '80%');
        	distanceOutput.style.fontSize = '32pt';
        	distanceOutput.style.color = 'yellow';
        	distanceOutput.innerHTML = "";
        	
        	
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
        	lastPosition = pc.math.vec2.clone(playerPos);

        	levelCreation.placeAtCell(zombieModel, playerPos[0]-1, playerPos[1]);
        	
        	moveCount = 0;        	
        },
        
        updatePlayerPosition: function()
        {
            levelCreation.placeAtCell(player, playerPos[0], playerPos[1]);
			level.seeCellsFrom(playerPos[0], playerPos[1]);
			levelCreation.renderSeenCells();
			
			if (level.hasSeenCell(goalPos[0], goalPos[1]) || SEE_EVERYTHING)
				levelCreation.placeAtCell(goal, goalPos[0], goalPos[1]);
				
			if (playerPos[0] == goalPos[0] && playerPos[1] == goalPos[1])
				this.newGame();
        },  

        movePlayerPosition: function()
        {
			var r = pc.math.vec3.create();
//			pc.math.vec3.subtract(lastPosition, playerPos, r);
			var t = Math.min(1, dtSincePlayerMoved / 0.5);
			pc.math.vec3.lerp(lastPosition, playerPos, t, r);
			levelCreation.placeAtCell(player, r[0], r[1]);
        },
              
        update: function (dt) {
        	if (playerPos)
        		this.tick(dt);
        },
        
        planPathToGoalFrom: function(x0, y0) {
        	var width = level.cols;
        	var xyToIdx = function (x,y) { return x + y*width; };
        	var idxToX = function(index) { return index % width; };
        	var idxToY = function(index) { return Math.floor(index / width); };
        	var heuristicCost = function(startIdx, goalIdx) { 
        		var x = idxToX(startIdx);
        		var y = idxToY(startIdx);
        		var gx = idxToX(goalIdx);
        		var gy = idxToY(goalIdx);
        		return Math.abs(gx - x) + Math.abs(gy - y);
        	};
        	var neighboursFrom = function(index) {
        		var x = idxToX(index);
        		var y = idxToY(index);
        		var neighbours = [];
        		var canGo = function(x1, y1) { return level.isCellEmpty(x1, y1); };
        		if (canGo(x-1, y)) neighbours.push(xyToIdx(x-1, y));
        		if (canGo(x+1, y)) neighbours.push(xyToIdx(x+1, y));
        		if (canGo(x, y-1)) neighbours.push(xyToIdx(x, y-1));
        		if (canGo(x, y+1)) neighbours.push(xyToIdx(x, y+1));
        		return neighbours;
        	};

        	var goalIndex = xyToIdx(goalPos[0], goalPos[1]);
        	var closedSet = [];
        	var openSet = [];
        	var cameFrom = [];
        	var gScoreMap = [];
        	var fScoreMap = [];
        	var findLowestF = function(set) { 
        		var bestIdx = set[0];
        		var bestCost = fScoreMap[bestIdx];
        		var bestI = 0;
        		for (var i = set.length - 1; i >= 0; i--) {
        			var thisIdx = set[i];
        			var thisCost = fScoreMap[thisIdx];
        			if (thisCost < bestCost) {
        				bestCost = thisCost;
        				bestIdx = thisIdx;
        				bestI = i;
        			}
        		};
        		set.splice(bestI, 1);
        		return bestIdx;
        	};

        	var startIndex = xyToIdx(x0, y0);
        	openSet.push(startIndex);
        	gScoreMap[startIndex] = 0;
        	fScoreMap[startIndex] = heuristicCost(startIndex, goalIndex);

        	while (openSet.length > 0) {
        		var candidate = findLowestF(openSet)
        		if (candidate == goalIndex)
        			break;
        		if (closedSet[candidate])
        			continue;
        		closedSet[candidate] = true;

	        	var neighbours = neighboursFrom(candidate);
	        	var best = -1;
	        	var bestCost = fScoreMap[candidate];
	        	for (var i = neighbours.length - 1; i >= 0; i--) {
	        		var idx = neighbours[i];
	        		if (closedSet[idx]) 
	        			continue;

	        		var costFromHere = gScoreMap[candidate] + 1;
	        		if (gScoreMap[idx] == null || costFromHere < gScoreMap[idx]) {
	        			gScoreMap[idx] = costFromHere;
	        			cameFrom[idx] = candidate;
	        			fScoreMap[idx] = costFromHere + heuristicCost(idx, goalIndex);
	        			openSet.push(idx);
	        		}
	        	};
        	}

        	if (cameFrom[goalIndex]) {
        		var idx = goalIndex;
        		while (cameFrom[idx] != startIndex) {
        			idx = cameFrom[idx];
        		}
        		return pc.math.vec2.create(idxToX(idx), idxToY(idx));
        	}
        	else {
        		return pc.math.vec2.create(x0, y0);
        	}
        },

        tick: function(dt) {
			if (context.keyboard.wasPressed(pc.input.KEY_M)) {
				MANUAL_MOVE = !MANUAL_MOVE;
			}
			dtSincePlayerMoved += dt;
        	if (dtSincePlayerMoved > SECONDS_BETWEEN_MOVES) {

				var dx = 0;
				var dz = 0;
        		if (MANUAL_MOVE) {
					
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
				}

				if (!MANUAL_MOVE || context.keyboard.isPressed(pc.input.KEY_SPACE)) {
					var nextPos = this.planPathToGoalFrom(playerPos[0], playerPos[1]);
					dx = nextPos[0] - playerPos[0];
					dz = nextPos[1] - playerPos[1];
				}

				if (dx != 0 || dz != 0) {
					if (level.isCellEmpty(playerPos[0] + dx, playerPos[1] + dz)) {
						pc.math.vec2.copy(playerPos, lastPosition);
						playerPos[0] += dx;
						playerPos[1] += dz;
						
						this.updatePlayerPosition();
						dtSincePlayerMoved = 0;
						moveCount++;
						
						debugOutput.innerHTML = "Moves: "+moveCount;
					}
				}
			}
			this.movePlayerPosition();
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

//});
