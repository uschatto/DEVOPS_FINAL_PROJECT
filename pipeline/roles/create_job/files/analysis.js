var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var path = require("path");
const threshold_message_chains = 10;
const threshold_long_method = 100;

function getFilesRecursively(dir, filelist = []){
         fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir,file)).isDirectory() ?
                                               getFilesRecursively(path.join(dir,file),filelist) : filelist.concat(path.join(dir,file))
         })
        return filelist;
}

function main()
{
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
}

var builders = {};

function FunctionBuilder()
{
        // The max depth of scopes (nested ifs, loops, etc)
        this.MaxNestingDepth    = 0;
        // The max length of a message chain in a function.
        this.MaxMessageChain = 0; 
        // The function name will be reported here.
        this.FunctionName = "";
        this.report = function()
        {
		console.log("\tFunctionName : " + this.FunctionName + " MaxNestingDepth : " + this.MaxNestingDepth + " MaxMessageChain : " + this.MaxMessageChain);
        }
        // Number of lines in function
        this.NumberOfLines = 0;

}

function FileBuilder()
{
	this.FileName = "";

        this.report = function()
        {
		console.log("Filename : " + this.FileName);
        }
}

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
                        if(builder.MaxMessageChain > threshold_message_chains)
                        {
                                throw new Error("FileName : [" + filePath + "] FunctionName : [" + builder.FunctionName + "] exceeded the threshold value for maximum message chains having " + builder.MaxMessageChain + " message chains");
                        }
                        if(builder.NumberOfLines > threshold_long_method)
                        {
                                throw new Error("FileName : [" + filePath + "] FunctionName : [" + builder.FunctionName + "] exceeded the threshold value for longer method having " + builder.NumberOfLines + " lines");
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
