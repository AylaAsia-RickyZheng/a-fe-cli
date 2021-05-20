const { spawn }  = require('child_process');

// 执行命令，监听控制台信息
export const runCmd = (command: string) => {
  return new Promise((resolve, reject) => {
    // 解析命令获取参数
    const bits = command.split(' ')
    const args = bits.slice(1)

    // 执行命令
    const cmd = spawn(bits[0], args, { cwd: process.cwd() })

    let stdout = ''
    let stderr = ''

    cmd.stdout.on('data', (data: any) => {
      console.log(data.toString())
      stdout += data.toString()
    })

    cmd.stderr.on('data', (data: any) => {
      console.log( data.toString())
      stderr += data.toString()
    })

    cmd.on('close', (code: any) => {
      const err = code !== 0 ? new Error(stderr) : null
      if (err) {
        reject(err)
      }
      resolve({ err, stdout, stderr })
    })
  }).catch((e) => {
    console.log('error:', e)
  })
}