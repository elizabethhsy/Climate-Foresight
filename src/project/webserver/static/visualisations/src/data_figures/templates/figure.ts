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

    abstract prepareData(data: any): void;
    abstract update(): void;
    abstract render(): void;
}

enum Species {
    CO2 = 0,
    CH4 = 1,
    N2O = 2
}
