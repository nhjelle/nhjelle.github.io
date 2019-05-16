<template>
    <div>
        <div class="chessboard">
            <div v-for="(row, rowIndex) in cells" :key="rowIndex">
                <div :id="'cell-'+rowIndex+'-'+cellIndex" :class="getCellClass(cell, rowIndex, cellIndex)" 
                    @click="selectCell(rowIndex, cellIndex)" v-for="(cell, cellIndex) in row" :key="cellIndex">
                    <span unselectable="on" class="piece" v-if="cell.piece" v-html="pieceCodes[cell.piece.color][cell.piece.type]">
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import initialPieces from './InitialPieces.json';
export default {
    name: 'Chess',
    props: {
    },
    data: function(){
            return {
                selectedCell: null,
                legalMoves: [],
                cells: [],
                capturedWhitePieces: [],
                capturedBlackPieces: [],
                pieceCodes: {
                    white: {
                        king: '&#9812;',
                        queen: '&#9813;',
                        rook: '&#9814;',
                        bishop: '&#9815;',
                        knight: '&#9816;',
                        pawn: '&#9817;'
                    },
                    black: {
                        king: '&#9818;',
                        queen: '&#9819;',
                        rook: '&#9820;',
                        bishop: '&#9821;',
                        knight: '&#9822;',
                        pawn: '&#9823;'
                    }
                }
            }
    },
    created() {
        this.createEmptyBoard();
        this.placeInitialPieces();
    },
    methods: {
        capturePiece(piece){
            if(piece.color == 'black'){
                this.capturedBlackPieces.push(piece);
            } else {
                this.capturedWhitePieces.push(piece);
            }
            if(piece.type === 'king'){
                // end game
            }
        },
        movePiece(startPosition, endPosition){
            const startPiece = this.cells[startPosition.row][startPosition.col].piece;
            startPiece.hasMoved = true;
            const endPiece = this.cells[endPosition.row][endPosition.col].piece;
            const color = startPiece.color;
            if(endPiece){
                this.capturePiece(endPiece);
            }
            this.cells[endPosition.row][endPosition.col].piece = startPiece;
            this.cells[startPosition.row][startPosition.col].piece = null;
        },
        getCellClass(cell, rowIndex, cellIndex){
            const cellClass = [];
            cellClass.push(cell.color);
            if(this.selectedCell && this.selectedCell.row == rowIndex && this.selectedCell.col == cellIndex) cellClass.push('selected');
            if(this.cells[rowIndex][cellIndex].legalMove) cellClass.push('legal-move');
            return cellClass;
        },
        selectCell(row, col){
            if(this.selectedCell){
                if(row == this.selectedCell.row && col == this.selectedCell.col){
                    this.selectedCell = null;
                    if(this.legalMoves && this.legalMoves.length > 0){
                        for(let move of this.legalMoves){
                            this.cells[move.row][move.col].legalMove = false;
                        }
                    }
                    return;
                } else {
                    if(this.legalMoves && this.legalMoves.some(cell => cell.row === row && cell.col === col)){
                        // move piece
                        this.movePiece(this.selectedCell, {row: row, col: col});
                        // reset selected piece after move
                        this.selectCell(this.selectedCell.row, this.selectedCell.col);
                    }
                }
                // validate move
            } else {
                // no cell selected
                let piece = this.cells[row][col].piece;
                if(piece && piece.color === 'white'){
                    this.selectedCell = {row: row, col: col};
                    this.legalMoves = this.getLegalMovesForPiece(piece.type, piece.color, row, col, piece.hasMoved);
                    if(this.legalMoves && this.legalMoves.length > 0){
                        for(let move of this.legalMoves){
                            this.cells[move.row][move.col].legalMove = true;
                        }
                    }
                }
            }
        },
        createEmptyBoard(){
            for(let row = 0; row < 8; row++){
                this.cells.push([]);
                for(let col = 0; col < 8; col++){
                    this.cells[row][col] = {
                        color: (row+col) % 2 == 0 ? "white" : "black",
                        piece: null,
                        legalMove: false
                    }
                }
            } 
        },
        placeInitialPieces(){
            for(let row = 0; row < initialPieces.length; row++){
                for(let col = 0; col < initialPieces[row].length; col++){
                    const pieceFields = initialPieces[row][col].split("-");
                    this.cells[row][col].piece = {
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
                if(hasMoved === false && !this.cells[row-1][col].piece){
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
                    let cellPiece = this.cells[row-1][col-1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row-1, col: col-1});
                }
                if(row > 0 && col < this.cells.length-1){
                    let cellPiece = this.cells[row-1][col+1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row-1, col: col+1});
                }
            } else {
                if(hasMoved === false && !this.cells[row+1][col].piece){
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
                if((this.cells[i][col] || {}).piece) break;
            }
            for(let i = row+1; row < this.cells.length; i++){
                if(this.validateMove(color, i, col))
                    moves.push({ row: i, col: col});
                else
                    break;
                if((this.cells[i][col] || {}).piece) break;
            }
            for(let i = col-1; i >= 0; i--){
                if(this.validateMove(color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
                if((this.cells[row][i] || {}).piece) break;
            }
            for(let i = col+1; row < this.cells.length; i++){
                if(this.validateMove(color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
                if((this.cells[row][i] || {}).piece) break;
            }
            return moves;
        },
        getKnightMoves(color, row, col){
            const moves = [];
            const offsets = [
                [-2, 1],
                [-2, -1],
                [2, 1],
                [2, -1],
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
                    if(this.validateMove(color, newRow, newCol))
                        moves.push({
                            row: newRow,
                            col: newCol
                        });
            }

            return moves;
        },
        getBishopMoves(color, row, col){
            const moves = [];
            for(let i = 1; i < this.cells.length; i++){
                if(this.validateMove(color, row+i, col+i))
                    moves.push({
                        row: row+i,
                        col: col+i
                    });
                else break;
                if((this.cells[row+i][col+i] || {}).piece) break;
            }
            for(let i = 1; i < this.cells.length; i++){
                if(this.validateMove(color, row+i, col-i))
                    moves.push({
                        row: row+i,
                        col: col-i
                    });
                else break;
                if((this.cells[row+i][col-i] || {}).piece) break;
            }
            for(let i = 1; i < this.cells.length; i++){
                if(this.validateMove(color, row-i, col+i))
                    moves.push({
                        row: row-i,
                        col: col+i
                    });
                else break;
                if((this.cells[row-i][col+i] || {}).piece) break;
            }
            for(let i = 1; i < this.cells.length; i++){
                if(this.validateMove(color, row-i, col-i))
                    moves.push({
                        row: row-i,
                        col: col-i
                    });
                else break;
                if((this.cells[row-i][col-i] || {}).piece) break;
            }
            return moves;
        },
        getQueenMoves(color, row, col){
            return this.getRookMoves(color, row, col).concat(this.getBishopMoves(color, row, col));
        },
        getKingMoves(color, row, col){
            const moves = [];
            const offsets = [
                [0, 1],
                [0, -1],
                [1, 0],
                [1, 1],
                [1, -1],
                [-1, 0],
                [-1, 1],
                [-1, -1],
            ];
            for(let offset of offsets){
                let newRow = row + offset[0];
                let newCol = col + offset[1];
                if(this.validateMove(color, newRow, newCol))
                    moves.push({
                        row: newRow,
                        col: newCol
                    });
            }

            return moves;
        },
        validateMove(color, row, col){
            if(row >= this.cells.length || col >= this.cells.length || row < 0 || col < 0) return false;
            const piece = this.cells[row][col].piece;
            return piece == null || piece.color !== color;
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
.chessboard {
    width: 640px;
    height: 640px;
    margin: 20px;
    border: 25px solid #333;
}
.black {
    float: left;
    width: 80px;
    height: 80px;
    background-color: #999;
      font-size:50px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}
.white {
    float: left;
    width: 80px;
    height: 80px;
    background-color: #fff;
    font-size:50px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}
.selected {
    background-color:chartreuse !important;
    outline:3px solid black;
    outline-offset: -3px;
    cursor: pointer;
}
.piece:hover {
    cursor: pointer;
}

.piece {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.legal-move {
    background-color:gold !important;
    outline:3px solid black;
    outline-offset: -3px;
    cursor: pointer;
}
</style>
