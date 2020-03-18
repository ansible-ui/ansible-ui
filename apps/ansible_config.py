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


def get_ansible_hosts_data(result):



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

    for host in result:
        hosts_info['ip_list'].append({
            'public_ip': host['public_ip'],
            'inner_ip': host['inner_ip']
        })
    hosts_list.append(hosts_info)

    hosts_file = tempfile.mktemp()
    hosts_file = "/tmp/2.txt"

    with open(hosts_file, 'w+', encoding='utf-8') as file:
        hosts = []

        for host in hosts_list:
            hosts.append('[{role}]'.format(**host))

            for h in host['ip_list']:
                hosts.append(h['public_ip'])

            hosts.append('[{role}:vars]'.format(**host))
            for vars in host['vars_list']:
                hosts.append("{key}={value}".format(**vars))

        file.write('\n'.join(hosts))
    return hosts_file

