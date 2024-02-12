<script setup lang="ts"></script>

<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar title="Application bar"></v-app-bar>

    <v-main class="d-flex align-center justify-center">
      <router-view />
    </v-main>
  </v-layout>
</template>
