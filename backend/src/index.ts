type Data = {
  originalURL: string;
  route: string;
}

import express, { response } from 'express';
import cors from 'cors';
import { PrismaClient } from '../prisma/generated/prisma-client-js';

const app = express();
const port = 3000;
const prisma = new PrismaClient()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const create = async (data: Data) => {
  const url = await prisma.urls.create({
    data: {
      original_url: data.originalURL,
      route_url: data.route,
    }
  });
  console.log(url)
}

const read = async (data: Data) => {
  const url = await prisma.urls.findUnique({
    where: {
      route_url: data.route
    },
  })
  return url
}

const readAlls = async () => {
  const urls = await prisma.urls.findMany({
    orderBy: {
      route_url: 'asc'
    }
  });
  return urls
}

const updateURL = async (data: Data, id: number) => {
  const url = await prisma.urls.update({
    where: {
      id: id,
    },
    data: {
      original_url: data.originalURL,
      route_url: data.route,
    },
  })
}

const deleteURL = async (id: number) => {
  const url = await prisma.urls.delete({
    where: {
      id: id,
    },
  })
  if (url) {
    return true
  }
  return false
}

const readRoute = async (route: string) => {
  const url = await prisma.urls.findUnique({
    where: {
      route_url: route,
    },
  })
  return url
}

const validateDatas = async (data: Data) => {
  if (data.originalURL === '' || data.route === '') {
    return {
      state: false,
      message: 'Preencha todos os campos!'
    }
  } else if (await read(data) !== null) {
    return {
      state: false,
      message: 'Essa rota ja está cadastrada em nosso banco de dados!'
    }
  }
  return {
    state: true,
    message: 'ok'
  }
}

app.post('/create', async (request, response) => {
  const data = request.body.data;
  const isValide = await validateDatas(data);
  if (isValide.state) {
    create(data)
    response.status(200).json({ state: true, data: data })
  } else {
    response.status(400).json({ error: isValide.message })
  }
})

app.post('/get', async (request, response) => {
  response.status(200).json({ data: await readAlls() })
})


app.post('/update', async (request, response) => {
  const data = request.body.data;
  const newData = {
    originalURL: data.originalURL,
    route: data.routeURL
  }
  const readData = await read(newData)
  if (data.originalURL === '' || data.route === '') {
    response.status(400).json({ error: 'Preencha todos os campos!' })
    return false
  }
  if (readData !== null) {
    if (readData.id === data.id) {
      await updateURL(newData, data.id)
      response.status(200).json({ data: await readAlls() })
    } else {
      response.status(400).json({ error: 'Essa rota ja está cadastrada em nosso banco de dados!' })
    }
  } else {
    await updateURL(newData, data.id)
    response.status(200).json({ data: await readAlls() })
  }
})

app.post('/delete', async (request, response) => {
  const id = request.body.id;
  const deleted = await deleteURL(id);
  if (deleted) {
    return response.status(200).json({ data: await readAlls() })
  }
  return response.status(400).json({ error: 'Não foi possivel deletar a rota.' })
})

app.get('/:route', async (request, response) => {
  const route = request.params.route;
  const url = await readRoute(route);
  if (url !== null) {
    response.redirect(url.original_url)
    return
  }
  return response.status(400).send('Route not found!')
})

app.listen(port, () => console.log('running server!'))

