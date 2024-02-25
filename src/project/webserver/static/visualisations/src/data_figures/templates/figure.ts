export abstract class Figure {
    protected DOMElement: HTMLElement;
    
    constructor(DOMElement: HTMLElement) {
        this.DOMElement = DOMElement;

        if (!DOMElement) {
            console.error(`${DOMElement} not found`)
        }
    }

    abstract prepareData(data: any): void;
    abstract create(): void;
}

export enum Species {
    CO2 = 0,
    CH4 = 1,
    N2O = 2
}
