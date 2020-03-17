#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
# @Time    : 2020-03-16  18:28
# @Author  : 行颠
# @Email   : 0xe590b4@gmail.com
# @File    : ansible_config
# @Software: macross
# @DATA    : 2020-03-16
"""

import tempfile


async def get_ansible_hosts_data(request):

    cmdb = request.app['cmdb']
    result = cmdb.assets.find({"root": "database"})

    """
    构造ansible hosts内容结构
    """

    hosts_list = []

    hosts_info = {
        'role': "web",
        'vars_list': [
            {'key': 'module', 'value': "web"}
        ],
        'ip_list': []}

    for host in await result.to_list(length=1000):
        hosts_info['ip_list'].append({
            'public_ip': host['public_ip'],
            'inner_ip': host['inner_ip']
        })
    hosts_list.append(hosts_info)

    print(hosts_list)
    hosts_file = tempfile.mktemp()
    print(hosts_file)

    hosts_file = "/data/2.txt"

    with open(hosts_file, 'w+', encoding='utf-8') as file:
        hosts = []

        for host in hosts_list:
            hosts.append('[{game}_{cluster}_{module}]'.format(**host))

            for h in host['ip_list']:
                hosts.append(h['public_ip'])

            # hosts.append('[{game}_{cluster}_{module}:vars]'.format(**host))
            # for vars in host['vars_list']:
            #     hosts.append("{key}={value}".format(**vars))

        file.write('\n'.join(hosts))
    return hosts_file
