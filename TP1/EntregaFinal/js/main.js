"use strict";
/** @type { HTMLcanvasElement} */
const canvas = document.getElementById("canvas");

/** Contexto */
const ctx = canvas.getContext("2d");

/** Tamaño maximo de canvas */
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

/** Proporcion de la imagen */
let PROP = 1;

/** Tamaño temporal del canvas ajustado a la imagen */
let TEMP_WIDTH = WIDTH;
let TEMP_HEIGHT = HEIGHT;

/** Input (oculto) para seleccionar imagen del disco */
let input = document.getElementById("file");

/* Imagen */
let IMG = new Image();

/** Tamaño del pincel medido en pixeles */
let tam = 5;

/** Estado del mouse */
let mouseDown = false;

/** Color del lapiz por defecto en negro*/
let color = `rgba(${0},${0},${0},${255})`;

/** El pincel puede ser lapiz o borrador */
let pincel;

/** Seleccion del lapiz */
document.getElementById("lapiz").addEventListener("click", () => {
   document.getElementById("canvas").style.cursor = `url('img/pencil-cursor.cur'), auto`;

  if (pincel instanceof Lapiz) {
    pincel = null;
  } else {
    pincel = new Lapiz(0, 0, color, tam / 2, ctx);
  }
});

/** Seleccion del borrador */
document.getElementById("borrador").addEventListener("click", () => {
  document.getElementById("canvas").style.cursor = `url('img/goma.cur'), auto`;
  if (pincel instanceof Borrador) {
    pincel = null;
  } else {
    pincel = new Borrador(0, 0, color, ctx, tam , tam );
  }
});

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  if(pincel){
    pincel.setPosition(e.layerX,e.layerY);
  }
});

canvas.addEventListener("mouseup", () => {
  mouseDown = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (pincel) {
    if (mouseDown) {
      pincel.draw(e);
      pincel.setPosition(e.layerX, e.layerY);
    }
  }
});

/** Boton visible */
document.getElementById("btn").addEventListener("click", () => input.click());

/** Evento que dispara carga de la imagen del disco */
input.addEventListener("change", (e) => loadImage(e));

/** Evento que dispara la descarga de la imagen */
document.getElementById("btnSave").addEventListener("click", saveImage);

/** Restaurar imagen original */
document.getElementById("reset").addEventListener("click", drawImage);

/** Borrar imagen */
document.getElementById("delete").addEventListener("click", deleteImage);

/**
 * Usuario selecciona una imagen de su disco
 * @param { Event } e
 */
function loadImage(e) {
  if (e.target.files) {
    // Archivo seleccionado
    let file = e.target.files[0];

    let fileReader = new FileReader();

    // Define 'src' de imagen con la ruta del archivo seleccionado
    fileReader.onload = (e) => (IMG.src = e.target.result);
    fileReader.readAsDataURL(file);

    // Dibujar imagen
    IMG.onload = () => drawImage();
  }
}

/**
 * Muestra la imagen en el canvas
 */
function drawImage() {
  resetCanvas();

  // Define las proporciones de la imagen y del canvas
  setSize();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(IMG, 0, 0, TEMP_WIDTH, TEMP_HEIGHT);
}

/**
 * Definicion de proporciones de la imagen
 */
function setSize() {
  // evaluar proporcion
  PROP = IMG.width > WIDTH || IMG.height > HEIGHT ? aspectRatio() : 1;

  // si la proporcion es 1, la imagen mantendra su tamaño
  // si la porporcion es menor, (Ej: 0.75) el tamaño de la imagen
  // sera solo el 75% de la original
  TEMP_WIDTH = IMG.width * PROP;
  TEMP_HEIGHT = IMG.height * PROP;

  // Nuevas dimensiones del canvas (para mejor descarga de imagen)
  canvas.width = TEMP_WIDTH;
  canvas.height = TEMP_HEIGHT;
}

/**
 * Si la imagen es mayor al tamaño maximo del canvas
 * Esta funcion determina que porcentaje de la imagen entra en el canvas
 *
 * Ej: si retorna 0.75, solo el 75% de la imagen entra en el canvas
 *
 * @param { Image } img
 * @returns { Number } entre 0 y 1
 */
function aspectRatio() {
  let w = IMG.width > WIDTH ? (WIDTH - IMG.width) / IMG.width : 1;
  let h = IMG.height > HEIGHT ? (HEIGHT - IMG.height) / IMG.height : 1;
  return 1 - (w < h ? w : h) * -1;
}

/**
 * Borra el contenido y restaura dimensiones originales del canvas
 */
function resetCanvas() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

/**
 * Borra la imagen cargada
 */
function deleteImage() {
  resetCanvas();
  IMG.src = "";
}

/**
 * @returns objeto que contiene los datos de la imagen para el rectángulo dado del canvas
 */
