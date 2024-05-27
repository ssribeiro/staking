import sys
import os
import uuid
from dotenv import load_dotenv

actions = ["terraform", "clear", "destroy"]
platforms = ["dev", "prd", "default"]

usage = 'Usage [{}] [services] [{}]'.format(' | '.join(actions), ' | '.join(platforms))

if len(sys.argv) < 4:
    print(usage)
    exit(-1)

# Args
action = sys.argv[1]
service = sys.argv[2]
platform = sys.argv[3]
commit = sys.argv[4] if len(sys.argv) >= 5 else uuid.uuid4()

if action not in actions or platform not in platforms:
    print(usage)
    exit(-1)


# Vars
######################################
home_repo = os.getcwd()
home_infra = "{}/infrastructure".format(home_repo)
home_code = "{}/code".format(home_repo)
home_script = "{}/infrastructure/scripts".format(home_repo)
home_repo = os.path.dirname(home_infra)

# Load ENV
######################################
load_dotenv("{}/terraform/{}/.env".format(home_infra, service))
# environments = dotenv_values("{}/terraform/{}/.env".format(home_infra, service))


# Functions
######################################

def execute(command, args=None):
    if os.system(command) != 0:
        print("[ERROR][{}][{}]".format(action, platform))
        exit(-1)
    else:
        print("[SUCCESS][{}][{}][{}][{}]".format(action, service, platform, args))


# Actions
######################################

if action == "terraform":
    # load local env
    if "CI_JOB_NAME" not in os.environ:
        # Clear
        execute("cd {}/terraform/{} && rm -rf .terraform tmp variables.*.tf .env".format(home_infra, service, platform))
        
        # Load env
        execute("cd {}/terraform/{} && cp .env.{} .env".format(home_infra, service, platform))
        load_dotenv("{}/terraform/{}/.env".format(home_infra, service))

    execute("cd {}/terraform/{} && cp env/variables.{}.tf .".format(home_infra, service, platform))
    execute('cd {}/terraform/{} && dotenv run terraform init -backend-config="address={}" -backend-config="lock_address={}/lock" -backend-config="unlock_address={}/lock" -backend-config="username={}" -backend-config="password={}" && dotenv run terraform apply -auto-approve'.format(home_infra, service, os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_USERNAME"], os.environ["GITLAB_TF_PASSWORD"]))

if action == "clear":
    execute("cd {}/terraform/{} && rm -rf .terraform tmp variables.{}.tf".format(home_infra, service, platform))

if action == "destroy":
    # load local env
    if "CI_JOB_NAME" not in os.environ:
        # Clear
        execute("cd {}/terraform/{} && rm -rf .terraform tmp variables.*.tf .env".format(home_infra, service, platform))

        # Load env
        execute("cd {}/terraform/{} && cp .env.{} .env".format(home_infra, service, platform))
        load_dotenv("{}/terraform/{}/.env".format(home_infra, service))

    execute("cd {}/terraform/{} && cp env/variables.{}.tf .".format(home_infra, service, platform))
    execute('cd {}/terraform/{} && dotenv run terraform init -backend-config="address={}" -backend-config="lock_address={}/lock" -backend-config="unlock_address={}/lock" -backend-config="username={}" -backend-config="password={}" && dotenv run terraform destroy -auto-approve'.format(home_infra, service, os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_ADDRESS"], os.environ["GITLAB_TF_USERNAME"], os.environ["GITLAB_TF_PASSWORD"]))
