import './style.css'
//import javascriptLogo from './javascript.svg'
import * as THREE from "three";
import { ARButton } from 'three/examples/jsm/Addons.js';

let camera, scene, renderer;
let puffMarkerMesh;

init();

async function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera (70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setAnimationLoop(render);
    renderer.xr.enabled = true;
    const container = document.querySelector("#scene-container");
    container.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set (0.5, 1, 0.25);
    scene.add(ambient);
    
    //setup image targets
    const imgMarkerPuff = document.getElementById("imgMarkerPuff");
    const imgMarkerPuffBitmap = await createImageBitmap(imgMarkerPuff);
    console.log(imgMarkerPuffBitmap);

    //AR button
    const button = ARButton.createButton(renderer, {
      requiredFeatures: ["image-tracking"], 
      trackedImages: [
        {
          image: imgMarkerPuffBitmap, //tell webxr this is the image we want to track
          widthInMeters: 0.08, //irl size of printed image
        }
      ],
      //for mobile debug
      optionalFeatures: ["dom-overlay"],
      domOverlay: {
        root:document.body,
      },
    });
    
    document.body.appendChild(button);

    //add 3d object for tracker
    const puffMarker3D = new THREE.BoxGeometry(0.2,0.2,0.2);
    puffMarker3D.translate (0, 0.1, 0);
    const puffMarkerMaterial = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    puffMarkerMesh = new THREE.Mesh(puffMarker3D,puffMarkerMaterial);
    puffMarkerMesh.name = "Puff3DObject";
    puffMarkerMesh.matrixAutoUpdate = false;
    puffMarkerMesh.visible = false;
    scene.add(puffMarkerMesh);
}

function render(timestamp, frame) {
  if (frame) {
    const results = frame.getImageTrackingResults();// checking for image we are tracking
    console.log(results);
    
    //if we have more than one image, the results are an array
    for (const results of results) {
      // result index is image's position in the trackedImages array specified at session creation
      const imageIndex = result.index;

      //get the pose of the image relative to a reference space.
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = frame.getPose(result.imageSpace, referenceSpace);

      //checking the state of the tracking
      const state = result.trackingState;
      console.log(state);

      if (state == "tracked"){
        console.log ("imageIndex: ", imageIndex);

        if (imageIndex == 0) {
          puffMarkerMesh.visible = true;
          // update the target mesh when the puff image target is found
          puffMarkerMesh.matrix.fromArray(pose.transform.matrix);
          console.log("puff image target found", puffMarkerMesh.position);
        }
      }
      else if (state == "emulated"){
        //commenting out unless debugging to not spam console
        //console.log ("image target no longer seen");
      }

    }
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});