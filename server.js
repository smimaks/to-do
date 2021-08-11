const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

app.use('/', express.static('./public'));

// получаем запрос, в ответ отправляем бд
app.get('/tasks/in-progress', (req, res) => {
 
  fs.readFile('tasks.json', (err, data) => {  // data - данные с бд
    if (err) {
    res.status(400).send(err);
    } else {
      res.send(data)
    }
  });
});

app.get('/tasks/completed', (req, res) => {
  fs.readFile('tasks.json', (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(data)
    }
  })
})

// получаем json для занесения в бд

app.post('/task', (req, res) => {

  // validate fields
  const checkFieldsValidation = data => !Object.values(data).some(value => !String(value).length);

  if (checkFieldsValidation(req.body)) {

    fs.readFile('tasks.json', (err, data) => { // считываем существующий файл

      // преобразовываем в объект и присваиваем массиву
        const arrData = data.toString() ? JSON.parse(data.toString()) : []


    arrData.push(req.body) //добавляем к существующим данным те, что поступили
    fs.writeFile('./tasks.json', JSON.stringify(arrData, null, 4), 'utf8', (err,  data) => {  // записываем все данные в бд
    res.send('!!!')
    });
   });
  }

  else {
    res.status(400).send('Не прошел валидацию!');
  }
 
  
   
});


app.delete('/task', (req, res) => {
  const id = req.body.id;
  fs.readFile('tasks.json', (err, data) => {
    const arrData = JSON.parse(data.toString()) || [];
    const indexOfTask = arrData.findIndex(item => item.id === id);
    arrData[indexOfTask].status = false;


    fs.writeFile('tasks.json', JSON.stringify(arrData, null, 4), 'utf8', (err, data) => {
      res.send('task was deleted');
    })
  });
});


app.put('/task', (req, res) => {
  const id = req.body.id;
 
  fs.readFile('tasks.json', (err, data) => {
    const tasks = JSON.parse(data.toString());
   
    const indexOfTask = tasks.findIndex(item => item.id === id);
      tasks[indexOfTask] = req.body;
    
    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 4), 'utf-8', (err, req) => {
      if (err) {
        console.log(err)
      } else {
        res.send('task was rewrited')
      }
    });
  });
});


app.get('/deleted-tasks', (req, res) =>{

  fs.readFile('deletedTasks.json', (err, data) => {
    if(err){
      res.status(400).send(err);
    }
    else {
      res.send(data);
    }
  })
})





app.listen(3000, () =>  console.log('started') );