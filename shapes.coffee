shapes = []
conns = {}
isDrag = false
wasDragged = false
isSelected = false
clicked = false

window.onload = ->
  window.r = Raphael("holder", 960, 640)
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
    isSelected = i
    shapes[i].animate({"fill-opacity": 0.9}, 500)
  deselectShape = (i) ->
    isSelected = false
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
    shapes[i].mousedown(dragger)
    shapes[i].click(clicker)
    conns[i] = {}
  
  #connections
  selectConn = (x,y) ->
    if findConn(x,y) is undefined
      createConn(x,y)
    else
      destroyConn(x,y)
  destroyConn = (x,y) ->
    conn = findConn(x,y)
    connObj = shapes[conn]
    connObj.line.remove()
    if x < y
      delete conns[x][y]
    else
      delete conns[y][x]
  createConn = (x,y, connColor = "#eee") ->
    i = shapes.length
    shapes.push(drawConn(shapes[x],shapes[y],connColor))
    if x < y conns[x][y] = i else
      conns[y][x] = i
    r.safari()
  findConn = (x,y) ->
    if x < y
      conn = conns[x][y]
    else
      conn = conns[y][x]
    conn
  drawConn = (obj1, obj2, color) ->
    bb1 = obj1.getBBox()
    bb2 = obj2.getBBox()
    console.log bb1, bb2
    path = ["M", bb1.x+(bb1.width/2), bb1.y+(bb1.height/2),
            "L", bb2.x+(bb2.width/2), bb2.y+(bb1.height/2)].join(",")
    return {
      line: r.path(path).attr({stroke: color, fill: "none", "stroke-width": 3 , "stroke-dasharray": ".", "stroke-opacity":0.5})
      from: obj1
      to: obj2
    }
    
  #interactions
  clicker = ->
    if isSelected isnt false
      if isSelected != this.id
        selectConn(isSelected,this.id)
      else
        this.toBack()
        deselectShape(this.id)
    else
        selectShape(this.id)
        this.toFront()
  dragger = (e) ->
    e = e || window.event
    this.dx = e.clientX
    this.dy = e.clientY
    isDrag = this
    e.preventDefault and e.preventDefault()
  dragAndDrop = (selected,e) ->
    e = e || window.event
    selected.translate(e.clientX - selected.dx, e.clientY - selected.dy)
    syncConnections(selected.id)
    selected.dx = e.clientX
    selected.dy = e.clientY

  return @createShape()
