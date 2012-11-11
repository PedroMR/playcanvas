pc.script.create('mob', function (context) {
    var camera;
    
    var Mob = function (entity) {
        this.entity = entity;
        this.x = 10;
        this.z = 10;
    };

    Mob.prototype = {    	
        initialize: function () {
        },
        
        update: function (dt) {
        },
        
        setLevelCreator: function (level) {
        	this.level = level;
        },
                
        tick: function() {
        	
        },
    };

   return Mob;
});