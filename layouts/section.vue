<script setup>
import Logo1 from '../components/logo-1.svg';
</script>

<template>
    <div class="slidev-layout cover section">
        <div class="content w-full h-full flex flex-col justify-center items-center">
            <Logo1 class="mb-8" />
            <slot />
        </div>
    </div>
</template>

<style scoped>
    .content > :deep(:where(h1, h2, h3, h4, h5, h6)) {
        @apply uppercase font-light mt-6;
    }
</style>
