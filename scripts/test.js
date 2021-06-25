const StepRunner = require('../src/step-runner/step-runner');
const validateArgs = require('../src/env/validate-args');
const BuildStep = require('../src/step-runner/steps/build/build-step');
const buildStepConfig = require('../src/step-runner/steps/build/build-step-config');
const DeployStep = require('../src/step-runner/steps/deploy/deploy-step');
const deployStepConfig = require('../src/step-runner/steps/deploy/deploy-step-config');
const VerifyTestsResultStep = require('../src/step-runner/steps/verify-tests-result/verify-tests-result-step');
const verifyTestsResultStepConfig = require('../src/step-runner/steps/verify-tests-result/verify-tests-result-step-config');

(async () => {
  await validateArgs();

  await new StepRunner([
    { step: BuildStep, config: buildStepConfig },
    { step: DeployStep, config: deployStepConfig },
    { step: VerifyTestsResultStep, config: verifyTestsResultStepConfig },
  ]).run();
})();
