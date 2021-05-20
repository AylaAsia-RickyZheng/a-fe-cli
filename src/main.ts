const inquirer = require('inquirer');
const shell = require('shelljs');
import { exit } from "process";
import { getConfigUrl, getNewSettings, getSettings, setConfigUrl } from "./getSettings"
import {runCmd} from './runCmd'

const args = process.argv.slice(2)


const lowerCaseFn = (str: string) => str.toLocaleLowerCase()

const arg0 = lowerCaseFn(args[0] || '')
const arg1 = args[1] || ''

if (arg0 === '-h' || arg0 === '--help') {
  console.log(`
    a-cli [options]            选择并下载模版
          -h, --help          查看帮助
          -o [dirname]        将选中的模版拉到 [dirname] 对于的文件夹中
          --conf-show         显示配置文件地址
          --conf-update       通过原本的配置文件更新配置
          --conf-reset [url]  设置新的配置文件地址，地址返回配置，配置满足格式就行，格式如： https://raw.githubusercontent.com/AylaAsia-RickyZheng/a-fe-cli-config/main/config.json
  `)
  exit(0)
}

(() => {
  if (arg0 === '--conf-show') {
    console.log(getConfigUrl())
    console.log(' ')
    return
  }

  if (arg0 === '--conf-update') {
    const url = getConfigUrl()
    getNewSettings(url)
    return
  }

  if (arg0 === '--conf-reset') {
    if (!arg1) {
      console.log('好歹传个url撒')
    }
    const _url = arg1
    getNewSettings(_url).then(() => {
      setConfigUrl(_url)
      console.log(`设置成功，新地址为${_url}`)
    })
    return
  }

  if (arg0 === '-o' || !arg0) {
    const config: G.ConfigType = getSettings()
    if (!config) {
      console.log('获取配置文件失败，请先执行 acli --conf-update')
      return
    }
    const {list, classDict} = config
    const dictChoices = classDict.map((x) => x.des)
    const AskClassDict = () => inquirer.prompt([{
      type: "list",
      name: 'classDict',
      message: '选分类：',
      choices: dictChoices
    }])

    const ShowTemplates = (_list: G.ListItemType[]) => {
      console.log(`
      `);
      const choiceNames = _list.map(x => { return { name: x.des + (x.version ? '(' + x.version + ')' : '' ), value: x.git}})
      inquirer
        .prompt([
          {
            type: "list",
            name: "itemPick",
            message: "你要找的是：",
            choices: choiceNames,
          }
        ])
        .then((answer: {itemPick: string}) => {
          const git = answer.itemPick
          const cmd = `git clone ${git}` + ( arg0 === '-o' ?  ' ' + arg1 : '')
          console.log(`${cmd}
不知道怎么打印git的下载进度，所以你应该要多等一会儿`);
          runCmd(cmd).then(() => {
            console.log(`
            `)
            const matched = git.match(/^.+\/([^\/]+)\.git$/)
            if (!matched) {
              console.log('没有定位到目录，自己去把.git删了吧')
              return
            }
            let dirname = matched[1]
            console.log(`发现目录${dirname}了,准备去删 .git`)
            if (arg0 === '-o') {
              dirname = arg1
            }
            shell.rm('-rf', `${dirname}/.git`)
          }).catch((e) => {
            console.log('error:', e)
          })
        })
        .catch((error: any) => {
          console.log('error ', error)
        });
    }

    if (classDict.length < 2) {
      ShowTemplates(list)
    } else {
      AskClassDict().then((x: {
        classDict: string
      }) => {
        const dictDes = x.classDict
        const dict = classDict.find((x) => x.des === dictDes)
        if (dict) {
          const classKey = dict.class
          const listOfSameDict = list.filter(x => {
            return classKey === x.class
          })
          if (listOfSameDict.length < 1) {
            console.log('该分类没有条目')
            return
          }
          ShowTemplates(listOfSameDict)
        } else {
          console.log('没找到相关内容')
        }
      })
    }
    return
  }

})()


