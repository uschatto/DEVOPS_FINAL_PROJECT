# DEVOPS-16

## TEAM MEMBERS

Kartik Shah (kcshah)
 
Ketaki Kothavade (kmkothav)

Udita Chattopadhyay (uschatto)

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
