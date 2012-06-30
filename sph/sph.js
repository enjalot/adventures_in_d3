
// A rudimentary sph layout
d3.layout.sph = function() {
  var force = {},
    event = d3.dispatch("tick"),
    size = [1, 1],
    drag,
    dt = 0.003,
    //constants
    gravity = 9.8,
    rho0 = 500,                  //rest density [ kg/m^3 ]
    //VF = 0.0262144,                //simulation volume [ m^3 ]
    VF = 0.0262144,                //simulation volume [ m^3 ]
    maxnum = 1000,               //won't actually simulate with this many
    K = 5,                     //gas constant
    velocity_limit = 100,
    xsph_factor = 0.2,
    boundary_stiffness = 10000,
    boundary_dampening = 500,
    interval,
    VP,
    m,      //mass
    re,
    rest_distance,
    dmin,   //domain min
    dmax,   //domain max
    V,
    smoothing_radius,
    boundary_distance,
    sim_scale,
    screen_radius,
    poly6_coeff,
    dspiky_coeff,
    not_playing = true,
    nodes = [];

    // Find the nodes within cell
    //function find(quadtree, x0, y0, x3, y3) {
    function find(quadtree, node) 
    {
        //make bounding box around node, should probably move rr and diag out to save computation
        rr = node.radius * node.radius;
        //rr = smoothing_radius * smoothing_radius;
        diag = 2*Math.sqrt(rr); 
        x0 = node.x - diag;
        y0 = node.y - diag;
        x3 = node.x + diag;
        y3 = node.y + diag;
        var points = [];
        quadtree.visit(function(node, x1, y1, x2, y2) 
        {
            var p = node.point;
            if (p && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) { points.push(p); }
            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
        });
        return points;
    }
              

    //Smoothing kernel functions
    function poly6(r)
    {
        var mr2 = r.x*r.x + r.y*r.y;
        
        if (mr2 < smoothing_radius*smoothing_radius)
        {
            var p6 = poly6_coeff * Math.pow((smoothing_radius*smoothing_radius - mr2),3);
            return p6;
        }
        return 0;
    }
    function dspiky(r)
    {
        var magr = Math.sqrt(r.x*r.x + r.y*r.y);
        //if(magr <= 0) return 0;
        
        var hr2 = smoothing_radius - magr;
        if(magr < smoothing_radius)
        {
            return dspiky_coeff * hr2 * hr2 / magr;
        }
        return 0;
    }

    function density_calculation(node, neighbors)
    {
        node.density = 0;
        neighbors.forEach(function(d) {
        //nodes.forEach(function(d) 
            //if (d != node) 
            //{ 
                var r = { x: (node.x - d.x), y: (node.y - d.y) };
                r.x *= sim_scale;
                r.y *= sim_scale;
                node.density += m * poly6(r);
            //}
        });
    }

    function force_calculation(pi, neighbors)
    {
        //pi.force = {x: 0, y: 0};
        //pi.xsph = {x: 0, y: 0};
        pi.force.x = 0;
        pi.force.y = 0;
        pi.xsph.x = 0;
        pi.xsph.y = 0;

        var di = pi.density;
        var Pi = K*(di - rho0);

        var l = neighbors.length;
        //l = nodes.length;
        var j = -1; while (++j < l)
        {
            var pj = neighbors[j];
            //pj = nodes[j];
            if (pj !== pi) 
            { 
                var r = { x: (pi.x - pj.x), y: (pi.y - pj.y) };
                r.x *= sim_scale;
                r.y *= sim_scale;

                if(r.x*r.x + r.y*r.y > smoothing_radius*smoothing_radius)  { return; }

                var dj = pj.density;
                var Pj = K*(dj - rho0);

                var kern = 0.5 * (Pi + Pj) * dspiky(r);
                //console.log(kern);
                //console.log(di + " " + dj);

                var f = {x: 0, y: 0};
                f.x = r.x * kern;
                f.y = r.y * kern;
                f.x *= m / (di * dj);
                f.y *= m / (di * dj);
                //console.log(pj + " " + f.x + " " + f.y);

                if( !isNaN(f.x) && !isNaN(f.y))
                {
                    pi.force.x += f.x;
                    pi.force.y += f.y;
                    /*
                    console.log("force");
                    console.log(pj + " " + f.x + " " + f.y);
                    console.log("density");
                    console.log(di + " " + dj);
                    */
                }
                else
                {
                    console.log(pj + " " + f.x + " " + f.y + " dense " + di);
                }

                //XSPH smoothing
                var xsph = {x: 0, y: 0};
                xsph.x = pj.veleval.x - pi.veleval.x;
                xsph.y = pj.veleval.y - pi.veleval.y;
                xsph.x *= 2 * m * poly6(r) / (di + dj);
                xsph.y *= 2 * m * poly6(r) / (di + dj);
                pi.xsph.x += xsph.x;
                pi.xsph.y += xsph.y;
            }
        }
    }


    function repulsion_force(normal, vel, distance)
    {
        var repulsion = boundary_stiffness * distance;
        repulsion -= boundary_dampening * (normal.x*vel.x + normal.y*vel.y);
        normal.x *= repulsion;
        normal.y *= repulsion;
        return normal;
    }

    function tick() {
        var n = nodes.length;
        var i;
        var o;
        var p;

        nodes.forEach(function(o)
        { 
            //o.x *= sim_scale;
            //o.y *= sim_scale;
            o.color = 0; 
        });
        n0 = nodes[0];
        n0.color = 1;

        //find nearest neighbors
        var qt = d3.geom.quadtree(nodes);
        
        //density calculation with nn
        i = -1; while (++i < n)
        {
            o = nodes[i];
            var nn = find(qt, o);
            density_calculation(o, nn);
            //density_calculation(o, nodes);
        }
        //fowith nn
        i = -1; while (++i < n)
        {
            o = nodes[i];
            var nn = find(qt, o);
            force_calculation(o, nn);
            //force_calculation(o, nodes);
        }

        //repulsion force from boundaries
        i = -1; while (++i < n)
        {
            p = nodes[i];
            p.x *= sim_scale;
            p.y *= sim_scale;
            var f = { x:0, y:0 };
            var dmin = {x: 0, y:0};
            var dmax = {x: size[0] * sim_scale, y: size[1] * sim_scale};
            var bnd_dist = boundary_distance;
            //X Min
            var diff = bnd_dist - (p.x - dmin.x);
            if(diff > 0)
            {
                normal = {x: 1, y: 0};
                rp = repulsion_force(normal, p.vel, diff);
                f.x += rp.x;
                f.y += rp.y;
            }
            //X Max
            diff = bnd_dist - (dmax.x - p.x);
            if(diff > 0)
            {
                normal = {x:-1, y: 0};
                rp = repulsion_force(normal, p.vel, diff);
                f.x += rp.x;
                f.y += rp.y;
            }
            //Y Min //js has origin at top so we flip whats usually min and max
            diff = bnd_dist - (dmax.y - p.y);
            //if(p == 0) console.log(bnd_dist + " " + dmax.y + " " + p.y + " " + diff);
            if(diff > 0)
            {
                normal = {x: 0, y: -1};
                rp = repulsion_force(normal, p.vel, diff);
                //if(p == 0) console.log(rp.y);
                f.x += rp.x;
                f.y += rp.y;
            }
            //Y Max
            diff = bnd_dist - (p.y - dmin.y);
            if(diff > 0)
            {
                normal = {x: 0, y: 1};
                rp = repulsion_force(normal, p.vel, diff);
                f.x += rp.x;
                f.y += rp.y;
            }
            //console.log("boundary force " + f.x + " " + f.y);

            p.force.x += f.x;
            p.force.y += f.y;
            p.x /= sim_scale;
            p.y /= sim_scale;


        }
        // p _forcesition verlet integration
        i = -1; while (++i < n)
        {
            o = nodes[i];
            //handle dragging
            //console.log(o.density);
        
            //Leapfrog integration
            var vnext = { x:0, y:0 };
            var veval = { x:0, y:0 };

            o.x *= sim_scale;
            o.y *= sim_scale;

            f = o.force; 
            f.y += gravity;

            //velocity limit 
            var speed = Math.sqrt(f.x * f.x + f.y * f.y);
            //console.log(speed);
            if (speed > velocity_limit)
            {
                f.x *= velocity_limit / speed;
                f.y *= velocity_limit / speed;
            }
            vnext.x = o.vel.x + f.x * dt;
            vnext.y = o.vel.y + f.y * dt;

            vnext.x += xsph_factor * o.xsph.x;
            vnext.y += xsph_factor * o.xsph.y;
            o.x += vnext.x * dt;
            o.y += vnext.y * dt;

            veval.x = 0.5 * (o.vel.x + vnext.x);
            veval.y = 0.5 * (o.vel.y + vnext.y);
            o.vel = vnext;
            o.veleval = veval;
            //set back to screen coordinates
            o.x /= sim_scale;
            o.y /= sim_scale;
            if (o.fixed) 
            {
                //console.log("fixed " + o);
                o.vel.x = 0;
                o.vel.y = 0;
                o.veleval.x = 0;
                o.veleval.y = 0;
                o.x = o.px;
                o.y = o.py;
            }
            o.px = o.x;
            o.py = o.y;
        }

        //event.tick.dispatch({type: "tick", dt: dt});
        event.tick({dt: dt});

        //dt *= .1;
        //console.log(dt);
        //console.log( (dt *= .99) < .005);
        // simulated annealing, basically
        //return (dt *= .99) < .005;
        //return dt < .001
        //return true;
        return not_playing;
    }


  force.start = function() {
    var i,
        j,
        n = nodes.length,
        w = size[0],
        h = size[1],
        o;

    //setup calculated constants
     //initialize from constants
    VP = VF / maxnum;              //particle volume [ m^3 ]
    m = rho0 * VP;                  //particle mass [ kg ]
    re = Math.pow(VP,(1/3));               //particle radius [ m ]
    //rest_distance = 0.87 * re;    //rest distance between particles [ m ]
    rest_distance = 0.87 * re;    //rest distance between particles [ m ]

    min = { x: 0, y: 0 }; 
    max = { x: size[0], y: size[1] }; 
    V = max.x * max.y;       //Volume

    smoothing_radius = 5.0 * rest_distance;      //smoothing radius for SPH Kernels
    boundary_distance = 3.5 * rest_distance;      //for calculating collision with boundary
    sim_scale = Math.pow((VF / V),(1/3));         //[m^3 / world m^3 ]
    
    h6 = Math.pow(smoothing_radius, 6);
    h9 = Math.pow(smoothing_radius, 9);
    poly6_coeff = 315.0/(64.0 * Math.PI * h9);
    dspiky_coeff = -45.0/(Math.PI*h6);

    //var screen_radius = smoothing_radius / sim_scale;
    screen_radius = 0.2 * smoothing_radius / sim_scale;
    console.log("size = ", size);
    console.log("smoothing_radius = ", smoothing_radius);
    console.log("screen_radius = ", screen_radius);
    console.log("sim scale", sim_scale);



    for (i = 0; i < n; ++i) 
    {
        (o = nodes[i]).index = i;
        o.color = 0;
        o.radius = screen_radius;
        o.density = 0;
        o.vel = {x: 0, y: 0};
        o.veleval = {x: 0, y: 0};
        o.xsph = {x: 0, y: 0};
        o.force = {x: 0, y: 0};
    
    }

    for (i = 0; i < n; ++i) {
      o = nodes[i];
      if (isNaN(o.x)) { o.x = position("x", w); }
      if (isNaN(o.y)) { o.y = position("y", h); }
      if (isNaN(o.px)) { o.px = o.x; }
      if (isNaN(o.py)) { o.py = o.y; }
    }

    // randomly generate nodes
    function position(dimension, size) {
      return Math.random() * size;
    }

    return force.resume();
  };

  force.resume = function() {
    not_playing = false;     
    d3.timer(tick);
    return force;
  };

  force.stop = function() 
  {
    not_playing = true;     
    return force;
  };

  force.getDt = function() {
    return dt;
  };
  
  force.on = function(type, listener) {
    //event[type].add(listener);
    event.on(type, listener);
    return force;
  };

  force.nodes = function(x) {
    if (!arguments.length) { return nodes; }
    nodes = x;
    return force;
  };

  force.size = function(x) {
    if (!arguments.length) { return size; }
    size = x;
    return force;
  };

  force.gravity = function(x) {
    if (!arguments.length) return gravity;
    gravity = x;
    return force;
  };

  //we name it rho for a nicer interface outside
  force.rho = function(x) {
    if (!arguments.length) return rho;
    rho0 = x;
    return force;
  };

  force.xsph_factor = function(x) {
    if (!arguments.length) return xsph_factor;
    xsph_factor = x;
    return force;
  };



  force.maxnum= function(x) {
    if (!arguments.length) return maxnum;
    maxnum = x;
    return force;
  };


  // use `node.call(force.drag)` to make nodes draggable
  force.drag = function() {
    if (!drag) drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", d3_layout_forceDrag)
        .on("dragend", d3_layout_forceDragEnd);

    this.on("mouseover.force", d3_layout_forceDragOver)
        .on("mouseout.force", d3_layout_forceDragOut)
        .call(drag);
  };

  function dragstart(d) {
    d3_layout_forceDragOver(d3_layout_forceDragNode = d);
    d3_layout_forceDragForce = force;
  }

  return force;
};

var d3_layout_forceDragForce,
    d3_layout_forceDragNode;

function d3_layout_forceDragOver(d) {
  d.fixed |= 2;
}

function d3_layout_forceDragOut(d) {
  if (d !== d3_layout_forceDragNode) { d.fixed &= 1; }
}

function d3_layout_forceDragEnd() {
  d3_layout_forceDrag();
  d3_layout_forceDragNode.fixed &= 1;
  d3_layout_forceDragForce = d3_layout_forceDragNode = null;
}

function d3_layout_forceDrag() {
  d3_layout_forceDragNode.px += d3.event.dx;
  d3_layout_forceDragNode.py += d3.event.dy;
  //d3_layout_forceDragNode.px = d3.event.x;
  //d3_layout_forceDragNode.py = d3.event.y;
  //console.log( d3.event);
  d3_layout_forceDragForce.resume(); // restart annealing
}

