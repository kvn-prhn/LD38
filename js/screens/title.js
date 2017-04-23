game.TitleScreen = me.ScreenObject.extend({
	
	/**
     *  action to perform on state change
     */
    onResetEvent: function() {
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD, 100);
		
		this.HUD.addChild(new game.HUD.TitleScreenThing());
		me.input.registerPointerEvent('pointerdown', this.HUD, game.handleOnPointerDownTitle);
		game.data.onTitleScreen  = true;
		
		me.audio.playTrack("game1", 0.2);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        game.data.onTitleScreen  = false;
		me.game.world.removeChild(this.HUD);
		me.input.releasePointerEvent('pointerdown', this.HUD, game.handleOnPointerDownTitle);
		me.audio.pauseTrack();
    }
});



// The screen to come up when you win the game
// under GAME_END	
game.VictoryScreen = me.ScreenObject.extend({
	
	
    onResetEvent: function() {
		// delete the  HUD.
		me.game.world.forEach(function(child) {
			me.game.world.removeChild(child);
		});
		
		this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD, 100);
		
		this.HUD.addChild(new game.HUD.VictoryScreenThing());
		me.audio.playTrack("game1", 0.2);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
       me.audio.pauseTrack();
    }
});


