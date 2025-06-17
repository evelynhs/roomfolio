import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const modals = {
  about: document.querySelector(".modal.about"),
  projects: document.querySelector(".modal.projects"),
  contact: document.querySelector(".modal.contact"),
}

let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, {passive: false});

  button.addEventListener("click", (e) => {
    if (touchHappened) {return};
    e.preventDefault();
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, {passive: false});
});

const showModal = (modal) => {
  modal.style.display = "block";

  gsap.set(modal, {opacity: 0});

  gsap.to(modal, {
    opacity: 1, 
    duration: 0.5,
  });
};

const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0, 
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    } 
  });
};

const zAxisFans = [];

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
  Button_Git: "https://github.com/",
  Button_LN: "https://linkedin.com/",
  Button_IG: "https://instagram.com/",
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// loaders
const textureLoader = new THREE.TextureLoader();

// model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/" );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const environmentMap = new THREE.CubeTextureLoader()
	.setPath( 'textures/skybox/' )
	.load( ['px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp'] );

const textureMap = {
  First: {
    day: "textures/room/first_texture_set.webp",
  },
  Second: {
    day: "textures/room/second_texture_set.webp",
  },
  Third: {
    day: "textures/room/third_texture_set.webp",
  },
  Fourth: {
    day: "textures/room/fourth_texture_set.webp",
  },
};

const loadedTextures = {
  day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  metalness: 0,
  roughness: 0,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
  // lightIntensity: 1,
  // exposure: 1,
});

// if i want vid on screen, later thing
// const videoElement = document.createElement("video");
// videoElement.src = "/textures/video/Screen.mp4";
// videoElement.loop = true;
// videoElement.mute = true;
// videoElement.playsInline = true;
// videoElement.autoplay = true;
// videoElement.play()

// const videoTexture = new THREE.VideoTexture(videoElement);
// videoTexture.colorSpace = THREE.SRGBColorSpace;
// videoTexture.flipY = false;

window.addEventListener("mousemove", (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("touchstart", (e) => {
  e.preventDefault();
  pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  {passive: false}
);
window.addEventListener("touchend", (e) => {
  e.preventDefault();
  handleRayCasterInteraction();
  },
  {passive: false}
);

function handleRayCasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Button_About")) {
      showModal(modals.about);
    } else if (object.name.includes("Button_Projects")) {
      showModal(modals.projects);
    } else if (object.name.includes("Button_Contact")) {
      showModal(modals.contact);
    }
  }
}

window.addEventListener("click", handleRayCasterInteraction);

loader.load("/models/Room_Portfolio_V2.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }

      if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      // } else if (child.name.includes("Screen")) {
      //   child.material = new THREE.MeshBasicMaterial({
      //     map: videoTexture,
      //   });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTextures.day[key],
            });

            child.material = material;

            if (child.name.includes("Fan")) {
              zAxisFans.push(child);
            }

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });
  scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  35, 
  sizes.width / sizes.height, 
  0.1, 
  1000 
);
camera.position.set(19.091589234676704, 10.089789056381026, 17.389709025564372);
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update(); 
controls.target.set(0.0036804629215764265, 2.925270170662769, -1.3687831470571423);

// event listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;

  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

function animate() {}

const render = () => {
  controls.update(); 

  // console.log(camera.position);
  // console.log("-----------");
  // console.log(controls.target);

  // animate fans
  zAxisFans.forEach((fan) => {
    fan.rotation.z += 0.01;
  });

  // raycaster
  raycaster.setFromCamera( pointer, camera );

	currentIntersects = raycaster.intersectObjects( raycasterObjects );

	for (let i = 0; i < currentIntersects.length; i ++) {
		currentIntersects[i].object.material.color.set( 0xff0000 );
	}

  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;

    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    document.body.style.cursor = "default";
  }

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();