import motor.motor_asyncio

async def init_pg(app):

    host = app['settings'].mongodb_config['host']
    port = app['settings'].mongodb_config['port']
    engine = motor.motor_asyncio.AsyncIOMotorClient(host, port)

    app['cmdb_con'] = engine
    app['cmdb'] = engine["test"]


async def close_pg(app):
    app['cmdb_con'].close()
    # await app['cmdb_con'].wait_closed()


