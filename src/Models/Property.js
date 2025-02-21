import { BaseElement } from "./BaseElement.js";

export class Property extends BaseElement {
  constructor(parent, title, type, x, options = {}, parameterName = "") {
    super(parent, title);
    this.type = type; // "checkbox", "radio", "number", "text"

    const {value, /*options*/} = this.getValues(type, x);
    this.value = value
    this.options = options;
    this.parameterName = parameterName
  }

  getValues(type,x){
    let value = undefined
    // let options = undefined

    if(type === "checkbox" || type === "radio" || type === "radio-optional"){
      value = (typeof x === "boolean") ? x : false
    } else if(type === "number"){
      value = (typeof x === "number") ? x : 0
    } else if(type === "action"){
      value = (typeof x === "function") ? x : () => {}
    }


    return {value, /*options*/}
  }

  get showText() {
    let valueShow = this.value;
    let reverse = false
    let hide = false

    if(this.type === "action"){
      hide = true
    }else if(typeof valueShow === "boolean"){
      if(this.type === "checkbox"){
        valueShow = valueShow ? "▣" : "□"
      }else if(this.type === "radio" || this.type === "radio-optional"){
        valueShow = valueShow ? "◉" : "◯"
      }
      reverse = true
    }else if(valueShow === undefined){
      valueShow = "?"
    }


    if(hide)return this.title
    if(reverse) return `${valueShow} ${this.title}`;
    return `${this.title}: ${valueShow}`;
  }

  move(direction){
    if(this.type === "number"){
      this.value += direction
      if(this.options.min !== undefined){
        this.value = Math.max(this.value, this.options.min)
      }
      if(this.options.max !== undefined){
        this.value = Math.min(this.value, this.options.max)
      }
    }
  }

  onSelect() {
    if (this.type === "checkbox" ) {
      this.value = !this.value;
    }else if(this.type === "radio"){
      this.value = true;
      this.parent.children.forEach(child => {
        if(child !== this && child instanceof Property && child.type === "radio"){
          child.value = false
        }
      })
    }else if(this.type === "radio-optional"){
      this.value = !this.value;
      this.parent.children.forEach(child => {
        if(child !== this && child instanceof Property && child.type === "radio-optional"){
          child.value = false
        }
      })
    }else if(this.type === "action"){
      this.parent.action(this.value)
    }
  }

  getData(){
    if(this.parameterName){
      return {key:this.parameterName, value:this.value}
    }
  }
}