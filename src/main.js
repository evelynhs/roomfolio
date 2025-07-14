import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from './utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createIcons, Github, Globe, Search } from 'lucide';
  createIcons({
    icons: { Search, Github, Globe }
  });
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

const overlay = document.querySelector(".overlay");
overlay.addEventListener(
  "touchend",
  (e) => {
    touchHappened = true;
    e.preventDefault();
    const modal = document.querySelector('.modal[style*="display: block"]');
    if (modal) hideModal(modal);
  },
  { passive: false }
);

overlay.addEventListener(
  "click",
  (e) => {
    if (touchHappened) return;
    e.preventDefault();
    const modal = document.querySelector('.modal[style*="display: block"]');
    if (modal) hideModal(modal);
  },
  { passive: false }
);

let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
  function handleModalExit(e) {
    e.preventDefault();
    const modal = e.target.closest(".modal");

    gsap.to(button, {
      scale: 5,
      duration: 0.5,
      ease: "back.out(2)",
      onStart: () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(2)",
          onComplete: () => {
            gsap.set(button, {
              clearProps: "all",
            });
          },
        });
      },
    });
  }
  
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

let isModalOpen = false;

const showModal = (modal) => {
  modal.style.display = "block";
  overlay.style.display = "block";
  isModalOpen = true;
  controls.enabled = false;

  if (currentHoveredObject) {
    playHoverAnimation(currentHoveredObject, false);
    currentHoveredObject = null;
  }
  document.body.style.cursor = "default";
  currentIntersects = [];

  gsap.set(modal, {
    opacity: 0,
    scale: 0,
  });
  gsap.set(overlay, {
    opacity: 0,
  });

  gsap.to(overlay, {
    opacity: 1,
    duration: 0.5,
  });

  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "back.out(2)",
  });
};

const hideModal = (modal) => {
  isModalOpen = false;
  controls.enabled = true;

  gsap.to(overlay, {
    opacity: 0,
    duration: 0.5,
  });

  gsap.to(modal, {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: "back.in(2)",
    onComplete: () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    },
  });
};

// loading screen
const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-button");
const loadingMiffy = document.querySelector(".loading-miffy");

manager.onLoad = function () {
  loadingMiffy.style.display = "none";
  loadingScreenButton.style.border = "8px solid #a29186";
  loadingScreenButton.style.background = "#d6c7bc";
  loadingScreenButton.style.color = "#f3efe4";
  loadingScreenButton.style.boxShadow = "rgba(0, 0, 0, 0.24) 0px 3px 8px";
  loadingScreenButton.textContent = "Enter!";
  loadingScreenButton.style.cursor = "pointer";
  loadingScreenButton.style.transition =
    "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
  let isDisabled = false;

  function handleEnter() {
    if (isDisabled) return;
    loadingScreenButton.style.cursor = "default";
    loadingScreenButton.style.border = "8px solid #a29186";
    loadingScreenButton.style.background = "#e6e1d8";
    loadingScreenButton.style.color = "#a29186";
    loadingScreenButton.style.boxShadow = "none";
    loadingScreenButton.textContent = "hello :)";
    loadingScreen.style.background = "#e6e1d8";
    isDisabled = true;

    playReveal();
  }
    loadingScreenButton.addEventListener("mouseenter", () => {
    loadingScreenButton.style.transform = "scale(1.3)";
  });

  loadingScreenButton.addEventListener("touchend", (e) => {
    touchHappened = true;
    e.preventDefault();
    handleEnter();
  });

  loadingScreenButton.addEventListener("click", (e) => {
    if (touchHappened) return;
    handleEnter();
  });

  loadingScreenButton.addEventListener("mouseleave", () => {
    loadingScreenButton.style.transform = "none";
  });
};

function playReveal() {
  const tl = gsap.timeline();

  tl.to(loadingScreen, {
    scale: 0.5,
    duration: 1.2,
    delay: 0.25,
    ease: "back.in(1.8)",
  }).to(
    loadingScreen,
    {
      y: "200vh",
      transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
      duration: 1.2,
      ease: "back.in(1.8)",
      onComplete: () => {
        isModalOpen = false;
        // playIntroAnimation();
        loadingScreen.remove();
      },
    },
    "-=0.1"
  );
}

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const socialLinks = {
  Button_Git: "https://github.com/evelynhs/roomfolio",
  Button_LN: "https://www.linkedin.com/in/evelynhsiao/",
  Button_IG: "https://instagram.com/_evelynhsiao/",
  Headphones: "https://open.spotify.com/user/biatp2k4mglkw7xlhevxi1ek5?si=35f6f8a902e5484d/", 
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// loaders
const textureLoader = new THREE.TextureLoader();

// modal loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/" );

const loader = new GLTFLoader(manager);
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

const pc_Material = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  metalness: 0,
  roughness: 0,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
});

