const fs = require('fs')
const path = require('path')

const getFilesRecursively = (dir, filelist = [])=> {
         fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir,file)).isDirectory() ?
                                               getFilesRecursively(path.join(dir,file),filelist) : filelist.concat(path.join(dir,file))
         })
        return filelist
}

const fuzzer = (filepath)=> {
        //Implement fuzzing logic on the filepath
        console.log(filepath);
        var data = fs.readFileSync(filepath, 'utf-8').split(' ');

        data.forEach(function(element, index){
           data[index] = element.replace(/!=/g, "==");
           data[index] = element.replace(/==/g, "!=");
           data[index] = element.replace(/</g, ">");
           data[index] = element.replace(/>/g, "<");
           
           data[index] = element.replace(/||/g, "&&");
           data[index] = element.replace(/&&/g, "||");
        });

        data = data.join(" ");
        fs.writeFileSync(filepath, data);

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
