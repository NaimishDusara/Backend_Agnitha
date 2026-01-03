// const Paste = require('../models/Paste');
// const { customAlphabet } = require('nanoid');

// const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

// function getCurrentTime(req) {
//   if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
//     return parseInt(req.headers['x-test-now-ms']);
//   }
//   return Date.now();
// }

// exports.healthCheck = async (req, res) => {
//   try {
//     await Paste.findOne().limit(1);
//     res.json({ ok: true });
//   } catch (error) {
//     res.status(500).json({ ok: false });
//   }
// };

// exports.createPaste = async (req, res) => {
//   try {
//     const { content, ttl_seconds, max_views } = req.body;
    
//     if (!content || typeof content !== 'string' || content.trim() === '') {
//       return res.status(400).json({ 
//         error: 'content is required and must be a non-empty string' 
//       });
//     }
    
//     if (ttl_seconds !== undefined) {
//       if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
//         return res.status(400).json({ 
//           error: 'ttl_seconds must be an integer >= 1' 
//         });
//       }
//     }
    
//     if (max_views !== undefined) {
//       if (!Number.isInteger(max_views) || max_views < 1) {
//         return res.status(400).json({ 
//           error: 'max_views must be an integer >= 1' 
//         });
//       }
//     }
    
//     const pasteId = nanoid();
//     const currentTime = getCurrentTime(req);
    
//     const expiresAt = ttl_seconds 
//       ? new Date(currentTime + (ttl_seconds * 1000)) 
//       : null;
    
//     const paste = await Paste.create({
//       pasteId,
//       content,
//       maxViews: max_views !== undefined ? max_views : null,
//       viewCount: 0,
//       expiresAt,
//       createdAt: new Date(currentTime)
//     });
    
//     const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
//     const url = `${baseUrl}/p/${pasteId}`;
    
//     res.status(201).json({ 
//       id: pasteId, 
//       url 
//     });
    
//   } catch (error) {
//     console.error('Create paste error:', error);
//     res.status(500).json({ 
//       error: 'Failed to create paste' 
//     });
//   }
// };

// exports.getPaste = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const currentTime = getCurrentTime(req);
    
//     const paste = await Paste.findOne({ pasteId: id });
    
//     if (!paste) {
//       return res.status(404).json({ 
//         error: 'Paste not found' 
//       });
//     }
    
//     if (!paste.isAvailable(currentTime)) {
//       return res.status(404).json({ 
//         error: 'Paste not found' 
//       });
//     }
    
//     await paste.incrementView();
    
//     const response = {
//       content: paste.content,
//       remaining_views: paste.getRemainingViews(),
//       expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
//     };
    
//     res.json(response);
    
//   } catch (error) {
//     console.error('Get paste error:', error);
//     res.status(500).json({ 
//       error: 'Failed to retrieve paste' 
//     });
//   }
// };

// exports.viewPaste = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const currentTime = getCurrentTime(req);
    
//     const paste = await Paste.findOne({ pasteId: id });
    
//     if (!paste || !paste.isAvailable(currentTime)) {
//       return res.status(404).json({ 
//         error: 'Paste not found' 
//       });
//     }
    
//     await paste.incrementView();
    
//     const response = {
//       content: paste.content,
//       remaining_views: paste.getRemainingViews(),
//       expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
//     };
    
//     res.json(response);
    
//   } catch (error) {
//     console.error('View paste error:', error);
//     res.status(500).json({ 
//       error: 'Failed to retrieve paste' 
//     });
//   }
// };

















const Paste = require('../models/Paste');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms']);
  }
  return Date.now();
}

exports.healthCheck = async (req, res) => {
  try {
    await Paste.findOne().limit(1);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
};

exports.createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ 
        error: 'content is required and must be a non-empty string' 
      });
    }
    
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ 
          error: 'ttl_seconds must be an integer >= 1' 
        });
      }
    }
    
    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({ 
          error: 'max_views must be an integer >= 1' 
        });
      }
    }
    
    const pasteId = nanoid();
    const currentTime = getCurrentTime(req);
    
    const expiresAt = ttl_seconds 
      ? new Date(currentTime + (ttl_seconds * 1000)) 
      : null;
    
    const paste = await Paste.create({
      pasteId,
      content,
      maxViews: max_views !== undefined ? max_views : null,
      viewCount: 0,
      expiresAt,
      createdAt: new Date(currentTime)
    });
    
    // IMPORTANT: Use FRONTEND_URL instead of backend URL
    // This ensures users get the React UI link, not the raw JSON endpoint
    const frontendUrl = process.env.FRONTEND_URL || 
                        process.env.BASE_URL || 
                        `${req.protocol}://${req.get('host')}`;
    
    const url = `${frontendUrl}/p/${pasteId}`;
    
    res.status(201).json({ 
      id: pasteId, 
      url 
    });
    
  } catch (error) {
    console.error('Create paste error:', error);
    res.status(500).json({ 
      error: 'Failed to create paste' 
    });
  }
};

exports.getPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const currentTime = getCurrentTime(req);
    
    const paste = await Paste.findOne({ pasteId: id });
    
    if (!paste) {
      return res.status(404).json({ 
        error: 'Paste not found' 
      });
    }
    
    if (!paste.isAvailable(currentTime)) {
      return res.status(404).json({ 
        error: 'Paste not found' 
      });
    }
    
    await paste.incrementView();
    
    const response = {
      content: paste.content,
      remaining_views: paste.getRemainingViews(),
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Get paste error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve paste' 
    });
  }
};

exports.viewPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const currentTime = getCurrentTime(req);
    
    const paste = await Paste.findOne({ pasteId: id });
    
    if (!paste || !paste.isAvailable(currentTime)) {
      return res.status(404).json({ 
        error: 'Paste not found' 
      });
    }
    
    await paste.incrementView();
    
    const response = {
      content: paste.content,
      remaining_views: paste.getRemainingViews(),
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('View paste error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve paste' 
    });
  }
};