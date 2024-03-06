abstract class Figure {
    protected DOMElement: HTMLElement;
    
    constructor(DOMElement: HTMLElement, config) {
        this.DOMElement = DOMElement;
        this.config = config;
        this.config.subscribe(this.update.bind(this));

        if (!DOMElement) {
            console.error(`${DOMElement} not found`)
        }
    }

    protected getUnit(metric: string) {
        switch(metric) {
            case "forcing":
                return "W/m2";
            case "concentration":
                return "ppm";
            case "emissions":
                return "million tonnes";
            case "airborne_emissions":
                return "million tonnes";
            default:
              return "K"
        }
    }

    // Function to call on load but before rendering
    abstract init(): void;
    
    // Function to create figure on web page
    abstract render(): void;

    // Function to update/replace figure on web page
    abstract update(render?: boolean): void;
}
