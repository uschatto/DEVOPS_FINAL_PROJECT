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

[Screencast Milestone2](https://drive.google.com/open?id=1M4VL5EBQZfIRxL_FsLm1jkz6NA2dkNMh)

Experiences:
 - Got to know how to do time sensitive testing. 
 - It can take up to 3-4 hours to have a good report. So we tried to make the code as structured as possible and also tried to use up the max space for VM while also ensuring the host system doesn’t get slow.
 - It was great to learn how do code smell for the code. Many times the logic of the function becomes complicated and it is hard to catch everything during code review. But, by doing this exercise we came to know how other tools like SonarQube might be doing code smell check.
 - By implementing fuzzing logic we understood how to search for most useful test cases out of lot of test cases. So, while deploying application we can run only useful test cases as a part of regression testing, that can reduce the time and check significant  functionalities.
 - Intitially we faced challenge in setting up the fuzzer code.
 - While running static analysis code on the checkbox.io repo, there were some challenges we faced to learn and make it work using esprima.
 - It was interesting to gather useful information in the form of report from the output of test cases.
 - Regardless of whether the tests passed, we got the opportunity to implement the code smells part where having a readable code and great coding practices can can help maintaining the code.

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

<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M2/img/usefultest.PNG" width="500" height="400">
</p>

### Task 4: Static analysis for checkbox.io
- Run the command ```pipeline build checkbox.io```
- It throws error if the following things eceeded: 
  - Long method: Detect long methods (>100 LOC).
  - Message Chains: Detect message chains (for .) (>10 chains)
  - MaxNestingDepth: Count the max number of if statements in a function (>5)

<p align="center">
<img src ="https://media.github.ncsu.edu/user/12214/files/c86f0c80-7827-11ea-9d13-0651bed81538" width="600" height="350">
</p>



## Milestone 3
[Checkpoint 1](https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/CHECKPOINT.md#checkpoint-1)

[Screencast Milestone3](https://drive.google.com/open?id=1ClZ2sKmViHx4CswIOq-HudsQw9aTmMvn)

Experiences:
- Learnt how to deploy applications on cloud and mock a production enviroment by implementing monitoring. 
- Got hands-on with dealing with a variety of APIs and errors associated especially 422 error.
- We had some difficulty in installing and using the module generate-rsa-key pair.
- There were many challenges we faced to make the iTrust application work. Inititally, we had a problem with db.properties that wasn't included in the war file. To fix this issue we understood the whole process of what maven command does to create a war file.
- Once we had a proper war file we had challanges on deploying iTrust on tomcat. Tomcat was getting destroyed as soon as iTrust was extracted. We figured out that by increasing the size of the droplet and that helped to fix this issue.
- Initially we faced some issues with checkbox where we were setting the environment ariables as desired by the application but it couldn't retrieve it. Finally, we sent the environment variables with the forever command.
- For canary, we got a better idea into executing web proxy that was shown to us in the Deployment workshop. Got to play around a lot of metrics that were open to be considered for the canary analysis but had to decide on a few that we thought made the most impact.

### Task 1: Set up ansible/jenkins-server
- Run the command ```pipeline setup --gh-user <username> --gh-pass <password>```

### Task 2: Provision instances and monitoring
- Run the command ```pipeline prod up```. This will provision three instances monitor, itrust, checkbox.
- Droplets created using API on Digital Ocean
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/digitalocean.PNG" width="600" height="350">
</p>

- Firewall created using API on Digital Ocean
<p align="center">
<img src="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/firewall.png" width="600" height="350">
</p>

### Task 3: Implement configuration steps for deployment
- Run the command ```pipeline deploy checkbox.io -i inventory.ini```. This will deploy checkbox.io application on checkbox server.
- /researchers.html
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/checkbox_app.PNG" width="600" height="350">
</p>

- /api/study/listing
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/api_study_listing.png" width="600" height="200">
</p>

- Run the command ```pipeline deploy iTrust -i inventory.ini```. This will first trigger a build for iTrust job and will create a iTrust2.war. Further, it will install tomcat, mysql on the itrust node and then the iTrust war file will be copied and deployed on tomcat server in itrust droplet. 

<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/itrust_login.PNG" width="600" height="350">
</p>


### Monitoring Screenshot after both the apps are deployed
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/monitoring.png" width="600" height="350">
</p>

### Task 4: Canary analysis

- We have set weights for different metrics that we are using to calculate the canary score. According to us the status code was the most important metric affecting the canary score so we assigned it a weight of 4. Similarly we assigned 2 to each of Latency, Current memory load and CPU. Depending on your requirement you can tweak these values to recalculate the canary score. We have used the Mann whitney u test module to calculate the statistical difference in the data coming in from the green and the blue instances.

- ```pipeline canary master broken```
<p align="center">
<img src ="https://media.github.ncsu.edu/user/12214/files/60aa9980-8b27-11ea-9e4f-32ff3641dbfa" width="700" height="200">
</p>

- This command will bring up three local VMs the proxy server, green and blue instances. We clone the checkbox.io-micro-preview master branch on blue and broken branch on the green instance. We generate load for first 5 minutes on Blue instance and then it generates load on the Green VM for next 5 minutes.

- ```pipeline canary master master```
<p align="center">
<img src ="https://media.github.ncsu.edu/user/12214/files/2c37dd00-8b29-11ea-9840-cf58462bde14" width="700" height="200">
</p>

- This command will bring up three local VMs the proxy server, green and blue instances. We clone the checkbox.io-micro-preview master branch on blue as well as on the green instance. We generate load for first 5 minutes on Blue instance and then it generates load on the Green VM for next 5 minutes. 
