import { prisma } from '../libs/prisma.js';
import { loadEnv } from '../config/env.js';
import { signAccessToken, signRefreshToken } from './jwt.service.js';
import type { TokenPayload } from '@healthcare/shared/types';

const env = loadEnv();

// Social login provider types
export type SocialProvider = 'GOOGLE' | 'FACEBOOK';

// Social user profile interface
export interface SocialUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: SocialProvider;
}

// Google OAuth configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: env.GOOGLE_CLIENT_ID || '',
  clientSecret: env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  scope: ['email', 'profile'],
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

// Facebook OAuth configuration
export const FACEBOOK_OAUTH_CONFIG = {
  clientId: env.FACEBOOK_CLIENT_ID || '',
  clientSecret: env.FACEBOOK_CLIENT_SECRET || '',
  redirectUri: env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback',
  scope: ['email', 'public_profile'],
  authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
  userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture'
};

// Generate OAuth authorization URL
export function generateOAuthUrl(provider: SocialProvider, state?: string): string {
  const config = provider === 'GOOGLE' ? GOOGLE_OAUTH_CONFIG : FACEBOOK_OAUTH_CONFIG;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope.join(' '),
    response_type: 'code',
    ...(state && { state })
  });

  return `${config.authUrl}?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(provider: SocialProvider, code: string): Promise<string> {
  const config = provider === 'GOOGLE' ? GOOGLE_OAUTH_CONFIG : FACEBOOK_OAUTH_CONFIG;
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Get user profile from social provider
export async function getSocialUserProfile(provider: SocialProvider, accessToken: string): Promise<SocialUserProfile> {
  const config = provider === 'GOOGLE' ? GOOGLE_OAUTH_CONFIG : FACEBOOK_OAUTH_CONFIG;
  
  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (provider === 'GOOGLE') {
    return {
      id: data.id,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
      avatar: data.picture,
      provider: 'GOOGLE'
    };
  } else {
    // Facebook
    const [firstName, ...lastNameParts] = (data.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    return {
      id: data.id,
      email: data.email,
      firstName: firstName || '',
      lastName: lastName,
      avatar: data.picture?.data?.url,
      provider: 'FACEBOOK'
    };
  }
}

// Handle social login authentication
export async function handleSocialLogin(profile: SocialUserProfile): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
}> {
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { patient: true, doctor: true }
  });

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        passwordHash: '', // No password for social login
        role: 'PATIENT', // Default role
        isVerified: true, // Social accounts are pre-verified
        isActive: true,
        // Create patient profile
        patient: {
          create: {}
        }
      },
      include: { patient: true, doctor: true }
    });
  } else {
    // Update existing user's social info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar,
        isVerified: true,
        isActive: true
      },
      include: { patient: true, doctor: true }
    });
  }

  // Generate tokens
  const payload: TokenPayload = {
    sub: user.id as unknown as TokenPayload['sub'],
    email: user.email,
    role: user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user
  };
}

// Validate OAuth state parameter
export function validateOAuthState(state: string, expectedState: string): boolean {
  return state === expectedState;
}

// Generate secure state parameter
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
