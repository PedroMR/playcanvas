pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var ROOT_WALL_CONTAINER = 'Walls';
    var rootWall;
    var rootWallContainer;
    var rootTile;
    var rootTileContainer;
    var CELL_TO_WORLD = 10;
    var level;
    var ROWS = 30;
    var COLS = 30;
    var UNDEFINED = 1;
    var HOLLOW = 0;
    var BLOCKED = 2;
           
    var LevelCreation = function (entity) {
        this.entity = entity;
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
            
            this.createMaze();
            
            for (var z=0; z < ROWS; z++) {
	            for (var x=0; x < COLS; x++) {
	            	if (this.getCellType(x, z) == HOLLOW) {
		            	this.addTile(x, z, level[z][x]);
		            	if (this.getCellType(x+1, z) != HOLLOW)
		            		this.addWall(x+1, z+1, 1, true);
		            	if (this.getCellType(x-1, z) != HOLLOW)
		            		this.addWall(x, z+1, 1, true);
		            	if (this.getCellType(x, z-1) != HOLLOW)
		            		this.addWall(x, z, 1, false);
		            	if (this.getCellType(x, z+1) != HOLLOW)
		            		this.addWall(x, z+1, 1, false);
		            }
	            }
            }
            
        },
        
        addTile: function(x, z, height) {
        	var newTile = cloneEntity(rootTile);
            var rootY = rootTile.getLocalPosition()[1];
            var rootScale = rootTile.getLocalScale();
        	newTile.setLocalPosition((x-COLS/2)*CELL_TO_WORLD, rootY, (z-ROWS/2)*CELL_TO_WORLD);
        	newTile.translateLocal(rootScale[0]/2, height, rootScale[2]/2);
            rootTileContainer.addChild(newTile);

        },
        addWall: function(x, z, length, vertical) {
            var newWall = cloneEntity(rootWall);
 
            var rootY = rootWall.getLocalPosition()[1];
            var rootScale = rootWall.getLocalScale();
            newWall.setLocalPosition((x-COLS/2)*CELL_TO_WORLD, rootY, (z-ROWS/2)*CELL_TO_WORLD);
            if (vertical)
                newWall.rotateLocal(0, 90, 0);
            if (length > 1) {
            	rootScale = pc.math.vec3.clone(rootScale);
	            rootScale[0] *= length;
            }
            newWall.setLocalScale(rootScale);
            newWall.translateLocal(rootScale[0]/2, 0, rootScale[2]/2);
            
            rootWallContainer.addChild(newWall);
        },
        
        update: function (dt) {
        },
        
        createMaze: function() {
        	level = new Array(ROWS);
        	for (var z=0; z < ROWS; z++) {
        		level[z] = new Array(COLS);
        		for (var x=0; x < COLS; x++)
        			level[z][x] = UNDEFINED;
        	}
        	
//         	var sx = Math.floor(pc.math.random(0, COLS));
//         	var sz = Math.floor(pc.math.random(0, ROWS));
//         	var spawn = pc.math.vec2.create(sx,sz);
//         	level[sz][sx] = HOLLOW;
        	
        	var room = pc.math.vec4.create();
       		var wallToBreak = pc.math.vec2.create();
       		
       		this.generateRandomRoom(room);
   			this.carveRoom(room[0], room[1], room[2], room[3]);
			if (this.findWallToBreak(wallToBreak))
				this.carveCorridor(wallToBreak[0], wallToBreak[1], this.randomInt(3, 6));
       		
       		var nRooms = 1;
       		var maxRooms = 8;
       		
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
						this.carveCorridor(wallToBreak[0], wallToBreak[1], this.randomInt(4, 8));
					else
						break;
        		}
        	}
        },
        
        generateRandomRoom: function(room) {
        	room[0] = this.randomInt(0, COLS-5);
        	room[1] = this.randomInt(0, ROWS-5);
        	room[2] = this.randomInt(4, 7);
        	room[3] = this.randomInt(4, 7);
        },
        
        randomInt: function(min, max) {
        	return Math.floor(pc.math.random(min, max));
        },
        
        canFitRoom: function(x0, z0, dx, dz) {
        	var entrances = 0;
        	for (var z = z0; z < z0+dz; z++) {
	        	for (var x = x0; x < x0+dx; x++) {
	        		if (this.getCellType(x, z) != UNDEFINED)
	        			return false;
	        	}
	        }
        	for (var z = z0; z < z0+dz; z++) {
	        	entrances += this.getCellType(x0-1, z) == HOLLOW ? 1 : 0;
	        	entrances += this.getCellType(x0+dx, z) == HOLLOW ? 1 : 0;
        	}
	    	for (var x = x0; x < x0+dx; x++) {
	        	entrances += this.getCellType(x, z0-1) == HOLLOW ? 1 : 0;
	        	entrances += this.getCellType(x, z0+dz) == HOLLOW ? 1 : 0;
        	}
        	return (entrances > 0);
        },
        
        findWallToBreak: function(pos) {
        	for (var i=0; i < 999999; i++) {
        		pos[0] = this.randomInt(0, COLS);
        		pos[1] = this.randomInt(0, ROWS);
        		
        		if (this.getCellType(pos[0], pos[1]) != HOLLOW) {
            		var spaceAround = 0;
    	    		spaceAround += this.getCellType(pos[0]-1,pos[1]) == HOLLOW ? 1 : 0;
    	    		spaceAround += this.getCellType(pos[0]+1,pos[1]) == HOLLOW ? 1 : 0;
    	    		spaceAround += this.getCellType(pos[0],pos[1]-1) == HOLLOW ? 1 : 0;
    	    		spaceAround += this.getCellType(pos[0],pos[1]+1) == HOLLOW ? 1 : 0;
    	    		if (spaceAround == 1)
    	    			return true;
    	    	}
        	}
        	return false;
        },
        
        getCellType: function(x, z) {
        	if (z < 0 || z >= ROWS || x < 0 || x >= COLS)
        		return BLOCKED;
        	return level[z][x];
        },
        
        setCellType: function(x, z, type) {
        	if (z < 0 || z >= ROWS || x < 0 || x >= COLS)
        		return;
        	else
	        	level[z][x] = type;
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
	        		if (!ifUndefined || this.getCellType(x, z) == UNDEFINED)
		        		this.setCellType(x, z, type);
	        	}        	
        	}
        },
        
        carveCorridor: function(x0, z0, length) {
        	if (this.getCellType(x0, z0) == HOLLOW) return;
        	
        	// find empty space around it to determine direction
        	var dx = 0, dz = 0;
        	if (this.getCellType(x0, z0-1) == HOLLOW) dz = 1;
        	else if (this.getCellType(x0, z0+1) == HOLLOW) dz = -1;
        	else if (this.getCellType(x0-1, z0) == HOLLOW) dx = 1;
        	else if (this.getCellType(x0+1, z0) == HOLLOW) dx = -1;
        	else return;
        	
        	for (var i=0; i < length; i++) {
        		if (this.getCellType(x0+i*dx, z0+i*dz) == HOLLOW)
        			break;
        		this.setCellType(x0+i*dx, z0+i*dz, HOLLOW);
        	}
        },   
        
        getRandomEmptyTile: function(pos) {
            for (var i=0; i < 999999; i++) {
        		pos[0] = this.randomInt(0, COLS);
        		pos[1] = this.randomInt(0, ROWS);
        		
        		if (this.getCellType(pos[0], pos[1]) == HOLLOW)
        			return true;
        	}
        	return false;
        },     
    };

   return LevelCreation;
});