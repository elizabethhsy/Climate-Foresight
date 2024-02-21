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
