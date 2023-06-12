const message = {
  state: {
    messageList: [],
    peopleNum: 0,
    pageNum: 1,
    pageSize: 40
  },
  mutations: {
    // 设置群聊信息
    getMessageList(state, val) {
      state.messageList = val
    },
    setPeopleNum(state, val) {
      state.peopleNum = val
    },
    setHistory(state, val) {
      state.pageNum = val.pageNum
      state.pageSize = val.pageSize
    },
    initInfo(state, val) {
      state = Object.assign({
        messageList: [],
        peopleNum: 0,
        pageNum: 1,
        pageSize: 40
      })
    },
  },
  actions: {
    // 赋值数据
    setMessageList({ commit }, val) {
      commit('getMessageList', val)
    },
    initMessageList({ commit, dispatch }, val) {
      commit('initInfo')
    },
  },
  getters: {
    message: state => state.messageList
  }

}

export default message
