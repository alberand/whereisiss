#!/usr/bin/bash

project_name="issmap"
PROJECT_NAME=$(echo $project_name | tr a-z A-Z)

filelist=(
    "$project_name.service"
    "$project_name.nginx"
    "$project_name.ini"
    "$project_name.py"
    "wsgi.py"
    "uwsgi_params"
    "id_rsa"
    "id_rsa.pub"
)

envvars=(
    "${PROJECT_NAME}_HOME"
    "${PROJECT_NAME}_VAULT_PASS"
    "${PROJECT_NAME}_ROOT_PASS"
    "${PROJECT_NAME}_HOST_IP"
)

for filename in ${filelist[*]}; do
    [ ! -f "$filename" ] && echo "'$filename' doesn't not exist."
done;

for varname in ${envvars[*]}; do
    [ -z "${!varname}" ] && echo "'$varname' isn't set."
done;
