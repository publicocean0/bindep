# Bindep
> It is a grunt tool for binding bower or local dependencies to your source code.
It introduces few little concepts for its working:
   <ul>
 1. tag-block: is a special block you can insert in source code permitting to define how to add the bower components. 
 2. template file: it is a text file where you can put inside particolar tags for preprocessing.You have to set in your templates option the file extension for every template type.
 3. attachment: it is a file present in a bower component can be associated to the source code. Every bower component can contains a main attachment for each file type. Attachments can be associated to the source in 2 different way:
    <ul>
  <li> inline: attachment is injected in the source with a configurable way</li>
  <li> linked: attachment is saved in a target dir and a link is injected in source code in a configurable way.</li>
     </ul>
 You can specify other 2 sub way :
   <ul>
  <li> aggregated: all attachmnts are processed after the aggregation</li>
  <li>separated:  all attachments are procesed one-by-one.</li>
   </ul>
   In development mode they are linked separated.
 4. minimizer:a attachment can be minified/uglified.In development mode is disabled.
 5. resource: is a text or a binary file present in a bower component but has no direct reference in the source.
 6. dependency: a bower component can use many bower component as dependencies. You can also define also local dependencies defined internally in your project. 
 7. module: a bower component can contains many modules. For each module you can add attachments,resources,dependencies.You can also define what modules require this module. 
 8. converter: is a handler permitting to convert a file type in a attachment. By default is setup just less converter permitting to convert less files in css files.
 9. preprocessor: bindep can use a additional preprocessor for attachments passing directly options in your tag-block.The preprocessor syntax you can embed in you attachments can be find [here](https://github.com/dcodeIO/Preprocessor.js) 
 10. defaults:you can set the default behavior for preprocessor (context passed),modules used,submodules used in the dependencies actived. 
    </ul>
Bindep is used normaly by web developers and the default setting handles css,js,less as attachmnents.You can modify it or extend it for supporting other attachments-type,behaviours,target folder,... You can set your converter for example for sass files.   
it is born (original name was grunt-resourcesbinder) for my needs using a high modularity level in my projects.Bindep for working extends the bower json definition with other properties.Bottom you can see a example :
```js
  "resources": {
  "mp3":"mp3/*",
  "font":"font/*"
  },
  "defaults":{
"preprocessor":{"c":4},//default context for preprocessor(if you active it)
"submodules":{"filedetector":["image"]},	//submodules used in the dependencies
"modules":['preview'] // default modules used in the current bower component
},
  "modules":{
   "preview":{
   "main":["js/linkPreviewInterceptor.js"],
   "dependencies":{},
   "resources":{}
   }
   }
```


## Getting Started
>Install the module with [npm](https://npmjs.org): 
```bash
$ npm install --save bindep
```
Install your [bower](http://bower.io) dependencies (if you haven't already):
```bash
$ bower install --save jquery
```
Insert placeholders in your code where your dependencies will be injected:
```html
<html>
<head>
  <!-- @bind:css linked separated uglified 
       jquery
       

  --&less;

</head>
<body>
  <!-- @bind:js linked separated uglified 
       jquery
       moment
  --&less;
</body>
</html>
```
The complete syntax is 
```code
@bind:[<filetype>] <linked|inline>  <aggregated|separated>  [minified|uglified]
```
The options mean:
linked: it replace the link if the corrispondent dependency using the link replacement,
inline: it replace directly the all sources mentioned using source replament,
aggregated: it aggregate all dependencies,
separated : it handles each dependency separately.
In the following lines of this block you must insert all the top dependencies (one for every line) with this syntax:
```code

<package_name><modules><search> <nodeps> <nounique> <preprocess ( [<name>:<value>]* )>
```
where modules is optional and has this syntax :
```code
<( <module1> , <module2> , ...)>
```
where search is optional and has this syntax :
```code
<[<op> "<[filter]>" ]>
```
where op comparator is :

```code
	== : equals
	!= : not equals
	=^ : starts with
	!^ : not starts with
	=$ : ends with
	!$ : not ends with
	=? : contains 
	!? : not contains
	=~ : match the filter
	!~ : not match the filter

```
where 
- nodeps is optional and force to not inject the dependencies 
- nounique is optional and permits to repeat the same package in the template.
- preprocess is optional and permits to preprocess the source files passing options

The optional parameters search and nodeps might be used just if necessary , for example where a external bower  package contains different versions in the same package  or optional dependencies. 

The sub dependencies of the package are automatically injected if 'nodeps' parameter is set.
The filter is optional and permits to filter the resources of that package.
Set the the right options for your project :
```js
development : it adds dev-dependencies , forces the setting of  every block as 'linked  separated'
localDependencies: you can add dependencies not deployed in bower system , but just locally in your project,
templates:{target:<path where to place the final html or frontend templates(like tpl,velocity,freemarker,...)>,sources:<array of html or frontend templates files>},

attachments:{
<file extension>: {replacement:{link:<text to replace with {{file}} injection> ,inline:<text to replace with {{source}} injection>},target:<final directory where to place the resources>},
.......
}.
```
The default setting is :
```js
{
separator: grunt.util.linefeed,
development: false, 
localDependencies:{},
packageHandler:undefined,// handler for fix eventually errors in external bower packages.
minifyHandlers:// internal handlers can be overriden
js:minifyJS,
css:minifyCSS
},
development:false,// if true the block will be forced to bindind in mapped way , disabling also the minification.
exclude:[],  
templates:{target:'target/',sources:[]},
attachments:{
js: {replacement:{link:'<script src="/js/{{file}}"></script>',inline:'<script>{{source}}</script>'},target:'js/'},
css:{replacement:{link:'<link rel="stylesheet" href="/css/{{file}}" />',inline:'<style><{{source}}</style>'},target:'css/'}
},
resources:{

}


}
```
Let `bind` work its magic:




```html
<html>
<head>
 <link href="/css/jquery.css">

</head>
<body>
  <script src="/js/jquery.js"></script>
  <script src="/js/moment.js"></script>
</body>
</html>
```


## Build Chain Integration



### [Grunt](http://gruntjs.com)

See [`bindep`](https://github.com/publicocean0/bindep).




## Bower Overrides
To override a property, or lack of, in one of your dependency's `bower.json` file, you may specify an `overrides` object in your own `bower.json`.

## Maven
You can integrate this plugin with maven using [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin). A example of configuration is :
```xml
		<plugin>
						<groupId>com.github.eirslett</groupId>
						<artifactId>frontend-maven-plugin</artifactId>
						<version>0.0.23</version>
						<executions>
							<execution>
								<id>npm install</id>
								<goals>
									<goal>npm</goal>
								</goals>
								<configuration>
									<arguments>install</arguments>
								</configuration>
							</execution>
							<execution>
								<id>bower install</id>
								<goals>
									<goal>bower</goal>
								</goals>
								<configuration>
									<arguments>install</arguments>
								</configuration>
							</execution>
							<execution>
								<id>grunt build</id>
								<goals>
									<goal>grunt</goal>
								</goals>
								<configuration>
									<arguments>--no-color</arguments>
									<arguments>--project=${project.artifactId}</arguments>
									<arguments>--dev</arguments>
								</configuration>
							</execution>
						</executions>
					</plugin>
```
using this Gruntfile.js example:
```js
module.exports = function(grunt) {
var project=(grunt.option( "project" )==undefined)?'':grunt.option( "project" );
grunt.initConfig({
// Before generating any new files, remove any previously-created files.

bindep: {
default_options: {
templates:{target:'target/'+project+'/WEB-INF/ftl/',sources:['src/main/ftl/**/*.ftl']},
development:grunt.option( "dev" )!==undefined,
attachments:{
js: {replacement:{link:'<script src="<@utils.url\'/js/{{file}}\'/>"></script>',inline:'<script>{{source}}</script>'},target:'target/'+project+'/WEB-INF/js/'},
css:{replacement:{link:'<link rel="stylesheet" href="<@utils.url\'/css/{{file}}\'/>" rel="stylesheet" media="screen" />',inline:'<style><{{source}}</style>'},target:'target/'+project+'/WEB-INF/css/'}
},
resources:{img:{target:"img/",global:false}
}



}
});
	grunt.loadNpmTasks('bindep');
	// Default task(s).
	grunt.registerTask('default', ['bindep' ]);

};
```

## Contributing
This package is used personally, but it might be extended with new features.


## License
Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.

## To do
Not all features implemented are tested so much. I will test them in the time using them in the real projects.



