import * as THREE from "three"
import csv from './results.csv'

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})

renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)

const scene = new THREE.Scene()

const geometry = new THREE.SphereGeometry(2)
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

type CO2Emission = {
	time: number;
	temp: number;
}

function parse_csv() : CO2Emission[] {
	console.log(csv)

	const emissions: CO2Emission[] = csv.map((row : any) => {
		const emission : CO2Emission = {
			time : parseInt(row.Time),
			temp : Math.max(parseFloat(row.Value), 4) // heuristic
		}
		return emission;
	})
	
	return emissions.sort((a, b)=>(a.time - b.time));
}

document.getElementById("animation")?.addEventListener("click", visualise);

async function visualise() {
	var emissions = parse_csv();
	var maxValue = emissions.reduce((prev, curr)=>prev.temp>curr.temp?prev:curr).temp;
	var minValue = emissions.reduce((prev, curr)=>prev.temp<curr.temp?prev:curr).temp;
	var diff = maxValue - minValue;

	for (var i = 0; i < emissions.length; i++) {
		var emission = emissions[i];
		console.log(emission);
		var proportion = (emission.temp - minValue)/diff;
		sphere.material.color.setRGB(proportion, 0, 0);
		sphere.scale.set(proportion, proportion, proportion);
		renderer.render(scene, mainCamera);
		await new Promise(f => setTimeout(f, 50));
	}
}