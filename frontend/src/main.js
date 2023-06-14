import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import io from 'socket.io-client'

Vue.use(Vuex);
Vue.config.productionTip = false
Vue.prototype.$socket=io({transports: ['websocket']});

Vue.prototype.$messages=[];
const store = new Vuex.Store({
  state:{
  }
})

new Vue({
  data:{
    roomId:"abc",
  },
  store,
  vuetify,
  render: h => h(App),
  router,

}).$mount('#app')
