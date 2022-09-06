export default (targetParam, durationParam) => {
  const target = Math.round(targetParam);
  const duration = Math.round(durationParam);
  if (duration < 0) {
    return;
  }
  if (duration === 0) {
    window.scrollTo(0, target);
    return;
  }

  const startTime = Date.now();
  const endTime = startTime + duration;

  const startTop = window.scrollY;
  const distance = target - startTop;

  // based on http://en.wikipedia.org/wiki/Smoothstep
  const smoothStep = (start, end, point) => {
    if (point <= start) { return 0; }
    if (point >= end) { return 1; }
    const x = (point - start) / (end - start); // interpolation
    return x * x * (3 - (2 * x));
  };

  // This is to keep track of where the element's scrollTop is
  // supposed to be, based on what we're doing
  let previousTop = window.scrollY;

  // This is like a think function from a game loop
  const scrollFrame = () => {
    if (window.scrollY !== previousTop) {
      return;
    }

    // set the scrollTop for this frame
    const now = Date.now();
    const point = smoothStep(startTime, endTime, now);
    const frameTop = Math.round(startTop + (distance * point));
    window.scrollTo(0, frameTop);

    // check if we're done!
    if (now >= endTime) {
      return;
    }

    // If we were supposed to scroll but didn't, then we
    // probably hit the limit, so consider it done; not
    // interrupted.
    if (window.scrollY === previousTop
      && window.scrollY !== frameTop) {
      return;
    }
    previousTop = window.scrollY;

    // schedule next frame for execution
    setTimeout(scrollFrame, 0);
  };

  // boostrap the animation process
  setTimeout(scrollFrame, 0);
};
