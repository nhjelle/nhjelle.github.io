<template>
    
</template>
<script>
export default {
    name: 'piece',
    props: {
        name: {
            type: String,
            default: "pawn"
        },
        position: {
            type: Object,
            default: function() {
                return {
                    row: 0,
                    col: 0
                }
            }
        },
        color: {
            type: String,
            default: "white"
        }
    },
}
</script>
<style scoped>

</style>

