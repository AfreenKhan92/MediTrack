import express from 'express';
import {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMemberById,
  updateFamilyMember,
  deleteFamilyMember,
} from '../controllers/familyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateFamilyMember } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, validateFamilyMember, addFamilyMember)
  .get(protect, getFamilyMembers);

router.route('/:id')
  .get(protect, getFamilyMemberById)
  .put(protect, updateFamilyMember)
  .delete(protect, deleteFamilyMember);

export default router;
