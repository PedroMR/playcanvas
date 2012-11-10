function RigidBody(entity) {
    this.entity = entity;
    this.body = null;
    
    this.initialRot = pc.math.quat.create();
    this.initialPos = pc.math.vec3.create();
    pc.math.quat.copy(this.entity.getRotation(), this.initialRot);
    pc.math.vec3.copy(this.entity.getPosition(), this.initialPos);

    this.trans = new Ammo.btTransform();
    this.quat = new pc.math.quat.create();
}

RigidBody.prototype = {
    create: function (shape, mass) {
        mass = (typeof mass === 'undefined') ? 0 : mass;

        var localInertia = new Ammo.btVector3(0, 0, 0);
        if (mass > 0) {
          shape.calculateLocalInertia(mass, localInertia);
        }

        var pos = this.entity.getPosition();
        var rot = this.entity.getRotation();

        var startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        startTransform.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]));
        startTransform.setRotation(new Ammo.btQuaternion(rot[0], rot[1], rot[2], rot[3]));

        var motionState = new Ammo.btDefaultMotionState(startTransform);
        var bodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        this.body = new Ammo.btRigidBody(bodyInfo);
    },

    reset: function () {
        var body = this.body;
        var transform = body.getWorldTransform();
        transform.setOrigin(new Ammo.btVector3(this.initialPos[0], this.initialPos[1], this.initialPos[2]));
        transform.setRotation(new Ammo.btQuaternion(this.initialRot[0], this.initialRot[1], this.initialRot[2], this.initialRot[3]));
        body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
        body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
        body.activate();
    },

    update: function (dt) {
        var body = this.body;
        if (body.isActive() && body.getMotionState()) {
            body.getMotionState().getWorldTransform(this.trans);

            var p = this.trans.getOrigin();
            var q = this.trans.getRotation();
            this.entity.setPosition(p.x(), p.y(), p.z());
            this.quat[0] = q.x();
            this.quat[1] = q.y();
            this.quat[2] = q.z();
            this.quat[3] = q.w();
            this.entity.setRotation(this.quat);
        }
    }
};