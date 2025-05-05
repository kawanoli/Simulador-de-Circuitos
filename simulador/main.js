let componentes = [];
let tipoSelecionado = null;
let componenteSelecionado = null;
let offsetX, offsetY;
let terminalSelecionado = null;
let fios = [];
let circuitoLigado = false;
let fiosAtivos = [];
let imgLixeira;
let lixeiraX = 20, lixeiraY = 20, lixeiraTamanho = 50;

function preload() {
  imgLixeira = loadImage("images/lixeira.png");
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(255);

  // Desenhar componentes
  for (let c of componentes) {
    desenharComponente(c);
  }

  // Desenhar fios entre os terminais conectados
  desenharFios();

  // Desenhar botões
  desenharMenuInferior();
  mostrarBotaoLiga();
  
  // Desenhar a lixeira
  image(imgLixeira, lixeiraX, lixeiraY, lixeiraTamanho, lixeiraTamanho);
}

function desenharMenuInferior() {
  fill(200);
  rect(0, height - 50, width, 50);
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Adicionar:", 10, height - 25);
  desenharBotao("Bateria", 100, height - 40, "bateria");
  desenharBotao("Resistor", 200, height - 40, "resistor");
  desenharBotao("Lâmpada", 300, height - 40, "lampada");
}

function desenharBotao(label, x, y, tipo) {
  fill(tipoSelecionado === tipo ? 'lightblue' : 'white');
  stroke(0);
  rect(x, y, 80, 30);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + 40, y + 15);
}

function mostrarBotaoLiga() {
  fill(circuitoLigado ? 'green' : 'red');
  rect(width - 120, 20, 100, 30);
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(circuitoLigado ? "Desligar" : "Ligar", width - 70, 35);
}

function desenharComponente(comp) {
  let x = comp.x;
  let y = comp.y;

  fill(0);
  textAlign(CENTER);
  text(comp.tipo.toUpperCase(), x + 25, y - 10);

  if (comp.tipo === 'bateria') {
    fill(150);
    rect(x, y, 50, 80);
  } else if (comp.tipo === 'resistor') {
    fill(200, 100, 0);
    rect(x, y + 20, 60, 20);
  } else if (comp.tipo === 'lampada') {
    fill(100);
    ellipse(x + 30, y + 30, 40);
  }

  // Terminais redondos
  fill(0);
  noStroke();
  ellipse(x - 20, y + 40, 10);     // terminal esquerdo
  ellipse(x + 80, y + 40, 10);     // terminal direito
}

function desenharFios() {
  for (let i = 0; i < fios.length; i++) {
    let fio = fios[i];
    let t1 = getTerminalCoords(fio[0]);
    let t2 = getTerminalCoords(fio[1]);

    if (circuitoLigado && fiosAtivos.includes(i)) {
      stroke('yellow');
    } else {
      stroke(0);
    }

    strokeWeight(2);
    line(t1.x, t1.y, t2.x, t2.y);
  }

  noStroke();
}

function getTerminalCoords(terminal) {
  let c = terminal.componente;
  let y = c.y + 40;
  let x = terminal.lado === 'esquerdo' ? c.x - 20 : c.x + 80;
  return { x, y };
}

function mousePressed() {
  // Clique no botão liga/desliga
  if (mouseX >= width - 120 && mouseX <= width - 20 && mouseY >= 20 && mouseY <= 50) {
    circuitoLigado = !circuitoLigado;
    if (circuitoLigado) {
      atualizarFiosAtivos();
    } else {
      fiosAtivos = [];
    }
    return;
  }

  // Clique com o botão direito para remover fios
  if (mouseButton === RIGHT) {
    for (let i = fios.length - 1; i >= 0; i--) {
      let t1 = getTerminalCoords(fios[i][0]);
      let t2 = getTerminalCoords(fios[i][1]);
      if (pontoProximoDaLinha(mouseX, mouseY, t1.x, t1.y, t2.x, t2.y, 5)) {
        fios.splice(i, 1);
        return;
      }
    }
    return;
  }

  // Clique nos botões de adicionar
  if (mouseY > height - 50) {
    if (mouseX >= 100 && mouseX <= 180) tipoSelecionado = "bateria";
    else if (mouseX >= 200 && mouseX <= 280) tipoSelecionado = "resistor";
    else if (mouseX >= 300 && mouseX <= 380) tipoSelecionado = "lampada";
    return;
  }

  // Adicionar novo componente
  if (tipoSelecionado !== null) {
    componentes.push({ tipo: tipoSelecionado, x: mouseX, y: mouseY });
    tipoSelecionado = null;
    return;
  }

  // Verificar clique em terminais para conexão
  for (let comp of componentes) {
    let esquerdo = { x: comp.x - 20, y: comp.y + 40 };
    let direito = { x: comp.x + 80, y: comp.y + 40 };

    if (dist(mouseX, mouseY, esquerdo.x, esquerdo.y) < 10) {
      registrarCliqueTerminal({ componente: comp, lado: 'esquerdo' });
      return;
    } else if (dist(mouseX, mouseY, direito.x, direito.y) < 10) {
      registrarCliqueTerminal({ componente: comp, lado: 'direito' });
      return;
    }
  }

  // Verificar clique em componente para arrastar
  for (let c of componentes) {
    if (dist(mouseX, mouseY, c.x + 30, c.y + 30) < 40) {
      componenteSelecionado = c;
      offsetX = mouseX - c.x;
      offsetY = mouseY - c.y;
      return;
    }
  }
}

