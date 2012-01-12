gallery = {}
#global event object
gallery.events = _.extend({}, Backbone.Events)

#object to hold the scrollorama 
gallery.scrollorama = {}

class gallery.Exhibit extends Backbone.Model
    defaults:
        htmlid: 'index'
        url: '../index/index.html'
        width: 500
        height: 540

class gallery.Exhibits extends Backbone.Collection
    model: gallery.Exhibit


class gallery.ExhibitView extends Backbone.View
    initialize:  ->
        console.log "init exhibit", @id
        @model.bind("pause", @pause)
        @model.bind("unpause", @unpause)

    pause: =>
        document.getElementById(@id).contentWindow.pause = true
    unpause: =>
        document.getElementById(@id).contentWindow.pause = false

    render: =>
        #render iframe with url from model
        $(@el).attr("src", @model.get("url"))
        $(@el).attr("width", @model.get("width"))
        $(@el).attr("height", @model.get("height"))
        #$(@el).attr("class", "scrollblock")

        #gallery.scrollorama.animate('#' + @id,{
        @


json_url = "advd3.json"
init = () ->
    d3.json(json_url, (data) ->
        exhibits = new gallery.Exhibits(data)
        #exhibits.add( new gallery.Exhibit() )
        #exhibits.add( new gallery.Exhibit() )
        console.log "exhibits", exhibits

        sum = 0

        exhibits.each((ex) ->
            id = ex.get("htmlid")
            div = $('<div id="div' + id + '"><iframe id="' + id + '"></iframe></div>')
            #console.log "iframe", iframe
            $('#iframes').append(div)
            iframe = $('#' + id)
            iframe.attr("marginheight",0)
            iframe.attr("marginwidth",0)
            iframe.attr("frameborder",0)
            iframe.attr("scrolling","no")

            #you can type the p and then the id to pause it, start with u to unpause
            pkey = "p"
            ukey = "u"
            for letter in id
                pkey += "," + letter
                ukey += "," + letter

            #console.log "KEY", pkey, ukey

            jwerty.key(pkey, () ->
                console.log "pause", id
                ex.trigger("pause")
            )

            jwerty.key(ukey, () ->
                console.log "unpause", id
                ex.trigger("unpause")
            )

            div = $('#div' + id)
            div.attr("style", "position: absolute; margin-top: 0px; margin-left: " + sum + "px;")
            #div.attr("style", "margin-left: " + sum + "px;")
            #div.attr("class", "scrollblock")

            ew = ex.get("width")
            sdiv = $('<div id="scroll_div_' + id + '"> </div>')
            sdiv.attr("style", "display:block;position:absolute;margin-top:0; margin-left: " + (sum - 2*ew/3) + "px;height:1px; width:" + ew/2)
            sdiv.attr("class", "scrollblock")
            $('#scrolldivs').append(sdiv)




            ev = new gallery.ExhibitView(model: ex, id: id, el: iframe)
            ev.render()
            sum += ex.get("width")
        )
        console.log("sum", sum)
        d3.select("#iframes").style("width", sum + 35)

        """
        sum = 0
        exhibits.each((ex) ->
            id = ex.get("htmlid")
            div = $('#div' + id)
            div.attr("style", "position:absolute;margin-top:0; margin-left: " + (sum) + "px;")
            sum += ew
        )
        """

        gallery.scrollorama = $.scrollorama({
            blocks:'.scrollblock'
        })


 
        """
        gallery.scrollorama.animate('#random',{
            duration:800
            #pin: true
            property:'width'
            start:500
            end:1000
        })
        """
        gallery.scrollorama.onBlockChange(() ->
            i = gallery.scrollorama.blockIndex
            console.log "scrolled into", i
            exhibits.each((ex) ->
                ex.trigger("pause")
            )
            exhibits.at(i).trigger("unpause")
        )




    )

init()
