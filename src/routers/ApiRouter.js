import { Router } from 'express';
import mongoose from 'mongoose';
import Collection from '../models/Collection';

const router = Router({ mergeParams: true });


const parseShape = shape => {
  const modelSchema = {};
  Object.keys(shape).forEach(key => {
    modelSchema[key] = { type: mongoose.Schema.Types[shape[key].type] };
  });
  return modelSchema;
};

router.get('/', (req, res) => {
  res.send(`${req.params.projectId}\'s API!'`);
});

router.use('/:collectionName', (req, res, next) => {
  Collection.findOne(
    { name: req.params.collectionName, projectId: req.params.projectId },
    (err, collection) => {
      if (err) return res.send(err);
      if (!collection) return res.status(404).send('That Collection does not exist!');
      const Model = mongoose.model(
        `${collection.projectId}:${collection.name}`,
        parseShape(collection.shape)
      );
      req.Model = Model;
      res.on('finish', () => {
        console.log('cleaning up mongoose');
        Object.keys(mongoose.connection.models).forEach(key => {
          if (key !== '__COLLECTION__' && key !== '__PROJECT__') {
            delete mongoose.connection.models[key];
          }
        });
      });
      next();
    }
  );
});

router.get('/:collectionName', (req, res) => {
  req.Model.find((err, documents) => {
    if (err) return res.send(err);
    res.send(documents);
  });
});

router.post('/:collectionName', (req, res) => {
  const document = new req.Model(req.body);
  document.save(err => {
    if (err) return res.send(err);
    res.send(document);
  });
});

export default router;
