const interceptTelnet = require('../src/telnet/intercept-telnet');
const validateArgs = require('../src/env/validate-args');
const StepRunner = require('../src/step-runner/step-runner');
const BuildStep = require('../src/step-runner/steps/build/build-step');
const buildStepConfig = require('../src/step-runner/steps/build/build-step-config');
const DeployStep = require('../src/step-runner/steps/deploy/deploy-step');
const deployStepConfig = require('../src/step-runner/steps/deploy/deploy-step-config');

(async () => {
  const { rokuIP, telnet: launchTelnet } = await validateArgs();

  await new StepRunner([
    { step: BuildStep, config: buildStepConfig },
    { step: DeployStep, config: deployStepConfig },
  ], launchTelnet).run();

  if (launchTelnet) {
    interceptTelnet(rokuIP);
  }
})();
