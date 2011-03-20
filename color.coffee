$ ->
  
  window.Color = Backbone.Model.extend
    defaults:
      'name': ''
      'color': '#666'
      'raphael': null
  
  window.ColorList = Backbone.Collection.extend
    model: Color
    localStorage: new Store("colors")

  window.Colors = new ColorList

  window.ColorView = Backbone.View.extend
    template: _.template($('#color-template').html())
    initialize: ->
      $("#palette").append(this.render().el)
    render: ->
      $(this.el).html(this.template(this.model.toJSON()))
      return this


  window.ColorPickerView = Backbone.View.extend
    el: $("#color_picker")
    events:
      'click .create': 'create'
    create: ->
      color = Colors.create
        name: this.$('.name').val()
        color: this.$('.color').val()
      view = new ColorView {model: color}

  window.ColorPicker = new ColorPickerView

