// import { Figure, Species } from './figure';

// import * as d3 from "d3";

class BarChart extends Figure {
    // For storing the current state of the bar chart
    private scenario: string;
    private metric: string;  // options: forcing, emissions, airborne_emissions, concentration
    private species: Array<string>;

    // For caching fetched data
    private data: Object;
    
    static INTERVAL = 5;  // bar chart is in 5 year intervals (i.e. taking every 5th data point)

    static colorMap = { // TODO: move to parent class?
        CO2: '#4a8dbb',
        CH4: '#6ebd6e',
        N2O: '#ff9f4f'
    };

    constructor(DOMElement: HTMLElement, config) {
        super(DOMElement, config);
        this.scenario = "none";
        this.metric = "none";
        this.species = [];
        this.data = {};
    }

    public async update(render: boolean = true) {
        console.log("Updating bar chart");

        // Check whether there is anything to update
        const checkedBoxes = this.getCheckedBoxes();
        if (
            this.scenario === this.config.values["radioBarChartScenario"].replace(' ', '_')
            && this.metric === this.config.values["radioBarChartMetric"].replace(' ', '_')
            && checkedBoxes.length === this.species.length
            && this.getCheckedBoxes().every((v, i) => v === this.species[i])
        ) {
            console.log("Everything up to date :)");
            return;
        }

        // Update internal state
        this.scenario = this.config.values["radioBarChartScenario"];
        this.metric = this.config.values["radioBarChartMetric"].replace(' ', '_');
        this.species = checkedBoxes;

        // Fetch data if necessary
        await this.getDataForScenario(this.scenario);

        if (render) {
            this.render();
        }
    }

    private async getDataForScenario(scenario: string): void {
        if (!(this.scenario in this.data)) {
            const url = `/api/climate?scenario=${scenario}&file=pos_generative`;
            const data = await fetch(url);
            this.data[scenario] = await data.json();
            console.log("just fetched data for " + scenario);
            console.log(this.data);
        }
    }

    // Initialize bar chart without rendering
    public async init(): void {
        this.scenario = this.config.values["radioBarChartScenario"];
        this.metric = this.config.values["radioBarChartMetric"].replace(' ', '_');
        this.species = this.getCheckedBoxes();
        await this.getDataForScenario(this.scenario);
    }

    private getCheckedBoxes() {
        const checkedBoxes = [];
        for (const key in this.config.values) {
            if (key.includes("checkbox") && this.config.values[key]) {
                checkedBoxes.push(key.replace("checkbox", ""));
            }
        }
        return checkedBoxes;
    }

