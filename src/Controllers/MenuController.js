import readline from "readline";
import { Renderer } from "../Views/Renderer.js";

export class MenuController {
  constructor(menu) {
    this.currentMenu = menu;
    menu.controller = this
    this.toRender = true
  }

  start() {
    Renderer.render(this.currentMenu);
    this.listenForInput();
  }

  listenForInput() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    
    process.stdin.on("keypress", (str, key) => {
      if (key.name === "up") {
        this.navigate(-1);
      } else if (key.name === "down") {
        this.navigate(1);
      }else if (key.name === "right") {
        this.move(1);
      }else if (key.name === "left") {
        this.move(-1);
      }else if (key.name === "return" || key.name === "space") {
        this.selectOption();
      } else if (key.name === "backspace") {
        this.goBack();
      } else if (key.sequence === '\u0003') { // Detect Ctrl + C
        console.log("\nExiting..."); 
        process.stdin.setRawMode(false); // Restore terminal mode
        process.exit(0);
      }
    });
  }

  move(direction) {
    this.currentMenu.move(direction)
    Renderer.render(this.currentMenu);
  }

  navigate(direction) {
    this.currentMenu.navigate(direction)


    Renderer.render(this.currentMenu);
  }

  selectOption() {
    const newMenu = this.currentMenu.select();
    if(newMenu){
      this.currentMenu = newMenu;
    }

    if(this.toRender){
      Renderer.render(this.currentMenu);
    }
  }

  goBack() {
    if(this.currentMenu.parent !== null){
      this.currentMenu = this.currentMenu.parent
    }
    Renderer.render(this.currentMenu);
  }

  async action(x){
    this.toRender = false
    const data = this.getData()
    await x(data)
    // this.toRender = true
    // Renderer.render(this.currentMenu);
  }

  getData(){
    const raw = this.currentMenu.getData()
    const flat = raw.flat(Infinity).filter(x=>x && x.key)

    const object = flat.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return object
  }
}
