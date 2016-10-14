import mongoose from 'mongoose';

const Project = mongoose.model('__PROJECT__', {
  name: { type: String, required: true },
});

export default Project;
