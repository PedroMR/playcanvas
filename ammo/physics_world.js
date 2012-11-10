pc.script.create('physics_world', function (context) {
    var PhysicsWorld = function (entity) {
        this.entity = entity;

        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        var overlappingPairCache = new Ammo.btDbvtBroadphase();
        var solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -9.82, 0));
    };

    PhysicsWorld.prototype = {
        addVehicle: function (vehicle) {
            this.dynamicsWorld.addVehicle(vehicle);
        },

        addConstraint: function (constraint) {
            this.dynamicsWorld.addConstraint(constraint, true);
        },

        addRigidBody: function (body) {
            this.dynamicsWorld.addRigidBody(body);
        },
        
        getDynamicsWorld: function () {
            return this.dynamicsWorld;  
        },

        update: function (dt) {
            this.dynamicsWorld.stepSimulation(dt, 10, 1/60);
        }
    };

   return PhysicsWorld;
});