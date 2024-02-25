abstract class Figure {
    protected DOMElement: HTMLElement;
    
    constructor(DOMElement: HTMLElement, config) {
        this.DOMElement = DOMElement;
        this.config = config;

        if (!DOMElement) {
            console.error(`${DOMElement} not found`)
        }
    }

    abstract prepareData(data: any): void;
    abstract create(): void;
}

enum Species {
    CO2 = 0,
    CH4 = 1,
    N2O = 2
}
