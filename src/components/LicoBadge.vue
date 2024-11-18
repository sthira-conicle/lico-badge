<template>
  <div ref="threeContainer" class="lico-badge three-container" :style="`width:${width}px;height:${width}px;`"></div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default {
  name: "LicoBadge",
  data() {
    return {
      threejs: null,
      scene: null,
      camera: null,
      mixers: [],
      neckBone: null,
      mouse: new THREE.Vector2(),
      rafId: null,
    };
  },
  props: {
    width: { type: Number, default: 64 },
  },
  methods: {
    initialize() {
      // Create renderer
      this.threejs = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true, // Enables transparency
      });
      this.threejs.shadowMap.enabled = true;
      this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
      this.threejs.setPixelRatio(window.devicePixelRatio);
      this.threejs.setSize(this.width*1.8,this.width*1.8);
      this.threejs.setClearColor(0x000000, 0);

      // Attach renderer to DOM
      this.$refs.threeContainer.appendChild(this.threejs.domElement);

      // Camera setup
      const fov = 50;
      const aspect = 1;
      const near = 1;
      const far = 1000.0;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.set(0, 0.5, 2.3);
      this.camera.lookAt(new THREE.Vector3(0, 0.6, 0));

      // Scene setup
      this.scene = new THREE.Scene();
      this.scene.background = null; // Ensures transparency

      // Lights
      let light = new THREE.DirectionalLight(0xFFFFFF, 4.0);
      light.position.set(5, 10, 7.5);
      light.target.position.set(0, 0, 0);
      light.castShadow = true;
      light.shadow.bias = 0;
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
      light.shadow.camera.near = 1;
      light.shadow.camera.far = 500;
      light.shadow.camera.left = -5;
      light.shadow.camera.right = 5;
      light.shadow.camera.top = 5;
      light.shadow.camera.bottom = -5;
      this.scene.add(light);

      light = new THREE.AmbientLight(0x846E62, 5.0);
      this.scene.add(light);


      // Load model
      this.loadModel();

      // Mouse move listener
      window.addEventListener("mousemove", this.onMouseMove);


      // Start render loop
      this.raf();

      
    },
    loadModel() {
      const loader = new GLTFLoader();
      loader.load("/lico-idle.glb", (gltf) => {
        gltf.scene.traverse((c) => {
          if (c.material) {
            c.material.side = THREE.FrontSide;
            c.material.depthWrite = true;
          }
          c.receiveShadow = true;
          c.castShadow = c.name !== "floor";

        });

          const idsToRemove = [];
          gltf.animations[0].tracks.forEach((t, i) => {
            if (t.name.includes("mixamorigHead.quaternion")) {
              idsToRemove.push(i);
            }
          });
          idsToRemove.forEach((i) => {
            gltf.animations[0].tracks.splice(i, 1);
          });

        this.scene.add(gltf.scene);

        this.neckBone = gltf.scene.getObjectByName("mixamorigHead");

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(gltf.scene);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();

          // Update the mixer on every frame
          this.mixers = [mixer];
        }
      });
    },
    onMouseMove(event) {
      const rect = this.threejs.domElement.getBoundingClientRect();
      const centerX = rect.left + (this.width*1.8/2);
      const centerY = rect.top + (this.width*1.8/2);
      this.mouse.set(
        event.clientX - centerX < 0 ? (event.clientX - centerX) / centerX : (event.clientX - centerX) / (event.currentTarget.innerWidth - centerX),
        event.clientY - centerY < 0 ? (event.clientY - centerY) / centerY * -1 : (event.clientY - centerY) / (event.currentTarget.innerHeight - centerY) * -1
      );
      console.log(this.mouse.x)

//alternative for better performance

      // this.mouse.set(
      //   (event.clientX / event.currentTarget.innerWidth) * 2 - 1,
      //   -(event.clientY / event.currentTarget.innerHeight) * 2 + 1
      // );
      if (this.neckBone) {
        this.neckBone.lookAt(this.mouse.x / 2, (this.mouse.y + 0.6) / 2, 1);
      }
    },
    raf() {
      this.rafId = requestAnimationFrame((t) => {
        if (this.previousRAF === null) {
          this.previousRAF = t;
        }

        this.raf();

        const timeElapsed = t - this.previousRAF;
        this.previousRAF = t;

        this._Step(timeElapsed);
        this.threejs.render(this.scene, this.camera);
      });
    },
    _Step(timeElapsed) {
      const delta = timeElapsed * 0.001;
      if (this.mixers.length > 0) {
        this.mixers[0].update(delta);
      }
    },
    cleanup() {
      cancelAnimationFrame(this.rafId);
      this.threejs.domElement.removeEventListener(
        "mousemove",
        this.onMouseMove
      );
      this.threejs.dispose();
      this.scene = null;
      this.camera = null;
      this.mixers = [];
    },
  },
  mounted() {
    this.initialize();
  },
  beforeUnmount() {
    this.cleanup();
  },
};
</script>

<style lang="scss">
.three-container {
  border-radius: 9999px;
  background-color: $color-secondary-500;
  overflow: hidden;

  canvas {
    display: block;
    position: relative;
    left: -40%;
    top: -5%;
  }
}
</style>