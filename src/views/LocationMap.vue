<template>
  <div class="list">
    <Map ref="map" :edit="edit" :location="location" @addressInfo="getAddressInfo"></Map>
  </div>

</template>

<script>
import Map from '@/components/map/index.vue'
export default {
  data() {
    return {
      edit: false,
      location: {}
    }
  },
  created() {
    if (this.$route.query.location) {
      this.edit = true
      this.location = JSON.parse(this.$route.query.location)
    } else {
      this.edit = false
    }
  },
  components: {Map},
  methods: {
    getAddressInfo(e) {
      console.log('e: ', e)
    }
  }
}
</script>

<style lang="less" scoped>
.list{
  height: 100vh;
  width: 100%;
}

</style>
