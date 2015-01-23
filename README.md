Angular Gulp Skeleton
=====================

This repository is an angular skeleton with gulp as task runner.

Structure
---------

The project use gulp to build and bower for frontend dependencies.

Your app source files will be stored in the `src/` folder.

The gulp script can be configured with the `config.json` file.

The loaded libraries are :

* angular
* bootstrap

Running
------

* `gulp serve` : serve file in localhost:8888 directly from the src folder
* `gulp build --env=prod` : build production files in dist folder
* `gulp serve --env=prod` : serve file in localhost:8888 directly from the dist folder (run the previous command first)
