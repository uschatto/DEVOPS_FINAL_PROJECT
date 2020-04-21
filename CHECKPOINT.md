## CHECKPOINT 1

### PROGRESS REPORT

1. We were able to complete the first major task to automatically configure three VMs in cloud instance Digital Ocean. The command 
`pipeline prod up` when run, successfully will create a monitor Droplet, iTrust Droplet and checkbox.io droplet.
<p align="center">
<img src ="https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/blob/M3/img/Droplets.PNG" width="800" height="350">
</p>

2. We have also started working on making a deploy.js file which will handle the deployment step depending on which command is executed ie. `pipeline deploy checkbox.io -i inventory.ini` or `pipeline deploy iTrust -i inventory.ini`.
3. We have also started working on installing tomcat and deploying war file for iTrust server.

#### <a name="CHECKPOINT 1"></a> CHECKPOINT 1

| Story   | Item/Status   |  Issues/Tasks
| ------------- | ------------  |  ------------
| pipeline prod up | In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/issues/28
| pipeline deploy itrust using inventory.ini | In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/issues/31
| Install tomcat for itrust | In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/issues/32
| pipeline deploy checkbox.io -i inventory.ini | In Progress | https://github.ncsu.edu/cscdevops-spring2020/DEVOPS-16/issues/29
