pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var ROOT_WALL_CONTAINER = 'Walls';
    var rootWall;
    var rootWallContainer;
    var rootTile;
    var rootTileContainer;
    var CELL_TO_WORLD = 10;
    var level, renderedCells;
    var ROWS = 50;
    var COLS = 50;
    var MAX_ROOMS = 20;
    
    var UNDEFINED = 1;
    var HOLLOW = 0;
    var BLOCKED = 2;
           
    var LevelCreation = function (entity) {
        this.entity = entity;
    };
    
	var convertCellToWorld = function(col, row) {
		return pc.math.vec3.create(col*CELL_TO_WORLD, 0, row*CELL_TO_WORLD);
	};
        
    var cloneEntity = function (original) {
    	var newEntity = new pc.fw.Entity();
    	
    	newEntity.setLocalPosition(original.getLocalPosition());  	
    	newEntity.setLocalRotation(original.getLocalRotation());  	
    	newEntity.setLocalScale(original.getLocalScale());

		if (original.primitive) {
			context.systems.primitive.addComponent(newEntity, original.primitive.data);
		}
		if (original.script) {
			context.systems.script.addComponent(newEntity, original.script.data);
		}
		
		return newEntity;
    };

    LevelCreation.prototype = {
        initialize: function () {
            rootWall = context.root.findByName(ROOT_WALL_NAME);
            rootWallContainer = context.root.findByName(ROOT_WALL_CONTAINER);
            rootTile = context.root.findByName('Tile0');
            rootTileContainer = context.root.findByName('Tiles');
        },
        
        resetMaze:function() {
            this.createMaze();
            
            var children = rootWallContainer.getChildren();
            var node;
            while (node = children.pop()) {
            	node.destroy();
            }
            children = rootTileContainer.getChildren();
            while (node = children.pop()) {
            	node.destroy();
            }
            
            renderedCells = level.createCellArray(false);
            this.renderSeenCells();
        },
        
        renderSeenCells: function() {
            for (var z=0; z < ROWS; z++) {
	            for (var x=0; x < COLS; x++) {
	            	var visible = true;//level.hasSeenCell(x, z);
	            	if (!visible)
	            		continue;
					if (renderedCells[z][x]) {
                        var colour = "0x3a2a2a";
                        if (level.isCellInSight(x, z))
                            colour = "0xe4baba";
                        else if (level.hasSeenCell(x, z))
                            colour = "0x644a4a";
						var cell = renderedCells[z][x];
                        var tile;
                        if (cell) {
                            for (var i = cell.length - 1; i >= 0; i--) {
                                var obj = cell[i];
                                if (obj && obj.primitive)
                                    obj.primitive.color = colour;
                            };
                        }
						continue;
					}
					renderedCells[z][x] = true;
					
	            	if (level.getCellType(x, z) == HOLLOW) {
                        var cell = []
		            	renderedCells[z][x] = cell; 
                        cell.push(this.addTile(x, z, 0));
		            	if (level.getCellType(x+1, z) != HOLLOW)
		            		cell.push(this.addWall(x+1, z+1, 1, true, false));
		            	if (level.getCellType(x-1, z) != HOLLOW)
		            		cell.push(this.addWall(x, z+1, 1, true, true));
		            	if (level.getCellType(x, z-1) != HOLLOW)
		            		cell.push(this.addWall(x, z, 1, false, true));
		            	if (level.getCellType(x, z+1) != HOLLOW)
		            		cell.push(this.addWall(x, z+1, 1, false, false));
		            }
	            }
            }
            
        },

        cloneEntity: cloneEntity,
        
        getLevel:function() {
			return level;
        },
        
        addTile: function(x, z, height) {
        	var newTile = cloneEntity(rootTile);
            var rootY = rootTile.getLocalPosition()[1];
            var rootScale = rootTile.getLocalScale();
            this.placeAtCell(newTile, x, z);
            rootTileContainer.addChild(newTile);
            return newTile;
        },
        
        placeAtCell: function(entity, col, row) {
        	entity.setLocalPosition(convertCellToWorld(col-COLS/2, row-ROWS/2));
        },

		getLevelCreation: function() {
			return this;
		},
                
        addWall: function(x, z, length, vertical, high) {
            var newWall = cloneEntity(rootWall);
 
            var rootY = rootWall.getLocalPosition()[1];
            var rootScale = rootWall.getLocalScale();
            this.placeAtCell(newWall, x-0.5, z-0.5);
            if (vertical)
                newWall.rotateLocal(0, 90, 0);
           	rootScale = pc.math.vec3.clone(rootScale);
            if (length > 1) {
	            rootScale[0] *= length;
            }
//             if (!high)
//             	rootScale[1] *= 0.25;
            newWall.setLocalScale(rootScale);
            newWall.translateLocal(rootScale[0]/2, 0, rootScale[2]/2);
            
            rootWallContainer.addChild(newWall);

            return newWall;
        },
        
        update: function (dt) {
        },
        
        createMaze: function() {
        	level = new Level(ROWS, COLS);
        	
        	var room = pc.math.vec4.create();
       		var wallToBreak = pc.math.vec2.create();
       		
       		this.generateRandomRoom(room);
   			this.carveRoom(room[0], room[1], room[2], room[3]);
			if (this.findWallToBreak(wallToBreak))
				this.carveCorridor(wallToBreak[0], wallToBreak[1], Util.randomInt(3, 6));
       		
       		var nRooms = 1;
       		var maxRooms = MAX_ROOMS;
       		
        	for (var tries=0; tries < 999999; tries++) {
        		if (pc.math.random(0,1) > 0.2) {
        			for (var i=0; i < 9999; i++) {
						this.generateRandomRoom(room);
						if (this.canFitRoom(room[0], room[1], room[2], room[3])) {
							this.carveRoom(room[0], room[1], room[2], room[3]);
							nRooms++;
							break;
						}
					}
					if (nRooms >= maxRooms)
						break;
        		} else {
					if (this.findWallToBreak(wallToBreak))
						this.carveCorridor(wallToBreak[0], wallToBreak[1], Util.randomInt(4, 8));
					else
						break;
        		}
        	}
        },
        
        generateRandomRoom: function(room) {
        	room[0] = Util.randomInt(0, COLS-5);
        	room[1] = Util.randomInt(0, ROWS-5);
        	room[2] = Util.randomInt(4, 7);
        	room[3] = Util.randomInt(4, 7);
        },
        
        canFitRoom: function(x0, z0, dx, dz) {
        	var entrances = 0;
        	for (var z = z0; z < z0+dz; z++) {
	        	for (var x = x0; x < x0+dx; x++) {
	        		if (level.getCellType(x, z) != UNDEFINED)
	        			return false;
	        	}
	        }
        	for (var z = z0; z < z0+dz; z++) {
	        	entrances += level.getCellType(x0-1, z) == HOLLOW ? 1 : 0;
	        	entrances += level.getCellType(x0+dx, z) == HOLLOW ? 1 : 0;
        	}
	    	for (var x = x0; x < x0+dx; x++) {
	        	entrances += level.getCellType(x, z0-1) == HOLLOW ? 1 : 0;
	        	entrances += level.getCellType(x, z0+dz) == HOLLOW ? 1 : 0;
        	}
        	return (entrances > 0);
        },
        
        findWallToBreak: function(pos) {
        	for (var i=0; i < 999999; i++) {
        		pos[0] = Util.randomInt(0, COLS);
        		pos[1] = Util.randomInt(0, ROWS);
        		
        		if (level.getCellType(pos[0], pos[1]) != HOLLOW) {
            		var spaceAround = 0;
    	    		spaceAround += level.getCellType(pos[0]-1,pos[1]) == HOLLOW ? 1 : 0;
    	    		spaceAround += level.getCellType(pos[0]+1,pos[1]) == HOLLOW ? 1 : 0;
    	    		spaceAround += level.getCellType(pos[0],pos[1]-1) == HOLLOW ? 1 : 0;
    	    		spaceAround += level.getCellType(pos[0],pos[1]+1) == HOLLOW ? 1 : 0;
    	    		if (spaceAround == 1)
    	    			return true;
    	    	}
        	}
        	return false;
        },
        
        carveRoom: function(x0, z0, dx, dz) {
        	this.fillArea(x0, z0, dx, dz, HOLLOW, false);
        	this.fillArea(x0-1, z0-1, dx+2, 1, BLOCKED, true);
        	this.fillArea(x0-1, z0+dz, dx+2, 1, BLOCKED, true);
        	this.fillArea(x0-1, z0-1, 1, dz+2, BLOCKED, true);
        	this.fillArea(x0+dx, z0-1, 1, dz+2, BLOCKED, true);
        },
        
        fillArea: function(x0, z0, dx, dz, type, ifUndefined) {
        	for (var z = z0; z < z0+dz; z++) {
	        	for (var x = x0; x < x0+dx; x++) {
	        		if (!ifUndefined || level.getCellType(x, z) == UNDEFINED)
		        		level.setCellType(x, z, type);
	        	}        	
        	}
        },
        
        carveCorridor: function(x0, z0, length) {
        	if (level.getCellType(x0, z0) == HOLLOW) return;
        	
        	// find empty space around it to determine direction
        	var dx = 0, dz = 0;
        	if (level.getCellType(x0, z0-1) == HOLLOW) dz = 1;
        	else if (level.getCellType(x0, z0+1) == HOLLOW) dz = -1;
        	else if (level.getCellType(x0-1, z0) == HOLLOW) dx = 1;
        	else if (level.getCellType(x0+1, z0) == HOLLOW) dx = -1;
        	else return;
        	
        	for (var i=0; i < length; i++) {
        		if (level.getCellType(x0+i*dx, z0+i*dz) == HOLLOW)
        			break;
        		level.setCellType(x0+i*dx, z0+i*dz, HOLLOW);
        	}
        },           
    };

   return LevelCreation;
});