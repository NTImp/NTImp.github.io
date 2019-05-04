class Player {
    constructor(world, position, rotation) {
        this.world = world;
        this.pos = position.slice(0);
        this.rot = rotation.slice(0);
        this.speed = 5;
        this.rotSpeed = 15;
        this.width = 0.8;
        this.height = 1.9;
        this.vspeed = 0.0;
        this.movingCamera = false;
        this.buildBlock = "grass";
        this.pressing = false;

        this.state = 0; //0 is normal physics

        this.setGravityAndJump(1.2, 0.5);
    }

    raycast() {
        var pCoords = world.render.screenToWorld(input.mouseX, input.mouseY);
        vec3.sub(pCoords, pCoords, this.eyePos);
        var rcast = new Raycast(world, this.eyePos, pCoords, 20);
        this.rBlock = rcast.getBlock(0.05);
    }

    setGravityAndJump(h, t) {
        this.jumpSpeed = 4 * h / t;
        this.gravity = this.jumpSpeed * 2 / t;
    }

    update(delta) {
        this.raycast();
        if (input.keypress("noclip")) {
            this.state = 1;
        }
        if (input.keypress("physics")) {
            this.state = 0;
        }
        if (input.mousePressed != 0) {
            this.pressing = true;
            if (Math.abs(input.deltaX) - 4 > 0
                || Math.abs(input.deltaY) - 4 > 0)
            {
                this.movingCamera = true;
            }
        }

        if (input.mousePressed == 0) {
            if (!this.movingCamera) {
                if (this.rBlock != null && this.pressing) {
                    world.setBlock(this.rBlock.position[0],
                        this.rBlock.position[1],
                        this.rBlock.position[2], "air", true);
                }
            }
            this.pressing = false;
            this.movingCamera = false;
        }

        if (this.movingCamera) {
            this.rot[1] += input.deltaX * delta * this.rotSpeed;
            this.rot[0] += input.deltaY * delta * this.rotSpeed;
            if (this.rot[0] < -75) this.rot[0] = -75;
            if (this.rot[0] > 75) this.rot[0] = 75;
        }

        if (input.mouseRightPressed == 1) {
            if (this.rBlock != null) {
                world.setBlock(
                    this.rBlock.position[0] + this.rBlock.normal[0],
                    this.rBlock.position[1] + this.rBlock.normal[1],
                    this.rBlock.position[2] + this.rBlock.normal[2],
                    this.buildBlock, true);
            }
        }

        if (this.state == 0) this.updatePhysics(delta);
        else this.updateNoclip(delta);
    }

    updateNoclip(delta) {
        var angle = this.rotation[1];
        var ix = 0;
        var iy = 0;
        var iz = 0;

        if (input.keypress("w")) {
            iz -= Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
            ix += Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("s")) {
            iz += Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
            ix -= Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("d")) {
            iz += Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
            ix += Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("a")) {
            iz -= Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
            ix -= Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("jump")) {
            iy += this.speed * delta;
        }
        if (input.keypress("shift")) {
            iy -= this.speed * delta;
        }

        this.pos[0] += ix;
        this.pos[1] += iy;
        this.pos[2] += iz;
    }

    updatePhysics(delta) {
        var angle = this.rotation[1];
        var angle = this.rotation[1];
        var ix = 0;
        var iy = 0;
        var iz = 0;

        if (input.keypress("w")) {
            iz -= Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
            ix += Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("s")) {
            iz += Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
            ix -= Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("d")) {
            iz += Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
            ix += Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
        }

        if (input.keypress("a")) {
            iz -= Math.sin(glMatrix.toRadian(angle)) * delta * this.speed;
            ix -= Math.cos(glMatrix.toRadian(angle)) * delta * this.speed;
        }



        this.vspeed -= this.gravity * delta;
        if (input.keypress("jump") && this.ground) {
            this.vspeed = this.jumpSpeed;
        }
        iy += this.vspeed * delta;

        var ignoreBlocks = Physics.collision(this.collbox, this.world).blocks;
        //Move y
        if (iy != 0) {
            this.pos[1] += iy;
            var result = Physics.collision(this.collbox, this.world, ignoreBlocks);
            if (result.collision) {
                if(iy < 0) {
                    this.ground = true;
                    this.vspeed = 0;
                }
                this.pos[1] = iy > 0 ? (result.min[1] - 0.01 - this.height) : result.max[1];
            } else {
                this.ground = false;
            }
        }
        //Move x
        if (ix != 0) {
            this.pos[0] += ix;
            var result = Physics.collision(this.collbox, this.world, ignoreBlocks);
            if (result.collision) {
                this.pos[0] = ix > 0 ? (result.min[0] - 0.01 - this.width / 2) : (result.max[0] + 0.01 + this.width / 2);
            }
        }
        //Move z
        if (iz != 0) {
            this.pos[2] += iz;
            var result = Physics.collision(this.collbox, this.world, ignoreBlocks);
            if (result.collision) {
                this.pos[2] = iz > 0 ? (result.min[2] - 0.01 - this.width / 2) : (result.max[2] + 0.01 + this.width / 2);
            }
        }
    }

    get position() {
        return this.pos.slice();
    }

    get rotation() {
        return this.rot.slice();
    }

    get collbox() {
        return {
            position: [this.pos[0] - this.width / 2, this.pos[1], this.pos[2] - this.width / 2],
            size: [this.width, this.height, this.width],
        };
    }

    get eyePos() {
        return [this.pos[0], this.pos[1] + 1.8, this.pos[2]];
    }
}