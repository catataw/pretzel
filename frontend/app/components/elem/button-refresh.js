import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  tagName: 'span',
  // attributes
  click: function() {
    this.sendAction('onClick');
  },
  // classes
  classNames: ['pull-right']
  // actions
});
