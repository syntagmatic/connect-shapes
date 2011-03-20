var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
$(function() {
  window.raphael = Raphael("holder", 500, 500);
  window.Rect = Backbone.Model.extend({
    defaults: {
      'x': 100,
      'y': 100,
      'width': 50,
      'height': 50,
      'r': 5,
      'fill': '#6b6',
      'fill-opacity': 0.7,
      'stroke': '#666',
      'stroke-width': 1,
      'stroke-opacity': 1,
      'cursor': 'auto'
    }
  });
  window.RectList = Backbone.Collection.extend({
    model: Rect,
    localStorage: new Store("rects")
  });
  window.Rects = new RectList;
  window.RectView = Backbone.View.extend({
    events: {
      'click this': 'select'
    },
    initialize: function() {
      this.model.view = this;
      this.object = raphael.rect().attr(this.model.toJSON());
      return this.object.click(__bind(function() {
        return this.select(this);
      }, this));
    },
    alter: function(key, value) {
      var attr;
      attr = {};
      attr[key] = value;
      this.model.set(attr);
      this.object.attr(attr);
      return this;
    },
    select: function(that) {
      return Dashboard.select(that.model);
    }
  });
  window.DashboardView = Backbone.View.extend({
    el: $("#dashboard"),
    events: {
      'click .create': 'create'
    },
    create: function() {
      var i, rect, view, _results;
      _results = [];
      for (i = 0; i <= 3; i++) {
        rect = Rects.create({
          'x': 500 * Math.random(),
          'y': 500 * Math.random(),
          'width': 300 * Math.random(),
          'height': 300 * Math.random(),
          'r': 150 * Math.random(),
          'fill': Raphael.getColor(),
          'fill-opacity': Math.random(),
          'stroke': Raphael.getColor(),
          'stroke-width': 8 * Math.random(),
          'stroke-opacity': Math.random(),
          'cursor': 'pointer'
        });
        _results.push(view = new RectView({
          model: rect
        }));
      }
      return _results;
    },
    inputTemplate: _.template($('#input-element').html()),
    sliderTemplate: _.template($('#slider-element').html()),
    select: function(model) {
      var attrs, html, key, max, old, step, value;
      old = this.selected;
      this.selected = model;
      attrs = model.toJSON();
      html = "";
      for (key in attrs) {
        value = attrs[key];
        if (typeof value === 'number') {
          if (key === 'fill-opacity' || key === 'stroke-opacity') {
            max = 1;
            step = 0.02;
          } else if (key === 'r') {
            max = _([attrs.width, attrs.height]).max() / 2;
            step = 0.5;
          } else if (key === 'stroke-width') {
            max = _([attrs.width, attrs.height]).max();
            step = 0.5;
          } else {
            max = 500;
            step = 1;
          }
          html += this.sliderTemplate({
            key: key,
            value: value,
            max: max,
            step: step
          });
        } else {
          html += this.inputTemplate({
            key: key,
            value: value
          });
        }
      }
      this.$('.props').html(html);
      this.$('.props input[type=text]').change(function() {
        key = $(this).attr('name');
        value = $(this).val();
        return model.view.alter(key, value);
      });
      return this.$('.props input[type=range]').change(function() {
        key = $(this).attr('name');
        value = parseFloat($(this).val());
        return model.view.alter(key, value);
      });
    }
  });
  return window.Dashboard = new DashboardView;
});