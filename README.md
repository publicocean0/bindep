# Bindep
It is a grunt tool for binding bower or local dependencies to your source code.
It introduces few little concepts for its working:
   <ul>
 <li> tag-block: is a special block you can insert in source code permitting to define how to add the bower components.</li> 
 <li> template file: it is a text file where you can put inside tag-blocks for preprocessing.You have to set in your templates option the file extension for every template type.</li>
 <li> attachment: it is a file present in a bower component can be associated to the source code. Every bower component can contains a main attachment for each file type. Attachments can be associated to the source in 2 different way:
    <ul>
  <li> inline: attachment is injected in the source with a configurable way</li>
  <li> linked: attachment is saved in a target dir and a link is injected in source code in a configurable way.</li>
     </ul>
 You can specify other 2 sub way :
   <ul>
  <li> aggregated: all attachmnts are processed after the aggregation</li>
  <li>separated:  all attachments are procesed one-by-one.</li>
   </ul>
   In development mode they are linked separated.</li>
 <li> minimizer:a attachment can be minified/uglified.In development mode is disabled.</li>
 <li> resource: is a text or a binary file present in a bower component but has no direct reference in the template.</li>
 <li> dependency: a bower component can use many bower component as dependencies. You can also define also local dependencies defined internally in your project. </li>
 <li> module: a bower component can contains many modules (or no one). Internal modules are necessary when you design your software project in way you can load additional features in a component,but it is not a must. For each module you can add attachments,resources,dependencies.You can also define what modules require this module.In the template you can specify what modules to embed in the project </li>
