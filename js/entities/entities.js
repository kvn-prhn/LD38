
/** 
 *	The general boat entity. All collision and game physics are handled here
 */
game.BoatEntity = me.Entity.extend({
	init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
		this.rotation = 0;  		// initial rotation.
		this.prevAngle = 0;         // the rotation that was last rendered
		this.boatAccel = 0;         // current boat acceleration. Can be negative for slowing down more quickly
		this.boatMoveSpeed = 2;     // how fast the boat can move
		this.boatAccelRate = 0.2;   // how fast the boat can accelerate
		this.boatTurnSpeed = 0.02;  // how fast the boat turns
		this.waterEffCounter = 0;   // variable for water effects.
		this.splashCounter = 180;     // variable to track when to play the boat splash sound
		this.boatMovingSound = "boatMoving";
    },

	update : function (dt) {
		// handling player input for general boats.
		if (this.playerControllingMe) {
			if (me.input.keyStatus("rotate_clockwise")) {
				this.rotation = this.rotation - this.boatTurnSpeed;
			} else if (me.input.keyStatus("rotate_counterclockwise")) {
				this.rotation = this.rotation + this.boatTurnSpeed;
			}
			// thrust controls
			if (me.input.keyStatus("forward")) {
				this.boatAccel = this.boatAccelRate;
			} else if (me.input.keyStatus("backward")) {
				this.boatAccel = -this.boatAccelRate;
			} else if (!me.input.keyStatus("backward") && !me.input.keyStatus("forward")) {
				this.boatAccel = 0;
			}
		}
	
		var rotated = false;
		// rotate them according to their rotation(?);
		if (this.rotation != this.prevAngle) {
			this.body.rotate(this.prevAngle - this.rotation);
			this.renderable.currentTransform.rotate(this.prevAngle - this.rotation);
			this.prevAngle = this.rotation;
			this.body.recalc();  // recalculate collision bounds
			rotated = true; // flag for update
		}
		
		// handle the boat acceleration
		if (this.boatAccel > 0) {
			// move in the direction of this.rotation.
			this.body.accel.set(
				Math.cos(this.rotation) * this.boatAccel,
				-Math.sin(this.rotation) * this.boatAccel
			);
		} else if (this.boatAccel < 0) {
			this.body.accel.set(
				-Math.cos(this.rotation) * this.boatAccel,
				Math.sin(this.rotation) * this.boatAccel
			);
		} else {
			if (Math.abs(this.body.vel.length()) > 0.04) {    // slightly decelerate, or halt if velocity is really small
				this.body.accel.set(
					-this.body.vel.x * 0.2,
					-this.body.vel.y * 0.2
				);
				
			} else {
				this.body.vel.set(0, 0);
				this.body.accel.set(0, 0);
			}
		}
		// cap acceleration
		if (this.body.accel.length() > 1) {
			this.body.accel.normalize().scale(1);
		}
		
		// update the body velocity.
		this.body.vel.set(
			this.body.vel.x + this.body.accel.x,
			this.body.vel.y + this.body.accel.y
		);
		
		// cal velocity
		if (this.body.vel.length() > this.boatMoveSpeed) {
			this.body.vel.normalize().scale(this.boatMoveSpeed);
		}
		
		// make the neat water effects
		if (this.body.vel.length() > 0.1) {
			this.waterEffCounter += (dt * this.body.vel.length() * 3);  // more the fast you go
			var delay = 17;
			if (this.waterEffCounter > delay) {
				var xScale = 1.3 * this.body.vel.x / this.body.vel.length();
				var yScale = 1.3 * this.body.vel.y / this.body.vel.length();
				var initX = this.pos.x + (this.width/2) - (xScale * (this.width/2));
				var initY = this.pos.y + (this.height/2) - (yScale * (this.height/2));
				var spreadRange = (this.width / 3);
				me.game.world.addChild(me.pool.pull("tempSprite", 
						initX + (Math.random() * spreadRange) - (spreadRange/2), 
						initY + (Math.random() * spreadRange) - (spreadRange/2), 
						me.loader.getImage("splash" +    // random splash sprite
						(1 + Math.floor(Math.random() * 3))), 
					200), 1	);
				this.waterEffCounter -= delay;
			}
		}
		
		if (rotated || this.body.vel.length() > 0.1) {
			// boat moving sound effect
			this.splashCounter += dt;
			if (this.splashCounter > 220) {
				me.audio.play(this.boatMovingSound, false, null, 0.2);
				this.splashCounter -= 220;
			}
		}
		
        // apply physics to the body (this moves the entity)
        this.body.update(dt);
	
        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0 || rotated);
    },
	
    onCollision : function (response, other) {
		if (other instanceof game.SinkableWallEntity && other.underwater == true) {
			return false;
		}
		if (other instanceof game.GrappleProjectile) {
			return false;
		}
		if (other instanceof game.VictoryZone) {
			return false;
		}
		
		// TEMP: Make boats not collidable
		// TODO: make it so boats CAN collide sometime later hopefully.
		if (other instanceof game.BoatEntity) {
			return false;
		}
		
        // Make all other objects solid
        return true;
    }
})



