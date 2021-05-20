一个简单（陋）的工具，作用是下载 git 仓库，然后删除里面的 git
通过一个 url 的json格式的文件，共同管理，这里默认的先用git仓库的，后面可以再定一个

## 帮助 -h
## 初始化/更新
acli --conf-update

## 更换 config url 地址
acli --conf-reset [newcurl]

## 地址输出一个json格式的配置，具体参考
https://github.com/AylaAsia-RickyZheng/a-fe-cli-config

## 执行
acli [-o] [dirname]
执行后就可以选模版了