
var w = 600
var h = 500

var pause = true;
jwerty.key('p', function () { 
    pause = !pause;
});



wait = 700;

var n = 100;
var dots0 = []
var dots1 = []
var dots2 = []

for(var i in d3.range(0, n))
{
    dots0.push( { "dx":50, "dx0":20, "y":-50, "y0":100 })
    dots1.push( { "dx":-50, "dx0":-20, "y":-50, "y0":250 })
    dots2.push( { "dx":100, "dx0":-20, "y":-50, "y0":385 })
}

var x = function(d,i) { return p + Math.random() * (w-p)};

//var y = function(d,i) { return 150 + Math.random() * (-50)};
var y = function(d,i)
{
    var x = parseFloat(d3.select(this).attr("cx"));
    var dy = Math.sin(x);
    //return d.y0 + Math.random() * d.y;
    return d.y0 + Math.random() * dy * d.y;
}

var r = function(d,i) { return 10 + Math.random() * 10};
var opacity = function(d,i) { return .5 + Math.random() * .3};

var color = function(d,i) {
    return d3.scale.linear()
        .domain([0,1])
        .interpolate(d3.interpolateRgb)
        //.range(['#ffffff', '#000000'])(Math.random())
        .range(['#0EF2D4', '#1123ED'])(Math.random())
}


var svg = d3.select("svg")
    .attr("width", w)
    .attr("height", h)

var defs = svg.append("svg:defs")

function make_radial(id, c, f, r, color, opacity)
{
    var gradient = defs.append("svg:radialGradient")
        .attr("id", id)
        .attr("cx", c.x)
        .attr("cy", c.y)
        .attr("fx", f.x)
        .attr("fy", f.y)
        .attr("r", r)
    gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", opacity)
    gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1e-6)
}

var wrid = "white_radial";
var gr = .5;
var c = { "x": .5, "y": .5 };
//f = { "x": "50%", "y": "50%" };
make_radial(wrid, c, c, gr, "#fff", .2)
    
svg.append("svg:rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#004")
svg.append("svg:rect")
    .attr("class", "background_rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "url(#" + wrid + ")")


var make_dots = function(classname, data)
{

    gdots = svg.selectAll("g."+classname)
        .data(data)
    .enter()
        .append("svg:g")
            .attr("class", classname)

    p = 20;


            
    cdots = gdots.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr("fill", color)
        .attr("fill-opacity", opacity)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", .1)
}


var xm = function(d,i)
{
    dx = d.dx0 + Math.random() * d.dx;
    dis = d3.select(this)
    x = parseFloat(dis.attr("cx"))
    return x + dx;
}


//var easings = ["linear", "exp", "quad", "sin", "bounce", "circle", "cubic"]
//var easings = ["linear", "sin", "bounce", "bounce","bounce"]
var easings = ["linear", "sin"]//, "bounce", "bounce","bounce"]

var update_dots = function(classname)
{
    dots = svg.selectAll("." + classname).select("circle")
    dots.transition()
        .duration(wait - 50)
        .ease( easings[ parseInt(Math.random() * easings.length) ])
        //.ease("exp")
            //.attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            //.attr("fill", color)
            .attr("fill-opacity", opacity)

    //dots.transition()
    //    .duration(wait - 50)
    //    .ease("linear")
            .attr("cx", xm)
            .each("end", function(d,i) {
                dis = d3.select(this)
                x = parseFloat(dis.attr("cx"))
                if(d.dx < 0)
                {
                    if(x < 0) { dis.attr("cx", w + 15) }
                }
                else 
                {
                if(x > w) { dis.attr("cx", -15) }
                }
     
            })
         
 
}

make_dots("dots0", dots0);
make_dots("dots1", dots1);
make_dots("dots2", dots2);

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
