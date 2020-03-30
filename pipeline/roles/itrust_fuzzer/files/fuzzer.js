var fs = require('fs'),
    xml2js = require('xml2js'),
    child  = require('child_process'); 
const path = require('path')
const Random = require('random-js');
const stackTrace = require('stacktrace-parser');
var parser = new xml2js.Parser();
var Bluebird = require('bluebird')
var test_dic = {};
const getFilesRecursively = (dir, filelist = []) => {
         fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir,file)).isDirectory() ?
                                               getFilesRecursively(path.join(dir,file),filelist) : filelist.concat(path.join(dir,file))
         })
        return filelist
}

class fuzzer {
    static random() {
        return fuzzer._random || fuzzer.seed(0)     
    }	

    static seed (kernel) {
	fuzzer._random = new Random.Random(Random.MersenneTwister19937.seed(kernel));
        fuzzer._random;
    }
	
    static mutation(filepath) { //Implement fuzzing logic on the filepath
        var data = fs.readFileSync(filepath, 'utf-8').split('\n');
        data.forEach(function(element_d,index_d){
            // if ((element_d.includes('0') || element_d.includes('1')) && (element_d.includes('_') === false)){
            //     element_d = element_d.replace('0','_').replace('1','0').replace('_','1')
            // }
            element_d = element_d.replace(/(0|1)/g, function($1) {
                return $1 === '0'? '1' : '0';
            });
            let data_line = [];
            if (fuzzer.random().bool(0.1)){
                data_line = element_d.split(' ');  //data_line is an array for that specific line
                data_line.forEach(function(element, index){
                    if (typeof(element) == 'string'){
                        if((element.startsWith('\'') && element.endsWith('\'')) || (element.startsWith('\"') && element.endsWith('\"'))){
                            data_line[index] = element.split('').reverse().join('');
                        }
                    }
                    switch(element.trim()){
                        case "!=":
                            data_line[index] = element.replace(/!=/g, "==");
                            break;
                        case "==":
                            data_line[index] = element.replace(/==/g, "!=");
                            break;
                        case ">":
                            data_line[index] = element.replace(/>/g, "<");
                            break;
                        case "<":
                            data_line[index] = element.replace(/</g, ">");
                            break;
                        case "||":
                            data_line[index] = element.replace(/\|\|/g,"&&");
                            break;
                        case "&&":
                            data_line[index] = element.replace(/&&/g,"||");
                            break;
                        case ">=":
                            data[index] = element.replace(/>=/g, "<=");
                            break;
                        case "<=":
                            data[index] = element.replace(/<=/g, ">=");
                            break;
                        default:
                            break;
                    }
                    if(element.includes("++")){
                        data[index] = element.replace("++", "--");
                    }
                    if(element.includes("--")){
                        data[index] = element.replace("--", "++");
                    }
                });
                data[index_d] = data_line.join(" ");
            }
        });
           data = data.join('\n')
           fs.writeFileSync(filepath, data);
    }
};
async function runFuzzer(n)
{
    fuzzer.seed(0);
    
        //Get the list of filenames in an array
    let javaPaths = getFilesRecursively('iTrust2-v6/iTrust2/src/main/java/edu/ncsu/csc/itrust2')
    let arrayLength = javaPaths.length
    child.execSync('cd iTrust2-v6/iTrust2 && sudo mvn -f pom-data.xml process-test-classes', {encoding: 'utf-8'});
    while (n != 0) {
        let indexAlreadyFuzzed = []
        //Store the 10% of the total array length in a variable
        let count = Math.floor(0.1 * arrayLength)
        //Randomly select files to be acted upon and check if reached the count
        while (count != 0){
            let rand = Math.floor(Math.random() * arrayLength)
            if (!indexAlreadyFuzzed.includes(rand))
                {
                        indexAlreadyFuzzed.push(rand)
                        console.log(javaPaths[rand])
                        fuzzer.mutation(javaPaths[rand])
                        count = count - 1
                }
            }  
            
        try{
            child.execSync('cd iTrust2-v6/iTrust2 && sudo mvn clean test verify')
            // await sleep(120000);
            await calcTests();
            n = n - 1;
            console.log(n);
            console.log('BUILD PASSED');
            try {
                child.execSync('cd iTrust2-v6/iTrust2 && git checkout src/main/java/edu/ncsu/csc/itrust2/')
            }
            catch(e1){}
        }
        catch(e) {
            if (fs.existsSync('iTrust2-v6/iTrust2/target/surefire-reports')) {
                // await sleep(12000);
                await calcTests();
                n = n -1;
                console.log(n);
                console.log('BUILD FAILURE');
            }
            else {
                console.log("COMPILATION FAILURE")
            }
            try {
                child.execSync('cd iTrust2-v6/iTrust2 && git checkout src/main/java/edu/ncsu/csc/itrust2/')
            }
            catch(e1){}
        }
    }
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function calcTests()
{
    let testReport = getFilesRecursively('iTrust2-v6/iTrust2/target/surefire-reports')
    //console.log(testReport)
    for(i = 0; i < testReport.length; i++){
        if(testReport[i].endsWith('.xml')){
            try{
                var contents = fs.readFileSync(testReport[i])
                let xml2json = await Bluebird.fromCallback(cb => parser.parseString(contents, cb));
                await readResults(xml2json);
            }
            catch(e){}
        }
    }
    //console.log(test_dic)
}

async function readResults(result)
{
    //console.log(result)
    for( var i = 0; i < result.testsuite['$'].tests; i++ )
    {
        var testcase = result.testsuite.testcase[i];
        let testname = testcase['$'].classname+"."+testcase['$'].name
        let status = (testcase.hasOwnProperty('failure') || testcase.hasOwnProperty('error')) ? "failed": "passed"
        if(!test_dic.hasOwnProperty(testname))
        {
            //console.log(testname)
            test_dic[testname] = 0;
        }
        if (status === 'passed')
        {   
            test_dic[testname]++;
        }
    } 
    //console.log(test_dic);   
    //return test_dic;
}

async function displaySorted()
{
    // Create items array
    var items = Object.keys(test_dic).map(function(key) {
        return [key, test_dic[key]];
    });
  
  // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    for (var i = 0; i < items.length; i++)
    {
        console.log(items[i][1]+"/"+process.argv[2]+" "+items[i][0])
    }
}

(async () => {
    if(process.argv.length > 2){
        await runFuzzer(process.argv[2]);
    }
    //console.log('Final: ', test_dic);
    await displaySorted();
})();