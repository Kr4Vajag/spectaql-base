"use strict";var _path = _interopRequireDefault(require("path"));
var _sass = _interopRequireDefault(require("sass"));function _interopRequireDefault(e) {return e && e.__esModule ? e : { default: e };}


module.exports = function (grunt, options, spectaqlData) {

  let schemaFiles = options.specData.introspection.schemaFile;
  if (!schemaFiles) {
    schemaFiles = [];
  } else if (Array.isArray(schemaFiles)) {


    schemaFiles = [...schemaFiles];
  } else {
    schemaFiles = [schemaFiles];
  }


  schemaFiles.push(options.specFile);

  return {

    sass: {
      options: {
        implementation: _sass.default,
        functions: {

          'getLogoMaxHeightPx()': () => {
            return options.logoMaxHeightPx ?
            _sass.default.SassNumber(options.logoMaxHeightPx, 'px') :
            _sass.default.sassFalse;
          },
          'getLogoHeightPx()': () => {
            return options.logoHeightPx ?
            _sass.default.SassNumber(options.logoHeightPx, 'px') :
            _sass.default.sassFalse;
          },
          'getScrollOffset()': () => {
            return options.scrollPaddingTopPx ?
            _sass.default.SassNumber(options.scrollPaddingTopPx, 'px') :
            _sass.default.sassFalse;
          }
        }
      },
      main: {
        files: {
          [_path.default.resolve(options.cacheDir, 'stylesheets/main.css')]:
          _path.default.resolve(options.cacheDir, 'stylesheets/main.scss')
        }
      }
    },


    concat: {
      js: {
        src: [options.cacheDir + '/javascripts/**/*.js'],
        dest: options.cacheDir + '/javascripts/spectaql.js'
      },
      css: {
        src: [
        options.cacheDir + '/stylesheets/main.css',
        options.cacheDir + '/stylesheets/**/*.css'],

        dest: options.cacheDir + '/stylesheets/spectaql.css'
      }
    },


    uglify: {
      js: {
        src: options.cacheDir + '/javascripts/spectaql.js',
        dest: options.cacheDir + '/javascripts/spectaql.min.js'
      }
    },


    cssmin: {
      css: {
        expand: true,
        cwd: options.cacheDir + '/stylesheets',
        src: ['spectaql.css'],
        dest: options.cacheDir + '/stylesheets',
        ext: '.min.css'
      }
    },





    'compile-handlebars': {
      compile: {
        files: [
        {
          src:
          options.cacheDir +
          '/views/' + (
          options.embeddable ? 'embedded.hbs' : 'main.hbs'),
          dest: options.cacheDir + '/' + options.targetFile
        }],

        templateData: spectaqlData,
        partials: options.cacheDir + '/views/partials/**/*.hbs',
        helpers: [

        options.appDir + '/themes/default/helpers/**/*.js',


        options.themeDir + '/helpers/**/*.js']

      }
    },


    prettify: {
      options: {




        preserve_newlines: false,
        unformatted: ['code', 'pre']
      },
      index: {
        src: options.cacheDir + '/' + options.targetFile,
        dest: options.cacheDir + '/' + options.targetFile
      }
    },



    embed: {
      options: {
        threshold: '1024KB'

      },
      index: {
        src: options.cacheDir + '/' + options.targetFile,
        dest: options.cacheDir + '/' + options.targetFile
      }
    },


    clean: {
      options: {
        force: true
      },

      cache: [options.cacheDir],
      css: [options.cacheDir + '/stylesheets/**/*.css'],
      js: [options.cacheDir + '/javascripts/**/*.js'],
      html: [options.cacheDir + '/**/*.html'],

      views: [options.cacheDir + '/views/**/*.hbs'],

      helpers: [options.cacheDir + '/helpers/**/*.js']
    },


    connect: {
      server: {
        options: {
          hostname: '*',
          port: options.port,
          base: options.targetDir,
          livereload: options.developmentModeLive ? options.portLive : false
        }
      }
    },



    copy: {

      'default-theme-to-cache': {
        expand: true,
        cwd: options.defaultThemeDir,
        src: '*/**',
        dest: options.cacheDir
      },
      'overlay-custom-theme-to-cache': {
        expand: true,
        cwd: options.themeDir,
        src: ['**/*', '!helpers/**/*'],
        dest: options.cacheDir
      },
      'logo-to-target': {
        src: options.logoFile,
        dest: options.targetDir + '/images/' + options.logoFileTargetName
      },
      'favicon-to-target': {
        src: options.faviconFile,
        dest: options.targetDir + '/images/' + options.faviconFileTargetName
      },
      'css-to-target': {
        expand: true,
        cwd: options.cacheDir,
        src: 'stylesheets/*.min.css',
        dest: options.targetDir
      },
      'js-to-target': {
        expand: true,
        cwd: options.cacheDir,
        src: 'javascripts/*.min.js',
        dest: options.targetDir
      },
      'html-to-target': {
        src: options.cacheDir + '/' + options.targetFile,
        dest: options.targetDir + '/' + options.targetFile
      }
    },


    watch: {
      options: {
        livereload: options.developmentModeLive ? options.portLive : false,
        spawn: false
      },
      js: {
        files: [options.themeDir + '/javascripts/**/*.js'],
        tasks: ['javascripts']
      },
      css: {
        files: [options.themeDir + '/stylesheets/**/*.scss'],
        tasks: ['stylesheets']
      },
      templates: {
        files: [
        options.themeDir + '/views/**/*.hbs',
        options.themeDir + '/helpers/**/*.js',
        options.themeDir + '/lib/**/*.js'],

        tasks: ['templates']
      },
      inputs: {
        files: schemaFiles,
        tasks: ['default']
      }
    }
  };
};