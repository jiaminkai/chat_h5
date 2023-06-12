import Vue from 'vue'
import { Toast } from 'vant'
Vue.use(Toast)
// let v = new Vue()
var webSocket = null
var isConnect = false // 连接状态
var globalCallback = function (e) {  }// 定义外部接收数据的回调函数
var reConnectNum = 0// 重连次数

var websocketUrl = 'ws://121.40.102.191:9999/ws'

// 心跳设置
var heartCheck = {
  heartbeatData: {
    messageType: '0',
    token: localStorage.getItem('token'),
    message: {
      sendMessage: '心跳包',
      sendMessageType: '0'
    }
  }, // 心跳包
  timeout: 5 * 1000, // 每段时间发送一次心跳包 这里设置为60s
  heartbeat: null, // 延时发送消息对象（启动心跳新建这个对象，收到消息后重置对象）
  start: function () {
    this.heartbeat = setInterval(() => {
      if (isConnect) {
        webSocketSend(this.heartbeatData)
      } else {
        this.clear()
      }
    }, this.timeout)
  },
  reset: function () {
    clearInterval(this.heartbeat)
    this.start()
  },
  clear: function () {
    clearInterval(this.heartbeat)
  }
}

// 初始化websocket
function initWebSocket (callback) {
  // 此callback为在其他地方调用时定义的接收socket数据的函数
  if (callback) {
    if (typeof callback === 'function') {
      globalCallback = callback
    } else {
      throw new Error('callback is not a function')
    }
  }
  if ('WebSocket' in window) {
    let token = localStorage.getItem('token')
    webSocket = new WebSocket(websocketUrl + '?Authorization=' + token)// 创建socket对象
    webSocket.addEventListener('message', function (event) {
      if (event.data.messageType === '1') {
        console.log('Message from server ', event.data)
      }
    })
  } else {
    Toast({
      message: '该浏览器不支持websocket!',
      type: 'fail'
    })
    return
  }
  // 打开
  webSocket.onopen = function () {
    webSocketOpen()
  }
  // 收信
  webSocket.onmessage = function (e) {
    webSocketOnMessage(e)
  }
  // 关闭
  webSocket.onclose = function (e) {
    webSocketOnClose(e)
  }
  // 连接发生错误的回调方法
  webSocket.onerror = function (e) {
    webSocketonError(e)
  }
}

// 连接socket建立时触发
function webSocketOpen () {
  console.log('WebSocket连接成功')
  // 首次握手
  webSocketSend(heartCheck.heartbeatData)
  isConnect = true
  heartCheck.start()
  reConnectNum = 0
}

// 客户端接收服务端数据时触发,e为接受的数据对象
function webSocketOnMessage (e) {
  const data = JSON.parse(e.data)// 根据自己的需要对接收到的数据进行格式化
  globalCallback(data)// 将data传给在外定义的接收数据的函数，至关重要。
}

// socket关闭时触发
function webSocketOnClose (e) {
  heartCheck.clear()
  isConnect = false // 断开后修改标识
  console.log('webSocket已经关闭 (code：' + e.code + ')')
  // 被动断开，重新连接
  if (e.code === 1006) {
    if (reConnectNum < 3) {
      initWebSocket()
      ++reConnectNum
    } else {
      Toast({
        message: 'websocket连接不上，请刷新页面或联系开发人员!',
        type: 'fail'
      })
    }
  }
}

// 连接发生错误的回调方法
function webSocketonError (e) {
  heartCheck.clear()
  isConnect = false // 断开后修改标识
  console.log('WebSocket连接发生错误:')
  // localStorage.clear()
}

// 发送数据
function webSocketSend (data) {
  webSocket.send(JSON.stringify(data))// 在这里根据自己的需要转换数据格式
  if (data.sendMessageType === 0) {
    console.log('发送信息:', data)
  }
}
// 在其他需要socket地方主动关闭socket
function closeWebSocket () {
  webSocket.close()
  heartCheck.clear()
  isConnect = false
  reConnectNum = 0
}
// 在其他需要socket地方接受数据
function getSock (callback) {
  globalCallback = callback
}
// 在其他需要socket地方调用的函数，用来发送数据及接受数据
function sendSock (agentData, callback) {
  // 下面的判断主要是考虑到socket连接可能中断或者其他的因素，可以重新发送此条消息。
  switch (webSocket.readyState) {
    // CONNECTING：值为0，表示正在连接。
    case webSocket.CONNECTING:
      setTimeout(function () {
        sendSock(agentData, callback)
      }, 1000)
      break
    // OPEN：值为1，表示连接成功，可以通信了。
    case webSocket.OPEN:
      webSocketSend(agentData)
      break
    // CLOSING：值为2，表示连接正在关闭。
    case webSocket.CLOSING:
      setTimeout(function () {
        sendSock(agentData, callback)
      }, 1000)
      break
    // CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
    case webSocket.CLOSED:
      // do something
      break
    default:
      // this never happens
      break
  }
}

export default {
  initWebSocket,
  closeWebSocket,
  sendSock,
  getSock
}
