gallery = {}
gallery.events = _.extend({}, Backbone.Events)

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
            iframe = $('<iframe id="' + id + '"></iframe>')
            console.log "iframe", iframe
            $('#iframes').append(iframe)

            pkey = ""
            ukey = ""
            for letter in id
                pkey += "," + letter
                ukey += "," + letter
            pkey += "p"

            console.log "KEY", pkey, ukey

            jwerty.key(ukey, () ->
                console.log "unpause", id
                ex.trigger("unpause")
            )

            jwerty.key(pkey, () ->
                console.log "pause", id
                ex.trigger("pause")
            )



            ev = new gallery.ExhibitView(model: ex, id: id, el: iframe)
            ev.render()
            sum += ex.get("width")
        )
        console.log("sum", sum)
        d3.select("#iframes").style("width", sum + 35)



    )

init()
