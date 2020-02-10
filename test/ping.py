import subprocess
import subprocess, shlex
command = "ping www.baidu.com"
p = subprocess.Popen(shlex.split(command), stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
# 为子进程传递参数
# p.stdin.write('5\n') 
# 实时获取输出
while p.poll() == None:
    out = p.stdout.readline().strip()
    if out:
        print("sub process output: ", out)
# 子进程返回值
print ("return code: ", p.returncode)

# for item in allfiles:
#     print(item)

# cmdb = request.app['cmdb']
# count = await cmdb.cloud.count_documents({})
# print(count)
#
#
# cloud = []
# cursor = cmdb.cloud.find({})
# for document in await cursor.to_list(length=100):
#     document.pop("_id")
#
#     cloud.append(document)
#
# result = {
#     "code": 0,
#     "msg": "",
#     "count": count,
#     "data": cloud
#
# }

