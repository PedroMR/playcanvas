pc.script.create('levelCreation', function (context) {
    var ROOT_WALL_NAME = 'Wall0';
    var rootWall;
    
    var LevelCreation = function (entity) {
        this.entity = entity;
    };

    LevelCreation.prototype = {
        initialize: function () {
            rootWall = context.root.findByName(ROOT_WALL_NAME);
            this.addWall(-8, 2, 5, true);
        },
        
        addWall: function(x, z, length, vertical) {
            var newWall = new pc.fw.Entity();
                        
            context.systems.primitive.createComponent(newWall, {
                type: 'Box',
                color: '0xff0000',
            });
 
            var rootY = rootWall.getLocalPosition()[1];
            newWall.setLocalPosition(x, rootY, z);
            newWall.setLocalScale(rootWall.getLocalScale());
            if (vertical)
                newWall.rotateLocal(0, 90, 0);
            
            context.root.addChild(newWall);
        },
        
        update: function (dt) {
        }
    };

   return LevelCreation;
});