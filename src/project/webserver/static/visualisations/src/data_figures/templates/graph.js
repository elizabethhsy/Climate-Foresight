export class Figure {
    constructor(DOMElement) {
        this.DOMElement = DOMElement;
        if (!DOMElement) {
            console.error(`${DOMElement} not found`);
        }
    }
}
