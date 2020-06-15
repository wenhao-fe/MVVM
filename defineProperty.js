class MVVM extends EventTarget {
  constructor(options) {
    super();
    this.$options = options;
    this.compile();
    this.observe(this.$options.data);
    // console.log(options);
    // console.log(this);
  }
  observe(data) {
    let obj = Object.keys(data);
    // console.log("observe", obj);
    obj.forEach(key => {
      this.defineReact(data, key, data[key]);
    });
  }
  defineReact(data, key, vals) {
    // console.log("dfReact", data, key, vals);
    let self = this;
    Object.defineProperty(data, key, {
      get() {
        console.log("get.........");
        return vals;
      },
      set(_new) {
        console.log("set.........", _new);
        let event = new CustomEvent(key, {
          detail: _new
        });
        self.dispatchEvent(event);
        vals = _new;
        // console.log(event);
        // console.log(self);
      }
    });
  }
  compile() {
    let el = document.querySelector(this.$options.el);
    this.childNodes(el);
  }
  childNodes(el) {
    let childNodes = el.childNodes;
    // console.log(childNodes);
    childNodes.forEach(element => {
      // console.log("nodeType", element);
      if (element.nodeType === 3) {
        // console.log(element.textContent);
        let reg = /\{\{\s*(\S+)\s*\}\}/g;
        let textContent = element.textContent;
        if (reg.test(textContent)) {
          //存在{{}}
          let $1 = RegExp.$1;
          // console.log($1);
          element.textContent = element.textContent.replace(
            reg,
            this.$options.data[$1]
          );
          this.addEventListener($1, e => {
            // console.log($1, e);
            let old = this.$options.data[$1];
            let reg = new RegExp(old);
            element.textContent = element.textContent.replace(reg, e.detail);
            // console.log(reg);
          });
        }
      } else if (element.nodeType === 1) {
        // console.log(element.attributes);
        [...element.attributes].forEach(attr => {
          // console.log("!!!!", attr);
          let attrName = attr.name;
          let attrVal = attr.value;
          if (attrName.indexOf("v-") === 0) {
            attrName = attrName.substr(2);
            // console.log(attrName);
            if (attrName === "html") {
              element.innerHTML = this.$options.data[attrVal];
            } else if (attrName === "model") {
              element.value = this.$options.data[attrVal];
              element.addEventListener("input", e => {
                // console.log(e.target.value);
                this.$options.data[attrVal] = e.target.value;
              });
            }
          }
        });
        if (element.childNodes.length > 0) {
          this.childNodes(element);
        }
      }
    });
  }
}
