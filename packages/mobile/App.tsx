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
import HomeScreen from './src/screens/HomeScreen';
import LocationScreen from './src/screens/LocationScreen';
import FindDoctorsScreen from './src/screens/FindDoctorsScreen';
import DoctorDetailsScreen from './src/screens/DoctorDetailsScreen';
import SelectTimeScreen from './src/screens/SelectTimeScreen';
import ManageAppointmentScreen from './src/screens/ManageAppointmentScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Screen = 'landing' | 'onboarding' | 'signin' | 'signup' | 'verify-email' | 'forgot-password' | 'reset-password' | 'verify-reset-email' | 'edit-profile' | 'main-app' | 'location' | 'find-doctors' | 'doctor-details' | 'select-time' | 'manage-appointments' | 'profile';

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

  const navigateToLocation = (): void => {
    console.log('Navigating to location screen...');
    setCurrentScreen('location');
  };

  const navigateToFindDoctors = (): void => {
    console.log('Navigating to find doctors screen...');
    setCurrentScreen('find-doctors');
  };

  const navigateToDoctorDetails = (doctorId: string): void => {
    console.log('Navigating to doctor details screen for doctor:', doctorId);
    setCurrentScreen('doctor-details');
  };

  const navigateToSelectTime = (): void => {
    console.log('Navigating to select time screen...');
    setCurrentScreen('select-time');
  };

  const navigateToManageAppointments = (): void => {
    console.log('Navigating to manage appointments screen...');
    setCurrentScreen('manage-appointments');
  };

  const navigateToMainApp = (): void => {
    console.log('Navigating to main app...');
    setCurrentScreen('main-app');
  };

  const navigateToProfile = (): void => {
    console.log('Navigating to profile screen...');
    setCurrentScreen('profile');
  };

  switch (currentScreen) {
    case 'signin':
      return (
        <SignInScreen 
          onBack={navigateToLanding}
          onSignIn={() => {
            console.log('Sign in successful');
            setCurrentScreen('main-app');
          }}
          onCreateAccount={navigateToSignUp}
          onForgotPassword={navigateToForgotPassword}
          onGoogleSignIn={() => {
            console.log('Google sign in');
            setCurrentScreen('main-app');
          }}
          onFacebookSignIn={() => {
            console.log('Facebook sign in');
            setCurrentScreen('main-app');
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
        <HomeScreen 
          onLogout={navigateToLanding}
          onNavigateLocation={navigateToLocation}
          onNavigateFindDoctors={navigateToFindDoctors}
          onNavigateAppointments={navigateToManageAppointments}
          onNavigateProfile={navigateToProfile}
        />
      );
    case 'location':
      return (
        <LocationScreen 
          onNavigateHome={navigateToMainApp}
          onNavigateAppointment={navigateToManageAppointments}
          onNavigateProfile={navigateToProfile}
        />
      );
    case 'find-doctors':
      return (
        <FindDoctorsScreen 
          onBack={navigateToMainApp}
          onDoctorPress={navigateToDoctorDetails}
        />
      );
    case 'doctor-details':
      return (
        <DoctorDetailsScreen 
          onBack={navigateToFindDoctors}
          onBookAppointment={navigateToSelectTime}
        />
      );
    case 'select-time':
      return (
        <SelectTimeScreen 
          onBack={() => navigateToDoctorDetails('1')}
          onConfirm={(date, startTime, endTime) => {
            console.log('Appointment confirmed for:', date, startTime, '-', endTime);
            // TODO: Navigate to confirmation screen
          }}
          onNavigateToMyBookings={navigateToManageAppointments}
        />
      );
    case 'manage-appointments':
      return (
        <ManageAppointmentScreen 
          onNavigateHome={navigateToMainApp}
          onNavigateLocation={navigateToLocation}
          onNavigateProfile={navigateToProfile}
        />
      );
    case 'profile':
      return (
        <ProfileScreen 
          onNavigateHome={navigateToMainApp}
          onNavigateLocation={navigateToLocation}
          onNavigateAppointments={navigateToManageAppointments}
          onNavigateEditProfile={() => console.log('Navigate to edit profile')}
          onNavigateFavorites={() => console.log('Navigate to favorites')}
          onNavigateNotifications={() => console.log('Navigate to notifications')}
          onNavigateSettings={() => console.log('Navigate to settings')}
          onNavigateHelp={() => console.log('Navigate to help')}
          onNavigateTerms={() => console.log('Navigate to terms')}
          onLogout={navigateToLanding}
        />
      );
    case 'landing':
    default:
      return <LandingScreen onLogoPress={navigateToOnboarding} />;
  }
}
