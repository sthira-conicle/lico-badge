<template>
  <div id="app">
    <LicoBadge width=64 />
    <div class="content">
      <h3>Lib ที่ต้องลง</h3>
      <p>
        <a href="https://www.npmjs.com/package/three">https://www.npmjs.com/package/three</a><br>
        <a href="https://www.npmjs.com/package/three-gltf-loader">https://www.npmjs.com/package/three-gltf-loader</a>
      </p>
    </div>
    <div class="content">
      <h3>เรียกใช้ component</h3>
      <img src="/images/Frame 1261158577.png" />
    </div>
    <div class="content">
      <h3>ไฟล์ component LicoBadge.vue</h3>
      ต้องโหลดไฟล์ 3D เข้ามาใน function loadModel()<br><br>
      <img src="/images/Frame 1261158578.png" />
    </div>
  </div>
</template>

<script>
import LicoBadge from '@/components/LicoBadge.vue'

export default {
  name: 'App',
  components: {
    LicoBadge
  }
}
</script>

<style lang="scss">
  @import "@/styles/global.scss";
  #app{
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 48px;

    div.content {
      width: 640px;
      img {
        width: 640px;
      }
    }
  }
</style>
