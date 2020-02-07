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



from apps.config import  *


@aiohttp_jinja2.template('cloud/cloud.html')
async def handler_cloud(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}


def handler_terraform_list(request):


    root_dir = request.app['BASE_DIR']
    dir_path = "{}/terraform_playbooks".format(root_dir)

    result = get_tree(dir_path)

    return web.json_response(result)


async def handler_terraform_read(request):
    post = await request.post()

    data = read_t_file(post['filename'])
    return web.json_response({"code": 1, "data": data})


async def handler_terraform_write(request):
    post = await request.post()

    data = write_t_file(post['path'], post['code'])
    return web.json_response({"code": 1, "data": data})


# async def handle_terraform_save(request):
#     # parameters = request.rel_url.query
#     parameters = await request.post()
#
#     cmdb = request.app['cmdb']
#     res = await cmdb.terraform.insert_one({"code": parameters['code']})
#     print(res.inserted_id)
#     return web.json_response({"code": 1, "data": []})


async def ws_terraform_run(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    async for msg in ws:

        if msg.type == aiohttp.WSMsgType.TEXT:
            # print(msg.data)

            if msg.data == 'close':
                await ws.close()
            else:
                data2 = json.loads(msg.data)
                work_path = os.path.dirname(os.path.abspath(data2['path']))

                import subprocess
                import subprocess, shlex
                command = "terraform apply -auto-approve"


                p = subprocess.Popen(shlex.split(command),
                                     stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.STDOUT,cwd=work_path )


                # 实时获取输出
                while p.poll() == None:
                    out = p.stdout.readline().strip()

                    if out:
                        print("sub process output: ", out)

                        result  = out.decode(encoding='utf-8', errors='strict')
                        await ws.send_str(result)

                # 子进程返回值
                await ws.send_str("return code: {} ".format(p.returncode) )



    return ws
