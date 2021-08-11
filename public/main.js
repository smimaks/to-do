class Task {

    constructor(text, date, title, status, priority, id) {
        this.text = text;
        this.date = date;
        this.title = title;
        this.status = status;
        this.priority = priority;
        this.id = id;
    }
}

class TaskService {
    constructor(api, eventService) {
        this.api = api;
        this.eventService = eventService;
    }
    #generateId() {
        let id = '';
        for (let i = 0; i < 4; i++) {
            id += Math.floor(Math.random() * 9 + 1);
        }
        return id
    }

    #takePriority() {
        return document.querySelector(`input[name="priority"]:checked`).value;
    }

    create(text, date, title, status = true) {
        return new Task(text, date, title, status, this.#takePriority(), this.#generateId())
    }

    generateDOM(task){
        return new DOMParser().parseFromString(`<details class="new-task"  task-id=${task.id} close>
                                    <summary >${task.title}</summary>
                      <div class="overlay">           
                    <label>Приоритет:
                 <input type="text" disabled property="prio-task" class="prio-task task-edit-field" value="${task.priority}"/>
                   </label>
               
                 <label>Текст задачи: 
                 <textarea class="text-task task-edit-field" property="text-task" disabled> ${task.text} </textarea>
                 </label>

                <input class="date task-edit-field" property="date" disabled type="date" value="${task.date}"/>
              </div>   
                <button class="complete-task" name="close">Выполнить задачу</button>
                <button class="update-task">Сохранить изменения</button>
            </details>   </div>`, 'text/html');
    }

    generateDomForCompletedTasks(task){
        return new DOMParser().parseFromString(`<details class="new-task"  task-id=${task.id} close>
                <summary >${task.title}</summary>
              
               <button class="close-task"><img src="closeKrestik.svg" alt="close"></button>
                   
                    <label>Приоритет:
                 <input type="text" disabled property="prio-task" class="prio-task task-edit-field" value="${task.priority}"/>
                   </label>

                 <label>Текст задачи: 
                 <textarea class="text-task task-edit-field" property="text-task" disabled> ${task.text} </textarea>
                 </label>

                <input class="date task-edit-field" property="date" disabled type="date" value="${task.date}"/>
        
            </details>`, 'text/html');


    }

    renderTasksInProgress(container, task) {
        const dom = this.generateDOM(task);
        //редактируемые поля
        const taskFields = dom.querySelectorAll('.task-edit-field');

        this.eventService.initDeleteTask(dom, task, container);
        this.eventService.initEditTask(taskFields);
        this.eventService.initSaveTask(dom,task, taskFields);

        container.appendChild(dom.body.childNodes[0]);

    }

    renderCompletedTasks(container, task){
        const dom = this.generateDomForCompletedTasks(task);
        dom.querySelector('.close-task').addEventListener('click', (e)=>{
        const taskRemoveFromHtml = e.target.parentNode.parentNode;
      console.log(taskRemoveFromHtml);
      container.removeChild(taskRemoveFromHtml)
        })
        container.appendChild(dom.body.childNodes[0]);
    }





    renderErrors(names) {
        for (const [key, value] of Object.entries(names)) {
          
            if (!value) {
                document.querySelector(`[name="${key}"]`).classList.add('err');
            } else {
                document.querySelector(`[name="${key}"]`).classList.remove('err');
            }
        }
    }
    tryToSave(allFieldsAreCorrect, task, modalWindow) {       
               if (allFieldsAreCorrect) {
                     this.api.saveTask(task)
                          .then(() => modalWindow.classList.remove('hide'))
                         .catch( error => console.error(error))       
                 } 
    }

    setErrMessage(validatedFields) {
        const errText = document.querySelectorAll('.title-err');
        const errMsg = "Ошибка записи";

     
            let allFieldsAreCorrect = true;
         for (const key in validatedFields) {
             if (!validatedFields[key]) {
                 errText.forEach(item => {
                     item.innerHTML = errMsg;
                 })

                 allFieldsAreCorrect = false;
             }
        }
        return allFieldsAreCorrect
    }




}

class Api {

    async saveTask(obj) {
        const response = await fetch('/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(obj)
        })
        if (response.ok) {
            console.log('data saved!');
        } else {
         throw new Error(await response.text()) 
        }
    }
    async getTasks() {
        const response = await fetch('/tasks/in-progress');
        const data = await response.json();
        return data;
    }

    async deleteTask(id) {
        const obj = {
            id
        }

        const response = await fetch('/task', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },

            body: JSON.stringify(obj)
        });
    }

  async takeDeletedTasks() {
      const response = await fetch('/tasks/completed');
      const data = await response.json();
      return data;

  }
    async putTask(changedTasks) {

        const response = await fetch('/task', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(changedTasks)
        })
    }
}

class Validator {

    checkFields(task) {
        const keys = {};
        for (const [key, value] of Object.entries(task)) {
            if (['id', 'status'].includes(key)) {
                continue
            }
            keys[key] = !!value // Приводим к значению boolean
        }
        return keys

    }
}

class EventService {
    constructor(api) {
        this.api = api;
    }

    initDeleteTask(dom, task, container){
        //  получения таски для дальнейшего удаления
        const readyToDeleteTask = dom.querySelector(`[task-id = "${task.id}"]`);

        // Удаление элемента
        dom.querySelector('.complete-task').addEventListener('click', () => {
            this.api.deleteTask(task.id).then(()=>
                container.removeChild(readyToDeleteTask)
            );
        });
    }
    initEditTask(taskFields){
        // добавление возможности редактировать текст задачи и приоритет

        for (const item of taskFields) {
            item.addEventListener('select', () => {
                item.disabled = false;
            });
            item.addEventListener('blur', () => {
                item.disabled = true;
            })
        }

    }
    initSaveTask(dom, task, taskFields){
        // событие, сохраняющее изменения в задачах

        dom.querySelector('.update-task').addEventListener('click', (elem) => {
            const changedFields = {};
            changedFields.id = task.id;

            taskFields.forEach(item => {
                const property = item.getAttribute('property');
                changedFields[property] = item.value;
            })

            // Передаем измененные поля на сервер
            this.api.putTask(changedFields);


        })
    }

}