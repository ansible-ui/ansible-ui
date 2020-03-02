# keiTang


### 环境准备

    pip3 install -r requirements.txt
  
### 运行

   
    python3 main.py
   
  
    
### 预览


![image](https://github.com/multi-cloud-devops/keiTang/blob/master/1.png)

![image](https://github.com/multi-cloud-devops/keiTang/blob/master/2.png)

![image](https://github.com/multi-cloud-devops/keiTang/blob/master/3.png)


### 运行方式2

#### 代码依赖库
```
motor = "==2.1.0"
cchardet = "==2.1.5"
aiodns = "==2.0.0"
aiohttp = "==3.6.2"
aiohttp-jinja2 = "==1.2.0"
aiohttp-swagger = "==1.0.14"
aiohttp-session = "==2.9.0"
pytest-aiohttp = "==0.3.0"
Jinja2 = "==2.10.3"
cryptography = "==2.8"
```

1. 安装 `pipenv`
   ```shell
   $ pip3 install pipenv
   ```
2. 初始化环境 
   ```shell
   # python3 环境 如果是2.7 pipenv install --two
   $ pipenv install --three
   ```
   ⌛️。。。。
3. 进入虚拟环境
   ```shell
   $ pipenv shell 
   ```
    也可以不进入，执行命令 `pipenv run `
4. 启动环境
   1. 进入虚拟环境之后，执行`python main.py`
   2. 虚拟环境外执行，`pipenv run python main.py`

5. 查看当前环境，依赖的环境
   1. `pipenv graph`


### 其他依赖文档

1. [企业微信发送库](libs/README.md)