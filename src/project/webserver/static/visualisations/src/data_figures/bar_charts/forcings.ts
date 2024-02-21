import { BarChart } from "../templates/bar_chart";

import data from '../../../../../../../../data/climate/ssp126/clean/pos_generative.json' assert { type: 'json' };

// Create bar chart
const graphElement = document.getElementById('graph');
const plotlyGraph = new BarChart(graphElement);
plotlyGraph.prepareData(data);
plotlyGraph.create();
