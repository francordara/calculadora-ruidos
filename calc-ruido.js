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
let k;
let k_T;
let k_I;
let k_bf;
let es_molesto;
let es_tonal;
let es_impulsivo;
let es_bajafrecuencia;
let fecha;
let hora;
let hayPaso2 = false; // Si se usa ASA/USO/RECINTO (paso 2)
let hayExterior = false; // Si la medición distingue entre exterior e interior (si no, se asume interior y se muestra el selector ASA). Si distingue, agregar valores de los limites
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
  // Parseo LOCAL del input 'YYYY-MM-DD'
  const fval = document.getElementById('fecha').value;
  const [y, m, d] = fval.split('-').map(Number);
  fecha = new Date(y, m - 1, d);
  const timeValue = document.getElementById('horario').value;
  hora = parseInt(timeValue.split(':')[0], 10);
  zona = document.getElementById("zona").value;
  ambiente = document.getElementById("ambiente").value;

  if (isNaN(fecha.getTime()) || isNaN(hora) || zona == 0 || ambiente == 0) {
    alert("Los campos Fecha, Horario, Zona y Ambiente son obligatorios.");
    return;
  }

  // Deshabilitar controles
  document.getElementById('fecha').disabled = true;
  document.getElementById('horario').disabled = true;
  document.getElementById('zona').disabled = true;
  document.getElementById('ambiente').disabled = true;

  // Variables para categorizar el día
  const diaSemana = fecha.getDay(); // 0 = Domingo, 1-5 = Lunes a Viernes, 6 = Sábado
  es_feriado = feriados.some(dv => mismoDia(fecha, dv));
 
  const es_domingo_o_feriado = (diaSemana === 0 || es_feriado);
  const es_sabado = (diaSemana === 6 && !es_feriado);
  const es_habil = (diaSemana >= 1 && diaSemana <= 5 && !es_feriado);

  // ========================
  // Lógica de Períodos (Norma IRAM 4062)
  // ========================
 
  // 1. Horario Nocturno (Todos los días de 22 h a 6 h)
  if (hora >= 22 || hora < 6) {
    periodo = 'NOC';
  }
  // 2. Domingos y Feriados (Lo que no es nocturno, es descanso de 6 h a 22 h)
  else if (es_domingo_o_feriado) {
    periodo = 'DES';
  }
  // 3. Sábados
  else if (es_sabado) {
    if (hora >= 8 && hora < 14) {
      periodo = 'DIU';
    } else {
      // Aplica a la franja de 6 h a 8 h y de 14 h a 22 h
      periodo = 'DES';
    }
  }
  // 4. Días Hábiles (Lunes a Viernes)
  else if (es_habil) {
    if (hora >= 8 && hora < 20) {
      periodo = 'DIU';
    } else {
      // Aplica a la franja de 6 h a 8 h y de 20 h a 22 h
      periodo = 'DES';
    }
  }

  // Etiqueta de periodo en la interfaz
  const resultado = document.getElementById('periodolbl');
  if (periodo === 'DIU') resultado.textContent = 'DIURNO';
  if (periodo === 'DES') resultado.textContent = 'DESCANSO';
  if (periodo === 'NOC') resultado.textContent = 'NOCTURNO';

  // Mostrar/ocultar controles según ambiente y si se usa paso 2
  if (!hayPaso2 || (hayExterior && ambiente === "exterior")) {
    // Exterior o sin paso 2: no se usa ASA/USO/RECINTO
    document.getElementById('asalbl').style.display = "none";
    document.getElementById('recintolbl').style.display = "none";
    document.getElementById('usolbl').style.display = "none";
    document.getElementById('asa').disabled = true;
    document.getElementById('recinto').disabled = true;
    document.getElementById('uso').disabled = true;
    obtenerLimiteExt(zona, periodo);
  } else {
    // Interior con paso 2: mostrar selector ASA y continuar con Paso 2
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
  var limites = [  // Limites para exterior si se distingue entre interior/exterior (falta aclarar valores)
    [["1","DIU"],0],
    [["1","DES"],0],
    [["1","NOC"],0],
    
    [["2","DIU"],0],
    [["2","DES"],0],
    [["2","NOC"],0],

    [["3","DIU"],0],
    [["3","DES"],0],
    [["3","NOC"],0],

    [["4","DIU"],0],
    [["4","DES"],0],
    [["4","NOC"],0],
    
    [["5","DIU"],0],
    [["5","DES"],0],
    [["5","NOC"],0],

    [["6","DIU"],0],
    [["6","DES"],0],
    [["6","NOC"],0],
    
    [["7","DIU"],0],
    [["7","DES"],0],
    [["7","NOC"],0],

    [["8","DIU"],0],
    [["8","DES"],0],
    [["8","NOC"],0],

    [["9","DIU"],0],
    [["9","DES"],0],
    [["9","NOC"],0]];

  if (!hayPaso2 && !hayExterior) {
    limites = [   // Límites si no hay paso 2 (ASA/USO/RECINTO) y no se distingue entre interior/exterior
    [["1","DIU"],45],
    [["1","DES"],40],
    [["1","NOC"],35],
    
    [["2","DIU"],45],
    [["2","DES"],40],
    [["2","NOC"],35],

    [["3","DIU"],50],
    [["3","DES"],45],
    [["3","NOC"],40],

    [["4","DIU"],55],
    [["4","DES"],50],
    [["4","NOC"],45],
    
    [["5","DIU"],60],
    [["5","DES"],55],
    [["5","NOC"],50],

    [["6","DIU"],65],
    [["6","DES"],60],
    [["6","NOC"],55],
  
    [["7","DIU"],70],
    [["7","DES"],65],
    [["7","NOC"],60],
    
    [["8","DIU"],60],
    [["8","DES"],55],
    [["8","NOC"],50],
    
    [["9","DIU"],55],
    [["9","DES"],50],
    [["9","NOC"],45]];
  }
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
  const ids = ['monm1','monlblt','moffm1','mofflblt','btncalcr','btnImprimir','lblpenalizaciones','row_kt','row_ki','row_kbf'];
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

  // Si antes quedó guardado un LMP mayor (por LF+7), preservarlo
  lmp = (lmpb && lmpb > lmp) ? lmpb : lmp;

  // Validaciones ON
  if (isNaN(m1on) || m1on <= 0) {
    document.getElementById("resultadolmon").innerText = "Por favor, ingrese valores mayores a 0 en la caja de texto.";
    return;
  }
    
  var lm = m1on;
  document.getElementById("resultadolmon").innerText = "LM = " + lm.toFixed(1);

  // OFF
  const m1off = parseFloat(document.getElementById("m1off").value);

  if (isNaN(m1off) || m1off <= 0) {
    document.getElementById("resultadolmoff").innerText = "Por favor, ingrese valores mayores a 0 en la caja de texto.";
    return;
  }

  var lf = m1off;
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
  // ========================
  // Evaluación LE y Penalizaciones (K)
  // ========================
  if (lmlf < 3) {
    document.getElementById("calculoruido").innerText = "Ruidos no evaluables por producirse enmascaramiento.";
    document.getElementById("lblle").innerText = "";
    return;
  }
 
  let lm_corregido = 0;

  if (lmlf >= 3 && lmlf < 10) {
    // Cálculo logarítmico exacto
    let termM = Math.pow(10, lm / 10);
    let termF = Math.pow(10, lf / 10);
    lm_corregido = 10 * Math.log10(termM - termF);
  } else if (lmlf >= 10) {
    lm_corregido = lm;
  }

  // Leer penalizaciones de la UI
  let kt = parseInt(document.getElementById("k_tonal").value) || 0;
  let ki = parseInt(document.getElementById("k_impulsivo").value) || 0;
  let kbf = parseInt(document.getElementById("k_bajafrec").value) || 0;

  // Cálculo de K según Tabla 1 (IRAM 4062-2)
  let sumaK = kt + ki + kbf;
  let k_final = 0;
  let autoMolesto = false;

  switch (sumaK) {
    case 0:  k_final = 0; break;
    case 5:  k_final = 5; break;
    case 7:  k_final = 6; break;
    case 10: k_final = 6; break;
    case 12: k_final = 7; break;
    case 15:
    case 17: autoMolesto = true; break;
  }

  // Si la suma es 15 o 17, el ruido es automáticamente molesto, independientemente del Límite.
  if (autoMolesto) {
    document.getElementById("lblle").innerText = "Suma de componentes = " + sumaK + ".";
    document.getElementById("calculoruido").innerText = "MOLESTO: Por normativa, la combinación de penalizaciones clasifica al ruido como molesto directamente.";
    document.getElementById("calculoruido").style.color = "red";
    return; // Frenamos la ejecución acá
  }

  // Nivel de Evaluación (LE = LM_corregido + K)
  let le_sin_redondear = lm_corregido + k_final;
 
  // Redondeo final exigido por norma antes de comparar
  le = Math.round(le_sin_redondear);

  // Textos para la interfaz
  document.getElementById("lblle").innerText = "LE = " + le + " dB (LM Corregido: " + lm_corregido.toFixed(1) + " + K: " + k_final + ")";

  if (le > 0) {
    if (le > lmpAplicable) {
      document.getElementById("calculoruido").innerText = "MOLESTO: EL LE (" + le + " dB) SUPERA EL LÍMITE PERMITIDO (" + lmpAplicable.toFixed(1) + " dB)";
      document.getElementById("calculoruido").style.color = "red";
    } else {
      document.getElementById("calculoruido").innerText = "NO MOLESTO: EL LE (" + le + " dB) NO SUPERA EL LÍMITE PERMITIDO (" + lmpAplicable.toFixed(1) + " dB)";
      document.getElementById("calculoruido").style.color = "green";
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