<template>
  <div class="send" :class="!focus ? 'minHight' : 'maxHight'" ref="send">
    <div class="input-box">
      <textarea
        class="input"
        type="text"
        v-model="message"
        placeholder="请输入"
        @keydown="enterBtn"
      />
      <van-icon @click="email" class="icon" name="smile-o"></van-icon>
      <van-icon
        @click="more"
        v-if="!message"
        class="icon"
        name="add-o"
      ></van-icon>
      <van-button
        v-else
        class="sumbit"
        slot="button"
        size="small"
        type="info"
        v-throttle
        @click="websocketSend(message)"
        >发送</van-button
      >
    </div>
    <div class="emoji" v-if="type === 1">
      <ul class="emoji-default">
        <li
          v-for="(item, index) in emoji"
          :key="index"
          class="emoji-item"
          @click.stop="chooseEmojiDefault(item)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div class="emoji" v-if="type === 2">
      <ul class="emoji-default">
        <li
          v-for="(item, index) in moveList"
          :key="index"
          class="icon-item"
          @click.stop="fileClick(item)"
        >
          <div class="file-icon">
            <van-icon :name="item.name"></van-icon>
          </div>
          <span>{{ item.title }}</span>
        </li>
      </ul>
    </div>
    <van-uploader
      v-show="false"
      ref="upload"
      :after-read="
        (val) => {
          afterRead(val)
        }
      "
      :before-read="beforeRead"
      v-model="fileList"
      multiple
      :max-count="1"
    />
  </div>
</template>

<script>
import { Toast } from 'vant'
import Vue from 'vue'
Vue.use(Toast)
const emojiJson = require('./emoji.json')
export default {
  data() {
    return {
      emoji: emojiJson.data.split(','),
      focus: false,
      message: '',
      fileList: [],
      type: undefined,
      moveList: [
        {
          name: 'photo',
          fileType: 1,
          title: '图片'
        },
        {
          name: 'video',
          fileType: 2,
          title: '视频'
        },
        {
          name: 'location',
          fileType: 3,
          title: '定位'
        },
        {
          name: 'photograph',
          fileType: 4,
          title: '相机'
        }
      ]
    }
  },
  props: {
    mes: {
      type: String,
      default: ''
    }
  },
  methods: {
    beforeRead(file) {
      // 上传之前校验
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        Toast('只允许上传jpg/png格式的图片！')
        return false
      }
      return true
    },
    afterRead(file) {
      console.log('file: ', file)
      let params = new FormData()
      params.append('file', file.file)
      let config = {
        headers: {
          // 添加请求头
          'Content-Type': 'multipart/form-data'
        }
      }
      // 文件读取完成后的回调函数
      this.$post('/api/common/uploadFile', params, config)
        .then((res) => {
          console.log('res: ', res)
          if (res && res.data) {
            // 如果为真 resolve出去
            this.$emit('upload', res.data)
          } else {
            // 否则 Toast 提示
            this.$toast.fail(res.data && res.message)
          }
        })
        .catch((err) => {
          this.$toast.fail('系统异常', err)
        })
      this.fileList = []
    },
    fileClick(item) {
      switch (item.fileType) {
        case 1:
          this.$nextTick(() => {
            this.$refs.upload.chooseFile()
          })
          break
        case 2:
          break
        case 3:
          console.log('aaaa')
          this.$router.push({path: '/Map'})
          break
        case 4:
          break
      }
    },
    chooseEmojiDefault(e) {
      let c = this.message + e
      this.$set(this, 'message', c)
    },
    enterBtn(val) {
      console.log('val: ', val.shiftKey, val.keyCode === 13)
      if (!val.shiftKey && val.keyCode === 13) {
        this.websocketSend(this.message)
      }
    },
    websocketSend(val) {
      console.log('val: ', val)
      this.focus = false
      this.$emit('websocketSend', val)
      setTimeout(() => {
        this.message = ''
      }, 0)
    },
    email() {
      if (this.type === 2 && this.focus) {
        this.type = 1
      } else {
        this.focus = !this.focus
        this.type = 1
      }
    },
    more() {
      if (this.type === 1 && this.focus) {
        this.type = 2
      } else {
        this.focus = !this.focus
        this.type = 2
      }
    }
  },
  watch: {
    focus: {
      handler(val) {
        this.$emit('focus', val)
      },
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.send {
  position: fixed;
  z-index: 999;
  bottom: 0;
  right: 0;
  left: 0;
  border-top: 1px solid #eee;
  background: #eee;
  .input-box {
    min-height: 100px;
    width: 100%;
    display: flex;
    background-color: #eee;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }
  .input {
    flex: 1;
    border-radius: 10px;
    border: 0px;
    // white-space: pre-wrap;
    padding: 10px 40px 10px 10px;
    height: 86px;
    box-sizing: border-box;
  }
  .icon {
    width: 50px;
    font-size: 50px;
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
  .sumbit {
    margin-left: 20px;
    height: 55px;
  }
}
.emoji {
  display: flex;
  width: 100%;
  height: 200px;
  border-top: #ccc 2px solid;
  overflow: scroll;
  box-sizing: border-box;
  .emoji-default {
    display: flex;
    padding: 20px;
    flex-wrap: wrap;
    width: 100%;
    .emoji-item {
      display: block;
      width: calc(100% / 11);
      height: 60px;
      font-size: 36px;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      width: calc(100% / 4);
      // height: 100px;
      font-size: 20px;
      justify-content: center;
      align-items: center;
      .file-icon {
        width: 90px;
        height: 90px;
        background: #fff;
        font-size: 40px;
        display: flex;
        align-items: center;
        border-radius: 10px;
        justify-content: center;
        margin-bottom: 10px;
      }
    }
  }
}
.minHight {
  height: 120px;
  box-sizing: border-box;
  transition: all 0.5s;
}
.maxHight {
  height: 320px;
  box-sizing: border-box;
  transition: all 0.5s;
}
</style>
