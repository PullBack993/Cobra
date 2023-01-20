<script setup>
import { ref, computed } from "vue";

let isDragging = false;

let progress = 0;

let offset = 0;

let startX = 0;

let startProgress = 0;

let maxPos = 0;

let draggable = ref(null);

const onTouchStart = (event) => {
  event.preventDefault();
  onDragStart(event.touches[0].clientX);

  document.addEventListener("touchmove", onTouchMove);
  document.addEventListener("touchend", onTouchEnd);
};
const onTouchMove = (event) => {
  onDrag(event.touches[0].clientX);
};

const onTouchEnd = () => {
  onDragEnd();

  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
};

const onDragStart = (x) => {
  startX = x - offset;
  startProgress = progress;
};

const onMouseDown = (event) => {
  onDragStart(event.clientX);

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

const onMouseMove = (event) => {
  onDrag(event.clientX);
};

const onMouseUp = () => {
  onDragEnd();

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
};

const onDragEnd = () => {
  console.log(startProgress);
  console.log(progress);
  const diff = startProgress - progress;
  isDragging = false;
  console.log(diff);

  //emit
};

const onDrag = (x) => {
  const deltaX = x - startX;
  isDragging = deltaX !== 0;

  if (!isDragging) {
    return;
  }

  offset = Math.min(maxPos, Math.max(0, deltaX));
  progress = (offset / maxPos) * 100;

};

const handleStyle = computed(() => {
  let position = `${progress}%`;

  position = maxPos ? `${(maxPos / 100) * progress}px` : position;
  return {
    left: position,
  };
});
</script>

<template>
  <div
    ref="draggable"
    class="draggable"
    type="button"
    :class="{ 'is-dragging': isDragging }"
    :style="handleStyle"
    @touchstart="onTouchStart($event)"
    @mousedown.prevent="onMouseDown($event)"
  >
    asd
  </div>
</template>

<style lang="scss" scoped>
.draggable {
  border: none;
  background: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
    color: $white
  }
}
</style>
