<template>
    <div>
        <div class="thinking">
            <span v-if="aiThinking">AI is thinking...</span>
            <span v-else>Player turn</span>
        </div>
        <div class="chessboard">
            <div class="gameover" v-if="winner != ''">
                <div class="gameover-text">The winner is: {{winner}}</div>
                <div class="button-group"><button @click="restartGame">Play again</button></div>
            </div>
            <div v-for="(row, rowIndex) in displayBoard" :key="rowIndex">
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
/* eslint-disable no-console */
import initialPieces from './InitialPieces.json';
export default {
    name: 'chess-ai',
    props: {
    },
    data: function(){
            return {
                aiThinking: false,
                selectedCell: null,
                legalMoves: [],
                cells: [],
                displayBoard: [],
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
                },
                aiMove: {value: -Infinity, move: null, min: Infinity},
                winner: '',
                shadedCells: {}
            }
    },
    created() {
        this.createEmptyBoard();
        this.placeInitialPieces();
    },
    methods: {
        restartGame(){
            this.cells = [];
            this.legalMoves = [];
            this.displayBoard = [];
            this.aiMove = {value: -Infinity, move: null, min: Infinity};
            this.winner = '';
            this.selectedCell = null;
            this.shadedCells = [];
            this.createEmptyBoard();
            this.placeInitialPieces();
            this.reshadeCells();
        },
        capturePiece(piece){
            if(piece.color == 'black'){
                this.capturedBlackPieces.push(piece);
            } else {
                this.capturedWhitePieces.push(piece);
            }
        },
        movePiece(startPosition, endPosition){
            const startPiece = this.cells[startPosition.row][startPosition.col].piece;
            const endPiece = this.cells[endPosition.row][endPosition.col].piece;
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
            cellClass.push('cell');
            return cellClass;
        },
        checkGameover(){
            if(this.isCheckmate('white')){
                this.winner = "black";
                return true;
            } else if(this.isCheckmate('black')) {
                this.winner = "white";
                return true;
            }
            return false;
        },  
        async playAIMove(){
            this.aiThinking = true;
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.$nextTick();
            await this.alphaBetaMax(-Infinity, Infinity, 4, true);
            this.movePiece(this.aiMove.move.piecePos, this.aiMove.move.movePos);
            this.aiMove = {value: -Infinity, move: null, min: Infinity};
            if(this.checkGameover()) return;
            await new Promise(resolve => setTimeout(resolve, 2000));
            for(let cell of Object.keys(this.shadedCells)){
                let cellPosition = cell.split(",").map(x => Number(x));
                this.cells[cellPosition[0]][cellPosition[1]].value = null;
            }
            this.reshadeCells();
            this.shadedCells = {};
        },
        async selectCell(row, col){
            if(!this.aiThinking){
                if(this.selectedCell){
                    if(row == this.selectedCell.row && col == this.selectedCell.col){
                        this.selectedCell = null;
                        if(this.legalMoves && this.legalMoves.length > 0){
                            for(let move of this.legalMoves){
                                this.cells[move.row][move.col].legalMove = false;
                            }
                        }
                    } else {
                        if(this.legalMoves && this.legalMoves.some(cell => cell.row === row && cell.col === col)){
                            // move piece
                            this.movePiece(this.selectedCell, {row: row, col: col});
                            // reset selected piece after move
                            this.selectCell(this.selectedCell.row, this.selectedCell.col);
                            this.displayBoard = this.cloneBoard(this.cells);
                            if(this.checkGameover()){
                                console.log("Game over.");
                                return;
                            } else {
                                await this.playAIMove();
                                await this.$nextTick();
                                this.displayBoard = this.cloneBoard(this.cells);
                                this.aiThinking = false;
                            }
                        }
                    }
                } else {
                    // no cell selected
                    let piece = this.cells[row][col].piece;
                    if(piece && piece.color === 'white'){
                        this.selectedCell = {row: row, col: col};
                        let pseudoLegals = this.getPsuedoLegalsForPiece(piece.type, piece.color, row, col);
                        this.legalMoves = this.trimToLegals(pseudoLegals, "white").map(function(move) { return move.movePos });
                        if(this.legalMoves && this.legalMoves.length > 0){
                            for(let move of this.legalMoves){
                                this.cells[move.row][move.col].legalMove = true;
                            }
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
                        row: row,
                        col: col,
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
                        isThreatened: false
                    };
                }
            }
            this.displayBoard = this.cloneBoard(this.cells);
        },
        getPawnMoves(color, row, col){
            let moves = [];
            if(color === "white"){
                if(row === 6 && !this.cells[row-1][col].piece && !this.cells[row-2][col].piece){
                    moves.push({
                        row: row-2,
                        col: col
                    });
                }
                if(row > 0 && !this.cells[row - 1][col].piece){
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
                if(row === 1 && !this.cells[row+1][col].piece && !this.cells[row+2][col].piece){
                    moves.push({
                        row: row+2,
                        col: col
                    });
                }
                if(row < this.cells.length-1 && !this.cells[row+1][col].piece){
                    moves.push({
                        row: row+1,
                        col: col
                    });
                }
                if(row < this.cells.length-1 && col < this.cells.length-1){
                    let cellPiece = this.cells[row+1][col+1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row+1, col: col+1});
                }
                if(row < this.cells.length-1 && col > 0){
                    let cellPiece = this.cells[row+1][col-1].piece;
                    if(cellPiece && cellPiece.color != color)
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
        trimToLegals(moves, color){
            for(let i = moves.length-1; i >= 0; i--){
                let piecePos = moves[i].piecePos;
                let movePos = moves[i].movePos;
                const capturedPiece = this.cells[movePos.row][movePos.col].piece ? Object.assign({}, this.cells[movePos.row][movePos.col].piece) : null;
                this.movePiece(piecePos, movePos);
                if(this.isThreatened(this.getKingPosition(color), color)){
                    moves.splice(i, 1);
                }
                this.cells[piecePos.row][piecePos.col].piece = this.cells[movePos.row][movePos.col].piece
                this.cells[movePos.row][movePos.col].piece = capturedPiece;
            }
            return moves;
        },
        getPsuedoLegalsForPiece(type, color, row, col){
            let moves = [];
            switch(type){
                case "pawn":
                    moves = this.getPawnMoves(color, row, col);
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
            return moves.map(function(move) {
                return {piecePos: {row, col}, movePos: move};
            });
        },
        isThreatened(piecePosition, color){
            for(let row of this.cells){
                for(let cell of row){
                    if(cell.piece && cell.piece.color !== color){
                        // opposing piece, check if it threatens king
                        const moves = this.getPsuedoLegalsForPiece(cell.piece.type, cell.piece.color, cell.row, cell.col);
                        const threateningMove = moves.filter(function(move){
                            return move.movePos.row == piecePosition.row && move.movePos.col == piecePosition.col;
                        });
                        if(threateningMove && threateningMove.length && threateningMove.length > 0){
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        cloneBoard(board){
            const clonedBoard = [];
            for(let row of board){
                clonedBoard.push(row.map(function(cell) { 
                    const clonedCell = Object.assign({}, cell);
                    if(clonedCell.piece) clonedCell.piece = Object.assign({}, clonedCell.piece);
                    return clonedCell;
                }));
            }
            return clonedBoard;
        },
        getKingPosition(color){
            let kingCell;
            for(let row of this.cells){
                kingCell = row.filter(function(cell){
                    return cell.piece && cell.piece.type === 'king' && cell.piece.color === color;
                });
                if(kingCell && kingCell.length > 0) {
                    kingCell = kingCell[0];
                    break;
                }
            }
            return {row: kingCell.row, col: kingCell.col};
        },
        isCheckmate(color){
            let self = this;
            let moves = this.cells
                .map(function(row) {
                    return row.filter(function(cell){ return cell.piece && cell.piece.color === color; });
                })
                .flat()
                .map(function(cell) {
                    return self.trimToLegals(self.getPsuedoLegalsForPiece(cell.piece.type, cell.piece.color, cell.row, cell.col), color);
                })
                .flat();
            return moves.length === 0;
        },
        getAllPieceMovesForColor(color){
            let self = this;
            let friendlyPieces = [];
            for(let row of this.cells){
                friendlyPieces = friendlyPieces.concat(row.filter(function(cell){
                    return cell.piece && cell.piece.color === color;
                }).map(function(cell){
                    return { 
                        pos: { row: cell.row, col: cell.col },
                        piece: cell.piece, 
                        moves: self.trimToLegals(self.getPsuedoLegalsForPiece(cell.piece.type, cell.piece.color, cell.row, cell.col), color)
                    };
                }));
            }
            return friendlyPieces;
        },
        reshadeCells(){
            for(let shadedCell of Object.keys(this.shadedCells)){
                let cellPosition = shadedCell.split(",").map(x => Number(x));
                this.shadeCell(cellPosition[0], cellPosition[1]);
            }
        },
        rgbToHex(rgb){
            var hex = Math.round(Number(rgb)).toString(16);
            if (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        },
        shadeCell(row, col){
            let cell;
            if(document.querySelector('chess-ai')){
                cell = document.querySelector('chess-ai').shadowRoot.getElementById(`cell-${row}-${col}`);
            } else {
                cell = document.getElementById(`cell-${row}-${col}`);
            }
            if(this.cells[row][col].value){
                let maxColor;
                let adjustedColor;
                if(this.aiMove.min < 0){
                    maxColor = 1 + this.aiMove.value + Math.abs(this.aiMove.min);
                    adjustedColor = 1 + this.cells[row][col].value + Math.abs(this.aiMove.min);
                } else {
                    maxColor = 1 + this.aiMove.value - this.aiMove.min;
                    adjustedColor = 1 + this.cells[row][col].value - Math.abs(this.aiMove.min);
                }
                let weight = 255 / maxColor;
                var red = this.rgbToHex(255);
                var green = this.rgbToHex(255 - Math.min(adjustedColor * weight, 255));
                var blue = this.rgbToHex(0);
                cell.style.backgroundColor = '#' + red+green+blue;
            } else {
                cell.style.backgroundColor = this.cells[row][col].color === 'white' ? '#fff' : '#999';
            }
        },
        async alphaBetaMax(alpha, beta, remainingDepth, isInitialMove){
            if(remainingDepth == 0){
                return this.evaluateBoard();
            }
            for(let pieceMove of this.getAllPieceMovesForColor("black")){
                for(let move of pieceMove.moves){
                    // for each move, perform move
                    let capturedPiece = this.cells[move.movePos.row][move.movePos.col].piece ? Object.assign({}, this.cells[move.movePos.row][move.movePos.col].piece) : null;
                    this.movePiece(move.piecePos, move.movePos);
                    let score = await this.alphaBetaMin(alpha, beta, remainingDepth-1);
                    if(isInitialMove){
                        if(score > this.aiMove.value){
                            this.aiMove.value = score;
                            this.aiMove.move = move;
                        }
                        this.aiMove.min = this.aiMove.min ? Math.min(this.aiMove.min, score) : Infinity;
                        if(!this.cells[move.movePos.row][move.movePos.col].value)
                            this.cells[move.movePos.row][move.movePos.col].value = score;
                        else
                            this.cells[move.movePos.row][move.movePos.col].value = Math.max(score, this.cells[move.movePos.row][move.movePos.col].value);
                        this.shadedCells[`${move.movePos.row},${move.movePos.col}`] = this.cells[move.movePos.row][move.movePos.col].value;
                        this.reshadeCells();
                        await new Promise(resolve => setTimeout(resolve, 50));
                        await this.$nextTick();
                    }
                    this.cells[move.piecePos.row][move.piecePos.col].piece = Object.assign({}, this.cells[move.movePos.row][move.movePos.col].piece);
                    this.cells[move.movePos.row][move.movePos.col].piece = capturedPiece;
                    if(score >= beta){
                        //console.log(`Returning bc beta: ${score}`);
                        return beta;
                    }
                    if(score > alpha){
                        alpha = score;
                    }
                }
            }
            return alpha;
        },
        async alphaBetaMin(alpha, beta, remainingDepth){
            if(remainingDepth == 0){
                return -this.evaluateBoard();
            }
            for(let pieceMove of this.getAllPieceMovesForColor("white")){
                for(let move of pieceMove.moves){
                    // for each move, perform move
                    let capturedPiece = this.cells[move.movePos.row][move.movePos.col].piece ? Object.assign({}, this.cells[move.movePos.row][move.movePos.col].piece) : null;
                    this.movePiece(move.piecePos, move.movePos);
                    let score = await this.alphaBetaMax(alpha, beta, remainingDepth-1, false);
                    this.cells[move.piecePos.row][move.piecePos.col].piece = Object.assign({}, this.cells[move.movePos.row][move.movePos.col].piece);
                    this.cells[move.movePos.row][move.movePos.col].piece = capturedPiece;
                    if(score <= alpha){
                        //console.log(`Returning bc alpha: ${score}`);
                        return alpha;
                    }
                    if(score < beta){
                        beta = score;
                    }
                }
            }
            return beta;
        },
        evaluateBoard(){
            const moveCounts = {
                white: 0,
                black: 0
            };
            const pieceCounts = {
                white: {
                    pawn: 0,
                    rook: 0,
                    knight: 0,
                    bishop: 0,
                    queen: 0,
                    king: 0
                },
                black: {
                    pawn: 0,
                    rook: 0,
                    knight: 0,
                    bishop: 0,
                    queen: 0,
                    king: 0
                }
            };
            for(let row of this.cells){
                for(let cell of row){
                    if(cell.piece){
                        pieceCounts[cell.piece.color][cell.piece.type]++;
                        moveCounts[cell.piece.color] += this.getPsuedoLegalsForPiece(cell.piece.type,
                            cell.piece.color, cell.row, cell.col).length;
                    }
                }   
            }
            let materialScore = 200  * (pieceCounts.black.king-pieceCounts.white.king)
              + 10 * (pieceCounts.black.queen-pieceCounts.white.queen)
              + 6 * (pieceCounts.black.rook-pieceCounts.white.rook)
              + 4 * (pieceCounts.black.knight-pieceCounts.white.knight)
              + 4 * (pieceCounts.black.bishop-pieceCounts.white.bishop)
              + 2 * (pieceCounts.black.pawn-pieceCounts.white.pawn);

            let mobilityScore = 0.1 * (moveCounts.black-moveCounts.white);
            let score = (materialScore + mobilityScore);

            return score;
        }
    }
}
</script>
<style>
.thinking {
    z-index:200;
    background-color: white;
    position: relative;
    width: 200px;
    left:240px;
    text-align:center;
    font-size:125%;
    font-weight:300;
    border: 2px solid black;
    border-bottom: 0;
}
.gameover {
    border-radius: 25px;
    z-index: 10;
    position: absolute;
    width: 200px;
    height: 100px;
    border: 2px solid black;
    background-color:lightslategrey;
    top: 350px;
    left: 270px;
}
.gameover-text {
    margin-top: 10px;
    color:white;
    font-weight: 700;
    font-size: 120%;
}
.button-group {
    margin-top: 15px;
}
button{
    background-color:#f14e4e;
    display:inline-block;
    padding:0.3em 1.2em;
    margin:0 0.1em 0.1em 0;
    border:0.16em solid rgba(255,255,255,0);
    border-radius:2em;
    box-sizing: border-box;
    text-decoration:none;
    font-family:'Roboto',sans-serif;
    font-weight:300;
    color:#FFFFFF;
    text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35);
    text-align:center;
    transition: all 0.2s;
}
button:hover{
    border-color: rgba(255,255,255,1);
}
.chessboard {
    width: 640px;
    height: 640px;
    margin: 0px;
    border: 25px solid #333;
}
.cell {
    float: left;
    width: 80px;
    height: 80px;
    font-size:50px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}
.black {
    background-color: #999;
}
.white {
    background-color: #fff;
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
