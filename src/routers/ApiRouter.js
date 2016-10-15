import { Router } from 'express';
import mongoose from 'mongoose';
import Collection from '../models/Collection';
import onFinished from 'on-finished';

const router = Router({ mergeParams: true });


const parseShape = shape => {
  const modelSchema = {};
  Object.keys(shape).forEach(key => {
    modelSchema[key] = { type: mongoose.Schema.Types[shape[key].type] };
  });
  return modelSchema;
};

const mongooseCleanup = () => {
  console.log('cleaning up mongoose');
  Object.keys(mongoose.connection.models).forEach(key => {
    if (key !== '__COLLECTION__' && key !== '__PROJECT__') {
      delete mongoose.connection.models[key];
    }
  });
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
      // Dynamically creates model from schema stored in DB
      const Model = mongoose.model(
        `${collection.projectId}:${collection.name}`,
        parseShape(collection.shape)
      );
      req.Model = Model;
      onFinished(res, (err2, res2) => {
        mongooseCleanup();
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

router.get('/:collectionName/:id', (req, res) => {
  req.Model.findOne({ _id: req.params.id }, (err, document) => {
    if (!err) {
      if (document) {
        res.send(document);
      } else {
        res.send('Not Found', 404);
      }
    } else {
      res.send(err);
    }
  });
});

router.post('/:collectionName', (req, res) => {
  const document = new req.Model(req.body);
  document.save(err => {
    if (!err) {
      res.send(document);
    } else {
      res.send(err);
    }
  });
});

export default router;
