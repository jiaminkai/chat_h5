<template>
  <div class="map-address">
    <div class="map-title" v-if="!edit">
      <span class="btn">取消</span>
      <span :class="isSend ? 'btn2' : 'btn1'" @click="confirm">确定</span>
    </div>
    <div id="container">
      <img src="../../assets/address.png" class="map-location" alt="" />
    </div>
    <div class="address-list" v-if="!edit">
      <div class="search1" v-if="!focus" @click="focus = !focus">
        <van-icon class="icon" name="aim"></van-icon>
        <span>搜索地址</span>
      </div>
      <div v-else class="search2">
        <!-- <van-field
          class="input"
          left-icon="search"
          v-model="keyWords"
          @cancel="onCancel"
          placeholder="请输入搜索关键词"
          @input="onSearch"
        /> -->
        <van-search
          v-model="keyWords"
          placeholder="请输入搜索关键词"
          show-action
          @search="onSearch"
          @cancel="onCancel"
        />
      </div>
      <div class="cell-list">
        <van-list
          class="cell-list ul"
          v-model="cellLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <label v-for="(item, index) in address_list" :key="index">
            <van-cell class="li" @click="sureAddress(item)">
              <template slot="title">
                <div class="name">{{ item.name }}</div>
                <div class="detail" v-if="!(item.address instanceof Array)">
                  {{ item.address }}
                </div>
                <div v-else class="detail">{{ item.district }}</div>
              </template>
            </van-cell>
          </label>
        </van-list>
      </div>
    </div>
    <div v-else class="address-navigation">
      <div class="navigation">
        <div class="title">{{ location.address }}</div>
        <div class="navigation-icon">
          <div class="takeTaxi" @click="show = true">
            <img src="../../assets/takeTaxi.png" alt="" />
          </div>
          <div class="navigation" @click="show = true">
            <img src="../../assets/navigation.png" alt="" />
          </div>
        </div>
      </div>
      <div class="desc">
        {{ location.desc }}
      </div>
    </div>
    <van-action-sheet
      v-model="show"
      cancel-text="取消"
      :actions="actions"
      @select="onSelect"
    />
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
window._AMapSecurityConfig = {
  securityJsCode: '88c34ce7fd7f59629ce233aef3b01087' // 你的安全密钥
}
export default {
  props: {
    location: {
      type: Object,
      default: () => {}
    },
    edit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      actions: [
        {
          name: '高德地图',
          index: 0
        },
        {
          name: '百度地图',
          index: 1
        }
      ],
      addres: '',
      focus: false,
      cellLoading: false,
      finished: false,
      districtList: '',
      cityCode: '',
      keyWords: '',
      map: {},
      isSend: false,
      pageIndex: 1,
      marker: {},
      geocoder: {},
      position: [],
      address_list: [],
      finalAddress: {}
    }
  },
  // created() {
  // },
  mounted() {
    this.initAMap()
  },
  methods: {
    onSelect(item) {
      this.navgatorshow = false
      if (!window.plus) return
      if (item.index) {
        if (
          plus.runtime.isApplicationExist({ pname: 'com.autonavi.minimap' })
        ) {
          // 判断本机是否存在该应用
          this.Gaode()
        } else {
          this.$toast('请安装地图后再使用')
        }
      } else {
        if (plus.runtime.isApplicationExist({ pname: 'com.baidu.BaiduMap' })) {
          this.Baidu()
        } else {
          this.$toast('请安装地图后再使用')
        }
      }
    },

    // 初始化地图
    initAMap() {
      AMapLoader.load({
        key: 'c47d6abe07171e55012724d1ac1e2e64', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0',
        plugins: []
      })
        .then((Amap) => {
          AMap = Amap
          // 其他功能同h5
          this.map = new AMap.Map('container', {
            viewMode: '3D',
            // center: [116.857461, 38.310582], // 地图中心点坐标
            zoom: 10 // 地图缩放级别
          })
          // this.marker = new AMap.Marker()
          this.getLocation()
        })
        .catch((e) => {
          console.log('高德地图加载错误', e)
        })
    },
    Gaode() {
      let dlat = this.location.location.lat // 终点的纬度
      let dlon = this.location.location.lng // 终点的经度
      let dname = this.location.address // 终点的名称
      let url = `amapuri://route/plan/?sid=BGVIS1&slat=&slon=&sname=&did=BGVIS2&dlat=${dlat}&dlon=${dlon}&dname=${dname}&dev=1&t=0`
      plus.runtime.openURL(url)
    },
    Baidu() {
      this.$toast('暂未开通')
    },
    // 获取位置
    getLocation() {
      let that = this
      AMap.plugin('AMap.Geolocation', function () {
        let geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000, // 超过10秒后停止定位，默认：无穷大
          maximumAge: 0, // 定位结果缓存0毫秒，默认：0
          convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          showButton: true, // 显示定位按钮，默认：true
          buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true, // 定位成功后在定位到的位置显示点标记，默认：true
          showCircle: false, // 定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: false, // 定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        })

        that.map.addControl(geolocation) // 右下角 获取当前位置控件
        that.map.on('click', showInfoClick) // 手动地图选取点位
        // 移动事件
        that.map.on('mapmove', (e) => {
          that.isSend = false
        })
        if (that.edit) {
          that.map.setCenter([that.location.location.lng, that.location.location.lat])
        }
        // 结束移动
        that.map.on('moveend', (e) => {
          console.log('e: ', e)
          var nowPoint = that.map.getCenter()
          console.log('nowPoint: ', nowPoint)
          that.setCenter(nowPoint, true)
          regeoCode(nowPoint)
          that.isSend = true
        })
        // 根据经纬度获取地理位置
        function regeoCode(lnglat) {
          console.log('lnglat: ', lnglat)
          let geocoder
          AMap.plugin('AMap.Geocoder', function () {
            geocoder = new AMap.Geocoder({
              city: '', // 城市设为北京，默认：“全国”
              radius: 1000 // 范围，默认：500
            })
            geocoder.getAddress(lnglat, function (status, result) {
              if (status === 'complete' && result.regeocode) {
                let address = result.regeocode.formattedAddress
                let obj = result.regeocode.addressComponent
                let desc = obj.city + obj.district + obj.township
                console.log('address: ', address)
                that.finalAddress = {
                  address: address,
                  desc: desc,
                  location: { ...lnglat }
                }
              } else {
                this.$toast('根据经纬度查询地址失败')
              }
            })
          })
        }

        function showInfoClick(e) {
          console.log(e, ' this. this. this.')
        }
        // 获取详细地址api
        geolocation.getCurrentPosition(function (status, result) {
          console.log('status: ', status)
          if (status === 'complete') {
            onComplete(result)
          } else {
            onError(result)
          }
        })
        function onComplete(data) {
          console.log('data: ', data)
          // data是具体的定位信息
          // alert(JSON.stringify(data));
          that.position = data.position
          that.searchPeriphery(that.position)
        }

        function onError(data) {
          // 定位出错
          console.log(data, 'onError')
        }
      })
    },
    setCenter(location, bool) {
      this.map.setCenter([location.lng, location.lat])
    },
    // 输入搜索
    searchNear() {
      let that = this
      AMap.plugin(
        ['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geolocation'],
        function () {
          var autoOptions = {
            // 城市，默认全国
            city: '', // 兴趣点城市，支持城市名、citycode、adcode
            citylimit: false, // 是否强制在设置的城市内搜索，默认false
            type: '商务住宅|公司企业|餐饮服务|科教文化服务|政府机构及社会团体', // 兴趣点类别，用‘|’分隔，默认：'餐饮服务|商务住宅|生活服务'
            // type: "公司企业", // 兴趣点类别，用‘|’分隔，默认：'餐饮服务|商务住宅|生活服务'
            pageSize: 50, // 每页条数，默认10，范围1-50
            pageIndex: that.pageIndex, // 页码
            extensions: 'all', // 默认base，返回基本地址信息；all：返回详细信息
            map: that.map, // 地图实例，可选
            // panel: 'panel', // 结果列表的id容器，可选
            autoFitView: false // 是否自动调整地图视野到marker点都处于可见范围
          }
          var autocomplete = new AMap.AutoComplete(autoOptions)
          autocomplete.search(that.keyWords, function (status, result) {
            console.log('result: ', result)
            // 搜索成功时，result即是对应的匹配数据
            if (result.tips) {
              let a = result.tips.filter((item) => item.location)
              that.$set(that, 'address_list', a.concat(that.address_list))
              that.pageIndex += 1
              that.loading = false
            } else {
              that.finished = false
            }
          })
        }
      )
    },
    // // 搜索周边
    searchPeriphery() {
      let that = this
      AMap.plugin(['AMap.PlaceSearch'], function () {
        // 构造地点查询类
        var placeSearch = new AMap.PlaceSearch({
          type: '商务住宅|公司企业|餐饮服务|科教文化服务|政府机构及社会团体', // 兴趣点类别，用‘|’分隔，默认：'餐饮服务|商务住宅|生活服务'
          pageSize: 30, // 单页显示结果条数
          pageIndex: 1, // 页码
          city: '', // 兴趣点城市
          citylimit: true, //  是否强制限制在设置的城市内搜索
          extensions: 'all', // 默认base，返回基本地址信息；all：返回详细信息
          map: that.map, // 地图实例，可选
          // panel: 'panel', // 结果列表的id容器，可选
          autoFitView: false // 是否自动调整地图视野到marker点都处于可见范围
        })

        var cpoint = that.map.getCenter()
        placeSearch.searchNearBy('', cpoint, 200, function (status, result) {
          console.log('result: ', result, status)
          if (status === 'complete') {
            that.address_list = result.poiList.pois
          }
        })
      })
    },
    confirm() {
      this.$bus.$emit('sendLocation', this.finalAddress)
      this.$router.go(-1)
    },
    // 关闭搜索
    onCancel() {
      this.address_list = []
      this.focus = false
    },
    onSearch(val) {
      console.log('val: ', val, this.keyWords)
      this.searchNear()
    },
    onLoad() {
      if (this.address_list.length) {
        this.searchNear()
      } else {
        this.cellLoading = false
      }
    },
    // 点击位置
    sureAddress(item) {
      console.log('item: ', item)
      if (item.location) {
        this.isSend = true
        // this.finalAddress = item
        this.map.setCenter([item.location.lng, item.location.lat])
      }
    }
  }
}
</script>

