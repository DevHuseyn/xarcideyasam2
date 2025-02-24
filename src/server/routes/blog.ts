import express from 'express';
import { Blog } from '../models/Blog';
import { auth } from '../middleware/auth';

const router = express.Router();

// Tüm blogları getir
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error('Blog fetch error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Blog detayı getir
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name');

    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Blog detail fetch error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Blog oluştur (auth gerekli)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body;

    const blog = await Blog.create({
      title,
      content,
      tags,
      coverImage,
      author: req.user.id,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Blog create error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Blog güncelle (auth gerekli)
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    // Yalnızca blog sahibi veya admin güncelleyebilir
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedBlog);
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Blog sil (auth gerekli)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog bulunamadı' });
    }

    // Yalnızca blog sahibi veya admin silebilir
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await blog.remove();

    res.json({ message: 'Blog başarıyla silindi' });
  } catch (error) {
    console.error('Blog delete error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

export default router; 