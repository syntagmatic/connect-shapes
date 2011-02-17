shapes = []
conns = {}
dragged = false
selected = false

window.onload = ->
  window.r = Raphael("holder", 600, 600)
  r.createShape(shapes.length,'rect',55,55,70,70)
  r.createShape(shapes.length,'rect',55,255,70,70)
  r.createShape(shapes.length,'rect',255,55,70,70)
  r.createShape(shapes.length,'rect',255,255,70,70)

Raphael.fn = new ->

  #shapes
  @createShape = (i,type,xpos,ypos,width,height) ->
    switch type
      when "rect"
        shapes.push this.rect(xpos, ypos, width, height, 3)
        newShape(i)
  selectShape = (i) ->
    selected = i
    shapes[i].animate({"fill-opacity": 0.9}, 500)
  deselectShape = (i) ->
    selected = false
    shapes[i].animate({"fill-opacity": 0.5}, 140)
  destroyShape = (i) ->
    # TODO
  newShape = (i) ->
    color = Raphael.getColor()
    shapes[i].attr
      "fill" : color
      "fill-opacity" : 0.5
      "stroke" : color
      "stroke-width" : 2
      "stroke-opacity" : 0.8
    shapes[i].node.style.cursor = "move"
    shapes[i].click(clicker)
    shapes[i].drag(move,down,up)
    conns[i] = {}
  
  #connections
  selectConn = (a,b) ->
    if conns[a][b] is undefined
      createConn(a,b)
    else
      destroyConn(a,b)
  destroyConn = (a,b) ->
    conn = conns[a][b]
    connObj = shapes[conn]
    connObj.line.remove()
    delete conns[a][b]
    delete conns[b][a]
  createConn = (a,b, connColor = "#eee") ->
    i = shapes.length
    shapes.push(drawConn(shapes[a],shapes[b],connColor))
    conns[a][b] = i
    conns[b][a] = i
    r.safari()
  drawConn = (a, b, color) ->
    bb1 = a.getBBox()
    bb2 = b.getBBox()
    path = ["M", bb1.x+(bb1.width/2), bb1.y+(bb1.height/2),
            "L", bb2.x+(bb2.width/2), bb2.y+(bb1.height/2)].join(",")
    return {
      line: r.path(path).attr
        stroke: color
        fill: "none"
        "stroke-width": 3
        "stroke-dasharray": "."
        "stroke-opacity":0.5
      from: a
      to: b
    }
  syncConnections = (a) ->
    for b of conns[a]
      conn = conns[a][b]
      shapes[conn].line.remove()
      shapes[conn] = drawConn(shapes[a],shapes[b],"#eee")
    
  #interactions
  clicker = ->
    if selected isnt false
      if selected != this.id
        selectConn(selected,this.id)
      else
        this.toBack()
      deselectShape(selected)
    else if not dragged
      selectShape(this.id)
      this.toFront()
    else
      dragged = false
  down = () ->
    this.ox = this.attr "x"
    this.oy = this.attr "y"
  move = (dx,dy) ->
    this.attr({x: this.ox + dx, y: this.oy + dy})
    syncConnections(this.id)
    dragged = true
  up = () ->

  return @createShape()
