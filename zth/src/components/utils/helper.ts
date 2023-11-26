let lastScrollTime = 0;
const THROTTLE_SCROLL_TIME = 10;

export const handleScrollBoxWheel = (event: WheelEvent) => {
  const currentTime = new Date().getTime();

  if (currentTime - lastScrollTime >= THROTTLE_SCROLL_TIME) {
    const scrollBox = event.currentTarget as HTMLElement;
    const scrollBoxRect = scrollBox?.getBoundingClientRect();

    if (scrollBoxRect) {
      const isCursorInsideScrollBox =
        event.clientX >= scrollBoxRect?.left &&
        event.clientX <= scrollBoxRect?.right &&
        event.clientY >= scrollBoxRect?.top &&
        event.clientY <= scrollBoxRect?.bottom;

      // If the cursor is inside the scrollable box, scroll it
      if (isCursorInsideScrollBox) {
        scrollBox.scrollTop += event.deltaY;
        event.preventDefault();
      }

      // If the cursor is outside the scrollable box, prevent scrolling the page
      if (!isCursorInsideScrollBox) {
        event.preventDefault();
      }
    }

    lastScrollTime = currentTime;
  }
};

export const throttle = (fn: Function, wait: number): any => {
  let isCalled = false;
  let timer: any;

  return (...args: any[]): any => {
    if (!isCalled) {
      fn(...args);
      isCalled = true;
      setTimeout(() => {
        isCalled = false;
      }, wait);
    } else {
      if (timer) {
        clearTimeout(timer);
      }

      // call event last time because it may blocked
      timer = setTimeout(() => {
        fn(...args);
      }, wait);
    }
  };
};
