import { Router } from 'express';
import Collection from '../models/Collection';

const router = Router({ mergeParams: true });

router.get('/', (req, res) => {
  Collection.find({ projectId: req.params.projectId }, (err, collections) => {
    if (err) return res.send(err);
    res.send(collections);
  });
});

router.post('/', (req, res) => {
  const collection = new Collection(req.body);
  console.log(req.params);
  collection.projectId = req.params.projectId;
  collection.save(err => {
    if (err) return res.send(err);
    res.send(collection);
  });
});

export default router;
