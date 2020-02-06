#/usr/bin/python
#coding=utf-8


import types
import json
import importlib
import importlib.util


def check_module(module_name):
    module_spec = importlib.util.find_spec(module_name)
    if module_spec is None:
        print("Module :{} not found".format(module_name))
        return None
    else:
        # print("Module:{} can be imported!".format(module_name))
        return module_spec
    
def import_module_from_spec(module_spec):
    module = importlib.import_module(module_spec)
    return module



class api():
    '''
    本模块自动加载yun中的不同的模块类型，并运行，与实际业务无关，放置在yun包中
    '''
    def __init__(self,package_name,func_name,param ={}):
        
        self.package_name = package_name
        self.func_name    = func_name
        self.param        = param
        self.mod          = None
            

        
    def get_result(self): 
        
        import_str = 'cloud.%s.api'%self.package_name


        #检查模块可用性
        if check_module(import_str) == None:
            exit()

        #自动加载模块
        self.mod = import_module_from_spec(import_str)   
        
        #实例化 运行
        object = None
        
        if self.param == {}:
            
            object = getattr(self.mod, 'API')(self.func_name)
        else:
            
            object = getattr(self.mod, 'API')(self.func_name,**self.param)
            
        object.start()
        object.join()
        
        return object.get_result()

