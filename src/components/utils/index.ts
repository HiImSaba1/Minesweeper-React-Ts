import {MAX_ROWS, MAX_COLS, NO_OF_BOMBS} from "../constants";
import {Cell,CellValue,CellState} from "../../types";

export const generateCells = (): Cell[][] => {
    let cells: Cell[][]= [];

    //Generating all cells
    for (let row=0; row<MAX_ROWS; row++){
        cells.push([]);
        for (let col=0; col<MAX_COLS; col++){
            cells[row].push({
                value: CellValue.none,
                state: CellState.open,
            });
        }
    }

    //randomly put 10 bombs
    let bombsPlaced = 0;
    while (bombsPlaced < NO_OF_BOMBS){
        const randomRow = Math.floor(Math.random() * MAX_ROWS);
        const randomCol = Math.floor(Math.random() * MAX_COLS);
        const currentCell = cells[randomRow][randomCol];
        if (currentCell.value !== CellValue.bomb){
            cells = cells.map((row, rowIndex) => row.map((cell, colIndex)=>{
                if(randomRow === rowIndex && randomCol === colIndex){
                    return{
                        ...cell,
                        value: CellValue.bomb
                    }
                }
                return cell;
            })
            );
            bombsPlaced++;
        }
    }

    return cells;
};