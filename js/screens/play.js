var playScreenTransitioning = false;

function playScreen_DoTransition() {
	if (game.data.playedLevel == "FINISH") {
		me.state.change(me.state.GAME_END);
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
		// add the control indicators to each player how to play.
		// only have them show for the first level
		if (game.data.playedLevel == "level1") {      
			var initialPosX = 320;
			var initialPosY = 340;
			this.HUD.addChild(new game.HUD.ControlKeyIndicator(
				initialPosX, initialPosY - 20,     // position 
				"forward",   // keycode
				this.HUD,   // hudref
				32, 160, 32, 32));  // W image
			this.HUD.addChild(new game.HUD.ControlKeyIndicator(
				initialPosX - 50, initialPosY,     // position 
				"rotate_counterclockwise",   // keycode
				this.HUD,   // hudref
				64, 160, 32, 32));   // A image
			this.HUD.addChild(new game.HUD.ControlKeyIndicator(
				initialPosX + 50, initialPosY,     // position 
				"rotate_clockwise",   // keycode
				this.HUD,   // hudref
				0, 192, 32, 32));     // D image
			this.HUD.addChild(new game.HUD.ControlKeyIndicator(
				initialPosX + 20, initialPosY + 70,     // position 
				"change_controlling",   // keycode
				this.HUD,   // hudref
				32, 192, 32, 32));   // X
			this.HUD.addChild(new game.HUD.ControlKeyIndicator(     // indicator the mouse click
				initialPosX - 20, initialPosY + 70,     // position 
				"pointer_alias",   // keycode
				this.HUD,   // hudref
				0, 160, 32, 32));   // X
		}
		
		// register the pointer event.
		me.input.registerPointerEvent('pointerdown', this.HUD, game.handleOnPointerDown);
		
		me.levelDirector.loadLevel(game.data.playedLevel);
		game.data.levelTitle = me.levelDirector.getCurrentLevel().levelTitle;     // set the level title.
		
		// begin background music
		me.audio.playTrack("title1", 0.1);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
		me.audio.pauseTrack();
    }
});
