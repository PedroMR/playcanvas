pc.script.create('boxbody', function (context) {

    var BoxBody = function (entity) {};
    BoxBody = pc.inherits(BoxBody, RigidBody);

    BoxBody.prototype.initialize = function () {
        var scale = this.entity.getLocalScale();
        var shape = new Ammo.btBoxShape(new Ammo.btVector3(scale[0] * 0.5, scale[1] * 0.5, scale[2] * 0.5));

        var isDynamic = this.entity.getName().toLowerCase().indexOf('dynamic') !== -1;
        var mass = isDynamic ? 1 : 0;

        this.create(shape, mass);

        context.systems.script.broadcast('physics_world', 'addRigidBody', this.body);
    };

    return BoxBody;
});