/**
 * Larger Battleship Player Entity
 */
game.BattleBoatEntity = game.BoatEntity.extend({

    init:function (x, y, settings) {
        settings.image = "battleBoat";
        this._super(game.BoatEntity, 'init', [x, y , settings]);
		
		// give the data your reference.
		if (game.data.battle_boat == undefined) {
			game.data.battle_boat = this;
		}
		this.missle = undefined;
		this.missleHeight = 0;
		this.missleHalfwayLength = 0;
		this.missleCurveAdjust = 0;
		this.missleShadow = undefined;
		this.targetLocation = undefined;
		this.boatMoveSpeed = 1;     // how fast the boat can move
		this.boatAccelRate = 0.02;   // how fast the boat can accelerate
		this.boatTurnSpeed = 0.01;   // how fast the boat turns
		this.alwaysUpdate = true;       // since this has the controls for 
									   // switching in it, it should always update.
		this.boatMovingSound = "boatMoving_slow";   // slighly different moving sound
    },

    update : function (dt) {
		// update the missle of applicable
		var updatedAnything = false;
		if (this.missle != undefined && this.targetLocation != undefined) {
			updatedAnything = true;
			// move towards target
			var bmovedir = new me.Vector2d(
				this.targetLocation.tx - this.missleShadow.pos.x,
				this.targetLocation.ty - this.missleShadow.pos.y
			)
			var distanceAway = bmovedir.length();
			bmovedir.normalize().scale(5);
			this.missleShadow.pos.x = this.missleShadow.pos.x + bmovedir.x;
			this.missleShadow.pos.y = this.missleShadow.pos.y + bmovedir.y;
			// change the height according to how far it is from the target.
			
			// increase the travel slope the farther from the center, and do the
			// opposite as you go away from the center.
			var deltaHeight = ((distanceAway - this.missleHalfwayLength) / this.missleCurveAdjust);
			this.missleHeight += deltaHeight;
			
			this.missle.pos.x = this.missleShadow.pos.x;
			this.missle.pos.y = this.missleShadow.pos.y - this.missleHeight;
			// keep the missle above the missle shadow
			if (distanceAway < 5) {
				// explosion!
				me.game.world.addChild(new game.TempSprite( 
						this.missleShadow.pos.x , this.missleShadow.pos.y , 
						me.loader.getImage("explosion"), 200), 100);
				// explosion sound effet
				me.audio.play("explosion");
				// destroy any nearby debris
				var tempMissleRef = this.missleShadow;
				me.game.world.forEach(function(child) {
					if (child instanceof game.DebrisEntity) {
						var distanceAway = new me.Vector2d(
							tempMissleRef.pos.x - child.pos.x,
							tempMissleRef.pos.y - child.pos.y
						).length();
						if (distanceAway < 40) {
							me.game.world.removeChild(child);
						}
					}
				});
				me.game.world.removeChild(this.missle);
				me.game.world.removeChild(this.missleShadow);
				this.missle = undefined;
				this.missleShadow = undefined;
				this.targetLocation = undefined;
				me.game.repaint();
			}
		}
		
		// only handle boat changing in one of the netities
		if (game.data.controlling == undefined || 
				(me.input.keyStatus("change_controlling") && !game.data.controlling_change_debounce)) {
			game.data.controlling_change_debounce = true;
			// change the boat controlling	
			if (game.data.controlling == TUG_BOAT) {
				game.data.tug_boat.boatAccel = 0;     // stop the tug_boat acceleration before changing
				game.data.controlling = BATTLE_BOAT;
				me.game.viewport.follow(game.data.battle_boat);
			} else {
				game.data.battle_boat.boatAccel = 0;    // stop the battle boat acceleration before changing
				game.data.controlling = TUG_BOAT; 
				me.game.viewport.follow(game.data.tug_boat);
			}
			me.audio.play("changeBoat");
			me.video.renderer.clear();
			me.video.renderer.flush();
			me.game.repaint();
			updatedAnything = true;
		} else if (!me.input.keyStatus("change_controlling")) {
			game.data.controlling_change_debounce = false;	
			me.video.renderer.clear();
			me.video.renderer.flush();
			me.game.repaint();
			updatedAnything = true;
		}

		this.playerControllingMe = (game.data.controlling == BATTLE_BOAT);		
		
        return (this._super(game.BoatEntity, 'update', [dt]) || updatedAnything);
    },
	
	launchMissle : function(_x, _y) {
		// make smoke appear
		// set missle on course
		if (this.missle == undefined) {
			var initialPosition = new me.Vector2d( 
				this.pos.x + (this.width / 2),
				this.pos.y + (this.height / 2)
			);
			me.game.world.addChild(me.pool.pull("tempSprite", 
				initialPosition.x, initialPosition.y, 
					me.loader.getImage("smoke1"), 100), 400);
			// cannon shooting sound
			me.audio.play("cannonFire");
			this.missle = new me.Sprite(initialPosition.x, initialPosition.y, {
				image : me.loader.getImage("bomb")
			});
			this.missleShadow = new me.Sprite(initialPosition.x, initialPosition.y, {
				image : me.loader.getImage("bombShadow")
			});
			// the values for the projectile animation.
			this.missleHeight = 0;
			var missleLengthTravel = new me.Vector2d(
				initialPosition.x - _x,
				initialPosition.y - _y
			).length();
			this.missleHalfwayLength = missleLengthTravel / 2;
			this.missleCurveAdjust = missleLengthTravel / 15;  // the farther, the more.
			this.missle.alwaysUpdate = true;
			me.game.world.addChild(this.missle, 450);
			me.game.world.addChild(this.missleShadow, 440);
			this.targetLocation = {tx : _x, ty : _y};			
		}
	},
	
	draw : function(r) {
		if (this.missle != undefined && this.targetLocation != undefined) {
			r.setColor(new me.Color(255, 0, 0));
			r.fillRect(this.targetLocation.tx, this.targetLocation.ty, 5, 5);
		}
		
		this._super(game.BoatEntity, 'draw', [r]);
	},
	
	
	onCollision : function(response, other) {
		if (other instanceof game.IceSheetEntity) {             // destroy ice sheets
			me.game.world.removeChild(other);
			me.audio.play("iceBreaking");
			return false;
		}
		return this._super(game.BoatEntity, 'onCollision', [response, other]);
	}
});


