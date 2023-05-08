var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const htmloader = {
    /** temporary save the element selected by 'target' function */
    _target: null,
    /** temporary save the datas inputed by 'withData' function or any other function */
    _data: [],
    /**
     * replace any element that have 'data-hl-load' attribute with component from other file
     * @param {string} componentLocation  directory address that save the various components
     */
    useComponentIn: function (componentLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const elements = document.querySelectorAll("[data-hl-load]");
            for (let i = 0; i < elements.length; i++) {
                const fileName = elements[i].getAttribute("data-hl-load");
                const data = JSON.parse(elements[i].getAttribute("data-hl-use"));
                const isOverride = elements[i].getAttribute("data-hl-override") === "false" ? false : true;
                this._target = elements[i];
                this.withData(data).render(`${componentLocation}/${fileName}.html`, isOverride);
                console.log(`target terkunci: `);
                console.log(this._target);
                console.log(`data didapatkan: `);
                console.log(this._data);
                // this._target = null;
                this._data = [];
            }
        });
    },
    /**
     * Select element in the DOM
     * @param   {string}  DomTarget element selector
     * @returns {this}              return htmloader itself
     */
    target: function (DomTarget) {
        this._target = document.querySelector(DomTarget);
        return this;
    },
    /**
     * saves the data you want to inject into the template
     * @param   {array | object}  data  data you want to inject into the template
     * @returns {this}                  return htmloader itself
     */
    withData: function (data) {
        if (data === null || data === undefined)
            return this;
        if (Array.isArray(data)) {
            this._data = data;
            return this;
        }
        this._data.push(data);
        return this;
    },
    /**
     * render HTML component from other file to the DOM within or without data
     * @param   {string}              componentUri  location of file that need to be rendered
     * @param   {boolean}             isOverride    the DOM target will be replaced if true or appended if false, default false
     * @returns {Promise<void | 0>}
     */
    render: function (componentUri, isOverride) {
        return __awaiter(this, void 0, void 0, function* () {
            // get component
            const getComponent = yield fetch(componentUri);
            let component = yield getComponent.text();
            // push _data with dummy data to make the component renderable
            if (this._data.length === 0) {
                this._data.push({
                    dummy: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quam, recusandae.",
                });
            }
            // render it
            for (let i = 0; i < this._data.length; i++) {
                let componentWithData = yield this.injectDataToString(component, this._data[i]);
                if (isOverride) {
                    this._target.parentNode.replaceChild(yield this.convertStringtoNode(componentWithData), this._target);
                    return 0;
                }
                this._target.append(yield this.convertStringtoNode(componentWithData));
                // console.warn(`data sudah dibersihkan`);
            }
        });
    },
    /**
     * inject data to string that have pattern "::variableName"
     * @param   {Promise<string>}   text  text that you want to insert data into it
     * @param   {object}            data  data that you want to insert to text
     * @returns {Promise<string>}         text that has been inserted with data
     */
    injectDataToString: function (text, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let processedText = yield text;
            Object.keys(data).forEach((key) => {
                processedText = processedText.replace(`::${key}`, data[key]);
            });
            return processedText;
        });
    },
    /**
     * convert text to HTML Node
     * @param   {Promise<string>} text  text that needs to be converted
     * @returns {Promise<Node>}         HTML node that ready to use
     */
    convertStringtoNode: function (text) {
        return __awaiter(this, void 0, void 0, function* () {
            const wrapper = document.createElement("div");
            const textResult = yield text;
            wrapper.innerHTML = textResult.trim();
            return wrapper.firstChild;
        });
    },
};
