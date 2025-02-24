import mongoose from 'mongoose';

export interface IBlog extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  slug: string;
  tags: string[];
  coverImage?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Başlık alanı zorunludur'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'İçerik alanı zorunludur'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Slug oluşturma
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    return next();
  }

  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema); 