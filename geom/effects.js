//utils
var distance = function(p1, p2)
{
    return Math.sqrt( (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y)*(p2.y - p1.y) );
}

//easings
//var easings = ["linear", "exp", "quad", "sin", "bounce", "circle", "cubic"]
//var easings = ["linear", "sin", "bounce", "bounce","bounce"]
var easings = ["linear", "sin"]//, "bounce", "bounce","bounce"]


//size function
//t is a number between 0 and 1 to interpolate between min and max size
//r is a number between 0 and 1 to modify min and max size
var size = function(t, r)
{
    //TODO: make min and max depend on r
    min = 5;
    max = 20;
    s = d3.scale.linear().range([min, max])(t);
    return s;
}
//random size within radius
//node is the current circle, d and i are the associated data and selection index
//p is the center point of our interaction circle (force field), r is it's radius
var ransize = function(node, d, i, p, r)
{
    cx = node.attr("cx");
    cy = node.attr("cy");
    dist = distance({"x":cx, "y":cy}, p);
    if(dist < r)
    {
        if(d.inside == 0 && d.glowing != true)
        {
            //set new random size because this circle is inside the radius for
            //the first time
            newr = size(Math.random(), dist/r);
            d.size = newr;
            d.glowing = true;
            node.transition()
                .ease("sin")
                .duration(500)
                .attr("r", newr)
                .each("end", function(e,j) { e.glowing = false;});
            d.inside = 1;
        }
        else
        {
            //do other effects/transitions while the circle is inside
            //want to transition a "glow" in and out
            glow(node, d, i)
        }
    }
    else
    {
        //circle is not inside so make sure we mark it as such
        d.inside = 0;
    }
    
}



var glow = function(node, d, i)
{
    if(d.glowing) { return false }
    //This just tweens a number in data space (could be done much simpler but
    //want to grasp the concept)
    var tweenR = function(b)
    {
        d.glowing = true;
        var i = d3.interpolate(b.stash_size, d.size);
        return function(t) {
            //you can stash an intermediate value in case you want to interupt
            //transition and pick it back up later
            //d.isize = i(t);
            return i(t);
        }
    }
    //we need to stash the current size so we can transition back to it
    var bounce_to = 5;
    var dur = 500;
    d.stash_size = d.size;
    //we set the current size to what we bounce to, since the radius isn't
    //affected untill we call the tweenR function
    d.size = bounce_to;

    //transition from our current size to our "bounce_to" size
    node.transition()
        .ease("sin")
        .duration(dur)
        .attrTween("r", tweenR)
        .each("end", function(d, i) {
            //now we want to transition from the "bounce_to" size back to the original size
            d.size = d.stash_size
            d.stash_size = bounce_to;
            node.transition()
                .ease("sin")
                .duration(dur)
                .attrTween("r", tweenR)
                .each("end", function(d, i) { d.glowing = false; });
        })

}

//pop this circle
var pop = function(d, i)
{
}
