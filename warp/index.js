//http://stackoverflow.com/questions/5055625/image-warping-bulge-effect-algorithm

n = 20 
//.1 is interesting, 1,1
k = .8
//jwerty.key('←', function () { 
jwerty.key('a', function () { 
    k -= .01;
});
//jwerty.key('→', function () { 
jwerty.key('d', function () { 
    k += .01;
});


//take in normalized coords (from 0 to 1)
function warp(x0, y0, x1, y1)
{
    r = Math.sqrt( (x0 - x1)*(x0 - x1) + (y0 - y1)*(y0 - y1) )
    a = Math.atan2(y0 - y1, x0 - x1)
    rn = Math.pow(r, k)
    nx =  rn * Math.cos(a) + x1
    ny = rn * Math.sin(a) + y1
    return [nx, ny]
}

//pass in the center point we want to warp around
function warp_boxes(x1, y1)
{
    boxes = d3.selectAll("g.box")
        .attr("transform", function(d,i)
        {
            x0 = x(d) / n;
            y0 = y(d) / n;
            xy = warp(x0, y0, x1, y1);
            //console.log("xy", x0,y0, xy);
            xx = xy[0] * n * (bw+3)
            yy = xy[1] * n * (bh+3)
            return "translate(" + [xx,yy] + ")"
        })
}


drag = d3.behavior.drag()
    .on("drag", function(d,i) {
        //console.log("d3 event", d3)
        console.log("this", this)
        //console.log("mouse", d3.svg.mouse(this));

    })


function x(i) {
   return (i%n)
}
function y(i) { 
    return Math.floor(i/n)
}


function clicker(d, i)
{
    /*
    itangle.setValue("tangleindex", d);
    xtangle.setValue("tanglex", x(d));
    ytangle.setValue("tangley", y(d));
    */
    update_unit_chart(d)
}

function make_unit_chart(index){
    //color0 = "#5885f5"
    //color1 = "#999"
    var color0 = "#000"
    var color1 = "#000"
    var corners = 5
 
    var w = 500,
        h = 500

    var data = d3.range(n*n);

    var canvas = d3.select("#graph")
        .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
        .append("svg:g")
            .attr("id", "graph");

    
    //4*n is to give 2 pixels on each side
    bw = (w - 4*n) / n 
    //40 for the title
    bh = (h - 4*n) / n
    console.log("bw, bh", bw, bh)
    /* 
    bw = 46
    bh = 46
    */

    canvas.append("svg:rect")
        .attr("class", "bgrect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#ffffff")
        //.attr("pointer-events", "all")

    chart = canvas.append("svg:g")
        .attr("class", "chart")
        .attr("transform", "translate(5,5)")

    rects = chart.selectAll("g.box")
	    .data(data)
		.enter()
            .append("svg:g")
            .attr("class", "box")
            .attr("transform", function(d,i) {
                return "translate(" + [x(d)*(bw+3), y(d)*(bh+3)] + ")"
            })
            .on("click", clicker)
            .attr("pointer-events", "all")


    rects
        .append("svg:rect")
            .attr("fill", function(d,i){
                if(d <= index){
                    return color0;
                }
                else{
                    return "#000";
                }
            })
            .attr("stroke", function(d,i){
                if(d == index){
                    return "#000"
                }
                else {
                    return "#000"
                }
            })
            .attr("stroke-width", function(d,i) {
                //if(d == index) { return 5 }
                return 2
            })
            .attr("rx", function(d,i) {
                //if(d == index) { return 1 }
                return corners;
            })
             .attr("ry", function(d,i) {
                //if(d == index) { return 1 }
                return corners;
            })
            .attr("class", "rowrect")
            .attr("width", bw)
            .attr("height", bh)
            .attr("opacity", .5)

    fs = 10
    /*
    rects.append("svg:text")
        .attr("class", "tind")
        .text(function(d,i) {
            return "i: " + d
        })
        .attr("dx", "1.5em")
        .attr("dy", "1.5em")
        .attr("font-size", fs)
        .attr("text-anchor", "middle")
        .attr("transform", function() {
            return "translate(" + [ this.getBBox().width / 2, 0] + ")"; })

    rects.append("svg:text")
        .attr("class", "tx")
        .text(function(d,i) {
            return "x, y:"
        })
        .attr("dx", "1.5em")
        .attr("dy", "2.5em")
        .attr("font-size", fs)
        .attr("text-anchor", "middle")
        .attr("transform", function() {
            return "translate(" + [ this.getBBox().width / 2, 0] + ")"; })



    rects.append("svg:text")
        .attr("class", "ty")
        .text(function(d,i) {
            //return "y: " + y(d);
            return "(" + x(d) + ", " + y(d) + ")";
        })
        //.attr("dx", "2.5em")
        .attr("dx", "1em")
        .attr("dy", "3.5em")
        .attr("font-size", fs)
        .attr("text-anchor", "middle")
        .attr("transform", function() {
            return "translate(" + [ this.getBBox().width / 2, 0] + ")"; })

    */

    canvas.append("svg:rect")
        .attr("pointer-events", "all")
        .attr("width", 500)
        .attr("height", 500)
        .attr("fill-opacity", 0)
        .on("mousemove", function(d,i) {
            //console.log("this", this, d3.svg.mouse(this))
            x1 = d3.svg.mouse(this)[0] / w
            y1 = d3.svg.mouse(this)[1] / h
            warp_boxes(x1, y1)
        })

};

function update_unit_chart(index)
{
    var canvas =	d3.select("svg");

    var boxes = canvas.selectAll("g.box")
    var rects =	boxes.selectAll(".rowrect")
        .transition()
        .duration(function(d,i){
            dur = 500+(d*10);
            return dur;
        })
        .attr("fill", function(d,i){
            if(d <= index){
                return color0;
            }
            else{
                return color1;
            }
        })
        .attr("stroke", function(d,i){
            if(d == index){
                return "#000"
            }
            else {
                return "#000"
            }
        })
        .attr("stroke-width", function(d,i) {
            if(d == index) { return 5 }
            return 2
        })
        .attr("rx", function(d,i) {
            if(d == index) { return 1 }
            return 8
        })
         .attr("ry", function(d,i) {
            if(d == index) { return 1 }
            return 8
        })
        

    /*
    text = boxes.selectAll("text")
        .transition()
        .duration(function(d,i){
            if(oldindex < index ){
                return 100+(d*10);
            }
            else {
                return 1000-(d*10);
            }
        })
        .attr("fill", function(d,i){
            if(d == index){
                return "white";
            }
            else{
                return "black";
            }
        })
    */

    oldindex = index; 
    //warp_boxes(.5, .5)
}

