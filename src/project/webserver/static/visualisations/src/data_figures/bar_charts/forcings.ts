import { BarChart } from "../templates/bar_chart";

import data from '../../../../../../../../data/climate/ssp585/clean/pos_generative.json' assert { type: 'json' };

// const url = '/api/climate?scenario=ssp126&file=pos_generative';
// const data = await fetch(url);
// const json_data = await data.json();


console.log(data);

// Create bar chart
const graphElement = document.getElementById('graph');
const plotlyGraph = new BarChart(graphElement);
plotlyGraph.prepareData(data);
plotlyGraph.create();
