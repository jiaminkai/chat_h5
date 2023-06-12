export default (vue) => {
  /**
       * 绑定方法
       * @param {Object} el - The element the directive is bound to.
       * @param {Object} binding - An vue directive object
       */
  vue.directive('throttle', {
    bind: (el, binding) => {
      let throttleTime = binding.value // 防抖时间
      if (!throttleTime) { // 用户若不设置防抖时间，则默认2s
        throttleTime = 2000
      }
      let cbFun
      el.addEventListener('click', event => {
        if (!cbFun) { // 第一次执行
          cbFun = setTimeout(() => {
            cbFun = null
          }, throttleTime)
        } else {
          event && event.stopImmediatePropagation()
        }
      }, true)
    }
  })
}