function registrarCliqueTerminal(terminal) {
  if (terminalSelecionado === null) {
    terminalSelecionado = terminal;
  } else {
    if (
      terminal.componente !== terminalSelecionado.componente ||
      terminal.lado !== terminalSelecionado.lado
    ) {
      fios.push([terminalSelecionado, terminal]);
    }
    terminalSelecionado = null;
  }
}

function mouseDragged() {
  if (componenteSelecionado) {
    componenteSelecionado.x = mouseX - offsetX;
    componenteSelecionado.y = mouseY - offsetY;
  }
}

function mouseReleased() {
  if (componenteSelecionado) {
    // Verifica se foi solto sobre a lixeira
    if (
      componenteSelecionado.x < lixeiraX + lixeiraTamanho &&
      componenteSelecionado.x + 60 > lixeiraX && // largura média dos componentes
      componenteSelecionado.y < lixeiraY + lixeiraTamanho &&
      componenteSelecionado.y + 60 > lixeiraY
    ) {
      // Remove o componente
      let idx = componentes.indexOf(componenteSelecionado);
      if (idx !== -1) {
        componentes.splice(idx, 1);
      }

      // Remove fios conectados a ele
      fios = fios.filter(fio => {
        return (
          fio[0].componente !== componenteSelecionado &&
          fio[1].componente !== componenteSelecionado
        );
      });
    }
  }

  // Ao final de tudo, reesvazia o componente selecionado
  componenteSelecionado = null;
}

function pontoProximoDaLinha(px, py, x1, y1, x2, y2, threshold) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let len = dx * dx + dy * dy;
  if (len === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len;
  t = constrain(t, 0, 1);
  let closestX = x1 + t * dx;
  let closestY = y1 + t * dy;
  return dist(px, py, closestX, closestY) < threshold;
}

function atualizarFiosAtivos() {
  fiosAtivos = [];
  let terminalEnergizado = new Set();

  // Inicializa com terminais das baterias
  for (let comp of componentes) {
    if (comp.tipo === 'bateria') {
      terminalEnergizado.add(getChaveTerminal(comp, 'esquerdo'));
      terminalEnergizado.add(getChaveTerminal(comp, 'direito'));
    }
  }

  let mudou = true;
  while (mudou) {
    mudou = false;

    for (let i = 0; i < fios.length; i++) {
      let [t1, t2] = fios[i];
      let chave1 = getChaveTerminal(t1.componente, t1.lado);
      let chave2 = getChaveTerminal(t2.componente, t2.lado);

      const t1Ativo = terminalEnergizado.has(chave1);
      const t2Ativo = terminalEnergizado.has(chave2);

      if ((t1Ativo || t2Ativo) && !fiosAtivos.includes(i)) {
        fiosAtivos.push(i);
        mudou = true;
      }

      // Propaga energia para o outro terminal do mesmo componente
      if (t1Ativo && !terminalEnergizado.has(chave2)) {
        terminalEnergizado.add(chave2);
        mudou = true;
      }
      if (t2Ativo && !terminalEnergizado.has(chave1)) {
        terminalEnergizado.add(chave1);
        mudou = true;
      }

      // Propaga através do componente: se um terminal está energizado, energiza o outro
      let comp1 = t1.componente;
      let comp2 = t2.componente;

      ['esquerdo', 'direito'].forEach(lado => {
        let oposto = lado === 'esquerdo' ? 'direito' : 'esquerdo';

        let chaveA = getChaveTerminal(comp1, lado);
        let chaveB = getChaveTerminal(comp1, oposto);

        if (terminalEnergizado.has(chaveA) && !terminalEnergizado.has(chaveB)) {
          terminalEnergizado.add(chaveB);
          mudou = true;
        }

        let chaveC = getChaveTerminal(comp2, lado);
        let chaveD = getChaveTerminal(comp2, oposto);

        if (terminalEnergizado.has(chaveC) && !terminalEnergizado.has(chaveD)) {
          terminalEnergizado.add(chaveD);
          mudou = true;
        }
      });
    }
  }
}

function getChaveTerminal(comp, lado) {
  return componentes.indexOf(comp) + '-' + lado;
}


function propagarCorrente(terminal, visitados) {
  let chave = terminal.componente + '-' + terminal.lado;
  if (visitados.has(chave)) return;
  visitados.add(chave);

  // Verifica todos os fios conectados a esse terminal
  for (let i = 0; i < fios.length; i++) {
    let [t1, t2] = fios[i];

    if (terminaisIguais(t1, terminal)) {
      if (!fiosAtivos.includes(i)) {
        fiosAtivos.push(i);
      }
      // Propaga a corrente para o outro terminal conectado a este fio
      let outro = t2;
      propagarCorrente(outro, visitados);
    } else if (terminaisIguais(t2, terminal)) {
      if (!fiosAtivos.includes(i)) {
        fiosAtivos.push(i);
      }
      // Propaga a corrente para o outro terminal conectado a este fio
      let outro = t1;
      propagarCorrente(outro, visitados);
    }
  }

  // Agora permite a corrente passar pelo componente: entra por um lado, sai pelo outro
  let outroLado = terminal.lado === 'esquerdo' ? 'direito' : 'esquerdo';
  let outroTerminal = { componente: terminal.componente, lado: outroLado };
  propagarCorrente(outroTerminal, visitados);
}




function terminaisIguais(t1, t2) {
  return t1.componente === t2.componente && t1.lado === t2.lado;
}
