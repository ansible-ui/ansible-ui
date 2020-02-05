# routes.py
import pathlib
import os

import aiohttp_jinja2
import jinja2
from aiohttp import web

from apps.win10.view import *
from apps.cloud.view import *
from apps.soft.view import *
from apps.cmdb.view import *

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def setup_routes(app):
    app.router.add_get('', handler_win10),

    app.router.add_get('/cloud', handler_cloud),
    app.router.add_get('/cloud/terraform_list', handle_terraform_list),
    app.router.add_post('/cloud/terraform_read', handle_terraform_read),
    app.router.add_post('/cloud/terraform_write', handle_terraform_write),
    app.router.add_get('/cloud/ws', ws_terraform_run)

    app.router.add_get('/soft', handler_soft),
    app.router.add_get('/soft/ansible_list', handle_ansible_list),
    app.router.add_post('/soft/ansible_read', handle_ansible_read),
    app.router.add_post('/soft/ansible_write', handle_ansible_write),
    app.router.add_get('/soft/ws', ws_ansible_run)

    app.router.add_get('/cmdb', handler_cmdb),
    app.router.add_route('GET', '/cmdb/servers_list', handle_servers_list),

    # app.router.add_get('/session', handler_session),

    # app.router.add_get('/', index)
    # app.router.add_get('/poll/{question_id}', poll, name='poll')
    # app.router.add_get('/poll/{question_id}/results',
    #                    results, name='results')
    # app.router.add_post('/poll/{question_id}/vote', vote, name='vote')


def setup_static_routes(app):
    app.router.add_static('/static/',
                          path=os.path.join(BASE_DIR, "static"),
                          name='static')


def setup_templates_routes(app):
    # setup Jinja2 template renderer
    # 模板
    aiohttp_jinja2.setup(app,
                         loader=jinja2.FileSystemLoader(os.path.join(BASE_DIR, "templates")))