/**
 * Smaller Tugboat Player Entity
 */
game.TugBoatEntity = game.BoatEntity.extend({

    init:function (x, y, settings) {
        settings.image = "tugBoat";
        this._super(game.BoatEntity, 'init', [x, y , settings]);
		this.grappleProj = undefined;   /// reference to a grapple projectile.
		this.tuggingBoat = undefined;   // reference to the boat that is being tugged.
		// give the data your reference.
		if (game.data.tug_boat == undefined) {
			game.data.tug_boat = this;
		}
		this.boatMoveSpeed = 1.8;     // how fast the boat can move
		this.boatAccelRate = 0.4;   // how fast the boat can accelerate
		this.boatTurnSpeed = 0.09;   // how fast the boat turns
		
    },

    update : function (dt) {
		// update the grappleProj when needed
		var changeGrapple = false;
		if (this.grappleProj != undefined) {
			if (this.pos.distance(this.grappleProj.pos) > 100) {
				this.grappleProj.killMe = true;
			}
			
			if (this.grappleProj.killMe) {
				me.game.world.removeChild(this.grappleProj);
				this.grappleProj = undefined;
				changeGrapple = true;
			}
		} else if (this.tuggingBoat != undefined) {
			// handle tugging the tuggingBoat
			// if the tugging boat is too far away, then "pull" it towards us.
			var tugDiffV = new me.Vector2d(
				this.pos.x - this.tuggingBoat.pos.x,
				this.pos.y - this.tuggingBoat.pos.y 
			);
			if (tugDiffV.length() > 90) {            // tug the boat when its far away
				tugDiffV.normalize().scale(1.5);
				this.tuggingBoat.body.vel.x = tugDiffV.x;
				this.tuggingBoat.body.vel.y = tugDiffV.y;
			}
		}
		
		// control this boat if applicable
		this.playerControllingMe = (game.data.controlling == TUG_BOAT);

        return (this._super(game.BoatEntity, 'update', [dt]) || changeGrapple );
    },
	
	draw : function(r) {
		// draw the grapple if applicable
		if (this.grappleProj != undefined) {
			r.setColor(new me.Color(192, 140, 0));
			r.setLineWidth(2);
			r.strokeLine(
				this.pos.x + (this.width / 2), this.pos.y + (this.height / 2),
				this.grappleProj.pos.x + (this.grappleProj.width / 2), 
				this.grappleProj.pos.y + (this.grappleProj.height / 2)	
			);
		} else if (this.tuggingBoat != undefined) {
			r.setColor(new me.Color(192, 140, 0));
			r.setLineWidth(2);
			r.strokeLine(
				this.pos.x + (this.width / 2), this.pos.y + (this.height / 2),
				this.tuggingBoat.pos.x + (this.tuggingBoat.width / 2), 
				this.tuggingBoat.pos.y + (this.tuggingBoat.height / 2)	
			);
		}
		// the rest normally
		this._super(game.BoatEntity, 'draw', [r]);
	},
	
	// shoot a projectile towards the given point {x, y} (in world coordinates)
	// if there is already a boat being grappled, then release the grapple
	shootProjectile : function(x, y) {
		if (this.tuggingBoat != undefined) {
			this.tuggingBoat = undefined; // release grapple
			me.audio.play("grappleRelease");
			return;
		}
		if (this.grappleProj == undefined) {
			var shootDirection = new me.Vector2d(
				x - this.pos.x,
				y - this.pos.y
			).normalize().scale(7);
			me.audio.play("grappleFire");
			this.grappleProj = me.pool.pull("grappleProjectile", this.pos.x, this.pos.y, {
				image : "grapple",
				width : 16,
				height : 16,
				velX : shootDirection.x,
				velY : shootDirection.y,
				tugBoatRef : this
			})	
			me.game.world.addChild(this.grappleProj);
		}
	}
});

