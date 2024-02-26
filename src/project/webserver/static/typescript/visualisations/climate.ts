// import {Config} from '../configs'

function setup_config(): void {
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
}

async function setup_barchart(): void {
    const url = '/api/climate?scenario=ssp126&file=pos_generative';
    const url_data = await fetch(url);
    const data = await url_data.json();

    const configparent = document.getElementById("config-0-parent");

    const config = new Config(0);
    config.add_value("checkbox0", "Checkbox 0", "checkbox");
    config.add_value("checkbox1", "Checkbox 1", "checkbox");
    config.add_value("radio0", "Radio 0", "radiobutton", ["Radio Opt 1", "Radio Opt 2", "Radio Opt 3"]);
    config.add_value("slider0", "Slider 0", "slider", [0, 100, 5]);

    config.instantiate(configparent);

    // Create bar chart
    const graphElement = document.getElementById('chart');
    const plotlyGraph = new BarChart(graphElement, config);
    plotlyGraph.prepareData(data);
    plotlyGraph.create();

    document.getElementById("config-0-test").onclick = function () {
        alert(
            "Checkbox 0: " + config.values["checkbox0"] + "\n" +
            "Checkbox 1: " + config.values["checkbox1"] + "\n" +
            "Radio 0: " + config.values["radio0"] + "\n" +
            "Slider 0: " + config.values["slider0"]
        );
    }
}
