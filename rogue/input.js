pc.script.create('input', function (context) {
    var camera;
    var resettable = false;
    
    var Input = function (entity) {
        this.entity = entity;
    };

    Input.prototype = {
        initialize: function () {
            camera = context.root.findByName("Camera");
        },
        
        update: function (dt) {
            var dx = 0;
            var dz = 0;
            if (context.keyboard.isPressed('W')) {
                dz -= 1;
            }
            if (context.keyboard.isPressed('A')) {
                dx -= 1;
            }
            if (context.keyboard.isPressed('S')) {
                dz += 1;
            }
            if (context.keyboard.isPressed('D')) {
                dx += 1;
            }
            
            var speed = 50;
            
            camera.translate(dx*dt*speed, 0, dz*dt*speed);
            
            if (context.keyboard.isPressed('N')) {
            	if (resettable)
			        context.systems.script.broadcast('levelCreation', 'resetMaze', null);
		        resettable = false;
		    } else {
			    resettable = true;
		    }
        }
    };

   return Input;
});