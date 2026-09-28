import FamilyMember from '../models/FamilyMember.js';
import { cacheGet, cacheSet, cacheDel, cacheDelMany, KEYS, TTL } from '../services/cacheService.js';

// Helper: compute BMI and BMI category from height (cm) and weight (kg)
const computeBmi = (heightCm, weightKg) => {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return { bmi: null, bmiCategory: null };
  }
  const heightM = heightCm / 100;
  const bmiValue = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let bmiCategory = 'Unknown';
  if (bmiValue < 18.5) bmiCategory = 'Underweight';
  else if (bmiValue < 25) bmiCategory = 'Normal weight';
  else if (bmiValue < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';
  return { bmi: bmiValue, bmiCategory };
};

// @desc    Add a new family member
// @route   POST /api/family
// @access  Private
export const addFamilyMember = async (req, res, next) => {
  try {
    const { name, relation, age, bloodGroup, allergies, gender, dateOfBirth, notes, heightCm, weightKg } = req.body;
    const { bmi, bmiCategory } = computeBmi(heightCm, weightKg);

    const member = await FamilyMember.create({
      user: req.user._id,
      name,
      relation,
      age,
      bloodGroup,
      allergies: allergies || [],
      gender,
      dateOfBirth,
      notes,
      heightCm: heightCm || null,
      weightKg: weightKg || null,
      bmi,
      bmiCategory,
    });

    // Invalidate the family list cache — a new member was added
    await cacheDel(KEYS.familyList(req.user._id.toString()));

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all family members for logged-in user
// @route   GET /api/family
// @access  Private
export const getFamilyMembers = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const cacheKey = KEYS.familyList(userId);

    // ── Cache-aside ───────────────────────────────────────────────────────────
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const members = await FamilyMember.find({ user: req.user._id }).sort({ relation: 1, name: 1 });

    await cacheSet(cacheKey, members, TTL.FAMILY_LIST);
    res.json(members);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single family member by ID
// @route   GET /api/family/:id
// @access  Private
export const getFamilyMemberById = async (req, res, next) => {
  try {
    const cacheKey = KEYS.familyMember(req.params.id);

    // ── Cache-aside ───────────────────────────────────────────────────────────
    const cached = await cacheGet(cacheKey);
    if (cached) {
      // Ownership is already enforced when the cache was populated;
      // re-verify to prevent cached data leaking across users if key is ever reused
      if (cached.user?.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to access this family member');
      }
      return res.json(cached);
    }

    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Family member not found');
    }

    if (member.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this family member');
    }

    await cacheSet(cacheKey, member, TTL.FAMILY_MEMBER);
    res.json(member);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a family member
// @route   PUT /api/family/:id
// @access  Private
export const updateFamilyMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Family member not found');
    }

    if (member.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this family member');
    }

    const { name, relation, age, bloodGroup, allergies, gender, dateOfBirth, notes, heightCm, weightKg } = req.body;

    member.name = name ?? member.name;
    member.relation = relation ?? member.relation;
    member.age = age ?? member.age;
    member.bloodGroup = bloodGroup ?? member.bloodGroup;
    member.allergies = allergies ?? member.allergies;
    member.gender = gender ?? member.gender;
    member.dateOfBirth = dateOfBirth ?? member.dateOfBirth;
    member.notes = notes ?? member.notes;
    member.heightCm = heightCm !== undefined ? (heightCm || null) : member.heightCm;
    member.weightKg = weightKg !== undefined ? (weightKg || null) : member.weightKg;

    // Recalculate BMI with potentially updated height/weight
    const { bmi, bmiCategory } = computeBmi(member.heightCm, member.weightKg);
    member.bmi = bmi;
    member.bmiCategory = bmiCategory;

    const updatedMember = await member.save();

    // Invalidate BOTH the individual member cache AND the family list cache
    // so they can never temporarily disagree with each other
    await cacheDelMany([
      KEYS.familyMember(req.params.id),
      KEYS.familyList(req.user._id.toString()),
    ]);

    res.json(updatedMember);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a family member
// @route   DELETE /api/family/:id
// @access  Private
export const deleteFamilyMember = async (req, res, next) => {
  try {
    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      res.status(404);
      throw new Error('Family member not found');
    }

    if (member.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this family member');
    }

    await member.deleteOne();

    // Invalidate BOTH the individual member cache AND the family list cache
    await cacheDelMany([
      KEYS.familyMember(req.params.id),
      KEYS.familyList(req.user._id.toString()),
    ]);

    res.json({ message: `Family member "${member.name}" deleted successfully` });
  } catch (error) {
    next(error);
  }
};
