import React, { useState } from 'react';
import type { ReactElement } from 'react';
import LandingScreen from './src/screens/LandingScreen';
import OnboardingContainer from './src/screens/OnboardingContainer';

type Screen = 'landing' | 'onboarding';

export default function App(): ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

  const navigateToOnboarding = (): void => {
    console.log('Navigating to onboarding screen...');
    setCurrentScreen('onboarding');
  };

  const navigateToLanding = (): void => {
    setCurrentScreen('landing');
  };

  switch (currentScreen) {
    case 'onboarding':
      return (
        <OnboardingContainer 
          onSkip={navigateToLanding}
          onComplete={() => {
            // Placeholder cho màn hình tiếp theo
            console.log('Navigate to main app');
          }}
        />
      );
    case 'landing':
    default:
      return <LandingScreen onLogoPress={navigateToOnboarding} />;
  }
}
