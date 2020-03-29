const fs = require('fs')
const path = require('path')

const getFilesRecursively = (dir, filelist = [])=> {
         fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir,file)).isDirectory() ?
                                               getFilesRecursively(path.join(dir,file),filelist) : filelist.concat(path.join(dir,file))
         })
        return filelist
}

const mutation= (data)=>{
        data.forEach(function(element, index){
                switch(element.trim()){
                        case "!=":
                                data[index] = element.replace(/!=/g, "==");
                                break;
                        case "==":
                                data[index] = element.replace(/==/g, "!=");
                                break;
                        case ">":
                                data[index] = element.replace(/>/g, "<");
                                break;
                        case "<":
                                data[index] = element.replace(/</g, ">");
                                break;
                        case ">=":
                                data[index] = element.replace(/>=/g, "<=");
                                break;
                        case "<=":
                                data[index] = element.replace(/<=/g, ">=");
                                break;
                        case "1":
                                data[index] = element.replace(/1/g,"0");
                                break;
                        case "0":
                                data[index] = element.replace(/0/g,"1");
                                break;
                        case "||":
                                data[index] = element.replace(/\|\|/g,"&&");
                                break;
                        case "&&":
                                data[index] = element.replace(/&&/g,"||");
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
        return data.join(" ")
}

const fuzzer = (filepath)=> {
        //Implement fuzzing logic on the filepath
        let lines = fs.readFileSync(filepath, 'utf-8').split('\n');

        let indexAlreadyMutated = []
        //Store up to 10% of the total lines in a variable
        let randPer = Math.random() * (0.1-0.01) + 0.01
        let linesToMutateCount = Math.floor(randPer * lines.length)
        let count = linesToMutateCount

        //Randomly select lines to be acted upon and check if reached the linesToMutateCount
        while (count != 0){
                let rand = Math.floor(Math.random() * lines.length)

                if (!indexAlreadyMutated.includes(rand))
                {
                        indexAlreadyMutated.push(rand)
                        count = count - 1
                        var data = lines[rand].split(' ');                                                
                        lines[rand] = mutation(data);
                }
        }
        console.log(linesToMutateCount + ' lines mutated of ' + JSON.stringify(filepath) + ' file.')

        lines = lines.join("\n")
        fs.writeFileSync(filepath, lines);
}

const runFuzzer= (n) =>
{
        //Get the list of filenames in an array
        let javaPaths = getFilesRecursively('src/main/java/edu/ncsu/csc/itrust2')
        let arrayLength = javaPaths.length
        let indexAlreadyFuzzed = []

        //Store up to 10% of the total array length in a variable
        let randPer = Math.random() * (0.1-0.01) + 0.01
        let count = Math.floor(randPer * arrayLength)
        
        //Randomly select files to be acted upon and check if reached the count
        while (count != 0){
                let rand = Math.floor(Math.random() * arrayLength)
                if (!indexAlreadyFuzzed.includes(rand))
                {
                        indexAlreadyFuzzed.push(rand)
                        count = count - 1
                        fuzzer(javaPaths[rand])
                }
        }
}

runFuzzer(3)
