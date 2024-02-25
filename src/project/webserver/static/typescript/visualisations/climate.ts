// import {Config} from '../configs'

// function setup_config(): void {
//     const configparent = document.getElementById("config-0-parent");

//     const config = new Config(0);
//     config.add_value("checkbox0", "Checkbox 0", "checkbox");
//     config.add_value("checkbox1", "Checkbox 1", "checkbox");

//     config.instantiate(configparent);

//     document.getElementById("config-0-test").onclick = function () {
//         alert(
//             "Checkbox 0: " + config.values["checkbox0"] + "\n" +
//             "Checkbox 1: " + config.values["checkbox1"]
//         );
//     }
// }

async function setup_barchart(): void {
    console.log(Date.now());
    const url = '/api/climate?scenario=ssp126&file=pos_generative';
    const url_data = await fetch(url);
    const data = await url_data.json();
    console.log(Date.now());
    
    const configparent = document.getElementById("config-0-parent");

    const config = new Config(0);
    config.add_value("checkbox0", "Checkbox 0", "checkbox");
    config.add_value("checkbox1", "Checkbox 1", "checkbox");

    config.instantiate(configparent);

    document.getElementById("config-0-test").onclick = function () {
        alert(
            "Checkbox 0: " + config.values["checkbox0"] + "\n" +
            "Checkbox 1: " + config.values["checkbox1"]
        );
    }
    
    // Create bar chart
    const graphElement = document.getElementById('chart');
    const barChart = new BarChart(graphElement, config);
    barChart.prepareData(data);
    barChart.render();
}
