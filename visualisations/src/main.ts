import { randomInt } from "crypto"
import * as THREE from "three"

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})

renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)

const scene = new THREE.Scene()

const geometry = new THREE.SphereGeometry()
const material = new THREE.MeshPhongMaterial({ color: 0xFFAD00 })

const sphere = new THREE.Mesh(geometry, material)
sphere.position.z = -5
sphere.position.y = 0

scene.add(sphere)

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(0, 4, 1)

scene.add(light)

const light2 = new THREE.DirectionalLight(0xFFFFFF, 1)
light2.position.set(1, -3, 3)

scene.add(light2)

renderer.render(scene, mainCamera)

let array = [0xFF0000, 0x00FF00, 0x0000FF]
let i = 0;

async function playAnimation() {
	while (true) {
		material.color.setHex(array[i]);
		i = (i+1)%array.length;
		renderer.render(scene, mainCamera)
		await new Promise(f => setTimeout(f, 1000));
	}
}

document.getElementById("animation")?.addEventListener("click", playAnimation);

type CO2Emission = {
	timestamp: number;
	emission_per_layer: number[];
}

