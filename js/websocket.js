class TlWebSocket {
  constructor(options) {
    const config = {
      maxTimeout: 5000,
      maxReconnectAccount: -1,
      debug: false,
      pingTime: 1000
    }
    Object.assign(config, options)
    if (!options?.uri) {
      const loc = window.location;
      let uri = loc.protocol === 'https:' ? 'wss:' : 'ws:'
      uri += `//${loc.host}/kesocket`
      config.uri = uri
    }

    this.reconnectAccount = 0
    this.gWs = null
    this.connectedCallBack = null
    this.receiveMsgHanders = {}
    this.onerrorReconnectTime = config.maxTimeout / 2

    this.reconnect()
  }

  canSendMsg() {
    return this.gWs!=null && gWs.readyState === gWs.OPEN
  }

  sendMsg(name, data) {
    if(this.canSendMsg) {
      ws.send(JSON.stringify({'code': 4, name, data}));
    }
  }

  receiveMsg(name, callBack) {
    if(!this.receiveMsgHanders[name]) {
      this.receiveMsgHanders[name] = callBack
    }
  }

  reconnect() {
    const ws = new WebSocket(this.config.uri)
    const self = this

    ws.onmessage = function(event) {
      try {
        if (!event.data) {
          return
        }
        const { name, code, data, v } = JSON.parse(event.data)
        const handler = self.receiveMsgHanders[name]
        // v是每条消息的标记，防止重复发送消息
        if (!handler || handler.v === v) {
          return
        }
        handler(data)
      } catch(err) {
        console.log(err);
      }
    }
    ws.onerror = function(error) {
      if (self.reconnectAccount === -1 || self.config.maxReconnectAccount >= self.reconnectAccount) {
        setTimeout(() => {
          self.reconnectAccount++
          self.reconnect()
        }, self.onerrorReconnectTime)
      }
    }
    ws.onclose = function() {
      if (self.reconnectAccount === -1 || self.config.maxReconnectAccount >= self.reconnectAccount) {
        setTimeout(() => {
          self.reconnectAccount++
          self.reconnect()
        }, self.onerrorReconnectTime)
      }
    }
    ws.onopen = function() {
      if (self.reconnectAccount !== -1) {
        self.reconnectAccount = 0 // 重连次数归0
      }
      
      self.connectedCallBack?.()
      clearInterval(this.pingTimer)
      this.pingTimer = setInterval(() => {
        self.ping()
      }, 1000)
    }

    this.gWs = ws
  }

  // 心跳机制
  ping() {
    if(this.canSendMsg) {
      this.gWs.send('{"ping": 1}')
    }
  }
}