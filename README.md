# Angular Gulp Skeleton

This repository is an Angular skeleton with Gulp as project builder/runner task.

It uses :

* AngularJs
* Angular UI Router
* Twitter Bootstrap (Full CSS or Sass)
* Font Awesome

## Installation

Clone the repository and remove the .git folder :

```
git clone --depth=1 https://github.com/jbouzekri/angular-gulp-skeleton
cd angular-gulp-skeleton
rm -rf .git
```

Install gulp globally : [Official documentation](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

```
npm install -g gulp
```

Install dependencies using npm and bower. The `npm install` command will run `bower install` too :

```
npm install
```

## Structure

The project uses `gulp` to build and `bower` for frontend dependencies.

Your app source files will be stored in the `src/` folder. When building and serving, all files will be processed and copied to the automatically created `dist/` folder.

Some parameters of the gulp script can be configured with the `config.json` file.

## Documentation

### Building your sources

`gulp build [--env=prod]`

* It copies all files from `src/` to `dist/` folder
* With sass enabled, it processes sass files too
* When used with prod env parameters, it applies all production transformations (minification, concatenation, ...)

### Serving your project

`gulp serve [--env=prod] [--watch [--no-livereload] [--tdd]]`

* This command build (like the previous command) files then serves them on `http://localhost:8888`
* `--watch` moves changed files to `dist/` folder and launches live reload (it cannot be used with `--env=prod` parameter)
* `--watch --no-livereload` same as the before but without live reload
* `--watch --tdd` same as before but lanches test units at each changes

### Testing your project

`gulp test:unit`

* Run unit tests

`gulp test:e2e [--env=prod]`

* Run functional tests. The site should be available on localhost:8888 before running this command.

_Note : Check the value of the seleniumJar in test/protractor.conf.js and verify that the version is the same that was downloaded._

### Configuration

Configuration is located in :

* `test/karma.conf.js`  : test unit configuration
* `ŧest/protractor.conf.js` : functional test configuration
* `config.json` : task general configuration

For Karma and Protractor, go to their respective documentation.

In `config.json`, you can configure :

* `env` : default environment
* `use_sass` : enable the use of sass or css
* `bases` : base folders
* `path` : paths with wildcards to find scripts, stylesheets, fonts, images, ...
* `serve` : serve server host and port
