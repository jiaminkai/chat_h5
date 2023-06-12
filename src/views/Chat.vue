<template>
  <div class="chat">
    <van-nav-bar
      :title="`匿名聊天群(${this.$store.state.home.peopleNum})`"
    ></van-nav-bar>
    <div class="content_box" id="box" ref="scrollBox">
      <van-pull-refresh
        v-model="isLoading"
        @refresh="getHistoryList"
        v-throttle
      >
        <div
          :class="!focus ? 'chat-info' : 'chat-info-bottom'"
          @click="$refs.input.focus = false"
        >
          <div class="timer">
            {{ $dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
          <div
            :class="
              Number(id) === Number(item.senderUserId)
                ? 'messInfoRight'
                : 'messInfo'
            "
            v-for="(item, index) in chatList"
            :key="index"
          >
            <div class="mesIcon">
              <img
                :src="item.senderUserInfo && item.senderUserInfo.profilePhoto"
                style="
                  display: block;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                "
                alt=""
              />
            </div>
            <div class="message">
              <div class="username">
                <span v-if="item.senderUserInfo">{{
                  item.senderUserInfo.username
                }}</span>
              </div>
              <div class="userInfo" v-if="Number(item.sendMessageType) === 0">
                {{ item.sendMessage }}
              </div>
              <div class="messageImg" v-if="Number(item.sendMessageType) === 1">
                <img
                  loading="weapp-nav"
                  v-lazy="item.sendMessage"
                  @click="perImage(item.sendMessage)"
                />
                <van-image-preview
                  v-model="show"
                  :images="showList"
                  :start-position="imgIndex"
                >
                </van-image-preview>
              </div>
              <div
                class="messageAddress"
                @click="toLocation(item.sendMessage)"
                v-if="Number(item.sendMessageType) === 3"
              >
                <div class="messageTile">
                  <div class="title">{{ item.sendMessage.address }}</div>
                  <div class="introduces">{{ item.sendMessage.desc }}</div>
                </div>
                <img
                  class="template"
                  src="../../src/assets/template.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>
    <Emoji
      ref="input"
      @upload="uploadImg"
      @focus="changeFocus"
      @websocketSend="websocketSend"
    ></Emoji>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import Emoji from '@/components/emoji/emoji.vue'
export default {
  components: { Emoji },
  computed: {
    ...mapGetters([
      'message' // 这个值是store里面存的值
    ])
  },
  data() {
    return {
      isLoading: false,
      peopleNum: 0,
      focus: false,
      show: false,
      imgIndex: 0,
      id: '',
      chatList: [],
      showList: [],
      scrollTop: 0,
      user: {},
      query: {
        pageNum: 1,
        pageSize: 20
      }
    }
  },
  watch: {
    message: {
      handler(val) {
        this.chatList = val
        // this.imgLoad()
      },
      immediate: true
    }
  },
  created() {
    this.id = localStorage.getItem('id')
    this.getUser()
    this.$store.dispatch('initMessageList')
    this.getHistoryList()
  },
  mounted() {
    // 建立socket连接， 并设置socket信息返回接受函数
    // this.$socketApi.initWebSocket(this.getsocketResult)
    this.imgLoad()
    // 创建监听内容部分滚动条滚动
    this.$refs.scrollBox.addEventListener('scroll', this.srTop)
    this.$bus.$on('sendLocation', (res) => {
      this.websocketSend(JSON.stringify(res), '2', '3')
    })
  },
  methods: {
    perImage(item) {
      this.showList = this.chatList
        .filter((n) => n.sendMessageType === 1)
        .map((m) => m.sendMessage)
      console.log('this.showList: ', this.showList)
      let index = this.showList.indexOf(item)
      if (index !== -1) {
        this.imgIndex = index
      } else {
        this.imgIndex = 0
      }
      this.show = true
    },
    changeFocus(val) {
      this.focus = val
      this.imgLoad()
    },
    // 上传图片
    uploadImg(file) {
      console.log('file: ', file)
      this.websocketSend(file, '2', '1')
    },
    // 获取用户信息
    getUser() {
      this.$get('/api/userInfo/info').then((res) => {
        console.log('res: ', res)
        this.user = res.data
      })
    },
    // // 获取聊天记录
    getHistoryList() {
      this.isLoading = true
      this.$get('/api/message', this.query).then((res) => {
        let total = res.total || 0
        if (this.chatList.length < total) {
          let A = res.list.reverse()
          A.forEach((element) => {
            if (Number(element.sendMessageType) === 3) {
              element.sendMessage = JSON.parse(element.sendMessage)
            }
          })
          console.log('A: ', A)
          this.chatList = A.concat(this.chatList)
          // mapActions
          this.$store.dispatch('setMessageList', this.chatList)
          this.$store.commit('setHistory', this.query)
          if (this.query.pageNum === 1) {
            this.imgLoad()
          }
          this.isLoading = false
        } else {
          this.$toast('没有更多数据')
          this.isLoading = false
        }
        this.query.pageNum += 1
      })
    },
    // 地理位置
    toLocation(item) {
      this.$router.push({
        path: '/Map',
        query: { location: JSON.stringify(item) }
      })
    },
    // 发送socket信息  群聊 messageType = 2, 单聊messageType = 1, 心跳包 messageType = 0
    websocketSend(data, messageType = '2', sendMessageType = '0') {
      let mess = data.trim()
      if (mess === '') {
        return
      }
      if (!this.user) {
        this.$router.push('/')
        return
      }
      let heartbeatData = {
        messageType: messageType,
        message: {
          sendMessage: mess,
          username: this.user.username,
          profilePhoto: this.user.profilePhoto,
          sendMessageType: sendMessageType,
          createTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          senderUserId: localStorage.getItem('id')
        }
      }
      this.$socketApi.sendSock(heartbeatData)
      this.chatList.push({
        senderUserInfo: {
          username: this.user.username,
          profilePhoto: this.user.profilePhoto
        },
        sendMessage: mess,
        sendMessageType: sendMessageType,
        createTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        senderUserId: localStorage.getItem('id')
      })
      this.$store.commit('getMessageList', this.chatList)
      this.$refs.scrollBox &&
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollTop = this.$refs.scrollBox.scrollTop =
              this.$refs.scrollBox.scrollHeight -
              this.$refs.scrollBox.clientHeight
          }, 100)
        })
    },
    // 滑动到最底部
    imgLoad() {
      // 图片加载
      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        // complete代表文档加载完成
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.scrollBox.scrollTo(
              0,
              this.$refs.scrollBox.scrollHeight -
                this.$refs.scrollBox.clientHeight
            )
          }, 100)
        })
      }
    }
    // // 滚动条到达顶部
    // srTop(e) {
    //   // 判断：当滚动条距离顶部为0时代表滚动到顶部了
    //   if (this.$refs.scrollBox.scrollTop === 0) {
    //     this.query.pageNum += 1
    //     let box = document.querySelector('#box')
    //     this.scrollTop = box.scrollHeight - box.clientHeight
    //     console.log('this.scrollTop : ', this.scrollTop)
    //     this.getHistoryList()
    //   }
    // }
  }
}
</script>

