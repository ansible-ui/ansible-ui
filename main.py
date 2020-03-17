import logging
import sys
import os
import argparse
import uvloop
import asyncio

from aiohttp import web

from settings import Settings
from db import close_pg, init_pg
from middlewares import setup_middlewares, setup_sessions
from routes import setup_routes,setup_static_routes,setup_templates_routes

import aiohttp_debugtoolbar
from aiohttp_debugtoolbar import toolbar_middleware_factory

async def init(argv=None):

    # app = web.Application()
    loop = asyncio.get_event_loop()

    app = web.Application(loop=loop)
    # app = web.Application(loop=loop, middlewares=[toolbar_middleware_factory])
    # aiohttp_debugtoolbar.setup(app)
    #http://127.0.0.1:9000/_debugtoolbar

    app['settings'] = Settings

    # create db connection on startup, shutdown on exit
    app.on_startup.append(init_pg)
    app.on_cleanup.append(close_pg)

    # setup views and routes
    setup_routes(app)
    setup_static_routes(app)
    setup_templates_routes(app)
    

    # set up 
    setup_middlewares(app)
    setup_sessions(app)

    return app


def main(argv):
    logging.basicConfig(level=logging.INFO)
    #
    # app = init_app(argv)
    #
    #
    # web.run_app(app,
    #             host=Settings.web_config['host'],
    #             port=Settings.web_config['port'])
    #
    # return  app

    parser = argparse.ArgumentParser(description="aiohttp server start")
    parser.add_argument('--host', type=str, default='127.0.0.1', help='this is a host')
    parser.add_argument('--port', type=str, default='8080', help='this is a port')
    args = parser.parse_args()
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
    loop = asyncio.get_event_loop()
    app = init(loop)
    web.run_app(app, host=args.host, port=args.port)

if __name__ == '__main__':


    main(sys.argv[1:])
