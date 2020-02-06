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
    game = cmdb.game.find()
    print(game)
    result = {
        "code": 0,
        "msg": "",
        "count": 3000000,
        "data": [
            {
            "id": "10001",
            "username": "杜甫",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "点击此处，显示更多。当内容超出时，点击单元格会自动显示更多内容。",
            "experience": "116",
            "ip": "192.168.0.8",
            "logins": "108",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10002",
            "username": "李白",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "君不见，黄河之水天上来，奔流到海不复回。 君不见，高堂明镜悲白发，朝如青丝暮成雪。 人生得意须尽欢，莫使金樽空对月。 天生我材必有用，千金散尽还复来。 烹羊宰牛且为乐，会须一饮三百杯。 岑夫子，丹丘生，将进酒，杯莫停。 与君歌一曲，请君为我倾耳听。(倾耳听 一作：侧耳听) 钟鼓馔玉不足贵，但愿长醉不复醒。(不足贵 一作：何足贵；不复醒 一作：不愿醒/不用醒) 古来圣贤皆寂寞，惟有饮者留其名。(古来 一作：自古；惟 通：唯) 陈王昔时宴平乐，斗酒十千恣欢谑。 主人何为言少钱，径须沽取对君酌。 五花马，千金裘，呼儿将出换美酒，与尔同销万古愁。",
            "experience": "12",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14",
            "LAY_CHECKED": True
            },
            {
            "id": "10003",
            "username": "王勃",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "65",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10004",
            "username": "李清照",
            "email": "xianxin@layui.com",
            "sex": "女",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "666",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10005",
            "username": "冰心",
            "email": "xianxin@layui.com",
            "sex": "女",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "86",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10006",
            "username": "贤心",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "12",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10007",
            "username": "贤心",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "16",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            },
            {
            "id": "10008",
            "username": "贤心",
            "email": "xianxin@layui.com",
            "sex": "男",
            "city": "浙江杭州",
            "sign": "人生恰似一场修行",
            "experience": "106",
            "ip": "192.168.0.8",
            "logins": "106",
            "joinTime": "2016-10-14"
            }
        ]
    }
    return web.json_response(result)




async def handle_crontab_task(request):

    params = {"cloud":"amazon","game":"auror","region":"us-east-1"}
    from cloud.api import api
    t1 = api(params['cloud'], 'get_rds', {"profile_name": params['game'], "region_name": params['region']})
    data1 = t1.get_result()

    t2 = api(params['cloud'], 'get_servers', {"profile_name": params['game'], "region_name": params['region']})
    data2 = t2.get_result()

    t3 = api(params['cloud'], 'get_balancers', {"profile_name": params['game'], "region_name": params['region']})
    data3 = t3.get_result()

    data = data1 + data2 + data3

    for server in data:
        print(server)
        # r = AssetsDao.get({"server_sn": server['server_sn']})
        # if r == None:
        #
        #     AssetsDao.insert(server)
        # else:
        #
        #     AssetsDao.update({"server_sn": server['server_sn']}, server)

    return web.json_response(data)
