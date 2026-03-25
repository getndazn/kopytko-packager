const net = require('net');
const term = require('terminal-kit').terminal;

const CONNECTION_PORT = 8085;
const CONNECTION_TIMEOUT = 5000;
const IDLE_PROMPT = 'Brightscript Debugger> ';
const START_MESSAGE = '------ Compiling dev';

let printOutput = false;

module.exports = async function telnet(rokuIP) {
  term.on('key', name => {
    if (name === 'CTRL_C') {
      term('\n');
      process.exit();
    }
  });

  term('→ Intercepting telnet output\n');

  const socket = net.createConnection({ host: rokuIP, port: CONNECTION_PORT });

  socket.setTimeout(CONNECTION_TIMEOUT);

  socket.on('timeout', () => {
    if (!socket.connecting) return;

    term.red('Connection timeout\n');
    socket.destroy();
  });

  socket.on('error', (error) => {
    term.red(`  Telnet error: ${error.message}\n`);
  });

  socket.on('close', () => term.red('  Connection closed\n'));

  socket.on('connect', () => {
    socket.setTimeout(0); // disable timeout once connected — session is interactive
    term.green('  Connection ready\n');
  });

  // @todo filter key strings and write them in specific color
  socket.on('data', (data) => onDataReceived(data, socket));
}

function onDataReceived(data, socket) {
  let dataString = data.toString();

  if (!printOutput) {
    if (!dataString.includes(START_MESSAGE)) return;

    printOutput = true;
    term('\n\n');
    dataString = dataString.slice(dataString.lastIndexOf(START_MESSAGE));
  }

  term(dataString);

  // avoid typing in the new line in Brightscript Debugger
  if (dataString.slice(IDLE_PROMPT.length * -1) === IDLE_PROMPT) {
    initInputField(input => socket.write(input + '\r\n'));
  }
}

function initInputField(callback) {
  term.inputField(
    {},
    (_error, input) => {
      callback(input);
      term('\n');
    }
  );
}
