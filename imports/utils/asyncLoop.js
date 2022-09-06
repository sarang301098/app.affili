export default (iterations, func, callback) => {
  let index = 0;
  let done = false;
  const loop = {
    next() {
      if (done) {
        return;
      }

      if (index < iterations) {
        index++;
        func(loop);
      } else {
        done = true;
        callback();
      }
    },

    iteration() {
      return index - 1;
    },

    break() {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
};
