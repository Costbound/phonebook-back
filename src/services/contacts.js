import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async ({
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const contactsQuery = ContactsCollection.find({ userId });

  if (filter.type) {
    contactsQuery.where('contactType').equals(filter.type);
  }
  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery.sort({ [sortBy]: sortOrder }).exec(),
  ]);

  return {
    contacts: contacts,
    totalItems: contactsCount,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async ({
  name,
  phoneNumber,
  email = null,
  isFavourite = false,
  contactType = 'personal',
  userId,
  photo,
}) => {
  const contact = await ContactsCollection.create({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
    userId,
    photo,
  });
  return contact;
};

export const updateContact = async (contactId, userId, payload) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, runValidators: true },
  );

  return rawResult;
};

export const deleteContact = async (contactId, userId) => {
  const deletedContact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });

  return deletedContact;
};
