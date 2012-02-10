//svg is already defined in background.js but this might need to be modular
var svg = d3.select("svg")


var pause = true;
jwerty.key('p', function () { 
    pause = !pause;
});

wait = 700;

var n = 60;
var cols = 20
var dots0 = []
var dots1 = []
var dots2 = []

radius = 100

for(var i in d3.range(0, n))
{
    tx = 20
    ty = 50
    dh = 150
    dots0.push( { "ind": i, "w": w, "h":dh, "tx": tx, "ty": ty + 0*dh})
    dots1.push( { "ind": i, "w": w, "h":dh, "tx": tx, "ty": ty + 1*dh})
    dots2.push( { "ind": i, "w": w, "h":dh, "tx": tx, "ty": ty + 2*dh})
}

//line up rows of dots
var init_x = function(d, i) {
    d.x = (d.ind % cols) * d.w / cols + d.tx;
    return d.x;
}
//line up rows of dots
var init_y = function(d, i) {
    d.y = parseInt(d.ind / cols) * d.h / (n/cols) + d.ty;
    return d.y
}

var init_r = function(d,i) { 
    //d.size = 10 + Math.random() * 10;
    d.size = 20
    return d.size;
};
var init_opacity = function(d,i) { 
    d.opacity = .3 + Math.random() * .3;
    return d.opacity
};

var init_color = function(d,i) {
    return d3.scale.linear()
        .domain([0,1])
        .interpolate(d3.interpolateRgb)
        .range(['#ffffff', '#aaaaaa'])(Math.random())
        //.range(['#0EF2D4', '#1123ED'])(Math.random())
}


var make_dots = function(classname, data)
{
    gdots = svg.selectAll("g."+classname)
        .data(data)
    .enter()
        .append("svg:g")
            .attr("class", classname)
            
    cdots = gdots.append("svg:circle")
        .attr("cx", init_x)
        .attr("cy", init_y)
        .attr("r", init_r)
        .attr("fill", init_color)
        .attr("fill-opacity", init_opacity)
        .attr("stroke", "none")
        //.attr("stroke", "#fff")
        //.attr("stroke-width", 2)
        //.attr("stroke-opacity", .5)
}


make_dots("dots0", dots0);
make_dots("dots1", dots1);
make_dots("dots2", dots2);


//use jwerty to switch the mouseover functionality
var behavior = ransize
//jwerty...

jwerty.key('a', function () { 
    //all glow
    d3.selectAll("circle")
        .each(function(d,i) {
            glow(d3.select(this), d, i)
    })
});



/*
drag = d3.behavior.drag()
    .on("drag", function(d,i) {
        console.log("drag!")
    })
*/

//overlay an empty rectangle on everything to catch our mouse events
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("pointer-events", "all")
    .attr("fill", "none")
    .on("mousemove", function(d,i) {
        x = d3.svg.mouse(this)[0]
        y = d3.svg.mouse(this)[1]
        p = {"x": x, "y": y} 
        d3.selectAll("circle")
            .each(function(d,i) {
                behavior(d3.select(this), d, i, p, radius);
            })
    })
    //.call(drag)



/*
time = new Date()
d3.timer(function() {
    if(pause) return false;
    now = new Date();
    dt = now - time
    if(dt > wait)
    {
        //console.log("dt", dt)
        update_dots("dots0");
        update_dots("dots1");
        update_dots("dots2");
        time = new Date();
    }
})
*/
