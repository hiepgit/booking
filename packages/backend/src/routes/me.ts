import { Router } from 'express';
import { requireAuth } from '../security/requireAuth.js';
import { UserService } from '../services/user.service.js';
import { UploadService } from '../services/upload.service.js';
import { z } from 'zod';
import { Gender } from '@prisma/client';

const router = Router();

// Validation schemas
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().min(1, 'Last name is required').max(50).optional(),
  dateOfBirth: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().max(200).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
});

const UpdatePatientProfileSchema = z.object({
  bloodType: z.string().max(10).optional(),
  allergies: z.string().max(500).optional(),
  emergencyContact: z.string().max(100).optional(),
  insuranceNumber: z.string().max(50).optional(),
});

/**
 * @openapi
 * /me:
 *   get:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Get current user profile
 *     description: Returns complete user profile including role-specific data
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const profile = await UserService.getUserProfile(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me:
 *   put:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Update current user profile
 *     description: Update basic user profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               dateOfBirth:
 *                 type: string
 *                 format: date-time
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               address:
 *                 type: string
 *                 maxLength: 200
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const data = UpdateProfileSchema.parse(req.body);
    const updatedProfile = await UserService.updateUserProfile(userId, data);
    res.json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me/patient:
 *   put:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Update patient-specific profile data
 *     description: Update medical information for patient users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *                 maxLength: 10
 *               allergies:
 *                 type: string
 *                 maxLength: 500
 *               emergencyContact:
 *                 type: string
 *                 maxLength: 100
 *               insuranceNumber:
 *                 type: string
 *                 maxLength: 50
 *     responses:
 *       200:
 *         description: Patient profile updated successfully
 *       400:
 *         description: Validation error or user is not a patient
 *       401:
 *         description: Unauthorized
 */
router.put('/patient', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const data = UpdatePatientProfileSchema.parse(req.body);
    const updatedProfile = await UserService.updatePatientProfile(userId, data);
    res.json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me/completion:
 *   get:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Get profile completion status
 *     description: Returns profile completion percentage and missing fields
 *     responses:
 *       200:
 *         description: Profile completion status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/completion', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const completion = await UserService.getProfileCompletion(userId);
    res.json(completion);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me/avatar:
 *   post:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Upload user avatar
 *     description: Upload and set user profile picture
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/avatar', requireAuth, async (req, res, next) => {
  try {
    const upload = UploadService.getAvatarUploadConfig();
    
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: {
            message: err.message,
            code: 'UPLOAD_ERROR'
          }
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: {
            message: 'No file uploaded',
            code: 'NO_FILE'
          }
        });
      }

      try {
        const userId = req.user.sub;
        
        // Get current user to check for existing avatar
        const currentUser = await UserService.getUserProfile(userId);
        
        // Process the uploaded file
        const uploadedFile = await UploadService.processAvatarUpload(req.file);
        
        // Update user profile with new avatar URL
        const updatedProfile = await UserService.updateUserProfile(userId, {
          avatar: uploadedFile.url
        });

        // Delete old avatar if exists
        if (currentUser.avatar) {
          await UploadService.deleteOldAvatar(currentUser.avatar);
        }

        res.json({
          message: 'Avatar uploaded successfully',
          avatar: uploadedFile.url,
          user: updatedProfile
        });
      } catch (error) {
        next(error);
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me/avatar:
 *   delete:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Delete user avatar
 *     description: Remove user profile picture
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/avatar', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    
    // Get current user to check for existing avatar
    const currentUser = await UserService.getUserProfile(userId);
    
    // Remove avatar from profile
    const updatedProfile = await UserService.updateUserProfile(userId, {
      avatar: null
    });

    // Delete avatar file if exists
    if (currentUser.avatar) {
      await UploadService.deleteOldAvatar(currentUser.avatar);
    }

    res.json({
      message: 'Avatar deleted successfully',
      user: updatedProfile
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /me/deactivate:
 *   post:
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     summary: Deactivate user account
 *     description: Deactivate the current user account
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/deactivate', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const result = await UserService.deactivateUser(userId);
    res.json({
      message: 'Account deactivated successfully',
      user: result
    });
  } catch (err) {
    next(err);
  }
});

export default router;


