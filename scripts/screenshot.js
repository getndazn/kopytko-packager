const StepRunner = require('../src/step-runner/step-runner');
const ScreenshotStep = require('../src/step-runner/steps/screenshot/screenshot-step');
const screenshotStepConfig = require('../src/step-runner/steps/screenshot/screenshot-step-config');

new StepRunner([
  { step: ScreenshotStep, config: screenshotStepConfig },
]).run();
