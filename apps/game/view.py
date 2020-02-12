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

@aiohttp_jinja2.template('game/game.html')
async def handler_game(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}


@aiohttp_jinja2.template('game/workflow.html')
async def handler_game_workflow(request):
    return {'name': 'Andrew', 'age': 'Svetlov'}

