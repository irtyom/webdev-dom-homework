"use strict";
window.scrollTo(0, 0)

const addFormButton = document.querySelector(".add-form-button");
const addFormName = document.querySelector(".add-form-name");
const addFormText = document.querySelector(".add-form-text");
const commentsList = document.querySelector(".comments");
const form = document.querySelector(".add-form");
const removeLastCommentButton = document.querySelector(".remove-last-comment-button");
const nameInput = document.querySelector('.add-form-name');
const textInput = document.querySelector('.add-form-text');
const submitButton = document.querySelector('.add-form-button');
let comments = [];


//подключение и рендер комментариев из API
//получение данных с сервера
function fetchComments() {

    //скрываем лишние элементы во время загрузки страницы
    form.classList.add('hidden');
    removeLastCommentButton.style.display = 'none';
    //загружаем лоадер
    const loader = document.querySelector('.loader-page');
    loader.classList.add('visible');

    fetch("https://webdev-hw-api.vercel.app/api/v1/artyom-kovalchuk/comments",
        {
            method: "GET",
        })
        .then((response) => {
            console.log(response);
            const jsonPromise = response.json();
            return jsonPromise;
        })
        .then((responseData) => {
            console.log(responseData);
            const appComments = responseData.comments.map((comment) => {
                return {
                    name: comment.author.name,
                    date: new Date().toLocaleString(),
                    text: comment.text,
                    likes: comment.likes,
                    isliked: false,
                };
            });

            comments = appComments;
            renderComments(comments);
            return loader;
        })
        .then((loader) => {
            loader.classList.remove('visible');
            loader.parentNode.removeChild(loader);
        })
        .then(() => {
            form.classList.remove('hidden');
            removeLastCommentButton.style.display = 'block';
        })
}

fetchComments();



//рендер комментариев, вызываем функцию ответа на комментарии, вызываем функцию кнопки лайка
function renderComments(comments) {
    // очищаем список комментариев перед добавлением новых
    commentsList.innerHTML = '';
    // создаем новый массив с разметкой комментариев
    const commentItems = comments
        .map(comment => `
          <li class="comment">
            <div class="comment-header">
              <div>${comment.name}</div>
              <div>${comment.date}</div>
            </div>
            <div class="comment-body">
              <div class="comment-text">${comment.text}</div>
            </div>
            <div class="comment-footer">
              <div class="likes">
                <span class="likes-counter">${comment.likes}</span>
                <button class="like-button ${comment.isLiked ? '-active-like' : ''}"></button>
              </div>
            </div>
          </li>`
        );

    const commentsHTML = commentItems
        .join('');

    // добавляем новый список комментариев на страницу
    commentsList.insertAdjacentHTML('beforeend', commentsHTML);

    addCommentReplyEvent();

    setupLikeButtons();


}

renderComments(comments);


//добавление комментария
function addComment() {
   //сохраняем введённые пользователем в форму данные
    const nameInputValue = nameInput.value;
    const textInputValue = textInput.value;
    //скрыть форму, кнопку удал. комм.
    form.classList.add('hidden');
    removeLastCommentButton.style.display = 'none';
    //загружаем лоадер
    const loader = document.querySelector('.loader-comments');
    loader.classList.remove('hidden');

    const newComment = {
        name: nameInput.value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
        date: new Date().toLocaleString(),
        text: textInput.value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
        likes: 0,
        isLiked: false,
        forceError: true,
    };




    fetch("https://webdev-hw-api.vercel.app/api/v1/artyom-kovalchuk/comments", {
        method: "POST",
        body: JSON.stringify(newComment),
    })
        .then((response) => {
            //проверяем, что ответ выполнен успешно и содержит данные
            if (response.status === 201) {
                console.log(response);
                //возвращаем обратно форму и кнопку удаления, скрываем лоадер
                form.classList.remove("hidden");
                removeLastCommentButton.style.display = "block";
                loader.classList.add("hidden");
                return response.json();
            } else if (response.status === 400) {
                textInput.value = textInputValue;
                nameInput.value = nameInputValue;
                throw new Error("Имя и комментарий должны быть не короче 3-х символов");
            } else if (response.status === 500) {
                textInput.value = textInputValue;
                nameInput.value = nameInputValue;
                throw new Error("Сервер сломался :( Повторите попытку позже")
            }
            else {
                textInput.value = textInputValue;
                nameInput.value = nameInputValue;
                throw new Error("Ошибка сети. Проверьте поключение к интернету.")
            }
        })
        .then(() => {
            comments.push(newComment);
            renderComments(comments);
        })
        .catch((error) => {
            //не прогоняем сценарий удаления формы во время ошибки
            form.classList.remove("hidden");
            removeLastCommentButton.style.display = "block";
            loader.classList.add("hidden");
            if (error instanceof TypeError) {
                alert("Ошибка сети. Проверьте подключение к интернету");
            }
            else {
                alert(error.message);
            }
        });
}




//кнопка добавления комментария
addFormButton.addEventListener("click", (event) => { // находим кнопку "Написать", добавляем новый комментарий
    event.preventDefault();

    const name = addFormName.value.trim();
    const text = addFormText.value.trim();

    if (!name || !text) {
        alert("Необходимо указать имя и комментарий!");
        return;
    }

    addComment()

    addFormName.value = "";
    addFormText.value = "";
});



//удаление последнего комментария
function removeLastComment() {
    if (comments.length > 0) {
        comments.pop(); // удаляем последний элемент из массива комментариев
        renderComments(comments); // рендерим обновленный список комментариев
    }

    if (comments.length == 0) {
        removeLastCommentButton.style.display = 'none';
    }
}

removeLastCommentButton.addEventListener("click", removeLastComment);


// нажатие enter 
addFormText.addEventListener("keyup", function (event) {
    if (event.key === "Enter" && !addFormButton.disabled) {
        addFormButton.click();
    }
});


//кнопка лайка
function setupLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-button');

    likeButtons.forEach((button, index) => {
        const comment = comments[index];

        button.addEventListener('click', event => {
            event.stopPropagation();

            if (comment.isLiked) {
                comment.likes--;
                comment.isLiked = false;
            } else {
                comment.likes++;
                comment.isLiked = true;
            }

            renderComments(comments);
        });
    });
}


//функция ответа на комментарии
function addCommentReplyEvent() {
    const commentToReply = document.querySelectorAll('.comment');
    commentToReply.forEach(comment => {
        comment.addEventListener('click', () => {
            const author = comment.querySelector('.comment-header div:first-child').textContent;
            const text = comment.querySelector('.comment-text').textContent;
            addFormText.value = `@${author} \n\n > ${text}, `;
            addFormText.focus();
        });
    });
}



// disabled
function handleInput() {
    const nameValue = nameInput.value.trim();
    const textValue = textInput.value.trim();

    if (nameValue !== '' && textValue !== '') {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('disabled');
    } else {
        submitButton.setAttribute('disabled', true);
        submitButton.classList.add('disabled');
    }
}

nameInput.addEventListener('input', handleInput); // проверка заполнености двух полей
textInput.addEventListener('input', handleInput);


// разблокирует кнопку, если поля не пустые
function validateForm() {
    const nameValue = addFormName.value.trim();
    const textValue = addFormText.value.trim();
    const isValid = nameValue !== "" && textValue !== "";
    addFormButton.disabled = !isValid;
    addFormButton.classList.toggle("disabled", !isValid);
}

validateForm();