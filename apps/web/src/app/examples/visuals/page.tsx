'use client';

import Button from '@repo/ui/button';
import Tooltip from '@repo/ui/tooltip';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-4">
          <Tooltip content="Top tooltip" position="top">
            <Button variant="primary" size="md">Top</Button>
          </Tooltip>

          <Tooltip content="Bottom tooltip" position="bottom">
            <Button variant="primary" size="md">Bottom</Button>
          </Tooltip>
        </div>

        <div className="flex space-x-4">
          <Tooltip content="Left tooltip" position="left">
            <Button variant="primary" size="md">Left</Button>
          </Tooltip>

          <Tooltip content="Right tooltip" position="right">
            <Button variant="primary" size="md">Right</Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default App;
