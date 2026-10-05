
const plate = (el, a, b) => { el.style.transform = `translateY(${px(a)})`; el.style.height = px(Math.max(0, b - a)); };