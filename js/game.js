
// constants

var TUG_BOAT = 0;
var BATTLE_BOAT = 1;

function g_handleOnPointerDown(ev) {
	// have the controlling ship move towards where the player clicked???
	var realX = ev.gameWorldX;   // find the real position
	var realY = ev.gameWorldY;    
	if (game.data.controlling == TUG_BOAT && game.data.tug_boat != undefined) {
		// shoot grapple
		game.data.tug_boat.shootProjectile(realX, realY);
	} else  if (game.data.controlling == BATTLE_BOAT && game.data.battle_boat != undefined) {
		// shoot missle
		game.data.battle_boat.launchMissle(realX, realY);
	}
}

// Title screen and transition specific events.
function g_handleOnPointerDownTitle(ev) {
	if (game.data.onTitleScreen) {
		if (game.data.titleStateOn == 1 && game.data.textScrollProgress > 4100) {    // 1 can't be skipped early.
			game.data.titleStateOn++;
		} else if (game.data.titleStateOn != 1) {
			game.data.titleStateOn++;
		}
		if (game.data.titleStateOn > 1) {
			me.state.change(me.state.PLAY);   // move to the play screen.
			playScreen_DoTransition();        // refresh everything for this state.
		}
	}
}


/* Game namespace */
var game = {

    // an object where to store game information
    data : {
		// the level that is being played
		playedLevel : undefined,
		levelTitle  : "",          // title of the current level.
        // score
        score : 0,
		specialTokens : 0,             // how many special tokens the player found.
		 
		controlling : undefined,
		controlling_change_debounce : false,
		
		// global references to things
		tug_boat : undefined,
		battle_boat : undefined,
		
		// title screen specific variables
		titleStateOn : 0,
		onTitleScreen : false,
		textScrollProgress : -1
    },

	// the input event handling functions
	handleOnPointerDown : g_handleOnPointerDown,
	handleOnPointerDownTitle : g_handleOnPointerDownTitle,
	
    // Run on page load.
    "onload" : function () {
        // Initialize the video.
		// 20 * 15, 15 * 32
        if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("ogg,mp3");
		me.sys.gravity = 0;       // take out gravity
		//me.sys.stopOnAudioError = false;   // ignore audio errors
		
		// set the initialLevel.
		this.data.playedLevel = "level1";
		
        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());
        me.state.set(me.state.GAME_END, new game.VictoryScreen());
		
		// register the key inputs
		me.input.bindKey(me.input.KEY.X, "change_controlling", false);  // change what boat you control
		me.input.bindKey(me.input.KEY.W, "forward", true);
		me.input.bindKey(me.input.KEY.A, "rotate_counterclockwise", true);
		me.input.bindKey(me.input.KEY.D, "rotate_clockwise", true);
		me.input.bindKey(me.input.KEY.K, "pointer_alias");
		me.input.bindPointer(me.input.KEY.K);
		
        // add our player entity in the entity pool
        me.pool.register("battleBoat", game.BattleBoatEntity);          // player's battle boat
        me.pool.register("tugBoat", game.TugBoatEntity);                // player's tug boat
        me.pool.register("victimBoat", game.VictimBoatEntity);          // victim boat that must be brought to victory zone
		me.pool.register("lever", game.LeverEntity);                    // lever that can change sinkable walls
		me.pool.register("debris", game.DebrisEntity);                  // debris that battle boat can destroy
		me.pool.register("strongDebris", game.StrongDebrisEntity);      // special debris that has to be blown up with bomb ship
		me.pool.register("sinkableWall", game.SinkableWallEntity);      // sinkable wall that can go underwater with lever
		me.pool.register("grappleProjectile", game.GrappleProjectile);  // grapple object the tug boat throws
		me.pool.register("tempSprite", game.TempSprite);                // generic tempory sprite for effects
		me.pool.register("victoryZone", game.VictoryZone);              // victory zone that victim boat must be brough to.
		me.pool.register("special", game.SpecialToken);                 // Special token the player can find
		me.pool.register("iceSheet", game.IceSheetEntity);              // special obstacle in a level
		
		
        // Start the game.
        me.state.change(me.state.MENU); 
    }
};
