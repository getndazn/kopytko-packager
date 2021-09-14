const interceptTelnet = require('../src/telnet/intercept-telnet');
const validateArgs = require('../src/env/validate-args');
const StepRunner = require('../src/step-runner/step-runner');
const BuildStep = require('../src/step-runner/steps/build/build-step');
const buildStepConfig = require('../src/step-runner/steps/build/build-step-config');
const DeployStep = require('../src/step-runner/steps/deploy/deploy-step');
const deployStepConfig = require('../src/step-runner/steps/deploy/deploy-step-config');
const RekeyDeviceStep = require('../src/step-runner/steps/rekey-device/rekey-device-step');
const rekeyDeviceStepConfig = require('../src/step-runner/steps/rekey-device/rekey-device-step-config');
const GeneratePackageStep = require('../src/step-runner/steps/generate-package/generate-package-step');
const generatePackageStepConfig = require('../src/step-runner/steps/generate-package/generate-package-step-config');

(async () => {
  const { rokuIP, telnet: launchTelnet } = await validateArgs();

  await new StepRunner([
    { step: RekeyDeviceStep, config: rekeyDeviceStepConfig },
    { step: BuildStep, config: buildStepConfig },
    { step: DeployStep, config: deployStepConfig },
    { step: GeneratePackageStep, config: generatePackageStepConfig },
  ], launchTelnet).run();

  if (launchTelnet) {
    interceptTelnet(rokuIP);
  }
})();
