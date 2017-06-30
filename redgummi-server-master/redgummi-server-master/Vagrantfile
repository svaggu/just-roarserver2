# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrant.require_plugin 'vagrant-aws'

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|

  # This below config, called 'local' defines a virtual machine to be run on the developer's machine.
  config.vm.define 'local' do |local|
    # Assign a base Ubuntu image to the VM
    local.vm.box = "ubuntu/trusty64"

    # Assign a default host name to the VM
    local.vm.hostname = "jobumes-server-local"

    # Jobumes server will run on port 9060 in the VM, forward all requests to port 9060 on the host.
    local.vm.network "forwarded_port", guest: 9060, host: 9060

    # Now provision the VM using BAS Shell commands
    local.vm.provision "shell", inline: <<-SHELL
      # update APT cache and install dependencies - vim & nano editors, python, wget downloader, & mongodb
      sudo apt-get update
      sudo apt-get install -y vim nano python3 wget mongodb

      # install and setup node.js v7
      wget https://nodejs.org/dist/v7.10.0/node-v7.10.0-linux-x64.tar.xz
      tar xvf node-v7.10.0-linux-x64.tar.xz
      sudo mv node-v7.10.0-linux-x64 /usr/bin/
      sudo ln --symbolic /usr/bin/node-v7.10.0-linux-x64/bin/node /usr/bin/node
      sudo ln --symbolic /usr/bin/node-v7.10.0-linux-x64/bin/npm /usr/bin/npm

      # install npm dependencies for jobumes-server and start the server
      # NOTE: jobumes-server will be in the VM at /vargant by default. We keep it at default.
      cd /vagrant && npm install && npm start
    SHELL
  end
  # End of VM configuration for 'local'

  # This below config, called 'prod' defines an instance to be deployed in production.
  # As can be seen from the code The 'prod' instance is now configured to run on AWS.
  config.vm.define 'prod' do |prod|
    prod.vm.box = 'dummy' # DO NO CHANGE THIS
    prod.vm.box_url = 'https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box' # DO NO CHANGE THIS
    prod.vm.provider :aws do |aws, override|
      # This is the access key id configured in the AWS instance.
      aws.access_key_id = 'AKIAJOQXK2DSBHA7IFQQ'

      # This is the secret key configured in the AWS instance.
      aws.secret_access_key = 'GvZy7mWgU1Z41EE6PihbRCthmHZNpqUHjePj1Nmo'

      # This is the file name of the private key-pair. Also refer to the "override.ssh.private_key_path" setting below.
      aws.keypair_name = 'immac'

      # This is the AMI image name of the AWS's Ubuntu instance
      aws.ami = 'ami-cdbdd7a2'

      # This is the AMI image name of the AWS's Ubuntu instance
      aws.region = 'ap-south-1'

      # This is the username used in the AWS's Ubuntu instance
      override.ssh.username = "ubuntu"

      # The below line configures the private key for the AWS instance.
      # TODO: Please do ensure that this line is changed as needed to provide the correct path
      # and correct filename of the private key pair stored in your machine.
      # NOTE: THESE private key files (.pem) will not be committed into Git. You need to
      # get the correct keys yourself and provide the path below.
      override.ssh.private_key_path = "/home/hariharan/work/repos/jobumes-server/immac.pem"
    end

    prod.vm.provision "shell", inline: <<-SHELL
      # update APT cache and install dependencies - vim & nano editors, python, wget downloader, & mongodb
      sudo apt-get update
      sudo apt-get install -y vim nano python3 wget mongodb

      # install node.js v7
      wget https://nodejs.org/dist/v7.10.0/node-v7.10.0-linux-x64.tar.xz
      tar xvf node-v7.10.0-linux-x64.tar.xz
      sudo mv node-v7.10.0-linux-x64 /usr/bin/
      sudo ln --symbolic /usr/bin/node-v7.10.0-linux-x64/bin/node /usr/bin/node
      sudo ln --symbolic /usr/bin/node-v7.10.0-linux-x64/bin/npm /usr/bin/npm

      # install npm dependencies for jobumes-server and start the server
      cd /vagrant && npm install && npm start
    SHELL

  end
  # End of VM configuration for 'prod'
end
# End of Vagrantfile
