import motor.motor_asyncio

async def init_pg(app):
    # conf = app['config']['postgres']
    # engine = await aiopg.sa.create_engine(
    #     database=conf['database'],
    #     user=conf['user'],
    #     password=conf['password'],
    #     host=conf['host'],
    #     port=conf['port'],
    #     minsize=conf['minsize'],
    #     maxsize=conf['maxsize'],
    # )

    engine = motor.motor_asyncio.AsyncIOMotorClient("127.0.0.1", 27017)

    app['cmdb'] = engine["test"]


async def close_pg(app):
    app['cmdb'].close()
    await app['cmdb'].wait_closed()