/**
 *  The grapple entity that the tug boat "shoots"
 */ 
game.GrappleProjectile = me.Entity.extend({
	init : function(x, y, settings) {
		this._super(me.Entity, 'init', [x, y, settings]);
		this.tugBoatRef = undefined;      // reference to the tug boat that shot it.
		if (settings.tugBoatRef != undefined) {
			this.tugBoatRef = settings.tugBoatRef;
		}
		this.body.vel.x = settings.velX || 0;
		this.body.vel.y = settings.velY || 0;
		this.name = "grapple";
		this.killMe = false;
	},
	
	update : function(dt) {
		this.body.update(dt)
		me.collision.check(this);
		return (this._super(me.Entity, 'update', [dt]) ||  this.body.vel.x !== 0 || this.body.vel.y !== 0);  // should make better later
	},
		
	onCollision : function (response, other) {
		// Make it do something when it hits something.
		if (other instanceof game.TugBoatEntity) {                  // ignore hitting the tug boat
			return false;  // ignore the tug boat.
		} else if (other instanceof game.LeverEntity && !this.killMe) {             // activate levers
			other.onActivated(); // activate the lever.
			me.audio.play("leverSwitch");
			this.killMe = true;
			return false;
		} else if (other instanceof game.SinkableWallEntity && other.underwater == true) {  // ignore underwater walls
			return false;
		} else if (other instanceof game.BattleBoatEntity || other instanceof game.VictimBoatEntity) {
			this.tugBoatRef.tuggingBoat = other;
			me.audio.play("grappleHook");
			this.killMe = true;
			return false;
		} else if (other instanceof game.VictoryZone) {         // can't collide with victory zone.
			return false;
		}
		
		me.audio.play("grappleFailHit");
        // Make all other objects solid
		this.killMe = true; // die when you hit anything else.
        return true;
    },
	
	draw : function(r) {
		if (!this.killMe) {
			this._super(me.Entity, 'draw', [r]);
		}
	}
})


