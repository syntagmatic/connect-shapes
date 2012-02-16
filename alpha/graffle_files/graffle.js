/* Connect Shapes
 * http://www.connectshapes.com
 * Developed by Kai Chang and Mary Becica
 *
 * Requires the Raphael library, by Dmitry Baranovskiy
 * Also requires jQuery (for now)
 *
 * Based off of Dmitry's graffle demo:
 * http://raphael.com/graffle.html
 *
 */

// MEASUREMENTS 

// Use to position clicks relative to canvas
  var offsetx = 0,
      offsety = 0;
function findoffset(box) {
  var canvas = $(box),
      offset = canvas.offset(),
      xscroll = $(window).scrollLeft(),
      yscroll = $(window).scrollTop();
  offsetx = offset.left - xscroll;
  offsety = offset.top - yscroll;
};

  var xpos = 0,
      ypos = 0;
function findposition(e) {
  // The following two lines can be used for snap-to-grid functionality
  // xpos = Math.round((e.clientX - offsetx)/75)*75;
  // ypos = Math.round((e.clientY - offsety)/75)*75;
  xpos = e.clientX - offsetx;
  ypos = e.clientY - offsety;
}

// Create connection
Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox();
    var bb2 = obj2.getBBox();
    var p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}];
    var d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        var res = d[Math.min.apply(Math, dis)];
    }
    if (res == undefined) {
      var res = [0, 4];
      /* This hack prevents shapes from flying off the screen
       * in some cases where this function gets called with
       * bad arguments.
       */   
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y,
        dx = Math.max(Math.abs(x1 - x4) /2 , 10),
        dy = Math.max(Math.abs(y1 - y4) /2 , 10),
        x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 8, "stroke-opacity": 0.3}),
            line: this.path(path).attr({stroke: color, fill: "none", "stroke-width": 3 , "stroke-dasharray": ".", "stroke-opacity":0.5}),
            from: obj1,
            to: obj2
        };
    }
};






