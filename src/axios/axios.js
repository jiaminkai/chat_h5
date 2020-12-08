import vue from 'vue'
import axios from 'axios'
import { Toast } from 'vant'
vue.use(Toast)
// import vuex from 'vuex';
// axios 配置
axios.defaults.timeout = 30000
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.baseURL = process.env.BASE_URL
// 带cookie请求
axios.defaults.withCredentials = true
// POST传参序列化,请求之前拦截
axios.interceptors.request.use((config) => {
  // 先判断是get or post
  if (config.data) { // 表示post
    if (config.data.loading === false) {
      Toast.clear()
    } else {
      Toast.loading({
        message: '加载中...',
        duration: 0
      })
    }
  } else if (config.params.loading === false) { // 为get
    Toast.clear()
  } else {
    Toast.loading({
      message: '加载中...',
      duration: 0
    })
  }
  const conf = config
  conf.headers = {
    'Content-Type': 'application/json;charset=UTF-8'
  }
  return conf
}, error => Promise.reject(error))

// 返回状态判断
axios.interceptors.response.use((res) => {
  // console.log(res, 'res1')
  if (res.data.state === 444) {
    // vue.$vux.toast.text('网络异常', 'top')
    Toast({
      message: '网络异常',
      position: 'top'
    })
  } else if (res.data.state !== 100) {
    // vue.$vux.toast.text(res.data.msg)
    Toast({
      message: res.data.msg,
      position: 'top'
    })
  }
  // this.$store.commit('SETSPINNER', false);
  return res
}, error => Promise.reject(error))

export function fetch (url, params) {
  return new Promise((resolve, reject) => {
    // console.log(url, params)
    axios.post(url, params, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then((response) => {
        Toast.clear()
        resolve(response.data)
      }, (err) => {
        Toast.clear()
        reject(err)
      })
      .catch((error) => {
        Toast.clear()
        reject(error)
      })
  })
}
export function fetchGet (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params
    })
      .then((response) => {
        vue.$vux.loading.hide()
        resolve(response.data)
      })
      .catch((err) => {
        vue.$vux.loading.hide()
        reject(err)
      })
  })
}
