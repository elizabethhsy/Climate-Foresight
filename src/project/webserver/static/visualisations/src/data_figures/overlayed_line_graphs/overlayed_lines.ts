import { OverlayedLineGraph } from "../templates/overlayed_line_graphs";

import data from '../../../../../../../../data/climate/ssp245/clean/pos_generative_rand.json' assert { type: 'json' };


// Create line graph
const graphElement = document.getElementById('graph');
const plotlyGraph = new OverlayedLineGraph(graphElement);
plotlyGraph.prepareData(data);
plotlyGraph.create();