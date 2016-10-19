module.exports = function(grunt) {

  grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            js: {
                options: {
                  separator: '\n',
                },
                src: ['<%= pkg.javascript.jsDir %>/**/*'],
                dest: '<%= pkg.javascript.jsConcatFile %>',
            },
            lib: {
                options: {
                  separator: '\n',
                },
                src: ['<%= pkg.javascript.jsLib %>/**/*'],
                dest: '<%= pkg.javascript.jsLibConcatFile %>',
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                sourceMap: '<%= pkg.javascript.sourceMap %>',
                preserveComments: false
            },
            js:{
                files: {
                    '<%= pkg.javascript.jsMinFile %>': ['<%= pkg.javascript.jsConcatFile %>']
                }
            }
        }
	})

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['concat:js', 'uglify:js', 'concat:lib']);
};
