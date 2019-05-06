<template>
  <div id="app">
    <Chess/>
  </div>
</template>

<script>
import Chess from './components/chess.vue';
export default {
  name: 'app',
  components: {
    Chess
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
