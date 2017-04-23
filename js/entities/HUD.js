/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function() {
        // call the constructor
        this._super(me.Container, 'init');

        // persistent across level change
        this.isPersistent = true;

        // make sure we use screen coordinates
        this.floating = true;

        // give a name
        this.name = "HUD";
    }
});

game.HUD.LevelIndicator = me.Renderable.extend({
	
	init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
		this.levelTitle = "";
		this.fnt = new me.Font("Arial", 12, new me.Color(255, 255, 255));
    },
	
	update : function() {
		if (this.levelTitle != game.data.levelTitle) {   //  updating controlling when needed
			this.levelTitle = game.data.levelTitle;
			return true;
		}
		return false;
	},
	
	draw : function(r) {
		// draw the level title.
		r.drawImage(me.loader.getImage("blackBackdrop"), this.pos.x, this.pos.y);
		this.fnt.draw(r, this.levelTitle, this.pos.x + 6, this.pos.y + 10);
	}
});


game.HUD.ControlIndicator = me.Renderable.extend({
	
	init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        // local copy of who is being controlled
		this.controlling = -1;
    },
	
	update : function() {
		if (this.controlling != game.data.controlling) {   //  updating controlling when needed
			this.controlling = game.data.controlling;
			return true;
		}
		return false;
	},
	
	draw : function(r) {
		if (this.controlling == TUG_BOAT) {
			//r.setColor(new me.Color(0, 205, 200));
			r.drawImage(me.loader.getImage("tugboatSymbol"), this.pos.x, this.pos.y);
		} else if (this.controlling == BATTLE_BOAT) {
			//r.setColor(new me.Color(114, 114, 114));
			r.drawImage(me.loader.getImage("battleboatSymbol"), this.pos.x, this.pos.y);
		}
		//r.fillRect(this.pos.x, this.pos.y, 100, 100); // temp
	}
});

/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        // local copy of the global score
        this.score = -1;
    },

    /**
     * update function
     */
    update : function () {
        // we don't do anything fancy here, so just
        // return true if the score has been updated
        if (this.score !== game.data.score) {
            this.score = game.data.score;
            return true;
        }
        return false;
    },

    /**
     * draw the score
     */
    draw : function (context) {
        // draw it baby !
    }

});

/*************** HUD Specific to menu screns ************************/


// Button to press to continue to next screen?
game.HUD.TitleScreenThing = me.Renderable.extend({
	
	init : function() {
		this._super(me.Renderable, 'init', [0, 0, 10, 10]);
		this.titleStateOn = -1;
		this.waterAnim = new me.Sprite(0, 480 - 128, {
			image : me.loader.getImage("waterHorizon"),
			framewidth : 640,
			frameheight : 128,
			anchorPoint : new me.Vector2d(0, 0)
		});
		this.waterAnim.addAnimation("waves", [0, 1], 800);
		this.waterAnim.setCurrentAnimation("waves", "waves")
		game.data.textScrollProgress = 0;
		this.fnt = new me.Font("Arial", 16, new me.Color(255, 255, 255));
		this.fntSmall = new me.Font("Arial", 12, new me.Color(255, 255, 255));
		
		this.storyText = [
			"This famous harbor is the place of an unlikely friendship.",

			"Boats from all over the seven seas sail to see its unique rock \n"
					+ "formations and enjoy the company of their fellow boats.",

			"Although boats come from all around, they avoid mingling outside their own groups.",

			"The tug boats usually stay together, as do the battle ships, yachts, \n"
					+ "fishing boats, and even the galleys.",

			"Rarely do different boats interact. ",

			"Only professionally do tug boats pull fishing boats.",
			
			"Its rarely out of care or kindness.",

			"Two vessels, a tiny tug boat and a powerful battleship\n"
					+ "were exploring some local rock enclaves.",

			"The two of them happened to be there together.",
					
			"They avoided sailing towards one another.",
			
			"Only their wakes crossed paths.",

			"Suddenly, in the distance, they heard a cry for help.",
			
			"They both knew these rock formations are dangerous.",

			"Nobody else was around for this lone ship.",
			
			"It was up to these unlikely heroes to bring this boat to safety."
		]
	},
	
	update : function(dt) {
		game.data.textScrollProgress += dt;
		if (this.titleStateOn != game.data.titleStateOn) {
			this.titleStateOn = game.data.titleStateOn;
			return true;
		}
		return ( this.waterAnim.update(dt) || this.titleStateOn == 1);
	},
	
	draw : function(r) {
		if (this.titleStateOn == 0) {
			r.drawImage(me.loader.getImage("titleScreen"), 0, 0);
		} else if (this.titleStateOn == 1) {
			r.setColor(new me.Color(0, 0, 0));   // background
			r.fillRect(0, 0, 640, 480 - 124)
			
			// draw text scrolling
			r.setColor(new me.Color(255, 255, 255));
			var startingYPos = 400 - (game.data.textScrollProgress / 45); 
			for (var i = 0 ; i < this.storyText.length; i++) {
				this.fnt.draw(r, this.storyText[i], 30, startingYPos + (120 * i));
			}
			// draw the water horzion
			this.waterAnim.draw(r);			
			// prompt skipping after a certain amount of time 
			 if (game.data.textScrollProgress > 83000) {        // after it all finishes
				this.fntSmall.draw(r, "Click anywhere to continue...", 20, 430);
			} else if (game.data.textScrollProgress > 4000) {    // skipping early
				this.fntSmall.draw(r, "Click anywhere to skip...", 20, 430);
			}
		}
	}
})