window.onload = function () {
  // SHAPE SELECTION

  // Select a shape
  isSelected = 'false';  // dumb javascript thinks 0 == false
  var selectShape = function (selected) {
    isSelected = selected;
    shapes[selected].animate({"fill-opacity": 0.9}, 500);
    moveTools(selected);
  };

  var deselectShape = function (selected) {
    isSelected = 'false';
    shapes[selected].animate({"fill-opacity": 0.5}, 140);
    removeTools();
  };

  var wasDragged = false;
  var clicker = function () {
    // Click on a shape
	if (isSelected !== 'false' && isSelected !== this.id) {
	  selectConn(isSelected, this.id);
      destroyMe = 'false';
	} else if (isSelected === this.id) {
	  // Deselect shape if second click on current shape
	  this.toBack();
	  deselectShape(this.id);
	} else if (isSelected !== 'false' && wasDragged === true) {
	  deselectShape(this.id);
    } else {
      // Select shape if first click on current shape and no shapes selected
      selectShape(this.id);
      if (selectedConn !== 'false') {
        deselectConn();
      }
      this.toFront();
    }
  };
 
  var isDrag = false,
      isTool = false,
      clicked = false;

  var dragger = function (e) {
    e = e || window.event;
    // Drag shape along
    this.dx = e.clientX;
    this.dy = e.clientY;
    isDrag = this;
    e.preventDefault && e.preventDefault();
  };

  var dragAndDrop = function(selected,e) {
    e = e || window.event;
    selected.translate(e.clientX - selected.dx, e.clientY - selected.dy);
    syncConnections(selected.id);
    r.safari();
    selected.dx = e.clientX;
    selected.dy = e.clientY;
  }

  var toolover = function (e) {
    this.dx = e.clientX;
    this.dy = e.clientY;
    isTool = this;
    e.preventDefault && e.preventDefault();
  };

  var sX = 0,
      sY = 0,
      sWidth = 0,
      sHeight = 0;
  var measureShape = function(selected) {
    var bb = shapes[selected].getBBox();
    sX = bb.x;
    sY = bb.y;
    sWidth = bb.width;
    sHeight = bb.height;
  };

  var xdist = 0,
      ydist = 0;
  var distanceTo = function(selected,e) {
    xdist = sWidth + e.clientX - shapes[selected].dx;
    ydist = sHeight + e.clientY - shapes[selected].dy;
  }

  // OBJECT MODIFICATIONS

  var syncConnections = function (selected) {
    for (i = 0, ii = connMatrix[selected].length; i < ii; i++) {
      if (connMatrix[selected][i] != undefined) {
        thisConn = connMatrix[selected][i];
        if (thisConn != undefined) {
          r.connection(connections[thisConn]);
        }
      }
    }
  };

/* Save for discrete resizers later
 *
  shapeSize = []; 
  var enlargeShape = function () {
    // Enlarge Shape
    newSize = thisSize * 1.2;
    shapes[isSelected].scale(newSize, newSize);
    for (var i = connections.length; i--;) {
      r.connection(connections[i]);
    }
    shapeSize[isSelected] = newSize;
  };

  var shrinkShape = function () {
    // Shrink Shape
    newSize = thisSize * 0.8;
    shapes[isSelected].scale(newSize, newSize);
    for (var i = connections.length; i--;) {
      r.connection(connections[i]);
    }
    shapeSize[isSelected] = newSize;
  }; */

  var changeShape = function (selected, newWidth, newHeight, newR) {
    shapes[selected].attr({ width:newWidth, height:newHeight, r:newR});
    syncConnections(selected);
  };

  var deleteShape = function (selected) {
    shapes[selected].remove();
    for (i = 0, ii = connMatrix.length; i < ii; i++) {
      if (connMatrix[selected][i] != undefined) {
        thisConn = connMatrix[selected][i];
		    connections[thisConn].line.remove();
        connMatrix[selected][i] = connMatrix[i][selected] = undefined;
      }
    }
    isSelected = 'false';
    removeTools();
  };

  /*var activeColorFlag = 'false'; 
  var changeColor = function (selected, newColor) {
    shapes[selected].attr({fill:newColor, stroke:newColor});
    activeColor = newColor;
    activeColorFlag = 'true';
  }

  var changeStroke = function (selected, newStroke) {
    shapes[selected].attr({"stroke-weight":newStroke});
  }

  var changeOpacity = function(selected, newOpacity) {
    shapes[selected].attr({"fill-opacity":newOpacity});
  }*/

  // OBJECT GENERATORS

  var r = Raphael("holder", 960, 640);

  var connections = [];
  var connMatrix = [];

  var createConn = function (first, second, color) {
    thisConn = shapes.length;
    shapes[thisConn] = connections.push(r.connection(shapes[first], shapes[second], color ));
		connMatrix[first][second] = connections.length-1;
		connMatrix[second][first] = connections.length-1;
		connMatrix[thisConn]=[];
    destroyMe = 'false';
  }

  var removeConn = function (first, second) {
    removedConn = connMatrix[first][second];
		connections[removedConn].line.remove();
		connMatrix[first][second] = null;
		connMatrix[second][first] = null;
  };

  var selectedConn = 'false';
  var selectConn = function (first, second) {
    selectedConn = connMatrix[first][second];
    thisConnColor = connections[selectedConn].line.attr({'stroke-opacity': "1"});
    deselectShape(first);
    showColorer();
    showConner();
  };

  var deselectConn = function () {
    thisConnColor = connections[selectedConn].line.attr({'stroke-opacity': ".5"});
    selectedConn = 'false';
    hideColorer();
    hideConner();
  };
/*  var selectConn = function (first, second, color) {
	  if (connMatrix[first][second] == undefined) {
      createConn(thisConn, first, second, color);
	  } else {
		  thisConn = connMatrix[first][second];
      removeConn(first, second, color);
	  }
  }; */
    
  var shapes = [],
      destroyMe = 'false';

  var newShape = function (i) {
    // Create a new shape
    var color = Raphael.getColor();
    shapes[i].attr({fill: color, "fill-opacity": 0.5,
                    stroke: color, "stroke-width": 2, "stroke-opacity": 0.6});
    shapes[i].node.style.cursor = "move";
    shapes[i].mousedown(dragger);
    shapes[i].hover( 
    function () {
      if (isSelected !== 'false' && isSelected !== this.id) {
        if (connMatrix[isSelected, this.id] == undefined  || connections[connMatrix[isSelected][this.id]] == undefined) {
          createConn(isSelected, this.id, '#666');
          destroyMe = 'true';
        }
      }
    },
    function () {
      if (destroyMe == 'true') {
        removeConn(isSelected, this.id);
        destroyMe = 'false';
      }
    });
    shapes[i].click(clicker);
    connMatrix[i]=[];
  };

  var createShape = function (i,type,xpos,ypos,width,height) {
	  if (type === 'rect') {
      shapes.push(r.rect(xpos, ypos, width, height, 3));
	    newShape(i);
    }
  }

  var type = '',
      Gone = -50;
  var newTool = function (i,color,type,stroke) {
    switch(type) {
    case 'circ':
      //circle tools
      shapes[i] = r.circle(Gone,Gone,8);
      shapes[i].attr({fill: color, "fill-opacity": 0.8,
                      stroke: "#333", "stroke-width": 1});
      break;
    case 'rect':
      //rectangle tools
      shapes[i] = r.rect(Gone,Gone,28,28);
      shapes[i].attr({fill:color, "fill-opacity":0.6,
                      stroke:color, "stroke-width":2, "stroke-opacity": 0.2});
      break;
    case 'ex':
      //x tools
      shapes[i] = r.path("M-50-50l10 10m0 -10l-10 10");
      shapes[i].attr({stroke:color, "stroke-width":5, "stroke-opacity":0.6});
      shapes[i].node.style.cursor = "pointer";
      break;
    case 'tack':
      //resize tools
      shapes[i] = r.path("M-50-50m10 0l0 10l-10 0");
      shapes[i].attr({stroke:color, "stroke-width":3, "stroke-opacity":0.3});
      shapes[i].node.style.cursor = "SE-resize";
      break;
    case 'line':
      //stroke tools
      shapes[i] = r.path("M10,14l28 0");
      shapes[i].attr({stroke:color, "stroke-width":3, "stroke-dasharray":stroke});
      break;
    }
    shapes[i].mousedown(toolover);
    connMatrix[i]=[];
  };


  /* Create initial setup */
  shapes = [r.rect(650, 250, 70, 70, 3),
                r.rect(340, 385, 70, 70, 3),
                r.rect(200, 100, 70, 70, 3)
             ];
  for (var i = 0, ii = shapes.length; i < ii; i++) {
    newShape(i);
  }

  createConn(1, 2, '#6c6');
  createConn(0, 1, '#6c6'); 
  createConn(0, 2, '#6c6'); 
  
  // TOOLBAR

  //color picker 
  var color = undefined,
      cx = 15,
      cd = 28;
  var colors = [[shapes.length, '#999999'],
                [shapes.length+1, '#349e97'],
                [shapes.length+2, '#7f304b'],
                [shapes.length+3, '#dc3035'],
                [shapes.length+4, '#ff6c48'],
                [shapes.length+5, '#ffc464'],
                [shapes.length+6, '#aec27c']];
  for (var c=0, cc = colors.length ; c < cc; c++) {
    newTool(colors[c][0], colors[c][1], 'rect');
    shapes[colors[c][0]].translate(cx-Gone, 15-Gone);
    shapes[colors[c][0]].hide();
    shapes[colors[c][0]].mousedown(  function () {
      if (isSelected !== 'false') {
        color = this.attr('fill');
        shapes[isSelected].attr({fill: color, stroke: color});
      } else if (selectedConn !== 'false') {
        color = this.attr('fill');
        connections[selectedConn].line.attr({'stroke': color});
      }
    });
    cx = (cx+15)+cd;
  }

  //linetype picker
  var connType = undefined;
  var conns = [[shapes.length, ''],
	       [shapes.length+1, '-'],
	       [shapes.length+2, '.'],
	       [shapes.length+3, '. '],
	       [shapes.length+4, '- '],
	       [shapes.length+5, '- .']];
  for (var c=0; c < conns.length; c++) {
    newTool(conns[c][0], '#acacac', 'line', conns[c][1]); 
    shapes[conns[c][0]].translate(cx-Gone, 15);
    shapes[conns[c][0]].hide();
    shapes[conns[c][0]].mousedown( function() {
      if (isSelected !== 'false') {
        connType = this.attr('stroke-dasharray');
        shapes[isSelected].attr({'stroke-dasharray': connType});
     } else if (selectedConn !== 'false') {
        connType = this.attr('stroke-dasharray');
        connections[selectedConn].line.attr({'stroke-dasharray': connType});
     } 
    });
    cx = (cx+15)+cd;
  } 

  var showColorer = function () {
    for (var c=0; c < colors.length; c++) {
      shapes[colors[c][0]].show();
      shapes[colors[c][0]].toFront();
    }
  };

  var hideColorer = function () {
    for (var c=0; c < colors.length; c++) {
      shapes[colors[c][0]].hide();
    }
  }

  var showConner = function () {
    for (var c=0; c < conns.length; c++) {
      shapes[conns[c][0]].show();
    }
  }
  
  var hideConner = function () {
    for (var c=0; c < conns.length; c++) {
      shapes[conns[c][0]].hide();
    }
  }

  var deleter = shapes.length;
  newTool(deleter,"#ee2211",'ex');

  var moveDeleter = function (selected) {
    measureShape(selected);
    newX = sX + sWidth + 3;
    newY = sY - 13;
    measureShape(deleter);
    oldX = sX;
    oldY = sY;
    shapes[deleter].translate(newX-oldX, newY-oldY);
    shapes[deleter].toFront();
  };

  var resizer = shapes.length;
  newTool(resizer,"#acacac",'tack');

  var moveResizer = function (selected) {
    measureShape(selected);
    newX = sX + sWidth-5;
    newY = sY + sHeight-5;
    measureShape(resizer);
    oldX = sX;
    oldY = sY;
    shapes[resizer].translate(newX-oldX, newY-oldY);
    shapes[resizer].toFront();
  };

  var moveTools = function (selected) {
    // moveShrinker(selected);
    moveResizer(selected);
    moveDeleter(selected);
    showColorer();
  };

  var removeTool = function (tool) {
    measureShape(tool);
    oldX = sX;
    oldY = sY;
    shapes[tool].translate(Gone-oldX, Gone-oldY);
  };

  var removeTools = function (selected) {
    removeTool(resizer);
    removeTool(deleter);
    hideColorer();
  };


 
  // GLOBAL EVENTS 

  document.onmousedown = function (e) {
    e = e || window.event;
    wasDragged = false;
    if (!(isDrag)) {
	    if (isSelected === 'false' && selectedConn === 'false') {
          // Create a new shape if background clicked and no shapes selected
          findoffset("#holder");
          findposition(e);
          createShape(shapes.length,'rect',xpos,ypos,70,70);
		} else if (isTool) {
          if (deleter === isTool.id) {
            deleteShape(isSelected);
          } else if (resizer === isTool.id) {
            removeTools();
            moveResizer(isSelected);
	      }
        // else don't disappear
        } else if (isSelected !== 'false' ) {
          // Deselects shape if background clicked
          deselectShape(isSelected);
		} else if (selectedConn !== 'false') {
          deselectConn();
        } 
	  }
  };

  document.onmousemove = function (e) {
    wasDragged = true;
    e = e || window.event;
    if (isDrag) {
      removeTools();
      dragAndDrop(isDrag,e);
    } else if (isTool) {
      if (resizer === isTool.id) {
	      measureShape(isSelected);
        distanceTo(resizer,e);
	      changeShape(isSelected, xdist, ydist, 3);
        dragAndDrop(shapes[resizer],e);
      }
    } 
  };
    
  document.onmouseup = function () {
    isDrag = false;
    isTool = false;
    if (isSelected !== 'false' ) {
      moveTools(isSelected);
    }
  };

  
};
