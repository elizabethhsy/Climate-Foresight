import * as THREE from "three"
import csv from "../../../data/climate/pos_generative.csv"
import Globe from 'globe.gl';

Globe().globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
(document.getElementById('globeViz'))