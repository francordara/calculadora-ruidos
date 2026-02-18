// ========================
// Inicialización de fecha
// ========================
var date = new Date();
var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();
if (month < 10) month = "0" + month;
if (day < 10) day = "0" + day;
var today = year + "-" + month + "-" + day;
document.getElementById('fecha').value = today;

// ========================
// Variables globales
// ========================
let es_domingo;
let es_diurno;
let es_feriado;
let zona;
let asa;
let periodo;
let ambiente;
let uso;
let recinto;
let lmp;
let lmpb = 0;
let msiete = "N";
let fecha;
let hora;

// ========================
// Utilidades
// ========================
function mismoDia(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

// *** Feriados 2026 (CABA/AR) ***
const feriados = [
  new Date(2026, 0, 1),   // Año Nuevo – 1 de enero
  new Date(2026, 1, 16),  // Carnaval – 16 de febrero
  new Date(2026, 1, 17),  // Carnaval – 17 de febrero
  new Date(2026, 2, 23),  // No laborable con fines turísticos – 23 de marzo
  new Date(2026, 2, 24),  // Día Nacional de la Memoria por la Verdad y la Justicia – 24 de marzo
  new Date(2026, 3, 2),   // Día del Veterano y de los Caídos en Malvinas (y Jueves Santo) – 2 de abril
  new Date(2026, 3, 3),   // Viernes Santo – 3 de abril
  new Date(2026, 4, 1),   // Día del Trabajo – 1 de mayo
  new Date(2026, 4, 25),  // Día de la Revolución de Mayo – 25 de mayo
  new Date(2026, 5, 15),  // Paso a la Inmortalidad de Güemes (trasladable) – 15 de junio
  new Date(2026, 5, 19),  // Día de la Bandera (sábado) – 20 de junio (depende si querés el día observado o la fecha real)
  new Date(2026, 6, 9),   // Día de la Independencia – 9 de julio
  new Date(2026, 7, 17),  // Paso a la Inmortalidad de San Martín (trasladable) – 17 de agosto
  new Date(2026, 9, 12),  // Día del Respeto a la Diversidad Cultural – 12 de octubre
  new Date(2026, 10, 23), // Día de la Soberanía Nacional – 23 de noviembre
  new Date(2026, 11, 7),  // No laborable con fines turísticos – 7 de diciembre
  new Date(2026, 11, 8),  // Día de la Inmaculada Concepción – 8 de diciembre
  new Date(2026, 11, 25)  // Navidad – 25 de diciembre
];


// ========================
// Paso 1
// ========================
function validarPaso1() {
  // Parseo LOCAL del input 'YYYY-MM-DD' (evita desfase a UTC)
  const fval = document.getElementById('fecha').value;
  const [y, m, d] = fval.split('-').map(Number);
  fecha = new Date(y, m - 1, d); // local midnight

  const diaSemana = fecha.getDay(); // 0 = Domingo
  es_domingo = (diaSemana === 0);

  hora = parseInt(document.getElementById('horario').value.slice(0, 2), 10);
  es_diurno = hora >= 7 && hora < 22;

  zona = document.getElementById("zona").value;
  ambiente = document.getElementById("ambiente").value;

  if (isNaN(fecha.getTime()) || isNaN(hora) || zona == 0 || ambiente == 0) {
    alert("El Campo Fecha, Hora, Zona y Ambiente son obligatorios");
    return;
  }

  // Feriados (comparación por Y-M-D)
  es_feriado = feriados.some(dv => mismoDia(fecha, dv));

  document.getElementById('fecha').disabled = true;
  document.getElementById('horario').disabled = true;
  document.getElementById('zona').disabled = true;
  document.getElementById('ambiente').disabled = true;

  // Periodo
  periodo = es_diurno ? 'DIU' : 'NOC';
  if (periodo == 'DIU' && (es_domingo || es_feriado)) { periodo = 'FER'; }

  // Etiqueta de periodo
  const resultado = document.getElementById('periodolbl');
  resultado.textContent = es_feriado ? 'FERIADO'
                        : es_domingo ? 'DOMINGO'
                        : es_diurno  ? 'DIURNO'
                                     : 'NOCTURNO';

  // Mostrar/ocultar controles según ambiente
  if (ambiente === "exterior") {
    // Exterior: no se usa ASA/USO/RECINTO
    document.getElementById('asalbl').style.display = "none";
    document.getElementById('recintolbl').style.display = "none";
    document.getElementById('usolbl').style.display = "none";
    document.getElementById('asa').disabled = true;
    document.getElementById('recinto').disabled = true;
    document.getElementById('uso').disabled = true;
    obtenerLimiteExt(zona, periodo);
  } else {
    // Interior: mostrar selector ASA y continuar con Paso 2
    document.getElementById('asalbl').style.display = "";
    document.getElementById('asa').disabled = false;
    document.getElementById('recintolbl').style.display = "none";
    document.getElementById('usolbl').style.display = "none";
  }
}

// ========================
// Límites Exterior
// ========================
function obtenerLimiteExt(zona, periodo) {
  // zona, periodo, limite
  var limites = [
    [["1","DIU"],60],[["1","NDF"],50],
    [["2","DIU"],65],[["2","NDF"],50],
    [["2d","DIU"],65],[["2d","NDF"],50],
    [["2da","NDF"],55],
    [["3","DIU"],70],[["3","NDF"],60],
    [["3d","DIU"],70],[["3d","NDF"],60],
    [["3da","NDF"],65],
    [["4","DIU"],75],[["4","NDF"],70],
    [["4d","DIU"],75],[["4d","NDF"],70],
    [["5","DIU"],80],[["5","NDF"],75],
    [["5d","DIU"],80],[["5d","NDF"],75]
  ];

  const seleccionados = [zona, periodo];
  for (var i = 0; i < limites.length; i++) {
    let lim = limites[i][0];
    if (lim[0] === seleccionados[0] && lim[1] === seleccionados[1]) {
      lmp = limites[i][1];
      msiete = "N"; // En exterior nunca aplica LF+7
      break;
    }
  }

  document.getElementById('lmplbld').textContent = "LMP:";
  document.getElementById('lmplbl').textContent = lmp + " db";
  document.getElementById('lmplblm7d').textContent = "LMP aplicable:";
  document.getElementById('lmplblm7v').textContent = lmp + " db";

  mostrarMed();
}

// ========================
// UI mediciones
// ========================
function mostrarMed() {
  const ids = ['monm1','monm2','monm3','monlblt','moffm1','moffm2','moffm3','mofflblt','btncalcr','btnImprimir'];
  ids.forEach(id => document.getElementById(id).style.display = "");
}

// ========================
// ASA interior: mostrar campos
// ========================
function validaASA() {
  asa = document.getElementById("asa").value; // "6"|"7"
  const recintolbl = document.getElementById('recintolbl');
  const usolbl = document.getElementById('usolbl');
  const btnp2i = document.getElementById('btnp2i');

  recintolbl.style.display = asa === "7" ? "" : "none";
  usolbl.style.display     = asa === "6" ? "" : "none";
  btnp2i.style.display     = (asa === "6" || asa === "7") ? "" : "none";
}

// ========================
// Paso 2 Interior
// ========================
function validarPaso2Int() {
  if (asa == "6") {
    uso = document.getElementById('uso').value;   // SAN ENS CUL OFI COM IND
    recinto = "0";
  }
  if (asa == "7") {
    recinto = document.getElementById('recinto').value; // HAB SER SLVP
    uso = "0";
  }

  document.getElementById('asa').disabled = true;
  document.getElementById('recinto').disabled = true;
  document.getElementById('uso').disabled = true;

  obtenerLimiteInt(zona, periodo, asa, recinto, uso);
}

// ========================
// Límites Interior (VI/VII)
// ========================
function obtenerLimiteInt(zona, periodo, asa, recinto, uso) {
  // zona, periodo, asa, recinto, uso, limite, +7 (S/N)

var limites = [

//1 = CbRb
//2 = APP/1, Rm1 / 4, Rma2, Rma4, Rma5, Rma1, CR1
//3 = APP/2, Cmb1, Cm1, Cm4, Cm5, Cma, Ca1
//4 = CmbB, Cmb3, Cm3, Rmb3, Rm3, Rma3
//5 = Cm2, CE1
//6 = IN
//7 = ID, IE
//8 = IP
//9 = Zonas de AC

    [["1","DIU","6","0","SAN"],45,"N"],
    [["1","DIU","6","0","ENS"],45,"N"],
    [["1","DIU","6","0","CUL"],45,"N"],
    [["1","DIU","6","0","OFI"],45,"N"],
    [["1","DIU","6","0","COM"],45,"N"],
    [["1","DIU","6","0","IND"],45,"N"],

    [["1","NOC","6","0","SAN"],35,"N"],
    [["1","NOC","6","0","ENS"],35,"N"],
    [["1","NOC","6","0","CUL"],35,"N"],
    [["1","NOC","6","0","OFI"],35,"N"],
    [["1","NOC","6","0","COM"],35,"N"],
    [["1","NOC","6","0","IND"],35,"N"],

    [["1","FER","6","0","SAN"],40,"N"],
    [["1","FER","6","0","ENS"],40,"N"],
    [["1","FER","6","0","CUL"],40,"N"],
    [["1","FER","6","0","OFI"],40,"N"],
    [["1","FER","6","0","COM"],40,"N"],
    [["1","FER","6","0","IND"],40,"N"],

    [["1","DIU","7","HAB","0"],45,"N"],
    [["1","DIU","7","SER","0"],45,"N"],
    [["1","DIU","7","SLVP","0"],45,"N"],

    [["1","NOC","7","HAB","0"],35,"N"],
    [["1","NOC","7","SER","0"],35,"N"],
    [["1","NOC","7","SLVP","0"],35,"N"],

    [["1","FER","7","HAB","0"],40,"N"],
    [["1","FER","7","SER","0"],40,"N"],
    [["1","FER","7","SLVP","0"],40,"N"],


    [["2","DIU","6","0","SAN"],45,"N"],
    [["2","DIU","6","0","ENS"],45,"N"],
    [["2","DIU","6","0","CUL"],45,"N"],
    [["2","DIU","6","0","OFI"],45,"N"],
    [["2","DIU","6","0","COM"],45,"N"],
    [["2","DIU","6","0","IND"],45,"N"],

    [["2","NOC","6","0","SAN"],35,"N"],
    [["2","NOC","6","0","ENS"],35,"N"],
    [["2","NOC","6","0","CUL"],35,"N"],
    [["2","NOC","6","0","OFI"],35,"N"],
    [["2","NOC","6","0","COM"],35,"N"],
    [["2","NOC","6","0","IND"],35,"N"],

    [["2","FER","6","0","SAN"],40,"N"],
    [["2","FER","6","0","ENS"],40,"N"],
    [["2","FER","6","0","CUL"],40,"N"],
    [["2","FER","6","0","OFI"],40,"N"],
    [["2","FER","6","0","COM"],40,"N"],
    [["2","FER","6","0","IND"],40,"N"],

    [["2","DIU","7","HAB","0"],45,"N"],
    [["2","DIU","7","SER","0"],45,"N"],
    [["2","DIU","7","SLVP","0"],45,"N"],

    [["2","NOC","7","HAB","0"],35,"N"],
    [["2","NOC","7","SER","0"],35,"N"],
    [["2","NOC","7","SLVP","0"],35,"N"],

    [["2","FER","7","HAB","0"],40,"N"],
    [["2","FER","7","SER","0"],40,"N"],
    [["2","FER","7","SLVP","0"],40,"N"],


    [["3","DIU","6","0","SAN"],50,"N"],
    [["3","DIU","6","0","ENS"],50,"N"],
    [["3","DIU","6","0","CUL"],50,"N"],
    [["3","DIU","6","0","OFI"],50,"N"],
    [["3","DIU","6","0","COM"],50,"N"],
    [["3","DIU","6","0","IND"],50,"N"],

    [["3","NOC","6","0","SAN"],40,"N"],
    [["3","NOC","6","0","ENS"],40,"N"],
    [["3","NOC","6","0","CUL"],40,"N"],
    [["3","NOC","6","0","OFI"],40,"N"],
    [["3","NOC","6","0","COM"],40,"N"],
    [["3","NOC","6","0","IND"],40,"N"],

    [["3","FER","6","0","SAN"],45,"N"],
    [["3","FER","6","0","ENS"],45,"N"],
    [["3","FER","6","0","CUL"],45,"N"],
    [["3","FER","6","0","OFI"],45,"N"],
    [["3","FER","6","0","COM"],45,"N"],
    [["3","FER","6","0","IND"],45,"N"],

    [["3","DIU","7","HAB","0"],50,"N"],
    [["3","DIU","7","SER","0"],50,"N"],
    [["3","DIU","7","SLVP","0"],50,"N"],

    [["3","NOC","7","HAB","0"],40,"N"],
    [["3","NOC","7","SER","0"],40,"N"],
    [["3","NOC","7","SLVP","0"],40,"N"],

    [["3","FER","7","HAB","0"],45,"N"],
    [["3","FER","7","SER","0"],45,"N"],
    [["3","FER","7","SLVP","0"],45,"N"],


    [["4","DIU","6","0","SAN"],55,"N"],
    [["4","DIU","6","0","ENS"],55,"N"],
    [["4","DIU","6","0","CUL"],55,"N"],
    [["4","DIU","6","0","OFI"],55,"N"],
    [["4","DIU","6","0","COM"],55,"N"],
    [["4","DIU","6","0","IND"],55,"N"],

    [["4","NOC","6","0","SAN"],45,"N"],
    [["4","NOC","6","0","ENS"],45,"N"],
    [["4","NOC","6","0","CUL"],45,"N"],
    [["4","NOC","6","0","OFI"],45,"N"],
    [["4","NOC","6","0","COM"],45,"N"],
    [["4","NOC","6","0","IND"],45,"N"],

    [["4","FER","6","0","SAN"],50,"N"],
    [["4","FER","6","0","ENS"],50,"N"],
    [["4","FER","6","0","CUL"],50,"N"],
    [["4","FER","6","0","OFI"],50,"N"],
    [["4","FER","6","0","COM"],50,"N"],
    [["4","FER","6","0","IND"],50,"N"],

    [["4","DIU","7","HAB","0"],55,"N"],
    [["4","DIU","7","SER","0"],55,"N"],
    [["4","DIU","7","SLVP","0"],55,"N"],

    [["4","NOC","7","HAB","0"],45,"N"],
    [["4","NOC","7","SER","0"],45,"N"],
    [["4","NOC","7","SLVP","0"],45,"N"],

    [["4","FER","7","HAB","0"],50,"N"],
    [["4","FER","7","SER","0"],50,"N"],
    [["4","FER","7","SLVP","0"],50,"N"],


    [["5","DIU","6","0","SAN"],60,"N"],
    [["5","DIU","6","0","ENS"],60,"N"],
    [["5","DIU","6","0","CUL"],60,"N"],
    [["5","DIU","6","0","OFI"],60,"N"],
    [["5","DIU","6","0","COM"],60,"N"],
    [["5","DIU","6","0","IND"],60,"N"],

    [["5","NOC","6","0","SAN"],50,"N"],
    [["5","NOC","6","0","ENS"],50,"N"],
    [["5","NOC","6","0","CUL"],50,"N"],
    [["5","NOC","6","0","OFI"],50,"N"],
    [["5","NOC","6","0","COM"],50,"N"],
    [["5","NOC","6","0","IND"],50,"N"],

    [["5","FER","6","0","SAN"],55,"N"],
    [["5","FER","6","0","ENS"],55,"N"],
    [["5","FER","6","0","CUL"],55,"N"],
    [["5","FER","6","0","OFI"],55,"N"],
    [["5","FER","6","0","COM"],55,"N"],
    [["5","FER","6","0","IND"],55,"N"],

    [["5","DIU","7","HAB","0"],60,"N"],
    [["5","DIU","7","SER","0"],60,"N"],
    [["5","DIU","7","SLVP","0"],60,"N"],

    [["5","NOC","7","HAB","0"],50,"N"],
    [["5","NOC","7","SER","0"],50,"N"],
    [["5","NOC","7","SLVP","0"],50,"N"],

    [["5","FER","7","HAB","0"],55,"N"],
    [["5","FER","7","SER","0"],55,"N"],
    [["5","FER","7","SLVP","0"],55,"N"],

    [["6","DIU","6","0","SAN"],65,"N"],
    [["6","DIU","6","0","ENS"],65,"N"],
    [["6","DIU","6","0","CUL"],65,"N"],
    [["6","DIU","6","0","OFI"],65,"N"],
    [["6","DIU","6","0","COM"],65,"N"],
    [["6","DIU","6","0","IND"],65,"N"],

    [["6","NOC","6","0","SAN"],55,"N"],
    [["6","NOC","6","0","ENS"],55,"N"],
    [["6","NOC","6","0","CUL"],55,"N"],
    [["6","NOC","6","0","OFI"],55,"N"],
    [["6","NOC","6","0","COM"],55,"N"],
    [["6","NOC","6","0","IND"],55,"N"],

    [["6","FER","6","0","SAN"],60,"N"],
    [["6","FER","6","0","ENS"],60,"N"],
    [["6","FER","6","0","CUL"],60,"N"],
    [["6","FER","6","0","OFI"],60,"N"],
    [["6","FER","6","0","COM"],60,"N"],
    [["6","FER","6","0","IND"],60,"N"],

    [["6","DIU","7","HAB","0"],65,"N"],
    [["6","DIU","7","SER","0"],65,"N"],
    [["6","DIU","7","SLVP","0"],65,"N"],

    [["6","NOC","7","HAB","0"],55,"N"],
    [["6","NOC","7","SER","0"],55,"N"],
    [["6","NOC","7","SLVP","0"],55,"N"],

    [["6","FER","7","HAB","0"],60,"N"],
    [["6","FER","7","SER","0"],60,"N"],
    [["6","FER","7","SLVP","0"],60,"N"],


    [["7","DIU","6","0","SAN"],70,"N"],
    [["7","DIU","6","0","ENS"],70,"N"],
    [["7","DIU","6","0","CUL"],70,"N"],
    [["7","DIU","6","0","OFI"],70,"N"],
    [["7","DIU","6","0","COM"],70,"N"],
    [["7","DIU","6","0","IND"],70,"N"],

    [["7","NOC","6","0","SAN"],60,"N"],
    [["7","NOC","6","0","ENS"],60,"N"],
    [["7","NOC","6","0","CUL"],60,"N"],
    [["7","NOC","6","0","OFI"],60,"N"],
    [["7","NOC","6","0","COM"],60,"N"],
    [["7","NOC","6","0","IND"],60,"N"],

    [["7","FER","6","0","SAN"],65,"N"],
    [["7","FER","6","0","ENS"],65,"N"],
    [["7","FER","6","0","CUL"],65,"N"],
    [["7","FER","6","0","OFI"],65,"N"],
    [["7","FER","6","0","COM"],65,"N"],
    [["7","FER","6","0","IND"],65,"N"],

    [["7","DIU","7","HAB","0"],70,"N"],
    [["7","DIU","7","SER","0"],70,"N"],
    [["7","DIU","7","SLVP","0"],70,"N"],

    [["7","NOC","7","HAB","0"],60,"N"],
    [["7","NOC","7","SER","0"],60,"N"],
    [["7","NOC","7","SLVP","0"],60,"N"],

    [["7","FER","7","HAB","0"],65,"N"],
    [["7","FER","7","SER","0"],65,"N"],
    [["7","FER","7","SLVP","0"],65,"N"],


    [["8","DIU","6","0","SAN"],60,"N"],
    [["8","DIU","6","0","ENS"],60,"N"],
    [["8","DIU","6","0","CUL"],60,"N"],
    [["8","DIU","6","0","OFI"],60,"N"],
    [["8","DIU","6","0","COM"],60,"N"],
    [["8","DIU","6","0","IND"],60,"N"],

    [["8","NOC","6","0","SAN"],50,"N"],
    [["8","NOC","6","0","ENS"],50,"N"],
    [["8","NOC","6","0","CUL"],50,"N"],
    [["8","NOC","6","0","OFI"],50,"N"],
    [["8","NOC","6","0","COM"],50,"N"],
    [["8","NOC","6","0","IND"],50,"N"],

    [["8","FER","6","0","SAN"],55,"N"],
    [["8","FER","6","0","ENS"],55,"N"],
    [["8","FER","6","0","CUL"],55,"N"],
    [["8","FER","6","0","OFI"],55,"N"],
    [["8","FER","6","0","COM"],55,"N"],
    [["8","FER","6","0","IND"],55,"N"],

    [["8","DIU","7","HAB","0"],60,"N"],
    [["8","DIU","7","SER","0"],60,"N"],
    [["8","DIU","7","SLVP","0"],60,"N"],

    [["8","NOC","7","HAB","0"],50,"N"],
    [["8","NOC","7","SER","0"],50,"N"],
    [["8","NOC","7","SLVP","0"],50,"N"],

    [["8","FER","7","HAB","0"],55,"N"],
    [["8","FER","7","SER","0"],55,"N"],
    [["8","FER","7","SLVP","0"],55,"N"],


    [["9","DIU","6","0","SAN"],55,"N"],
    [["9","DIU","6","0","ENS"],55,"N"],
    [["9","DIU","6","0","CUL"],55,"N"],
    [["9","DIU","6","0","OFI"],55,"N"],
    [["9","DIU","6","0","COM"],55,"N"],
    [["9","DIU","6","0","IND"],55,"N"],

    [["9","NOC","6","0","SAN"],45,"N"],
    [["9","NOC","6","0","ENS"],45,"N"],
    [["9","NOC","6","0","CUL"],45,"N"],
    [["9","NOC","6","0","OFI"],45,"N"],
    [["9","NOC","6","0","COM"],45,"N"],
    [["9","NOC","6","0","IND"],45,"N"],

    [["9","FER","6","0","SAN"],50,"N"],
    [["9","FER","6","0","ENS"],50,"N"],
    [["9","FER","6","0","CUL"],50,"N"],
    [["9","FER","6","0","OFI"],50,"N"],
    [["9","FER","6","0","COM"],50,"N"],
    [["9","FER","6","0","IND"],50,"N"],

    [["9","DIU","7","HAB","0"],55,"N"],
    [["9","DIU","7","SER","0"],55,"N"],
    [["9","DIU","7","SLVP","0"],55,"N"],

    [["9","NOC","7","HAB","0"],45,"N"],
    [["9","NOC","7","SER","0"],45,"N"],
    [["9","NOC","7","SLVP","0"],45,"N"],

    [["9","FER","7","HAB","0"],50,"N"],
    [["9","FER","7","SER","0"],50,"N"],
    [["9","FER","7","SLVP","0"],50,"N"]
];

  const seleccionados = [zona, periodo, asa, recinto, uso];
  for (var i = 0; i < limites.length; i++) {
    let lim = limites[i][0];
    if (lim[0] === seleccionados[0] && lim[1] === seleccionados[1] &&
        lim[2] === seleccionados[2] && lim[3] === seleccionados[3] &&
        lim[4] === seleccionados[4]) {
      lmp = limites[i][1];
      msiete = limites[i][2]; // "S" | "N"
      break;
    }
  }

  document.getElementById('lmplbld').textContent = "LMP:";
  document.getElementById('lmplbl').textContent = lmp + " db";
  document.getElementById('lmplblm7d').textContent = "LMP aplicable:";
  document.getElementById('lmplblm7v').textContent = lmp + " db";

  mostrarMed();
}

// ========================
// Cálculo de ruido
// ========================
function calcularRuido() {

  document.getElementById("resultadolmon").innerText = "";
  document.getElementById("resultadolmoff").innerText = "";
  document.getElementById("calculoruido").innerText = "";
  document.getElementById("lbllmlf").innerText = "";
  document.getElementById("lblle").innerText = "";

  const m1on = parseFloat(document.getElementById("m1on").value);
  const m2on = parseFloat(document.getElementById("m2on").value);
  const m3on = parseFloat(document.getElementById("m3on").value);

  // Si antes quedó guardado un LMP mayor (por LF+7), preservarlo
  lmp = (lmpb && lmpb > lmp) ? lmpb : lmp;

  // Validaciones ON
  if (isNaN(m1on) || m1on <= 0 || isNaN(m2on) || m2on <= 0 || isNaN(m3on) || m3on <= 0) {
    document.getElementById("resultadolmon").innerText = "Por favor, ingrese valores mayores a 0 en las cajas de texto.";
    return;
  }
  var maximo = Math.max(m1on, m2on, m3on);
  var minimo = Math.min(m1on, m2on, m3on);
  if (maximo - minimo > 3) {
    document.getElementById("resultadolmon").innerText = "La diferencia entre los extremos de la serie no debe ser mayor a 3db.";
    return;
  }
  var lm = (m1on + m2on + m3on) / 3;
  document.getElementById("resultadolmon").innerText = "LM = " + lm.toFixed(1);

  // OFF
  const m1off = parseFloat(document.getElementById("m1off").value);
  const m2off = parseFloat(document.getElementById("m2off").value);
  const m3off = parseFloat(document.getElementById("m3off").value);

  if (isNaN(m1off) || m1off <= 0 || isNaN(m2off) || m2off <= 0 || isNaN(m3off) || m3off <= 0) {
    document.getElementById("resultadolmoff").innerText = "Por favor, ingrese valores mayores a 0 en las cajas de texto.";
    return;
  }
  maximo = Math.max(m1off, m2off, m3off);
  minimo = Math.min(m1off, m2off, m3off);
  if (maximo - minimo > 3) {
    document.getElementById("resultadolmoff").innerText = "La diferencia entre los extremos de la serie no debe ser mayor a 3db.";
    return;
  }
  var lf = (m1off + m2off + m3off) / 3;
  document.getElementById("resultadolmoff").innerText = "LF = " + lf.toFixed(1);

  // Diferencia LM - LF
  var lmlf = lm - lf;
  document.getElementById("lbllmlf").innerText = "LM - LF = " + lmlf.toFixed(1);
  var le = 0;

  // Reset leyendas LMP
  document.getElementById('lmplbld').textContent = "LMP:";
  document.getElementById('lmplblm7d').textContent = "";
  document.getElementById('lmplblm7v').textContent = "";

  // ========================
  // APLICACIÓN CORRECTA LF+7
  // ========================
  const esExterior = (ambiente === "exterior");
  // Regla: solo en interior y en los casos habilitados
  const habilitaLF7 = (!esExterior) && (
    // ASA VI: por uso
    (asa === "6" && ["SAN","ENS","CUL"].includes(uso)) ||
    // ASA VII: solo si zona 1 o 2
    (asa === "7" && (zona === "1" || zona === "2"))
  );

  let lmpAplicable = lmp;

  if (habilitaLF7 && msiete === "S") {
    const lfmsiete = lf + 7;
    const lmpFijo = lmp;
    // *** MÁS RESTRICTIVO = MÍNIMO ***
    lmpAplicable = Math.min(lmpFijo, lfmsiete);

    document.getElementById('lmplbl').textContent = lmpFijo.toFixed(1) + " db o LF+7";
    document.getElementById('lmplblm7d').textContent = "LMP aplicable:";
    document.getElementById('lmplblm7v').textContent = lmpAplicable.toFixed(1) + " db";

    lmpb = lmpFijo;
    lmp  = lmpAplicable;
  } else {
    // En todos los demás casos (incluye exterior): LMP fijo
    document.getElementById('lmpllbl') && (document.getElementById('lmpllbl').textContent = lmp.toFixed(1) + " db");
    document.getElementById('lmplbl').textContent = lmp.toFixed(1) + " db";
    document.getElementById('lmplblm7d').textContent = "LMP aplicable:";
    document.getElementById('lmplblm7v').textContent = lmp.toFixed(1) + " db";
  }

  // Evaluación LE
  if (lmlf < 3) {
    document.getElementById("calculoruido").innerText = "Ruidos No Evaluables por producirse Enmascaramiento";
    return;
  }
  if (lmlf >= 3 && lmlf < 10) {
    var delta = obtenerDelta(lmlf.toFixed(1));
    le = lm - parseFloat(delta);
    document.getElementById("lblle").innerText = "LE = " + le.toFixed(1) + " (LM = " + lm.toFixed(1) + " - Delta = " + delta + " )";
  }
  if (lmlf >= 10) {
    le = lm;
    document.getElementById("lblle").innerText = "LE = " + le.toFixed(1) + " (LM = " + lm.toFixed(1) + " )";
  }

  if (le > 0) {
    if (le > lmpAplicable) {
      document.getElementById("calculoruido").innerText = "EL LE (" + le.toFixed(1) + ") SUPERA EL LIMITE MAXIMO PERMITIDO (" + lmpAplicable.toFixed(1) + " db)";
    } else {
      document.getElementById("calculoruido").innerText = "EL LE (" + le.toFixed(1) + ")  NO SUPERA EL LIMITE MAXIMO PERMITIDO (" + lmpAplicable.toFixed(1) + " db)";
    }
  }
}

// ========================
// Tabla de Delta
// ========================
function obtenerDelta(delta) {
  var tablaDelta = [
    ["3.0","3.0"],["3.1","2.9"],["3.2","2.8"],["3.3","2.7"],["3.4","2.7"],
    ["3.5","2.6"],["3.6","2.5"],["3.7","2.4"],["3.8","2.3"],["3.9","2.3"],
    ["4.0","2.2"],["4.1","2.1"],["4.2","2.1"],["4.3","2.0"],["4.4","2.0"],
    ["4.5","1.9"],["4.6","1.8"],["4.7","1.8"],["4.8","1.7"],["4.9","1.7"],
    ["5.0","1.7"],["5.1","1.6"],["5.2","1.6"],["5.3","1.5"],["5.4","1.5"],
    ["5.5","1.4"],["5.6","1.4"],["5.7","1.4"],["5.8","1.3"],["5.9","1.3"],
    ["6.0","1.3"],["6.1","1.2"],["6.2","1.2"],["6.3","1.2"],["6.4","1.1"],
    ["6.5","1.1"],["6.6","1.1"],["6.7","1.0"],["6.8","1.0"],["6.9","1.0"],
    ["7.0","1.0"],["7.1","0.9"],["7.2","0.9"],["7.3","0.9"],["7.4","0.9"],
    ["7.5","0.9"],["7.6","0.8"],["7.7","0.8"],["7.8","0.8"],["7.9","0.8"],
    ["8.0","0.7"],["8.1","0.7"],["8.2","0.7"],["8.3","0.7"],["8.4","0.7"],
    ["8.5","0.7"],["8.6","0.6"],["8.7","0.6"],["8.8","0.6"],["8.9","0.6"],
    ["9.0","0.6"],["9.1","0.6"],["9.2","0.6"],["9.3","0.5"],["9.4","0.5"],
    ["9.5","0.5"],["9.6","0.5"],["9.7","0.5"],["9.8","0.5"],["9.9","0.5"]
  ];

  for (var i = 0; i < tablaDelta.length; i++) {
    let valortabla = parseFloat(tablaDelta[i][0]).toFixed(1);
    if (valortabla === delta) return tablaDelta[i][1];
  }
  return 0;
}