/** @type { HTMLcanvasElement} */
let canvas = document.getElementById("canvas");

let ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let inputFile = document.getElementById("file");

document.getElementById("btn").addEventListener("click", () => {
  inputFile.click();
});

inputFile.addEventListener("change", (e) => loadImage(e));

function loadImage(e) {
  if (e.target.files) {
    let file = e.target.files[0];

    // puede ser global
    let img = new Image();

    let fileReader = new FileReader();
    fileReader.onload = (e) => (img.src = e.target.result);
    fileReader.readAsDataURL(file);
    img.onload = () => drawImage(img);
  }
}

function drawImage(img) {
  clearCanvas();
  let percent = 1;
  if (img.width > width || img.height > height) {
    percent = resizeImage(img);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, img.width * percent, img.height * percent);
}

function resizeImage(img) {
  // Para calcular la diferencia porcentual entre dos números,
  // tendremos que restarle el valor antiguo al valor nuevo y
  // dividir la cifra resultante entre el valor antiguo y
  // multiplicarlo a continuación por 100.

  let percentW = 1;
  let percentH = 1;
  if (img.width > width) {
    percentW = (width - img.width) / img.width;
  }
  if (img.height > height) {
    percentH = (height - img.height) / img.height;
  }
  let r = percentW < percentH ? percentW : percentH;
  return 1 - r * -1;
}

function clearCanvas() {
  ctx.clearRect(0, 0, width, height);
}