/**
 * Medium sized Victim Entity (NOT player controlled)
 */
game.VictimBoatEntity = game.BoatEntity.extend({

    init:function (x, y, settings) {
        settings.image = "victimBoat";
        this._super(game.BoatEntity, 'init', [x, y , settings]);
    },

    update : function (dt) {
		// see if its inside of the victory zone
		var victoryZone = me.game.world.getChildByName("victoryZone")[0];    // get the victory zone (that SHOULD be there)
		if (victoryZone !== undefined && victoryZone.containsPointV(this.pos)) {
			// win the level
			// go to the next level/intermediate screen thing
			game.data.playedLevel = me.levelDirector.getCurrentLevel().nextLevel;
			// level won: go to the next state
			if (!playScreenTransitioning) {
				playScreenTransitioning = true;   // to prevent multiple updates
				//me.state.current().goToNextLevel();
				playScreen_DoTransition();
			}
			return false;
		} 
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        return (this._super(game.BoatEntity, 'update', [dt]) );
    }
});


/**
 * Medium sized Bomb boat Entity (NOT player controlled)
 */
game.BombBoatEntity = game.BoatEntity.extend({

    init:function (x, y, settings) {
        settings.image = "victimBoat";
        this._super(game.BoatEntity, 'init', [x, y , settings]);
    },

	explode : function() {
		// TODO: Explode and damage all boats, debris, and strong debris nearby.
		
	},
	
    update : function (dt) {
		// bomb boat specific stuff.

        return (this._super(game.BoatEntity, 'update', [dt]) );
    }
});


/******* Environment entities ***********/

/**
 *  Lever entity that can be activated by the tug boat.
 */
game.LeverEntity = me.Entity.extend({
	init: function(x, y, settings) {
		this._super(me.Entity, 'init', [x, y, settings]);
		this.connected_wall_id = "default";
		if (settings.connected_wall_id !== undefined) {
			this.connected_wall_id = settings.connected_wall_id;
		}
	},
	
	onActivated : function() {		
		// change the state of any connected wall
		var theLeverRef = this;
		me.game.world.forEach(function (child) {
			if (child.wall_id !== undefined && child.wall_id === theLeverRef.connected_wall_id && !child.markUpdate) {
				child.toggleState();
			}
		});
	}
})


/**
 *  Debris entity is destroyed by the battle boat.
 */
game.DebrisEntity = me.Entity.extend({
	init: function(x, y, settings) {
		settings.image = "debris";
		this._super(me.Entity, 'init', [x, y, settings]);
	}
})

/**
 *  Strong debris entity is exploded by the Bomb boat
 */