    public render(): void {
        const self = this; // capture this BarChart instance for later use within event handlers

        // Remove existing svg elements and replace with new figure
        if (d3.select(self.DOMElement).select("svg")) {
            d3.select(self.DOMElement).selectAll("svg").remove();
        }


        // Data processing
        console.log(self.species);
        const data = self.data[self.scenario];
        const checkedBoxes = self.species;
        const n = checkedBoxes.length; // No. of groups
        const k = BarChart.INTERVAL;

        const numPoints = 1 + Math.floor(data["year"].length / k);  // No. data points per group
        const arr = [...Array(numPoints)];

        var years = arr.map((_, i) => data["year"][k * i]);
        var CO2 = arr.map((_, i) => data[`CO2_${this.metric}`][k * i]);
        var CH4 = arr.map((_, i) => data[`CH4_${this.metric}`][k * i]);
        var N2O = arr.map((_, i) => data[`N2O_${this.metric}`][k * i]);

        // TODO: make this part extensible
        const yz = [];
        if (self.species.includes("CO2")) {
            yz.push(CO2);
        }
        if (self.species.includes("CH4")) {
            yz.push(CH4);
        }
        if (self.species.includes("N2O")) {
            yz.push(N2O);
        }

        const xz = d3.range(numPoints).map(i => `${years[i]}`); // x-axis tick labels
        // console.log(xz);

        // Div properties
        const width = 1450;
        const height = 750;
        const margin = {
            top: 90,
            right: 70,
            bottom: 60,
            left: 100
        }

        // Transform data for stacked or grouped presentation
        const y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz))
            .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

        const yMax = d3.max(yz, y => d3.max(y));
        const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

        const x = d3.scaleBand()
            .domain(xz)
            .rangeRound([margin.left, width - margin.right])
            .padding(0.08);

        const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 2 === 0)); // only display every other x-tick label

        const y = d3.scaleLinear()
            .domain([0, y1Max])
            .range([height - margin.bottom, margin.top]);
        
        const yAxis = d3.axisLeft(y);


        const svg = d3.select(self.DOMElement).append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: auto;");

        const rect = svg.selectAll("g")
            .data(y01z)
            .join("g")
            .attr("fill", (d, i) => BarChart.colorMap[self.species[i]])
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", (d, i) => x(xz[i]))
            .attr("y", height - margin.bottom)
            .attr("width", x.bandwidth())
            .attr("height", 0);

        // Create labels for when hovering over the bar
        const tooltip = d3.select("#tooltip");

        const histData = {
            "CO2": [2753.82222424413, 2753.42176509565, 2752.73096558272, 2753.64252822574, 2752.56567665575, 2753.08267692418, 2753.09685090612, 2753.79712557574, 2753.97632041944, 2753.07644594756, 2753.68471549869, 2751.98454924852, 2753.71599370647, 2753.183008457, 2753.78596950852, 2753.63986104312, 2754.10447183863, 2753.59976715576, 2754.01906818127, 2753.7848683988, 2754.02128504363, 2753.62442411746, 2753.09575870234, 2753.9489813125, 2753.74150602621, 2753.71037789465, 2751.01693555882, 2753.77230978192, 2753.42823776528, 2753.39899752653, 2753.64385527958, 2753.7119106294, 2754.42342895734, 2753.55281443031, 2753.83921191444, 2752.13779810123, 2753.75095024361, 2752.44225003573, 2753.41090911763, 2753.41981406112, 2753.76138445429, 2753.90831384884, 2753.60987882968, 2752.64470245019, 2753.3038928846, 2752.91217670177, 2753.92069972284, 2753.29170035037, 2753.88257437384, 2753.81776718112, 2753.00642256337, 2753.62451749891, 2753.82348178755, 2753.75586939647, 2750.01165276624, 2753.6364762637, 2753.41040679332, 2753.55130519536, 2753.52675883694, 2753.81705525964, 2753.36738752011, 2754.11650119171, 2752.98999302852, 2753.70825707305, 2753.83447606889, 2753.66948129989, 2753.61576031679, 2753.92981791269, 2753.46634503333, 2752.27900564814, 2753.78546640044, 2753.70886899168, 2753.78257755698, 2753.65796799782, 2753.78878198549, 2753.97912452613, 2753.54380084045, 2753.48641689701, 2753.73450843888, 2753.27868663371, 2752.84166633377, 2753.55683354579, 2753.68427047725, 2753.34704754419, 2753.13261076263, 2753.60394709087, 2753.71152479218, 2752.9733931782, 2752.3345914353, 2753.78517987113, 2753.63315632962, 2753.62609865336, 2753.81336905914, 2753.62154059881, 2753.81469966482, 2753.21426038072, 2753.9487239458, 2753.75363247342, 2753.81780281378, 2753.6270683224, 2753.87536994772, 2752.9382934943, 2751.89635605245, 2753.22966957378, 2753.68004157967, 2753.67868631449, 2753.88519090725, 2753.73568080162, 2753.30330461998, 2753.45712091253, 2753.18160616285, 2751.83903785198, 2752.9722128834, 2753.72420999429, 2753.75957432616, 2753.92919364455, 2753.97241969794, 2753.69282130514, 2753.72246475427, 2753.69962708688, 2754.02627546445, 2753.90878489084, 2753.3217866818, 2753.2598859943, 2753.28809993075, 2753.70064090421, 2753.83160024517, 2753.86018018833, 2753.88157005326, 2753.62339701259, 2753.82847221229, 2753.01847193466, 2753.97605644724, 2753.65786928085, 2751.19839976248, 2753.82500909547, 2753.80243870149, 2753.35038255703, 2752.6344803883, 2753.73954568897, 2753.7745198277, 2753.82137257811, 2753.41142140848, 2753.51121336942, 2753.53910752506, 2753.34543136769, 2753.84677970694, 2753.97376168167, 2752.3985334392, 2753.8592010176, 2752.86208515526, 2754.08997692448, 2753.24832500496, 2753.67930900787, 2753.50543862213, 2753.55312338845, 2752.7795064295, 2754.04655279671, 2753.75265259981, 2753.35644814313, 2753.74630248305, 2753.15253754617, 2753.80963331311, 2753.94045712885, 2753.55006917709, 2753.85499249046, 2753.13393097345, 2753.77021436074, 2753.83636979655, 2753.51658760687, 2753.36385170678, 2753.92814920693, 2753.8978864537, 2753.61482928564, 2753.75651038418, 2753.62476341316, 2753.80881925598, 2753.62057004411, 2753.61741399018, 2753.05614309499, 2753.39088600302, 2753.6993194399, 2753.36410366927, 2752.4981310361, 2753.99836047022, 2754.00382895494, 2753.65358063719, 2753.4463889991, 2753.74496773314, 2751.97712869076, 2753.95616849053, 2753.58296417091, 2753.69975624573, 2753.65853243401, 2753.73455684294, 2753.14701470136, 2753.66210326791, 2753.33752230246, 2753.61307212187, 2753.77126205812, 2753.149707208, 2753.6311190632, 2753.78132229785, 2753.44544018277, 2753.1551468774, 2753.86452192338, 2753.71726351885, 2754.00409173853, 2753.02975892182, 2753.85435679983, 2753.98596716885, 2753.76414156692, 2753.89270001884, 2753.71563569825, 2753.8957662452, 2753.58454741657, 2753.35209344755, 2753.47657441523, 2751.35292112027, 2753.85761737211, 2753.68261944163, 2753.75921200775, 2753.69548387015, 2753.46331177086, 2753.06576377457, 2753.73459292314, 2754.1242401454, 2753.87253752593, 2752.30609745075, 2752.10726673463, 2753.66182094407, 2753.83910192321, 2753.66390722179, 2753.82407530002, 2753.73041417921, 2753.65681672628, 2753.25516276381, 2753.3104684313, 2752.4744907072, 2753.65837893383, 2753.62702003471, 2753.69507146351, 2753.65894069132, 2753.6267987904, 2754.14603827023, 2753.61116077685, 2753.79081937803, 2753.828808767, 2753.73447962544, 2753.13304141647, 2753.36817153151, 2753.83408060737, 2753.97911966492, 2753.44694061812, 2753.76547735193, 2753.27814703006, 2753.48975764147, 2753.23133365091, 2753.86641056633, 2754.25852800987, 2752.62229434571, 2753.42260721938, 2753.36084420065, 2754.0068674977, 2752.46446406248, 2753.68526498901, 2749.75993201814, 2753.84894020458, 2753.84909516775, 2753.85333842656, 2753.45110675637, 2753.7676160274, 2754.12638664804, 2752.83183673871, 2752.75998571285, 2753.41053594632, 2753.73369859909, 2753.85562132152, 2753.86130844663, 2753.46112927718, 2753.81131553713, 2753.73353825919, 2753.13453675228, 2753.37812913835, 2753.58838278487, 2754.09137932473, 2753.41033830489, 2753.44264849308, 2753.78292163626, 2753.52444611699, 2753.77739447515, 2753.82870215854, 2753.52849677566, 2753.8576689076, 2753.49099618334, 2752.42338365886, 2753.68657638659, 2753.62690451071, 2753.69340461385, 2753.36307752416, 2753.7134788912, 2753.59033365523, 2753.20949882329, 2753.4196958945, 2750.76974555496, 2752.88838853817, 2753.78873678837, 2753.52827558024, 2753.81307127513, 2752.69424993908, 2753.96975133263, 2753.44568989824, 2753.43731760395, 2752.85332813443, 2752.47906071981, 2753.94193335374, 2753.77069396221, 2753.71490425295, 2753.81379687682, 2753.6354899347, 2753.79180691349, 2753.4654519713, 2753.99675266659, 2753.26801127244, 2753.83205141364, 2752.82787100754, 2754.00435312078, 2753.64787920446, 2753.04163209864, 2753.77443178072, 2753.82993846313, 2753.08757669822, 2751.29217008057, 2753.47140869599, 2754.24968419273, 2753.80209259012, 2753.88129705325, 2753.81124807551, 2753.67456381335, 2753.87016057791, 2753.64649082497, 2754.21372627967, 2753.88325713597, 2753.87959346037, 2753.77947905925, 2752.96332231704, 2753.26460410161, 2753.29619258998, 2752.33667752954, 2753.57156149021, 2753.81584915772, 2753.75709662025, 2753.50167763637, 2753.69252873273, 2753.75410014747, 2753.28365396423, 2753.97409425293, 2753.03166867496, 2753.86041767942, 2753.54875983691, 2753.87054397118, 2752.92603481112, 2753.27939390874, 2753.7771822501, 2753.77357477689, 2753.83693330171, 2752.70592295595, 2753.71079407299, 2753.61356633667, 2753.6860336993, 2753.46825589787, 2753.45775325045, 2754.47000532913, 2753.75540915028, 2753.68344624358, 2752.83470601171, 2753.89042594397, 2753.66797115702, 2753.16151135349, 2753.78092597165, 2753.63019278318, 2753.63595325893, 2753.32672939985, 2753.96203216191, 2751.56090396868, 2753.55030404629, 2753.92026938675, 2753.26933522811, 2753.93888223834, 2753.81258551122, 2753.94481448171, 2753.79570165216, 2753.92352245449, 2753.95279055059, 2753.91138427436, 2753.71523829197, 2753.79609352642, 2753.48884332088, 2753.75205961834, 2753.80511741794, 2753.44396004116, 2753.19907874048, 2752.61133105722, 2753.6799255081, 2753.58511205735, 2753.55158777402, 2753.92238171832, 2753.19759653245, 2752.83688676186, 2753.54683447931, 2753.61772429725, 2753.44673024392, 2751.04295665223, 2753.77953463812, 2753.7445565431, 2753.77863471087, 2753.96233518913, 2753.07191181839, 2753.35936869898, 2753.6785711653, 2753.32687691765, 2752.67645639816, 2753.74569485714, 2753.98922577161, 2753.75588849436, 2753.90363077411, 2753.31858798845, 2753.81749597145, 2753.85995010685, 2753.72683078992, 2752.85001548367, 2753.38979737274, 2753.37144992317, 2753.25577425141, 2753.67167538771, 2753.65298185896, 2753.42217117255, 2752.68517624978, 2753.78263425226, 2753.62601641453, 2753.34407142207, 2753.54916651931, 2752.5100489219, 2753.86112071435, 2753.5991637774, 2753.78179010013, 2753.45400533725, 2753.83975844412, 2753.62671417444, 2754.03305845338, 2753.73449968328, 2753.77743800838, 2753.72896763415, 2753.44718336111, 2753.60328347581, 2752.66320527957, 2753.69892612784, 2753.54557985048, 2753.77225606433, 2752.76498309392, 2753.84961733599, 2753.88346400957, 2753.56948757917, 2753.76704572897, 2753.31174846381, 2753.12407967354, 2753.31427282939, 2753.97099136506, 2753.01342861995, 2752.8814842643, 2753.25761836453, 2753.56446274607, 2753.72418692348, 2753.85255590498, 2753.5048899174, 2752.72539080536, 2753.78106321323, 2753.82520550642, 2753.28715193338, 2753.9180571478, 2753.54402809348, 2753.8439906771, 2752.81179439549, 2753.38500214714, 2753.08287806992, 2752.38565180856, 2753.09092338493, 2753.64222204765, 2753.96088992661, 2753.97731298072, 2753.68623781074, 2752.26019423701, 2753.87506985904, 2753.54637495679, 2753.3679195636, 2753.7060438908, 2753.62335560916, 2754.09838176206, 2753.49510153614, 2753.65497917681, 2752.89575185424, 2753.71874432674, 2753.10621351497, 2753.36395677068, 2753.49741914584, 2753.76253385141, 2753.76416938754, 2753.85963893323, 2753.8315881874, 2753.5371217415, 2753.57152135128, 2753.66548892049, 2753.57756703481, 2753.32273579654, 2752.81632119225, 2753.93219340453, 2753.53590164087, 2753.59714076322, 2752.39335057763, 2753.39629894952, 2752.60623072824, 2753.81016537004, 2753.69878654595, 2753.78470166948, 2753.6309200469, 2753.54464510533, 2753.50300564314, 2753.87616795403, 2753.62333730411, 2753.62744932314, 2753.76557708952, 2752.45648115518, 2753.85683300593, 2753.72266979557, 2752.32737432731, 2753.50944481942, 2753.88306780635, 2753.82507111245, 2753.75023929144, 2753.71488133055, 2753.89983646725, 2753.06054811821, 2753.75491210631, 2753.31439575769, 2753.9487811346, 2753.37907560964, 2753.89526070446, 2753.90000903622, 2752.20767937136, 2753.50808237873, 2754.12902876271, 2753.63401654683, 2753.79976800905, 2752.0456653232, 2753.67960165656, 2753.21087793325, 2753.65827933487, 2752.96989198629, 2752.67000570457, 2754.0711123156, 2753.77211663289, 2753.50933780597, 2753.57821246858, 2753.71369586681, 2753.76064235052, 2753.61980238628, 2747.7934074238, 2752.68665344758, 2753.77417370828, 2753.50268465879, 2753.43588798805, 2754.3253037541, 2753.27994912434, 2753.78023542243, 2753.20332588224, 2752.66458195125, 2753.51139374957, 2753.1510794464, 2753.56174066089, 2753.82205190712, 2753.80035326445, 2753.58992876873, 2753.61608921261, 2752.87476222152, 2753.76665814697, 2753.79057221739, 2753.28073880955, 2753.8116873864, 2753.13618695117, 2753.92146813987, 2753.84755202648, 2753.45347014844, 2753.65227172944, 2753.74467038664, 2753.5292974212, 2753.70093415364, 2753.40999565374, 2752.94154942771, 2753.65210573411, 2753.60771177388, 2753.25855293018, 2753.1490922308, 2752.98659422466, 2753.28771978412, 2753.90298280522, 2753.93162683661, 2753.21406381462, 2753.8738564472, 2753.59227198971, 2753.29025755164, 2753.8804227917, 2753.74216017531, 2753.80514900552, 2753.04498877984, 2752.78897833755, 2753.7390155277, 2752.56716874965, 2753.57936885061, 2753.60168655693, 2753.77655208856, 2753.42151074228, 2753.07849145291, 2752.84100454514, 2754.07465571342, 2753.67203425358, 2753.95227574771, 2753.57439203443, 2753.82341933577, 2753.81750149107, 2752.63924178862, 2753.54396029087, 2753.89949193025, 2751.5496712957, 2751.75412518454, 2750.71362613691, 2753.16402369609, 2753.10182180377, 2753.84499279941, 2752.42327883628, 2752.19874498262, 2753.06729737411, 2752.52452067928, 2753.96109017122, 2753.7694681856, 2753.37881337328, 2752.71582344629, 2753.1894100057, 2753.59197899674, 2751.52305233302, 2752.88031139526, 2752.81555666496, 2753.21559538783, 2752.21706036949, 2753.90348123972, 2753.52809003091, 2752.96926247369, 2753.5860610249, 2750.91403470113, 2753.37349063069, 2753.69185279956, 2753.82945902604, 2753.83619870447, 2753.6763601074, 2753.93460628149, 2753.40055656779, 2753.35264294232, 2753.58929781945, 2753.9404558015, 2753.76807812069, 2753.11866856376, 2753.71515298987, 2753.87906141308, 2753.57226165934, 2753.94139697972, 2753.9711793835, 2753.72646003418, 2751.77210683515, 2753.43343027295, 2753.35985737082, 2748.05340813397, 2753.85305462622, 2753.87330288305, 2752.18751097553, 2753.82753031992, 2752.91082832997, 2753.77883328125, 2754.00567693114, 2753.54220768438, 2753.95624180563, 2754.07728219068, 2753.89001532147, 2753.34472259744, 2753.96019617474, 2753.2347414538, 2753.47732892148, 2753.61300912687, 2753.80696173391, 2753.55020761519, 2753.50141147706, 2753.26123533199, 2753.81251683382, 2753.00092986698, 2753.66590385181, 2753.54779724545, 2753.40598105418, 2751.95442136287, 2753.66208075213, 2753.39712293256, 2753.74219869196, 2753.77668693013, 2753.95784350666, 2753.73687353013, 2753.64526680096, 2751.48612724564, 2753.82552111014, 2753.95856467602, 2753.11841124476, 2753.88494972984, 2753.60998961618, 2753.84038137009, 2751.96816259315, 2753.53929378841, 2753.74469397193, 2753.68864905453, 2753.7841331009, 2753.87937969706, 2753.25130682261, 2753.68488661896, 2753.85075356387, 2753.61713080349, 2753.38301945474, 2753.76188278847, 2752.82786789092, 2753.6603296674, 2753.70776706374, 2753.88687654366, 2753.76644769412, 2753.67543863946, 2754.02073435659, 2753.55000452726, 2753.95809152133, 2753.71365899353, 2753.80976953594, 2753.62456127015, 2753.82027034997, 2753.50484350479, 2753.8769527639, 2753.75998636855, 2753.76301864098, 2751.83681632206, 2753.08794908379, 2753.7104814256, 2753.91367431095, 2753.70322266585, 2753.15660994821, 2752.82394290157, 2753.5054727479, 2753.75540766355, 2753.75601277135, 2753.90234036187, 2753.45617778564, 2754.09566554997, 2752.91594048245, 2753.89558352819, 2753.7985694263, 2753.83569071453, 2753.87784809386, 2753.64846531811, 2753.76687654643, 2753.681987724, 2752.57595116049, 2753.79467828221, 2753.61325900993, 2753.6254804875, 2753.90491615814, 2753.70797841187, 2753.60973157249, 2753.90746795672, 2753.8120854232, 2753.78407899347, 2752.44031067177, 2753.70349991493, 2752.23790510521, 2753.34163490751, 2753.96546436099, 2754.0527209378, 2753.84203610948, 2753.59728816061, 2753.72881084, 2753.55067375499, 2753.78339566788, 2753.47580216794, 2753.7946625407, 2753.68475894155, 2753.25930761751, 2752.77564400826, 2751.59987966568, 2752.05148763639, 2753.51632856319, 2753.76396478992, 2753.8271539088, 2753.68032007653, 2753.91063260483, 2753.72960718341, 2753.86341073412, 2753.99177319396, 2753.80818878853, 2749.71591670711, 2753.59569129237, 2753.66557181016, 2753.82411991633, 2753.24816113616, 2753.95176007417, 2752.89004490541, 2753.78316493332, 2753.93760666036, 2753.53616084941, 2753.73487183821, 2753.84265088064, 2753.0171809631, 2752.64830575635, 2753.57764097565, 2753.88957119021, 2753.75041029219, 2753.92404154829, 2752.38310610757, 2752.74501453866, 2753.46255164322, 2752.74085570178, 2752.88090282156, 2753.36920091592, 2753.58029362374, 2753.44551371444, 2752.0507085948, 2753.83723084565, 2753.54844256102, 2751.00099511782, 2753.88880937253, 2753.62380879864, 2753.40995201541, 2753.78336032888, 2753.23096402926, 2753.943530981, 2753.71514756221, 2753.90054729902, 2753.66328292258, 2753.79028441122, 2753.88186004643, 2753.86953614551, 2752.86327404647, 2753.69945370973, 2753.59017068614, 2753.88460902877, 2753.80532341682, 2754.29470148778, 2753.51623061292, 2753.60997058887, 2752.73832321208, 2753.25677667234, 2753.1683956378, 2753.91296290214, 2753.74125458717, 2753.26025559989, 2753.70566456652, 2753.21337844636, 2754.08562147194, 2753.87553324176, 2753.46769322224, 2753.80083304658, 2753.45463668092, 2753.76674964719, 2753.89337496208, 2753.33365367345, 2753.80022063439, 2753.83459964582, 2753.45729147509, 2753.66159876372, 2753.701737858, 2753.88123984088, 2753.43700759295, 2753.23441319911, 2752.91468942617, 2754.09153245397, 2753.06914042299, 2753.82756599864, 2753.35404867529, 2753.71172917462, 2752.6913021474, 2753.77382763155, 2753.16763525485, 2752.65507274753, 2753.65288843125, 2753.47995762403, 2753.97445570049, 2753.71281295853, 2753.6665555568, 2753.61312406895, 2753.43287663716, 2753.54103367909, 2752.74194616713, 2753.67314638139, 2753.51779375147, 2753.92720173637, 2753.96041648313, 2753.4280097039, 2754.02744111461, 2752.56753384651, 2753.09520929436, 2752.22181517945, 2753.62339825827, 2753.05282491611, 2752.65922424187, 2753.53208630251, 2753.47261910433, 2750.74492714252, 2753.79374861243, 2753.90956830805, 2753.95727568205, 2753.62460924234, 2753.86314163829, 2752.66075721059, 2753.8192145669, 2752.50684282107, 2753.84517906862, 2752.04978596083, 2753.22404396307, 2753.49370410143, 2752.38083555151, 2754.00591636359, 2752.80681423707, 2753.73459467316, 2753.61054129652, 2753.20096578364, 2753.81268419317, 2753.8662276734, 2753.1561555515, 2753.84360896148, 2753.6116933502, 2753.00064172762, 2753.88385579246, 2753.79781073399, 2753.97228776402, 2753.89672409633, 2753.48857979224, 2753.81006418936, 2753.55984220671, 2753.60722382916, 2754.02078243197, 2753.85781619968, 2753.32143146421, 2753.35198314724, 2753.69945671194, 2750.04801222943, 2753.46361495222, 2751.94770182511, 2754.00679629425, 2753.25486996645, 2752.66664553595, 2753.85742058624, 2753.83256680513, 2753.57722402651, 2753.70369328342, 2753.68113877211, 2753.75830689592, 2753.3595466883, 2753.79141996035, 2753.71761278299, 2753.81805029587, 2753.64954974398, 2753.22345335764, 2753.01682872291, 2753.49432883766, 2753.63170113387, 2753.19569490964, 2751.50420724472, 2753.937134783, 2753.77788630655, 2753.85224025537, 2753.81430987923, 2753.48733601157, 2753.88219244085, 2752.97105790167, 2753.7164004451, 2753.86886259773, 2753.56670671073, 2753.10063491791, 2753.72563598565, 2753.7194360847, 2753.70942946839, 2753.36617924135, 2753.12138123263, 2752.88977645396, 2753.67391575339, 2753.21383689008, 2753.57102052433, 2753.82419483916, 2754.21620576987, 2752.81102917837, 2753.93999557801, 2752.94194017016],
            "CH4": [],
            "N2O": []
        };

        rect.on("mouseover", function(event, d) {
                console.log(self.config.values);
                // Reduce opacity of all rects
                svg.selectAll("rect")
                    .style("opacity", 0.35);
                const currentColumnIndex = rect.data().indexOf(d) % numPoints; // index of current rect
                
                // Set opacity of rects in the same column to 0.5
                svg.selectAll("rect").filter((_, i) => i % numPoints === currentColumnIndex)
                    .style("opacity", 0.5);
                
                svg.selectAll("rect").filter((_, i) => i % numPoints > currentColumnIndex)
                    .style("opacity", 0.05);

                // Set opacity of hovered over rect to 1
                d3.select(this)
                    .style("opacity", 1);

                // Create histogram
                const currentSpecies = self.species[Math.floor(rect.data().indexOf(d) / numPoints)];
                console.log(currentSpecies);
                const histSvg = self.createHoverFigure(histData["CO2"], currentSpecies); // TODO: make dynamic

                // Calculate position based on the hovered rectangle's position
                const rectBounds = this.getBoundingClientRect();
                histSvg.style("left", `${rectBounds.right + 10}px`) // 10px to the right of the rect
                        .style("top", `${rectBounds.top - 100}px`)
                        .style("visibility", "visible");



                // Display hover text
                // tooltip.style("visibility", "visible")
                //     .html(`Year: ${xz[rect.data().indexOf(d) % numPoints]}<br>Forcing: ${(d[1] - d[0]).toFixed(2)}`)
                //     .style("top", (event.pageY - 10) + "px")
                //     .style("left",(event.pageX + 10) + "px");
            })
            .on("mousemove", function(event, d) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left",(event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                // Restore opacity for all rects
                svg.selectAll("rect").style("opacity", 1);

                // Hide hover label
                tooltip.style("visibility", "hidden");

                // Remove histogram
                d3.select(self.DOMElement).selectAll("svg.pdf-svg").style("visibility", "hidden");
            });

        // svg.append("title")
        //     .text("Double click to transition"); // hover label

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .call(xAxis); // ensure x-axis only shows correct labels

        // Axis titles
        svg.append("text")
            .attr("class", "x label")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "16px")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - margin.bottom / 3)
            .text("year");

        svg.append("text")
            .attr("class", "y label")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "16px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)") // Rotate the text
            .attr("x", -height / 2) // Position the text vertically centered
            .attr("y", margin.left / 2) // Adjust this value as needed for vertical positioning
            .text(this.metric);

        // Figure title
        const metric = this.metric.replace("_", " ");
        const title = metric.charAt(0).toUpperCase() + this.metric.slice(1) + " Over Time";
        svg.append("text")
            .attr("class", "title")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "24px")
            // .style("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", margin.top / 2) // Adjust this value to position the title vertically
            .text(title);
        
        
        // Add y axis to chart
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);
        
        // Style y axis (doesn't do anything at the moment)
        d3.selectAll(".y.axis path, .y.axis line")
            .style("stroke", "#000");

        d3.selectAll(".y.axis text")
            .style("font-size", "10px");

        

        function transitionGrouped() {
            y.domain([0, yMax]);

            rect.transition()
                .duration(500)
                .delay((d, i) => i * 20)
                .attr("x", (d, i) => x(xz[i]) + x.bandwidth() / n * d[2])
                .attr("width", x.bandwidth() / n)
            .transition()
                .attr("y", d => y(d[1] - d[0]))
                .attr("height", d => y(0) - y(d[1] - d[0]));
        }

        function transitionStacked() {
            y.domain([0, y1Max]);

            rect.transition()
                .duration(500)
                .delay((d, i) => i * 20)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
            .transition()
                .attr("x", (d, i) => x(xz[i]))
                .attr("width", x.bandwidth());
        }

        // Initial call to start in one of the states
        var currentState = "stacked";
        transitionStacked();

        // Optional: Implement a way to trigger transitions, e.g., via button clicks
        svg.on("dblclick", function(event) {
            // Determine the current state and toggle
            if (currentState === "grouped") {
                transitionStacked();
                currentState = "stacked"; // Update the current state
            } else {
                transitionGrouped();
                currentState = "grouped"; // Update the current state
            }
        });

        // console.log(Date.now() - start);
    }

    private kernelDensityEstimation(data) {
        // Create a pdf from a discrete dataset

        function calculateVariance(data) {
            const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
            const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
            return variance;
        }

        function gaussianKernel(x) {
            return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
        }

        // Generate x values for density estimation (e.g., from min to max of your data)
        const xMin = Math.min(...data);
        const xMax = Math.max(...data);
        const xValues = Array.from({ length: 1000 }, (_, i) => xMin + (xMax - xMin) * i / 999);

        // Choose a reasonable bandwidth (this may require experimentation)
        const bandwidth = 1.06 * Math.sqrt(calculateVariance(data)) * Math.pow(data.length, -1/5); // Silverman's rule of thumb

        const density = xValues.map(x => {
          const kernelSum = data.reduce((sum, xi) => {
            const xMinusXi = (x - xi) / bandwidth;
            return sum + gaussianKernel(xMinusXi);
          }, 0);
          return { val: x, density: kernelSum / (data.length * bandwidth) };
        });
        return density;
    }

    private createHoverFigure(data, specie) {
        // data = this.kernelDensityEstimation(data);

        // Dummy data
        data = Array.from({length: 700}, (v,i) => {return {val: (i-500)/170, density: 1 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * ((i - 500) / 170) ** 2)};});
        // console.log(data);

        // Dimensions
        const width = 200, height = 300; // make this dynamic
        const margin = {
            top: 20,
            bottom: 20,
            left: 30,
            right: 30
        }

        // Scales for the line graph
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.density)])
            .range([margin.left, width - margin.right]);
        
        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.val), d3.max(data, d => d.val)])
            .range([margin.top, height - margin.bottom]); // graph grows from top to bottom

        // Line generator
        const line = d3.line()
            .x(d => x(d.density))
            .y(d => y(d.val)); // d.x because we want plot to be sideways
        
        // Create an SVG element for the line graph
        const pdfSvg = d3.select(this.DOMElement).append("svg")
          .attr("class", "pdf-svg")
          .attr("width", width)
          .attr("height", height)
          .style("position", "absolute")
          .style("visibility", "hidden"); // Initially hidden; show it on hover

        // Add axes
        // pdfSvg.append("g")
        //     .attr("transform", `translate(0,${margin.top})`)
        //     .call(d3.axisTop(x).ticks(width / 40).tickSizeOuter(0));
        pdfSvg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Append a path for the line
        pdfSvg.append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", line(data));

        // Fill in area under curve
        const area = d3.area()
            .x(d => x(d.density))
            .y0(height - margin.bottom) // Base line - bottom of the graph
            .y1(d => y(d.val)); // Top line - your data line
        
        const defs = pdfSvg.append("defs");

        const densityGradientID = "densityGradient" + specie;
        const gradient = defs.append("linearGradient")
            .attr("id", densityGradientID)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(d3.min(data, d => d.val)))
            .attr("x2", 0).attr("y2", y(d3.max(data, d => d.val)));

        // Define the color scale (interpolate colors to fill area below graph)
        console.log(specie);
        console.log(BarChart.colorMap[specie]);
        const colorScale = d3.scaleSequential(t => d3.interpolateLab(d3.interpolateLab(BarChart.colorMap[specie], "white")(0.9), d3.interpolateLab(BarChart.colorMap[specie], "black")(0.3))(t))
            .domain([d3.max(data, d => d.density), 0]); // swapped so that high density means closer to white

        data.forEach((point, i, arr) => {
            const yPercentage = (y(point.val) - margin.bottom) / (height - margin.bottom - margin.top) * 100;
            gradient.append("stop")
                .attr("offset", `${yPercentage}%`)
                .attr("stop-color", colorScale(point.density));
        });

        pdfSvg.append("path")
            .datum(data) // Use datum since it's a single object
            .attr("fill", `url(#${densityGradientID})`)
            .attr("d", area);

        return pdfSvg;
    }
}
