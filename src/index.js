import { Menu } from "./Models/Menu.js";
import { Property } from "./Models/Property.js";
import { MenuController } from "./Controllers/MenuController.js";
import { convertImages } from "./actions/imageModifier.js";

// Create Main Menu
const mainMenu = new Menu(null,"Main Menu");

// Create Submenus
const resolutionMenu = new Menu(mainMenu,"Resolution Settings");
const formatMenu = new Menu(mainMenu, "File Format");
const processingMenu = new Menu(mainMenu, "Processing Options");
new Property(mainMenu, "Transform Images", "action", convertImages)
// new Property(mainMenu, "Save Settings", "checkbox", false)

// Add Settings to Submenus
const maxSizeMenu = new Menu(resolutionMenu,"Max Size", true, "maxSize")
const imgSizes = ["4096", "3840", "2560", "1920", "1280", "1024", "800", "640", "512", "256", "128", "64", "32", "16"]
imgSizes.forEach(size => {
  new Property(maxSizeMenu,size, "radio-optional")
})
// new Property(resolutionMenu,"Max Width", "number")
// new Property(resolutionMenu,"Max Height", "number")

const inputFormatMenu = new Menu(formatMenu,"Input Formats", true, "inputFormat")
const outputFormatMenu = new Menu(formatMenu,"Output Format", true, "outputFormat")

const formats = ["JPEG", "JPG", "PNG", "WEBP", "GIF", "TIFF", "BMP", "ICO", "PDF", "PSD", "SVG", "HEIF", "AVIF", "RAW"]
formats.forEach(format => {
  new Property(inputFormatMenu,format, "checkbox", true)
  new Property(outputFormatMenu,format, "radio", format === "WEBP")
})
new Property(formatMenu,"Quality", "number", 100,{min: 0, max: 100}, "quality")


new Property(processingMenu,"Output non image files", "checkbox", false, {}, "copyNonImageFiles")

// Start the Menu Controller
const menuController = new MenuController(mainMenu);
menuController.start();
