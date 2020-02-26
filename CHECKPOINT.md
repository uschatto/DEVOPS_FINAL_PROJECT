## CHECKPOINT 1

### PROGRESS REPORT
> <p align="justify">We were able to complete the first major task to automatically configure a jenkins server. The command "pipeline setup" when run, successfully will bring up two VMs namely ansible-srv and jenkins-srv. After which the Ansible playbook runs and configures the jenkins-srv. We were able to turn off the jenkins setup wizard and handle authentication automatically. We have started working on the second major task to automatically configure a build environment for checkbox.io to run.</p>

#### <a name="CHECKPOINT 1"></a> CHECKPOINT 1

| Story   | Item/Status   |  Issues/Tasks
| ------------- | ------------  |  ------------
| Setup a template in repo - cli node pipeline | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18539
| Implement "pipeline setup" to run as a single command provisioning and running the Ansible playbooks | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18603
| Use Ansible vault to encrypt the vars file for jenkins role | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18922
| Setting up the pre-requisites for installing jenkins server (java,jenkins) | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18604
| Turning off jenkins setup wizard through automation script | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18605
| Update the turning off jenkins setup wizard for getting the login page only after logout and not display the builds | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18916
| Install nodejs dependency for checkbox.io | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18877
| Install mongodb dependency for checkbox.io | In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18879
| Create a mongodb user and password with read write roles | Tasks | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18915
| Set APP_PORT, MONGO_PORT, MONGO_USER, MONGO_PASSWORD and MONGO_IP | Tasks | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18918


## CHECKPOINT 2

### PROGRESS REPORT
> <p align="justify">We were able to complete the second major task to automatically configure a build environment for checkbox.io. The command "pipeline setup" when run successfully, will bring up two VMs namely ansible-srv and jenkins-srv. After which the Ansible playbook runs and configures the jenkins-srv to act as a build environment for checkbox.io. As part of this we were able to successfully install dependencies like mongodb, nodejs, creating user and password in mongodb admin database with readWrite role and finally set the various environment variables to be needed by checkbox.io. We are currently working on the third major task to create a build job using jenkins-job-builder.As part of this we were able to create a job using "pipeline build checkbox.io" command. And we manually tested the build of the job on jenkins.</p>

#### <a name="CHECKPOINT 2"></a> CHECKPOINT 2

| Story   | Item/Status   |  Issues/Tasks
| ------------- | ------------  |  ------------
| Install mongodb dependency for checkbox.io | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18879
| Create a mongodb user and password with read write roles | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18915
| Set APP_PORT, MONGO_PORT, MONGO_USER, MONGO_PASSWORD and MONGO_IP | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-18918
| Setup pipeline build command and checkbox.io yml file | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-19181
| Add jenkins plugin for future job tasks | In Review | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-19238
| Install jenkins-job-builder and create configuration file,API token| In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/projects/1#card-19496
