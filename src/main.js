// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import {
  fetch,
  fetchGet
} from './axios/axios'
import api from './axios/api'
Vue.config.productionTip = false
// 把封装的axios请求放到全局变量里面
Vue.prototype.$fetch = fetch
Vue.prototype.$fetchGet = fetchGet
Vue.prototype.$api = api
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
