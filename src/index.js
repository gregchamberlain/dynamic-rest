import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import ProjectRouter from './routers/ProjectRouter';

// xDeMpOb9pb5WF2WB
mongoose.connect('mongodb://admin:xDeMpOb9pb5WF2WB@ds057816.mlab.com:57816/dynamic-test', () => {
  console.log('connected');
});

const startTime = new Date();
const Model = mongoose.model('Model', {
  name: { type: String, unique: true },
  shape: mongoose.Schema.Types.Mixed
});
console.log(new Date() - startTime);

const schema = {
  Towers: {
    name: { type: "string" },
    address: { type: "string" },
    lat: { type: "number" },
    lng: { type: "number" }
  }
};

const app = express();
app.use(bodyParser());

app.get('/', (req, res) => {
  res.send('hello world!');
});

app.post('/schema', (req, res) => {
  const body = req.body;
  const newModel = new Model({ name: body.name, shape: body.shape });
  newModel.save(err => {
    if (err) {
      res.send(err);
    } else {
      res.send(newModel);
    }
  });
});

const types = {
  String,
  Number,
};

function parseSchema(rawSchema) {
  const newSchema = {};
  Object.keys(rawSchema).forEach(key => {
    const rawType = rawSchema[key].type;
    console.log(types[rawType]);
    newSchema[key] = { type: types[rawType] };
  });
  return newSchema;
}

// app.use((req, res) => {
//   switch (req.method) {
//     case 'GET':
//       getSchema(req, res);
//       break;
//     default:
//       res.send({method: req.method, url: req.url});
//   }
// });

const getSchema = (req, res, next) => {
  const paths = req.url.split('/');
  const modelName = paths[1];
  Model.findOne({ name: modelName }, (err, model) => {
    if (err) return res.send(err);
    if (model) {
      req.model = mongoose.model(model.name, parseShape(model.shape));
      req.shape = model.shape;
      next();
    } else {
      res.status(404).send('Model doesn\'t exist');
    }
  });
};

const parseShape = shape => {
  const modelSchema = {};
  Object.keys(shape).forEach(key => {
    modelSchema[key] = { type: mongoose.Schema.Types[shape[key].type] };
  });
  return modelSchema;
};

const handleRequest = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
    case 'PUT':
      res.send({ method: 'PUT', data: req.shape });
      break;
    default:
      res.send('Unhandled Request Method!:' + req.method);
  }
};

const handleGet = (req, res) => {
  console.log('getting...');
  const paths = req.url.split("/");
  if (paths[2]) {
    req.model.findOne({ _id: paths[2] }, (err, item) => {
      if (err) return req.send(err);
      if (item) {
        res.send(item);
      } else {
        res.send('Item not found!');
      }
    });
  } else {
    req.model.find((err, items) => {
      if (err) return res.send(err);
      res.send(items);
    });
  }
};

const handlePost = (req, res) => {
  const paths = req.url.split('/');
  if (!paths[2]) {
    const item = new req.model(req.body);
    item.save(err => {
      if (err) return res.send(err);
      res.send(item);
    });
  } else {
    res.send('You cant post here!');
  }
};

app.use('/projects', ProjectRouter);
app.use(getSchema);
app.use(handleRequest);



app.listen(3000, () => {
  console.log('Listening on port 3000');
});
