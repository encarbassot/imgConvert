import { BaseElement } from "./BaseElement.js";
import { Property } from "./Property.js";

export class Menu extends BaseElement{
  constructor(parent, title, valueSelector = false, parameterName = "") {
    super(parent, title)
    this.description = ""
    this.children = [];    // List of submenus
    this.selectedIndex = 0; // Index of highlighted option

    this.valueSelector = valueSelector
    this.parameterName = parameterName
  }

  addOption(menu) {
    this.children.push(menu);
  }

  get showText() {
    if (this.valueSelector && this.children.every(child => child instanceof Property && ["radio","radio-optional"].includes(child.type))) {
      return `${this.title}: ${this.children.find(x=>x.value)?.title || ""}`
    }

    return super.showText
  }


  move(direction) {
    this.children[this.selectedIndex].move(direction)
  }

  select() {
    return this.children[this.selectedIndex].onSelect()
  }

  navigate(direction){
    const newIndex = this.selectedIndex + direction;
    if (newIndex >= 0 && newIndex < this.children.length) {
      this.selectedIndex = newIndex;
    }
  }


  action(x){
    if(this.parent===null){
      this.controller.action(x)
    }else{
      this.parent.action(x)
    }
  }

  getData(){
    if(this.valueSelector){
      if(this.children.every(child => child instanceof Property && ["radio","radio-optional"].includes(child.type))) {
        return {
          key:this.parameterName, 
          value:this.children.find(x=>x.value)?.title || undefined
        }
      }else if(this.children.every(child => child instanceof Property && ["checkbox"].includes(child.type))) {
        return {
          key:this.parameterName, 
          value:this.children.filter(x=>x.value).map(x=>x.title)
        }
  
      }
    }else{
      return this.children.map(child => child.getData())
    }
  }


}
