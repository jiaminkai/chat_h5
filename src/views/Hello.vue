<template>
  <div class="hello">
    <div class="bg"></div>
    <div class="login-box">
      <div class="login-title">
        <span
          @click="changeActive(1)"
          class="title"
          :class="active === 1 ? 'active' : ''"
          >密码登录</span
        >
        <span
          @click="changeActive(2)"
          class="title"
          :class="active === 2 ? 'active' : ''"
          >验证码登录</span
        >
      </div>
      <div class="login-info" v-if="active === 1">
        <label>
          <input
            class="input"
            autocomplete="off"
            v-model="user.email"
            placeholder="请输入您的账号"
          />
        </label>
        <div class="verificationCode">
          <input
            class="input"
            auto-complete="new-password"
            autocomplete="new-password"
            v-model="user.password"
            placeholder="请设置密码"
            type="password"
          />
        </div>
        <div class="other">
          <span @click="toJump('/Register', 2)">忘记密码</span>
          <span @click="toJump('/Register', 1)">注册</span>
        </div>
      </div>
      <div class="login-info" v-else>
        <label>
          <input
            class="input"
            autocomplete="off"
            v-model="user.email"
            placeholder="请输入您的账号"
          />
        </label>
        <div class="verificationCode">
          <input
            class="input"
            auto-complete="new-password"
            autocomplete="new-password"
            v-model="user.code"
            placeholder="请输入验证码"
          />
          <span v-show="!isCode" class="getCode" @click="getCode"
            >点击获取</span
          >
          <span v-show="isCode" @click="$toast('请稍后在试...')" class="second"
            >{{ second }}秒后重试</span
          >
        </div>
      </div>
      <div class="login-btn" @click="login" v-throttle>
        <span>{{ '登录' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import Vue from 'vue'
Vue.use(Toast)
export default {
  name: 'HelloWorld',
  data() {
    return {
      loading: false,
      eye: false,
      isCode: false,
      active: 1,
      second: 60,
      user: {
        email: '1602908128@qq.com',
        password: '',
        code: '',
        username: undefined,
        againPassword: undefined
      }
    }
  },
  mounted() {
    // this.getAllAddr()
  },
  methods: {
    changeActive(type) {
      console.log('type: ', type)
      this.active = type
    },
    inputEmail() {
      this.$nextTick(() => {
        this.$refs.input.focus()
        console.log('this.$refs.input: ', this.$refs.input)
      })
    },
    inputPaw() {
      this.$nextTick(() => {
        this.$refs.paw.focus()
        console.log('this.$refs.paw: ', this.$refs.paw)
      })
    },
    toJump(path, type) {
      this.$router.push({ path, query: { email: this.user.email, type } })
    },
    // 登录
    login() {
      let query = {
        email: this.user.email
      }

      if (this.active === 1) {
        if (!this.user.email || !this.user.password) {
          Toast({ duration: 2000, message: '请输入账号或者密码' })
          return
        }
        query.loginType = 0
        query.password = this.user.password
      } else {
        if (!this.user.email || !this.user.code) {
          Toast({ duration: 2000, message: '请输入账号、验证码' })
          return
        }
        query.loginType = 1
        query.code = this.user.code
      }
      this.$post('/api/login', query).then((res) => {
        Toast({ duration: 2000, message: res.message })
        console.log('res', res)
        if (Number(res.code) === 200 && res.data.accessToken) {
          localStorage.setItem('token', res.data.accessToken)
          localStorage.setItem('id', res.data.userId)
          localStorage.setItem('refreshToken', res.data.refreshToken)
          localStorage.setItem('expiresTime', res.data.expiresTime)
          console.log('local', localStorage.getItem('token'), res.data.accessToken)
          this.$router.push({
            path: '/Chat'
          })
        }
      })
    },
    changeEye() {
      this.eye = !this.eye
    },
    getCode(e) {
      this.isCode = true
      let query = {
        type: '0',
        email: this.user.email
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
      this.$get('/api/sendEmail/' + query.type + '/' + query.email).then(
        (res) => {
          if (res.code === '200') {
            Toast({ duration: 2000, message: '发送成功' })
          }
        }
      )
      e.stopPropagation()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.hello {
  background: #eee;
  height: 100vh;
  padding-top: 220px;
  background: #fff;
  width: 100%;
  position: relative;
  .bg {
    background-image: url('../assets/bg.png');
    background-size: 100% 500px;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    width: 100%;
    height: 550px;
    z-index: 1;
  }
  .login-box {
    width: 100%;
    padding: 20px 90px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0);
    z-index: 99;
    position: relative;
    .login-title {
      display: flex;
      width: 100%;
      align-items: flex-end;
      .title {
        font-size: 42px;
        font-weight: 500;
        margin-right: 30px;
        color: #999999;
        position: relative;
      }
      .active {
        color: #4d4d4d;
        font-size: 48px;
        font-weight: 600;
        position: relative;
        &:before {
          content: '';
          position: absolute;
          bottom: -20px;
          border-radius: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: block;
          width: 90px;
          height: 10px;
          background: linear-gradient(
            to right,
            #fd5e4599,
            50%,
            #fdc3ba,
            70%,
            #fd5e4510,
            90%,
            #fff6f5
          );
        }
      }
    }
    .login-info {
      margin-top: 150px;
      z-index: 2;
      .input {
        border: node;
        width: 100%;
        height: 60px;
        outline-style: none;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 10px;
        border-top: 0px solid #efefef;
        border-left: 0px solid #efefef;
        border-right: 0px solid #efefef;
        margin-top: 20px;
      }
      .verificationCode {
        display: flex;
        height: 100%;
        .getCode {
          color: #fe654f;
          cursor: pointer;
          width: 200px;
          height: 92px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #e5e5e5;
        }
        .eye {
          cursor: pointer;
          width: 100px;
          display: block;
          height: 92px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #e5e5e5;
        }
        .second {
          color: #99998f;
          width: 300px;
          cursor: pointer;
          height: 92px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #e5e5e5;
        }
      }
      .other {
        margin-top: 15px;
        display: flex;
        justify-content: space-between;
        color: #fe654f;
        cursor: pointer;
      }
    }
  }
}

.login-btn {
  width: 100%;
  margin: 120px auto;
  height: 90px;
  border-radius: 50px;
  background: linear-gradient(30deg, #f89665, #ff5a41);
  text-align: center;
  line-height: 90px;
  color: #fff;
  font-weight: 500;
}
input:-internal-autofill-previewed,
input:-internal-autofill-selected {
  transition: background-color 5000s ease-in-out 0s !important;
}
::-webkit-input-placeholder {
  /* Chrome/Opera/Safari */
  color: #cdcdcd;
}
::-moz-placeholder {
  /* Firefox 19+ */
  color: #cdcdcd;
}
:-ms-input-placeholder {
  /* IE 10+ */
  color: #cdcdcd;
}
:-moz-placeholder {
  /* Firefox 18- */
  color: #cdcdcd;
}
</style>