<style lang="less" scoped>
.chat {
  height: 100vh;
}
.send {
  position: fixed;
  z-index: 999;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100px;
  border-top: 1px solid #eee;
}
.content_box {
  /* 中间栏计算高度，110是包含了上下固定的两个元素高度90
    这里padding：10px造成的上下够加了10，把盒子撑大了，所以一共是20要减掉
    然后不知道是边框还是组件的原因，导致多出了一些，这里再减去5px刚好。不然会出现滚动条到顶或者底部的时候再滚动的话就会报一个错，或者出现滚动条变长一下的bug
    */
  height: calc(100% - 205px);
  overflow: auto;
  padding: 10px;
  background-color: #f5f5f5;
  scroll-behavior: smooth;
}
.timer {
  text-align: center;
  color: #c2c2c2;
}
.messInfo {
  display: flex;
  max-width: 90%;
  align-items: flex-start;
  min-height: 40px;
  margin-bottom: 40px;
  .message {
    min-height: 40px;
    max-width: 80%;
    margin-left: 16px;
    border-radius: 10px;
    word-break: break-all;
    line-height: 40px;
    .userInfo {
      background: #fff;
      text-align: left;
      padding: 15px 20px;
      color: #000;
      border-radius: 10px;
      position: relative;
      &:after {
        content: '';
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-right: 15px solid #fff;
        position: absolute;
        left: -10px;
        top: 10px;
      }
    }
    .messageImg {
      width: 400px;
      margin-right: 20px;
      height: 210px;
      border: 1px solid #ccc;
      border-radius: 20px;
      margin-bottom: 40px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 20px;
      }
    }
  }

  .mesIcon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: #0ea27e;
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: center;
    color: #fff;
  }
  .username {
    color: #c8c8c8;
    margin: 0 12px;
    font-size: 10px;
    height: 35px;
    max-width: 500px;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }
}
.messInfoRight {
  // justify-content: flex-end;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  .message {
    min-height: 40px;
    max-width: 80%;
    margin-left: 16px;
    border-radius: 10px;
    word-break: break-all;
    line-height: 40px;
    .userInfo {
      background: #95ec69;
      text-align: left;
      padding: 15px 20px;
      color: #000;
      word-break: break-all;
      position: relative;
      margin-right: 30px;
      border-radius: 10px;
      margin-bottom: 40px;
      &:after {
        content: '';
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-left: 15px solid #95ec69;
        position: absolute;
        right: -12px;
        top: 10px;
      }
    }
  }
  .messageImg {
    width: 400px;
    margin-right: 20px;
    height: 210px;
    border: 1px solid #ccc;
    border-radius: 20px;
    margin-bottom: 40px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 20px;
    }
  }
  .mesIcon {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 1px solid #211c1cb1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
  .username {
    color: #c8c8c8;
    margin-right: 35px;
    max-width: 800px;
    text-overflow: ellipsis;
    height: 35px;
    white-space: nowrap;
    font-size: 10px;
    text-align: right;
  }
}
.chat-info {
  box-sizing: border-box;
  transition: all 0.5s;
  margin-bottom: 40px;
}
.chat-info-bottom {
  box-sizing: border-box;
  margin-bottom: 240px;
}
.messageAddress {
  width: 400px;
  height: 250px;
  border-radius: 20px;
  background: #fff;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  .messageTile {
    height: 100px;
    padding: 10px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      font-size: 30px;
    }
    .introduces {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      width: 100%;
      font-size: 24px;
      color: #c2c2c2;
    }
  }
  .template {
    width: 400px;
    height: 150px;
  }
}
</style>
