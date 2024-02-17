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
    const near = 1;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(0, 0.5, 2.3);
    this._camera.lookAt(new THREE.Vector3(0, 0.6, 0));

    this._scene = new THREE.Scene();


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
    this.action = [];
    this.playing = 0;
    this.headAction = [0,3];
    this.neckBone = null;
    this.mouse = new THREE.Vector2();
    this._LoadModel();
    this._threejs.domElement.addEventListener('mousemove', (event) => this._onMouseMove(event), false);
    this._RAF();
  }

  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./lico-actions-subd.glb', (gltf) => {
      gltf.scene.traverse(c => {
        if (c.material) {
          c.material.side = THREE.FrontSide;
          c.material.depthWrite = true;
        }
        c.receiveShadow = true;
        if (c.name == "floor")
          c.castShadow = false;
        else
          c.castShadow = true;


      });

      this.headAction.forEach((i) => {
        const idsToRemove = [];

        gltf.animations[i].tracks.forEach((t, j) => {
            if (t.name.includes('mixamorigHead.quaternion')) {
              idsToRemove.push(j);
            }
        });
  
        idsToRemove.forEach((j) => {
            console.log('removing ' + i + ' ' + j)
            gltf.animations[i].tracks.splice(j, 1)
        });
      });

      const m = new THREE.AnimationMixer( gltf.scene );
      this._mixers.push(m);
      gltf.animations.forEach((element,i) => {
        this.action[i] = m.clipAction( element );
      });
      this.action[0].play();
      this.playing = 0;

      this._scene.add(gltf.scene);
      this.neckBone = gltf.scene.getObjectByName('mixamorigHead');
    });

  }
  _onMouseMove(event) {
    if (this.headAction.includes(this.playing)){
      this.mouse.set(
          (event.clientX / event.currentTarget.clientWidth) * 2 - 1,
          -(event.clientY / event.currentTarget.clientHeight) * 2 + 1
      );

      this.neckBone && this.neckBone.lookAt(this.mouse.x - 0.1, this.mouse.y + 1.1, 1);
    }
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




Array.from(document.querySelectorAll('input[name=action]')).forEach((element,index) => {
  element.addEventListener('click', () => {
    _APP.action[_APP.playing].stop();
    if (element.checked) {
      _APP.playing = parseInt(element.value);
      alert(_APP.headAction[0] + ' ' + _APP.playing + ' ' + _APP.headAction.includes(_APP.playing));
      _APP.action[_APP.playing].play();
    }
  }, false);
}); 