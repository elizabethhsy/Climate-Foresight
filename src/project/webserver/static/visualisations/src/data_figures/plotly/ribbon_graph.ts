import { PlotlyRibbonGraph } from './../plotly_ribbon_graph';

import data from './../../../../../../../../data/climate/ssp585/clean/pos_generative_rand.json' assert { type: 'json' };

const graphElement = document.getElementById('graph');


// Make sure the element exists
if (graphElement) {
    // Instantiate the PlotlyRibbonGraph with the HTML element
    const plotlyGraph = new PlotlyRibbonGraph(graphElement);

    // Pass the data to the class
    plotlyGraph.prepareData(data);

    // Create the graph
    plotlyGraph.create();

} else {
    console.error('Graph element not found');
}
