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
    var SEE_EVERYTHING = true;
    var MANUAL_MOVE = false;
    var SECONDS_BETWEEN_MOVES = 0.5;
    var creatures = [];
    var zombieModel;

    var Game = function (entity) {
        this.entity = entity;
    };

    var vecToString = function(vec) {
        var str = "";
        for (var i=0; i < vec.length; i++) {
            str += (i>0 ? ", " : "")+vec.data[i];
        }
        return str;
    };
    
    var createDiv = function(id, left, top) {
        var div = document.createElement('div');
        div.id = id;
        div.style.position = 'absolute';
        div.style.left = left;
        div.style.top = top;
        div.style.width = '50%';
        div.style.color = '#ffffff';
        div.style.fontFamily = 'Courier';
        div.style.display = true ? 'block' : 'none';
        container.appendChild(div);

        return div;
    };

    var onMouseDown = function (e) {
        var tile = levelCreation.pickTile(e);
    };

    Game.prototype = {        
        initialize: function () {
            container = document.body;
            
            player = context.root.findByName('Player');
            goal = context.root.findByName('Goal');
            camera  = context.root.findByName('Camera');
            zombieModel = player;
            
            debugOutput = createDiv('debugOutput', '2%', '5%');
            debugOutput.innerHTML = "---";
            
            distanceOutput = createDiv('distanceOutput', '50%', '80%');
            distanceOutput.style.fontSize = '32pt';
            distanceOutput.style.color = 'yellow';
            distanceOutput.innerHTML = "";
            
            context.mouse.bind('mousedown', onMouseDown );

            this.newGame();
        },
        
        newGame: function() {
            levelCreation = this.entity.script.levelCreation.getLevelCreation();
            levelCreation.resetMaze();
            level = levelCreation.getLevel();
            
            goalPos = new pc.Vec2();
            level.getRandomEmptyTile(goalPos);
            levelCreation.placeAtCell(goal, 9999, 9999);
            
            playerPos = new pc.Vec2();
            level.getRandomEmptyTile(playerPos);
            this.updatePlayerPosition();
            lastPosition = playerPos.clone();

            levelCreation.placeAtCell(zombieModel.clone(), playerPos.x-1, playerPos.y);
            
            moveCount = 0;
        },
        
        updatePlayerPosition: function() {
            levelCreation.placeAtCell(player, playerPos.x, playerPos.y);
            level.seeCellsFrom(playerPos.x, playerPos.y);
            levelCreation.renderSeenCells();
            
            if (level.hasSeenCell(goalPos.x, goalPos.y) || SEE_EVERYTHING)
                levelCreation.placeAtCell(goal, goalPos.x, goalPos.y);
                
            if (playerPos.x == goalPos.x && playerPos.y == goalPos.y)
                this.newGame();
        },  

        movePlayerPosition: function() {
            var r = new pc.Vec3();
            var t = Math.min(1, dtSincePlayerMoved / 0.5);
            r.lerp(lastPosition, playerPos, t);
            levelCreation.placeAtCell(player, r.x, r.y);
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

            var goalIndex = xyToIdx(goalPos.x, goalPos.y);
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
                return new pc.Vec2(idxToX(idx), idxToY(idx));
            }
            else {
                return new pc.Vec2(x0, y0);
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
                    var nextPos = this.planPathToGoalFrom(playerPos.x, playerPos.y);
                    dx = nextPos.x - playerPos.x;
                    dz = nextPos.y - playerPos.y;
                }

                if (dx != 0 || dz != 0) {
                    if (level.isCellEmpty(playerPos.x + dx, playerPos.y + dz)) {
                        lastPosition.copy(playerPos);
                        playerPos.x += dx;
                        playerPos.y += dz;
                        
                        this.updatePlayerPosition();
                        dtSincePlayerMoved = 0;
                        moveCount++;
                        
                        debugOutput.innerHTML = "Moves: "+moveCount;
                    }
                }
            }
            this.movePlayerPosition();
            var playerPosition = player.getPosition();
            var targetCameraPos = new pc.Vec3(playerPosition.x+100, 150, playerPosition.z+100);
            var cameraPos = camera.getLocalPosition();
            var r = new pc.Vec3();
            r.sub2(cameraPos, targetCameraPos);
            if (r.length() > 0.1) {
                r.lerp(cameraPos, targetCameraPos, 0.04);
                camera.setLocalPosition(r);
            }
        },
    };

    return Game;
});