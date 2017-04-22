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

        // add our child score object at the top left corner
        this.addChild(new game.HUD.ScoreItem(5, 5));
        this.addChild(new game.HUD.ControlIndicator(5, 5));
        this.addChild(new game.HUD.LevelIndicator(40, 40));
    }
});

game.HUD.LevelIndicator = me.Renderable.extend({
	
	init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
		this.levelTitle = "";
		this.fnt = new me.Font("Arial", 12, new me.Color(0, 0, 0));
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
		this.fnt.draw(r, this.levelTitle, this.pos.x, this.pos.y);
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
