import asyncio
import os

import aiohttp
from aiohttp.http_exceptions import HttpBadRequest


class BaseConfig:
    _corpecret = os.getenv('CORPSECRET')
    _corpid = os.getenv('CORPID')
    _agent_id = os.getenv('AGENTID')

    def __init__(self):
        self.check_config()

    def check_config(self):
        if all([self._corpecret, self._corpid, self._agent_id]) == False:
            raise HttpBadRequest('config error')


class MsgTpl(BaseConfig):

    @classmethod
    def card_tpl(cls, title, description, task_id, touser=['@all'], url=''):
        '''
        title: 消息标题
        description: 消息描述
        task_id: **重要** 任务ID
        touser: [] 通知的用户 @all 是全部发送
        '''
        return {
            'touser': '|'.join(touser),
            'msgtype': 'taskcard',
            'agentid': cls._agent_id,
            'taskcard': {
                'title': title,
                'description': description,
                'url': url,
                'task_id': task_id,
                'btn': [
                    {
                        "key": "confirm",
                        "name": "立即重启",
                        "replace_name": "处理中",
                        "color": "red",
                        "is_bold": True
                    },
                    {
                        "key": "cancel",
                        "name": "拒绝",
                        "replace": "已取消"
                    }
                ]
            }
        }


class Notify(BaseConfig):

    _access_token = None

    # URI
    base_url = 'https://qyapi.weixin.qq.com/cgi-bin%(uri)s'

    def __init__(self):
        super().__init__()

    def check_config(self):
        if all([self._corpecret, self._corpid, self._agent_id]) == False:
            raise HttpBadRequest('config error')

    @property
    async def access_token(self):
        uri = '/gettoken'
        params = {'corpid': self._corpid, 'corpsecret': self._corpecret}

        if self._access_token:
            return self._access_token
        else:
            token = await self.mask_request(method='GET', params=params, uri=uri)
            self._access_token = token['access_token']

            return self._access_token

    async def send_message(self, title, description, task_id, touser=['@all'], url='', **kwargs):
        '''
        title: 消息标题
        description: 消息描述
        task_id: **重要** 任务ID
        touser: [] 通知的用户 @all 是全部发送
        '''
        uri = '/message/send'
        params = {'access_token': await self.access_token}

        body = MsgTpl.card_tpl(
            title=title, description=description, task_id=task_id, touser=touser, url=url)
        return await self.mask_request('POST', uri,  params=params, body=body)

    async def mask_request(self, method, uri, params={}, body={}, **kwargs):
        '''
        uri: 接口URI `/gettoken`, `/send`
        method: 方法, GET, POST ....
        params: 追加参数
        body: post 体, 格式为数组 {} # POST的时候才有用
        '''
        url = self.base_url % {'uri': uri}

        client_session = aiohttp.ClientSession(raise_for_status=True)
        async with client_session as session:
            if method == 'GET':

                resp = await client_session.request(method=method, url=url, params=params)
            elif method == 'POST':

                resp = await client_session.request(method=method, url=url, params=params, json=body)
            else:

                raise HttpBadRequest('not validate method')

        async with resp:
            if resp.status != 200:
                raise HttpBadRequest({'status': resp.status})

            resp_json = await resp.json()

            if resp_json['errcode'] > 0:
                raise HttpBadRequest(resp_json)

            return resp_json
