import Vue from 'vue';
import Summary from './Summary.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(Summary),
}).$mount('#app');
