//TODO: wrap this shit up


var wait = 1000;

var pause = true;
jwerty.key('p', function () { 
    pause = !pause;
});

//keep track of the actors (objects) in the scene
var scene = new Backbone.Collection();
var target = new Backbone.Model();

var man = new Backbone.Model();
man.set({
    "el_id": "#man",
    "x": 10,
    "y": 10
});

function init_scene(svg) {
    //add the man
}

function draw_frame(svg) {
    //loop over actors in the scene
    scene.actors.each(function(actor) {
        //run through behaviors

    });
}









time = new Date();
d3.timer(function() {
    if(pause) { return false; }
    now = new Date();
    dt = now - time;
    if(dt < wait) { return false; }

    //console.log("looped");
    time = new Date();
});
