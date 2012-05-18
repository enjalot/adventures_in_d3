var svg = d3.select("svg")
    .attr("width", w)
    .attr("height", h)

var defs = svg.append("defs")

function make_radial(id, c, f, r, color, opacity)
{
    var gradient = defs.append("radialGradient")
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
    
svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    //.attr("fill", "#000")
    .attr("fill", "none")
svg.append("rect")
    .attr("class", "background_rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("stroke", "none")
    .attr("fill", "url(#" + wrid + ")")
    //.attr("fill-opacity", .5);

defs.append("rect")
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", "#f00")
    .attr("id", "test")

//make a few things that we will affect with the prism
var man = svg.append("g")
    .attr("id", "useman")
    .attr("transform", "translate(150, 100)")
    .append("use")
        .attr("xlink:href", "#man")
//man.node().setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#man')

var woman = svg.append("g")
    .attr("id", "usewoman")
    .attr("transform", "translate(350, 100)")
    .append("svg:use")
        .attr("xlink:href", "#woman")
    //woman.node().setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#woman')


