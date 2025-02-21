export class BaseElement {
  constructor(parent, title = "") {
    this.title = title;
    this.parent = parent

    if(parent){
      this.parent.addOption(this)
    }
  }

  get showText(){
    return this.title
  }

  onSelect(){
    return this
  }

}