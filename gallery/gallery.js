var gallery, init, json_url;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
gallery = {};
gallery.events = _.extend({}, Backbone.Events);
gallery.scrollorama = {};
gallery.Exhibit = (function() {
  __extends(Exhibit, Backbone.Model);
  function Exhibit() {
    Exhibit.__super__.constructor.apply(this, arguments);
  }
  Exhibit.prototype.defaults = {
    htmlid: 'index',
    url: '../index/index.html',
    width: 500,
    height: 540
  };
  return Exhibit;
})();
gallery.Exhibits = (function() {
  __extends(Exhibits, Backbone.Collection);
  function Exhibits() {
    Exhibits.__super__.constructor.apply(this, arguments);
  }
  Exhibits.prototype.model = gallery.Exhibit;
  return Exhibits;
})();
gallery.ExhibitView = (function() {
  __extends(ExhibitView, Backbone.View);
  function ExhibitView() {
    this.render = __bind(this.render, this);
    this.unpause = __bind(this.unpause, this);
    this.pause = __bind(this.pause, this);
    ExhibitView.__super__.constructor.apply(this, arguments);
  }
  ExhibitView.prototype.initialize = function() {
    console.log("init exhibit", this.id);
    this.model.bind("pause", this.pause);
    return this.model.bind("unpause", this.unpause);
  };
  ExhibitView.prototype.pause = function() {
    return document.getElementById(this.id).contentWindow.pause = true;
  };
  ExhibitView.prototype.unpause = function() {
    return document.getElementById(this.id).contentWindow.pause = false;
  };
  ExhibitView.prototype.render = function() {
    $(this.el).attr("src", this.model.get("url"));
    $(this.el).attr("width", this.model.get("width"));
    $(this.el).attr("height", this.model.get("height"));
    return this;
  };
  return ExhibitView;
})();
json_url = "advd3.json";
init = function() {
  return d3.json(json_url, function(data) {
    var exhibits, sum;
    exhibits = new gallery.Exhibits(data);
    console.log("exhibits", exhibits);
    sum = 0;
    exhibits.each(function(ex) {
      var div, ev, ew, id, iframe, letter, pkey, sdiv, ukey, _i, _len;
      id = ex.get("htmlid");
      div = $('<div id="div' + id + '"><iframe id="' + id + '"></iframe></div>');
      $('#iframes').append(div);
      iframe = $('#' + id);
      pkey = "p";
      ukey = "u";
      for (_i = 0, _len = id.length; _i < _len; _i++) {
        letter = id[_i];
        pkey += "," + letter;
        ukey += "," + letter;
      }
      jwerty.key(pkey, function() {
        console.log("pause", id);
        return ex.trigger("pause");
      });
      jwerty.key(ukey, function() {
        console.log("unpause", id);
        return ex.trigger("unpause");
      });
      div = $('#div' + id);
      div.attr("style", "position: absolute; margin-top: 0px; margin-left: " + sum + "px;");
      ew = ex.get("width");
      sdiv = $('<div id="scroll_div_' + id + '"> </div>');
      sdiv.attr("style", "display:block;position:absolute;margin-top:0; margin-left: " + (sum - 2 * ew / 3) + "px;height:1px; width:" + ew / 2);
      sdiv.attr("class", "scrollblock");
      $('#scrolldivs').append(sdiv);
      ev = new gallery.ExhibitView({
        model: ex,
        id: id,
        el: iframe
      });
      ev.render();
      return sum += ex.get("width");
    });
    console.log("sum", sum);
    d3.select("#iframes").style("width", sum + 35);
    "sum = 0\nexhibits.each((ex) ->\n    id = ex.get(\"htmlid\")\n    div = $('#div' + id)\n    div.attr(\"style\", \"position:absolute;margin-top:0; margin-left: \" + (sum) + \"px;\")\n    sum += ew\n)";
    gallery.scrollorama = $.scrollorama({
      blocks: '.scrollblock'
    });
    "gallery.scrollorama.animate('#random',{\n    duration:800\n    #pin: true\n    property:'width'\n    start:500\n    end:1000\n})";
    return gallery.scrollorama.onBlockChange(function() {
      var i;
      i = gallery.scrollorama.blockIndex;
      console.log("scrolled into", i);
      exhibits.each(function(ex) {
        return ex.trigger("pause");
      });
      return exhibits.at(i).trigger("unpause");
    });
  });
};
init();