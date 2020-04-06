var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
const threshold_message_chains = 10;
const threshold_long_method = 100;
const threshold_nesting_depth = 5; 

function getFilesRecursively(dir, filelist = []){
         fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir,file)).isDirectory() ?
                                               getFilesRecursively(path.join(dir,file),filelist) : filelist.concat(path.join(dir,file))
         })
        return filelist;
}

function main()
{
        var error = false;
	//Get the list of filenames from server-side/site
        let filePaths = getFilesRecursively('server-side/site');

        //Parse the filenames and execute static analysis on only javascript files
        filePaths.forEach(file => {
                if (!file.match(/node_modules/) && path.basename(file).match(/[.]js$/g)) {
                        complexity(file);
                }
        });

        // Report
        for( var node in builders )
        {
                var builder = builders[node];
                builder.report();
        }	

        // Report functions/file exceeding threshold values
        console.log(chalk.red(`\nThe following exceeded the max message chains threshold value of ${threshold_message_chains} : `));
        for( var node in messageChains )
        {
                var messageChain = builders[node];
                messageChain.report();  
                error = true;
        }

        console.log(chalk.red(`\nThe following exceeded the long method threshold value of ${threshold_long_method} : `));
        for( var node in longMethods ) 
        {
                var longMethod = builders[node];
                longMethod.report();
                error = true;
        }

        console.log(chalk.red(`\nThe following exceeded the max nesting depth threshold value of ${threshold_nesting_depth} : `));
        for( var node in nestingDepths )
        {
                var nestingDepth = builders[node]; 
                nestingDepth.report();
                error = true;
        }


        if(error == true)
        {
                throw new Error("Code smells were found..Fail the jenkins build");
        }

}

var builders = {};
var messageChains = {};
var longMethods = {};
var nestingDepths = {};

function FunctionBuilder()
{
        // The max depth of scopes (nested ifs, loops, etc)
        this.MaxNestingDepth    = 0;
        // The max length of a message chain in a function.
        this.MaxMessageChain = 0; 
        // The function name will be reported here.
        this.FunctionName = "";
        // Number of lines in function
        this.NumberOfLines = 0;

        this.report = function()
        {
		console.log("\tFunctionName : " + this.FunctionName + " MaxNestingDepth : " + this.MaxNestingDepth + " MaxMessageChain : " + this.MaxMessageChain + " LongMethod : " + this.NumberOfLines);
        }
}

function FileBuilder()
{
	this.FileName = "";

        this.report = function()
        {
		console.log("Filename : " + this.FileName);
        }
}
var i = 0;

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;
    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent')
            {
		child.parent = object;
		traverseWithParents(child, visitor);
            }
        }
    }
}

function nested_depth(builder,object,depth)
{
    builder.MaxNestingDepth = Math.max(depth,builder.MaxNestingDepth)
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
                child.parent = object;
                if(object.type === 'IfStatement' && object.alternate === null){
                    nested_depth(builder,child,depth+1)
                }
                else if(object.type === 'IfStatement'){
                    nested_depth(builder,object.consequent,depth+1)
                    nested_depth(builder,object.alternate,depth)
                }
                else{
                    nested_depth(builder,child,depth)
                }
            }
        }
    }
}


function complexity(filePath)
{
        var buf = fs.readFileSync(filePath, "utf8");
        var ast = esprima.parse(buf, options);
        var i = 0;

        var fileBuilder = new FileBuilder();
        fileBuilder.FileName = path.basename(filePath);
	
        traverseWithParents(ast, function (node)
        {
                if (node.type === 'FunctionDeclaration')
                {
                        var builder = new FunctionBuilder();

                        builder.FunctionName = functionName(node);
                        builder.NumberOfLines = node.loc.end.line - node.loc.start.line + 1;

                        traverseWithParents(node, function(child_)
                        {
                                //The max length of a message chain in a function
                                if(child_.type === 'MemberExpression')
                                {
                                        var length = 1;
                                        //Iterate to check the number of MemberExpression in the tree
                                        traverseWithParents(child_.object, function(_child_)
                                        {
                                                if(_child_.type === 'MemberExpression')
                                                {
                                                        length++;                                                                                                                                                   
                                                }
                                                //Function to check and put the max of the length and MaxMessageChain as the final max value
                                                builder.MaxMessageChain = Math.max(builder.MaxMessageChain,length);
                                        });
                                }
                        });

                        traverseWithParents(node, function(node){
                                var depth = 0
                                if (node.type === 'IfStatement'){
                                      nested_depth(builder,node,depth)
                                }              
                        });

                        
                        if(builder.MaxMessageChain > threshold_message_chains)
                        {
                                messageChains[filePath] = fileBuilder;
                                messageChains[builder.FunctionName] = builder;
                        }
                        if(builder.NumberOfLines > threshold_long_method)
                        {
                                longMethods[filePath] = fileBuilder;
                                longMethods[builder.FunctionName] = builder;
                        }
                        if(builder.MaxNestingDepth > threshold_nesting_depth)
                        {
                                nestingDepths[filePath] = fileBuilder;
                                nestingDepths[builder.FunctionName] = builder;
                        }
                        builders[filePath] = fileBuilder;
                        builders[builder.FunctionName] = builder;
                }
        });
}

// Helper function for counting children of node. 
function childrenLength(node)
{
        var key, child;
        var count = 0;
        for (key in node)
        {
                if (node.hasOwnProperty(key))
                {
                        child = node[key];
                        if (typeof child === 'object' && child !== null && key != 'parent')
                        {
                                 count++;
                        }
                }
        } 
        return count;
}

// Helper function for printing out function name.
function functionName( node )
{ 
	if( node.id )
        {
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}


main();
