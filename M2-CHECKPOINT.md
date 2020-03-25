## CHECKPOINT 1

### PROGRESS REPORT

1. We were able to complete the first major task to automatically configure a build environment and build job for a Java application (iTrust). The command 
`pipeline setup --gh-user <username> --gh-pass <password>` when run, successfully will bring up two VMs namely ansible-srv and jenkins-srv. After which the Ansible playbook runs and configures the jenkins-srv and all the steps of Milestone1. Additionally, it installs additional packages such as maven, nodejs, chrome, mysql. Further it builds the job for iTrust but, you need to provide the Git `username` and `password` to access iTrust repo on github.ncsu.edu.
2. We also completed the second major task to trigger a build job for iTrust using the command `pipeline build iTrust`. It sets up the necessary email and database configurations.
3. We have started implementing the next phase, which is a test suite analysis for detecting useful tests. 

#### <a name="CHECKPOINT 1"></a> CHECKPOINT 1

| Story   | Item/Status   |  Issues/Tasks
| ------------- | ------------  |  ------------
| Create a job for iTrust | Completed | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/issues/7
