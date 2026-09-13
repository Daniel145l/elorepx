<script setup lang="ts">
import { Menu } from 'lucide-vue-next';
</script>

<template>
  <header class="flex justify-between items-center py-5 px-5 align-middle border-b shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
    <RouterLink to="/">
      <img src="/logo.svg" alt="Elorepx">
    </RouterLink>
    <Menu :size="20"/>
  </header>
</template>