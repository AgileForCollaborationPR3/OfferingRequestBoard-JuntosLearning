<template>
  <div class="row justify-center q-pa-xl">
    <div class="col-auto text-center">
      <q-avatar>
        <img :src="opacity ? jcLogo : jlLogo" class="wave-animation" ref="logo" />
      </q-avatar>
      <div
        :class="{ 'text-body1': true, 'lora': true, 'text-weight-bold': true, 'text-primary-20': opacity, 'text-primary': !opacity }">
        Juntos</div>
      <div
        :class="{ 'text-body2': true, 'nunito': true, 'text-weight-bold': true, 'text-primary-20': opacity, 'text-primary': !opacity }"
        style="line-height:0.5;">Learning</div>
      <div v-if="tagline"
        :class="{ 'text-body2': true, 'nunito': true, 'q-mt-lg': true, 'text-primary-20': opacity, 'text-primary': !opacity }">
        A Space to Exhange Learning Offerings & Requests in Your Community</div>
    </div>
  </div>
</template>

<script lang="js" setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from "vue";
import jlLogo from '../../assets/jl-logo.svg';
import jcLogo from '../../assets/jc-logo-20.svg';

const logo = ref(null);
let interval = null;

// Define props
defineProps({
  opacity: {
    type: Boolean,
    default: false, // Whether to show the stage name alongside the icon
  },
  tagline: {
    type: Boolean,
    default: false
  }
});

const startAnimation = () => {
  if (logo.value) {
    logo.value.style.animation = "wave 2s ease-in-out";
    setTimeout(() => {
      logo.value.style.animation = "none";
    }, 2000); // Stop the animation after 2 seconds
  }
};

onMounted(() => {
  startAnimation(); // Initial wave
  interval = setInterval(() => {
    startAnimation();
  }, 8000); // Trigger every 10 seconds
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<style>
.wave-animation {
  display: inline-block;
  transform-origin: center bottom;
  /* Pivot point for the waving effect */
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(15deg);
  }

  50% {
    transform: rotate(0deg);
  }

  75% {
    transform: rotate(-15deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