<li> converter: is a handler permitting to convert a file type in a attachment. Actually is setup just the less converter permitting to convert less files in css files,but you can add others in options.</li>
 <li> preprocessor: bindep can use a additional preprocessor for attachments passing directly options in your tag-block.The preprocessor syntax you can embed in you attachments can be find [here](https://github.com/dcodeIO/Preprocessor.js) </li>
 <li> defaults:you can set the default behavior for preprocessor (context passed),modules used,submodules used in the dependencies actived. </li>
    </ul>
Bindep is used normaly by web developers and the default setting handles css,js,less as attachmnents.You can modify it or extend it for supporting other attachments-type,behaviours,target folder,... You can set your converter for example for sass files.   
it is born (original name was grunt-resourcesbinder) for my needs using a high modularity level in my projects.Bindep for working extends the bower json definition with other properties.Bottom you can see a example about the bower.json  containing new properties:
```js
{
  "name":"example",
  "main":["core.js","core.css"],
  "resources": { // you can remove if empty
  "mp3":"audio1.mp3",
  "font":"font/*"
  },
  "defaults":{ // you can remove if empty
"preprocessor":{"c":4},//default context for preprocessor(if you active it)
"submodules":{"filedetector":["image"]},	//submodules used in the dependencies
"modules":['preview'] // default modules used in the current bower component
},
  "modules":{ // you can remove if empty
   
   "preview":{
   "main":["js/preview.js"],
   "dependencies":{ "moment":"^1.0.0" },
   "resources":{
   "mp3":["audio2.mp3","audio3,mp3"],
   "require":[....]
   }
   },
   
     "dependencies":{ "jquery":"^3.0.0" }
   
   }
```
Bindep is conversative so you can use old bowers components if they don't need additional info. For example:
```
{
  "name": "bootstrap",
  ....
  "main": [
    "less/bootstrap.less",
    "dist/js/bootstrap.js"
  ],
 ....
  "dependencies": {
    "jquery": "1.9.1 - 3"
  }
}
```
## Getting Started
Install the module with [npm](https://npmjs.org): 
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
  --> 
</head>
<body>
  <!-- @bind:js linked separated uglified 
       jquery
       moment
       
  -->
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
- preprocess is optional and permits to preprocess the source files passing options. 

Bottom a example about filtering and about modules setting.
```
<!-- @bind:js inline aggregated uglified
			html5shiv
			respond (res1,res2)
 			frontend-miscellaneous[=$ "browser-extension.js"]

-->
```
Bottom you can see a example in which you active the preprocessor for the component 'example'  and you pass to it 3 properties
```
<!-- @bind:js inline aggregated uglified
            example2 preprocess (mode:1  platform: "mobile" withColours: true )
-->  
```
The optional parameters search and nodeps might be used just if necessary , for example where a external bower  package contains different versions in the same package  or optional dependencies. 

The sub dependencies of the package are automatically injected if 'nodeps' parameter is not set.
The filter is optional and permits to filter the resources of that package.
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

Bindep uses grunt. You have to insert a Gruntfile.js file in your root project folder.
In this file you set you setup your project configuration.
Essentially you can set:
- paths where bindep reads template files
- local dependencies present in your projects, if you need
- development:if true minimization and aggregations of attachments is skipped
- attachments: folders where bindep searchs files, target folder where bindep put the final output,the type of replament you want
- resources: for each resource type you define the folder where bind save the final output
You can pass other options not usually necessary as additional converters (it is present just less converter actually),a custom package handler for fixing errors in external bower component,.....
A gruntfile.js example:
```js
module.exports = function(grunt) {
var project=(grunt.option( "project" )==undefined)?'':grunt.option( "project" );
grunt.initConfig({
// Before generating any new files, remove any previously-created files.

bindep: {
default_options: {
localDependencies:[{
	name:"fileutils",
	main:"src/main/js/fileUtils.js"
    },
    {
    name:"layout",
    main:"src/main/css/layout.css"
    }
       
],
packageHandler:function(n,mains,deps){// fix qtip2 error
if (n=='qtip2') {

	mains.push('jquery.qtip.css');
}else if (n=='typeahead.js') {

	mains.push('bloodhound.js');
}

},
templates:[{target:'target/'+project+'/WEB-INF/ftl/',sources:['src/main/ftl/**/*.ftl']},{target:'target/'+project+'/WEB-INF/js/',sources:['src/main/js/templates/**/*.js'],linksOnDebug:false}],
development:grunt.option( "dev" )!==undefined,
shortLinks:true,

attachments:{
js: {replacement:{link:'<script src="<@utils.url\'/js/{{file}}\'/>"></script>',inline:'<script>{{source}}</script>'},target:'target/'+project+'/WEB-INF/js/'},
css:{replacement:{link:'<link rel="stylesheet" href="<@utils.url\'/css/{{file}}\'/>"  media="screen" />',inline:'<style>{{source}}</style>'},target:'target/'+project+'/WEB-INF/css/'}
},
resources:{
mp3:{target:'target/'+project+'/WEB-INF/mp3/'},
img:{target:'target/'+project+'/WEB-INF/img/'},
font:{target:'target/'+project+'/WEB-INF/fonts/'}
}

}
}
});

	grunt.loadNpmTasks('bindep');
	// Default task(s).
	grunt.registerTask('default', ['bindep' ]);

};

```
In console you can type 
```
grunt -dev
```
Pay attention to pass -dev, because the minification can take time. 


## Bower Overrides
To override a property, or lack of, in one of your dependency's `bower.json` file, you may specify an `overrides` object in your own `bower.json`.

## Maven
If you use maven, for building a web project , you can add the plugin  [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin)  permitting to call bindep before creating a war. A example about configuration is :
```xml
		<plugin>
						<groupId>com.github.eirslett</groupId>
						<artifactId>frontend-maven-plugin</artifactId>
						<version>1.0</version>
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


## Contributing
This package is used personally, but it might be extended with new features.


## License
Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.

## To do
Not all features implemented are tested so much. I will test them in the time using them in the real projects. Custom preprocessing or  bower dependencies recalling submodules(in deep levels) are features not yet tested in projects. 



