pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var ROOT_WALL_CONTAINER = 'Walls';
    var rootWall;
    var rootWallContainer;
    var rootTile;
    var rootTileContainer;
    var CELL_TO_WORLD = 10;
       
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
            
            for (var x = -5; x <= 5; x++)
	            for (var z = -5; z <= 5; z++)
		            this.addTile(x, z, 0);//5*Math.cos(x*z*0.07));
        },
        
        addTile: function(x, z, height) {
        	var newTile = cloneEntity(rootTile);
            var rootY = rootTile.getLocalPosition()[1];
            var rootScale = rootTile.getLocalScale();
        	newTile.setLocalPosition(x*CELL_TO_WORLD, rootY, z*CELL_TO_WORLD);
        	newTile.translateLocal(rootScale[0]/2, height, rootScale[2]/2);
            rootTileContainer.addChild(newTile);

        },
        addWall: function(x, z, length, vertical) {
            var newWall = cloneEntity(rootWall);
 
            var rootY = rootWall.getLocalPosition()[1];
            var rootScale = rootWall.getLocalScale();
            newWall.setLocalPosition(x*CELL_TO_WORLD, rootY, z*CELL_TO_WORLD);
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
        }
    };

   return LevelCreation;
});