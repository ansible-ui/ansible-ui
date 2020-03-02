#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
# @Time    : 2020-01-16  15:53
# @Author  : 行颠
# @Email   : 0xe590b4@gmail.com
# @File    : view
# @Software: view
# @DATA    : 2020-01-16
"""

import sys
import unittest

sys.path.append('../')
from cloud.api import api

class Test_Rebot(unittest.TestCase):


    def setUp(self):
        print("测试用例执行前的初始化操作========")

    def tearDown(self):
        print("测试用例执行完之后的收尾操作=====")



    def test_subTwoNum_02(self):

        # params = {"cloud": "amazon", "profile_name": "auror", "region": "us-east-1"}
        params_list = [
            {'cloud': 'amazon', 'region_name': 'us-east-1', 'profile_name': "antia"},
            {'cloud': 'amazon', 'region_name': 'us-west-2', 'profile_name': "antia"},
            {'cloud': 'amazon', 'region_name': 'us-west-2', 'profile_name': "platform"},
            {'cloud': 'amazon', 'region_name': 'us-west-2', 'profile_name': "auror"},
            {'cloud': 'amazon', 'region_name': 'us-east-1', 'profile_name': "auror"},
            {'cloud': 'amazon', 'region_name': 'ap-southeast-1', 'profile_name': "auror"},
            {'cloud': 'amazon', 'region_name': 'eu-west-1', 'profile_name': "animatch"},
            {'cloud': 'amazon', 'region_name': 'us-west-2', 'profile_name': "animatch"}
        ]

        for params in params_list:

            t1 = api(params['cloud'], 'get_rds', {"profile_name": params['profile_name'], "region_name": params['region_name']})
            data1 = t1.get_result()

            t2 = api(params['cloud'], 'get_servers', {"profile_name": params['profile_name'], "region_name": params['region_name']})
            data2 = t2.get_result()

            t3 = api(params['cloud'], 'get_balancers', {"profile_name": params['profile_name'], "region_name": params['region_name']})
            data3 = t3.get_result()

            data = []
            data.extend(data1)
            data.extend(data2)
            data.extend(data3)

            from copy import deepcopy

            for server in deepcopy(data):

                if server['root'] =="server" and  (server['game'] ==  'unkown' or server['cluster'] ==  'unkown'):
                    print(server)


if __name__ == '__main__':
    unittest.main()
