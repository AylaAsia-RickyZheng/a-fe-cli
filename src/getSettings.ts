const https = require('https')
const http = require('http')
const url = require('url')
import Configstore from 'configstore'
const conf = new Configstore('cli');
const CONF_URL = 'configUrl'
const CONF = 'config'

export function getConfigUrl() {
  const defaultConfigUrl = 'https://raw.githubusercontent.com/AylaAsia-RickyZheng/a-fe-cli-config/main/config.json'
  const conffUrl = conf.get(CONF_URL);
  if (!conffUrl) {
    return defaultConfigUrl
  }
  return conffUrl
}

export function setConfigUrl(str: string) {
  conf.set(CONF_URL, str);
}

export function getSettings() {
  return conf.get(CONF);
}

export function getNewSettings(targetUrl: string): Promise<G.ConfigType> {
  return new Promise((resolve, reject) => {
    try {
      console.log('---开始请求配置文件---')
      console.log(`---配置文件地址为( ${targetUrl} )---`)
      const urlOpts = url.parse(targetUrl)
      const { protocol } = urlOpts
      const cb = (data: G.ConfigType) => {
        // 给默认值
        let {list, classDict} = data
        const defaultClass = 'default'
        list = list.map((x) => {
          return {
            ...x,
            verson: x.version ?? '',
            class: x.class ?? defaultClass
          }
        })
        if (!classDict) classDict = []
        if (!classDict.find(x => x.class === defaultClass) && list.find(x => x.class === defaultClass)) {
          classDict = classDict.splice(0, 0, {
            class: defaultClass,
            des: '默认分类'
          })
        }
        console.log(classDict)
        // 保存到本地
        const newData = {list, classDict}
        conf.set(CONF, newData);
        console.log('---请求结束，新的配置已装备---')
        resolve(newData)
      }
      const fn = (res: any) => {
        let resdata = '';
    
        res.on('data', (chunk: any) => {
          resdata += chunk;
        });
    
        res.on('end', () => {
          let data = JSON.parse(resdata)
          cb(data)
        });
      }
      if (protocol === 'https:') {
        https.get(targetUrl, fn).on("error", (err: any) => {
          reject(targetUrl + "   Error: " + err.message);
        });
      } else {
        http.get(targetUrl, fn).on("error", (err: any) => {
          reject(targetUrl + "   Error: " + err.message);
        });
      }
    } catch(e) {
      reject(e)
    }
  })
}

