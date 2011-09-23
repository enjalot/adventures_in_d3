
var svg = d3.select("#chart").append("svg:svg")
    .attr("width", 960)
    .attr("height", 500);

d3.json("data/enj_states_array.json", function(json) {
    var path = d3.geo.path()
        .projection(d3.geo.albersUsa());
    var project = d3.geo.albersUsa()

    svg.append("svg:g")
        .attr("class", "states")
    .selectAll("g.state")
    .data(json).enter()
        .append("svg:g")
            .attr("class", "state")
        .append("svg:path")
            .attr("stroke", "none")
            .attr("fill", "none")
            .attr("class", function(d, i)
            {
                return d.id;
            })
            .attr("d", function( d, i) 
            {
                return path(d.geom);
            });

   
//default style the map
states = svg.selectAll("g.state path")
    //.filter(function(d) { return this.getAttribute("class") != "PR"; }) //filter out Puerto Rico
    .attr("fill", "#ffff00")
    .attr("fill-opacity", .3)
    .attr("stroke", "#0000ff")
    .attr("stroke-opacity", 1.)
    .attr("stroke-width", 1.5)
    .on("mouseover", state_mouseover)
    .on("mouseout", state_mouseout);

//some interaction
function state_mouseover(d,i)
{
    d3.select(this)
        .attr("fill", "#ff0000");
}
function state_mouseout(d,i)
{
    d3.select(this)
        .attr("fill", "#ffff00");
}

//Lets put labels at the centroids
states = svg.append("svg:g")
    .attr("class", "labels")
    .selectAll("g.label")
    .data(json).enter()
        .append("svg:g")
            .attr("class", "label")
        .append("svg:text")
            .attr("fill", "#000")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("transform", function(d)
            {
                //console.log(d);
                //centroids from d3.js data/us-state-centroids.js doesn't seem as good as calculating
                //xy = project(d.centroid.coordinates);
                xy = path.centroid(d.geom)
                return "translate(" + xy + ")";
            })
            .text(function(d) {
                return d.id;
            });

});

