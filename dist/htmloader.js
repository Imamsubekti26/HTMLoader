var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class HtmLoader {
    /** set _target and _data with starter value */
    constructor() {
        /**
         * replace any element that have 'data-hl-load' attribute with component from other file
         * @param {string} componentLocation  directory address that save the various components
         */
        this.useComponentIn = function (componentLocation) {
            return __awaiter(this, void 0, void 0, function* () {
                const elements = document.querySelectorAll("[data-hl-load]");
                for (let i = 0; i < elements.length; i++) {
                    const fileName = elements[i].getAttribute("data-hl-load");
                    const data = JSON.parse(elements[i].getAttribute("data-hl-use"));
                    const isOverride = elements[i].getAttribute("data-hl-override") === "false" ? false : true;
                    this._target = elements[i];
                    yield this.withData(data).render(`${componentLocation}/${fileName}.html`, isOverride);
                    elements[i].removeAttribute("data-hl-use");
                    elements[i].removeAttribute("data-hl-override");
                }
            });
        };
        /**
         * Select element in the DOM
         * @param   {string}  DomTarget element selector
         * @returns {this}              return htmloader itself
         */
        this.target = function (DomTarget) {
            const newThis = new HtmLoader();
            newThis._target = document.querySelector(DomTarget);
            return newThis;
        };
        /**
         * saves the data you want to inject into the template
         * @param   {array | object}  data  data you want to inject into the template
         * @returns {this}                  return htmloader itself
         */
        this.withData = function (data) {
            if (data === null || data === undefined)
                return this;
            if (Array.isArray(data)) {
                this._data = data;
                return this;
            }
            this._data.push(data);
            return this;
        };
        /**
         * render HTML component from other file to the DOM within or without data
         * @param   {string}              componentUri  location of file that need to be rendered
         * @param   {boolean}             isOverride    the DOM target will be replaced if true or appended if false, default false
         * @returns {Promise<void | 0>}
         */
        this.render = function (componentUri, isOverride) {
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
                yield this.doRender(component, isOverride);
            });
        };
        /**
         * inject data to string that have pattern "::variableName"
         * @param   {Promise<string>}   text  text that you want to insert data into it
         * @param   {object}            data  data that you want to insert to text
         * @returns {Promise<string>}         text that has been inserted with data
         */
        this.injectDataToString = function (text, data) {
            return __awaiter(this, void 0, void 0, function* () {
                let processedText = yield text;
                Object.keys(data).forEach((key) => {
                    processedText = processedText.replace(`::${key}`, data[key]);
                });
                return processedText;
            });
        };
        /**
         * convert text to HTML Node
         * @param   {Promise<string>} text  text that needs to be converted
         * @returns {Promise<Node>}         HTML node that ready to use
         */
        this.convertStringtoNode = function (text) {
            return __awaiter(this, void 0, void 0, function* () {
                const wrapper = document.createElement("div");
                const textResult = yield text;
                wrapper.innerHTML = textResult.trim();
                return wrapper.firstChild;
            });
        };
        /**
         * used by 'render' function
         * @param   {string}                component   component that want to render
         * @param   {boolean}               isOverride  the DOM target will be replaced if true or appended if false, default false
         * @returns {Promise<void | 0>}
         */
        this.doRender = function (component, isOverride) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < this._data.length; i++) {
                    let componentWithData = yield this.injectDataToString(component, this._data[i]);
                    if (isOverride) {
                        yield this._target.parentNode.replaceChild(yield this.convertStringtoNode(componentWithData), this._target);
                        this.resetClass();
                        return 0;
                    }
                    yield this._target.append(yield this.convertStringtoNode(componentWithData));
                    if (i >= this._data.length)
                        this.resetClass();
                }
            });
        };
        /**
         * reset _data and _target to started value
         */
        this.resetClass = function () {
            (this._data = []), (this._target = null);
        };
        this._target = null;
        this._data = [];
    }
}
