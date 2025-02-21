import chalk from "chalk";
import readline from "readline";

import { Menu } from "../Models/Menu.js";
import { Property } from "../Models/Property.js";

export class Renderer {
  static clearScreen() {
    console.clear();
  }

  static render(element) {
    
    this.clearScreen();

    if(element instanceof Menu){
      this.renderMenu(element);
    }else if(element instanceof Property){
      this.renderProperty(element);
    }
    
  }



  static renderMenu(menu){
    console.log(chalk.bold(`\n  ${menu.title.toUpperCase()}\n`));

    if(menu.children.length === 0){
      console.log("  No options available\n");
      console.log("       ¯\(°_O)/¯")
    }else{
      menu.children.forEach((option, index) => {
        const isSelected = index === menu.selectedIndex;
        const pre = isSelected ? ">" : " ";
  
        if(isSelected){
          console.log(chalk.cyan(`${pre} ${option.showText}`))
        }else{
          console.log(`${pre} ${option.showText}`)
        }
  
      });
    }

    // console.log("\n  Settings:");
    // menu.properties.forEach(prop => {
    //   console.log(`  ${prop.name}: ${chalk.green(prop.value)}`);
    // });

    // console.log("\n  [Up/Down] Navigate  |  [Enter] Select  |  [Esc] Back");
    console.log("\n\n\n")
  }


  static renderProperty(property){

  }
}