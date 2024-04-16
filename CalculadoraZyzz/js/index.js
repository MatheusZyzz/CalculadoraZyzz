// simular o pressionamento do botão removendo
// sombras e adicionando uma borda preta fina
function buttonPressedVisual(b) {
  $(b).css("-webkit-box-shadow", "0");
  $(b).css("-moz-box-shadow", "0");
  $(b).css("box-shadow", "initial");
  $(b).css("border", "1px solid #222");
  setTimeout(function() {
    $(b).css("-webkit-box-shadow", "0 3px 1px rgba(0,0,0,0.2),0 -2px 3px rgba(0,0,0,0.3) inset, 0 -2px 0 white inset");
    $(b).css("-moz-box-shadow", "0 3px 1px rgba(0,0,0,0.2),0 -2px 3px rgba(0,0,0,0.3) inset, 0 -2px 0 white inset");
    $(b).css("box-shadow", "0 3px 1px rgba(0,0,0,0.2),0 -2px 3px rgba(0,0,0,0.3) inset, 0 -2px 0 white inset");
    $(b).css("border", "0");
  }, 200);
}
//-----------------------------------------------
// verifique se a tecla pressionada corresponde a um
// botão da calculadora
// n -- negate; c -- clear (C); s -- sqrt; r -- 1/x
function valid(key) {
  var validKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "=", "%", "+", "-", "*", "/", "Backspace", "Delete", "Enter", "n", "N", "c", "C", "s", "S", "r", "R"];
  if (validKeys.indexOf(key) > -1) return true;
  return false;
}
//-------------------------------
function addDigit(key, strInput) {
// permita 10 dígitos antes do ponto de redução e
// 5 após o ponto de diminuição
// se mudar, certifique-se de mudar
// a próxima função (adicionando ponto decimal) também
  var b = 10; // antes da vírgula
  var a = 5; // depois da vírgula
  var str = "";
  var decPointIndex = null;
  if (strInput[0] === "-") b++;
  if (strInput.match(/\./) === null) {
    if (strInput === "0") {
      if (key !== "0") strInput = "";
      else return strInput;
    }
    if (strInput.length < b) strInput += key;
  } else {
    decPointIndex = strInput.indexOf(".");
    str = strInput.substring(decPointIndex + 1);
    if (str.length < a) strInput += key;
  }
  $("#inputScr").html(strInput);
  return strInput;
}
//-------------------------
function addDecimalPoint(strInput) {
// só tomamos medidas se a string de entrada não
// tem uma vírgula decimal
  if (strInput.match(/\./) === null) {
    var n = 11;
    if (strInput[0] === "-") n++;
    if (strInput.length < n) {
      if (strInput === "") strInput = "0";
      strInput += ".";
      $("#inputScr").html(strInput);
    }
  } // fim de -- se não houver ponto decimal
  return strInput;
}
//------------------------
// backspace
function backspc(strInput) {
  if (strInput !== "") {
    var backspaceResultsInZero = (strInput.length === 2 && strInput[0] === "-") || strInput.length === 1;
    if (backspaceResultsInZero) strInput = "0";
    else strInput = strInput.substr(0, strInput.length - 1);
    $("#inputScr").html(strInput);
  }
  return strInput;
}
//-----------------------------
// encurta a string de saída para que a última
// os dados adicionados seriam exibidos
// dados extras desde o início da string
// está perdido
function fixOut(x) {
  if (x.length > 30) {
    x = x.substring(x.length - 30);
    x = "&laquo;" + x;
  }
  return x;
}
//-------------------------------
//-------------------------
$(document).ready(function() {
  // foca a janela para que as teclas digitadas possam ser registradas sem
  // ter que clicar na tela primeiro
  window.focus();

  var strInput = ""; // número digitado
  var strOutput = ""; // mantém dados de saída para sqrt e 1/x
  var printed = ""; // dados impressos na tela de saída
  var result = 0; // resultado final calculado até o último + ou -
  var tempResult = null; // resultado após o último + ou -
  var current = 0; // mantém o valor ativo, ou seja. strInput, resultado ou tempResult
  var operation = ""; // operação ativa, pode ser qualquer operação
  var prevOp = ""; // pode estar vazio, + ou -, contém a última operação de ordem inferior usada
  var prevOpTwo = ""; // vazio, * ou /, contém a última operação de ordem superior usada
  var percentage = 0; // número de porcentagens a serem calculadas com %
  var memory = null; // memória, null se não estiver ativo
  //--------------
  // limpa endtry (CE)
  //---------------------
  function clearEntry() {
    strInput = "";
    current = 0;
    $("#inputScr").html("0");
    return;
  };
  //-----------------
  // lida com erro de ponto flutuante
  // e arredondar o número para no máximo 5 dígitos após a vírgula
  // isto é apenas para fins de exibição, os cálculos são feitos sem arredondamento
  function fix(x) {
    x = Number(x);
    x = x.toFixed(5);
    x = Number(x);
    return x;
  }
  //-------------------------
  function negate() {
    if (strInput !== "0") {
      if (strInput !== "") {
        if (strInput[0] === "-") strInput = strInput.substring(1);
        else strInput = "-" + strInput;
        $("#inputScr").html(strInput);
      } else {
        current *= -1;
        $("#inputScr").html(fix(current));
      }
    };
  };
  // ---------------
  // clear (C) - tudo menos memória
  function clear() {
    strInput = "";
    strOutput = "";
    current = 0;
    printed = "";
    result = 0;
    tempResult = null;
    operation = "";
    prevOp = "";
    prevOpTwo = "";
    percentage = 0;
    $("#outputScr").html("");
    $("#inputScr").html("0");
  }
  //-------------------
  // calcula a expressão contendo *, /, sqrt, 1/x e %
  // exemplo: em r+a/b*c*sqrt(d)+ calcula
  // o a/b*c*sqrt(d) e o adiciona ao r calculado anteriormente
  // nesse caso o resultado para a/b*c é armazenado em tempResult
  // e o valor de sqrt(d) é armazenado no atual
  function checkPrevOpTwo() {
    switch (prevOpTwo) {
      case "":
        switch (prevOp) {
          case "":
            result = current;
            break;
          case "+":
            result += current;
            break;
          case "-":
            result -= current;
            break;
        }
        break;
      case "*":
        switch (prevOp) {
          case "":
            result = tempResult * current;
            break;
          case "+":
            result += tempResult * current;
            break;
          case "-":
            result -= tempResult * current;
            break;
        }
        break;
      case "/":
        switch (prevOp) {
          case "":
            result = tempResult / current;
            break;
          case "+":
            result += tempResult / current;
            break;
          case "-":
            result -= tempResult / current;
            break;
        }
        break;
    }
  }
  // --------------
  // calcula o valor de sqrt ou 1/x em tempResult
  function checkPrevOpTwoTemp() {
    switch (prevOpTwo) {
      case "":
        tempResult = current;
        break;
      case "*":
        tempResult *= current;
        break;
      case "/":
        tempResult /= current;
        break;
    }
  }
  //---------------
  // + 
  // se não houve operações anteriores ou conjunto de entrada resultado inicial
  // dependendo das operações anteriores calcula tempResult e o resultado geral
  function add() {
    if (strInput === "" && operation === "" && current === 0) printed = "0+";
    else {
      if (strInput === "" && operation === "" && current !== 0) {
        printed = fix(current) + "+";
        result = current;
      } else {
        if (strInput !== "" && operation === "") {
          printed = strInput + "+";
          result = Number(strInput);
        } else {
          if (strInput !== "") current = Number(strInput);
          switch (operation) {
            case "+":
              printed += fix(current) + "+";
              result += current;
              break;
            case "-":
              printed += fix(current) + "+";
              result -= current;
              break;
            case "*":
              printed += fix(current) + "+";
              switch (prevOp) {
                case "":
                  result = tempResult * current;
                  break;
                case "+":
                  result += tempResult * current;
                  break;
                case "-":
                  result -= tempResult * current;
                  break;
              }
              break;
            case "/":
              if (current === 0) {
                clear();
                $("#inputScr").html("Cannot divide by zero");
                return;
              }
              printed += fix(current) + "+";
              switch (prevOp) {
                case "":
                  result = tempResult / current;
                  break;
                case "+":
                  result += tempResult / current;
                  break;
                case "-":
                  result -= tempResult / current;
                  break;
              }
              break;
            case "sqrt":
            case "1/":
              printed += strOutput + "+";
              checkPrevOpTwo();
              break;
            case "%":
              printed += fix(percentage) + "%" + fix(current) + "+";
              current = percentage * current / 100;
              checkPrevOpTwo();
              percentage = 0;
              break;
          } // fim da operação do switch
        }
      }
    }
    current = result;
    $("#outputScr").html(fixOut(printed));
    $("#inputScr").html(fix(current));
    operation = "+";
    prevOp = "+";
    prevOpTwo = "";
    tempResult = null;
    strInput = "";
    strOutput = "";
  }
  // ----------------
  // -
  // se não houve operações anteriores ou conjunto de entrada resultado inicial
  // dependendo das operações anteriores calcula tempResult e o resultado geral
  function subtract() {
    if (strInput === "" && operation === "" && current === 0) printed = "0-";
    else {
      if (strInput === "" && operation === "" && current !== 0) {
        printed = fix(current) + "-";
        result = current;
      } else {
        if (strInput !== "" && operation === "") {
          printed = strInput + "-";
          result = Number(strInput);
        } else {
          if (strInput !== "") current = Number(strInput);
          switch (operation) {
            case "+":
              printed += fix(current) + "-";
              result += current;
              break;
            case "-":
              printed += fix(current) + "-";
              result -= current;
              break;
            case "*":
              printed += fix(current) + "-";
              switch (prevOp) {
                case "":
                  result = tempResult * current;
                  break;
                case "+":
                  result += tempResult * current;
                  break;
                case "-":
                  result -= tempResult * current;
                  break;
              }
              break;
            case "/":
              if (current === 0) {
                clear();
                $("#inputScr").html("Cannot divide by zero");
                return;
              }
              printed += fix(current) + "-";
              switch (prevOp) {
                case "":
                  result = tempResult / current;
                  break;
                case "+":
                  result += tempResult / current;
                  break;
                case "-":
                  result -= tempResult / current;
                  break;
              }
              break;
            case "sqrt":
            case "1/":
              printed += strOutput + "-";
              checkPrevOpTwo();
              break;
            case "%":
              printed += fix(percentage) + "%" + fix(current) + "-";
              current = percentage * current / 100;
              checkPrevOpTwo();
              percentage = 0;
              break;
          } // fim da operação do switch
        }
      }
    }
    current = result;
    $("#outputScr").html(fixOut(printed));
    $("#inputScr").html(fix(current));
    operation = "-";
    prevOp = "-";
    prevOpTwo = "";
    tempResult = null;
    strInput = "";
    strOutput = "";
  }
  //----------------
  // Entra,  =
  // calcula o resultado final
  function calculate() {
    if (strInput === "" && operation === "" && current !== "") return;
    if (strInput !== "" && operation === "") {
      printed = strInput + "=";
      result = Number(strInput);
    } else {
      if (strInput !== "") current = Number(strInput);
      switch (operation) {
        case "+":
          printed += fix(current) + "=";
          result += current;
          break;
        case "-":
          printed += fix(current) + "=";
          result -= current;
          break;
        case "*":
          printed += fix(current) + "="
          switch (prevOp) {
            case "":
              result = tempResult * current;
              break;
            case "+":
              result += tempResult * current;
              break;
            case "-":
              result -= tempResult * current;
              break;
          }
          break;
        case "/":
          if (current === 0) {
            clear();
            $("#inputScr").html("Cannot divide by zero");
            return;
          }
          printed += fix(current) + "="
          switch (prevOp) {
            case "":
              result = tempResult / current;
              break;
            case "+":
              result += tempResult / current;
              break;
            case "-":
              result -= tempResult / current;
              break;
          }
          break;
        case "sqrt":
        case "1/":
          printed += strOutput + "=";
          checkPrevOpTwo();
          break;
        case "%":
          printed += fix(percentage) + "%" + fix(current) + "=";
          current = percentage * current / 100;
          checkPrevOpTwo();
          percentage = 0;
          break;
      } // fim da operação do switch
    }
    current = result;
    $("#outputScr").html(fixOut(printed));
    $("#inputScr").html(fix(current));
    operation = "";
    result = 0;
    prevOp = "";
    prevOpTwo = "";
    tempResult = null;
    strInput = "";
    printed = "";
  }
  //---------------
  // multiplicação *
  function multiply() {
    if (strInput === "" && operation === "" && current === 0) printed = "0*";
    else {
      if (strInput === "" && operation === "" && current !== 0) {
        printed = fix(current) + "*";
        tempResult = current;
      } else {
        if (strInput !== "" && operation === "") {
          printed = strInput + "*";
          tempResult = Number(strInput);
        } else {
          if (strInput !== "") current = Number(strInput);
          switch (operation) {
            case "+":
            case "-":
              printed += fix(current) + "*";
              tempResult = current;
              break;
            case "*":
              printed += fix(current) + "*";
              tempResult *= current;
              break;
            case "/":
              if (current === 0) {
                clear();
                $("#inputScr").html("Cannot divide by zero");
                return;
              }
              printed += fix(current) + "*";
              tempResult /= current;
              break;
            case "sqrt":
            case "1/":
              printed += strOutput + "*";
              checkPrevOpTwoTemp();
              break;
            case "%":
              printed += fix(percentage) + "%" + fix(current) + "*";
              current = percentage * current / 100;
              checkPrevOpTwoTemp();
              percentage = 0;
              break;
          } // fim da operação do switch
        }
      }
    }
    current = tempResult;
    $("#outputScr").html(fixOut(printed));
    $("#inputScr").html(fix(current));
    operation = "*";
    prevOpTwo = "*";
    strInput = "";
    strOutput = "";
  }
  //----------------
  // divisão/
  // reporta erro se o usuário tentar
  // divida por zero
  function divideBy() {

    if (strInput === "" && operation === "" && current === 0) printed = "0/";
    else {
      if (strInput === "" && operation === "" && current !== 0) {
        printed = fix(current) + "/";
        tempResult = current;
      } else {
        if (strInput !== "" && operation === "") {
          printed = strInput + "/";
          tempResult = Number(strInput);
        } else {
          if (strInput !== "") current = Number(strInput);
          switch (operation) {
            case "+":
            case "-":
              printed += fix(current) + "/";
              tempResult = current;
              break;
            case "*":
              printed += fix(current) + "/";
              tempResult *= current;
              break;
            case "/":
              if (current === 0) {
                clear();
                $("#inputScr").html("Cannot divide by zero");
                return;
              }
              printed += fix(current) + "/";
              tempResult /= current;
              break;
            case "sqrt":
            case "1/":
              printed += strOutput + "/";
              checkPrevOpTwoTemp();
              break;
            case "%":
              printed += fix(percentage) + "%" + fix(current) + "/";
              current = percentage * current / 100;
              checkPrevOpTwoTemp();
              percentage = 0;
              break;
          } // fim da operação do switch
        }
      }
    }
    current = tempResult;
    $("#outputScr").html(fixOut(printed));
    $("#inputScr").html(fix(current));
    operation = "/";
    prevOpTwo = "/";
    strInput = "";
    strOutput = "";
  }
  //---------------------
  // raiz quadrada
  // reporta erro se o usuário estiver tentando calcular
  // uma raiz quadrada de um número negativo
  function squareRoot() {
    if (strInput !== "") current = Number(strInput);
    if (current < 0) {
      clear();
      $("#inputScr").html("Invalid input");
      return;
    }
    if (operation === "%") {
      strOutput = "sqrt(" + fix(percentage) + "%" + fix(current) + ")";
      current = percentage * current / 100;
      current = Math.sqrt(current);
      percentage = 0;
    } else {
      strOutput = "sqrt(" + fix(current) + ")";
      current = Math.sqrt(current);
    }
    $("#outputScr").html(fixOut(printed + strOutput));
    $("#inputScr").html(fix(current));
    operation = "sqrt";
    strInput = "";
  }
  //----------------
  // calcula o recíproco de um número
  // reporta erro se o usuário tentar calcular
  // valor recíproco de zero
  function oneDividedBy() {
    if (strInput !== "") current = Number(strInput);
    if (current === 0) {
      clear();
      $("#inputScr").html("Cannot divide by zero");
      return;
    }
    if (operation === "%") {
      strOutput = "rec(" + fix(percentage) + "%" + fix(current) + ")";
      current = percentage * current / 100;
      current = 1 / current;
      percentage = 0;
    } else {
      strOutput = "rec(" + fix(current) + ")";
      current = 1 / current;
    }
    $("#outputScr").html(fixOut(printed + strOutput));
    $("#inputScr").html(fix(current));
    operation = "1/";
    strInput = "";
  }
  //----------------
  // para calcular x por cento de y
  // insira x então % então y
  // esta função lembra apenas a porcentagem (x no exemplo acima)
  // o resto é calculado após a próxima operação ser
  // inserido (ver funções anteriores)
  function percentOf() {
    if (strInput !== "") {
      current = Number(strInput);
      strInput = "";
    }
    if (operation === "%") current = percentage * current / 100;
    percentage = current;
    $("#outputScr").html(fixOut(printed + fix(percentage) + "%"));
    $("#inputScr").html(fix(current));
    operation = "%";
  }
  //----------------
  // regista uma tecla
  //----------------
  document.addEventListener("keydown", function(e) {
    event.preventDefault();
    if (valid(e.key)) {
      if (e.key >= "0" && e.key <= "9") strInput = addDigit(e.key, strInput);
      if (e.key === ".") strInput = addDecimalPoint(strInput);
      if (e.key === "Backspace") strInput = backspc(strInput);
      if (e.key === "Delete") clearEntry();
      if (e.key.toLowerCase() === "n") negate();
      if (e.key.toLowerCase() === "c") clear();
      if (e.key === "+") add();
      if (e.key === "-") subtract();
      if (e.key === "Enter") calculate();
      if (e.key === "*") multiply();
      if (e.key === "/") divideBy();
      if (e.key.toLowerCase() === "s") squareRoot();
      if (e.key.toLowerCase() === "r") oneDividedBy();
      if (e.key === "%") percentOf();
    } // fim da chave if válida
  })
  $("#buttons div").on("click", function() {
    buttonPressedVisual(this);
  })
  $("#one").on("click", function() {
    strInput = addDigit("1", strInput);
  })
  $("#two").on("click", function() {
    strInput = addDigit("2", strInput);
  })
  $("#three").on("click", function() {
    strInput = addDigit("3", strInput);
  })
  $("#four").on("click", function() {
    strInput = addDigit("4", strInput);
  })
  $("#five").on("click", function() {
    strInput = addDigit("5", strInput);
  })
  $("#six").on("click", function() {
    strInput = addDigit("6", strInput);
  })
  $("#seven").on("click", function() {
    strInput = addDigit("7", strInput);
  });
  $("#eight").on("click", function() {
    strInput = addDigit("8", strInput);
  })
  $("#nine").on("click", function() {
    strInput = addDigit("9", strInput);
  })
  $("#zero").on("click", function() {
    strInput = addDigit("0", strInput);
  })
  $("#decpoint").on("click", function() {
    strInput = addDecimalPoint(strInput);
  })
  $("#plusminus").on("click", function() {
    negate();
  })
  $("#backspace").on("click", function() {
    strInput = backspc(strInput);
  })
  $("#ce").on("click", function() {
    clearEntry();
  })
  $("#c").on("click", function() {
      clear();
    }) // fim do clique claro (c)
    // ------------------
    // salva o número na memória
  $("#ms").on("click", function() {
      if (strInput === "") {
        if (current !== 0) {
          memory = current;
          $("#displayM").html("M");
        }
      } else
      if (Number(strInput) != 0) {
        memory = Number(strInput);
        current = memory;
        strInput = "";
        $("#displayM").html("M");
      };
    }) // fim do clique em ms
    // --------------------------------
    // deleta o número da memória
  $("#mc").on("click", function() {
      $("#displayM").html("");
      memory = null;
    })
    // ----------------------
    // recupera a memória e configura-a
    // para ser o valor ativo
  $("#mr").on("click", function() {
      if (memory !== null) {
        current = memory;
        strInput = "";
        $("#inputScr").html(fix(current));
      }
    })
    //--------------
    // adiciona o valor atualmente ativo
    // para a memória existente
    // se não houver memória existente
    // procede como se a memória fosse 0
  $("#mp").on("click", function() {
      if (strInput === "") {
        if (current !== 0) {
          if (memory === null) memory = 0;
          memory += current;
          $("#displayM").html("M");
          $("#displayM").append("+");
          setTimeout(function() {
            $("#displayM").html("M");
          }, 1000);
        }
      } else
      if (Number(strInput) !== 0) {
        if (memory === null) memory = 0;
        memory += Number(strInput);
        $("#displayM").html("M");
        $("#displayM").append("+");
        setTimeout(function() {
          $("#displayM").html("M");
        }, 1000);
      };
    }) //termina se mp clicar
    //--------------
    // subtrai o valor atualmente ativo
    // da memória existente
    // se não houver memória existente
    // procede como se a memória fosse 0
  $("#mm").on("click", function() {
      if (strInput === "") {
        if (current !== 0) {
          if (memory === null) memory = 0;
          memory -= current;
          $("#displayM").html("M");
          $("#displayM").append("-");
          setTimeout(function() {
            $("#displayM").html("M");
          }, 1000);
        }
      } else
      if (Number(strInput) !== 0) {
        if (memory === null) memory = 0;
        memory -= Number(strInput);
        $("#displayM").html("M");
        $("#displayM").append("-");
        setTimeout(function() {
          $("#displayM").html("M");
        }, 1000);
      };
    }) //termina se mm clicar
    //-----------------------------------------------------
  $("#plus").on("click", function() {
      add();
    })
    //---------------------------------  
  $("#minus").on("click", function() {
      subtract();
    })
    //---------------------------------------------------  
  $("#equals").on("click", function() {
      calculate();
    })
    //--------------------------------------------
  $("#times").on("click", function() {
      multiply();
    })
    //-----------------------------------------------
  $("#divide").on("click", function() {
      divideBy();
    })
    //-----------------------------------------
  $("#sqroot").on("click", function() {
      squareRoot();
    })
    //----------------------------------------
  $("#reciprocal").on("click", function() {
      oneDividedBy();
    })
    //----------------------------------------
  $("#percent").on("click", function() {
    percentOf();
  })

}); //fim 