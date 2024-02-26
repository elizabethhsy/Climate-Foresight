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

    add_value(name: string, label: string, type: string, params?: Array<string>): void {
        const this_ = this;
        const id = "config-" + this.number + "-" + this.count;
        this.count++;

        this.ids[name] = id;

        switch (type) {
            case "checkbox": {
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
            } case "radiobutton": {
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
                    inputEl.type = "radio"; inputEl.id = "radio-" + name + "-option-" + i;
                    inputEl.classList.add("mdl-radio__button"); inputEl.name = "radio-" + name;
                    inputEl.value = i.toString();
                    containers[containers.length - 1].appendChild(inputEl);

                    let labelEl = document.createElement("span");
                    labelEl.classList.add("mdl-radio__label");
                    labelEl.innerHTML = params[i];
                    containers[containers.length - 1].appendChild(labelEl);

                    this.rootdiv.appendChild(containers[containers.length - 1]);

                    inputEl.onclick = function() {
                        this_.values[name] = document.querySelector('input[name="radio-' + name + '"]:checked').value;
                    }
                }
                break;
            } case "slider": {
                if (typeof(params) == 'undefined')
                    throw new Error("Must pass list of options when type == 'slider', with format [<min>, <max>, [range]]");

                this.values[name] = params[0];

                const containerEl = document.createElement("div");
                containerEl.classList.add("config-item-container", "config-slider-container");

                const labelEl = document.createElement("span");
                labelEl.innerHTML = label;
                labelEl.classList.add("slider-label");
                containerEl.appendChild(labelEl);

                const innerContainerEl = document.createElement("div");
                innerContainerEl.classList.add("slider-inner-container");

                const leftLabel = document.createElement("span");
                leftLabel.innerHTML = params[0].toString();
                leftLabel.classList.add("slider-end-label");

                const rightLabel = document.createElement("span");
                rightLabel.innerHTML = params[1].toString();
                rightLabel.classList.add("slider-end-label")

                const inputEl = document.createElement("input");
                inputEl.classList.add("mdl-slider", "mdl-js-slider"); inputEl.tabIndex = 0;
                inputEl.type = "range"; inputEl.min = params[0]; inputEl.max = params[1]; inputEl.value = params[0];
                if (params.length == 3)
                    inputEl.step = params[2];

                innerContainerEl.appendChild(leftLabel);
                innerContainerEl.appendChild(inputEl);
                innerContainerEl.appendChild(rightLabel);
                containerEl.appendChild(innerContainerEl);

                this.rootdiv.appendChild(containerEl);

                inputEl.oninput = function() {
                    this_.values[name] = inputEl.value;
                }

                break;
            } default:
                throw new Error("Type <" + type + "> not recognised.");
        }
    }

    instantiate(parent: HTMLElement): void {
        parent.appendChild(this.rootdiv);
        componentHandler.upgradeDom();
    }
}
