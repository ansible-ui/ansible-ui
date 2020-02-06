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

import os
import asyncio
import motor.motor_asyncio

import aiohttp
from aiohttp import web

import aiohttp_jinja2
import jinja2


@aiohttp_jinja2.template('cmdb.html')
async def handler_cmdb(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}


async def handle_servers_list(request):
    cmdb = request.app['cmdb']
    server_count = await  cmdb.assets.count_documents({})

    cursor = cmdb.assets.find({"root": "server"})

    cursor.skip(1).limit(2)

    data = []
    async for document in cursor:

        if document.get('_id'):
            del document['_id']
        data.append(document)

    result = {
        "code": 0,
        "msg": "",
        "count": server_count,
        "data": data
    }

    return web.json_response(result)


async def handle_crontab_task(request):
    cmdb = request.app['cmdb']
    params = {"cloud": "amazon", "game": "auror", "region": "us-east-1"}

    from cloud.api import api
    t1 = api(params['cloud'], 'get_rds', {"profile_name": params['game'], "region_name": params['region']})
    data1 = t1.get_result()

    t2 = api(params['cloud'], 'get_servers', {"profile_name": params['game'], "region_name": params['region']})
    data2 = t2.get_result()

    t3 = api(params['cloud'], 'get_balancers', {"profile_name": params['game'], "region_name": params['region']})
    data3 = t3.get_result()

    data = []
    data.extend(data1)
    data.extend(data2)
    data.extend(data3)

    from copy import deepcopy
    for server in deepcopy(data):

        r = await cmdb.assets.find_one({"server_sn": server['server_sn']})

        if r == None:
            result = await cmdb.assets.insert_one(server)

        else:
            await cmdb.assets.update_one({"server_sn": server['server_sn']}, server)

    return web.json_response(data)
