import { addCommentReplyEvent, setupLikeButtons } from '../script.js';
export function renderComments(comments, commentsList) {
    // Очищаем список комментариев перед добавлением новых
    commentsList.innerHTML = '';

    // Создаем новый массив с разметкой комментариев
    const commentItems = comments.map(comment => `
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
        </li>
    `);

    const commentsHTML = commentItems.join('');

    // Добавляем новый список комментариев на страницу
    commentsList.insertAdjacentHTML('beforeend', commentsHTML);

    // Дополнительный код обработки комментариев, если нужно

    addCommentReplyEvent();
    setupLikeButtons();
}