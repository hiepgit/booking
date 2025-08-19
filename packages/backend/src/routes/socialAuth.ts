import { Router } from 'express';
import { z } from 'zod';
import { 
  generateOAuthUrl, 
  exchangeCodeForToken, 
  getSocialUserProfile, 
  handleSocialLogin,
  validateOAuthState,
  generateOAuthState
} from '../services/socialAuth.service.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = Router();

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags:
 *       - Social Auth
 *     summary: Initiate Google OAuth login
 */
router.get('/google', authRateLimit, (req, res) => {
  try {
    const state = generateOAuthState();
    const authUrl = generateOAuthUrl('GOOGLE', state);
    
    // Store state in session or temporary storage
    // For now, we'll redirect directly
    res.redirect(authUrl);
  } catch (error) {
    res.status(500).json({ 
      error: { 
        message: 'Failed to initiate Google OAuth',
        code: 'OAUTH_INITIATION_FAILED'
      } 
    });
  }
});

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - Social Auth
 *     summary: Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        error: { 
          message: 'Authorization code is required',
          code: 'MISSING_AUTH_CODE'
        } 
      });
    }
    
    // In production, validate state parameter
    // if (!validateOAuthState(state as string, expectedState)) {
    //   return res.status(400).json({ error: { message: 'Invalid state parameter' } });
    // }
    
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken('GOOGLE', code);
    
    // Get user profile from Google
    const profile = await getSocialUserProfile('GOOGLE', accessToken);
    
    // Handle social login
    const result = await handleSocialLogin(profile);
    
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?` + 
      `accessToken=${encodeURIComponent(result.accessToken)}&` +
      `refreshToken=${encodeURIComponent(result.refreshToken)}&` +
      `provider=google`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to complete Google OAuth',
        code: 'GOOGLE_OAUTH_FAILED'
      } 
    });
  }
});

/**
 * @openapi
 * /auth/facebook:
 *   get:
 *     tags:
 *       - Social Auth
 *     summary: Initiate Facebook OAuth login
 */
router.get('/facebook', authRateLimit, (req, res) => {
  try {
    const state = generateOAuthState();
    const authUrl = generateOAuthUrl('FACEBOOK', state);
    
    // Store state in session or temporary storage
    // For now, we'll redirect directly
    res.redirect(authUrl);
  } catch (error) {
    res.status(500).json({ 
      error: { 
        message: 'Failed to initiate Facebook OAuth',
        code: 'OAUTH_INITIATION_FAILED'
      } 
    });
  }
});

/**
 * @openapi
 * /auth/facebook/callback:
 *   get:
 *     tags:
 *       - Social Auth
 *     summary: Handle Facebook OAuth callback
 */
router.get('/facebook/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        error: { 
          message: 'Authorization code is required',
          code: 'MISSING_AUTH_CODE'
        } 
      });
    }
    
    // In production, validate state parameter
    // if (!validateOAuthState(state as string, expectedState)) {
    //   return res.status(400).json({ error: { message: 'Invalid state parameter' } });
    // }
    
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken('FACEBOOK', code);
    
    // Get user profile from Facebook
    const profile = await getSocialUserProfile('FACEBOOK', accessToken);
    
    // Handle social login
    const result = await handleSocialLogin(profile);
    
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?` + 
      `accessToken=${encodeURIComponent(result.accessToken)}&` +
      `refreshToken=${encodeURIComponent(result.refreshToken)}&` +
      `provider=facebook`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    res.status(500).json({ 
      error: { 
        message: 'Failed to complete Facebook OAuth',
        code: 'FACEBOOK_OAUTH_FAILED'
      } 
    });
  }
});

/**
 * @openapi
 * /auth/social/providers:
 *   get:
 *     tags:
 *       - Social Auth
 *     summary: Get available social login providers
 */
router.get('/social/providers', (req, res) => {
  const providers = [
    {
      name: 'Google',
      id: 'google',
      url: '/api/auth/google',
      icon: '🔍',
      description: 'Sign in with Google'
    },
    {
      name: 'Facebook',
      id: 'facebook',
      url: '/api/auth/facebook',
      icon: '📘',
      description: 'Sign in with Facebook'
    }
  ];
  
  res.json({ 
    message: 'Available social login providers',
    providers 
  });
});

export default router;