function getCopy() {
  ctx.drawImage(IMG, 0, 0, TEMP_WIDTH, TEMP_HEIGHT);
  return ctx.getImageData(0, 0, TEMP_WIDTH, TEMP_HEIGHT);
}

/**
 * Sepia:
 * La fotografía en sepia no es más que una imagen en blanco y negro con un matiz marrón que
 * crea una sensación de calidez.
 */
document.getElementById("btn_sepia").addEventListener("click", sepia);

function sepia() {
  let c = getCopy();
  for (let x = 0; x < TEMP_HEIGHT; x++) {
    for (let y = 0; y < TEMP_WIDTH; y++) {
      let arr = getPixel(c, x, y);
      let promPxR = 0.393 * arr[0] + 0.769 * arr[1] + 0.189 * arr[2];
      let promPxG = 0.349 * arr[0] + 0.686 * arr[1] + 0.168 * arr[2];
      let promPxB = 0.272 * arr[0] + 0.534 * arr[1] + 0.131 * arr[2];
      let promPxA = 255;
      setPixel(c, x, y, promPxR, promPxG, promPxB, promPxA);
    }
  }
  ctx.putImageData(c, 0, 0);
}

document.getElementById("btn_brillo").addEventListener("click", brillo);

function brillo() {
  //let c = getCopy();
  let c =  ctx.getImageData(0, 0, TEMP_WIDTH, TEMP_HEIGHT);
  for (let x = 0; x <TEMP_HEIGHT; x++) {
      for (let y = 0; y <  TEMP_WIDTH; y++) {
          let arrRGBA = getPixel(c, x, y);
          let promPixelR = masBrillo(arrRGBA[0]);
          let promPixelG = masBrillo(arrRGBA[1]);
          let promPixelB = masBrillo(arrRGBA[2]);
          let promPixelA = 255;
          setPixel(c, x, y, promPixelR, promPixelG, promPixelB, promPixelA);
      }
  }
  ctx.putImageData(c, 0, 0);
  //ctx.putImageData(c, 0, 0);
}

/**
 * Funcion auxiliar que retornara el color de pixel editado aclarandolo mas de lo actual 
 */
function masBrillo(entrada) {
  const brillo = 30;
  let salida = entrada + brillo;

  if (salida > 255) {
      return 255;
  }
  else {
      return salida;
  }
}

/**
 * Binarizacion:
 * Una imágen que solo sea representada por dos tonos de color, por general: blanco y negro.
 */
document.getElementById("btn_binary").addEventListener("click", binarizacion);

function binarizacion() {
  let c = getCopy();
  for (let x = 0; x < TEMP_HEIGHT; x++) {
    for (let y = 0; y < TEMP_WIDTH; y++) {
      let arrRGBA = getPixel(c, x, y);
      let result = prom(arrRGBA) > 127 ? 255 : 0;
      let pixelR = result;
      let pixelG = result;
      let pixelB = result;
      let pixelA = 255;
      setPixel(c, x, y, pixelR, pixelG, pixelB, pixelA);
    }
  }
  ctx.putImageData(c, 0, 0);
}

/**
 * Negativo
 * Un negativo es una imagen fotográfica en la que las luces aparecen en tonos oscuros y
 * las sombras en tonos claros
 */
document.getElementById("btn_negativo").addEventListener("click", negativo);

function negativo() {
  let c = getCopy();
  for (let x = 0; x < TEMP_HEIGHT; x++) {
    for (let y = 0; y < TEMP_WIDTH; y++) {
      let arrRGBA = getPixel(c, x, y);
      let promPixelR = 255 - arrRGBA[0];
      let promPixelG = 255 - arrRGBA[1];
      let promPixelB = 255 - arrRGBA[2];
      let promPixelA = 255;
      setPixel(c, x, y, promPixelR, promPixelG, promPixelB, promPixelA);
    }
  }
  ctx.putImageData(c, 0, 0);
}

/**
 * Devuelve arreglo de pixel con los colores Red, Grenn, Blue y Alpha
 */
function getPixel(imageData, x, y) {
  let index = (x + y * imageData.height) * 4;
  let r = imageData.data[index];
  let g = imageData.data[index + 1];
  let b = imageData.data[index + 2];
  let a = imageData.data[index + 3];
  return [r, g, b, a];
}

/**
 * Setea alores de un Pixel con los valores enviados a la funcion
 */
function setPixel(imageData, x, y, r, g, b, a) {
  let index = (x + y * imageData.height) * 4;
  imageData.data[index] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

/**
 * @returns promedio de colores de un pixel (dado en un arreglo)
 * @param { Array } arr pixel
 */
function prom(arr) {
  return Math.floor((arr[0] + arr[1] + arr[2]) / 3);
}

/**
 * Descargar imagen
 */
function saveImage() {
  let link = document.createElement("a");
  link.download = "canvas.png";
  link.href = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  link.click();
};
