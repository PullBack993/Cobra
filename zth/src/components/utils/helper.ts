export const handleScrollBoxWheel = (event: WheelEvent) => {
    // Scroll the scrollable box only when the cursor is inside it
    const scrollBox = event.currentTarget as HTMLElement;
    const scrollBoxRect = scrollBox?.getBoundingClientRect();

    if (
      event.clientX >= scrollBoxRect.left &&
      event.clientX <= scrollBoxRect.right &&
      event.clientY >= scrollBoxRect.top &&
      event.clientY <= scrollBoxRect.bottom
    ) {
      // If the cursor is inside the scrollable box, scroll it
      scrollBox.scrollTop += event.deltaY;
      event.preventDefault();
    }
  };