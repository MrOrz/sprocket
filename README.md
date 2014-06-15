# sprocket [![Travis CI][travis-image]][travis-url] [![Quality][codeclimate-image]][codeclimate-url] [![Coverage][coveralls-image]][coveralls-url] [![Dependencies][gemnasium-image]][gemnasium-url]
> Opinioned asset build tools. Inspired from ruby Sprocket and gulpjs.

[![Version][npm-image]][npm-url]


## Information

<table>
<tr> 
<td>Package</td><td>sprocket</td>
</tr>
<tr>
<td>Description</td>
<td>Opinioned asset build tools. Inspired from ruby Sprocket and gulpjs.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
<tr>
<td>Gulp Version</td>
<td>>= 3.5.0</td>
</tr>
</table>


## Why

In the nodejs community, there're many tools that try to solve the problem of assets management, while the ruby on rails community benifits greatly from the awesome gem, [sprocket](https://github.com/sstephenson/sprockets).

This project aims to be the `sprocket` in the nodejs community.

### [Help Wanted](https://github.com/tomchentw/sprocket/issues?labels=help+wanted&page=1&state=open)


## Project philosophy

### Develop in LiveScript
[LiveScript](http://livescript.net/) is a compile-to-js language, which provides us more robust way to write JavaScript.  
It also has great readibility and lots of syntax sugar just like you're writting python/ruby.

### Convention over Configuration
The sprocket based projects have three conventions:

* Seamless Integration (Optimization)
* Dependency Management (Injection)
* Language Extensions Support

Let's talk about them sequentially.

### Seamless Integration (Optimization)
Why seamless integration is so important? It makes developers **focus on the business logic**, don't care about optimization stuffs. It just works!

When you're ready to release a new version, `sprocket` automatically *minify and concact* them together for you. Thus provides best network performance under the hood.

### Dependency Management (Injection)
We always have to take good care about dependencies. While there's no standars yet and many tools like `require.js` or `commonjs`(`browserify`) are trying to solve this problem, sprocket use `require` *directive* to declare your depencency.

Under development, the html looks like you're using standard `<script></script>` and `<link>` tags, with dependencies **automatically resolved** and flattened dependency tree into a list.

### Language Extensions Support
Thanks to the "great" JavaScript! There're [brunch of languages](https://github.com/jashkenas/coffeescript/wiki/List-of-languages-that-compile-to-JS) that compiles to it. The same thing also happens to the stylesheets. (Does anyone have the link?)

If your team is in the transition state from one to another, say from JavaScript to LiveScript for readibility, or from pure CSS to Sass/LESS. It'll be really helpful to have a build tool that **treats them equally**.


## Example

See the [`examples`](https://github.com/tomchentw/sprocket/tree/master/examples) folder and a complete [`gulpfile.js`](https://github.com/tomchentw/sprocket/blob/master/examples/gulpfile.js) for a real word example.

### In Development

```shell
cd examples
npm install
gulp server
```
It will start a connect server on port 5000, as well as a livereload server on port 35729, automatically watch changes and recompile the aseets. Look at the compiled [`index.html`](https://github.com/tomchentw/sprocket/blob/master/examples/client/views/index.jade) to see how `javascript_include_tag` get transformed into the `<script ...>` tags.

### For Production

```shell
export NODE_ENV=production
gulp html
node index.js
```

It will compile and concat javascripts and stylesheets into one files with versioning support. You need to just run once `gulp html` before releasing your new version.


## Usage

It's simple and works just like rails does. Typical steps are:

1. create a [`application.js`](https://github.com/tomchentw/sprocket/blob/master/examples/client/javascripts/application.js) as an entry point
2. use [`javascriptIncludeTag`](#javascriptincludetagfilename--javascript_include_tagfilename) inside [`index.jade`](https://github.com/tomchentw/sprocket/blob/master/examples/client/views/index.jade#L19) to include `application.js` as script tag(s).
3. create a [`gulpfile.js`](https://github.com/tomchentw/sprocket/blob/master/examples/gulpfile.js#L6) to initialize a [`sprocket`](#sprocketcreatejavascriptsstream) instance and compile assets.
4. output the compiled assets and htmls to a folder and serve them in [`index.js`](https://github.com/tomchentw/sprocket/blob/master/examples/index.js#L14)


## API docs

We use [vinyl](https://github.com/wearefractal/vinyl) as an abstraction layer of File. So it'll play nicely with [gulpjs](http://gulpjs.com/)

First, open your `gulpfile` and require `sprocket`.

```javascript
var gulp = require('gulp');
var Sprocket = require('sprocket');
```

Then, create a `sprocket` instance:

```javascript
var sprocket = Sprocket();// create with conventions
```

The returned instance would have these methods:


### sprocket.registerHandler(ancestor, extnames, handler)

#### ancestor
Type: `String`

Currently only `javascripts` and `stylesheets` are allowed.

#### extnames
Type: `Array` of `String`s

The extension names that would compiled to the ancestor by `handler`. Say:

```javascript
ancestor = 'javascripts';
extnames = ['coffee'];
```

#### handler(environment, src, dest)
Type: `Function`

The handler would serve as a factory method to link the `src` stream to `dest`

```javascript
function livescriptHandler(environment, src, dest) {
  // Generated by LiveScript 1.2.0
  var gulpLivescript = require('gulp-livescript');
  src.pipe(gulpLivescript()).pipe(dest);
}
```


### sprocket.createJavascriptsStream()

Alias of `sprocket.createStream('javascripts')`


### sprocket.createStylesheetsStream()

Alias of `sprocket.createStream('stylesheets')`


### sprocket.createStream(ancestor)

Return a stream that would resolve dependencies and compile, lint and concat assets.

**Notice:** The dependencies resolution of directives **only limits** to the files you're passing in. i.e, sprocket DON'T use `fs` to read/find files. You have to `glob` in all the assets that would later be required.

```javascript
gulp.task('js', function(){
  return gulp.src([
    'client/javascripts/**/*.ls',
    'client/javascripts/**/*.js',
    'bower_components/**/*.js'
  ]).pipe(sprocket.createJavascriptsStream()
  ).pipe(gulp.dest('tmp/public'));
});
```

**Notice:** Sprocket directives are using relative path.

Say, you have `bower_components/jquery/dist/jquery.js` installded and use the above `js` task.
In your `application.js` header:

```javascript
//= require jquery/dist/jquery
```

If you want to require the precompiled assets located in `bower_components/angular/angular.min.js`:

```javascript
/*
 *= require angular/angular.min
 */
```

Please notice they're **different**. In the former one, sprocket will minify `jquery`. In contrast, sprocket will use minified version of `angularjs` and won't minify agian.

It's recommended to require minified libraries directly since it could save your time and get a better code for libraries who use *Google Closure Compiler* like `angularjs`.


#### ancestor
Type: `String`

Currently only value `javascripts` or `stylesheets` are allowed.


### sprocket.createViewHelpers(options)

This would return a [helper object](#helper-object) that can serve as `locals` in building htmls.

#### options
Type: `Object`

##### options.assetsPath
Type: `String`
Default: `/`

Prepend to the path of assets when generating `<script></script>` and `<link>` tags.

##### options.indent
Type: `String`
Default: `    `(four spaces)

Prepend to the tags so that it would indent correctly after comiplation.
Default value is four spaces since we use 2 space for indent and `html->(head/body)->tag` has 2 level of indent (2x2 = 4).


### helper object

A object returned by [sprocket.createViewHelpers(options)](#sprocketcreateviewhelpersoptions). You can freely extend/modify the helper object since these functions are bounded.

#### javascriptIncludeTag(filename) / javascript_include_tag(filename)
Type: `Function`

Yes, underscored versions are also provided.

It would create a (list of) `<script></script>` tag(s) so that the generated html could references to the right assets.

```jade
html
  head
    != javascriptIncludeTag("application")
```

##### filename
Type: `String`

**Notice:** Sprocket directives are using relative path.  

It should relative to your globbing paths.


#### stylesheetLinkTag(filename) / stylesheet_link_tag(filename)
Type: `Function`

It would create a (list of) `<link>` tag(s) so that the generated html could references to the right assets.

##### filename
Type: `String`

**Notice:** Sprocket directives are using relative path.  

It should relative to your globbing paths.

```jade
html
  head
    != stylesheet_link_tag("application")
```


## Contributing

[![devDependency Status][david-dm-image]][david-dm-url]

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request


[npm-image]: https://img.shields.io/npm/v/sprocket.svg
[npm-url]: https://www.npmjs.org/package/sprocket

[travis-image]: https://travis-ci.org/tomchentw/sprocket.svg?branch=master
[travis-url]: https://travis-ci.org/tomchentw/sprocket
[codeclimate-image]: https://img.shields.io/codeclimate/github/tomchentw/sprocket.svg
[codeclimate-url]: https://codeclimate.com/github/tomchentw/sprocket
[coveralls-image]: https://img.shields.io/coveralls/tomchentw/sprocket.svg
[coveralls-url]: https://coveralls.io/r/tomchentw/sprocket
[gemnasium-image]: https://gemnasium.com/tomchentw/sprocket.svg
[gemnasium-url]: https://gemnasium.com/tomchentw/sprocket
[david-dm-image]: https://david-dm.org/tomchentw/sprocket/dev-status.svg?theme=shields.io
[david-dm-url]: https://david-dm.org/tomchentw/sprocket#info=devDependencies
