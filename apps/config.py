#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
# @Time    : 2020-02-03  10:41
# @Author  : 行颠
# @Email   : 0xe590b4@gmail.com
# @File    : config
# @Software: kunlun
# @DATA    : 2020-02-03
"""

import os
import os.path
import yaml


def get_files_data(dirpath, jsonlist):
    index = 0

    root_depth = len(dirpath.split(os.path.sep))

    for root, dirs, files in os.walk(dirpath,topdown=True):


        files = [f for f in files if not f[0] == '.']
        dirs[:] = [d for d in dirs if not d[0] == '.']


        for d in dirs:

            dir_path = os.path.join(root, d)
            dir_depth = len(dir_path.split(os.path.sep))

            if d[0] == ".": continue
            if index == 0:

                jsondict = {"id": os.path.join(root, d), "parent_id": 0, "level_id": int(dir_depth-root_depth),
                            "path": os.path.join(root, d), "title": d, "type": "dir"}
                jsonlist.append(jsondict)
            else:
                jsondict = {"id": os.path.join(root, d), "parent_id": root, "level_id":int(dir_depth-root_depth),
                            "path": os.path.join(root, d), "title": d, "type": "dir"}
                jsonlist.append(jsondict)


        for f in files:
            if f[0] == ".": continue

            if index == 0:
                jsondict = {"id": os.path.join(root, f), "parent_id": 0,
                            "path": os.path.join(root, f), "title": f, "type": "file"}

            else:

                jsondict = {"id": os.path.join(root, f), "parent_id": root,
                            "path": os.path.join(root, f), "title": f, "type": "file"}

            jsonlist.append(jsondict)


        index = index + 1


def get_tree(dir_path):
    jsonlist = list()
    get_files_data(dir_path, jsonlist)

    new_data = []  # 定义一个与 data 一模一样的新列表
    d_data = []  # 定义一个最终需要的列表

    for d in jsonlist:
        d["children"] = []
        new_data.append(d)
    # 先为每一个元素，也就是每一个字典增加一个 key="son"

    son_id = []  # 定义一个元素为所有子元素的 id 的列表

    for d in jsonlist:
        for nd in new_data:  # 双层循环，寻求用笛卡尔积的模式来实现子节点嵌套
            if d["id"] == nd["parent_id"]:  # 如果一个元素的 bid 与另一个元素的 id 相同
                d["children"].append(nd)  # 就将另一个元素设为该元素的 “son” 键的值
                son_id.append(nd["id"])  # 将子元素的 id 记录到 son_id 列表
        if d["id"] not in son_id:  # 在外层循环中判断该元素的 id 是否在 son_id 列表中
            d_data.append(d)  # 如果不是，则将该元素添加到最终目标的 d_data 列表中

    return d_data


def read_t_file(filename):
    # 读取文件按行读取到列表中
    with open(filename) as f:
        lines = f.readlines()

        return lines


def write_t_file(filename, data):
    with open(filename, 'w') as file_obj:
        file_obj.write(data)


def read_yaml_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return yaml.load(f, Loader=yaml.FullLoader)


