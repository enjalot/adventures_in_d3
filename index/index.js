n = 10
function x(i) {
   return (i%n)
}
function y(i) { 
    return Math.floor(i/n)
}


function clicker(d, i)
{
    itangle.setValue("tangleindex", d);
    xtangle.setValue("tanglex", x(d));
    ytangle.setValue("tangley", y(d));
    update_unit_chart(d)
}

function make_unit_chart(index){
    color0 = "#5885f5"
    color1 = "#999"
    var h = 560,
        w = 500;

    var data = d3.range(100);

    var canvas = d3.select("#graph")
        .append("svg:svg")
            .attr("height", h)
            .attr("width", w)
        .append("svg:g")
            .attr("id", "graph");

    /*
    //4*n is to give 2 pixels on each side
    bw = (w - 6*n) / n 
    //40 for the title
    bh = (h - 40 - 6*n) / n
    console.log("bw, bh", bw, bh)
    */
    bw = 46
    bh = 46

    canvas.append("svg:rect")
        .attr("class", "bgrect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#ffffff")

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
            .attr("class", "rowrect")
            .attr("width", bw)
            .attr("height", bh)

    fs = 10
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

        oldindex = index; 
}

