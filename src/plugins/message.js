import store from "../store"
export default {
  getsocketResult(data) {
    if (data) {
      store.commit('setPeopleNum', data.peopleNum)
      let list = store.state.home.messageList
      if (data.messageType !== 0) {
        console.log('接受信息：', data)
        if (Number(data.sendMessageType) === 3) {
          data.message.sendMessage = JSON.parse(data.message.sendMessage)
        }
        list.push(data.message)
        console.log('list: ', list)
        store.dispatch('setMessageList', list)
      }
    }
  }
}