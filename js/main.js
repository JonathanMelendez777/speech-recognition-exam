google.charts.load('current', {'packages':['line']});
const texts = document.querySelector(".texts");
let compatible = document.getElementById("compatible");
let potencia = document.getElementById("potencia");
let valor1 = document.getElementById("valor1");
let gramatica = ['POTENCIA', 0, 100];



window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition; //El webkit es una serie de compilaciones para compatibilidad con diferentes navegadores

const recognition = new webkitSpeechRecognition();
recognition.interimResults = true; //Se reconoce lo que el usuario dice
recognition.lang = "es-MX"; //El lenguaje que detectará es el español de México 



window.onload=(event)=>{
    if(validateSpeechRecognition()){
        compatible.innerHTML="El navegador es compatible con Speech Recognition API";
        recognition.start(); //Incia el reconocimiento de voz
    }else{
        compatible.innerHTML="El navegador NO es compatible con Speech Recognition API";
    }
}

recognition.onresult = (e)=>  {
  let text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  text = text.toUpperCase();
  //console.log(text);
  
  let arrayText = text.split(" ");
  let segundoValor = parseInt(arrayText[1], 10);

  //console.log(segundoValor);
  //console.log(arrayText);
  if (e.results[0].isFinal) {
    if (validaGramatica(arrayText[0],segundoValor,gramatica[0],gramatica[1],gramatica[2])) {
      texts.innerText = "Potencia: " + segundoValor;
      potencia.value = segundoValor;
      let dataString = "status=" + segundoValor;
        e.preventDefault();
        $.ajax
          ({
            type: "GET",
            url: "https://ihc-japh.000webhostapp.com/backend/setStatus.php",
            data: dataString,
            success: function (res) {
              console.log(res);
            }
          });
    }
  }
};

/*recognition.addEventListener("end", () => {
  recognition.start(); //Reincia el reconocimiento de voz cada que escucha algo
});*/

// run when the speech recognition service has disconnected
// (automatically or forced with recognition.stop())
recognition.onend = ()=> {
    //console.log('Speech recognition service disconnected');
    recognition.start(); //Reincia el reconocimiento de voz cada que escucha algo
};

// will run when the speech recognition 
// service has began listening to incoming audio 
recognition.onstart = ()=> {
    console.log('Speech recognition service has started');
};




function validateSpeechRecognition(){
    if (!('webkitSpeechRecognition' in window) || 
    !window.hasOwnProperty("webkitSpeechRecognition") ||
    typeof(webkitSpeechRecognition) != "function") {
        return false;
    }else{
        return true;
    }
    
}

function validaGramatica(palabra1, palabra2, gramatica1, gramatica2, gramatica3){
  if (palabra1 == gramatica1 && Number.isInteger(palabra2) && palabra2 >= gramatica2 && palabra2 <= gramatica3) {
    return true;
  }
  else{
    return false;
  }
}

let poten = document.getElementById('potencia');

let msjRango = document.getElementById('msjPotencia');


poten.addEventListener('change', function (e) {
  let dataString = "status=" + (poten.value);
  e.preventDefault();

  $.ajax
    ({
      type: "GET",
      url: "https://ihc-japh.000webhostapp.com/backend/setStatus.php",
      data: dataString,
      success: function (res) {
        console.log(res);
        msjPotencia.innerHTML = res;
      }
    });
});

$('document').ready(()=>{
  setInterval(() => {
    $.ajax
        ({
            type: "GET",
            url: "https://ihc-japh.000webhostapp.com/backend/getStatus.php",
            success: function(res2) {
              let datosGrafica = JSON.parse(res2);
              google.charts.setOnLoadCallback(graficar(datosGrafica));
              tabla();
            }
        });
  }, 1000);
});


function graficar(datos) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'ID');
    data.addColumn('number', 'Status');

    data.addRows(datos.grafica);

    var options = {
      
      chart: {
        title: 'Registro de potencias'
      },
      width: 500,
      height: 500,
      axes: {
        x: {
          0: {side: 'top'}
        }
      }
    };

    var chart = new google.charts.Line(document.getElementById('grafica'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

function tabla(){
  $('#table').DataTable( {
    "ajax":{
        url: "https://ihc-japh.000webhostapp.com/backend/getStatus.php",
    },
      "columns": [
          { "data": 'id' },
          { "data": 'status' },
          { "data": 'fecha' }
      ],
      "bDestroy": true
  } );
}


