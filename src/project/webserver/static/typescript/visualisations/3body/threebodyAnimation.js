import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Import OrbitControls
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
const numFiles = 8;
var jsonData = [];
for (let i = 0; i < numFiles; i++) {
    const url = "/api/3body/0.0" + `${i}` + "/deriv_generative.json";
    const data = await fetch(url);
    const dataJson = await data.json();
    jsonData.push(dataJson);
}
const materialColors = [
    0x00DD00, 0x00DD00, 0x00DD00,
    0xFF0000, 0xFF0000, 0xFF0000,
    0xFF7F00, 0xFF7F00, 0xFF7F00,
    0xAAAA00, 0xAAAA00, 0xAAAA00,
    0x0000FF, 0x0000FF, 0x0000FF,
    0x00FFFF, 0x00FFFF, 0x00FFFF,
    0x4B0082, 0x4B0082, 0x4B0082,
    0x9400D3, 0x9400D3, 0x9400D3, // Violet
];
function createTextLabel(scene, text, position) {
    const loader = new FontLoader();
    loader.load('fonts/helvetiker_bold.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.05,
            height: 0.02, // Adjust height as needed
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Adjust color as needed
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position); // Position the text label
        scene.add(textMesh); // Add the text label to the scene
    });
}
let currentIndex = 0;
let isPaused = true;
const speed = 3;
const trailLength = 30;
const trailOpacity = 0.3;
function control_setup(controls) {
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
    const material = new THREE.MeshBasicMaterial({ color: materialColors[materialIndex] });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'sphere' + `${materialIndex}`;
    scene.add(sphere);
    spheres.push(sphere);
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
function setupConfig(div) {
    // Create config for bar chart
    const configParent = document.getElementById(div);
    const config = new Config(99);
    config.add_heading("View Runs with Difffernt Noise Level");
    for (let i = 0; i < 8; i++) {
        config.add_value("checkbox" + `${i}`, "Noise Level " + `${i}`, "checkbox", null, true);
    }
    config.instantiate(configParent); // instantiate on the web page
    return config;
}
export async function ThreeBodyAnimation(maindiv, configdiv, control_div) {
    var spheres_div = document.getElementById(maindiv);
    if (!spheres_div) {
        throw new Error('Graph container not found');
    }
    const defaultAspectRatio = 16 / 9;
    const targetFrameRate = 60;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, defaultAspectRatio, 0.1, 1000);
    camera.position.z = 5;
    const particleSystems = [];
    const renderer = new THREE.WebGLRenderer();
    const spheres_div_style = window.getComputedStyle(spheres_div);
    const realSphereWidth = (spheres_div.clientWidth - parseFloat(spheres_div_style.paddingLeft) - parseFloat(spheres_div_style.paddingRight));
    renderer.setSize(realSphereWidth, realSphereWidth / defaultAspectRatio);
    renderer.setPixelRatio(window.devicePixelRatio * 4); // Increase renderer pixel ratio
    renderer.setClearColor(0xFFFFFF);
    spheres_div.appendChild(renderer.domElement);
    const gridSize = 20; // Size of the grid
    const gridDivisions = 20; // Number of divisions
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
    scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(20); // Adjust the size of the axes as needed
    scene.add(axesHelper);
    //add labels
    for (let i = -5; i <= 5; i++) {
        createTextLabel(scene, `${i}`, new THREE.Vector3(i, 0, 0)); // Example position for X-axis label
        createTextLabel(scene, `${i}`, new THREE.Vector3(0, i, 0)); // Example position for Y-axis label
        createTextLabel(scene, `${i}`, new THREE.Vector3(0, 0, i)); // Example position for Z-axis label
    }
    var config = setupConfig(configdiv);
    const controls = new OrbitControls(camera, document.getElementById(control_div));
    control_setup(controls);
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const data_length = jsonData[0].planet_coordsX_A.length;
    const spheres = [];
    // Add event listener to the document to toggle pause on spacebar press
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            event.preventDefault(); // prevent default spacebar behavior (scrolling)
            isPaused = !isPaused;
        }
    });
    for (let i = 0; i < materialColors.length; i++) {
        createSphere(i, scene, spheres, geometry);
    }
    for (let i = 0; i < materialColors.length; i++) {
        createTrailParticleSystem(materialColors[i], scene, particleSystems);
    }
    let velocityEnvironment = setupVelocities("velocities-div", control_div);
    // Event listener to detect keypress events
    let spheres_on = [];
    for (let i = 0; i < numFiles * 3; i++)
        spheres_on.push(1);
    //highlighting spheres when clicked on
    let spheres_highlight = [];
    for (let i = 0; i < numFiles * 3; i++)
        spheres_highlight.push(0);
    let mouseNDC = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
    let velocityGraphAnimates = [];
    document.addEventListener('click', function (event) {
        // Get the mouse position relative to the renderer's DOM element
        var rect = renderer.domElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        // Convert mouse coordinates to normalized device coordinates (NDC)
        mouseNDC.x = (mouseX / rect.width) * 2 - 1;
        mouseNDC.y = -(mouseY / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseNDC, camera);
        let intersects = raycaster.intersectObjects(spheres);
        let intersect_id = -1;
        for (let i = 0; i < intersects.length; i++) {
            let sphere_detected = intersects[i].object;
            let sphere_id = parseInt(sphere_detected.name.substring(6));
            if (spheres_on[sphere_id] == 1) {
                intersect_id = sphere_id;
                break;
            }
        }
        if (intersect_id == -1)
            return;
        if (spheres_highlight[intersect_id] == 0) {
            spheres[intersect_id].scale.set(2, 2, 2);
            spheres_highlight[intersect_id] = 1;
            let anim = addVelocityGraph(velocityEnvironment.scene, velocityEnvironment.controls, velocityEnvironment.renderer, velocityEnvironment.camera, intersect_id);
            velocityGraphAnimates[intersect_id] = anim;
        }
        else {
            spheres[intersect_id].scale.set(1, 1, 1);
            spheres_highlight[intersect_id] = 0;
            removeVelocityGraph(velocityEnvironment.scene, intersect_id);
            velocityGraphAnimates[intersect_id] = null;
        }
    });
    let lastFrameTime = Date.now();
    const animate = async () => {
        let frameTime = Date.now() - lastFrameTime;
        if (frameTime < 1000 / targetFrameRate) {
            await new Promise(r => setTimeout(r, 1000 / targetFrameRate - frameTime));
        }
        lastFrameTime = Date.now();
        requestAnimationFrame(animate);
        // var raycaster = new THREE.Raycaster();
        // // Perform raycasting from the camera to the mouse position
        // raycaster.setFromCamera(mouseNDC, camera);
        // // Check for intersections with objects in the scene
        // var intersects = raycaster.intersectObjects(spheres);
        // var intersect_id = -1;
        // // If there are intersections, highlight the first object
        // for (let i = 0; i < intersects.length; i++) {
        //   var sphere_detected = intersects[i].object;
        //   var sphere_id = parseInt(sphere_detected.name.substring(6));
        //   if (spheres_on[sphere_id] == 1) {
        //     intersect_id = sphere_id;
        //     break;
        //   }
        // }
        // for (let i = 0; i < numFiles * 3; i++) {
        //   if (i == intersect_id) {
        //     if (spheres_highlight[i] == 0) {
        //       console.log('highlight ' + i);
        //       // spheres[i].material.color.set(Math.random() * 0xffffff);
        //       spheres[i].scale.set(2, 2, 2);
        //       spheres_highlight[i] = 1;
        //     }
        //   }
        //   else if (spheres_highlight[i] == 1) {
        //     console.log('dehighlight ' + i);
        //     spheres[i].material.color.set(materialColors[i]);
        //     spheres[i].scale.set(1, 1, 1);
        //     spheres_highlight[i] = 0;
        //   }
        // }
        for (let i = 0; i < numFiles; i++) {
            const index = i * 3;
            const checked = config.values['checkbox' + `${i}`];
            // Toggle the visibility of the spheres associated with the pressed key
            for (let i = index; i < index + 3; i++) {
                const sphere_on = spheres_on[i];
                if (sphere_on == 1 && !checked) {
                    spheres_on[i] = 0;
                    scene.remove(spheres[i]);
                    scene.remove(particleSystems[i]);
                }
                else if (sphere_on == 0 && checked) {
                    spheres_on[i] = 1;
                    scene.add(spheres[i]);
                    scene.add(particleSystems[i]);
                }
            }
        }
        // Move sphere towards the current coordinates
        if (!isPaused) {
            for (let i = 0; i < numFiles; i++) {
                for (let k = 0; k < 3; k++) {
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
            for (let i = 0; i < velocityGraphAnimates.length; i++) {
                const anim = velocityGraphAnimates[i];
                if (anim) {
                    anim();
                }
            }
            currentIndex += speed;
            if (currentIndex >= data_length) {
                currentIndex = 0;
                // dirty hack to reset the trails on the velocity graph
                for (let i = 0; i < velocityGraphAnimates.length; i++) {
                    if (velocityGraphAnimates[i]) {
                        removeVelocityGraph(velocityEnvironment.scene, i);
                        velocityGraphAnimates[i] = addVelocityGraph(velocityEnvironment.scene, velocityEnvironment.controls, velocityEnvironment.renderer, velocityEnvironment.camera, i);
                    }
                }
            }
        }
        controls.update();
        velocityEnvironment.controls.update();
        // Render scene
        renderer.render(scene, camera);
        velocityEnvironment.renderer.render(velocityEnvironment.scene, velocityEnvironment.camera);
    };
    animate();
}
ThreeBodyAnimation("graph-div", "config-div", "3body-div");
function removeVelocityGraph(scene, label) {
    scene.remove(scene.getObjectByName(`sphere${label}`));
    scene.remove(scene.getObjectByName(`pathLine${label}`));
}
function addVelocityGraph(scene, controls, renderer, camera, label) {
    let coord = 0;
    let body = ['A', 'B', 'C'][label % 3];
    let data = jsonData[Math.floor(label / 3)];
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: materialColors[label] });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = `sphere${label}`;
    scene.add(sphere);
    const pathMaterial = new THREE.LineBasicMaterial({ color: materialColors[label] }); // Define material for the path line
    // Initialize path vertices array with zeros
    const pathVertices = new Float32Array(data['planet_coordsX_' + body].length * 3).fill(0);
    const pathGeometry = new THREE.BufferGeometry(); // Create a buffer geometry for the path line
    // Set the position of the first vertex to the initial position of the sphere
    pathVertices[0] = sphere.position.x;
    pathVertices[1] = sphere.position.y;
    pathVertices[2] = sphere.position.z;
    pathGeometry.setAttribute('position', new THREE.BufferAttribute(pathVertices, 3));
    const pathLine = new THREE.Line(pathGeometry, pathMaterial); // Create a line object for the path
    pathLine.name = `pathLine${label}`;
    scene.add(pathLine); // Add the path line to the scene
    const animate = () => {
        // requestAnimationFrame(animate);
        if (!isPaused) {
            sphere.position.x = data['planet_velocityX_' + body][currentIndex];
            sphere.position.y = data['planet_velocityY_' + body][currentIndex];
            sphere.position.z = data['planet_velocityZ_' + body][currentIndex];
            // Update the path line vertices
            pathVertices[coord * 3] = sphere.position.x;
            pathVertices[coord * 3 + 1] = sphere.position.y;
            pathVertices[coord * 3 + 2] = sphere.position.z;
            pathLine.geometry.setAttribute('position', new THREE.BufferAttribute(pathVertices, 3));
            pathLine.geometry.attributes.position.needsUpdate = false;
            coord += 1;
        }
        controls.update();
        renderer.render(scene, camera);
    };
    return animate;
}
function setupVelocities(graph_div, control_div) {
    const defaultAspectRatio = 16 / 9;
    const graphContainer = document.getElementById(graph_div);
    if (!graphContainer) {
        throw new Error('Graph container not found');
    }
    const computedStyle = window.getComputedStyle(graphContainer);
    const realSphereWidth = (graphContainer.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, defaultAspectRatio, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(realSphereWidth, realSphereWidth / defaultAspectRatio);
    renderer.setClearColor(0xF0E6D2);
    graphContainer.appendChild(renderer.domElement);
    const gridSize = 20; // Size of the grid
    const gridDivisions = 10; // Number of divisions
    const gridHelperGraph = new THREE.GridHelper(gridSize, gridDivisions);
    scene.add(gridHelperGraph);
    const axesHelperGraph = new THREE.AxesHelper(20); // Adjust the size of the axes as needed
    scene.add(axesHelperGraph);
    renderer.render(scene, camera);
    const controls = new OrbitControls(camera, document.getElementById(control_div));
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
    return {
        "scene": scene,
        "camera": camera,
        "renderer": renderer,
        "controls": controls
    };
}
