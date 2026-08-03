import EmergencyContact from '../models/EmergencyContact.js';

// @desc    Get all emergency contacts for logged-in user
// @route   GET /api/emergency-contacts
// @access  Private
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id })
      .sort({ type: 1, name: 1 });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new emergency contact
// @route   POST /api/emergency-contacts
// @access  Private
export const createContact = async (req, res, next) => {
  try {
    const { type, name, phone, address, specialty, hospitalName, notes, familyMember } = req.body;

    const contact = await EmergencyContact.create({
      user: req.user._id,
      familyMember: familyMember || null,
      type,
      name,
      phone,
      address,
      specialty,
      hospitalName,
      notes,
    });

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single emergency contact by ID
// @route   GET /api/emergency-contacts/:id
// @access  Private
export const getContactById = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Emergency contact not found');
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this contact');
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an emergency contact
// @route   PUT /api/emergency-contacts/:id
// @access  Private
export const updateContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Emergency contact not found');
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this contact');
    }

    const { type, name, phone, address, specialty, hospitalName, notes, familyMember } = req.body;

    contact.type = type ?? contact.type;
    contact.name = name ?? contact.name;
    contact.phone = phone ?? contact.phone;
    contact.address = address ?? contact.address;
    contact.specialty = specialty ?? contact.specialty;
    contact.hospitalName = hospitalName ?? contact.hospitalName;
    contact.notes = notes ?? contact.notes;
    contact.familyMember = familyMember ?? contact.familyMember;

    const updatedContact = await contact.save();
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an emergency contact
// @route   DELETE /api/emergency-contacts/:id
// @access  Private
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Emergency contact not found');
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this contact');
    }

    await contact.deleteOne();
    res.json({ message: `Emergency contact "${contact.name}" deleted successfully` });
  } catch (error) {
    next(error);
  }
};
