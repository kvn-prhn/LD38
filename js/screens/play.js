var playScreenTransitioning = false;

function playScreen_DoTransition() {
	if (game.data.playedLevel == "FINISH") {
		console.log("FInished with the game");
	} else {
		playScreenTransitioning = true;
		me.state.change(me.state.LOADING);
		me.state.set(me.state.PLAY, new game.PlayScreen());   // make a fresh PlayScreen
		me.game.repaint();
		me.timer.setTimeout(function() {
			//screenRef.reset();
			me.state.change(me.state.PLAY);
		}, 750, false);
	}
}


game.PlayScreen = me.ScreenObject.extend({

	/**
     *  action to perform on state change
     */
    onResetEvent: function() {
		console.log("Restarting the state ");
		playScreenTransitioning = false;    // finish with transition, if applicable.
		
        // reset the score
        game.data.score = 0;
		game.data.tug_boat = undefined;
		game.data.battle_boat = undefined;
		game.data.controlling = undefined;
		game.data.controlling_change_debounce = false;
		
        // Add our HUD to the game world, add it last so that this is on top of the rest.
        // Can also be forced by specifying a "Infinity" z value to the addChild function.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD, 1200);
		
        this.HUD.addChild(new game.HUD.ControlIndicator(5, 5));
        this.HUD.addChild(new game.HUD.LevelIndicator(10, 400));
		
		// register the pointer event.
		me.input.registerPointerEvent('pointerdown', this.HUD, game.handleOnPointerDown);
		
		me.levelDirector.loadLevel(game.data.playedLevel);
		
		game.data.levelTitle = me.levelDirector.getCurrentLevel().levelTitle;
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
		//me.input.releasePointerEvent('pointerdown', this.HUD, game.handleOnPointerDown);
		
        // remove the HUD from the game world
        //me.game.world.removeChild(this.HUD);
    }
});
