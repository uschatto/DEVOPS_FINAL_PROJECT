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
        console.log("File: " + filepath);
        var lines = fs.readFileSync(filepath, 'utf-8').split('\n');

        let indexAlreadyMutated = []
        //Store the 10% of the total lines in a variable
        let linesToMutateCount = Math.floor(0.1 * lines.length)
        console.log("linesToMutateCount: " + linesToMutateCount)

        //Randomly select files to be acted upon and check if reached the linesToMutateCount
        while (linesToMutateCount != 0){
                let rand = Math.floor(Math.random() * lines.length)
                //console.log("Random number: " + rand)

                if (!indexAlreadyMutated.includes(rand))
                {
                        indexAlreadyMutated.push(rand)
                        linesToMutateCount = linesToMutateCount - 1
                        var data = lines[rand].split(' ');
                        //console.log("Randomly selected file: " + lines[rand])
                                                
                        lines[rand] = mutation(data);
                }
        }

        lines = lines.join("\n")
        fs.writeFileSync(filepath, lines);
        //console.log("------COMPLETED------")
        //console.log(lines)
}

const runFuzzer= (n) =>
{
        //Get the list of filenames in an array
        let javaPaths = getFilesRecursively('src/main/java/edu/ncsu/csc/itrust2')
        let arrayLength = javaPaths.length
        let indexAlreadyFuzzed = []

        //Store the 10% of the total array length in a variable
        let count = Math.floor(0.1 * arrayLength)

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
