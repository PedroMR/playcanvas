pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var ROOT_WALL_CONTAINER = 'Walls';
    var rootWall;
    var rootWallContainer;
    var rootTile;
    var rootTileContainer;
    var CELL_TO_WORLD = 10;
    var level;
    var ROWS = 20;
    var COLS = 20;
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
		
		return newEntity;
    };

    LevelCreation.prototype = {
        initialize: function () {
            rootWall = context.root.findByName(ROOT_WALL_NAME);
            rootWallContainer = context.root.findByName(ROOT_WALL_CONTAINER);
            rootTile = context.root.findByName('Tile0');
            rootTileContainer = context.root.findByName('Tiles');
            this.addWall(-2, 0, 1, false);
            this.addWall(-2, 2, 2, true);
            this.addWall(-2, 2, 2, false);
            
            this.createMaze();
            
            for (var z=0; z < COLS; z++) {
	            for (var x=0; x < COLS; x++) {
	            	if (level[z][x] == HOLLOW) {
		            	this.addTile(x, z, level[z][x]);
		            	if (level[z][x+1] != HOLLOW)
		            		this.addWall(x+1, z+1, 1, true);
		            	if (level[z][x-1] != HOLLOW)
		            		this.addWall(x, z+1, 1, true);
		            	if (level[z-1][x] != HOLLOW)
		            		this.addWall(x, z, 1, false);
		            	if (level[z+1][x] != HOLLOW)
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
        	
        	this.carveRoom(5, 12, 6, 4);
        	this.carveRoom(10, 4, 4, 5);
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
	        		if (!ifUndefined || level[z][x] == UNDEFINED)
		        		level[z][x] = type;
	        	}        	
        	}
        },
    };

   return LevelCreation;
});