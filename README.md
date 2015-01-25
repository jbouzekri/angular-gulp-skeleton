Angular Gulp Skeleton
=====================

This repository is an Angular skeleton with Gulp as project builder/runner task.

It uses :

* AngularJs
* Twitter Bootstrap
* Font Awesome

Installation
------------

Clone the repository and remove the .git folder :

```
git clone --depth=1 https://github.com/jbouzekri/angular-gulp-skeleton
cd angular-gulp-skeleton
rm -rf .git
```

Install dependencies using npm and bower. The `npm install` command will run `bower install` too :

```
npm install
```

And of course install gulp globally too : [Official documentation](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

Structure
---------

The project uses gulp to build and bower for frontend dependencies.

Your app source files will be stored in the `src/` folder.

The gulp script can be configured with the `config.json` file.

Running
------

* `gulp build` : copy all src files in dist folder
* `gulp build --env=prod` : copy all src files in dist folder and process them (minify, ...)
* `gulp serve` : Build (without processing) and serve files (default : localhost:8888)
* `gulp serve --watch` : Build (without processing) then serve them while watching for change (default : localhost:8888). Livereload enabled.
* `gulp serve --watch --no-livereload` : Same as before but without the livereload
* `gulp serve --env=prod` : Build and process files then serve them (default : localhost:8888)
* `gulp serve --watch --tdd`
