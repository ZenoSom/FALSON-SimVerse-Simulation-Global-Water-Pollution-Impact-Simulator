import React from 'react';
import Layout from './components/Layout/Layout';
import GlobeContainer from './components/Globe/GlobeContainer';
import ControlPanel from './components/Controls/ControlPanel';
import AnalyticsPanel from './components/Analytics/AnalyticsPanel';
import TeamFooter from './components/UI/TeamFooter';
import { SimulationProvider } from './context/SimulationContext';

function App() {
  return (
    <SimulationProvider>
      <Layout
        leftPanel={<ControlPanel />}
        rightPanel={<AnalyticsPanel />}
        mainContent={<GlobeContainer />}
        footer={<TeamFooter />}
      />
    </SimulationProvider>
  );
}

export default App;
