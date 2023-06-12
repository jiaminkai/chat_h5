<template>
  <div class="resetPassword">
    <van-nav-bar
      :title="title"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
    />
    <div class="cell">
      <van-field
        v-model="query.email"
        label="邮箱"
        placeholder="请输入邮箱账号"
      />
    </div>
    <div class="cell">
      <van-field v-model="query.code" label="验证码" placeholder="短信验证码" />
      <span v-show="!isCode" class="getCode" @click="getCode">点击获取</span>
      <span v-show="isCode" @click="$toast('请稍后在试...')" class="second"
        >{{ second }}秒后重试</span
      >
    </div>
    <div class="cell">
      <van-field
        v-model="query.password"
        type="password"
        label="设置新密码"
        placeholder="6-20位密码"
      />
    </div>
    <div class="cell">
      <van-field
        v-model="query.againPassword"
        label="确定新密码"
        type="password"
        placeholder="6-20位密码"
      />
    </div>
    <div class="login-btn" @click="resetPassword" v-throttle>
      <span>{{ Number(this.$route.query.type) === 2 ? '登录' : '注册' }}</span>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import Vue from 'vue'
Vue.use(Toast)
export default {
  data() {
    return {
      isCode: false,
      second: 60,
      title: '',
      query: {
        code: '',
        password: '',
        againPassword: '',
        email: ''
      }
    }
  },
  created() {
    if (this.$route.query) {
      console.log('this.$route.query: ', this.$route.query)
      this.query.email = this.$route.query.email
      if (Number(this.$route.query.type) === 1) {
        this.title = '注册'
      } else {
        this.title = '忘记密码'
      }
    }
  },
  methods: {
    getRandomChinese(length = 5) {
      let result = ''
      for (let i = 0; i < length; i++) {
        const randomCode =
          Math.floor(Math.random() * (40869 - 19968 + 1)) + 19968
        result += String.fromCharCode(randomCode)
      }
      return result
    },
    getCode() {
      this.isCode = true
      if (!this.query.email) {
        Toast({ duration: 2000, message: '邮箱账号不能为空' })
        return
      }
      let tiemr = setInterval(() => {
        if (this.second > 0) {
          this.second -= 1
        } else {
          clearInterval(tiemr)
          this.isCode = false
          this.second = 60
        }
      }, 1000)
      this.$get(
        '/api/sendEmail/' + this.$route.query.type + '/' + this.query.email
      ).then((res) => {
        if (res.code === '200') {
          Toast({ duration: 2000, message: '发送成功' })
        }
      })
    },
    resetPassword() {
      if (!this.query.code) {
        Toast({ duration: 2000, message: '请输入验证码' })
        return
      }
      if (!this.query.email) {
        Toast({ duration: 2000, message: '请输入邮箱账号' })
        return
      }
      if (this.query.againPassword !== this.query.password) {
        Toast({ duration: 2000, message: '两次密码不一致' })
        return
      }
      if (Number(this.$route.query.type) === 2) {
        this.$post('/api/forgetPassword', this.query).then((res) => {
          Toast({ duration: 2000, message: res.message })
          console.log('res: ', res)
          if (res.code === '200' && res.data.accessToken) {
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            localStorage.setItem('expiresTime', res.data.expiresTime)
            this.$router.push({
              path: '/Chat'
            })
          }
        })
      } else {
        this.query.username = this.getRandomChinese(2)
        this.$post('/api/register', this.query).then((res) => {
          Toast({ duration: 2000, message: res.message })
          console.log('res: ', res)
          if (res.code === '200' && res.data.accessToken) {
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            localStorage.setItem('expiresTime', res.data.expiresTime)
            this.$router.push({
              path: '/Chat'
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.resetPassword {
  background-color: #f8f8f8;
  width: 100%;
  height: 100vh;
}
.cell {
  margin-top: 30px;
  display: flex;
  height: 88px;
  .getCode {
    color: #fe654f;
    cursor: pointer;
    width: 200px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .second {
    color: #99998f;
    width: 300px;
    cursor: pointer;
    height: 88px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.login-btn {
  width: 80%;
  margin: 120px auto;
  height: 90px;
  border-radius: 50px;
  background: linear-gradient(30deg, #f89665, #ff5a41);
  text-align: center;
  line-height: 90px;
  color: #fff;
  font-weight: 500;
}
</style>
