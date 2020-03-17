import React, { useEffect, useState } from 'react';
import "./App.scss";
import { generateCells, openMultipleCells } from "../utils";
import NumberDisplay from '../NumberDisplay';
import Button from '../Button';
import { MAX_ROWS, MAX_COLS} from "../constants";
import { Face, Cell, CellState, CellValue } from '../../types';

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [bombCounter, setbombCounter] = useState<number>(10);
    const [live, setLive] = useState<boolean>(false);
    const [hasLost, sethasLost] = useState<boolean>(false);
    const [hasWon , sethasWon] = useState<boolean>(false);

    useEffect(() => {
        const handleMouseDown = (): void => {
            setFace(Face.oh);
        };
        const handleMouseUp = (): void => {
            setFace(Face.smile);
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (live && time < 999) {
            const timer = setInterval(() => {
                setTime(time + 1);
            }, 1000);
            return () => {
                clearInterval(timer);
            };
        }
    }, [live, time]);

    useEffect(() => {
        if(hasLost){
            setLive(false);
            setFace(Face.lost);
        }
    },[hasLost]); 
    useEffect(() => {
        if(hasWon){
            setLive(false);
            setFace(Face.won);
        }
    },[hasWon]); 

    const handleCellClick = (rowParam: number, colParam: number) => (): void => {
        let newCells = cells.slice();
        if (!live) {
                let isABomb = newCells[rowParam][colParam].value === CellValue.bomb;
                while(isABomb){
                    newCells = generateCells();
                    if(newCells[rowParam][colParam].value !== CellValue.bomb){
                        isABomb = true;
                        break;
                    
                }
            }
            setLive(true);
        }
        const currentCell = newCells[rowParam][colParam];
     
        if ([CellState.flagged, CellState.visible].includes(currentCell.state)) {
            return;
        }
        if (currentCell.value === CellValue.bomb) {
            sethasLost(true);
            newCells[rowParam][colParam].red = true;
            newCells = showAllBombs();
            setCells(newCells);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }
        // Check if you have won
        let safeOpenCellExists = false;
        for(let row=0; row< MAX_ROWS; row++){
            for(let col=0; row< MAX_COLS; col++){
                const currentCell = newCells[row][col];
                if(currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
                 safeOpenCellExists = true;
                 break;   
                }
            }
        }
        if(!safeOpenCellExists){
            newCells = newCells.map(row => row.map(cell =>{
                if(cell.value === CellValue.bomb){
                    return{
                      ...cell,
                      state: CellState.flagged 
                    }
                }
                return cell;
            }));
            sethasWon(true);
        }
        setCells(newCells);
    };
    const handleCellContext = (rowParam: number, colParam: number) => (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (!live) {
            return;
        }
        const currentCells = cells.slice();
        const currentCell = cells[rowParam][colParam];
        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setbombCounter(bombCounter - 1);
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells);
            setbombCounter(bombCounter + 1);
        }
    };

    const handleFaceClick = (): void => {
            setLive(false);
            setTime(0);
            setCells(generateCells());
            sethasLost(false);
            sethasWon(false);
    };

    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) => row.map((cell, colIndex) =>
            <Button key={`${rowIndex}-${colIndex}`}
                state={cell.state}
                value={cell.value}
                row={rowIndex}
                red= {cell.red}
                col={colIndex}
                onClick={handleCellClick}
                onContext={handleCellContext}
            />))
    }
    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();
        return currentCells.map(row => row.map(cell => {
            if(cell.value === CellValue.bomb){
                return{
                    ...cell,
                    state: CellState.visible,
                }
            } 

            return cell;
        }))
    }
    return (
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombCounter} />
                <div className="Face" onClick={handleFaceClick} >
                    <span role="img" aria-label="face" >
                        {face}
                    </span>
                </div>
                <NumberDisplay value={time} />
            </div>
            <div className="Body">{renderCells()}</div>
        </div>
    )
};
export default App;