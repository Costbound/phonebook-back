import createHttpError from 'http-errors';
import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
    },
    userId: { type: Schema.Types.ObjectId, required: true },
    photo: { type: String, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

contactSchema.post('save', (err, data, next) => {
  err.status = 400;
  next();
});

contactSchema.pre('findOneAndUpdate', function () {
  this.options.new = true;
  this.options.runValidators = true;
});

contactSchema.post('findOneAndUpdate', (err, data, next) => {
  err.status = 400;
  next();
});

export const ContactsCollection = model('contacts', contactSchema);
