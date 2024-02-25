// import { BarChart } from "../templates/bar_chart";

// import data from '../../../../../../../../data/climate/ssp585/clean/pos_generative.json' assert { type: 'json' };


async function createBarChart() {
    const url = '/api/climate?scenario=ssp126&file=pos_generative';
    const url_data = await fetch(url);
    const data = await url_data.json();
    
    console.log(data);
    
    // Create bar chart
    const graphElement = document.getElementById('chart');
    const plotlyGraph = new BarChart(graphElement);
    plotlyGraph.prepareData(data);
    plotlyGraph.create();
}
