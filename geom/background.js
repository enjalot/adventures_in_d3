
function make_background(svg) {
    var defs = svg.append("svg:defs");

    function make_radial(id, c, f, r, color, opacity)
    {
        var gradient = defs.append("svg:radialGradient")
            .attr("id", id)
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("fx", f.x)
            .attr("fy", f.y)
            .attr("r", r);
        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", color)
            .attr("stop-opacity", opacity);
        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", color)
            .attr("stop-opacity", 1e-6);
    }

    var wrid = "white_radial";
    var gr = 0.5;
    var c = { "x": 0.5, "y": 0.5 };
    //f = { "x": "50%", "y": "50%" };
    make_radial(wrid, c, c, gr, "#e3e3e3", 0.2);
        
    svg.append("svg:rect")
        .attr("width", "100%")
        .attr("height", "100%")
        //.attr("fill", "#000")
        .style("fill", "#fff")
        .style("stroke","#000")
        ;

    /*
    svg.append("svg:rect")
        .attr("class", "background_rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("stroke", "none")
        .attr("fill", "url(#" + wrid + ")");
        //.attr("fill-opacity", .5);
    */

}

