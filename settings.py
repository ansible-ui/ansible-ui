# settings.py


class Settings(object):

    web_config = {

            'host': '127.0.0.1',
            'port': 8080
        }


    mongodb_config = {

            'host': '127.0.0.1',
            'port': 27017
        }

    ansible_game_workspace = "/data/ansible_game_workspace"

    ansible_soft_workspace = "/data/ansible_soft_workspace"

    terraform_workspace = "/data/terraform_workspace"
