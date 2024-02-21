import { LineGraph } from "../lib/line_graph";

import data from '../../../../../../../../data/climate/ssp245/clean/pos_generative_rand.json' assert { type: 'json' };


// Create line graph
const graphElement = document.getElementById('graph');
const plotlyGraph = new LineGraph(graphElement);
plotlyGraph.prepareData(data);
plotlyGraph.create();
