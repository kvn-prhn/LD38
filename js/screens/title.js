game.TitleScreen = me.ScreenObject.extend({
	
	/**
     *  action to perform on state change
     */
    onResetEvent: function() {
		console.log("Making title screen");
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD, 100);
		
		this.HUD.addChild(new game.HUD.TitleScreenThing());
		me.input.registerPointerEvent('pointerdown', this.HUD, game.handleOnPointerDownTitle);
		game.data.onTitleScreen  = true;
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        game.data.onTitleScreen  = false;
		me.game.world.removeChild(this.HUD);
		me.input.releasePointerEvent('pointerdown', this.HUD, game.handleOnPointerDownTitle);
    }
});



// The screen to come up when you win the game
// under GAME_END	
game.VictoryScreen = me.ScreenObject.extend({
	
	/**
     *  action to perform on state change
     */
    onResetEvent: function() {
        ; // TODO
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        ; // TODO
    }
});



// when the game ends
// under GAMEOVER	
game.GameOverScreen = me.ScreenObject.extend({
	/**
     *  action to perform on state change
     */
    onResetEvent: function() {
        ; // TODO
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        ; // TODO
    }
});

