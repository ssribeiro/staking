# How to launch Terraform

## Step 1
Set up the backend.conf configuration

    address          =   "https://gitlab.com/api/v4/projects/xxx/terraform/state/xxx.tfstate"
    lock_address     =   "https://gitlab.com/api/v4/projects/xxx/terraform/state/xxx.tfstate/lock"
    unlock_address   =   "https://gitlab.com/api/v4/projects/xxx/terraform/state/xxx.tfstate/lock"
    username         =   ""
    password         =   ""

## Step 2
Set up the .env file with the following variables

    TF_VAR_aws_access_key       =   ""
    TF_VAR_aws_secret_key       =   ""