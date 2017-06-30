# red-gummi-server

This is the backend server for the Red Gummi service

## Getting Started
Install the module with: `npm install jobumes-server`

## Deployment Instructions for local stage - (your laptop)
### 1. Install VirtualBox
Download VirtualBox from https://www.virtualbox.org/wiki/Downloads
If your OS is Ubuntu, then you may download from here: https://www.virtualbox.org/wiki/Linux_Downloads
Once the .deb file is downloaded it can be installed with the dpkg command.
The below commands show how to install VirtualBox on Ubuntu 16.04

$ wget http://download.virtualbox.org/virtualbox/5.1.18/virtualbox-5.1_5.1.18-114002~Ubuntu~xenial_amd64.deb
$ sudo dpkg -i virtualbox-5.1_5.1.18-114002~Ubuntu~xenial_amd64.deb

### 2. Install Vagrant
Download Vagrant from https://www.vagrantup.com/downloads.html
If your OS is Ubuntu, then you may download the one for Debian OS.
Once the .deb file is downloaded it can be installed with the dpkg command

$ sudo dpkg -i vagrant_1.9.3_x86_64.deb

### 3. Install Vagrant plugin for AWS
The Vagrant plugin for AWS is called vagrant-aws. The source code for this plugin can be found at https://github.com/mitchellh/vagrant-aws. This plugin is needed to deploy the production instance of red-gummi-server on AWS. The plugin can be installed by running the following command.

$ vagrant plugin install vagrant-aws

### 4. Bring up the VM in localhost instance
The VM for running a local instance on your machine is called "local". In a terminal, go into the project home folder and use Vagrant to bring up the VM

$ vagrant up local

This will take some time to setup the VM in your laptop. Then, execute the following command to provision.

$ vagrant provision local

The red-gummi-server will automatically come up at the execution of this script.

## 6. Deployment Instructions for production stage - (AWS)
The VM for running red-gummi-server an AWS instance is called "prod". In a terminal, go into the project home folder and use Vagrant to bring up the VM.

$ vagrant up prod

This will take some time to setup the VM. Then, execute the following command to provision.

$ vagrant provision prod

The red-gummi-server will automatically come up at the execution of this script.

## License
Licensed under the private license.
