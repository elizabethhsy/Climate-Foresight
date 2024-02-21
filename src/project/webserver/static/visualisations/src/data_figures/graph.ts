export abstract class Graph {
    protected DOMElement: HTMLElement;
    
    constructor(DOMElement: HTMLElement) {
        this.DOMElement = DOMElement;
    }

    abstract prepareData(data: any): void;
    abstract create(): void;
}
