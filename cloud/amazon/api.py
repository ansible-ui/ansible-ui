# /usr/bin/python evn
# coding=utf-8

from pprint import pprint
import json
import time
import boto3
import importlib
from threading import Thread

__ALL__ = ['API']


class API(Thread):
    '''
     可参考
     https://cloudaffaire.com/how-to-create-a-lamp-stack-in-aws-using-python-boto3/
    '''

    def __init__(self, func, **param):
        super(API, self).__init__()
        self.func = func
        self.param = param
        self.result = []

    def run(self):
        '''
        任务调度，根据不函数名不同进行任务作业
        '''
        if callable(getattr(self, self.func)):
            if isinstance(self.param, dict) and self.param != {}:
                self.result = getattr(self, self.func)(**self.param)
            else:
                self.result = getattr(self, self.func)()

    def get_servers(self, **params):
        '''
        获取主机内容 
        '''
        region_name = params['region_name']
        profile_name = params['profile_name']

        session = boto3.Session(region_name=region_name, profile_name=profile_name)

        ec2 = session.resource('ec2')

        for instance in ec2.instances.all():

            param = {"game": "unkown", "cluster": "unkown", "module": "unkown", 'yun': "amazon", 'region': region_name}
            param['root'] = "server"
            param['server_sn'] = instance.id
            param[
                'public_ip'] = instance.public_ip_address if instance.public_ip_address else instance.private_ip_address
            param['inner_ip'] = instance.private_ip_address
            param['create_time'] = instance.launch_time.strftime("%Y-%m-%d %H:%M:%S")
            param['is_del'] = 1 if instance.state['Name'] == 'terminated' else 0
            param['is_manage'] = 1 if instance.state['Name'] == 'running' else 0

            for idx, tag in enumerate(instance.tags, start=1):

                if tag['Key'] not in ['aws:autoscaling:groupName', 'aws:ec2launchtemplate:id',
                                      'aws:ec2launchtemplate:version',"workload-type"]:
                    param[tag['Key']] = tag['Value'].split(",")

            self.result.append(param)

        return self.result

    def get_idcs(self, **params):
        '''
        获取idc信息
        '''

        profile_name = params['profile_name']
        session = boto3.Session(profile_name=profile_name)

        client = session.client('ec2')

        for region in client.describe_regions()['Regions']:
            param = {}
            param['cloud_type'] = 'amazon'
            param['name'] = region['RegionName']
            param['prefix'] = region['RegionName']
            self.result.append(param)

        return self.result

    def get_zones(self, **params):
        '''
        获取idc信息
        '''

        profile_name = params['profile_name']
        session = boto3.Session(profile_name=profile_name)

        client = session.client('ec2')

        for region in client.describe_regions()['Regions']:
            param = {}
            param['cloud_type'] = 'amazon'
            param['project'] = profile_name
            param['name'] = region['RegionName']
            param['prefix'] = region['RegionName']
            param['zones'] = []

            importlib.reload(boto3)
            session2 = boto3.Session(profile_name=profile_name, region_name=region['RegionName'])

            client2 = session2.client('ec2')

            zones = client2.describe_availability_zones()

            for az in zones.get("AvailabilityZones"):

                if az['RegionName'] == region['RegionName']:
                    param['zones'].append(az['ZoneName'])

            self.result.append(param)

        return self.result

    def get_vpcs(self, **params):
        '''
        获取idc信息
        '''

        profile_name = params['profile_name']
        session = boto3.Session(profile_name=profile_name)

        client = session.client('ec2')

        index = 1
        for region in client.describe_regions()['Regions']:



            importlib.reload(boto3)
            session3 = boto3.Session(profile_name=profile_name, region_name=region['RegionName'])

            client3 = session3.resource('ec2')

            for vpc in client3.vpcs.all():

                param = {}

                # param['_id'] = index
                param['cloud_type'] = 'amazon'
                param['project'] = profile_name
                param['region_name'] = region['RegionName']
                param['region_prefix'] = region['RegionName']
                param["vpc_id"] = vpc.id
                param["vpc_cidr"] = vpc.cidr_block
                param['subnet_and_zone'] = []
                param["vpc_name"] = ""


                if vpc.tags != None:
                    for tag in vpc.tags:
                        if tag['Key'] == "Name":
                            param["vpc_name"] = tag['Value']

                for subnet in vpc.subnets.all():

                    #print(subnet.vpc,subnet.vpc_id, subnet.subnet_id, subnet.cidr_block, subnet.availability_zone)




                    temp_subnet = {}
                    temp_subnet["zone_name"] = subnet.availability_zone
                    temp_subnet["subnet_id"] = subnet.subnet_id,
                    temp_subnet["subnet_cidr"] = subnet.cidr_block

                    param['subnet_and_zone'].append(temp_subnet)


                index =  index +1

                self.result.append(param)

        return self.result

    def get_balancers(self, **params):

        '''
        获取用于负载均衡的机器信息
        '''

        region_name = params['region_name']
        profile_name = params['profile_name']

        session = boto3.Session(region_name=region_name, profile_name=profile_name)

        elb = session.client("elbv2")

        bs = elb.describe_load_balancers()

        for b in bs['LoadBalancers']:
            param = {"game": "unkown", "cluster": "unkown", "module": "unkown", 'yun': "amazon", 'region': region_name}
            param['root'] = "balancers"
            param['server_sn'] = b['LoadBalancerName']
            param['public_ip'] = b['DNSName']
            param['inner_ip'] = b['DNSName']

            param['create_time'] = b['CreatedTime'].strftime("%Y-%m-%d %H:%M:%S")
            param['is_del'] = 1 if b['State']['Code'] == 'failed' else 0
            param['is_manage'] = 1 if b['State']['Code'] == 'active' else 0

            # groups = elb.describe_target_groups(LoadBalancerArn=b['LoadBalancerArn'])
            # for g in groups['TargetGroups']:
            #
            #     children = []
            #     bls = elb.describe_target_health(TargetGroupArn=g['TargetGroupArn'])
            #     for b in bls['TargetHealthDescriptions']:
            #         children.append(b['Target']['Id'])
            #     param['children'] = children

            res = elb.describe_tags(
                ResourceArns=[
                    b['LoadBalancerArn'],
                ]
            )

            for tag in res['TagDescriptions'][0]['Tags']:
                param[tag['Key']] = tag['Value'].split(",")

            self.result.append(param)

        return self.result

    def get_rds(self, **params):

        '''
        获取rds信息
        '''

        region_name = params['region_name']
        profile_name = params['profile_name']

        session = boto3.Session(region_name=region_name, profile_name=profile_name)

        client = session.client("rds")

        bs = client.describe_db_instances()

        for i in bs['DBInstances']:

            param = {"game": "unkown", "cluster": "unkown", "module": "unkown", 'yun': "amazon", 'region': region_name}
            param['root'] = "database"
            param['server_sn'] = i['DbiResourceId']
            param['public_ip'] = i['Endpoint']['Address']
            param['inner_ip'] = i['Endpoint']['Address']
            param['create_time'] = i['InstanceCreateTime'].strftime("%Y-%m-%d %H:%M:%S")
            param['is_del'] = 0 if i['DBInstanceStatus'] == 'available' else 1
            param['is_manage'] = 1 if i['DBInstanceStatus'] == 'available' else 0

            resp2 = client.list_tags_for_resource(
                ResourceName=i['DBInstanceArn']
            )

            for tag in resp2['TagList']:
                param[tag['Key']] = tag['Value'].split(",")

            param['port'] = i['Endpoint']['Port']
            param['engine'] = i['Engine']

            self.result.append(param)

        return self.result

    def add_tags(self, **params):

        #region_name = params['region_name']
        profile_name = params['profile_name']
        ids = params['ids']  # 列表
        tags = params['tags']  # 列表中嵌套字典

        session = boto3.Session( profile_name=profile_name)

        ec2 = session.client("ec2")

        ec2.create_tags(
            Resources=ids,
            Tags=tags
        )

    def get_result(self):

        return self.result
