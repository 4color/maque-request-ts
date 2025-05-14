<script setup lang="ts">
import {ref} from 'vue'
import requestWrap from "../packages/request";


const result = ref({})

function getBeijing() {
  //https://api.vvhan.com/api/60s
  requestWrap({url: "/api/one"}).then(res => {
    result.value = res;
  })
}
</script>

<template>
  <button @click="getBeijing">测试Ajax</button>

  <div>结果：{{ result }}</div>

</template>

<style scoped>

</style>
