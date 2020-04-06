# DEVOPS-16

## TEAM MEMBERS

Kartik Shah (kcshah)
 
Ketaki Kothavade (kmkothav)

Udita Chattopadhyay (uschatto)

* Note: This report contains both Milestone 1 and Milestone 2 tasks. 

### Milestone 1
[Checkpoint 1](https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M1/CHECKPOINT.md#checkpoint-1)

[Checkpoint 2](https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M1/CHECKPOINT.md#checkpoint-2)

[Screencast Milestone1](https://drive.google.com/open?id=1i3DAs5i-KBCxpR2hU6X8smYrQH9itM-Y)

## The following tasks have been successfully achieved:

- pipeline setup
- pipeline build checkbox.io

# pipeline setup
- This sets up the provisioning server (ansible-srv) and jenkins-srv. 
- It sets up the environment variables like MONGO_PORT etc required by the checkbox.io application. 
- It then installs java, jenkins and jenkins-job-builder and all other necessary dependencies.
- Finally it installs mongodb, creates a mongodb user and password with readWrite role, installs nodejs and nginx.

# pipeline build checkbox.io
- This command creates a pipeline project type job on Jenkins via jenkins-job command.
- After which we trigger the build job via REST API.
- Finally we wait for the build to finish and show it on the console via REST API.

## Pipeline Project: Milestone1

<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M1/img/pipeline.png" width="800" height="350">
</p>


## Milestone 2
[Checkpoint 1](https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M2/CHECKPOINT.md#checkpoint-1)

[Screencast Milestone2]

Experiences:
 - Got to know how to do time sensitive testing. 
 - It can take up to 3-4 hours to have a good report. So we tried to make the code as structured as possible and also tried to use up the max space for VM while also ensuring the host system doesn’t get slow.
 - It was great to learn how do code smell for the code. Many times the logic of the function becomes complicated and it is hard to catch everything during code review. But, by doing this exercise we came to know how other tools like SonarQube might be doing code smell check.
 - By implementing fuzzing logic we understood how to search for most useful test cases out of lot of test cases. So, while deploying application we can run only useful test cases as a part of regression testing, that can reduce the time and check significant  functionalities.
 - Intitially we faced challenge in setting up the fuzzer code.
 - While running static analysis code on the checkbox.io repo, there were some challenges we faced to learn and make it work using esprima.
 - It was interesting to gather useful information in the form of report from the output of test cases.

### Task 1: Automatically configure a build environment 
- Run the command ```pipeline setup --gh-user <username> --gh-pass <password>```
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M2/img/Jenkins_view.PNG" width="800" height="350">
</p>

### Task 2: Build itrust job 
- Run the command ```pipeline build iTrust```
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M2/img/itrust_build.PNG" width="800" height="350">
</p>


### Task 3: Test prioritization analysis 
- Run the command ```pipeline useful-tests -c 100```

### Task 4: Static analysis for checkbox.io
- Run the command ```pipeline build checkbox.io```
- It throws error if the following things eceeded: 
  - Long method: Detect long methods (>100 LOC).
  - Message Chains: Detect message chains (for .) (>10 chains)
  - MaxNestingDepth: Count the max number of if statements in a function (>5)

<p align="center">
<img src ="https://media.github.ncsu.edu/user/12214/files/c86f0c80-7827-11ea-9d13-0651bed81538" width="600" height="350">
</p>
