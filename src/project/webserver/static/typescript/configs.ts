class Config extends Object {
    rootdiv: HTMLElement;

    values: Object = {};
    ids: Object = {};

    number: number;
    count: number = 0;

    private listeners = [];

    constructor(number: number) {
        super()
        this.rootdiv = document.createElement("div");
        this.rootdiv.classList.add("config-container");
        this.number = number;
    }

    add_value(name: string, label: string, type: string, params?: Array<string>, defaultValue?: string): void {
        const this_ = this;
        const id = "config-" + this.number + "-" + this.count;
        this.count++;

        this.ids[name] = id;

        switch (type) {
            case "checkbox":
                this.values[name] = false;

                const containerEl = document.createElement("label");
                containerEl.classList.add("config-item-container", "mdl-checkbox", "mdl-js-checkbox", "mdl-js-ripple-effect");
                containerEl.htmlFor = id;

                const checkboxEl = document.createElement("input");
                checkboxEl.type = "checkbox";
                checkboxEl.id = id;
                checkboxEl.classList.add("mdl-checkbox__input");
                containerEl.appendChild(checkboxEl);

                const labelEl = document.createElement("span");
                labelEl.classList.add("mdl-checkbox__label");
                labelEl.innerHTML = label;
                containerEl.appendChild(labelEl);

                this.rootdiv.appendChild(containerEl);

                checkboxEl.onclick = function() {
                    this_.values[name] = checkboxEl.checked;
                }

                break;
            case "radiobutton":
                if (typeof(params) == 'undefined')
                    throw new Error("Must pass list of options when type == 'radiobutton'");

                this.values[name] = "none";

                let containers: Array<HTMLLabelElement> = [];
                for (let i = 0; i < params.length; i++) {
                    containers.push(
                        document.createElement("label")
                    );
                    containers[containers.length - 1].classList.add("config-item-container", "mdl-radio", "mdl-js-radio", "mdl-js-ripple-effect");
                    containers[containers.length - 1].htmlFor = "radio-" + name + "-option-" + i;

                    let inputEl = document.createElement("input");
                    inputEl.type = "radio";
                    inputEl.id = "radio-" + name + "-option-" + i;
                    inputEl.classList.add("mdl-radio__button");
                    inputEl.name = "radio-" + name;
                    inputEl.value = i.toString();
                    
                    if (params[i] === defaultValue) {
                        inputEl.checked = true;
                        this.values[name] = defaultValue;
                    }

                    containers[containers.length - 1].appendChild(inputEl);

                    let labelEl = document.createElement("span");
                    labelEl.classList.add("mdl-radio__label");
                    labelEl.innerHTML = params[i];
                    containers[containers.length - 1].appendChild(labelEl);

                    this.rootdiv.appendChild(containers[containers.length - 1]);

                    inputEl.onclick = function() {
                        const radioButton = document.querySelector('input[name="radio-' + name + '"]:checked'); // find the checked radio button
                        this_.values[name] = radioButton?.parentElement?.childNodes[1].innerHTML; // return label for that button
                        this_.notify();
                    }
                }
                break;
            default:
                throw new Error("Type <" + type + "> not recognised.");
        }
    }

    instantiate(parent: HTMLElement): void {
        parent.appendChild(this.rootdiv);
    }

    // Allow other classes to subscribe to config changes
    subscribe(listener: () => void) {
        this.listeners.push(listener);
    }

    // Notify all subscribers of a change
    notify() {
        this.listeners.forEach(listener => listener());
    }
    
}
