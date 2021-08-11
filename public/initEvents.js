 // api
 const api = new Api();
 const validator = new Validator();
 const eventService = new EventService(api);
 const taskService = new TaskService(api, eventService);


const toDoContainer = document.querySelector('.to-do');
const completedContainer = document.querySelector('.completed');

const startBtn = document.querySelector('#btn');
const completedTasks = document.querySelector('#completed-tasks')

const modalWindow = document.querySelector('.modal-container');

 const title = document.querySelector('#task-title');
 const text = document.querySelector('#text');
 const date = document.querySelector('#date');

const arrInputs = [title, text, date];
const errText = document.querySelectorAll('.title-err');



arrInputs.forEach(item => {
    item.addEventListener('input', () => {
        item.classList.remove('err');
        item.parentNode.previousElementSibling.innerHTML = "";
}
    )
})

 startBtn.addEventListener('click',
     () => {


         const task = taskService.create(text.value, date.value, title.value, true);
         const validatedFields = validator.checkFields(task);
         taskService.renderErrors(validatedFields);

         const allFieldsAreCorrect = taskService.setErrMessage(validatedFields);
         taskService.tryToSave(allFieldsAreCorrect, task, modalWindow);

        // clean up fields
         arrInputs.forEach(item => item.value = "")
     });


     // close modal window 
     document.querySelector('.close-modal').addEventListener('click', ()=> modalWindow.classList.add('hide'))

 // показать текущие задачи
 document.querySelector('#check-tasks').addEventListener('click', async () => {

     const data = await api.getTasks()

     for (const item of data) {
         if(item.status){
             taskService.renderTasksInProgress(toDoContainer, item)
         }
     }

 });

 //    show completed tasks
 completedTasks.addEventListener('click', async ()=>{
     const data = await api.takeDeletedTasks();

    data.forEach(item => {
        if(!item.status){
            taskService.renderCompletedTasks(completedContainer, item)
        }
    });

 });
