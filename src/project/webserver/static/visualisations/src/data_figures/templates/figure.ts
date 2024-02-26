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

    // Function to call on load but before rendering
    abstract init(): void;
    
    // Function to create figure on web page
    abstract render(): void;

    // Function to update/replace figure on web page
    abstract update(render?: boolean): void;
}
