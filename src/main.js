// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import getsocket from '@/plugins/message.js'
import '@/plugins/vant'
import {
  fetch,
  fetchGet
} from './axios/axios'
import api from './axios/api'
import dayjs from 'dayjs'
import socketApi from '@/plugins/socket' // 找到封装的socket.js文件
import Debounce from '@/directive/debounce'
import { Toast } from 'vant'
// 防抖自定义指令
Debounce(Vue)
Vue.prototype.$socketApi = socketApi // 将其挂在原型上，这样 $socketApi就在所有的 Vue 实例中可用了。
Vue.config.productionTip = false
// 把封装的axios请求放到全局变量里面
Vue.prototype.$post = fetch
Vue.prototype.$dayjs = dayjs
Vue.prototype.$get = fetchGet
Vue.prototype.$store = store
Vue.prototype.$api = api
Vue.prototype.$toast = Toast

// 登录
router.beforeEach((to, from, next) => {
  var token = localStorage.getItem('token')// 存储token
  console.log('token: ', token)
  if (to) {
    if (token || to.meta.nacy === 'true') {
      // to.meta.nacy=='true'这里面的nacy就是自己在路由中设置的//不参与token验证的页面参数变量这个变量可以自己定义
      next()
    } else {
      if (to.path === '/' || to.path === '/Register') {
        next()
      } else {
        next('/')
      }
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  beforeCreate() {
    Vue.prototype.$bus = this// 注册全局事件总线
    console.log('getsocketResult', getsocket)
    socketApi.initWebSocket(getsocket.getsocketResult)
  },
  beforeDestroy() {
    socketApi.closeWebSocket()
  }
})
