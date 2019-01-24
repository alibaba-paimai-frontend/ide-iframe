import Chance from 'chance';
const chance = new Chance();

export function modelPropsGen() {
  return {
    styles: {
      container: {
        width: chance.integer({ min: 400, max: 600 }),
        height: chance.integer({ min: 300, max: 500 })
      }
    },
    allowFullScreen: chance.bool(),
    showFullScreenIcon: chance.bool(),
    url: 'http://www.runoob.com/js/js-tutorial.html'
  };
}