const matcha_Material = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  metalness: 0,
  roughness: 0,
  ior: 1.5,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
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
  if (isModalOpen) {return}
  e.preventDefault();
  pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  {passive: false}
);
window.addEventListener("touchend", (e) => {
  if (isModalOpen) {return}
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

let hourHand;
let minuteHand;
let chairTop;
const zAxisFans = [];

loader.load("/models/Room_Portfolio.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("ChairTop")) {
        chairTop = child;
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }
      if (child.name.includes("ClHour")) {
        hourHand = child;
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }
      if (child.name.includes("ClMin")) {
        minuteHand = child;
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.name.includes("Hover")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
      }

      if (child.name.includes("PC_Glass")) {
        child.material = pc_Material;
      } else if (child.name.includes("Matcha_Glass")) {
        child.material = matcha_Material;
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
  // playIntroAnimation();
});

// function playIntroAnimation() {
//   const t1 = gsap.timeline({
//     duration: 0.8,
//     ease: "back.out(1.8)",
//   });

//   t1.to()
// }
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  35, 
  sizes.width / sizes.height, 
  0.1, 
  1000 
);
camera.position.set(21.901090061803124, 10.131792926020346, 19.12422370096304);
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update(); 
if (window.innerWidth < 768) {
  camera.position.set(32.73023025072089, 17.603280287026216, 29.327508362833946);
  controls.target.set(-0.43214200639627204, 3.1054695924521205, -1.7105208909239629);
} else {
  camera.position.set(21.901090061803124, 10.131792926020346, 19.12422370096304);
  controls.target.set(-0.43214200639627204, 3.1054695924521205, -1.7105208909239629);
}

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

function playHoverAnimation(object, isHovering) {
  let scale = 1.2;
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.position);
  gsap.killTweensOf(object.rotation);

  if (object.name.includes("Picture") ||
     object.name.includes("Button") ||
     object.name.includes("Name") ||
     object.name.includes("Smiski") 
  ) {
    scale = 1.4;
  }
  if (object.name.includes("MatchaDrink")) {
    scale = 1;
  }

  if (isHovering) {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * scale,
      y: object.userData.initialScale.y * scale,
      z: object.userData.initialScale.z * scale,
      duration: 0.5,
      ease: "back.out(2)",
    });
    if (object.name.includes("Matcha_Glass")) { // matcha drink move togt
      const matchaDrink = scene.getObjectByName("MatchaDrink_Third_Raycaster_Hover1");
      if (matchaDrink) {
        gsap.to(matchaDrink.scale, {
          x: matchaDrink.userData.initialScale.x * scale,
          y: matchaDrink.userData.initialScale.y * scale,
          z: matchaDrink.userData.initialScale.z * scale,
          duration: 0.5,
          ease: "back.out(2)",
        });
      }
    }
    if (object.name.includes("Button_Projects")) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x - Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    } else if (
      object.name.includes("Button_About") ||
      object.name.includes("Button_Contact")
    ) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x + Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }
    if (object.name.includes("Hover2")) {
      gsap.to(object.rotation, {
        y: object.userData.initialRotation.y - Math.PI / 36,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }
    if (object.name.includes("Hover3")) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y + 0.12,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "bounce.out(1.8)",
    });
    if (
      object.name.includes("Button_Projects") ||
      object.name.includes("Button_About") ||
      object.name.includes("Button_Contact")
    ) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
    if (object.name.includes("Hover2")) {
      gsap.to(object.rotation, {
        y: object.userData.initialRotation.y,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
    if (object.name.includes("Hover3")) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
    if (object.name.includes("Matcha_Glass")) {
      const matchaDrink = scene.getObjectByName("MatchaDrink_Third_Raycaster_Hover1");
      if (matchaDrink) {
        gsap.to(matchaDrink.scale, {
          x: matchaDrink.userData.initialScale.x,
          y: matchaDrink.userData.initialScale.y,
          z: matchaDrink.userData.initialScale.z,
          duration: 0.3,
          ease: "bounce.out(1.8)",
        });
      }
    }
  }
}

// clock stuff
const clock = new THREE.Clock();

const updateClockHands = () => {
  if (!hourHand || !minuteHand) return;

  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const minuteAngle = (minutes + seconds / 60) * ((Math.PI * 2) / 60);

  const hourAngle = (hours + minutes / 60) * ((Math.PI * 2) / 12);

  minuteHand.rotation.x = -minuteAngle;
  hourHand.rotation.x = -hourAngle;
};

const render = (timestamp) => {
  const elapsedTime = clock.getElapsedTime();

  controls.update(); 

  updateClockHands();

  // console.log(camera.position);
  // console.log("-----------");
  // console.log(controls.target);

  // animate fans
  zAxisFans.forEach((fan) => {
    fan.rotation.z += 0.03;
  });

  if (chairTop) {
    const time = timestamp * 0.001;
    const baseAmplitude = Math.PI / 8;

    const rotationOffset =
      baseAmplitude *
      Math.sin(time * 0.5) *
      (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

    chairTop.rotation.y = chairTop.userData.initialRotation.y + rotationOffset;
  }

  // raycaster
  if (!isModalOpen) {
    raycaster.setFromCamera(pointer, camera);

    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    // for (let i = 0; i < currentIntersects.length; i ++) {
    //   currentIntersects[i].object.material.color.set(0xff0000);
    // }

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;

      if (currentIntersectObject.name.includes("Hover")) {
        if (currentIntersectObject !== currentHoveredObject) {
          if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
          }
          playHoverAnimation(currentIntersectObject, true);
          currentHoveredObject = currentIntersectObject;
        }
      }

      if (currentIntersectObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else { 
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
            currentHoveredObject = null;
          }
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
}

render();