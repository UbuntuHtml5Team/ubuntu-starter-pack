'use strict';

// Import a node.js dependency
var $ = require('jquery');
// Import a local module
var Messages = require('./messages');

$(function () {
  $('.introduction-title').text(Messages.WELCOME_MESSAGE).fadeIn();
});
