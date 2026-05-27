import { findSandboxWallSolutions } from './sandboxSolver';

self.onmessage = (event) => {
  const { type, requestId, input } = event.data || {};
  if (type !== 'solve') return;

  try {
    const result = findSandboxWallSolutions({
      ...input,
      onProgress: (progress) => {
        self.postMessage({
          type: 'progress',
          requestId,
          progress,
        });
      },
    });

    self.postMessage({
      type: 'result',
      requestId,
      result,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      requestId,
      message:
        error && typeof error.message === 'string'
          ? error.message
          : 'Solver failed unexpectedly.',
    });
  }
};
