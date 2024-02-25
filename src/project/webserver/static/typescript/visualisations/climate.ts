// Imports need to be commented out for 
// import {Config} from '../configs'

async function setup_barchart(): void {
    const url = '/api/climate?scenario=ssp126&file=pos_generative';
    const url_data = await fetch(url);
    const data = await url_data.json();
    
    const configParent = document.getElementById("config-0-parent");

    const config = new Config(0);
    // config.add_value("checkbox0", "Checkbox 0", "checkbox");
    // config.add_value("checkbox1", "Checkbox 1", "checkbox");
    config.add_value("radioScenario", "Radio Scenario", "radiobutton", ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"], "ssp119");
    config.add_value("radioMetric", "Radio Metric", "radiobutton", ["forcing", "concentration", "emissions", "airborne emissions"], "forcing");

    config.instantiate(configParent);
    
    // Create bar chart
    const graphElement = document.getElementById('chart');
    const barChart = new BarChart(graphElement, config);
    barChart.prepareData(data);
    barChart.render();

}
