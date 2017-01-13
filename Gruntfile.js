'use strict';


module.exports = function(grunt) {
var path = require('path');
// Project configuration.

grunt.initConfig({
// Before generating any new files, remove any previously-created files.

resourcesbinder: {
default_options: {
templates:{target:'target1/',sources:['a/**/*.ftl']},
development:grunt.option( "dev" )!==undefined
}



}
});
// Actually load this plugin's task(s).
grunt.loadTasks('tasks');
// These plugins provide necessary tasks.


grunt.loadNpmTasks('grunt-contrib-internal');
// Whenever the "test" task is run, first clean the "tmp" dir, then run this
// plugin's task(s), then test the result.
grunt.registerTask('default', ['bindep']);

};
