// Imports need to be commented out for 
// import {Config} from '../configs'

async function setup_barchart(): void {
    const url = '/api/climate?scenario=ssp126&file=pos_generative';
    const url_data = await fetch(url);
    const data = await url_data.json();
    
    const configParent = document.getElementById("config-1-parent");

    const config = new Config(0);
    config.add_heading("SSP Scenario");
    config.add_value("radioScenario", "Radio Scenario", "radiobutton", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    config.add_heading("Data");
    config.add_value("radioMetric", "Radio Metric", "radiobutton", ["forcing", "concentration", "emissions", "airborne emissions"], "forcing");

    config.instantiate(configParent);
    
    // Create bar chart
    const graphElement = document.getElementById('bar-chart');
    const barChart = new BarChart(graphElement, config);
    barChart.prepareData(data);
    barChart.render();

}
