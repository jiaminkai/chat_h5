import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/views/Hello'
import Chat from '@/views/Chat'
import Register from '@/views/Register'
import Map from '@/views/LocationMap'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      meta: {
        nacy: true
      },
      component: HelloWorld
    },
    {
      path: '/Chat',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/Register',
      name: 'Register',
      meta: {
        nacy: true
      },
      component: Register
    },
    {
      path: '/Map',
      name: 'Map',
      component: Map
    }
  ]
})
