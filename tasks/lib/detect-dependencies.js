'use strict';
var $ = {
_: require('lodash'),
fs: require('fs'),
lodash: require('lodash'),
path: require('path'),
glob: require('glob')
};
/**
* Detect dependencies of the components from `bower.json`.
*
* @param {object} config the global configuration object.
* @return {object} config
*/






function load(config) {
var allDependencies = {};

$._.assign(allDependencies, config.get('bower.json').dependencies);

if (config.get('dev-dependencies')) {
$._.assign(allDependencies, config.get('bower.json').devDependencies);
}

var lo=config.get('local-dependencies')||[];
var loc={};
for(var l=0;l<lo.length;l++){
	var n=lo[l].name;
if (allDependencies[n]!==undefined) throw new Error('the package name '+n+' in local dependencies is already defined in bower.json');
   loc[n]=lo[l].version || 'local';
}



var gdeps=config.get('global-dependencies');

$._.each(allDependencies, gatherInfo(false,config));
$._.each(loc, gatherInfo(true,config));

var keys=gdeps.keys();
for(var e=0;e<keys.length;e++) {
	var k=keys[e];
	var d=gdeps.get(k);
	var name=d.name;
	if (k!==name){
	console.log('Warning: the package '+k+' has a package name['+name+'] not correct in its bower.json!');
	d.name=k;
	}

}


	
var sorted={};
config.get('detectable-file-types').
forEach(function (fileType) {

sorted[fileType] = prioritizeDependencies(config, '.' + fileType);

});
config.set('global-dependencies-sorted',sorted);
}
/**
* Find the component's JSON configuration file.
*
* @param {object} config the global configuration object
* @param {string} component the name of the component to dig for
* @return {object} the component's config file
*/
function findComponentConfigFile(config, component) {
var componentConfigFile;
['bower.json', '.bower.json', 'component.json', 'package.json'].
forEach(function (configFile) {
configFile = $.path.join(config.get('bower-directory'), component, configFile);

if (!$._.isObject(componentConfigFile) && $.fs.existsSync(configFile)) {

	
componentConfigFile = JSON.parse($.fs.readFileSync(configFile));
}
});
return componentConfigFile;
}

function findComponentConfigLocal(config, component) {

var componentConfig;
config.get('local-dependencies').
forEach(function (c) { 
if (componentConfig==undefined && c.name==component) {componentConfig=c; }
});
return componentConfig;
}


function retrieveFiles(value,cwd,ab){
var filePaths=[];
if ($._.isString(value)) {
// start by looking for what every component should have: config.main
filePaths = [value];
} else if ($._.isArray(value)) {
filePaths = value; 
} 

var ret= $._.unique(filePaths.reduce(function (acc, filePath) {
acc = acc.concat(
$.glob.sync(filePath, { cwd: cwd, root: '/' ,nodir:true})
.map(function (path) {
return (ab)?$.path.join(cwd, path):path;
})
);
return acc;
}, []));

return ret;	
	
}

function findModules(local,config, component, componentConfigFile,cwd) {
var modules={};
var m=componentConfigFile.modules;
var mm;
for (var k in m){
var mm=m[k];

var mains = findFiles(mm,cwd,'main');
if (mains.length==0) throw new Error("cannot find a valid path for module "+component+"."+k);


modules[k]={resources:findFiles(mm,cwd,'resources',false),name:k,main:mains,dependencies:{},require:findRequire(componentConfigFile,k,mm)}	
if (mm.dependencies) {
modules[k].dependencies = mm.dependencies;
$._.each(mm.dependencies, gatherInfo(local,config));
}
}

return modules;

}

function findFiles(componentConfigFile,cwd,prop,ab) {


var value=componentConfigFile[prop];

 if (value instanceof Array||$._.isString(value)){
	return retrieveFiles(value,cwd,ab);
} else if (typeof(value)=='object') {
	  var obj={};
  for (var k in value){
	obj[k]=  retrieveFiles(value[k],cwd,ab);
  }
  return obj;	

} else return [];

}

function findRequire(componentConfigFile,k,module) {
var require=module.require||[];
if ($._.isString(require)) require=[require];
var m=componentConfigFile.modules || {};

 if (require instanceof Array){
	for(var i=0;i<require.length;i++){
	var r=require[i];
	if (r && m[r]==undefined)	throw new Error("module "+componentConfigFile.name+"."+k+" requires a inexistent module (" +r+") ");
		
	}
    return require;

} else throw "invalid require format in module "+sub;

}


