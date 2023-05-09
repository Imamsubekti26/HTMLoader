interface HL_Skeleton {
  useComponentIn: (componentLocation: string) => Promise<void>;
  target: (DomTarget: string) => object;
  withData: (data: Array<object> | object) => object;
  render: (componentUri: string, isOverride?: boolean) => Promise<void>;
  _target: null | Node;
  _data: Array<object>;
}

class HtmLoader implements HL_Skeleton {
  /** temporary save the element selected by 'target' function */
  _target: null | Node;

  /** temporary save the datas inputed by 'withData' function or any other function */
  _data: Array<object>;

  /** set _target and _data with starter value */
  constructor() {
    this._target = null;
    this._data = [];
  }

  /**
   * replace any element that have 'data-hl-load' attribute with component from other file
   * @param {string} componentLocation  directory address that save the various components
   */
  useComponentIn = async function (componentLocation: string): Promise<void> {
    const elements: NodeListOf<Element> =
      document.querySelectorAll("[data-hl-load]");

    for (let i = 0; i < elements.length; i++) {
      const fileName: string = elements[i].getAttribute("data-hl-load");
      const data: object = JSON.parse(elements[i].getAttribute("data-hl-use"));
      const isOverride: boolean =
        elements[i].getAttribute("data-hl-override") === "false" ? false : true;

      this._target = elements[i];

      await this.withData(data).render(
        `${componentLocation}/${fileName}.html`,
        isOverride
      );

      elements[i].removeAttribute("data-hl-use");
      elements[i].removeAttribute("data-hl-override");
    }
  };

  /**
   * Select element in the DOM
   * @param   {string}  DomTarget element selector
   * @returns {this}              return htmloader itself
   */
  target = function (DomTarget: string): object {
    const newThis: HtmLoader = new HtmLoader();
    newThis._target = document.querySelector(DomTarget);
    return newThis;
  };

  /**
   * saves the data you want to inject into the template
   * @param   {array | object}  data  data you want to inject into the template
   * @returns {this}                  return htmloader itself
   */
  withData = function (data: Array<object> | object): object {
    if (data === null || data === undefined) return this;
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
  render = async function (
    componentUri: string,
    isOverride?: boolean
  ): Promise<void> {
    // get component
    const getComponent: Response = await fetch(componentUri);
    let component: string = await getComponent.text();

    // push _data with dummy data to make the component renderable
    if (this._data.length === 0) {
      this._data.push({
        dummy:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quam, recusandae.",
      });
    }

    // render it
    await this.doRender(component, isOverride);
  };

  /**
   * inject data to string that have pattern "::variableName"
   * @param   {Promise<string>}   text  text that you want to insert data into it
   * @param   {object}            data  data that you want to insert to text
   * @returns {Promise<string>}         text that has been inserted with data
   */
  private injectDataToString = async function (
    text: Promise<string>,
    data: object
  ): Promise<string> {
    let processedText: string = await text;
    Object.keys(data).forEach((key: string) => {
      processedText = processedText.replace(`::${key}`, data[key]);
    });
    return processedText;
  };

  /**
   * convert text to HTML Node
   * @param   {Promise<string>} text  text that needs to be converted
   * @returns {Promise<Node>}         HTML node that ready to use
   */
  private convertStringtoNode = async function (
    text: Promise<string>
  ): Promise<Node> {
    const wrapper = document.createElement("div");
    const textResult = await text;
    wrapper.innerHTML = textResult.trim();
    return wrapper.firstChild;
  };

  /**
   * used by 'render' function
   * @param   {string}                component   component that want to render
   * @param   {boolean}               isOverride  the DOM target will be replaced if true or appended if false, default false
   * @returns {Promise<void | 0>}
   */
  private doRender = async function (
    component: string,
    isOverride: boolean
  ): Promise<void | 0> {
    for (let i = 0; i < this._data.length; i++) {
      let componentWithData: string = await this.injectDataToString(
        component,
        this._data[i]
      );
      if (isOverride) {
        await this._target.parentNode.replaceChild(
          await this.convertStringtoNode(componentWithData),
          this._target
        );
        this.resetClass();
        return 0;
      }
      await this._target.append(
        await this.convertStringtoNode(componentWithData)
      );
      if (i >= this._data.length) this.resetClass();
    }
  };

  /**
   * reset _data and _target to started value
   */
  private resetClass = function (): void {
    (this._data = []), (this._target = null);
  };
}
