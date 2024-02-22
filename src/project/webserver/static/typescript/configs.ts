class Config extends Object {
    rootdiv: HTMLElement;

    values: Object = {};
    ids: Object = {};

    number: number;
    count: number = 0;

    constructor(number: number) {
        super()
        this.rootdiv = document.createElement("div");
        this.rootdiv.classList.add("config-container");
        this.number = number;
    }

    add_value(name: string, label: string, type: string): void {
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

                var this_ = this;
                checkboxEl.onclick = function() {
                    this_.values[name] = checkboxEl.checked;
                }

                break;
            default:
                return;
        }
    }

    instantiate(parent: HTMLElement): void {
        parent.appendChild(this.rootdiv);
    }
}
