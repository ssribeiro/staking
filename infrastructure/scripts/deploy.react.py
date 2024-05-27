import sys
import os
import uuid
import mimetypes
import boto3
import json
from dotenv import load_dotenv

load_dotenv()

# Args
######################################
apps = ["staking"]
platforms = ["dev", "prd"]
usage = 'Usage [{}] [{}]'.format(' | '.join(apps), ' | '.join(platforms))

if len(sys.argv) != 3:
    print(usage)
    exit(-1)

service = sys.argv[1]
platform = sys.argv[2]

# Vars
######################################
home_repo = os.getcwd()

with open('{}/infrastructure/scripts/config/constants.config.json'.format(home_repo), 'r') as configuration_file:
    config_constants = json.load(configuration_file)

home_code = "{}/code".format(home_repo)
home_script = "{}/infrastructure/scripts".format(home_repo)
app = config_constants['app']
region = config_constants['region']

# Functions
######################################


# Upload folder to S3
def upload_to_s3(bucket_name, folder_path):
    try:
        client = boto3.client('s3')  # Access key & secret key from the env

        for root, dirs, files in os.walk(folder_path):
            for filename in files:
                try:
                    extension = os.path.splitext(filename)[-1]
                    content_type = mimetypes.types_map[extension]
                except Exception:
                    content_type = 'text/plain'
                local_path = os.path.join(root, filename)
                relative_path = os.path.relpath(local_path, folder_path)
                cache_control = 0 if relative_path.find('html') != -1 else 3600
                client.upload_file(local_path, bucket_name, relative_path, ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'max-age={}'.format(cache_control),
                    'ACL': "public-read"
                })

        print("[SUCCESS][Deploy][{}][{}] Uploaded to S3 !".format(app, platform))
    except Exception as e:
        print(e)
        print("[ERROR][Deploy][{}][{}] S3 upload failed".format(app, platform))
        exit(-1)


def clear_s3(bucket_name):
    try:
        s3 = boto3.resource('s3')  # Access key & secret key from the env
        bucket = s3.Bucket(bucket_name)
        bucket.objects.all().delete()

        print("[SUCCESS][Deploy][{}][{}] Clear S3 !".format(app, platform))
    except Exception:
        print("[ERROR][Deploy][{}][{}] Clear failed".format(app, platform))
        exit(-1)


def invalidate_cdn(cloudfront_id):
    cloudfront = boto3.client('cloudfront')  # Access key & secret key from the env

    caller_id = str(uuid.uuid4)
    response = cloudfront.create_invalidation(
        DistributionId=cloudfront_id,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': [
                    '/*',
                ]
            },
            'CallerReference': caller_id
        }
    )

    status_code = response['ResponseMetadata']['HTTPStatusCode']
    invalidation_id = response['Invalidation']['Id']
    print("[SUCCESS][CDN][{}][{}] success".format(status_code, invalidation_id))


def execute(command, args=None):
    if os.system(command) != 0:
        print("[ERROR][{}]".format(platform))
        exit(-1)
    else:
        print("[SUCCESS][{}][{}]".format(args, platform))

# Actions
######################################

project = config_constants['projects'][service]
bucket_name = "{}-{}-{}".format(app, platform, project['bucket'])
path = '{}/{}'.format(home_code, project['folderToDeploy'])

# npm install
execute("cd {}/{} && npm install --registry https://registry.npmjs.org/".format(home_code, project['folder'], app))

print('=> Install ended')
print('=> Build started')

# npm run generate
execute("cd {}/{} && npm run build:{}".format(home_code, project['folder'], platform))

print('=> Build end')

# Clear S3
clear_s3(bucket_name)

# Upload S3
upload_to_s3(bucket_name, path)

# Clear the CDN
invalidate_cdn(project['env'][platform]['cdnID'])

print("[SUCCESS][DEPLOY FILE][{}][{}] success".format(bucket_name, platform))


