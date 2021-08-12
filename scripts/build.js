const validateArgs = require('../src/env/validate-args');
const StepRunner = require('../src/step-runner/step-runner');
const BuildStep = require('../src/step-runner/steps/build/build-step');
const buildStepConfig = require('../src/step-runner/steps/build/build-step-config');

(async () => {
  await validateArgs({ buildOnlyMode: true });

  await new StepRunner([
    { step: BuildStep, config: buildStepConfig },
  ]).run();
})();
