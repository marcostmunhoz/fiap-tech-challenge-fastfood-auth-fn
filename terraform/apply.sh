#!/bin/bash

source .env

terraform init --backend-config="encryption_key=$ENCRYPTION_KEY"
terraform apply --auto-approve