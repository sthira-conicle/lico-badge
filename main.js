import * as THREE from 'three';

import {FBXLoader} from 'FBXLoader';
import {GLTFLoader} from 'GLTFLoader';
import {OrbitControls} from 'OrbitControls';

class LoadModelDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 50;
    const aspect = 1920 / 1080;
    const near = 0.01;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(0, 0.5, 2.3);
    this._camera.lookAt(new THREE.Vector3(0, 0.6, 0));

    this._scene = new THREE.Scene();


    let light = new THREE.DirectionalLight(0xFFFFFF, 5.0);
    light.position.set(5, 10, 7.5);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = 0;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;
    this._scene.add(light);

    light = new THREE.AmbientLight(0x846E62, 5.0);
    this._scene.add(light);

/*
    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
*/

    this._OnWindowResize();

    this._mixers = [];
    this._previousRAF = null;

    this._LoadModel();
    this._RAF();
  }

  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./scene.glb', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true;
      });

      const m = new THREE.AnimationMixer( gltf.scene );
      this._mixers.push(m);
      const action = [];
      gltf.animations.forEach((element,i) => {
        action[i] = m.clipAction( element );
      });
      action[0].play();

      this._scene.add(gltf.scene);
    });
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}


let _APP = null;


window.addEventListener('DOMContentLoaded', () => {
  _APP = new LoadModelDemo();
});