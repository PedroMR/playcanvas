pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var ROOT_WALL_CONTAINER = 'Walls';
    var rootWall;
    var rootWallContainer;
    var CELL_TO_WORLD = 10;
       
    var LevelCreation = function (entity) {
        this.entity = entity;
    };

    LevelCreation.prototype = {
        initialize: function () {
            rootWall = context.root.findByName(ROOT_WALL_NAME);
            rootWallContainer = context.root.findByName(ROOT_WALL_CONTAINER);
            this.addWall(-2, 2, 2, true);
            this.addWall(-2, 2, 4, false);
        },
        
        addWall: function(x, z, length, vertical) {
            var newWall = new pc.fw.Entity();
                        
            var boxColor = context.systems.primitive.get(rootWall, 'color');
            context.systems.primitive.createComponent(newWall, {
                type: 'Box',
                color: boxColor,
            });
 
            var rootY = rootWall.getLocalPosition()[1];
            var rootScale = rootWall.getLocalScale();
            newWall.setLocalPosition(x*CELL_TO_WORLD, rootY, z*CELL_TO_WORLD);
            if (vertical)
                newWall.rotateLocal(0, 90, 0);
            newWall.translateLocal(rootScale[0]/2, 0, rootScale[2]/2);
            if (length > 1) {
	            rootScale[0] *= length;
            }
            newWall.setLocalScale(rootScale);
            
            rootWallContainer.addChild(newWall);
        },
        
        update: function (dt) {
        }
    };

   return LevelCreation;
});