import logging
import sys
import os
import asyncio

from aiohttp import web

from settings import Settings
from db import close_pg, init_pg
from middlewares import setup_middlewares, setup_sessions
from routes import setup_routes,setup_static_routes,setup_templates_routes



async def init_app(argv=None):

    # app = web.Application()
    loop = asyncio.get_event_loop()
    app =  web.Application(loop=loop)

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

    app = init_app(argv)


    web.run_app(app,
                host=Settings.web_config['host'],
                port=Settings.web_config['port'])


if __name__ == '__main__':


    main(sys.argv[1:])
