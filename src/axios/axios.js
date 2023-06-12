import vue from 'vue'
import axios from 'axios'
import { Toast } from 'vant'
vue.use(Toast)
// import vuex from 'vuex';
// axios 配置
axios.defaults.timeout = 30000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axios.defaults.baseURL = ''
// 带cookie请求
axios.defaults.withCredentials = true
// POST传参序列化,请求之前拦截
axios.interceptors.request.use((config) => {
  if (localStorage.getItem('token') &&
    localStorage.getItem('token') !== ''
  ) {
    config.headers['Authorization'] = localStorage.getItem('token')
    // // Authorization过期时间
  }
  console.log('config: ', config)
  // 先判断是get or post
  if (config.method === 'post') { // 表示post
    Toast({
      message: '加载中...',
      duration: 2000
    })
  } else { // 为get
    Toast({
      message: '加载中...',
      duration: 2000
    })
  }
  const conf = config
  conf.headers = config.headers
  return conf
}, error => Promise.reject(error))

// 返回状态判断
axios.interceptors.response.use((res) => {
  if (res.state === 444) {
    Toast({
      message: '网络异常',
      position: 'top'
    })
  } else if (res.state !== 100) {
    // Toast({
    //   message: res.data.message,
    //   position: 'top'
    // })
  } else if (res.code === 600) {
    Toast({
      message: res.message,
      position: 'top'
    })
  }
  // this.$store.commit('SETSPINNER', false);
  return res
}, error => Promise.reject(error))

// 校验Authorization
async function checkAuthorization() {
  // Authorization不存在代表未登录，继续执行其他接口，Authorization存在，判断是否过期
  if (!localStorage.getItem('token')) {
    return
  }
  // Authorization过期时间
  let expiresTime = localStorage.getItem('expiresTime')
  if (!expiresTime) {
    return
  }
  // 到期时间不到10秒就进行刷新操作 refreshToken获取accessToken
  let nwoTime = new Date().getTime()
  if (expiresTime - nwoTime <= 10000) {
    await refreshToken()
  }
}

// 刷新accessToken
async function refreshToken() {
  axios.get('/api/refreshToken/' + localStorage.getItem('refreshToken')).then(res => {
    if (res.data.code === 200) {
      localStorage.setItem('token', res.data.data.accessToken)
      localStorage.setItem('id', res.data.data.userId)
      localStorage.setItem('refreshToken', res.data.data.refreshToken)
      localStorage.setItem('expiresTime', res.data.data.expiresTime)
    }
  }).catch((err) => {
    console.log('err: ', err)
  })
}

export async function fetch(url, params) {
  await checkAuthorization()
  return new Promise((resolve, reject) => {
    axios.post(url, params, {
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
export async function fetchGet(url, params = {}) {
  await checkAuthorization()
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params
    })
      .then((response) => {
        Toast.clear()
        resolve(response.data)
      })
      .catch((err) => {
        Toast.clear()
        reject(err)
      })
  })
}
