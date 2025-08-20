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
 * /auth/social-login:
 *   post:
 *     tags:
 *       - Social Auth
 *     summary: Mobile social login with user profile
 *     description: Authenticate user with social provider profile data from mobile app
 */
router.post('/social-login', authRateLimit, async (req, res) => {
  try {
    const SocialLoginSchema = z.object({
      provider: z.enum(['GOOGLE', 'FACEBOOK']),
      profile: z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        picture: z.string().optional(),
        provider: z.enum(['google', 'facebook'])
      })
    });

    const body = SocialLoginSchema.parse(req.body);

    // Convert mobile profile format to backend format
    const profile = {
      id: body.profile.id,
      email: body.profile.email,
      firstName: body.profile.firstName || body.profile.name.split(' ')[0] || '',
      lastName: body.profile.lastName || body.profile.name.split(' ').slice(1).join(' ') || '',
      avatar: body.profile.picture,
      provider: body.provider
    };

    // Handle social login
    const result = await handleSocialLogin(profile);

    res.json({
      message: 'Social login successful',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        avatar: result.user.avatar,
        role: result.user.role,
        isVerified: result.user.isVerified,
        patient: result.user.patient,
        doctor: result.user.doctor
      }
    });
  } catch (error: any) {
    console.error('Social login error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Social login failed',
        code: 'SOCIAL_LOGIN_FAILED'
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
