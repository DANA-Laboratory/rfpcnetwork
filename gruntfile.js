module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-env');
    grunt.initConfig({
        env: {
            test: { NODE_ENV: 'TEST' },
            coverage: { NODE_ENV: 'COVERAGE' }
        },
        simplemocha: {
            options: {
                ui: 'bdd',
                reporter: 'spec',
            },
            all: { src: ['test/**/*.js'] },
        },
        mocha_istanbul: {
            coverage: {
                src: 'test', // a folder works nicely
            },
        },
    });
    grunt.registerTask('test', [ 'env:test', 'simplemocha' ]);
    grunt.registerTask('coverage', [ 'env:coverage', 'mocha_istanbul:coverage' ]);
};
