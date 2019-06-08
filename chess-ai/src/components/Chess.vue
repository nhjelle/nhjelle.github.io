<template>
    <div>
        <div class="chessboard">
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
                aiMove: {value: -Infinity, move: null},
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
        },
        movePiece(board, startPosition, endPosition){
            const startPiece = board[startPosition.row][startPosition.col].piece;
            const endPiece = board[endPosition.row][endPosition.col].piece;
            if(endPiece){
                this.capturePiece(endPiece);
            }
            board[endPosition.row][endPosition.col].piece = startPiece;
            board[startPosition.row][startPosition.col].piece = null;
        },
        getCellClass(cell, rowIndex, cellIndex){
            const cellClass = [];
            cellClass.push(cell.color);
            if(this.selectedCell && this.selectedCell.row == rowIndex && this.selectedCell.col == cellIndex) cellClass.push('selected');
            if(this.cells[rowIndex][cellIndex].legalMove) cellClass.push('legal-move');
            return cellClass;
        },
        playAIMove(){
            let alphaBetaBoard = this.cloneBoard(this.cells);
            console.log(this.alphaBetaMax(alphaBetaBoard, -Infinity, Infinity, 4, true));
            console.log(this.aiMove);
            this.movePiece(this.cells, this.aiMove.move.piecePos, this.aiMove.move.movePos);
            this.aiMove = {value: -Infinity, move: null};
            if(this.getKingStatus(this.cells, 'white') == 'checkmate' 
                || this.getKingStatus(this.cells, 'black') == 'checkmate'){
                console.log("Game over.");
                // display gameover
            }
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
                        this.movePiece(this.cells, this.selectedCell, {row: row, col: col});
                        this.displayBoard = this.cloneBoard(this.cells);
                        // reset selected piece after move
                        this.selectCell(this.selectedCell.row, this.selectedCell.col);
                        if(this.getKingStatus(this.cells, 'white') == 'checkmate' 
                            || this.getKingStatus(this.cells, 'black') == 'checkmate'){
                            console.log("Game over.");
                            // display gameover
                        } else {
                            this.playAIMove();
                            this.displayBoard = this.cloneBoard(this.cells);
                            // AI move
                        }
                    }
                }
            } else {
                // no cell selected
                let piece = this.cells[row][col].piece;
                if(piece && piece.color === 'white'){
                    this.selectedCell = {row: row, col: col};
                    let pseudoLegals = this.getPsuedoLegalsForPiece(this.cells, piece.type, piece.color, row, col);
                    const kingPos = this.getKingPosition(this.cells, 'white');
                    let self = this;
                    this.legalMoves = this.trimToLegals(this.cells, pseudoLegals).map(function(move) { return move.movePos });
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
        getPawnMoves(board, color, row, col){
            let moves = [];
            if(color === "white"){
                if(row === 6 && !board[row-1][col].piece && !board[row-2][col].piece){
                    moves.push({
                        row: row-2,
                        col: col
                    });
                }
                if(row > 0 && board[row - 1][col].piece === null){
                    moves.push({
                        row: row-1,
                        col: col
                    });
                }
                if(row > 0 && col > 0){
                    let cellPiece = board[row-1][col-1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row-1, col: col-1});
                }
                if(row > 0 && col < board.length-1){
                    let cellPiece = board[row-1][col+1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row-1, col: col+1});
                }
            } else {
                if(row === 1 && !board[row+1][col].piece && !board[row+2][col].piece){
                    moves.push({
                        row: row+2,
                        col: col
                    });
                }
                if(row < board.length-1 && !board[row+1][col].piece && !board[row+2][col].piece){
                    moves.push({
                        row: row+1,
                        col: col
                    });
                }
                if(row < board.length-1 && col < board.length-1){
                    let cellPiece = board[row+1][col+1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row+1, col: col+1});
                }
                if(row < board.length-1 && col > 0){
                    let cellPiece = board[row+1][col-1].piece;
                    if(cellPiece && cellPiece.color != color)
                        moves.push({ row: row+1, col: col-1});
                }
            }
            return moves;
        },
        getRookMoves(board, color, row, col){
            const moves = [];
            for(let i = row-1; i >= 0; i--){
                if(this.validateMove(board, color, i, col))
                    moves.push({ row: i, col: col});
                else
                    break;
                if((board[i][col] || {}).piece) break;
            }
            for(let i = row+1; row < board.length; i++){
                if(this.validateMove(board, color, i, col))
                    moves.push({ row: i, col: col});
                else
                    break;
                if((board[i][col] || {}).piece) break;
            }
            for(let i = col-1; i >= 0; i--){
                if(this.validateMove(board, color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
                if((board[row][i] || {}).piece) break;
            }
            for(let i = col+1; row < board.length; i++){
                if(this.validateMove(board, color, row, i))
                    moves.push({ row: row, col: i});
                else
                    break;
                if((board[row][i] || {}).piece) break;
            }
            return moves;
        },
        getKnightMoves(board, color, row, col){
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
                    if(this.validateMove(board, color, newRow, newCol))
                        moves.push({
                            row: newRow,
                            col: newCol
                        });
            }

            return moves;
        },
        getBishopMoves(board, color, row, col){
            const moves = [];
            for(let i = 1; i < board.length; i++){
                if(this.validateMove(board, color, row+i, col+i))
                    moves.push({
                        row: row+i,
                        col: col+i
                    });
                else break;
                if((board[row+i][col+i] || {}).piece) break;
            }
            for(let i = 1; i < board.length; i++){
                if(this.validateMove(board, color, row+i, col-i))
                    moves.push({
                        row: row+i,
                        col: col-i
                    });
                else break;
                if((board[row+i][col-i] || {}).piece) break;
            }
            for(let i = 1; i < board.length; i++){
                if(this.validateMove(board, color, row-i, col+i))
                    moves.push({
                        row: row-i,
                        col: col+i
                    });
                else break;
                if((board[row-i][col+i] || {}).piece) break;
            }
            for(let i = 1; i < board.length; i++){
                if(this.validateMove(board, color, row-i, col-i))
                    moves.push({
                        row: row-i,
                        col: col-i
                    });
                else break;
                if((board[row-i][col-i] || {}).piece) break;
            }
            return moves;
        },
        getQueenMoves(board, color, row, col){
            return this.getRookMoves(board, color, row, col).concat(this.getBishopMoves(board, color, row, col));
        },
        getKingMoves(board, color, row, col){
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
                if(this.validateMove(board, color, newRow, newCol))
                    moves.push({
                        row: newRow,
                        col: newCol
                    });
            }

            return moves;
        },
        validateMove(board, color, row, col){
            //console.log(board);
            if(row >= board.length || col >= board.length || row < 0 || col < 0) return false;
            const piece = board[row][col].piece;
            return piece == null || piece.color !== color;
        },
        trimToLegals(board, moves){
            for(let i = moves.length-1; i >= 0; i--){
                let checkTestBoard = this.cloneBoard(board);
                this.movePiece(checkTestBoard, moves[i].piecePos, moves[i].movePos);
                if(this.isThreatened(checkTestBoard, this.getKingPosition(checkTestBoard, 'black'), 'black')){
                    moves.splice(i, 1);
                }
            }
            return moves;
        },
        getPsuedoLegalsForPiece(board, type, color, row, col){
            let moves = [];
            switch(type){
                case "pawn":
                    moves = this.getPawnMoves(board, color, row, col);
                    break;
                case "rook":
                    moves = this.getRookMoves(board, color, row, col);
                    break;
                case "knight":
                    moves = this.getKnightMoves(board, color, row, col);
                    break;
                case "bishop":
                    moves = this.getBishopMoves(board, color, row, col);
                    break;
                case "queen":
                    moves = this.getQueenMoves(board, color, row, col);
                    break;
                case "king":
                    moves = this.getKingMoves(board, color, row, col);
                    break;
            }
            return moves.map(function(move) {
                return {piecePos: {row, col}, movePos: move};
            });
        },
        isThreatened(tempBoard, piecePosition, color){
            for(let row of tempBoard){
                for(let cell of row){
                    if(cell.piece && cell.piece.color !== color){
                        // opposing piece, check if it threatens king
                        const moves = this.getPsuedoLegalsForPiece(tempBoard, cell.piece.type, cell.piece.color, cell.row, cell.col);
                        const threateningMove = moves.filter(function(move){
                            return move.row === piecePosition.row && move.col === piecePosition.col;
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
            return clonedBoard
        },
        getKingPosition(tempBoard, color){
            let kingCell;
            for(let row of tempBoard){
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
        getKingStatus(tempBoard, color){
            const kingPos = this.getKingPosition(tempBoard, color);
            if(this.isThreatened(tempBoard, kingPos, color)){
                // check if checkmate
                let friendlyCells = [];
                for(let row of tempBoard){
                    friendlyCells = friendlyCells.concat(row.filter(function(cell){
                        return cell.piece && cell.piece.color === color;
                    }));
                }
                for(let cell of friendlyCells){
                    let moves = this.getPsuedoLegalsForPiece(tempBoard, cell.piece.type, cell.piece.color, cell.row, cell.col);
                    for(let move of moves){
                        // create a clone of the board
                        const checkmateTestBoard = this.cloneBoard(tempBoard);
                        this.movePiece(checkmateTestBoard, move.piecePos, move.movePos);
                        let testPos = cell.piece.type == 'king' ? move.movePos : kingPos;
                        if(!this.isThreatened(checkmateTestBoard, testPos, color)){
                            //console.log(`${color} king is under check.`);
                            return 'check';
                        }
                    }
                }
                //console.log(`${color} king is under checkmate.`);
                return 'checkmate';
            }
            //console.log(`${color} king is safe.`);
            return 'safe';
        },
        getAllPieceMovesForColor(board, color){
            let self = this;
            let friendlyPieces = [];
            for(let row of board){
                friendlyPieces = friendlyPieces.concat(row.filter(function(cell){
                    return cell.piece && cell.piece.color === color;
                }).map(function(cell){
                    return { 
                        pos: { row: cell.row, col: cell.col },
                        piece: cell.piece, 
                        moves: self.trimToLegals(board, self.getPsuedoLegalsForPiece(board, cell.piece.type, cell.piece.color, cell.row, cell.col))
                    };
                }));
            }
            return friendlyPieces;
        },
        alphaBetaMax(board, alpha, beta, remainingDepth, isInitialMove){
            if(remainingDepth == 0){
                return this.evaluateBoard(board, "black");
            }
            for(let pieceMove of this.getAllPieceMovesForColor(board, "black")){
                for(let move of pieceMove.moves){
                    // for each move, perform move
                    let capturedPiece = board[move.movePos.row][move.movePos.col].piece ? Object.assign({}, board[move.movePos.row][move.movePos.col].piece) : null;
                    this.movePiece(board, move.piecePos, move.movePos);
                    let score = this.alphaBetaMin(board, alpha, beta, remainingDepth-1);
                    if(isInitialMove && score > this.aiMove.value){
                        //console.log("found best");
                        this.aiMove.value = score;
                        this.aiMove.move = move;
                    }
                    board[move.piecePos.row][move.piecePos.col].piece = Object.assign({}, board[move.movePos.row][move.movePos.col].piece);
                    board[move.movePos.row][move.movePos.col].piece = capturedPiece;
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
        alphaBetaMin(board, alpha, beta, remainingDepth){
            if(remainingDepth == 0){
                return -this.evaluateBoard(board, "white");
            }
            for(let pieceMove of this.getAllPieceMovesForColor(board, "white")){
                for(let move of pieceMove.moves){
                    // for each move, perform move
                    let capturedPiece = board[move.movePos.row][move.movePos.col].piece ? Object.assign({}, board[move.movePos.row][move.movePos.col].piece) : null;
                    this.movePiece(board, move.piecePos, move.movePos);
                    let score = this.alphaBetaMax(board, alpha, beta, remainingDepth-1, false);
                    board[move.piecePos.row][move.piecePos.col].piece = Object.assign({}, board[move.movePos.row][move.movePos.col].piece);
                    board[move.movePos.row][move.movePos.col].piece = capturedPiece;
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
        evaluateBoard(board, colorToMove){
            if(this.getKingStatus(board, colorToMove == "white" ? "black" : "white") == "checkmate") return Infinity;
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
            for(let row of board){
                for(let cell of row){
                    if(cell.piece){
                        pieceCounts[cell.piece.color][cell.piece.type]++;
                        moveCounts[cell.piece.color] += this.getPsuedoLegalsForPiece(board, cell.piece.type,
                            cell.piece.color, cell.row, cell.col).length;
                    }
                }   
            }
            let materialScore = 200  * (pieceCounts.black.king-pieceCounts.white.king)
              + 9 * (pieceCounts.black.queen-pieceCounts.white.queen)
              + 5 * (pieceCounts.black.rook-pieceCounts.white.rook)
              + 3 * (pieceCounts.black.knight-pieceCounts.white.knight)
              + 3 * (pieceCounts.black.bishop-pieceCounts.white.bishop)
              + 1 * (pieceCounts.black.pawn-pieceCounts.white.pawn);

            let mobilityScore = 0; //0.1 * (moveCounts.black-moveCounts.white);
            let score = (materialScore + mobilityScore);
            if(score > this.aiMove.value){
                //console.log(pieceCounts);
                //console.log(score);
            }
            return score;
        }
    }
}
</script>
<style>
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
