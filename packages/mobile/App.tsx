import React, { useState } from 'react';
import type { ReactElement } from 'react';
import LandingScreen from './src/screens/LandingScreen';
import OnboardingContainer from './src/screens/OnboardingContainer';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import MainAppScreen from './src/screens/MainAppScreen';

type Screen = 'landing' | 'onboarding' | 'signin' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'verify-reset-email' | 'edit-profile' | 'main-app';

type UserData = {
  name: string;
  email: string;
};

export default function App(): ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });

  const navigateToOnboarding = (): void => {
    console.log('Navigating to onboarding screen...');
    setCurrentScreen('onboarding');
  };

  const navigateToLanding = (): void => {
    setCurrentScreen('landing');
  };

  const navigateToSignIn = (): void => {
    console.log('Navigating to sign in screen...');
    setCurrentScreen('signin');
  };

  const navigateToSignUp = (): void => {
    console.log('Navigating to sign up screen...');
    setCurrentScreen('signup');
  };

  const navigateToVerifyEmail = (): void => {
    console.log('Navigating to verify email screen...');
    setCurrentScreen('verify-email');
  };

  const navigateToForgotPassword = (): void => {
    console.log('Navigating to forgot password screen...');
    setCurrentScreen('forgot-password');
  };

  const navigateToVerifyResetEmail = (): void => {
    console.log('Navigating to verify reset email screen...');
    setCurrentScreen('verify-reset-email');
  };

  const navigateToResetPassword = (): void => {
    console.log('Navigating to reset password screen...');
    setCurrentScreen('reset-password');
  };

  const navigateToEditProfile = (name: string, email: string): void => {
    console.log('Navigating to edit profile screen...');
    setUserData({ name, email });
    setCurrentScreen('edit-profile');
  };

  switch (currentScreen) {
    case 'signin':
      return (
        <SignInScreen 
          onBack={navigateToLanding}
          onSignIn={() => {
            console.log('Sign in successful');
            // Placeholder cho main app
          }}
          onCreateAccount={navigateToSignUp}
          onForgotPassword={navigateToForgotPassword}
          onGoogleSignIn={() => {
            console.log('Google sign in');
          }}
          onFacebookSignIn={() => {
            console.log('Facebook sign in');
          }}
        />
      );
    case 'signup':
      return (
        <SignUpScreen 
          onBack={navigateToSignIn}
          onSignUp={(name: string, email: string) => {
            setUserData({ name, email });
            navigateToVerifyEmail();
          }}
          onSignIn={navigateToSignIn}
          onGoogleSignUp={() => {
            console.log('Google sign up');
          }}
          onFacebookSignUp={() => {
            console.log('Facebook sign up');
          }}
        />
      );
    case 'verify-email':
      return (
        <VerifyEmailScreen 
          onBack={navigateToSignUp}
          onVerifySuccess={() => {
            console.log('Email verification successful');
            navigateToEditProfile(userData.name, userData.email);
          }}
          onResendCode={() => {
            console.log('Resend verification code');
          }}
          email={userData.email || "user@example.com"}
        />
      );
    case 'forgot-password':
      return (
        <ForgotPasswordScreen 
          onBack={navigateToSignIn}
          onSendSuccess={(email) => {
            console.log('Reset password link sent to:', email);
            navigateToVerifyResetEmail();
          }}
        />
      );
    case 'verify-reset-email':
      return (
        <VerifyEmailScreen 
          onBack={navigateToForgotPassword}
          onVerifySuccess={navigateToResetPassword}
          onResendCode={() => {
            console.log('Resend reset verification code');
          }}
          email="user@example.com"
        />
      );
    case 'reset-password':
      return (
        <ResetPasswordScreen 
          onBack={navigateToVerifyResetEmail}
          onResetSuccess={() => {
            console.log('Password reset successful');
            navigateToSignIn();
          }}
        />
      );
    case 'onboarding':
      return (
        <OnboardingContainer 
          onSkip={navigateToSignIn}
          onComplete={navigateToSignIn}
        />
      );
    case 'edit-profile':
      return (
        <EditProfileScreen 
          onBack={() => navigateToVerifyEmail()}
          onProfileComplete={() => {
            console.log('Profile setup complete');
            setCurrentScreen('main-app');
          }}
          initialName={userData.name}
          initialEmail={userData.email}
        />
      );
    case 'main-app':
      return (
        <MainAppScreen 
          onLogout={navigateToLanding}
        />
      );
    case 'landing':
    default:
      return <LandingScreen onLogoPress={navigateToOnboarding} />;
  }
}
