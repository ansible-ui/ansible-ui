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

import aiohttp_jinja2
from aiohttp import web

from aiohttp.http_exceptions import HttpBadRequest

from libs.wechat import Notify


@aiohttp_jinja2.template('win10.html')
async def handler_win10(request):
    
    tpl = {'title': '服务器发骚中', 'description': '发骚中，需要重启',
           'task_id': 'task_6', 'url': 'https://www.baidu.com'}
    try:
        send_msg = await Notify().send_message(**tpl)
    except HttpBadRequest as e:
        web.logging.getLogger('Notify Error').error(e)
        

    return {'name': 'Andrew', 'age': 'Svetlov'}
