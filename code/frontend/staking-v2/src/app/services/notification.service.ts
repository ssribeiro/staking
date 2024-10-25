import moment from "moment";

export const notification = (type: string, title: string, link: string = '', linkText: string = '', duration: number = 4000) => {

    const el: any = document.getElementById('notifications');
    const id = `notification-${moment().unix()}`;
    const html = `<div id="${id}" class="${type}"><img class="img-success" src="/images/icon/icon-success.svg" /><img class="img-warning" src="/images/icon/icon-warning.svg" /><h4>${title}</h4><a href="${link}" target="_blank">${linkText}</a></div>`;
    el.insertAdjacentHTML( 'beforeend', html);

    setTimeout(() => {
        let el: any = document.getElementById(id);
        el.remove();
    }, duration);
}
