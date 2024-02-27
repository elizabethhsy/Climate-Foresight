import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const materialColors = [
  0xb71c1c, 0x1b5e20, 0x0d47a1,
  0x8b0000, 0x006400, 0x00008b,
  0xdc143c, 0x228b22, 0x4169e1,
  0xff0000, 0x008000, 0x0000ff,
  0xff6347, 0x32cd32, 0x1e90ff,
  0xff6347, 0x00ff00, 0x00bfff,
  0xff7f50, 0x7fff00, 0x87ceeb,
  0xffa07a, 0xadff2f, 0xb0e0e6
];
function createTextLabel(scene, text, position) {
  const loader = new FontLoader();
  loader.load('fonts/helvetiker_bold.typeface.json', function (font) {
      const textGeometry = new TextGeometry(text, {
          font: font,
          size: 0.05, // Adjust size as needed
          height: 0.02, // Adjust height as needed
      });
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Adjust color as needed
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.copy(position); // Position the text label
      scene.add(textMesh); // Add the text label to the scene
  });
}


const trailLength = 30;
const trailOpacity = 0.3;

function control_setup(controls){
  // Enable damping for smooth camera movement
  controls.enableDamping = true;

  // Enable user interaction to rotate the camera around the scene
  controls.enableRotate = true;

  // Enable user interaction to zoom in and out
  controls.enableZoom = true;

  // Enable user interaction to pan the camera
  controls.enablePan = true;

  // Set the damping factor for camera rotation (higher value for slower rotation)
  controls.rotateSpeed = 0.5;

  // Set the damping factor for camera zoom (higher value for slower zoom)
  controls.zoomSpeed = 0.5;

  // Set the damping factor for camera panning (higher value for slower panning)
  controls.panSpeed = 0.5;

  // Limit the range of vertical rotation (elevation angle)
  controls.minPolarAngle = -Math.PI; // in radians
  controls.maxPolarAngle = Math.PI; // in radians

  // Limit the range of horizontal rotation
  controls.minAzimuthAngle = -Math.PI / 2; // in radians
  controls.maxAzimuthAngle = Math.PI / 2; // in radians

  // Limit the range of zooming
  controls.minDistance = 1;
  controls.maxDistance = 100;

  // Set up the damping factor for camera movement
  controls.dampingFactor = 0.25;
}

function createSphere(materialIndex, scene, spheres, geometry) {
  const material = new THREE.MeshBasicMaterial({color: materialColors[materialIndex]})
  const sphere = new THREE.Mesh(geometry, material);
  sphere.name = 'sphere' + `${materialIndex}`;
  scene.add(sphere);
  spheres.push(sphere)
}

function createTrailParticleSystem(trailColor, scene, particleSystems) {
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(trailLength * 3); // Each particle has 3 components (x, y, z)
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Change square to circle
  particleGeometry.rotateX(Math.PI / 2); // Rotate to face the camera

  const particleMaterial = new THREE.PointsMaterial({
    color: trailColor,
    size: 0.2,
    transparent: true,
    opacity: trailOpacity,
    blending: THREE.NormalBlending
  });

  //console.log("Trail Color:", trailColor); // Log the trail color


  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);
  particleSystems.push(particleSystem);
}

async function setupConfig(div: string): Config{
  // Create config for bar chart
  const configParent = document.getElementById(div);
  const config = new Config(99);

  config.add_heading("View Runs with Difffernt Noise Level");
  for(let i = 0; i < 8; i++){
    config.add_value("checkbox" + `${i}`, "Noise Level " + `${i}`, "checkbox", null, true);
  }
  config.instantiate(configParent); // instantiate on the web page
  return config;
}
export async function ThreeBodyAnimation(div: string, configdiv: string){
  const speed = 3;
  const targetFrameRate = 60;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const particleSystems = [];

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8); // Set the size of the renderer to half the size of the window, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio * 4); // Increase renderer pixel ratio
  renderer.setClearColor(0xFFFFFF);
  // document.body
  var spheres_div = document.getElementById(div);
  spheres_div.appendChild(renderer.domElement);
  const gridSize = 20; // Size of the grid
  const gridDivisions = 20; // Number of divisions
  const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
  scene.add(gridHelper);
  const axesHelper = new THREE.AxesHelper(20); // Adjust the size of the axes as needed
  scene.add(axesHelper);
  //add labels
  for(let i = -5; i <= 5 ; i++){ 
    createTextLabel(scene, `${i}`, new THREE.Vector3(i, 0, 0)); // Example position for X-axis label
    createTextLabel(scene, `${i}`, new THREE.Vector3(0, i, 0)); // Example position for Y-axis label
    createTextLabel(scene, `${i}`, new THREE.Vector3(0, 0, i)); // Example position for Z-axis label
  }
  var config = setupConfig(configdiv);
  const controls = new OrbitControls(camera, renderer.domElement);
  control_setup(controls);
  const geometry = new THREE.SphereGeometry(0.2, 32, 32);

  const numFiles = 8;
  var jsonData = [];
  for(let i = 0; i < numFiles; i++){
    const url = "/api/3body/0.0" + `${i}` + "/deriv_generative.json";
    const data = await fetch(url);
    const dataJson = await data.json();
    jsonData.push(dataJson);
  }

  const data_length = jsonData[0].planet_coordsX_A.length;
  console.log('datalength:' + data_length);


  const spheres = []

  // Define a boolean flag to control animation pausing
  let isPaused = true;