<style lang="less" scoped>
.map-address {
  height: inherit;
  display: flex;
  flex-direction: column;

  .map-title {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    color: #333;
    padding: 20px;
    box-sizing: border-box;
    .btn {
      color: #fff;
      cursor: pointer;
    }
    .btn1 {
      cursor: pointer;
      width: 100px;
      height: 55px;
      line-height: 55px;
      border-radius: 10px;
      background: #ccc;
      color: #fff;
    }
    .btn2 {
      cursor: pointer;
      width: 100px;
      height: 55px;
      line-height: 55px;
      border-radius: 10px;
      background: #05c160;
      color: #fff;
    }
  }
  #container {
    width: 100vw;
    height: 70%;
    position: relative;
    .map-location {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 99;
      width: 50px;
      height: 50px;
      transform: translate(-50%, -50%);
      color: #05c160;
      opacity: 1;
    }
  }
  .address-list {
    width: 100%;
    flex: 1;
    overflow: auto;
    background: #fff;
    padding: 0px 20px 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .search1 {
      width: 100%;
      height: 70px;
      background: #ededed;
      margin-top: 20px;
      margin-bottom: 20px;
      padding: 10px 0;
      position: sticky;
      top: 0;
      z-index: 11;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      box-sizing: border-box;
      .icon {
        font-size: 36px;
      }
      span {
        margin-left: 10px;
      }
    }
    .search2 {
      position: sticky;
      background: #fff;
      top: 0;
      padding-bottom: 20px;
      z-index: 11;
      .input {
        width: 100%;
        background: #ededed;
        line-height: 20px;
        display: flex;
        align-items: center;
        height: 70px;
        border-radius: 10px;
        margin-top: 20px;
      }
    }
    .cell-list {
      flex: 1;
    }
    .ul {
      .li {
        padding: 6px;
        border-bottom: 1px solid #ddd;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        height: 100px;
        .name {
          color: #333;
          font-size: 38px;
          width: 100%;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
        .detail {
          color: #666;
          font-size: 20px;
        }
      }
    }
  }
  .address-navigation {
    width: 100%;
    flex: 1;
    overflow: auto;
    background: #fff;
    padding: 0px 20px 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .navigation {
      width: 100%;
      display: flex;
      padding: 30px 10px;
      box-sizing: border-box;
      align-items: center;
      height: 200px;
      .title {
        width: 60%;
        font-size: 40px;
        font-weight: 600;
        color: #000;
        text-align: left;
      }
      .navigation-icon {
        flex: 1;
        display: flex;
        justify-content: space-evenly;
        .takeTaxi {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: #f6f6f6;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 55px;
            height: 55px;
          }
        }
        .navigation {
          width: 100px;
          height: 100px;
          img {
            width: 100px;
            height: 100px;
          }
        }
      }
    }
    .desc {
      font-size: 28px;
      color: #878787;
      text-align: left;
      font-weight: 600;
      padding: 0 10px;
    }
  }
}
</style>