game.StrongDebrisEntity = me.Entity.extend({
	init: function(x, y, settings) {
		settings.image = "debris";
		this._super(me.Entity, 'init', [x, y, settings]);
	}
})

/**
 *  Sinkable wall entity is affected by levers..  (maybe make a general linked-to-lever type?)
 */
game.SinkableWallEntity = me.Entity.extend({
	init: function(x, y, settings) {
		settings.framewidth = 32;
		settings.frameheight = 32;
		this._super(me.Entity, 'init', [x, y, settings]);
		
		this.pattern = undefined;
		this.sinkedPattern = undefined;
		if (settings.image != undefined) {       // make the canal pattern according to its direction.
			if (settings.image == "canalHorz" || settings.image == "canalVert") {
				this.pattern = me.video.renderer.createPattern(me.loader.getImage(settings.image), "repeat");
				this.sinkedPattern = me.video.renderer.createPattern(me.loader.getImage(settings.image + "_under"), "repeat");
			}	
		}
		// get the ID of this wall.
		this.wall_id = "default";
		if (settings.wall_id != undefined) {
			this.wall_id = settings.wall_id;
		}
		this.underwater = false;
		if (settings.underwater != undefined) {
			this.underwater = settings.underwater;   // possible to have different initial state.
		}
		this.markUpdate = false;
	},
	
	update : function(dt) {
		var updateMe = false;
		if (this.markUpdate) {
			updateMe = true;
			this.markUpdate = false;
		}
		return (this._super(me.Entity, 'update', [dt]) || updateMe);
	},
	
	toggleState : function() {
		if (!this.markUpdate) {
			this.underwater = !this.underwater;
			this.markUpdate = true;
		}
	},
	
	draw : function(r) {
		
		if (this.underwater == true) {
			r.drawPattern(this.sinkedPattern, this.pos.x, this.pos.y, this.width, this.height);
		} else {
			r.drawPattern(this.pattern, this.pos.x, this.pos.y, this.width, this.height);
		}
	}
})

// A game element that can only be destroyed by the battle boat.
game.IceSheetEntity = me.Entity.extend({ 
	
	init : function(x, y, settings) {
		settings.image = "iceSheet"
		this._super(me.Entity, 'init', [x, y, settings]);
	}
	
});

/*********** Other entities *********************/

// a self destructing static temporary sprite.
game.TempSprite = me.Renderable.extend({
	
	init: function(x, y, img, lifespan) {
		this._super(me.Renderable, 'init', [x, y, 0, 0]);
		this.img = img;
		this.lifespan = lifespan;
		this.alwaysUpdate = true;
	},
	
	update : function(dt) {
		this.lifespan = this.lifespan - dt;
		if (this.lifespan <= 0) {
			//this.destroy();
			me.game.world.removeChild(this);
			me.game.repaint();
			return true;
		}
		return false;
	},
	
	draw : function(r) {
		if (this.lifespan > 0) {
			r.drawImage(this.img, this.pos.x - (this.img.width / 2), 
					this.pos.y - (this.img.height / 2));
		}
	}
})

/**
 *   The victory zone - when the player places the victim boat in here 
 *   Then they  win that level.
 */
game.VictoryZone = me.Entity.extend({
	init : function(x, y, settings) {
		this._super(me.Entity, 'init', [x, y, settings])
		this.pattern = me.video.renderer.createPattern(me.loader.getImage("victoryZone"), "repeat");
	},
	
	draw : function(r) {
		r.drawPattern(this.pattern, this.pos.x, this.pos.y, this.width, this.height);
	}
});


/**
 *   A special token the player can find
 */
game.SpecialToken = me.Entity.extend({
	init : function(x, y, settings) {
		this._super(me.Entity, 'init', [x, y, settings])
		this.collected = false;
	},
	
	onCollision : function (response, other) {
		if (!this.collected && other instanceof game.TugBoatEntity || other instanceof game.BattleBoatEntity) {
			game.data.specialTokens++;
			me.game.world.removeChild(this);
			this.collected = true;
			return false;
		}
        // Make all other objects solid
        return true;
    }
});




