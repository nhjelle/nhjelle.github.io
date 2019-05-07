<template>
<div></div>
</template>
<script>
import initialPieces from './InitialPieces.json';
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
        this.createEmptyBoard();
        this.placeInitialPieces();
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
            for(let row = 0; row < initialPieces.length; row++){
                for(let col = 0; col < initialPieces[row].length; col++){
                    const pieceFields = initialPieces[row][col].split("-");
                    this.cells[row][col] = {
                        color: pieceFields[0],
                        type: pieceFields[1],
                        isThreatened: false,
                        hasMoved: false
                    };
                    // TODO: remember to set hasMoved after moving pawn for the first time
                }
            }
        },
        getPawnMoves(color, row, col, hasMoved){
            let moves = [];
            if(color === "white"){
                if(hasMoved === false){
                    moves.push({
                        row: row-2,
                        col: col
                    });
                }
                if(row > 0 && this.cells[row - 1][col].piece === null){
                    moves.push({
                        row: row-1,
                        col: col
                    });
                }
                if(row > 0 && col > 0){
                    if(this.validateMove(color, row-1, col-1))
                        moves.push({ row: row-1, col: col-1});
                }
                if(row > 0 && col < this.cells.length-1){
                    if(this.validateMove(color, row-1, col+1))
                        moves.push({ row: row-1, col: col+1});
                }
            } else {
                if(hasMoved === false){
                    moves.push({
                        row: row+2,
                        col: col
                    });
                }
                if(row < this.cells.length-1 && this.cells[row+1][col].piece === null){
                    moves.push({
                        row: row+1,
                        col: col
                    });
                }
                if(row < this.cells.length-1 && col < this.cells.length-1){
                    if(this.validateMove(color, row+1, col+1))
                        moves.push({ row: row+1, col: col+1});
                }
                if(row < this.cells.length-1 && col > 0){
                    if(this.validateMove(color, row+1, col-1))
                        moves.push({ row: row+1, col: col-1});
                }
            }
            return moves;
        },
        getRookMoves(color, row, col){
            const moves = [];
            for(let i = row-1; i >= 0; i--){
                if(this.validateMove(color, i, col))
                    moves.push({ row: i, col: col});
                else
                    break;
            }
            for(let i = row+1; row < this.cells.length; i++){
                if(this.validateMove(color, i, col))
                    moves.push({ row: i, col: col});
                else
                    break;
            }
            for(let i = col-1; i >= 0; i--){
                if(this.validateMove(color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
            }
            for(let i = col+1; row < this.cells.length; i++){
                if(this.validateMove(color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
            }
            return moves;
        },
        getKnightMoves(color, row, col){
            const moves = [];
            const offsets = [
                [-2, 1],
                [-2, -1],
                [-1, -2],
                [-1, 2],
                [1, -2],
                [1, 2],
                [1, -2],
                [1, 2]
            ];

            for(let offset of offsets){
                let newRow = row + offset[0];
                let newCol = col + offset[1];
                if(newRow >= 0 && newRow < this.cells.length && newCol >=  0 && newCol < this.cells.length){
                    if(this.validateMove(color, newRow, newCol))
                        moves.push({
                            row: newRow,
                            col: newCol
                        });
                }
            }

            return moves;
        },
        getBishopMoves(color, row, col){
            const moves = [];
            let currRow = row;
            let currCol = col;
            return moves;
        },
        getQueenMoves(color, row, col){
            return this.getRookMoves(color, row, col).concat(this.getBishopMoves(color, row, col));
        },
        getKingMoves(type, color, row, col){
            console.log(type+color+row+col);
        },
        validateMove(color, row, col){
            const piece = this.cells[row][col];
            if(piece == null || piece.color !== color){
                return true;
            }
            return false;
        },
        getLegalMovesForPiece(type, color, row, col, hasMoved){
            let moves = [];
            switch(type){
                case "pawn":
                    moves = this.getPawnMoves(color, row, col, hasMoved);
                    break;
                case "rook":
                    moves = this.getRookMoves(color, row, col);
                    break;
                case "knight":
                    moves = this.getKnightMoves(color, row, col);
                    break;
                case "bishop":
                    moves = this.getBishopMoves(color, row, col);
                    break;
                case "queen":
                    moves = this.getQueenMoves(color, row, col);
                    break;
                case "king":
                    moves = this.getKingMoves(color, row, col);
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