// Add event listener to the document to toggle pause on spacebar press
  document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
      isPaused = !isPaused;
    }
  });


  for (let i = 0; i < materialColors.length; i++) {
    createSphere(i, scene, spheres, geometry);
  }


  for (let i = 0; i < materialColors.length; i++) {
    createTrailParticleSystem(materialColors[i],scene, particleSystems);
  }

  let currentIndex = 0;
  // Event listener to detect keypress events
  var spheres_on = [];
  for(let i = 0; i < numFiles * 3; i++) spheres_on.push(1);
  //highlighting spheres when clicked on
  const spheres_highlight = [];
  for(let i = 0; i < numFiles * 3; i++) spheres_highlight.push(0);
  var mouseNDC = new THREE.Vector2();
  document.addEventListener('mousemove', function(event) {
    // Get the mouse position relative to the renderer's DOM element
    var rect = renderer.domElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    // Convert mouse coordinates to normalized device coordinates (NDC)
    mouseNDC.x = (mouseX / rect.width) * 2 - 1;
    mouseNDC.y = -(mouseY / rect.height) * 2 + 1;
  });
  let lastFrameTime = Date.now();
  const animate = async () => {
    let frameTime = Date.now() - lastFrameTime;
    if (frameTime < 1000 / targetFrameRate) {
      await new Promise(r => setTimeout(r, 1000 / targetFrameRate - frameTime));
    }
    lastFrameTime = Date.now();
    requestAnimationFrame(animate);
    var raycaster = new THREE.Raycaster();

    // Perform raycasting from the camera to the mouse position
    raycaster.setFromCamera(mouseNDC, camera);

    // Check for intersections with objects in the scene
    var intersects = raycaster.intersectObjects(spheres);
    var intersect_id = null;
    // If there are intersections, highlight the first object
    for(let i = 0; i < intersects.length; i++){
      var sphere_detected = intersects[i].object;
      var sphere_id = parseInt(sphere_detected.name.substring(6));
      if(spheres_on[sphere_id] == 1){
        intersect_id = sphere_id;
        break;
      }
    }
    for(let i = 0; i < numFiles * 3; i++){
      if(i == intersect_id){
        if(spheres_highlight[i] == 0){
          console.log('highlight ' + i);
          spheres[i].material.color.set(Math.random() * 0xffffff);
          spheres[i].scale.set(2, 2, 2);
          spheres_highlight[i] = 1;
        }
      }
      else if(spheres_highlight[i] == 1){
        console.log('dehighlight ' + i);
        spheres[i].material.color.set(materialColors[i]);
        spheres[i].scale.set(1, 1, 1);
        spheres_highlight[i] = 0;
      }
    }
    for(let i = 0; i < numFiles ; i++){
      const index = i * 3;
      const checked = config.value['checkbox' + `${i}`];
      // Toggle the visibility of the spheres associated with the pressed key
      for (let i = index; i < index + 3; i++) {
        const sphere_on = spheres_on[i];
        if(sphere_on == 1 && !checked){
          spheres_on[i] = 0;
          scene.remove(spheres[i]);
          scene.remove(particleSystems[i]);
          console.log('removed sphere' + i);
        }
        else if(sphere_on == 0 && checked) {
          spheres_on[i] = 1;
          scene.add(spheres[i]);
          scene.add(particleSystems[i]);
          console.log('added sphere' + i);
        }
      }
    }
      // Move sphere towards the current coordinates
    if(!isPaused){
        for (let i = 0; i < numFiles; i++) {
          for(let k = 0 ; k < 3 ; k++){
            // Update the position of the ith sphere to match the current coordinates
            const added = ['A', 'B', 'C'];
            spheres[3 * i + k].position.x = 3 * jsonData[i]['planet_coordsX_' + added[k]][currentIndex];
            spheres[3 * i + k].position.y = 3 * jsonData[i]['planet_coordsY_' + added[k]][currentIndex];
            spheres[3 * i + k].position.z = 3 * jsonData[i]['planet_coordsZ_' + added[k]][currentIndex];
            // Update trail particles position associated with the ith sphere
            const trailParticles = particleSystems[3 * i + k].geometry.attributes.position.array;
            const spherePosition = spheres[3 * i + k].position;

            // Update position buffer attribute for the trail particles
            for (let j = trailLength - 1; j >= 1; j--) { // Skip the first few particles
              const index = j * 3;
              const previousIndex = (j - 1) * 3;

              // Shift the trail particles one step backward in the trail
              trailParticles[index] = trailParticles[previousIndex];
              trailParticles[index + 1] = trailParticles[previousIndex + 1];
              trailParticles[index + 2] = trailParticles[previousIndex + 2];
            }

            // Update the position of the first particle to match the sphere
            trailParticles[0] = spherePosition.x;
            trailParticles[1] = spherePosition.y;
            trailParticles[2] = spherePosition.z;

            // Update particle buffer
            particleSystems[3 * i + k].geometry.attributes.position.needsUpdate = true;
          }
        }
        currentIndex = (currentIndex + speed) % data_length;
      }

    controls.update();
    // Render scene
    renderer.render(scene, camera);
  };

  animate();
}

ThreeBodyAnimation("testdiv","configdiv");