function findDefaultMainFiles(local,config, component, componentConfigFile,cwd) {
var filePaths={};
config.get('detectable-file-types')
.forEach(function (type) {
var f = $.path.join(local?config.get('cwd'):config.get('bower-directory'), component, componentConfigFile.name + '.' + type);
if ($.fs.existsSync(f)) {
filePaths.push(componentConfigFile.name + '.' + type);
}
});

return retrieveFiles(filePaths,cwd,true);
}
/**
* Store the information our prioritizer will need to determine rank.
*
* @param {object} config the global configuration object
* @return {function} the iterator function, called on every component
*/
function gatherInfo(local,config) {
/**
* The iterator function, which is called on each component.
*
* @param {string} version the version of the component
* @param {string} component the name of the component
* @return {undefined}
*/ 
return function (version, component) {
var dep = config.get('global-dependencies').get(component) || {
main: '',
type: '',
name: '',
dependencies: {},
resources:{},
modules:{}
};

if (dep.name=='')	dep.name=component;

var componentConfigFile = (local)?findComponentConfigLocal(config, component):findComponentConfigFile(config, component);
if (!componentConfigFile &&local) {

	componentConfigFile=findComponentConfigFile(config, component);
	local=false;
}
if (!componentConfigFile) {
var error = new Error(component + ' is not installed. Try running `bower install` or remove the component from your bower.json file.');
error.code = 'PKG_NOT_INSTALLED';
throw error;

return;
}

var overrides = config.get('overrides');
if (overrides && overrides[component]) {
if (overrides[component].dependencies) {
componentConfigFile.dependencies = overrides[component].dependencies;
}
if (overrides[component].main) {
componentConfigFile.main = overrides[component].main;
}
}
var cwd = local?config.get('cwd'):$.path.join(config.get('bower-directory'), component);
var mains = findFiles(componentConfigFile,cwd,'main',true);
if (mains.length==0) mains = findDefaultMainFiles(local,config, component, componentConfigFile,cwd);
if (mains.length==0) throw new Error("cannot find a valid path for component "+component);
var fileTypes = $._.chain(mains).map($.path.extname).unique().value();


var resources=findFiles(componentConfigFile,cwd,'resources',false);
var modules=findModules(local,config, component, componentConfigFile,cwd);
dep.cwd=cwd;
dep.main = mains;
dep.type = fileTypes;
dep.resources=resources;
dep.modules=modules;
dep.name = componentConfigFile.name;

var depIsExcluded = $._.find(config.get('exclude'), function (pattern) {
return $.path.join(config.get('bower-directory'), component).match(pattern);
});

if (componentConfigFile.dependencies) {
dep.dependencies = componentConfigFile.dependencies;
$._.each(componentConfigFile.dependencies, gatherInfo(local,config));
}
var cwd =$.path.join((local)?config.get('cwd') :config.get('bower-directory'), component);
var packageHandler=config.get('package-handler'); 
if (packageHandler!=undefined) {
	var mains=[];
	var deps={};
	packageHandler(component,mains,deps);

	if (mains.length>0){
	  
	 
	  mains=$._.unique(mains.reduce(function (acc, filePath) {
		acc = acc.concat(
		$.glob.sync(filePath, { cwd: cwd, root: '/' })
		.map(function (path) {
		return $.path.join(cwd, path);
		})
		);
		return acc;
		}, []));
	   dep.main=mains.concat(dep.main);
	   dep.type = $._.chain(dep.main).map($.path.extname).unique().value();
	   
	}
	var keys=$._.unique(Object.keys(deps));
	if (keys.length>0) {
	   keys.forEach(function(k){dep.dependencies[k]=deps[k];});
	}
	
}
if (dep.main.length === 0 && !depIsExcluded) {

var f=$.path.join(cwd, dep.name);

$.fs.lstat(f, function(err, stats) {
    if (!err && stats.isDirectory()) {
       dep.main.push(f);
       dep.type = $._.chain(dep.main).map($.path.extname).unique().value();
       console.log('Auto adding file '+f+' to main, because main is empty');
    } else // can't find the main file. this config file is useless!
throw new Error("Can't find the main file for '"+dep.name+"'");
});


}
config.get('global-dependencies').set(component, dep);
};
}

function filterFiles(f,exclude,t){
return f.filter(function (main) {
var b1=t && $.path.extname(main) === t;

var isExcluded = $._.find(exclude, function (pattern) {
return main.replace(/\\/g, '/').match(pattern).match(pattern);
});
return !t||(b1&&!isExcluded);

})		
}

function reduceDepInfo(gdeps,exclude,f,t,parentdep){
var resources={};
for(var k in f.resources){
resources[k]=filterFiles(f.resources[k],exclude);		
}

return {cwd:f.cwd,modules:f.modules, main:filterFiles(f.main,exclude,t),resources:resources, dependencies:collectDependencies(gdeps,parentdep,f.dependencies)
};}


function collectDependencies(gdeps,pdeps,deps){
 for (var i in deps){
	 var d=deps[i];
	 collectDependencies(gdeps,pdeps,gdeps.get(i).dependencies);
     var found=false;
     for(var j=0;j<pdeps.length;j++){
		 
	   if (pdeps[j].name==i) {found= true; break;} 
	
	}
       if (!found) pdeps.push({name:i,main:d.main});
   
 }
 return pdeps;
}


/**
* Sort the dependencies in the order we can best determine they're needed.
*
* @param {object} config the global configuration object
* @param {string} fileType the type of file to prioritize
* @return {array} the sorted items of 'path/to/main/files.ext' sorted by type
*/
function prioritizeDependencies(config, fileType) {
var deps=config.get('global-dependencies');



var dependencies = $._.toArray(deps.get())/*.
filter(function (dependency) {
return $._.contains(dependency.type, fileType);
});
*/

var tdep={};


dependencies.forEach(function(f){	
	
tdep[f.name]=reduceDepInfo(deps,config.get('exclude'),f,fileType,[]);	
});


return tdep;

}

module.exports = load;
