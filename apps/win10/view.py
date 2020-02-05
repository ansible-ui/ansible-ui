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

from aiohttp import web
import aiohttp_jinja2

@aiohttp_jinja2.template('win10.html')
async def handler_win10(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}
