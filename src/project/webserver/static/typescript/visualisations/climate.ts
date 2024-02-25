// Imports need to be commented out for Django to build correctly
// import {Config} from '../configs'

async function setupBarChart(): void {
    // Create config for bar chart
    const configParent = document.getElementById("config-1-parent");
    const config = new Config(1);

    config.add_heading("SSP Scenario");
    config.add_value("radioScenario", "Radio Scenario", "radiobutton", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    config.add_heading("Data");
    config.add_value("radioMetric", "Radio Metric", "radiobutton", ["forcing", "concentration", "emissions", "airborne emissions"], "forcing");

    config.instantiate(configParent); // instantiate on the web page
    
    // Create bar chart
    const graphElement = document.getElementById('bar-chart');
    const barChart = new BarChart(graphElement, config);
    await barChart.init();
    barChart.render();
}

async function setupMultilineGraph(): void {
    // Create config for multi-line graph
    const configParent = document.getElementById("config-2-parent");
    const config = new Config(2);

    config.add_heading("SSP Scenario");
    config.add_value("radioScenario", "Radio Scenario", "radiobutton", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    // config.add_heading("Data");
    // config.add_value("radioMetric", "Radio Metric", "radiobutton", ["forcing", "concentration", "emissions", "airborne emissions"], "forcing");

    config.instantiate(configParent); // instantiate on the web page


    const graphElement = document.getElementById('multi-line-graph');
    const graph = new OverlayedLineGraph(graphElement, config);
    await graph.init();
    graph.render();
}

async function setupRibbonGraph(): void {
    // TODO
}

async function setupClimateFigures(): void {
    setupBarChart();
    setupMultilineGraph();
    setupRibbonGraph();
}
