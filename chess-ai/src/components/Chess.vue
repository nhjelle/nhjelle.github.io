<template>
</template>
<script>
export default {
    name: 'Chess',
    props: {
    },
    data: function(){
            return {
                cells: []
            }
    },
    created() {
        createEmptyBoard();
        placeInitialPieces();
    },
    methods: {
        createEmptyBoard(){
        for(let row = 0; row < 8; row++){
            this.cells.push([]);
            for(let col = 0; col < 8; col++){
                this.cells[row][col] = {
                    color: row+col % 2 == 0 ? "white" : "black",
                    piece: null
                }
            }
        }
        },
        placeInitialPieces(){
            // TODO: place the pieces in starting positions
        },
        getLegalMovesForPiece(type, color, position){
            let moves = [];
            // TODO: initial broad phase move generation
            switch(type){
                case "pawn":
                    break;
                case "rook":
                    break;
                case "knight":
                    break;
                case "bishop":
                    break;
                case "queen":
                    break;
                case "king":
                    break;
            }
            // TODO: trim any moves that put king in check
            return moves;
        }
    }
}
</script>
<style scoped>
</style>