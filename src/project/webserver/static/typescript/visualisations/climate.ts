// Imports need to be commented out for Django to build correctly
// import {Config} from '../configs'

async function setupBarChart(): void {
    // Create config for bar chart
    const configParent = document.getElementById("config-1-parent");
    const config = new Config(1);

    config.add_heading("SSP Scenario");
    config.add_value("radioBarChartScenario", "Scenario", "dropdown", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    config.add_heading("Data");
    config.add_value("radioBarChartMetric", "Metric", "dropdown", ["forcing", "concentration", "emissions", "airborne emissions"], "forcing");
    config.add_heading("Species");
    config.add_value("checkboxCO2", "CO2", "checkbox", null, true);
    config.add_value("checkboxCH4", "CH4", "checkbox", null, true);
    config.add_value("checkboxN2O", "N2O", "checkbox", null, true);

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
    config.add_value("radioMultilineScenario", "Radio Scenario", "dropdown", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    config.add_heading("Species");
    config.add_value("radioMultilineSpecies", "Radio Scenario", "dropdown", ["CO2", "CH4", "N2O"], "CO2");

    config.instantiate(configParent); // instantiate on the web page

    const graphElement = document.getElementById('multi-line-graph');
    const graph = new OverlayedLineGraph(graphElement, config);
    await graph.init();
    setTimeout(() => {
        graph.render();
    }, 4000);
}

async function setupRibbonGraph(): void {
    // Create config for ribbon graph
    const configParent = document.getElementById("config-3-parent");
    const config = new Config(3);

    config.add_heading("Data");
    config.add_value("dropdownRibbonMetric", "Metric", "dropdown", ["temperature", "forcing", "concentration", "emissions", "airborne emissions"], "temperature");
    config.add_heading("Species (if applicable)");
    config.add_value("dropdownRibbonSpecies", "Species", "dropdown", ["CO2", "CH4", "N2O"], "CO2");
    config.add_heading("Scenarios");
    config.add_value("checkboxSSP119", "ssp119", "checkbox", null, true);
    config.add_value("checkboxSSP126", "ssp126", "checkbox", null, true);
    config.add_value("checkboxSSP245", "ssp245", "checkbox", null, true);
    config.add_value("checkboxSSP370", "ssp370", "checkbox", null, true);
    config.add_value("checkboxSSP434", "ssp434", "checkbox", null, true);
    config.add_value("checkboxSSP534-over", "ssp534-over", "checkbox", null, true);
    config.add_value("checkboxSSP585", "ssp585", "checkbox", null, true);

    config.instantiate(configParent); // instantiate on the web page
    const graphElement = document.getElementById('ribbon-graph');
    const graph = new RibbonGraph(graphElement, config);
    await graph.init();
    graph.render();
}

async function setupTemperatureGraph(): void {
    // Create config for ribbon graph
    const configParent = document.getElementById("config-4-parent");
    const config = new Config(4);

    config.add_heading("SSP Scenario");
    config.add_value("radioTemperatureScenario", "Radio Scenario", "dropdown", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");

    config.instantiate(configParent); // instantiate on the web page
    const graphElement = document.getElementById('temperature-graph');
    const graph = new OverlayedLineGraph(graphElement, config, true);
    await graph.init();
    setTimeout(() => {
        graph.render();
    }, 4000);
}

async function setupClimateFigures(): void {
    setupBarChart();
    setupMultilineGraph();
    setupRibbonGraph();
    setupTemperatureGraph();
}
