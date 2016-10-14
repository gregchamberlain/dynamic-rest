import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: '__PROJECT__', required: true },
  name: { type: String, required: true, trim: true },
  shape: { type: mongoose.Schema.Types.Mixed, required: true }
});

CollectionSchema.index({ projectId: 1, name: 1}, { unique: true });

const Collection = mongoose.model('__COLLECTION__', CollectionSchema);

export default Collection;
