const mongoose = require('mongoose');

const pasteSchema = new mongoose.Schema({
  pasteId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  maxViews: {
    type: Number,
    default: null
  },
  viewCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

pasteSchema.methods.isAvailable = function(currentTime) {
  if (this.expiresAt && currentTime >= this.expiresAt.getTime()) {
    return false;
  }
  
  if (this.maxViews !== null && this.viewCount >= this.maxViews) {
    return false;
  }
  
  return true;
};

pasteSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  await this.save();
};

pasteSchema.methods.getRemainingViews = function() {
  if (this.maxViews === null) {
    return null;
  }
  return Math.max(0, this.maxViews - this.viewCount);
};

const Paste = mongoose.model('Paste', pasteSchema);

module.exports = Paste;