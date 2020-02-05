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




def handle_ansible_list(request):

    root_dir = request.app['BASE_DIR']
    dir_path = "{}/ansible_playbooks".format(root_dir)

    result = get_tree(dir_path)

    return web.json_response(result)


async def handle_ansible_read(request):
    post = await request.post()

    data = read_t_file(post['filename'])
    return web.json_response({"code": 1, "data": data})


async def handle_ansible_write(request):
    post = await request.post()

    data = write_t_file(post['path'], post['code'])
    return web.json_response({"code": 1, "data": data})



async def ws_ansible_run(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    async for msg in ws:
        print(msg)
        if msg.type == aiohttp.WSMsgType.TEXT:
            print(msg.data)
            if msg.data == 'close':
                await ws.close()
            else:


                import subprocess
                import subprocess, shlex
                command = "ansible -i {}/playbooks/hosts all -m ping".format(request.app['BASE_DIR'])
                p = subprocess.Popen(shlex.split(command), stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
                # 为子进程传递参数
                # p.stdin.write('5\n') 
                # 实时获取输出
                while p.poll() == None:
                    out = p.stdout.readline().strip()
                    if out:
                        print("sub process output: ", out)
                        await ws.send_str(out.decode(encoding='utf-8', errors='strict'))
                # 子进程返回值
                print ("return code: ", p.returncode)

                        

    return ws

