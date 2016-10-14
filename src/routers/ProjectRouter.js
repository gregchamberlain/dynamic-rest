import { Router } from 'express';
import CollectionRouter from './CollectionRouter';
import ApiRouter from './ApiRouter';
import Project from '../models/Project';

const router = Router();

router.get('/', (req, res) => {
  Project.find((err, projects) => {
    if (err) return res.send(err);
    res.send(projects);
  });
});

router.post('/', (req, res) => {
  const project = new Project(req.body);
  project.save(err => {
    if (err) return res.send(err);
    res.send(project);
  });
});

router.get('/:projectId', (req, res) => {
  Project.findOne({ _id: req.params.projectId }, (err, project) => {
    if (err) return res.send(err);
    res.send(project);
  });
});

router.use('/:projectId/collections', CollectionRouter);

router.use('/:projectId/api', ApiRouter);

export default router;
