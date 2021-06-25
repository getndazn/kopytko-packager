const BuildStep = require('../src/step-runner/steps/build/build-step');
const buildStepConfig = require('../src/step-runner/steps/build/build-step-config');
const ExtractArchiveStep = require('../src/step-runner/steps/extract-archive/extract-archive-step');
const extractArchiveStepConfig = require('../src/step-runner/steps/extract-archive/extract-archive-step-config');
const StepRunner = require('../src/step-runner/step-runner');

(async () => {
  await new StepRunner([
    { step: BuildStep, config: buildStepConfig },
    { step: ExtractArchiveStep, config: extractArchiveStepConfig },
  ]).run();
})();
