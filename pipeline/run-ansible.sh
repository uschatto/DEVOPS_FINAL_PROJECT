#!/bin/bash

# Exit on error
set -e

# Trace commands as we run them:
# Commenting out the below line to not display the git password
#set -x

# Print error message and exit with error code 1
function die {
    echo "$1"
    exit 1
}

# Check the number of arguments
[ $# -ge 2 ] || die "usage: $0 <playbook> <inventory>"

PLAYBOOK=$1
INVENTORY=$2
VAULT=$3
GH_USER=$4
GH_PASS=$5
ansible-playbook --vault-password-file=$VAULT $PLAYBOOK -i $INVENTORY --extra-vars "gh_user=$GH_USER gh_pass=$GH_PASS"