
var w = 600
var h = 500

wait = 700;

tests = [ "-1.5", "0", "42", "+50.00" , "-.2", ".5" ]
regex = [ "[+-]?", "\\d*", "(\\.\\d+)?", ["([eE]", "[+-]?", "\\d+)?"] ]
numbers = []
numbers.push( [ "-", "1", ".5654", ["e", "-", "13"]])
numbers.push( [ "+", "6", ".42", ["e", "", "3"]])
numbers.push( [ "", "2", ".34", ["e", "", "2"]])
numbers.push( [ "-", "100", ".5", "" ])
numbers.push( [ "", "42", "", "" ])
numbers.push( [ "", "0", ".5", "" ])
numbers.push( [ "-", "", ".2", "" ])
numbers.push( [ "", "", ".5", "" ])
numbers.push( [ "", "0", "", "" ])

var range_color = d3.scale.linear()
    .domain([0, 3])
    .interpolate(d3.interpolateRgb)
    .range(['#96b1d5', '#ef2929'])

var colors = [ '#d3d7cf', '#8ae234', '#fce94f']//, '#999'] '#eeeeec', '#ad7fa8', '#8ae234'
var color = function(i) 
{
    return colors[i]
}

var translate = function(d,i)
{
    return "translate(" + [w / 2, 125 + i * 40 ] + ")";
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
    .attr("fill", "#2f2f2f")
/*
svg.append("svg:rect")
    .attr("class", "background_rect")
    .attr("width", w)
    .attr("height", h)
    .attr("stroke", "none")
    .attr("fill", "url(#" + wrid + ")")
    .attr("fill-opacity", .3)
*/

var vis = svg.append("svg:g")
    .attr("class", "vis")

var make_inner = function(d,i) {
    if(typeof(d) === "string")
    {
        d3.select(this).text(d);
    }
    else
    {
        d3.select(this.parentNode)
            .selectAll("tspan.inner")
            .data(d)
            .enter()
            .append("svg:tspan")
                .text(function(e,j){return e;})
                .attr("fill", function(e,j) {return range_color(j)})
                .attr("dx", ".25em")
    }
            
}

var regext = vis.append("svg:text")
    .attr("transform", "translate(" + [w / 2, 75] + ")")
    .attr("text-anchor", "middle")
    .attr("font-size", 40)
    .selectAll("tspan.regex")
    .data(regex)
    .enter()
    .append("svg:tspan")
    .attr("class", "regex")
        .each(make_inner)
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
                        .each(make_inner)
                        .attr("fill", function(d,i) {
                            //console.log("color",i, color(i));
                            return color(i)
                        })
                        .attr("dx", ".25em")
        })
     
}



make_numbers("numbers", numbers);

