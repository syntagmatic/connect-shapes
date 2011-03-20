var conns, dragged, selected, shapes;
shapes = [];
conns = {};
dragged = false;
selected = false;
window.onload = function() {
  window.r = Raphael("holder", 1200, 600);
  r.createShape(shapes.length, 'rect', 100, 100, 100, 100);
  r.createShape(shapes.length, 'rect', 300, 350, 100, 100);
  r.createShape(shapes.length, 'rect', 100, 300, 100, 100);
  return r.createShape(shapes.length, 'rect', 300, 150, 100, 100);
};
Raphael.fn = new function() {
  var clicker, createConn, deselectShape, destroyConn, destroyShape, down, drawConn, move, newShape, selectConn, selectShape, syncConnections, up;
  this.createShape = function(i, type, xpos, ypos, width, height) {
    switch (type) {
      case "rect":
        shapes.push(this.rect(xpos, ypos, width, height, 3));
        return newShape(i);
    }
  };
  selectShape = function(i) {
    selected = i;
    return shapes[i].animate({
      "fill-opacity": 0.9
    }, 500);
  };
  deselectShape = function(i) {
    selected = false;
    return shapes[i].animate({
      "fill-opacity": 0.8
    }, 140);
  };
  destroyShape = function(i) {};
  newShape = function(i) {
    var color;
    color = Raphael.getColor();
    shapes[i].attr({
      "fill": color,
      "fill-opacity": 0.8,
      "stroke": color,
      "stroke-width": 1,
      "stroke-opacity": 0.8
    });
    shapes[i].node.style.cursor = "move";
    shapes[i].click(clicker);
    shapes[i].drag(move, down, up);
    return conns[i] = {};
  };
  selectConn = function(a, b) {
    if (conns[a][b] === void 0) {
      return createConn(a, b);
    } else {
      return destroyConn(a, b);
    }
  };
  destroyConn = function(a, b) {
    var conn, connObj;
    conn = conns[a][b];
    connObj = shapes[conn];
    connObj.line.remove();
    delete conns[a][b];
    return delete conns[b][a];
  };
  syncConnections = function(a) {
    var b, conn, _results;
    _results = [];
    for (b in conns[a]) {
      conn = conns[a][b];
      shapes[conn].line.remove();
      _results.push(shapes[conn] = drawConn(shapes[a], shapes[b], "#eee"));
    }
    return _results;
  };
  createConn = function(a, b, connColor) {
    var i;
    if (connColor == null) {
      connColor = "#eee";
    }
    i = shapes.length;
    shapes.push(drawConn(shapes[a], shapes[b], connColor));
    conns[a][b] = i;
    conns[b][a] = i;
    return r.safari();
  };
  drawConn = function(a, b, color) {
    var bb1, bb2, path;
    bb1 = a.getBBox();
    bb2 = b.getBBox();
    path = ["M", bb1.x + (bb1.width / 2), bb1.y + (bb1.height / 2), "L", bb2.x + (bb2.width / 2), bb2.y + (bb2.height / 2)].join(",");
    return {
      line: r.path(path).attr({
        stroke: color,
        fill: "none",
        "stroke-width": 2,
        "stroke-dasharray": ".",
        "stroke-opacity": 0.8
      }),
      from: a,
      to: b
    };
  };
  clicker = function() {
    if (selected !== false) {
      if (selected !== this.id) {
        selectConn(selected, this.id);
      } else {
        this.toBack();
      }
      return deselectShape(selected);
    } else if (!dragged) {
      selectShape(this.id);
      return this.toFront();
    } else {
      return dragged = false;
    }
  };
  down = function() {
    this.ox = this.attr("x");
    return this.oy = this.attr("y");
  };
  move = function(dx, dy) {
    this.attr({
      x: this.ox + dx,
      y: this.oy + dy
    });
    syncConnections(this.id);
    return dragged = true;
  };
  up = function() {};
  return this.createShape();
};