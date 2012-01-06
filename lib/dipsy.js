//dipsy, pure svg popups and tooltips for d3
//version 0.0.1
//author: Ian 'enjalot' Johnson, http://visual.ly
//copyright 2011 all rights reserved

dipsy = {version : "0.0.1"};

dipsy.Pops = function(root, clss)
{
    //root svg element to append our popups to
    //this will typically be the the <svg> element itself
    //or a group with proper transformations
    this.root = root;
    this.class = clss;

    //keep track of our popups
    this.pops = [];
    //TODO: deal with multiple tooltips for one parent element

}

dipsy.Pops.prototype = 
{
    //TODO make backbone classes with nice options
    add: function(element, content, cleat, follow_mouse)
    {
        var newpop = new dipsy.Pop(  this.root,
                        this.pops.length, 
                        element,
                        content,
                        this.class
                        );

        //console.log(newpop);
        this.pops.push( newpop );
        return newpop;
    },

    get: function(pelement)
    {
        var ret = [];
        this.pops.forEach(function(p)
        {
            if (p.pelement == pelement)
            {
                ret.push(p);
            }
        });
        return ret;
    },

    getAll: function()
    {
        return this.pops;
    },

    buildQuadTree: function()
    {
        console.log("build qt")
        console.log(this.pops)
        this.qt = d3.geom.quadtree(this.pops);
        console.log(this.qt);
    },

    getNeighbors: function(pop)
    {
        //TODO: build quadtree if not already built

        //get the neighboring pops of the given pop
        var nn = []; 
        var x0 = pop.x;
        var y0 = pop.y;
        var x3 = pop.x + pop.w;
        var y3 = pop.y + pop.h;
        this.qt.visit(function(node, x1, y1, x2, y2) 
        {   
            p = node.point;
            if (p && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3) && p != pop) nn.push(p);
            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0; 
        }); 
        return nn;
    },

    getColliders: function(pop)
    {
        var colliders = [];
        var nn = this.getNeighbors(pop);
        //TODO: actual collision detection
        nn.forEach(function(n)
        {
            if(false)
            { 
                colliders.push(n);
            }
        })
    }


}

dipsy.Pop = function(root, id, pelement, content, clss)
{
    //default values
    this.root = root;
    this.id = id;
    this.class = clss;
    this.pelement = pelement;
    var pbbox = pelement.getBBox();
    this.parent_bbox = pbbox;
    this.content = content;
    this.cleat = {"x":0, "y":0};
    this.offset = {"x":0, "y":0};
    this.theme = new dipsy.Theme();
    //not sure if its a good idea to store this for every one (vs accessing)
    this.nve = pelement.nearestViewportElement;

    this.handle_mouse = true;
    this.follow_mouse = false;
    this.stuck = false;

    var cleat = { "x": pbbox.x + pbbox.width/2,
                   "y": pbbox.y + pbbox.height/2}

    this.init();
    
    this.setCleat(cleat);
    this.setMouseHandlers();
    
    this.hide();
}

