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

@aiohttp_jinja2.template('soft/soft.html')
async def handler_soft(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}


@aiohttp_jinja2.template('soft/workflow.html')
async def handler_soft_workflow(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}


async def handler_soft_workflow_roles(request):
    post = await request.post()
    result = read_yaml_file(post['path'])

    roles = result[0]['roles']
    return web.json_response(roles)



async def handler_ansible_list(request):

    dir_path =  request.app['settings'].ansible_workspace

    result = get_tree(dir_path)

    return web.json_response(result)


async def handler_ansible_read(request):
    post = await request.post()

    data = read_t_file(post['filename'])
    return web.json_response({"code": 1, "data": data})


async def handler_ansible_write(request):
    post = await request.post()

    data = write_t_file(post['path'], post['code'])
    return web.json_response({"code": 1, "data": data})



async def ws_ansible_run(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    async for msg in ws:

        if msg.type == aiohttp.WSMsgType.TEXT:

            if msg.data == 'close':
                await ws.close()
            else:


                import subprocess
                import subprocess, shlex

                data2 = json.loads(msg.data)
                work_path = os.path.dirname(os.path.abspath(data2['path']))

                command = "ansible -i hosts all -m ping"
                p = subprocess.Popen(shlex.split(command), stdout=subprocess.PIPE,
                                     stderr=subprocess.STDOUT,cwd=work_path )
                # 实时获取输出
                while p.poll() == None:
                    out = p.stdout.readline().strip()

                    err = p.stderr

                    if err:
                        print("sub process err: ", err)

                    if out:
                        print("sub process output: ", out)
                        await ws.send_str(out.decode(encoding='utf-8', errors='strict'))

                # 子进程返回值
                await ws.send_str("return code: {} ".format(p.returncode) )

                        

    return ws

