import * as THREE from "three"
import csv from "../../data/climate/pos_generative.csv"
import Globe from 'globe.gl';

const N = 300;
const gData = [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 160,
    lng: (Math.random() - 0.5) * 360,
    weight: Math.random()
}));

const world = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    .heatmapsData([gData])
    .heatmapPointLat('lat')
    .heatmapPointLng('lng')
    .heatmapPointWeight('weight')
    .heatmapTopAltitude(0.7)
    .heatmapsTransitionDuration(3000)
    .enablePointerInteraction(false)
    (document.getElementById('globeViz'));