dipsy.Pop.prototype = {
    init: function()
    {
        //initialize the tooltip
        this.render();
        this.setOffset();
        this.update();
 
    },

    render: function()
    {
        //generate the svg for the background and 
        if(!_.isUndefined(this.element))
        {
            this.element.remove()
        }

        this.element = this.root.append("svg:g")
            .attr("class", "dipsy_pop " + this.class)

        var bgrect = this.element.append("svg:rect")
            .attr("class", "dipsy_bgrect");

        if(typeof(this.content) == "function")
        {
            //console.log(this.element);
            //console.log(content);
            this.content(this.element);
        }
        // if(typeof(content) == "string")
        else
        {
            this.element.append("svg:text")
                .text(this.content)
                .attr("x", 5)
                .attr("y", function(d) 
                {
                    var bbox = this.getBBox();
                    return bbox.height/2 + 5;
                });
        }

        var cbbox = this.element.node().getBBox();
        if( _.isUndefined(this.w))
        {
            var w = cbbox.width + 10;
            this.w = w;
        }
        else
        {
            var w = this.w;
        }
        if( _.isUndefined(this.h))
        {
            var h = cbbox.height;
            this.h = h;
        }
        else
        {
            var h = this.h;
        }

        bgrect
            .attr("width", w)
            .attr("height", h)
    
     },

    update: function()
    {
        //update the appearance of our tooltip using the theme
        var bgrect = this.element.select(".dipsy_bgrect")
            .attr("stroke", this.theme.stroke)
            .attr("stroke-opacity", this.theme.stroke_opacity)
            .attr("stroke-width", this.theme.stroke_width)
            .attr("fill", this.theme.bg_fill)
            .attr("fill-opacity", this.theme.bg_fill_opacity);
    },

    setTheme: function(theme)
    {
        this.theme = theme;
    },

    getTheme: function()
    {
        return this.theme;
    },

    show: function()
    {
        this.element.attr("visibility", "visible");
    },

    hide: function()
    {
        //if(!this.stuck)
        //{
            this.element.attr("visibility", "hidden");
        //}
    },

    remove: function()
    {
        //console.log("remove");
    },

    setCleat: function(point, transform)
    {
        //default value of transform should be true
        if(typeof(transform) == 'undefined') transform = true;
        if(transform)
        {
            var matrix = this.pelement.getTransformToElement(this.nve);
            var mp = this.nve.createSVGPoint();
            mp.x = point.x;
            mp.y = point.y;
            var p = mp.matrixTransform(matrix);
            this.cleat = p;
        }
        else
        {
            this.cleat = point;
        }
        this.move();
        //console.log(this.cleat);
    },

    getCleat: function()
    {
        return this.cleat;
    },

    setOffset: function(offset)
    {
        if(typeof(offset) == "string")
        {
            var cbbox = this.element.node().getBBox();
            var w = cbbox.width;
            var h = cbbox.height;

            //console.log(offset);
            switch(offset)
            {
                case "center":
                    this.offset = {"x": -w/2, "y":-h/2};
                    break;
                case "N":
                    this.offset = { "x":  -w/2, "y":  +10};
                    break;
                case "S":
                    this.offset = { "x":  -w/2, "y":  -h -10};
                    break;
                case "E":
                    this.offset = { "x":  +10, "y":  -h/2};
                    break;
                case "W":
                    this.offset = { "x":  -w+10, "y": -h/2};
                    break;

                default:
                    this.offset = {"x": 0, "y": 0};
                    break;
            }
        }
        else if(typeof(offset) == "undefined")
        {
            this.offset = {"x": 0, "y": 0};
        }
        else
        {
            this.offset = offset;
        }
        this.move();
    },

    move: function()
    {
        this.x = this.cleat.x + this.offset.x;
        this.y = this.cleat.y + this.offset.y;
        //TODO: name this function move? just want to update translation if cleat has changed
        //this.element.attr("transform", "translate(" + [this.cleat.x + this.offset.x, this.cleat.y + this.offset.y] + ")");
        this.element.attr("transform", "translate(" + [this.x, this.y] + ")");
    },


    setStuck: function(stuck)
    {
        this.stuck = stuck;
    },

    setFollowMouse: function(follow_mouse)
    {
        this.follow_mouse = follow_mouse;
        this.setMouseHandlers();
    },

    setHandleMouse: function(handle_mouse)
    {
        this.handle_mouse = handle_mouse;
        this.setMouseHandlers();
    },


    setMouseHandlers: function()
    {
        var that = this;
        var parent_out = function()
        {
            //check if we are mousing out of our parent and into ourselves
            var ee = d3.event.toElement;
            var eles = that.element[0][0].childNodes;
            for(i in eles)
            {
                if (ee == eles[i])
                {
                    //need to cancel the event
                    //not sure why stopImmediatePropogation is necessary
                    //d3.event.preventDefault();
                    //d3.event.stopPropagation();
                    d3.event.stopImmediatePropagation();
                    return false;
                }
            }
            if(!that.stuck)
            {
                that.hide.apply(that, arguments);
            }
        }
        var this_out = function()
        {
            //console.log("HIDE");
            //check if we are mousing out of ourselves and into our parent 
            var ee = d3.event.toElement;
            var eles = that.element[0][0].childNodes;
            for(i in eles)
            {
                if (ee == eles[i])
                {
                    return false;
                }
            }
            //if we are mousing out of the popup into the parent element
            if (ee == that.pelement)
            {
                return false;
            }
            //if we are mousing out of the popup into some other element
            else
            {
                //console.log("exiting to other state");
                //TODO this seems really hacky
                //we are making sure we call the mouseout of the parent element
                var pel = d3.select(that.pelement)[0][0];
                if(pel.__onmouseout)
                {
                    pel.__onmouseout(d3.event);
                }
            }
            if(!that.stuck)
            {
                that.hide.apply(that, arguments);
            }
        }

        var this_over = function()
        {
        }

        var parent_over = function()
        {
            that.show.apply(that, arguments);
        }

        var parent_move = function()
        {
            //console.log(d3.svg.mouse(that.pelement));
            if(!that.stuck)
            {
                var m = d3.svg.mouse(that.pelement);
                that.setCleat({"x":m[0], "y":m[1]});
                that.move();
            }
        }
        var parent_click = function()
        {
            that.stuck = !that.stuck;
        }

        if(this.handle_mouse)
        {
            //mouse events on parent element
            var papa = d3.select(this.pelement)
                .on("mouseover.dipsy"+this.class, parent_over)
                .on("mouseout.dipsy"+this.class, parent_out)
                .on("click.dipsy"+this.class, parent_click)

            //mouse events on the tooltip itself
            this.element.on("mouseout.dipsy"+this.class, this_out);
            this.element.on("mouseover.dipsy"+this.class, this_over);

            //if we want to follow the mouse
            if(this.follow_mouse)
            {
                this.element.on("mousemove.dipsy"+this.class, parent_move);
                papa.on("mousemove.dipsy"+this.class, parent_move);
            }
            else
            {
                this.element.on("mousemove.dipsy"+this.class, null);
                papa.on("mousemove.dipsy"+this.class, null);
            }
        }
        else
        {
            //mouse events on parent element
            var papa = d3.select(this.pelement)
                .on("mouseover.dipsy"+this.class, null)
                .on("mouseout.dipsy"+this.class, null)
                .on("click.dipsy"+this.class, null)

            //mouse events on the tooltip itself
            this.element.on("mouseout.dipsy"+this.class, null);
            this.element.on("mouseover.dipsy"+this.class, null);
        }
    }

}



dipsy.Theme = function()
{
    this.bg_fill="#fff";
    this.bg_fill_opacity=.6;
    this.stroke="#fff";
    this.stroke_opacity=.8;
    this.stroke_width=1;
}

dipsy.Theme.prototype = 
{
 
}
