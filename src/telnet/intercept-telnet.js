const Telnet = require('telnet-client');
const term = require('terminal-kit').terminal;

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

  const connection = new Telnet()
  const params = {
    host: rokuIP,
    port: 8085,
    shellPrompt: '',
    timeout: 5000,
  }

  term('→ Intercepting telnet output\n');

  connection.on('timeout', () => {
    if (connection.connecting) {
      term.red('Connection timeout\n');
      connection.end();
    }
  });
  connection.on('close', () => term.red('  Connection closed\n'));

  try {
    await connection.connect(params);
  } catch (error) {
    term.red(`  Telnet error: ${error}`);

    throw error;
  }

  term.green('  Connection ready\n')

  connection.shell((_, stream) => {
    stream.on('data', data => onDataReceived(data, stream));
  });
}

// @todo filter key strings and write them in specific color
function onDataReceived(data, stream) {
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
    initInputField(input => stream.write(input + '\r\n'));
  }
}

function initInputField(callback) {
  term.inputField(
    {},
    (_, input) => {
      callback(input);
      term('\n');
    }
  );
}
