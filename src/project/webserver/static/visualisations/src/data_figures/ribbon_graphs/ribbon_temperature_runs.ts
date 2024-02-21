import { PlotlyRibbonGraph } from '../lib/ribbon_graph';

import data from '../../../../../../../../data/climate/ssp585/clean/pos_generative_rand.json' assert { type: 'json' };


// HTML element to add the graph to
const graphElement = document.getElementById('graph');

// Instantiate the PlotlyRibbonGraph with the HTML element
const plotlyGraph = new PlotlyRibbonGraph(graphElement);

// Pass the data to the class
plotlyGraph.prepareData(data);

// Create the graph
plotlyGraph.create();
