<template>
  <div class="hello">
    <h1 class="test">{{ msg }}</h1>
    <div class="test-viewport">测试转换</div>
    <van-button type="primary" size="small">主要按钮</van-button>
  </div>
</template>

<script>
import Vue from 'vue'
import { Button } from 'vant'
Vue.use(Button)
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted () {
    this.getAllAddr()
  },
  methods: {
    getAllAddr () {
      this.$fetch(this.$api.all_addr, {
        userid: 1
      }).then((res) => {
        console.log(res)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h1, h2 {
  font-weight: normal;
}
.test{
  color: red;
  .t{
    color: gold;
  }
}
.test-viewport {
  width: 750px;
  height: 100px;
  font-size: 40px;
  text-align: center;
  line-height: 100px;
  background: #13b5b1;
  margin-bottom: 30px;
}
</style>
