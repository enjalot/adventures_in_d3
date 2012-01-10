
var w = 600
var h = 500

wait = 700;

var n = 10;
tests = [ "-1.5", "0", "42", "+50.00" , "-.2", ".5" ]
regex = [ "[+-]?", "\\d*", "(\\.\\d+)?", "([eE][+-]?\\d+)?" ]
numbers = []
numbers.push( [ "-", "1", ".5", "" ])
numbers.push( [ "", "0", "", "" ])
numbers.push( [ "", "42", "", "" ])
numbers.push( [ "+", "50", ".00", "" ])
numbers.push( [ "-", "", ".2", "" ])
numbers.push( [ "", "", ".5", "" ])
numbers.push( [ "-", "1", ".565", "e-13" ])
numbers.push( [ "", "6", "", "E13" ])

/*
var color = d3.scale.linear()
    .domain([0, regex.length])
    .interpolate(d3.interpolateRgb)
    .range(['#f00', '#0f0'])
*/

var colors = [ '#fff', '#f00', '#0f0', '#af6', '#66e', '#999']
var color = function(i) 
{
    return colors[i]
}

var translate = function(d,i)
{
    return "translate(" + [w / 2, 150 + i * 40 ] + ")";
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
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "#004")
svg.append("svg:rect")
    .attr("class", "background_rect")
    .attr("width", w)
    .attr("height", h)
    .attr("stroke", "none")
    .attr("fill", "url(#" + wrid + ")")

var vis = svg.append("svg:g")
    .attr("class", "vis")

var regext = vis.append("svg:text")
    .attr("transform", "translate(" + [w / 2, 100] + ")")
    .attr("text-anchor", "middle")
    .attr("font-size", 40)
    .selectAll("tspan.regex")
    .data(regex)
    .enter()
    .append("svg:tspan")
        .text(function(d,i) {return d})
        .attr("fill", function(d,i) {return color(i)})
        .attr("dx", ".25em")




 
var make_numbers = function(classname, data)
{

    console.log("data", data)
    gnums = vis.selectAll("g."+classname)
        .data(data)
    .enter()
        .append("svg:g")
            .attr("class", classname)
            //.attr("transform", "translate(100, 100)")
            .attr("transform", translate)

          
    cnums = gnums.append("svg:text")
        .attr("text-anchor", "middle")
        .attr("font-size", 40)
        .each(function(dnumber,i) {
            console.log("dnumber", dnumber)
            d3.select(this)
                .selectAll("tspan")
                     .data(dnumber)
                .enter()
                    .append("svg:tspan")
                        .text(function(d,i) {
                            console.log("d", d);
                            return d
                        })
                        .attr("fill", function(d,i) {
                            console.log("color",i, color(i));
                            return color(i)
                        })
                        .attr("dx", ".25em")
        })
     
}



make_numbers("numbers", numbers);

