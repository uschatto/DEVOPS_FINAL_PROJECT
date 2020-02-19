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